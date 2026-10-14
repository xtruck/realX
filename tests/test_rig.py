import base64
import json
import math
import os
import socket
import struct
import time

import numpy as np
import pytest
from conftest import TEST_TOKEN

from realx import ws
from realx.rig import TRACKED, RigSolver, hello_message, rig_message
from realx.types import Face


def make_face(track_id=1, center=(320, 240), size=160, yaw=0.0, pitch_ratio=0.5, roll=0.0, smile=1.0):
    """A face whose 5 landmarks follow the geometry the solver assumes."""
    iod = size * 0.4
    c = np.array(center, dtype=float)
    axis = np.array([math.cos(roll), math.sin(roll)])
    down = np.array([-axis[1], axis[0]])
    eye_mid = c - down * size * 0.1
    e0, e1 = eye_mid - axis * iod / 2, eye_mid + axis * iod / 2
    mouth_mid = eye_mid + down * iod * 1.1
    nose = eye_mid + axis * math.sin(yaw) * 0.6 * iod + down * (iod * 1.1) * pitch_ratio
    half = iod * 0.4 * smile
    lm = np.array([e0, e1, nose, mouth_mid - axis * half, mouth_mid + axis * half])
    box = np.array([c[0] - size / 2, c[1] - size / 2, c[0] + size / 2, c[1] + size / 2])
    return Face(bbox=box, landmarks=lm, track_id=track_id)


def settle(solver, **kw):
    for _ in range(25):
        out = solver.solve([make_face(**kw)], (640, 480))
    return out[0]


def test_neutral_face_reads_as_neutral_after_calibration():
    s = settle(RigSolver())
    assert abs(s["yaw"]) < 0.05 and abs(s["pitch"]) < 0.05 and abs(s["roll"]) < 0.05
    assert s["depth"] == pytest.approx(1.0, abs=0.01) and s["smile"] == pytest.approx(0.0, abs=0.05)


def test_head_turn_tilt_and_nod_have_the_documented_signs():
    solver = RigSolver()
    settle(solver)
    right = solver.solve([make_face(yaw=0.5)], (640, 480))[0]
    left = solver.solve([make_face(yaw=-0.5)], (640, 480))[0]
    assert right["yaw"] > 0.3 > -left["yaw"] * 0 and left["yaw"] < -0.3  # toward image right is positive
    tilt = solver.solve([make_face(roll=0.4)], (640, 480))[0]
    assert tilt["roll"] == pytest.approx(0.4, abs=0.02)  # top of head toward image right is positive
    up = solver.solve([make_face(pitch_ratio=0.38)], (640, 480))[0]
    down = solver.solve([make_face(pitch_ratio=0.62)], (640, 480))[0]
    assert up["pitch"] > 0.1 and down["pitch"] < -0.1


def test_smile_and_depth_follow_the_face():
    solver = RigSolver()
    settle(solver)
    wide = solver.solve([make_face(smile=1.4)], (640, 480))[0]
    assert wide["smile"] > 0.2
    near = solver.solve([make_face(size=240)], (640, 480))[0]
    assert near["depth"] == pytest.approx(1.5, abs=0.05)


def test_position_is_normalized_and_biggest_face_comes_first():
    solver = RigSolver()
    faces = [make_face(1, (100, 100), 60), make_face(2, (480, 360), 200)]
    out = solver.solve(faces, (640, 480))
    assert [f["id"] for f in out] == [2, 1]
    assert out[0]["x"] == pytest.approx(0.5, abs=0.01) and out[0]["y"] == pytest.approx(0.5, abs=0.01)


def test_bad_input_never_produces_nan_or_crashes():
    solver = RigSolver()
    bad = make_face()
    bad.landmarks[2] = np.nan
    out = solver.solve([bad, Face(bbox=np.array([5, 5, 5, 5.0]), track_id=3), Face(bbox=np.zeros(4))], (640, 480))
    assert len(out) == 1 and all(math.isfinite(v) for v in out[0].values() if isinstance(v, float))
    flat = make_face()
    flat.landmarks[1] = flat.landmarks[0]  # zero eye distance
    assert solver.solve([flat], (640, 480))[0]["yaw"] == 0.0


def test_messages_carry_numbers_and_an_honest_provenance_statement_only():
    msg = rig_message(7, 1.23456789, (640, 480), [{"id": 1, "yaw": 0.123456789, "predicted": False}])
    assert msg["faces"][0]["yaw"] == 0.1235 and msg["type"] == "rig"
    hello = hello_message("9.9")
    assert hello["provenance"]["synthetic"] is True and hello["provenance"]["real_person_likeness"] is False
    assert hello["tracked"] == list(TRACKED) and "blink" not in hello["tracked"]


# --- websocket framing -------------------------------------------------------------
def masked(opcode, payload, key=b"\x01\x02\x03\x04"):
    body = bytes(b ^ key[i % 4] for i, b in enumerate(payload))
    n = len(payload)
    head = bytes([0x80 | opcode, 0x80 | n]) if n < 126 else bytes([0x80 | opcode, 0x80 | 126]) + struct.pack("!H", n)
    return head + key + body


def test_accept_key_matches_the_rfc_example():
    assert ws.accept_key("dGhlIHNhbXBsZSBub25jZQ==") == "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="


@pytest.mark.parametrize("n", [0, 5, 125, 126, 70000])
def test_text_frames_round_trip_all_length_forms(n):
    frame = ws.encode_text("a" * n)
    assert frame[0] == 0x81
    body = frame[{True: 2, False: 4}[n < 126] if n < 65536 else 10 :]
    assert body == b"a" * n


