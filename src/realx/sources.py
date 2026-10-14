"""Frame sources: camera, video file, and a synthetic mover for tests and demos."""

from __future__ import annotations

import math
import threading
import time
from collections import deque
from collections.abc import Iterator

import numpy as np

from realx.types import FrameContext


class SourceError(RuntimeError):
    pass


def _open_camera(cv2, index: int):
    """Open a camera, trying the backends that work on this platform.

    On Windows DirectShow is the most reliable for USB and built-in webcams; the
    default (Media Foundation) often opens but never delivers frames.
    """
    import sys

    backends = [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY] if sys.platform == "win32" else [cv2.CAP_ANY]
    for backend in backends:
        cap = cv2.VideoCapture(index, backend)
        if cap.isOpened():
            ok = False
            for _ in range(10):  # a camera that opens must also deliver a frame
                ok, frame = cap.read()
                if ok and frame is not None:
                    break
            if ok:
                return cap
        cap.release()
    raise SourceError(
        f"cannot open camera {index}. Close other apps using it and check "
        "Windows Settings > Privacy > Camera allows desktop apps."
    )


CAMERA_STALE_SECONDS = 3.0  # no new frame for this long: the camera is treated as gone
CAMERA_CLOSE_WAIT = 2.0     # how long close() waits for the capture thread; it never waits forever


class LatestFrameGrabber:
    """Reads a capture device on its own thread so the newest frame is always available.

    A camera driver queues frames while the consumer is busy (DirectShow on Windows keeps several), so reading
    from the same thread that runs tracking makes every frame older than the last. Here one thread only reads,
    keeps a single slot (newest wins, the older frame is overwritten, never queued) and stamps each frame with the
    time it arrived. The consumer takes the newest unseen frame, so a slow stage skips frames instead of delaying
    them, and it can compute each frame's age. The thread owns the device: it alone releases it, so `close()` can
    return even if the driver is stuck in `read()`.

    `capture` is anything with `read() -> (ok, frame)` and `release()` (an OpenCV `VideoCapture`, or a fake).
    """

    def __init__(self, capture, stale_after: float = CAMERA_STALE_SECONDS, clock=time.perf_counter) -> None:
        self._cap = capture
        self._stale_after = stale_after
        self._clock = clock
        self._cond = threading.Condition()
        self._slot: tuple[np.ndarray, float, int] | None = None  # frame, arrival time, sequence number
        self._seq = -1
        self._taken = -1  # sequence number last handed to the consumer
        self._skipped = 0  # captured but overwritten before anyone took them
        self._intervals: deque[float] = deque(maxlen=60)
        self._last_arrival: float | None = None
        self._error: SourceError | None = None
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._run, name="realx-camera", daemon=True)

    def start(self) -> "LatestFrameGrabber":
        self._thread.start()
        return self

    def _run(self) -> None:
        try:
            while not self._stop.is_set():
                try:
                    ok, frame = self._cap.read()
                except Exception as exc:  # a driver error ends capture; the consumer sees it as SourceError
                    self._fail(f"camera read failed: {type(exc).__name__}")
                    return
                if not ok or frame is None:
                    self._fail("camera stopped delivering frames")
                    return
                now = self._clock()
                with self._cond:
                    if self._slot is not None and self._slot[2] > self._taken:
                        self._skipped += 1  # the previous frame was never taken
                    self._seq += 1
                    self._slot = (frame, now, self._seq)
                    if self._last_arrival is not None:
                        self._intervals.append(now - self._last_arrival)
                    self._last_arrival = now
                    self._cond.notify_all()
        finally:
            try:
                self._cap.release()
            except Exception:
                pass

    def _fail(self, message: str) -> None:
        with self._cond:
            self._error = SourceError(message)
            self._cond.notify_all()

    def next(self, timeout: float | None = None) -> tuple[np.ndarray, float, int]:
        """The newest frame not yet taken, with its arrival time and sequence number.

        Raises SourceError when the camera stopped, or when no new frame arrives within `timeout`
        (default: the stale limit). Never blocks longer than that.
        """
        limit = self._stale_after if timeout is None else timeout
        deadline = self._clock() + limit
        with self._cond:
            while True:
                if self._slot is not None and self._slot[2] > self._taken:
                    frame, arrived, seq = self._slot
                    self._taken = seq
                    return frame, arrived, seq
                if self._error is not None:
                    raise self._error
                remaining = deadline - self._clock()
                if remaining <= 0:
                    raise SourceError("camera stopped delivering frames")
                self._cond.wait(min(remaining, 0.25))

    def stats(self) -> dict:
        with self._cond:
            mean = sum(self._intervals) / len(self._intervals) if self._intervals else 0.0
            return {
                "capture_fps": round(1.0 / mean, 1) if mean > 0 else 0.0,
                "captured": self._seq + 1,
                "skipped": self._skipped,
                "alive": self._thread.is_alive() and self._error is None,
            }

    def close(self) -> None:
        self._stop.set()
        with self._cond:
            self._cond.notify_all()
        if self._thread.is_alive() and threading.current_thread() is not self._thread:
            self._thread.join(CAMERA_CLOSE_WAIT)  # a stuck driver call is left to finish on its own; it releases the device


