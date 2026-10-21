# B2 backend audit: pipeline, stages, filters, providers, sources, tracking, rig

Branch `audit-backend-b2-pipeline` (from `photoreal-integration`, head f8f989e). Read-only audit: no application code and no
existing test was changed. Every finding marked CONFIRMED has a throw-away reproduction run in a shell and not committed;
the rest is marked UNCONFIRMED. Date 2026-10-21.

Note: `docs/audit/AUDIT-2026-10-21.md` named in the brief does not exist on this branch (`docs/audit/` did not exist). The
closest documents are `docs/AUDIT_REPORT.md` and `docs/REALX_AUDIT.md`; they were not used as input.

## Summary

* The stage contract is flag based. `validate_stages` and `validate_strict` stop a pipeline that *declares* itself wrongly, but a
  stage that simply omits its flags, or a plugin that calls `register()`, passes even in `strict=True` (B2-02).
* `run_stream` **no longer blocks the source**: the defect described in `docs/BENCHMARKS.md` section 2 is fixed in code (queued
  frames are cancelled, latest wins) and `tests/test_resilience.py` now holds it as a normal passing test, so the doc and a
  comment in `bench.py` are stale (B2-23). What remains is a different problem: results are released only when the *next* source
  frame arrives, which adds one frame period of latency to every output (B2-05).
* The One-Euro filter freezes for as long as timestamps stay at or below the previous maximum (a looped file, a replayed bench
  clip), and a single NaN landmark poisons a track's smoothing for good (B2-01, B2-03).
* `bg_replace`: in the one profile run, `cv2.dnn Net.forward` is about 58% of the stage and numpy/OpenCV glue (blend, guided
  filter, smoothstep, conversions) about 42%. The 14 ms figure quoted in BENCHMARKS is ONNX Runtime; the stage uses `cv2.dnn`.
  These are different engines (B2-07).
* Providers: the ranking puts DirectML above OpenVINO and CPU although the project's own A/B shows DirectML 2x slower on YuNet
  and 30 s to create a session; no stage uses `SessionCache` yet, so this is latent (B2-08).

Counts: Critical 0, High 2, Medium 6, Low 14, Info 2 (24 findings).

## Findings

Effort: S under half a day, M about a day or two, L more.

