# A2: acceleration study for the Intel UHD 620 (research only)

Written 2026-10-21 on branch `audit-accel-study`. No package was installed and no benchmark was run (the machine had to stay idle).
Target machine: Intel Core i5-8365U, integrated Intel UHD 620 (1 GB), Windows 11, CPU-only Python pipeline, browser path already on the GPU.

Convention: **[S]** = stated by the cited source; **[R]** = measured in this repo (`docs/BENCHMARKS.md`, not an idle machine); **[I]** = my inference;
**[U]** = unverified (no primary source found). Licences are of the component, not legal advice. Policy: permissive only.

## 0. What the repo already shows

* [R] `docs/BENCHMARKS.md` (ONNX Runtime micro-benchmark, "ortbench.py", kept outside the repo; rounds 2 and 3, the least contended): YuNet 640x640 on CPU
  17 to 20 ms, on DirectML 34 to 35 ms (DirectML about 1.7 to 2x slower). PP-HumanSeg 192x192: CPU 13.7 to 15.8 ms, DirectML 13.7 to 14.7 ms (tie).
  DirectML session creation: 0.9 to 2.0 s (YuNet), 29 to 36 s (PP-HumanSeg). CPU session: 0.05 to 0.4 s.
* [R] Same file: a full pipeline with `--background` spends about 90% of its time in `bg_replace` (130 to 140 ms per frame) although the PP-HumanSeg model call is only
  about 14 ms. [I] So the segmentation model is not the bottleneck; about 115 ms per frame is spent elsewhere in the stage (pre/post-processing, resize, blur, compositing). Accelerating the model cannot fix that.
* [R] Browser path: S13c (segmenter at 5 Hz) doubled the face model time on the shared GPU (30 to 62 ms); the 20 fps gate fails with the body on (14 to 17 fps; 24.2 fps with S13c off).
  [I] The browser path is GPU-contention bound, not model-bound.
* [R] The task brief mentioned a "2026-10-21 idle-machine section" of BENCHMARKS.md. It is **not present on this branch**; the figures above are the contended ones. Re-read after that section is merged.
* Code: `src/realx/runtime/providers.py` ranks TensorRT, CUDA, DirectML, OpenVINO, CoreML, CPU. `onnxruntime_session_factory` passes `providers=[provider]` with **no provider options**, so the OpenVINO device (CPU/GPU/NPU) cannot be chosen.
  [I] Given [R] above, DirectML ranking above CPU is not supported by data for these two models; DirectML only wins on tail latency under CPU load.

## 1. ONNX Runtime execution providers that can use the UHD 620

### DirectML (`onnxruntime-directml`)
* [S] Needs a DirectX 12 capable device; the list includes "Intel Haswell HD Integrated Graphics and newer"; DirectML introduced in Windows 10 1903. https://onnxruntime.ai/docs/execution-providers/DirectML-ExecutionProvider.html
  [I] UHD 620 qualifies; Windows 11 is fine.
* [S] Same page: session must use sequential execution and `enable_mem_pattern=False`; best "when tensor shapes are known at the time a session is created"; opset up to 20; "DirectML is in sustained engineering" (new feature work moved to WinML).
  [I] The sustained-engineering note makes it a poor long-term bet.
* [S] Python wheel `onnxruntime-directml` 1.24.4, 2026-03-17, MIT, Windows x86-64, Python 3.11 to 3.14. https://pypi.org/project/onnxruntime-directml/
* Licence: ONNX Runtime MIT [S] https://github.com/microsoft/onnxruntime/blob/main/LICENSE ; wheel MIT [S] (PyPI above).
  **The DirectML runtime itself (`Microsoft.AI.DirectML`) is not MIT:** "Microsoft Software License Terms", redistribution allowed "in applications and services you develop", use limited to Windows and Xbox, reverse engineering barred [S] https://www.nuget.org/packages/Microsoft.AI.DirectML/1.15.4/License .
  [I] It is a proprietary, Windows-only redistributable. Against a "permissive only" policy this needs an explicit owner decision (likely fine as a runtime dependency the user installs, less clear if bundled; not legal advice). `docs/LICENSE-AUDIT.md` lists ONNX Runtime as allowed but says nothing about DirectML.dll.
