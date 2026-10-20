"""Shared test setup.

The server now requires an access token on every route. Most tests are about something else, so they
run against a server whose token is the fixed `TEST_TOKEN` and every plain `http.client` request they
make carries it as `Authorization: Bearer`. Tests that are *about* authentication opt out with
`@pytest.mark.raw_http` and send exactly the headers they mean to.
"""

from __future__ import annotations

import glob
import http.client
import os
import re

import pytest

TEST_TOKEN = "test-token-0123456789abcdef"

_original_putrequest = http.client.HTTPConnection.putrequest
_state = {"auto": True}


def find_chromium() -> str | None:
    """A Chromium for the browser tests: REALX_CHROMIUM, then a preinstalled Playwright browser folder, then the browsers
    `python -m playwright install chromium` downloads (what CI uses). None when there is none: the tests then skip.
    Only folders are searched, so this never starts Playwright (it is often called inside a running one)."""
    exe = os.environ.get("REALX_CHROMIUM")
    if exe and os.path.exists(exe):
        return exe
    roots = [os.environ.get("PLAYWRIGHT_BROWSERS_PATH"), "/opt/pw-browsers", os.path.expanduser("~/.cache/ms-playwright"),
             os.path.expanduser("~/Library/Caches/ms-playwright"), os.path.join(os.environ.get("LOCALAPPDATA", ""), "ms-playwright")]
    names = ("chrome-linux/chrome", "chrome-linux64/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
             "chrome-win/chrome.exe", "chrome-win64/chrome.exe")
    hits = [h for root in roots if root and os.path.isdir(root) for name in names for h in glob.glob(os.path.join(root, "chromium-*", name))]
    return max(hits, key=lambda h: int(re.search(r"chromium-(\d+)", h).group(1))) if hits else None


def token_cookie(port: int) -> list[dict]:
    """The cookie a browser holds after following the printed link once (for `context.add_cookies`)."""
    return [{"name": "realx_token", "value": TEST_TOKEN, "url": f"http://127.0.0.1:{port}"}]


def _putrequest(self, method, url, *args, **kwargs):
    out = _original_putrequest(self, method, url, *args, **kwargs)
    if _state["auto"]:
        self.putheader("Authorization", f"Bearer {TEST_TOKEN}")
    return out


def pytest_configure(config):
    config.addinivalue_line("markers", "raw_http: do not add the access token to http.client requests")
    http.client.HTTPConnection.putrequest = _putrequest
    os.environ["REALX_TOKEN"] = TEST_TOKEN  # before any module-scoped server fixture is built


def pytest_unconfigure(config):
    http.client.HTTPConnection.putrequest = _original_putrequest


@pytest.fixture(autouse=True)
def _access_token(request):
    _state["auto"] = request.node.get_closest_marker("raw_http") is None
    yield
    _state["auto"] = True