| ID | Sev | Where | What | Evidence | Recommended fix | Effort |
|---|---|---|---|---|---|---|
| B2-01 | High | `filters.py:40-42` | `OneEuroFilter` holds the last value whenever `dt <= 0`. A timestamp that jumps *back* (looped video, replayed clip, clock reset) is treated like a duplicate, so the filter is frozen until time exceeds its old maximum. `OneEuroSmoother` (`builtin.py:95-122`) inherits it. | CONFIRMED. Stage run with inputs x=0,10,..50 twice, timestamps restarting: output `[0, 8.5, 19.1, 29.3, 39.5, 49.5, 49.5 x6]`. `docs/BENCHMARKS.md` section 2 says the stream pass "replays the rendered frames in a loop", so bench stream numbers after the first loop run on a frozen filter. | Hold only for `dt == 0` (or tiny); for `dt < 0` beyond a tolerance call `reset()` and restart from the new sample. `Track._elapsed_frames` is already tolerant; copy its approach. | S |
| B2-02 | High | `pipeline.py:101-120`, `stages/base.py:36-44` | `strict=True` trusts "registered", not "realX-owned". `known` is built from `_REGISTRY`, and `register()` is public, so any plugin that registers a class passes. The role check (`is_gate`, `is_disclosure`, `is_watermark`) catches a stage that *claims* a role; it does not catch a stage that **omits** `requires_consent`, `uses_likeness` or `alters_media`. An unflagged synthesizer needs no gate, no label and no watermark, and an unflagged pixel editor may sit after the watermark. | CONFIRMED. A class registered as `evil_synth`, no flags, rewriting pixels: `Pipeline([Evil()], strict=True)` builds. An unflagged `Tint` after `Watermark` builds. Non-strict mode is flag trust by design (the docstring says so); the strict docstring says "only stages realX itself registered", true only if nobody else registers. Threat model: code that can call `register()` already runs in-process, so this is a structural-guarantee gap more than an exploit. | (a) Snapshot the registry at the end of `realx.stages.__init__` and compare strict against that frozen set (plus `allow`). (b) In strict mode treat any class outside the snapshot as untrusted even if registered later. (c) Document that omitted flags are not detected. | M |
| B2-03 | Medium | `filters.py:36-52`, `builtin.py:60-65,106-115`, `tracking.py:148-156` | NaN or inf is never rejected. One non-finite sample sets the filter state to NaN and every later output for that track is NaN (a NaN timestamp does the same). `TemporalSmoother` has the same flaw. The tracker validates bbox and score but not landmarks, so non-finite landmarks reach the smoothers. | CONFIRMED. One NaN landmark in frame 2: both `one_euro` and `smooth` output NaN for every later frame of that track. The tracker passes NaN landmarks through. `rig.py:106` guards with `isfinite`, so the rig degrades to zeros, but the landmark overlay and `PortraitAnimate` do not. YuNet does not emit NaN, so the trigger is a future detector or a bad flow hint. | In `OneEuroFilter.__call__` and `TemporalSmoother`: if the input or `t` is not finite, return the held value and leave state unchanged. Validate `landmarks` shape (N,2) and finiteness in `FaceTracker.update` next to the bbox check. | S |
| B2-04 | Medium | `stages/vision.py:18-83` | `YuNetDetector` keeps mutable state (`_size` and the OpenCV `FaceDetectorYN` input size, set then used in `_detect`) but does **not** declare `stateful = True`, so `run_stream(workers>1)` accepts it. Two threads would race `setInputSize` against `detect`. Every other stateful stage declares the flag. | UNCONFIRMED by run (needs the model and a thread race; not attempted). By reading: `_detect` does `setInputSize` then `detect` on a shared object with no lock; the guard is `getattr(s, "stateful", False)` at `pipeline.py:189`. | Add `stateful = True`, or give each worker its own detector. | S |
| B2-05 | Medium | `pipeline.py:176-193` | `run_stream` yields a finished result only in the loop body that runs when the *next* source frame arrives (`while pending and pending[0][1].done()` runs once, straight after submit, when the frame just submitted is never done). Every output is delayed by up to one source period, and a stalled source holds back results that are already finished. | CONFIRMED. 30 fps paced source, 5 ms stage: minimum latency 33.8 ms (about 5 ms expected); 20 ms stage: 33.6 ms. Means of 45 to 68 ms include about 15 ms Windows `sleep` jitter in the test itself, so use the minimum. | Move source iteration to a feeder thread that owns the drop policy (one-slot latest-wins buffer, as `LatestFrameGrabber` does) and let the generator block on a result queue; results then leave the moment they finish and a blocking camera read cannot delay them. | M |
| B2-06 | Medium | `pipeline.py:137-150,176-197` | One failing frame ends the whole stream: the exception surfaces from `Future.result()` in the generator and later frames are lost. The error names no stage, and a stage returning `None` fails in the *next* stage with `'NoneType' has no attribute 'pixels'`. A stage without `setup` or `close` fails only when `setup()` runs. | CONFIRMED. Frame 3 raises: generator ends after frames 0 to 2. The message `boom` does not contain the stage name. `None` return gives AttributeError in the following stage. (`server.py` has its own loop with rebuild; this concerns `run_stream` users such as `bench.py`.) | Wrap `stage.process` and re-raise `StageError(stage.name)` `from exc`; check `isinstance(ctx, FrameContext)` after each stage; give `run_stream` an `on_error` policy (skip and report, or raise). | S |
| B2-07 | Medium | `stages/background.py:143-166,228-235` | `bg_replace` cost. In one profile `cv2.dnn Net.forward` is 58% and the glue 42% (breakdown below). The quoted "14 ms for PP-HumanSeg" was measured with ONNX Runtime (`BENCHMARKS.md` section 8) while the stage runs `cv2.dnn`: not the same engine. Glue per 640x480 frame: about 9 full-frame float32 temporaries in the blend, a 9-`boxFilter` guided filter at up to 640 px, `smoothstep` with 5 temporaries, 6 `astype` calls. | CONFIRMED by one cProfile run (next section). | By payoff: (1) run the segmenter through ONNX Runtime / `SessionCache`, or measure other `cv2.dnn` backends; (2) blend in uint8 (`cv2.multiply` with a uint8 alpha) and skip pixels where alpha is exactly 0 or 1; (3) run the guided filter at 256 to 320 px (work side is 640); (4) fuse `smoothstep` into cv2 ops; (5) segment every second frame and reuse the matte (temporal blend already exists). | M |
| B2-08 | Medium | `runtime/providers.py:11-18` | Ranking puts `DmlExecutionProvider` third, above OpenVINO and CPU. The project's own A/B (`BENCHMARKS.md` section 8) found DirectML about 2x slower on YuNet, a tie on PP-HumanSeg, 1 to 36 s session creation, and recommends no DirectML default. Anyone with the DirectML wheel gets it first from `pick_providers()` and `realx providers`. Latent: no stage calls `SessionCache`. | Reading plus BENCHMARKS. Ranking behaves as coded (CPU always last, duplicates removed, unknown names dropped, empty list gives CPU). | Do not rank DML above CPU by default; choose by a measured one-inference warm-up cached per machine, or make DML opt-in. | S |
| B2-09 | Low | `builtin.py:212-218` | `Disclosure` uses `canvas[h - bar:]` with `bar = max(24, ...)`. On a frame shorter than 24 rows, `h - bar` is negative and wraps, so only a few rows are painted. The label is a safety control ("never below 6% of height"). | CONFIRMED. h=20: 4 rows painted (24 expected); h=24, 30, 100 correct. | `bar = min(bar, h)`; refuse frames below a minimum height in likeness pipelines. | S |
| B2-10 | Low | `types.py:28-35` | `FrameContext` validates only in `__post_init__`. Zero-size, non-contiguous and read-only arrays are accepted, a stage may assign any array to `ctx.pixels` (a float32 array was assigned without error), and nothing re-checks after each stage, so a bad frame surfaces in a later stage or the sink. Downstream behaviour on zero-size frames (`_WORK_SIDE / max(h, w)` in `matte`, `width / w` in YuNet) is UNCONFIRMED by run. | CONFIRMED for acceptance (0x0x3, 0x10x3, a `[:, ::-1]` view, a read-only array all construct). | Reject `h == 0 or w == 0` in `__post_init__`; optionally make `pixels` a property that re-validates on assignment. | S |
| B2-11 | Low | `pipeline.py:121-129`, `builtin.py:129-157,235-250` | Trusted instances stay mutable after validation: `Watermark.payload`/`key`, `Disclosure.text`, and any instance attribute such as `process` can be replaced; strict mode checks the class only. The stage tuple is frozen, its elements are not. | CONFIRMED. A strict pipeline whose `Watermark` instance has `process` replaced by a no-op leaves pixels unchanged. Same in-process threat model as B2-02. | Optional: read-only properties on the three trusted classes; in strict mode require `"process" not in vars(stage)`. | S |
| B2-12 | Low | `pipeline.py:185-190` | `run_stream` accepts `max_in_flight <= workers`. Then every pending frame can be running, nothing is cancellable, and it falls back to blocking the source; with `workers=1, max_in_flight=1` whether a frame is dropped depends on whether the worker has started it. | CONFIRMED as behaviour: instant source, mif=1, w=1: 2 out, 118 dropped (timing dependent). Normal use (mif 3 to 8, w=1) drops correctly. | Require `max_in_flight > workers`, or document it. | S |
| B2-13 | Low | `runtime/providers.py:84-93` | No provider or session options are passed: nothing for a TensorRT engine cache (each start would rebuild engines), DirectML (`enable_mem_pattern=False`, sequential execution are its documented requirements), CUDA `device_id`, thread counts or graph optimisation level. The factory signature is `(model_path, provider)` only. | CONFIRMED by signature. Not run on any accelerator (none installed, as BENCHMARKS says). | Accept per-provider `provider_options` and a `SessionOptions` hook; default a TensorRT cache path under the models dir. | M |
| B2-14 | Low | `runtime/providers.py:103-140` | `SessionCache` details. (a) The key is the raw path string, so `m.onnx` and `./m.onnx` build two sessions. (b) If a model cannot start, each concurrent caller retries every provider in turn. (c) The per-key lock stays in `_building` after a failure. (d) A fallback is recorded in `SessionInfo.failures` but never logged. (e) Fallback happens at creation only; a provider that creates a session but fails on the first `run` is not retried on the next. | CONFIRMED (a) to (c) with fake factories: 3 sessions for 2 distinct requests; 4 waiters made 8 factory calls; 1 leaked lock. (d), (e) by reading. | `os.path.realpath` in the key; cache a failure briefly; `log.warning` on fallback; guard the first `run`. | S |
| B2-15 | Low | `sources.py:84-88` | A single `ok=False` from `read()` ends the capture thread for good (and releases the device). Some drivers return a transient false on a resolution renegotiation or USB hiccup. | CONFIRMED with a fake capture: one false between good frames, next `next()` raises `SourceError`, device released. The engine reconnect path is outside this scope (reopen cost not verified). | Tolerate N consecutive failures (for example 5 over 250 ms) before failing. | S |
| B2-16 | Low | `sources.py:23-42,169-176` | `_open_camera`: (a) a `read()` that raises leaks the `VideoCapture`. (b) Open and the 10 warm-up reads have no overall time limit and run on the caller's thread, so a driver stuck in `read` blocks engine start (UNCONFIRMED; hardware dependent). (c) Warm-up reads have no pause. (d) `camera_frames` sets width/height after opening and never checks what the driver gave, and does not request MJPG; on DSHOW above VGA many webcams fall to a low frame rate with YUY2 (UNCONFIRMED, no camera). | (a) CONFIRMED with a fake cv2: `released == [False]`. Rest as stated. | `try/finally` releasing on any exception; open in a worker thread with a timeout; read back `CAP_PROP_FRAME_WIDTH/HEIGHT/FPS`; set FOURCC MJPG when size exceeds 640x480. | S |
| B2-17 | Low | `sources.py:131-135` | `LatestFrameGrabber.close()` waits at most 2 s. If the driver is stuck in `read()`, the device stays held until it returns, and an immediate reopen of the same DSHOW device may fail. Release happens in the thread, so nothing leaks. | UNCONFIRMED on hardware. With a fake 1.5 s read, `close()` returned after the read ended and the device was released. | Have the reconnect path wait for the old thread (poll `stats()["alive"]`) before reopening. | S |
| B2-18 | Low | `tracking.py:148-156`, `vision.py:167-172,87-90` | The tracker validates bbox and score only; landmark shape and finiteness are not checked (see B2-03). `Track` rebuilds `Face` objects and drops `embedding`. Detections scoring 0.3 to 0.5 can only join an existing track, otherwise they vanish from `ctx.faces`. `YuNetDetector.process` keeps `[:top_k]` of a list ordered by scale, not by score. | Reading. | Validate landmarks; copy `embedding`; sort by score before `top_k`. | S |
| B2-19 | Low | `background.py:200-203,222-224` | `set_image` (any thread) and `_backdrop` (worker thread) race: `process` can compute `cover()` from the old photo, `set_image` then stores the new photo and clears `_cover`, and `process` stores the stale cover. The old background then persists until the frame size changes. The window is a few ms. | UNCONFIRMED (race, not reproduced). | Lock, or store `(photo, cover)` as one object swapped atomically. | S |
| B2-20 | Low | `vision.py:53-60,248-282`, `builtin.py:200-229`, `background.py:219-225` | Per-frame allocation and repeated work, estimated from reading at 640x480: `float(rgb.mean())` every frame for the dark check (about 1 ms); BGR to RGB in the source, RGB to BGR once or twice per YuNet scale, RGB to gray in `Track` and again in `matte`; `AvatarOverlay` does `canvas.copy()` plus a full-frame `addWeighted` **per face**; `Disclosure` measures text twice per frame; `mode="color"` allocates `np.full_like` per frame; `mode="blur"` runs a full-resolution `GaussianBlur` with a kernel up to 151, uncached. | Reading only; costs are estimates, not measurements. | Cache text layout and the colour backdrop; blur a half-size copy and upscale; draw avatar overlays in a local ROI; sample the brightness check on a strided view. | M |
| B2-21 | Low | `rig.py:36-59,80-86` | Calibration is final after 20 frames per track, with no re-calibration and no check that the face was neutral; `depth` and the yaw offset depend on it for the life of the track. A track that starts while the user is turning or talking gets a permanent bias. `_calib` is trimmed only when more than 32 tracks exist. | Reading. | Rolling median with slow decay, or a "recentre" action; bound `_calib` by age. | M |
| B2-22 | Low | `sources.py:182-197` | `video_frames`: `cap.get(CAP_PROP_FPS) or 30.0` keeps a NaN fps (NaN is truthy), giving NaN timestamps (then B2-03 applies); a decode error mid-file looks like end of file. | UNCONFIRMED (reading). | `fps = fps if math.isfinite(fps) and fps > 0 else 30.0`. | S |
| B2-23 | Info | `docs/BENCHMARKS.md:57-62,167`, `bench.py:12,328` | Stale text: BENCHMARKS sections 2 and 5 and two comments in `bench.py` still say `run_stream` blocks the source and that the test is `xfail(strict=True)`. The test is now a normal passing test (`tests/test_resilience.py:216`), and the measured behaviour changed from "0 dropped, source blocked 2.6 to 3.4 s" to 112 to 117 dropped in 0.07 to 0.18 s. | CONFIRMED: `pytest tests/test_resilience.py -k "run_stream or slow_stage"` gives 5 passed. | Update those places; keep the camera simulation in `bench.py` because it also measures source behaviour. | S |
| B2-24 | Info | `runtime/*`, `docs/ARCHITECTURE.md` | `SessionCache` and the provider ranking are used by no stage (YuNet and PP-HumanSeg run through `cv2.dnn`), so providers cannot affect any frame today. ARCHITECTURE.md is aspirational; its sentence "the stream runner drops stale frames" is now true for `run_stream`, but the live server uses its own loop (`server.py:_run`), not `run_stream`. | Grep: only `cli.py` and `bench.py` import the runtime package; `run_stream` is imported only by `bench.py`. | Keep a one-line status in the docs. | S |

