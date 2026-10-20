# Photoreal: what comes after the mesh compositor (Stage 4 decision document)

Decision document only: no code. Written 2026-10-20. Licences were read from the original files that day (section 5).

**What this document is missing.** Stage 3 has not been run. The owner's Stage 2 checklist results
(`scripts/facemesh_baseline.md`) and the before/after Stage 3 screenshots and fps do not exist yet. Everything below that
depends on them is marked **pending Stage 3**. No quality statement here was measured on a real webcam; where a statement is an
expectation, it says so. Fill in section 2 and re-check the recommendation when the Stage 3 results arrive.

## 1. The three options in one table

| | 1. Stay with the mesh compositor | 2. Per-identity model, remote GPU | 3. Gaussian-splat head from a short video |
|---|---|---|---|
| What it is | The photo wrapped on MediaPipe's 468-point mesh in WebGL (today's `/facemesh`), improved step by step | A neural network trained only on consented video of one identity, run per frame on a rented GPU | A 3D point-cloud ("splat") model of the head, captured once from a video, rendered in the browser and driven by the live head pose |
| Expected quality (not measured) | Good front-on; side views stretch, no inner mouth or eye openings, the face shape stays the user's | The best realism of the three if the training data covers the angles, expressions and light; DeepFaceLab-style results need much data and training | Very convincing from any angle while the face is neutral; expressions are frozen unless a rig is built (see 4) |
| Hardware | The target laptop (UHD 620); measured 8 to 28 fps depending on features and load (`BENCHMARKS.md` section 9) | An NVIDIA GPU for training (remote or borrowed) and a remote GPU for every live frame | An NVIDIA GPU once for the capture (the trainers below need CUDA); rendering on the laptop's GPU in the browser, fps on UHD 620 **unknown** |
| Licence-clean today? | Yes (MediaPipe Apache-2.0, three.js MIT) | Only if written by us: every ready-made implementation found is GPL-3.0 (ideas only here) | Only with one specific stack (gsplat + an MIT renderer + our own rig); the well-known head-avatar code is non-commercial |
| Rule changes needed | None | Large: camera pixels would leave the page and the computer (FACEMESH.md and REMOTE.md both forbid it today) | Medium: one upload of a consented capture video for training; the live path can stay local |
| Biggest unknown | How much Stage 3 fixes | Round-trip latency and cost per hour; data needed | Splat render speed on UHD 620; how to animate it without FLAME |

## 2. Option 1: stay with the mesh compositor

**Quality.** The renderer stretches one flat photo between 468 points, so it cannot show what the photo does not contain
(the far side of the face, the inside of the mouth, open eyes in a closed-eye photo). Known artefacts: side-view stretch,
pale patches near the mouth and glasses (`FACEMESH.md`). Stage 3 fixes the top-ranked defect behind an option.
**Pending Stage 3:** which defect was fixed, the before/after severity per checklist item, the fps change, and whether the
20 fps gate held.

**Hardware.** The target laptop. Measured on its UHD 620 with the real GPU: 14.5 to 27.8 fps for "face only" across runs on
a loaded machine (`BENCHMARKS.md` section 9). No clean idle run exists yet.

**Licences.** Nothing new. The stack is MediaPipe and three.js (section 5, rows 1 and 2), already in `LICENSE-AUDIT.md`.

**REMOTE.md.** No change.

**Consent and label.** Unchanged: per-photo signed consent bound to the photo's hash, the "Virtual face" label guarded in the
page. The label is still not burned into the pixels (S7), so it must be before any virtual camera or recording.

## 3. Option 2: a per-identity model trained on consented data, run on a remote GPU

**What it would be.** An encoder-decoder trained only on video of the consented identity (DeepFaceLab's idea: one model per
person, no general swap model and no third-party identity weights). At run time the live face crop goes in and the
identity's face comes out, then it is composited onto the frame.

**Quality (expectation, not measured).** The realism ceiling is the highest of the three because the network learns the
person's real mouth, teeth, eyes and skin from video. It needs training video that covers the angles, expressions and lights
it will see. It fails where the data is thin (extreme angles, a new lighting set-up) and it has to be retrained per identity.

**Hardware.** An NVIDIA GPU for training (hours to days per identity; not measured here) and a GPU for inference on every live
frame. The laptop cannot run either. Remote inference adds a network round trip to every frame. That latency budget is
**unmeasured**, and it is the first thing to measure (section 7).

**Licences (section 5).** Every ready-made implementation found is GPL-3.0: DeepFaceLab and DeepFaceLive, already "ideas only"
in `LICENSE-AUDIT.md`. A licence-clean version must be written from the idea, on permissive pieces:
- PyTorch for training: BSD-style.
- ONNX Runtime for inference: MIT.
- MediaPipe for face crops and alignment: Apache-2.0.
- LPIPS code for a perceptual loss: BSD-2-Clause. LPIPS builds on ImageNet-trained backbones, whose weights torchvision says
  "may have their own licenses or terms and conditions derived from the dataset used for training". So **any pretrained
  backbone in the loss is unverified**. The clean choice is a loss with no pretrained network, or one trained by us.

