# Overnight progress log

Owner delegated full authority on 2026-10-14: push to main, repo stays public, make
all decisions, test without asking. This file is the loop's memory. Update it after
each step so a resumed session knows exactly where to continue.

## Done

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

- GPU edition (this private repo): plan written in `docs/GPU-EDITION.md` (routes A/B/C for commercial-safe models, milestones G0-G5). No code changed yet; no swap model is cleared for commercial use.

- `realx gpu-check` and `scripts/windows/gpu-check.ps1`: tell whether a computer can run the GPU edition (NVIDIA card, driver, GPU build of ONNX Runtime) and write a small JSON report. Reads only; no model is run, so GPU speed is still unmeasured.

- Licensing: `realx license request|status|install`, `src/realx/licensing/` (computer id, Ed25519-signed licence file, activation request code), seller tool `tools/vendor/realx_vendor.py` (keygen, issue, ledger). Deterrent against casual sharing, not unbreakable; see `docs/LICENSING.md`. Not yet wired into a commercial feature, because no commercial pipeline exists yet.

- Photo and video swap pipeline: `realx swap`, `realx swap-consent`, `src/realx/media.py`, `src/realx/stages/swap.py` (engine registry + stage), provenance file per output. Licence-gated. No production engine: only the test stand-in `synthetic_blend` (not a swap). See `docs/SWAP-PIPELINE.md`.

- Mira, a second bundled character (`--avatar mira`): long hair as 11 simulated strands, collider spheres on the head, body and every finger so a tracked hand pushes the hair, nose, eyelashes, ears. Physics checked with the real three-vrm solver in `webapp/test/hair.test.mjs`; a guard (`webapp/src/hair.js`) resets the hair if the solver ever returns NaN. This is the avatar fallback. The main goal is hair from a consented PHOTO that moves and reacts to the hand: not built yet.

- S9/S10: Hair that moves, Body and clothes, and Show my hands on top, all off by default, on the face-mesh page. Body: the photo shirt and sleeves follow the live shoulders and arms (puppet.js). Hands on top draws the live picture around the tracked hands (a second documented use of the one camera upload, awaiting the owner confirmation: docs/FACEMESH.md). Tested: Node suite, and browser smoke tests on a software renderer with the photo and camera being the same picture. Not shown: how it looks on a real webcam, real speed, hiding the live clothes underneath, the live hand recoloured to the photo skin tone, stains and eating.

- S10d: no object detector adopted (licence unverified for MediaPipe EfficientDet-Lite0; OpenCV Zoo detectors would need the camera pixels in JavaScript). "Grip reach" stretches the live-hand area along the knuckle line of a curled hand: a geometric guess, tested with synthetic hands only, never with a real bottle.

- S10e/S10g: "Cover my clothes" (a slightly bigger copy of the photo shirt drawn under it, to hide the edges of your own clothes; not a background repaint) and spills/stains/drips/messy eating on the shirt (stains.js): they stick to the shirt, water dries, a hand wiped over a stain rubs it out, crumbs fall. Effects on the picture, not a simulation. Tested: Node suite and one browser run (spill drawn, cleaned, zero camera read-backs); wiping and eating with a real hand never seen.
