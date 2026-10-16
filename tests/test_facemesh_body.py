"""Body and clothes (step S10) in a real browser: the button, cutting the body and clothes out of the photo, finding the photo's
shoulders, running the live pose model, and drawing the puppet behind the hair and the face. The camera is a fake one that plays a
public-domain portrait (head and shoulders); the photo is the same portrait, so both show shoulders.

The page runs on a software renderer here (a couple of frames a second), so the waits are generous. What is checked is what must hold
whatever the photo: it starts, the face keeps drawing, the live pose model runs, and nothing breaks. When the body layer builds
(state "on") the puppet must also be drawn. Set REALX_SHOT to a file name to save a screenshot of the result.
"""

import os

from test_facemesh_browser import _ready_page, _use_photo, _wait, stack  # noqa: F401  (stack is a fixture)

SLOW = 200


def _shoulders_photo(tmp_path):
    import cv2
    from skimage import data

    path = tmp_path / "shoulders.png"
    crop = data.astronaut()[0:420, 40:440]                      # the face is about a third of the width (the page needs 20%), the shoulders stay in
    cv2.imwrite(str(path), cv2.cvtColor(cv2.resize(crop, (480, 504)), cv2.COLOR_RGB2BGR))
    return path


def test_body_and_clothes_start_cleanly_and_draw_behind_the_face(stack, tmp_path):  # noqa: F811
    browser, ctx, page, _unused, requests, errors = _ready_page(stack, tmp_path)
    try:
        _use_photo(page, _shoulders_photo(tmp_path), SLOW)
        _wait(page, "window.__facemesh.drawn > 0", SLOW)
        page.click("#bodyBtn")
        _wait(page, "['on', 'nopose', 'nomask', 'error'].includes(window.__facemesh.body) && window.__facemesh.body !== 'loading'", SLOW)
        _wait(page, "window.__facemesh.body !== 'loading' && window.__facemesh.drawn > 0", SLOW)   # the cut blocks the page for a while
        state = page.evaluate("window.__facemesh")
        print("body state:", state["body"], "points:", state["bodyPoints"], "bones:", state["bodyBones"], "poseMs:", round(state["poseMs"], 1))
        assert state["body"] in ("on", "nopose", "nomask"), state.get("lastError")
        assert page.get_attribute("#bodyBtn", "aria-pressed") == "true"
        if state["body"] == "on":
            assert state["bodyPoints"] > 20 and state["bodyBones"] >= 1
            _wait(page, "window.__facemesh.bodyDrawn > 0", SLOW)
            assert page.evaluate("window.__facemesh.poseMs") > 0, "the live pose model ran"
            if os.environ.get("REALX_SHOT"):
                page.screenshot(path=os.environ["REALX_SHOT"])
        page.click("#bodyBtn")                                                          # off again: back to the face alone
        _wait(page, "window.__facemesh.body === 'off'", SLOW)
        assert page.evaluate("window.__facemesh.drawn") > 0
        assert not errors, errors
    finally:
        browser.close()


def test_hands_on_top_with_the_body_starts_cleanly_and_never_reads_the_picture_back(stack, tmp_path):  # noqa: F811
    """S10c: the option loads the hand model and sets up the live-hands pass. The fake camera shows no hand, so nothing is drawn by it
    (the shapes come from a hand the model must find); what is checked is that it starts, the face and body keep drawing, and the new
    use of the camera picture never reads anything back: the read-back hook must count zero calls from the face-mesh code."""
    from conftest import token_cookie
    from test_facemesh_browser import _READ_HOOK, _assert_requests_are_ours, _launch
    from test_tracking_browser import FAKE_CAMERA

    p, exe, clip, srv = stack
    browser = _launch(p, exe, FAKE_CAMERA + [f"--use-file-for-fake-video-capture={clip}"])
    try:
        ctx = browser.new_context(viewport={"width": 800, "height": 1700}, permissions=["camera"])
        ctx.add_init_script(_READ_HOOK)
        ctx.add_cookies(token_cookie(srv.port))
        page = ctx.new_page()
        requests, errors = [], []
        page.on("request", lambda r: requests.append((r.method, r.url, r.post_data)))
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{srv.port}/facemesh")
        _wait(page, "window.__facemesh.state === 'running' && window.__facemesh.found >= 3", 150)
        _use_photo(page, _shoulders_photo(tmp_path), SLOW)
        _wait(page, "window.__facemesh.drawn > 0", SLOW)
        page.click("#handsTop")
        _wait(page, "window.__facemesh.liveHands === 'on' || window.__facemesh.liveHands === 'error'", SLOW)
        page.click("#bodyBtn")
        _wait(page, "['on', 'nopose', 'nomask', 'error'].includes(window.__facemesh.body) && window.__facemesh.body !== 'loading'", SLOW)
        _wait(page, "window.__facemesh.drawn > 0", SLOW)
        state = page.evaluate("window.__facemesh")
        print("hands on top:", state["liveHands"], "circles:", state["handCircles"], "live triangles drawn:", state["liveDrawn"], "body:", state["body"])
        assert state["liveHands"] == "on", state.get("lastError")
        assert state["body"] in ("on", "nopose", "nomask"), state.get("lastError")
        _wait(page, "window.__facemesh.drawn > 0", SLOW)                       # drawing pauses while a slow model stalls the page; it comes back
        assert page.get_attribute("#handsTop", "aria-pressed") == "true"
        page.click("#handsTop")
        _wait(page, "window.__facemesh.liveHands === 'off'", SLOW)
        assert page.evaluate("window.__facemesh.drawn") > 0
        reads = page.evaluate("window.__reads")
        assert reads["ours"] == 0, f"the face-mesh code read the picture back: {reads}"
        _assert_requests_are_ours(requests, srv)
        assert not errors, errors
    finally:
        browser.close()
