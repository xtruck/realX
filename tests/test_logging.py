"""Structured logging: what an operator sees when something goes wrong.

Before this, `src/realx` used the logging module nowhere, so an unexpected 500, a camera that would not open,
a failed model download or a crashed stage left no trace anywhere. These tests pin the contract: failures are
logged once with their type and message, a traceback stays in the log and never reaches the client, and logs
never carry picture, audio or body-message contents.
"""

import http.client
import io
import json
import logging
import time

import pytest

from realx import log as rlog


@pytest.fixture(autouse=True)
def _clean_logging():
    yield
    rlog.reset()


# --- the logging setup itself ----------------------------------------------------------------------------
def test_json_lines_have_fixed_keys_and_respect_the_level():
    buf = io.StringIO()
    rlog.configure(level="INFO", json_lines=True, stream=buf)
    lg = rlog.get_logger("test")
    lg.debug("hidden")
    lg.info("shown")
    lg.warning("careful")
    lines = [json.loads(line) for line in buf.getvalue().splitlines()]
    assert [line["msg"] for line in lines] == ["shown", "careful"]
    assert all({"ts", "level", "logger", "msg"} <= set(line) for line in lines)
    assert lines[0]["logger"] == "realx.test" and lines[0]["level"] == "INFO" and lines[1]["level"] == "WARNING"


def test_an_exception_is_recorded_with_its_type_message_and_traceback():
    buf = io.StringIO()
    rlog.configure(level="INFO", json_lines=True, stream=buf)
    try:
        raise RuntimeError("model exploded")
    except RuntimeError:
        rlog.get_logger("test").exception("stage failed")
    rec = json.loads(buf.getvalue().splitlines()[0])
    assert rec["level"] == "ERROR" and rec["exc"] == "RuntimeError: model exploded"
    assert "Traceback" in rec["trace"] and "model exploded" in rec["trace"]


def test_configure_twice_installs_one_handler_and_plain_text_is_the_default():
    buf = io.StringIO()
    rlog.configure(level="INFO", stream=buf)
    rlog.configure(level="INFO", stream=buf)
    own = [h for h in logging.getLogger("realx").handlers if getattr(h, "_realx", False)]
    assert len(own) == 1
    rlog.get_logger("test").info("hello")
    assert buf.getvalue().count("hello") == 1, "no duplicate lines"
    assert not buf.getvalue().lstrip().startswith("{")


def test_level_comes_from_the_environment_and_a_bad_level_is_refused(monkeypatch):
    monkeypatch.setenv("REALX_LOG_LEVEL", "debug")
    rlog.configure(stream=io.StringIO())
    assert logging.getLogger("realx").level == logging.DEBUG
    with pytest.raises(ValueError):
        rlog.configure(level="LOUD", stream=io.StringIO())


def test_clip_strips_control_characters_and_limits_length():
    out = rlog.clip("a\nb\r\x1b[31mred" + "x" * 500)
    assert "\n" not in out and "\x1b" not in out and len(out) <= 200
    assert out.startswith("ab")
    assert rlog.clip(None) == "" and rlog.clip(b"bytes") == "bytes"


def test_the_cli_flags_set_the_level(monkeypatch):
    from realx.cli import main

    monkeypatch.delenv("REALX_LOG_LEVEL", raising=False)
    assert main(["--log-level", "DEBUG", "providers"]) == 0
    assert logging.getLogger("realx").level == logging.DEBUG
    assert main(["--log-level", "ERROR", "--log-json", "providers"]) == 0
    assert logging.getLogger("realx").level == logging.ERROR


# --- the engine --------------------------------------------------------------------------------------------
def test_an_engine_failure_is_logged_once_with_type_and_message_not_on_every_retry(monkeypatch, caplog):
    from realx.server import Engine

    caplog.set_level(logging.DEBUG, logger="realx")

    def boom(self, cfg):
        raise RuntimeError("model exploded")

    monkeypatch.setattr(Engine, "_build", boom)
    eng = Engine(source="demo:static", mode="original")
    eng.start()
    time.sleep(1.8)  # the retry backoff is 0.5 s, then 1 s: at least two attempts
    eng.stop()
    hits = [r for r in caplog.records if r.levelno == logging.ERROR and "model exploded" in r.getMessage()]
    assert len(hits) == 1, [r.getMessage() for r in caplog.records]
    assert "RuntimeError" in hits[0].getMessage()
    assert hits[0].exc_info, "the traceback stays in the log for the operator"


def test_a_camera_that_cannot_be_opened_is_a_warning_logged_once(monkeypatch, caplog):
    from realx.server import Engine
    from realx.sources import SourceError

    caplog.set_level(logging.DEBUG, logger="realx")

    def no_camera(self, source):
        raise SourceError("cannot open camera 0")

    monkeypatch.setattr(Engine, "_open", no_camera)
    eng = Engine(source="camera", mode="original")
    eng.start()
    time.sleep(1.8)
    eng.stop()
    hits = [r for r in caplog.records if r.levelno == logging.WARNING and "cannot open camera 0" in r.getMessage()]
    assert len(hits) == 1, [(r.levelname, r.getMessage()) for r in caplog.records]
    assert eng.stats()["error"], "the control room still shows the reason"