* Expected speedup class for YuNet-sized detectors: [S] no source gives a number. [R] measured here: slower than CPU (about 0.5x) for YuNet, a tie for PP-HumanSeg. [I] Small models are dominated by dispatch and memory transfer on an iGPU that shares DRAM with the CPU; expect "none to negative" for models with a few ms of compute. Treat as unsupported for these models unless the idle-machine rerun contradicts [R].

### OpenVINO (`onnxruntime-openvino`)
* [S] The EP targets Intel CPUs, integrated and discrete GPUs and NPUs; `device_type` accepts `CPU`, `GPU`, `NPU`, `AUTO`, `HETERO`, `MULTI`; `precision` FP32/FP16; "FP16 generally provides ~2x better performance on GPU/NPU with minimal accuracy loss"; model caching "significantly reduce[s] subsequent load times". https://onnxruntime.ai/docs/execution-providers/OpenVINO-ExecutionProvider.html
  [S] On that page `onnxruntime-ep-openvino` (plugin EP) is the recommended package and `onnxruntime-openvino` is marked legacy/deprecated; several options (`precision`, `cache_dir`, `num_of_threads`...) are deprecated since ORT 1.23 in favour of `load_config`. The compatibility table lists ORT 1.24.1 with OpenVINO 2025.4.1.
* [S] `onnxruntime-openvino` 1.24.1, 2026-02-26, MIT, Windows x86-64 wheels for Python 3.11 to 3.13; on Windows the OpenVINO PyPI package must be installed separately. https://pypi.org/project/onnxruntime-openvino/
* Licence: OpenVINO Apache-2.0 [S] https://github.com/openvinotoolkit/openvino/blob/master/LICENSE ; ORT wheel MIT [S]. Both permissive. The Intel GPU driver is a user OS component [I].
* [U] Whether the OpenVINO GPU plugin still supports Gen9.5 graphics (UHD 620) on Windows 11 with a current driver: the pages I could fetch (system requirements, GPU device page, Intel support article 000057396) were too large or only pointed to the hardware list. A secondary source (a fork of the `intel_gpu` source tree) says Gen8 and newer. **Verify by creating one session**; do not assume.
* [U] Whether the new plugin package `onnxruntime-ep-openvino` has a stable Python recipe: I could not read its install steps. The experiments below use the legacy package, which has a wheel.
* Expected speedup class: [S] only the generic "~2x with FP16 on GPU" claim, not for UHD 620 or small detectors. [I] A gain on a 640x640 YuNet is plausible if FP16 runs on the iGPU, but [R] shows the same iGPU gave no gain through DirectML; the realistic prior is "0.7x to 1.3x of CPU time for YuNet". OpenVINO's **CPU** device (`device_type="CPU"`) is also worth testing because it uses different CPU kernels than ORT's [I]; no source quantifies it.
* [I] Startup: DirectML needed 30 s for PP-HumanSeg; OpenVINO GPU also compiles kernels at first load, so a cache is mandatory for a live toggle.

### Others
* TensorRT/CUDA need NVIDIA (not applicable); CoreML is macOS. [I]
* Windows ML (WinML) is where Microsoft says DirectML development moved [S] (DirectML page above); I did not research an ORT-WinML Python path: [U].

## 2. Browser: WebNN and WebGPU on Chrome 155

