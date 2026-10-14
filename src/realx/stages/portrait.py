"""Portrait animation: move a still image of a real person with the user's own head and face.

STATE TODAY: no engine is enabled. The one candidate reviewed, LivePortrait, depends on InsightFace
models that are non-commercial and on training data with unverified terms, so it is on the blocked
list (docs/PORTRAIT.md). Using this stage without an engine raises `PortraitUnavailable`. The only
engine that runs is a labelled test-only warp, available solely when REALX_ALLOW_TEST_ENGINES=1.

What this module does fix, so that a real engine can be added without reopening the safety questions:

* the image must be covered by a consent record bound to that exact image (`safety/portrait_consent`),
  re-checked on every frame, so expiry or revocation ends a running stream at its next frame
* the stage declares `requires_consent`, `uses_likeness` and `alters_media`, so `validate_stages` refuses
  any pipeline without gate -> animation -> visible label -> watermark, in that order
* the portrait lives in memory only: it is never written to disk, logged, or put in frame metadata
* an engine runs only from a manifest model that is not blocked, is pinned (sha256), and is listed for
  portrait animation; it is never downloaded implicitly
"""

from __future__ import annotations

import os
from collections.abc import Callable, Sequence
from typing import Any, Protocol, runtime_checkable

import numpy as np

from realx.models import BLOCKED, MANIFEST, ModelError, ensure_model
from realx.safety.consent import ConsentRecord, ConsentStore
from realx.safety.gate import require_consent
from realx.safety.portrait_consent import check_portrait, check_scope, portrait_scope
from realx.stages.background import MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS, BackgroundError, cover, image_dimensions
from realx.stages.base import Stage, create, register
from realx.types import FrameContext

MAX_PORTRAIT_SIDE = 1024  # a stream never needs more; larger images are shrunk
MIN_PORTRAIT_SIDE = 64
TEST_ENGINE_SWITCH = "REALX_ALLOW_TEST_ENGINES"


class PortraitError(ValueError):
    """The portrait image is unusable or unsafe to decode."""


class PortraitUnavailable(RuntimeError):
    """No verified engine is available (or the one asked for is blocked, unverified or test-only)."""


def decode_portrait(data: bytes) -> np.ndarray:
    """RGB uint8 image from JPEG/PNG bytes. Size and header are checked before anything is decoded,
    so a small file that claims to be huge is refused without allocating its pixels."""
    import cv2

    if not data:
        raise PortraitError("no portrait was provided")
    if len(data) > MAX_IMAGE_BYTES:
        raise PortraitError("the portrait is larger than 12 MB")
    try:
        w, h, _ = image_dimensions(bytes(data))
    except BackgroundError as exc:
        raise PortraitError("the portrait must be a JPEG or PNG image") from exc
    if min(w, h) < MIN_PORTRAIT_SIDE or w * h > MAX_IMAGE_PIXELS:
        raise PortraitError(f"the portrait must be between {MIN_PORTRAIT_SIDE} px and 50 megapixels")
    bgr = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)  # drops alpha and EXIF metadata
    if bgr is None:
        raise PortraitError("the portrait could not be read")
    scale = MAX_PORTRAIT_SIDE / max(bgr.shape[:2])
    if scale < 1:
        bgr = cv2.resize(bgr, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    return np.ascontiguousarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))


# --- engines ---------------------------------------------------------------------------------------
@runtime_checkable
class PortraitEngine(Protocol):
    """Turns one still portrait plus the user's rig numbers into frames. Nothing else."""

    name: str

    def load(self, portrait_rgb: np.ndarray) -> None: ...

    def animate(self, rig: dict, ctx_pixels: np.ndarray | None) -> np.ndarray: ...

    def close(self) -> None: ...


_ENGINES: dict[str, dict[str, Any]] = {}


