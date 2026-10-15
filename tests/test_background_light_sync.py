"""The active background photo reaches the avatar page (for its lighting) as a tiny same-origin picture."""
import json

import numpy as np
import pytest

from realx.rig import rig_message
from realx.server import BACKGROUND_THUMB_PATH, BACKGROUND_THUMB_SIDE, Engine


@pytest.fixture
def engine():
    return Engine(source="demo:static")  # never started: only its state is used


def photo(h=240, w=320, rgb=(200, 40, 40)):
    return np.full((h, w, 3), rgb, np.uint8)


def test_rig_message_carries_the_background_only_when_given():
    assert "background" not in rig_message(1, 0.0, (0, 0), [])
    msg = rig_message(1, 0.0, (0, 0), [], None, {"url": "/avatar/background.png?v=3"})
    assert msg["background"] == {"url": "/avatar/background.png?v=3"}
    json.dumps(msg)


def test_no_background_state_until_a_photo_is_chosen_and_in_use(engine):
    assert engine._background_state() is None
    engine.set_background(photo())
    assert engine._background_state() is None, "uploaded but not selected"
    engine.update({"background": "photo"})
    state = engine._background_state()
    assert state == {"url": f"{BACKGROUND_THUMB_PATH}?v=1"}
    engine.update({"background": "blur"})
    assert engine._background_state() is None, "another background means neutral light"
    engine.update({"background": "off"})
    assert engine._background_state() is None


def test_a_new_photo_changes_the_url(engine):
    engine.set_background(photo())
    engine.update({"background": "photo"})
    first = engine._background_state()["url"]
    engine.set_background(photo(rgb=(10, 10, 200)))
    assert engine._background_state()["url"] != first


def test_thumbnail_is_small_and_keeps_the_colour(engine):
    import cv2

    assert engine.background_thumb() is None
    engine.set_background(photo(1000, 2000, rgb=(200, 40, 40)))
    assert engine.background_thumb() is None, "not selected yet"
    engine.update({"background": "photo"})
    data = engine.background_thumb()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    assert max(img.shape[:2]) == BACKGROUND_THUMB_SIDE
    b, g, r = img.reshape(-1, 3).mean(axis=0)
    assert r > 190 and g < 50 and b < 50
    assert engine.background_thumb() is data, "cached per photo version"
    engine.set_background(photo(rgb=(10, 10, 200)))
    assert engine.background_thumb() is not data


def test_live_rig_messages_include_the_background(engine):
    engine.set_background(photo())
    engine.update({"background": "photo"})
    engine._heartbeat()
    sent = json.loads(engine._rig)
    assert sent["background"]["url"].startswith(BACKGROUND_THUMB_PATH)
    engine.update({"background": "off"})
    engine._heartbeat()
    assert "background" not in json.loads(engine._rig)


@pytest.mark.raw_http
def test_thumbnail_route_needs_the_token_and_serves_only_while_a_photo_is_in_use():
    import http.client

    from realx.server import Server

    token = "light-sync-token-abcdef0123456789"
    srv = Server(Engine(source="demo:static", mode="original"), port=0, token=token)
    srv.start()
    try:
        def get(auth):
            c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
            h = {"Host": f"127.0.0.1:{srv.port}"}
            if auth:
                h["Authorization"] = f"Bearer {token}"
            c.request("GET", BACKGROUND_THUMB_PATH, headers=h)
            r = c.getresponse()
            out = (r.status, r.getheader("Content-Type"), r.read())
            c.close()
            return out

        assert get(False)[0] == 401
        assert get(True)[0] == 404, "no photo in use"
        srv.engine.set_background(photo())
        srv.engine.update({"background": "photo"})
        status, ctype, data = get(True)
        assert (status, ctype) == (200, "image/png") and data[:4] == b"\x89PNG"
        assert len(data) < 2000
        srv.engine.update({"background": "off"})
        assert get(True)[0] == 404
    finally:
        srv.stop()
