# Overnight progress log

Owner delegated full authority on 2026-10-14: push to main, repo stays public, make
all decisions, test without asking. This file is the loop's memory. Update it after
each step so a resumed session knows exactly where to continue.

## Done

- [x] S14 body seams (2026-10-21, gap #3): with "Body and clothes" on, the body puppet (compositor.js `HAIR_FRAG`, shared with the hair layer) had a hard 0.35-0.65 mask edge and the raw photo light against a head drawn with the live face light. New block `S14 join` in that shader, body layer only, gated by `u_join` (`compositor.bodyJoin`, default 0.7, `setBodyJoin()`; 0 or no camera frame = the old picture exactly; the hair layer always passes 0): (1) feathered edge: 5-tap blur of the photo mask read through smoothstep 0.1-0.9, which softens sleeve, shoulder and neck edges; (2) neck line: with the head drawn the puppet thins to 60% at the chin, back to full 0.4 face heights lower, so it hands over to the head ring neck; (3) light match: the live chin-to-cheeks brightness ratio against the photo one, applied to the puppet colour (clamped 0.85-1.15), strongest at the chin and gone 1.2 face heights lower. Everything is sampled in the shader (4 extra mask taps + 18 camera/photo taps per body pixel, no loops, no read-back, no new model). No page.js control: the 0.7 default is fixed. Verified: `cd webapp && npm ci --ignore-scripts && npm test` 364 pass, 0 fail (7 new in `webapp/test/s14.test.mjs`: source checks of the block, fake-GL check that only the body gets `u_join` and only with a live frame; mutation-checked 5 ways, each fails the suite); `npm run build` refreshed `facemesh.bundle.js`. NOT verified: no real webcam, no screenshot, no browser run, no shader compile on a real GPU (the GLSL was only read, not compiled), no timing on the Intel UHD 620, no look on the astronaut clip; the constants (0.6 floor, 0.85-1.15, 1.2 face heights) are guesses. Python tests and bench scripts were not run. Limits: the light match is one ratio at the chin, so it cannot fix a colour difference between the live and photo clothes or shoulders; the neck thinning assumes the photo chin spot (mesh point 152) sits above the neck.
- [x] Stage 4 draft (2026-10-20): `docs/PHOTOREAL-NEXT.md` compares staying with the mesh compositor, a per-identity model on a remote GPU, and a Gaussian-splat head: expected quality (none of it measured), hardware, licences quoted from the original files (Inria's 3DGS, GaussianAvatars, VHAP and FLAME are non-commercial; gsplat Apache-2.0 and two MIT renderers are the candidate clean stack), REMOTE.md changes and consent/label implications. Written before Stage 3, so its Stage 3 inputs are marked pending. No code changed.
- [x] Stage 2 baseline tools (2026-10-20): `scripts/bench_facemesh.py` had been broken since S13d: its test photo fails the photo check ("too few pixels"), so Allow stayed disabled and the run timed out. It now ticks the photo-check override only when the page asks for it, and records the score and whether the override was used in the JSON (`config.photo_check`). Ran it once in a cloud container (headless, SwiftShader software renderer, so `representative: false` and the numbers do not describe any laptop): every step completed, and the label was on screen whenever the photo was drawn. Added `scripts/facemesh_baseline.md`, the real-webcam checklist (frontal, yaw 15/30/45 with Hold at 100% and 0%, talking, smiling, glasses, bright/dim, hand near and over the face, whole head). No rendering code changed.
- [x] Cleanup of 793bdd9 (2026-10-20): removed the root React/Vite "studio" that commit added (`server.ts`, `src/App.tsx`, `src/components/RealisticAvatarViewer.tsx`, root `package.json`). It could not build (no `index.html`, entry file, Vite config, tsconfig or lockfile), its server listened on 0.0.0.0 with no access token and no Origin check, its `/api/voice` returned a sine tone labelled `X-RealX-Watermark: provenance-verified` with no mark applied, its fps (60), latency (11 ms) and "Conforme" badge were fixed values, its record button saved the canvas as unlabelled video, and its "photoreal" mode was a textured three.js sphere with an upload-any-photo button and no consent gate, label or watermark. The Python control room (`realx serve`) stays the only studio. The commit's `.gitignore` line (`.claude/`) is kept. Python and webapp code are unchanged.
- [x] S12a-d (2026-10-19): four realism fixes aimed at the owner's real-webcam report ("neck not moving, hair not real, kept live lips big and pink, hard patch edge at the cheeks"), all in the face-mesh page, no new model, no new privacy surface:
  - **S12a neck that yields** (`head.js neckAnchor`): the head ring's points below the chin are pulled toward hanging from the live shoulders when the pose model sees them (page.js stepBody, `compositor.setNeckAnchor`), from the face's own middle otherwise (0.6 strength). Only points below the chin's own level bend; the pull is eased from the jaw and clamped to 0.6 face widths, so a noisy pose cannot tear the mesh. The doll's-neck swing on head turns is the target.
  - **S12b hair reach** (`ringPoints` reach argument, `compositor.setHairReach`, slider "Hair reach" 30-100%, default 55 = unchanged): the LIVE ring reaches further above the face while the photo's UV ring stays at the default, which stretches the photo's own hair over more of the live head — for the live hair that used to show round a shorter photo hairstyle. Only the top changes; ears and neck keep their reach.
  - **S12c mouth patch** (`mesh.js mouthKeepWeights`, `compositor.setMouthShrink`, slider "Mouth patch" 0-100%, default 50): the live inner-lip vertices get weights that fall toward the mouth's middle (measured ON THE PHOTO's lips, once per photo), so the live patch that shows while the mouth is open no longer reads bigger and pinker than the photo's lips; 0% restores the old full patch. The keep buffer is rebuilt on photo change and on slider input (one 468-float upload, not per frame).
  - **S12d softer patch edge** (compositor shader): the kept eyes and mouth fade over smoothstep 0.35-1.0 instead of 0.6-1.0, softening the hard edge at the cheeks.
- [x] S13b (2026-10-19): **Match the webcam's look** (slider 0-100%, default 60%, 0% = the old picture exactly). In the face-mesh fragment shader (`compositor.js`, block marked S13b) the photo is softened toward the live cheeks' sharpness, given grain at the live frame's measured noise level (fresh every frame, luminance-weighted, never where alpha is 0) and nudged toward the live frame's contrast (max 12%) and white balance (max 4%) while the photo keeps its own skin colour. All measuring is on the GPU; no camera pixel is read back to JavaScript. Node source checks in `webapp/test/s13b.test.mjs`. **Never seen on a real webcam**; the constants are guesses.
  Tests: 17 new Node tests (`webapp/test/s12.test.mjs`: reach bounds, jaw fixed under head turn, symmetric narrowing, clamp, shoulder anchor, mouth weights, aspect invariance, compositor clamps and buffer rebuild, page wiring). Suite: **313 Node, 665 Python passed** (browser/Chromium tests not run in this environment: no Chrome; they were green before and are untouched in logic). `facemesh.bundle.js` rebuilt. NOT yet done: a real-webcam look judgement by the owner, benchmark rerun, browser screenshot tests.

- [x] S11n (2026-10-17): on a slow laptop (face model over 28 ms) every second camera frame reuses the face from the last two detections moved on by their motion (extrapolateLandmarks, capped 1.5 steps), aiming at about 30 instead of 20 fps. Not yet measured in the benchmark. Full suite: 296 Node, 788 Python passed; one control-room test blinked under load and passes alone

- [x] S11m (2026-10-17): the live mouth interior is shown only while the mouth is open (gap between the inner lips over the face height, smooth from 0.02 to 0.06); closed, the photo's own lips are drawn, which removes the live patch and its outline. Both Pexels pairs checked

- [x] S11k-l (2026-10-17): speed: the pose model is asked 4 times a second and the joints are eased every frame (body option 9.4 to 17.6 fps), idle hand polling 500 ms. Realism: the photo's own face shape (mesh blended toward the photo's proportions, fitted by scale/turn/shift on stable points, fades with head yaw, eyes/brows/lips stay live, slider default 70%). Both-way test with the two Pexels portraits. 295 Node tests