def register_engine(name: str, factory: Callable[[], PortraitEngine], *, model: str | None = None, test_only: bool = False) -> None:
    """Add an engine. One that is not test-only must name the manifest model it runs, so that its license,
    pin and intended use are on record before it can be created."""
    if name in _ENGINES:
        raise ValueError(f"portrait engine already registered: {name}")
    if not test_only and model is None:
        raise ValueError("an engine that is not test-only must name the verified manifest model it runs")
    _ENGINES[name] = {"factory": factory, "model": model, "test_only": bool(test_only)}


def _require_model(model: str) -> None:
    """Refuse unless the model is not blocked, is listed for portrait animation, and its pinned file is present."""
    if model in BLOCKED:
        raise PortraitUnavailable(f"model '{model}' is blocked: {BLOCKED[model]}")
    spec = MANIFEST.get(model)
    if spec is None:
        raise PortraitUnavailable(f"model '{model}' is not in the manifest, so its license is not on record")
    if "portrait" not in spec.purpose.lower():
        raise PortraitUnavailable(f"model '{model}' is not listed for portrait animation (purpose: {spec.purpose})")
    try:
        ensure_model(model, download=False)  # never a silent download; checks the pinned sha256
    except ModelError as exc:
        raise PortraitUnavailable(str(exc)) from exc


def _usable(entry: dict[str, Any]) -> bool:
    if entry["model"] is None:
        return True
    try:
        _require_model(entry["model"])
        return True
    except PortraitUnavailable:
        return False


def available_engines(include_test_only: bool = False) -> list[str]:
    """Engines that could be created now. Test-only engines are left out unless asked for (never shown in a UI)."""
    return sorted(
        name for name, e in _ENGINES.items() if (include_test_only or not e["test_only"]) and (e["test_only"] or _usable(e))
    )


def engine_info(name: str) -> dict[str, Any]:
    try:
        e = _ENGINES[name]
    except KeyError:
        raise PortraitUnavailable(f"unknown portrait engine '{name}'") from None
    return {"name": name, "model": e["model"], "test_only": e["test_only"]}


def create_engine(name: str) -> PortraitEngine:
    entry = _ENGINES.get(name)
    if entry is None:
        enabled = ", ".join(available_engines()) or "none"
        raise PortraitUnavailable(f"unknown portrait engine '{name}' (enabled: {enabled}); see docs/PORTRAIT.md")
    if entry["test_only"] and os.environ.get(TEST_ENGINE_SWITCH) != "1":
        raise PortraitUnavailable(f"'{name}' is a test-only engine; it runs only when {TEST_ENGINE_SWITCH}=1 and is not for use")
    if entry["model"] is not None:
        _require_model(entry["model"])
    return entry["factory"]()


