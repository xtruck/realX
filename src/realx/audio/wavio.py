"""16-bit PCM WAV reading and writing with the standard library only."""

from __future__ import annotations

import wave

import numpy as np


def read_wav(path: str) -> tuple[np.ndarray, int]:
    """Return mono float32 samples in [-1, 1] and the sample rate."""
    with wave.open(path, "rb") as w:
        if w.getsampwidth() != 2:
            raise ValueError("only 16-bit PCM WAV is supported")
        rate, channels, frames = w.getframerate(), w.getnchannels(), w.getnframes()
        raw = w.readframes(frames)
    pcm = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
    if channels > 1:
        pcm = pcm.reshape(-1, channels).mean(axis=1)
    return pcm, rate


def to_pcm16(x: np.ndarray) -> np.ndarray:
    return np.clip(np.round(np.asarray(x, dtype=np.float32) * 32767.0), -32768, 32767).astype("<i2")


def write_wav(path: str, samples: np.ndarray, rate: int) -> None:
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(to_pcm16(samples).tobytes())
