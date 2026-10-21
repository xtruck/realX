# A6: clean-checkout setup on Windows (2026-10-21)

Environment: Windows 11, Python 3.14.6 (`D:\Python314\python.exe`), fresh clone of branch `audit-setup-clean`
(`git clone --branch audit-setup-clean E:\realx\realX ...\clone`), venv, pip cache and TEMP all on drive E.
Run by following README.md "Quick start" and docs/WINDOWS.md as a new user would, by hand (not via install.ps1).

| # | Step | Result |
|---|---|---|
| 1 | `python --version` | FAIL on this machine as written: `python` on PATH is the Microsoft Store stub (`...\WindowsApps\python.exe`, "Python est introuvable"). `py` launcher points at a missing `C:\Python314`. Worked around with the full path `D:\Python314\python.exe` (3.14.6). Docs already warn about this in WINDOWS.md; README did not (fixed). |
| 2 | `python -m venv venv` | PASS |
| 3 | `pip install -e ".[dev]"` | PASS. `Successfully installed ... realx-0.1.0 ... pytest-9.1.1 scikit-image-0.26.0` |
| 4 | `pip install -e ".[dev,onnx,video,browser]"` | PASS. `Successfully installed ... onnxruntime-1.31.0 playwright-1.64.0 ...` (Chromium not installed, not needed). Venv size 537 MB (docs say ~0.6 GB: OK). |
| 5 | `realx models fetch` | PASS, exit 0, no 401 or network error. All 6 allowed models `downloaded and verified` (yunet, pphumanseg, mp_face, mp_pose, mp_hand, mp_segmenter); 5 blocked models listed as BLOCKED. Total 38.3 MB (docs said 23 MB: fixed). |
| 6 | `realx --help` | PASS, exit 0, lists providers, hardware, stages, selftest, models, voice, voices, cohost, bench, bench-camera, serve. |
| 7 | `realx serve --no-browser --port 8799 --source demo:static` | PASS. Printed `realX control room: http://127.0.0.1:8799/?token=<43 chars>  (Ctrl+C to stop)`. Caveat: when stdout is redirected to a file the link line was NOT visible (Python block-buffers it) until restarted with `PYTHONUNBUFFERED=1`. Documented in README. A harmless OpenCV `[ WARN ... setPreferableTarget Targets are not supported by the new graph engine for now]` goes to stderr. |
| 8 | curl without token | PASS (rejected): `HTTP/1.0 401 Unauthorized`, `WWW-Authenticate: Bearer`, body `{"error": "access token required"}`. `/api/state` without token: 401. Wrong bearer: 401. |
| 9 | curl with token | PASS: `/?token=<tok>` gives `303 See Other`, `Location: /`, `Set-Cookie: realx_token=...; HttpOnly; SameSite=Strict; Path=/`. `Authorization: Bearer <tok>` on `/` gives 200. |
| 10 | stop server | PASS; afterwards curl gets connection refused (`000`). |
| 11 | quick tests | `tests/test_models_manifest*.py` and `tests/test_cli*.py` do not exist. Ran the closest: `pytest -q -x tests/test_model_licenses.py tests/test_server_auth.py` -> `50 passed in 3.32s`. |

## Doc fixes made (README.md, docs/WINDOWS.md only)

- WINDOWS.md: model download size 23 MB -> about 40 MB (six models, 38 MB measured).
- README.md: note that a Store-stub `python` is not Python; note on unbuffered output / `REALX_TOKEN` when redirecting
  `realx serve`, plus a curl check example.

## Not verified

- `scripts\windows\install.ps1`, `test.ps1`, `run.ps1` were not executed (task said follow README/WINDOWS manual steps; default `python`
  would hit the Store stub on this machine without `-Python`).
- Browser behaviour (no Chrome opened), camera, OBS, full test suite, `npm`/webapp, `playwright install chromium`.
- README says `python -m pytest` after install; with `[dev]` only this runs browser tests that skip/need Playwright: not run.
- Not checked: Python 3.10 (only 3.14 available).
