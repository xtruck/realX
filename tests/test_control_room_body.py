"""Control room: the "Full body" mode (camera tracked inside the avatar page, relayed to OBS).

The server side of mode "body" (config value, stats entry, relay) belongs to the server tests. Here
only the page is under test, so /api/config and /api/stats answers for that mode are stubbed and the
tracking iframe is replaced by a tiny page that records the messages the control room sends it.
"""

import glob
import json
import os
import time

import pytest
from conftest import token_cookie

STUB_PAGE = (
    "<!doctype html><title>stub</title><script>window.__msgs=[];"
    "addEventListener('message',e=>window.__msgs.push({data:e.data,origin:e.origin}));</script>"
)


def _chromium():
    exe = os.environ.get("REALX_CHROMIUM")
    if exe and os.path.exists(exe):
        return exe
    hits = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    return hits[-1] if hits else None


@pytest.fixture(scope="module")
def room():
    sync_api = pytest.importorskip("playwright.sync_api")
    pytest.importorskip("skimage")
    exe = _chromium()
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
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
        )
        yield srv, browser
        browser.close()
    srv.stop()


class Room:
    """One control-room page with the body-mode answers stubbed."""

    def __init__(self, srv, browser, body_stats=None):
        self.posts = []
        self.mode = "avatar"
        self.body_stats = body_stats
        self.errors = []
        self.ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        self.ctx.add_cookies(token_cookie(srv.port))
        self.page = self.ctx.new_page()
        self.page.on("pageerror", lambda e: self.errors.append(str(e)))
        self.page.route("**/api/config", self._config)
        self.page.route("**/api/stats", self._stats)
        self.page.route("**/avatar?*", lambda r: r.fulfill(status=200, content_type="text/html", body=STUB_PAGE))
        self.page.goto(f"http://127.0.0.1:{srv.port}/")
        self.page.wait_for_selector("#modeSeg")

    def _config(self, route):
        if route.request.method == "POST":
            changes = json.loads(route.request.post_data or "{}")
            self.posts.append(changes)
            if "mode" in changes:
                self.mode = changes["mode"]
            route.fulfill(status=200, content_type="application/json", body=json.dumps({"mode": self.mode}))
        else:
            route.continue_()

    def _stats(self, route):
        try:
            stats = route.fetch().json()
        except Exception:  # the page is closing while a poll is in flight
            return
        stats["config"]["mode"] = self.mode
        if self.body_stats is not None:
            stats["body"] = self.body_stats
        route.fulfill(status=200, content_type="application/json", body=json.dumps(stats))

    def choose_with_keyboard(self):
        self.page.focus('#modeSeg input[value="character"]')
        self.page.keyboard.press("ArrowRight")  # the Full body option sits right after Character

    def wait(self, js, timeout=8.0, where=None):
        """Poll with plain evaluate calls: the page's CSP forbids the eval that wait_for_function uses."""
        target = where or self.page
        deadline = time.time() + timeout
        while time.time() < deadline:
            if target.evaluate(js):
                return
            time.sleep(0.1)
        raise AssertionError(f"timed out waiting for: {js}")

    def tracker_frame(self, timeout=8.0):
        """The tracking iframe, once it has navigated to /avatar (its `src` attribute is set a moment earlier)."""
        deadline = time.time() + timeout
        while time.time() < deadline:
            for f in self.page.frames:
                if f.url.rstrip("?").split("?")[0].endswith("/avatar"):
                    return f
            time.sleep(0.05)
        raise AssertionError("the tracking frame never navigated to /avatar: " + repr([f.url for f in self.page.frames]))

    def close(self):
        self.page.unroute_all(behavior="ignoreErrors")
        self.page.close()
        self.ctx.close()


@pytest.fixture
def make_room(room):
    srv, browser = room
    opened = []

    def make(**kw):
        r = Room(srv, browser, **kw)
        opened.append(r)
        return r

    yield make
    for r in opened:
        r.close()