- [x] S11j (2026-10-17): body and clothes: the shirt moves as ONE piece by default (puppet.torsoOnly; the five-bone skinning tore the shirt into jagged blocks on a cropped photo and a webcam), and the cover slider starts at 0 (at 15 to 40 percent it drew a second, larger shirt and giant neck-skin pieces). Seen with the black-man Pexels photo on the white-man live source. A draft docs/GPU-PLAN.md was written then; it is not in this repository. 291 Node tests; browser tests green (one hands-on-top assertion can blink under load, passes alone)

- [x] S11g-i (2026-10-17): glasses in the photo are detected automatically (share of accessory pixels along the eye line, threshold 0.03; 0.096 with spectacles, 0 without); the head mask now acts across the whole inner ring band (it was only partly applied, which drew the photo's studio backdrop as a pale halo round the head), bright colourless pixels in the ring are not drawn, live skin below the chin and as wide as the neck is recolouredto the photo's tone. Tested both ways with two Pexels portraits (docs/CPU-STATUS.md). Recolouring the ears too was tried and repainted a beige wall: reverted. 290 Node + 17 browser tests green

- [x] S11f (2026-10-17): whole head: the ring takes the same lighting as the face (it took 35%), which removes the step in brightness along the face outline at the sideburns. 289 Node + 16 browser tests green

- [x] S11e (2026-10-17): eyes and mouth are kept separately. Default: the PHOTO's eyes (much more natural than the live eyes retoned onto a different skin: those looked dark and purple), the live mouth interior still kept for talking. New button "Use my live eyes". Only the inside of the outlines stays live. Checked with a Pexels portrait on a live source made from the owner's selfie

- [x] S11 realism pass 4 (2026-10-17): tested a glasses-free Pexels portrait (light skin, white t-shirt) on a live source built from the owner's own selfie (dark skin, webcam-like framing), the owner's real aim. Before: grey smeared mask (live skin sheen multiplied onto the pale photo). Now: lighting transfer halved (gain 0.9 to 1.12), glasses hiding is OFF by default (it smeared the brows of a photo without glasses). Result: clean light skin, sharp brows, photo hair. Still wrong: kept live lips look big and pink, kept live eyes look purple/dark, a hard patch edge at the cheeks, neck does not move, live hair shows when longer than the photo's

- [x] S11 realism pass 3 (2026-10-17): whole head: the neck reaches further down (0.7 face widths) and the inner ring fades to 0.85 instead of 0.5, so the photo's neck and hair edges are no longer ghostly; the glasses smoothing now also cuts lens glare and nudges the tint to the cheek's (brows kept). Seen on the owner's photo on a different live face. NOT done: the live user's own hair still shows round a shorter photo hairstyle; the neck still ends at the live collar; no seam work with Body and clothes on (the body puppet looked wrong on the astronaut test clip); needs a glasses-free photo and a real webcam for the next check

- [x] S11 realism pass 2 (2026-10-17): the light gain follows only broad shade (wide blur, range 0.8 to 1.25) so cheeks are less blotchy; the kept live eyes and mouth are drawn by the page with their skin moved to the photo's tone (no more lighter/darker eye patches); the glasses smoothing leaves the eyes alone. Checked by screenshots of the owner's photo on a different live face. test_photo_is_drawn_on_the_live_face... can fail under load (it compares two moments of the moving fake camera); it passes alone

- [x] S11 realism pass 1 (2026-10-16, from the owner's real-webcam screenshots): colour match now takes only the live LIGHT (gain from five face spots), the photo keeps its own skin colour (before: a purple room light tinted it, a light live face turned a dark photo grey); the photo's glasses are smoothed away along the eye line (button "Hide the photo's glasses", on by default). Measured with the owner's photo on a different live face: skin R/B 1.71 vs photo 1.86, G/B 1.18 vs 1.21. Still blotchy, hair is a flat cap, eyes and mouth edges, neck/clothes seams: see the next S11 steps

- [x] S10h hand skin-tone matching (2026-10-16): option "Match my hands' skin to the photo" (off by default). In the hands-on-top shader, skin-coloured live pixels move towards the photo's cheek colour; both reference colours are sampled on the graphics card (no read-back); non-skin (bottle, sleeve) untouched. Shader tested on synthetic textures (tests/test_facemesh_skin.py); never tried with a real hand

- [x] Mission phase 0 (2026-10-16): `docs/MISSION.md` plan and acceptance table; `scripts/bench_facemesh.py` page benchmark on the real UHD 620 (three runs, noisy, BENCHMARKS.md section 9); hand model idle back-off (250 ms) with poll counter; licence rows for GHOST / RVM / DeepFaceLive

- [x] M0 foundation: docs, pipeline core, consent gate, watermark
- [x] ECC review 1 (architect, security, python): findings fixed
- [x] YuNet detector (MIT, CPU), model manifest with pinned hashes, blocked list
- [x] Fast-motion tracker: no id switches under dance/jump/sprint/spin with blur+noise
- [x] Time-aware tracking: 0 ghost faces under random 1-13 frame skips
- [x] Optical-flow hints: dance p95 103 -> 64 px, jump 54 -> 8 px
- [x] Avatar overlay tier, synthetic motion scene, `scripts/motion_check.py`
- [x] Voice: streaming pitch shifter (chunk-size independent, unity gain), stateful gate,
      normalize, A/V delay, WAV I/O, consent-gated voice_convert, authenticated marks
- [x] Control-room server + front end (checked in the browser), CSP without inline script
- [x] ECC review 2 (security, python, architect): findings fixed
- [x] ECC review 3 (final diff review): one defect (voice backend state shared across
      streams), fixed with a regression test
- [x] 93 tests green; pushed to main
- [x] Real-camera test (owner's webcam): detector found the face in 0-3% of frames at
      its default threshold. Fixed with multi-scale small-input detection, dark-frame
      lift, DirectShow camera backend, size-consistent tracking and translation-only
      velocity. Result: face found in 99% of frames, one id, no duplicates; synthetic
      p95 error under blur 64-73 px -> 7-8 px.

- [x] Rig over WebSocket (`/ws/rig`, stdlib RFC 6455, same-origin only) and a browser
      renderer: three.js + @pixiv/three-vrm draw Pip, an original CC0 VRM generated by
      `scripts/make_character.py`. `/avatar` is an OBS Browser Source (transparent,
      numbers only, never camera pixels). Verified in headless Chromium.
- [x] Background replacement for the user's own stream: PP-HumanSeg (Apache-2.0, pinned
      sha256) + guided-filter edge snapping, photo / blur / colour backdrop, photo
      uploaded in the control room and kept in memory only (header-checked before decode).
- [x] Character voice presets (pip, bear, imp, robot, radio): pitch + formant control,
      ring modulation, band-limit, soft clip. Effect numbers only, no speaker data.
- [x] Pipelines refuse any media-altering stage after a watermark (`alters_media`), so
      provenance marks stay readable. Consent gate and blocked-model list unchanged.
- [x] 153 tests green (with the YuNet and PP-HumanSeg models and Chromium present)

- [x] Mascot host: outfit colours (`/avatar?outfit=ocean|sunny|berry|forest`), gesture buttons
      (wave, happy, surprised, thank you) and an optional name/tagline bar (`?name=&tagline=`)
- [x] Disclosed co-host machinery: `realx cohost` consent vault with friend-held revoke code,
      mandatory visible disclosure stage, pipeline rule (gate -> likeness -> label -> mark)

- [x] Full-body tracking in the browser (2026-10-14): MediaPipe face (52 blendshapes, gaze), pose and
      hand landmarkers run inside the tracking page (`/avatar?track=1`); the camera picture never leaves
      it. A clean-room solver turns landmarks into bone rotations (head, eyes, spine, arms, hands, every
      finger, legs, feet). Per-limb hold-and-fade to a relaxed pose, seated upper-body mode, legs only
      after 0.6 s of good visibility, hands assigned to arms by nearest wrist, One-Euro filtering,
      adaptive model scheduling, 60 fps display interpolation. Control room "Full body" mode; a validated
      `/ws/rig?publish=1` relay shows the body in an OBS Browser Source. MediaPipe model licenses
      verified from the model cards (Apache-2.0). Tests: 38 node, 273 Python (browser tests use Chrome with
      a fake camera). Measured on the dev laptop (windowed Chrome, integrated GPU, fake camera) with
      the FIRST scheduler: tracker 25 fps, ~28-34 ms per model, pose/hands only ~6 Hz, character
      rendering at ~48 fps. The owner then reported lagging arms and untracked hands on a real
      webcam; the scheduler was rewritten (time budget, pose favoured, simulated ~12 Hz for pose at
      30 ms per model) and a hand is no longer discarded when the body model doubts its wrist. Both
      are tested on synthetic data only. **Not yet re-measured on an idle machine or confirmed on a
      real person**; the preview now shows why a hand is not tracked. See `AUDIT_REPORT.md`.
- [x] Research pass (2026-10-14) on how existing capture apps work: see the backlog in `IDEAS.md`.
      REA could not read script bodies of the public Kalidokit demo, so constants from other apps are
      unverified.

- [x] Live Studio work (2026-10-14), see `AUDIT_REPORT.md` for the baseline and `ROADMAP.md` for the status table:
      microphone capture (browser noise suppression, energy VAD, speech-driven mouth cross-faded with the tracked
      mouth, A/V sync alignment; audio never leaves the page, only five mouth weights ride in the body message);
      camera and microphone selection, quality presets, a status panel (fps, latency, skipped frames, per-model
      Hz, delegates, mic, sync) in the control room; Windows install/test/run scripts; `realx bench` and a browser
      tracking benchmark (`BENCHMARKS.md`); an ONNX session cache with provider fallback (fake-factory tests only);
      a portrait-animation adapter with per-image, per-frame-checked consent and **no engine enabled**
      (`PORTRAIT.md`); resilience tests (camera loss, stage failure, queue bounds, long-session memory).
- [x] Defects found and fixed: `run_stream` never dropped stale frames (it blocked the camera), the scheduler gave
      pose no priority at the measured model costs (9.3 Hz each; now ~14 Hz for pose in simulation).
- [x] Second audit (`AUDIT_REPORT.md`, 2026-10-14): hardware is an i5-8365U with Intel UHD 620 only (no NVIDIA);
      dependencies clean (`npm audit` 0, `pip-audit` only pip itself). Found and fixed: the server had **no logging**
      (silent 500s, camera and download failures); `realx.log` added (`--log-level`, `--log-json`), 14 tests.
      Still open from that audit: browser camera/microphone unplug recovery, runtime hardware detection and
      low-resource defaults, capture-time filtering, model memory cost, a 30-minute soak test, and a real-person
      validation. Work was stopped here at the owner's request; the tests of the files touched passed (215 + 74),
      a full-suite run was not repeated after this last change.
- [ ] Not verified: any of the above on a real person, a real microphone or a discrete GPU. Browser tracking
      benchmark runs carried a contention warning (other Chrome processes), so they are not representative.
- [x] Static pages and scripts (`/`, `/app.js`, `/avatar`, `/avatar.bundle.js`) are served gzipped when the
      request says `Accept-Encoding: gzip`, compressed once per process; API, MJPEG and WebSocket are not.

- [x] OBS control dock (`/dock`): voice preset, mic mute, background, blur strength, status lights.
      Adds blur (3-151) to the config and `/api/dock` for mute and voice; live voice change is still not built.

## Next (in order)

**Continuing on another computer? Start with `HANDOFF.md`**: where the code is (branch `handoff-2026-10-14`), what is
tested and what is not, the owner's decisions, and the commands to rerun everything.

- [ ] Owner: judge S12a-d on a real webcam (neck yield, Hair reach for the afro, Mouth patch 0/50/100%, the softer cheek edge) and say which defaults to keep
- [ ] Owner: judge S13b on a real webcam (Match the webcam's look at 0/60/100%: too grainy, too soft, colour drift?).
- [ ] Owner: run the browser tests with Chrome (`REALX_CHROMIUM`), then `scripts/bench_facemesh.py` idle — the S12 changes add a few hundred multiplications per frame and one buffer rebuild per photo, but no model; the fps gate should not move
- [ ] Run `docs/REAL-WEBCAM-VALIDATION.md` on a real person and microphone; tune filter constants from the results
- [ ] Re-measure the browser tracker on an idle machine (`scripts/bench_tracking.py`)
- [ ] Tune the filter constants and hold/fade times with a real person on a real webcam (never done)
- [ ] Full-body backlog in `IDEAS.md`: IK pole hints, wrist twist, foot locking, finger limits, RTMW toes
- [ ] Silero VAD + RNNoise voice chain, live microphone input
- [ ] Audio-driven mouth fallback
- [ ] Robust watermark (TrustMark/AudioSeal) and C2PA export
- [ ] ECC review 3 after each of the above

## Decisions taken without the owner (review in the morning)

- Avatar tier first: it runs on the CPU-only laptop and needs no restricted model.
- YuNet (MIT) instead of InsightFace (non-commercial) for detection.
- `inswapper_128` and `buffalo_l` stay blocked in code until a license is obtained.
- Repo left public as instructed. No models, secrets or media files are committed.
- `pyvirtualcam` (GPL-2.0) is not used; the plan is an OBS Browser Source.
- Local server binds to 127.0.0.1 only and rejects cross-site requests; port is fixed
  at 8765 by default (override with `--port`).

## Known limits (honest list)

- Demo footage is synthetic (a public-domain portrait moved around). Real webcam
  behaviour is covered by the same code path but has not been recorded here, because
  the owner's camera was not available overnight.
- The Cartoon/Character modes that use the server's own camera still take a rig from 5 YuNet
  landmarks: head pose and smile width only, with Pip blinking on a timer. Blinks, mouth shapes, gaze,
  arms, hands, fingers and legs come only from the **Full body** mode (browser tracking).
- Full body is checked on synthetic landmarks and on a fake camera playing a portrait photo
  (face and pose tracked in every sample). Hands, legs and fast motion have not been tried on a real
  person, and the filter constants are untuned. Toes are weak: the pose model gives only heel and
  toe-tip points. One webcam view means hidden hands, crossed arms and depth are estimated.
- Browser tracking needs the control-room tab open while streaming. On the dev laptop's integrated
  GPU each model costs ~30 ms, so face updates ~12 times a second and pose/hands ~6, with the display
  interpolating at 48-60 fps; a faster GPU should raise those rates.
- The character's pose maths is checked on synthetic landmarks and on the demo footage;
  it has not been tuned on a live webcam.
- Background matte is a 192 px model: good on a person against a plain room, soft on
  hair, and it can clip dark or busy clothing (see the astronaut test photo). Checked on
  public-domain photos and synthetic footage, not on a live webcam. It costs about 10 ms
  per frame on the dev machine.
- Voice presets are DSP on your own voice. They are not neural voice conversion and
  deliberately cannot imitate anyone.
- Voice changing is DSP pitch shifting, not neural voice conversion.
- Watermarks are baseline LSB marks: they do not survive lossy compression.
- Speed: about 9-14 fps at 640x480 on the dev laptop's CPU.

- Not in this repository (checked 2026-10-20): the "GPU edition" plan, `realx gpu-check`, the licensing commands and seller tool, and the `realx swap` photo/video pipeline that earlier entries here described. None of their files or CLI commands exist in this repo, so they are not listed as done.

- Mira, a second bundled character (`--avatar mira`): long hair as 11 simulated strands, collider spheres on the head, body and every finger so a tracked hand pushes the hair, nose, eyelashes, ears. Physics checked with the real three-vrm solver in `webapp/test/hair.test.mjs`; a guard (`webapp/src/hair.js`) resets the hair if the solver ever returns NaN. This is the avatar fallback. The main goal is hair from a consented PHOTO that moves and reacts to the hand: not built yet.

- S9/S10: Hair that moves, Body and clothes, and Show my hands on top, all off by default, on the face-mesh page. Body: the photo shirt and sleeves follow the live shoulders and arms (puppet.js). Hands on top draws the live picture around the tracked hands (a second documented use of the one camera upload, awaiting the owner confirmation: docs/FACEMESH.md). Tested: Node suite, and browser smoke tests on a software renderer with the photo and camera being the same picture. Not shown: how it looks on a real webcam, real speed, hiding the live clothes underneath, the live hand recoloured to the photo skin tone, stains and eating.

- S10d: no object detector adopted (licence unverified for MediaPipe EfficientDet-Lite0; OpenCV Zoo detectors would need the camera pixels in JavaScript). "Grip reach" stretches the live-hand area along the knuckle line of a curled hand: a geometric guess, tested with synthetic hands only, never with a real bottle.

- S10e/S10g: "Cover my clothes" (a slightly bigger copy of the photo shirt drawn under it, to hide the edges of your own clothes; not a background repaint) and spills/stains/drips/messy eating on the shirt (stains.js): they stick to the shirt, water dries, a hand wiped over a stain rubs it out, crumbs fall. Effects on the picture, not a simulation. Tested: Node suite and one browser run (spill drawn, cleaned, zero camera read-backs); wiping and eating with a real hand never seen.

- S13d: photo-quality advice when a photo is chosen (photoquality.js, pure; photopixels.js reads only the PHOTO's pixels into a small luminance sample). It checks face size and pixels, frontal pose, open eyes, centred gaze, closed mouth, even cheek light, sharpness (Laplacian variance), glasses and forehead hair (both only when the segmenter is already loaded; otherwise "not checked"), and more than one face, and shows a short plain-English list above the consent question. A warn changes nothing; a fail adds one extra tick box before Allow. It is advice only: the consent statement and the server-signed consent are unchanged. All thresholds are first guesses, never tuned on real photos; tested with made-up landmarks and luminance only (Node), no browser run.
- S13e: "Hold the mask when turning" (slider, default 100%, 0% = the old behaviour exactly). `webapp/src/facemesh/confidence.js` turns the 478 landmarks into a per-frame confidence (head yaw/pitch from the landmark z, an inner-lip gap past a wide-open limit, share of landmarks outside the frame, frame-to-frame jumps of the face shape), smoothed with a dead band and a quick-fall / slow-rise limit so it does not flicker. It multiplies the photo layer's opacity (full up to 25 degrees, about 0 by 55) and fades the head ring (hair, ear, neck) earlier (20 to 42 degrees) with a second, smaller draw of the ring triangles. Missing or NaN landmarks give 0 at once. The "Virtual face" label, the label guard and the consent check run before the draw and do not depend on it; at confidence 0 nothing is drawn (the live picture). Tested: 9 Node tests (`webapp/test/s13e.test.mjs`) on synthetic landmarks. **All angles and limits are first guesses, never tuned on a real webcam; the look on a turning head was not seen in a browser.**
- S13c: "Clean the edges" (face-mesh page, on by default). A live-frame segmenter (the MediaPipe selfie multiclass model already fetched as `mp_segmenter`) runs at most 5 times a second, only when the face model is not struggling (`seamDue` in `webapp/src/facemesh/seams.js`; the page does not use the body-model `Stagger`, which has fixed pose/face/hands slots, so the same idea is a small scheduler of its own). Its hair and body-skin confidence masks never leave the graphics card: `seammask.js` keeps a running value per pixel inside MediaPipe's own WebGL context (a pixel must stay up for about three answers to count, so one-frame flicker does not show) and the compositor takes the result as a texture (`setSeam`, one more `texImage2D`, of the mask canvas, not of the camera). A new first layer under the photo's own layers paints the photo's background colour, softly, where live hair or ears sit outside the face and within a zone round the head. It fades out when the answer is stale (over 0.8 s) or the head turns fast (hysteresis), and nothing extra is drawn when the option is off, the model is not loaded, it failed, or no GPU delegate exists (there is deliberately no CPU fallback, which would need the masks in JavaScript). Tested: 14 Node tests in `webapp/test/s13c.test.mjs` (persistence, hysteresis, scheduling, privacy source checks). **Never run on a real webcam, a real GPU driver, or a real MediaPipe mask: the shaders, the mask texture format and orientation, and sharing MediaPipe's context state are written from its documentation and bundle, not seen.**
- S13c safety valve (2026-10-20, audit, commit 3b93322): measured in the cloud container on a software renderer (SwiftShader, fake camera), one segmenter pass took about 12 s, synchronously, so the page froze that long about every 80 s. The option now turns itself off after one pass over 1 s or two in a row over 250 ms (`seamTooSlow` in `seams.js`), says so in the status line, shows the button off and reports `seam: "too slow"`; clicking retries. Consent, the label and the watermark are not touched. 2 Node tests (both limits mutation-checked) and 1 browser test. The limits are first guesses: the cost on the UHD 620 is still unmeasured. See `docs/REALX_AUDIT.md`.
- Removed onnxruntime-web (2026-10-20, owner's request): the 28 MB runtime in `src/realx/web/ort/`, the `/ort/` route in `server.py`, `webapp/src/utils/onnxInference.js` with its 7 Node tests, the build step and the npm dependency (18 packages). No page loaded any of it (0 references in the bundles, which rebuild byte-identical). `/ort/...` now answers 404 behind the token (`tests/test_ort_files.py`). The Python `onnx` extra (onnxruntime) is unrelated and stays.
- `scripts/bench_facemesh.py` measures S13c (2026-10-20): two first steps, face alone with "Clean the edges" off then on; an "edges ms" column (one segmenter pass, only while the option runs) and a report note when it turned itself off as too slow. 2 new tests in `tests/test_bench_facemesh.py`; one short end-to-end run in the container (software renderer).
- S13c warm-up pass (2026-10-20, from the owner's two benchmark runs on the UHD 620): the first segmenter pass took 6 483 and 8 270 ms (model prepared on the GPU), later passes about 26 ms; the auto-off rule stopped the option on that first pass. Now the first pass of each segmenter is never judged and is left out of the running cost (`seamTooSlow(..., warmup)`, `SeamSegmenter.warmup`), and the page reports it as `seamWarmMs`; the benchmark notes it. Software renderers still stop on the second 12 s pass. 2 Node tests (mutation-checked), 1 bench test. Numbers in `BENCHMARKS.md` section 11.
- S13c off by default (2026-10-20, owner's decision after two more laptop runs): at 5 passes a second it took the face alone from 26.6 to 18.4 fps and the body step from 24.2 to 16.4 (face model 33 to 64 ms on the shared GPU); off, every step is over 20 fps. The rate can now be lowered from the address, `/facemesh?seamHz=0.5..5` (`seamRate`; an answer stays fresh for 2.5 gaps, `maxAge`), and the benchmark takes `--edges-hz`; its edges-on step is sampled after the one-off first pass. Tests: 3 new Node tests, 1 browser test for the address, the auto-off browser test now turns the option on first.
