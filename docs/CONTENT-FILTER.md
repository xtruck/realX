# Content-safety filter for realX: research and design (2026-10-15)

Research and design only. No model was downloaded, nothing was added to `MANIFEST` or `models.py`, no code was written.
No FaceFusion code was read for this document or reused (it is OpenRAIL-AS; ideas only, see `FACEFUSION-STUDY.md` idea 2).
`SAFETY.md` item 4 promises a filter ("interface exists, model pending"). This is the model question.

**Verdict: no candidate passes today under "permissive licences only, verify model cards, pin sha256".**
One (Marqo) is close and is worth a short, owner-approved verification step. One (EraX) is a no-go. One (Freepik) is
licence-clean on paper but too heavy for the laptop's live path. Details and the list of what could not be verified are below.

## Candidates (what the FaceFusion code claims vs what the model pages say)

All facts below come from the Hugging Face pages and API read on 2026-10-15. "Licence verified" means the licence text or
tag was read on the real repo **and** the rest of the chain (base model, training data) was checked. No candidate is a full yes.

| | Marqo | Freepik | EraX |
|---|---|---|---|
| Real repo | [Marqo/nsfw-image-detection-384](https://huggingface.co/Marqo/nsfw-image-detection-384) | [Freepik/nsfw_image_detector](https://huggingface.co/Freepik/nsfw_image_detector) | [erax-ai/EraX-NSFW-V1.0](https://huggingface.co/erax-ai/EraX-NSFW-V1.0) |
| Licence claimed | Apache-2.0 (HF metadata tag and card) | MIT (HF tag; README says "MIT License, Copyright 2025 Freepik Company S.L."; **no LICENSE file in the repo**, only the README text) | Apache-2.0 (HF tag only; no licence text on the page) |
| Licence verified | **Partly.** Tag and card agree; no LICENSE file in the file list. | **Partly.** Text is in the README, no separate file. | **No.** Contradicted by its base (see below). |
| Base model | `timm/vit_tiny_patch16_384.augreg_in21k_ft_in1k` (Apache-2.0, 5.8 M params, 3.2 GMACs, ImageNet-21k pretraining) | `timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k` (MIT, 87.1 M params, 107.1 GMACs, ImageNet-22k) | Ultralytics YOLO11 (n, s, m). Ultralytics offers **AGPL-3.0 or a paid Enterprise licence**. |
| Training data statement | "Proprietary dataset", 220,000 images (100k NSFW + 100k SFW train, 10k + 10k test): real photos, drawings, Rule 34, memes, AI images. Sources not named. | About 100,000 "synthetically labeled" images, 3 epochs on 3 RTX 3090. Sources not named. Near-duplicates removed by CLIP similarity above 0.92. | "Private datasets (from Internet)": 31,890 train / 11,538 val images. |
| Output | 2 classes: NSFW / SFW (whole image) | 4 levels: neutral, low, medium, high (whole image) | Detector, 5 classes: anus, make_love, nipple, penis, vagina (boxes) |
| Input size | 384 x 384, mean/std 0.5, bicubic, centre crop 100 % (`config.json`) | 448 x 448 (`config.json`; the README does not state it) | 640 x 640 (training size, README) |
| Use restrictions | None stated beyond a "Not-For-All-Audiences" flag | None stated beyond the same flag. README: benchmarks are the authors' own and the AI-image test set is small | None stated beyond the flag |
| ONNX available | **No official ONNX**, only `model.safetensors`. A community repo `LukeJacob2023/nsfw-image-detector-384-onnx` exists; its card was not read, so it is unverified | **No**, only `model.safetensors` | **No**, only `.pt` files |
| File size | 22,404,720 bytes (about 21.4 MiB) | 172,725,672 bytes (about 165 MiB) | n 5,452,691 / s 19,159,379 / m 40,500,709 bytes |
| Published sha256 (HF LFS; of the **safetensors / pt file**, not of any ONNX) | `6bf2e0f64a1d20169736c2836e3a787b12379fdc08ba87f7d94a7a3d58eeefce` (commit `0c26ec22111b83f106d72a55f611ec35962bcb65`, 2024-11-27) | `024a9d4818fae2656403bf626c9f8c9e7789c2da274749fbebb1060d8fdaa7ab` (commit `15b85477e4fd2000db76ae9aae0f89a72f95e2e3`, 2025-05-09) | n `e03943f578186a2bfe9b24442a5b8cc838dbf204ba84620f06fcc5695d1ac9f9`, s `cd268d5ac84058fc9f3681bcc5446775e7ca1fdcf53948277a8b7ba12055eb10`, m `8c7d14911fdc076d80f4614c879ce0979d54f827b251e62989ae949ea1bb2dc8` (commit `aea60ac8d2ebcbe0fcbb29e623eba99945b988a6`, 2025-04-22) |
| CPU cost, **estimate, not measured** (i5-8365U, 4 cores / 8 threads, 7.8 GB RAM) | About 3.2 GMACs per image. Assuming ONNX Runtime fp32 sustains roughly 20-60 GMAC/s on this chip, that is about 50-150 ms per checked frame plus resize. Memory well under 200 MB. | About 107 GMACs per image, so roughly 2-5 s per checked frame on the same assumption. About 0.5 GB with the runtime. | YOLO11n at 640 is about 3 GMACs, similar to Marqo; s and m are several times more. Moot because of the licence. |
| Go / no-go | **Conditional, not yet.** Best fit; blocked by unnamed training data and no ONNX (below). | **No-go for the live path.** Possibly later as an on-demand check of stills, if its licence chain is cleared. | **No-go.** |

### Why EraX is a no-go

* The repo's own metadata names Ultralytics YOLO11 as the base, and the weights are Ultralytics-format `.pt` files. Ultralytics
  publishes YOLO11 under AGPL-3.0 or a paid Enterprise licence. Whether a fine-tune inherits AGPL is a legal question this
  document does not settle, but realX's rule (no AGPL code or weights) and the "Apache-2.0" claim cannot both be relied on
  without written confirmation from Ultralytics or EraX.
* Running it normally needs the Ultralytics Python package (AGPL code) or a rewritten YOLO11 head.
* Training data is "private datasets (from Internet)".
* It detects only five body-part classes, so it would miss other things a filter should catch.

### Why Marqo is "not yet" rather than "no"

* In its favour: the smallest model, a permissive base (Apache-2.0 timm ViT-tiny), Apache-2.0 on the repo, a whole-image score, and a published LFS hash.
* Open problems that stop a "go" today:
  1. **Training data is proprietary with no named sources.** A permissive licence on the weights does not say the data was
     lawfully collected. The same gap applies to Freepik. A reply from the authors (an HF discussion or email) could close it.
  2. **No ONNX.** realX loads ONNX through ONNX Runtime. We would export it ourselves at build time (PyTorch + timm, never on the user's machine),
     compare the export with the original on a few inputs, and pin **our** ONNX file's sha256 in `models.py`. The upstream safetensors hash
     should be recorded next to it so the chain is auditable. The export is a derivative; Apache-2.0 allows it with attribution and a NOTICE.
  3. **ImageNet-21k pretraining.** The base is Apache-2.0 on its model page, but the dataset behind it has its own terms. That is true of
     almost every vision model; `LICENSE-AUDIT.md` should say so explicitly.
  4. **Accuracy is the authors' own number** (98.56 % on their own test set), with nothing independent. Expect false positives on
     skin-toned, beach or art images and misses on cartoons or odd framing. The card itself says the label is subjective and tells users to tune the threshold.

## What could not be verified

* The EraX "Apache-2.0" claim against its YOLO11 / AGPL base (needs the authors or Ultralytics).
* Where each training set came from, for all three. No card names sources; Marqo's is called proprietary.
* The community ONNX copy of Marqo (card not read; no proof it is a faithful conversion). Not to be used; we would export our own.
* Independent accuracy for any of the three. All numbers are the authors' own.
* A separate LICENSE file in any of the three repos (the HF file lists show none; only tags and card text).
* CPU timings: all are estimates from model size and input. A real number needs a measurement with a converted file on an idle machine.
* The page fetcher summarised long pages, so card details above are paraphrases. Re-read the cards themselves before relying on a figure.

## Recommended design (if the owner approves a model)

**Principles.** The filter only **blocks and tells**. It never edits, blurs, crops or silently drops frames or audio.
The consent gate, the DIGITAL HOST bar and the watermark stay exactly where `SAFETY.md` puts them. The filter adds a stage; it replaces nothing.

1. **Where it runs.** On the user's machine, in the pipeline process, with ONNX Runtime on CPU. No frame, thumbnail, score or hash goes to any server.
   The model file comes through the pinned download path in `models.py`, checked by sha256 like the others. If the file is missing or
   the hash is wrong, publishing does not start (fail closed).
2. **Which frames.** The final picture that would be published: after the swap / avatar / background stages and the DIGITAL HOST bar,
   before the watermark, so the mark is not part of what it judges. It is a read-only observer that cannot change pixels, so it does not
   count as a picture-editing stage between the bar and the watermark. It samples rather than judging every frame: for example one frame
   per second, one at start, one on a scene cut, and one before a recording is finalised. The frame is resized in memory only and never written to disk.
3. **What counts as a hit.** A threshold on the NSFW score, smoothed over the last few samples (for example 2 of the last 3). Thresholds are config
   with a safe default, tuned on the owner's own test images, never on stored user frames.
4. **What happens on a hit.** Publishing **stops**: the virtual-camera / RTMP / recording output is paused and the control room shows a clear message
   ("Publishing stopped: the content filter flagged a frame. Nothing was changed or saved.") with the time. No blur, no placeholder swap, no quiet quality drop.
   Resuming needs a deliberate click, and the filter keeps running. In the hosted tier the event is logged (session id, consent id, time, score) with **no image**.
5. **No silent failure.** If the model cannot load, the hash differs, or inference raises, the state is "filter unavailable" and publishing is blocked.
   A switch to turn the filter off may exist for local development only; it shows a visible "FILTER OFF" label and is never the default.
6. **Cost control.** At one sample per second a Marqo-class model is estimated (not measured) at about 5-15 % of one core on this laptop. Run it on a worker thread
   with a one-slot queue that drops stale samples instead of growing memory.
7. **Tests, when implemented.** The model is never in the repo. Tests use a stub scorer; a separate opt-in test uses an operator-provided file checked by sha256.
   A source-grep test (like the existing camera one) checks that the filter code makes no network, file-write or image-encode calls.
8. **Limits to state in `SAFETY.md`.** A classifier is a net, not a guarantee. It does not detect minors, violence outside nudity, text, or a real person's
   likeness. The consent gate, not this filter, protects a real person's likeness.

## Next steps, in order

1. Owner decision: ask Marqo (HF discussion or email) to name the training-data sources and confirm the licence covers the weights. Until answered, record Marqo in `LICENSE-AUDIT.md` as "licence tag only, data unverified".
2. After that: a build-time script (outside the runtime path) exports Marqo to ONNX, compares outputs with the original on a few public-domain images, and records both sha256 values. Pin the ONNX in `models.py` and add the row to `LICENSE-AUDIT.md`.
3. Measure the real cost with `realx bench` on this laptop and replace the estimates in this file.
4. Implement the observer stage and the block-and-message behaviour, with the tests above.

Until step 2 is done the honest status is the one in `SAFETY.md`: **content filter: interface exists, no model enabled.**

## Sources (read 2026-10-15)

* Marqo: [model page](https://huggingface.co/Marqo/nsfw-image-detection-384), [API listing](https://huggingface.co/api/models/Marqo/nsfw-image-detection-384?blobs=true), base [timm/vit_tiny_patch16_384.augreg_in21k_ft_in1k](https://huggingface.co/timm/vit_tiny_patch16_384.augreg_in21k_ft_in1k)
* Freepik: [model page](https://huggingface.co/Freepik/nsfw_image_detector), [API listing](https://huggingface.co/api/models/Freepik/nsfw_image_detector?blobs=true), base [timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k](https://huggingface.co/timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k)
* EraX: [model page](https://huggingface.co/erax-ai/EraX-NSFW-V1.0), [API listing](https://huggingface.co/api/models/erax-ai/EraX-NSFW-V1.0?blobs=true), Ultralytics [YOLO11](https://huggingface.co/Ultralytics/YOLO11) and [licence page](https://ultralytics.com/license)
