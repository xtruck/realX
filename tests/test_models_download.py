"""ensure_model: mid-download transport errors fall through to the mirror and end as a clean ModelError."""

import hashlib
import http.client
import io

import pytest

from realx import models
from realx.models import ModelError, ModelSpec, ensure_model

BLOB = b"0123456789abcdef"


class _Resp(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


class _Broken:
    """Delivers a few bytes, then fails like a connection cut mid chunked response."""

    def __init__(self, exc):
        self.exc, self.sent = exc, False

    def read(self, n=-1):
        if self.sent:
            raise self.exc
        self.sent = True
        return b"abc"

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


@pytest.fixture
def spec(monkeypatch, tmp_path):
    s = ModelSpec(
        name="demo", filename="demo.onnx", url="https://a.example/demo.onnx",
        sha256=hashlib.sha256(BLOB).hexdigest(), license="MIT", commercial_ok=True,
        purpose="test fixture", mirrors=("https://b.example/demo.onnx",),
    )
    monkeypatch.setitem(models.MANIFEST, "demo", s)
    monkeypatch.setenv("REALX_MODELS_DIR", str(tmp_path))
    monkeypatch.delenv("REALX_OFFLINE", raising=False)
    return s


def test_incomplete_read_on_the_first_host_falls_through_to_the_mirror(spec, monkeypatch, tmp_path):
    seen = []

    def opener(url, timeout=None):
        seen.append(url)
        return _Broken(http.client.IncompleteRead(b"abc", 10)) if "a.example" in url else _Resp(BLOB)

    monkeypatch.setattr(models.urllib.request, "urlopen", opener)
    assert ensure_model("demo").read_bytes() == BLOB
    assert len(seen) == 2
    assert [p.name for p in tmp_path.iterdir()] == ["demo.onnx"]  # no .part left


@pytest.mark.parametrize("exc", [http.client.IncompleteRead(b"abc", 10), http.client.BadStatusLine("x"), ValueError("bad")])
def test_transport_errors_on_every_host_end_as_a_clean_model_error(spec, monkeypatch, tmp_path, exc):
    monkeypatch.setattr(models.urllib.request, "urlopen", lambda url, timeout=None: _Broken(exc))
    with pytest.raises(ModelError, match="demo.onnx"):
        ensure_model("demo")
    assert list(tmp_path.iterdir()) == []
