import dataclasses
import http.client
import io
import json
import wave

import numpy as np
import pytest

from realx.audio import AudioContext, dsp, offline, presets
from realx.audio.stages import extract_audio_mark
from realx.pipeline import Pipeline, PipelineConfigError
from realx.stages import create

SR = 16000


def vowel(f0=120.0, seconds=2.0, sr=SR):
    """A voice-like signal: harmonics of f0 under two formant bumps (700 and 1200 Hz)."""
    t = np.arange(int(sr * seconds)) / sr
    env = lambda f: np.exp(-(((f - 700) / 150) ** 2)) + 0.7 * np.exp(-(((f - 1200) / 200) ** 2))  # noqa: E731
    x = sum(env(f0 * h) * np.sin(2 * np.pi * f0 * h * t) for h in range(1, 40))
    return (x / (2 * np.abs(x).max())).astype(np.float32)


def spectrum(y, sr=SR, skip=0.5):
    y = y[int(sr * skip) :]
    return np.fft.rfftfreq(y.size, 1 / sr), np.abs(np.fft.rfft(y * np.hanning(y.size)))


def centroid(y, sr=SR, limit=3000):
    fr, sp = spectrum(y, sr)
    m = fr < limit
    return float((sp[m] * fr[m]).sum() / sp[m].sum())


def band_db(y, lo, hi, sr=SR):
    fr, sp = spectrum(y, sr)
    m = (fr >= lo) & (fr < hi)
    return 20 * np.log10(np.sqrt((sp[m] ** 2).mean()) + 1e-12)


# --- presets hold effect numbers and nothing that could name a person -----------------
def test_presets_are_plain_effect_settings_and_cannot_carry_a_voice_identity():
    allowed = {"id", "label", "description", "semitones", "formant", "ring_hz", "ring_mix", "band", "drive"}
    assert {f.name for f in dataclasses.fields(presets.VoicePreset)} == allowed  # adding a speaker/model field must be a deliberate change
    assert {"pip", "bear", "imp", "robot", "radio"} <= set(presets.PRESETS)
    for p in presets.PRESETS.values():
        assert p.id.isalpha() and p.id == p.id.lower()
        assert all(isinstance(getattr(p, f), (int, float, str, tuple, type(None))) for f in allowed)
    assert "cannot copy or imitate" in presets.NOTE


def test_unknown_presets_are_refused_with_the_valid_names():
    for bad in ("nobody", "", None, "../etc", "PIP"):
        with pytest.raises(ValueError, match="choose from"):
            presets.get_preset(bad)


# --- the effects do what they say ------------------------------------------------------
def test_formant_control_separates_vocal_tract_size_from_pitch():
    x = vowel()
    follow = dsp.StreamingPitchShifter(6, SR).process(x)  # formants ride with the pitch
    keep = dsp.StreamingPitchShifter(6, SR, formant=1.0).process(x)
    small = dsp.StreamingPitchShifter(6, SR, formant=1.3).process(x)
    base = centroid(x)
    assert centroid(keep) < centroid(follow) - 100  # resonances stayed nearer the original
    assert centroid(keep) < 1.2 * base
    assert centroid(small) > centroid(keep) + 100  # a smaller tract sounds brighter at the same pitch
    assert np.all(np.isfinite(small)) and np.abs(small).max() < 2.0
    with pytest.raises(ValueError):
        dsp.StreamingPitchShifter(0, SR, formant=5.0)


