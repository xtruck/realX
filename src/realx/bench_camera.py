"""Camera capture benchmark: what the capture side delivers, and how old the frames are when they are used.

    realx bench-camera --seconds 20                    # camera 0 (needs a camera)
    realx bench-camera --seconds 20 --consumer-ms 80   # a consumer slower than the camera: shows frames skipped, not delayed
    realx bench-camera --synthetic --seconds 5         # no hardware: a paced fake source (checks the harness, not a camera)

It reports capture FPS, delivered FPS, frame age at the moment each frame is taken (p50/p95/max), frames the
camera produced that the consumer never took, this process's CPU and memory, and the conditions. It measures
only the capture path: no tracking, no rendering. A synthetic run says nothing about any camera or driver.
"""

from __future__ import annotations

import json
import time

import numpy as np

from realx.bench import hardware_info, measure_conditions
from realx.diag import percentile, process_rss_bytes
from realx.sources import LatestFrameGrabber, SourceError

LIMITS = (
    "Measures the capture path only (grab to hand-over), not tracking, rendering or the browser. "
    "Frame age is measured from the time the grabber thread received a frame, so the driver's own buffering "
    "before that moment is not included. Results belong to the machine, camera, driver, resolution and "
    "lighting listed here; nothing is a promise about another setup."
)


class _SyntheticCapture:
    """A paced fake camera: one small frame every 1/fps seconds."""

    def __init__(self, fps: float) -> None:
        self.interval = 1.0 / fps
        self._next = time.perf_counter()
        self._frame = np.zeros((48, 64, 3), np.uint8)

    def read(self):
        self._next += self.interval
        delay = self._next - time.perf_counter()
        if delay > 0:
            time.sleep(delay)
        return True, self._frame

    def release(self) -> None: ...


def run(seconds: float = 10.0, index: int = 0, consumer_ms: float = 0.0, synthetic: bool = False,
        size: tuple[int, int] = (640, 480), fps: float = 30.0) -> dict:
    if seconds < 1 or seconds > 600:
        raise ValueError("seconds must be between 1 and 600")
    if consumer_ms < 0 or consumer_ms > 5000:
        raise ValueError("consumer-ms must be between 0 and 5000")
    if synthetic:
        capture, source = _SyntheticCapture(fps), "synthetic"
    else:
        import cv2

        from realx.sources import _open_camera

        capture = _open_camera(cv2, index)
        capture.set(cv2.CAP_PROP_FRAME_WIDTH, size[0])
        capture.set(cv2.CAP_PROP_FRAME_HEIGHT, size[1])
        capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        source = f"camera {index}"
    conditions = measure_conditions()
    grabber = LatestFrameGrabber(capture).start()
    ages: list[float] = []
    gaps: list[float] = []
    delivered = 0
    cpu0, t0, last = time.process_time(), time.perf_counter(), None
    error = None
    try:
        while time.perf_counter() - t0 < seconds:
            try:
                _frame, arrived, _seq = grabber.next(timeout=3.0)
            except SourceError as exc:
                error = str(exc)
                break
            now = time.perf_counter()
            ages.append((now - arrived) * 1000)
            if last is not None:
                gaps.append((now - last) * 1000)
            last = now
            delivered += 1
            if consumer_ms:
                time.sleep(consumer_ms / 1000.0)  # a stage that is slower than the camera
        wall = time.perf_counter() - t0
        cpu = time.process_time() - cpu0
        stats = grabber.stats()
    finally:
        grabber.close()
    rss = process_rss_bytes()
    return {
        "schema": 1,
        "source": source,
        "requested": {"seconds": seconds, "consumer_ms": consumer_ms, "size": list(size), "fps": fps},
        "result": {
            "wall_s": round(wall, 2),
            "capture_fps": stats["capture_fps"],
            "frames_captured": stats["captured"],
            "frames_delivered": delivered,
            "frames_skipped": stats["skipped"],
            "delivered_fps": round(delivered / wall, 2) if wall > 0 else 0.0,
            "frame_age_ms": {"p50": round(percentile(ages, 0.5), 1), "p95": round(percentile(ages, 0.95), 1),
                              "max": round(max(ages), 1) if ages else 0.0},
            "delivery_gap_ms": {"p50": round(percentile(gaps, 0.5), 1), "p95": round(percentile(gaps, 0.95), 1),
                                 "max": round(max(gaps), 1) if gaps else 0.0},
            "process_cpu_percent": round(100.0 * cpu / wall, 1) if wall > 0 else None,
            "rss_mb": None if rss is None else round(rss / 1048576, 1),
            "error": error,
        },
        "conditions": conditions,
        "hardware": hardware_info(),
        "limits": LIMITS,
    }


def run_cli(args) -> int:
    try:
        doc = run(args.seconds, args.index, args.consumer_ms, args.synthetic)
    except (SourceError, ValueError) as exc:
        print(f"bench-camera: {exc}")
        return 2
    r = doc["result"]
    print(f"source: {doc['source']}   ran {r['wall_s']} s")
    print(f"capture {r['capture_fps']} fps   delivered {r['delivered_fps']} fps   skipped {r['frames_skipped']} of {r['frames_captured']}")
    print(f"frame age at hand-over  p50 {r['frame_age_ms']['p50']} ms   p95 {r['frame_age_ms']['p95']} ms   max {r['frame_age_ms']['max']} ms")
    print(f"process CPU {r['process_cpu_percent']} %   memory {r['rss_mb']} MB")
    if r["error"]:
        print(f"stopped early: {r['error']}")
    if doc["source"] == "synthetic":
        print("synthetic source: this checks the harness only; it says nothing about a camera.")
    print("limits:", LIMITS)
    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(doc, fh, indent=2)
        print(f"wrote {args.json}")
    return 0 if r["error"] is None else 1