def test_a_publisher_starting_and_stopping_is_logged(caplog):
    from realx.server import Engine

    caplog.set_level(logging.DEBUG, logger="realx")
    eng = Engine(source="demo:static", mode="original")
    assert eng.claim_publisher()
    eng.release_publisher()
    text = " | ".join(r.getMessage().lower() for r in caplog.records if r.levelno >= logging.INFO)
    assert "publish" in text and "start" in text and "stop" in text


# --- the HTTP server -------------------------------------------------------------------------------------
def _post(srv, path, body=b"", ctype="application/octet-stream"):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=15)
    c.request("POST", path, body=body, headers={"Host": f"127.0.0.1:{srv.port}", "Content-Type": ctype})
    r = c.getresponse()
    data = r.read()
    c.close()
    return r.status, data


def test_an_unexpected_error_is_logged_with_a_traceback_but_not_shown_to_the_client(monkeypatch, caplog):
    from realx.audio import offline
    from realx.server import Engine, Server

    caplog.set_level(logging.DEBUG, logger="realx")

    def crash(*_a, **_k):
        raise RuntimeError("secret internal detail")

    monkeypatch.setattr(offline, "convert_wav_bytes", crash)
    srv = Server(Engine(source="demo:static", mode="original"), port=0)
    srv.start()
    try:
        status, body = _post(srv, "/api/voice?demo=1&semitones=3")
    finally:
        srv.stop()
    assert status == 500 and b"secret" not in body
    logged = [r for r in caplog.records if r.levelno == logging.ERROR and r.exc_info]
    assert logged, [(r.levelname, r.getMessage()) for r in caplog.records]
    assert "secret internal detail" in str(logged[0].exc_info[1])


def test_a_failed_model_prefetch_is_logged_not_swallowed(monkeypatch, caplog):
    from realx import models, server as server_mod
    from realx.server import Engine, Server

    caplog.set_level(logging.DEBUG, logger="realx")

    def offline(*_a, **_k):
        raise models.ModelError("offline")

    monkeypatch.setattr(server_mod, "ensure_model", offline)
    srv = Server(Engine(source="demo:static", mode="original"), port=0)
    srv.start()
    try:
        c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=15)
        c.request("POST", "/api/config", body=json.dumps({"mode": "body"}),
                  headers={"Host": f"127.0.0.1:{srv.port}", "Content-Type": "application/json"})
        assert c.getresponse().status == 200
        time.sleep(0.6)
    finally:
        srv.stop()
    hits = [r for r in caplog.records if r.levelno == logging.WARNING and "prefetch" in r.getMessage().lower()]
    assert hits and "offline" in hits[0].getMessage()


def test_the_server_says_where_it_is_listening(caplog):
    from realx.server import Engine, Server

    caplog.set_level(logging.INFO, logger="realx")
    srv = Server(Engine(source="demo:static", mode="original"), port=0)
    srv.start()
    try:
        port = srv.port
    finally:
        srv.stop()
    assert any("127.0.0.1" in r.getMessage() and str(port) in r.getMessage() for r in caplog.records)


# --- models and the pipeline ----------------------------------------------------------------------------
def test_a_failed_model_download_is_logged_with_the_host_and_the_reason(monkeypatch, tmp_path, caplog):
    from realx import models

    caplog.set_level(logging.DEBUG, logger="realx")
    monkeypatch.setenv("REALX_MODELS_DIR", str(tmp_path))

    def down(spec, url, path):
        raise OSError("network down")

    monkeypatch.setattr(models, "_download", down)
    with pytest.raises(models.ModelError):
        models.ensure_model("yunet")
    hits = [r for r in caplog.records if r.levelno == logging.WARNING and "yunet" in r.getMessage()]
    assert hits and "github.com" in hits[0].getMessage() and "network down" in hits[0].getMessage()


def test_a_stage_that_fails_to_start_is_logged_by_name_and_the_error_still_propagates(caplog):
    from realx.pipeline import Pipeline

    caplog.set_level(logging.DEBUG, logger="realx")

    class Broken:
        name = "broken_stage"

        def setup(self):
            raise RuntimeError("no weights")

        def process(self, ctx):
            return ctx

        def close(self):
            pass

    with pytest.raises(RuntimeError, match="no weights"):
        Pipeline([Broken()]).setup()
    hits = [r for r in caplog.records if r.levelno == logging.ERROR and "broken_stage" in r.getMessage()]
    assert hits and "no weights" in hits[0].getMessage()
