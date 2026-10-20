# Benchmarks

> Summary, gaps and the 2026-10-20 software-renderer measurement of S13c: `REALX_BENCHMARKS.md`.

Two repeatable benchmarks, plus the resilience tests that guard long sessions. Every number in this file
was produced by the commands below on one laptop, and the conditions of each run are stated next to it.
**None of it is a promise about any other machine, and nothing here was measured on a discrete GPU, CUDA,
TensorRT, DirectML, OpenVINO or CoreML** (none is installed on the test machine). The ONNX Runtime provider
ranking in `runtime/providers.py` is therefore untested against real accelerators; it is tested only with
fakes and, for the CPU provider, with one real model.

## 1. How to run them (Windows PowerShell)

```powershell
# once: from the repository folder
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev,onnx,video]" playwright
realx models fetch                      # YuNet, PP-HumanSeg and the three MediaPipe models (a benchmark never downloads by itself)

# 1) the Python video pipeline (CPU), at three resolutions
realx bench --json bench.json
realx bench --resolutions 640x480 --frames 120 --stream-seconds 10 --json bench-vga.json
realx bench --background --json bench-bg.json         # adds background replacement

# 2) the browser full-body tracker (MediaPipe in Chrome)
$env:REALX_CHROMIUM = "C:\Program Files\Google\Chrome\Application\chrome.exe"
python scripts\bench_tracking.py --resolution 640x480 --headed --seconds 20 --json tracking.json
python scripts\bench_tracking.py --resolution 640x480 --headless --delegate cpu --seconds 20 --json tracking-cpu.json

# the checks around them
python -m pytest -q tests\test_bench.py tests\test_providers.py tests\test_resilience.py
```

**Before you trust a number:** close other programs and other browser windows. Both benchmarks measure what
else is running and print a `WARNING` line next to the numbers when the machine was busy (the Python one when
the CPU was 25% busy or more before it started; the browser one when any other Chrome process exists, because a
tracking tab that is already open shares the GPU). A run with a warning is not representative. Read the warning
before reading the numbers.

Use `--headed` for the browser benchmark. Headless Chrome has no GPU and falls back to software rendering, which
shows the CPU path, not what a person with a window would get.

## 2. What `realx bench` does

For each resolution it renders a deterministic synthetic scene (a public-domain portrait moving like someone dancing, fixed
seed) **before** timing anything, so rendering cost is not in the numbers, and then makes two passes, each on fresh
stages so no state carries over:

* **Timing pass.** Every stage is timed separately on every frame, one frame at a time, back to back
  (the first few frames are warm-up and are not counted). This is the best case: the CPU never idles.
* **Stream pass.** Frames are offered at `--fps` (default 30) by a thread that imitates a camera: a frame arrives every
  1/fps seconds whether or not the pipeline is ready, and a 2-frame buffer overwrites its oldest frame when the pipeline
  is behind. The pass runs at least `--stream-seconds` (default 6) by replaying the rendered frames in a loop. It reports
  frames delivered and lost, and the time each frame really took **while streaming**.

Why a camera simulation and not `pipeline.run_stream` alone: `run_stream` does not drop frames in practice. It always
removes the *oldest* waiting frame, which the single worker is already running and cannot be cancelled, so it blocks
the source instead (measured: 120 instant frames, a 20 ms stage, `max_in_flight` 3 or 8: 0 dropped, source blocked
for 2.6 to 3.4 s). A live camera would then hand the pipeline old frames. This is a defect in `pipeline.py` (its
docstring promises drops); `tests/test_resilience.py` holds it as a strict `xfail` that will start failing, and so
tell you to remove the marker, once it is fixed.

The stages are `detect` (YuNet), `track`, `one_euro`, `rig` (add `--background` for background replacement). They run on
the **CPU through OpenCV**; the `providers` block lists what ONNX Runtime offers, but no stage here uses it.

### `realx-bench/1` document

