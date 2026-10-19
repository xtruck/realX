"""The face-mesh prototype (step S1) in a real browser, with a fake camera that plays a portrait.

Checks: the page starts the camera and the face model, finds the face, draws the mesh over it, reports its speed, and
nothing but same-origin GETs for the page's own files leaves it (no picture, no upload).
"""

import json
import time

from conftest import token_cookie
from test_tracking_browser import FAKE_CAMERA, _launch, stack  # noqa: F401  (stack is a fixture)

_DRAWN = """(() => {
  const c = document.getElementById('overlay'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0, x0 = c.width, x1 = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { n++; const x = (i / 4) % c.width; if (x < x0) x0 = x; if (x > x1) x1 = x; }
  return { pixels: n, width: c.width, left: x0, right: x1 };
})()"""


def _wait(page, expr, timeout):
    end = time.time() + timeout   # plain evaluate calls: the page's policy forbids the eval that wait_for_function needs
    while time.time() < end:
        if page.evaluate(f"!!({expr})"):
            return
        time.sleep(0.25)
    raise AssertionError(f"timed out after {timeout}s waiting for: {expr}; state={page.evaluate('window.__facemesh')}")


def _use_photo(page, path, timeout=60):
    """Choose a photo and give the consent it needs: tick the statement, press Allow, wait until it is drawn."""
    page.set_input_files("#photoFile", str(path))
    _wait(page, "window.__facemesh.photo === 'asking'", timeout)
    print("photo quality:", page.evaluate("window.__facemesh.photoQuality"))
    page.check("#consentAttest")
    if page.is_visible("#qualityOverride"):   # S13d: after a failed photo check one extra click is needed, on top of the statement
        page.check("#qualityOverride")
    page.click("#consentOk")
    _wait(page, "window.__facemesh.photo === 'ready'", timeout)



def _assert_requests_are_ours(requests, srv):
    """Everything the page asked for is this server's: GETs for its own files, and consent POSTs carrying only the photo's
    hash, the statement, the hours and the signed record. No picture, no photo bytes."""
    import json

    origin = f"127.0.0.1:{srv.port}"
    for method, url, post in requests:
        assert url.startswith(("blob:", "data:")) or origin in url, f"left the page: {url}"
        if method == "POST":
            assert url.split(origin, 1)[1].startswith("/api/facemesh/consent"), f"unexpected POST {url}"
            keys = set(json.loads(post))
            assert keys in ({"sha256", "attested", "hours"}, {"record", "sha256"}, {"record"}), f"unexpected fields {keys}"
            assert len(post) < 1200, "a consent request is small: it cannot carry a picture"
        else:
            assert method == "GET" and not post, f"{method} {url}"


def test_mesh_follows_the_portrait_and_nothing_leaves_the_page(stack):  # noqa: F811
    p, exe, clip, srv = stack
    base = f"http://127.0.0.1:{srv.port}"
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        ctx = browser.new_context(viewport={"width": 800, "height": 900}, permissions=["camera"])
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
        requests, console, errors = [], [], []
        page.on("request", lambda r: requests.append((r.method, r.url, r.post_data)))
        page.on("console", lambda m: console.append(m.text) if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: errors.append(str(e)))

        page.goto(f"{base}/facemesh")
        _wait(page, "window.__facemesh.state === 'running' || window.__facemesh.state === 'error'", 90)
        assert page.evaluate("window.__facemesh.state") == "running", page.inner_text("#status")
        _wait(page, "window.__facemesh.frames >= 30", 120)

        state = page.evaluate("window.__facemesh")
        assert state["found"] > 0, f"the portrait's face was never found: {state}"
        drawn = page.evaluate(_DRAWN)
        assert drawn["pixels"] > 2000, f"the mesh was not drawn: {drawn}"
        assert drawn["right"] - drawn["left"] < 0.9 * drawn["width"], f"the mesh covers the whole frame, not a face: {drawn}"

        page.click("#go")
        _wait(page, "window.__facemesh.measured", 40)
        m = page.evaluate("window.__facemesh.measured")
        print(f"\nface mesh, headless Chrome on this CPU: {m['fps']:.1f} fps, face found {m['foundPct']:.0f}%, "
              f"detection p95 {m['p95Ms']:.0f} ms, runs on {page.evaluate('window.__facemesh.delegate')}")
        assert m["frames"] >= 20 and m["foundPct"] > 50, m
        assert "gate" in page.inner_text("#measure").lower() or "fps" in page.inner_text("#measure")

        _assert_requests_are_ours(requests, srv)
        assert not any(u.endswith((".jpg", ".png", ".webp")) for _, u, _ in requests)
        assert not errors, errors
        assert not [c for c in console if "Content Security Policy" in c], console
    finally:
        browser.close()


