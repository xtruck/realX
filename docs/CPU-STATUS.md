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
| **Neck that yields (S12a, default on)**: the photo's neck hangs from the live shoulders when the pose model sees them (from the face's own middle otherwise), so it stops swinging sideways with the head like a doll's neck; only the ring below the chin bends, the pull is clamped to 0.6 face widths | built; **never seen on a real webcam** | 6 Node tests on synthetic faces (symmetry, jaw fixed, clamp, shoulders) |
| **Hair reach (S12b, slider, default 55%)**: how far the photo's head ring reaches above the face; raising it draws the photo's own hair taller, so it covers more of a taller live hairstyle (the live hair that used to show round a shorter photo haircut). Only the top changes; ears and neck stay | built; **the look is not judged yet** | 3 Node tests (reach, sides/bottom unchanged, aspect) |
| **Mouth patch (S12c, slider, default 50%)**: when the mouth is open, the live patch pulls in towards the middle of the mouth (measured on the photo's own lips), so the live lips stop reading bigger and pinker than the photo's; 0% restores the old full patch | built; **the look is not judged yet** | 4 Node tests (weights, corners, aspect, guards) |
| **Softer patch edge (S12d)**: the kept eyes and mouth fade in over a wider band (smoothstep 0.35-1.0 instead of 0.6-1.0), which softens the hard edge at the cheeks | built | 1 Node source check; screenshots on the owner's machine still to do |
| **Match the webcam's look (S13b, slider, default 60%)**: the shader softens the photo toward the live cheeks' sharpness, adds grain at the live frame's measured noise level and nudges contrast and white balance (clamped, skin colour kept); about 80 extra texture taps per face pixel, measured on the GPU only; 0% skips it | built | Node source checks; never seen on a real webcam, cost not yet benchmarked |
| Body and clothes: the shirt moves as ONE piece (arm bones off), cover starts at 0, pose model asked 4 times a second with eased joints | body option 9.4 to 17.6 fps (BENCHMARKS.md section 10) | screenshots, benchmark, Node tests |
| Glasses in the photo: found automatically (share of "accessory" pixels along the eye line; 0.096 with, 0 without), then smoothed away | works on 2 photos | probe value, screenshots |
| Photo-quality advice on "Choose my photo" (S13d): face size, pose, eyes, gaze, mouth, light, sharpness, glasses, hair, face count | built, advice only (a fail needs one extra click; consent unchanged) | Node tests with made-up landmarks and pixels; thresholds are first guesses, never tuned on real photos; glasses and hair only judged when the segmenter is already loaded |
| Photo's eyes by default; "Use my live eyes" button | works | screenshots (live eyes looked dark and purple on another skin tone) |
| Mouth interior stays live (talking, only while the mouth is open) | works | screenshots |
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
* The live person's hair still shows if it is much longer than the photo's; the Hair reach slider (S12b) stretches the photo's hair to
  cover part of it — how far that reads as natural is for the owner to judge with a real webcam.
* The neck now yields to the body (S12a) but it still does not twist on its own, and with the body option off it hangs from a guess
  (the face's own middle), not from real shoulders.
* Never tried with a real webcam by the developer; the owner tried an earlier build and reported: neck not moving, hair not real, face fake.
  S12a-d answer the first two and part of the third (the patch edge); "face fake" beyond that is the photorealism limit above.

## How to run it

`cd D:\realx-ff\gpu`, then `$env:PYTHONPATH="src"; & C:\Users\anare\realX\.venv\Scripts\python.exe -u -c "import sys; from realx.cli import main; sys.exit(main(['serve','--port','8765','--no-browser']))"`.
Open the printed link (it contains a one-time token) in a normal browser tab, then `/facemesh`, allow the camera, "Choose my photo".
Tests: `cd webapp; node --test test/*.test.mjs`, and with `REALX_CHROMIUM` set to a Chrome path and `PYTHONPATH=src`:
`pytest tests/test_facemesh_*.py` (the browser ones take about 10 minutes; one compares two moments of a moving clip and can flake under load).

## S13e: keep the mask only where it holds (slider "Hold the mask when turning", default 100%)

The photo is a flat picture, so it is dropped where it cannot hold: `confidence.js` computes a 0 to 1 value per frame from the landmarks. The whole photo's opacity follows it (full up to about 25 degrees of yaw or pitch, near 0 by 55); on a turn the head ring (hair, ear, neck) fades first (20 to 42 degrees), then the face. A mouth opened past an inner-lip gap of 0.14 of the face height (a yawn, not talking), a face with more than 2% of its points outside the frame, and a sudden jump of the face shape each lower it too. A lost face gives 0 at once and comes back over about a dozen frames. 0% on the slider gives the old behaviour exactly (the "Photo's face shape" yaw fade is separate and unchanged). Checked: 9 Node tests on synthetic faces. **Not checked: every number here is a first guess; yaw comes from the landmark z, which is rough; nothing was tried on a real webcam or seen in a browser.**
## S13c: clean edges (live-frame segmentation) - written, not seen

"Clean the edges" (off by default since 2026-10-20; it was on before) hides the live person's hair and ears that peek out around the photo's head, using a low-rate (at most 5 a second) MediaPipe selfie-segmenter pass on the live video. The masks stay on the graphics card (no read-back of camera or mask). It replaces the "live-frame segmentation: missing" line for the narrow job of the double hairline, the duplicated ear and neck slivers beside the photo's neck; it is not a general person cut-out. **Status: built and covered by Node tests of the logic and of the privacy source rules; never run on a real webcam or a real GPU.** Unknown until then: whether the mask textures are in the format and orientation assumed, whether MediaPipe's GL state survives the extra pass, the cost per pass on the UHD 620, how the flat background-colour patch looks against a busy room, and whether the photo's background colour (taken from the photo's edges) is a good fill. If anything fails, the page falls back to the picture it drew before (probe `seam` = "unavailable").
