# Portrait animation: license review and decision

Reviewed 2026-10-14 from primary sources (repository files, model cards, the paper). Not legal advice:
have a lawyer read the original texts before any commercial release. No weights were downloaded.

## Decision

**No portrait-animation engine is enabled.** The stage, the consent binding and the safety ordering are
built and tested (below), but every engine reviewed is blocked or unverified, so using the stage without
an engine raises `PortraitUnavailable`. The only engine that runs is a labelled test-only image warp.

## What was found

### LivePortrait (KwaiVGI), the engine the brief names

| Finding | Source and exact words |
|---|---|
| The code is MIT | `LICENSE`: "MIT License / Copyright (c) 2024 Kuaishou Visual Generation and Interaction Center" (https://github.com/KwaiVGI/LivePortrait/blob/main/LICENSE) |
| **The same file adds a commercial restriction** | Appended after the MIT text: "The models of InsightFace are for non-commercial research purposes only. If you want to use the LivePortrait project for commercial purposes, you should remove and replace InsightFace's detection models to fully comply with the MIT license." GitHub's own license detector reports the repo as `NOASSERTION` ("Other") because of it. |
| The default human path runs InsightFace `buffalo_l` | `src/utils/cropper.py` builds `FaceAnalysisDIY(name="buffalo_l", root=self.crop_cfg.insightface_root)` (https://github.com/KwaiVGI/LivePortrait/blob/main/src/utils/cropper.py) |
| The official weights bundle ships those files | Hugging Face `KlingTeam/LivePortrait` lists `insightface/models/buffalo_l/det_10g.onnx` and `insightface/models/buffalo_l/2d106det.onnx` next to the LivePortrait weights, and the GitHub readme's download command (`huggingface-cli download KlingTeam/LivePortrait --local-dir pretrained_weights --exclude "*.git*" "README.md" "docs"`) fetches all of it. The card says `license: mit` for all of it (https://huggingface.co/KlingTeam/LivePortrait). A blanket card label does not override InsightFace's own terms. |
| Animals mode needs X-Pose | README: "X-Pose ... required by Animals mode"; the bundle contains `liveportrait_animals/xpose.pth`. X-Pose's GitHub license detection is `NOASSERTION` (https://github.com/IDEA-Research/X-Pose). Not used here. |
| The weights' training data is not cleared | The paper: "We leverage public video datasets such as Voxceleb, MEAD, and RAVDESS, as well as the styled image dataset AAHQ ... we collect a large corpus of 4K-resolution portrait videos ... 200 hours of talking head videos, and utilize the private LightStage dataset" (https://arxiv.org/abs/2407.03168). RAVDESS is **CC BY-NC-SA 4.0** per its Zenodo record (https://zenodo.org/records/1188976). MEAD's project page states no license; VoxCeleb's terms were not checked. Whether non-commercial training data restricts the trained weights is a legal question this review cannot settle, so the weights are **unverified**, not cleared. |

### InsightFace

- README "License": "The code of InsightFace is released under the MIT License. There is no limitation for both academic
  and commercial usage. The training data containing the annotation (and the models trained with these data) are available
  for non-commercial research purposes only. Both manual-downloading models from our github repo and auto-downloading
  models with our python-library follow the above license policy (which is for non-commercial research purposes only)."
  (https://github.com/deepinsight/insightface)
- Python package README: "The pretrained models provided with this library are for non-commercial research only, whether
  downloaded automatically or manually." (https://github.com/deepinsight/insightface/blob/master/python-package/README.md)
- The repo already blocks `buffalo_l` and `inswapper_128` for this reason. The two `buffalo_l` files inside the LivePortrait
  bundle (`det_10g.onnx`, `2d106det.onnx`) are the same models.

### The MediaPipe route (a community fork)

- `kijai/ComfyUI-LivePortraitKJ` (code: MIT) says: "Added MediaPipe as alternative to Insightface, everything should now be
  covered under MIT and Apache-2.0 licenses when using it." and "Insightface is strictly for NON-COMMERCIAL use."
  (https://github.com/kijai/ComfyUI-LivePortraitKJ)
- That removes the InsightFace detector, and MediaPipe's own models are Apache-2.0 (verified for the three bundles realX
  already uses; see `LICENSE-AUDIT.md`). It is the fork author's statement, not an independent verification.
- The LivePortrait networks are still there, as converted copies in `Kijai/LivePortrait_safetensors`. That repo declares
  **no license**, contains no InsightFace files, and also holds a `landmark_model.pth` whose provenance is not documented
  (https://huggingface.co/Kijai/LivePortrait_safetensors). The training-data question above is unchanged.

## Verdicts

| Component | Verdict | Why |
|---|---|---|
| LivePortrait source code (MIT) | usable as code | nothing is vendored; attribution required if any is ever copied |
| InsightFace `buffalo_l` (`det_10g.onnx`, `2d106det.onnx`) | **blocked** | non-commercial research only; already on the blocked list |
| LivePortrait human weights (`liveportrait/base_models/*.pth`, retargeting module) | **unverified** (blocked as `liveportrait`) | declared MIT, but training data includes a non-commercial dataset and a private one; official bundle also pulls InsightFace |
| `liveportrait/landmark.onnx`, `landmark_model.pth` | **unverified** | training data and provenance not documented |
| Animals mode, `xpose` | **blocked** (`liveportrait_animals`, `xpose`) | X-Pose has no stated license |
| MediaPipe face detector (Apache-2.0) | usable | same verified bundles as the face tracking |
| `Kijai/LivePortrait_safetensors` conversions | **unverified** | no declared license |

No second engine was evaluated: none could be verified from primary sources within this review, and an unverified
engine is not an alternative.

## What is enabled today

Nothing. `ensure_model("liveportrait")`, `ensure_model("liveportrait_animals")` and `ensure_model("xpose")` raise
`ModelError`, as do `inswapper_128` and `buffalo_l`; `tests/test_model_licenses.py` checks the whole manifest.

## What would have to be true to enable an engine

1. Its code, every weight file and every auxiliary model have a license that allows the intended use, read from the
   original file or model card (not from a mirror or a wrapper's summary), recorded in `LICENSE-AUDIT.md`.
2. Training-data terms are cleared for the weights, or the weights are trained by us on data we may use.
3. Each model file is pinned by sha256 in `MANIFEST` with a `purpose` that says "portrait animation", and is fetched
   only by an explicit `realx models fetch`. The engine registry refuses anything else.
4. It runs behind the stage below unchanged: consent bound to the image, gate, animation, visible label, watermark.
5. **Measured** performance: frames per second and latency per frame, at the stream resolution, on the target hardware
   and execution provider, from a repeatable benchmark with the hardware and conditions written down. Until that
   exists the feature must not be called real-time, and no frame rate is quoted here because none was measured.

## What exists in the code

| Piece | File |
|---|---|
| Stage `portrait_animate` (declares `requires_consent`, `uses_likeness`, `alters_media`, `stateful`) | `src/realx/stages/portrait.py` |
| Engine protocol and registry; an engine must name a verified manifest model listed for portrait animation; blocked, unlisted or unpinned models are refused | same |
| Test-only `synthetic_warp`: a shift, tilt and zoom of the still, not a neural model; runs only with `REALX_ALLOW_TEST_ENGINES=1`, never listed | same |
| Consent bound to the exact image: scope `portrait:<sha256 of the bytes>`, signed, expiring, revocable; issuing needs an explicit attestation; checked on every frame | `src/realx/safety/portrait_consent.py` |
| Image checks before decoding (size, PNG/JPEG header, pixel count); memory only, never written or logged | `decode_portrait` |
| Blocked entries with their reasons | `src/realx/models.py` (`BLOCKED`) |
| Ordering enforced by the pipeline: gate, then animation, then the DIGITAL HOST label, then the watermark; nothing may paint over the label | `realx.pipeline.validate_stages`, tests in `tests/test_portrait.py` |

Limit: the attestation at issue time is the user's own statement. realX cannot check that a portrait is theirs or that
the person agreed, which is why output is always labelled and watermarked, and why consent can be revoked and expires.
