"""Server side of full-body tracking: message validation, the /mp asset routes, the publish relay and body mode."""

import base64
import dataclasses
import hashlib
import http.client
import json
import math
import os
import re
import shutil
import socket
import struct
import subprocess
import threading
import time
from pathlib import Path

import numpy as np
import pytest
from conftest import TEST_TOKEN

from realx import rig, ws
from realx.types import FrameContext

ROOT = Path(__file__).resolve().parents[1]


# --- message validation -------------------------------------------------------------------------------
def good(**over):
    msg = {"type": "body", "f": 3, "q": [0.0, 0.0, 0.0, 1.0] * 53, "e": [0.0] * 11, "r": [0.1, -0.2, 1.1]}
    msg.update(over)
    return msg


def test_a_valid_message_is_returned_as_canonical_compact_json_not_the_raw_text():
    raw = json.dumps(good(q=[0.123456789, 0.0, 0.0, 0.992] * 53, r=[0.123456, 0.0, 1.0]), indent=3)
    out = rig.parse_body_message(raw)
    assert out != raw and ", " not in out and ": " not in out and "\n" not in out
    back = json.loads(out)
    assert list(back) == ["type", "f", "q", "e", "r"]
    assert back["q"][0] == 0.1235 and back["r"][0] == 0.123  # rounded like the browser rounds
    assert rig.parse_body_message(out) == out                 # canonical form is stable


def _deep():
    return "[" * 5000


BAD = {
    "not json": "{",
    "array": "[]",
    "number": "5",
    "deep nesting": _deep(),
    "empty": "",
    "extra key": json.dumps(good(extra=1)),
    "missing key": json.dumps({k: v for k, v in good().items() if k != "e"}),
    "wrong type": json.dumps(good(type="rig")),
    "f bool": json.dumps(good(f=True)),
    "f too big": json.dumps(good(f=32)),
    "f negative": json.dumps(good(f=-1)),
    "f float": json.dumps(good(f=1.5)),
    "f string": json.dumps(good(f="1")),
    "q short": json.dumps(good(q=[0, 0, 0, 1] * 52 + [0, 0, 0])),
    "q long": json.dumps(good(q=[0, 0, 0, 1] * 54)),
    "q nan": json.dumps(good(q=[float("nan"), 0, 0, 1] + [0, 0, 0, 1] * 52)),
    "q inf": json.dumps(good(q=[float("inf"), 0, 0, 1] + [0, 0, 0, 1] * 52)),
    "q huge": json.dumps(good(q=[2.0, 0, 0, 1] + [0, 0, 0, 1] * 52)),
    "q zero quaternion": json.dumps(good(q=[0, 0, 0, 0] + [0, 0, 0, 1] * 52)),
    "q too long quaternion": json.dumps(good(q=[0.8, 0.8, 0.0, 0.0] + [0, 0, 0, 1] * 52)),
    "q string": json.dumps(good(q=["0"] + [0, 0, 1] + [0, 0, 0, 1] * 52)),
    "q bool": json.dumps(good(q=[True, 0, 0, 0] + [0, 0, 0, 1] * 52)),
    "q null": json.dumps(good(q=[None, 0, 0, 1] + [0, 0, 0, 1] * 52)),
    "e short": json.dumps(good(e=[0.0] * 8)),
    "e big": json.dumps(good(e=[1.5] + [0.0] * 8)),
    "e nan": json.dumps(good(e=[float("nan")] + [0.0] * 8)),
    "r short": json.dumps(good(r=[0, 0])),
    "r far": json.dumps(good(r=[50, 0, 1])),
    "r zero depth": json.dumps(good(r=[0, 0, 0.01])),
    "r deep": json.dumps(good(r=[0, 0, 7])),
    "r string": json.dumps(good(r=[0, 0, "1"])),
}
# A 400-digit integer: math.isfinite() raises OverflowError on it, which must still end as a plain ValueError.
HUGE = "9" * 400
OVERFLOW = {
    "q huge int": json.dumps(good()).replace('"q": [0.0,', f'"q": [{HUGE},', 1),
    "e huge int": json.dumps(good()).replace('"e": [0.0,', f'"e": [{HUGE},', 1),
    "r huge int": json.dumps(good()).replace('"r": [0.1,', f'"r": [{HUGE},', 1),
    "q huge negative int": json.dumps(good()).replace('"q": [0.0,', f'"q": [-{HUGE},', 1),
    "q float overflow": json.dumps(good()).replace('"q": [0.0,', '"q": [1e999,', 1),
}
BAD.update(OVERFLOW)


