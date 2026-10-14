"""The studio controller: avatar mode by default, portrait mode only when explicitly enabled, a safe fallback.

States
    AVATAR    the 3D avatar pipeline produces the output. The default, and the only state without a flag.
    PORTRAIT  a consented still portrait is animated. Needs the portrait flag (REALX_ENABLE_PORTRAIT=1 or
              `portrait_enabled=True`), a consent record bound to that exact image, and a verified engine.
    DEGRADED  portrait mode was started and failed (consent revoked or expired, engine error, missing model,
              timeout, too slow, resource failure, or the output guard refused a frame). Output is the avatar.

Rules this module enforces
    * Portrait output is never produced unless the portrait chain is gate -> animation -> visible label ->
      watermark (`Pipeline` validation, strict mode) and `OutputGuard` has verified the actual output pixels.
    * Every failure of the portrait path ends in the avatar output for that very frame. The failed frame is
      never emitted, and nothing retries by itself: going back to PORTRAIT needs an explicit `enable_portrait`,
      which re-checks consent from the start.
    * Revoked or expired consent is caught on the frame it happens (the consent gate checks every frame), the
      portrait pipeline is closed at once (engine and image released), and no later frame is portrait output.
    * Setup of the portrait path runs on a worker thread with a time limit, so a stuck engine cannot freeze the
      video. A worker that never returns is abandoned (daemon thread); if it ever finishes, its pipeline is closed.
    * Initialisation and shutdown are ordered and idempotent: portrait pipeline closed before the avatar one.

The controller holds no image bytes and no credentials. It does not decide who may be shown: that is the
consent record and the user's attestation (`safety/portrait_consent.py`); the label and watermark make the
output identifiable as synthetic either way.
"""

from __future__ import annotations

import enum
import os
import threading
import time
from collections.abc import Callable, Sequence
from dataclasses import dataclass

import numpy as np

from realx import log as rlog
from realx.models import ModelError
from realx.pipeline import Pipeline, PipelineConfigError, StageTiming
from realx.safety import watermark
from realx.safety.consent import ConsentError
from realx.stages.base import Stage
from realx.stages.builtin import Disclosure
from realx.stages.portrait import PortraitUnavailable
from realx.types import FrameContext

log = rlog.get_logger("studio")

PORTRAIT_FLAG_ENV = "REALX_ENABLE_PORTRAIT"
PORTRAIT_MARK_PREFIX = b"realx|portrait|"  # what `portrait_stages` embeds


def portrait_flag_from_env() -> bool:
    return os.environ.get(PORTRAIT_FLAG_ENV, "").strip() == "1"


class StudioError(RuntimeError):
    """The controller was used wrongly (portrait disabled, not set up, closed)."""


class GuardFailure(RuntimeError):
    """A portrait frame did not carry the disclosure or provenance mark it must."""


class StudioState(str, enum.Enum):
    AVATAR = "AVATAR"
    PORTRAIT = "PORTRAIT"
    DEGRADED = "DEGRADED"


class DegradeReason(str, enum.Enum):
    CONSENT = "consent_revoked_or_expired"
    UNAVAILABLE = "engine_or_model_unavailable"
    ENGINE_ERROR = "engine_error"
    ENGINE_TIMEOUT = "engine_timeout"
    TOO_SLOW = "too_slow"
    RESOURCE = "resource_failure"
    OUTPUT_GUARD = "output_guard_refused"


@dataclass(frozen=True)
class StudioStatus:
    state: StudioState
    reason: DegradeReason | None
    detail: str  # an exception class name or a fixed phrase: never a message that could hold paths or data
    portrait_enabled: bool
    portrait_frames: int
    fallback_frames: int  # frames that were meant to be portrait and came out as the avatar instead

    def as_dict(self) -> dict:
        return {
            "state": self.state.value, "reason": None if self.reason is None else self.reason.value,
            "detail": self.detail, "portrait_enabled": self.portrait_enabled,
            "portrait_frames": self.portrait_frames, "fallback_frames": self.fallback_frames,
        }


