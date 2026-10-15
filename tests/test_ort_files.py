"""onnxruntime-web's runtime is served from this origin, with the right types, to authorised requests only."""
import http.client
import re

import pytest

from realx.server import _ORT_NAME, Engine, Server

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
    out = (r.status, {k.lower(): v for k, v in r.getheaders()}, r.read())
    c.close()
    return out


def test_the_wasm_runtime_is_served_as_application_wasm(srv):
    status, headers, body = get(srv, "/ort/ort-wasm-simd-threaded.jsep.wasm")
    assert status == 200
    assert headers["content-type"] == "application/wasm"
    assert body[:4] == b"\x00asm" and int(headers["content-length"]) == len(body) > 1_000_000
    assert headers["x-content-type-options"] == "nosniff" and headers["cross-origin-resource-policy"] == "same-origin"


def test_the_loader_script_is_javascript(srv):
    status, headers, body = get(srv, "/ort/ort-wasm-simd-threaded.jsep.mjs")
    assert status == 200 and headers["content-type"].startswith("text/javascript") and b"export" in body


def test_only_the_named_runtime_files_are_served_and_only_with_the_token(srv):
    assert get(srv, "/ort/ort-wasm-simd-threaded.jsep.wasm", auth=False)[0] == 401
    for bad in ("/ort/", "/ort/..%2Fapp.js", "/ort/../app.js", "/ort/app.js", "/ort/ort-wasm-simd-threaded.jsep.wasm.map",
                "/ort/ort-wasm-simd-threaded.wasm", "/ort/nope.wasm"):
        assert get(srv, bad)[0] == 404, bad


def test_the_name_pattern_is_exact():
    assert _ORT_NAME.fullmatch("ort-wasm-simd-threaded.jsep.wasm") and _ORT_NAME.fullmatch("ort-wasm-simd-threaded.jsep.mjs")
    assert not re.search(r"[/\\]", "ort-wasm-simd-threaded.jsep.wasm")
    assert not _ORT_NAME.fullmatch("../ort-wasm-simd-threaded.jsep.wasm") and not _ORT_NAME.fullmatch("x.jsep.wasm")
