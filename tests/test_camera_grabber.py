"""The latest-frame camera grabber and the live diagnostics. A fake capture stands in for the camera, so
nothing here touches hardware: it proves the logic (newest wins, bounded, age is measured, loss is reported,
close never hangs), not how a real webcam or driver behaves."""

from __future__ import annotations

import threading
import time

import numpy as np
import pytest

from realx.diag import Diagnostics, percentile
from realx.sources import CameraSource, LatestFrameGrabber, SourceError


class FakeCapture:
    """Delivers numbered frames at `interval`; can die, raise, or block inside read()."""

    def __init__(self, interval=0.005, die_after=None, raise_after=None, block_after=None):
        self.interval, self.die_after, self.raise_after, self.block_after = interval, die_after, raise_after, block_after
        self.n = 0
        self.released = threading.Event()
        self.unblock = threading.Event()

    def read(self):
        if self.block_after is not None and self.n >= self.block_after:
            self.unblock.wait(10)
        time.sleep(self.interval)
        if self.die_after is not None and self.n >= self.die_after:
            return False, None
        if self.raise_after is not None and self.n >= self.raise_after:
            raise RuntimeError("driver exploded: secret-detail")
        self.n += 1
        return True, np.full((4, 4, 3), self.n % 256, np.uint8)

    def release(self):
        self.released.set()


def test_a_slow_consumer_always_gets_the_newest_frame_and_old_ones_are_skipped_not_queued():
    cap = FakeCapture(interval=0.002)
    g = LatestFrameGrabber(cap).start()
    try:
        first, _, seq0 = g.next()
        time.sleep(0.15)  # a consumer that is busy for ~75 capture intervals
        frame, arrived, seq1 = g.next()
        assert seq1 - seq0 > 20, "frames captured meanwhile were skipped, not delivered late"
        assert int(frame[0, 0, 0]) == (seq1 + 1) % 256, "the frame returned is the newest one, not the oldest queued"
        assert time.perf_counter() - arrived < 0.1, "and it is fresh"
        stats = g.stats()
        assert stats["skipped"] >= 20 and stats["captured"] >= seq1 + 1 and stats["alive"]
    finally:
        g.close()
        assert cap.released.wait(2), "the thread releases the device"


def test_the_same_frame_is_never_delivered_twice():
    g = LatestFrameGrabber(FakeCapture(interval=0.01)).start()
    try:
        seqs = [g.next()[2] for _ in range(10)]
        assert seqs == sorted(set(seqs))
    finally:
        g.close()


def test_capture_fps_is_measured_from_arrival_times():
    g = LatestFrameGrabber(FakeCapture(interval=0.02)).start()
    try:
        for _ in range(30):
            g.next()
        fps = g.stats()["capture_fps"]
        assert 20 < fps <= 52, fps  # nominally 50 Hz; sleep granularity makes it lower, never higher
    finally:
        g.close()


def test_a_camera_that_stops_is_reported_as_a_source_error():
    cap = FakeCapture(interval=0.002, die_after=5)
    g = LatestFrameGrabber(cap).start()
    try:
        with pytest.raises(SourceError, match="stopped delivering"):
            for _ in range(100):
                g.next(timeout=1)
        assert cap.released.wait(2) and not g.stats()["alive"]
    finally:
        g.close()


def test_a_driver_exception_becomes_a_source_error_without_leaking_its_message():
    g = LatestFrameGrabber(FakeCapture(interval=0.002, raise_after=3)).start()
    try:
        with pytest.raises(SourceError) as info:
            for _ in range(100):
                g.next(timeout=1)
        assert "secret-detail" not in str(info.value) and "RuntimeError" in str(info.value)
    finally:
        g.close()


def test_a_camera_that_hangs_times_out_instead_of_blocking_the_consumer_and_close_still_returns():
    cap = FakeCapture(interval=0.002, block_after=3)
    g = LatestFrameGrabber(cap, stale_after=0.3).start()
    try:
        for _ in range(3):
            g.next()
        started = time.perf_counter()
        with pytest.raises(SourceError, match="stopped delivering"):
            g.next()
        assert time.perf_counter() - started < 1.5
        started = time.perf_counter()
        g.close()  # the thread is stuck inside read(): close must still come back promptly
        assert time.perf_counter() - started < 3
        assert not cap.released.is_set(), "the device is not released under a read that is still running"
    finally:
        cap.unblock.set()
        assert cap.released.wait(3), "once read() returns, the thread releases the device"


def test_close_is_idempotent_and_stops_the_thread():
    g = LatestFrameGrabber(FakeCapture()).start()
    g.next()
    g.close()
    g.close()
    assert not g._thread.is_alive()


def test_camera_source_stamps_frames_with_their_arrival_time_and_converts_to_rgb():
    cap = FakeCapture(interval=0.005)
    src = CameraSource(LatestFrameGrabber(cap).start())
    try:
        ctx = next(src)
        assert ctx.pixels.shape == (4, 4, 3) and ctx.pixels.dtype == np.uint8
        assert ctx.meta["captured_at"] == ctx.timestamp and ctx.meta["capture_seq"] >= 0
        assert 0 <= time.perf_counter() - ctx.meta["captured_at"] < 1
        assert src.capture_stats()["captured"] >= 1
    finally:
        src.close()


# --- diagnostics -----------------------------------------------------------------------------------------
def test_percentile_basics():
    assert percentile([], 0.5) == 0.0
    assert percentile([5], 0.95) == 5
    assert percentile([1, 2, 3, 4, 5], 0.5) == 3
    assert percentile(list(range(101)), 0.95) == 95


