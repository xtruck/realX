"""The OBS dock: server state it controls, its page, and what it is allowed to learn."""
import http.client
import json

import numpy as np
import pytest

from realx.rig import rig_message
from realx.server import Engine, Server, dock_csp

TOKEN = "dock-test-token-abcdef0123456789"


@pytest.fixture
def engine():
    return Engine(source="demo:static")


def test_mute_and_voice_are_validated(engine):
    assert engine.set_dock({"mic_muted": True, "voice": "robot"}) == {"mic_muted": True, "voice": "robot"}
    assert engine.set_dock({"voice": ""})["voice"] == ""
    for bad in ({"mic_muted": "yes"}, {"mic_muted": 1}, {"voice": "elvis"}, {"voice": 3}, {"token": "x"}):
        with pytest.raises(ValueError):
            engine.set_dock(bad)
    assert engine.dock_state()["mic_muted"] is True, "a refused change leaves the state alone"


def test_blur_is_validated_and_made_odd(engine):
    assert engine.update({"blur": 40})["blur"] == 41
    assert engine.update({"blur": 3})["blur"] == 3
    for bad in (2, 152, "9", 4.5, True, None):
        with pytest.raises(ValueError):
            engine.update({"blur": bad})
    assert engine.config()["blur"] == 3


def test_rig_messages_carry_the_mute_only_while_muted(engine):
    assert "mic" not in rig_message(1, 0.0, (0, 0), [])
    assert rig_message(1, 0.0, (0, 0), [], None, None, True)["mic"] == {"muted": True}
    engine._heartbeat()
    assert "mic" not in json.loads(engine._rig)
    engine.set_dock({"mic_muted": True})
    engine._heartbeat()
    assert json.loads(engine._rig)["mic"] == {"muted": True}


def test_stats_say_how_the_token_was_chosen_and_never_show_it(monkeypatch):
    monkeypatch.delenv("REALX_TOKEN", raising=False)
    e1 = Engine(source="demo:static")
    s1 = Server(e1, port=0)
    sec = e1.stats()["security"]
    assert sec["token"] == "per-run"
    assert sec["watermark"] is False  # served MJPEG/avatar has no watermark stage (B3-03)
    assert sec["note"]
    e2 = Engine(source="demo:static")
    s2 = Server(e2, port=0, token=TOKEN)
    out = e2.stats()
    assert out["security"]["token"] == "fixed"
    assert TOKEN not in json.dumps(out) and s1.token not in json.dumps(e1.stats())
    assert out["dock"] == {"mic_muted": False, "voice": ""}
    for s in (s1, s2):
        s._httpd.server_close()


def test_dock_csp_allows_only_itself_and_its_socket():
    csp = dock_csp(8765)
    assert "default-src 'none'" in csp and "frame-ancestors 'none'" in csp
    assert "script-src 'self'" in csp and "unsafe" not in csp
    assert "ws://127.0.0.1:8765" in csp and "http" not in csp


@pytest.mark.raw_http
def test_dock_routes_and_commands_over_http():
    srv = Server(Engine(source="demo:static", mode="original"), port=0, token=TOKEN)
    srv.start()
    try:
        def call(method, path, body=None, ctype=None, auth=True, query=""):
            c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
            h = {"Host": f"127.0.0.1:{srv.port}"}
            if auth:
                h["Authorization"] = f"Bearer {TOKEN}"
            if ctype:
                h["Content-Type"] = ctype
            c.request(method, path + query, body=body, headers=h)
            r = c.getresponse()
            out = (r.status, {k.lower(): v for k, v in r.getheaders()}, r.read())
            c.close()
            return out

        for path in ("/dock", "/dock.js", "/dock.css"):
            assert call("GET", path, auth=False)[0] == 401
        status, headers, page = call("GET", "/dock")
        assert status == 200 and b"realX dock" in page
        assert "frame-ancestors 'none'" in headers["content-security-policy"] and headers["x-frame-options"] == "DENY"
        assert call("GET", "/dock.js")[1]["content-type"].startswith("text/javascript")
        assert call("GET", "/dock.css")[1]["content-type"].startswith("text/css")
        # first visit with the token in the link becomes a cookie, like the avatar page
        s, h, _ = call("GET", "/dock", auth=False, query=f"?token={TOKEN}")
        assert s in (200, 302, 303) and "set-cookie" in h

        j = lambda d: json.dumps(d).encode()  # noqa: E731
        assert call("POST", "/api/dock", j({"mic_muted": True, "voice": "bear"}), "application/json")[0] == 200
        assert call("POST", "/api/dock", j({"voice": "nope"}), "application/json")[0] == 400
        assert call("POST", "/api/dock", j({"mic_muted": True}), "text/plain")[0] == 400
        assert call("POST", "/api/dock", j({"mic_muted": False}), "application/json", auth=False)[0] == 401
        stats = json.loads(call("GET", "/api/stats")[2])
        assert stats["dock"] == {"mic_muted": True, "voice": "bear"} and stats["config"]["blur"] == 41
        assert call("POST", "/api/config", j({"blur": 99}), "application/json")[0] == 200
        assert json.loads(call("GET", "/api/stats")[2])["config"]["blur"] == 99
    finally:
        srv.stop()
