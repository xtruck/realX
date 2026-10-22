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


def test_raising_get_route_returns_json_500_and_no_stderr_traceback(capfd, monkeypatch):
    eng = Engine(mode="body")
    s = Server(eng, port=0, token=TOKEN)
    s.start()
    try:
        def boom():
            raise RuntimeError("secret-internal-detail")

        monkeypatch.setattr(eng, "stats", boom)
        c = socket.create_connection(("127.0.0.1", s.port), timeout=5)
        c.sendall(f"GET /api/stats HTTP/1.1\r\nHost: 127.0.0.1:{s.port}\r\nAuthorization: Bearer {TOKEN}\r\n\r\n".encode())
        data = b""
        while chunk := c.recv(4096):
            data += chunk
        c.close()
        assert data.startswith(b"HTTP/1.0 500") or data.startswith(b"HTTP/1.1 500")
        assert b"internal error" in data and b"secret-internal-detail" not in data
    finally:
        s.stop()
    assert "Traceback" not in capfd.readouterr().err


def test_client_reset_on_a_get_is_quiet(capfd):
    import struct

    s = Server(Engine(mode="body"), port=0, token=TOKEN)
    s.start()
    try:
        for _ in range(3):
            c = socket.create_connection(("127.0.0.1", s.port), timeout=5)
            c.sendall(f"GET /app.js HTTP/1.1\r\nHost: 127.0.0.1:{s.port}\r\nAuthorization: Bearer {TOKEN}\r\n\r\n".encode())
            c.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER, struct.pack("ii", 1, 0))
            c.close()  # RST
        time.sleep(0.5)
    finally:
        s.stop()
    assert "Traceback" not in capfd.readouterr().err


def test_second_server_cannot_bind_a_port_already_held():
    a = Server(Engine(mode="body"), port=0, token=TOKEN)
    a.start()
    try:
        with pytest.raises(OSError):
            Server(Engine(mode="body"), port=a.port, token="other-token-0123456789abcdef")
    finally:
        a.stop()


def test_dedup_is_thread_safe():
    from realx.log import Dedup

    d = Dedup(every_s=1000.0)
    errors: list[BaseException] = []

    def work(base: int) -> None:
        try:
            for i in range(20000):
                d.first((base, i))
        except BaseException as exc:  # noqa: BLE001
            errors.append(exc)

    threads = [threading.Thread(target=work, args=(b,)) for b in range(4)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert not errors, errors[:1]


# --- an oversized body must still get its 400, not a connection reset --------------------------------------------------


@pytest.mark.parametrize("size", [5000, 40_000, 60_000])
def test_oversized_json_gets_a_clean_400_every_time(size):
    """Closing a socket that still holds unread request bytes makes the OS send a reset, and a client can then lose the reply.
    The size check used to mark the body as taken before it refused it, so `_drain` skipped it (flaky on Windows)."""
    s = Server(Engine(mode="body"), port=0, token=TOKEN)
    s.start()
    try:
        body = b"{" + b" " * size + b"}"
        for _ in range(25):
            c = socket.create_connection(("127.0.0.1", s.port), timeout=5)
            try:
                c.sendall(
                    (f"POST /api/config HTTP/1.1\r\nHost: 127.0.0.1:{s.port}\r\nAuthorization: Bearer {TOKEN}\r\n"
                     f"Content-Type: application/json\r\nContent-Length: {len(body)}\r\n\r\n").encode() + body)
                data = b""
                while b"\r\n\r\n" not in data:
                    chunk = c.recv(4096)
                    assert chunk, "the server closed without answering"
                    data += chunk
                assert data.split(b"\r\n")[0].split()[1] == b"400", data[:80]
                # the server closes after the reply; with the body drained that is a clean end, not a reset
                end = time.monotonic() + 3
                while time.monotonic() < end:
                    if not c.recv(4096):
                        break
            finally:
                c.close()
    finally:
        s.stop()


def test_a_refused_oversized_body_is_read_before_the_reply():
    """Deterministic form of the above: the server drains the (bounded) body first, so with half the body sent it has not answered yet,
    and it answers 400 as soon as the rest arrives. Before the fix it answered at once and left the bytes unread."""
    s = Server(Engine(mode="body"), port=0, token=TOKEN)
    s.start()
    try:
        body = b"{" + b" " * 20_000 + b"}"
        c = socket.create_connection(("127.0.0.1", s.port), timeout=5)
        try:
            c.sendall((f"POST /api/config HTTP/1.1\r\nHost: 127.0.0.1:{s.port}\r\nAuthorization: Bearer {TOKEN}\r\n"
                       f"Content-Type: application/json\r\nContent-Length: {len(body)}\r\n\r\n").encode() + body[:10_000])
            c.settimeout(0.8)
            with pytest.raises(socket.timeout):
                c.recv(4096)  # nothing yet: the server is still reading the body it is about to refuse
            c.settimeout(5)
            c.sendall(body[10_000:])
            data = b""
            while b"\r\n\r\n" not in data:
                chunk = c.recv(4096)
                assert chunk
                data += chunk
            assert data.split(b"\r\n")[0].split()[1] == b"400"
        finally:
            c.close()
    finally:
        s.stop()
