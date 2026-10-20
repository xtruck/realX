# realX audit, 2026-10-20

Audit of `main` at `5bbc096`, done in a Linux cloud container (no webcam, no GPU: Chromium uses the SwiftShader software renderer).
It follows `AUDIT_REPORT.md` (baseline of 2026-10-14, kept as history). Companion pages: `REALX_ARCHITECTURE.md` (what the code is),
`REALX_ROADMAP.md` (order of work), `REALX_BENCHMARKS.md` (numbers and gaps), `REALX_LICENSES.md` (licence register).
**No real webcam was used for anything in this audit.** "Fake camera" below means Chromium playing a recorded clip.

## 1. Git state

| | |
|---|---|
| `main` | `5bbc096` (merge of PR #17), working tree clean before this audit |
| Open PRs | #14 `stage3-angle-photos` (3 commits ahead, 4 behind; its last CI run failed in a test that PR #18 fixes; **not to be merged before the webcam check and the 20 fps gate**), #18 `fix-flaky-facemesh-tests` (1 ahead; CI green: python, browser 108, webapp) |
| Other remote branches | 16 older branches (`feature/*`, `ff-*`, `claude/setup-ci-and-claude-md`, `fix/cohost-flaky-test`, `handoff-2026-10-14`) and 6 merged stage branches: **all fully contained in `main`** (checked after `git fetch --unshallow`: 0 commits ahead, 0 patches missing). Nothing was deleted; deleting them is the owner's call |
| CI on `main` | `5bbc096`: python, browser and webapp jobs all green (GitHub Actions, 2026-10-20) |

## 2. Tests run for this audit (all in the container)

| Suite | Command | Result | Time |
|---|---|---|---|
| Node | `cd webapp && npm test` | 358 passed (360 after this audit's change) | 4 s |
| Python, no browser | `python -m pytest -q -m "not browser"` | **649 passed**, 108 deselected | 2 min 15 s |
| Bundles | `npm run build`, then `git status` | identical to the committed bundles (reproducible) | - |
| Browser, all | `python -m pytest -q -m browser` (after the change) | 104 passed, 5 skipped (no PowerShell), see section 6 | 24 min 38 s |

No pre-existing failure was found. Known flaky tests: the two fixed by PR #18 (consent countdown text, "away from the face" pixel
comparison), and the live-timer test (fixed in #15).

## 3. Feature status

Five levels: **A** works and was tried for real (real camera, real GPU or the owner's machine); **B** works in automated tests only
(fake camera, software renderer, synthetic data); **C** partial; **D** written but never seen running; **E** absent.

| Feature | Level | Evidence / gap |
|---|---|---|
| Local server, token, 127.0.0.1, Host/Origin checks | B | tests; code read for this audit |
| Windows install script (`scripts/windows/install.ps1`) | A | the owner's run on 2026-10-20 succeeded (Python from D:, all models verified) |
| Model fetch with SHA-256 pinning, blocked models | B | tests; the owner's install fetched every model |
| Python face tracking (YuNet) | A (once) | 99% of frames on the owner's webcam, one run |
| Background replacement (PP-HumanSeg) | B | tests |
| Cartoon / Character VRM avatar, OBS Browser Source | B | Chromium tests; OBS itself not validated by the maintainers |
| Browser full-body tracking | C | the owner's first live test: lagging arms, untracked hands; fixes tested on a fake camera only |
| Microphone mouth | B | fake microphone only |
| Face-mesh page: photo on the live face, consent, label | A (earlier build) / B | the owner tried an earlier build on a real webcam ("neck not moving, hair not real, face fake"); S12 and S13 changes since then are B or D |
| Face-mesh S13c "Clean the edges" (on by default) | D, now with a safety valve | never seen on a real GPU; about 12 s per pass on a software renderer (section 5) |
| Face-mesh S13e "Hold the mask" | B | Node tests on synthetic faces |
| Stage 3 angle photos (PR #14, off by default) | D | not merged; never on a real webcam |
| Signed consent records, co-host vault, portrait consent | B | tests |
| Watermark | C | LSB, authenticated; does not survive lossy compression |
| Offline voice conversion | B | tests |
| ONNX Runtime providers / `SessionCache` | C | tested with fakes; no stage uses it; DirectML measured: no gain |
| Neural face swap, portrait animation | E (by design) | every candidate licence-blocked |
| Virtual camera, C2PA, content filter, remote GPU | E | studies only |

## 4. Top 3 problems

1. **Nothing on the face-mesh page has been measured with a real webcam since the S12/S13 changes, and the 20 fps gate is unproven
   with the current defaults.** The last laptop benchmark (`BENCHMARKS.md` section 10) predates S13c, which is on by default.
   Impact: P1/P2. Needs the owner's machine (`REALX_ROADMAP.md` P1.3-4, P2.1).
2. **S13c "Clean the edges" can freeze the page for seconds at a time.** Its segmenter pass is synchronous on the main thread; on a
   software renderer one pass took about 12 s (measured here), repeated about every 80 s. A laptop whose Chrome blocks the GPU driver
   gets the same. Impact: P2 (looks like a hang). **Fixed in this audit (section 5), commit `3b93322`.**
3. **Documentation drift.** `ARCHITECTURE.md` and `ROADMAP.md` describe a cloud/WebRTC/neural-swap target as if it were the design in
   use; `LICENSE-AUDIT.md` contradicted itself on GHOST; 28 MB of onnxruntime-web WASM is shipped and served but nothing loads it; the
   repository has no `LICENSE` file. Impact: P5, but it misleads decisions. Partly addressed: the `REALX_*` pages, the GHOST row, and
   one-line pointers at the top of the older pages.

## 5. The change made in this audit (commit `3b93322`, pushed to `main` at the owner's request)

**What:** S13c turns itself off when one segmenter pass is too slow: at once for a pass over 1 s, or after two passes in a row over
250 ms (one slow first pass is allowed, as the GPU warms up). The status line says "Clean the edges was turned off: one pass took
12.0 s on this computer and froze the picture. Click it to try again."; the button shows off; the probe reports `seam: "too slow"`.
Clicking the button retries with a fresh measurement.

**What it does not touch:** consent checks, the "Virtual face" label and its guard, the watermark, the photo itself, the privacy rules
(no new texture upload, no read-back). A Node test checks that the stop path names none of them.

**Files:** `webapp/src/facemesh/seams.js` (`SEAM.slowPassMs`, `SEAM.stopPassMs`, `seamTooSlow`), `seammask.js` (`lastMs`),
`page.js` (`stopSlowSeams`, retry resets), rebuilt `src/realx/web/facemesh.bundle.js`, `webapp/test/s13c.test.mjs` (+2 tests),
`tests/test_facemesh_dashboard.py` (+1 browser test; the live-timer test now switches S13c off in one step inside the page, because a
click could otherwise turn a self-stopped option back on).

**Validation:** Node 360/360. Both limits mutation-checked (changing "2 in a row" to 3, or removing the 1 s limit, fails a test).
Browser results: section 6.

**Limits:** 250 ms and 1 s are first guesses; the real cost on the UHD 620 is unknown. A pass still freezes the page once before the
option stops. Moving the segmenter off the main thread (worker or OffscreenCanvas) would remove the freeze entirely, but MediaPipe's
GPU path there was not studied.

## 6. Validation of the change (container, software renderer, fake camera; no real webcam)

| Suite | Result |
|---|---|
| Node (`npm test`) | 360 passed |
| Python, no browser | 649 passed |
| Browser, all (`pytest -m browser`) | **104 passed, 5 skipped** (PowerShell not available in the container), 0 failed, 24 min 38 s |
| New browser test, seen in the page state | the first pass took 14 283 ms; the option stopped (`seam: "too slow"`), the button showed off, the status line explained it, the page kept drawing at about 4.6 fps with consent `active`, the label guard empty (label shown) and the consent record intact; clicking again restarted loading |

A first version of the new browser test failed because it waited for `drawn` to grow; `drawn` counts triangles (898), not frames.
It now waits for `frames`. That was a test mistake, not a page fault.
