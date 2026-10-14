import numpy as np
import pytest

from realx.audio import AudioContext, dsp
from realx.audio.stages import extract_audio_mark
from realx.audio.wavio import read_wav, write_wav
from realx.pipeline import Pipeline, PipelineConfigError
from realx.safety import ConsentError, ConsentStore
from realx.stages import create

KEY = bytes(range(1, 33))
SR = 16000


def tone(freq, seconds=1.0, sr=SR, amp=0.5):
    t = np.arange(int(seconds * sr)) / sr
    return (amp * np.sin(2 * np.pi * freq * t)).astype(np.float32)


def peak_hz(x, sr=SR):
    window = np.hanning(x.size)
    spec = np.abs(np.fft.rfft(x * window))
    return float(np.argmax(spec)) * sr / x.size


# --- pitch shifting ---------------------------------------------------------------
@pytest.mark.parametrize("semitones,expected", [(12, 880.0), (-12, 220.0), (7, 440 * 2 ** (7 / 12))])
def test_pitch_shift_moves_frequency_and_keeps_length(semitones, expected):
    x = tone(440, 1.0)
    y = dsp.pitch_shift(x, semitones, SR)
    assert y.shape == x.shape
    body = y[SR // 4 : -SR // 4]
    assert peak_hz(body) == pytest.approx(expected, rel=0.03)


def test_pitch_shift_zero_is_identity_and_output_is_not_silent_or_clipped():
    x = tone(300)
    assert np.array_equal(dsp.pitch_shift(x, 0, SR), x)
    y = dsp.pitch_shift(x, 5, SR)
    assert 0.2 < float(np.max(np.abs(y))) < 1.2


def test_streaming_matches_offline_regardless_of_chunk_size():
    x = tone(440, 1.0) * np.hanning(SR) ** 0.1
    ref = dsp.StreamingPitchShifter(4, SR).process(x)
    for chunk in (160, 333, 1024):
        ps = dsp.StreamingPitchShifter(4, SR)
        out = np.concatenate([ps.process(x[i : i + chunk]) for i in range(0, x.size, chunk)])
        assert out.shape == x.shape
        assert np.allclose(out, ref, atol=1e-4)


def test_streaming_output_is_continuous_without_clicks():
    x = tone(220, 1.0)
    ps = dsp.StreamingPitchShifter(3, SR)
    out = np.concatenate([ps.process(x[i : i + 480]) for i in range(0, x.size, 480)])
    steady = out[SR // 4 :]
    assert float(np.max(np.abs(np.diff(steady)))) < 0.35  # no discontinuities at chunk edges


def test_pitch_shift_has_unity_gain():
    x = tone(440, 1.0, amp=0.5)
    ps = dsp.StreamingPitchShifter(0.0, SR)
    y = ps.process(np.concatenate([x, np.zeros(ps.n, np.float32)]))
    body = y[ps.latency_samples + 2000 : ps.latency_samples + 12000]
    ratio = np.sqrt(np.mean(body**2)) / np.sqrt(np.mean(x**2))
    assert ratio == pytest.approx(1.0, abs=0.05)


def test_pitch_shifter_survives_nan_samples_and_rejects_2d():
    ps = dsp.StreamingPitchShifter(3, SR)
    bad = tone(300, 0.2)
    bad[100] = np.nan
    bad[200] = np.inf
    ps.process(bad)
    out = ps.process(tone(300, 0.5))
    assert np.all(np.isfinite(out)) and float(np.max(np.abs(out))) > 0.05
    with pytest.raises(ValueError):
        ps.process(np.zeros((2, 10)))


def test_streaming_gate_keeps_state_across_chunks_so_speech_is_not_chopped():
    speech = tone(300, 1.0, amp=0.4)
    whole = dsp.noise_gate(speech, SR, threshold_db=-40)
    gate = dsp.NoiseGate(SR, threshold_db=-40)
    chunked = np.concatenate([gate.process(speech[i : i + 160]) for i in range(0, speech.size, 160)])
    steady = slice(SR // 4, -SR // 4)
    assert dsp.rms_db(chunked[steady]) > dsp.rms_db(speech[steady]) - 1.0
    assert abs(dsp.rms_db(chunked[steady]) - dsp.rms_db(whole[steady])) < 1.0


def test_normalize_does_not_amplify_near_silence():
    hiss = (np.random.default_rng(1).normal(0, 1e-4, 4000)).astype(np.float32)
    assert float(np.max(np.abs(dsp.normalize_peak(hiss, -3)))) < 1e-3


def test_pitch_shifter_validates_arguments():
    with pytest.raises(ValueError):
        dsp.StreamingPitchShifter(float("nan"), SR)
    with pytest.raises(ValueError):
        dsp.StreamingPitchShifter(2, SR, oversample=3)
    with pytest.raises(ValueError):
        dsp.StreamingPitchShifter(2, 0)
    with pytest.raises(ValueError):
        dsp.StreamingPitchShifter(30, SR)
    with pytest.raises(ValueError):
        dsp.StreamingPitchShifter(2, SR, fft_size=1000)


# --- gate / normalize / delay / resample --------------------------------------------
def test_noise_gate_silences_hiss_but_keeps_speech():
    rng = np.random.default_rng(0)
    hiss = (rng.normal(0, 0.002, SR)).astype(np.float32)  # about -54 dB
    speech = tone(300, 1.0, amp=0.4)
    x = np.concatenate([hiss, speech, hiss])
    y = dsp.noise_gate(x, SR, threshold_db=-40)
    assert dsp.rms_db(y[: SR // 2]) < dsp.rms_db(x[: SR // 2]) - 20
    assert dsp.rms_db(y[SR + SR // 4 : 2 * SR - SR // 4]) > dsp.rms_db(speech) - 1.5


def test_normalize_peak_and_silence_safe():
    y = dsp.normalize_peak(tone(200, amp=0.1), target_db=-6)
    assert float(np.max(np.abs(y))) == pytest.approx(10 ** (-6 / 20), rel=0.01)
    assert np.all(dsp.normalize_peak(np.zeros(100, np.float32)) == 0)


def test_audio_delay_is_exact_and_adjustable():
    d = dsp.AudioDelay(10, SR)  # 160 samples
    x = np.arange(1, 1001, dtype=np.float32)
    y = np.concatenate([d.process(x[:400]), d.process(x[400:])])
    assert d.delay_samples == 160
    assert np.all(y[:160] == 0) and y[160] == 1.0 and y.size == x.size
    d.set_delay_ms(0)
    assert d.delay_samples == 0


def test_resample_changes_length_proportionally():
    assert dsp.resample(tone(440), 16000, 8000).size == 8000
    assert dsp.resample(tone(440), 16000, 16000).size == 16000


def test_audio_context_validates():
    with pytest.raises(ValueError):
        AudioContext(samples=np.zeros((2, 2)))
    with pytest.raises(ValueError):
        AudioContext(samples=np.array([np.nan, 0.0]))
    with pytest.raises(ValueError):
        AudioContext(samples=np.zeros(4), sample_rate=0)


# --- wav i/o ---------------------------------------------------------------------------
def test_wav_roundtrip(tmp_path):
    path = str(tmp_path / "a.wav")
    x = tone(440, 0.25)
    write_wav(path, x, SR)
    y, rate = read_wav(path)
    assert rate == SR and y.shape == x.shape
    assert np.max(np.abs(x - y)) < 1e-3


# --- consent and watermark for voice conversion ----------------------------------------
def _voice_chain(store, record, target="alice", key=None):
    return Pipeline(
        [
            create("consent_gate", store=store, record=record),
            create("voice_convert", target=target),
            create("audio_watermark", payload=b"realx|voice", key=key),
        ]
    )


def test_voice_convert_cannot_be_built_without_gate_or_watermark():
    st = ConsentStore(KEY)
    rec = st.issue("alice", "live", 60)
    with pytest.raises(PipelineConfigError):
        Pipeline([create("voice_convert", target="alice"), create("audio_watermark", payload=b"x")])
    with pytest.raises(PipelineConfigError):
        Pipeline([create("consent_gate", store=st, record=rec), create("voice_convert", target="alice")])


def test_voice_convert_runs_with_consent_and_marks_output():
    st = ConsentStore(KEY)
    rec = st.issue("alice", "live", 60)
    with _voice_chain(st, rec, key=KEY) as pipe:
        out = pipe.process(AudioContext(samples=tone(200, 0.5)))
    assert out.meta["voice_target"] == "alice"
    assert extract_audio_mark(out.meta["pcm16"], key=KEY) == b"realx|voice"
    assert extract_audio_mark(out.meta["pcm16"], key=bytes(range(40, 72))) is None


def test_voice_backend_state_is_per_stream_not_shared():
    from realx.audio.stages import PitchMorphBackend, register_voice_backend

    register_voice_backend(type("Morph5", (PitchMorphBackend,), {"name": "morph5"})({"alice": 5.0}))
    st = ConsentStore(KEY)
    x = tone(220, 0.5)

    def make_pipeline():
        rec = st.issue("alice", "live", 60)
        return Pipeline(
            [
                create("consent_gate", store=st, record=rec),
                create("voice_convert", target="alice", backend="morph5"),
                create("audio_watermark", payload=b"x"),
            ]
        )

    chunks = [x[i : i + 2048] for i in range(0, x.size, 2048)]
    p1, p2 = make_pipeline(), make_pipeline()
    with p1, p2:
        first_out = p1.process(AudioContext(samples=chunks[0]))
        for c in chunks[1:]:  # stream one keeps running and builds up internal state
            p1.process(AudioContext(samples=c))
        second_out = p2.process(AudioContext(samples=chunks[0]))  # a brand new stream
    assert np.allclose(first_out.samples, second_out.samples, atol=2e-4), (
        "a new stream inherited another stream's converter state"
    )
    assert second_out.meta["latency_ms"] == pytest.approx(1000.0 * 1024 / SR, rel=0.01)
    # restarting the same pipeline also begins from a clean stream
    with p1:
        restarted = p1.process(AudioContext(samples=chunks[0]))
    assert np.allclose(first_out.samples, restarted.samples, atol=2e-4)


def test_voice_conversion_refuses_a_different_identity():
    st = ConsentStore(KEY)
    rec = st.issue("alice", "live", 60)
    with _voice_chain(st, rec, target="victim") as pipe:
        with pytest.raises(ConsentError):
            pipe.process(AudioContext(samples=tone(200, 0.5)))


def test_watermark_needs_enough_samples():
    st = ConsentStore(KEY)
    rec = st.issue("alice", "live", 60)
    with _voice_chain(st, rec) as pipe:
        with pytest.raises(ValueError):
            pipe.process(AudioContext(samples=np.zeros(10, np.float32)))


def test_full_voice_chain_gate_normalize_pitch_runs_chunked():
    stages = [create("voice_gate"), create("voice_normalize"), create("voice_pitch", semitones=4)]
    x = tone(250, 1.0)
    outs = []
    with Pipeline(stages) as pipe:
        for i in range(0, x.size, 640):
            outs.append(pipe.process(AudioContext(samples=x[i : i + 640], index=i)).samples)
    y = np.concatenate(outs)
    assert y.size == x.size
    assert peak_hz(y[SR // 4 : -SR // 8]) == pytest.approx(250 * 2 ** (4 / 12), rel=0.04)
