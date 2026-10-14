from __future__ import annotations

import threading
import time
from collections import deque
from collections.abc import Callable, Iterable, Iterator, Sequence
from concurrent.futures import Future, ThreadPoolExecutor
from dataclasses import dataclass, field

from realx import log as rlog
from realx.stages.base import Stage
from realx.types import FrameContext

log = rlog.get_logger("pipeline")


class PipelineConfigError(ValueError):
    """The stage list violates a safety or ordering rule."""


@dataclass
class StageTiming:
    calls: int = 0
    total_s: float = 0.0

    @property
    def mean_ms(self) -> float:
        return 1000.0 * self.total_s / self.calls if self.calls else 0.0


def validate_stages(stages: Sequence[Stage]) -> None:
    """Enforce safety ordering.

    - every stage that synthesizes faces (`requires_consent`) needs a consent gate
      (`is_gate`) before it
    - a watermark stage (`is_watermark`) must come after the last such stage
    - a stage that renders a real person's likeness (`uses_likeness`) must be followed
      by a disclosure stage (`is_disclosure`, a label viewers can see) before the watermark
    - no stage that changes the media (`alters_media`) may come after a watermark,
      because editing marked pixels or samples would damage the provenance mark
    """
    gate_seen = False
    last_synth = -1
    mark_at = -1
    last_likeness = -1
    for i, stage in enumerate(stages):
        if getattr(stage, "is_watermark", False) and mark_at < 0:
            mark_at = i
        elif mark_at >= 0 and getattr(stage, "alters_media", False):
            raise PipelineConfigError(f"stage '{stage.name}' changes the media after the watermark; move it before")
        if getattr(stage, "is_gate", False):
            gate_seen = True
        if getattr(stage, "uses_likeness", False):
            last_likeness = i
        if getattr(stage, "requires_consent", False) or getattr(stage, "uses_likeness", False):
            if not gate_seen:
                raise PipelineConfigError(f"stage '{stage.name}' needs a consent gate before it")
            last_synth = i
    if last_likeness >= 0:
        after = stages[last_likeness + 1 :]
        label_at = next((j for j, st in enumerate(after) if getattr(st, "is_disclosure", False)), None)
        mark_rel = next((j for j, st in enumerate(after) if getattr(st, "is_watermark", False)), None)
        if label_at is None or (mark_rel is not None and mark_rel < label_at):
            raise PipelineConfigError("a stage that shows a real person's likeness needs a visible disclosure stage after it")
        end = mark_rel if mark_rel is not None else len(after)
        for st in after[label_at + 1 : end]:
            if getattr(st, "alters_media", False):
                raise PipelineConfigError(
                    f"stage '{st.name}' could cover the disclosure label; the label must be the last picture edit"
                )
    if last_synth >= 0 and not any(
        getattr(s, "is_watermark", False) for s in stages[last_synth + 1 :]
    ):
        raise PipelineConfigError("a watermark stage must follow the last synthesizing stage")


@dataclass
class Pipeline:
    """Runs stages in order on one frame. Collects per-stage timings."""

    stages: Sequence[Stage]
    timings: dict[str, StageTiming] = field(default_factory=dict)
    _ready: bool = field(default=False, init=False, repr=False)
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False, repr=False)

    def __post_init__(self) -> None:
        validate_stages(self.stages)

    def setup(self) -> None:
        started: list[Stage] = []
        current: Stage | None = None
        try:
            for stage in self.stages:
                current = stage
                stage.setup()
                started.append(stage)
        except BaseException as exc:
            if isinstance(exc, Exception):  # a Ctrl-C while starting is not a fault worth a log line
                log.error(
                    "stage %s failed to start: %s: %s", getattr(current, "name", "?"), type(exc).__name__, rlog.clip(exc),
                    exc_info=True,
                )
            for stage in reversed(started):
                try:
                    stage.close()
                except Exception:  # keep unwinding; the original error matters most
                    pass
            raise
        self._ready = True

    def close(self) -> None:
        self._ready = False
        errors: list[Exception] = []
        for stage in reversed(self.stages):
            try:
                stage.close()
            except Exception as exc:
                errors.append(exc)
        if errors:
            raise errors[0]

    def __enter__(self) -> "Pipeline":
        self.setup()
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    def process(self, ctx: FrameContext) -> FrameContext:
        if not self._ready:
            raise RuntimeError("pipeline not set up; use `with Pipeline(...)` or call setup()")
        for stage in self.stages:
            started = time.perf_counter()
            ctx = stage.process(ctx)
            elapsed = time.perf_counter() - started
            with self._lock:
                t = self.timings.setdefault(stage.name, StageTiming())
                t.calls += 1
                t.total_s += elapsed
        return ctx


def run_stream(
    pipeline: Pipeline,
    frames: Iterable[FrameContext],
    workers: int = 1,
    max_in_flight: int = 4,
    on_drop: Callable[[FrameContext], None] | None = None,
) -> Iterator[FrameContext]:
    """Process a live stream with a bounded queue.

    Output stays in input order. When the pipeline cannot keep up, waiting frames
    are dropped (reported through `on_drop`) rather than queued, so latency stays
    bounded. Stateful stages (tracking, smoothing) require `workers=1`.
    """
    if workers < 1 or max_in_flight < 1:
        raise ValueError("workers and max_in_flight must be >= 1")
    if workers > 1 and any(getattr(s, "stateful", False) for s in pipeline.stages):
        raise PipelineConfigError("stateful stages require workers=1")

    pending: deque[tuple[FrameContext, Future[FrameContext]]] = deque()
    pool = ThreadPoolExecutor(max_workers=workers)
    try:
        for ctx in frames:
            while len(pending) >= max_in_flight:
                # latest frame wins: drop the oldest frame that has not started yet. The very oldest one is usually
                # running already and cannot be cancelled; waiting for it would block the camera instead of dropping.
                for i, (old_ctx, fut) in enumerate(pending):
                    if fut.cancel():
                        del pending[i]
                        if on_drop is not None:
                            on_drop(old_ctx)
                        break
                else:  # every waiting frame is already running: wait for the oldest so order is preserved
                    yield pending.popleft()[1].result()
            pending.append((ctx, pool.submit(pipeline.process, ctx)))
            while pending and pending[0][1].done():
                yield pending.popleft()[1].result()
        while pending:
            yield pending.popleft()[1].result()
    finally:
        for _, fut in pending:
            fut.cancel()
        pool.shutdown(wait=True, cancel_futures=True)