def test_refusing_the_camera_says_why_and_does_not_crash(stack):  # noqa: F811
    p, exe, _clip, srv = stack
    browser = _launch(p, exe, ["--use-fake-device-for-media-stream", "--deny-permission-prompts"])
    try:
        ctx = browser.new_context()
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{srv.port}/facemesh")
        _wait(page, "window.__facemesh.state === 'error'", 30)
        assert "camera" in page.inner_text("#status").lower()
        assert not errors, errors
    finally:
        browser.close()


# --- step S2: a photo drawn on the live face ---------------------------------------------------------------------------

def _stage_pixels(page):
    import cv2
    import numpy as np

    png = page.locator("#stage").screenshot()
    return cv2.imdecode(np.frombuffer(png, np.uint8), cv2.IMREAD_COLOR).astype("float32")


def _save_photos(tmp_path):
    """A face photo that looks nothing like the live one (red and blue swapped, so skin turns blue) and a photo with no face."""
    import cv2
    import numpy as np
    from skimage import data

    portrait = cv2.resize(data.astronaut()[0:300, 100:400], (480, 480))   # RGB, cropped so the face fills a third of the width
    blue = tmp_path / "blue-face.png"
    cv2.imwrite(str(blue), portrait)                       # cv2 writes BGR: the file is the portrait with red and blue swapped
    nothing = tmp_path / "no-face.png"
    cv2.imwrite(str(nothing), np.full((400, 400, 3), 128, np.uint8))
    return blue, nothing


