"""Shared test setup.

The server now requires an access token on every route. Most tests are about something else, so they
run against a server whose token is the fixed `TEST_TOKEN` and every plain `http.client` request they
make carries it as `Authorization: Bearer`. Tests that are *about* authentication opt out with
`@pytest.mark.raw_http` and send exactly the headers they mean to.
"""

from __future__ import annotations

import http.client
import os

import pytest

TEST_TOKEN = "test-token-0123456789abcdef"

_original_putrequest = http.client.HTTPConnection.putrequest
_state = {"auto": True}


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
