"""Character voice presets: ways of colouring your own voice, not anyone else's.

A preset is a handful of numbers for the effects chain (pitch, vocal-tract size,
ring-modulator, band-limit, saturation). It holds no recording, no model and no
speaker embedding, so it cannot make you sound like a particular person; it only
changes how your voice sounds. Imitating a real person's voice is a different feature:
it goes through `voice_convert`, which needs a signed consent record and a watermark.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

import numpy as np

from realx.audio import dsp

NOTE = "Changes how your own voice sounds. It cannot copy or imitate a particular person."


@dataclass(frozen=True)
class VoicePreset:
    id: str
    label: str
    description: str
    semitones: float = 0.0  # pitch change
    formant: float | None = None  # vocal-tract size ratio; None lets it follow the pitch
    ring_hz: float = 0.0  # ring-modulator frequency, 0 = off
    ring_mix: float = 0.0
    band: tuple[float, float] | None = None  # band-pass edges in Hz
    drive: float = 0.0  # soft clipping amount, 0 = off


PRESETS: dict[str, VoicePreset] = {
    p.id: p
    for p in (
        VoicePreset("pip", "Pip", "Small and bright, like the bundled mint-green character.", semitones=5.0, formant=1.2),
        VoicePreset("bear", "Bear", "Big and warm, with a roomy chest.", semitones=-5.0, formant=0.84),
        VoicePreset("imp", "Imp", "Squeaky and cheeky, slightly crunchy.", semitones=8.0, formant=0.95, drive=1.6),
        VoicePreset(
            "robot", "Robot", "Metallic and steady.", semitones=-2.0, formant=1.0,
            ring_hz=70.0, ring_mix=0.55, band=(200.0, 4000.0),
        ),
        VoicePreset("radio", "Old radio", "Narrow and crackly, like a small speaker.", band=(350.0, 3200.0), drive=2.5),
    )
}

for _p in PRESETS.values():  # fail at import, not at stream time
    if not re.fullmatch(r"[a-z]{2,12}", _p.id) or not -12 <= _p.semitones <= 12:
        raise ValueError(f"invalid preset {_p.id!r}")


def get_preset(preset_id: str) -> VoicePreset:
    try:
        return PRESETS[preset_id]
    except (KeyError, TypeError):
        raise ValueError(f"unknown voice preset (choose from: {', '.join(PRESETS)})") from None


def describe() -> list[dict]:
    return [{"id": p.id, "label": p.label, "description": p.description} for p in PRESETS.values()]


class CharacterVoice:
    """The effects chain for one preset on one stream. Stateful: feed it chunks in order."""

    def __init__(self, preset: VoicePreset, sample_rate: int) -> None:
        self.preset, self.sample_rate = preset, sample_rate
        self._shift = None
        if preset.semitones != 0 or (preset.formant is not None and preset.formant != 1.0):
            self._shift = dsp.StreamingPitchShifter(preset.semitones, sample_rate, formant=preset.formant)
        self._ring = dsp.RingModulator(preset.ring_hz, preset.ring_mix, sample_rate) if preset.ring_hz else None
        self._band = dsp.BandPass(*preset.band, sample_rate) if preset.band else None

    @property
    def latency_samples(self) -> int:
        return (self._shift.latency_samples if self._shift else 0) + (self._band.latency_samples if self._band else 0)

    def process(self, x: np.ndarray) -> np.ndarray:
        y = np.asarray(x, dtype=np.float32)
        if self._shift:
            y = self._shift.process(y)
        if self._ring:
            y = self._ring.process(y)
        if self._band:
            y = self._band.process(y)
        return dsp.soft_clip(y, self.preset.drive)

    def render(self, x: np.ndarray) -> np.ndarray:
        """A whole recording: same length as the input, delay compensated."""
        x = np.asarray(x, dtype=np.float32)
        if x.size == 0:
            return x.copy()
        lat = self.latency_samples
        y = self.process(np.concatenate([x, np.zeros(lat, dtype=np.float32)]))
        return y[lat : lat + x.size]
