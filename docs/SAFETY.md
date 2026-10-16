# Safety and responsible use

realX produces synthetic video of people's faces. These controls ship with the product.

1. **Consent gate.** A swap needs a signed consent record for the source identity
   (who, scope, expiry). Without one the pipeline raises `ConsentError`.
2. **Watermark.** Every output frame carries a payload (product, version, session,
   consent id). The baseline implementation is an LSB embed. Production needs a
   robust watermark that survives compression.
3. **Provenance.** Exported files get C2PA content credentials (roadmap M4).
4. **Content filter.** Block nudity and graphic content as Deep-Live-Cam does, with a
   licensed classifier. Interface exists, model pending.
5. **Terms of use.** No impersonation, fraud, harassment or non-consensual sexual
   content. Account-level enforcement for the hosted tier.
6. **Logging.** Hosted tier keeps an audit trail of consent id, session and time.

These are product requirements, not optional extras. Payment processors, app stores
and most jurisdictions now expect them.

## What the character, background and voice-preset features do and do not touch

- **Character (Pip).** An original cartoon with no likeness of a real person. The browser
  gets head-pose numbers only. The stream announces itself as a virtual character
  (hello message and an on-screen badge, which `?badge=off` hides).
- **Background replacement.** Edits only the area around the user's own picture; the
  person's pixels are never regenerated. Photos stay in memory. A pipeline cannot place
  it after a watermark, because that would erase the mark.
- **Voice presets.** Effects on your own voice. There is no speaker data in a preset, and
  the test suite fails if a field that could hold one is added without review.
- **Unchanged.** Anything that imitates a real person (`voice_convert`, face swaps) still
  needs a consent gate before it and a watermark after it. `inswapper_128` and `buffalo_l`
  stay blocked.

## Full-body tracking (camera to character)

- **The camera picture stays in the page.** `/avatar?track=1` opens the camera with `getUserMedia`
  and gives each frame to MediaPipe (face, pose, hands) running in that page. The tracker source never
  draws the video to a canvas, reads pixels back, records, encodes or sends it; a test greps the
  source for those calls, and a Chromium test with a fake camera records every request and WebSocket
  frame the page makes. Models and the WASM runtime are served by this computer, so no third party
  sees the camera or loads code at run time.
- **What leaves the page is numbers.** One message, `{type:"body", f, q, e, r}`: group flags, one
  rotation per bone (212 numbers), 11 expression weights and a position. About 2 KB. Nothing in it
  identifies a person or carries an image. The server checks size, structure and that every number is
  finite and in range before it forwards anything, and it re-serialises the message itself.
- **The relay (OBS Browser Source).** A tracking page publishes to `/ws/rig?publish=1`; a plain `/avatar`
  page shows it. Same-origin only (Origin header and Host checks), one publisher at a time, rate
  limited, closed on a bad message. The control-room tab must stay open while streaming, because the
  camera and the models run in it. In Full body mode the server releases its own camera.
- **Still labelled.** The character page keeps its "Virtual character" badge; the tracking page gets
  it too. The character is an original cartoon, so tracking your body does not make anyone look like
  a real person. Using someone else's likeness still needs the consent gate, the DIGITAL HOST bar and the
  watermark described below. Platform rules still apply: TikTok requires AI-avatar disclosure, and its
  LIVE rules limit AI-generated voices and animated figures that cover more than half the screen.
- **Limits.** A webcam sees one side of you. Hidden or fast hands, crossed arms and legs behind a desk are
  estimated from one view, so those moves can look wrong for a moment; the filter holds a lost limb for
  a quarter of a second and then lets it relax rather than showing a guess. Legs are used only after
  they have stayed well visible for 0.6 s (the default for seated people).

## Microphone (optional) and portraits

- **Microphone.** Off unless the control room selects one (`mic=` on the tracking page). Audio is analysed in
  that page with Web Audio (browser noise suppression, echo cancellation, an energy-based speech detector) and is
  never recorded, played back, uploaded or stored: the audio code is checked by a test for recording, playback,
  worklet, network and storage calls. The only thing that leaves the analysis is five mouth-shape weights, which
  travel inside the body message so the OBS view shows the same mouth. The microphone permission is sent only on
  pages that ask for it.
- **Portrait animation.** No engine is enabled (see `PORTRAIT.md` for why). The adapter is ready behind the usual
  rules: the consent gate must come first, the person's likeness needs the visible DIGITAL HOST label, then the
  watermark. A portrait needs its own consent record bound to the image's hash and an attestation that the
  uploader owns it or is authorised; the record is re-checked on every frame, so revocation or expiry stops a
  running stream, and the image is kept in memory only. A test-only warp engine exists for the test suite and
  refuses to run without an environment variable.

## Digital co-host (a real person who agrees)

- `realx cohost grant --name "Kofi" --friend-agreed` issues a signed, scoped, expiring consent
  record. It refuses without `--friend-agreed` and prints a revoke code once; only the holder
  of that code (the co-host) can end consent. A running stream stops at its next frame and it
  stays ended after a restart. Limit: the vault is on the streamer's computer, so a person with
  full control of it could delete the revocation marker; an unremovable one needs a key the
  streamer does not hold (roadmap M4).
- Any stage that shows a real person's likeness (`uses_likeness`) cannot be built into a
  pipeline without: a consent gate before it (a likeness stage counts as needing consent), a visible "DIGITAL HOST | name | shown with
  permission" bar after it, then the watermark, and no picture-editing stage may sit between the bar and the watermark.
  The bar is not configurable.
- No face-rendering model ships. `inswapper_128` and `buffalo_l` stay blocked, so today the
  co-host flow is the consent, label and revoke machinery plus a stub renderer. A real
  renderer needs a licensed or self-trained model first.

## Face-mesh prototype: your own photo on your live face

The `/facemesh` page can draw a photo of the user on their live face. It does so only under a signed consent bound to the
photo's hash, and pauses when the "Virtual face" label is hidden. Those are checks in the page itself: they keep an honest page
honest, not a lock against someone who edits it, and the label is not yet part of the pixels realX sends out (that is for the
output stage before any virtual camera). Details and limits: `FACEMESH.md`.
