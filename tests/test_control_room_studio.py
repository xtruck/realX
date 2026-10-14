"""Live Studio controls in the control room: devices, quality, status, microphone opt-in, Windows scripts.

The tracking page is replaced by a tiny stub that can send the contract's messages to its parent and
records what the control room sends it. Nothing here opens a real camera or microphone, so none of it
proves behaviour on real hardware (see docs/REAL-WEBCAM-VALIDATION.md for that procedure).
"""

import glob
import http.client
import json
import os
import re
import shutil
import subprocess
import time
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import pytest
from conftest import token_cookie

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts" / "windows"

STUB_PAGE = (
    "<!doctype html><title>stub tracker</title><script>window.__msgs=[];"
    "addEventListener('message',e=>window.__msgs.push({data:e.data,origin:e.origin}));"
    "window.__send=(m)=>parent.postMessage(m,location.origin);</script>"
)

DEVICES = {
    "type": "realx-devices",
    "cameras": [{"id": "cam-front", "label": "Front camera"}, {"id": "a&b=c d/é", "label": "<img src=x onerror=alert(1)>"}],
    "mics": [{"id": "mic-1", "label": "Desk microphone"}, {"id": "mic-2", "label": "Headset"}],
}


def stats_message(**over):
    msg = {
        "type": "realx-stats", "fps": 24.6, "skipped": 3, "latencyMs": 41.2,
        "hz": {"pose": 12, "face": 9, "hands": 8}, "ms": {"pose": 28.4, "face": 30.1, "hands": 33.0},
        "delegates": {"pose": "GPU", "face": "GPU", "hands": "CPU"},
        "diag": {"face": True, "pose": True, "hands": 1, "handHint": "1 hand(s) tracked", "wrists": [0.9, 0.4]},
        "mic": None, "avSyncMs": None, "state": "running", "detail": "",
    }
    msg.update(over)
    return msg


def _chromium():
    exe = os.environ.get("REALX_CHROMIUM")
    if exe and os.path.exists(exe):
        return exe
    hits = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    return hits[-1] if hits else None


@pytest.fixture(scope="module")
def server():
    pytest.importorskip("skimage")
    pytest.importorskip("cv2")
    from realx.models import ensure_model

    try:
        ensure_model("yunet")
    except Exception as exc:
        pytest.skip(f"yunet model unavailable: {exc}")
    from realx.server import Engine, Server

    srv = Server(Engine(source="demo:static"), port=0)
    srv.start()
    yield srv
    srv.stop()


@pytest.fixture(scope="module")
def browser(server):
    sync_api = pytest.importorskip("playwright.sync_api")
    exe = _chromium()
    if not exe:
        pytest.skip("no Chromium found (set REALX_CHROMIUM)")
    with sync_api.sync_playwright() as p:
        b = p.chromium.launch(
            executable_path=exe,
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
        )
        yield b
        b.close()


