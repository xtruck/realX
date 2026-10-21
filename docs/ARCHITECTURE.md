# Architecture

> **Status banner (docs audit A5, 2026-10-21).** Everything on this page is the long-term target, not the design in use. **Built**
> (registered stages in `src/realx/stages/` and `src/realx/audio/stages.py`): `detect_yunet`, `track`, `smooth`, `one_euro`,
> `consent_gate`, `swap_stub` (a stub, not a swap), `disclosure`, `watermark`, `bg_replace`, `portrait_animate` (no engine enabled),
> `avatar`, `rig`, the `voice_*` stages and `audio_watermark`; the consent-before and watermark-after build check; signed consent; the
> MJPEG preview and the OBS Browser Source; provider selection with a session cache (`src/realx/runtime/providers.py`).
> **Aspirational, not built:** the GPU backend and the WebRTC link in the topology diagram (no WebRTC code exists), real ONNX
> swap and `restore` models (license-blocked), the `source`, `align`, `mask` and `composite` stages as listed (no such registered
> stage), a virtual camera sink, auto quality, device buffers. The live photo path today is the browser: the `/avatar` and `/facemesh`
> pages track and draw in WebGL. Read `REALX_ARCHITECTURE.md` for the code as it is, `REALX_ROADMAP.md` for priorities,
> `REALX_BENCHMARKS.md` for measurements and `REALX_AUDIT.md` for open findings. Nothing below was deleted.

> This page is the long-term target design. For what the code on `main` actually does, see `REALX_ARCHITECTURE.md` (2026-10-20).

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
