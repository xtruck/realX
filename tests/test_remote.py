"""The remote adapter, with a fake transport only. These tests prove exactly what would be serialised and
that every gate (opt-in, allowlist, credential, timeout, cancel, size) holds. No socket is ever opened:
the network is patched to fail the test if anything tries."""

from __future__ import annotations

import ast
import json
import logging
import socket
import threading
import time
from pathlib import Path

import numpy as np
import pytest

import realx.remote as remote
from realx.remote import (
    FakeTransport, RemoteAdapter, RemoteCancelled, RemoteConfig, RemoteDisabled, RemoteError, RemoteRequest,
    RemoteResponse, RemoteTimeout, Transport, parse_response, serialize_rig,
)

URL = "https://rig.example.com/v1/refine"
TOKEN = "tok-SECRET-0123456789abcdef"
RIG = {"x": 0.1, "y": -0.2, "scale": 0.25, "depth": 1.0, "yaw": 0.3, "pitch": -0.1, "roll": 0.05, "smile": 0.5}


@pytest.fixture(autouse=True)
def no_network(monkeypatch):
    def boom(*a, **k):
        raise AssertionError("the remote adapter tried to use the network")

    monkeypatch.setattr(socket.socket, "connect", boom)
    monkeypatch.setattr(socket, "getaddrinfo", boom)
    monkeypatch.setattr(socket, "create_connection", boom)
    monkeypatch.delenv(remote.REMOTE_ENV, raising=False)
    monkeypatch.setenv(remote.DEFAULT_TOKEN_ENV, TOKEN)


def cfg(**kw):
    base = dict(enabled=True, url=URL, allowed_hosts=("rig.example.com",), timeout_s=2.0)
    base.update(kw)
    return RemoteConfig(**base)


# --- what is serialised --------------------------------------------------------------------------------
def test_the_exact_bytes_are_eight_numbers_a_version_and_a_sequence_number():
    body = serialize_rig(RIG, 7)
    assert body == (b'{"rig":{"depth":1.0,"pitch":-0.1,"roll":0.05,"scale":0.25,"smile":0.5,"x":0.1,"y":-0.2,"yaw":0.3},'
                    b'"seq":7,"v":1}')
    assert set(json.loads(body)["rig"]) == set(remote.RIG_FIELDS)


@pytest.mark.parametrize("extra", [
    {"id": 3}, {"predicted": True}, {"frame": [640, 480]}, {"image": b"\xff\xd8\xff"}, {"pixels": np.zeros((4, 4, 3), np.uint8)},
    {"name": "Alice"}, {"portrait": "data"}, {"landmarks": [[1, 2]]},
])
def test_nothing_but_the_eight_numbers_can_be_serialised(extra):
    with pytest.raises(RemoteError, match="not allowed to send"):
        serialize_rig({**RIG, **extra}, 0)


def test_the_error_for_an_unexpected_field_does_not_echo_its_name_or_value():
    with pytest.raises(RemoteError) as info:
        serialize_rig({**RIG, "alice@example.com": "secret"}, 0)
    assert "alice" not in str(info.value) and "secret" not in str(info.value)


@pytest.mark.parametrize("bad", [float("nan"), float("inf"), 99.0, -99.0, True, "0.1", None, [0.1], np.float32(0.1) * np.ones(2)])
def test_each_value_must_be_a_finite_number_inside_its_range(bad):
    with pytest.raises(RemoteError):
        serialize_rig({**RIG, "yaw": bad}, 0)


def test_a_missing_field_a_non_mapping_and_a_bad_sequence_number_are_refused():
    with pytest.raises(RemoteError, match="missing"):
        serialize_rig({k: v for k, v in RIG.items() if k != "smile"}, 0)
    with pytest.raises(RemoteError):
        serialize_rig([1, 2, 3], 0)  # type: ignore[arg-type]
    for seq in (-1, True, 2**40, 1.5):
        with pytest.raises(RemoteError):
            serialize_rig(RIG, seq)  # type: ignore[arg-type]


def test_a_camera_frame_cannot_be_passed_in_at_all():
    with pytest.raises(RemoteError):
        serialize_rig(np.zeros((480, 640, 3), np.uint8), 0)  # type: ignore[arg-type]


# --- opt-in, allowlist ----------------------------------------------------------------------------------
def test_it_is_off_by_default_and_nothing_reaches_the_transport():
    t = FakeTransport()
    a = RemoteAdapter(RemoteConfig(), t)
    with pytest.raises(RemoteDisabled, match="off"):
        a.submit(RIG)
    with pytest.raises(RemoteDisabled):
        RemoteAdapter(RemoteConfig(url=URL, allowed_hosts=("rig.example.com",)), t).submit(RIG)  # a url and a host are not an opt-in
    assert t.requests == [] and a.sent == 0 and a.refused == 1