class Studio:
    """One control-room page in Full body mode with the tracker page stubbed."""

    def __init__(self, srv, browser, body_stats=None):
        self.srv, self.mode, self.body_stats = srv, "avatar", body_stats
        self.avatar_urls, self.errors = [], []
        self.ctx = browser.new_context(viewport={"width": 1280, "height": 1000})
        self.ctx.add_cookies(token_cookie(srv.port))
        self.page = self.ctx.new_page()
        self.page.on("pageerror", lambda e: self.errors.append(str(e)))
        self.page.route("**/api/config", self._config)
        self.page.route("**/api/stats", self._stats)
        self.page.route("**/avatar?*", self._avatar)
        self.open("/")

    def open(self, path="/"):
        self.page.goto(f"http://127.0.0.1:{self.srv.port}{path}")
        self.page.wait_for_selector("#modeSeg")

    def _avatar(self, route):
        self.avatar_urls.append(route.request.url)
        route.fulfill(status=200, content_type="text/html", body=STUB_PAGE)

    def _config(self, route):
        if route.request.method == "POST":
            changes = json.loads(route.request.post_data or "{}")
            self.mode = changes.get("mode", self.mode)
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

    def enter_body_mode(self):
        self.page.check('#modeSeg input[value="body"]')
        self.wait("!!document.querySelector('#tracker').getAttribute('src')")
        self.wait("window.frames.length > 0")
        self.frame()  # the stub has loaded

    def frame(self, timeout=8.0):
        deadline = time.time() + timeout
        while time.time() < deadline:
            for f in self.page.frames:
                if "/avatar" in f.url:
                    try:
                        if f.evaluate("typeof window.__send === 'function'"):
                            return f
                    except Exception:
                        pass
            time.sleep(0.1)
        raise AssertionError("the tracker stub never loaded")

    def send(self, message):
        self.frame().evaluate("m => window.__send(m)", message)

    def src(self):
        return self.page.get_attribute("#tracker", "src")

    def query(self):
        return parse_qs(urlparse(self.src()).query, keep_blank_values=True)

    def wait(self, js, timeout=8.0):
        """Poll with plain evaluate calls: the page's CSP forbids the eval that wait_for_function uses."""
        deadline = time.time() + timeout
        while time.time() < deadline:
            try:
                if self.page.evaluate(js):
                    return
            except Exception as exc:  # the page is reloading (the microphone switch does that on purpose)
                if "context was destroyed" not in str(exc) and "navigation" not in str(exc).lower():
                    raise
            time.sleep(0.1)
        raise AssertionError(f"timed out waiting for: {js}")

    def text(self, sel):
        return self.page.inner_text(sel)

    def close(self):
        self.page.unroute_all(behavior="ignoreErrors")
        self.ctx.close()


@pytest.fixture
def make_studio(server, browser):
    opened = []

    def make(**kw):
        s = Studio(server, browser, **kw)
        opened.append(s)
        return s

    yield make
    for s in opened:
        s.close()


# --- the panel ------------------------------------------------------------------------------------------
def test_studio_controls_exist_only_in_full_body_mode_and_state_their_costs(make_studio):
    s = make_studio()
    for sel in ("#camSelect", "#micSelect", "#qualitySelect", "#outfitSelect", "#studioStatus"):
        assert not s.page.is_visible(sel), sel
    s.enter_body_mode()
    for sel in ("#camSelect", "#micSelect", "#qualitySelect", "#outfitSelect", "#studioStatus"):
        assert s.page.is_visible(sel), sel
    assert s.page.eval_on_selector_all("#qualitySelect option", "o => o.map(x => x.value)") == ["low", "balanced", "high"]
    assert s.page.input_value("#qualitySelect") == "balanced"
    assert s.page.input_value("#micSelect") == "" and "Off" in s.page.inner_text("#micSelect")
    hint = s.text("#qualityHint").lower()
    assert "slower" in hint and "sharper" in hint, hint
    assert "restart" in s.text("#studioPanelHint").lower(), "changing a setting restarts the camera, and the page says so"
    assert not s.errors


def test_virtual_character_line_is_always_shown_and_cannot_be_dismissed(make_studio):
    s = make_studio()
    s.enter_body_mode()
    line = s.text("#virtualLine")
    assert "Virtual character: viewers are told this is an avatar" in line
    assert s.page.locator("#virtualLine button, #virtualLine a, #virtualLine input").count() == 0
    s.send(stats_message())
    s.page.wait_for_timeout(300)
    assert s.page.is_visible("#virtualLine")


# --- before any data ------------------------------------------------------------------------------------
def test_status_says_no_measurement_yet_instead_of_showing_zeros(make_studio):
    s = make_studio()
    s.enter_body_mode()
    panel = s.text("#studioStatus")
    assert panel.count("No measurement yet") >= 4, panel
    for cell in ("#stFps", "#stLatency", "#stSkipped", "#stRates", "#stBackend", "#stSees", "#stMic", "#stSync"):
        assert "No measurement yet" in s.text(cell), cell
    assert not re.search(r"\b0 fps\b|\b0 ms\b", panel)


