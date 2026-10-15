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
from conftest import token_cookie

ROOT = Path(__file__).resolve().parents[1]
ARGS = ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
FAKE_CAMERA = ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"]
SOURCES = ["tracker.js", "body.js", "assign.js", "idle.js", "recover.js"]
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
        ctx.add_cookies(token_cookie(srv.port))
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
              f"updates/s {t['hz']}, hands: {t['diag']['handHint']}, flags {state['bodyFlags']}, sent {state['sent']}")

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
            assert len(msg["q"]) == 212 and len(msg["e"]) == 11 and len(msg["r"]) == 3
            assert all(isinstance(v, (int, float)) and math.isfinite(v) for v in msg["q"] + msg["e"] + msg["r"])
        assert not errors, errors
        assert not [c for c in console if "Content Security Policy" in c], console
    finally:
        browser.close()


_COLLECT = "window.__msgs = []; window.addEventListener('message', (e) => window.__msgs.push({origin: e.origin, data: e.data}))"
_EMBED = "(src) => { const f = document.createElement('iframe'); f.id = 'tr'; f.allow = 'camera'; f.src = src; f.style.width = '480px'; f.style.height = '480px'; document.body.append(f); }"


def _finite(value):
    if isinstance(value, dict):
        return all(_finite(v) for v in value.values())
    if isinstance(value, list):
        return all(_finite(v) for v in value)
    return not (isinstance(value, float) and not math.isfinite(value))


def test_tracking_page_tells_its_parent_which_devices_exist_and_how_it_is_doing(stack):
    p, exe, clip, srv = stack
    base = f"http://127.0.0.1:{srv.port}"
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        ctx = browser.new_context(viewport={"width": 900, "height": 600}, permissions=["camera"])
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
        page.goto(f"{base}/")
        page.evaluate(_COLLECT)
        page.evaluate(_EMBED, f"{base}/avatar?track=1&publish=0&preview=1&delegate=cpu&quality=low")
        _wait(page, "window.__msgs.some((m) => m.data && m.data.type === 'realx-devices')", 120)
        _wait(page, "window.__msgs.some((m) => m.data && m.data.type === 'realx-stats' && m.data.state === 'running' && m.data.fps !== null)", 120)
        msgs = page.evaluate("window.__msgs")
        assert all(m["origin"] == base for m in msgs), "only this origin may speak to the control room"
        devices = next(m["data"] for m in msgs if m["data"].get("type") == "realx-devices")
        assert devices["cameras"] and all(sorted(c) == ["id", "label"] for c in devices["cameras"])
        stats = [m["data"] for m in msgs if m["data"].get("type") == "realx-stats"]
        running = next(s for s in stats if s["state"] == "running" and s["fps"] is not None)
        assert sorted(running) == ["avSyncMs", "delegates", "detail", "diag", "fps", "hz", "latencyMs", "mic", "ms", "skipped", "state", "type"]
        assert running["diag"] is not None and isinstance(running["diag"]["handHint"], str)
        assert all(_finite(s) for s in stats)
        early = stats[0]  # before any measurement the numbers are unknown (null), not zero
        assert early["fps"] is None or early["state"] != "camera"
        # the "low" preset asks the camera for 320x240
        size = page.frame_locator("#tr").locator("#cam").evaluate("v => [v.videoWidth, v.videoHeight]")
        assert size[0] <= 640, size
    finally:
        browser.close()


def _write_speech_wav(path: Path, seconds: float = 6.0, rate: int = 48000) -> None:
    """A synthetic vowel /a/ (harmonics of 120 Hz shaped by formants near 700 and 1100 Hz), 1 s on, 1 s off."""
    import wave

    import numpy as np

    t = np.arange(int(seconds * rate)) / rate
    voice = sum(np.sin(2 * np.pi * 120 * k * t) * (np.exp(-((120 * k - 700) / 180) ** 2) + 0.7 * np.exp(-((120 * k - 1100) / 220) ** 2)) for k in range(1, 20))
    gate = ((t % 2.0) < 1.0).astype(float)
    sig = voice / np.max(np.abs(voice)) * gate * 0.6
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1), w.setsampwidth(2), w.setframerate(rate)
        w.writeframes((sig * 32767).astype("<i2").tobytes())


