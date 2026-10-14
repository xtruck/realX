# Audit report

Baseline taken 2026-10-14 at commit `8cc365c` (pushed). It extends and replaces `docs/AUDIT.md`, whose
findings are kept below. Method: read the code, ran it, and ran the tests. README and progress-log claims
were treated as claims. Where something was **not run, not measured, or not possible on this hardware**,
this report says so.

## 0. Environment and baseline

| | |
|---|---|
| Machine | HP EliteBook 850 G6, Intel Core i5-8365U (4 cores / 8 threads, 1.6 GHz base), 7.8 GB RAM (about 1-2 GB free during testing), Windows 11 Pro build 22000 |
| GPU | **Intel UHD Graphics 620 only. No NVIDIA GPU; `nvidia-smi` does not exist.** |
| ONNX Runtime | 1.31.0, providers available: `AzureExecutionProvider`, `CPUExecutionProvider` (no CUDA, TensorRT, DirectML or OpenVINO) |
| Software | Python 3.14.6, Node 24.19.0, Chrome 155 |
| Owner's stated target | "i5 7th generation, dedicated NVIDIA GPU not yet confirmed". **This machine does not match that description** (8th generation, no NVIDIA). Either the target is another laptop or the NVIDIA GPU does not exist here. Nothing below was measured on an NVIDIA GPU. |
| Working tree | clean, in step with `origin/main` |
| Baseline tests | 68 node tests pass. Python in two groups: 345 passed + 86 passed, 2 skipped (POSIX-only). Two timing-sensitive browser tests failed once under memory pressure and pass on isolated rerun (so the baseline was not one uninterrupted run) |
| Dependencies | `npm audit`: 0 vulnerabilities (production and dev). `pip-audit`: only `pip` itself in the test environment (not shipped); `realx` is not on PyPI so it cannot be audited that way |

## 1. Current architecture

```
Path A: server-side camera (Cartoon / Character / Tracking / Original modes)
  OpenCV camera (DirectShow, index 0, 640x480, buffer 1) or synthetic scene
    -> Pipeline stages: detect_yunet -> track -> one_euro -> rig [-> bg_replace] [-> avatar | debug_boxes]
    -> MJPEG preview (/stream.mjpg) + rig numbers over /ws/rig -> avatar page (three.js + @pixiv/three-vrm)
  Engine thread: capture, inference and JPEG encoding in ONE loop; backoff on camera errors

Path B: browser tracking (Full body mode), what the OBS view shows
  getUserMedia camera -> MediaPipe face + pose + hand landmarkers (WASM, GPU delegate with CPU fallback)
    -> scheduler (one or two models per camera frame) -> BodySolver (landmarks -> bone rotations)
    -> BodyFilter (One-Euro, hold-and-fade, leg gating) -> body message {type,f,q,e,r}
    -> local renderer, and /ws/rig?publish=1 -> server relay -> OBS Browser Source (/avatar)
  Microphone (optional): getUserMedia audio -> Web Audio analyser -> VAD + speech mouth, blended into the body message
  Control room (/): mode, devices, quality, status panel; embeds the tracking page and receives its messages

Safety layer (cross-cutting): consent gate, visible disclosure stage, watermark; pipeline build-time ordering rules;
  signed, expiring, revocable consent records; portrait consent bound to an image hash (adapter only)
Runtime providers: ranking and a SessionCache exist, but NO stage uses ONNX Runtime today
```

## 2. Features confirmed by code and tests

