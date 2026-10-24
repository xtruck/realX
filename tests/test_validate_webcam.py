"""scripts/validate_webcam.py: reads numbers from a running server; never opens a camera, never leaves this computer."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "validate_webcam.py"
spec = importlib.util.spec_from_file_location("validate_webcam", SCRIPT)
vw = importlib.util.module_from_spec(spec)
spec.loader.exec_module(vw)

TOKEN = "super-secret-token-value-123"


def stats(i: int, session="live", faces=1, code=None) -> dict:
    return {
        "fps": 20.0 + i, "latency_ms": 40.0, "faces": faces, "dropped": i, "frames": 100 * i, "session": session,
        "error_info": {"code": code} if code else None,
        "diag": {"cpu_percent": 30.0, "rss_mb": 500.0 + i, "frame_age_ms": {"p95": 50.0 + i}, "source_outages": 0},
    }


def test_only_this_computer_is_accepted():
    assert vw.check_url("http://127.0.0.1:8765") == "http://127.0.0.1:8765"
    assert vw.check_url("http://localhost:9000/x") == "http://localhost:9000"
    for bad in ("http://example.com:8765", "https://127.0.0.1:8765", "http://127.0.0.1", "http://192.168.1.5:8765"):
        with pytest.raises(ValueError):
            vw.check_url(bad)


def test_the_script_cannot_open_a_camera():
    code = SCRIPT.read_text(encoding="utf-8").split('"""', 2)[2]  # everything after the docstring
    for needle in ("cv2", "VideoCapture", "getUserMedia", "play" + "wright", "pyvirtualcam", "subprocess", "socket"):
        assert needle not in code, needle


def test_odd_values_become_none_not_errors():
    row = vw.pick({"fps": "fast", "faces": True, "diag": "no", "error_info": 3, "session": 5})
    assert all(v is None for v in row.values())
    assert vw.pick({"fps": float("nan")})["fps"] is None


def test_summary_numbers():
    rows = [vw.pick(stats(i, faces=0 if i == 3 else 1)) for i in range(10)]
    rows[9] = vw.pick(stats(9, session="reconnecting", code="camera_stalled"))
    s = vw.summarize(rows)
    assert s["seconds_sampled"] == 10 and s["seconds_live"] == 9
    assert s["session_seconds"] == {"live": 9, "reconnecting": 1}
    assert s["error_code_seconds"] == {"camera_stalled": 1}
    assert s["face_found_share"] == 0.9
    assert s["frames_total"] == 900 and s["dropped_total"] == 9
    assert s["rss_mb"]["growth"] == 9.0
    assert s["fps"]["min"] == 20.0


def test_an_empty_run_is_described_not_crashed():
    s = vw.summarize([])
    assert s["seconds_sampled"] == 0 and s["fps"]["median"] is None and s["face_found_share"] is None
    assert vw.format_table({"summary": s})


def test_main_records_and_never_prints_the_token(monkeypatch, tmp_path, capsys):
    monkeypatch.setenv("REALX_TOKEN", TOKEN)
    calls = iter(range(100))
    out = tmp_path / "n.json"
    rc = vw.main(["--seconds", "5", "--json", str(out)], fetcher=lambda base, token: stats(next(calls)), sleep=lambda s: None)
    assert rc == 0
    assert TOKEN not in capsys.readouterr().out and TOKEN not in out.read_text(encoding="utf-8")
    doc = json.loads(out.read_text(encoding="utf-8"))
    assert doc["schema"] == vw.SCHEMA and len(doc["samples"]) == 5


def test_main_refuses_without_a_token_or_for_another_host(monkeypatch):
    monkeypatch.delenv("REALX_TOKEN", raising=False)
    assert vw.main(["--seconds", "1"], fetcher=lambda *a: {}, sleep=lambda s: None) == 2
    monkeypatch.setenv("REALX_TOKEN", "x" * 20)
    assert vw.main(["--url", "http://example.com:8765"], fetcher=lambda *a: {}, sleep=lambda s: None) == 2
    assert vw.main(["--seconds", "0"], fetcher=lambda *a: {}, sleep=lambda s: None) == 2


def test_a_server_that_never_answers_is_reported(monkeypatch):
    monkeypatch.setenv("REALX_TOKEN", "x" * 20)

    def down(base, token):
        raise OSError("refused")

    assert vw.main(["--seconds", "3"], fetcher=down, sleep=lambda s: None) == 1


def test_per_minute_rows_show_a_slow_leak():
    rows = [vw.pick(stats(i)) for i in range(130)]  # memory grows by 1 MB a second in the fake data
    minutes = vw.per_minute(rows)
    assert [m["minute"] for m in minutes] == [1, 2, 3]
    assert [m["samples"] for m in minutes] == [60, 60, 10]
    assert minutes[0]["rss_mb_last"] == 559.0 and minutes[1]["rss_mb_last"] == 619.0
    assert minutes[0]["dropped_in_minute"] == 59 and minutes[0]["sessions"] == ["live"]
    assert "min | fps" in vw.format_minutes(minutes)


def test_per_minute_handles_gaps_and_empty_input():
    assert vw.per_minute([]) == []
    sparse = vw.per_minute([vw.pick({}) for _ in range(5)])
    assert sparse[0]["fps_median"] is None and sparse[0]["rss_mb_last"] is None and sparse[0]["dropped_in_minute"] is None


def test_main_prints_and_saves_the_minutes_only_when_asked(monkeypatch, tmp_path, capsys):
    monkeypatch.setenv("REALX_TOKEN", TOKEN)
    calls = iter(range(1000))
    fetch = lambda base, token: stats(next(calls))  # noqa: E731
    out = tmp_path / "a.json"
    assert vw.main(["--seconds", "70", "--json", str(out)], fetcher=fetch, sleep=lambda s: None) == 0
    assert "min | fps" not in capsys.readouterr().out and "per_minute" not in json.loads(out.read_text(encoding="utf-8"))
    out2 = tmp_path / "b.json"
    assert vw.main(["--seconds", "70", "--per-minute", "--json", str(out2)], fetcher=fetch, sleep=lambda s: None) == 0
    assert "min | fps" in capsys.readouterr().out and len(json.loads(out2.read_text(encoding="utf-8"))["per_minute"]) == 2
