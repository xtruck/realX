"""Stage 3, "Photos at several angles", in a real browser with a fake camera playing a portrait.

What is checked: the option is off by default; a side photo that faces the same way as the front photo is refused and the page
says why; an accepted side photo asks for its own consent; the photo and its side photo are then checked with ONE batched
request; nothing reads the camera back; turning the option off ends the side photo's consent.

What is NOT checked: how it looks. The fake camera never turns its head, so the crossfade is only exercised by the node tests.
The "turned" photos here are perspective warps of the same portrait (about 8 degrees each way), not real side views.
"""

import json
import time

import cv2
import numpy as np
from skimage import data

from conftest import token_cookie
from test_facemesh_browser import _READ_HOOK, _use_photo, _wait
from test_tracking_browser import FAKE_CAMERA, _launch, stack  # noqa: F401  (stack is a fixture)


def _warp(img, k):
    h, w = img.shape[:2]
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    dst = np.float32([[0, 0], [w, h * k], [w, h * (1 - k)], [0, h]])   # one side shrinks: the face reads as turned a little
    return cv2.warpPerspective(img, cv2.getPerspectiveTransform(src, dst), (w, h), borderMode=cv2.BORDER_REPLICATE)


def _photos(tmp_path):
    base = cv2.resize(data.astronaut()[0:300, 100:400], (480, 480))
    front, side, same = tmp_path / "front.png", tmp_path / "side.png", tmp_path / "same.png"
    turned = _warp(base, 0.3)
    cv2.imwrite(str(front), turned)                    # about 8 degrees one way
    cv2.imwrite(str(side), cv2.flip(turned, 1))        # its mirror image: about 8 degrees the other way, about 16 apart
    cv2.imwrite(str(same), cv2.GaussianBlur(turned, (3, 3), 0))   # another file, facing the same way as the front photo
    return front, side, same


def _posts(requests, srv, path):
    origin = f"127.0.0.1:{srv.port}"
    return [json.loads(post) for method, url, post in requests if method == "POST" and url.split(origin, 1)[-1] == path]


def _side_photo(page, path, timeout=90):
    """Offer a side photo; return 'asking' when its consent question is shown, or the reason it was refused."""
    page.evaluate("window.__facemesh.angleRejected = ''")
    page.set_input_files("#angleFile", str(path))
    end = time.time() + timeout
    while time.time() < end:
        if page.evaluate("window.__facemesh.photo") == "asking":
            return "asking"
        reason = page.evaluate("window.__facemesh.angleRejected")
        if reason:
            return reason
        page.wait_for_timeout(250)
    raise AssertionError(f"no answer for the side photo: {page.evaluate('window.__facemesh')}")


def test_side_photos_are_refused_or_consented_one_by_one_and_checked_in_one_request(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    front, side, same = _photos(tmp_path)
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        ctx = browser.new_context(viewport={"width": 800, "height": 1600}, permissions=["camera"])
        ctx.add_cookies(token_cookie(srv.port))
        ctx.add_init_script(_READ_HOOK)
        page = ctx.new_page()
        requests, errors = [], []
        page.on("request", lambda r: requests.append((r.method, r.url, r.post_data)))
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{srv.port}/facemesh")
        _wait(page, "window.__facemesh.state === 'running' && window.__facemesh.found >= 3", 150)

        assert page.get_attribute("#anglesBtn", "aria-pressed") == "false", "off by default"
        assert page.is_disabled("#angleAdd")
        _use_photo(page, front)
        _wait(page, "window.__facemesh.drawn > 0", 60)

        page.click("#anglesBtn")
        assert page.evaluate("window.__facemesh.angles") == "on" and not page.is_disabled("#angleAdd")

        reason = _side_photo(page, same)
        assert "same way as your front photo" in reason, reason
        assert "cannot be used" in page.inner_text("#status"), "the page says why"
        assert page.evaluate("window.__facemesh.angleCount") == 0

        assert _side_photo(page, side) == "asking", "an accepted side photo asks for its own consent"
        page.check("#consentAttest")
        page.click("#consentOk")
        _wait(page, "window.__facemesh.angleCount === 1 && window.__facemesh.photo === 'ready'", 60)
        assert page.is_visible("#angles")
        issued = _posts(requests, srv, "/api/facemesh/consent")
        assert len(issued) == 2 and issued[0]["sha256"] != issued[1]["sha256"], "two photos, two consents"

        end = time.time() + 30                            # a check already under way when the side photo arrived may still be a single one
        while time.time() < end and not _posts(requests, srv, "/api/facemesh/consent/check-batch"):
            page.wait_for_timeout(250)
        assert _posts(requests, srv, "/api/facemesh/consent/check-batch"), "the photo and its side photo are checked together"
        page.wait_for_timeout(1000)
        singles, batched = len(_posts(requests, srv, "/api/facemesh/consent/check")), len(_posts(requests, srv, "/api/facemesh/consent/check-batch"))
        page.wait_for_timeout(6000)  # about three more timed checks
        batches = _posts(requests, srv, "/api/facemesh/consent/check-batch")
        assert len(batches) >= batched + 2, "the timed check keeps using one request for both photos"
        assert all(len(b["items"]) == 2 and all(set(i) == {"record", "sha256"} for i in b["items"]) for b in batches)
        assert all(len(json.dumps(b)) < 4096 for b in batches), "small: records and hashes only, never a picture"
        assert len(_posts(requests, srv, "/api/facemesh/consent/check")) == singles, "no per-photo checks while the side photo is there"
        page.evaluate("window.scrollTo(0, 0)")             # the side-photo controls sit at the end of the page; the label must be back in view
        _wait(page, "window.__facemesh.drawn > 0", 60)
        assert page.evaluate("window.__facemesh.consent") == "active"
        assert page.is_visible("#badge")

        reads = page.evaluate("window.__reads")
        assert reads["ours"] == 0, f"the page read a picture back: {reads}"

        revoked = len(_posts(requests, srv, "/api/facemesh/consent/revoke"))
        page.click("#anglesBtn")
        _wait(page, "window.__facemesh.angleCount === 0", 20)
        page.wait_for_timeout(500)
        assert len(_posts(requests, srv, "/api/facemesh/consent/revoke")) == revoked + 1, "turning it off ends the side photo's consent"
        assert page.evaluate("window.__facemesh.consent") == "active", "the front photo stays"
        assert not errors, errors
    finally:
        browser.close()