* WebNN status: [S] Intent to Experiment (Dec 2025): origin trial planned M145 to M147; delayed repeatedly; on 2026-02-24 delayed again with no starting milestone. https://groups.google.com/a/chromium.org/g/blink-dev/c/5CWKSChYo98 .
  [S, secondary] Phoronix says Chrome 146 beta carried an origin trial https://www.phoronix.com/news/Chrome-146-Beta ; a search summary reported a later plan of M147 to M149 and a March 27 disable (could not re-verify). Microsoft's Edge-hosted WebNN trial page is marked closed, expiry 2026-08-11. https://developer.microsoft.com/microsoft-edge/origin-trials/trials/19857284-cf52-484b-8b09-8ca50ac9dccb
  **[U] Chrome 155 status:** no source found for M149 to M155. [I] Assume "not shipped by default"; check on the machine with `chrome://version` and https://chromestatus.com/feature/5176273954144256 (ID taken from the intent).
* [I] Even if available, WebNN would be reached through ONNX Runtime Web's WebNN EP, so you must ship your own ONNX models. The current segmenter and landmarkers are MediaPipe `.task`/`.tflite` run by MediaPipe's own runtime, which WebNN does not accelerate. Converting the Face Landmarker/Blendshape models to ONNX is a separate licence-and-parity project ([U]).
* WebGPU: [S] shipped in Chrome 113 on Windows with Direct3D 12. https://developer.chrome.com/docs/web-platform/webgpu/overview . [S] ONNX Runtime Web: "available out-of-box in latest versions of Chrome and Edge on Windows"; enable with `onnxruntime-web/webgpu` and `executionProviders: ['webgpu']`; light models may be better on WASM; graph capture only for static shapes. https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html
* MediaPipe delegate: [S] `BaseOptions.delegate` accepts CPU or GPU, default CPU. https://developers.google.com/edge/mediapipe/solutions/setup_web . [U] The primary docs I fetched do not say whether the GPU delegate uses WebGL or WebGPU in tasks-vision 0.10.21. The task brief says WebGL; not independently confirmed.
* Licences: MediaPipe tasks-vision, WASM, models Apache-2.0 (already audited in `docs/LICENSE-AUDIT.md`); onnxruntime-web is MIT as part of the ORT repo [I; the npm licence field was not fetched].
* Verdict [I]: **no evidence that WebNN or WebGPU would beat the current MediaPipe GPU path on this machine**, and three reasons it may not: (1) same 1 GB shared-memory iGPU, so the contention in [R] is unchanged; (2) the measured limit is contention between models, not a slow backend; (3) a port needs different (ONNX) models. The cheap browser lever is scheduling/delegate choice (experiment E4), not a new backend.

## 3. INT8 quantisation of models already used

| Model in use | Licence | INT8 available | Source numbers | Risk |
|---|---|---|---|---|
| YuNet `face_detection_yunet_2023mar.onnx` | MIT [S] https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet | `..._2023mar_int8.onnx` and `..._int8bq.onnx` in the same directory (MIT) | WIDER-Face AP easy/med/hard: fp32 0.8844/0.8656/0.7503, int8 0.8810/0.8629/0.7503, int8bq 0.8845/0.8652/0.7504 [S] | low: at most 0.0034 AP |
| PP-HumanSeg `..._2023mar.onnx` | Apache-2.0 [S] https://github.com/opencv/opencv_zoo/tree/main/models/human_segmentation_pphumanseg | `..._int8.onnx`, `..._int8bq.onnx` | mIoU fp32 0.9164, block int8 0.9162, plain int8 **0.3642** (accuracy 0.7285) [S; mapping of the "quant" row to the plain int8 file is my reading] | plain int8 unusable; block int8 fine but weight-only |
| MediaPipe `.task`/`.tflite` models | Apache-2.0 (per LICENSE-AUDIT) | not investigated | n/a | [U] |

