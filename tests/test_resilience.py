"""What happens when things go wrong during a long session.

Camera loss and reconnection, a stage that fails mid-stream, bounded queues, memory over a long run,
orderly shutdown, and a face that disappears behind something and comes back. The engine tests use a
fake camera and an empty pipeline ("original" mode), so they need neither a model nor a webcam; the
timing assertions are lower bounds only (a loaded machine makes things slower, never faster).
"""

import ctypes
import gc
import os
import sys
import threading
import time
import tracemalloc

import numpy as np
import pytest

from realx.pipeline import Pipeline, run_stream
from realx.sources import SourceError
from realx.tracking import FaceTracker
from realx.types import Face, FrameContext


def tiny(i):
    return FrameContext(pixels=np.zeros((48, 64, 3), np.uint8), index=i, timestamp=i / 30.0)


class FakeCamera:
    """Serves `good` frames at roughly a camera's pace, then raises SourceError (or serves forever if good is None)."""

    def __init__(self, good, message="camera stopped delivering frames"):
        self.good, self.message, self.served = good, message, 0
        self.failed_at = None
        self.closed = False

    def __iter__(self):
        return self

    def __next__(self):
        if self.good is not None and self.served >= self.good:
            self.failed_at = time.perf_counter()
            raise SourceError(self.message)
        self.served += 1
        time.sleep(0.005)
        return tiny(self.served)

    def close(self):
        self.closed = True


def wait_for(predicate, timeout=15.0, step=0.01):
    end = time.time() + timeout
    while time.time() < end:
        value = predicate()
        if value:
            return value
        time.sleep(step)
    return predicate()


@pytest.fixture()
def cv2_ready():
    pytest.importorskip("cv2")


def make_engine(monkeypatch, opener):
    from realx.server import Engine

    engine = Engine(source="demo:static", mode="original")
    monkeypatch.setattr(engine, "_open", opener)
    return engine


# --- (a) camera loss and reconnection ---------------------------------------------------------------
def test_camera_loss_is_reported_retried_with_growing_waits_and_recovers(monkeypatch, cv2_ready):
    cams, opened_at = [], []
    plan = [8, 0, None]  # a camera that dies after 8 frames, then cannot be reopened once, then works

    def opener(source):
        opened_at.append(time.perf_counter())
        cam = FakeCamera(plan[len(cams)] if len(cams) < len(plan) else None, "cannot open camera 0" if len(cams) == 1 else "camera stopped delivering frames")
        cams.append(cam)
        return cam

    engine = make_engine(monkeypatch, opener)
    engine.start()
    try:
        assert wait_for(lambda: engine.stats()["error"]), "the loss must show up in the stats"
        assert engine.stats()["frames"] <= 8 + 1
        assert wait_for(lambda: len(cams) >= 3, timeout=20), "the engine keeps trying to reopen the camera"
        assert opened_at[1] - cams[0].failed_at >= 0.4, "it waits before the first retry"
        assert opened_at[2] - cams[1].failed_at >= 0.9, "and waits longer after a second failure"
        assert wait_for(lambda: engine.stats()["frames"] > 8 + 5, timeout=20), "frames resume on the new camera"
        assert wait_for(lambda: engine.stats()["error"] is None), "the error clears once frames flow again"
        assert cams[0].closed and cams[1].closed, "a dead camera is closed before the next attempt"
        assert engine._thread.is_alive()
    finally:
        engine.stop()
    assert not engine._thread.is_alive()


def test_stopping_during_a_long_backoff_is_prompt(monkeypatch, cv2_ready):
    engine = make_engine(monkeypatch, lambda source: FakeCamera(0, "cannot open camera 0"))
    engine.start()
    assert wait_for(lambda: engine.stats()["error"])
    time.sleep(2.2)  # the waits are now 0.5, 1, 2 seconds: a stop must not sit through the next one
    t0 = time.perf_counter()
    engine.stop()
    assert time.perf_counter() - t0 < 2.0
    assert not engine._thread.is_alive()


# --- (b) a stage that fails mid-stream --------------------------------------------------------------
class FlakyStage:
    name = "flaky"
    instances = 0

    def __init__(self):
        type(self).instances += 1
        self.calls, self.fail_at = 0, (6 if type(self).instances == 1 else None)
        self.closed = False

    def setup(self):
        pass

    def process(self, ctx):
        self.calls += 1
        if self.fail_at is not None and self.calls == self.fail_at:
            raise RuntimeError("model blew up")
        return ctx

    def close(self):
        self.closed = True


