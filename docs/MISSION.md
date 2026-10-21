# Mission: real-time full-person transformation on limited hardware

This page joins the owner's mission statement (2026-10-16) with the CPU research report he supplied
(`RealX_CPU_Full_Person_Transformation_Research_Report.pdf`, Z.ai, October 2026) and with what the repository actually contains.
Every status below uses four words and nothing else: **implemented** (code exists), **tested synthetically** (unit tests, a fake camera, a
software renderer), **tested with a real camera** (a person, a real webcam, the real GPU), **missing**. Nothing here is "done" until it is
the third one on the target machine. Target machine: HP laptop, Intel Core i5-8365U, Intel UHD 620, 8 GB RAM, Windows 11, no NVIDIA GPU.

## The mission in one paragraph

Turn the person on a live webcam into a different, **authorized** identity (face, head, hair, body, clothes) while keeping their real
movement, expressions, hands and interactions (holding a bottle, eating, spilling), with stable video, OBS output, an optional remote GPU
for heavy steps, and a reproducible benchmark and licence record. Photoreal 30 fps on this laptop is a **target to measure**, not a promise.

## Decisions made (and why)

1. **Pixel work stays in the browser compositor (WebGL).** The face-mesh page never reads camera pixels back (a reviewed rule), and the
   report's CPU stages (skin transfer, paste-back, flow, matte) would need those pixels on the CPU. The Python pipeline stays as it is
   for the OBS Browser Source and the offline photo/video swap. A stage that truly needs CPU pixels comes later as an explicit, reviewed,
   opt-in exception, never by default.
2. **Region compositing, not per-frame generation.** Face, hair, body/clothes and effects are separate layers; hands and what they hold are
   the live picture drawn on top. The report's evidence that generative per-frame video is out of range on this CPU agrees with ours.
3. **Remote GPU (Path B) is a change to a reviewed rule, not a free option.** `docs/REMOTE.md` today allows only head-rig numbers. Sending
   frames or crops needs a new written decision (provider, retention, per-use consent, no silent fallback) before any transport exists.
4. **Identity weights must be licence-verified or our own.** GHOST is **not** cleared (see `LICENSE-AUDIT.md`); InsightFace and
   LivePortrait stay blocked. The clean route is a per-identity model trained on consented data, or a licence bought from the owner of the
   weights.
5. **The consent gate, the visible "Virtual face" label and the watermark are structural** and stay in every path and every fallback.
6. A 3D avatar (Pip, Mira) stays a **fallback mode**, never the silent replacement for the main objective.

## Acceptance criteria and where each stands

| # | Mission item | Measurable acceptance criterion | Status today | Fallback if it fails |
|---|---|---|---|---|
| 1 | Reliable webcam capture and tracking | face found in >= 95% of frames over 60 s on the target laptop; no frame older than 150 ms | implemented; tested synthetically (fake camera); earlier tracking benchmarks exist (`BENCHMARKS.md`); **real camera not tested** | lower resolution preset |
| 2 | Stable segmentation, original pixels kept | hair/body masks do not pulse under head rotation (a persistence test); hands show original pixels | masks cut once from the photo: implemented; live hands drawn from the camera: implemented, synthetic only; live-frame segmentation: S13c written (hair and skin near the head, GPU only), never seen on a real webcam | feature off |
| 3 | Convincing transformation of face and body regions | owner's blind review on a real webcam; no visible seam at the face edge in front view | face mesh, whole head, hair sheet, body/clothes puppet, cover: implemented, **look never judged** on a real person | face alone |
| 4 | Expressions, hands, objects, interactions preserved | hand over face restores live pixels; a held bottle fully visible through lift and drink | hands layer plus grip guess plus optional skin-tone matching (S10h, shader tested on synthetic textures): implemented, **never with a real hand or bottle**; no object detector (no licence-clean option found) | smaller hand area |
| 5 | Low latency, temporal stability | >= 20 fps at 640x480 with the chosen features, p95 frame time under 80 ms, 10-minute soak without drift | **partly measured, not met reliably**: three runs on the real UHD 620 (BENCHMARKS.md section 9) gave 8 to 28 fps depending on step and run, on a loaded machine, with no real hand; no clean idle-machine run, no p95 frame time, no 10-minute soak | fewer features, lower resolution |
| 6 | Working OBS integration | OBS (Browser Source or Window Capture) shows the labelled result; later a virtual camera | OBS Browser Source works for the avatar page; **the face-mesh page as an OBS source is unvalidated**; virtual camera unbuilt | Window Capture of the page |
| 7 | Optional remote GPU | works with the network cut: output degrades to the local result within one second, label and watermark unchanged | **missing** (design in decision 3) | stay local |
| 8 | Benchmark suite and licence record | one command per benchmark, JSON artifact, load and renderer recorded; every model in `LICENSE-AUDIT.md` with evidence | benchmark for the face-mesh page: **implemented in this commit**; licence record: maintained, GHOST added | n/a |

## How to measure (the first real step)

```powershell
$env:REALX_CHROMIUM = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
python scripts/bench_facemesh.py --headed --seconds 12 --json facemesh.json
```

It turns the features on one at a time (face, + body, + hair, + hands on top, + a spill) and records, per step: frames per second (median
and p95), milliseconds per model, which features really started, whether the label was visible while drawing, the WebGL renderer, and the
other Chrome processes already running. A report is **not representative** when the renderer is software or other Chrome windows are open;
the report says so. Close other browsers and run it twice (idle and with your normal load): the difference is the real margin. The fake
camera has no hand, so costs with a real hand are **not** included.

## What was taken from the research report, and what was not

Taken: region compositing as the architecture; cadence gating (run heavy models every few frames, carry the result between frames);
measure-first discipline; a thermal soak test; the virtual-camera step; per-identity trained models as the licence-clean quality route.
Not taken as stated: "GHOST confirmed Apache-2.0" (open objections in the same thread); "reuse 80%" and the matte-first priority (they
belong to the Python pipeline, not the browser page); "the bottle works on day one" (which pixels belong to an unknown object is the
unsolved part); several "measured" figures (taken in the author's own 2-thread sandbox, not on this laptop); the frame budget (it leaves out
the pose and hand models our features need); "Remote matches REMOTE.md" (it does not: that file forbids frames).

## Next, in order (each step: tests, a measurement where it applies, push)

1. Run the benchmark on the real GPU, idle, and record it in `BENCHMARKS.md` (this replaces guesses with numbers).
2. ~~Hand skin-tone matching in the shader~~ built (S10h, 2026-10-16, option off by default; see `PROGRESS.md`). Open: try it with a real hand, because it has only been tested on synthetic textures.
3. Cadence gating for the pose and hand models, with the numbers from step 1.
4. Validate the face-mesh page as an OBS source on the owner's machine; then the virtual camera.
5. Soak test (10 minutes) for thermal droop.
6. Only if the numbers say it is needed: the Path B design decision, and per-identity training on consented data.
