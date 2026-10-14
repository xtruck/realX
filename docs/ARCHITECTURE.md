# Architecture

## Goals

- Real-time (target 30 FPS, under 100 ms glass-to-glass) on a GPU machine.
- Usable on weak hardware through a cloud GPU backend.
- Best-in-class quality through a swappable stage graph.
- Safe to ship: consent, watermark and provenance are part of the pipeline.

## Topology

```
 Local client (Windows/macOS/Linux)            GPU backend (cloud or local CUDA box)
 +-----------------------------+   WebRTC    +-----------------------------------+
 | camera / file source        | ----------> | decode -> Pipeline -> encode      |
 | preview + controls (UI)     | <---------- |  detect > track > align > swap >  |
 | virtual camera / OBS sink   |             |  restore > composite > safety     |
 +-----------------------------+             +-----------------------------------+
        same Pipeline code can run in-process when a local NVIDIA GPU exists
```

## Pipeline

A frame becomes a `FrameContext` (pixels, detected faces, metadata). Each `Stage`
transforms it. Stages are registered by name and assembled from config.

| # | Stage | Job | Pluggable backends |
|---|---|---|---|
| 1 | `source` | camera / file / network frames | OpenCV, FFmpeg, WebRTC |
| 2 | `detect` | face boxes + landmarks | ONNX models |
| 3 | `track` | stable IDs, `smooth` landmarks (EMA) | built in |
| 4 | `align` | crop and normalize | built in |
| 5 | `consent_gate` | block unless source identity has valid consent | built in |
| 6 | `swap` | tier 1 one-photo, tier 2 per-identity, tier 3 animator | ONNX / TensorRT |
| 7 | `restore` | face enhancement | ONNX |
| 8 | `mask` | keep mouth/occluders from original | built in |
| 9 | `composite` | color match + blend back | built in |
| 10 | `watermark` | embed provenance payload | built in |
| 11 | `sink` | preview / OBS browser source / file / stream | MJPEG preview today; OBS Browser Source and FFmpeg next. `pyvirtualcam` is GPL-2.0 and is not used |

## Runtime

- **Providers:** TensorRT > CUDA > DirectML > OpenVINO > CoreML > CPU, selected by
  `realx.runtime.providers.pick_providers`.
- **Latency budget:** the stream runner drops stale frames rather than queueing, so
  output stays real time.
- **Auto quality:** a benchmark picks resolution/stages per machine (roadmap M3).

## Quality tiers

0. **Avatar (CPU):** webcam tracking drives a VRM avatar. No real-person face is
   synthesized, runs on any laptop, and uses only permissive models. First to ship.
1. **Instant:** one or several photos, no training.
2. **Studio:** per-identity trained model (DeepFaceLive-style), best realism, trained
   occlusion masks.
3. **Animator:** still portrait driven by live expressions (LivePortrait-style).

## Live runner requirements (from the reviews)

- **Decoupled rates:** detection, pose and render run at independent rates.
- **Latest frame wins** at the source; stale frames are dropped, and drops are counted.
- **Pipelined stages** so detection of frame N+1 overlaps swapping of frame N.
- **Fail closed:** if a safety stage fails, emit the original frame, never an
  unmarked synthetic one.
- **Device buffers:** frames may stay on the GPU between stages (IO binding) to avoid
  host copies.
- **Model registry and inference pool:** every model has a manifest entry (hash,
  license, status), and sessions are cached per (model, provider, device).

## Enforced today (tests in `tests/`)

- A synthesizing stage cannot be built without a consent gate before it and a
  watermark after it (`PipelineConfigError`).
- Consent is bound to the identity being used; a record for one person never
  authorizes another. The gate token is a private object, not a string.
- Consent records are HMAC-signed with domain separation, key id, record id, expiry and
  revocation. Keys must be 32+ bytes with some entropy.
- Watermark payloads can carry an authentication tag, so forged marks are rejected.

## Safety (see SAFETY.md)

Consent records are signed. The pipeline refuses to run swap stages without a valid
record for the source identity. Every output carries a watermark payload.

## Repo layout

```
src/realx/
  types.py          Frame, Face, FrameContext
  pipeline.py       Pipeline + stream runner
  stages/           Stage protocol, registry, built-in stages
  runtime/          execution provider selection
  safety/           consent, watermark
  cli.py            `realx providers | selftest`
docs/               research, license audit, architecture, roadmap, safety
tests/
```
