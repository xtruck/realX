# Backend audit, summary (2026-10-21)

Five read-only audits of `src/realx` (about 7 800 lines of Python) before any improvement work. No application code or existing test was changed.
Each report is on its own branch (`audit-backend-b1-server` ... `b5-tests-perf`) under `docs/audit/backend/`. Every finding there is marked
confirmed (with a reproduction) or UNCONFIRMED. This page only ranks them.

## Counts

| Area | Branch | Critical | High | Medium | Low | Info | Total |
|---|---|---|---|---|---|---|---|
| B1 server, websocket, log | `audit-backend-b1-server` | 0 | 1 | 4 | 12 | 5 | 22 |
| B2 pipeline, stages, runtime, sources | `audit-backend-b2-pipeline` | 0 | 2 | 6 | 14 | 2 | 24 |
| B3 safety, consent, watermark, remote | `audit-backend-b3-safety` | 0 | 2 | 6 | 9 | 3 | 20 |
| B4 audio, models, hardware, cli, bench | `audit-backend-b4-modules` | 0 | 0 | 8 | 12 | 5 | 25 |
| B5 test suite | `audit-backend-b5-tests-perf` | coverage 91 %, 8 of 10 mutants caught | | | | | |
| **Total (B1 to B4)** | | **0** | **5** | **24** | **47** | **15** | **91** |

No Critical finding. Nothing was measured on a real webcam, a real hand or a discrete GPU.

## Ranked improvement plan

Order = honesty and safety first, then reliability, then speed, then tests.

### Phase 0, truthfulness and safety (the project's central promise)

1. **B3-03**: `/api/stats` says `security.watermark: true` but the server's video pipeline has no watermark stage. Show the truth first.
2. **B3-01, B3-02**: the watermark is an LSB mark that does not survive JPEG (0/5 detected at quality 95, 90, 82, 70, 50) and is forgeable without a key.
   The `/facemesh` page has no watermark or in-pixel label. Decide what the mark must guarantee, then change it. **Owner decision.**
3. **B2-02, B3-04, B3-05**: `strict=True` trusts "registered", not "realX-owned"; `Pipeline` defaults to `strict=False`; `gate.grant()` mints a pass without a check.
4. **B4-09**: `cohost grant` saves the consent, then crashes printing the revoke code when stdout cannot encode the name; the revoke code is lost.
5. **B3-06 and the `.revoked` tombstone**: consent expiry uses the wall clock (set the clock back: expired becomes valid); deleting the tombstone restores consent.

### Phase 1, reliability

6. **B1-01 (High)**: `/stream.mjpg` threads and slots stay held after the client leaves in body/character/photoface modes; 16 held slots make the server answer 503 to everything.
7. **B1-02, B1-03, B1-04, B1-06**: per-recv timeouts (slow-trickle fills the 16 slots), `do_GET` without exception handling, `allow_reuse_address` lets two servers bind one port on Windows, `Dedup` not thread-safe.
8. **B2-01 (High), B2-03**: the One-Euro filter freezes after a timestamp restart (`dt <= 0`), so `bench.py` stream numbers after the first loop run on a frozen filter; one NaN landmark poisons smoothing for good.
9. **B4-01, B4-02, B4-03**: `IncompleteRead` skips the mirror fallback; `models fetch` exits 0 when every model failed; the licence gate checks labels only.
10. **B4-11, B4-12**: process memory reads `None` on Windows (ctypes without `argtypes`); `realx hardware` takes 11.9 s (PowerShell probe at 7.9 s of an 8 s timeout).

### Phase 2, speed and power (measure each against `docs/BENCHMARKS.md`, on an idle machine)

11. **B1-05**: every frame is JPEG-encoded on the engine thread even with no viewer (17.6 ms at 720p, 34 ms at 1080p).
12. **B2-07 / A2 E1-E3**: `bg_replace` is `cv2.dnn` 58 % plus about 42 % avoidable numpy/OpenCV glue (float blend 14 %, guided filter 15 %, `astype` 4 %); one profile on a shared machine, so confirm on idle. Try ONNX Runtime and INT8 YuNet (A2).
13. **B2-05**: `run_stream` adds one frame period of latency to every output; **B4-08**: whole-file pitch shift is quadratic (80 s of audio takes 52 s).
14. **B2-08 / A2 E5**: the provider ranking puts DirectML above OpenVINO and CPU against the project's own measurement (about 2x slower on YuNet). DirectML's licence is proprietary: **owner decision** against the permissive-only rule.

### Phase 3, tests (B5)

15. Write first: stereo / 8-bit / 24-bit `read_wav`; full `pick_providers` order; injected clocks instead of wall-clock sleeps (2 flaky grabber tests fail under load); malformed consent records; watermark negative paths.

## Already fixed elsewhere

* Origin check on GET: `audit-security-review` (A7).
* `run_stream` no longer blocks the source (B2 confirmed; the text in `BENCHMARKS.md` is stale, B2-23).

## Not covered

Real webcam, real hand, discrete GPU, Python 3.10/3.11, wheel installs, the Windows ACL on the co-host key, a real browser against a hostile page, a load test of the 16-slot limit.

## Test suite, the 90 skipped tests (A3, branch `audit-skipped-tests`)

Baseline in the A3 worktree: 671 passed, 91 skipped (the owner sees 672 / 90; the extra skip is most likely the optional `onnxruntime` test).

| Skips | Reason | Legitimate on this machine? |
|---|---|---|
| 87 | no Chromium found (`REALX_CHROMIUM` unset), across 10 browser test files | The code does what it says, but it hides most UI tests on a machine that has Chrome. The lookup does not check Program Files. |
| 2 | POSIX file permissions (`tests/test_cohost.py`) | Yes, NTFS has no chmod modes. |
| 1 | `npm install` not run in `webapp/` (the whole Node suite is skipped) | Yes, but a fresh checkout loses that suite silently. |
| 1 | `onnxruntime` not installed (optional `[onnx]` extra) | Yes. |

With the skips activated (Chrome path set, models fetched, `npm ci`, onnxruntime in a throw-away dir on E): Node tests 389/389, providers and webapp 25/25,
**browser tests 108 passed, 2 failed** (27 minutes, all 87 formerly skipped tests ran).

The two failures (no application code or test was changed):

1. `tests/test_character.py::test_character_renders_and_follows_the_tracker_in_a_real_browser`: reproducible (failed twice). The page gets 8 rig messages but
   `__realx.pose.live` stays false after a fixed 3 s sleep. Cause not found (a sleep too short on a software renderer, or `demo:dance` showing no shoulders).
2. `tests/test_control_room_photoface.py::...leaving_stops_the_camera`: failed once (no `/facemesh` frame within 15 s), passed on a single rerun: timing-sensitive.

Also seen: one unhandled traceback from `server.py:921` (`self._json(engine.stats())`) in the browser log, which did not fail a test (add it to B1-03).
The browser `room` fixture used Playwright's bundled `chromium-1248` even with `REALX_CHROMIUM` set, so "Chrome" results may be mixed.

Added to the plan, Phase 3: make `find_chromium()` in `tests/conftest.py` also find the installed Chrome or Edge, or warn loudly when it skips;
investigate the reproducible `test_character` failure before treating the suite as green.

## Status of all audit branches

All 7 front audits (A1 to A7), the 5 backend audits (B1 to B5) and the summary are on GitHub as branches; nothing is merged into `main` and no pull request is open.
