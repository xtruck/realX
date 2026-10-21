"""The Path B client against real loopback sockets: G3 token, G5 what leaves, G6 hostile answers, G7 fallback, G8 revocation, G9 logs, G10 bytes."""

from __future__ import annotations

import logging
import socket
import threading
import time

import numpy as np
import pytest

from realx.gpulink import GpuLinkClient, GpuLinkConfig

import gpulink_helpers as h

pytestmark = pytest.mark.raw_http


@pytest.fixture(autouse=True)
def _token(monkeypatch):
    monkeypatch.setenv("REALX_GPULINK_TOKEN", h.TOKEN)


def make_client(server, consent=lambda _id: True, **kw):
    cfg = GpuLinkConfig.unsafe_loopback_http_for_tests(url=server.url, enabled=True, max_fps=1000, **kw)
    return GpuLinkClient(cfg, consent_check=consent)


def reply(raw_response: bytes):
    return lambda conn, _raw: conn.sendall(raw_response)


# --- the happy path -----------------------------------------------------------------------------------------------


def test_passthrough_round_trip_returns_a_frame_of_the_same_size():
    server = h.RawServer()
    try:
        frame = h.make_frame()
        out = make_client(server).send(frame, h.CONSENT_ID)
        assert out is not None and out.shape == frame.shape and out.dtype == np.uint8
        assert np.abs(out.astype(int) - frame.astype(int)).mean() < 6  # only JPEG loss
    finally:
        server.close()


def test_status_counts_bytes_and_latency():
    server = h.RawServer()
    try:
        client = make_client(server)
        client.send(h.make_frame(), h.CONSENT_ID)
        st = client.status()
        assert st["sent"] == 1 and st["received"] == 1 and st["bytes_out"] > 0 and st["bytes_in"] > 0
        assert st["last_latency_ms"] is not None and st["last_error"] is None
    finally:
        server.close()


# --- G10 / G5 / G3: the real request bytes ------------------------------------------------------------------------


def test_g10_request_bytes_hold_only_the_agreed_things():
    server = h.RawServer()
    try:
        frame = h.make_frame()
        make_client(server).send(frame, h.CONSENT_ID)
        line, headers, body = h.split_request(server.requests[0])
        assert line == "POST /v1/frame HTTP/1.1"
        assert set(headers) == {"host", "authorization", "content-type", "content-length", "x-consent-id", "x-seq", "connection"}
        assert headers["content-type"] == "image/jpeg" and headers["x-consent-id"] == h.CONSENT_ID
        assert headers["authorization"] == "Bearer " + h.TOKEN
        assert body[:3] == b"\xff\xd8\xff" and int(headers["content-length"]) == len(body)
        assert len(body) <= 400_000
        # nothing but the JPEG: no JSON, no multipart, no text fields in the body
        assert b"{" not in body[:4] and b"Content-Disposition" not in body
        # EXIF/COM text would be a side channel: the JPEG carries none
        assert b"Exif" not in body and b"\xff\xfe" not in body
    finally:
        server.close()


def test_g3_token_is_not_in_the_body_url_or_status(caplog):
    server = h.RawServer()
    try:
        caplog.set_level(logging.DEBUG)
        client = make_client(server)
        client.send(h.make_frame(), h.CONSENT_ID)
        line, headers, body = h.split_request(server.requests[0])
        assert h.TOKEN not in line and h.TOKEN.encode() not in body
        assert h.TOKEN not in repr(client.status()) and h.TOKEN not in repr(client.config) and h.TOKEN not in repr(vars(client))
        assert h.TOKEN not in caplog.text
    finally:
        server.close()


def test_g3_token_is_read_at_send_time(monkeypatch):
    server = h.RawServer()
    try:
        client = make_client(server)
        monkeypatch.setenv("REALX_GPULINK_TOKEN", "first-token-0000")
        client.send(h.make_frame(), h.CONSENT_ID)
        monkeypatch.setenv("REALX_GPULINK_TOKEN", "second-token-1111")
        client.send(h.make_frame(), h.CONSENT_ID)
        assert [h.split_request(r)[1]["authorization"] for r in server.requests] == ["Bearer first-token-0000", "Bearer second-token-1111"]
    finally:
        server.close()


@pytest.mark.parametrize("value", ["", "short", "has space in it 123", "line\nbreak-0123456789", "x" * 5000])
def test_g3_a_missing_or_malformed_token_sends_nothing(monkeypatch, value):
    server = h.RawServer()
    try:
        monkeypatch.setenv("REALX_GPULINK_TOKEN", value)
        client = make_client(server)
        assert client.send(h.make_frame(), h.CONSENT_ID) is None
        assert server.connections == 0 and client.status()["last_error"] == "no-token"
    finally:
        server.close()