def test_a_stage_that_raises_is_reported_then_the_pipeline_is_rebuilt(monkeypatch, cv2_ready):
    FlakyStage.instances = 0
    built = []

    def build(cfg):
        stage = FlakyStage()
        built.append(stage)
        return Pipeline([stage], strict=False)

    engine = make_engine(monkeypatch, lambda source: FakeCamera(None))
    monkeypatch.setattr(engine, "_build", build)
    engine.start()
    try:
        error = wait_for(lambda: engine.stats()["error"], timeout=20)
        assert error and "model blew up" in error and "RuntimeError" in error
        assert wait_for(lambda: len(built) >= 2, timeout=20), "the pipeline is built again"
        frames_then = engine.stats()["frames"]
        assert wait_for(lambda: engine.stats()["frames"] > frames_then + 5 and engine.stats()["error"] is None, timeout=20)
        assert built[0].closed, "the failed pipeline's stages are closed"
        assert engine._thread.is_alive()
    finally:
        engine.stop()


# --- (c) bounded queue, latest frame wins -----------------------------------------------------------
class SlowStage:
    name = "slow"

    def __init__(self, seconds):
        self.seconds = seconds

    def setup(self):
        pass

    def process(self, ctx):
        time.sleep(self.seconds)
        return ctx

    def close(self):
        pass


def _run_slow_stream(max_in_flight, workers=1, count=40, stage_seconds=0.03):
    produced = yielded = dropped = 0
    worst_backlog = 0
    order = []

    def frames():
        nonlocal produced, worst_backlog
        for i in range(count):
            worst_backlog = max(worst_backlog, produced - yielded - dropped)  # frames offered but not yet settled
            produced += 1
            yield tiny(i)

    def on_drop(ctx):
        nonlocal dropped
        dropped += 1

    with Pipeline([SlowStage(stage_seconds)], strict=False) as pipe:
        for out in run_stream(pipe, frames(), workers=workers, max_in_flight=max_in_flight, on_drop=on_drop):
            yielded += 1
            order.append(out.index)
    return {"produced": produced, "yielded": yielded, "dropped": dropped, "backlog": worst_backlog, "order": order}


@pytest.mark.parametrize("max_in_flight", [1, 3])
def test_a_slow_stage_never_builds_a_backlog_and_every_frame_is_accounted_for(max_in_flight):
    r = _run_slow_stream(max_in_flight)
    assert r["backlog"] <= max_in_flight, "the queue stays bounded"
    assert r["yielded"] + r["dropped"] == r["produced"] == 40, "every frame is either delivered or reported dropped"
    order = r["order"]
    assert order == sorted(order) and len(set(order)) == len(order), "what is delivered stays in order, without repeats"


# Regression: run_stream used to pop the OLDEST pending frame, which the single worker was already running and
# could not cancel, so it blocked the source instead of dropping (measured: 120 instant frames, a 20 ms stage,
# max_in_flight 3 or 8 -> 0 dropped, producer blocked 2.6-3.4 s). It now cancels the oldest frame that has not started.
@pytest.mark.parametrize("max_in_flight", [2, 3, 8])
def test_run_stream_drops_stale_frames_when_the_stage_cannot_keep_up(max_in_flight):
    r = _run_slow_stream(max_in_flight=max_in_flight, count=120, stage_seconds=0.02)
    assert r["dropped"] > 0, "a stage slower than the source must cause drops, not a blocked source"
    assert r["backlog"] <= max_in_flight


