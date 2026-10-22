"""Control room: the camera choice for the two modes that open the camera in the browser (Photo face and Full body).

Real server and pages; only the browser's cameras are fake (two of them). Same skip conditions as the other control-room
browser tests. The rule that skips virtual and infrared cameras by name is unit-tested in webapp/test/camera.test.mjs, because Chromium's
fake cameras cannot be given those names.
"""

import time

import pytest
from conftest import find_chromium, token_cookie


@pytest.fixture(scope="module")
def room():
    sync_api = pytest.importorskip("playwright.sync_api")
    pytest.importorskip("skimage")
    exe = find_chromium()
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
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
                  "--use-fake-device-for-media-stream=device-count=2", "--use-fake-ui-for-media-stream"],
        )
        yield srv, browser
        browser.close()
    srv.stop()


def _wait(page, js, timeout=20.0):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if page.evaluate(js):
            return
        time.sleep(0.1)
    raise AssertionError(f"timed out waiting for: {js}")


def _frame(page, part):
    deadline = time.time() + 25   # the old page is busy with its face model on a slow machine; a new one loads afterwards
    while time.time() < deadline:
        for f in page.frames:
            if part in f.url:
                return f
        time.sleep(0.1)
    raise AssertionError(([f.url for f in page.frames], page.get_attribute("#facemeshFrame", "src"), page.evaluate("localStorage.length")))


def _camera_in(frame):
    """The deviceId of the camera the page in the frame is really using."""
    deadline = time.time() + 90
    while time.time() < deadline:
        got = frame.evaluate(
            "() => { const v = document.querySelector('video'); const s = v && v.srcObject; const t = s && s.getVideoTracks()[0];"
            " return t ? t.getSettings().deviceId : null; }")
        if got:
            return got
        time.sleep(0.2)
    raise AssertionError("the frame never opened a camera")


def _camera_becomes(frame, expected, timeout=90.0):
    """Poll the page in the frame until it is using `expected`. The same Frame object follows the iframe through a reload."""
    deadline = time.time() + timeout
    got = None
    while time.time() < deadline:
        try:
            got = frame.evaluate(
                "() => { const v = document.querySelector('video'); const s = v && v.srcObject; const t = s && s.getVideoTracks()[0];"
                " return t ? t.getSettings().deviceId : null; }")
        except Exception:  # the document is being replaced
            got = None
        if got == expected:
            return
        time.sleep(0.3)
    raise AssertionError(f"the page used {got!r}, not the chosen camera {expected!r}")


@pytest.fixture
def page(room):
    srv, browser = room
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    ctx.add_cookies(token_cookie(srv.port))
    pg = ctx.new_page()
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto(f"http://127.0.0.1:{srv.port}/")
    pg.wait_for_selector("#modeSeg")
    yield pg, errors
    pg.close()
    ctx.close()


def test_camera_panel_shows_for_photo_face_and_full_body_only_and_is_outside_the_body_panel(page):
    pg, errors = page
    assert not pg.is_visible("#cameraPanel")  # the default mode uses realX's own camera
    assert pg.locator("#bodyPanel #camSelect").count() == 0, "the chooser must not live inside the Full body panel any more"
    pg.check('#modeSeg input[value="photoface"]')
    pg.wait_for_selector("#cameraPanel", state="visible")
    pg.check('#modeSeg input[value="body"]')
    pg.wait_for_selector("#cameraPanel", state="visible")
    pg.check('#modeSeg input[value="original"]')
    _wait(pg, "document.querySelector('#cameraPanel').hidden")
    assert not errors, errors


def test_photo_face_reports_its_cameras_and_uses_the_one_that_is_chosen(page):
    pg, errors = page
    pg.check('#modeSeg input[value="photoface"]')
    _wait(pg, "document.querySelectorAll('#camSelect option').length >= 3")  # "Default camera" plus the two fake ones
    ids = pg.eval_on_selector_all("#camSelect option", "o => o.map(x => x.value).filter(Boolean)")
    assert len(ids) == 2 and ids[0] != ids[1]
    frame = _frame(pg, "/facemesh")
    first = _camera_in(frame)
    other = ids[1] if first == ids[0] else ids[0]

    pg.select_option("#camSelect", other)
    _wait(pg, f"document.querySelector('#facemeshFrame').getAttribute('src').includes('cam=')")
    _camera_becomes(frame, other)   # Photo face must open the camera that was chosen
    # the choice is remembered: a fresh load of the control room asks for it again
    pg.reload()
    pg.wait_for_selector("#modeSeg")
    pg.check('#modeSeg input[value="photoface"]')
    _wait(pg, "document.querySelector('#facemeshFrame').getAttribute('src').includes('cam=')")
    _camera_becomes(_frame(pg, "/facemesh"), other)
    assert not errors, errors


def test_full_body_still_uses_the_chosen_camera(page):
    pg, errors = page
    pg.check('#modeSeg input[value="photoface"]')
    _wait(pg, "document.querySelectorAll('#camSelect option').length >= 3")
    ids = pg.eval_on_selector_all("#camSelect option", "o => o.map(x => x.value).filter(Boolean)")
    pg.select_option("#camSelect", ids[1])
    pg.check('#modeSeg input[value="body"]')
    _wait(pg, "(document.querySelector('#tracker').getAttribute('src') || '').includes('cam=')")
    _camera_becomes(_frame(pg, "/avatar"), ids[1])
    assert not errors, errors


def test_a_malformed_device_message_from_a_page_is_ignored(page):
    pg, errors = page
    pg.check('#modeSeg input[value="photoface"]')
    _wait(pg, "document.querySelectorAll('#camSelect option').length >= 3")
    before = pg.eval_on_selector_all("#camSelect option", "o => o.map(x => x.value)")
    # the control room itself posts (so its own window is not the frame): the message must be dropped, and a bad shape too
    pg.evaluate("() => window.postMessage({ type: 'realx-devices', cameras: [{ id: 'evil', label: 'x' }] }, location.origin)")
    time.sleep(0.5)
    assert pg.eval_on_selector_all("#camSelect option", "o => o.map(x => x.value)") == before
    frame = _frame(pg, "/facemesh")
    frame.evaluate("() => parent.postMessage({ type: 'realx-gesture', gesture: 'Closed_Fist', micMuted: true }, location.origin)")
    time.sleep(0.5)
    assert "microphone muted" not in pg.inner_text("#gestureLast"), "the Photo face page may only report cameras"
    assert not errors, errors