# --- devices --------------------------------------------------------------------------------------------
def test_devices_fill_the_selects_as_plain_text_and_choices_reach_the_tracker_url_encoded(make_studio):
    s = make_studio()
    s.enter_body_mode()
    s.send(DEVICES)
    s.wait("document.querySelectorAll('#camSelect option').length === 3")
    labels = s.page.eval_on_selector_all("#camSelect option", "o => o.map(x => x.textContent)")
    assert labels[0].startswith("Default") and "Front camera" in labels
    assert "<img src=x onerror=alert(1)>" in labels, "labels are shown as text, never as markup"
    assert s.page.locator("#camSelect img, #studioStatus img, #bodyPanel img").count() == 0
    s.page.select_option("#camSelect", index=2)        # the id with &, =, a space and a non-ASCII letter
    s.wait("document.querySelector('#tracker').getAttribute('src').includes('cam=')")
    q = s.query()
    assert q["cam"] == ["a&b=c d/é"], q
    assert q["track"] == ["1"] and q["publish"] == ["1"] and q["preview"] == ["1"] and q["quality"] == ["balanced"]
    assert "mic" not in q
    assert "&b=c" not in s.src().replace("%26b%3Dc", ""), "the raw id must not leak into the query structure"
    assert not s.errors


def test_quality_and_outfit_changes_reload_the_tracker_and_say_so(make_studio):
    s = make_studio()
    s.enter_body_mode()
    before = len(s.avatar_urls)
    s.page.select_option("#qualitySelect", "high")
    s.wait(f"document.querySelector('#tracker').getAttribute('src').includes('quality=high')")
    s.wait("document.querySelector('#studioPanelHint').textContent.toLowerCase().includes('restart')")
    deadline = time.time() + 5
    while time.time() < deadline and len(s.avatar_urls) <= before:
        time.sleep(0.1)
    assert len(s.avatar_urls) > before and "quality=high" in s.avatar_urls[-1], "the tracker page was loaded again"
    s.page.select_option("#outfitSelect", "ocean")
    s.wait("document.querySelector('#tracker').getAttribute('src').includes('outfit=ocean')")
    assert s.query()["outfit"] == ["ocean"]
    assert not s.errors


def test_choices_are_remembered_by_id_only_and_restored_after_a_reload(make_studio):
    s = make_studio()
    s.enter_body_mode()
    s.send(DEVICES)
    s.wait("document.querySelectorAll('#camSelect option').length === 3")
    s.page.select_option("#camSelect", "cam-front")
    s.page.select_option("#qualitySelect", "low")
    saved = s.page.evaluate("localStorage.getItem('realx.studio')")
    assert saved and "Front camera" in saved, "the chosen device's name is kept"
    assert "Headset" not in saved and "Desk microphone" not in saved and "onerror" not in saved, "no other device names"
    s.page.reload()
    s.page.wait_for_selector("#modeSeg")
    s.wait("!!document.querySelector('#tracker').getAttribute('src')")
    q = s.query()
    assert q["cam"] == ["cam-front"] and q["quality"] == ["low"], q
    assert not s.errors


# --- microphone: off by default, permission only while a microphone is chosen --------------------------
def test_microphone_is_off_by_default_and_needs_an_explicit_opt_in_reload(make_studio):
    s = make_studio()
    s.enter_body_mode()
    assert "microphone" not in (s.page.get_attribute("#tracker", "allow") or "")
    assert "mic" not in s.query()
    s.send(DEVICES)
    s.wait("document.querySelectorAll('#micSelect option').length === 3")
    s.page.select_option("#micSelect", "mic-1")
    s.wait("location.search === '?mic=1'")            # the page reloads with microphone permission switched on
    s.wait("!!document.querySelector('#tracker').getAttribute('src')")
    assert s.query()["mic"] == ["mic-1"]
    assert "microphone" in s.page.get_attribute("#tracker", "allow")
    s.send(DEVICES)
    s.wait("document.querySelectorAll('#micSelect option').length === 3")
    assert s.page.input_value("#micSelect") == "mic-1"
    s.page.select_option("#micSelect", "")            # Off again: the permission goes away with the reload
    s.wait("location.search === ''")
    s.wait("!!document.querySelector('#tracker').getAttribute('src')")
    assert "mic" not in s.query()
    assert "microphone" not in s.page.get_attribute("#tracker", "allow")
    assert not s.errors