# --- (d) long sessions: memory and threads ----------------------------------------------------------
def _rss_bytes():
    """Process memory in bytes, or None where this platform offers no cheap way to read it."""
    try:
        if sys.platform == "win32":
            from ctypes import wintypes

            class Counters(ctypes.Structure):
                _fields_ = [
                    ("cb", wintypes.DWORD), ("PageFaultCount", wintypes.DWORD), ("PeakWorkingSetSize", ctypes.c_size_t),
                    ("WorkingSetSize", ctypes.c_size_t), ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPagedPoolUsage", ctypes.c_size_t), ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaNonPagedPoolUsage", ctypes.c_size_t), ("PagefileUsage", ctypes.c_size_t),
                    ("PeakPagefileUsage", ctypes.c_size_t),
                ]

            kernel, psapi = ctypes.WinDLL("kernel32"), ctypes.WinDLL("psapi")
            kernel.GetCurrentProcess.restype = wintypes.HANDLE
            psapi.GetProcessMemoryInfo.argtypes = [wintypes.HANDLE, ctypes.POINTER(Counters), wintypes.DWORD]
            psapi.GetProcessMemoryInfo.restype = wintypes.BOOL
            c = Counters()
            c.cb = ctypes.sizeof(c)
            return c.WorkingSetSize if psapi.GetProcessMemoryInfo(kernel.GetCurrentProcess(), ctypes.byref(c), c.cb) else None
        if os.path.exists("/proc/self/statm"):
            with open("/proc/self/statm") as fh:
                return int(fh.read().split()[1]) * os.sysconf("SC_PAGE_SIZE")
    except Exception:
        return None
    return None


def test_memory_does_not_grow_over_a_long_session():
    """600 frames through the real detector, tracker, filter and rig.

    Measured on the dev laptop (Windows 11, CPU): after a 100-frame warm-up, the Python heap changed by
    -3 KiB and the process by -6 MiB over the next 500 frames (peak 17 MiB). The bounds below are far above that
    noise and far below a real leak: 256 KiB of Python heap is about 500 bytes lost per frame, and a single
    leaked 320x240 picture is 230 KiB. `tracemalloc` cannot see native allocations (OpenCV), hence the process check.
    """
    pytest.importorskip("cv2")
    pytest.importorskip("skimage")
    from realx import rig  # noqa: F401  (registers the "rig" stage)
    from realx.models import ModelError, ensure_model
    from realx.sources import SyntheticScene
    from realx.stages import create

    try:
        ensure_model("yunet", download=False)
    except ModelError as exc:
        pytest.skip(f"yunet not downloaded: {exc}")
    scene = SyntheticScene("dance", size=(320, 240), head_height=75, degrade=0.6)
    ring = [scene.render(i) for i in range(40)]  # rendered once: the test is about the pipeline, not the scene

    def frame(i):
        r = ring[i % len(ring)]
        return FrameContext(pixels=r.pixels.copy(), index=i, timestamp=i / 30.0, meta=dict(r.meta))

    stages = [create("detect_yunet", score_threshold=0.3), create("track"), create("one_euro"), create("rig")]
    tracemalloc.start()
    try:
        with Pipeline(stages, strict=False) as pipe:
            for i in range(100):  # warm-up: lazy model state, caches, tracker state
                pipe.process(frame(i))
            gc.collect()
            heap0, rss0 = tracemalloc.get_traced_memory()[0], _rss_bytes()
            for i in range(100, 600):
                pipe.process(frame(i))
            gc.collect()
            heap1, rss1 = tracemalloc.get_traced_memory()[0], _rss_bytes()
    finally:
        tracemalloc.stop()
    assert heap1 - heap0 < 256 * 1024, f"Python heap grew by {(heap1 - heap0) / 1024:.0f} KiB over 500 frames"
    if rss0 is not None and rss1 is not None:
        assert rss1 - rss0 < 48 * 1024 * 1024, f"process memory grew by {(rss1 - rss0) / 2**20:.1f} MiB over 500 frames"


def test_engine_threads_return_to_baseline_after_every_stop(monkeypatch, cv2_ready):
    baseline = threading.active_count()
    for _ in range(4):
        engine = make_engine(monkeypatch, lambda source: FakeCamera(None))
        engine.start()
        assert wait_for(lambda: engine.stats()["frames"] > 3)
        engine.stop()
        assert not engine._thread.is_alive()
    assert wait_for(lambda: threading.active_count() <= baseline, timeout=5), (
        f"{threading.active_count()} threads, expected at most {baseline}: {[t.name for t in threading.enumerate()]}"
    )


def test_a_stopped_engine_closes_its_camera(monkeypatch, cv2_ready):
    cams = []

    def opener(source):
        cams.append(FakeCamera(None))
        return cams[-1]

    engine = make_engine(monkeypatch, opener)
    engine.start()
    assert wait_for(lambda: engine.stats()["frames"] > 3)
    engine.stop()
    assert cams and all(c.closed for c in cams)


