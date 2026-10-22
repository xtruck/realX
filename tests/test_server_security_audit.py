"""A7 security review: regression tests for gaps found against a hostile page on the same PC."""

from __future__ import annotations

import http.client
import socket

import pytest

from realx.server import Engine, Server

pytestmark = pytest.mark.raw_http

TOKEN = "audit-a7-token-abcdef0123456789"
COOKIE = {"Cookie": f"realx_token={TOKEN}"}


@pytest.fixture(scope="module")
def srv():
    s = Server(Engine(source="demo:static", mode="original"), port=0, token=TOKEN)
    s.start()
    yield s
    s.stop()


def req(srv, method, path, headers=None, body=None, host=None):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
    h = {"Host": host or f"127.0.0.1:{srv.port}"}
    h.update(headers or {})
    c.request(method, path, body=body, headers=h)
    r = c.getresponse()
    data = r.read(65536)
    out = (r.status, {k.lower(): v for k, v in r.getheaders()}, data)
    c.close()
    return out


@pytest.mark.parametrize("method", ["HEAD", "OPTIONS", "PUT", "DELETE", "PATCH", "TRACE", "CONNECT", "FOO"])
@pytest.mark.parametrize("auth", [{}, COOKIE, {"Authorization": f"Bearer {TOKEN}"}])
def test_other_methods_never_serve_anything(srv, method, auth):
    status, headers, body = req(srv, method, "/api/stats", auth)
    assert status in (401, 403, 405, 501)
    assert b"fps" not in body and TOKEN.encode() not in body


def test_get_with_a_foreign_origin_is_refused_even_with_the_cookie(srv):
    assert req(srv, "GET", "/api/stats", COOKIE)[0] == 200
    for origin in ("http://evil.example", "null", f"http://127.0.0.1.evil.example:{srv.port}"):
        assert req(srv, "GET", "/api/stats", {**COOKIE, "Origin": origin})[0] == 403, origin


@pytest.mark.parametrize("host", ["evil.example", "127.0.0.1", "localhost", "127.0.0.1.evil.example", "[::1]", "x"])
def test_rebinding_hosts_are_refused_on_every_method(srv, host):
    assert req(srv, "GET", "/api/stats", COOKIE, host=host)[0] == 403
    assert req(srv, "POST", "/api/config", {**COOKIE, "Content-Type": "application/json"}, b"{}", host=host)[0] == 403


@pytest.mark.parametrize(
    "path",
    ["/mp/wasm/..%2f..%2fserver.py", r"/mp/wasm/..\..\server.py", "/mp/wasm/%2e%2e/server.py", "/mp/models/..%2fserver.py",
     "/mp/models/%5c..%5cx", "/mp/wasm//etc/passwd", r"/mp/wasm/C:\Windows\win.ini", "/..%2f..%2fsrc/realx/server.py", "/../server.py"],
)
def test_traversal_never_reaches_a_file(srv, path):
    status, _, body = req(srv, "GET", path, COOKIE)
    assert status in (400, 404)
    assert b"BaseHTTPRequestHandler" not in body


def test_token_is_not_echoed_and_referrer_is_suppressed(srv):
    status, headers, body = req(srv, "GET", f"/api/stats?token={TOKEN}")
    assert status == 200 and headers["referrer-policy"] == "no-referrer"
    status, headers, body = req(srv, "GET", f"/nope?token={TOKEN}")
    assert status == 404 and TOKEN.encode() not in body and TOKEN not in str(headers)
    status, headers, _ = req(srv, "GET", f"/?token={TOKEN}")
    assert TOKEN not in headers["location"]


def test_page_headers(srv):
    for path, frame in (("/", "DENY"), ("/dock", "DENY"), ("/avatar", "SAMEORIGIN")):
        _, h, _ = req(srv, "GET", path, COOKIE)
        csp = h["content-security-policy"]
        assert "script-src 'self'" in csp and "'unsafe-eval'" not in csp and "object-src 'none'" in csp
        assert h["x-frame-options"] == frame and h["x-content-type-options"] == "nosniff"
        assert h["cache-control"] == "no-store"


def test_oversize_bodies_are_refused_before_reading(srv):
    h = {**COOKIE, "Content-Type": "application/json"}
    assert req(srv, "POST", "/api/config", h, b"{" + b" " * 5000 + b"}")[0] == 400
    assert req(srv, "POST", "/api/config", {**h, "Content-Length": "-1"})[0] == 400
    assert req(srv, "POST", "/api/background", {**COOKIE, "Content-Type": "image/png", "Content-Length": str(10**9)})[0] == 400
    assert req(srv, "POST", "/api/config", {**h, "Transfer-Encoding": "chunked"}, b"0\r\n\r\n")[0] == 400


def test_huge_header_block_is_rejected(srv):
    s = socket.create_connection(("127.0.0.1", srv.port), timeout=10)
    s.sendall(f"GET / HTTP/1.1\r\nHost: 127.0.0.1:{srv.port}\r\nX: {'a' * 70000}\r\n\r\n".encode())
    assert b" 431 " in s.recv(4096).split(b"\r\n", 1)[0] + b" "
    s.close()