# --- hostile or broken messages --------------------------------------------------------------------------
def _assert_untouched(s):
    s.page.wait_for_timeout(300)
    assert s.text("#stFps").count("No measurement yet") == 1
    assert s.page.eval_on_selector_all("#camSelect option", "o => o.length") == 1
    assert not s.errors


def test_messages_from_the_wrong_origin_or_window_are_ignored(make_studio):
    s = make_studio()
    s.enter_body_mode()
    # a page that is not the tracker iframe (here: the control room itself) posting a perfectly valid message
    s.page.evaluate("m => window.postMessage(m, location.origin)", stats_message())
    s.page.evaluate("m => window.postMessage(m, location.origin)", DEVICES)
    # a message that claims to come from the tracker window but from another origin
    for m in (stats_message(), DEVICES):
        s.page.evaluate(
            """m => window.dispatchEvent(new MessageEvent('message', {data: m, origin: 'http://evil.example',
                   source: document.getElementById('tracker').contentWindow}))""", m)
    # a same-origin iframe that is not the tracker
    s.page.evaluate(
        """m => { const f = document.createElement('iframe'); f.srcdoc = '';
                 f.onload = () => f.contentWindow.parent.postMessage(m, location.origin);
                 document.body.appendChild(f); }""", stats_message())
    _assert_untouched(s)


@pytest.mark.parametrize("broken", [
    stats_message(fps=float("nan")),
    stats_message(fps=-5),
    stats_message(fps="24"),
    stats_message(fps=1e12),
    stats_message(latencyMs=float("inf")),
    stats_message(skipped=1.5),
    stats_message(hz={"pose": 1, "face": 2}),
    stats_message(hz={"pose": 1, "face": 2, "hands": "x"}),
    stats_message(ms=None),
    stats_message(delegates={"pose": "GPU" * 100, "face": "GPU", "hands": "GPU"}),
    stats_message(diag={"face": "yes", "pose": True, "hands": 1, "handHint": "x", "wrists": [0.1, 0.2]}),
    stats_message(diag={"face": True, "pose": True, "hands": 1, "handHint": "x" * 5000, "wrists": [0.1, 0.2]}),
    stats_message(diag={"face": True, "pose": True, "hands": 1, "handHint": "x", "wrists": [0.1]}),
    stats_message(mic={"active": True, "speaking": "no", "levelDb": -20, "latencyMs": 10}),
    stats_message(mic={"active": True, "speaking": False, "levelDb": float("nan"), "latencyMs": 10}),
    stats_message(avSyncMs=float("nan")),
    stats_message(avSyncMs=1e9),
    stats_message(state="exploding"),
    stats_message(detail="d" * 5000),
    {"type": "realx-stats"},
    {"type": "realx-stats", "fps": {"valueOf": 1}},
    None, 5, "realx-stats", [],
    {"type": "realx-devices", "cameras": "x", "mics": []},
    {"type": "realx-devices", "cameras": [{"id": 5, "label": "x"}], "mics": []},
    {"type": "realx-devices", "cameras": [{"id": "x" * 500, "label": "x"}], "mics": []},
    {"type": "realx-devices", "cameras": [{"id": "x", "label": "y" * 5000}], "mics": []},
    {"type": "realx-devices", "cameras": [{"id": "c%d" % i, "label": "c"} for i in range(200)], "mics": []},
    {"type": "realx-devices", "cameras": [{"id": "ok", "label": "ok"}, "bad"], "mics": []},
    {"type": "something-else", "cameras": [], "mics": []},
])
def test_malformed_messages_from_the_real_tracker_window_change_nothing(make_studio, broken):
    s = make_studio()
    s.enter_body_mode()
    s.send(broken)
    _assert_untouched(s)


