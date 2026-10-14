from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import numpy as np


@dataclass
class AudioContext:
    """A mono audio chunk flowing through the voice pipeline."""

    samples: np.ndarray  # float32, [-1, 1]
    sample_rate: int = 16000
    index: int = 0
    timestamp: float = 0.0
    meta: dict[str, Any] = field(default_factory=dict)
    faces: list = field(default_factory=list)  # unused; keeps stage helpers uniform

    def __post_init__(self) -> None:
        arr = np.asarray(self.samples)
        if arr.ndim != 1:
            raise ValueError("samples must be 1-D mono audio")
        if self.sample_rate <= 0:
            raise ValueError("sample_rate must be positive")
        arr = arr.astype(np.float32, copy=False)
        if not np.all(np.isfinite(arr)):
            raise ValueError("samples must be finite")
        self.samples = arr