Severity counts from the table: Critical 0, High 2 (B2-01, B2-02), Medium 6 (B2-03 to B2-08), Low 14 (B2-09 to B2-22), Info 2
(B2-23, B2-24).

Registry and flag facts used above: registered stages are `passthrough smooth one_euro consent_gate swap_stub disclosure watermark
bg_replace detect_yunet track debug_boxes avatar rig portrait_animate` plus six voice stages. `bg_replace`, `debug_boxes`, `avatar`,
`disclosure`, `portrait_animate` declare `alters_media`; `swap_stub` declares `requires_consent` and `uses_likeness` but not
`alters_media` (it edits no pixels); `YuNetDetector` declares nothing (B2-04).

## bg_replace time breakdown

Method: one `cProfile` run (once). `bg_replace` in photo mode with a 1920x1080 photo, a 640x480 synthetic frame (gradient plus an
ellipse), 4 warm-up frames, 30 profiled frames, models read from the main checkout's `models/` folder (read only), `cv2.dnn`.
The machine was shared and busy, so absolute times are inflated (about 540 ms per frame here); **read the proportions only**.
No other timing was taken.

```
         1831 function calls in 16.214 seconds
   Ordered by: internal time
   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
       30    9.385    0.313    9.385    0.313 {method 'forward' of 'cv2.dnn.Net' objects}
       30    2.077    0.069   16.214    0.540 background.py:228(process)
      180    1.384    0.008    1.384    0.008 {boxFilter}
       30    1.039    0.035    2.424    0.081 background.py:101(guided_filter)
      180    0.654    0.004    0.654    0.004 {method 'astype' of 'numpy.ndarray' objects}
       30    0.460    0.015    0.532    0.018 background.py:118(smoothstep)
       60    0.416    0.007    0.416    0.007 {resize}
       30    0.363    0.012   13.424    0.447 background.py:143(matte)
       60    0.276    0.005    0.276    0.005 numpy/_core/_methods.py:96(_clip)
       30    0.056    0.002    0.056    0.002 {method 'copy' of 'numpy.ndarray' objects}
       30    0.043    0.001    0.043    0.001 {cvtColor}
       30    0.023    0.001    0.023    0.001 {blobFromImage}
       30    0.022    0.001    0.022    0.001 {method 'reduce' of 'numpy.ufunc' objects}
       30    0.003    0.000    0.003    0.000 {method 'setInput' of 'cv2.dnn.Net' objects}
       30    0.002    0.000    0.027    0.001 {method 'mean' of 'numpy.ndarray' objects}
```

