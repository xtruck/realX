"""`realx voice` input errors are one clean line."""

import wave

from realx import cli


def _expect_clean_voice_error(argv, capsys):
    assert cli.main(argv) == 2
    err = capsys.readouterr().err.strip()
    assert err and len(err.splitlines()) == 1 and "Traceback" not in err


def test_voice_missing_file_is_a_one_line_error(tmp_path, capsys):
    _expect_clean_voice_error(["voice", str(tmp_path / "nope.wav"), str(tmp_path / "o.wav")], capsys)


def test_voice_24_bit_wav_is_a_one_line_error(tmp_path, capsys):
    p = tmp_path / "w24.wav"
    with wave.open(str(p), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(3)
        w.setframerate(16000)
        w.writeframes(b"\x00\x00\x00" * 1600)
    _expect_clean_voice_error(["voice", str(p), str(tmp_path / "o.wav")], capsys)


def test_voice_non_wav_is_a_one_line_error(tmp_path, capsys):
    p = tmp_path / "garbage.wav"
    p.write_bytes(b"this is not a wav file at all")
    _expect_clean_voice_error(["voice", str(p), str(tmp_path / "o.wav")], capsys)
