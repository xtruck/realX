"""The face-mesh prototype (step S1) in a real browser, with a fake camera that plays a portrait.

Checks: the page starts the camera and the face model, finds the face, draws the mesh over it, reports its speed, and
nothing but same-origin GETs for the page's own files leaves it (no picture, no upload).
"""

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

        origin = f"127.0.0.1:{srv.port}"
        for method, url, post in requests:
            assert url.startswith(("blob:", "data:")) or origin in url, f"left the page: {url}"
            assert method == "GET" and not post, f"{method} {url}"
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

        page.set_input_files("#photoFile", str(blue))
        _wait(page, "window.__facemesh.photo === 'ready' && window.__facemesh.drawn > 0", 60)
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
        assert outside < diff / 3, "the photo changed the picture away from the face"   # the test clip sways a little, so not zero

        page.click("#photoClear")
        _wait(page, "window.__facemesh.photo === 'none'", 10)
        assert page.is_hidden("#badge") and page.evaluate("window.__facemesh.drawn") == 0
        time.sleep(0.5)
        after = _stage_pixels(page)
        left = (face(after)[..., 0] - face(after)[..., 2]).mean() - (face(before)[..., 0] - face(before)[..., 2]).mean()
        assert abs(left) < blue_gain / 4, f"removing the photo must give the plain camera picture back (blue still {left:+.0f})"   # the test clip sways, so compare colour, not pixels

        origin = f"127.0.0.1:{srv.port}"
        for method, url, post in requests:   # the photo never left the page
            assert url.startswith(("blob:", "data:")) or origin in url, f"left the page: {url}"
            assert method == "GET" and not post, f"{method} {url}"
        assert not errors, errors
    finally:
        browser.close()


# --- step S3: colour match, soft edge, eyes and mouth, and the privacy exception -----------------------------------------

def _set_match(page, percent):
    page.evaluate(f"(() => {{ const m = document.getElementById('match'); m.value = {percent}; m.dispatchEvent(new Event('input')); }})()")


# Counts every call that could read the picture back. MediaPipe's own runtime reads pixels for its inference, so a call is
# "ours" when it does not come from MediaPipe's files: the face-mesh code itself must never make one.
_READ_HOOK = """window.__reads = {n: 0, ours: 0};
const wrap = (proto, name) => { const o = proto && proto[name]; if (!o) return; proto[name] = function (...a) {
  window.__reads.n++; if (!/vision_wasm_internal|mediapipe/i.test(new Error().stack)) window.__reads.ours++; return o.apply(this, a); }; };
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
        page.set_input_files("#photoFile", str(blue))
        _wait(page, "window.__facemesh.photo === 'ready' && window.__facemesh.drawn > 0", 60)
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
        assert abs(matched) < raw / 2, "colour matching must pull the photo's skin to the live face's colours"

        for keep in (False, True):          # keeping the live eyes and mouth, and not, must both draw
            page.click("#keepFace")
            time.sleep(0.4)
            assert page.evaluate("window.__facemesh.drawn") == 898
            assert page.evaluate("window.__facemesh.keep") == keep

        reads = page.evaluate("window.__reads")
        assert reads["ours"] == 0, f"the face-mesh code read the picture back: {reads}"
        origin = f"127.0.0.1:{srv.port}"
        for method, url, post in requests:
            assert url.startswith(("blob:", "data:")) or origin in url, f"left the page: {url}"
            assert method == "GET" and not post, f"{method} {url}"
        assert not errors, errors
    finally:
        browser.close()
