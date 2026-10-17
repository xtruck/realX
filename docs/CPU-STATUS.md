# CPU edition status (written 2026-10-17, updated as work goes on)

The owner's aim: a live webcam picture where the person looks like a chosen, consented photo (for example a black man in a white
t-shirt appearing as a white man, holding the same bottle), photorealistic, with live movement, labelled "Virtual face". The CPU edition
gets as far as warping and relighting that photo on the live face; the last step (photorealism) is the NVIDIA GPU edition's job.

## What the CPU edition does today (all in the browser page `/facemesh`, no GPU needed, about 20 to 27 fps on the dev laptop)

| Feature | State | How it was checked |
|---|---|---|
| Photo on the live face, consent gate, "Virtual face" label, watermark | works | Node + browser tests |
| Lighting-only colour match (the photo keeps ITS skin colour; only where the light falls comes from the live face) | works | screenshots, both directions (below), test_facemesh_browser |
| Whole head (hair, ears, neck from the photo) | works, with limits (below) | screenshots |
| The photo's own face shape (slider "Photo's face shape", default 70%): outline, nose and cheeks move toward the photo's proportions; eyes, brows and lips follow the live face; fades out when the head turns (yaw only) | works for near-frontal heads; mouth patch edge shows more at 100% | screenshots, both pairs, 3 Node tests |
| Body and clothes: the shirt moves as ONE piece (arm bones off), cover starts at 0, pose model asked 4 times a second with eased joints | body option 9.4 to 17.6 fps (BENCHMARKS.md section 10) | screenshots, benchmark, Node tests |
| Glasses in the photo: found automatically (share of "accessory" pixels along the eye line; 0.096 with, 0 without), then smoothed away | works on 2 photos | probe value, screenshots |
| Photo's eyes by default; "Use my live eyes" button | works | screenshots (live eyes looked dark and purple on another skin tone) |
| Mouth interior stays live (talking) | works | screenshots |
| Moving hair, body and clothes puppet, hands on top, spills | built earlier | tests with a fake camera; never with a real hand |
| Hand skin-tone matching | built, OFF by default, made things worse in the owner's test | shader test on synthetic textures only |

## The test pair (free Pexels photos, in `Downloads`)

* `pexels_cottonbro_5901630.jpg`: a light-skinned young man, white t-shirt, glasses-free.
* `pexels_black_man_31482883.jpg`: a black man, afro, black t-shirt, white background, glasses-free.

Both directions were rendered in a visible Chrome with a fake camera made from the other picture (the owner's own selfie for the dark live
face): white-man photo on the dark live face, black-man photo on the light live face. Both read as the photo person at normal size.

## Known limits (honest)

* The face is the photo warped on the live face mesh. It cannot change the face's shape, turn far, or invent expressions: it looks like
  a convincing mask at a distance, not a real face. Photorealism needs the neural (GPU) path.
* The live person's own neck and ears can peek out round a narrower photo neck. Recolouring them was tried and repaints beige walls
  (their colour is close to skin), so it is only done below the chin and only as wide as the neck.
* The live person's hair shows if it is longer than the photo's.
* The neck follows the head rigidly; it does not move on its own.
* Never tried with a real webcam by the developer; the owner tried an earlier build and reported: neck not moving, hair not real, face fake.

## How to run it

`cd D:\realx-ff\gpu`, then `$env:PYTHONPATH="src"; & C:\Users\anare\realX\.venv\Scripts\python.exe -u -c "import sys; from realx.cli import main; sys.exit(main(['serve','--port','8765','--no-browser']))"`.
Open the printed link (it contains a one-time token) in a normal browser tab, then `/facemesh`, allow the camera, "Choose my photo".
Tests: `cd webapp; node --test test/*.test.mjs`, and with `REALX_CHROMIUM` set to a Chrome path and `PYTHONPATH=src`:
`pytest tests/test_facemesh_*.py` (the browser ones take about 10 minutes; one compares two moments of a moving clip and can flake under load).
