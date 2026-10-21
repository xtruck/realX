"""The GPU-side skeleton (gpu_server): auth, bounds, G4 start-up check, no disk writes, and the real client talking to the real server."""

from __future__ import annotations

import http.client
import pathlib
import re
import shutil
import ssl
import subprocess
import threading

import numpy as np
import pytest

import gpulink_helpers as h
from gpu_server import GpuServer, PassThrough, ServerConfig, startup_check
from realx.gpulink import GpuLinkClient, GpuLinkConfig

pytestmark = pytest.mark.raw_http

SERVER_TOKEN = "server-token-0123456789"
ROOT = pathlib.Path(__file__).resolve().parents[1]


def cfg(**kw):
    return ServerConfig(token=SERVER_TOKEN, ephemeral=True, port=0, **kw)


@pytest.fixture
def server():
    s = GpuServer(cfg()).start()
    yield s
    s.stop()


def post(server, body=b"", headers=None, path="/v1/frame", method="POST"):
    conn = http.client.HTTPConnection("127.0.0.1", server.port, timeout=5)
    base = {"Authorization": "Bearer " + SERVER_TOKEN, "Content-Type": "image/jpeg", "X-Consent-Id": h.CONSENT_ID}
    base.update(headers or {})
    base = {k: v for k, v in base.items() if v is not None}
    conn.request(method, path, body=body, headers=base)
    resp = conn.getresponse()
    data = resp.read()
    conn.close()
    return resp.status, data, resp


GOOD = h.jpeg_of(h.make_frame())


# --- behaviour ----------------------------------------------------------------------------------------------------


def test_a_good_frame_comes_back_as_a_jpeg_of_the_same_size(server):
    status, data, resp = post(server, GOOD)
    assert status == 200 and resp.getheader("Content-Type") == "image/jpeg" and resp.getheader("Cache-Control") == "no-store"
    import cv2

    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    assert img.shape == (240, 320, 3)


def test_only_post_to_the_one_route(server):
    assert post(server, GOOD, path="/")[0] == 404
    assert post(server, GOOD, path="/v1/frame/x")[0] == 404
    assert post(server, b"", method="GET")[0] == 405
    assert post(server, b"", method="DELETE")[0] == 405


# --- G3 -----------------------------------------------------------------------------------------------------------


@pytest.mark.parametrize("auth", [None, "", "Bearer ", "Bearer wrong-token-0123456789", "Basic " + SERVER_TOKEN, SERVER_TOKEN, "bearer " + SERVER_TOKEN])
def test_g3_every_request_needs_the_exact_token(server, auth):
    assert post(server, GOOD, headers={"Authorization": auth})[0] == 401


def test_g3_the_token_is_not_echoed_or_logged(server, caplog):
    import logging

    caplog.set_level(logging.DEBUG)
    status, data, resp = post(server, GOOD)
    post(server, GOOD, headers={"Authorization": "Bearer nope-nope-nope-nope"})
    assert SERVER_TOKEN not in caplog.text and SERVER_TOKEN.encode() not in data
    assert all(SERVER_TOKEN not in v for _, v in resp.getheaders())


# --- G5 -----------------------------------------------------------------------------------------------------------


def test_g5_other_request_headers_are_ignored_and_never_echoed(server):
    status, data, resp = post(server, GOOD, headers={"X-Name": "Alice", "Cookie": "a=b", "X-Forwarded-For": "203.0.113.9"})
    assert status == 200 and all("Alice" not in v and "203.0.113.9" not in v for _, v in resp.getheaders())


@pytest.mark.parametrize("cid", [None, "", "short", "Z" * 32, h.CONSENT_ID + "0"])
def test_g5_the_consent_id_must_have_the_agreed_shape(server, cid):
    assert post(server, GOOD, headers={"X-Consent-Id": cid})[0] == 400


def test_g5_wrong_content_type_empty_oversized_and_corrupt_bodies(server):
    assert post(server, GOOD, headers={"Content-Type": "application/json"})[0] == 415
    assert post(server, b"")[0] == 400
    assert post(server, b"GIF89a" + b"\0" * 100)[0] == 400
    assert post(server, GOOD[:150])[0] == 400
    small = GpuServer(cfg(max_body=1000)).start()
    try:
        assert post(small, GOOD)[0] == 413
    finally:
        small.stop()