| Area | Evidence |
|---|---|
| Stage pipeline with build-time ordering rules (consent gate before likeness, label, then watermark; no pixel edit after a watermark) | `tests/test_core.py`, `tests/test_cohost.py` |
| Signed, expiring, revocable consent; co-host vault with a revoke code held by the co-host; portrait consent bound to the image hash, re-checked every frame | `safety/consent.py`, `safety/cohost.py`, `safety/portrait_consent.py` and their tests |
| Face detection and tracking on CPU (YuNet), no ghost faces under frame skips, one real-webcam run found the face in 99% of frames | `tests/test_tracking_motion.py`; owner's webcam, once |
| Background replacement (PP-HumanSeg, CPU) | `tests/test_background.py` |
| Offline voice conversion, character presets, authenticated marks | `tests/test_audio.py`, `tests/test_voice_presets.py` |
| Control room, MJPEG preview, rig WebSocket, VRM renderer, OBS Browser Source | `tests/test_server.py`, `tests/test_rig.py`, `tests/test_character.py` (real Chromium) |
| Browser full-body tracking, relay, strict message validation, camera pixels never read or sent | 68 node tests; Chromium tests with a fake camera recording every request and WebSocket frame |
| Microphone mouth with a fake microphone (synthetic vowel opens the mouth when no face is in view; nothing leaves the page) | `tests/test_tracking_browser.py` |
| Resilience: camera loss and recovery in the Python engine, stage failure, queue bounds, a 600-frame leak check | `tests/test_resilience.py` |
| Control room studio panel with strict message handling | `tests/test_control_room_studio.py` |

## 3. Incomplete, simulated, or untested

| Area | State |
|---|---|
| Real person on a real webcam (full body) | **Never run.** The owner's first live test reported lagging arms and untracked hands; fixes are tested synthetically only |
| Real microphone and real voices | **Never run.** Formant thresholds were tuned on synthetic vowels |
| Server-side GPU inference | **Absent.** OpenCV DNN on the CPU for YuNet and PP-HumanSeg; `SessionCache` has only been tested with fake factories |
| Face swap / portrait animation | No engine enabled. Every candidate is blocked or unverified (`PORTRAIT.md`) |
| Virtual camera output | Absent (`pyvirtualcam` is GPL-2.0). OBS Browser Source only |
| Python-side camera and microphone selection | Absent (server camera is index 0 at 640x480). The browser path has selection |
| Browser camera or microphone unplugged mid-stream | **Not handled**: nothing listens for the track ending (found by inspection, see 4) |
| 30-minute stability | **Not demonstrated.** Only a 600-frame leak check exists |
| Audio/video sync | Alignment is computed from estimated latencies; **never compared against ground truth** |
| Robust watermark, C2PA, content filter | Not done; LSB marks do not survive compression |

## 4. Bugs reproduced or confirmed by inspection

| # | Finding | Status |
|---|---|---|
| 1 | Pose model ran ~6 Hz, so arms lagged; a hand was ignored unless the body model rated the wrist >= 0.5 | fixed (synthetic tests); **not confirmed live** |
| 2 | Scheduler weights gave every model the same rate at the measured costs (9.3 Hz each) | reweighted (simulated pose ~14 Hz); **not re-measured live** |
| 3 | One NaN landmark froze the One-Euro filter for good | fixed, tested |
| 4 | Huge JSON integer in a body message raised `OverflowError` and killed a handler thread | fixed, tested |
| 5 | Pings and binary frames bypassed the relay rate cap | fixed, tested |
| 6 | Global model-download lock could stall the server | per-model locks, prefetch |
| 7 | `pipeline.run_stream` never dropped stale frames; it blocked the camera | fixed, regression test |
| 8 | **No logging anywhere in `src/realx`** (0 uses of `logging`; request log silenced): unexpected 500s, WebSocket 1011 closes, model-prefetch failures, camera-close errors leave no trace, and being offline during prefetch is invisible | fixed: `realx.log` (plain or JSON lines, `--log-level`, `--log-json`); engine, camera, 500, 1011, prefetch, model-download and stage-start failures are logged once with type, message and traceback, and never reach the client; 14 tests in `tests/test_logging.py` |
| 9 | Browser tracker does not notice a camera or microphone being unplugged | open |
| 10 | Filter time uses processing time, not the camera's capture time, so variable processing delay becomes motion jitter | open |
| 11 | Server camera loop does capture, inference and JPEG encoding in one thread | open |
| 12 | No runtime hardware detection; the default quality is fixed regardless of the machine | open |
| 13 | All three MediaPipe landmarkers are created at start-up in parallel; memory cost on an 8 GB machine **not measured** | open |
| 14 | If the browser's GPU path is unavailable every model is ~3x slower and the character itself drops to ~9 fps (inference runs on the page's main thread) | open |
| 15 | The relay has no per-run publish token; a local process can claim the publisher slot | accepted for the local-only threat model |
| 16 | `core.autocrlf` rewrites the vendored WASM loader on Windows (content identical after normalising) | documented |
| 17 | Test run prints a harmless `ConnectionAbortedError` traceback when a client drops | open |

