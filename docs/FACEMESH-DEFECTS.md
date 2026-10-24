# Face-mesh defects on a real webcam (Stage 2 results)

**Empty on purpose.** Nobody has judged the photo-on-face compositor on a real webcam yet. This page is filled in by the
owner from `scripts/facemesh_baseline.md` (17 items, screenshots `fm-NN-....png`, and `facemesh-baseline.json`). Agents do not start
the camera and do not fill in the observation columns.

Until a row has an owner observation, nothing here is evidence: every setting and threshold in `webapp/src/facemesh/` is a first
guess tested on synthetic landmarks and fake cameras only (`CPU-STATUS.md`, `PROGRESS.md`).

## Session record (once)

| Field | Value |
|---|---|
| Date | |
| Laptop / CPU / GPU | |
| Chrome version | |
| Delegate shown on the page (GPU / CPU) | |
| Renderer printed by the benchmark (must not be SwiftShader) | |
| Photo file | |
| Photo check score (/100) and problems listed | |
| realX commit (`git rev-parse --short HEAD`) | |

## Defects, from the checklist items

Severity: 0 nothing seen, 1 visible if you look for it, 2 visible at a glance, 3 breaks the illusion.

| # | Item (checklist number) | Where on the face / what looks wrong | Severity 0-3 | fps / found / ms / p95 | Screenshot |
|---|---|---|---|---|---|
| 1 | Frontal, still, neutral | | | | `fm-01-frontal.png` |
| 2 | Yaw 15° | | | | `fm-02-yaw15.png` |
| 3 | Yaw 30° | | | | `fm-03-yaw30.png` |
| 4 | Yaw 45° | | | | `fm-04-yaw45.png` |
| 5 | Yaw 15°, Hold 0% | | | | `fm-05-yaw15-hold0.png` |
| 6 | Yaw 30°, Hold 0% | | | | `fm-06-yaw30-hold0.png` |
| 7 | Yaw 45°, Hold 0% | | | | `fm-07-yaw45-hold0.png` |
| 8 | Yaw 30° to the right | | | | `fm-08-yaw30-right.png` |
| 9 | Talking | | | | `fm-09-talking.png` |
| 10 | Wide smile, teeth | | | | `fm-10-smile.png` |
| 11 | Glasses off | | | | `fm-11-glasses-off.png` |
| 12 | Glasses on | | | | `fm-12-glasses-on.png` |
| 13 | Bright room | | | | `fm-13-bright.png` |
| 14 | Dim room | | | | `fm-14-dim.png` |
| 15 | Hand near the face | | | | `fm-15-hand-near.png` |
| 16 | Hand partly over the face | | | | `fm-16-hand-over.png` |
| 17 | Whole head on | | | | `fm-17-whole-head.png` |

## Ranking (worst first)

| Rank | Defect | Items | Severity | Fix idea (written only after the owner's rank) | Status |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

## Safety observations

| Question | Answer (yes / no, item) |
|---|---|
| Did the "Virtual face" label disappear or get covered at any point? | |
| Did the photo pause, end or ask for consent again during the run? What did the status line say? | |
| Anything that flickered frame to frame (where)? | |