class OutputGuard:
    """Checks the pixels about to leave in portrait mode, not the flags the stages declare.

    It requires (1) the frame to say a portrait stage produced it, (2) the visible "DIGITAL HOST" bar actually
    present across the bottom rows, and (3) the provenance mark to extract from the frame (verified with the key
    when there is one). A stage chain that was edited, a label that was painted over, or a mark that was lost
    makes the frame fail, and the controller sends the avatar frame instead.
    """

    def __init__(self, watermark_key: bytes | None = None, bar_fraction: float = 0.6) -> None:
        self._key = watermark_key
        self._bar_fraction = bar_fraction

    def check(self, ctx: FrameContext) -> None:
        if not isinstance(ctx.meta.get("portrait"), dict):
            raise GuardFailure("the frame was not produced by a portrait stage")
        text = ctx.meta.get("disclosure")
        if not isinstance(text, str) or not text.startswith(Disclosure.PREFIX):
            raise GuardFailure("the frame carries no disclosure")
        px = ctx.pixels
        h = px.shape[0]
        rows = px[h - Disclosure.bar_height(h) :].astype(np.int16)
        near = np.all(np.abs(rows - np.array(Disclosure.BAR_RGB, np.int16)) <= 2, axis=-1)
        if float(near.mean()) < self._bar_fraction:
            raise GuardFailure("the disclosure bar is not visible in the output")
        payload = watermark.extract(px, self._key)
        if payload is None or not payload.startswith(PORTRAIT_MARK_PREFIX):
            raise GuardFailure("the provenance mark is missing from the output")


def _classify(exc: BaseException) -> tuple[DegradeReason, str]:
    name = type(exc).__name__
    if isinstance(exc, ConsentError):  # before OSError: ConsentError is a PermissionError
        return DegradeReason.CONSENT, name
    if isinstance(exc, GuardFailure):
        return DegradeReason.OUTPUT_GUARD, str(exc)
    if isinstance(exc, (PortraitUnavailable, ModelError)):
        return DegradeReason.UNAVAILABLE, name
    if isinstance(exc, (MemoryError, OSError)):
        return DegradeReason.RESOURCE, name
    return DegradeReason.ENGINE_ERROR, name