class CameraSource:
    """Iterator of `FrameContext`s from a camera, always the newest frame, each stamped with when it arrived.

    `meta["captured_at"]` is the arrival time (perf_counter), so a consumer can compute the frame's age.
    """

    def __init__(self, grabber: LatestFrameGrabber) -> None:
        import cv2

        self._cv2 = cv2
        self._grabber = grabber
        self._index = 0

    def __iter__(self) -> "CameraSource":
        return self

    def __next__(self) -> FrameContext:
        bgr, arrived, seq = self._grabber.next()
        i, self._index = self._index, self._index + 1
        return FrameContext(
            pixels=self._cv2.cvtColor(bgr, self._cv2.COLOR_BGR2RGB), index=i, timestamp=arrived,
            meta={"captured_at": arrived, "capture_seq": seq},
        )

    def capture_stats(self) -> dict:
        return self._grabber.stats()

    def close(self) -> None:
        self._grabber.close()


def camera_frames(index: int = 0, size: tuple[int, int] = (640, 480)) -> CameraSource:
    import cv2

    cap = _open_camera(cv2, index)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, size[0])
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, size[1])
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # ask the driver not to queue; the grabber does not rely on it
    return CameraSource(LatestFrameGrabber(cap).start())


def video_frames(path: str) -> Iterator[FrameContext]:
    import cv2

    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        raise SourceError(f"cannot open video {path}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    i = 0
    try:
        while True:
            ok, bgr = cap.read()
            if not ok:
                return
            yield FrameContext(pixels=cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB), index=i, timestamp=i / fps)
            i += 1
    finally:
        cap.release()


MOTIONS = ("static", "dance", "jump", "sprint", "spin")


def _pose(motion: str, t: float, w: int, h: int) -> tuple[float, float, float, float]:
    """Return centre x, y, scale and roll (degrees) for time t seconds."""
    cx, cy = w / 2, h / 2
    if motion == "static":
        return cx, cy, 1.0, 0.0
    if motion == "dance":  # side-to-side sway, bounce, head tilt
        return (
            cx + 0.22 * w * math.sin(2 * math.pi * 0.9 * t),
            cy + 0.08 * h * abs(math.sin(2 * math.pi * 1.8 * t)),
            1.0 + 0.12 * math.sin(2 * math.pi * 0.6 * t),
            18 * math.sin(2 * math.pi * 1.3 * t),
        )
    if motion == "jump":  # big vertical hops with squash and stretch
        phase = (t * 1.6) % 1.0
        height = 4 * phase * (1 - phase)
        return cx, cy + 0.18 * h - 0.38 * h * height, 1.0 + 0.2 * height, 6 * math.sin(10 * t)
    if motion == "sprint":  # fast sweeps across the frame
        x = (math.sin(2 * math.pi * 0.7 * t) + 1) / 2
        return 0.2 * w + 0.6 * w * x, cy + 0.1 * h * math.sin(7 * t), 1.0, 12 * math.sin(5 * t)
    if motion == "spin":  # head rolling quickly
        return cx, cy, 1.0, 35 * math.sin(2 * math.pi * 1.5 * t)
    raise ValueError(f"unknown motion '{motion}', use one of {MOTIONS}")