* [S] ORT guidance: static quantisation for CNNs; S8S8 + QDQ "should be the first choice"; S8S8 with QOperator "will be slow on x86-64 CPUs"; U8S8 on AVX2/AVX512 can saturate (try `reduce_range` or U8U8); no such problem on VNNI. Calibration: MinMax, Entropy or Percentile. https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
* [S] opencv_zoo quantises with ONNX Runtime (`quantize-ort.py`) and Intel Neural Compressor; block quantisation via `block_quantize.py --block_size 64`; the tool page states no licence and no accuracy. https://github.com/opencv/opencv_zoo/tree/main/tools/quantize
* [S] The upstream directory now also lists `face_detection_yunet_2026may.onnx` (dynamic input shape) as default. [I] Using it needs a new hash pin in `models.py` and a licence re-check; out of scope.
* [I] The i5-8365U (Whiskey Lake, AVX2) is, as far as I know, without VNNI, the case where ORT warns about U8S8 saturation; **[U] not checked against Intel ARK**. The published int8 files' settings are not stated [S], so test them, do not assume they are faster.
* [I] Block quantisation is weight-only, so activations stay float and no speed gain over fp32 is expected on a small conv net; it mainly shrinks the file.
* Licence note: a quantised derivative of an MIT/Apache model keeps that licence [I]; a pinned sha256 in `models.py` and a row in `LICENSE-AUDIT.md` are needed before use (repo rule).

## 4. Ranked experiments

All run in a **throw-away venv on drive E** (e.g. `E:\realx\scratch\venv-ov`), never in the project venv, on an idle machine, 3 interleaved rounds, reporting p50 and p95 and CPU busy % before each round (as `ortbench.py` does). "Baseline" = the ORT CPU result from the same session.

### E1. Find where `bg_replace` spends about 115 ms (no accelerator, highest leverage)
* Why: [R] the stage takes about 130 ms while the model call is 14 ms.
* Command: `python -m cProfile -o bg.prof -m realx bench --background --resolutions 640x480 --frames 60 --cycles 3 --json bg.json`, then `python -c "import pstats; pstats.Stats('bg.prof').sort_stats('cumtime').print_stats(25)"`.
* Measure: cumulative time per function inside the background-replacement stage under `src/realx/stages/` (resize, mask smoothing, blur, composite) and `bg_replace` mean/p50 in `bg.json`.
* Pass: the profile attributes at least 70% of the stage to named non-model steps (a concrete target). Success of a later fix: `bg_replace` p50 at 640x480 below 60 ms, and the stream pass delivers at least twice the current 42 to 51 of 240 frames.

### E2. OpenVINO EP on YuNet and PP-HumanSeg, GPU and CPU devices
* Setup: `python -m venv E:\realx\scratch\venv-ov`, then `pip install onnxruntime-openvino==1.24.1 openvino==2025.4.1 numpy` (Python 3.11 to 3.13 only [S]).
* Code (same micro-benchmark as `ortbench.py`: YuNet 1x3x640x640, PP-HumanSeg 1x3x192x192, 10 warm-up + 100 timed):
  ```python
  import onnxruntime as ort
  opts = [{"device_type": "GPU", "precision": "FP16", "cache_dir": r"E:\realx\scratch\ovcache"}]  # then {"device_type": "CPU"}
  s = ort.InferenceSession(model, providers=["OpenVINOExecutionProvider"], provider_options=opts)
  assert "OpenVINOExecutionProvider" in s.get_providers()
  ```
  If 1.24.1 rejects the deprecated `precision`/`cache_dir` keys, use `load_config` as on the EP page [S].
* Measure: session creation time cold and cached, first-call latency, p50/p95 per call, max abs difference of outputs vs CPU on the same input, and (YuNet) box IoU vs CPU on the astronaut portrait.
* Pass (adopt): p50 at most 0.7x of the ORT CPU p50 for YuNet on at least one device, cached session creation at most 3 s, output max abs diff under 1e-2 and box IoU at least 0.95. Stop: every p50 above 1.0x, or the GPU device failing to start (which also answers the Gen9 question [U]).
* If it passes: let `onnxruntime_session_factory` take provider options (so OpenVINO gets a `device_type`), keep CPU last, then run `realx bench --background --mode warm --cycles 5` before and after.