@pytest.mark.parametrize("name", list(BAD))
def test_hostile_or_broken_messages_are_rejected(name):
    with pytest.raises(ValueError):
        rig.parse_body_message(BAD[name])


def test_oversized_messages_are_rejected_before_parsing():
    padded = json.dumps(good()) + " " * 6200
    assert len(padded.encode()) > rig.MAX_BODY_BYTES
    with pytest.raises(ValueError, match="large"):
        rig.parse_body_message(padded)
    assert rig.MAX_BODY_BYTES == 6144
    with pytest.raises(ValueError):
        rig.parse_body_message(None)  # type: ignore[arg-type]


def test_shared_limits_match_the_javascript_skeleton():
    node = shutil.which("node")
    if not node:
        pytest.skip("node is not installed")
    uri = (ROOT / "webapp/src/skeleton.js").as_uri()
    code = f"import('{uri}').then(m=>console.log(JSON.stringify([m.BONES.length,m.EXPRESSIONS.length,m.GROUPS.length,m.MAX_Q])))"
    out = subprocess.run([node, "-e", code], capture_output=True, text=True, timeout=30, check=True).stdout
    bones, exprs, groups, max_q = json.loads(out)
    assert (rig.BODY_BONES, rig.BODY_EXPRESSIONS, rig.BODY_GROUPS) == (bones, exprs, groups)
    assert max_q == 4 * rig.BODY_BONES


# --- helpers for sockets and HTTP -----------------------------------------------------------------------
def masked(opcode, payload, fin=True):
    key = os.urandom(4)
    body = bytes(b ^ key[i % 4] for i, b in enumerate(payload))
    n = len(payload)
    b0 = (0x80 if fin else 0) | opcode
    if n < 126:
        head = bytes([b0, 0x80 | n])
    elif n < 65536:
        head = bytes([b0, 0x80 | 126]) + struct.pack("!H", n)
    else:
        head = bytes([b0, 0x80 | 127]) + struct.pack("!Q", n)
    return head + key + body


def handshake(srv, path="/ws/rig", origin="auto", host=None):
    sock = socket.create_connection(("127.0.0.1", srv.port), timeout=10)
    origin = f"http://127.0.0.1:{srv.port}" if origin == "auto" else origin
    lines = [
        f"GET {path} HTTP/1.1",
        f"Host: {host or f'127.0.0.1:{srv.port}'}",
        "Upgrade: websocket",
        "Connection: Upgrade",
        f"Sec-WebSocket-Key: {base64.b64encode(os.urandom(16)).decode()}",
        "Sec-WebSocket-Version: 13",
        f"Cookie: realx_token={TEST_TOKEN}",  # what a browser sends after the first page load
    ]
    if origin:
        lines.append(f"Origin: {origin}")
    sock.sendall(("\r\n".join(lines) + "\r\n\r\n").encode())
    data = b""
    while b"\r\n\r\n" not in data:
        chunk = sock.recv(4096)
        if not chunk:
            break
        data += chunk
    head, _, rest = data.partition(b"\r\n\r\n")
    return sock, head.decode(), rest


class Reader:
    """Reads server frames (text and close) from a socket."""

    def __init__(self, sock, rest=b""):
        self.sock, self.buf = sock, rest

    def frame(self, timeout=5.0):
        """(opcode, payload) of the next frame, or None when the peer closed the connection."""
        end = time.time() + timeout
        while True:
            if len(self.buf) >= 2:
                n, pos = self.buf[1] & 0x7F, 2
                if n == 126 and len(self.buf) >= 4:
                    (n,), pos = struct.unpack("!H", self.buf[2:4]), 4
                if n < 126 or pos > 2:
                    if len(self.buf) >= pos + n:
                        op, payload = self.buf[0] & 0x0F, self.buf[pos : pos + n]
                        self.buf = self.buf[pos + n :]
                        return op, payload
            self.sock.settimeout(max(0.05, end - time.time()))
            try:
                chunk = self.sock.recv(65536)
            except socket.timeout:
                raise AssertionError("timed out waiting for a frame") from None
            except OSError:
                return None
            if not chunk:
                return None
            self.buf += chunk

    def until(self, kind, timeout=8.0):
        """The first text message whose "type" is `kind`."""
        end = time.time() + timeout
        while time.time() < end:
            f = self.frame(timeout=max(0.1, end - time.time()))
            if f is None:
                raise AssertionError(f"connection closed before a {kind!r} message")
            if f[0] == ws.OP_TEXT:
                msg = json.loads(f[1])
                if msg["type"] == kind:
                    return msg
        raise AssertionError(f"no {kind!r} message within {timeout}s")

    def closed_with(self, timeout=5.0):
        """Close code if the server sent a close frame, 'eof' if it just hung up. Fails on a timeout."""
        end = time.time() + timeout
        while time.time() < end:
            f = self.frame(timeout=max(0.1, end - time.time()))
            if f is None:
                return "eof"
            if f[0] == ws.OP_CLOSE:
                return struct.unpack("!H", f[1][:2])[0] if len(f[1]) >= 2 else 1005
        raise AssertionError("connection was not closed")