# --- the status panel ------------------------------------------------------------------------------------
def test_stats_render_as_plain_language_and_microphone_and_sync_are_explained(make_studio):
    s = make_studio(body_stats={"publishing": True, "viewers": 2})
    s.enter_body_mode()
    s.send(stats_message())
    s.wait("!document.querySelector('#stFps').textContent.includes('No measurement yet')")
    assert "24.6" in s.text("#stFps") or "25" in s.text("#stFps")
    assert "41" in s.text("#stLatency") and "ms" in s.text("#stLatency")
    assert "3" in s.text("#stSkipped")
    rates = s.text("#stRates")
    assert "pose" in rates and "12" in rates and "28" in rates
    assert "GPU" in s.text("#stBackend") and "CPU" in s.text("#stBackend")
    assert "1 hand(s) tracked" in s.text("#stSees")
    assert "off" in s.text("#stMic").lower() and "no microphone" in s.text("#stSync").lower()
    s.wait("document.querySelector('#stViewers').textContent.includes('2')")
    assert "yes" in s.text("#stPublishing").lower()
    s.send(stats_message(mic={"active": True, "speaking": True, "levelDb": -20, "latencyMs": 35}, avSyncMs=120))
    s.wait("document.querySelector('#stSync').textContent.includes('ahead')")
    assert "120 ms" in s.text("#stSync") and "audio ahead" in s.text("#stSync")
    assert "speaking" in s.text("#stMic").lower()
    assert float(s.page.get_attribute("#micMeter", "value")) == pytest.approx(-20)
    s.send(stats_message(mic={"active": True, "speaking": False, "levelDb": -50, "latencyMs": 35}, avSyncMs=-80))
    s.wait("document.querySelector('#stSync').textContent.includes('behind')")
    assert "listening" in s.text("#stMic").lower()
    s.send(stats_message(mic={"active": True, "speaking": False, "levelDb": -50, "latencyMs": 35}, avSyncMs=10))
    s.wait("document.querySelector('#stSync').textContent.toLowerCase().includes('in sync')")
    s.send(stats_message(state="error", detail="Camera permission was refused."))
    s.wait("document.querySelector('#studioStatus').textContent.includes('Camera permission was refused.')")
    assert not s.errors


def test_measurements_go_stale_instead_of_staying_on_screen(make_studio):
    s = make_studio()
    s.enter_body_mode()
    s.send(stats_message())
    s.wait("!document.querySelector('#stFps').textContent.includes('No measurement yet')")
    s.wait("document.querySelector('#stFps').textContent.includes('No recent measurement')", timeout=9.0)


# --- the server side of the microphone opt-in -------------------------------------------------------------
def _headers(srv, path):
    c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
    c.request("GET", path, headers={"Host": f"127.0.0.1:{srv.port}"})
    r = c.getresponse()
    r.read()
    h = {k.lower(): v for k, v in r.getheaders()}
    c.close()
    return r.status, h


def test_microphone_permission_is_only_granted_to_pages_that_ask_for_it(server):
    default = "camera=(self), microphone=(), geolocation=()"
    for path in ("/", "/avatar", "/avatar?track=1", "/?mic=", "/avatar?mic=", "/?other=1"):
        status, h = _headers(server, path)
        assert status == 200 and h["permissions-policy"] == default, path
    for path in ("/?mic=1", "/avatar?mic=mic-1&track=1", "/avatar?track=1&mic=a%26b"):
        status, h = _headers(server, path)
        assert status == 200 and h["permissions-policy"] == "camera=(self), microphone=(self), geolocation=()", path
        assert "'unsafe-eval'" not in h["content-security-policy"] and "unsafe-inline" not in h["content-security-policy"].split("script-src")[1].split(";")[0]
    status, h = _headers(server, "/app.js")
    assert "permissions-policy" not in h


# --- Windows scripts and docs --------------------------------------------------------------------------------
SCRIPT_NAMES = ("install.ps1", "test.ps1", "run.ps1")
powershell = shutil.which("powershell") or shutil.which("pwsh")