def test_g3_token_never_appears_in_an_error():
    server = h.RawServer(reply(h.http_response(500, b"boom " + h.TOKEN.encode(), "text/plain")))
    try:
        client = make_client(server)
        client.send(h.make_frame(), h.CONSENT_ID)
        assert h.TOKEN not in repr(client.status())
    finally:
        server.close()


# --- G5: bounds on what is sent -----------------------------------------------------------------------------------


def test_g5_a_frame_over_the_size_limit_is_not_sent():
    server = h.RawServer()
    try:
        client = make_client(server, max_dim=200)
        assert client.send(h.make_frame(320, 240), h.CONSENT_ID) is None
        assert server.connections == 0 and client.status()["last_error"] == "frame-size"
    finally:
        server.close()


def test_g5_a_jpeg_over_the_byte_limit_is_not_sent():
    server = h.RawServer()
    try:
        noise = np.random.default_rng(0).integers(0, 255, (240, 320, 3), dtype=np.uint8)
        client = make_client(server, max_jpeg_bytes=5000)
        assert client.send(noise, h.CONSENT_ID) is None
        assert server.connections == 0
    finally:
        server.close()


@pytest.mark.parametrize("bad", [np.zeros((10, 10), np.uint8), np.zeros((10, 10, 3), np.float32), np.zeros((10, 10, 4), np.uint8)])
def test_g5_only_rgb_uint8_pictures_are_sent(bad):
    server = h.RawServer()
    try:
        assert make_client(server).send(bad, h.CONSENT_ID) is None
        assert server.connections == 0
    finally:
        server.close()


@pytest.mark.parametrize("cid", ["", "short", "G" * 32, h.CONSENT_ID + "0", "../../etc/passwd", "a b"])
def test_g5_the_consent_id_must_have_the_agreed_shape(cid):
    server = h.RawServer()
    try:
        assert make_client(server).send(h.make_frame(), cid) is None
        assert server.connections == 0
    finally:
        server.close()


def test_g5_rate_is_limited_and_late_frames_are_dropped_not_queued():
    server = h.RawServer()
    try:
        cfg = GpuLinkConfig.unsafe_loopback_http_for_tests(url=server.url, enabled=True, max_fps=2)
        client = GpuLinkClient(cfg, consent_check=lambda _id: True)
        results = [client.send(h.make_frame(), h.CONSENT_ID) for _ in range(5)]
        assert results[0] is not None and all(r is None for r in results[1:])
        assert server.connections == 1 and client.status()["dropped"] == 4
    finally:
        server.close()


def test_g5_one_frame_in_flight():
    def slow(conn, raw):
        time.sleep(0.4)
        h.echo_jpeg(conn, raw)

    server = h.RawServer(slow)
    try:
        client = make_client(server, budget_s=1.0)
        first: list = []
        t = threading.Thread(target=lambda: first.append(client.send(h.make_frame(), h.CONSENT_ID)))
        t.start()
        time.sleep(0.1)
        assert client.send(h.make_frame(), h.CONSENT_ID) is None  # dropped: the first frame is still out
        t.join(3)
        assert first and first[0] is not None
        assert server.connections == 1 and client.status()["dropped"] == 1
    finally:
        server.close()


# --- G6: the answer is untrusted ----------------------------------------------------------------------------------

GOOD = h.jpeg_of(h.make_frame())