**REMOTE.md: what must change.** Today it allows only the head-rig numbers and says "Camera frames, portrait images, landmarks,
track ids and any text cannot be passed in". Option 2 needs a new written decision covering:
- **Provider and retention:** the named provider, its retention and deletion terms, and zero retention of frames.
- **What is sent and how big:** a face crop per frame, not a whole frame. The current bounds are request ≤ 2 KiB and
  response ≤ 4 KiB; video needs new bounds, chosen and tested.
- **Opt-in:** a per-session opt-in that shows on screen while frames are being sent.
- **No silent fallback:** on network loss the output degrades to the local result within one second, and the label and
  watermark stay (MISSION item 7).
- **Transport:** TLS verification, proxies and redirects as already listed in REMOTE.md.
- **Proof:** a test that captures the real request bytes.

**The camera rule.** The page never reads camera pixels back (`FACEMESH.md`, "Privacy rules"). Sending a crop needs that read-back,
so option 2 also needs a **new reviewed exception to the camera rule**, not only a REMOTE.md change. That is the largest rule
change of the three options.

**Consent and label.**
- **Training video:** each clip needs its own consent record bound to its hash.
- **The trained weights:** they are themselves a likeness of the person, so they need a consent record bound to the weight
  file's hash, with revocation that deletes them at the provider, and confirmation that they are gone.
- **Output:** it is produced off the machine, so the "Virtual face" label must be burned into the returned pixels (S7). The
  watermark is applied after it, locally, so a provider cannot strip it.

## 4. Option 3: a Gaussian-splat head captured from a short video of the user

**What it would be.** Record a short consented video moving the head slowly through angles, then train a splat model of the
head once. In the browser, the model is rendered at the live head pose from MediaPipe and composited over the live face.

**Quality (expectation, not measured).**
- **Strengths:** a splat model is captured from many angles, so side views do not stretch. This is exactly where option 1 is
  weakest.
- **Weakness:** a plain splat model is rigid. It holds one expression, the one in the capture. Talking, smiling and blinking
  need either a driving face model or live-pixel compositing for the mouth and eyes, as the mesh compositor does today.
- **The common driving model is out:** FLAME is licensed for "non-commercial scientific research" only (section 5).
- **Hair and lighting:** hair is a strength of splats. Lighting is baked into the capture, so a different room will not match.

