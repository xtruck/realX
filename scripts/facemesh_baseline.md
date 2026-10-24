# Face-mesh baseline checklist (Stage 2): run on your real webcam

Purpose: a written baseline of how the photo-on-face compositor looks and how fast it runs **before** any rendering change.
Nothing in `webapp/src/facemesh/` is changed in this stage. You fill this in; it becomes the evidence for
`docs/FACEMESH-DEFECTS.md`.

## Before you start (do this once)

1. Close every other browser window and tab (other tabs share the GPU and lower the fps).
2. Plug the laptop in (battery saving lowers the fps).
3. `realx models fetch`, then `realx serve`, then open the printed link and go to `/facemesh` (same token).
4. Choose **one** photo of yourself and use it for every item: front-on, eyes open, mouth closed, even light, no glasses.
   Write its name here, and the "Photo check" score the page shows before the consent question:
   - Photo file: ______________________ Photo check score: ____ / 100 Problems listed: ______________________
5. Give consent (tick the statement, Allow). The "Virtual face" label must stay on screen in **every** screenshot.
6. Leave every control at its default unless an item says otherwise:
   Smoothing on, Clean the edges **off** (its default since 2026-10-20: it costs frames; switching it on is a separate measurement, `--edges-hz`),
   Soft edges off, Photos at several angles off, Keep my eyes and mouth on, Use my live eyes off, Hide the photo's glasses off (unless
   the page turned it on by itself), Whole head off, Body / Hair / Hands on top off, Match the webcam's look 60%, Mouth patch
   50%, **Hold the mask when turning 100%**, Photo's face shape 70%, Colour match 100%.
7. Machine record (once):
   - Laptop / CPU / GPU: ______________________ Chrome version (chrome://version): __________
   - "delegate" shown on the page (GPU or CPU): ______
8. Machine benchmark (once, same session, after the checklist): close the page, then in PowerShell
   ```powershell
   $env:REALX_CHROMIUM = "C:\Program Files\Google\Chrome\Application\chrome.exe"
   # use the project's Python (the .venv one), not a system Python
   python scripts/bench_facemesh.py --headed --seconds 12 --json facemesh-baseline.json
   ```
   Send me `facemesh-baseline.json`. The run must print a hardware renderer (e.g. "Intel(R) UHD Graphics 620"), not
   "SwiftShader"; if it prints SwiftShader the numbers are a software renderer's and do not count.

## How to record each item

- **Hold the pose for the whole 10 s.** Press **Measure 10 s**, keep the pose, then copy the line it prints (fps, face found,
  detection ms, 95th percentile, delegate).
- **Screenshot** with Win+Shift+S while the pose is held, and save it under the exact name given (`fm-NN-....png`). The page
  itself never captures the camera; screenshots are yours.
- **What looks wrong**: say where on the face and what (e.g. "left cheek stretched sideways", "pale patch above the upper lip",
  "hard edge at the jaw", "photo slides behind the face", "glasses doubled", "flicker"). "Nothing" is a valid answer.
- Severity 0-3: 0 nothing seen, 1 visible if you look for it, 2 visible at a glance, 3 breaks the illusion.

Yaw (left/right head turn) is approximate: at 15° the nose tip is about halfway from the face's centre line to the cheek
edge on that side; at 30° the far eye starts to shrink; at 45° the far eye is partly hidden behind the nose bridge.
Turn to **your left** for every yaw item unless noted, so the items compare.

## Items

| # | Item | Settings change | Screenshot | What looks wrong (where, what) | Severity 0-3 | Measure 10 s line (fps / found / ms / p95) |
|---|---|---|---|---|---|---|
| 1 | Frontal, still, neutral face | none | `fm-01-frontal.png` | | | |
| 2 | Yaw 15° | none | `fm-02-yaw15.png` | | | |
| 3 | Yaw 30° | none | `fm-03-yaw30.png` | | | |
| 4 | Yaw 45° | none | `fm-04-yaw45.png` | | | |
| 5 | Yaw 15°, raw | Hold the mask when turning **0%** | `fm-05-yaw15-hold0.png` | | | |
| 6 | Yaw 30°, raw | Hold **0%** | `fm-06-yaw30-hold0.png` | | | |
| 7 | Yaw 45°, raw | Hold **0%** (set it back to 100% after) | `fm-07-yaw45-hold0.png` | | | |
| 8 | Yaw 30° to the **right** | none | `fm-08-yaw30-right.png` | | | |
| 9 | Talking (read a sentence aloud for 10 s, frontal) | none | `fm-09-talking.png` (mouth open) | | | |
| 10 | Smiling, wide, teeth showing (frontal) | none | `fm-10-smile.png` | | | |
| 11 | Glasses **off** (frontal, your own face without glasses) | none | `fm-11-glasses-off.png` | | | |
| 12 | Glasses **on** (frontal, wear your glasses) | none | `fm-12-glasses-on.png` | | | |
| 13 | Bright room (frontal; all lights on, or face a window) | none | `fm-13-bright.png` | | | |
| 14 | Dim room (frontal; one lamp behind or beside you) | none | `fm-14-dim.png` | | | |
| 15 | Hand near the face (fingers at the cheek, not covering the eyes) | none | `fm-15-hand-near.png` | | | |
| 16 | Hand partly over the face (palm over mouth and chin) | none | `fm-16-hand-over.png` | | | |
| 17 | Frontal, Whole head **on** (hair, ears, neck) | Whole head on (off after) | `fm-17-whole-head.png` | | | |

Items 5-7 matter: with Hold at 100% the photo fades out between about 25° and 55° of yaw (S13e), which hides the side-view
stretch. Hold 0% shows the stretch itself.

## Overall (after all items)

- The three worst things you saw, worst first, with item numbers:
  1. ______________________________________________
  2. ______________________________________________
  3. ______________________________________________
- Did the "Virtual face" label disappear or get covered at any point? yes / no (item: ____)
- Did the photo pause, end or ask for consent again during the run? yes / no (what the status line said: ____________)
- Anything that flickered frame to frame (where): ______________________________________________

Send back: this file filled in, the 17 screenshots, and `facemesh-baseline.json`.
