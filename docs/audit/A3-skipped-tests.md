# A3: why are tests skipped?

Run on Windows 11, Python 3.12.15 (shared venv), worktree `audit-skipped-tests`, `python -m pytest -q -rs`:
**671 passed, 91 skipped in 244 s** (the owner's laptop reports 672 / 90; the difference is one skip, see the
onnxruntime row, and one test that depends on that environment).

## Skip groups

| # | Count | Skip reason | Legitimate here? | What activates it |
|---|------:|-------------|------------------|-------------------|
| 1 | 87 | `no Chromium found (set REALX_CHROMIUM)` (10 files: facemesh_browser 12, control_room_studio 11, facemesh_dashboard 11, control_room_body 7, tracking_browser 7, facemesh_body 3, character 2, photoface 1, hair 1, skin 1) | Legitimate as coded, but it silently hides about 80 percent of the UI test coverage on a machine that does have Chrome. Playwright is installed in the venv; only the executable lookup fails (it searches `REALX_CHROMIUM`, `PLAYWRIGHT_BROWSERS_PATH`, `%LOCALAPPDATA%\ms-playwright`; installed Chrome in Program Files is not searched). | `set REALX_CHROMIUM=C:\Program Files\Google\Chrome\Application\chrome.exe`, or `python -m playwright install chromium`. The MediaPipe models must be present (`realx models fetch`). |
| 2 | 2 | `POSIX permissions` (test_cohost.py:81, :209) | Legitimate: they assert chmod 0600/0700 modes, which NTFS does not have. | Only on Linux/macOS (CI). Cannot be activated on Windows. |
| 3 | 1 | `run npm install in webapp/ first` (test_webapp.py:23, runs the 389 node tests) | Legitimate (no node_modules), but it is a real test suite that is off on a fresh checkout. | `cd webapp && npm ci --ignore-scripts` (node 24 present). |
| 4 | 1 | `could not import 'onnxruntime'` (test_providers.py:274, a real ONNX session on the CPU provider) | Legitimate: onnxruntime is the optional `[onnx]` extra and is not in the shared venv. | `pip install -e ".[onnx]"` plus models fetched. |

Missing-model skips: none occurred in the default run (yunet and pphumanseg were present). The MediaPipe models
(face_landmarker, pose_landmarker_lite, hand_landmarker, selfie_multiclass) were missing in this worktree
and were fetched with `realx models fetch` for the browser run (all hash-verified, five ready). The
tests that need them would otherwise skip with "model unavailable" only once a Chromium is found.

## What was activated and the results

- Group 3: `npm ci --ignore-scripts` then `npm test`: **389 node tests pass**. `tests/test_webapp.py` passes.
- Group 4: onnxruntime installed into a throwaway target dir (`E:\realx\wt\_ort`, added to PYTHONPATH; the shared
  venv was not modified). `tests/test_providers.py` plus `test_webapp.py`: **25 passed, 0 skipped**.
- Group 2: not runnable on Windows.
- Group 1: `REALX_CHROMIUM` set to Chrome, `pytest -m browser` once (110 tests are marked browser: the 87 that
  were skipped plus 23 that already ran): **108 passed, 2 failed, 27 min**. All 87 formerly skipped tests
  were executed (none skipped).

## The 2 browser failures

1. `tests/test_character.py::test_character_renders_and_follows_the_tracker_in_a_real_browser`
   fails at line 135: `assert state["connected"] and state["rigMessages"] > 5 and state["pose"]["live"]`
   evaluates `(True and 8 > 5 and False)`. The page connects and gets 8 rig messages, but
   `window.__realx.pose.live` stays false after 3 s (probe set in `webapp/src/avatar.js:439`, live is set
   in `webapp/src/retarget.js` only when torso or shoulder landmarks pass the visibility threshold).
   It failed on the full run and again on a targeted rerun, so it is reproducible here, not a flake.
   Not diagnosed further. Candidate causes: the fixed `time.sleep(3)` is too short on a software GL renderer
   (swiftshader), or the `demo:dance` source does not give visible shoulders/hips on this machine. No app code was changed.
2. `tests/test_control_room_photoface.py::test_photo_face_loads_facemesh_releases_the_stream_and_leaving_stops_the_camera`
   failed once (line 80: no frame with a URL ending in `/facemesh` within 15 s; frames were
   `['http://127.0.0.1:.../', 'about:blank' x3]`). A single targeted rerun passed, so it is timing-sensitive
   under load on a software renderer (15 s deadline), not a deterministic bug.

Also seen: an unhandled exception traceback from `server.py:921` (`self._json(engine.stats())`) printed in the
log of one browser test (the traceback was truncated by the log; most likely a client closing the socket
mid-response). It did not fail a test, but it is worth a look.

## Recommendations

- Make `find_chromium()` in `tests/conftest.py` also look for installed Chrome/Edge (`%PROGRAMFILES%\Google\Chrome\Application\chrome.exe`) so the
  Windows laptop does not silently skip 87 tests; or print a loud one-line warning.
- Run `python -m pytest -q -rs` summaries with `--strict` style gating in CI: fail if skips exceed 3 (POSIX x2, onnx) on Linux CI.
- Consider raising the two timeouts above or marking them as slow-renderer tolerant.

## Not verified

- Linux/macOS behaviour of the POSIX tests (cannot run on Windows).
- Root cause of the test_character failure.
- The tests were run with Chrome (system install), not with Playwright's own bundled Chromium, although the failing-run
  log shows playwright's `chromium-1248` is installed under `%LOCALAPPDATA%\ms-playwright` and was picked by the shared `room` fixture.
- Why the owner's count is 90 and mine 91 (presumably the onnxruntime test).