def get(srv, path, headers=None, method="GET", host=None):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=30)
    c.request(method, path, headers={"Host": host or f"127.0.0.1:{srv.port}", **(headers or {})})
    r = c.getresponse()
    out = (r.status, {k.lower(): v for k, v in r.getheaders()}, r.read())
    c.close()
    return out


@pytest.fixture()
def server():
    """A server in body mode: no video pipeline, so these tests need no model or camera."""
    from realx.server import Engine, Server

    srv = Server(Engine(source="demo:static", mode="body"), port=0)
    srv.start()
    yield srv
    srv.stop()


def body_text(**over):
    return json.dumps(good(**over))


# --- /mp routes ---------------------------------------------------------------------------------------
def test_wasm_runtime_files_are_served_from_a_whitelist(server):
    wasm_dir = ROOT / "src/realx/web/mp/wasm"
    names = sorted(p.name for p in wasm_dir.iterdir() if re.fullmatch(r"[a-z0-9_]+\.(js|wasm)", p.name))
    assert names, "the MediaPipe runtime is bundled"
    for name in names:
        status, h, data = get(server, f"/mp/wasm/{name}")
        assert status == 200, name
        assert h["content-type"].startswith("application/wasm" if name.endswith(".wasm") else "text/javascript")
        assert h["x-content-type-options"] == "nosniff"
        assert len(data) == (wasm_dir / name).stat().st_size
    for bad in ("nope.js", "../avatar.html", "..%2favatar.html", "%2e%2e/avatar.html", "vision_wasm_internal.wasm/", "a%20b.js", ""):
        assert get(server, f"/mp/wasm/{bad}")[0] == 404, bad
    assert get(server, "/mp/wasm")[0] == 404


@pytest.fixture()
def fake_models(tmp_path, monkeypatch):
    """Three small stand-ins for the MediaPipe models, with matching pinned hashes. Nothing is downloaded."""
    from realx import models, server as server_mod

    monkeypatch.setenv("REALX_MODELS_DIR", str(tmp_path))
    contents = {}
    for key in ("mp_face", "mp_pose", "mp_hand"):
        spec = models.MANIFEST[key]
        data = (key + "-bytes-").encode() * 100
        (tmp_path / spec.filename).write_bytes(data)
        monkeypatch.setitem(models.MANIFEST, key, dataclasses.replace(spec, sha256=hashlib.sha256(data).hexdigest()))
        contents[spec.filename] = data
    monkeypatch.setattr(server_mod, "ensure_model", models.ensure_model)
    return contents


def test_model_files_are_served_after_a_hash_check(server, fake_models):
    for name, data in fake_models.items():
        status, h, body = get(server, f"/mp/models/{name}")
        assert status == 200 and body == data, name
        assert h["content-type"].startswith("application/octet-stream")
    for bad in ("face_detection_yunet_2023mar.onnx", "../models/x", "%2e%2e/x", "inswapper_128.onnx", "face_landmarker.task/", ""):
        assert get(server, f"/mp/models/{bad}")[0] == 404, bad