**Hardware.**
- **Capture:** training needs an NVIDIA GPU with CUDA (gsplat and Inria's code are CUDA). It is done once per capture.
- **Live rendering:** in the browser with WebGL. The renderers below are MIT. Splat counts in the 100k range are typical.
  **Whether UHD 620 renders that at 20 fps next to MediaPipe is unknown.** It is the first measurement (section 7) and needs
  no capture of anyone.

**Licences (section 5).**
- **Non-commercial, so not usable here:** Inria's original `gaussian-splatting` and the head-avatar projects built on it
  (GaussianAvatars, its tracker VHAP), plus the FLAME model they drive.
- **The clean stack:**
  - `gsplat` for training (Apache-2.0). Whether any of its files derive from Inria's code was **not checked**, so it is
    unverified until someone reads its source headers.
  - `GaussianSplats3D` or `antimatter15/splat` for rendering (MIT).
  - Our own rig driven by MediaPipe's landmarks and blendshapes (Apache-2.0).

**REMOTE.md: what must change.** If training is remote, there is one upload: the consented capture video. REMOTE.md already
says a portrait upload "would need its own explicit, per-image opt-in and consent record". This extends that to one video
per capture, plus:
- the provider's retention terms;
- deletion of the video and of any intermediate files after training;
- a download of the finished model as the only thing that comes back.

The live path sends nothing new: rendering is local and the rig numbers stay as they are.

**Consent and label.**
- **Capture video:** it needs a consent record bound to its hash.
- **The splat file:** it is a full 3D likeness that can be rendered from any angle without the person present, which is more
  open to misuse than a single photo. So it also needs its own consent record bound to the file's hash, with expiry and
  revocation, kept on this computer only (never in the repo, never served to other origins).
- **On screen:** the "Virtual face" label and its guard apply as on `/facemesh`. Burning the label into pixels (S7) is still
  required before any virtual camera.

## 5. Licence evidence (original files, read 2026-10-20)

Fetched from each project's default branch on GitHub (raw files), or from the project's own site where stated. Quotes are
exact. "Unverified" means a question the file itself does not settle.

| # | Component (repository) | File | Exact words | Use here |
|---|---|---|---|---|
| 1 | MediaPipe (`google-ai-edge/mediapipe`) | `LICENSE` | "Apache License Version 2.0, January 2004" | yes (already in use; model cards checked in `LICENSE-AUDIT.md`) |
| 2 | three.js (`mrdoob/three.js`) | `LICENSE` | "The MIT License ... Permission is hereby granted, free of charge" | yes (already in use) |
| 3 | DeepFaceLab (`iperov/DeepFaceLab`) | `LICENSE` | "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007" | ideas only (repo rule 1) |
| 4 | DeepFaceLive (`iperov/DeepFaceLive`) | `LICENSE` | "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007" | ideas only |
| 5 | PyTorch (`pytorch/pytorch`) | `LICENSE` | "Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met" | yes, as a dependency |
| 6 | ONNX Runtime (`microsoft/onnxruntime`) | `LICENSE` | "MIT License ... Permission is hereby granted, free of charge" | yes (already allowed) |
| 7 | LPIPS code (`richzhang/PerceptualSimilarity`) | `LICENSE` | "Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met" | code yes; **the pretrained backbones it relies on are unverified** (row 8) |
| 8 | torchvision pretrained weights (`pytorch/vision`) | `README.md`, "Pre-trained Model License" | "The pre-trained models provided in this library may have their own licenses or terms and conditions derived from the dataset used for training. It is your responsibility to determine whether you have permission to use the models for your use case." | **unverified**: do not depend on them |
| 9 | 3D Gaussian Splatting (`graphdeco-inria/gaussian-splatting`) | `LICENSE.md` | "The *Software* may be used "non-commercially", i.e., for research and/or evaluation purposes only." and "THE USER CANNOT USE, EXPLOIT OR DISTRIBUTE THE *SOFTWARE* FOR COMMERCIAL PURPOSES WITHOUT PRIOR AND EXPLICIT CONSENT OF LICENSORS." | **no** (non-commercial; ideas only) |
| 10 | GaussianAvatars (`ShenhanQian/GaussianAvatars`) | `LICENSE.md` and `README.md` | "Attribution-NonCommercial-ShareAlike 4.0 International"; README: "Any commercial use, reproduction, disclosure or distribution of this software and related documentation without an express license agreement from Toyota Motor Europe NV/SA is strictly prohibited." and "This project uses Gaussian Splatting, which carries its original license" | **no** |
| 11 | VHAP tracker (`ShenhanQian/VHAP`) | `LICENSE` | "Attribution-NonCommercial-ShareAlike 4.0 International" | **no** |
| 12 | FLAME head model (Max Planck, flame.is.tue.mpg.de) | model licence page | "Software Copyright License for non-commercial scientific research purposes" and "Any other use, in particular any use for commercial, pornographic, military, or surveillance, purposes is prohibited." | **no** |
| 13 | gsplat (`nerfstudio-project/gsplat`) | `LICENSE` | "Apache License Version 2.0, January 2004" | candidate; **unverified** whether any file derives from row 9 (source headers not read) |
| 14 | GaussianSplats3D (`mkkellogg/GaussianSplats3D`) | `LICENSE` | "The MIT License (MIT) Copyright (c) 2023 Mark Kellogg" | candidate renderer |
| 15 | splat (`antimatter15/splat`) | `LICENSE` | "MIT License Copyright (c) 2023 Kevin Kwok" | candidate renderer |

Not checked: the training data of anything pretrained (none of the clean stacks above needs a pretrained network, which is why
they are chosen), every package these depend on, and patents. Not legal advice (see `LICENSE-AUDIT.md`).

## 6. Recommendation

1. **Finish option 1 first.** Run Stage 3 (one defect, behind an option, under the 20 fps gate) and measure it. It is the only
   option that needs no rule change and runs on the target laptop. **Pending Stage 3:** if Stage 3 does not visibly improve
   the side view, that is the evidence for step 2.
2. **Next, a measurement spike for option 3, not a build.** It attacks option 1's weakest point (side views) with a stack
   that can be licence-clean, and its live path keeps every current privacy rule. Its two unknowns (render speed on UHD 620,
   and how to animate it without FLAME) can be measured before anyone's face is captured.
3. **Option 2 last, and only on a written decision.** It promises the most realism, but it needs camera pixels to leave the
   page and the computer. That means a new exception to the camera rule and a rewrite of REMOTE.md, plus per-identity
   training and a running GPU bill. Revisit it only if options 1 and 3 both fall short on the owner's blind review
   (MISSION item 3).

## 7. What to measure first (in this order)

1. **Stage 3 before and after** on the owner's webcam: checklist items 2 to 8 (yaw), severity and fps, gate at 20 fps.
2. **Splat rendering speed on the UHD 620, with no capture of anyone.**
   - Use GaussianSplats3D (MIT) on a public sample scene, cut to 50k, 100k and 200k splats.
   - Run it in the same Chrome as `/facemesh`, with MediaPipe running in the same page.
   - Record fps and p95 frame time with `bench_facemesh.py`'s conventions: renderer name recorded, no other tabs open.
   - Result: the splat count the laptop can afford at 20 fps. If it is under about 50k, option 3 is out on this laptop.
3. **Round-trip time to a candidate GPU region, sending no frames.**
   - Send rig-sized packets through the existing `realx.remote` rules, or a plain ping to the provider.
   - If the p95 round trip is above about 80 ms, option 2 cannot meet MISSION item 5 (p95 frame time under 80 ms), however
     good the model is.
