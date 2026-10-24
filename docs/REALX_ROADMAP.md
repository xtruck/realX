# realX roadmap by priority (2026-10-20, statuses updated 2026-10-24)

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
| 2 | S13c auto-off: on the laptop it **did** trigger, on the one-off first pass (6.5-8.3 s; later passes about 26 ms). Fix: the first pass is never judged (PR #23, merged 2026-10-20; the branch `seam-warmup-pass` is still on GitHub). Tested with Node tests and a benchmark note; the owner then turned S13c **off by default** (cost, item P2 2), so "seam stays on" is only true when the option is switched on | done (code); the warm-up freeze itself is P2 1b |
| 3 | Laptop GPU: the benchmark's renderer is `ANGLE (Intel, UHD Graphics 620, Direct3D11)`, i.e. hardware-accelerated (2026-10-20) | done |
| 4 | Stage 2 real-webcam checklist (`scripts/facemesh_baseline.md`), then `docs/FACEMESH-DEFECTS.md` | owner's results |

## P2: performance

| # | Item | Done when |
|---|---|---|
| 1 | `seamMs` on the UHD 620: measured 2026-10-20 (`BENCHMARKS.md` section 11): about 26 ms, so 250 ms / 1 s leave a wide margin | done |
| 1b | The one-off 6.5-8.3 s freeze of the first S13c pass: warm the model up before the photo is shown, or accept it | owner decision |
| 1c | Body-step slowdown: caused by S13c at 5 passes a second (off: 24.2 fps with the body, all steps over 20). S13c off by default since 2026-10-20 | done |
| 1d | S13c at a lower rate: `bench_facemesh.py --headed --edges-hz 2` and `1` on the laptop; keep the rate that stays over 20 fps, if any | owner's runs |
| 2 | S13c default: **off** (owner, 2026-10-20) | done |
| 3 | 10-minute soak, mains and battery | a run with p95 frame time |
| 4 | Stage 3 20 fps gate. PR #14 was **merged 2026-10-22** (option off by default), so the gate is now a check to run, not a merge condition. `bench_facemesh.py` has a Stage 3 step with synthetic side photos | a laptop run of the Stage 3 step (owner) |

## P3: visual quality

Stage 3 (angle photos, PR #14, merged) judged on a real webcam; then the defects the Stage 2 checklist ranks highest. Owner's earlier report:
"face fake" beyond the S12 fixes is the photoreal limit of a warped photo (`CPU-STATUS.md`).

## P4: new capabilities

`PHOTOREAL-NEXT.md` (draft until Stage 3 results): a Gaussian-splat render-speed spike with MIT-licensed renderers only; every
identity model listed there is non-commercial or unverified. Remote GPU needs a written decision first (`MISSION.md`, decision 3).

## P5: product

Pick a product licence (no `LICENSE` file exists), installer, the OBS virtual camera validation. The virtual camera output itself exists since PR #29 (merged 2026-10-22, off by default, `VCAM.md`): the visible bar survives both camera routes measured, the LSB watermark survives Softcam but not OBS's NV12 path; the Zoom/Meet/WhatsApp matrix in `SOFTCAM.md` is still the owner's to fill in. (The unused 28 MB onnxruntime-web
assets were removed on 2026-10-20.)
