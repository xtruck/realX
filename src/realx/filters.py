"""Signal helpers shared by stages.

OneEuroFilter: Casiez, Roussel, Vogel, "1 Euro Filter" (CHI 2012). A low-pass filter
whose cutoff rises with speed: steady faces are smoothed hard (no jitter), fast
motion passes through (no lag). Better than a fixed-weight average for live video.
"""

from __future__ import annotations

import math

import numpy as np


class OneEuroFilter:
    def __init__(self, min_cutoff: float = 1.0, beta: float = 0.0, d_cutoff: float = 1.0) -> None:
        if min_cutoff <= 0 or d_cutoff <= 0 or beta < 0:
            raise ValueError("min_cutoff and d_cutoff must be > 0 and beta >= 0")
        self.min_cutoff = min_cutoff
        self.beta = beta
        self.d_cutoff = d_cutoff
        self._x: np.ndarray | None = None
        self._dx: np.ndarray | None = None
        self._t: float | None = None

    def reset(self) -> None:
        self._x = self._dx = self._t = None

    @staticmethod
    def _alpha(cutoff: np.ndarray | float, dt: float) -> np.ndarray | float:
        tau = 1.0 / (2.0 * math.pi * np.asarray(cutoff))
        return 1.0 / (1.0 + tau / dt)

    def __call__(self, x: np.ndarray, t: float) -> np.ndarray:
        x = np.asarray(x, dtype=float)
        if not (np.all(np.isfinite(x)) and math.isfinite(t)):
            self.reset()  # a bad sample must not poison the state: restart at the next finite one
            return x.copy()
        if self._x is None or self._x.shape != x.shape or self._t is None:
            self._x, self._dx, self._t = x.copy(), np.zeros_like(x), t
            return x.copy()
        dt = t - self._t
        if dt < 0:  # time went backwards (looped clip, clock reset): restart from this sample
            self._x, self._dx, self._t = x.copy(), np.zeros_like(x), t
            return x.copy()
        if dt == 0:  # repeated timestamp: hold the last value
            return self._x.copy()
        dx = (x - self._x) / dt
        a_d = self._alpha(self.d_cutoff, dt)
        dx_hat = a_d * dx + (1.0 - a_d) * self._dx
        cutoff = self.min_cutoff + self.beta * np.abs(dx_hat)
        a = self._alpha(cutoff, dt)
        x_hat = a * x + (1.0 - a) * self._x
        self._x, self._dx, self._t = x_hat, dx_hat, t
        return x_hat.copy()


class ParamTimeline:
    """A parameter that changes over the video (per-frame markers).

    Keyframes map frame index to value; values are linearly interpolated and held
    constant before the first and after the last keyframe.
    """

    def __init__(self, keyframes: dict[int, float]) -> None:
        if not keyframes:
            raise ValueError("at least one keyframe is required")
        if any(k < 0 for k in keyframes) or not all(math.isfinite(v) for v in keyframes.values()):
            raise ValueError("keyframes must have frame >= 0 and finite values")
        self._frames = np.array(sorted(keyframes), dtype=float)
        self._values = np.array([keyframes[int(f)] for f in self._frames], dtype=float)

    def at(self, frame: int) -> float:
        return float(np.interp(frame, self._frames, self._values))


def average_embeddings(embeddings: list[np.ndarray]) -> np.ndarray:
    """Merge several photos of one person into a single, more robust identity vector."""
    if not embeddings:
        raise ValueError("no embeddings")
    arr = np.stack([np.asarray(e, dtype=float).reshape(-1) for e in embeddings])
    norms = np.linalg.norm(arr, axis=1)
    if np.any(norms == 0) or not np.all(np.isfinite(norms)):
        raise ValueError("embeddings must be finite and non-zero")
    mean = (arr / norms[:, None]).mean(axis=0)
    n = np.linalg.norm(mean)
    if n == 0:
        raise ValueError("embeddings cancel out")
    return mean / n
