"""The access token: every route and the rig socket refuse a request that does not carry it."""

from __future__ import annotations

import base64
import http.client
import os
import socket

import pytest

from realx.server import Engine, Server, resolve_token

pytestmark = pytest.mark.raw_http  # these tests send exactly the headers they mean to

TOKEN = "auth-test-token-abcdef0123456789"
ROUTES = ["/", "/app.js", "/avatar", "/avatar.bundle.js", "/avatar/model.vrm", "/avatar/background.png", "/dock", "/dock.js", "/dock.css", "/favicon.ico", "/api/stats",
          "/api/voices", "/api/safety", "/stream.mjpg", "/mp/wasm/x.js", "/mp/models/x.task", "/nope"]


@pytest.fixture(scope="module")
def srv():
    s = Server(Engine(source="demo:static", mode="original"), port=0, token=TOKEN)
    s.start()
    yield s
    s.stop()


def req(srv, method, path, headers=None, body=None):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
    h = {"Host": f"127.0.0.1:{srv.port}"}
    h.update(headers or {})
    c.request(method, path, body=body, headers=h)
    r = c.getresponse()
    data = r.read(4096) if path != "/stream.mjpg" else b""
    out = (r.status, dict((k.lower(), v) for k, v in r.getheaders()), data)
    c.close()
    return out


@pytest.mark.parametrize("path", ROUTES)
def test_every_get_route_refuses_without_a_token(srv, path):
    status, headers, _ = req(srv, "GET", path)
    assert status == 401 and headers.get("www-authenticate") == "Bearer"


@pytest.mark.parametrize("bad", ["", "wrong", TOKEN[:-1], TOKEN + "x", TOKEN.upper(), "Bearer"])
def test_wrong_tokens_are_refused_in_every_carrier(srv, bad):
    assert req(srv, "GET", "/api/stats", {"Authorization": f"Bearer {bad}"})[0] == 401
    assert req(srv, "GET", "/api/stats", {"Cookie": f"realx_token={bad}"})[0] == 401
    assert req(srv, "GET", f"/api/stats?token={bad}")[0] == 401


def test_header_cookie_and_query_each_work_on_get(srv):
    assert req(srv, "GET", "/api/stats", {"Authorization": f"Bearer {TOKEN}"})[0] == 200
    assert req(srv, "GET", "/api/stats", {"Cookie": f"other=1; realx_token={TOKEN}"})[0] == 200
    assert req(srv, "GET", f"/api/stats?token={TOKEN}")[0] == 200


def test_first_visit_swaps_the_query_token_for_a_cookie(srv):
    status, headers, _ = req(srv, "GET", f"/?token={TOKEN}&mic=1")
    assert status == 303 and headers["location"] == "/?mic=1" and "token" not in headers["location"]
    cookie = headers["set-cookie"]
    assert cookie.startswith(f"realx_token={TOKEN};") and "HttpOnly" in cookie and "SameSite=Strict" in cookie
    assert req(srv, "GET", "/", {"Cookie": f"realx_token={TOKEN}"})[0] == 200


def test_the_avatar_page_link_for_obs_also_becomes_a_cookie(srv):
    status, headers, _ = req(srv, "GET", f"/avatar?token={TOKEN}")
    assert status == 303 and headers["location"] == "/avatar" and TOKEN in headers["set-cookie"]


def test_post_never_accepts_the_token_from_the_url(srv):
    body = b"{}"
    h = {"Content-Type": "application/json"}
    assert req(srv, "POST", f"/api/config?token={TOKEN}", h, body)[0] == 401
    assert req(srv, "POST", "/api/config", {**h, "Authorization": f"Bearer {TOKEN}"}, body)[0] == 200
    assert req(srv, "POST", "/api/config", {**h, "Cookie": f"realx_token={TOKEN}"}, body)[0] == 200


@pytest.mark.parametrize("path", ["/api/config", "/api/emote", "/api/background", "/api/voice", "/api/nothing"])
def test_every_post_route_refuses_without_a_token(srv, path):
    assert req(srv, "POST", path, {"Content-Type": "application/json"}, b"{}")[0] == 401


def test_host_and_origin_checks_still_run_before_the_token(srv):
    ok = {"Authorization": f"Bearer {TOKEN}"}
    assert req(srv, "GET", "/api/stats", {**ok, "Host": "evil.example"})[0] == 403
    assert req(srv, "GET", "/api/stats", {**ok, "Sec-Fetch-Site": "cross-site"})[0] == 403
    assert req(srv, "POST", "/api/config", {**ok, "Origin": "http://evil.example", "Content-Type": "application/json"}, b"{}")[0] == 403


