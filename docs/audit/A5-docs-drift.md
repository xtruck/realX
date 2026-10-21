# A5 documentation drift: change log (2026-10-21, branch `audit-docs-drift`)

Finding: `docs/REALX_AUDIT.md` section 4 point 3. No code and no `docs/PROGRESS.md` change.

## Changes

| File | Change | Verified in |
|---|---|---|
| `docs/ROADMAP.md` | Status banner added at the top (built / aspirational, pointers to `REALX_*`). Nothing deleted. | No WebRTC anywhere: `grep -rli "webrtc\|RTCPeerConnection" src webapp/src` returned no source file. Face-mesh route: `src/realx/server.py` (`/facemesh`). |
| `docs/ARCHITECTURE.md` | Status banner added at the top. Nothing deleted. | Registered stages listed from `grep '@register(' src/realx`: voice_*, audio_watermark, rig, bg_replace, passthrough, smooth, one_euro, consent_gate, swap_stub, disclosure, watermark, portrait_animate, detect_yunet, track, debug_boxes, avatar. No `source`, `align`, `restore`, `mask` or `composite` stage exists. Provider/session cache: `src/realx/runtime/providers.py`. |
| `docs/MISSION.md` | "Next, in order" rewritten, each step marked done / partly done / open with proof. | See below. |
| `README.md` | One bullet added to "What works today" for the `/facemesh` page (the main current feature was missing). Nothing else was wrong. | `src/realx/server.py` serves `/facemesh` and `/facemesh.bundle.js`; PROGRESS and BENCHMARKS for the test status. |

## MISSION.md step by step

1. Benchmark on real GPU: done for the Intel UHD 620 only. `docs/BENCHMARKS.md` sections 9, 10, 11. **The task said "section dated 2026-10-21"; no such section exists.** The latest is section 11, dated 2026-10-20 (renderer ANGLE Intel UHD 620, no other Chrome, "representative"). MISSION.md cites section 11 and says so. No discrete GPU claim made.
2. Hand skin tone: done as S10h. `docs/PROGRESS.md` line "S10h hand skin-tone matching (2026-10-16)"; `tests/test_facemesh_skin.py` exists.
3. Cadence gating: partly done. `webapp/src/facemesh/page.js`: `POSE_EVERY_MS = 250`, `HAND_EVERY_MS = 100`, `HAND_EVERY_MS_TOP = 50`, `HAND_IDLE_MS = 500` and its use in `coverNow`. `webapp/src/body.js` `class Stagger`, used only in `webapp/src/tracker.js` (the avatar tracker), not in the face-mesh page. Numbers: BENCHMARKS section 10 (9.4 to 17.6 fps), section 11 (20 fps gate met with the body on only with Clean the edges off).
4. OBS validation of `/facemesh`, virtual camera: open. Only the avatar route is documented (`docs/OBS.md`, `scripts/windows/obs-check.ps1`); no virtual-camera code in `src/`.
5. Soak: open. `grep -i "soak\|thermal"` in `webapp/src` and `scripts/*.py` found nothing; PROGRESS mentions it only as planned.
6. Path B and per-identity training: open, not started. `src/realx/remote.py` has no transport for frames; `docs/REMOTE.md` allows head-rig numbers only.

## Left alone (could not verify here)

- `README.md` "Measured results" (i5-7300U table, 99% real-webcam figure): measurements from earlier sessions; I could not rerun them (no Python, no camera in this session) and did not change them.
- `ROADMAP.md` "Verified status (2026-10-14)" and the priority table: left as dated history; the banner says it is stale rather than rewriting claims I could not re-test.
- `MISSION.md` acceptance table (rows 1-8): row 8 says the benchmark is "implemented in this commit" (stale wording) and row 5 cites only BENCHMARKS section 9; not touched because the task covered the list only. Candidate for a follow-up.
- README bullets on voices, full-body tracking, background replacement: spot-checked (`realx voices`, `--avatar`, `--offline`, `REALX_OFFLINE`, presets pip/bear/imp/robot/radio, `normalize_peak`, `AudioDelay`, 52 blendshapes, PP-HumanSeg model spec exist); leg/finger tracking and the "stays locked" figures not re-verified.
- No tests were run (docs-only change).
