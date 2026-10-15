# Ideas log

Sources: ECC architect review, ECC security/code reviews, GitHub survey, web research
(2026-10-14). Licenses below come from search results and model cards seen during
research. **Verify each license file before adding a model to `MANIFEST`.**

## Shipped from this list

| Idea | Result |
|---|---|
| Time-aware tracking (gate and expiry in elapsed frames) | 0 ghost faces under random 1-13 frame skips |
| Low-confidence rescue (ByteTrack idea) | face coverage under blur 44-64% -> 93-96% |
| Optical-flow hints for coasting (LK flow) | dance p95 103 -> 64 px, jump 54 -> 8 px, sprint 90 -> 73 px |
| One-Euro filter tuned on degraded motion | median error 8-12 px -> 4-7 px |
| Wall-clock demo rendering (no skip spiral) | live demo 2 fps -> 14 fps on the dev laptop |
| Consent + watermark ordering enforced at pipeline build time | tests |
| Authenticated watermark tags (video and audio) | tests |
| Rig over WebSocket + browser VRM renderer (#1) | 60 fps display from 15-30 Hz rig, no JPEG in character mode |
| Background replacement with PP-HumanSeg | 10 ms/frame; kept person 0.9+, replaced room 0.9+ on test photos |
| Character voice presets with formant control | each preset tested for pitch, brightness, band limits, chunking |
| Full-body tracking in the browser (face, 52 blendshapes, gaze, spine, arms, hands, fingers, legs, feet) | 38 node tests on synthetic landmarks; Chromium test with a fake camera; camera pixels never leave the page |
| Per-limb hold-and-fade, relaxed idle pose, seated upper-body mode, legs only after 0.6 s of good visibility | tests; Kalidokit's demo (the common baseline) holds a lost bone forever and uses a fixed lerp of 0.3 |
| Hands assigned to arms by nearest pose wrist (MediaPipe's own left/right label is only a fallback) | tests, including swapped labels and a stray hand |

## Next, ranked by value for a CPU-only laptop

1. ~~**Rig numbers over WebSocket, avatar rendered in the browser**~~ (shipped) (three.js +
   @pixiv/three-vrm, both MIT). The browser draws at 60 fps on the integrated GPU,
   interpolating between 15-30 Hz tracker updates, and the per-frame JPEG encode goes
   away. Output sink is an OBS Browser Source, which avoids `pyvirtualcam` (GPL-2.0).
2. ~~**Face and body rig**~~ (shipped, see below): MediaPipe Face (478 points, 52 blendshapes),
   Pose (33 points, metric world coordinates) and Hand (21 points each) landmarkers, in the
   browser. Model licenses verified from the five model cards (Apache-2.0, `LICENSE-AUDIT.md`).
   Retargeting is a clean-room implementation, not Kalidokit's code.
3. **Audio-driven mouth fallback**: keep one viseme channel; when face confidence
   drops, blend from tracked mouth weights to an audio estimate (loudness for jaw,
   MFCC vowel templates as in uLipSync, MIT) over 100-200 ms, and back on recovery.
4. **Voice chain**: Silero VAD (MIT, ONNX) replaces the threshold gate; RNNoise
   (BSD-3) for noise; `sounddevice` for live input. Character presets on top of the
   phase vocoder, plus formant control via WORLD (`pyworld`, modified BSD).
5. **Neural voice conversion backend** behind the existing `VoiceBackend` protocol:
   - RVC (MIT) is the simplest permissive route, but is GPU-oriented.
   - LLVC (CPU-first, under 20 ms) fits this laptop; **license not confirmed**.
   - MeanVC2 (2026) reports CPU streaming; **license not confirmed**.
   - Seed-VC is GPL-3.0: ideas only.
   Every backend sits behind the consent gate and watermark stage.
6. **Constant-acceleration Kalman filter** per track, and head position from pose
   (nose and ears) when the face is fully blurred.
7. **Robust provenance**: TrustMark (Adobe, MIT) for video, AudioSeal for audio
   (check its weight license), `c2pa-python` for exported files. The LSB marks do not
   survive JPEG or codecs, and the server's own MJPEG encode erases the video one.

## Full-body backlog (from the 2026-10-14 research, ranked)

How good is this evidence? A research agent surveyed full-body capture apps. Only a few facts were
confirmed from fetched pages (Kalidokit is MIT, deprecated, legs unfinished; its demo uses
MediaPipe Holistic with a fixed per-frame lerp of 0.3 and hips position 0.07, holds a lost bone
forever, and never rigs feet; the RTMW accuracy table). REA could inspect the demo's page layout
and resource sizes but returned no script bodies and then dropped its connection, so constants
quoted below are starting points to tune, not measurements. Check every repo's LICENSE before
adopting anything.

1. **Tune the filter constants on a live camera** (`KIND_PARAMS` in `body.js` are untuned).
   Record 60 s of landmarks, replay them offline, pick min-cutoff and beta per bone kind.
2. **Two-bone IK with elbow and knee pole hints**: keeps the bend plane steady when depth is
   ambiguous (forearm pointing at the camera). Medium effort, medium-large benefit.
3. **Wrist twist**: take the palm normal from the hand landmarks and split the roll between
   forearm and wrist to avoid candy-wrapper twisting.
4. **Foot contact detection and locking** (lock on near-zero foot speed, unlock on drift) with hip
   height smoothing, to stop floating or sliding feet. The pose model only gives heel and toe-tip
   points, so toes are the weakest part of the body today.
5. **Finger limits**: clamp joints to anatomical ranges, extra smoothing, drive the distal joint from the middle one.
6. **Confidence-weighted smoothing**: widen the filter when a landmark's visibility is low.
7. **RTMW (133 whole-body keypoints, includes feet and toes) through onnxruntime-web**: the only
   route to real toe tracking. High effort; check the weights and training-data licence and the
   CPU cost first.
8. **Hair and ear physics**: the VRM spring bones already run each frame and react to head and body
   motion. Driving them harder from head velocity is a tuning job.
- Ideas only (licence or hardware): SMPL-X family, WHAM, 4DHumans, MotionBERT (licence unchecked),
  and every proprietary app (Move AI, DeepMotion, Rokoko Vision, Animaze, Warudo).

- Offline gap filling (FaceFusion study, idea 5): `realx.tracking.fill_track_gaps` linearly
  interpolates 1..5 missed frames of a track in a finished clip, marks them `InterpolatedFace`
  (`interpolated=True`, never a detection) and refuses to bridge size jumps, big position jumps or
  boxes that overlap another face. Not wired to any entry point yet (no offline clip pipeline
  exists); the live `FaceTracker` is untouched. Written from scratch.

## Rejected or deferred

- Cloud GPU backend, accounts, billing: premature before the avatar tier has users.
- Training and animator tiers: blocked on model licensing.
- AIST++ dance clips for benchmarking: restrictive terms. Record our own clips.
- Seed-VC, FaceFusion, DeepFaceLive code: copyleft or restricted, ideas only.

## Tooling notes

- REA (reverse-engineering toolkit) analyzes binaries, packages and live browser pages.
  It becomes useful when there is an installer or third-party build to audit; it does
  not apply to this pure-Python source tree.
