"""The face-mesh prototype page (step S1): served like the avatar page, behind the access token, with a tight policy."""

from __future__ import annotations

import http.client

import pytest

from realx.server import Engine, Server

pytestmark = pytest.mark.raw_http  # these tests send exactly the headers they mean to

TOKEN = "facemesh-test-token-abcdef0123456789"
PATHS = ["/facemesh", "/facemesh.bundle.js"]


@pytest.fixture(scope="module")
def srv():
    s = Server(Engine(source="demo:static", mode="original"), port=0, token=TOKEN)
    s.start()
    yield s
    s.stop()


def get(srv, path, *, token=True):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
    headers = {"Host": f"127.0.0.1:{srv.port}"}
    if token:
        headers["Cookie"] = f"realx_token={TOKEN}"
    c.request("GET", path, headers=headers)
    r = c.getresponse()
    out = (r.status, {k.lower(): v for k, v in r.getheaders()}, r.read())
    c.close()
    return out


@pytest.mark.parametrize("path", PATHS)
def test_the_prototype_needs_the_access_token(srv, path):
    status, headers, _ = get(srv, path, token=False)
    assert status == 401 and headers.get("www-authenticate") == "Bearer"


def test_page_is_served_with_a_policy_that_allows_no_eval_no_framing_and_only_our_camera(srv):
    status, h, body = get(srv, "/facemesh")
    assert status == 200 and h["content-type"].startswith("text/html")
    assert b"/facemesh.bundle.js" in body
    csp = h["content-security-policy"]
    assert "'unsafe-eval'" not in csp and "default-src 'none'" in csp and "frame-ancestors 'self'" in csp
    assert "script-src 'self' 'wasm-unsafe-eval'" in csp
    assert h["x-frame-options"] == "DENY"
    assert h["permissions-policy"] == "camera=(self), microphone=(), geolocation=()"


def test_bundle_is_served_as_javascript(srv):
    status, h, js = get(srv, "/facemesh.bundle.js")
    assert status == 200 and h["content-type"].startswith("text/javascript")
    assert len(js) > 50_000
    assert b"/mp/models/face_landmarker.task" in js and b"/mp/wasm" in js, "rebuild the bundle: cd webapp && npm run build"


def test_first_visit_from_a_link_swaps_the_token_for_a_cookie(srv):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
    c.request("GET", f"/facemesh?token={TOKEN}", headers={"Host": f"127.0.0.1:{srv.port}"})
    r = c.getresponse()
    r.read()
    assert r.status == 303 and r.getheader("Location") == "/facemesh"
    cookie = r.getheader("Set-Cookie")
    assert cookie.startswith(f"realx_token={TOKEN};") and "HttpOnly" in cookie and "SameSite=Strict" in cookie
    c.close()


def test_the_page_cannot_be_asked_to_use_the_microphone(srv):
    _, h, _ = get(srv, "/facemesh?mic=1")
    assert "microphone=()" in h["permissions-policy"]
