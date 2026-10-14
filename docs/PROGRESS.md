# Overnight progress log

Owner delegated full authority on 2026-10-14: push to main, repo stays public, make
all decisions, test without asking. This file is the loop's memory. Update it after
each step so a resumed session knows exactly where to continue.

## Done

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

## Next (in order)

- [ ] Rig over WebSocket and browser-side VRM renderer (see IDEAS.md #1)
- [ ] MediaPipe face/pose landmarker backend (verify model licenses first)
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
- Avatar is a cartoon overlay, not a rigged VRM model yet.
- Voice changing is DSP pitch shifting, not neural voice conversion.
- Watermarks are baseline LSB marks: they do not survive lossy compression.
- Speed: about 9-14 fps at 640x480 on the dev laptop's CPU.
