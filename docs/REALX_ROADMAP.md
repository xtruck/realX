# realX roadmap by priority (2026-10-20)

Ordered P0 (security) to P5 (product), as the 2026-10-20 mission asks. `ROADMAP.md` keeps the long-term milestones (M0-M7) and their
status; this page is the working order. Each item says how it will be known to be done. Nothing moves up a level by being written here:
an item is "done" only when its check has been run.

## P0: security and safety (no open issue found on 2026-10-20)

| Item | State | Check |
|---|---|---|
| Server on 127.0.0.1 only, token on every route, Host/Origin/Sec-Fetch-Site checks | holds (code read, `_BoundedServer(("127.0.0.1", port))`, `hmac.compare_digest`) | `tests/test_server.py`, CI green |
| Consent gate, "Virtual face" label, watermark in every path | holds; the S13c auto-off added today touches none of them (Node source check) | browser tests |
| Camera pixels never read back | holds | Node source checks on `compositor.js`, `seams.js`, `seammask.js` |
| Blocked models cannot load | holds | `tests/test_model_licenses.py` |
| Every fetched model has a primary-source licence | holds: the last open one, the selfie multiclass card, was read 2026-10-20 (Apache-2.0) | `REALX_LICENSES.md` |
| Open: watermark does not survive compression; no C2PA | known, M4 | - |

## P1: it runs reliably

| # | Item | Done when |
|---|---|---|
| 1 | PR #18 (two flaky face-mesh browser tests): merged 2026-10-20 (`4347b74`) | done |
| 2 | S13c auto-off: on the laptop it **did** trigger, on the one-off first pass (6.5-8.3 s; later passes about 26 ms). Fix: branch `seam-warmup-pass` | `seam` stays "on" on the UHD 620 |
| 3 | Laptop GPU: the benchmark's renderer is `ANGLE (Intel, UHD Graphics 620, Direct3D11)`, i.e. hardware-accelerated (2026-10-20) | done |
| 4 | Stage 2 real-webcam checklist (`scripts/facemesh_baseline.md`), then `docs/FACEMESH-DEFECTS.md` | owner's results |

## P2: performance

| # | Item | Done when |
|---|---|---|
| 1 | `seamMs` on the UHD 620: measured 2026-10-20 (`BENCHMARKS.md` section 11): about 26 ms, so 250 ms / 1 s leave a wide margin | done |
| 1b | The one-off 6.5-8.3 s freeze of the first S13c pass: warm the model up before the photo is shown, or accept it | owner decision |
| 1c | Bisect the body-step slowdown (25.7 fps on 2026-10-17, 15.7-17.4 on 2026-10-20) | the commit that costs it, then a fix |
| 2 | Decide whether S13c stays on by default once its real cost is known | owner decision with numbers |
| 3 | 10-minute soak, mains and battery | a run with p95 frame time |
| 4 | Stage 3 20 fps gate (PR #14 stays unmerged until then) | bench with angle photos |

## P3: visual quality

Stage 3 (angle photos, PR #14) judged on a real webcam; then the defects the Stage 2 checklist ranks highest. Owner's earlier report:
"face fake" beyond the S12 fixes is the photoreal limit of a warped photo (`CPU-STATUS.md`).

## P4: new capabilities

`PHOTOREAL-NEXT.md` (draft until Stage 3 results): a Gaussian-splat render-speed spike with MIT-licensed renderers only; every
identity model listed there is non-commercial or unverified. Remote GPU needs a written decision first (`MISSION.md`, decision 3).

## P5: product

Pick a product licence (no `LICENSE` file exists), installer, the OBS virtual camera validation. (The unused 28 MB onnxruntime-web
assets were removed on 2026-10-20.)
