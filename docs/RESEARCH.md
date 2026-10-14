# Research: what the field does well

Surveyed 2026-10-13 via GitHub API and READMEs. Used for **ideas only**. No code from
GPL/AGPL/non-commercial projects is copied (see LICENSE-AUDIT.md).

| Project | Stars | Status | Best idea we take |
|---|---|---|---|
| hacksider/Deep-Live-Cam | 97k | active | One-photo live swap, mouth mask, multi-face mapping, execution-provider fallback, built-in content check |
| facefusion/facefusion | 30k | active | **Processor modules** (swapper, enhancer, expression restorer, lip-sync, age, background remover), job queue, inference manager, face store/tracker, benchmarker |
| iperov/DeepFaceLive | 31k | archived 2024 | **Live pipeline as separate backends** (camera → detect → align → swap → merge → stream), per-identity trained models for top quality, face animator mode |
| iperov/DeepFaceLab | 19k | archived 2024 | Training workflow for per-identity models |
| deepfakes/faceswap | 57k | active | Training tooling and model plugins |
| KlingAIResearch/LivePortrait | 19k | active | Expression/pose transfer onto a still portrait (Face Animator tier) |
| ai-forever/ghost | 1.6k | 2025 | Apache-2.0 one-shot swap research code, a legally cleaner baseline |
| TencentARC/GFPGAN, sczhou/CodeFormer | 38k / 18k | stale/active | Face restoration after the swap (check model licenses) |
| xinntao/Real-ESRGAN | 37k | stale | BSD-3 super-resolution for frames |
| deepinsight/insightface | 30k | active | Detection, alignment, embeddings. Models are non-commercial unless licensed |
| s0md3v/roop | 3.5k | archived 2026 | Origin of the one-click flow |

## The ideas we combine

1. **Stage graph, not a script** (DeepFaceLive + FaceFusion): every capability is a
   `Stage` with `setup/process/close`, composed into a pipeline per use case.
2. **Provider abstraction** (FaceFusion + Deep-Live-Cam): TensorRT → CUDA → DirectML →
   OpenVINO → CoreML → CPU, chosen at runtime.
3. **Two quality tiers** (DeepFaceLive): instant one-photo swap, and an optional trained
   per-identity model for premium realism.
4. **Face Animator tier** (LivePortrait): drive a still portrait with live expressions.
5. **Temporal stability** (all of them struggle here): track-based smoothing of boxes and
   landmarks, plus latency-aware frame dropping so output stays real time.
6. **Face store / tracker** (FaceFusion): stable identities across frames and cameras.
7. **Mouth/occlusion masks** (Deep-Live-Cam): keep real mouth, hands, glasses over the swap.
8. **Jobs + benchmark** (FaceFusion): queue for batch video, benchmark per provider so the
   app auto-picks quality/FPS.
9. **Safety as a stage** (Deep-Live-Cam's content check, taken further): consent gate,
   watermark, provenance. Required for a shippable product.

## Additional lessons from reading FaceFusion's source layout

Ideas only; the project is OpenRAIL-AS licensed and no code is copied.

- **Inference pool:** model sessions are created once per (module, models, device,
  providers) and reused across CLI/UI contexts; frames are spread across several GPU
  device ids. We adopt a session cache keyed the same way (M1).
- **Detect once per frame:** a face store keyed by frame hash with a per-frame lock lets
  every processor reuse the same detections. We put detections on `FrameContext` and add
  a shared face cache for multi-stage reuse.
- **Concurrent streaming:** a worker pool plus a completion deque feeds the output.
  Completion order can reorder frames; realX's `run_stream` keeps input order and bounds
  in-flight frames.
- **Safety on the live path:** their content analyser runs on every stream frame, not
  only on files. Same requirement for us (M4).
- **One workflow per mode:** image, video, stream and image-to-video are separate
  workflows over the same processors, with a job manager (queue, runner, store) for batch
  work. Matches our M1/M6 split.
- **Self-describing modules:** each processor ships its own choices, types and model
  sources. Our stages will declare required models so the license audit is automatic.
- **Version guards:** they work around known ONNX Runtime arena memory leaks by version.
  We pin and test supported runtime versions per provider.

## Second batch: VisoMaster, DeepFaceLab, vtubing, webatar

| Project | License | Best ideas we take |
|---|---|---|
| VisoMaster | GPL-3.0 (ideas only) | Per-face-part masks, occlusion masks, expression restorer, LivePortrait-based face editor with colour tuning, several source photos merged into one embedding, **video markers** (parameters that change per frame), live playback, virtual camera, TensorRT, installer that picks the CUDA build |
| DeepFaceLab | GPL-3.0 (ideas only) | Trained occlusion (XSeg) masks with an editor, head replacement, de-aging, merger stage separate from the model |
| vtubing | **MIT** (reusable with attribution) | **CPU-only** webcam > MediaPipe > rig solver > VRM avatar > OBS browser source; One-Euro filtering; auto-calibration of the neutral face in the first second; WebSocket rig state |
| webatar | unclear (badge says MIT) | Browser-only avatar tier with zero install; **decoupled rates** (face 30 fps, pose 15, render 60); LRU cache of loaded avatar models; custom ARKit-to-VRM solver |

### What changed in our plan

1. **Avatar tier added.** MediaPipe (Apache-2.0) + VRM runs on CPU, needs no
   InsightFace model, and works on weak laptops. It is the fastest legally clean
   product we can ship, and it gives the swap tiers time to clear model licensing.
2. **One-Euro filter** replaces fixed-weight smoothing as the default (`one_euro` stage).
3. **Parameter timelines** (`ParamTimeline`) implement VisoMaster-style per-frame markers.
4. **Multi-photo identity** (`average_embeddings`) for sturdier one-shot swaps.
5. **Decoupled stage rates** (detect 30, pose 15, render 60) are a design requirement
   for the live runner (M2).
6. **Trained occlusion masks** (XSeg-style) move into the Studio tier (M7).

## Gaps nobody fills (our differentiators)

- Consent verification and signed provenance built into the pipeline, not bolted on.
- Cloud-GPU backend with a thin local client, so weak laptops (like the dev machine:
  i5-7300U, Intel HD 620) can still use it.
- Honest per-machine capability report and automatic quality scaling.
