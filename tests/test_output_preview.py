"""The output preview window: a plain page served like the dock, behind the same token, showing only the stream."""

from __future__ import annotations

import http.client
import re
from importlib import resources

import pytest

from realx.server import PREVIEW_CSP, Engine, Server

pytestmark = pytest.mark.raw_http

TOKEN = "preview-token-abcdef0123456789"


@pytest.fixture(scope="module")
def srv():
    s = Server(Engine(source="demo:static", mode="original"), port=0, token=TOKEN)
    s.start()
    yield s
    s.stop()


def get(srv, path, auth=True, headers=None):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
    h = {"Authorization": f"Bearer {TOKEN}"} if auth else {}
    h.update(headers or {})
    c.request("GET", path, headers=h)
    r = c.getresponse()
    body = r.read()
    out = (r.status, {k.lower(): v for k, v in r.getheaders()}, body)
    c.close()
    return out


def test_preview_files_are_served_with_the_right_types(srv):
    for path, kind in (("/preview", "text/html"), ("/preview.js", "text/javascript"), ("/preview.css", "text/css")):
        status, headers, body = get(srv, path)
        assert status == 200 and headers["content-type"].startswith(kind) and body, path


def test_preview_needs_the_token(srv):
    for path in ("/preview", "/preview.js", "/preview.css"):
        assert get(srv, path, auth=False)[0] == 401, path


def test_first_visit_with_the_token_in_the_link_moves_it_into_a_cookie(srv):
    status, headers, _ = get(srv, f"/preview?token={TOKEN}", auth=False)
    assert status == 303 and headers["location"] == "/preview" and "HttpOnly" in headers["set-cookie"]


def test_preview_page_is_locked_down(srv):
    _, headers, _ = get(srv, "/preview")
    assert headers["content-security-policy"] == PREVIEW_CSP and headers["x-frame-options"] == "DENY"
    assert "default-src 'none'" in PREVIEW_CSP and "frame-ancestors 'none'" in PREVIEW_CSP
    assert "unsafe-inline" not in PREVIEW_CSP and "script-src 'self'" in PREVIEW_CSP
    assert "ws:" not in PREVIEW_CSP and "media-src" not in PREVIEW_CSP


def test_preview_code_only_reads_and_sends_nothing_back():
    js = resources.files("realx.web").joinpath("preview.js").read_text(encoding="utf-8")
    assert re.findall(r'fetch\("([^"]+)"', js) == ["/api/stats"]
    assert "method" not in js and "POST" not in js and "WebSocket" not in js and "localStorage" not in js
    assert "eval(" not in js and "innerHTML" not in js


def test_preview_html_has_no_inline_script_or_style():
    html = resources.files("realx.web").joinpath("preview.html").read_text(encoding="utf-8")
    assert not re.search(r"<script(?![^>]*\bsrc=)", html) and "style=" not in html and "<style" not in html


def test_control_room_has_the_button_and_opens_a_same_origin_popup():
    web = resources.files("realx.web")
    assert 'id="previewOpen"' in web.joinpath("index.html").read_text(encoding="utf-8")
    js = web.joinpath("app.js").read_text(encoding="utf-8")
    assert 'window.open("/preview"' in js and "noopener" in js