def test_a_tampered_or_unavailable_model_is_a_503_and_never_served(server, fake_models, tmp_path, monkeypatch):
    from realx import models, server as server_mod

    name = models.MANIFEST["mp_pose"].filename
    (tmp_path / name).write_bytes(b"tampered")
    status, _, body = get(server, f"/mp/models/{name}")
    assert status == 503 and b"tampered" not in body and "error" in json.loads(body)

    def boom(*_a, **_k):
        raise models.ModelError("offline")

    hand = models.MANIFEST["mp_hand"].filename
    assert get(server, f"/mp/models/{hand}")[0] == 200  # verified once, now cached in memory
    monkeypatch.setattr(server_mod, "ensure_model", boom)
    assert get(server, f"/mp/models/{hand}")[0] == 200, "a cached, verified model needs no second download"
    assert get(server, f"/mp/models/{models.MANIFEST['mp_face'].filename}")[0] == 503, "an uncached model is refused"
    # a fresh server has an empty cache, so even the hand model is refused there
    from realx.server import Engine, Server

    fresh = Server(Engine(source="demo:static", mode="body"), port=0)
    fresh.start()
    try:
        assert get(fresh, f"/mp/models/{hand}")[0] == 503
    finally:
        fresh.stop()


def test_mp_routes_apply_the_same_host_and_site_checks(server, fake_models):
    name = next(iter(fake_models))
    assert get(server, f"/mp/models/{name}", host="evil.example")[0] == 403
    assert get(server, "/mp/wasm/vision_wasm_internal.js", host="evil.example")[0] == 403
    assert get(server, f"/mp/models/{name}", headers={"Sec-Fetch-Site": "cross-site"})[0] == 403
    c = http.client.HTTPConnection("127.0.0.1", server.port, timeout=10)
    c.request("POST", f"/mp/models/{name}", body=b"x", headers={"Host": f"127.0.0.1:{server.port}", "Content-Type": "application/json"})
    assert c.getresponse().status == 404


# --- policy headers -----------------------------------------------------------------------------------
def test_avatar_page_may_compile_wasm_but_never_eval_and_may_use_the_camera(server):
    status, h, _ = get(server, "/avatar")
    csp = h["content-security-policy"]
    assert status == 200 and "'wasm-unsafe-eval'" in csp and "'unsafe-eval'" not in csp
    assert h["permissions-policy"] == "camera=(self), microphone=(), geolocation=()"
    assert "script-src 'self' 'wasm-unsafe-eval'" in csp
    _, h, _ = get(server, "/")
    assert h["permissions-policy"] == "camera=(self), microphone=(), geolocation=()"
    assert "wasm-unsafe-eval" not in h["content-security-policy"], "the control room itself never needs it"


# --- publishing ---------------------------------------------------------------------------------------
def test_published_body_reaches_a_viewer_in_canonical_form(server):
    viewer, head, rest = handshake(server)
    assert head.startswith("HTTP/1.1 101")
    vr = Reader(viewer, rest)
    assert vr.until("hello")
    pub, head, rest = handshake(server, "/ws/rig?publish=1")
    assert head.startswith("HTTP/1.1 101")
    pr = Reader(pub, rest)
    assert pr.until("hello")["provenance"]["synthetic"] is True, "a publisher is told what the stream is, too"
    raw = json.dumps(good(r=[0.123456, 0, 1]), indent=2)
    pub.sendall(masked(ws.OP_TEXT, raw.encode()))
    got = vr.until("body")
    assert got == json.loads(rig.parse_body_message(raw))
    stats = server.engine.stats()
    assert stats["body"]["publishing"] is True and stats["body"]["viewers"] >= 1
    pub.sendall(masked(ws.OP_CLOSE, b"\x03\xe8"))
    pub.close()
    viewer.close()


def test_latest_body_wins_and_a_late_viewer_gets_only_a_fresh_one(server, monkeypatch):
    from realx import server as server_mod

    pub, head, rest = handshake(server, "/ws/rig?publish=1")
    Reader(pub, rest).until("hello")
    for n in range(5):
        pub.sendall(masked(ws.OP_TEXT, body_text(f=n).encode()))
    deadline = time.time() + 5
    while time.time() < deadline and not (server.engine.body_snapshot() and json.loads(server.engine.body_snapshot())["f"] == 4):
        time.sleep(0.02)
    assert json.loads(server.engine.body_snapshot())["f"] == 4
    late, head, rest = handshake(server)
    assert Reader(late, rest).until("body")["f"] == 4
    late.close()
    monkeypatch.setattr(server_mod, "BODY_MAX_AGE", 0.15)
    time.sleep(0.3)
    assert server.engine.body_snapshot() is None, "an old body is not resent"
    old, head, rest = handshake(server)
    r = Reader(old, rest)
    seen = set()
    end = time.time() + 1.0
    while time.time() < end:
        f = r.frame(timeout=1.0)
        if f and f[0] == ws.OP_TEXT:
            seen.add(json.loads(f[1])["type"])
    assert "body" not in seen and "rig" in seen
    old.close()
    pub.close()