RESPONSES = dict(
    [
        ("redirect", h.http_response(302, b"", None, "Location: http://127.0.0.1:1/x\r\n")),
        ("server error", h.http_response(500, b"x", "text/plain")),
        ("unauthorised", h.http_response(401, b"", None)),
        ("wrong type", h.http_response(200, GOOD, "text/html")),
        ("no type", h.http_response(200, GOOD, None)),
        ("not a jpeg", h.http_response(200, b"GIF89a" + b"\x00" * 50, "image/jpeg")),
        ("truncated jpeg", h.http_response(200, GOOD[:200], "image/jpeg")),
        ("empty body", h.http_response(200, b"", "image/jpeg")),
        ("wrong size", h.http_response(200, h.jpeg_of(h.make_frame(100, 80)), "image/jpeg")),
        ("huge size", h.http_response(200, h.jpeg_of(h.make_frame(2000, 1500)), "image/jpeg")),
        ("garbage", b"not http at all\r\n\r\n"),
        ("chunked", b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\nContent-Type: image/jpeg\r\n\r\n0\r\n\r\n"),
        ("gzip", b"HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Length: 4\r\nContent-Type: image/jpeg\r\n\r\nabcd"),
        ("no length", b"HTTP/1.1 200 OK\r\nContent-Type: image/jpeg\r\n\r\n" + GOOD),
        ("duplicate length", b"HTTP/1.1 200 OK\r\nContent-Length: 4\r\nContent-Length: 9\r\nContent-Type: image/jpeg\r\n\r\n" + GOOD),
        ("short body", b"HTTP/1.1 200 OK\r\nContent-Length: %d\r\nContent-Type: image/jpeg\r\n\r\n" % (len(GOOD) + 500) + GOOD),
        ("closed at once", b""),
    ]
)


@pytest.mark.parametrize("name", list(RESPONSES))
def test_g6_bad_answers_are_refused(name):
    server = h.RawServer(reply(RESPONSES[name]))
    try:
        client = make_client(server)
        assert client.send(h.make_frame(), h.CONSENT_ID) is None, name
        assert client.status()["last_error"] is not None
    finally:
        server.close()


def test_g6_an_oversized_answer_is_not_read_into_memory():
    big = b"\xff\xd8\xff" + b"\x00" * 3_000_000
    server = h.RawServer(reply(h.http_response(200, big, "image/jpeg")))
    try:
        client = make_client(server)
        assert client.send(h.make_frame(), h.CONSENT_ID) is None
        assert client.status()["last_error"] == "too-big" and client.status()["bytes_in"] == 0
    finally:
        server.close()


def test_g6_a_redirect_is_not_followed():
    target = h.RawServer()
    server = h.RawServer(reply(h.http_response(307, b"", None, f"Location: {target.url}/steal\r\n")))
    try:
        make_client(server).send(h.make_frame(), h.CONSENT_ID)
        assert target.connections == 0
    finally:
        server.close()
        target.close()


def test_g6_label_and_watermark_are_drawn_locally_over_whatever_came_back():
    """A hostile server returns a picture that already looks like a clean, marked frame; the local stages still draw theirs."""
    import cv2

    from realx.gpulink import GpuLinkStage
    from realx.pipeline import Pipeline
    from realx.safety import watermark
    from realx.safety.consent import ConsentStore
    from realx.stages.builtin import ConsentGate, Disclosure, Watermark
    from realx.types import FrameContext

    frame = h.make_frame(320, 240)
    clean = h.jpeg_of(frame, 95)
    server = h.RawServer(reply(h.http_response(200, clean)))
    try:
        store = ConsentStore(bytes(range(1, 40)))
        client = make_client(server)
        key = b"k" * 16
        stage = GpuLinkStage(client, h.CONSENT_ID)
        chain = [ConsentGate(store, store.issue("person", "live", 60)), stage, Disclosure("Person"), Watermark(b"gpulink-test", key)]
        with Pipeline(chain, strict=True, allow=[GpuLinkStage]) as pipe:
            ctx = pipe.process(FrameContext(pixels=frame.copy()))
        assert ctx.meta["gpulink"] == "remote"
        assert ctx.meta["disclosure"].startswith("DIGITAL HOST")
        bar = Disclosure.bar_height(240)
        assert (ctx.pixels[240 - bar + 1 : 240 - 2, :4] == Disclosure.BAR_RGB).all()  # the bar is there
        assert watermark.extract(ctx.pixels, key) == b"gpulink-test"
    finally:
        server.close()


def test_g6_the_pipeline_refuses_the_stage_without_gate_label_and_watermark():
    from realx.gpulink import GpuLinkStage
    from realx.pipeline import Pipeline, PipelineConfigError

    server = h.RawServer()
    try:
        stage = GpuLinkStage(make_client(server), h.CONSENT_ID)
        with pytest.raises(PipelineConfigError):
            Pipeline([stage], strict=True, allow=[GpuLinkStage])
    finally:
        server.close()


# --- G7: fallback within the budget, no silent retry loop ---------------------------------------------------------


def test_g7_a_silent_server_gives_the_local_picture_within_a_second():
    server = h.RawServer(lambda conn, raw: time.sleep(3))
    try:
        client = make_client(server)
        t0 = time.monotonic()
        assert client.send(h.make_frame(), h.CONSENT_ID) is None
        assert time.monotonic() - t0 < 1.3
        assert client.status()["last_error"] == "timeout"
    finally:
        server.close()


def test_g7_a_slow_drip_cannot_stretch_the_budget():
    def drip(conn, raw):
        conn.sendall(b"HTTP/1.1 200 OK\r\nContent-Length: %d\r\nContent-Type: image/jpeg\r\n\r\n" % len(GOOD))
        for i in range(0, len(GOOD), 50):
            time.sleep(0.1)
            conn.sendall(GOOD[i : i + 50])

    server = h.RawServer(drip)
    try:
        client = make_client(server, budget_s=0.5)
        t0 = time.monotonic()
        assert client.send(h.make_frame(), h.CONSENT_ID) is None
        assert time.monotonic() - t0 < 1.0
    finally:
        server.close()


def test_g7_a_refused_connection_falls_back_without_retrying():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()  # nothing listens here now
    cfg = GpuLinkConfig.unsafe_loopback_http_for_tests(url=f"http://127.0.0.1:{port}", enabled=True, max_fps=1000)
    client = GpuLinkClient(cfg, consent_check=lambda _id: True)
    t0 = time.monotonic()
    assert client.send(h.make_frame(), h.CONSENT_ID) is None
    # Windows keeps retrying a closed port for about a second, so the same failure can show up as a timeout
    assert time.monotonic() - t0 < 1.3 and client.status()["failed"] == 1 and client.status()["last_error"] in ("connect", "timeout")


def test_g7_stage_keeps_the_local_picture_and_still_labels_it():
    from realx.gpulink import GpuLinkStage
    from realx.types import FrameContext

    server = h.RawServer(reply(h.http_response(500, b"", None)))
    try:
        frame = h.make_frame()
        ctx = GpuLinkStage(make_client(server), h.CONSENT_ID).process(FrameContext(pixels=frame.copy()))
        assert ctx.meta["gpulink"] == "local" and (ctx.pixels == frame).all()
    finally:
        server.close()


# --- G8: revocation -----------------------------------------------------------------------------------------------


def test_g8_revoking_consent_stops_the_very_next_frame():
    server = h.RawServer()
    try:
        state = {"ok": True}
        client = make_client(server, consent=lambda _id: state["ok"])
        assert client.send(h.make_frame(), h.CONSENT_ID) is not None
        state["ok"] = False
        assert client.send(h.make_frame(), h.CONSENT_ID) is None
        assert server.connections == 1 and client.status()["last_error"] == "consent"
    finally:
        server.close()


def test_g8_a_revocation_during_a_round_trip_discards_the_answer():
    state = {"ok": True}

    def revoke_then_answer(conn, raw):
        state["ok"] = False
        h.echo_jpeg(conn, raw)

    server = h.RawServer(revoke_then_answer)
    try:
        client = make_client(server, consent=lambda _id: state["ok"])
        assert client.send(h.make_frame(), h.CONSENT_ID) is None
    finally:
        server.close()


def test_g8_a_failing_consent_check_counts_as_no():
    server = h.RawServer()
    try:
        def boom(_id):
            raise RuntimeError("store unreadable")

        assert make_client(server, consent=boom).send(h.make_frame(), h.CONSENT_ID) is None
        assert server.connections == 0
    finally:
        server.close()


def test_g8_with_the_real_consent_store():
    from realx.safety.consent import ConsentError, ConsentStore

    store = ConsentStore(bytes(range(1, 40)))
    record = store.issue("person", "live", 60)

    def check(_id):
        try:
            store.verify(record, "live")
            return True
        except ConsentError:
            return False

    server = h.RawServer()
    try:
        client = make_client(server, consent=check)
        assert client.send(h.make_frame(), h.CONSENT_ID) is not None
        store.revoke(record.record_id)
        assert client.send(h.make_frame(), h.CONSENT_ID) is None
        assert server.connections == 1
    finally:
        server.close()


def test_stop_ends_the_session():
    server = h.RawServer()
    try:
        client = make_client(server)
        client.stop()
        assert client.send(h.make_frame(), h.CONSENT_ID) is None and server.connections == 0
    finally:
        server.close()


# --- G9: logs -----------------------------------------------------------------------------------------------------


def test_g9_logs_hold_host_and_counts_but_no_pixels_or_tokens(caplog):
    server = h.RawServer()
    try:
        caplog.set_level(logging.DEBUG)
        make_client(server).send(h.make_frame(), h.CONSENT_ID)
        text = caplog.text
        assert "gpulink frame host=127.0.0.1" in text and "out=" in text and "ms=" in text
        assert h.TOKEN not in text and "\xff\xd8" not in text and h.CONSENT_ID not in text
    finally:
        server.close()
