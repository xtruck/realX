"""The face-mesh dashboard (step S6a) in a real browser: a gallery of the user's own photos, each with its own consent, one-click
switching with a notice, a LIVE badge with a timer, full screen, and a stop button that ends everything.

The camera is a fake one that plays a public-domain portrait. The software renderer used by these tests runs at about 2 fps,
so the waits are generous.
"""

import hashlib
import json
import re
from pathlib import Path

import pytest
from conftest import token_cookie
from test_facemesh_browser import FAKE_CAMERA, _assert_requests_are_ours, _launch, _ready_page, _use_photo, _wait, stack  # noqa: F401

SLOW = 120   # seconds: a switch has to be seen by a page that draws about two frames a second


def _write_photos(tmp_path):
    """Two photos of a big face that are not the same file: the portrait, and the portrait mirrored and cropped differently."""
    import cv2
    from skimage import data

    one = cv2.resize(data.astronaut()[0:300, 100:400], (480, 480))
    two = cv2.resize(data.astronaut()[0:320, 80:400][:, ::-1], (480, 480))
    a, b = tmp_path / "first-face.png", tmp_path / "second-face.png"
    cv2.imwrite(str(a), one)
    cv2.imwrite(str(b), two)
    return a, b


def _sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def _items(page):
    return page.evaluate("Array.from(document.querySelectorAll('#gallery .thumb')).map(b => ({id: b.dataset.id, label: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed')}))")


def _active(page):
    return next((i for i in _items(page) if i["pressed"] == "true"), None)


def _revoke(ctx, srv, record):
    base = f"http://127.0.0.1:{srv.port}"
    return ctx.request.post(f"{base}/api/facemesh/consent/revoke", data=json.dumps({"record": record}),
                            headers={"Content-Type": "application/json", "Origin": base})


def _check(ctx, srv, record, sha):
    base = f"http://127.0.0.1:{srv.port}"
    reply = ctx.request.post(f"{base}/api/facemesh/consent/check", data=json.dumps({"record": record, "sha256": sha}),
                             headers={"Content-Type": "application/json", "Origin": base})
    return reply.status, reply.json()


def _two_in_the_gallery(stack, tmp_path):
    """A page with both photos added, each with its own consent. Returns what a test needs; the caller closes the browser."""
    browser, ctx, page, _unused, requests, errors = _ready_page(stack, tmp_path)
    first, second = _write_photos(tmp_path)
    _use_photo(page, first, SLOW)
    _wait(page, "window.__facemesh.drawn > 0", SLOW)
    rec1 = page.evaluate("window.__facemesh.record")
    _use_photo(page, second, SLOW)
    _wait(page, "window.__facemesh.avatars === 2 && window.__facemesh.drawn > 0", SLOW)
    rec2 = page.evaluate("window.__facemesh.record")
    return browser, ctx, page, (first, second), (rec1, rec2), requests, errors