def test_scripts_exist_and_follow_the_safety_rules():
    for name in SCRIPT_NAMES:
        text = (SCRIPTS / name).read_text(encoding="utf-8")
        assert "Set-StrictMode -Version" in text, name
        assert "$ErrorActionPreference = 'Stop'" in text or '$ErrorActionPreference = "Stop"' in text, name
        assert "Set-ExecutionPolicy" not in text and "-Scope AllUsers" not in text and "RunAs" not in text, name
        assert "Invoke-Expression" not in text and "iex " not in text.lower().replace("index", ""), name
        assert "DryRun" in text, f"{name} needs a dry-run switch"
    install = (SCRIPTS / "install.ps1").read_text(encoding="utf-8")
    assert "pip install" in install and "-m pip" in install, "pip must run through the venv's python, never a global one"
    assert ".[dev,onnx,video]" in install and "models fetch" in install
    assert "npm ci" in install and "Get-Command node" in install, "npm only when Node is present"
    run = (SCRIPTS / "run.ps1").read_text(encoding="utf-8")
    for needle in ("$Port", "$Source", "$NoBrowser", "serve"):
        assert needle in run
    assert "REALX_CHROMIUM" in (SCRIPTS / "test.ps1").read_text(encoding="utf-8")


@pytest.mark.skipif(not powershell, reason="PowerShell not available")
@pytest.mark.parametrize("name", SCRIPT_NAMES)
def test_scripts_parse_without_errors(name):
    cmd = (
        "$e = $null; $t = $null; "
        f"[void][System.Management.Automation.Language.Parser]::ParseFile('{SCRIPTS / name}', [ref]$t, [ref]$e); "
        "if ($e -and $e.Count) { $e | ForEach-Object { $_.Message }; exit 1 }"
    )
    run = subprocess.run([powershell, "-NoProfile", "-NonInteractive", "-Command", cmd], capture_output=True, text=True, timeout=60)
    assert run.returncode == 0, run.stdout + run.stderr


@pytest.mark.skipif(not powershell, reason="PowerShell not available")
def test_dry_runs_describe_the_plan_and_change_nothing(tmp_path):
    def run(name, *args):
        return subprocess.run(
            [powershell, "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", str(SCRIPTS / name), "-DryRun", *args],
            capture_output=True, text=True, timeout=120, cwd=tmp_path,
        )

    venv = tmp_path / "studio-venv"
    out = run("install.ps1", "-VenvPath", str(venv))
    assert out.returncode == 0, out.stdout + out.stderr
    text = out.stdout
    assert "dry run" in text.lower() and "pip install" in text and "models fetch" in text
    assert not venv.exists(), "a dry run creates nothing"
    out = run("test.ps1", "-VenvPath", str(venv))
    assert out.returncode == 0, out.stdout + out.stderr
    assert "pytest" in out.stdout and "node --test" in out.stdout
    out = run("run.ps1", "-VenvPath", str(venv), "-Port", "8899", "-Source", "demo:static", "-NoBrowser")
    assert out.returncode == 0, out.stdout + out.stderr
    assert "serve" in out.stdout and "8899" in out.stdout and "demo:static" in out.stdout and "--no-browser" in out.stdout
    bad = run("run.ps1", "-VenvPath", str(venv), "-Port", "99999")
    assert bad.returncode != 0, "an impossible port is refused with a clear message"
    assert "port" in (bad.stdout + bad.stderr).lower()


def test_docs_give_exact_commands_and_measurable_pass_criteria():
    win = (ROOT / "docs/WINDOWS.md").read_text(encoding="utf-8")
    for needle in ("scripts\\windows\\install.ps1", "scripts\\windows\\test.ps1", "scripts\\windows\\run.ps1", "-ExecutionPolicy Bypass"):
        assert needle in win, needle
    obs = (ROOT / "docs/OBS.md").read_text(encoding="utf-8")
    for needle in ("http://127.0.0.1:8765/avatar", "1280", "720", "transparent", "control room tab", "Virtual character"):
        assert needle in obs, needle
    val = (ROOT / "docs/REAL-WEBCAM-VALIDATION.md").read_text(encoding="utf-8")
    assert "not been run" in val.lower() or "has not been run" in val.lower()
    assert re.search(r">= ?90%", val) and "Recenter" in val and "bug report" in val.lower()
    for name in SCRIPT_NAMES:
        assert (SCRIPTS / name).exists()
