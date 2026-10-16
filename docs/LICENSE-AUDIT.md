# License audit (working document)

Not legal advice. Have a lawyer review before any commercial release.

## Rules for this repo

1. **Clean room.** We read other projects for ideas. We copy no code from GPL, AGPL,
   OpenRAIL or non-commercial repos.
2. **Models are separate from code.** Every model file needs an entry in the table below
   before it can ship in a product build.
3. **Anything marked `blocked` must not be bundled, downloaded by default or required.**

## Code

| Source | License | Use |
|---|---|---|
| Deep-Live-Cam | AGPL-3.0 | ideas only |
| DeepFaceLive | GPL-3.0 | ideas only |
| faceswap | GPL-3.0 | ideas only |
| ComfyUI-ReActor | GPL-3.0 | ideas only |
| FaceFusion | OpenRAIL-AS (custom, behavioral restrictions) | ideas only |
| SimSwap | custom, academic/non-commercial | ideas only |
| VisoMaster | GPL-3.0 | ideas only |
| DeepFaceLab | GPL-3.0 | ideas only |
| vtubing | MIT | may reuse with attribution (CPU avatar pipeline) |
| webatar | no license file found | ideas only until confirmed |
| MediaPipe (tasks-vision) | Apache-2.0 | allowed, check each model card |
| VRM / three-vrm | MIT-style | allowed; check each avatar's own license (e.g. CC0) |
| ghost | Apache-2.0 | may reuse with attribution, review model weights separately |
| Real-ESRGAN | BSD-3-Clause | may reuse with attribution |
| ONNX Runtime, FFmpeg (LGPL build), WebRTC | permissive / LGPL | allowed as dependencies |

## Models

| Model | Source | Commercial use | Status |
|---|---|---|---|
| inswapper_128 | InsightFace | non-commercial only | **blocked** unless licensed from InsightFace |
| buffalo_l (detector/embedder) | InsightFace | non-commercial only | **blocked** unless licensed |
| LivePortrait (KwaiVGI), official bundle | code MIT; its `LICENSE` adds that InsightFace models are non-commercial and must be replaced for commercial use; default path runs `buffalo_l` | no, by default | **blocked** (`liveportrait`), see `PORTRAIT.md` |
| LivePortrait's own weights | training data includes RAVDESS (CC BY-NC-SA 4.0 per Zenodo) and a private dataset | unverified | **blocked** until verified |
| LivePortrait MediaPipe-based fork and its converted weights | fork code MIT; weights repo declares no license; "MIT and Apache-2.0" is the fork author's own claim | unverified | **blocked** until a license is stated |
| X-Pose (used for animals) | no stated license (GitHub reports NOASSERTION) | no | **blocked** (`xpose`) |
| GFPGAN weights | TencentARC | verify | pending |
| CodeFormer weights | S-Lab | non-commercial (verify) | pending, assume blocked |
| ghost / SberSwap weights | ai-forever | verify | pending |
| Real-ESRGAN weights | xinntao | BSD-3 (verify per weight) | pending |
| Own trained models | us | ours | planned (path B) |

## Decision pending

- **Path A:** license InsightFace models commercially and build around them.
- **Path B:** train our own swap, detection and restoration models (needs GPU budget and
  a consented dataset).
- The codebase is model-agnostic (see ARCHITECTURE.md), so both paths stay open.

## Models currently in use

| Model | License | Commercial use | Notes |
|---|---|---|---|
| YuNet face detector (opencv_zoo) | MIT | yes | pinned by sha256 in `realx/models.py` |