def _degrade(
    frame: np.ndarray, motion: str, t: float, fps: float, w: int, h: int, amount: float, rng: np.random.Generator
) -> np.ndarray:
    """Webcam-like damage: motion blur along the movement, noise, exposure flicker."""
    import cv2

    x0, y0, _, _ = _pose(motion, t - 1.0 / fps, w, h)
    x1, y1, _, _ = _pose(motion, t, w, h)
    dx, dy = x1 - x0, y1 - y0
    speed = math.hypot(dx, dy)
    length = int(min(41, 1 + amount * speed * 1.2)) | 1  # odd, so the kernel has a centre
    if length > 2:
        kernel = np.zeros((length, length), np.float32)
        angle = math.atan2(dy, dx)
        c = length // 2
        tip = (int(round(c + c * math.cos(angle))), int(round(c + c * math.sin(angle))))
        tail = (int(round(c - c * math.cos(angle))), int(round(c - c * math.sin(angle))))
        cv2.line(kernel, tail, tip, 1.0, 1)
        frame = cv2.filter2D(frame, -1, kernel / max(float(kernel.sum()), 1.0))
    noisy = frame.astype(np.float32) + rng.normal(0, 4 + 10 * amount, frame.shape).astype(np.float32)
    noisy *= 1.0 + 0.12 * amount * math.sin(2 * math.pi * 3.1 * t)
    return np.clip(noisy, 0, 255).astype(np.uint8)


class SyntheticScene:
    """A real portrait moving like someone dancing, jumping or sprinting.

    `render(i)` produces frame i directly (random access), so a live demo can jump to
    the frame for the current time instead of generating and discarding frames. Each
    frame carries the true centre in `meta["gt_center"]` for accuracy measurements.
    Needs `scikit-image` for the public-domain test portrait.
    """

    def __init__(
        self,
        motion: str = "dance",
        size: tuple[int, int] = (640, 480),
        fps: float = 30.0,
        head_height: int = 150,
        degrade: float = 0.0,
        seed: int = 0,
    ) -> None:
        import cv2
        from skimage import data

        if motion not in MOTIONS:
            raise ValueError(f"unknown motion '{motion}', use one of {MOTIONS}")
        self.motion, self.fps, self.degrade, self.seed = motion, fps, degrade, seed
        self.w, self.h = size
        portrait = data.astronaut()  # NASA portrait, public domain
        patch = portrait[10:250, 120:330]  # head and shoulders
        patch = cv2.resize(patch, (int(patch.shape[1] * head_height / patch.shape[0]), head_height))
        self._patch = patch
        ph, pw = patch.shape[:2]
        self._mask_src = np.full((ph, pw), 255, np.uint8)
        yy, xx = np.mgrid[0 : self.h, 0 : self.w]
        self._background = np.stack(
            [(60 + 80 * xx / self.w), (70 + 60 * yy / self.h), (110 + 50 * (xx + yy) / (self.w + self.h))],
            axis=-1,
        ).astype(np.uint8)
        self._face_center = np.array([pw * (178 + 45 - 120) / 210, ph * (63 + 56 - 10) / 240])

    def render(self, i: int) -> FrameContext:
        import cv2

        t = i / self.fps
        px, py, scale, roll = _pose(self.motion, t, self.w, self.h)
        fc = self._face_center
        m = cv2.getRotationMatrix2D((float(fc[0]), float(fc[1])), roll, scale)
        m[0, 2] += px - fc[0]
        m[1, 2] += py - fc[1]
        frame = self._background.copy()
        size = (self.w, self.h)
        warped = cv2.warpAffine(self._patch, m, size, flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0))
        mask = cv2.warpAffine(self._mask_src, m, size, flags=cv2.INTER_LINEAR, borderValue=0)
        frame[mask > 127] = warped[mask > 127]
        if self.degrade > 0:
            rng = np.random.default_rng(self.seed * 1_000_003 + i)  # per-frame, order independent
            frame = _degrade(frame, self.motion, t, self.fps, self.w, self.h, self.degrade, rng)
        return FrameContext(
            pixels=np.ascontiguousarray(frame),
            index=i,
            timestamp=t,
            meta={"gt_center": (px, py), "gt_scale": scale, "gt_roll": roll, "motion": self.motion},
        )


def synthetic_frames(
    motion: str = "dance",
    count: int | None = 120,
    size: tuple[int, int] = (640, 480),
    fps: float = 30.0,
    head_height: int = 150,
    degrade: float = 0.0,
    seed: int = 0,
) -> Iterator[FrameContext]:
    scene = SyntheticScene(motion, size, fps, head_height, degrade, seed)
    i = 0
    while count is None or i < count:
        yield scene.render(i)
        i += 1