def test_g5_a_picture_over_the_dimension_limit_is_refused():
    small = GpuServer(cfg(max_dim=100)).start()
    try:
        assert post(small, GOOD)[0] == 400
    finally:
        small.stop()


def test_a_filter_that_misbehaves_gives_a_500_not_a_leak():
    class Bad:
        def process(self, f):
            raise RuntimeError("secret internal detail")

    class WrongShape:
        def process(self, f):
            return f[:10]

    for filt in (Bad(), WrongShape()):
        s = GpuServer(cfg(), filt).start()
        try:
            status, data, _ = post(s, GOOD)
            assert status == 500 and b"secret" not in data
        finally:
            s.stop()


def test_a_filter_can_change_pixels_and_the_client_receives_them():
    class Invert:
        def process(self, f):
            return 255 - f

    s = GpuServer(cfg(), Invert()).start()
    try:
        client_cfg = GpuLinkConfig.unsafe_loopback_http_for_tests(url=f"http://127.0.0.1:{s.port}", enabled=True)
        frame = h.make_frame()
        import os

        os.environ["REALX_GPULINK_TOKEN"] = SERVER_TOKEN
        try:
            out = GpuLinkClient(client_cfg, lambda _id: True).send(frame, h.CONSENT_ID)
        finally:
            del os.environ["REALX_GPULINK_TOKEN"]
        assert out is not None and np.abs(out.astype(int) - (255 - frame).astype(int)).mean() < 8
    finally:
        s.stop()


# --- G4 -----------------------------------------------------------------------------------------------------------


def test_g4_the_server_refuses_to_start_unless_declared_ephemeral():
    with pytest.raises(RuntimeError, match="ephemeral"):
        GpuServer(ServerConfig(token=SERVER_TOKEN, port=0))
    assert startup_check(cfg()) == []


def test_g4_a_short_token_and_a_non_empty_data_dir_are_refused(tmp_path):
    assert startup_check(ServerConfig(token="short", ephemeral=True))
    (tmp_path / "left-over.jpg").write_bytes(b"x")
    assert any("data directory" in p for p in startup_check(cfg(data_dir=str(tmp_path))))
    assert startup_check(cfg(data_dir=str(tmp_path / "does-not-exist"))) == []


def test_g4_the_server_code_never_writes_to_disk():
    source = "\n".join(p.read_text(encoding="utf-8") for p in (ROOT / "gpu_server").glob("*.py"))
    for needle in ("open(", ".write_bytes", ".write_text", "imwrite", "tempfile", "shutil", "os.replace", "os.rename", "pickle", "sqlite"):
        assert needle not in source, needle


def test_g4_serving_frames_leaves_the_data_dir_empty(tmp_path):
    s = GpuServer(cfg(data_dir=str(tmp_path))).start()
    try:
        for _ in range(3):
            assert post(s, GOOD)[0] == 200
    finally:
        s.stop()
    assert list(tmp_path.iterdir()) == []


def test_the_server_does_not_import_or_name_any_model():
    source = "\n".join(p.read_text(encoding="utf-8") for p in (ROOT / "gpu_server").glob("*.py")).lower()
    for name in ("insightface", "inswapper", "buffalo", "onnxruntime", "liveportrait", "torch"):
        assert name not in source, name


def test_the_server_binds_loopback_by_default():
    assert ServerConfig(token=SERVER_TOKEN).host == "127.0.0.1"
    assert PassThrough().process(np.zeros((2, 2, 3), np.uint8)).shape == (2, 2, 3)


def test_main_refuses_without_ephemeral_or_token(monkeypatch, capsys):
    from gpu_server.__main__ import main

    monkeypatch.delenv("GPU_SERVER_TOKEN", raising=False)
    assert main(["--port", "0"]) == 2
    err = capsys.readouterr().err
    assert "ephemeral" in err and "token" in err


# --- the real client against the real server ----------------------------------------------------------------------