def test_diagnostics_rings_are_bounded_and_report_percentiles():
    d = Diagnostics()
    for i in range(1000):
        d.frame(age_ms=float(i), total_ms=float(i) + 5, process_ms=2.0)
    snap = d.snapshot({"track": 1.234}, {"capture_fps": 30.0})
    assert snap["frame_age_ms"]["samples"] == 120, "only the recent window is kept"
    assert snap["frame_age_ms"]["max"] == 999.0 and snap["end_to_end_ms"]["p50"] > snap["frame_age_ms"]["p50"]
    assert snap["stage_mean_ms"] == {"track": 1.23} and snap["camera"]["capture_fps"] == 30.0
    assert snap["frames_measured"] == 1000


def test_frames_without_a_camera_timestamp_leave_age_empty():
    d = Diagnostics()
    d.frame(None, None, 3.0)
    snap = d.snapshot()
    assert snap["frame_age_ms"]["samples"] == 0 and snap["process_ms"]["samples"] == 1


def test_cpu_percent_comes_from_process_time_over_wall_time_and_is_throttled():
    wall = [100.0]
    cpu = [0.0]
    rss = [50 * 1048576]
    d = Diagnostics(clock=lambda: wall[0], cpu_clock=lambda: cpu[0], rss=lambda: rss[0])
    d.frame(1, 1, 1)  # too early to sample
    assert d.snapshot()["cpu_percent"] is None
    wall[0], cpu[0] = 104.0, 2.0  # busy half the time over 4 s
    d.frame(1, 1, 1)
    snap = d.snapshot()
    assert snap["cpu_percent"] == 50.0 and snap["rss_mb"] == 50.0
    wall[0], cpu[0] = 104.5, 9.0  # inside the throttle window: not re-sampled
    d.frame(1, 1, 1)
    assert d.snapshot()["cpu_percent"] == 50.0


def test_outage_duration_and_count_are_recorded():
    wall = [0.0]
    d = Diagnostics(clock=lambda: wall[0])
    d.source_lost()
    wall[0] = 3.5
    d.source_lost()  # repeated failures during one outage do not restart it
    d.source_back()
    d.source_back()  # nothing to close
    snap = d.snapshot()
    assert snap["source_outages"] == 1 and snap["last_outage_s"] == 3.5


def test_process_memory_is_readable_on_this_platform():
    from realx.diag import process_rss_bytes

    rss = process_rss_bytes()
    assert rss is None or rss > 1_000_000


# --- the engine reports them ------------------------------------------------------------------------------
class _StampedCamera:
    """A fake camera source whose frames carry an arrival time ~40 ms in the past, then stops after `good` frames."""

    def __init__(self, good):
        self.good, self.served, self.closed = good, 0, False

    def __iter__(self):
        return self

    def __next__(self):
        from realx.types import FrameContext

        if self.good is not None and self.served >= self.good:
            raise SourceError("camera stopped delivering frames")
        self.served += 1
        time.sleep(0.005)
        return FrameContext(pixels=np.zeros((48, 64, 3), np.uint8), index=self.served, timestamp=0.0,
                            meta={"captured_at": time.perf_counter() - 0.04})

    def capture_stats(self):
        return {"capture_fps": 29.9, "captured": self.served, "skipped": 0, "alive": True}

    def close(self):
        self.closed = True


def _wait(predicate, timeout=15.0):
    end = time.time() + timeout
    while time.time() < end:
        if predicate():
            return True
        time.sleep(0.02)
    return predicate()


def test_the_engine_stats_carry_frame_age_capture_figures_and_the_recovered_outage(monkeypatch):
    pytest.importorskip("cv2")
    from realx.server import Engine

    cams = []

    def opener(source):
        cam = _StampedCamera(10 if not cams else None)  # dies after 10 frames, the next one works
        cams.append(cam)
        return cam

    engine = Engine(source="demo:static", mode="original")
    monkeypatch.setattr(engine, "_open", opener)
    engine.start()
    try:
        assert _wait(lambda: engine.stats()["error"]), "the loss is visible"
        assert _wait(lambda: engine.stats()["diag"]["source_outages"] == 1 and engine.stats()["error"] is None, 20)
        d = engine.stats()["diag"]
        assert d["last_outage_s"] >= 0.4, "the outage includes the first retry wait"
        assert 35 <= d["frame_age_ms"]["p50"] <= 400 and d["end_to_end_ms"]["p50"] >= d["frame_age_ms"]["p50"]
        assert d["camera"]["capture_fps"] == 29.9 and d["frames_measured"] > 10
        assert isinstance(d["stage_mean_ms"], dict)
        import json

        json.dumps(engine.stats())  # the whole stats document stays serialisable
    finally:
        engine.stop()


# --- the camera benchmark harness (synthetic source: no hardware involved) --------------------------------
def test_bench_camera_synthetic_shows_skipped_frames_not_delayed_ones():
    from realx.bench_camera import LIMITS, run

    doc = run(seconds=1.5, consumer_ms=60, synthetic=True)
    r = doc["result"]
    assert doc["source"] == "synthetic" and r["error"] is None and LIMITS in doc["limits"]
    assert r["frames_skipped"] > r["frames_delivered"], "a slow consumer skips frames"
    assert r["frame_age_ms"]["p95"] < 40, "but the frames it takes are fresh (~one capture interval at most)"
    assert 20 < r["capture_fps"] < 40
    assert {"cpu_load_percent_before", "warning"} <= set(doc["conditions"]) and "platform" in doc["hardware"]
    import json

    json.dumps(doc)


def test_bench_camera_rejects_silly_arguments():
    from realx.bench_camera import run

    for bad in ({"seconds": 0}, {"seconds": 1000}, {"consumer_ms": -1}):
        with pytest.raises(ValueError):
            run(synthetic=True, **bad)
