"""Whole-file voice processing shared by the CLI and the HTTP server."""

from __future__ import annotations

import io
import struct
import wave

import numpy as np

from realx.audio import dsp
from realx.audio.stages import extract_audio_mark  # noqa: F401  (re-export for callers)
from realx.audio.types import AudioContext
from realx.audio.wavio import to_pcm16
from realx.pipeline import Pipeline
from realx.stages import create

MAX_WAV_BYTES = 20 * 1024 * 1024
MAX_SECONDS = 600  # ten minutes keeps CPU time and memory bounded
MIN_RATE, MAX_RATE = 8000, 96000
MARK = b"realx|voice"


def read_wav_bytes(data: bytes) -> tuple[np.ndarray, int]:
    if len(data) > MAX_WAV_BYTES:
        raise ValueError("audio file is larger than 20 MB")
    try:
        with wave.open(io.BytesIO(data), "rb") as w:
            if w.getsampwidth() != 2:
                raise ValueError("only 16-bit PCM WAV is supported")
            rate, channels, frames = w.getframerate(), w.getnchannels(), w.getnframes()
            if not MIN_RATE <= rate <= MAX_RATE:
                raise ValueError(f"sample rate must be between {MIN_RATE} and {MAX_RATE} Hz")
            if channels not in (1, 2):
                raise ValueError("only mono or stereo audio is supported")
            if frames / rate > MAX_SECONDS:
                raise ValueError(f"audio is longer than {MAX_SECONDS // 60} minutes")
            raw = w.readframes(frames)
    except (wave.Error, EOFError, struct.error) as exc:
        raise ValueError(f"not a valid WAV file: {exc}") from exc
    pcm = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
    if channels > 1:
        pcm = pcm[: pcm.size // channels * channels].reshape(-1, channels).mean(axis=1)
    return pcm, rate


def wav_bytes(samples: np.ndarray, rate: int) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(to_pcm16(samples).tobytes())
    return buf.getvalue()


def convert(
    samples: np.ndarray, rate: int, semitones: float = 0.0, gate_db: float | None = -55.0, key: bytes | None = None
) -> tuple[np.ndarray, np.ndarray]:
    """Clean up and pitch-shift a recording. Returns (float samples, 16-bit pcm).

    The output always carries the realX provenance mark.
    """
    if not -12 <= semitones <= 12:
        raise ValueError("semitones must be between -12 and 12")
    shifted = dsp.pitch_shift(samples, semitones, rate)
    stages = []
    if gate_db is not None:
        stages.append(create("voice_gate", threshold_db=gate_db))
    stages += [create("voice_normalize", target_db=-3.0), create("audio_watermark", payload=MARK, key=key)]
    with Pipeline(stages) as pipe:
        out = pipe.process(AudioContext(samples=shifted, sample_rate=rate))
    return out.samples, out.meta["pcm16"]


def convert_wav_bytes(data: bytes, semitones: float = 0.0, key: bytes | None = None) -> bytes:
    samples, rate = read_wav_bytes(data)
    if samples.size == 0:
        raise ValueError("audio file is empty")
    _, pcm = convert(samples, rate, semitones, key=key)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(np.ascontiguousarray(pcm, dtype="<i2").tobytes())
    return buf.getvalue()
