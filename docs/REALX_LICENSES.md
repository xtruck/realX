# realX licence register (2026-10-20)

Not legal advice. This page is the short register: what ships or is fetched, what is blocked, and **what a human still has to
check**. The evidence (quotes, links, dates checked) stays in `LICENSE-AUDIT.md` and, for the photoreal options, `PHOTOREAL-NEXT.md`;
this page does not repeat it. "Checked here" means read from the installed package or the repository on 2026-10-20; anything else is
marked as not checked.

## 1. Models realX fetches (`realx models fetch`, SHA-256 pinned in `src/realx/models.py`)

| Model | Used by | Licence | Evidence | Human check still needed |
|---|---|---|---|---|
| YuNet `face_detection_yunet_2023mar.onnx` | Python face boxes | MIT | opencv_zoo, `LICENSE-AUDIT.md` | no |
| PP-HumanSeg 2023mar | Python background | Apache-2.0 | opencv_zoo, `LICENSE-AUDIT.md` | no |
| MediaPipe `face_landmarker.task` | browser, all pages | Apache-2.0 | model cards read 2026-10-14 | no |
| MediaPipe `pose_landmarker_lite.task` | browser | Apache-2.0 | model card read 2026-10-14 | no |
| MediaPipe `hand_landmarker.task` | browser | Apache-2.0 | model card read 2026-10-14 | no |
| MediaPipe `selfie_multiclass_256x256.tflite` | face-mesh page (photo masks, and the live S13c pass) | Apache-2.0 | model card "Model Card Multiclass Segmentation" (May 10, 2023) re-read 2026-10-20: "LICENSED UNDER Apache License, Version 2.0" | no |

## 2. Blocked (cannot be fetched or loaded; `tests/test_model_licenses.py`)

| Model | Why |
|---|---|
| `inswapper_128` (InsightFace) | non-commercial only. Never to be used commercially; not bundled, not downloadable |
| `buffalo_l` (InsightFace) | non-commercial only |
| `liveportrait`, `liveportrait_animals` | default path needs `buffalo_l`; own weights' training data includes CC BY-NC-SA material; fork weights carry no licence |
| `xpose` | no licence stated (GitHub: NOASSERTION) |

Not adopted after review (not in the code): GHOST 1.x and 2.0 (open questions on CC BY-NC-SA code and the InsightFace ArcFace model),
Robust Video Matting (GPL-3.0), GFPGAN / CodeFormer / Real-ESRGAN weights (pending, CodeFormer assumed non-commercial), EfficientDet-Lite0
(no primary-source licence), NanoDet / YOLOX (licence fine, but would need camera pixels in JavaScript), Inria 3DGS, GaussianAvatars, VHAP,
FLAME (non-commercial; `PHOTOREAL-NEXT.md`).

## 3. Code dependencies

| Package | Version | Licence | Source of the licence | Ships to users? |
|---|---|---|---|---|
| numpy | 2.5.4 (test env) | BSD-3-Clause | not shown by `pip show` here; **not checked here** | yes (required) |
| opencv-python-headless | 5.0.0.93 | Apache-2.0 | `pip show` | `video` extra |
| onnxruntime | 1.31.0 | MIT | `pip show` | `onnx` extra; no stage uses it today |
| three | 0.178.0 | MIT | `package.json`, checked here | bundled |
| @pixiv/three-vrm | 3.4.2 | MIT | `package.json`, checked here | bundled |
| @mediapipe/tasks-vision (+ vendored WASM) | 0.10.21 | Apache-2.0 | `package.json`, checked here | bundled / vendored |
| onnxruntime-web | - | MIT | `package.json`, checked here | **removed 2026-10-20** (no page used it) |
| esbuild | 0.25.5 | MIT | `package.json`, checked here | build only |
| pytest, scikit-image, playwright | dev / browser extras | MIT / BSD-3 / Apache-2.0 | general knowledge, **not checked here** | tests only |
| pyvirtualcam | - | GPL-2.0 | `LICENSE-AUDIT.md` | **excluded** |

## 4. Assets

| Asset | Licence | Note |
|---|---|---|
| Pip character (`scripts/make_character.py`) | CC0-1.0 | original, generated |
| NASA astronaut portrait (scikit-image `data.astronaut`) | public domain | tests and the demo scene only |
| Pexels test photos (`CPU-STATUS.md`) | Pexels licence | kept in the owner's Downloads, **never committed** |

## 5. Open points for a human

1. **The repository has no `LICENSE` file.** `webapp/package.json` says MIT, `pyproject.toml` declares no licence. The owner has to pick
   the product licence (listed as a blocking decision in `ROADMAP.md`).
2. ~~Read the selfie multiclass model card~~ done 2026-10-20: Apache-2.0 (row 1.6).
3. `LICENSE-AUDIT.md` "Code" table listed GHOST as "may reuse with attribution" while its own model section says "not adopted, unverified".
   Corrected on 2026-10-20 to "ideas only until the open licence questions are answered" (see that file).
4. Any commercial use: lawyer review of the whole table (the audit file says the same).