def test_the_environment_switch_is_exactly_one(monkeypatch):
    for value, expected in (("1", True), ("true", False), ("0", False), ("", False)):
        monkeypatch.setenv(remote.REMOTE_ENV, value)
        assert RemoteConfig.from_env(URL, ("rig.example.com",)).enabled is expected


@pytest.mark.parametrize("kw", [
    {"allowed_hosts": ()},
    {"url": "http://rig.example.com/x"},
    {"url": "https://other.example.com/x"},
    {"url": "https://rig.example.com.evil.com/x"},
    {"url": "https://evil.com/?h=rig.example.com"},
    {"url": "https://user:pw@rig.example.com/x"},
    {"url": "https://rig.example.com@evil.com/x"},
    {"url": "https://rig.example.com:8443/x"},
    {"url": "https://203.0.113.5/x", "allowed_hosts": ("203.0.113.5",)},
    {"url": "https://localhost/x", "allowed_hosts": ("localhost",)},
    {"allowed_hosts": ("*.example.com",)},
    {"allowed_hosts": ("RIG.example.com",)},
    {"allowed_hosts": ("rig.example.com:443",)},
    {"timeout_s": 0}, {"timeout_s": 31}, {"timeout_s": -1},
])
def test_every_unacceptable_destination_or_limit_is_refused(kw):
    t = FakeTransport()
    with pytest.raises(RemoteDisabled):
        RemoteAdapter(cfg(**kw), t).submit(RIG)
    assert t.requests == []


def test_an_allowlisted_host_matches_case_insensitively_in_the_url_only():
    t = FakeTransport()
    assert RemoteAdapter(cfg(url="https://RIG.Example.com/v1"), t).submit(RIG)["yaw"] == 0.3
    assert len(t.requests) == 1


# --- credentials ----------------------------------------------------------------------------------------
def test_the_credential_is_read_at_send_time_sent_as_a_header_and_nowhere_else(caplog):
    caplog.set_level(logging.DEBUG)
    t = FakeTransport()
    a = RemoteAdapter(cfg(), t)
    a.submit(RIG)
    url, body, names, has_auth, timeout = t.requests[0]
    assert has_auth and "Authorization" in names and timeout == 2.0 and url == URL
    assert TOKEN.encode() not in body
    everything = caplog.text + repr(a) + repr(cfg()) + repr(RemoteRequest(url, body, {"Authorization": f"Bearer {TOKEN}"}, 1.0))
    assert TOKEN not in everything and "SECRET" not in everything
    assert "0.3" not in caplog.text and "yaw" not in caplog.text, "the rig values are not logged either"
    assert "rig.example.com" in caplog.text and "bytes=" in caplog.text


def test_a_missing_or_malformed_credential_refuses_before_anything_is_sent(monkeypatch):
    t = FakeTransport()
    monkeypatch.delenv(remote.DEFAULT_TOKEN_ENV)
    with pytest.raises(RemoteDisabled, match="not set"):
        RemoteAdapter(cfg(), t).submit(RIG)
    for bad in ("short", "has space in it 123456", "line\nbreak-0123456789", "x" * 5000, "tab\there-0123456789"):
        monkeypatch.setenv(remote.DEFAULT_TOKEN_ENV, bad)
        with pytest.raises(RemoteDisabled) as info:
            RemoteAdapter(cfg(), t).submit(RIG)
        assert bad not in str(info.value)
    assert t.requests == []


def test_a_destination_that_needs_no_credential_gets_none():
    t = FakeTransport()
    RemoteAdapter(cfg(token_env=None), t).submit(RIG)
    assert t.requests[0][3] is False


# --- timeouts, cancellation, concurrency ---------------------------------------------------------------
def test_a_slow_transport_times_out_at_the_deadline_and_is_told_to_stop():
    t = FakeTransport(delay_s=5.0)
    a = RemoteAdapter(cfg(timeout_s=0.3), t)
    started = time.perf_counter()
    with pytest.raises(RemoteTimeout):
        a.submit(RIG)
    assert time.perf_counter() - started < 1.5
    deadline = time.time() + 2
    while time.time() < deadline and not t.cancelled_seen:
        time.sleep(0.01)
    assert t.cancelled_seen == 1, "the transport saw the cancel signal"


def test_a_transport_that_ignores_the_cancel_signal_still_cannot_hold_the_caller():
    class Stuck:
        def send(self, request, cancel):
            time.sleep(3)
            return RemoteResponse(200, b"{}")

    started = time.perf_counter()
    with pytest.raises(RemoteTimeout):
        RemoteAdapter(cfg(timeout_s=0.3), Stuck()).submit(RIG)
    assert time.perf_counter() - started < 1.5


