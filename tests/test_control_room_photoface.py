"""Control room: the "Photo face" mode (the /facemesh page runs in a frame and owns the camera).

Real server, real /api/config and /api/stats; only the browser's camera is fake. Same skip conditions as
test_control_room_body.py (Playwright, scikit-image, a Chromium via REALX_CHROMIUM, the yunet model).
"""

import os
import time

import pytest
from conftest import find_chromium, token_cookie


def _chromium():
    return find_chromium()


@pytest.fixture(scope="module")
def room():
    sync_api = pytest.importorskip("playwright.sync_api")
    pytest.importorskip("skimage")
    exe = _chromium()
    if not exe:
        pytest.skip("no Chromium found (set REALX_CHROMIUM)")
    from realx.models import ensure_model

    try:
        ensure_model("yunet")
    except Exception as exc:
        pytest.skip(f"yunet model unavailable: {exc}")
    from realx.server import Engine, Server

    srv = Server(Engine(source="demo:static"), port=0)
    srv.start()
    with sync_api.sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=exe,
            args=[
                "--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
                "--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream",
            ],
        )
        yield srv, browser
        browser.close()
    srv.stop()


def _wait(page, js, timeout=10.0):
    """Plain evaluate polling: the control room's CSP forbids the eval wait_for_function uses."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if page.evaluate(js):
            return
        time.sleep(0.1)
    raise AssertionError(f"timed out waiting for: {js}")


def test_photo_face_loads_facemesh_releases_the_stream_and_leaving_stops_the_camera(room):
    srv, browser = room
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    ctx.add_cookies(token_cookie(srv.port))
    page = ctx.new_page()
    errors, console = [], []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: console.append(m.text) if m.type == "error" else None)
    try:
        page.goto(f"http://127.0.0.1:{srv.port}/")
        page.wait_for_selector("#modeSeg")
        assert page.locator('#modeSeg input[value="photoface"]').count() == 1
        assert "Photo face" in page.inner_text("#modeSeg")
        assert not page.is_visible("#facemeshFrame")
        assert (page.get_attribute("#facemeshFrame", "allow") or "") == "camera"
        _wait(page, "!!document.querySelector('#view').getAttribute('src')")  # the default mode streams MJPEG

        page.check('#modeSeg input[value="photoface"]')
        _wait(page, "document.querySelector('#facemeshFrame').getAttribute('src') === '/facemesh'")
        assert page.is_visible("#facemeshFrame")
        deadline = time.time() + 15
        while time.time() < deadline and not any(f.url.split("?")[0].endswith("/facemesh") for f in page.frames):
            time.sleep(0.1)
        assert any(f.url.split("?")[0].endswith("/facemesh") for f in page.frames), [f.url for f in page.frames]
        # the control room's own MJPEG connection is released, and the server really switched (camera handed over)
        assert page.get_attribute("#view", "src") is None
        assert not page.is_visible("#view") and not page.is_visible("#character") and not page.is_visible("#tracker")
        assert not page.is_visible("#obs") and not page.is_visible("#bodyPanel")
        # status text, also after several polls (the poll loop must not fight the radio)
        _wait(page, "document.querySelector('#state').textContent === 'Photo face (camera in the frame)'")
        time.sleep(1.5)
        assert page.is_checked('#modeSeg input[value="photoface"]')
        assert page.get_attribute("#facemeshFrame", "src") == "/facemesh"
        assert page.inner_text("#state") == "Photo face (camera in the frame)"

        # leaving: the frame is blanked and its src removed, so the page (and its camera) is gone
        page.check('#modeSeg input[value="avatar"]')
        _wait(page, "!document.querySelector('#facemeshFrame').getAttribute('src')")
        assert not page.is_visible("#facemeshFrame")
        deadline = time.time() + 8
        while time.time() < deadline and any("/facemesh" in f.url for f in page.frames):
            time.sleep(0.1)
        assert not any("/facemesh" in f.url for f in page.frames), [f.url for f in page.frames]
        _wait(page, "!!document.querySelector('#view').getAttribute('src')")  # the picture stream is back
        time.sleep(1.5)  # the poll loop must not bring the frame back
        assert not page.get_attribute("#facemeshFrame", "src")
        assert page.is_checked('#modeSeg input[value="avatar"]')
        assert page.inner_text("#state") != "Photo face (camera in the frame)"
        assert not errors, errors
        # MediaPipe reports its own "INFO: Created TensorFlow Lite XNNPACK delegate" through console.error: not a failure
        assert not [c for c in console if not c.startswith("INFO:")], console
    finally:
        page.close()
        ctx.close()
