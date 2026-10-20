"""onnxruntime-web was removed on 2026-10-20 (no page loaded it): its old /ort/ paths are not served, and access checks still apply."""
import http.client

import pytest

from realx.server import Engine, Server

TOKEN = "ort-test-token-abcdef0123456789"
pytestmark = pytest.mark.raw_http


@pytest.fixture(scope="module")
def srv():
    s = Server(Engine(source="demo:static", mode="original"), port=0, token=TOKEN)
    s.start()
    yield s
    s.stop()


def get(srv, path, auth=True):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=30)
    h = {"Host": f"127.0.0.1:{srv.port}"}
    if auth:
        h["Authorization"] = f"Bearer {TOKEN}"
    c.request("GET", path, headers=h)
    r = c.getresponse()
    out = (r.status, r.read())
    c.close()
    return out


def test_the_removed_onnxruntime_web_files_are_not_served(srv):
    for path in ("/ort/ort-wasm-simd-threaded.jsep.wasm", "/ort/ort-wasm-simd-threaded.jsep.mjs", "/ort/"):
        assert get(srv, path)[0] == 404, path
        assert get(srv, path, auth=False)[0] == 401, "the token is still checked before anything else"


def test_the_package_ships_no_onnxruntime_web_runtime():
    from importlib import resources

    assert not resources.files("realx.web").joinpath("ort").is_dir()
