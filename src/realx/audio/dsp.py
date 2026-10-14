"""Audio DSP building blocks. Pure numpy, streaming friendly, CPU only."""

from __future__ import annotations

import math

import numpy as np


def rms_db(x: np.ndarray) -> float:
    if x.size == 0:
        return -120.0
    r = float(np.sqrt(np.mean(np.square(x, dtype=np.float64))))
    return 20.0 * math.log10(max(r, 1e-6))


def normalize_peak(x: np.ndarray, target_db: float = -1.0) -> np.ndarray:
    peak = float(np.max(np.abs(x))) if x.size else 0.0
    if peak < 1e-6:
        return x.copy()
    return (x * (10 ** (target_db / 20.0) / peak)).astype(np.float32)


def noise_gate(
    x: np.ndarray, sample_rate: int, threshold_db: float = -50.0, attack_ms: float = 5.0, release_ms: float = 80.0
) -> np.ndarray:
    """Mute background noise between words, with smooth attack and release."""
    if x.size == 0:
        return x.copy()
    thr = 10 ** (threshold_db / 20.0)
    block = max(1, int(sample_rate * 0.005))
    n_blocks = math.ceil(x.size / block)
    padded = np.pad(np.abs(x), (0, n_blocks * block - x.size))
    env = padded.reshape(n_blocks, block).max(axis=1)
    target = (env >= thr).astype(np.float64)
    a_att = 1 - math.exp(-block / (sample_rate * attack_ms / 1000.0))
    a_rel = 1 - math.exp(-block / (sample_rate * release_ms / 1000.0))
    gain = np.empty(n_blocks)
    g = 0.0
    for i, t in enumerate(target):
        g += (a_att if t > g else a_rel) * (t - g)
        gain[i] = g
    # hold the gate open a little after speech so word endings are not clipped
    gain = np.maximum(gain, np.concatenate([[0.0], gain[:-1]]) * 0.9)
    full = np.interp(np.arange(x.size), (np.arange(n_blocks) + 0.5) * block, gain)
    return (x * full).astype(np.float32)


def resample(x: np.ndarray, src_rate: int, dst_rate: int) -> np.ndarray:
    if src_rate == dst_rate or x.size == 0:
        return x.astype(np.float32, copy=True)
    n_out = max(1, int(round(x.size * dst_rate / src_rate)))
    return np.interp(np.linspace(0, x.size - 1, n_out), np.arange(x.size), x).astype(np.float32)


class AudioDelay:
    """Delays audio by a fixed time so it lines up with slower video (A/V sync)."""

    def __init__(self, delay_ms: float, sample_rate: int) -> None:
        if delay_ms < 0:
            raise ValueError("delay_ms must be >= 0")
        self.sample_rate = sample_rate
        self._delay = int(round(delay_ms * sample_rate / 1000.0))
        self._buf = np.zeros(self._delay, dtype=np.float32)

    @property
    def delay_samples(self) -> int:
        return self._delay

    def set_delay_ms(self, delay_ms: float) -> None:
        new = int(round(max(0.0, delay_ms) * self.sample_rate / 1000.0))
        if new > self._delay:
            self._buf = np.concatenate([np.zeros(new - self._delay, np.float32), self._buf])
        elif new < self._delay:
            self._buf = self._buf[self._delay - new :]
        self._delay = new

    def process(self, x: np.ndarray) -> np.ndarray:
        if self._delay == 0:
            return x.astype(np.float32, copy=True)
        both = np.concatenate([self._buf, x.astype(np.float32, copy=False)])
        out, self._buf = both[: x.size], both[x.size :]
        return out