def _ws(srv, headers=(), path="/ws/rig"):
    s = socket.create_connection(("127.0.0.1", srv.port), timeout=10)
    lines = [f"GET {path} HTTP/1.1", f"Host: 127.0.0.1:{srv.port}", "Upgrade: websocket", "Connection: Upgrade",
             f"Sec-WebSocket-Key: {base64.b64encode(os.urandom(16)).decode()}", "Sec-WebSocket-Version: 13",
             f"Origin: http://127.0.0.1:{srv.port}", *headers]
    s.sendall(("\r\n".join(lines) + "\r\n\r\n").encode())
    first = s.recv(4096).split(b"\r\n", 1)[0].decode()
    s.close()
    return first


def test_rig_socket_needs_the_token_for_viewing_and_publishing(srv):
    assert " 401 " in _ws(srv)
    assert " 401 " in _ws(srv, path="/ws/rig?publish=1")
    assert " 401 " in _ws(srv, ["Cookie: realx_token=wrong"])
    assert " 101 " in _ws(srv, [f"Cookie: realx_token={TOKEN}"])
    assert " 101 " in _ws(srv, [f"Authorization: Bearer {TOKEN}"])


def test_resolve_token_rules(monkeypatch):
    monkeypatch.delenv("REALX_TOKEN", raising=False)
    a, b = resolve_token(), resolve_token()
    assert a != b and len(a) >= 32
    monkeypatch.setenv("REALX_TOKEN", "stable-token-0123456789")
    assert resolve_token() == "stable-token-0123456789"
    assert resolve_token("explicit-token-0123456789") == "explicit-token-0123456789"
    for weak in ["short", "has space has space has space", "semi;colon;semi;colon;semi", "x" * 200]:
        with pytest.raises(ValueError):
            resolve_token(weak)


def test_each_server_gets_its_own_token_by_default(monkeypatch):
    monkeypatch.delenv("REALX_TOKEN", raising=False)
    one = Server(Engine(source="demo:static"), port=0)
    two = Server(Engine(source="demo:static"), port=0)
    try:
        assert one.token != two.token
    finally:
        one._httpd.server_close()
        two._httpd.server_close()


def test_a_token_less_post_with_a_body_gets_a_clean_reply(srv):
    """The early 401 must reach a client that is still sending (the reset seen once on Windows)."""
    for size in (10, 5000, 60000, 300000):
        c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
        c.request("POST", "/api/background", body=b"x" * size,
                  headers={"Host": f"127.0.0.1:{srv.port}", "Content-Type": "image/png"})
        assert c.getresponse().status == 401
        c.close()


def test_an_unauthorised_camera_switch_is_refused_and_changes_nothing_and_bad_sources_are_still_refused(srv):
    before = srv.engine.config()["source"]
    body = b'{"source":"camera"}'
    h = {"Content-Type": "application/json"}
    assert req(srv, "POST", "/api/config", h, body)[0] == 401
    assert req(srv, "POST", "/api/config", {**h, "Authorization": "Bearer wrong"}, body)[0] == 401
    assert req(srv, "POST", "/api/config", {**h, "Cookie": "realx_token=wrong"}, body)[0] == 401
    assert srv.engine.config()["source"] == before, "nothing changed"
    ok = {**h, "Authorization": f"Bearer {TOKEN}"}
    for bad in (b'{"source":"rtsp://evil.example/x"}', b'{"source":"/etc/passwd"}', b'{"source":"demo:../x"}', b'{"source":0}'):
        assert req(srv, "POST", "/api/config", ok, bad)[0] == 400, bad
    assert srv.engine.config()["source"] == before


def test_an_unauthorised_camera_switch_is_refused_and_changes_nothing_and_bad_sources_are_still_refused(srv):
    before = srv.engine.config()["source"]
    body = b'{"source":"camera"}'
    h = {"Content-Type": "application/json"}
    assert req(srv, "POST", "/api/config", h, body)[0] == 401
    assert req(srv, "POST", "/api/config", {**h, "Authorization": "Bearer wrong"}, body)[0] == 401
    assert req(srv, "POST", "/api/config", {**h, "Cookie": "realx_token=wrong"}, body)[0] == 401
    assert srv.engine.config()["source"] == before, "nothing changed"
    ok = {**h, "Authorization": f"Bearer {TOKEN}"}
    for bad in (b'{"source":"rtsp://evil.example/x"}', b'{"source":"/etc/passwd"}', b'{"source":"demo:../x"}', b'{"source":0}'):
        assert req(srv, "POST", "/api/config", ok, bad)[0] == 400, bad
    assert srv.engine.config()["source"] == before
