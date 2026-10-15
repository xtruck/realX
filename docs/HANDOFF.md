# Handoff (2026-10-14): continue on another computer

Written when the owner left the work laptop. Read this first, then `PROGRESS.md` and `AUDIT_REPORT.md`.

## Where the code is

**Update 2026-10-15:** the full suite was run and passed (Python 613 passed, 2 POSIX-only skips, Chromium tests
included; node 95), so `main` was fast-forwarded to `c4151a3` and is the same as branch `handoff-2026-10-14`.
Running the browser tests found a real bug the node tests could not see: `DeviceSupervisor` called `setTimeout` as a
method of itself, which a browser rejects ("Illegal invocation"), so a lost camera or microphone never reconnected.
Fixed, with a node test that imitates the browser's rule. The rest of this file describes the state before that run.

Branch `handoff-2026-10-14` on GitHub held everything while `main` was behind on purpose: the rule is that `main`
only receives work whose tests all pass.

## Decisions the owner made

| Question | Decision |
|---|---|
| Face replacement | Photoreal wanted. Neural swap models are blocked (InsightFace "non-commercial research only"). The route to build is a photo wrapped on the tracked face mesh, CPU plus integrated GPU: `SWAP-CPU.md` |
| Virtual camera | First validate the pipeline through **OBS Virtual Camera** (`OBS.md`), then study **Softcam** (MIT, `SOFTCAM.md`) |
| UI | Keep the web control room, no Qt rewrite |
| Distribution | Personal use for now (commercial licensing questions are parked, not answered) |
| "Avatar IA" mark | The visible mark drawn in the canvas was tried and **cancelled** by the owner. The page badge is as before (small "Virtual character" tag, `?badge=off` hides it on a plain OBS view, never on a camera page). For the future photoreal face replacement a visible mark stays and gets no off switch |

Rules that do not change: consent gate, visible disclosure, watermark ordering, blocked models stay blocked
(`inswapper_128`, `buffalo_l`, LivePortrait components), no mode that hides the transformation, camera pictures
never leave the page (`SAFETY.md`).

## What is done and tested

Full-body browser tracking, desk view, relay to OBS, microphone mouth and A/V sync, studio controls, access token,
strict pipelines, latest-frame grabber and diagnostics, structured logging, `run_stream` fix, benchmarks, device
recovery logic, portrait adapter (no engine enabled), runtime hardware detection (`realx hardware`,
`/api/hardware`), a read-only OBS check (`scripts\windows\obs-check.ps1`).

Last results on the work laptop, after the hardware work: Python without a browser **520 passed, 2 skipped**
(POSIX-only); the node suite passed earlier today (94 tests, counting the unused badge files that are not in this
branch). The browser tests were not run (see below).

## Written but NOT run (the work laptop had 1 GB of free RAM)

* The Chromium tests: `test_tracking_browser.py` (two new ones simulate an ended and a frozen camera),
  `test_character.py`, `test_rig.py`, `test_control_room_*.py`. Two of them failed once under memory pressure and
  passed alone.
* Nothing has been tried with a real person on a real webcam, a real microphone, or OBS and your apps.

## To do, in order

1. Run everything (commands below). Fix what fails. If all is green, fast-forward `main` to this branch and push.
2. `docs/TROUBLESHOOTING.md` (not written).
3. A real-webcam validation script the owner runs (numbers only; do not turn the camera on from an agent).
4. A 30-minute soak test with per-minute memory, CPU and frame numbers.
5. The mesh-texture face prototype from `SWAP-CPU.md`: a standalone page, fps measured, the owner judges the look.
   Source face photos: only synthetic or the owner's own, licence checked first; none is chosen yet.
6. Owner: fill in the table in `OBS.md`, then the Softcam test matrix in `SOFTCAM.md`.
7. Optional: show the `/api/hardware` advice next to the quality selector in the control room.

## Commands (PowerShell, from the repository folder)

```powershell
git fetch origin
git checkout handoff-2026-10-14
python -m venv .venv
.\.venv\Scripts\python -m pip install -e ".[dev,onnx,video]" playwright
cd webapp; npm ci; npm run build; cd ..
.\.venv\Scripts\realx hardware
$env:REALX_CHROMIUM = "C:\Program Files\Google\Chrome\Application\chrome.exe"
cd webapp; node --test test/*.test.mjs; cd ..
.\.venv\Scripts\python -m pytest -q
```

Run the server for yourself with a stable token, then the OBS check:

```powershell
$env:REALX_TOKEN = "choose-a-long-private-token-1234"
.\.venv\Scripts\realx serve --no-browser
.\scripts\windows\obs-check.ps1
```

## Things that will trip you up

* This repository's agent setup has GateGuard hooks: before the first edit of a file you must state its callers
  and the instruction. A blocked edit does **not** apply; check `git status` after batches (two commit messages
  once claimed edits that had been blocked).
* The access token is required on every route. Tests get it from `tests/conftest.py`.
* `core.autocrlf=true` on Windows rewrites line endings; the vendored WASM loader is identical after normalising.
* Windows limits an environment variable to 32,767 characters; a test id that long breaks pytest (fixed once in
  `test_remote.py`).
* Low RAM kills things: close browser tabs before running the browser tests, and run them a few at a time.
* The work laptop is an HP EliteBook 850 G6 (i5-8365U, Intel UHD 620, 7.8 GB, no NVIDIA). The home computer may
  differ: run `realx hardware` and re-measure before trusting any speed figure here.