def test_cancel_stops_the_request_in_flight():
    t = FakeTransport(delay_s=5.0)
    a = RemoteAdapter(cfg(timeout_s=10.0), t)
    result = {}

    def run():
        try:
            a.submit(RIG)
        except RemoteError as exc:
            result["error"] = exc

    th = threading.Thread(target=run)
    th.start()
    time.sleep(0.2)
    a.cancel()
    th.join(3)
    assert isinstance(result.get("error"), RemoteCancelled) and not th.is_alive()
    assert RemoteAdapter(cfg(), FakeTransport()).submit(RIG), "a new adapter (or the next request) starts fresh"


def test_only_one_request_is_in_flight_and_others_are_refused_not_queued():
    t = FakeTransport(delay_s=0.5)
    a = RemoteAdapter(cfg(timeout_s=5.0), t)
    first = threading.Thread(target=lambda: a.submit(RIG))
    first.start()
    time.sleep(0.15)
    with pytest.raises(RemoteError, match="in flight"):
        a.submit(RIG)
    first.join(3)
    assert len(t.requests) == 1 and a.refused == 1


# --- answers and failures -------------------------------------------------------------------------------
def test_a_good_answer_is_returned_as_eight_floats():
    assert RemoteAdapter(cfg(), FakeTransport()).submit(RIG) == pytest.approx(RIG)


@pytest.mark.parametrize("raw", [
    b"not json", b"[]", b"{}", b'{"v":1,"seq":0,"rig":{"x":0}}',
    json.dumps({"v": 1, "seq": 0, "rig": {**RIG, "yaw": 9}}).encode(),
    json.dumps({"v": 1, "seq": 0, "rig": {**RIG, "note": "hi"}}).encode(),
    json.dumps({"v": 2, "seq": 0, "rig": RIG}).encode(),
    json.dumps({"v": 1, "seq": 0, "rig": RIG, "extra": 1}).encode(),
    # short ids on purpose: pytest puts a test's id in the PYTEST_CURRENT_TEST environment variable, and Windows
    # refuses an environment variable longer than 32,767 characters (the raw bytes would make the id 100,000 long)
    pytest.param(b"[" * 100000, id="100000-nested-brackets"),
    pytest.param(b"x" * (remote.MAX_RESPONSE_BYTES + 1), id="one-byte-over-the-response-limit"),
])
def test_an_unacceptable_answer_is_rejected(raw):
    with pytest.raises(RemoteError):
        parse_response(raw)


def test_a_non_200_status_and_a_wrong_return_type_are_errors():
    with pytest.raises(RemoteError, match="status 503"):
        RemoteAdapter(cfg(), FakeTransport(reply=RemoteResponse(503, b""))).submit(RIG)

    class Wrong:
        def send(self, request, cancel):
            return "oops"

    with pytest.raises(RemoteError, match="not a response"):
        RemoteAdapter(cfg(), Wrong()).submit(RIG)


def test_a_transport_failure_does_not_leak_its_message():
    t = FakeTransport(reply=ConnectionError(f"failed for https://rig.example.com/x?key={TOKEN}"))
    with pytest.raises(RemoteError) as info:
        RemoteAdapter(cfg(), t).submit(RIG)
    assert TOKEN not in str(info.value) and "ConnectionError" in str(info.value)


def test_the_sequence_number_advances_per_request():
    t = FakeTransport()
    a = RemoteAdapter(cfg(), t)
    a.submit(RIG)
    a.submit(RIG)
    assert [json.loads(r[1])["seq"] for r in t.requests] == [0, 1]


# --- no network ---------------------------------------------------------------------------------------
def test_the_module_imports_no_network_library_and_has_no_real_transport():
    tree = ast.parse(Path(remote.__file__).read_text(encoding="utf-8"))
    imported = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imported |= {n.name.split(".")[0] for n in node.names}
        elif isinstance(node, ast.ImportFrom) and node.module:
            imported.add(node.module.split(".")[0] + ("." + node.module.split(".")[1] if node.module.startswith("urllib") else ""))
    assert not imported & {"socket", "ssl", "http", "requests", "httpx", "aiohttp", "urllib.request", "urllib3", "ftplib", "smtplib"}, imported
    implementations = [c for c in vars(remote).values() if isinstance(c, type) and c is not Transport and c.__module__ == remote.__name__
                       and hasattr(c, "send") and c.__name__ != "FakeTransport"]
    assert implementations == [], "the only class with send() is the fake: there is no real transport"


def test_the_pipeline_cannot_reach_the_adapter_with_pixels():
    from realx.types import FrameContext

    ctx = FrameContext(pixels=np.zeros((48, 64, 3), np.uint8), index=0, timestamp=0.0, meta={"rig": [{**RIG, "id": 1, "predicted": False}]})
    with pytest.raises(RemoteError):
        serialize_rig(ctx.meta["rig"][0], 0)  # the tracker's own dict has an id and a flag: it must be reduced on purpose
    reduced = {k: ctx.meta["rig"][0][k] for k in remote.RIG_FIELDS}
    assert serialize_rig(reduced, 0)