def test_full_body_is_a_keyboard_selectable_option_and_posts_the_mode(make_room):
    r = make_room()
    assert r.page.locator('#modeSeg input[type="radio"][value="body"]').count() == 1
    assert "Full body" in r.page.inner_text("#modeSeg")
    r.choose_with_keyboard()
    assert r.page.is_checked('#modeSeg input[value="body"]')
    r.wait("document.querySelector('#tracker').getAttribute('src')")
    assert {"mode": "body"} in r.posts
    assert not r.errors


def test_tracking_page_is_embedded_with_camera_permission_and_the_picture_stream_is_dropped(make_room):
    r = make_room()
    r.choose_with_keyboard()
    r.wait("document.querySelector('#tracker').getAttribute('src')")
    src = r.page.get_attribute("#tracker", "src")
    assert src.startswith("/avatar?")
    for needle in ("track=1", "publish=1", "preview=1", "legs=auto"):
        assert needle in src, src
    assert "camera" in (r.page.get_attribute("#tracker", "allow") or "")
    assert r.page.is_visible("#tracker")
    assert r.page.get_attribute("#view", "src") is None  # the MJPEG connection is released
    assert not r.page.is_visible("#character")


def test_panel_explains_privacy_and_obs_url_is_the_plain_avatar_page(make_room):
    r = make_room()
    assert not r.page.is_visible("#bodyPanel")
    r.choose_with_keyboard()
    r.page.wait_for_selector("#bodyPanel", state="visible")
    text = r.page.inner_text("#bodyPanel")
    assert "Your camera stays in this page. The character receives only joint angles, never pictures." in text
    assert r.page.input_value("#obsUrl").endswith("/avatar")
    assert "?" not in r.page.input_value("#obsUrl")
    obs = r.page.inner_text("#obs")
    assert "control room tab" in obs and "open" in obs


def test_legs_and_recenter_reach_the_tracking_page_same_origin(make_room):
    r = make_room()
    r.choose_with_keyboard()
    r.wait("document.querySelector('#tracker').getAttribute('src')")
    frame = r.tracker_frame()
    r.wait("window.__msgs !== undefined", where=frame)
    r.page.select_option("#legsMode", "off")
    r.page.click("#recenter")
    r.wait("window.__msgs.length >= 2", where=frame)
    msgs = frame.evaluate("window.__msgs")
    assert {"type": "realx-legs", "mode": "off"} in [m["data"] for m in msgs]
    assert {"type": "realx-recenter"} in [m["data"] for m in msgs]
    assert all(m["origin"] == f"http://127.0.0.1:{r.page.url.split(':')[2].split('/')[0]}" for m in msgs)
    assert [o for o in r.page.eval_on_selector_all("#legsMode option", "o => o.map(x => x.value)")] == ["auto", "off"]


def test_status_line_follows_the_stats_and_tolerates_a_server_without_them(make_room):
    r = make_room()  # no body entry in the stats at all
    r.choose_with_keyboard()
    r.wait("document.querySelector('#bodyStatus').textContent.trim().length > 0")
    assert "Waiting" in r.page.inner_text("#bodyStatus")
    assert not r.errors
    live = make_room(body_stats={"publishing": True, "viewers": 2})
    live.choose_with_keyboard()
    live.wait("document.querySelector('#bodyStatus').textContent.includes('Viewers connected: 2')")


def test_leaving_the_mode_releases_the_camera_page(make_room):
    r = make_room()
    r.choose_with_keyboard()
    r.wait("document.querySelector('#tracker').getAttribute('src')")
    r.page.check('#modeSeg input[value="avatar"]')
    r.wait("!document.querySelector('#tracker').getAttribute('src')")
    assert not r.page.is_visible("#tracker") and not r.page.is_visible("#bodyPanel")
    # dropping the attribute alone would leave the old page, and its camera, running: it must be unloaded
    deadline = time.time() + 5
    while time.time() < deadline and any("/avatar" in f.url for f in r.page.frames):
        time.sleep(0.1)
    assert not any("/avatar" in f.url for f in r.page.frames)
    assert r.mode == "avatar"
    r.wait("document.querySelector('#view').getAttribute('src')")  # the picture stream is back
    time.sleep(0.2)
    assert not r.errors