| Field | Meaning |
|---|---|
| `schema`, `created_utc`, `realx_version` | identification |
| `hardware` | `platform`, `machine`, `python`, `cpu_count`, `cpu_name`, `numpy`, `opencv`, `onnxruntime`, `providers` (`installed`, `selected`, `first_choice`, `accelerated`, `missing_accelerators`) |
| `conditions` | `cpu_load_percent_before` (number or null) and `warning` (string or null) |
| `config` | `frames`, `resolutions`, `fps`, `stream_seconds`, `with_background`, `seed`, `motion`, `degrade`, `stages`, `workers`, `max_in_flight` |
| `results[]` | one per resolution: `width`, `height`, `frames`, `warmup_frames`, `stages[]` (`name`, `mean_ms`, `p50_ms`, `p95_ms`), `frame_ms` (`mean`, `p50`, `p95`), `sequential_fps`, `faces_found` (0..1), `stream` |
| `results[].stream` | `target_fps`, `offered`, `delivered`, `dropped`, `dropped_camera_buffer`, `dropped_by_run_stream`, `camera_buffer_frames`, `process_ms` (`mean`, `p50`, `p95`), `wall_s`, `delivered_fps` |
| `notes` | the caveats, in the file itself |

`realx.bench.validate_result` checks the whole structure and its consistency (for example `delivered + dropped = offered`,
`p50 <= p95`, every number finite); a test feeds it damaged documents. `delivered_fps` is capped by the offered rate when
nothing is lost, so it is not a capacity figure; capacity is `sequential_fps`, and `stream.process_ms` is the realistic
frame time under streaming.

## 3. What `scripts/bench_tracking.py` does

It starts the real server, plays a short clip as the camera (Chrome's fake-camera feature, the same portrait at the requested
size), opens `/avatar?track=1&preview=1`, waits for tracking, then once a second samples what the page reports about
itself for `--seconds`: tracker rate, milliseconds per model, how often each model ran, which delegate (GPU or CPU) each
model got, and how fast the character itself kept rendering. Medians are reported so one stall does not decide the result.

`realx-bench-tracking/1`: `schema`, `created_utc`, `realx_version`, `hardware`, `config` (`resolution`, `delegate`, `headed`,
`seconds`, `browser`, `page`), `contention` (`browser_processes_before`, `warning`), `samples[]`, `summary`
(`sample_count`, `tracker_fps_median`, `ms_per_model_median`, `hz_median`, `render_fps`, `delegates`, `last_hand_hint`).

The fake camera shows a portrait with no hands, so the `last_hand_hint` in these runs says "no hand seen"; the benchmark
measures speed, not hand accuracy.

## 4. Results

