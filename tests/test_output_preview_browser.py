"""The preview page in a real browser: the 'virtual' label is on screen over the picture, in the modes where the picture is realX's."""

from __future__ import annotations

import time

import pytest
from conftest import find_chromium, token_cookie


@pytest.fixture
def served():
    pytest.importorskip("playwright.sync_api")
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

    srv = Server(Engine(source="demo:static", mode="avatar"), port=0)
    srv.start()
    try:
        yield srv, exe
    finally:
        srv.stop()


def _page(srv, exe, playwright):
    browser = playwright.chromium.launch(executable_path=exe, args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 960, "height": 540})
    ctx.add_cookies(token_cookie(srv.port))
    page = ctx.new_page()
    errors: list[str] = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    return browser, page, errors


def _wait(page, expr: str, timeout: float = 30.0) -> None:
    """Poll a page expression. `wait_for_function` would run it with eval, which this page's CSP refuses (as it should)."""
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        if page.evaluate(f"() => !!({expr})"):
            return
        time.sleep(0.1)
    raise AssertionError(f"timed out waiting for: {expr}")


def _state(page):
    return page.evaluate(
        """() => { const b = document.getElementById('badge'); const r = b.getBoundingClientRect(); const o = document.getElementById('out');
        const cs = getComputedStyle(b);
        return { text: b.innerText, hidden: b.hidden, display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
                 top: r.top, bottom: r.bottom, left: r.left, right: r.right, vh: innerHeight, vw: innerWidth,
                 imgShown: !o.hidden && o.naturalWidth > 0 }; }"""
    )


def test_label_is_visible_over_the_picture_in_avatar_mode(served):
    from playwright.sync_api import sync_playwright

    srv, exe = served
    with sync_playwright() as p:
        browser, page, errors = _page(srv, exe, p)
        page.goto(f"http://127.0.0.1:{srv.port}/preview")
        _wait(page, "!document.getElementById('out').hidden && document.getElementById('out').naturalWidth > 0", 30.0)
        time.sleep(2.5)  # a few polls of /api/stats have run
        st = _state(page)
        shot = page.screenshot()  # what is really on screen, not what the DOM claims
        browser.close()
    assert not errors
    assert st["imgShown"] and st["hidden"] is False
    assert st["display"] != "none" and st["visibility"] == "visible" and float(st["opacity"]) == 1.0
    assert "DIGITAL HOST" in st["text"] and "shown with permission" in st["text"]
    assert 0 <= st["left"] and st["right"] <= st["vw"] and st["bottom"] <= st["vh"] + 1 and st["bottom"] - st["top"] > 12
    # the pixels under the label are the label's dark bar with light text, i.e. nothing covers it and it is not transparent
    import io

    import numpy as np
    from PIL import Image

    px = np.asarray(Image.open(io.BytesIO(shot)).convert("RGB")).astype(int)
    box = px[int(st["top"]) + 1 : int(st["bottom"]) - 1, int(st["left"]) : int(st["right"])]
    dark = (np.abs(box - np.array([14, 20, 27])) <= 6).all(-1).mean()
    light = (box.min(-1) >= 215).mean()
    assert dark > 0.6, f"the label bar is not on screen (dark share {dark:.2f})"
    assert light > 0.01, f"the label text is not on screen (light share {light:.3f})"


def test_label_is_hidden_only_for_the_plain_camera_and_comes_back(served):
    from playwright.sync_api import sync_playwright

    srv, exe = served
    with sync_playwright() as p:
        browser, page, errors = _page(srv, exe, p)
        page.goto(f"http://127.0.0.1:{srv.port}/preview")
        _wait(page, "document.getElementById('badge') && !document.getElementById('badge').hidden", 30.0)
        srv.engine.update({"mode": "original"})
        _wait(page, "document.getElementById('badge').hidden", 15.0)
        srv.engine.update({"mode": "avatar"})
        _wait(page, "!document.getElementById('badge').hidden", 15.0)
        browser.close()
    assert not errors


def test_label_shows_when_the_server_cannot_be_reached(served):
    from playwright.sync_api import sync_playwright

    srv, exe = served
    with sync_playwright() as p:
        browser, page, errors = _page(srv, exe, p)
        page.goto(f"http://127.0.0.1:{srv.port}/preview")
        _wait(page, "!document.getElementById('out').hidden", 30.0)
        srv.engine.update({"mode": "original"})
        _wait(page, "document.getElementById('badge').hidden", 15.0)
        page.context.set_offline(True)  # the stats poll now fails: the label must come back
        _wait(page, "!document.getElementById('badge').hidden", 15.0)
        browser.close()
