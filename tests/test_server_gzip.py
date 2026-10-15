"""Static assets are gzipped for clients that accept it; everything else is untouched."""

from __future__ import annotations

import gzip
import http.client
from importlib import resources

import pytest

from realx.server import Engine, Server, _accepts_gzip

pytestmark = pytest.mark.raw_http

TOKEN = "gzip-test-token-abcdef0123456789"
ASSETS = {
    "/": "index.html",
    "/app.js": "app.js",
    "/avatar": "avatar.html",
    "/avatar.bundle.js": "avatar.bundle.js",
}


@pytest.fixture(scope="module")
def srv():
    s = Server(Engine(source="demo:static", mode="original"), port=0, token=TOKEN)
    s.start()
    yield s
    s.stop()


def get(srv, path, accept=None, token=True):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
    h = {"Host": f"127.0.0.1:{srv.port}"}
    if token:
        h["Authorization"] = f"Bearer {TOKEN}"
    if accept is not None:
        h["Accept-Encoding"] = accept
    c.request("GET", path, headers=h)
    r = c.getresponse()
    body = r.read()
    headers = {k.lower(): v for k, v in r.getheaders()}
    c.close()
    return r.status, headers, body


def raw(name):
    return resources.files("realx.web").joinpath(name).read_bytes()


@pytest.mark.parametrize("path,name", ASSETS.items())
def test_gzip_when_accepted(srv, path, name):
    status, h, body = get(srv, path, "gzip, deflate, br")
    assert status == 200
    assert h["content-encoding"] == "gzip" and h["vary"] == "Accept-Encoding"
    assert int(h["content-length"]) == len(body) < len(raw(name))
    assert gzip.decompress(body) == raw(name)


@pytest.mark.parametrize("path,name", ASSETS.items())
@pytest.mark.parametrize("accept", [None, "identity", "br", "gzip;q=0"])
def test_plain_when_not_accepted(srv, path, name, accept):
    status, h, body = get(srv, path, accept)
    assert status == 200
    assert "content-encoding" not in h and "vary" not in h
    assert int(h["content-length"]) == len(body) and body == raw(name)


@pytest.mark.parametrize("path", ASSETS)
def test_other_headers_are_the_same_with_and_without_gzip(srv, path):
    _, plain, _ = get(srv, path)
    _, packed, _ = get(srv, path, "gzip")
    drop = {"content-length", "content-encoding", "vary", "date"}
    assert {k: v for k, v in plain.items() if k not in drop} == {k: v for k, v in packed.items() if k not in drop}
    assert packed["cache-control"] == "no-store"
    if path in ("/", "/avatar"):
        assert "content-security-policy" in packed


@pytest.mark.parametrize("path", ASSETS)
def test_still_needs_the_token(srv, path):
    status, h, _ = get(srv, path, "gzip", token=False)
    assert status == 401 and "content-encoding" not in h


def test_api_json_is_never_compressed(srv):
    status, h, body = get(srv, "/api/stats", "gzip")
    assert status == 200 and "content-encoding" not in h
    assert body.lstrip().startswith(b"{")


def test_accept_encoding_parsing():
    assert _accepts_gzip("gzip") and _accepts_gzip("deflate, GZIP;q=0.5") and _accepts_gzip("*")
    assert not _accepts_gzip(None) and not _accepts_gzip("") and not _accepts_gzip("gzip;q=0")
    assert not _accepts_gzip("identity") and not _accepts_gzip("*;q=0") and not _accepts_gzip("gzip;q=bad")
    assert not _accepts_gzip("gzip;q=0, *")
