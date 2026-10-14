"""Voice pipeline stages. They share the registry, consent gate and ordering rules
with the video pipeline, so `Pipeline` runs them unchanged.
"""

from __future__ import annotations

from typing import Protocol

import numpy as np

from realx.audio import dsp
from realx.audio.types import AudioContext
from realx.audio.wavio import to_pcm16
from realx.safety import watermark
from realx.safety.gate import require_consent
from realx.stages.base import register


@register("voice_gate")
class VoiceGate:
    """Noise gate: silences background noise between words."""

    name = "voice_gate"
    alters_media = True

    stateful = True  # keeps its gain between chunks

    def __init__(self, threshold_db: float = -50.0, release_ms: float = 80.0) -> None:
        self.threshold_db, self.release_ms = threshold_db, release_ms
        self._gate: dsp.NoiseGate | None = None
        self._rate = 0

    def setup(self) -> None:
        self._gate = None

    def process(self, ctx: AudioContext) -> AudioContext:
        if self._gate is None or self._rate != ctx.sample_rate:
            self._gate = dsp.NoiseGate(ctx.sample_rate, self.threshold_db, release_ms=self.release_ms)
            self._rate = ctx.sample_rate
        ctx.samples = self._gate.process(ctx.samples)
        return ctx

    def close(self) -> None:
        self._gate = None


@register("voice_normalize")
class VoiceNormalize:
    name = "voice_normalize"
    alters_media = True

    def __init__(self, target_db: float = -3.0) -> None:
        self.target_db = target_db

    def setup(self) -> None: ...

    def process(self, ctx: AudioContext) -> AudioContext:
        ctx.samples = dsp.normalize_peak(ctx.samples, self.target_db)
        return ctx

    def close(self) -> None: ...


@register("voice_pitch")
class VoicePitch:
    """Pitch shift in real time. Changes your own voice; does not imitate anyone."""

    name = "voice_pitch"
    alters_media = True
    stateful = True

    def __init__(self, semitones: float = 0.0, fft_size: int = 1024) -> None:
        self.semitones, self.fft_size = semitones, fft_size
        self._shifter: dsp.StreamingPitchShifter | None = None
        self._rate = 0

    def setup(self) -> None:
        self._shifter = None

    def process(self, ctx: AudioContext) -> AudioContext:
        if self.semitones == 0:
            ctx.meta["latency_ms"] = 0.0
            return ctx
        if self._shifter is None or self._rate != ctx.sample_rate:
            self._shifter = dsp.StreamingPitchShifter(self.semitones, ctx.sample_rate, self.fft_size)
            self._rate = ctx.sample_rate
        ctx.meta["latency_ms"] = 1000.0 * self._shifter.latency_samples / ctx.sample_rate
        ctx.samples = self._shifter.process(ctx.samples)
        return ctx

    def close(self) -> None:
        self._shifter = None


class VoiceBackend(Protocol):
    """A voice conversion engine (neural models plug in here)."""

    name: str

    def convert(self, samples: np.ndarray, sample_rate: int, target: str, session: dict) -> np.ndarray:
        """Convert one chunk. `session` is owned by the calling stage: keep any
        streaming state in it, never on the backend, so streams cannot mix."""
        ...

    def latency_samples(self, target: str, sample_rate: int) -> int: ...


_BACKENDS: dict[str, VoiceBackend] = {}


def register_voice_backend(backend: VoiceBackend) -> None:
    _BACKENDS[backend.name] = backend


class PitchMorphBackend:
    """Baseline backend: shifts pitch toward a target profile. No identity cloning.

    Streaming: the caller's `session` holds one shifter per (target, sample rate), so
    consecutive chunks join without clicks. Output is delayed by the shifter latency.
    The backend itself is stateless and safe to share.
    """

    name = "pitch_morph"

    def __init__(self, semitones_by_target: dict[str, float] | None = None) -> None:
        self.profiles = dict(semitones_by_target or {})

    def latency_samples(self, target: str, sample_rate: int) -> int:
        return 0 if self.profiles.get(target, 0.0) == 0 else dsp.StreamingPitchShifter.DEFAULT_FFT

    def convert(self, samples: np.ndarray, sample_rate: int, target: str, session: dict) -> np.ndarray:
        semitones = self.profiles.get(target, 0.0)
        if semitones == 0:
            return np.asarray(samples, dtype=np.float32).copy()
        key = (target, sample_rate)
        shifter = session.get(key)
        if shifter is None:
            shifter = session[key] = dsp.StreamingPitchShifter(semitones, sample_rate)
        return shifter.process(samples)


register_voice_backend(PitchMorphBackend())


@register("voice_convert")
class VoiceConvert:
    """Convert the speaker's voice to a target identity. Needs consent.

    Declares `requires_consent`, so a pipeline cannot be built without a consent gate
    before it and a watermark after it. The target identity must match the consent.
    """

    name = "voice_convert"
    alters_media = True
    requires_consent = True

    def __init__(self, target: str, backend: str = "pitch_morph") -> None:
        if backend not in _BACKENDS:
            raise ValueError(f"unknown voice backend '{backend}' (known: {sorted(_BACKENDS)})")
        self.target = target
        self._backend = _BACKENDS[backend]
        self._session: dict = {}

    stateful = True  # holds this stream's converter state

    def setup(self) -> None:
        self._session = {}  # every run starts from a clean stream

    def process(self, ctx: AudioContext) -> AudioContext:
        require_consent(ctx, self.target)
        ctx.samples = self._backend.convert(ctx.samples, ctx.sample_rate, self.target, self._session).astype(
            np.float32
        )
        ctx.meta["voice_target"] = self.target
        latency = self._backend.latency_samples(self.target, ctx.sample_rate)
        ctx.meta["latency_ms"] = 1000.0 * latency / ctx.sample_rate
        return ctx

    def close(self) -> None:
        self._session = {}


@register("audio_watermark")
class AudioWatermark:
    """Embeds an (optionally authenticated) provenance mark in the 16-bit samples.

    Baseline LSB mark: it survives lossless handling only. A robust spread-spectrum
    mark is on the roadmap; the interface stays the same.
    """

    name = "audio_watermark"
    is_watermark = True

    def __init__(self, payload: bytes, key: bytes | None = None) -> None:
        if not payload or len(payload) > watermark.MAX_PAYLOAD:
            raise ValueError(f"payload must be 1..{watermark.MAX_PAYLOAD} bytes")
        self.payload, self.key = payload, key

    def setup(self) -> None: ...

    def process(self, ctx: AudioContext) -> AudioContext:
        pcm = np.ascontiguousarray(to_pcm16(ctx.samples), dtype="<i2").reshape(-1).copy()
        low = pcm.view(np.uint8)[0::2]  # least significant byte of each little-endian sample
        low[:] = watermark.embed(low.copy(), self.payload, self.key)
        ctx.samples = (pcm.astype(np.float32) / 32767.0).astype(np.float32)
        ctx.meta["pcm16"] = pcm
        return ctx

    def close(self) -> None: ...


def extract_audio_mark(pcm16: np.ndarray, key: bytes | None = None) -> bytes | None:
    pcm = np.ascontiguousarray(pcm16, dtype="<i2").reshape(-1)
    return watermark.extract(pcm.view(np.uint8)[0::2].copy(), key=key)