def test_a_second_publisher_is_refused_until_the_first_leaves(server):
    first, head, rest = handshake(server, "/ws/rig?publish=1")
    assert head.startswith("HTTP/1.1 101")
    Reader(first, rest).until("hello")
    second, head, _ = handshake(server, "/ws/rig?publish=1")
    assert head.split()[1] == "409"
    second.close()
    first.sendall(masked(ws.OP_CLOSE, b"\x03\xe8"))
    first.close()
    deadline = time.time() + 5
    while True:
        third, head, rest = handshake(server, "/ws/rig?publish=1")
        if head.startswith("HTTP/1.1 101") or time.time() > deadline:
            break
        third.close()
        time.sleep(0.1)
    assert head.startswith("HTTP/1.1 101"), head
    third.close()


def test_publisher_disconnect_clears_the_body_and_the_publishing_flag(server):
    pub, head, rest = handshake(server, "/ws/rig?publish=1")
    Reader(pub, rest).until("hello")
    pub.sendall(masked(ws.OP_TEXT, body_text().encode()))
    deadline = time.time() + 5
    while time.time() < deadline and not server.engine.body_snapshot():
        time.sleep(0.02)
    assert server.engine.body_snapshot() and server.engine.stats()["body"]["publishing"]
    pub.close()
    deadline = time.time() + 5
    while time.time() < deadline and server.engine.stats()["body"]["publishing"]:
        time.sleep(0.05)
    assert not server.engine.stats()["body"]["publishing"] and server.engine.body_snapshot() is None


@pytest.mark.parametrize(
    "payload",
    [
        pytest.param(b"not json", id="not json"),
        pytest.param(json.dumps(good(f=99)).encode(), id="bad flags"),
        pytest.param(json.dumps(good(q=[0] * 212)).encode(), id="zero quaternions"),
    ]
    + [pytest.param(text.encode(), id=name) for name, text in OVERFLOW.items()],
)
def test_an_invalid_message_closes_the_publisher_with_1008_and_is_not_relayed(server, payload):
    viewer, head, rest = handshake(server)
    vr = Reader(viewer, rest)
    pub, head, rest = handshake(server, "/ws/rig?publish=1")
    pr = Reader(pub, rest)
    pr.until("hello")
    pub.sendall(masked(ws.OP_TEXT, payload))
    assert pr.closed_with() == 1008
    assert server.engine.body_snapshot() is None
    end = time.time() + 0.6
    while time.time() < end:
        f = vr.frame(timeout=0.6)
        assert not (f and f[0] == ws.OP_TEXT and json.loads(f[1])["type"] == "body")
    pub.close()
    viewer.close()


def _wait_until_idle(server):
    deadline = time.time() + 5
    while time.time() < deadline and server.engine.stats()["body"]["publishing"]:
        time.sleep(0.05)
    assert not server.engine.stats()["body"]["publishing"], "the publisher slot must be released"


@pytest.mark.parametrize(
    "name,frame,code",
    [
        ("oversized text", masked(ws.OP_TEXT, b"x" * 7000), 1009),
        ("unmasked", bytes([0x81, 0x02]) + b"hi", 1002),
        ("fragmented", masked(ws.OP_TEXT, b"{}", fin=False), 1002),
        ("bad utf8", masked(ws.OP_TEXT, b"\xff\xfe\xfd"), 1007),
        ("binary", masked(0x2, b"\x00\x01\x02"), 1003),
        ("stray continuation", masked(0x0, b"abc"), 1003),
        ("reserved opcode", masked(0x3, b"abc"), 1003),
        ("reserved control opcode", masked(0xB, b""), 1003),
        ("oversized ping", masked(ws.OP_PING, b"p" * 126), 1002),
        ("oversized close", masked(ws.OP_CLOSE, b"\x03\xe8" + b"c" * 130), 1002),
    ],
)
def test_malformed_unsupported_and_oversized_frames_close_with_the_matching_code(server, name, frame, code):
    pub, head, rest = handshake(server, "/ws/rig?publish=1")
    assert head.startswith("HTTP/1.1 101"), name
    pr = Reader(pub, rest)
    pr.until("hello")
    pub.sendall(frame)
    assert pr.closed_with() == code, name
    assert server.engine.body_snapshot() is None, name
    pub.close()
    _wait_until_idle(server)


