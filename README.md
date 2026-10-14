# realX

Real-time face synthesis pipeline with **consent, watermark and provenance built in**.

Status: **M0 foundation**. Architecture, license audit and a tested pipeline core.
No swap models are bundled yet (see `docs/LICENSE-AUDIT.md`).

## Why

Existing tools (Deep-Live-Cam, FaceFusion, DeepFaceLive) are strong demos but are
GPL/AGPL/non-commercial, hard to install, and treat safety as an afterthought. realX is a
clean-room design that combines their best ideas:

- stage-graph pipeline (DeepFaceLive, FaceFusion processors)
- runtime provider fallback TensorRT > CUDA > DirectML > OpenVINO > CoreML > CPU
- latency-bounded streaming that drops frames instead of lagging
- per-track temporal smoothing against flicker
- signed consent gate and provenance watermark as pipeline stages

## Quick start

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -e ".[dev]"
.\.venv\Scripts\python -m pytest
.\.venv\Scripts\realx providers
.\.venv\Scripts\realx selftest
```

## Docs

- [Research](docs/RESEARCH.md): what the field does well and the ideas we combine
- [Architecture](docs/ARCHITECTURE.md)
- [License audit](docs/LICENSE-AUDIT.md)
- [Safety](docs/SAFETY.md)
- [Roadmap](docs/ROADMAP.md)
