# realX architecture as built (checked 2026-10-20, `main` at `5bbc096`)

This page describes what the code on `main` does today. `ARCHITECTURE.md` describes the long-term target (cloud GPU backend,
WebRTC, neural swap stages); most of that target does **not** exist. When the two disagree, this page describes the code.

## One process, three browser pages

```
realx serve  (Python, src/realx/server.py, http.server on 127.0.0.1 only, one per-run access token)
 |
 |-- Engine thread (server-side camera, "Path A")
 |     OpenCV camera index 0, 640x480 (or a synthetic scene)
 |     -> Pipeline (src/realx/pipeline.py): detect_yunet -> track -> one_euro -> rig [-> bg_replace] [-> avatar | debug_boxes]
 |     -> /stream.mjpg (MJPEG preview)  and  /ws/rig (head-rig numbers)
 |     Modes: Original, Tracking, Cartoon, Character. CPU only (OpenCV DNN); ONNX Runtime is not used by any stage.
 |
 |-- "/"          control room (web/index.html + app.js): mode, devices, quality, status, studio panel
 |-- "/avatar"    VRM character (three.js + three-vrm), driven by /ws/rig; this is the OBS Browser Source
 |-- "/dock"      small OBS dock
 |-- "/facemesh"  photo-on-face page ("Path C", the CPU edition of the mission): everything below runs IN THE BROWSER
 |
 '-- JSON API: /api/config, /api/stats, /api/hardware, /api/safety, /api/voice(s), /api/emote, /api/background, /api/dock,
     /api/facemesh/terms, /api/facemesh/consent, .../check, .../revoke  (+ .../check-batch on the Stage 3 branch, PR #14)
```

### Browser full-body tracking ("Path B", inside the control room and /avatar)

`getUserMedia` camera -> MediaPipe face, pose and hand landmarkers (WASM, GPU delegate with CPU fallback) -> scheduler ->
`BodySolver` -> `BodyFilter` (One-Euro, hold-and-fade) -> body message -> local renderer, and `/ws/rig?publish=1` -> server relay
-> OBS view. An optional microphone drives the mouth (Web Audio analyser, VAD). Camera pixels never leave the page.

### Face-mesh page (`/facemesh`, `webapp/src/facemesh/*`, bundled into `src/realx/web/facemesh.bundle.js`)

```
camera (getUserMedia, 640x480)                 user's own photo (file picker)
   |                                                |
   |  MediaPipe FaceLandmarker (478 points)        |  photo landmarks, head/hair/body masks (selfie multiclass), quality advice
   |  [+ pose 4/s, + hands, + live segmenter S13c] |  SHA-256 of the file -> signed consent record from the server
   v                                                v
 MeshCompositor (WebGL2, compositor.js): 898 photo triangles warped on the live mesh, head ring (hair, ears, neck),
 body/clothes puppet, hair sheet, stains, hands drawn live on top, lighting-only colour match, "Hold the mask" confidence fade
   |
   v
 canvas on screen  +  the "Virtual face" label (a DOM element, checked every frame by guard.js; drawing stops if it is hidden)
```

Rules the page keeps (enforced by tests): camera frames go to the GPU only through `uploadCamera` (`texImage2D`), never back to
JavaScript (no `readPixels`/`getImageData` on camera data, see `FACEMESH.md`, privacy section); consent is checked every 2 s with a
6 s grace; nothing is uploaded except the photo's hash and the consent record.

## Safety layer (cross-cutting)

| Piece | Where | Enforced by |
|---|---|---|
| Consent gate before any likeness stage, label, watermark after; no pixel edit after a watermark | `pipeline.py`, `safety/gate.py` | `PipelineConfigError` at build time; `tests/test_core.py`, `tests/test_cohost.py` |
| Signed, expiring, revocable consent records (HMAC, key id, domain separation) | `safety/consent.py`, `cohost.py`, `portrait_consent.py`, `facemesh_consent.py` | their tests |
| Visible "Virtual face" label on the face-mesh page | `webapp/src/facemesh/guard.js` | browser tests (`tests/test_facemesh_*`) |
| Watermark (LSB, authenticated payload) | `safety/watermark.py` | tests; **does not survive lossy compression** |
| Blocked models cannot be fetched | `models.py` | `tests/test_model_licenses.py` |
| Server: 127.0.0.1 only, token on every route (header, cookie, or `?token` on first GET only), exact Host, Origin and Sec-Fetch-Site checks | `server.py` | `tests/test_server.py`, `tests/test_facemesh_consent.py` |

## Models (fetched, never committed; `realx models fetch`, each SHA-256 pinned in `models.py`)

YuNet (face boxes, Python), PP-HumanSeg (background, Python), MediaPipe face / pose / hand landmarkers and selfie multiclass
segmenter (browser). Blocked: `inswapper_128`, `buffalo_l`, `liveportrait`, `liveportrait_animals`, `xpose`. Licences: `REALX_LICENSES.md`.

## Build and test

| What | Command | Notes |
|---|---|---|
| Browser bundles | `cd webapp && npm run build` | esbuild; writes `avatar.bundle.js`, `dock.js`, `facemesh.bundle.js`, copies the dock and face-mesh HTML (MediaPipe WASM is vendored in `web/mp`). Rebuilt on 2026-10-20: identical to the committed files |
| Node tests | `cd webapp && npm test` | 358 tests, about 4 s |
| Python tests without a browser | `python -m pytest -q -m "not browser"` | 649 tests, about 2 min 15 s here |
| Browser tests | `python -m pytest -q -m browser` | 108 tests, real Chromium; about 10 min in CI, about 30 min on a software renderer |
| CI | `.github/workflows/ci.yml` | three parallel jobs: python, browser, webapp (+ `npm audit`) |

## Parts that exist but nothing uses

- (Removed 2026-10-20 at the owner's request: the 28 MB onnxruntime-web runtime in `src/realx/web/ort/`, its `/ort/` route,
  `webapp/src/utils/onnxInference.js` and the npm dependency. No page loaded them; they came with commit `793bdd9`.)
- `runtime/providers.py` `SessionCache`: tested with fakes, used by no stage.
