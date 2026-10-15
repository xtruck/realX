# What realX can learn from FaceFusion (study, 2026-10-15)

Source read: the public repository `facefusion/facefusion` (default branch `master`, last push 2026-10-09, about 30,000
stars) through the GitHub API: the file list, the README and five modules (`execution.py`, `inference_manager.py`,
`content_analyser.py`, `benchmarker.py`, `face_tracker.py`). Only the first 90 lines of each module were read. REA was
not used: its web tools inspect a page open in a debug Chrome, which would show GitHub's interface, not the code.

## Licence: study only, copy nothing

The code is under **OpenRAIL-AS** ("Copyright (c) 2026 Henry Ruhs"). GitHub reports it as `NOASSERTION`: it is not an
OSI permissive licence and it carries use restrictions. realX's rule is permissive licences only, so **no FaceFusion code
goes into realX**. Ideas and designs are free to learn from; every idea below is to be written again from scratch.
Its face-swap models are a separate matter and stay blocked (`inswapper_128`, `buffalo_l` family; see `LICENSE-AUDIT.md`).

## Ideas worth taking

| # | What FaceFusion does | What it would give realX | Status |
|---|---|---|---|
| 1 | `execution.py` builds a per-provider option list (CUDA, TensorRT, **DirectML**, ROCm, CoreML, ...) in a fixed preference order and reports which are really available | The work laptop has an Intel UHD 620 and ONNX Runtime shows only `Azure` + `CPU`. DirectML runs on any Windows GPU, integrated ones included. `onnxruntime-directml` is a different pip package from `onnxruntime`. It could speed up the YuNet / PP-HumanSeg stages. **Not measured, may be slower on a UHD 620.** | To test: install it in a throwaway venv, run `realx bench` before and after, keep only if it wins |
| 2 | `content_analyser.py` runs a small NSFW classifier (three models, each tagged with vendor and licence in code: Apache-2.0, Apache-2.0, MIT; hashes pinned) | A content filter on what realX publishes, in line with `SAFETY.md`. The licences above are the code's own claim: verify each model card before adding anything | Idea; nothing downloaded |
| 3 | `benchmarker.py` has **cold** and **warm** modes (caches cleared between cycles or not), several cycles, and reports average / fastest / slowest / relative fps | `realx bench` could separate first-run cost from steady state, which matters on a 7.8 GB laptop | Small change, not done |
| 4 | `inference_manager.py` keys loaded sessions by (module, models, device, providers) and shares them between the CLI and the UI | realX already has an ONNX session cache; this confirms the key should include the provider list so a provider change never reuses a stale session | Check `runtime.py` |
| 5 | `face_tracker.py` links faces across frames by bounding-box overlap and **refills gaps** in a track | realX's tracker avoids id switches already; gap refilling (interpolating a missed frame) could help offline clips | Idea |
| 6 | Each processor is a folder with `core`, `choices`, `locales`, `types` | Same spirit as realX stages; nothing to change | None |
| 7 | A job queue (draft, queued, failed, completed) for batch work | realX is live, not batch; skip | None |

## What not to do

* Do not copy code, constants or model lists from the repository.
* Do not enable any swap or enhancer model from it: licences are non-commercial or unclear.
* The README calls it a "face manipulation platform"; realX keeps its own rules: consent gate, visible disclosure,
  watermark order, no passing a person off as someone real.

## Next step if wanted

Idea 1 is the only one that may change speed on this hardware. A measured A/B (`onnxruntime` vs `onnxruntime-directml`,
same `realx bench` command, idle machine) would settle it in about ten minutes.