| PP-HumanSeg 2023mar (opencv_zoo, from PaddleSeg) | Apache-2.0 | yes | pinned by sha256; person cut-out for background replacement only |
| three.js 0.178.0 | MIT | yes | bundled into `web/avatar.bundle.js` (built from `webapp/`) |
| @pixiv/three-vrm 3.4.2 | MIT | yes | bundled, same file |
| @mediapipe/tasks-vision 0.10.21 (JS) | Apache-2.0 | yes | bundled into `web/avatar.bundle.js`; npm package license field checked |
| MediaPipe WASM runtime (`web/mp/wasm`, same release) | Apache-2.0 | yes | vendored; the `.wasm` is byte-identical to the npm package, the loader `.js` is identical once CRLF is normalised (Windows `core.autocrlf` rewrites it) |
| MediaPipe Face Landmarker bundle `face_landmarker.task` (BlazeFace short range, Face Mesh V2, Blendshape V2) | Apache-2.0 | yes | sha256 pinned in `models.py` (`mp_face`); each model card states "Licensed under Apache License, Version 2.0" |
| MediaPipe Pose Landmarker lite `pose_landmarker_lite.task` (BlazePose GHUM 3D) | Apache-2.0 | yes | pinned (`mp_pose`); card "Model Card BlazePose GHUM 3D" states Apache 2.0 |
| MediaPipe Hand Landmarker `hand_landmarker.task` | Apache-2.0 | yes | pinned (`mp_hand`); card "Hand Tracking (Lite_Full) with Fairness" states Apache 2.0 |
| MediaPipe Image Segmenter `selfie_multiclass_256x256.tflite` (float32) | Apache-2.0 (per Google's model card; **the card itself was not re-read when this row was added: check it before shipping**) | yes | pinned (`mp_segmenter`, sha256 `c6748b12...`); used only on the user's own photo, face-mesh page |

How the MediaPipe licenses were checked (2026-10-14): the Google docs pages for the three
landmarkers state no license for the model files (only CC-BY for the page and Apache for the code
samples), and the `.task` bundles carry no license metadata. The license is therefore taken from the
model cards linked in the "Model Card" column of each docs page
(`storage.googleapis.com/mediapipe-assets/...pdf`): all five read "Licensed under Apache License,
Version 2.0". Re-check the cards before adding any other MediaPipe model, or switching to the full or
heavy pose bundles.

The camera picture is processed by these models inside the user's browser and is not uploaded. The
server only serves the model files, after checking their pinned sha256.
| Pip (original character) | CC0-1.0 | yes | generated by `scripts/make_character.py`; not based on any real person or existing character |

Voice processing is pure DSP (no model). The demo footage uses the public-domain NASA
portrait from scikit-image, only in tests and the demo scene.

### Object detectors considered for showing a held object (checked 2026-10-16)

| Model | License evidence | Commercial use | Status |
|---|---|---|---|
| MediaPipe Object Detector, EfficientDet-Lite0 (`efficientdet_lite0.tflite`) | the MediaPipe docs page states no licence for the weights (only for the page and the code samples); only a third-party package claims Apache-2.0; no model card found; trained on COCO | unverified | **not adopted** (2026-10-16): checked the docs page, the Kaggle listing (did not render) and MediaPipe's model list; needs a primary-source licence statement first |
| OpenCV Zoo NanoDet-Plus and YOLOX (`object_detection_nanodet`, `object_detection_yolox`) | the directory README says "All files in this directory are licensed under Apache 2.0 License" (LICENSE file present); both trained on COCO | yes, on the licence | **not adopted**: they are ONNX models, and running them in the page needs the camera pixels in JavaScript, which the page's no-read-back rule forbids (docs/FACEMESH.md) |

### Identity and matting models named in the CPU research report (checked 2026-10-16)

| Model | License evidence | Commercial use | Status |
|---|---|---|---|
| GHOST 1.x (`ai-forever/ghost`, one-shot face swap) | GitHub reports Apache-2.0 for the repo. A maintainer wrote in issue #88 (2024-01-15): "The model license is Apache 2.0. Commercial use is permitted". The same thread then asks two things that **have no maintainer answer**: the repo contains **CC BY-NC-SA 4.0** code, and whether the **ArcFace** identity model (from InsightFace, non-commercial) can be used commercially. The README trains on VGGFace2 (that dataset's terms were not checked) | unverified | **not adopted**: one comment is not a licence audit, and the open questions are exactly the commercial ones |
| GHOST 2.0 (`ai-forever/ghost-2.0`, whole-head swap) | GitHub reports Apache-2.0 for the repo; the weight files were not inspected | unverified | **not adopted** until each weight file and its encoder dependencies are checked |
| Robust Video Matting | GPL-3.0 code; weight terms not stated in the report | no, for this repo's policy | **not adopted** (PP-HumanSeg is the licence-clean matting model already in use) |
| DeepFaceLive / DeepFaceLab | GPL-3.0 (archived 2024-11) | ideas only | per-identity training can be re-implemented from the idea; no code copied |

## Repo hygiene

- This repo is **public** by the owner's choice. Never commit models, keys or media.
- Add an explicit LICENSE once the model path is decided.