def test_end_to_end_many_frames_and_the_server_never_sees_the_label_or_the_watermark(monkeypatch):
    from realx.gpulink import GpuLinkStage
    from realx.pipeline import Pipeline
    from realx.safety import watermark
    from realx.safety.consent import ConsentStore
    from realx.stages.builtin import ConsentGate, Disclosure, Watermark
    from realx.types import FrameContext

    seen: list[np.ndarray] = []

    class Spy(PassThrough):
        def process(self, f):
            seen.append(f.copy())
            return f

    s = GpuServer(cfg(), Spy()).start()
    try:
        monkeypatch.setenv("REALX_GPULINK_TOKEN", SERVER_TOKEN)
        link = GpuLinkConfig.unsafe_loopback_http_for_tests(url=f"http://127.0.0.1:{s.port}", enabled=True, max_fps=1000)
        client = GpuLinkClient(link, lambda _id: True)
        store = ConsentStore(bytes(range(1, 40)))
        key = b"k" * 16
        chain = [ConsentGate(store, store.issue("person", "live", 60)), GpuLinkStage(client, h.CONSENT_ID), Disclosure("Person"), Watermark(b"e2e", key)]
        with Pipeline(chain, strict=True, allow=[GpuLinkStage]) as pipe:
            for i in range(10):
                ctx = pipe.process(FrameContext(pixels=h.make_frame(seed=i)))
                assert ctx.meta["gpulink"] == "remote"
                assert watermark.extract(ctx.pixels, key) == b"e2e" and ctx.meta["disclosure"].startswith("DIGITAL HOST")
        assert len(seen) == 10
        for f in seen:  # what the server saw is the bare camera picture: no label bar, no watermark
            assert watermark.extract(f, key) is None
            assert tuple(f[-3, :4].tolist()[0]) != Disclosure.BAR_RGB
        st = client.status()
        assert st["sent"] == 10 and st["failed"] == 0 and st["frames_leaving_machine"] is False  # the stage closed the client
    finally:
        s.stop()


def test_end_to_end_concurrent_callers_never_exceed_one_frame_in_flight(monkeypatch):
    active = {"now": 0, "max": 0}
    lock = threading.Lock()

    class Slow(PassThrough):
        def process(self, f):
            with lock:
                active["now"] += 1
                active["max"] = max(active["max"], active["now"])
            threading.Event().wait(0.05)
            with lock:
                active["now"] -= 1
            return f

    s = GpuServer(cfg(), Slow()).start()
    try:
        monkeypatch.setenv("REALX_GPULINK_TOKEN", SERVER_TOKEN)
        link = GpuLinkConfig.unsafe_loopback_http_for_tests(url=f"http://127.0.0.1:{s.port}", enabled=True, max_fps=1000)
        client = GpuLinkClient(link, lambda _id: True)
        threads = [threading.Thread(target=lambda: [client.send(h.make_frame(), h.CONSENT_ID) for _ in range(5)]) for _ in range(4)]
        [t.start() for t in threads]
        [t.join(10) for t in threads]
        assert active["max"] == 1
    finally:
        s.stop()


# --- G2 in practice: real TLS -------------------------------------------------------------------------------------


@pytest.mark.skipif(shutil.which("openssl") is None, reason="needs the openssl command to make a throw-away certificate")
def test_g2_tls_with_an_untrusted_certificate_is_refused(tmp_path, monkeypatch):
    key, crt = tmp_path / "k.pem", tmp_path / "c.pem"
    done = subprocess.run(
        ["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", str(key), "-out", str(crt), "-days", "1",
         "-subj", "/CN=gpu.example.com", "-addext", "subjectAltName=DNS:gpu.example.com"],
        capture_output=True, timeout=60,
    )
    if done.returncode != 0:
        pytest.skip("openssl could not make a certificate")
    s = GpuServer(cfg()).start()
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(str(crt), str(key))
    s._httpd.socket = ctx.wrap_socket(s._httpd.socket, server_side=True)
    try:
        monkeypatch.setenv("REALX_GPULINK_TOKEN", SERVER_TOKEN)
        # a https config for a name that must resolve to the test server: patch the resolver, never the TLS checks
        import socket as _socket

        real = _socket.create_connection
        monkeypatch.setattr(_socket, "create_connection", lambda addr, timeout=None, **kw: real(("127.0.0.1", s.port), timeout=timeout))
        link = GpuLinkConfig(enabled=True, url="https://gpu.example.com", allowed_hosts=("gpu.example.com",), max_fps=1000)
        client = GpuLinkClient(link, lambda _id: True)
        assert client.send(h.make_frame(), h.CONSENT_ID) is None
        assert client.status()["last_error"] == "tls"
    finally:
        s.stop()