class StudioController:
    """Runs the avatar pipeline and, when asked and allowed, a portrait pipeline with a fallback to the avatar."""

    def __init__(
        self,
        avatar_stages: Sequence[Stage],
        *,
        portrait_enabled: bool | None = None,
        setup_timeout: float = 10.0,
        slow_frame_s: float = 0.25,
        slow_frames_to_degrade: int = 5,
        clock: Callable[[], float] = time.perf_counter,
    ) -> None:
        self._avatar = Pipeline(list(avatar_stages), strict=True)
        self._flag = portrait_flag_from_env() if portrait_enabled is None else bool(portrait_enabled)
        self._setup_timeout = setup_timeout
        self._slow_s = slow_frame_s
        self._slow_limit = slow_frames_to_degrade
        self._clock = clock
        self._state_lock = threading.Lock()   # short: reads and writes of the status
        self._proc_lock = threading.RLock()   # held for a frame, and while a pipeline is closed
        self._state = StudioState.AVATAR
        self._reason: DegradeReason | None = None
        self._detail = ""
        self._portrait: Pipeline | None = None
        self._guard: OutputGuard | None = None
        self._slow = 0
        self._portrait_frames = 0
        self._fallback_frames = 0
        self._ready = False
        self._closed = False

    # -- lifecycle -----------------------------------------------------------------------------------
    def setup(self) -> None:
        with self._proc_lock:
            if self._closed:
                raise StudioError("the studio is closed")
            if not self._ready:
                self._avatar.setup()
                self._ready = True

    def close(self) -> None:
        """Portrait pipeline first (engine and image released), then the avatar. Safe to call twice."""
        errors: list[Exception] = []
        with self._proc_lock:
            if self._closed:
                return
            self._closed = True
            self._ready = False
            portrait, self._portrait = self._portrait, None
            self._guard = None
            for pipe in (portrait, self._avatar):
                if pipe is None:
                    continue
                try:
                    pipe.close()
                except Exception as exc:
                    errors.append(exc)
            with self._state_lock:
                self._state, self._reason, self._detail = StudioState.AVATAR, None, ""
        if errors:
            raise errors[0]

    def __enter__(self) -> "StudioController":
        self.setup()
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    # -- state ---------------------------------------------------------------------------------------
    def status(self) -> StudioStatus:
        with self._state_lock:
            return StudioStatus(self._state, self._reason, self._detail, self._flag, self._portrait_frames, self._fallback_frames)

    @property
    def state(self) -> StudioState:
        with self._state_lock:
            return self._state

    @property
    def timings(self) -> dict[str, StageTiming]:
        out = dict(self._avatar.timings)
        portrait = self._portrait
        if portrait is not None:
            out.update(portrait.timings)
        return out

    def _set(self, state: StudioState, reason: DegradeReason | None = None, detail: str = "") -> None:
        with self._state_lock:
            self._state, self._reason, self._detail = state, reason, detail

    def _degrade(self, reason: DegradeReason, detail: str) -> None:
        """Leave portrait mode. Called with the frame lock held (or from `enable_portrait`'s failure path)."""
        portrait, self._portrait = self._portrait, None
        self._guard = None
        self._slow = 0
        self._set(StudioState.DEGRADED, reason, detail)
        log.warning("portrait mode stopped, using the avatar: %s (%s)", reason.value, rlog.clip(detail))
        if portrait is not None:
            try:
                portrait.close()
            except Exception:  # the engine is already failing; the avatar must keep going
                log.debug("closing the portrait pipeline failed", exc_info=True)

    # -- switching -----------------------------------------------------------------------------------
    def enable_portrait(self, make_stages: Callable[[], Sequence[Stage]], guard: OutputGuard | None = None) -> StudioStatus:
        """Try to start portrait mode. `make_stages` builds the whole chain (see `portrait_stages`) and is where
        consent is first checked. On any failure the studio stays on the avatar, in DEGRADED with the reason.
        A chain that violates the safety ordering raises `PipelineConfigError` and changes nothing."""
        if not self._flag:
            raise StudioError(f"portrait mode is disabled; set {PORTRAIT_FLAG_ENV}=1 (or portrait_enabled=True) to allow it")
        with self._proc_lock:
            if self._closed or not self._ready:
                raise StudioError("set the studio up before enabling portrait mode")

        box: dict = {}
        done = threading.Event()

        def build() -> None:
            pipe = None
            try:
                pipe = Pipeline(list(make_stages()), strict=True)
                pipe.setup()
                box["pipe"] = pipe
            except BaseException as exc:
                box["error"] = exc
                if pipe is not None:
                    try:
                        pipe.close()
                    except Exception:
                        pass
            finally:
                done.set()

        worker = threading.Thread(target=build, name="realx-portrait-setup", daemon=True)
        worker.start()
        if not done.wait(self._setup_timeout):
            def late_cleanup() -> None:  # if the stuck setup ever finishes, release what it built
                done.wait()
                pipe = box.pop("pipe", None)
                if pipe is not None:
                    try:
                        pipe.close()
                    except Exception:
                        pass

            threading.Thread(target=late_cleanup, name="realx-portrait-cleanup", daemon=True).start()
            with self._proc_lock:
                self._degrade(DegradeReason.ENGINE_TIMEOUT, f"no answer within {self._setup_timeout:g} s")
            return self.status()

        error = box.get("error")
        if isinstance(error, PipelineConfigError):
            raise error  # a wrongly assembled chain is a bug to fix, not something to fall back from
        if error is not None:
            reason, detail = _classify(error)
            with self._proc_lock:
                self._degrade(reason, detail)
            return self.status()

        with self._proc_lock:
            if self._closed:
                box["pipe"].close()
                raise StudioError("the studio was closed while portrait mode started")
            old, self._portrait = self._portrait, box["pipe"]
            self._guard = guard or OutputGuard()
            self._slow = 0
            self._set(StudioState.PORTRAIT)
            if old is not None:
                try:
                    old.close()
                except Exception:
                    log.debug("closing the previous portrait pipeline failed", exc_info=True)
        log.info("portrait mode started")
        return self.status()

    def disable_portrait(self) -> StudioStatus:
        """Back to the avatar, on purpose. Releases the portrait pipeline."""
        with self._proc_lock:
            portrait, self._portrait = self._portrait, None
            self._guard = None
            self._slow = 0
            self._set(StudioState.AVATAR)
            if portrait is not None:
                try:
                    portrait.close()
                except Exception:
                    log.debug("closing the portrait pipeline failed", exc_info=True)
        return self.status()

    # -- frames --------------------------------------------------------------------------------------
    def process(self, ctx: FrameContext) -> FrameContext:
        with self._proc_lock:
            if self._closed or not self._ready:
                raise StudioError("the studio is not set up")
            portrait, guard = self._portrait, self._guard
            if portrait is None or guard is None or self.state is not StudioState.PORTRAIT:
                return self._avatar.process(ctx)
            fallback = FrameContext(pixels=ctx.pixels, index=ctx.index, timestamp=ctx.timestamp, meta=dict(ctx.meta))
            started = self._clock()
            try:
                out = portrait.process(ctx)
                guard.check(out)
            except Exception as exc:  # anything: the frame is dropped and the avatar answers instead
                reason, detail = _classify(exc)
                self._degrade(reason, detail)
                with self._state_lock:
                    self._fallback_frames += 1
                return self._avatar.process(fallback)
            if self._clock() - started > self._slow_s:
                self._slow += 1
                if self._slow >= self._slow_limit:
                    self._degrade(DegradeReason.TOO_SLOW, f"{self._slow} slow frames in a row")
            else:
                self._slow = 0
            with self._state_lock:
                self._portrait_frames += 1
            return out
