"""Full-body tracking in a real browser, with a fake camera.

Chromium plays a short clip (the public-domain astronaut portrait, nudged side to side) as the webcam.
The tracking page runs the three MediaPipe models on it, and a second page that has no camera shows
the same body through the server's relay. The checks are about what must hold for a live stream:

* the tracking page works, and keeps working with the CPU path when the GPU is not used
* only small number-only messages leave the page; no request carries a picture
* a viewer (OBS Browser Source) gets the body without ever touching a camera
* refusing the camera leaves the character page usable and says why
"""

import glob
import json
import math
import os
import re
import time
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
ARGS = ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
FAKE_CAMERA = ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"]
SOURCES = ["tracker.js", "body.js", "assign.js", "idle.js"]
FORBIDDEN = [  # calls that would read, copy, encode or ship camera pixels
    "toDataURL", "toBlob", "getImageData", "createImageBitmap", "MediaRecorder", "captureStream", "ImageCapture",
    "readPixels", "drawImage", "sendBeacon", "XMLHttpRequest", "fetch(", "WebSocket(", "RTCPeerConnection",
]


def _chromium():
    exe = os.environ.get("REALX_CHROMIUM")
    if exe and os.path.exists(exe):
        return exe
    hits = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    return hits[-1] if hits else None


def test_tracker_sources_never_touch_camera_pixels():
    for name in SOURCES:
        text = (ROOT / "webapp/src" / name).read_text(encoding="utf-8")
        code = "\n".join(re.sub(r"//.*$", "", line) for line in text.splitlines())  # comments may name the rules
        for needle in FORBIDDEN:
            assert needle not in code, f"{name} uses {needle}"


def _write_clip(path: Path, frames: int = 30) -> None:
    import cv2
    import numpy as np
    from skimage import data

    portrait = cv2.resize(data.astronaut(), (480, 480))
    with open(path, "wb") as fh:
        fh.write(b"YUV4MPEG2 W640 H480 F30:1 Ip A1:1 C420jpeg\n")
        for i in range(frames):
            canvas = np.zeros((480, 640, 3), np.uint8)
            x0 = 80 + int(round(4 * math.sin(i / 3)))
            canvas[:, x0 : x0 + 480] = portrait
            fh.write(b"FRAME\n" + cv2.cvtColor(canvas, cv2.COLOR_RGB2YUV_I420).tobytes())


@pytest.fixture(scope="module")
def stack(tmp_path_factory):
    sync_api = pytest.importorskip("playwright.sync_api")
    pytest.importorskip("skimage")
    pytest.importorskip("cv2")
    exe = _chromium()
    if not exe:
        pytest.skip("no Chromium found (set REALX_CHROMIUM)")
    from realx.models import ensure_model

    try:
        for name in ("mp_face", "mp_pose", "mp_hand"):
            ensure_model(name)
    except Exception as exc:
        pytest.skip(f"MediaPipe models unavailable: {exc}")
    clip = tmp_path_factory.mktemp("cam") / "portrait.y4m"
    _write_clip(clip)
    from realx.server import Engine, Server

    srv = Server(Engine(source="demo:static", mode="body"), port=0)
    srv.start()
    with sync_api.sync_playwright() as p:
        yield p, exe, clip, srv
    srv.stop()


def _launch(p, exe, extra):
    return p.chromium.launch(executable_path=exe, args=ARGS + extra)


def _wait(page, expr, timeout):
    # polled with plain evaluate calls: the page's CSP forbids the eval that wait_for_function needs
    end = time.time() + timeout
    while time.time() < end:
        if page.evaluate(f"!!({expr})"):
            return
        time.sleep(0.25)
    raise AssertionError(f"timed out after {timeout}s waiting for: {expr}; state={page.evaluate('window.__realx')}")