def test_pip_is_higher_and_brighter_bear_is_lower_and_darker():
    x = vowel()
    pip = presets.CharacterVoice(presets.PRESETS["pip"], SR).render(x)
    bear = presets.CharacterVoice(presets.PRESETS["bear"], SR).render(x)
    assert pip.shape == x.shape == bear.shape
    assert centroid(pip) > 1.15 * centroid(x) and centroid(bear) < 0.9 * centroid(x)

    def f0(y):  # autocorrelation pitch: the lag of the strongest repeat between 60 and 500 Hz
        y = y[SR // 2 :] - y[SR // 2 :].mean()
        ac = np.correlate(y, y, "full")[y.size - 1 :]
        lo, hi = SR // 500, SR // 60
        return SR / (lo + int(np.argmax(ac[lo:hi])))

    assert f0(x) == pytest.approx(120, rel=0.03)
    assert f0(pip) == pytest.approx(120 * 2 ** (5 / 12), rel=0.05)
    assert f0(bear) == pytest.approx(120 * 2 ** (-5 / 12), rel=0.05)


def test_robot_adds_ring_modulation_sidebands_and_radio_is_band_limited():
    tone = (0.5 * np.sin(2 * np.pi * 1000 * np.arange(SR * 2) / SR)).astype(np.float32)
    robot = presets.CharacterVoice(
        presets.VoicePreset("test", "t", "t", ring_hz=70.0, ring_mix=1.0), SR
    ).render(tone)
    sidebands = min(band_db(robot, 925, 935), band_db(robot, 1065, 1075))
    assert sidebands - band_db(robot, 995, 1005) > 20  # 1000 +- 70 Hz appear; the original tone is gone
    noise = np.random.default_rng(1).normal(0, 0.1, SR * 2).astype(np.float32)
    radio = presets.CharacterVoice(presets.PRESETS["radio"], SR).render(noise)
    inside = band_db(radio, 800, 2500)
    assert inside - band_db(radio, 20, 150) > 20 and inside - band_db(radio, 5000, 7800) > 20


def test_drive_is_bounded_and_identity_when_off():
    x = np.linspace(-1, 1, 1001).astype(np.float32)
    assert np.array_equal(dsp.soft_clip(x, 0), x)
    y = dsp.soft_clip(x * 5, 3.0)  # even a heavily overdriven input stays inside full scale
    assert np.abs(y).max() <= 1.0 and y[500] == 0.0 and y[-1] > 0.99


@pytest.mark.parametrize("preset_id", list(presets.PRESETS))
def test_streaming_matches_whole_file_and_is_chunk_size_independent(preset_id):
    x = vowel(seconds=1.2)
    preset = presets.PRESETS[preset_id]
    whole = presets.CharacterVoice(preset, SR)
    ref = whole.process(x)
    for chunk in (160, 480, 1024):
        voice = presets.CharacterVoice(preset, SR)
        out = np.concatenate([voice.process(x[i : i + chunk]) for i in range(0, x.size, chunk)])
        assert out.shape == x.shape and np.all(np.isfinite(out))
        assert np.allclose(out, ref, atol=1e-3), (preset_id, chunk)


# --- offline conversion keeps the gate, normalisation and the provenance mark --------
def test_every_preset_renders_with_the_provenance_mark_and_sane_levels():
    x = vowel(seconds=1.0)
    key = bytes(range(1, 33))
    for preset_id in presets.PRESETS:
        samples, pcm = offline.convert(x, SR, preset=preset_id, key=key)
        assert samples.shape == x.shape and np.abs(samples).max() <= 1.0
        assert 0.3 < np.abs(samples).max()  # normalised, not silent
        assert extract_audio_mark(pcm, key=key) == offline.MARK


def test_preset_and_pitch_are_exclusive_and_unknown_presets_fail():
    x = vowel(seconds=0.5)
    with pytest.raises(ValueError, match="not both"):
        offline.convert(x, SR, semitones=3, preset="pip")
    with pytest.raises(ValueError, match="choose from"):
        offline.convert(x, SR, preset="somebody")


# --- consent gate and watermark rules are untouched ----------------------------------
def test_character_voice_needs_no_consent_but_a_real_person_target_still_does():
    with Pipeline([create("voice_character", preset="pip")]) as pipe:
        out = pipe.process(AudioContext(samples=vowel(seconds=0.2), sample_rate=SR))
    assert out.meta["voice_preset"] == "pip" and out.meta["latency_ms"] > 0
    # naming a preset as an identity does not slip past the gate
    with pytest.raises(PipelineConfigError, match="consent gate"):
        Pipeline([create("voice_convert", target="pip"), create("audio_watermark", payload=b"x")])


def test_voice_effects_cannot_follow_the_watermark():
    with pytest.raises(PipelineConfigError, match="after the watermark"):
        Pipeline([create("audio_watermark", payload=b"x"), create("voice_character", preset="pip")])
    Pipeline([create("voice_character", preset="pip"), create("audio_watermark", payload=b"x")])


# --- server and CLI ------------------------------------------------------------------
@pytest.fixture(scope="module")
def server():
    pytest.importorskip("cv2")
    pytest.importorskip("skimage")
    from realx.models import ensure_model
    from realx.server import Engine, Server

    try:
        ensure_model("yunet")
    except Exception as exc:
        pytest.skip(f"yunet model unavailable: {exc}")
    srv = Server(Engine(source="demo:static"), port=0)
    srv.start()
    yield srv
    srv.stop()


def request(server, method, path, body=None):
    c = http.client.HTTPConnection("127.0.0.1", server.port, timeout=20)
    c.request(method, path, body=body, headers={"Host": f"127.0.0.1:{server.port}"})
    r = c.getresponse()
    data = r.read()
    c.close()
    return r.status, data


def test_server_lists_presets_and_converts_with_one(server):
    status, body = request(server, "GET", "/api/voices")
    info = json.loads(body)
    assert status == 200 and {p["id"] for p in info["presets"]} == set(presets.PRESETS) and "imitate" in info["note"]
    safety = json.loads(request(server, "GET", "/api/safety")[1])
    assert "cannot copy" in safety["voices"] and "inswapper_128" in safety["blocked"]
    wav = offline.wav_bytes(vowel(seconds=1.0), SR)
    status, out = request(server, "POST", "/api/voice?preset=robot", wav)
    assert status == 200
    with wave.open(io.BytesIO(out)) as w:
        assert w.getnframes() == SR
    assert request(server, "POST", "/api/voice?preset=somebody", wav)[0] == 400
    assert request(server, "POST", "/api/voice?preset=pip&semitones=3", wav)[0] == 400


def test_cli_lists_and_applies_presets(tmp_path, capsys):
    from realx.audio.wavio import write_wav
    from realx.cli import main

    assert main(["voices"]) == 0
    assert "pip" in capsys.readouterr().out
    src, dst = tmp_path / "a.wav", tmp_path / "b.wav"
    write_wav(str(src), vowel(seconds=0.5), SR)
    assert main(["voice", str(src), str(dst), "--preset", "bear"]) == 0
    assert dst.exists() and "preset 'bear'" in capsys.readouterr().out
    assert main(["voice", str(src), str(dst), "--preset", "nobody"]) == 2