class StreamingPitchShifter:
    """Phase-vocoder pitch shifter that works chunk by chunk with persistent state.

    Moves pitch by `semitones` without changing duration. Output is delayed by
    `latency_samples` (fft_size - hop). Smaller `fft_size` means lower latency and
    slightly rougher low voices. Formants move with pitch, which suits creative voice
    changing; neural voice conversion backends plug in separately.
    """

    def __init__(self, semitones: float, sample_rate: int, fft_size: int = 1024, oversample: int = 4) -> None:
        if fft_size & (fft_size - 1) or fft_size < 256:
            raise ValueError("fft_size must be a power of two >= 256")
        if not -24 <= semitones <= 24:
            raise ValueError("semitones must be within +-24")
        self.ratio = 2.0 ** (semitones / 12.0)
        self.sample_rate = sample_rate
        self.n = fft_size
        self.osamp = oversample
        self.hop = fft_size // oversample
        # A full window of delay guarantees finished output is always available when
        # it is due, so results do not depend on how the input is chunked.
        self.latency_samples = fft_size
        self._win = np.hanning(fft_size + 1)[:-1]
        self._expct = 2.0 * np.pi * self.hop / fft_size
        self._bin_hz = sample_rate / fft_size
        half = fft_size // 2 + 1
        self._last_phase = np.zeros(half)
        self._sum_phase = np.zeros(half)
        self._in = np.zeros(0, dtype=np.float64)
        self._acc = np.zeros(fft_size, dtype=np.float64)  # overlap-add accumulator
        self._ready = np.zeros(0, dtype=np.float64)  # finished output samples
        self._emitted = 0  # output samples handed out so far
        self._k = np.arange(half)

    def _frame(self, block: np.ndarray) -> np.ndarray:
        spec = np.fft.rfft(block * self._win)
        magn, phase = np.abs(spec), np.angle(spec)
        diff = phase - self._last_phase
        self._last_phase = phase
        diff -= self._k * self._expct
        diff = (diff + np.pi) % (2 * np.pi) - np.pi  # wrap to [-pi, pi]
        true_freq = self._k * self._bin_hz + self.osamp * diff / (2 * np.pi) * self._bin_hz

        half = len(self._k)
        idx = (self._k * self.ratio).astype(int)
        ok = idx < half
        syn_magn = np.bincount(idx[ok], weights=magn[ok], minlength=half)[:half]
        syn_freq = np.zeros(half)
        syn_freq[idx[ok]] = true_freq[ok] * self.ratio

        dev = (syn_freq - self._k * self._bin_hz) / self._bin_hz
        self._sum_phase += 2 * np.pi * dev / self.osamp + self._k * self._expct
        out_spec = syn_magn * np.exp(1j * self._sum_phase)
        out = np.fft.irfft(out_spec, n=self.n) * self._win
        return out * (2.0 / (self.n / 2 * self.osamp)) * (self.n / 2)

    def process(self, x: np.ndarray) -> np.ndarray:
        x = np.asarray(x, dtype=np.float64)
        n_in = x.size
        self._in = np.concatenate([self._in, x])
        while self._in.size >= self.n:
            block = self._in[: self.n]
            self._acc += self._frame(block)
            self._ready = np.concatenate([self._ready, self._acc[: self.hop]])
            self._acc = np.concatenate([self._acc[self.hop :], np.zeros(self.hop)])
            self._in = self._in[self.hop :]
        # Emit exactly n_in samples: `latency_samples` of silence first, then audio.
        out = np.zeros(n_in)
        zeros = min(n_in, max(0, self.latency_samples - self._emitted))
        take = min(n_in - zeros, self._ready.size)
        if take:
            out[zeros : zeros + take] = self._ready[:take]
            self._ready = self._ready[take:]
        self._emitted += n_in
        return out.astype(np.float32)

    def flush(self) -> np.ndarray:
        """Return the audio still inside the shifter (call once at end of stream)."""
        return self.process(np.zeros(self.n))[: self.latency_samples]


def pitch_shift(x: np.ndarray, semitones: float, sample_rate: int, fft_size: int = 1024) -> np.ndarray:
    """Offline pitch shift, same length as the input, latency compensated."""
    if x.size == 0 or semitones == 0:
        return np.asarray(x, dtype=np.float32).copy()
    ps = StreamingPitchShifter(semitones, sample_rate, fft_size)
    padded = np.concatenate([x.astype(np.float64), np.zeros(ps.n)])
    y = ps.process(padded)
    return y[ps.latency_samples : ps.latency_samples + x.size].astype(np.float32)
