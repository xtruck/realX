"""Fixed error codes and the stop state: what the control room tells a person, and that the old `error` text still works."""

from __future__ import annotations

import json
import threading
import time
import urllib.request

import pytest

from realx.errors import classify, stop_state
from realx.server import Engine, Server
from realx.sources import SourceError

pytestmark = pytest.mark.raw_http

TOKEN = "err-token-0123456789abcdefghij"


@pytest.mark.parametrize(
    "message, code, retryable",
    [
        ("cannot open camera 0. Close other apps using it and check Windows Settings > Privacy > Camera allows desktop apps.", "camera_unavailable", True),
        ("camera stopped delivering frames", "camera_stalled", True),
        ("cannot open video C:/x.mp4", "video_unreadable", False),
        ("The video source stopped.", "source_ended", True),
        ("model face_mesh is not downloaded", "model_not_ready", True),
        ("ValueError: bad shape (3, 4)", "engine_error", True),
        ("something nobody planned for", "unknown", True),
    ],
)
def test_messages_get_a_fixed_code(message, code, retryable):
    info = classify(message)
    assert info.code == code and info.retryable is retryable
    assert info.title and info.hint and info.detail.startswith(message[:20])


def test_no_error_means_no_info():
    assert classify(None) is None and classify("") is None


def test_detail_is_clipped_and_codes_are_a_closed_set():
    info = classify("cannot open camera 0 " + "x" * 5000)
    assert len(info.detail) <= 200 and info.code == "camera_unavailable"
    codes = {classify(m).code for m in ("cannot open camera", "camera stopped delivering frames", "cannot open video", "video source stopped", "a model", "E: x", "zzz")}
    assert codes == {"camera_unavailable", "camera_stalled", "video_unreadable", "source_ended", "model_not_ready", "engine_error", "unknown"}


def test_hints_never_blame_the_user_with_raw_exception_text():
    info = classify("RuntimeError: C:\\Users\\someone\\secret\\path failed")
    assert "someone" not in info.title and "someone" not in info.hint


@pytest.mark.parametrize("alive, requested, state, retry", [(False, False, "stopped", False), (False, True, "stopped", False),
                                                            (True, False, "running", False), (True, True, "pending", True)])
def test_stop_state(alive, requested, state, retry):
    assert stop_state(alive, requested) == {"state": state, "retryable": retry}


def test_engine_publishes_error_info_then_clears_it():
    eng = Engine(fps=10)
    assert eng.stats()["error_info"] is None
    eng._set_error("camera stopped delivering frames")
    st = eng.stats()
    assert st["error"] == "camera stopped delivering frames"  # the old field is unchanged
    assert st["error_info"]["code"] == "camera_stalled" and st["error_info"]["retryable"] is True
    eng._set_error(None)
    assert eng.stats()["error_info"] is None and eng.stats()["error"] is None


def test_engine_stop_state_before_during_and_after():
    eng = Engine(fps=10)
    assert eng.stats()["stop"] == {"state": "stopped", "retryable": False}  # never started
    eng.start()
    try:
        assert eng.stats()["stop"]["state"] == "running"
    finally:
        assert eng.stop()["state"] == "stopped"
    assert eng.stats()["stop"] == {"state": "stopped", "retryable": False}


def test_a_stuck_engine_thread_reports_pending_and_can_be_retried(monkeypatch):
    eng = Engine(fps=10)
    release = threading.Event()
    eng._thread = threading.Thread(target=lambda: release.wait(10), daemon=True)
    eng._thread.start()

    real_join = threading.Thread.join
    monkeypatch.setattr(threading.Thread, "join", lambda self, timeout=None: real_join(self, 0.05))
    first = eng.stop()
    assert first == {"state": "pending", "retryable": True}
    assert eng.stats()["stop"]["state"] == "pending"
    release.set()
    real_join(eng._thread, 2)
    assert eng.retry_stop() == {"state": "stopped", "retryable": False}


def test_a_dead_camera_shows_up_in_stats_over_http(monkeypatch):
    import realx.server as server_module

    def broken(_index):
        raise SourceError("cannot open camera 0. Close other apps using it.")

    monkeypatch.setattr(server_module, "camera_frames", broken)
    eng = Engine(fps=10)
    eng.update({"source": "camera"})
    srv = Server(eng, port=0, token=TOKEN)
    srv.start()
    try:
        deadline = time.monotonic() + 8
        info = None
        while time.monotonic() < deadline and not info:
            req = urllib.request.Request(f"http://127.0.0.1:{srv.port}/api/stats", headers={"Authorization": f"Bearer {TOKEN}"})
            with urllib.request.urlopen(req, timeout=3) as r:
                info = json.loads(r.read())["error_info"]
            time.sleep(0.1)
        assert info and info["code"] == "camera_unavailable" and info["retryable"] is True
    finally:
        srv.stop()


# --- session state ----------------------------------------------------------------------------------------------------

from realx.errors import ErrorInfo, session_state  # noqa: E402

_RETRY = ErrorInfo("camera_stalled", "t", "h", True)
_FATAL = ErrorInfo("video_unreadable", "t", "h", False)
_RUN = {"state": "running", "retryable": False}
_PEND = {"state": "pending", "retryable": True}
_STOPPED = {"state": "stopped", "retryable": False}


@pytest.mark.parametrize(
    "running, frames, error, stop, expected",
    [
        (False, 0, None, _STOPPED, "stopped"),
        (False, 50, None, _STOPPED, "stopped"),
        (True, 0, None, _RUN, "connecting"),
        (True, 1, None, _RUN, "live"),
        (True, 99, _RETRY, _RUN, "reconnecting"),
        (True, 0, _RETRY, _RUN, "reconnecting"),
        (True, 5, _FATAL, _RUN, "failed"),
        (True, 5, None, _PEND, "stopping"),
        (True, 5, _RETRY, _PEND, "stopping"),
    ],
)
def test_session_state_table(running, frames, error, stop, expected):
    assert session_state(running, frames, error, stop) == expected


def test_engine_reports_the_session_through_its_life():
    eng = Engine(fps=10)
    assert eng.stats()["session"] == "stopped"
    eng.start()
    try:
        deadline = time.monotonic() + 8
        seen = set()
        while time.monotonic() < deadline and "live" not in seen:
            seen.add(eng.stats()["session"])
            time.sleep(0.05)
        assert "live" in seen and seen <= {"connecting", "live"}
        eng._set_error("camera stopped delivering frames")
        assert eng.stats()["session"] == "reconnecting"
    finally:
        eng.stop()
    assert eng.stats()["session"] == "stopped"
