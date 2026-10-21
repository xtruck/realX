"""F1 server fixes: stream slot release, head deadline, GET error handling, port exclusivity, Dedup lock."""

from __future__ import annotations

import socket
import threading
import time

import pytest

from realx.server import Engine, Server

pytestmark = pytest.mark.raw_http

TOKEN = "f1-server-token-abcdef0123456789"


def _slots(s: Server) -> int:
    return s._httpd._slots._value  # free connection slots


def _wait(cond, secs: float) -> bool:
    end = time.monotonic() + secs
    while time.monotonic() < end:
        if cond():
            return True
        time.sleep(0.05)
    return cond()


def _open_stream(s: Server) -> socket.socket:
    c = socket.create_connection(("127.0.0.1", s.port), timeout=5)
    c.sendall(
        f"GET /stream.mjpg HTTP/1.1\r\nHost: 127.0.0.1:{s.port}\r\nAuthorization: Bearer {TOKEN}\r\n\r\n".encode()
    )
    assert b"200" in c.recv(256).split(b"\r\n")[0]
    return c


def test_stream_slot_is_released_in_a_mode_without_jpeg():
    s = Server(Engine(mode="body"), port=0, token=TOKEN)  # body mode: no JPEG is ever produced
    s.start()
    try:
        before = _slots(s)
        conns = [_open_stream(s) for _ in range(3)]
        assert _wait(lambda: _slots(s) == before - 3, 3)
        for c in conns:
            c.close()
        assert _wait(lambda: _slots(s) == before, 8), "the stream threads kept their connection slots"
    finally:
        s.stop()


def test_slow_trickle_head_is_cut_by_a_total_deadline(monkeypatch):
    import realx.server as server_mod

    monkeypatch.setattr(server_mod, "HEAD_DEADLINE", 1.0)
    s = Server(Engine(mode="body"), port=0, token=TOKEN)
    s.start()
    try:
        before = _slots(s)
        c = socket.create_connection(("127.0.0.1", s.port), timeout=5)
        c.sendall(b"GET /api/stats HTTP/1.1\r\n")
        assert _wait(lambda: _slots(s) == before - 1, 2)
        closed = False
        end = time.monotonic() + 5
        while time.monotonic() < end:  # one byte every 0.25 s never trips the per-recv timeout
            try:
                c.sendall(b"X")
            except OSError:
                closed = True
                break
            time.sleep(0.25)
        assert closed, "the trickling socket was never cut"
        c.close()
        assert _wait(lambda: _slots(s) == before, 3)
    finally:
        s.stop()