class SyntheticWarp:
    """TEST-ONLY. A deterministic shift, tilt and zoom of the still image, driven by the rig's yaw, pitch,
    roll and smile numbers. It is not a neural model, it does not synthesize or change a face, and it
    exists only so the pipeline's consent, label and watermark behaviour can be tested. Never offered in a UI."""

    name = "synthetic_warp"
    test_only = True

    def __init__(self) -> None:
        self._img: np.ndarray | None = None

    def load(self, portrait_rgb: np.ndarray) -> None:
        if os.environ.get(TEST_ENGINE_SWITCH) != "1":
            raise PortraitUnavailable(f"test-only engine: set {TEST_ENGINE_SWITCH}=1")
        self._img = np.ascontiguousarray(portrait_rgb)

    def animate(self, rig: dict, ctx_pixels: np.ndarray | None) -> np.ndarray:
        import cv2

        if self._img is None:
            raise PortraitUnavailable("load() the portrait first")

        def num(key: str, limit: float) -> float:
            v = rig.get(key, 0.0) if isinstance(rig, dict) else 0.0
            return float(np.clip(v, -limit, limit)) if isinstance(v, (int, float)) and np.isfinite(v) else 0.0

        yaw, pitch, roll, smile = num("yaw", 1.0), num("pitch", 1.0), num("roll", 1.0), num("smile", 1.0)
        h, w = self._img.shape[:2]
        m = cv2.getRotationMatrix2D((w / 2, h / 2), float(np.degrees(roll)) * 0.5, 1.0 + 0.04 * smile)
        m[0, 2] += yaw * 0.06 * w
        m[1, 2] -= pitch * 0.06 * h
        return cv2.warpAffine(self._img, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    def close(self) -> None:
        self._img = None


register_engine("synthetic_warp", SyntheticWarp, test_only=True)


# --- the stage -------------------------------------------------------------------------------------
@register("portrait_animate")
class PortraitAnimate:
    """Replaces the picture with an animated still of a real person, under consent bound to that image."""

    name = "portrait_animate"
    requires_consent = True  # a consent gate must come before it
    uses_likeness = True  # a visible label and a watermark must come after it
    alters_media = True  # it changes pixels, so it cannot sit after a watermark
    stateful = True

    def __init__(self, portrait: bytes, record: ConsentRecord, store: ConsentStore, engine: str | None = None) -> None:
        check_portrait(store, record, portrait)  # first: consent for THIS image, or nothing else happens
        self.__scope = portrait_scope(portrait)
        self.__image = decode_portrait(portrait)  # the raw bytes are not kept
        self.__record = record
        self.__store = store
        if engine is None:
            enabled = available_engines()
            if not enabled:
                raise PortraitUnavailable(
                    "no verified portrait engine is enabled. LivePortrait is blocked (InsightFace models are "
                    "non-commercial; its training data is unverified); see docs/PORTRAIT.md"
                )
            engine = enabled[0]
        self._engine_name = engine
        self.__engine = create_engine(engine)

    def __repr__(self) -> str:
        return f"PortraitAnimate(engine={self._engine_name!r})"

    def setup(self) -> None:
        check_scope(self.__store, self.__record, self.__scope)
        self.__engine.load(self.__image)

    def process(self, ctx: FrameContext) -> FrameContext:
        check_scope(self.__store, self.__record, self.__scope)  # every frame: expiry and revocation end the stream here
        require_consent(ctx, self.__record.subject_id)  # and the gate must have vouched for this identity
        rigs = ctx.meta.get("rig")
        rig = rigs[0] if isinstance(rigs, list) and rigs and isinstance(rigs[0], dict) else {}
        out = self.__engine.animate(rig, ctx.pixels)
        if not isinstance(out, np.ndarray) or out.dtype != np.uint8 or out.ndim != 3 or out.shape[2] != 3:
            raise PortraitError("the engine must return an HxWx3 uint8 image")
        h, w = ctx.pixels.shape[:2]
        ctx.pixels = cover(out, w, h)  # the stream keeps its size
        ctx.meta["portrait"] = {"engine": self._engine_name, "test_only": bool(getattr(self.__engine, "test_only", False))}
        return ctx

    def close(self) -> None:
        self.__engine.close()


def portrait_stages(
    store: ConsentStore,
    record: ConsentRecord,
    portrait_bytes: bytes,
    display_name: str,
    watermark_key: bytes | None = None,
    engine: str | None = None,
    driver: Sequence[Stage] = (),
) -> list[Stage]:
    """[driver stages] -> consent gate -> portrait animation -> visible label -> watermark.

    `driver` produces the rig numbers (detect, track, rig). The consent is checked now, so a revoked or
    expired record fails before anything starts, and again on every frame.
    """
    animate = create("portrait_animate", portrait=portrait_bytes, record=record, store=store, engine=engine)
    return [
        *driver,
        create("consent_gate", store=store, record=record, scope=record.scope),
        animate,
        create("disclosure", display_name=display_name),
        create("watermark", payload=f"realx|portrait|{record.record_id[:8]}".encode(), key=watermark_key),
    ]