def test_two_photos_make_two_gallery_items_each_with_its_own_signed_consent(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, (first, second), (rec1, rec2), requests, errors = _two_in_the_gallery(stack, tmp_path)
    try:
        items = _items(page)
        assert len(items) == 2 and page.evaluate("window.__facemesh.avatars") == 2
        assert {i["label"] for i in items} >= {"first-face.png", "second-face.png"} or all(("first-face" in i["label"] or "second-face" in i["label"]) for i in items), items
        assert sum(1 for i in items if i["pressed"] == "true") == 1, "exactly one photo is the active one"
        assert rec1["scope"] == f"portrait:{_sha(first)}" and rec2["scope"] == f"portrait:{_sha(second)}"
        assert rec1["record_id"] != rec2["record_id"] and rec1["signature"] != rec2["signature"], "a separate consent for each photo"
        assert _check(ctx, srv, rec1, _sha(first))[0] == 200 and _check(ctx, srv, rec2, _sha(second))[0] == 200
        assert _check(ctx, srv, rec1, _sha(second))[0] == 403, "one photo's consent does not cover the other"
        assert not errors, errors
    finally:
        browser.close()


def test_clicking_the_other_photo_switches_to_it_with_a_notice(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, (first, second), (rec1, rec2), requests, errors = _two_in_the_gallery(stack, tmp_path)
    try:
        before = _active(page)
        other = next(i for i in _items(page) if i["id"] != before["id"])
        page.click(f"#gallery .thumb[data-id='{other['id']}']")
        _wait(page, f"window.__facemesh.avatar === '{other['id']}'", SLOW)
        _wait(page, "window.__facemesh.drawn > 0", SLOW)
        assert _active(page)["id"] == other["id"] and page.get_attribute(f"#gallery .thumb[data-id='{before['id']}']", "aria-pressed") != "true"
        stem = re.sub(r"\.[a-z]+$", "", other["label"])
        notice = page.inner_text("#toast")
        assert "Avatar changed to" in notice and stem in notice, notice
        assert page.evaluate("window.__facemesh.toast") == notice or "Avatar changed to" in page.evaluate("window.__facemesh.toast")
        assert page.evaluate("window.__facemesh.label") == "" and page.is_visible("#badge"), "the label stays on screen through a switch"
        page.click(f"#gallery .thumb[data-id='{before['id']}']")            # and back
        _wait(page, f"window.__facemesh.avatar === '{before['id']}'", SLOW)
        assert not errors, errors
    finally:
        browser.close()


def test_ending_one_photos_consent_on_the_server_drops_only_that_photo(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, (first, second), (rec1, rec2), requests, errors = _two_in_the_gallery(stack, tmp_path)
    try:
        active_record = page.evaluate("window.__facemesh.record")
        keep_record = rec1 if active_record["record_id"] == rec2["record_id"] else rec2
        assert _revoke(ctx, srv, active_record).status == 200
        _wait(page, "window.__facemesh.avatars === 1", SLOW)               # the page asks the server about every 2 s
        s = page.evaluate("window.__facemesh")
        assert "revoked" in (s["endedReason"] or s["toast"]).lower(), (s["endedReason"], s["toast"])
        assert len(_items(page)) == 1
        remaining = _items(page)[0]
        if remaining["pressed"] != "true":
            page.click(f"#gallery .thumb[data-id='{remaining['id']}']")
        _wait(page, "window.__facemesh.photo === 'ready' && window.__facemesh.drawn > 0", SLOW)
        assert page.evaluate("window.__facemesh.record")["record_id"] == keep_record["record_id"], "the other photo is the one still being drawn"
        assert not errors, errors
    finally:
        browser.close()


def test_a_photo_whose_consent_ended_while_it_was_not_active_is_dropped_when_it_is_picked(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, (first, second), (rec1, rec2), requests, errors = _two_in_the_gallery(stack, tmp_path)
    try:
        active_record = page.evaluate("window.__facemesh.record")
        idle_record = rec1 if active_record["record_id"] == rec2["record_id"] else rec2
        assert _revoke(ctx, srv, idle_record).status == 200
        idle = next(i for i in _items(page) if i["pressed"] != "true")
        page.click(f"#gallery .thumb[data-id='{idle['id']}']")             # its consent is checked once on the way in
        _wait(page, "window.__facemesh.avatars === 1", SLOW)
        s = page.evaluate("window.__facemesh")
        assert "revoked" in (s["endedReason"] or s["toast"]).lower(), (s["endedReason"], s["toast"])
        assert s["avatar"] != idle["id"] and page.evaluate("window.__facemesh.record")["record_id"] == active_record["record_id"]
        _wait(page, "window.__facemesh.drawn > 0", SLOW)
        assert not errors, errors
    finally:
        browser.close()


def test_the_remove_button_of_a_photo_ends_its_consent(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, (first, second), (rec1, rec2), requests, errors = _two_in_the_gallery(stack, tmp_path)
    try:
        active_record = page.evaluate("window.__facemesh.record")
        gone_record, gone_sha = (rec1, _sha(first)) if active_record["record_id"] == rec2["record_id"] else (rec2, _sha(second))
        idle = next(i for i in _items(page) if i["pressed"] != "true")
        page.click(f"#gallery .thumb-remove[data-id='{idle['id']}']")
        _wait(page, "window.__facemesh.avatars === 1", SLOW)
        assert len(_items(page)) == 1 and _items(page)[0]["id"] != idle["id"]
        status, body = _check(ctx, srv, gone_record, gone_sha)
        assert status == 403 and "revoked" in body["error"], (status, body)
        assert page.evaluate("window.__facemesh.record")["record_id"] == active_record["record_id"], "the other photo is untouched"
        page.click("#photoClear")                                         # removing the active one empties the gallery
        _wait(page, "window.__facemesh.avatars === 0", SLOW)
        assert page.evaluate("window.__facemesh.photo") == "none" and _items(page) == []
        active_sha = _sha(first) if active_record["record_id"] == rec1["record_id"] else _sha(second)
        assert _check(ctx, srv, active_record, active_sha)[0] == 403, "removing the last photo ended its consent too"
        assert not errors, errors
    finally:
        browser.close()


def test_the_live_badge_counts_while_a_photo_is_drawn_and_goes_after_stop(stack, tmp_path):  # noqa: F811
    import time

    p, exe, clip, srv = stack
    browser, ctx, page, photo, requests, errors = _ready_page(stack, tmp_path)
    try:
        assert page.is_hidden("#live") and page.evaluate("window.__facemesh.session") == "idle"
        first, _second = _write_photos(tmp_path)
        _use_photo(page, first, SLOW)
        _wait(page, "window.__facemesh.session === 'live' && window.__facemesh.drawn > 0", SLOW)
        assert page.is_visible("#live") and re.search(r"LIVE\s+\d{1,2}:\d\d", page.inner_text("#live")), page.inner_text("#live")
        # The timer counts the time between drawn frames, and a gap longer than a second adds only a second (a frozen page is not
        # live). On a software renderer "Clean the edges" freezes the page for ~12 s per segmenter run, so a fixed 4 s wait proved
        # nothing about the timer. It is switched off here (it is not what this test is about), the test waits for the timer to
        # advance 6 s, and checks that it never runs faster than real time. The allowance is one capped step (1 s): the reading
        # only changes on a drawn frame, so the first one can be up to one step old when the clock starts.
        # switched off in one step inside the page: it may already have turned itself off as too slow, and a click would turn it back on
        page.evaluate("() => { const b = document.querySelector('#seamBtn'); if (b.getAttribute('aria-pressed') === 'true') b.click(); }")
        _wait(page, "(window.__facemesh.seam === 'off' || window.__facemesh.seam === 'too slow') && window.__facemesh.drawn > 0", SLOW)
        t0, w0 = page.evaluate("window.__facemesh.liveSeconds"), time.monotonic()
        _wait(page, f"window.__facemesh.liveSeconds >= {t0 + 6}", SLOW)
        t1, w1 = page.evaluate("window.__facemesh.liveSeconds"), time.monotonic()
        assert t1 - t0 <= (w1 - w0) + 1.0, f"the timer ran faster than the clock: {t1 - t0:.2f} s counted in {w1 - w0:.2f} s"
        page.click("#stop")
        _wait(page, "window.__facemesh.session === 'stopped'", SLOW)
        assert page.is_hidden("#live")
        assert not errors, errors
    finally:
        browser.close()


def test_stop_ends_every_consent_clears_the_gallery_and_a_new_photo_starts_a_fresh_session(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, (first, second), (rec1, rec2), requests, errors = _two_in_the_gallery(stack, tmp_path)
    try:
        page.click("#stop")
        _wait(page, "window.__facemesh.session === 'stopped'", SLOW)
        s = page.evaluate("window.__facemesh")
        assert s["avatars"] == 0 and s["photo"] == "none" and s["drawn"] == 0 and _items(page) == []
        assert "Session stopped" in page.inner_text("#toast") and page.is_hidden("#badge")
        for record, path in ((rec1, first), (rec2, second)):                # every consent ended on the server, not only forgotten here
            status, body = _check(ctx, srv, record, _sha(path))
            assert status == 403 and "revoked" in body["error"], (status, body)
        _use_photo(page, first, SLOW)
        _wait(page, "window.__facemesh.session === 'live' && window.__facemesh.avatars === 1 && window.__facemesh.drawn > 0", SLOW)
        fresh = page.evaluate("window.__facemesh.record")
        assert fresh["record_id"] not in (rec1["record_id"], rec2["record_id"]), "a new consent, not the old one"
        assert not errors, errors
    finally:
        browser.close()


def test_full_screen_keeps_the_label_on_screen_and_the_photo_drawn(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, photo, requests, errors = _ready_page(stack, tmp_path)
    try:
        first, _second = _write_photos(tmp_path)
        _use_photo(page, first, SLOW)
        _wait(page, "window.__facemesh.drawn > 0", SLOW)
        if not page.evaluate("document.fullscreenEnabled"):
            pytest.skip("this browser does not allow full screen")
        page.click("#full")
        try:
            _wait(page, "window.__facemesh.fullscreen === true", 20)
        except AssertionError:
            pytest.skip("headless Chrome refused the full screen request")
        _wait(page, "window.__facemesh.drawn > 0", SLOW)
        assert page.evaluate("window.__facemesh.label") == "", page.evaluate("window.__facemesh.label")
        assert page.is_visible("#badge") and page.evaluate("window.__facemesh.photo") == "ready"
        page.evaluate("document.exitFullscreen()")
        _wait(page, "window.__facemesh.fullscreen === false", 20)
        assert not errors, errors
    finally:
        browser.close()


def test_everything_the_dashboard_sends_is_ours_and_small(stack, tmp_path):  # noqa: F811
    p, exe, clip, srv = stack
    browser, ctx, page, (first, second), (rec1, rec2), requests, errors = _two_in_the_gallery(stack, tmp_path)
    try:
        other = next(i for i in _items(page) if i["pressed"] != "true")
        page.click(f"#gallery .thumb[data-id='{other['id']}']")
        _wait(page, f"window.__facemesh.avatar === '{other['id']}'", SLOW)
        page.click("#stop")
        _wait(page, "window.__facemesh.session === 'stopped'", SLOW)
        _assert_requests_are_ours(requests, srv)
        for _method, _url, post in requests:
            for path in (first, second):
                assert Path(path).read_bytes()[:64].hex() not in (post or ""), "a photo's bytes were sent"
        assert not errors, errors
    finally:
        browser.close()


def test_clean_the_edges_turns_itself_off_when_one_pass_freezes_the_page(stack, tmp_path):  # noqa: F811
    """S13c on a slow renderer: the segmenter blocks the page for its whole pass (about 12 s each on this software renderer, measured
    2026-10-20). The option must stop itself, say so, and leave the photo, the consent and the "Virtual face" label as they were.
    On a graphics card fast enough to keep it, the test instead checks that it is still on."""
    browser, ctx, page, _unused, requests, errors = _ready_page(stack, tmp_path)
    try:
        first, _second = _write_photos(tmp_path)
        _use_photo(page, first, SLOW)
        _wait(page, "window.__facemesh.drawn > 0", SLOW)
        _wait(page, "window.__facemesh.seam === 'too slow' || window.__facemesh.seamAnswers >= 3", SLOW * 3)
        s = page.evaluate("window.__facemesh")
        if s["seam"] != "too slow":
            assert s["seamMs"] < 1000 and page.get_attribute("#seamBtn", "aria-pressed") == "true", s
            return
        assert s["seamSlowMs"] > 250, s
        assert page.get_attribute("#seamBtn", "aria-pressed") == "false"
        assert "Clean the edges was turned off" in page.inner_text("#status")
        frames = s["frames"]                                            # the page keeps drawing the photo (drawn = triangles, not frames)
        _wait(page, f"window.__facemesh.frames > {frames} + 3 && window.__facemesh.drawn > 0 && window.__facemesh.seamAmount === 0", SLOW)
        assert page.is_visible("#badge") and "Virtual face" in page.inner_text("#badge"), "the label stays on screen"
        assert page.evaluate("window.__facemesh.label") == "", "the label guard is not disturbed"
        assert page.evaluate("window.__facemesh.record") is not None, "consent is untouched"
        page.click("#seamBtn")                                          # the user may ask for it again
        _wait(page, "window.__facemesh.seam === 'loading' || window.__facemesh.seam === 'on'", SLOW)
        _assert_requests_are_ours(requests, stack[3])
        assert not errors, errors
    finally:
        browser.close()
