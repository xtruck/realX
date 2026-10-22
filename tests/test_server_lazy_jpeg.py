"""Speed: the engine encodes a JPEG only while someone is watching /stream.mjpg (audit finding B1-05).

The preview used to be encoded on every frame, on the engine thread, even with no viewer (17.6 ms at 720p, 34 ms at 1080p).
"""

from __future__ import annotations

import socket
import threading
import time

import pytest

from realx.models import ensure_model
from realx.server import Engine, Server

pytestmark = pytest.mark.raw_http

TOKEN = "lazy-jpeg-token-abcdef0123456789"


def _wait(cond, secs: float) -> bool:
    end = time.monotonic() + secs
    while time.monotonic() < end:
        if cond():
            return True
        time.sleep(0.05)
    return cond()


@pytest.fixture
def counted_server(monkeypatch):
    cv2 = pytest.importorskip("cv2")
    pytest.importorskip("skimage")
    try:
        ensure_model("yunet")
    except Exception as exc:  # the detector model is needed to produce frames at all
        pytest.skip(f"yunet model unavailable: {exc}")
    calls = {"jpg": 0}
    lock = threading.Lock()
    real = cv2.imencode

    def counting(ext, *args, **kwargs):
        if ext == ".jpg":
            with lock:
                calls["jpg"] += 1
        return real(ext, *args, **kwargs)

    monkeypatch.setattr(cv2, "imencode", counting)
    s = Server(Engine(source="demo:static"), port=0, token=TOKEN)
    s.start()
    try:
        assert _wait(lambda: s.engine.stats()["frames"] >= 5, 30), "the engine produced no frames"
        yield s, calls
    finally:
        s.stop()


def _open_stream(s: Server) -> socket.socket:
    c = socket.create_connection(("127.0.0.1", s.port), timeout=5)
    c.sendall(f"GET /stream.mjpg HTTP/1.1\r\nHost: 127.0.0.1:{s.port}\r\nAuthorization: Bearer {TOKEN}\r\n\r\n".encode())
    assert b"200" in c.recv(256).split(b"\r\n")[0]
    return c


def test_no_jpeg_is_encoded_while_nobody_watches(counted_server):
    s, calls = counted_server
    before = calls["jpg"]
    frames_before = s.engine.stats()["frames"]
    assert _wait(lambda: s.engine.stats()["frames"] >= frames_before + 10, 20), "the engine stopped producing frames"
    assert calls["jpg"] == before, "frames were JPEG-encoded with no stream viewer"


def test_encoding_starts_with_a_viewer_and_stops_after_it_leaves(counted_server):
    s, calls = counted_server
    conn = _open_stream(s)
    try:
        start = calls["jpg"]
        assert _wait(lambda: calls["jpg"] >= start + 5, 20), "no JPEG was encoded for a connected viewer"
        data = b""
        end = time.monotonic() + 15
        while b"\xff\xd8" not in data and time.monotonic() < end:  # a real JPEG reaches the client
            data += conn.recv(65536)
        assert b"--frame" in data and b"\xff\xd8" in data
    finally:
        conn.close()
    assert _wait(lambda: s.engine._stream_viewers == 0, 10), "the viewer count did not go back to zero"
    settled = calls["jpg"]
    frames_after = s.engine.stats()["frames"]
    assert _wait(lambda: s.engine.stats()["frames"] >= frames_after + 10, 20)
    assert calls["jpg"] <= settled + 1, "encoding went on after the last viewer left"
