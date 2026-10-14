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

## Blocking decisions

- Model path A (license) or B (train): required before M1 ships models.
- Repo visibility: make private before M1.
- Product license text.