### E3. Published INT8 YuNet on the CPU provider
* Command: download `face_detection_yunet_2023mar_int8.onnx` and `_int8bq.onnx` from opencv_zoo into `E:\realx\scratch\models\` (not into the repo), record their hashes, run the same micro-benchmark with `providers=["CPUExecutionProvider"]`; then a local-only `ModelSpec` swap and `realx bench --resolutions 640x480 --frames 120 --cycles 5`.
* Measure: detect p50/p95; agreement with fp32 on at least 100 frames (the bench clip plus about 20 own photos): recall at IoU 0.5 and landmark pixel error.
* Pass: p50 at least 25% below fp32 (about 13 ms or less, from 17 to 20) and recall at least 0.98 of fp32's, median landmark error under 1 px at 640 px width. Otherwise reject (int8bq is expected to fail the speed test [I]).
* If it passes: add a pinned sha256 and a `LICENSE-AUDIT.md` row (MIT), keep fp32 as the fallback.

### E4. Browser: split delegates instead of changing backend
* Why: [R] contention between face, pose, hand and segmenter models is the measured limit; `delegate` is one global value in `webapp/src/tracker.js` (`build(key, factory, delegate, ...)`), and `scripts/bench_tracking.py` already has `--delegate auto|cpu|gpu`.
* Baseline: `python scripts/bench_facemesh.py --headed --seconds 12 --json base.json` and `python scripts/bench_tracking.py --headed --delegate cpu` / `--delegate auto`.
* Change: let pose and hands use the CPU delegate while face stays on GPU (one extra parameter in the `make()` calls), keep S13c off or at `--edges-hz 2`.
* Measure: `fps` per step (face, + body, + hair, + hands, + spill), `detectMs`, `poseMs`, `handMs`, and `delegates` in the report; the contention warning must be absent.
* Pass: "+ body and clothes" at least 20 fps (now 14 to 17 with S13c on, 24.2 off), `detectMs` below 40 ms with the body on (now about 62 ms), and no face-only fps loss above 10%.

### E5. DirectML re-check on an idle machine, then settle the ranking
* Command: existing `ortbench.py`, 5 interleaved rounds, venv pinned to `onnxruntime-directml==1.24.4`, with `enable_mem_pattern=False` and `execution_mode=ORT_SEQUENTIAL` [S].
* Measure: as in section 0, plus session creation time.
* Pass (keep DirectML above CPU in `PREFERENCE`): YuNet and PP-HumanSeg p50 at most 0.9x of CPU p50. Otherwise move `DmlExecutionProvider` and `OpenVINOExecutionProvider` below CPU for the integrated-GPU case or make them opt-in per model, and record the proprietary DirectML licence decision in `LICENSE-AUDIT.md`.

### Deliberately not proposed
* WebNN/WebGPU ONNX ports of the MediaPipe models: no evidence of gain, ONNX conversions with unchecked licences, WebNN availability in Chrome 155 unknown.
* INT8 of PP-HumanSeg: plain int8 mIoU 0.364 [S]; block int8 is weight-only; E1 suggests the model is not the bottleneck. Revisit only if E1 shows model time dominates.

## 5. What could not be verified

1. OpenVINO GPU plugin support for Gen9.5 (UHD 620) on Windows 11, and the driver version needed.
2. Status of WebNN in Chrome 155 (sources stop at 2026-02/03) and the flag name to enable it.
3. Whether MediaPipe tasks-vision's GPU delegate is WebGL or WebGPU.
4. Python recipe for the new `onnxruntime-ep-openvino` plugin package.
5. Any primary-source speedup number for small face detectors on UHD 620 (only the repo's own measurements exist).
6. i5-8365U instruction set (VNNI) not checked against Intel ARK; the onnxruntime-web npm licence field was not fetched.
7. The 2026-10-21 idle-machine benchmark section is not on this branch.