Swallowed errors, checked by reading every broad `except` in `src/realx`: cleanup paths keep the original
error, the provider fallback records why a provider failed, and the engine loop reports errors in its stats.
The gaps are the unlogged ones in item 8.

## 5. Performance bottlenecks (measured; conditions in `docs/BENCHMARKS.md`)

| Finding | Evidence |
|---|---|
| Browser tracker on the UHD 620 GPU path: ~25-26 fps, each model ~27-41 ms, character rendered ~31-48 fps | windowed Chrome, fake camera; one run carried 15 other Chrome processes (contention) |
| Browser tracker on the CPU path: ~9 fps, each model ~90-120 ms, character ~9 fps | headless software GL, same contention caveat |
| Python pipeline kept up with a 30 fps camera at 320x240, 640x480 and 1280x720 | `realx bench`; ~40% run-to-run variation; back-to-back timing flatters the machine (8 ms vs 23 ms paced at 320x240) |
| Free RAM was 1-2 GB of 7.8 GB while testing; Claude Code stopped the server and a test run once for memory | observed |

No end-to-end (camera to avatar) latency figure exists beyond the browser's own capture-time estimate, and
capture latency, rendering time and CPU/memory use per stage have **not** been measured systematically.

## 6. Dependency and model licensing risks

See `LICENSE-AUDIT.md`. In use: YuNet (MIT), PP-HumanSeg (Apache-2.0), three MediaPipe bundles (Apache-2.0,
verified from five model cards), MediaPipe WASM and JS (Apache-2.0), three.js and three-vrm (MIT). Blocked:
`inswapper_128`, `buffalo_l`, and every LivePortrait component (default path needs InsightFace `buffalo_l`,
non-commercial; its weights' and the MediaPipe fork's licenses are unverified; X-Pose has no license).
`pyvirtualcam` is GPL-2.0 and excluded.

## 7. Hardware limitations

- This laptop has no NVIDIA GPU, so CUDA and TensorRT are not an option here and were never exercised.
- ONNX Runtime offers only the CPU provider; DirectML (the realistic accelerator on Intel graphics) is not installed and was not tried.
- 7.8 GB RAM leaves little headroom with a browser, the server and test tooling open together.
- The i5-8365U is a 15 W part; sustained load will be thermally limited, which the short benchmarks do not show.
- The browser GPU path (WebGL on UHD 620) works and is what makes ~25 fps possible; without it the experience collapses.

## 8. Prioritised plan (milestones from the owner's brief)

| Milestone | Work | State |
|---|---|---|
| 1 Baseline | this report | done |
| 2 Critical fixes | structured logging (8) **done**; still to do: device disconnect recovery (9); runtime hardware detection and low-resource defaults (12); capture-time filtering (10); lazy or staged model loading and memory measurement (13); troubleshooting guide | next |
| 3 Real webcam | a script the owner runs that records numbers only; I do not turn the camera on myself | planned |
| 4 Performance | soak test for slowdown over time; per-stage latency and CPU/memory; adaptive quality | planned |
| 5 Streaming | OBS and A/V sync validated against ground truth | needs the owner's OBS and microphone |
| 6 Portrait animation | blocked until a license-clean engine exists and a measured real-time result | blocked |
| 7 Release readiness | full regression run, security review, Windows install instructions | partly done (`WINDOWS.md`) |

## Findings carried over from the first audit (`AUDIT.md`, now merged here)

The first audit's tables are reproduced in sections 2-5 above. Items it recorded that are not repeated
there: the co-host flow is consent, label and revoke machinery with a stub renderer; output is the MJPEG
preview and OBS Browser Source only; the watermark is LSB and does not survive lossy compression; and the
roadmap's "CUDA/TensorRT 25+ fps on RTX-class GPU" milestones (M1, M2) are not implemented.