# --- (e) a face that disappears and comes back -----------------------------------------------------
def box(x, y, size=100.0, score=0.9):
    return Face(bbox=np.array([x, y, x + size, y + size], dtype=float), score=score)


def test_a_short_occlusion_returns_the_same_identity_and_never_a_ghost():
    t = FaceTracker(min_hits=2)
    seen, counts = set(), []
    for i in range(8):
        out = t.update([box(100 + 12 * i, 100)])
        seen.update(f.track_id for f in out)
        counts.append(len(out))
    for _ in range(3):  # hidden behind something for three frames
        out = t.update([])
        counts.append(len(out))
        assert out and out[0].predicted, "the position is estimated while it is hidden"
        seen.update(f.track_id for f in out)
    out = t.update([box(100 + 12 * 11, 100)])  # and it comes back about where it was heading
    seen.update(f.track_id for f in out)
    counts.append(len(out))
    assert len(seen) == 1, "the same identity before, during and after"
    assert max(counts) == 1, "never two faces for one person"
    assert out and not out[0].predicted


def _occlude(frames_hidden):
    """A face seen for 8 frames, hidden for `frames_hidden`, then back somewhere else. Returns (id before, shown while hidden, after)."""
    t = FaceTracker(min_hits=2)
    first = None
    for i in range(8):
        out = t.update([box(100 + 12 * i, 100)])
        first = out[0].track_id if out else first
    while_hidden = [t.update([]) for _ in range(frames_hidden)]
    after = [t.update([box(300, 200)]) for _ in range(4)]
    return first, while_hidden, after


def test_the_tracker_has_three_regimes_for_a_hidden_face():
    """Defaults: an estimated position is shown for 8 frames, the track is remembered for 45, then it is forgotten."""
    t = FaceTracker()
    assert (t.max_predict, t.max_lost) == (8.0, 45.0)

    first, hidden, after = _occlude(5)  # (1) short: estimated, same identity
    assert all(h and h[0].predicted for h in hidden)
    assert after[-1] and after[-1][0].track_id == first

    first, hidden, after = _occlude(25)  # (2) medium: nothing invented, but the same identity comes back
    assert all(len(h) <= 1 for h in hidden) and not hidden[-1], "no estimate is shown for a face hidden this long"
    assert all(len(a) <= 1 for a in after), "no ghost beside the returning face"
    assert after[-1] and after[-1][0].track_id == first

    first, hidden, after = _occlude(80)  # (3) long: forgotten, so the return is a new person-track, and ids are never reused
    assert not hidden[-1]
    assert all(len(a) <= 1 for a in after)
    assert after[-1] and after[-1][0].track_id > first


def test_real_detector_through_an_occlusion_keeps_one_identity():
    pytest.importorskip("cv2")
    pytest.importorskip("skimage")
    from realx.models import ModelError, ensure_model
    from realx.sources import SyntheticScene
    from realx.stages import create

    try:
        ensure_model("yunet", download=False)
    except ModelError as exc:
        pytest.skip(f"yunet not downloaded: {exc}")
    scene = SyntheticScene("dance", degrade=0.6)
    stages = [create("detect_yunet", score_threshold=0.3), create("track"), create("one_euro")]
    ids, counts, back_at = set(), [], None
    with Pipeline(stages, strict=False) as pipe:
        for i in range(60):
            ctx = scene.render(i)
            if 25 <= i < 33:  # eight frames of a flat grey card in front of the face
                cx, cy = (int(v) for v in ctx.meta["gt_center"])
                ctx.pixels[max(0, cy - 90) : cy + 90, max(0, cx - 90) : cx + 90] = (90, 95, 110)
            out = pipe.process(ctx)
            ids.update(f.track_id for f in out.faces)
            counts.append(len(out.faces))
            if i >= 33 and back_at is None and any(not f.predicted for f in out.faces):
                back_at = i
    assert len(ids) == 1, f"identity changed: {ids}"
    assert max(counts) <= 1, "a ghost face appeared"
    assert back_at is not None and back_at <= 40, f"the face was not found again soon after the occlusion (frame {back_at})"
