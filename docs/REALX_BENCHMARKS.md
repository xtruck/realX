# realX performance: what is measured, and what is not (2026-10-20)

Short summary for decisions. The raw tables, commands and run conditions stay in `BENCHMARKS.md` (sections 1-10); this page only
adds the 2026-10-20 measurement and the list of gaps. Target machine: Intel Core i5-8365U, Intel UHD 620, 8 GB RAM, no NVIDIA GPU.

## Best numbers measured so far on the target laptop (owner's runs, `BENCHMARKS.md`)

| What | Result | Conditions | Trust |
|---|---|---|---|
| Face-mesh page, face only | 20.7 to 28.8 fps | real GPU (ANGLE D3D11, UHD 620), fake camera, headed Chrome; 12 other Chrome processes in most runs | medium: run-to-run spread up to 2.5x |
| Face-mesh page, all features | 13.2 (loaded) to 20.8-25.7 fps (quiet machine) | same | medium |
| Face model per frame | 19 to 45 ms | same; caps the page at ~21 fps on a loaded machine | the stable part |
| Pose / hand model per call | 22-44 ms / 25-54 ms | same | stable |
| Full-body tracker (control room) | ~25 fps GPU path, ~9 fps CPU path | fake camera | medium |
| Python pipeline (`realx bench`) | keeps up with 30 fps at 320x240 to 1280x720 | synthetic scene; ~40% run-to-run spread | medium |
| DirectML A/B | no gain on UHD 620, +30 s start-up | section 8 | done, conclusion: stay on CPU provider |

**Not measured at all on the target laptop:** a real webcam (every number above uses a fake camera), a real hand in view, the S13c
"Clean the edges" segmenter (added after the last benchmark run, on by default), the Stage 3 angle photos (PR #14, off by default),
p95 frame time, a 10-minute soak (thermal drift), battery / power-saver mode, end-to-end camera-to-screen latency.

## New measurement, 2026-10-20 (cloud container, NOT the target laptop)

**Question:** what does S13c "Clean the edges" cost when the browser has no usable GPU (software rendering, which also happens on a
Windows laptop when Chrome blocks the GPU driver)?

**Conditions:** Linux container, headless Chromium 1194, renderer `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader
driver)`, fake camera playing the public-domain astronaut clip, photo = the astronaut cropped. No real webcam. Script:
a one-off pytest measurement (`page.evaluate` of `window.__facemesh` plus a `requestAnimationFrame` gap recorder), kept outside the repo.

| | Value |
|---|---|
| One segmenter pass (`seamMs`, `performance.now()` round the synchronous `segmentForVideo` call) | **about 12 000 ms** |
| Time to get two answers after the photo is drawn | 99.7 s |
| Page frame gaps outside a pass, seam on / off (60 s each) | max 567 / 467 ms, p95 433 / 400 ms |

**Reading:** the pass runs on the page's main thread, so the picture freezes for its whole duration (about 12 s), then again after the
scheduler's back-off (cost / 0.15, about 80 s). Between passes the option costs little. On the target laptop's real GPU the pass cost is
**unknown**; if it is above about 250 ms the same freeze happens, in shorter form.

**Change made (2026-10-20, commit `3b93322`):** the option now turns itself off after one pass over 1 s, or two passes in a row over 250 ms,
and says so in the status line; clicking it retries. The two limits are first guesses. See `REALX_AUDIT.md`, section 5.

## Next measurements, in order

1. On the laptop: `chrome://gpu` (is WebGL hardware-accelerated?) and the face-mesh page's "Measure 10 s" line, idle machine.
2. `scripts/bench_facemesh.py --headed` once more, with S13c on and off, to get `seamMs` on the UHD 620.
3. The Stage 2 real-webcam checklist (`scripts/facemesh_baseline.md`), which also decides the 20 fps gate for Stage 3.
4. A 10-minute soak with the laptop on battery and on mains.
