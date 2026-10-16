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
    if method == "POST" and path.startswith("/api/config"):
        hdrs["Content-Type"] = "application/json"
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


def test_photoface_mode_is_accepted_and_hands_the_camera_to_the_browser(server):
    ok = call(server, "POST", "/api/config", json.dumps({"mode": "photoface"}).encode())
    assert ok[0] == 200 and json.loads(ok[2])["mode"] == "photoface"
    call(server, "POST", "/api/config", json.dumps({"mode": "avatar"}).encode())


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


def test_cross_site_pages_cannot_embed_the_stream_or_read_stats(server):
    for path in ("/stream.mjpg", "/api/stats", "/"):
        status, _, _ = call(server, "GET", path, headers={"Sec-Fetch-Site": "cross-site"})
        assert status == 403, path
    assert call(server, "GET", "/api/stats", headers={"Sec-Fetch-Site": "same-origin"})[0] == 200


def test_page_script_is_external_and_csp_forbids_inline_script(server):
    status, headers, body = call(server, "GET", "/")
    h = {k.lower(): v for k, v in headers}
    assert b"<script src=\"/app.js\"></script>" in body
    assert b"function " not in body.split(b"</style>")[1]  # no inline script left in the markup
    csp = h["content-security-policy"]
    assert "script-src 'self'" in csp and "frame-ancestors 'none'" in csp and "'unsafe-inline'" not in csp.split("style-src")[0]
    assert h["x-frame-options"] == "DENY"
    status, headers, js = call(server, "GET", "/app.js")
    assert status == 200 and b"/api/stats" in js


def test_every_response_has_hardening_headers(server):
    for path in ("/api/stats", "/api/safety", "/nope"):
        _, headers, _ = call(server, "GET", path)
        h = {k.lower(): v for k, v in headers}
        assert h.get("x-content-type-options") == "nosniff", path
        assert h.get("cross-origin-resource-policy") == "same-origin", path


def test_config_requires_json_content_type_and_rejects_chunked(server):
    status, _, _ = call(server, "POST", "/api/config", b"{}", headers={"Content-Type": "text/plain"})
    assert status == 400
    status, _, _ = call(
        server, "POST", "/api/config", b"2\r\n{}\r\n0\r\n\r\n", headers={"Transfer-Encoding": "chunked"}
    )
    assert status == 400


def test_bad_content_length_is_rejected(server):
    status, _, _ = call(server, "POST", "/api/voice?semitones=1", b"", headers={"Content-Length": "abc"})
    assert status == 400


def test_wav_with_hostile_header_values_is_rejected(server):
    import struct

    def wav(rate, channels=1, frames=100):
        data = b"\x00\x00" * channels * frames
        byte_rate = (rate * channels * 2) & 0xFFFFFFFF
        fmt = struct.pack("<HHIIHH", 1, channels, rate, byte_rate, channels * 2, 16)
        return (
            b"RIFF" + struct.pack("<I", 36 + len(data)) + b"WAVEfmt " + struct.pack("<I", 16) + fmt
            + b"data" + struct.pack("<I", len(data)) + data
        )

    for body in (wav(1), wav(4_000_000_000), wav(16000, channels=6), b"RIFF\x00\x00"):
        assert call(server, "POST", "/api/voice?semitones=1", body)[0] == 400


def test_config_updates_do_not_lose_each_other_under_concurrency(server):
    import threading

    def post(payload):
        call(server, "POST", "/api/config", json.dumps(payload).encode())

    threads = [threading.Thread(target=post, args=({"mode": "boxes"},)), threading.Thread(target=post, args=({"smoothing": 0.9},))]
    [t.start() for t in threads]
    [t.join() for t in threads]
    cfg = server.engine.config()
    assert cfg["mode"] == "boxes" and cfg["smoothing"] == 0.9
    call(server, "POST", "/api/config", json.dumps({"mode": "avatar", "smoothing": 0.35}).encode())