def _write_black_clip(path: Path, frames: int = 30) -> None:
    """Frames with nobody in them: the face is never found, so only the microphone can move the mouth."""
    import numpy as np

    with open(path, "wb") as fh:
        fh.write(b"YUV4MPEG2 W640 H480 F30:1 Ip A1:1 C420jpeg\n")
        for _ in range(frames):
            fh.write(b"FRAME\n" + bytes([16]) * (640 * 480) + bytes([128]) * (640 * 480 // 2))


def test_microphone_drives_the_mouth_when_no_face_is_seen_and_audio_stays_in_the_page(stack, tmp_path):
    p, exe, _clip, srv = stack
    base = f"http://127.0.0.1:{srv.port}"
    wav, black = tmp_path / "speech.wav", tmp_path / "empty.y4m"
    _write_speech_wav(wav)
    _write_black_clip(black)
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={black}", f"--use-file-for-fake-audio-capture={wav}"])
    try:
        ctx = browser.new_context(viewport={"width": 480, "height": 480}, permissions=["camera", "microphone"])
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
        sent, requests, errors = [], [], []
        page.on("websocket", lambda ws: ws.on("framesent", lambda payload: sent.append(payload)))
        page.on("request", lambda r: requests.append((r.method, r.url, r.resource_type)))
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"{base}/avatar?track=1&publish=1&preview=1&delegate=cpu&quality=low&mic=default")
        _wait(page, "window.__realx && window.__realx.tracking && window.__realx.tracking.frames >= 10", 180)
        _wait(page, "window.__realx.mic && window.__realx.mic.active", 30)
        loud = 0.0
        for _ in range(60):  # a few seconds covers at least one 1 s vowel
            mouth = page.evaluate("window.__realx.mouth")
            loud = max(loud, (mouth or {}).get("aa", 0))
            if loud > 0.25:
                break
            time.sleep(0.15)
        state = page.evaluate("window.__realx")
        assert state["mic"]["active"] and not state.get("micError"), (state["mic"], state.get("micError"))
        assert loud > 0.25, f"the vowel never opened the mouth (mouth {state['mouth']}, mic {state['mic']})"
        assert state["mouth"]["source"] == "audio", "with no face in view the mouth comes from the microphone"
        assert state["rejected"] == 0 and not errors, errors
        # audio never leaves the page: only same-origin GETs, and every published frame is the small body message
        origin = f"127.0.0.1:{srv.port}"
        assert all(origin in url or url.startswith(("blob:", "data:")) for _m, url, _k in requests), requests
        assert all(m == "GET" for m, _u, _k in requests)
        for payload in sent:
            msg = json.loads(payload if isinstance(payload, str) else payload.decode("utf-8"))
            assert sorted(msg) == ["e", "f", "q", "r", "type"] and len(json.dumps(msg)) <= 6144
        assert page.evaluate("document.querySelectorAll('audio').length") == 0, "nothing is played back"
    finally:
        browser.close()


def _tracking_page(browser, srv, clip_flags_ok=True):
    ctx = browser.new_context(viewport={"width": 480, "height": 480}, permissions=["camera"])
    ctx.add_cookies(token_cookie(srv.port))
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(f"http://127.0.0.1:{srv.port}/avatar?track=1&preview=1&delegate=cpu&quality=low")
    _wait(page, "window.__realx && window.__realx.tracking && window.__realx.tracking.frames >= 10", 180)
    return page, errors


def test_a_camera_that_ends_is_reported_and_tracking_resumes_by_itself(stack):
    p, exe, clip, srv = stack
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        page, errors = _tracking_page(browser, srv)
        before = page.evaluate("window.__realx.tracking.frames")
        # what the browser does when a camera is unplugged or taken by another app: the track reports 'ended'
        page.evaluate("document.getElementById('cam').srcObject.getVideoTracks()[0].dispatchEvent(new Event('ended'))")
        _wait(page, "window.__realx.tracking.state === 'error' && /disconnected|not available/i.test(window.__realx.tracking.detail)", 10)
        detail = page.evaluate("window.__realx.tracking.detail")
        assert "camera" in detail.lower() and len(detail) < 200, detail
        assert page.inner_text("#trackstate").strip(), "the person is told, in the preview"
        _wait(page, "window.__realx.tracking.state === 'running'", 30)                     # it reconnected on its own
        _wait(page, f"window.__realx.tracking.frames > {before + 10}", 60)                 # and frames flow again
        assert not errors, errors
        assert page.evaluate("document.getElementById('cam').srcObject.getVideoTracks()[0].readyState") == "live"
    finally:
        browser.close()


def test_a_camera_that_freezes_without_saying_so_is_restarted(stack):
    p, exe, clip, srv = stack
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        page, errors = _tracking_page(browser, srv)
        before = page.evaluate("window.__realx.tracking.frames")
        # a frozen camera: the track stays 'live' but no new picture arrives (here the preview is paused)
        page.evaluate("document.getElementById('cam').pause()")
        _wait(page, "window.__realx.tracking.state === 'error'", 15)                        # the watchdog notices after ~3 s
        _wait(page, "window.__realx.tracking.state === 'running'", 30)
        _wait(page, f"window.__realx.tracking.frames > {before + 10}", 60)
        assert not errors, errors
    finally:
        browser.close()


def test_a_camera_that_is_not_there_is_explained(stack):
    p, exe, clip, srv = stack
    base = f"http://127.0.0.1:{srv.port}"
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        ctx = browser.new_context(viewport={"width": 900, "height": 600}, permissions=["camera"])
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
        page.goto(f"{base}/")
        page.evaluate(_COLLECT)
        page.evaluate(_EMBED, f"{base}/avatar?track=1&preview=1&delegate=cpu&cam=no-such-camera-id")
        _wait(page, "window.__msgs.some((m) => m.data && m.data.type === 'realx-stats' && m.data.state === 'error')", 60)
        err = next(m["data"] for m in page.evaluate("window.__msgs") if m["data"].get("type") == "realx-stats" and m["data"]["state"] == "error")
        assert "camera" in err["detail"].lower() and len(err["detail"]) < 200, err["detail"]
    finally:
        browser.close()


def test_refused_camera_is_explained_and_the_character_still_works(stack):
    p, exe, _clip, srv = stack
    browser = _launch(p, exe, [])  # no fake camera, no auto-accept: the browser has nothing to give
    try:
        ctx = browser.new_context(viewport={"width": 320, "height": 320})
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
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