def test_a_viewer_that_sends_binary_is_closed_too(server):
    viewer, head, rest = handshake(server)
    vr = Reader(viewer, rest)
    vr.until("hello")
    viewer.sendall(masked(0x2, b"\x00"))
    assert vr.closed_with() == 1003
    viewer.close()


@pytest.mark.parametrize("opcode", [ws.OP_TEXT, ws.OP_PING, ws.OP_PONG])
def test_every_client_frame_counts_toward_the_rate_cap(server, monkeypatch, opcode):
    from realx import server as server_mod

    monkeypatch.setattr(server_mod, "PUBLISH_RATE_LIMIT", 8)
    pub, head, rest = handshake(server, "/ws/rig?publish=1")
    pr = Reader(pub, rest)
    pr.until("hello")
    payload = body_text().encode() if opcode == ws.OP_TEXT else b"ping"
    for _ in range(40):  # far more than the limit, but few enough to fit the socket buffers
        pub.sendall(masked(opcode, payload))
    assert pr.closed_with(timeout=8) == 1008
    pub.close()
    _wait_until_idle(server)


def test_a_flood_of_valid_messages_is_cut_off_by_the_default_cap_too(server):
    from realx import server as server_mod

    pub, head, rest = handshake(server, "/ws/rig?publish=1")
    pr = Reader(pub, rest)
    pr.until("hello")
    frame = masked(ws.OP_TEXT, body_text().encode())
    for _ in range(server_mod.PUBLISH_RATE_LIMIT + 60):
        pub.sendall(frame)
    assert pr.closed_with(timeout=8) == 1008
    pub.close()


def test_a_silent_publisher_is_dropped_after_the_idle_timeout(server, monkeypatch):
    from realx import server as server_mod

    monkeypatch.setattr(server_mod, "PUBLISH_IDLE_SECONDS", 0.6)
    pub, head, rest = handshake(server, "/ws/rig?publish=1")
    pr = Reader(pub, rest)
    pr.until("hello")
    assert pr.closed_with(timeout=6) == 1001
    pub.close()


def test_pings_alone_do_not_keep_a_publisher_alive(server, monkeypatch):
    from realx import server as server_mod

    monkeypatch.setattr(server_mod, "PUBLISH_IDLE_SECONDS", 0.8)
    pub, head, rest = handshake(server, "/ws/rig?publish=1")
    pr = Reader(pub, rest)
    pr.until("hello")
    end = time.time() + 4
    code, pongs = None, 0
    while code is None and time.time() < end:
        try:
            pub.sendall(masked(ws.OP_PING, b"hi"))
        except OSError:
            break
        try:
            f = pr.frame(timeout=0.2)
        except AssertionError:  # nothing came back within the wait
            continue
        if f is None:
            break
        if f[0] == ws.OP_PONG:
            pongs += 1
        elif f[0] == ws.OP_CLOSE:
            code = struct.unpack("!H", f[1][:2])[0]
        time.sleep(0.1)  # a polite ping rate, well under the cap
    assert pongs >= 2, "pings were answered while the publisher was still welcome"
    assert code == 1001, "only real body messages count as activity"
    pub.close()


def test_an_unexpected_server_error_closes_with_1011_and_frees_the_slot(server, monkeypatch):
    from realx import server as server_mod

    def explode(_text):
        raise RuntimeError("boom")

    monkeypatch.setattr(server_mod, "parse_body_message", explode)
    pub, head, rest = handshake(server, "/ws/rig?publish=1")
    pr = Reader(pub, rest)
    pr.until("hello")
    pub.sendall(masked(ws.OP_TEXT, body_text().encode()))
    assert pr.closed_with() == 1011
    pub.close()
    _wait_until_idle(server)
    monkeypatch.undo()
    again, head, rest = handshake(server, "/ws/rig?publish=1")
    assert head.startswith("HTTP/1.1 101"), "the server survived and accepts a new tracker"
    again.close()