def test_photo_is_drawn_on_the_live_face_refused_without_a_face_and_removable(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    blue, nothing = _save_photos(tmp_path)
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        ctx = browser.new_context(viewport={"width": 800, "height": 1500}, permissions=["camera"])   # tall: no scrollbar to rescale the page
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
        requests, errors = [], []
        page.on("request", lambda r: requests.append((r.method, r.url, r.post_data)))
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{srv.port}/facemesh")
        _wait(page, "window.__facemesh.state === 'running' && window.__facemesh.found >= 5", 120)
        assert page.is_hidden("#badge")
        page.click("#wire")   # mesh lines off, as they are once a photo is shown: the reference is the plain camera picture
        time.sleep(0.5)
        before = _stage_pixels(page)

        page.set_input_files("#photoFile", str(nothing))
        _wait(page, "window.__facemesh.photo === 'error'", 60)
        assert "no face" in page.inner_text("#status") and page.is_hidden("#badge")
        assert page.evaluate("window.__facemesh.drawn") == 0

        _use_photo(page, blue)
        _wait(page, "window.__facemesh.drawn > 0", 60)
        assert page.evaluate("window.__facemesh.drawn") == 898
        assert page.is_visible("#badge") and "Virtual face" in page.inner_text("#badge"), "the label must be on screen while a photo is drawn"
        _set_match(page, 0)   # the raw photo: with colour matching on (the default) its blue skin would be pulled back to the live colours
        time.sleep(0.5)
        with_photo = _stage_pixels(page)
        box = page.evaluate("window.__facemesh.box")
        h, w = with_photo.shape[:2]
        x0, x1 = int(w * (1 - box["x"] - box["w"] * 0.8)), int(w * (1 - box["x"] - box["w"] * 0.2))   # the stage is mirrored; keep the middle of the face
        y0, y1 = int(h * (box["y"] + box["h"] * 0.2)), int(h * (box["y"] + box["h"] * 0.8))
        face = lambda img: img[y0:y1, x0:x1]   # noqa: E731
        diff = abs(face(with_photo) - face(before)).mean()
        blue_gain = (face(with_photo)[..., 0] - face(with_photo)[..., 2]).mean() - (face(before)[..., 0] - face(before)[..., 2]).mean()   # BGR: channel 0 is blue
        outside = abs(with_photo[: y0 // 2] - before[: y0 // 2]).mean()   # the top of the frame, far from the face, must not change
        print(f"\nphoto drawn: face area changed by {diff:.1f}/255, blue minus red {blue_gain:+.1f}; far from the face {outside:.1f}")
        assert diff > 15 and blue_gain > 15, "the photo did not change the picture where the face is"
        # the test clip sways, and the two pictures are taken a moment apart, so "far from the face" is not exactly zero (it measured 18 against a
        # third of 39 under load, while the photo itself is drawn only on the face): half is still a clear separation
        assert outside < diff / 2, "the photo changed the picture away from the face"

        page.click("#photoClear")
        _wait(page, "window.__facemesh.photo === 'none'", 10)
        assert page.is_hidden("#badge") and page.evaluate("window.__facemesh.drawn") == 0
        time.sleep(0.5)
        after = _stage_pixels(page)
        left = (face(after)[..., 0] - face(after)[..., 2]).mean() - (face(before)[..., 0] - face(before)[..., 2]).mean()
        assert abs(left) < blue_gain / 4, f"removing the photo must give the plain camera picture back (blue still {left:+.0f})"   # the test clip sways, so compare colour, not pixels

        _assert_requests_are_ours(requests, srv)   # the photo never left the page
        assert not errors, errors
    finally:
        browser.close()


# --- step S3: colour match, soft edge, eyes and mouth, and the privacy exception -----------------------------------------

def _set_match(page, percent):
    page.evaluate(f"(() => {{ const m = document.getElementById('match'); m.value = {percent}; m.dispatchEvent(new Event('input')); }})()")


# Counts every call that could read the picture back. MediaPipe's own runtime reads pixels for its inference, so a call is
# "ours" when it does not come from MediaPipe's files: the face-mesh code itself must never make one.
_READ_HOOK = """window.__reads = {n: 0, ours: 0, photoMask: 0};
const wrap = (proto, name) => { const o = proto && proto[name]; if (!o) return; proto[name] = function (...a) {
  window.__reads.n++;
  if (!/vision_wasm_internal|mediapipe/i.test(new Error().stack)) {
    // the one allowed read-back: the segmenter's class map of the user's PHOTO, which the page flags while it copies it (never the camera)
    if (window.__facemesh && window.__facemesh.readingPhotoMask) window.__reads.photoMask++; else window.__reads.ours++;
  }
  return o.apply(this, a); }; };
for (const p of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) wrap(p, 'readPixels');
wrap(HTMLCanvasElement.prototype, 'toDataURL'); wrap(HTMLCanvasElement.prototype, 'toBlob');
wrap(CanvasRenderingContext2D.prototype, 'getImageData'); wrap(CanvasRenderingContext2D.prototype, 'drawImage'); wrap(window, 'createImageBitmap');"""


def test_colour_match_takes_the_live_colours_and_the_picture_is_never_read_back(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    blue, _ = _save_photos(tmp_path)
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        ctx = browser.new_context(viewport={"width": 800, "height": 1500}, permissions=["camera"])
        ctx.add_init_script(_READ_HOOK)
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
        requests, errors = [], []
        page.on("request", lambda r: requests.append((r.method, r.url, r.post_data)))
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{srv.port}/facemesh")
        _wait(page, "window.__facemesh.state === 'running' && window.__facemesh.found >= 5", 120)
        page.click("#wire")
        time.sleep(0.5)
        plain = _stage_pixels(page)
        _use_photo(page, blue)
        _wait(page, "window.__facemesh.drawn > 0", 60)
        assert page.evaluate("window.__facemesh.match") == 100, "colour matching is on by default"

        box = page.evaluate("window.__facemesh.box")
        h, w = plain.shape[:2]
        x0, x1 = int(w * (1 - box["x"] - box["w"] * 0.8)), int(w * (1 - box["x"] - box["w"] * 0.2))
        y0, y1 = int(h * (box["y"] + box["h"] * 0.2)), int(h * (box["y"] + box["h"] * 0.8))
        gain = lambda img: (img[y0:y1, x0:x1, 0] - img[y0:y1, x0:x1, 2]).mean() - (plain[y0:y1, x0:x1, 0] - plain[y0:y1, x0:x1, 2]).mean()  # noqa: E731

        _set_match(page, 0)
        time.sleep(0.6)
        raw = gain(_stage_pixels(page))     # blue minus red, against the plain camera picture: the photo's own blue skin
        _set_match(page, 100)
        time.sleep(0.6)
        matched = gain(_stage_pixels(page))
        print(f"\nblue skin of the photo: raw {raw:+.0f}, colour matched {matched:+.0f} (0 = the live colours)")
        assert raw > 60, "with no matching the photo's blue skin should show"
        # S11: matching now takes only the live LIGHT; the photo keeps its own skin colour (that is the identity), so a purple room light or a
        # differently coloured live face must not turn the photo's skin into the live colours
        assert matched > raw * 0.6, "colour matching must keep the photo's own skin colour and only follow the live light"

        for keep in (False, True):          # keeping the live eyes and mouth, and not, must both draw
            page.click("#keepFace")
            time.sleep(0.4)
            assert page.evaluate("window.__facemesh.drawn") == 898
            assert page.evaluate("window.__facemesh.keep") == keep

        reads = page.evaluate("window.__reads")
        assert reads["ours"] == 0, f"the face-mesh code read the picture back: {reads}"
        _assert_requests_are_ours(requests, srv)
        assert not errors, errors
    finally:
        browser.close()


# --- step S4: smoothing, a face that is lost and comes back, a hand model on demand ----------------------------------------

def _write_blink_clip(path, face_frames=90, gap_frames=90):
    """The portrait for 3 s, then black for 3 s (no face), then the portrait again; the fake camera loops it."""
    import cv2
    import numpy as np
    from skimage import data

    portrait = cv2.resize(data.astronaut(), (480, 480))
    shown = np.zeros((480, 640, 3), np.uint8)
    shown[:, 80:560] = portrait
    face_frame = cv2.cvtColor(shown, cv2.COLOR_RGB2YUV_I420).tobytes()
    black = cv2.cvtColor(np.zeros((480, 640, 3), np.uint8), cv2.COLOR_RGB2YUV_I420).tobytes()
    with open(path, "wb") as fh:
        fh.write(b"YUV4MPEG2 W640 H480 F30:1 Ip A1:1 C420jpeg\n")
        for frame in [face_frame] * face_frames + [black] * gap_frames + [face_frame] * face_frames:
            fh.write(b"FRAME\n" + frame)


def test_smoothing_lowers_the_shake_and_can_be_switched_off(stack):  # noqa: F811
    p, exe, clip, srv = stack
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        ctx = browser.new_context(viewport={"width": 800, "height": 1500}, permissions=["camera"])
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{srv.port}/facemesh")
        _wait(page, "window.__facemesh.state === 'running' && window.__facemesh.frames >= 40", 150)
        s = page.evaluate("window.__facemesh")
        print(f"\nnose tip frame-to-frame move: raw {s['jitterRaw']:.5f}, smoothed {s['jitterSmooth']:.5f}")
        assert s["smooth"] is True and s["shown"] is True and s["opacity"] > 0.99
        assert 0 < s["jitterRaw"] and s["jitterSmooth"] <= s["jitterRaw"] * 1.02, "smoothing must not make the face shake more"
        page.click("#smooth")
        assert page.evaluate("window.__facemesh.smooth") is False and page.get_attribute("#smooth", "aria-pressed") == "false"
        page.click("#smooth")
        assert page.evaluate("window.__facemesh.smooth") is True
        assert not errors, errors
    finally:
        browser.close()


def test_a_lost_face_fades_out_and_a_returning_one_comes_back(stack, tmp_path):  # noqa: F811
    p, exe, _clip, srv = stack
    blink = tmp_path / "blink.y4m"
    _write_blink_clip(blink)
    blue, _ = _save_photos(tmp_path)
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={blink}"])
    try:
        ctx = browser.new_context(viewport={"width": 800, "height": 1500}, permissions=["camera"])
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{srv.port}/facemesh")
        _wait(page, "window.__facemesh.state === 'running'", 120)
        _use_photo(page, blue, 90)
        timeline, end = [], time.time() + 20      # more than one loop of the 9 s clip
        while time.time() < end:
            s = page.evaluate("[window.__facemesh.shown, window.__facemesh.opacity, window.__facemesh.drawn]")
            timeline.append(s)
            time.sleep(0.1)
        states = [t[0] for t in timeline]
        first_lost = states.index(False) if False in states else None
        print(f"\nface present in {100 * sum(states) / len(states):.0f}% of samples; "
              f"photo opacity went from {max(t[1] for t in timeline):.2f} down to {min(t[1] for t in timeline):.2f}")
        assert first_lost is not None, "the face was never lost: the test clip has a face-free stretch"
        assert True in states[first_lost:], "the face came back and the photo with it"
        assert all(t[2] == 0 for t in timeline if not t[0]), "nothing is drawn while the face is lost"
        assert max(t[1] for t in timeline) > 0.95, "fully drawn while the face is there"
        assert not errors, errors
    finally:
        browser.close()


def test_the_hand_model_starts_on_demand_and_the_page_keeps_running(stack):  # noqa: F811
    p, exe, clip, srv = stack
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        ctx = browser.new_context(viewport={"width": 800, "height": 1500}, permissions=["camera"])
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
        requests, errors = [], []
        page.on("request", lambda r: requests.append((r.method, r.url, r.post_data)))
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{srv.port}/facemesh")
        _wait(page, "window.__facemesh.state === 'running' && window.__facemesh.frames >= 20", 120)
        assert page.evaluate("window.__facemesh.hands") == "off", "the hand model is not loaded unless asked for"
        assert not any("hand_landmarker" in u for _, u, _ in requests)
        page.click("#hideHands")
        _wait(page, "window.__facemesh.hands === 'on' || window.__facemesh.hands === 'error'", 90)
        assert page.evaluate("window.__facemesh.hands") == "on", page.inner_text("#status")
        frames = page.evaluate("window.__facemesh.frames")
        _wait(page, f"window.__facemesh.frames >= {frames + 10} && window.__facemesh.handMs > 0", 90)
        s = page.evaluate("window.__facemesh")
        print(f"\nhand model: {s['handMs']:.0f} ms per run, about every 100 ms; cover {s['cover']:.2f}")
        assert s["cover"] == 0, "no hand is over the portrait's face"
        assert any("hand_landmarker" in u for _, u, _ in requests)
        page.click("#hideHands")
        assert page.evaluate("window.__facemesh.hands") == "off" and page.evaluate("window.__facemesh.handMs") == 0
        origin = f"127.0.0.1:{srv.port}"
        for method, url, post in requests:
            assert url.startswith(("blob:", "data:")) or origin in url, f"left the page: {url}"
            assert method == "GET" and not post
        assert not errors, errors
    finally:
        browser.close()


# --- step S5: consent, and the label that must stay on screen ------------------------------------------------------------------

def _ready_page(stack, tmp_path, photo_name="blue"):
    """A page with the portrait as camera, and the browser, context and page to drive. The caller closes the browser."""
    p, exe, clip, srv = stack
    photos = dict(zip(("blue", "nothing"), _save_photos(tmp_path)))
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    ctx = browser.new_context(viewport={"width": 800, "height": 1500}, permissions=["camera"])
    ctx.add_cookies(token_cookie(srv.port))
    page = ctx.new_page()
    requests, errors = [], []
    page.on("request", lambda r: requests.append((r.method, r.url, r.post_data)))
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(f"http://127.0.0.1:{srv.port}/facemesh")
    _wait(page, "window.__facemesh.state === 'running' && window.__facemesh.found >= 3", 150)
    return browser, ctx, page, photos[photo_name], requests, errors


def test_a_photo_is_used_only_after_a_signed_consent_for_that_exact_photo(stack, tmp_path):  # noqa: F811
    import hashlib
    from pathlib import Path

    p, exe, clip, srv = stack
    browser, ctx, page, photo, requests, errors = _ready_page(stack, tmp_path)
    try:
        page.set_input_files("#photoFile", str(photo))
        _wait(page, "window.__facemesh.photo === 'asking'", 60)
        assert page.is_visible("#consent") and "of you" in page.inner_text("#consentTerms") and "Virtual face" in page.inner_text("#consentTerms")
        assert page.is_disabled("#consentOk"), "Allow stays off until the statement is ticked"
        assert page.evaluate("window.__facemesh.drawn") == 0 and page.is_hidden("#badge"), "nothing is drawn while consent is being asked"
        page.check("#consentAttest")
        if page.is_visible("#qualityOverride"):   # S13d: a failed photo check needs one extra click, and the statement alone is not enough
            assert page.is_disabled("#consentOk"), "after a failed photo check, Allow needs the extra click as well as the statement"
            page.check("#qualityOverride")
        assert page.is_enabled("#consentOk")
        page.click("#consentNo")                                   # declining
        assert page.evaluate("window.__facemesh.photo") == "none" and page.is_hidden("#consent")
        assert "no consent" in page.inner_text("#status") and page.evaluate("window.__facemesh.drawn") == 0
        assert page.evaluate("window.__facemesh.record") is None

        page.set_input_files("#photoFile", str(photo))
        _wait(page, "window.__facemesh.photo === 'asking'", 60)
        page.check("#consentAttest")
        if page.is_visible("#qualityOverride"):
            page.check("#qualityOverride")
        page.click("#consentOk")
        _wait(page, "window.__facemesh.photo === 'ready' && window.__facemesh.drawn > 0", 60)
        sha = hashlib.sha256(Path(photo).read_bytes()).hexdigest()
        record = page.evaluate("window.__facemesh.record")
        assert record["scope"] == f"portrait:{sha}" and record["subject_id"] == "self" and len(record["signature"]) == 64
        assert page.is_visible("#badge") and "h" in page.inner_text("#consentState"), page.inner_text("#consentState")

        posts = [(u, json.loads(b)) for m, u, b in requests if m == "POST"]
        issued = [b for u, b in posts if u.endswith("/api/facemesh/consent")]
        assert issued and issued[-1] == {"sha256": sha, "attested": True, "hours": 2}, "only the hash, the statement and the hours were sent"
        first_bytes = Path(photo).read_bytes()[:64].hex()
        assert not any(first_bytes in (b or "") for _, _, b in requests), "the photo's bytes were never sent"
        _assert_requests_are_ours(requests, srv)
        assert not errors, errors
    finally:
        browser.close()


def test_ending_the_consent_on_the_server_stops_the_photo(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, photo, requests, errors = _ready_page(stack, tmp_path)
    try:
        _use_photo(page, photo)
        _wait(page, "window.__facemesh.drawn > 0", 60)
        record = page.evaluate("window.__facemesh.record")
        base = f"http://127.0.0.1:{srv.port}"
        reply = ctx.request.post(f"{base}/api/facemesh/consent/revoke", data=json.dumps({"record": record}),
                                 headers={"Content-Type": "application/json", "Origin": base})
        assert reply.status == 200, reply.text()
        _wait(page, "window.__facemesh.consent === 'ended'", 40)      # the page asks the server about every 2 s
        s = page.evaluate("window.__facemesh")
        assert s["photo"] == "none" and s["drawn"] == 0 and "revoked" in s["endedReason"], s
        assert page.is_hidden("#badge") and "stopped" in page.inner_text("#status")
        assert not errors, errors
    finally:
        browser.close()


def test_consent_runs_out_when_its_time_is_up(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, photo, requests, errors = _ready_page(stack, tmp_path)
    try:
        page.evaluate("document.getElementById('consentHours').innerHTML = '<option value=\"0.0015\" selected>test</option>'")   # 5.4 s
        _use_photo(page, photo)
        _wait(page, "window.__facemesh.consent === 'ended'", 60)
        s = page.evaluate("window.__facemesh")
        assert "expired" in s["endedReason"] and s["photo"] == "none" and s["drawn"] == 0, s
        assert not errors, errors
    finally:
        browser.close()


def test_a_server_that_stops_answering_stops_the_photo(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, photo, requests, errors = _ready_page(stack, tmp_path)
    try:
        _use_photo(page, photo)
        _wait(page, "window.__facemesh.drawn > 0", 60)
        page.route("**/api/facemesh/consent/check", lambda route: route.abort())     # the consent can no longer be confirmed
        _wait(page, "window.__facemesh.consent === 'ended'", 60)
        s = page.evaluate("window.__facemesh")
        assert "has not confirmed" in s["endedReason"] and s["photo"] == "none" and s["drawn"] == 0, s
        assert not errors, errors
    finally:
        browser.close()


_BADGE = "document.getElementById('badge')"
_TEXT = "Virtual face: a photo of you is drawn on your live face (prototype)"
_COVER = ("(function () { var b = " + _BADGE + ".getBoundingClientRect(); var d = document.createElement('div'); d.id = 'cover'; "
          "d.style.cssText = 'position:fixed;left:' + b.left + 'px;top:' + b.top + 'px;width:' + b.width + 'px;height:' + b.height + 'px;background:#000;z-index:99'; "
          "document.body.append(d); })()")
_ATTACKS = {
    "hidden": (_BADGE + ".style.display = 'none'", _BADGE + ".style.display = ''"),
    "see-through": (_BADGE + ".style.opacity = '0'", _BADGE + ".style.opacity = ''"),
    "no longer says": (_BADGE + ".textContent = 'Real face'", _BADGE + ".textContent = '" + _TEXT + "'"),
    "too small": (_BADGE + ".style.fontSize = '1px'; " + _BADGE + ".style.padding = '0'", _BADGE + ".style.fontSize = ''; " + _BADGE + ".style.padding = ''"),
    "covers": (_COVER, "document.getElementById('cover').remove()"),
}


def test_hiding_covering_or_changing_the_label_pauses_the_photo_and_it_comes_back_with_the_label(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, photo, requests, errors = _ready_page(stack, tmp_path)
    try:
        _use_photo(page, photo)
        _wait(page, "window.__facemesh.drawn > 0", 60)
        assert page.evaluate("window.__facemesh.label") == ""
        for reason, (break_it, fix_it) in _ATTACKS.items():
            page.evaluate(break_it)
            _wait(page, "window.__facemesh.label !== ''", 20)
            _wait(page, "window.__facemesh.drawn === 0", 30)
            s = page.evaluate("window.__facemesh")
            assert reason in s["label"], f"{reason}: {s['label']}"
            assert s["photo"] == "ready", "the photo is paused, not thrown away"
            assert "paused" in page.inner_text("#status")
            page.evaluate(fix_it)
            _wait(page, "window.__facemesh.label === ''", 20)
            _wait(page, "window.__facemesh.drawn > 0", 30)
        assert not errors, errors
    finally:
        browser.close()
