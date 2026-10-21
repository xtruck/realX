"""The Path B link is a separate package: the old rig-only remote adapter and its fake-transport tests stay exactly as they were."""

from __future__ import annotations

import hashlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# sha256 of src/realx/remote.py (line endings normalised) at the commit this link was built on
REMOTE_SHA256 = "aaf154466a313527df12553f7524676a399a5d6e398ccbfa09ddee9fcc5ac936"


def test_remote_py_is_untouched():
    data = (ROOT / "src" / "realx" / "remote.py").read_bytes().replace(b"\r\n", b"\n")
    assert hashlib.sha256(data).hexdigest() == REMOTE_SHA256


def test_gpulink_does_not_import_or_patch_remote():
    for path in (ROOT / "src" / "realx" / "gpulink").glob("*.py"):
        text = path.read_text(encoding="utf-8")
        assert "realx.remote" not in text and "from realx import remote" not in text, path.name


def test_old_remote_tests_still_pass():
    done = subprocess.run(
        [sys.executable, "-m", "pytest", "-q", "-x", "-p", "no:cacheprovider", str(ROOT / "tests" / "test_remote.py")],
        capture_output=True, text=True, timeout=300, cwd=ROOT,
    )
    assert done.returncode == 0, done.stdout[-2000:] + done.stderr[-2000:]