def test_publishing_needs_the_same_origin_as_viewing(server):
    for kw in ({"origin": "http://evil.example"}, {"origin": None}, {"host": "evil.example"}):
        sock, head, _ = handshake(server, "/ws/rig?publish=1", **kw)
        assert head.split()[1] == "403", kw
        sock.close()
    assert server.engine.stats()["body"]["publishing"] is False


# --- body mode ----------------------------------------------------------------------------------------
class FakeCamera:
    """Stands in for the Python camera: counts how often it is opened and closed."""

    def __init__(self):
        self.opened = 0
        self.closed = threading.Event()
        self.close_count = 0

    def source(self):
        self.opened += 1
        self.closed.clear()
        cam = self

        class Frames:
            def __iter__(self):
                return self

            def __next__(self):
                time.sleep(0.01)
                return FrameContext(pixels=np.zeros((48, 64, 3), np.uint8))

            def close(self):
                cam.close_count += 1
                cam.closed.set()

        return Frames()


def test_body_mode_releases_the_python_camera_and_keeps_the_heartbeat(monkeypatch):
    from realx.server import Engine

    cam = FakeCamera()
    monkeypatch.setattr(Engine, "_open", lambda self, source: cam.source())
    eng = Engine(source="camera", mode="original")
    eng.start()
    try:
        deadline = time.time() + 10
        while time.time() < deadline and eng.stats()["frames"] < 3:
            time.sleep(0.05)
        assert cam.opened == 1 and eng.stats()["frames"] >= 3
        eng.update({"mode": "body"})
        assert cam.closed.wait(5), "switching to body mode must release the camera"
        frames = eng.stats()["frames"]
        rev = -1
        revs = []
        for _ in range(3):  # the engine keeps beating, so emotes and viewers keep working
            _, rev = eng.wait_rig(rev, timeout=1.0)
            revs.append(rev)
        assert len(set(revs)) == 3
        assert eng.stats()["frames"] == frames and cam.opened == 1
        assert eng.stats()["body"] == {"publishing": False, "viewers": 0}
        eng.emote("wave")
        message, _ = eng.wait_rig(rev, timeout=1.0)
        assert json.loads(message)["emote"]["name"] == "wave"
        eng.update({"mode": "original"})
        deadline = time.time() + 10
        while time.time() < deadline and cam.opened < 2:
            time.sleep(0.05)
        assert cam.opened == 2, "leaving body mode opens the source again"
    finally:
        eng.stop()


def test_body_mode_is_a_valid_setting_and_publishing_does_not_need_it():
    from realx.server import MODES, Engine

    assert "body" in MODES
    eng = Engine(source="demo:static", mode="avatar")
    assert eng.update({"mode": "body"})["mode"] == "body"
    with pytest.raises(ValueError):
        eng.update({"mode": "bodyx"})
    eng2 = Engine(source="demo:static", mode="avatar")
    assert eng2.claim_publisher() is True and eng2.claim_publisher() is False
    eng2.publish_body(rig.parse_body_message(body_text()))
    assert eng2.body_snapshot() is not None
    eng2.release_publisher()
    assert eng2.body_snapshot() is None and eng2.claim_publisher() is True


def test_viewer_wakes_on_a_new_body_even_when_no_video_frame_arrives():
    from realx.server import Engine

    eng = Engine(source="demo:static", mode="body")  # never started: only the publish path produces revisions
    update = eng.wait_update(-1, timeout=0.05)
    seen = update.rev
    text = rig.parse_body_message(body_text())
    t = threading.Timer(0.1, eng.publish_body, args=(text,))
    t.start()
    started = time.time()
    update = eng.wait_update(seen, timeout=2.0)
    t.join()
    assert update.body == text and update.rev != seen and time.time() - started < 1.5
    assert math.isfinite(update.body_seq)


# --- caching, downloads and who may open the camera page ------------------------------------------------
def test_pinned_assets_are_cacheable_and_everything_else_is_not(server, fake_models):
    name = next(iter(fake_models))
    for path in ("/mp/wasm/vision_wasm_internal.js", "/mp/wasm/vision_wasm_internal.wasm", f"/mp/models/{name}"):
        status, h, _ = get(server, path)
        assert status == 200 and h["cache-control"] == "private, max-age=3600", path
    for path in ("/", "/app.js", "/avatar", "/avatar.bundle.js", "/avatar/model.vrm", "/api/stats"):
        status, h, _ = get(server, path)
        assert status == 200 and h["cache-control"] == "no-store", path
    status, h, _ = get(server, "/mp/models/nope.task")
    assert status == 404 and h["cache-control"] == "no-store", "errors are never cached"