def test_camera_page_tracks_publishes_numbers_only_and_a_viewer_sees_it(stack):
    p, exe, clip, srv = stack
    base = f"http://127.0.0.1:{srv.port}"
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        ctx = browser.new_context(viewport={"width": 480, "height": 480}, permissions=["camera"])
        tracker, viewer = ctx.new_page(), ctx.new_page()
        requests, sent, console, errors = [], [], [], []
        tracker.on("request", lambda r: requests.append((r.method, r.url, r.resource_type, r.post_data)))
        tracker.on("websocket", lambda ws: ws.on("framesent", lambda payload: sent.append(payload)))
        tracker.on("console", lambda m: console.append(m.text) if m.type in ("error", "warning") else None)
        tracker.on("pageerror", lambda e: errors.append(str(e)))
        viewer.on("pageerror", lambda e: errors.append(str(e)))

        tracker.goto(f"{base}/avatar?track=1&publish=1&preview=1&delegate=cpu")
        _wait(tracker, "window.__realx && window.__realx.modelLoaded", 60)
        _wait(tracker, "window.__realx.tracking && (window.__realx.tracking.frames >= 25 || window.__realx.tracking.state === 'error')", 180)
        state = tracker.evaluate("window.__realx")
        assert state["tracking"]["state"] == "running", state["tracking"]
        assert set(state["tracking"]["delegates"].values()) == {"CPU"}, "delegate=cpu must use the CPU path"

        faces = 0
        for _ in range(40):  # sample the live flags for a few seconds
            flags = tracker.evaluate("window.__realx.bodyFlags")
            faces += 1 if flags and flags["face"] else 0
            time.sleep(0.15)
        state = tracker.evaluate("window.__realx")
        assert state["bodyMessages"] >= 25 and state["rejected"] == 0 and state["sent"] >= 20, state
        assert faces > 0, f"the portrait's face was never tracked (flags {state['bodyFlags']})"
        t = state["tracking"]  # shown with `pytest -s`: speed on this machine's CPU path
        print(f"\ntracking: {t['fps']} fps, ms/model {({k: round(v, 1) for k, v in t['ms'].items()})}, "
              f"level {t['level']}, flags {state['bodyFlags']}, sent {state['sent']}")

        viewer.goto(f"{base}/avatar")
        _wait(viewer, "window.__realx && window.__realx.modelLoaded", 60)
        _wait(viewer, "window.__realx.bodyMessages >= 5", 30)
        seen = viewer.evaluate("window.__realx")
        assert seen["rejected"] == 0 and seen["tracking"] is None, "the viewer has no camera"
        assert "Virtual character" in viewer.inner_text("#badge") and "Virtual character" in tracker.inner_text("#badge")

        # what left the tracking page: same-origin requests only, no bodies, only small number-only frames
        origin = f"127.0.0.1:{srv.port}"
        for method, url, kind, post in requests:
            assert url.startswith(("blob:", "data:")) or origin in url, f"left the page: {url}"
            assert method == "GET" and not post, f"{method} {url}"
        assert not any(u.endswith((".jpg", ".png", ".webp")) for _, u, _, _ in requests)
        assert len(sent) >= 20
        for payload in sent:
            text = payload if isinstance(payload, str) else payload.decode("utf-8")
            assert len(text) <= 6144
            msg = json.loads(text)
            assert sorted(msg) == ["e", "f", "q", "r", "type"] and msg["type"] == "body"
            assert len(msg["q"]) == 212 and len(msg["e"]) == 9 and len(msg["r"]) == 3
            assert all(isinstance(v, (int, float)) and math.isfinite(v) for v in msg["q"] + msg["e"] + msg["r"])
        assert not errors, errors
        assert not [c for c in console if "Content Security Policy" in c], console
    finally:
        browser.close()


def test_refused_camera_is_explained_and_the_character_still_works(stack):
    p, exe, _clip, srv = stack
    browser = _launch(p, exe, [])  # no fake camera, no auto-accept: the browser has nothing to give
    try:
        page = browser.new_context(viewport={"width": 320, "height": 320}).new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{srv.port}/avatar?track=1&preview=1&delegate=cpu&badge=off")
        _wait(page, "window.__realx && window.__realx.modelLoaded", 60)
        _wait(page, "window.__realx.tracking && window.__realx.tracking.state === 'error'", 30)
        _wait(page, "document.getElementById('badge').textContent.length > 0", 15)
        assert "Virtual character" in page.inner_text("#badge"), "badge=off must not hide the label on a camera page"
        detail = page.evaluate("window.__realx.tracking.detail")
        assert detail and ("camera" in detail.lower()), detail
        assert page.inner_text("#trackstate").strip(), "the person is told what happened"
        assert not errors, errors
        time.sleep(1)
        assert page.evaluate("window.__realx.frames") > 5, "the character keeps rendering"
    finally:
        browser.close()