| Part | Share of the stage | Notes |
|---|---|---|
| `cv2.dnn` forward (PP-HumanSeg, 192x192) | 57.9% | the model call |
| Blend in `process` (float32 temporaries) plus `clip` | 12.8% self time, 1.7% in `clip` | about 9 full-frame float passes |
| Guided filter (9 `boxFilter` per frame plus arithmetic) | 14.9% | runs at up to 640 px |
| `astype` (6 per frame) | 4.0% | frame, backdrop, guide, alpha conversions |
| `smoothstep` | 3.3% | 5 temporaries |
| 2 `resize`, matte glue, `cvtColor`, `blobFromImage`, `mean`, `copy` | about 5% | |

Reading of it: the "130 ms, of which 14 ms is the model" statement compares two engines (an ORT micro-benchmark against the
stage's `cv2.dnn`), so much of the unexplained time is that the stage's model call is not the 14 ms one, and about 42% is
numpy/OpenCV glue that can be removed (B2-07). The forward pass is inflated by contention by an amount one profile cannot separate,
so the split on an idle machine is UNCONFIRMED; the glue share would be larger there. There is no Python loop over pixels in the
stage. Nothing mutates the camera buffer; the stage returns a new array.

## Verified OK

* Colour order: `FrameContext` is RGB by convention; `CameraSource` and `video_frames` convert BGR to RGB; YuNet converts RGB to BGR
  before `detect`; `Track` and `matte` use `COLOR_RGB2GRAY`; PP-HumanSeg preprocessing is applied to RGB. No mismatch found.
* No in-place edit of the camera buffer: `CameraSource` converts with `cvtColor` (a copy); `Disclosure`, `DebugBoxes` and
  `AvatarOverlay` copy before drawing; `bg_replace` and `Watermark` return new arrays. Smoothers assign new `bbox` arrays and store
  copies, so detector arrays are not aliased into filter state.
* `FaceTracker`: bbox and score validated (non-finite, zero or negative size rejected), `_size` clamped at 1.0 (no division by
  zero), `dt` clamped to 1..60 and NaN-safe, coasting distance bounded, ghost suppression works; `iou` and `same_face` guard zero
  unions; `fill_track_gaps` leaves its input untouched. `RigSolver` guards non-finite boxes and landmarks, a tiny eye distance and a
  zero mouth distance, and clamps every output.
* `validate_stages` ordering (gate before synthesizing stages, watermark after the last one, disclosure before the watermark, no
  media edit after the watermark or over the label) behaves as documented for flag-declaring stages; the stage tuple cannot be
  replaced after build; `Pipeline.setup` closes already-started stages in reverse when one fails.
* `run_stream` with `max_in_flight` above `workers`: a faster source is never blocked (instant source, 120 frames, 20 ms stage:
  0.07 to 0.18 s wall, 112 to 117 dropped, output in order, newest frames kept: survivors `[0, 28, 29]` of 30 with
  `max_in_flight=3`); `workers>1` with a `stateful` stage is refused; `cancel_futures` plus `shutdown(wait=True)` on exit.
* `SessionCache`: CPU always last and never duplicated, empty request gives CPU, fallback order and recorded failures, 5 concurrent
  `get` calls build once, `close()` makes later `get` fail.
* `LatestFrameGrabber`: newest wins, skipped counter, stale timeout raises `SourceError`, only the capture thread releases the
  device, a driver exception ends capture with a `SourceError` (no hang).
* Windows backend order DSHOW, MSMF, ANY, with a frame required before a backend is accepted.
* Scoped existing tests: `tests/test_resilience.py -k "run_stream or slow_stage"` gives 5 passed.

## Not verified

* Anything on real hardware: a live webcam (MSMF vs DSHOW open times, transient read failures, MJPG behaviour, reopening after a
  stuck `read`), any accelerator (TensorRT, CUDA, DirectML, OpenVINO, CoreML), ONNX Runtime provider options.
* The YuNet thread race (B2-04) and the `set_image` race (B2-19): reasoned from the code, not reproduced.
* Zero-size frames through each stage (acceptance by `FrameContext` is confirmed, the failure mode downstream is not).
* The idle-machine split of `bg_replace`, and absolute millisecond figures (the machine was shared).
* `consent_gate` internals, `watermark.embed`, `safety/*`, `models.py`, `audio/*`, `server.py` and `bench*.py`: outside this scope
  except where cited. `validate_stages` is enforced only by `Pipeline`; whether `server.py` always builds a `Pipeline`, and with
  `strict=True`, was not checked here.
* `docs/audit/AUDIT-2026-10-21.md` could not be read (not present on this branch).
