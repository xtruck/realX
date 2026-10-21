"""F2 / B4-09: `cohost grant` never loses the revoke code to an encoding error, and bad usage is a clean error."""

from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path

SRC = str(Path(__file__).resolve().parents[1] / "src")


def run(home, *args, enc="cp1252"):
    env = {**os.environ, "REALX_HOME": str(home), "PYTHONPATH": SRC, "PYTHONIOENCODING": f"{enc}:strict"}
    return subprocess.run([sys.executable, "-m", "realx.cli", "cohost", *args], capture_output=True, env=env)


def test_grant_with_an_unencodable_name_still_shows_the_code_and_exits_zero(tmp_path):
    r = run(tmp_path, "grant", "--name", "Zo\u00e9\u2192Dupont", "--friend-agreed")
    out = r.stdout.decode("cp1252")
    assert r.returncode == 0, r.stderr
    m = re.search(r"REVOKE CODE[^:]*: (\S+)", out)
    assert m, out
    code = m.group(1)
    codefiles = list((tmp_path / "cohost").glob("*.revoke-code.txt"))
    assert len(codefiles) == 1 and codefiles[0].read_text().strip() == code
    assert str(codefiles[0].name) in out or "revoke-code" in out


def test_the_revoke_code_works_after_such_a_grant(tmp_path):
    r = run(tmp_path, "grant", "--name", "Zo\u00e9\u2192Dupont", "--friend-agreed")
    code = re.search(r"REVOKE CODE[^:]*: (\S+)", r.stdout.decode("cp1252")).group(1)
    rid = next((tmp_path / "cohost").glob("*.revoke-code.txt")).name.split(".")[0]
    assert run(tmp_path, "revoke", "--id", rid, "--code", code).returncode == 0


def test_grant_without_a_name_is_a_usage_error_not_a_traceback(tmp_path):
    r = run(tmp_path, "grant", "--friend-agreed")
    err = r.stderr.decode()
    assert r.returncode == 2 and "Traceback" not in err and "--name" in err


def test_other_actions_missing_their_arguments_are_usage_errors(tmp_path):
    for args, needle in ((("check",), "--file"), (("revoke", "--id", "x"), "--code"), (("revoke",), "--id")):
        r = run(tmp_path, *args)
        err = r.stderr.decode()
        assert r.returncode == 2 and "Traceback" not in err and needle in err, (args, err)
