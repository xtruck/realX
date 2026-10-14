# Roadmap

| Milestone | Scope | Exit criteria |
|---|---|---|
| **M0 Foundation** (this commit) | Research, license audit, architecture, scaffold, tests | `pytest` green, `realx selftest` passes |
| **M0.5 Avatar tier** | MediaPipe tracking, rig solver, VRM renderer, OBS browser source, One-Euro filtering | Live avatar at 30 fps on the CPU-only dev laptop |
| **M1 Engine** | ONNX detect/align/swap/restore stages behind the Stage interface; CPU and CUDA | 1080p video swap offline, model-agnostic |
| **M2 Live** | Camera source, virtual camera sink, latency-aware stream runner | 25+ FPS on RTX-class GPU, under 150 ms |
| **M3 Quality** | Temporal smoothing, mouth/occlusion mask, color match, auto-quality benchmark | Side-by-side flicker score beats baseline |
| **M4 Safety** | Signed consent store, robust watermark, C2PA export, content filter | Pipeline refuses unconsented swaps; watermark survives H.264 |
| **M5 Product** | Desktop app (UI), installer, license keys, presets | Installable build for Windows |
| **M6 Cloud** | GPU backend, WebRTC transport, accounts and billing | Weak laptop gets live swap through cloud |
| **M7 Studio tier** | Per-identity training workflow, Animator tier | Trained model beats instant tier in blind test |

## Verified status (2026-10-14)

Only what was run and passed is marked done. "Tested synthetically" means unit tests, a fake camera
or a fake microphone; it is **not** proof on a real person. Details and evidence: `AUDIT.md`.

| Item | Status |
|---|---|
| M0 Foundation | done |
| M0.5 Avatar tier (tracking, rig, VRM, OBS Browser Source, filtering) | done on CPU. Full-body tracking built; **not yet confirmed on a real person** (the first live test found lag and untracked hands; fixes are tested synthetically only) |
| M1 Engine (ONNX stages, CUDA/TensorRT) | not started. `SessionCache` with provider fallback exists and is tested with fake factories; **no real accelerated provider has been exercised** (none is installed) |
| M2 Live | partial: camera source with reconnect, bounded stream runner (a stale-frame bug was fixed), OBS Browser Source. No virtual camera, no GPU pipeline |
| M3 Quality | not started |
| M4 Safety | partial: signed, expiring, revocable consent (faces and portraits, re-checked every frame), visible disclosure, LSB watermark. Not done: robust watermark, C2PA, content filter |
| M5 Product | partial: PowerShell install/test/run scripts (run once, without Node), control-room studio panel. No installer |
| M6 Cloud, M7 Studio tier | not started |

Live Studio brief, by priority:

| Priority | Verified progress | Not verified / blocked |
|---|---|---|
| P0 audit | `AUDIT.md`, from the code | |
| P1 real-webcam tracking | scheduler (pose ~14 Hz at measured costs, simulated), hand rule, status readout, validation guide | real person, hands, legs, filter constants untuned |
| P2 microphone and speech mouth | mic capture with browser noise suppression, VAD, speech-driven mouth blended with the tracked mouth, A/V sync alignment, privacy checks; tested with synthetic audio and Chrome's fake microphone | real microphone, real voices (formant thresholds tuned on synthetic vowels), real device latency |
| P3 performance | `realx bench`, browser benchmark, results with conditions in `BENCHMARKS.md` | any GPU other than the laptop's integrated one; every ONNX provider |
| P4 portrait animation | adapter, per-image consent, per-frame revocation, license evaluation in `PORTRAIT.md` | **no engine enabled**: LivePortrait needs InsightFace `buffalo_l` (non-commercial) by default; its weights' and the MediaPipe fork's licenses are unverified; no real-time evidence |
| P5 control room and Windows | camera, microphone and quality selection, status panel, scripts, OBS and Windows guides | real webcam and OBS run by the maintainers |

## Blocking decisions

- Model path A (license) or B (train): required before M1 ships models.
- Repo visibility: the owner chose to keep it public for now. Real swap models and any
  licensed weights must never be committed; keep swap tiers in a separate private
  package if that is ever needed.
- Product license text.
