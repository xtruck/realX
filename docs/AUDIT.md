# Repository audit (2026-10-14, before the Live Studio work)

Method: read the code and ran it. README and progress-log claims were treated as claims, not proof.
Baseline at the start of this audit: 273 Python tests passed (2 POSIX-only skips), 36 node tests
passed, on Windows 11 with Chrome 155 and Python 3.14. Nothing here was measured on a GPU other
than the laptop's integrated one.

## What works, and how we know

| Area | Evidence |
|---|---|
| Stage pipeline with build-time ordering rules (consent gate before likeness, label, then watermark; no pixel edit after a watermark) | `tests/test_core.py`, `tests/test_cohost.py` |
| Signed, expiring, revocable consent records; co-host vault with a revoke code held by the co-host | HMAC records in `safety/consent.py`; cohost tests; revocation checked on every frame |
| Face detection and tracking on CPU (YuNet, one id, no ghost faces under frame skips) | `tests/test_tracking_motion.py`; one real-webcam run: face found in 99% of frames |
| Background replacement (PP-HumanSeg, CPU) | `tests/test_background.py` |
| Offline voice conversion, character presets, authenticated marks | `tests/test_audio.py`, `tests/test_voice_presets.py` |
| Control room, MJPEG preview, rig over WebSocket, VRM renderer, OBS Browser Source | `tests/test_server.py`, `tests/test_rig.py`, `tests/test_character.py` (real Chromium) |
| Browser full-body tracking: face, 52 blendshapes, spine, arms, hands, fingers, legs; relay to OBS | 36 node tests on synthetic landmarks; Chromium tests with a fake camera playing a portrait |

## What is incomplete, simulated, or absent

| Area | State |
|---|---|
| Live microphone | **Absent.** Audio exists only as offline WAV conversion and chunked stages. No capture device, no noise suppression, voice-activity detection is an energy gate, nothing drives the mouth from speech. |
| Server-side GPU inference | **Absent.** `runtime/providers.py` ranks ONNX Runtime providers but no stage uses them; YuNet and PP-HumanSeg run on OpenCV DNN on the CPU. The only GPU use is MediaPipe's WebGL delegate in the browser. The roadmap's "CUDA / TensorRT, 25+ fps on RTX" (M1, M2) is not implemented. |
| Face swap / portrait animation | **Absent.** No swap or animation model is bundled. The co-host flow is consent, label and revoke machinery with a stub renderer. |
| Output | MJPEG preview and the OBS Browser Source only. No virtual camera (`pyvirtualcam` is GPL-2.0 and excluded). |
| Camera selection and quality presets | **Absent.** The Python camera is index 0 at 640x480; the browser tracker takes the default camera. |
| Benchmarks | **None repeatable.** Speed numbers in the docs are single runs on one laptop. There is no per-resolution, per-provider benchmark. |
| Watermark / provenance | LSB marks only; they do not survive lossy compression. No C2PA. |
| Long-session behaviour | No test for memory growth, camera unplug during a stream, or inference failure mid-stream beyond the engine's backoff loop. |

## Real webcam versus synthetic

- YuNet tracking: validated once on the owner's real webcam (99% of frames).
- Full-body tracking: automated tests use synthetic landmarks and a fake camera playing a portrait. The
  owner's first live test reported **lagging arms and no hand tracking**. Two likely causes were fixed
  (pose ran only ~6 times a second; a hand was discarded when the body model doubted its wrist), and a
  readout now says why a hand is not tracked. **The fix is not yet confirmed on a real person.**
- No automated test uses a real microphone or a real GPU.

## Bottlenecks and defects found

| # | Finding | Status |
|---|---|---|
| 1 | Browser tracker: each model costs ~30 ms on an integrated GPU and blocks the page's main thread; the old fixed schedule gave pose ~6 Hz, so arms lagged | scheduler rewritten (time budget, pose favoured); unit-simulated, **not measured on an idle machine** |
| 2 | Hands ignored unless the pose model rated the wrist >= 0.5 | relaxed to 0.2 when the hand model also finds the hand; tested on synthetic data |
| 3 | One NaN landmark froze the One-Euro filter for good | fixed, tested |
| 4 | Huge JSON integer in a body message raised `OverflowError` and killed the handler thread | fixed, tested |
| 5 | Pings and binary frames bypassed the relay's rate cap | fixed, tested |
| 6 | Global model-download lock could stall the server | per-model locks and background prefetch |
| 7 | Server camera loop does capture, inference and JPEG encoding in one thread, so capture latency is tied to processing | open |
| 8 | `core.autocrlf` rewrites the vendored WASM loader on Windows (content identical after normalising) | documented in `LICENSE-AUDIT.md` |
| 9 | Test suite prints a harmless `ConnectionAbortedError` traceback when a client drops | open |
| 10 | Relay has no per-run publish token; a local process can claim the publisher slot | accepted for the local-only threat model, documented |

## Security and privacy review (ECC reviewers, this session)

No critical or high findings. Medium findings were fixed (see 3-6 above). Camera pixels are not read,
drawn, encoded or sent by the tracker source (checked by a source test and by recording every request
and WebSocket frame in a fake-camera browser test). The "Virtual character" label cannot be hidden on a
camera page.

## Models and licenses

See `LICENSE-AUDIT.md`. In use: YuNet (MIT), PP-HumanSeg (Apache-2.0), three MediaPipe bundles
(Apache-2.0, verified from five model cards). Blocked: `inswapper_128`, `buffalo_l` (InsightFace,
non-commercial). LivePortrait is evaluated in `PORTRAIT.md`; it is **not** enabled.

## Milestones against the roadmap

| Milestone | Verified state |
|---|---|
| M0 Foundation | done |
| M0.5 Avatar tier | done on CPU; full-body tracking added; real-person tuning outstanding |
| M1 Engine (ONNX stages, CUDA) | not started |
| M2 Live (camera, virtual camera, 25+ fps GPU) | partial: camera source and OBS Browser Source; no virtual camera, no GPU path |
| M3 Quality | not started |
| M4 Safety | partial: signed, revocable consent and disclosure done; robust watermark, C2PA, content filter not done |
| M5 Product | not started (no installer) |
| M6, M7 | not started |
