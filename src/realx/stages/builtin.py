from __future__ import annotations

import numpy as np

from realx.filters import OneEuroFilter
from realx.safety import watermark
from realx.safety.consent import ConsentRecord, ConsentStore
from realx.safety.gate import grant, require_consent
from realx.stages.base import register
from realx.types import FrameContext


@register("passthrough")
class PassThrough:
    name = "passthrough"

    def setup(self) -> None: ...

    def process(self, ctx: FrameContext) -> FrameContext:
        return ctx

    def close(self) -> None: ...


@register("smooth")
class TemporalSmoother:
    """Exponential smoothing of face boxes and landmarks per track id.

    Reduces the frame-to-frame jitter that makes swaps flicker. `alpha` is the
    weight of the new measurement: 1.0 means no smoothing. Tracks unseen for
    `max_age` frames are forgotten so stale boxes are never blended in.
    """

    name = "smooth"
    stateful = True

    def __init__(self, alpha: float = 0.6, max_age: int = 30) -> None:
        if not 0.0 < alpha <= 1.0:
            raise ValueError("alpha must be in (0, 1]")
        if max_age < 1:
            raise ValueError("max_age must be >= 1")
        self.alpha = alpha
        self.max_age = max_age
        self._tick = 0
        self._state: dict[int, tuple[np.ndarray, np.ndarray | None, int]] = {}

    def setup(self) -> None:
        self._tick = 0
        self._state.clear()

    def process(self, ctx: FrameContext) -> FrameContext:
        self._tick += 1
        a = self.alpha
        for face in ctx.faces:
            if face.track_id is None:
                continue
            prev = self._state.get(face.track_id)
            bbox = np.array(face.bbox, dtype=float)
            lm = None if face.landmarks is None else np.array(face.landmarks, dtype=float)
            if prev is not None:
                prev_bbox, prev_lm, _ = prev
                bbox = a * bbox + (1 - a) * prev_bbox
                if lm is not None and prev_lm is not None and prev_lm.shape == lm.shape:
                    lm = a * lm + (1 - a) * prev_lm
            face.bbox = bbox.copy()
            face.landmarks = None if lm is None else lm.copy()
            self._state[face.track_id] = (bbox, lm, self._tick)
        stale = [t for t, (_, _, seen) in self._state.items() if self._tick - seen > self.max_age]
        for track_id in stale:
            del self._state[track_id]
        return ctx

    def close(self) -> None:
        self.setup()


@register("one_euro")
class OneEuroSmoother:
    """Per-track One-Euro filtering of face boxes and landmarks.

    Smooths hard while the face is steady and follows quickly when it moves. Time
    comes from `ctx.timestamp`, falling back to `index / fps` when it is unset.
    """

    name = "one_euro"
    stateful = True

    def __init__(
        self, min_cutoff: float = 1.0, beta: float = 0.05, fps: float = 30.0, max_age: int = 30
    ) -> None:
        if fps <= 0 or max_age < 1:
            raise ValueError("fps must be > 0 and max_age >= 1")
        self.min_cutoff, self.beta, self.fps, self.max_age = min_cutoff, beta, fps, max_age
        OneEuroFilter(min_cutoff, beta)  # validate parameters early
        self._tick = 0
        self._filters: dict[int, tuple[OneEuroFilter, OneEuroFilter, int]] = {}

    def setup(self) -> None:
        self._tick = 0
        self._filters.clear()

    def process(self, ctx: FrameContext) -> FrameContext:
        self._tick += 1
        t = ctx.timestamp if ctx.timestamp > 0 else ctx.index / self.fps
        for face in ctx.faces:
            if face.track_id is None:
                continue
            entry = self._filters.get(face.track_id)
            if entry is None:
                entry = (
                    OneEuroFilter(self.min_cutoff, self.beta),
                    OneEuroFilter(self.min_cutoff, self.beta),
                    self._tick,
                )
            box_f, lm_f, _ = entry
            face.bbox = box_f(np.array(face.bbox, dtype=float), t)
            if face.landmarks is not None:
                face.landmarks = lm_f(np.array(face.landmarks, dtype=float), t)
            self._filters[face.track_id] = (box_f, lm_f, self._tick)
        stale = [k for k, (_, _, seen) in self._filters.items() if self._tick - seen > self.max_age]
        for key in stale:
            del self._filters[key]
        return ctx

    def close(self) -> None:
        self.setup()


@register("consent_gate")
class ConsentGate:
    """Refuses to continue unless a valid, in-scope consent record is present.

    On success it marks the frame so synthesizing stages can prove they were gated.
    """

    name = "consent_gate"
    is_gate = True

    def __init__(self, store: ConsentStore, record: ConsentRecord, scope: str = "live") -> None:
        self.__store = store
        self.__record = record
        self.__scope = scope

    @property
    def subject_id(self) -> str:
        return self.__record.subject_id

    def setup(self) -> None:
        self.__store.verify(self.__record, self.__scope)

    def process(self, ctx: FrameContext) -> FrameContext:
        self.__store.verify(self.__record, self.__scope)
        grant(ctx, self.__record.subject_id)
        return ctx

    def close(self) -> None: ...


@register("swap_stub")
class SwapStub:
    """Template for synthesizing stages: shows the consent contract.

    Real swap stages (M1) follow the same rule: declare `requires_consent` and call
    `require_consent` with the identity they are about to use.
    """

    name = "swap_stub"
    requires_consent = True

    def __init__(self, source_identity: str) -> None:
        self.source_identity = source_identity

    def setup(self) -> None: ...

    def process(self, ctx: FrameContext) -> FrameContext:
        require_consent(ctx, self.source_identity)
        ctx.meta["swapped_with"] = self.source_identity
        return ctx

    def close(self) -> None: ...


@register("watermark")
class Watermark:
    name = "watermark"
    is_watermark = True

    def __init__(self, payload: bytes, key: bytes | None = None) -> None:
        if not payload or len(payload) > watermark.MAX_PAYLOAD:
            raise ValueError(f"payload must be 1..{watermark.MAX_PAYLOAD} bytes")
        self.payload = payload
        self.key = key

    def setup(self) -> None: ...

    def process(self, ctx: FrameContext) -> FrameContext:
        ctx.pixels = watermark.embed(ctx.pixels, self.payload, self.key)
        return ctx

    def close(self) -> None: ...