def test_a_slow_download_of_one_model_does_not_block_the_others(server, fake_models, monkeypatch):
    from realx import models, server as server_mod

    slow_started, release = threading.Event(), threading.Event()

    def ensure(key, *a, **k):
        if key == "mp_pose":
            slow_started.set()
            release.wait(20)  # a model "still downloading"
        return models.ensure_model(key)

    monkeypatch.setattr(server_mod, "ensure_model", ensure)
    pose, hand, face = (models.MANIFEST[k].filename for k in ("mp_pose", "mp_hand", "mp_face"))
    slow = {}
    t = threading.Thread(target=lambda: slow.update(r=get(server, f"/mp/models/{pose}")))
    t.start()
    try:
        assert slow_started.wait(5)
        started = time.time()
        assert get(server, f"/mp/models/{hand}")[0] == 200
        assert get(server, f"/mp/models/{face}")[0] == 200
        assert time.time() - started < 5, "other models were served while the pose download was still running"
        assert t.is_alive(), "the slow request really was still waiting"
    finally:
        release.set()
        t.join(20)
    assert slow["r"][0] == 200 and slow["r"][2] == fake_models[pose]


def post_config(srv, changes):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
    c.request("POST", "/api/config", body=json.dumps(changes), headers={"Host": f"127.0.0.1:{srv.port}", "Content-Type": "application/json"})
    r = c.getresponse()
    r.read()
    c.close()
    return r.status


def test_switching_to_body_mode_starts_one_background_prefetch(fake_models, monkeypatch):
    from realx import models, server as server_mod
    from realx.server import Engine, Server

    calls, lock = [], threading.Lock()

    def ensure(key, *a, **k):
        with lock:
            calls.append(key)
        return models.ensure_model(key)

    monkeypatch.setattr(server_mod, "ensure_model", ensure)
    srv = Server(Engine(source="demo:static", mode="original"), port=0)
    srv.start()
    try:
        assert post_config(srv, {"smoothing": 0.5}) == 200
        time.sleep(0.3)
        assert calls == [], "only switching to body mode prefetches"
        assert post_config(srv, {"mode": "body"}) == 200
        deadline = time.time() + 10
        while time.time() < deadline and len(set(calls)) < 3:
            time.sleep(0.05)
        assert set(calls) == {"mp_face", "mp_pose", "mp_hand"}
        before = len(calls)
        assert post_config(srv, {"mode": "original"}) == 200 and post_config(srv, {"mode": "body"}) == 200
        time.sleep(0.4)
        assert len(calls) == before, "the prefetch runs once"
    finally:
        srv.stop()


def test_a_failing_prefetch_is_swallowed(monkeypatch):
    from realx import models, server as server_mod
    from realx.server import Engine, Server

    def boom(*_a, **_k):
        raise models.ModelError("offline")

    monkeypatch.setattr(server_mod, "ensure_model", boom)
    srv = Server(Engine(source="demo:static", mode="original"), port=0)
    srv.start()
    try:
        assert post_config(srv, {"mode": "body"}) == 200
        time.sleep(0.4)
        assert get(srv, "/api/stats")[0] == 200
    finally:
        srv.stop()


@pytest.mark.parametrize("site", ["cross-site", "same-site"])
@pytest.mark.parametrize("dest", [None, "document", "iframe"])
def test_the_camera_page_cannot_be_opened_from_another_site(server, site, dest):
    headers = {"Sec-Fetch-Site": site, **({"Sec-Fetch-Dest": dest} if dest else {})}
    for path in ("/avatar?track=1&publish=1", "/avatar", "/"):
        assert get(server, path, headers=headers)[0] == 403, (path, site, dest)


@pytest.mark.parametrize("site", ["same-origin", "none", None])
def test_the_camera_page_opens_for_the_user_and_for_the_control_room(server, site):
    for dest in (None, "document", "iframe"):
        headers = {**({"Sec-Fetch-Site": site} if site else {}), **({"Sec-Fetch-Dest": dest} if dest else {})}
        status, h, _ = get(server, "/avatar?track=1&publish=1&preview=1", headers=headers)
        assert status == 200 and "camera=(self)" in h["permissions-policy"], (site, dest)