**Machine** (the owner's laptop): Intel Core i5-8365U, 4 cores / 8 threads, base 1.6 GHz; Intel UHD Graphics 620
(integrated, driver 31.0.101.2135); 7.8 GB RAM of which 1.8 GB were free; Windows 11 (10.0.22000); Python 3.14.6; OpenCV 5.0.0;
ONNX Runtime 1.31.0 (CPU provider only); Chrome 155.0.8059.41. Date: 2026-10-14, 12:31 to 12:40 UTC.

**Conditions: not clean.** The machine was shared with other work for the whole session (other programs' tests, the
control-room server, 15 Chrome processes, 21 Node processes). Load readings between runs ranged from 9% to 90%. The three
Python runs below are tied to the load measured just before each.

### Python pipeline (`realx bench`, 60 frames, 30 fps offered)

| Run (UTC) | CPU busy before | Resolution | One frame at a time | Stream pass |
|---|---|---|---|---|
| 12:31, 2 s stream, **superseded method** | 13.5% | 320x240 | 76.7 fps (13.0 ms) | 60/60 delivered |
| | | 640x480 | 40.4 fps (24.8 ms) | 60/60 |
| | | 1280x720 | 26.8 fps (37.3 ms) | 60/60 |
| 12:34, 6 s stream, **warning: 73% busy** | 73% | 320x240 | 50.2 fps (19.9 ms) | 179/180, mean 23.6 ms, p95 44.8 ms |
| | | 640x480 | 34.7 fps (28.8 ms) | 180/180, mean 29.0 ms, p95 41.1 ms |
| | | 1280x720 | 37.4 fps (26.8 ms) | 180/180, mean 32.1 ms, p95 40.8 ms |
| 12:38, 6 s stream, no warning | 10.5% | 320x240 | 119.8 fps (8.3 ms) | 180/180, mean 23.2 ms, p95 35.5 ms |
| | | 640x480 | 45.5 fps (22.0 ms) | 180/180, mean 30.0 ms, p95 51.2 ms |
| | | 1280x720 | 35.4 fps (28.3 ms) | 180/180, mean 32.3 ms, p95 47.3 ms |

What this supports, and no more:

* On this laptop the four stages kept up with a 30 fps camera at 320x240, 640x480 and 1280x720: 0 of 180 frames lost in the
  quiet run (1 of 180 in the busy one).
* Face detection dominates: at 640x480 about 18 to 25 ms of the 22 to 29 ms, at 1280x720 about 20 to 28 ms plus 7 to 9 ms of tracking.
* **Run-to-run variation is large.** The same configuration differed by up to about 40% between runs (640x480: 34.7 to 45.5 fps;
  1280x720: 26.8 to 37.4 fps), and the busy run made 1280x720 look *faster* than 640x480. Do not quote any one of these as the
  machine's speed. A trustworthy figure needs repeated runs on an otherwise idle machine.
* **Back to back is not the same as paced.** At 320x240 a frame took 8.3 ms back to back but 23.2 ms while streaming at 30 fps,
  consistent with the CPU slowing down between frames. For a live stream, the streaming figure is the relevant one.
* The 1280x720 headroom is thin: mean 32 ms against a 33 ms frame period, p95 47 ms. The 2-frame camera buffer absorbed it
  in these runs; a heavier stage or a busier machine would start losing frames.

### Browser tracker (`scripts/bench_tracking.py`, fake camera 640x480, 15 s)

| Run (UTC) | Mode | Contention | Tracker | Per model (median) | Each model ran | Character rendered at |
|---|---|---|---|---|---|---|
| 12:38:52 | windowed, delegate auto | **15 Chrome processes already running** | 26 fps, all models on the **GPU** | pose 32.9, face 26.8, hands 41.2 ms | 9 per second each | 31 fps |
| 12:39:33 | headless (software GL), delegate cpu | **15 Chrome processes already running** | 9 fps, all models on the **CPU** | pose 105, face 88, hands 120 ms | 3 per second each | 9.1 fps |

Both rows carry the contention warning, so neither is representative. What they show, with that caveat:

* With the GPU delegate the tracker kept about 26 updates a second and each model ran about 9 times a second (pose, which drives the
  arms, 9 times a second). An earlier, differently-conditioned run of the same page gave about 25 fps with the character at 48 fps;
  the lower character rate here (31 fps) is plausibly the contention, but this was not isolated.
* **If the GPU path is unavailable the experience collapses**: about 3x slower models, 9 tracker updates a second, and the character
  itself drops to 9 fps because the models run on the page's main thread. A machine with no usable WebGL should not be offered
  full-body tracking as a live feature without a smaller model or a worker thread.
* At saturation the scheduler's preference for pose is weak: the three models ran equally often (9 per second each). The weighting only
  matters when the models' ages differ; this is a tuning observation for the tracker, not measured further.

### Memory over a long session (`tests/test_resilience.py::test_memory_does_not_grow_over_a_long_session`)

600 frames through the real detector, tracker, filter and rig at 320x240 (after a 100-frame warm-up): the Python heap changed by
-3 KiB and the process by -6.4 MiB over the next 500 frames (peak 17 MiB), on a dance and a sprint scene. The test's bounds are
256 KiB of Python heap (about 500 bytes lost per frame) and 48 MiB of process memory. `tracemalloc` cannot see native OpenCV
allocations, hence the process-level check; neither check covers the browser.

## 5. Resilience tests (`tests/test_resilience.py`)

| Test | What it establishes |
|---|---|
| camera loss and reconnection | the loss shows in the stats, retries wait at least 0.5 s and then at least 1 s (growing), frames resume and the error clears, dead cameras are closed |
| stopping during a long backoff | a stop is prompt (under 2 s) even while the engine is waiting 2 s to retry |
| a stage that raises mid-stream | the error is reported, the pipeline is rebuilt, the old stages are closed, frames resume, the thread survives |
| bounded queue | with a slow stage the backlog never exceeds `max_in_flight`, every frame is delivered or reported dropped, output stays in order |
| `run_stream` drops stale frames | **`xfail(strict=True)`**: documents the defect above |
| memory and threads | no heap growth over 600 frames; the engine's threads return to baseline after four start/stop cycles; a stopped engine closes its camera |
| occlusion | for 5 hidden frames the position is estimated and the identity is kept; for 25 nothing is shown but the same identity returns; after 80 a new identity is issued and ids are never reused; the real detector through an 8-frame occlusion keeps one identity and no ghost |

Timing assertions are lower bounds only (a loaded machine is slower, never faster).

## 6. Provider selection and the session cache

`realx providers` lists ONNX Runtime providers fastest first; `runtime.providers.describe()` separates what is installed from what
would be preferred. `SessionCache` creates each inference session once per model and provider list, reuses it, falls back provider
by provider to the CPU, records which provider started and why the others did not, and closes everything on `close()`. It is
thread-safe, and one slow model does not hold up another. **No pipeline stage uses it yet**: YuNet and PP-HumanSeg run through OpenCV.
It is tested with fake factories (reuse, fallback order, CPU always last, recorded failures, concurrent `get`, close) and with one real
model through ONNX Runtime on the CPU provider.

## 7. Remaining gaps

* Nothing measured on any accelerator; the ranking `TensorRT > CUDA > DirectML > OpenVINO > CoreML > CPU` is a plausible default, not a result.
* No clean (idle machine) repeated measurement yet; the figures above vary too much to quote.
* Only one resolution was run for the browser tracker, with a fake camera and no hands.
* No microphone or audio/video-sync measurement here (see the audio work).
* A real-webcam procedure is a separate document; these benchmarks use synthetic or fake input on purpose, so they can be repeated.

## 3. Camera capture and live diagnostics

The control room reads the camera on its own thread (`LatestFrameGrabber`): the newest frame wins, an unread
frame is overwritten rather than queued, and every frame is stamped with when it arrived. A slow stage therefore
makes the studio **skip** frames, never show old ones. `GET /api/stats` (with the access token) carries a `diag`
block that is cheap to produce and never read inside the frame loop:

| Field | Meaning |
|---|---|
| `diag.camera.capture_fps` | frames per second the capture thread receives (sliding mean over 60 intervals) |
| `diag.camera.captured` / `skipped` | frames received / frames overwritten before anyone used them |
| `diag.frame_age_ms` | p50, p95, max: time from a frame's arrival to the start of processing |
| `diag.end_to_end_ms` | the same, to the moment the frame is published (arrival to output; excludes the browser) |
| `diag.process_ms` | time inside the pipeline |
| `diag.stage_mean_ms` | mean time per stage since the pipeline was built |
| `diag.cpu_percent` | this process's CPU time over wall time (100 = one core fully busy), sampled every 2 s |
| `diag.rss_mb` | this process's resident memory |
| `diag.source_outages`, `last_outage_s` | camera losses that recovered, and the length of the last one |

Each ring holds the last 120 frames, so nothing grows. The synthetic demo sources have no camera, so they leave
the camera and age fields empty.

```powershell
realx bench-camera --seconds 20 --json camera.json                  # your camera, nothing else running
realx bench-camera --seconds 20 --consumer-ms 80 --json slow.json   # a consumer slower than the camera
realx bench-camera --synthetic --seconds 5                          # no camera: checks the harness only
```

`bench-camera` measures the capture path only. It adds the conditions (how busy the CPU was before the run)
and the hardware, and refuses nothing silently: a camera that cannot be opened is an error, not a number.

### What has been measured, and what has not

* **Cloud container, synthetic source (harness check, not a camera):** at a 30 fps pace the harness reported
  30.0 fps capture. With a consumer that takes 100 ms per frame it delivered about 10 fps, skipped about 70% of the
  captured frames, and the frames it took were ~5 ms old at p50 (7.6 ms p95). That shows the *mechanism*
  (skip, don't delay). It says nothing about a webcam, a driver or Windows.
* **Not measured:** capture FPS, frame age, CPU or memory on the target laptop (Intel UHD 620, ~8 GB RAM) or with
  any real camera; DirectShow behaviour; recovery after unplugging a real camera (the recovery logic is tested
  with fakes in `tests/test_camera_grabber.py` and `tests/test_resilience.py`). Run the commands above on that
  machine and record the output in this file next to the machine description before quoting any number.
* **No target numbers are set here.** Targets should be written down only after real runs on the target hardware,
  with the `conditions.warning` field empty.

## Cold and warm modes (`realx bench --mode`)

```powershell
realx bench --mode both --cycles 5 --json bench-modes.json
```

* `--mode warm` (the default): one untimed run to warm everything up, then `--cycles` timed runs.
* `--mode cold`: before every one of the `--cycles` runs the process caches are cleared and the stages are built again, so the
  first-frame cost is part of every run. `--mode both` does the two in turn.
* `--cycles N`: 1 to 50, default 3. A cycle is one full pass over the pre-rendered frames on freshly built stages. Its fps counts
  every frame plus the stage setup time (nothing is excluded, unlike the separate timing pass above).
* Per resolution and mode the report gives average, fastest and slowest cycle fps, `relative_fps` (average divided by fastest, 1.0
  meaning every cycle was as fast as the best) and the first frame including setup (mean, p50, p95). With `both`, `cold_vs_warm_fps`
  is the cold average divided by the warm average.
* The JSON keeps the hardware record and adds `config.mode`, `config.cycles` and `results[].modes` (same `realx-bench/1` schema; the
  new block is optional and checked when present). The printed table has a `mode` line and one line per mode under each resolution.

What "cold" clears: Python garbage left by the previous cycle, and every stage and its model, because the stages are rebuilt. No
pipeline stage uses `runtime.SessionCache` yet, so there is no ONNX session cache to empty; when one is in use, pass its clearing
function as `clear_caches` to `run_benchmark`. The operating system's file cache is not cleared, so cold means "this process starts
over", not "after a reboot".

No figures are quoted here: none have been measured for this feature yet. The tests use fake clocks and fake stages only and check
the bookkeeping, not speed.

## 8. DirectML A/B on the Intel UHD 620 (2026-10-15)

Question (FACEFUSION-STUDY idea 1): does `onnxruntime-directml` speed up YuNet and PP-HumanSeg on this laptop?

**Short answer: no. DirectML ties on PP-HumanSeg, is about 2x slower on YuNet, and costs 1 to 36 s of session creation. Do not add a DirectML default; no `runtime.py` change is proposed.**

**Setup.** Same laptop as section 4 (i5-8365U, UHD 620, 7.8 GB RAM, Windows 11 22000, Python 3.14.6, OpenCV 5.0.0, numpy 2.5.4). Two venvs on D:, one with `onnxruntime` 1.31.0 (providers `Azure`, `CPU`), one with `onnxruntime-directml` 1.24.4 *instead of* it (providers `Dml`, `CPU`). `DmlExecutionProvider` was confirmed in `get_available_providers()`. Licence of `onnxruntime-directml` 1.24.4: MIT (package metadata). Models: the pinned YuNet 2023mar and PP-HumanSeg 2023mar from `realx models`.

**The `realx bench` A/B cannot show a difference.** The bench stages call OpenCV (`cv2.dnn`, `stages/background.py:137`); nothing in `src/` runs a model through ONNX Runtime except the unused `SessionCache`. Four `realx bench --background --resolutions 640x480 --frames 90 --stream-seconds 8` runs (2 per venv, interleaved) confirm it, and all four carried the "CPU already 39-61% busy" warning, so none is representative:

| venv | run | detect mean (p50) | bg_replace mean (p50) | stream pass |
|---|---|---|---|---|
| ORT 1.31 CPU | 1 | 30.8 (29.5) ms | 144.5 (140.3) ms | 51/240 delivered |
| ORT 1.31 CPU | 2 | 29.0 (28.9) ms | 133.3 (130.9) ms | 49/240 |
| ORT-DirectML 1.24.4 | 1 | 29.2 (27.8) ms | 134.9 (128.5) ms | 48/240 |
| ORT-DirectML 1.24.4 | 2 | 29.8 (27.3) ms | 138.6 (127.7) ms | 42/240 |

Differences are inside the run-to-run spread, as expected. (Side observation: with `--background` on a busy machine the full pipeline manages about 6 fps, 90% of it in `bg_replace`; the matte stage is the bottleneck, not detection.)

**Direct ONNX Runtime micro-benchmark** (`ortbench.py`, kept outside the repo): one session per model, 10 warm-up then 100 timed `run()` calls on a fixed random input (YuNet 1x3x640x640, PP-HumanSeg 1x3x192x192), 3 interleaved rounds. A third configuration, CPU provider inside the 1.24.4 venv, separates the ORT version from the provider. Median ms per call (p95 in brackets); CPU load % before the round in the last column.

| round | config | YuNet p50 (p95) | PP-HumanSeg p50 (p95) | CPU busy before |
|---|---|---|---|---|
| 1 | CPU, ORT 1.31 | 68.4 (181.8) | 40.7 (94.3) | 100% **contended** |
| 1 | CPU, ORT 1.24.4 | 37.6 (149.0) | 16.0 (19.1) | 94% **contended** |
| 1 | DirectML | 37.1 (60.1) | 13.2 (14.3) | 100% **contended** |
| 2 | CPU, ORT 1.31 | 20.2 (31.8) | 15.8 (21.7) | 38% |
| 2 | CPU, ORT 1.24.4 | 17.2 (22.0) | 13.7 (15.6) | 21% |
| 2 | DirectML | 33.6 (35.0) | 14.7 (18.3) | 47% |
| 3 | CPU, ORT 1.31 | 18.2 (27.5) | 15.2 (19.7) | 21% |
| 3 | CPU, ORT 1.24.4 | 27.8 (65.8) | 18.1 (25.0) | 24% |
| 3 | DirectML | 34.5 (57.6) | 13.7 (16.2) | 23% |

Rounds 2 and 3 are the least contended; no round was on an idle machine (other sessions shared the laptop, free RAM 0.5 to 1.4 GB), so treat all of it as indicative. Round 1 is excluded from the conclusions.

* **YuNet:** CPU 17 to 20 ms vs DirectML 34 to 35 ms in the quiet rounds, so DirectML is about 1.7 to 2x *slower*. This is outside the noise (DirectML's best single call, 29.6 ms, is slower than the CPU p50).
* **PP-HumanSeg:** CPU 13.7 to 15.8 ms vs DirectML 13.7 to 14.7 ms. A tie; the 1 ms difference is smaller than the spread.
* DirectML's one clear property is steadier tails under load (round 1 p95 14 ms vs 19 to 94 ms on CPU), because the work moves off the busy CPU. That is real but small in absolute terms and does not apply to a quiet machine.
* **Cost:** session creation took 0.9 to 2.0 s for YuNet and 29 to 36 s for PP-HumanSeg on DirectML (CPU: 0.05 to 0.4 s). First call 24 to 66 ms. A stage that waits 30 s to start is a regression for a live toggle.
* The ORT versions differ (1.31.0 vs 1.24.4: the DirectML wheel lags). The 1.24.4 CPU row shows the version makes no consistent difference (CPU 1.31 vs 1.24.4 YuNet 20.2/18.2 vs 17.2/27.8 ms) within this noise.

**Not measured:** other resolutions or batch sizes, power/thermal behaviour under sustained load, a GPU other than the UHD 620, and an idle machine. A different Windows GPU (the owner's other machine mentioned in AUDIT_REPORT) could behave differently; the same `ortbench.py` approach would answer that in a few minutes.

**Recommendation:** stop here. No opt-in provider flag is proposed for `runtime.py`; on this hardware it would add a 30 s start-up and slow detection for no gain. Revisit only if (a) a stage is actually moved onto `SessionCache`, and (b) measurements on a discrete or newer GPU show a win. The biggest speed lever found is not the provider but `bg_replace` (about 130 ms of a 170 ms frame in the contended run).

## 9. The face-mesh page pipeline on the real GPU (2026-10-16)

Question (the mission's acceptance item 5, `docs/MISSION.md`): how fast does the face-mesh page run with its features turned on one at a time,
on this laptop, with the real GPU renderer?

**Tool.** `scripts/bench_facemesh.py --headed --seconds 12 --settle 6` (a visible Chrome window; fake camera playing the astronaut portrait at
640x480; the photo is the same portrait cropped to show the shoulders; the page's own numbers are sampled once a second). It also records the
other Chrome processes already running, the WebGL renderer, whether the "Virtual face" label was visible while drawing, and how often the hand
model really ran.

**Machine.** Intel Core i5-8365U, Intel UHD Graphics 620, 8 GB RAM (about 2.5 GB free), Windows 11. Renderer, as reported by the page:
`ANGLE (Intel, Intel(R) UHD Graphics 620, Direct3D11)`: the real GPU, not a software renderer.

**Conditions: not clean, and this is the main finding about the measurement itself.** Every run had other Chrome windows open (18, 18 and 28
processes), plus other programs. No run is "representative", and the tool says so. The fake camera has no hand, so the hand model ran and found
none: costs with a real hand are **not** included. Three runs, same code except run 1 (before the hand idle back-off and its counter).

| Step | fps, runs 1 / 2 / 3 | face model ms | pose model ms | hand model ms | hair sheet ms |
|---|---|---|---|---|---|
| face only | 21.6 / 27.8 / 14.5 | 44.9 / 18.9 / 52.5 | - | - | - |
| + body and clothes | 19.8 / 12.3 / 23.1 | 27.0 / 42.5 / 24.0 | 26.2 / 33.6 / 22.5 | - | - |
| + hair that moves | 17.3 / 10.0 / 15.2 | 22.7 / 41.4 / 31.0 | 23.0 / 36.0 / 27.5 | 28.8 / 47.0 / 37.1 | 0.30 / 0.52 / 0.41 |
| + hands on top | 13.1 / 7.7 / 18.9 | 24.0 / 47.1 / 23.8 | 22.8 / 43.1 / 23.4 | 26.4 / 54.5 / 29.8 | 0.32 / 0.62 / 0.33 |
| + a spill on the shirt | 16.9 / 11.5 / 18.9 | 21.8 / 39.0 / 22.5 | 22.0 / 32.8 / 22.7 | 25.2 / 38.7 / 29.3 | 0.25 / 0.49 / 0.28 |

The label was visible in every sample where the page drew (all steps, all runs).

What this supports, and no more:

* **The step-to-step fps differences are noise.** The same step varied by up to 2.5x between runs (face only: 14.5 to 27.8 fps; hands on top:
  7.7 to 18.9 fps), and in run 3 adding the body made the page *faster* than face-only. Do not read the fps column as "each feature costs X".
  The first step is also measured while the page is still warming up (models loading, shaders compiling); the tool now discards a warm-up period.
* **The per-model costs are the stable part:** pose about 22 to 43 ms and hand about 25 to 54 ms per call on this GPU, in line with section 4
  (26 to 41 ms per model). The hair sheet and stains cost under 1 ms. The two MediaPipe models are what the body and hand features pay for.
* **Hand model back-off works as designed:** with no hand in view it ran 3.3 to 3.7 times a second (the 250 ms idle interval) instead of the
  nominal 10 to 20. Whether this raised the frame rate is **not shown**: run 2 (back-off) was worse than run 1 and run 3 was better, all within
  the noise above.
* **Against the 20 fps gate:** with everything on, the page spent most samples between 8 and 19 fps on this loaded laptop; face only or face plus
  body reached 20 in some runs. A reliable answer needs runs on an idle machine (close every other browser) and several repeats.
* **Not covered:** a real hand (so the hands-on-top and wiping costs), a real webcam, thermal drift over minutes, battery or power-saver mode.


## 10. The page pipeline after the pose cadence change (2026-10-17)

Same tool as section 9 (`scripts/bench_facemesh.py --headed --warmup 15`), real GPU (ANGLE Intel UHD 620 D3D11), 12 other Chrome processes
running (the owner's browser), so NOT representative; the fake camera has no hand. Two runs, before and after one change: the pose model is
now asked 4 times a second (was about every 70 ms) and the joints are eased toward its latest answer every frame.

| Step | fps before | fps after | pose ms | hand ms |
|---|---|---|---|---|
| face only | 20.7 | 21.4 | - | - |
| + body and clothes | 9.4 | 17.6 | 44 / 38 | - |
| + hair that moves | 7.8 | 13.8 | 45 / 36 | 54 / 46 |
| + hands on top | 8.9 | 13.2 | 38 / 38 | 50 / 48 |
| + a spill | 9.4 | 13.5 | 38 / 37 | 50 / 46 |

What this shows: the pose model was the main cost of the body option (it ran nearly every frame). With the shirt moving as one piece
and following slowly moving shoulders, asking it 4 times a second nearly doubles the frame rate. The face model (about 43 to 45 ms a frame)
is the floor: it caps the page at about 21 fps on this laptop, whatever else is on. The idle hand model (about 46 ms, 3.6 times a second)
is the next cost: its idle interval was then raised from 250 to 500 ms (not re-measured). Not covered: a real hand, a real webcam,
thermal drift, an idle machine.

Run 6 (same tool, after the frame-skip and the 500 ms idle hand polling). Caution: the face model itself measured 19 ms here against 43 ms in the earlier runs, so the laptop was far less loaded (the owner's other apps were closed); the gain is NOT all from the code change. Treat it as "the page now reaches 25 to 29 fps on this laptop when it is quiet", not as a like-for-like speedup.

| Step | fps |
|---|---|
| face only | 28.8 |
| + body and clothes | 25.7 |
| + hair that moves | 25.1 |
| + hands on top | 20.8 |
| + a spill | 24.2 |

All five steps are at 20 fps or more. Still not covered: a real hand, a real webcam, a hot laptop.