def test_client_frames_are_parsed_and_abuse_is_rejected():
    assert ws.parse_client_frame(masked(ws.OP_PING, b"hi")) == (ws.OP_PING, b"hi", 8)
    assert ws.parse_client_frame(masked(ws.OP_PING, b"hi")[:5]) is None
    with pytest.raises(ws.WebSocketError):
        ws.parse_client_frame(bytes([0x81, 0x02]) + b"hi")  # unmasked
    with pytest.raises(ws.WebSocketError):
        ws.parse_client_frame(bytes([0x81, 0x80 | 127]) + struct.pack("!Q", 1 << 40) + b"\0" * 4)  # huge
    with pytest.raises(ws.WebSocketError):
        ws.parse_client_frame(bytes([0x01, 0x80, 0, 0, 0, 0]))  # fragmented
    assert ws.valid_client_key(base64.b64encode(os.urandom(16)).decode())
    assert not ws.valid_client_key("short") and not ws.valid_client_key(None)


# --- server: /ws/rig, /avatar ------------------------------------------------------
@pytest.fixture(scope="module")
def server():
    from realx.models import ensure_model

    try:
        ensure_model("yunet")
    except Exception as exc:
        pytest.skip(f"yunet model unavailable: {exc}")
    pytest.importorskip("cv2")
    pytest.importorskip("skimage")
    from realx.server import Engine, Server

    srv = Server(Engine(source="demo:dance"), port=0)
    srv.start()
    deadline = time.time() + 20
    while time.time() < deadline and srv.engine.stats()["frames"] < 5:
        time.sleep(0.1)
    yield srv
    srv.stop()


def handshake(server, origin="auto", host=None, key=None, extra=""):
    sock = socket.create_connection(("127.0.0.1", server.port), timeout=10)
    key = key or base64.b64encode(os.urandom(16)).decode()
    origin = f"http://127.0.0.1:{server.port}" if origin == "auto" else origin
    lines = [
        "GET /ws/rig HTTP/1.1",
        f"Host: {host or f'127.0.0.1:{server.port}'}",
        "Upgrade: websocket",
        "Connection: Upgrade",
        f"Sec-WebSocket-Key: {key}",
        "Sec-WebSocket-Version: 13",
        f"Cookie: realx_token={TEST_TOKEN}",  # what a browser sends after the first page load
    ]
    if origin:
        lines.append(f"Origin: {origin}")
    sock.sendall(("\r\n".join(lines) + "\r\n" + extra + "\r\n").encode())
    data = b""
    while b"\r\n\r\n" not in data:
        data += sock.recv(4096)
    head, _, rest = data.partition(b"\r\n\r\n")
    return sock, head.decode(), rest, key


def read_text_frame(sock, rest=b""):
    buf = rest
    while len(buf) < 2:
        buf += sock.recv(4096)
    n, pos = buf[1] & 0x7F, 2
    if n == 126:
        while len(buf) < 4:
            buf += sock.recv(4096)
        (n,), pos = struct.unpack("!H", buf[2:4]), 4
    while len(buf) < pos + n:
        buf += sock.recv(4096)
    return buf[pos : pos + n].decode(), buf[pos + n :]


def test_rig_socket_sends_hello_then_live_rig_numbers(server):
    sock, head, rest, key = handshake(server)
    assert head.startswith("HTTP/1.1 101") and ws.accept_key(key) in head
    text, rest = read_text_frame(sock, rest)
    assert json.loads(text)["type"] == "hello"
    msgs = []
    for _ in range(40):
        text, rest = read_text_frame(sock, rest)
        msgs.append(json.loads(text))
        if msgs[-1]["faces"]:
            break
    face = msgs[-1]["faces"][0]
    assert msgs[-1]["type"] == "rig" and {"yaw", "pitch", "roll", "x", "y", "depth", "smile"} <= set(face)
    assert "pixels" not in json.dumps(msgs[-1])  # numbers only, never image data
    sock.sendall(masked(ws.OP_PING, b"x"))
    sock.sendall(masked(ws.OP_CLOSE, b"\x03\xe8"))
    sock.close()


def test_rig_socket_refuses_foreign_pages_and_bad_handshakes(server):
    for kw in ({"origin": "http://evil.example"}, {"origin": None}, {"host": "evil.example"}):
        sock, head, _, _ = handshake(server, **kw)
        assert head.split()[1] == "403", kw
        sock.close()
    sock, head, _, _ = handshake(server, key="not-a-key")
    assert head.split()[1] == "400"
    sock.close()


def test_avatar_page_model_and_bundle_are_served_with_tight_policy(server):
    import http.client

    def get(path):
        c = http.client.HTTPConnection("127.0.0.1", server.port, timeout=10)
        c.request("GET", path, headers={"Host": f"127.0.0.1:{server.port}"})
        r = c.getresponse()
        return r.status, {k.lower(): v for k, v in r.getheaders()}, r.read()

    status, h, body = get("/avatar")
    assert status == 200 and b"avatar.bundle.js" in body and "'unsafe-eval'" not in h["content-security-policy"]
    assert f"ws://127.0.0.1:{server.port}" in h["content-security-policy"]
    status, _, model = get("/avatar/model.vrm")
    assert status == 200 and model[:4] == b"glTF"
    status, h, js = get("/avatar.bundle.js")
    assert status == 200 and len(js) > 100_000
    assert get("/favicon.ico")[0] == 204


def test_character_mode_skips_the_video_encode_but_keeps_rig_flowing(server):
    from realx.server import MODES

    assert "character" in MODES
    server.engine.update({"mode": "character"})
    try:
        time.sleep(1.0)
        sock, head, rest, _ = handshake(server)
        text, rest = read_text_frame(sock, rest)
        text, rest = read_text_frame(sock, rest)
        assert json.loads(text)["type"] == "rig"
        sock.close()
    finally:
        server.engine.update({"mode": "avatar"})
