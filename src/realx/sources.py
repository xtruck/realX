"""Frame sources: camera, video file, and a synthetic mover for tests and demos."""

from __future__ import annotations

import math
import time
from collections.abc import Iterator

import numpy as np

from realx.types import FrameContext


class SourceError(RuntimeError):
    pass


def camera_frames(index: int = 0, size: tuple[int, int] = (640, 480)) -> Iterator[FrameContext]:
    import cv2

    cap = cv2.VideoCapture(index)
    if not cap.isOpened():
        raise SourceError(f"cannot open camera {index}")
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, size[0])
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, size[1])
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # latest frame wins
    i = 0
    try:
        while True:
            ok, bgr = cap.read()
            if not ok:
                raise SourceError("camera stopped delivering frames")
            yield FrameContext(
                pixels=cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB), index=i, timestamp=time.perf_counter()
            )
            i += 1
    finally:
        cap.release()


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
