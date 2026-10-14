from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import numpy as np


@dataclass
class Face:
    """A detected face. `track_id` is assigned by the tracking stage."""

    bbox: np.ndarray  # (4,) x1, y1, x2, y2 in pixels
    landmarks: np.ndarray | None = None  # (N, 2) in pixels
    score: float = 1.0
    track_id: int | None = None
    embedding: np.ndarray | None = None
    predicted: bool = False  # True when the box was extrapolated, not detected


@dataclass
class FrameContext:
    """Everything a stage may read or change for one frame."""

    pixels: np.ndarray  # HxWx3 uint8, RGB
    index: int = 0
    timestamp: float = 0.0
    faces: list[Face] = field(default_factory=list)
    meta: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.pixels.ndim != 3 or self.pixels.shape[2] != 3:
            raise ValueError("pixels must be HxWx3")
        if self.pixels.dtype != np.uint8:
            raise ValueError("pixels must be uint8")
