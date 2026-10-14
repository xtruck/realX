"""Runs the browser-side unit tests (node:test) as part of `python -m pytest`.

They need Node.js and the webapp's npm packages (`cd webapp && npm install`); without them the
test is skipped rather than failing, so a Python-only checkout still passes.
"""

import re
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
WEBAPP = ROOT / "webapp"


def _node():
    exe = shutil.which("node")
    if not exe:
        pytest.skip("Node.js not found")
    if not (WEBAPP / "node_modules" / "three").is_dir():
        pytest.skip("run `npm install` in webapp/ first")
    return exe


def test_webapp_unit_tests_pass():
    node = _node()
    files = sorted(str(p.relative_to(WEBAPP)) for p in (WEBAPP / "test").glob("*.test.mjs"))
    assert files, "no node test files found"
    run = subprocess.run(
        [node, "--test", *files], cwd=WEBAPP, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=300
    )
    tail = (run.stdout + run.stderr)[-3000:]
    assert run.returncode == 0, tail
    counts = {k: int(v) for k, v in re.findall(r"^\S+ (tests|pass|fail) (\d+)\s*$", run.stdout + run.stderr, re.M)}
    assert counts.get("fail") == 0 and counts.get("tests", 0) >= 30, counts


def test_bundle_is_in_step_with_its_sources():
    """The served bundle must contain the tracker; a stale bundle would silently ignore ?track=1."""
    js = (ROOT / "src/realx/web/avatar.bundle.js").read_text(encoding="utf-8", errors="ignore")
    assert "/mp/wasm" in js and "/mp/models/" in js, "rebuild the bundle: cd webapp && npm run build"
    assert "ws/rig" in js
    for needle in ("realx-recenter", "FaceLandmarker", "HandLandmarker", "PoseLandmarker"):
        assert needle in js, needle
