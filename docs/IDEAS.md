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

## Next, ranked by value for a CPU-only laptop

1. **Rig numbers over WebSocket, avatar rendered in the browser** (three.js +
   @pixiv/three-vrm, both MIT). The browser draws at 60 fps on the integrated GPU,
   interpolating between 15-30 Hz tracker updates, and the per-frame JPEG encode goes
   away. Output sink is an OBS Browser Source, which avoids `pyvirtualcam` (GPL-2.0).
2. **Face and body rig**: MediaPipe Face Landmarker (478 points, 52 blendshapes) and
   Pose Landmarker (33 body points). MediaPipe code is Apache-2.0; search results
   report the model files as Apache-2.0 too, but check the model cards. Retarget with
   Kalidokit-style logic (MIT, reimplemented, not copied).
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

## Rejected or deferred

- Cloud GPU backend, accounts, billing: premature before the avatar tier has users.
- Training and animator tiers: blocked on model licensing.
- AIST++ dance clips for benchmarking: restrictive terms. Record our own clips.
- Seed-VC, FaceFusion, DeepFaceLive code: copyleft or restricted, ideas only.

## Tooling notes

- REA (reverse-engineering toolkit) analyzes binaries, packages and live browser pages.
  It becomes useful when there is an installer or third-party build to audit; it does
  not apply to this pure-Python source tree.
