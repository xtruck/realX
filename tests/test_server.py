import http.client
import json
import time

import numpy as np
import pytest

from realx.audio import offline
from realx.audio.stages import extract_audio_mark
from realx.models import ensure_model


@pytest.fixture(scope="module")
def server():
    try:
        ensure_model("yunet")
    except Exception as exc:
        pytest.skip(f"yunet model unavailable: {exc}")
    pytest.importorskip("cv2")
    pytest.importorskip("skimage")
    from realx.server import Engine, Server

    srv = Server(Engine(source="demo:dance"), port=0)
    srv.start()
    deadline = time.time() + 20
    while time.time() < deadline and srv.engine.stats()["frames"] < 5:
        time.sleep(0.1)
    yield srv
    srv.stop()


def call(server, method, path, body=None, headers=None, host=None):
    conn = http.client.HTTPConnection("127.0.0.1", server.port, timeout=15)
    hdrs = {"Host": host or f"127.0.0.1:{server.port}"}
    hdrs.update(headers or {})
    conn.request(method, path, body=body, headers=hdrs)
    resp = conn.getresponse()
    data = resp.read()
    conn.close()
    return resp.status, resp.getheaders(), data


def test_page_is_served_with_security_headers(server):
    status, headers, body = call(server, "GET", "/")
    h = {k.lower(): v for k, v in headers}
    assert status == 200 and b"realX control room" in body
    assert "content-security-policy" in h and h["x-content-type-options"] == "nosniff"


def test_pipeline_is_actually_running_and_reports_stats(server):
    status, _, body = call(server, "GET", "/api/stats")
    s = json.loads(body)
    assert status == 200 and s["frames"] >= 5 and s["fps"] > 1
    assert s["faces"] >= 1, "the demo face should be tracked"
    assert len(s["ribbon"]) > 0 and set(s["ribbon"]) <= {0, 1, 2}


def test_stream_delivers_real_jpeg_frames(server):
    conn = http.client.HTTPConnection("127.0.0.1", server.port, timeout=15)
    conn.request("GET", "/stream.mjpg", headers={"Host": f"127.0.0.1:{server.port}"})
    resp = conn.getresponse()
    assert resp.status == 200 and "multipart/x-mixed-replace" in resp.getheader("Content-Type")
    chunk = resp.read(40000)
    conn.close()
    assert b"--frame" in chunk and b"\xff\xd8" in chunk  # JPEG start marker


def test_config_updates_apply_and_validate(server):
    ok = call(server, "POST", "/api/config", json.dumps({"mode": "boxes", "smoothing": 0.8}).encode())
    assert ok[0] == 200 and json.loads(ok[2])["mode"] == "boxes"
    time.sleep(0.6)
    assert server.engine.config()["smoothing"] == 0.8
    for bad in ({"mode": "nope"}, {"smoothing": 5}, {"smoothing": True}, {"source": "file:C:/x"}, {"hack": 1}):
        status, _, _ = call(server, "POST", "/api/config", json.dumps(bad).encode())
        assert status == 400, bad
    assert call(server, "POST", "/api/config", b"not json")[0] == 400
    call(server, "POST", "/api/config", json.dumps({"mode": "avatar", "smoothing": 0.35}).encode())


def test_rebinding_and_cross_origin_requests_are_rejected(server):
    assert call(server, "GET", "/api/stats", host="evil.example")[0] == 403
    status, _, _ = call(
        server, "POST", "/api/config", b"{}", headers={"Origin": "http://evil.example"}
    )
    assert status == 403


def test_oversized_json_is_rejected(server):
    assert call(server, "POST", "/api/config", b"{" + b" " * 5000 + b"}")[0] == 400


def test_voice_endpoint_converts_and_marks_output(server):
    status, headers, body = call(server, "POST", "/api/voice?semitones=5&demo=1", b"")
    assert status == 200 and body[:4] == b"RIFF"
    samples, rate = offline.read_wav_bytes(body)
    assert rate == 16000 and samples.size == 32000
    pcm = (samples * 32768).round().astype("<i2")
    assert extract_audio_mark(pcm) == offline.MARK


def test_voice_endpoint_rejects_bad_input(server):
    assert call(server, "POST", "/api/voice?semitones=5", b"not a wav")[0] == 400
    assert call(server, "POST", "/api/voice?semitones=99&demo=1", b"")[0] == 400


def test_safety_endpoint_lists_blocked_models(server):
    status, _, body = call(server, "GET", "/api/safety")
    s = json.loads(body)
    assert status == 200 and "inswapper_128" in s["blocked"]
    assert s["models"]["yunet"]["commercial_ok"] is True


def test_unknown_route_is_404(server):
    assert call(server, "GET", "/etc/passwd")[0] == 404
