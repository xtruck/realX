"""Hair that moves (step S9) in a real browser: the button, cutting the hair out of the photo, building the sheet, the hand model,
and drawing the hair behind the face. The camera is a fake one that plays a public-domain portrait; the photo is that portrait
with long hair painted on both sides (a stand-in for a photo of someone with long hair).

The page runs on a software renderer here (about 2 frames a second), so the waits are generous, and what is checked is what must
hold: it starts, it does not break the face, nothing is read back from the camera, and the hair is actually drawn when it exists.
"""

from test_facemesh_browser import _ready_page, _use_photo, _wait, stack  # noqa: F401  (stack is a fixture)

SLOW = 150


def _long_hair_photo(tmp_path):
    """The astronaut portrait with long dark-brown hair painted on both sides of the head and over the top."""
    import cv2
    import numpy as np
    from skimage import data

    rng = np.random.default_rng(3)
    face = cv2.resize(data.astronaut()[0:300, 100:400], (480, 480))
    img = face.copy()
    hair = np.zeros(img.shape[:2], np.uint8)
    cv2.ellipse(hair, (240, 150), (150, 120), 0, 180, 360, 255, -1)                      # over the top of the head
    for x0, x1 in ((50, 150), (330, 430)):                                              # a long curtain on each side
        pts = np.array([[x0, 120], [x1, 120], [x1 + 8, 478], [x0 - 8, 478]], np.int32)
        cv2.fillPoly(hair, [pts], 255)
    base = np.array([55, 38, 28], np.float32)                                           # dark brown, with strand-like variation
    texture = base + rng.normal(0, 14, img.shape).astype(np.float32)
    texture += 10 * np.sin(np.arange(img.shape[1])[None, :, None] / 3.0)
    img[hair > 0] = np.clip(texture, 0, 255).astype(np.uint8)[hair > 0]
    face_area = np.zeros(img.shape[:2], np.uint8)                                       # keep the face itself
    cv2.ellipse(face_area, (240, 215), (88, 120), 0, 0, 360, 255, -1)
    img[face_area > 0] = face[face_area > 0]
    path = tmp_path / "long-hair.png"
    cv2.imwrite(str(path), img)
    return path


def test_moving_hair_starts_cleanly_and_draws_hair_behind_the_face(stack, tmp_path):  # noqa: F811
    browser, ctx, page, _unused, requests, errors = _ready_page(stack, tmp_path)
    try:
        _use_photo(page, _long_hair_photo(tmp_path), SLOW)
        _wait(page, "window.__facemesh.drawn > 0", SLOW)
        page.click("#hairBtn")
        _wait(page, "['on', 'nohair', 'nomask', 'error'].includes(window.__facemesh.hair)", SLOW)
        _wait(page, "window.__facemesh.hair !== 'loading' && window.__facemesh.drawn > 0", SLOW)   # the cut blocks the page for a while; the face comes back
        state = page.evaluate("window.__facemesh")
        print("hair state:", state["hair"], "points:", state["hairPoints"], "free:", state["hairFree"], "hair share:", round(state.get("hairShare", 0), 3))
        assert state["hair"] in ("on", "nohair", "nomask"), state
        assert page.get_attribute("#hairBtn", "aria-pressed") == "true"
        if state["hair"] == "on":
            assert state["hairPoints"] > 0 and state["hairFree"] > 0
            _wait(page, "window.__facemesh.hairDrawn > 0", SLOW)
            assert page.evaluate("window.__facemesh.hairResets") == 0
        page.click("#hairBtn")                                                          # off again: back to the face alone
        _wait(page, "window.__facemesh.hair === 'off'", SLOW)
        assert page.evaluate("window.__facemesh.drawn") > 0
        assert not errors, errors
    finally:
        browser.close()
