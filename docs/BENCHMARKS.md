# Benchmarks

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
