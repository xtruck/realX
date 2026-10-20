# Face mesh prototype (steps S1-S5): a photo of the user drawn on their live face

Page: `/facemesh` (needs the access token, like every page). Source: `webapp/src/facemesh/`. Study that led to it:
`SWAP-CPU.md`. Rules it follows: `SAFETY.md`.

## What it does

| Step | What | Status |
|---|---|---|
| S1 | Camera, MediaPipe face landmarker, the 468-point canonical mesh drawn as a wireframe | built, tested in Chrome with a fake camera, speed measured |
| S2 | A photo chosen by the user is wrapped on the tracked mesh (WebGL, transparent canvas over the video) | built, tested |
| S3 | Colour and light of the live face given to the photo's detail, soft edge, live eyes and mouth kept | built, tested; the look has artefacts (below) |
| S4 | Smoothing of the mesh points, a lost face held then faded, a returning face faded in from where it is, one wild frame ignored, optional fade-out when a hand covers the face | built, tested; the hand option is not validated on a real hand and costs too much speed to be on by default (below) |
| S5 | A photo is drawn only under a signed consent for that exact photo, re-checked with the server; the "Virtual face" label is guarded and the photo pauses if it is hidden | built, tested; both are checks in the page itself, see the limits below |
| S8 | Optional (off by default) whole head: hair, ears, forehead top and neck from the same photo | built, unit-tested only; never run in a browser or on a webcam (see "Whole head (S8)") |

Not done: the label burned into the pixels realX sends out (S7, needed before any virtual camera), integration in the control room
and a virtual camera (S6, S7), putting the face on the 3D character's head. **Nothing here has been checked on a real
person's webcam**: all browser tests use a fake camera that plays a public-domain portrait.

## What it cannot do

The face shape stays the user's: only skin, texture and local features change (a photo wrapped on a mesh, not a neural swap).
Side views stretch the photo, glasses and beards are baked into or hidden by it, and the live eyes and mouth are kept by
default because the photo has no inner-mouth or eye-opening texture. Known artefacts in the one real render looked at:
pale patches next to the mouth and around glasses.

## Measured (2026-10-15, Intel UHD 620, Chrome headless, fake camera, 640x480, face only)

About 23 fps with and without a photo drawn (the 20 fps gate holds), face found in 100% of frames, detection about 23 ms
(95th percentile about 35 ms). After S3 and S4: 24.6 fps without a photo and 22.4 fps with one; 14.0 fps with the hand option on. Full-body tracking and the 3D character are not running in that page and share the same
budget in the real product.

## Step S4: steady, and well-behaved when the face goes

`webapp/src/facemesh/stabilize.js` works on numbers only (landmarks in, landmarks and an opacity out).

* **Smoothing**: a One-Euro filter (the one `body.js` uses) on each of the 468 points, minCutoff 1.0 and beta 150, chosen
  from a simulation (still, normal and very fast head motion; the simulation is in `stabilize.test.mjs`). In the simulation it
  removes about 40-65% of the shake of a still face and lags by about 3 px (0.5% of the width) on a very fast head turn. On the
  real-GPU run with the fake camera it lowered the nose tip's frame-to-frame move by 10-20%, which is less because that clip
  really sways. A "Smoothing" button switches it off to compare.
* **Losing the face**: the photo stays in place for 120 ms, fades out over 250 ms, then nothing is drawn. When the face returns
  after that, it starts at its new place and fades in over 150 ms instead of sliding in from the old one.
* **A wild frame**: a face box that jumps by more than 0.35 widths or changes size by more than 1.5 times in one frame is
  ignored; if it persists for 300 ms it is believed.
* **A hand over the face** (option "Hide photo when a hand covers my face", off by default): the hand model runs every 100 ms
  and the photo fades out within about 120 ms when 6 or more hand points are inside the middle of the face box.
  **Validated only on synthetic numbers and on a clip with no hand over the face.** It costs a lot: 14 fps instead of
  about 22 on the Intel UHD 620 (65 ms per hand run), below the 20 fps gate, so it stays an option until the hand model can share
  the budget (a lighter cadence, or the pose model's wrist points already used by the full-body tracker).

## Step S5: consent and the label

**Consent.** A photo is drawn only under a signed `ConsentRecord` bound to that exact photo: scope `portrait:<sha256 of the
file>`, subject `self`. The hash is computed in the browser. What reaches the server is only the hash, the user's statement
(a tick box), the number of hours and, later, the signed record: `GET /api/facemesh/terms`, `POST /api/facemesh/consent`,
`/consent/check` and `/consent/revoke`. The photo itself is never sent.

* The statement is `TERMS` in `src/realx/safety/facemesh_consent.py`: the photo is of the person using the camera, the result is
  not passed off as a real unlabelled appearance, and the "Virtual face" label stays on screen. The server refuses to issue a
  record unless the statement is an outright yes.
* The signing key is new for each run of the server, so a restart ends every record. A record lasts 2 hours by default and at
  most 12. Nothing is written to disk; the page keeps the record in memory only.
* The page checks the record on every frame (expiry, and whether the server has confirmed it recently) and asks the server
  about every 2 seconds (signature, same photo, expiry, revocation). A no from the server ends the consent for good; no
  answer for 6 seconds ends it too. "Remove photo" revokes it. When it ends the photo is forgotten and a new photo needs a
  new consent.

**The label.** `webapp/src/facemesh/guard.js` checks every 250 ms, while a photo is drawn, that the "Virtual face" label exists,
is shown, has at least 0.6 opacity (counting its parents), is at least 120 x 14 px with text of at least 11 px, lies inside the
window, still says "Virtual face", and is the element on top at three points along it (nothing covers it). If any check fails
the photo is **paused**, not discarded, with the reason on screen, and it comes back when the label is fixed.

**Limits, stated plainly.**

* Both are checks in the page's own JavaScript. They keep an honest page honest and turn hiding the label or ending the consent
  into a visible failure. They do **not** stop someone who edits the page's code.
* The statement is the user's: a hash cannot be tied to a person, so realX cannot verify that the photo is of them.
* The label is a page element, not part of the pixels. Burning it into the pixels realX sends out belongs to the output stage
  (S7) and is required before any virtual camera, because anything that captures the output would otherwise lose it.

**Tests.** The older browser tests were adapted to give consent before a photo is drawn, and to allow only the consent requests
(the hash, the statement, the hours and the record; never the photo). New: `tests/test_facemesh_consent.py` (11 tests, the record
and the routes), `webapp/test/consent.test.mjs` (13 tests, the client and the label guard), and Chrome tests in
`tests/test_facemesh_browser.py` for asking, declining, ending on the server, expiry, a silent server, and hiding, covering or
changing the label.

## Step S6a: the dashboard (a gallery of your own photos)

**What it adds.** A gallery of your own photos, each with its own signed consent; one click switches the photo on screen and
shows "Avatar changed to ...". A LIVE mm:ss badge counts only the time a photo is really drawn. Full screen keeps the label
on screen. Stop ends every consent, forgets every photo and says "Session stopped". The gallery lives in memory only.

**When a consent ends.** A photo that is not on screen leaves the gallery when its time is up or the server ended it. When the
photo on screen ends (expired, revoked, or the server did not confirm within 6 s), the neighbour in the gallery takes over,
but only after the server confirms its consent; one whose consent is over is dropped and the next is tried. If none is valid,
the screen goes back to the plain camera with "No photo is left: choose one to start again." Nothing is drawn without a valid
consent.

**Tests.** `webapp/test/gallery.test.mjs` (17 tests, including `neighbourOf`) and `tests/test_facemesh_dashboard.py` (9 Chrome
tests).

**Not yet verified.** In this laptop's software-rendered Chrome (about 2 fps) 7 of the 9 dashboard tests fail, and the second
photo does not stay in the gallery: the cause is not proven (the likely one is that loading a second face model blocks the
page for longer than the 6 s consent grace, which ends the first photo by design). It has not been run against a real webcam
or a real GPU. The fps with a photo, smoothing and the dashboard on the UHD 620 has not been re-measured since S4.

## Whole head (S8): hair, ears, forehead top and neck

**Status: built and unit-tested; never run in a browser, never run on a real webcam, no fps measured.** It is an option, **off by
default** ("Whole head (hair, ears, neck)" button in `facemesh.html`).

**Two options were looked at, the cheaper one was taken.**

* A. MediaPipe's multiclass selfie segmenter (hair / body skin / face skin / clothes / others, Apache-2.0) run on the live frame
  at a reduced cadence. It is a second neural network on a laptop that is already near the 20 fps gate with one model (hand
  model alone: 14 fps), it needs the live frame's mask back on the CPU or a shared GL context (neither exists here), and a
  mask 256x256 upscaled onto a moving head flickers. Not chosen.
* B. (chosen) **Extra anchor points around the face plus a one-time cut of the photo.** `webapp/src/facemesh/head.js`: two
  rings of 36 points are pushed outwards from MediaPipe's face oval by a fraction of the face width (0.55 above for hair, 0.30
  at the sides for ears, 0.50 below for the neck; the direction follows the head's tilt). The same function runs on the live
  face and on the photo's face, so every live ring point has its photo point (the photo is wrapped on 72 more vertices and 144
  more triangles, drawn in the same pass). The segmenter is used **once per photo, on the photo**, when the photo goes on
  screen: only hair, skins and accessories are kept (so the photo's background and clothes are never pasted around the head),
  softened, and uploaded as a small mask texture. The ring fades to nothing at its outer edge, and keeps 65% of the photo's own
  colour (the live picture there is hair or room, not skin), so the blend is soft. Per frame the cost is the ring maths
  (a few hundred multiplications) and 144 more triangles; there is no per-frame model.

**Why it should keep the fps (reasoning, not a measurement).** The live loop gains no model. The one-time cut of a photo blocks
the page for the length of one segmenter run (not measured; it also loads a 16 MB model on first use). If you turn it on and the
frames-per-second box says "not met", leave it off.

**Model.** `selfie_multiclass_256x256.tflite` (float32), pinned by sha256 `c6748b1253a99067ef71f7e26ca71096cd449baefa8f101900ea23016507e0e0`
(I downloaded it and hashed it: 16 371 837 bytes) in `src/realx/models.py` (`mp_segmenter`) and served by `/mp/models/` like
the others (`MP_MODELS` in `server.py`). It is not in the start-up prefetch (`PREFETCH_MODELS`): only this page's option asks for
it. `docs/LICENSE-AUDIT.md` has a row; the Apache-2.0 statement comes from Google's model card and I did not re-read the card.

**Privacy rules, unchanged.** No new camera exception: the segmenter runs in `IMAGE` mode on the gallery photo
(`segment(item.image)`, the only `.segment(` call; no `segmentForVideo`), never on the video. The page reads back the segmenter's
class map of **the user's photo** (`getAsUint8Array`, a list of class numbers, not camera pixels) and uploads the resulting
mask as a texture: that is one more `texImage2D` in `compositor.js` (now 4: photo, live frame, placeholder, head mask), and the
test says so. The camera frame is still only touched by `MeshCompositor.uploadCamera`. Consent per photo and the "Virtual face"
label guard apply to the ring exactly as to the face (same draw call, same gates). A photo that goes away takes its mask with it.

**Tests (no browser).** `webapp/test/head.test.mjs`: the oval list against MediaPipe's own, ring distances above / sides /
below, tilt, aspect, degenerate faces, ring triangles and fades, the mask classes, softness, thinning and the usable-mask check,
the compositor drawing the ring only when on AND masked, the mask forgotten with the photo, and source checks that segmentation
only ever receives the gallery photo, that `head.js` reads no pixels and names no camera, the pinned hash, and the off-by-default
button.

**Not verified.** Everything visual and every number: how it looks (hair can leave a visible seam where the live background shows
through the soft edge; long hair, hats and a head turned more than about 30 degrees will look wrong because the ring is a flat
stretch of the photo, not a 3D head); the colour weight 0.35 and the reach values were chosen by eye on paper, not tuned; the
segmenter's quality on real portraits (beards, glasses, hair colours, dark skin, busy backgrounds); how long the one-time cut
takes on the UHD 620; the model download time; whether the page's fps stays at or above 20 with it on; a real webcam. The WebGL
shader additions were not compiled by a real driver (the node tests use a stand-in context). If the mask cannot tell head from
background (under 2% or over 95% of the photo), the option says so and draws the face alone.

## Privacy rules, and the one exception (granted for S3)

* The photo is chosen in the page, never uploaded or stored, and is read by a second, short-lived face model.
* A photo with no face, more than one face, a small face or a face cut by the edge is refused, with the reason shown.
* A visible "Virtual face" label stays on screen while a photo is drawn, and the photo pauses without it (S5).
* The one read-back the page makes is of **your photo's** segmentation class map (`getAsUint8Array`, class numbers, for Whole head,
  Hair and Body). The page raises a number-only flag (`readingPhotoMask`) while it copies it, and the browser test counts those calls
  separately; any other read-back by the page, and any at all of the camera, still fails the test.
* The camera picture is never **read back**: no `readPixels`, `getImageData`, `toDataURL`, `toBlob`, `drawImage`,
  `createImageBitmap`, capture or recording, no network, no storage, anywhere in the page.
* **The exception.** `MeshCompositor.uploadCamera` (the only place the video is named in `compositor.js`) gives the current
  video frame to the graphics card as a texture, once per drawn frame, and only while "Colour match" is above 0. The shader
  samples a blurred copy to take the live face's colour and lighting. The result goes to the screen only.
* How it is enforced: `webapp/test/facemesh.test.mjs` checks the source (the video only inside `uploadCamera`, exactly
  three texture uploads in the file, a list of forbidden calls everywhere in the page), and
  `tests/test_facemesh_browser.py` hooks the browser's read-back calls and fails if any comes from the face-mesh code. MediaPipe's
  own runtime reads pixels for its inference; those calls are recognised by their origin and are not the page's.
* **A second use of the same upload (S10c, "Show my hands on top", off by default).** The owner asked for his own live hands, and what
  they hold, to stay visible over the photo's body. With that option on, the same `uploadCamera` also runs while "Colour match" is 0,
  and a second shader draws the live picture only inside soft shapes around the tracked hands. It is sampled by the shader and goes to
  the screen only: no read-back, no copy, no storage, no network. It adds no new upload call and no new way out. **Status: requested by
  the owner in chat on 2026-10-16 and written down here; it still needs his explicit confirmation as a reviewed exception.** Nothing in
  the live picture is analysed on the CPU for it (the hand shapes come from the hand model's own landmarks).
* **Why there is no object detector (S10d).** Showing a held object by detecting it was looked at and not adopted: MediaPipe's EfficientDet-Lite0
  weights have no licence statement from Google that I could verify, and the OpenCV Zoo detectors (Apache-2.0) are ONNX models that would need
  the camera pixels in JavaScript, which this page never does. Rows in `docs/LICENSE-AUDIT.md`. Instead "Grip reach" stretches the live area
  along the knuckle line of a curled hand (a geometric guess, off at 0).
* Wanting more (for example reading the live skin colour on the CPU) needs a new reviewed exception; these do not cover it.

## Use

Run the control room (`realx serve`), then open `/facemesh` with the token link. "Choose my photo" (a photo of yourself, from the
front, face well lit). "Measure 10 s" prints frames per second, face found and detection time. Use a photo of the person using
the page only: the page cannot check that, so it is a rule of use.

## Regenerating the mesh

`node webapp/tools/make-canonical-mesh.mjs canonical_face_model.obj` (MediaPipe's file, Apache-2.0, pinned by SHA-256) writes
`webapp/src/facemesh/canonical.json`. `cd webapp && npm run build` rebuilds `src/realx/web/facemesh.bundle.js`.

## Control room: Photo face mode

The control room has a "Photo face" picture mode next to Cartoon, Character and Full body. Choosing it loads `/facemesh` in a frame
inside the control room (`#facemeshFrame`, `allow="camera"`), so your photo on your live face can be tried without leaving the
page. The frame owns the camera: the server releases its own camera and the control room drops its MJPEG picture, as in Full body
mode. Switching to another mode blanks the frame and removes its `src`, which stops the camera. `/facemesh` is sent with
`X-Frame-Options: SAMEORIGIN` (its CSP already has `frame-ancestors 'self'`), so only this server's own pages can frame it. Photo
face is not an OBS source yet, so the OBS section is hidden in this mode.

## Clean the edges (S13c)

**Too slow here: it turns itself off (2026-10-20).** A segmenter pass blocks the page while it runs (about 12 s per pass measured on a
software renderer). After one pass over 1 s, or two in a row over 250 ms, the option switches off, the status line says why, and
`window.__facemesh.seam` reads `"too slow"`. Clicking "Clean the edges" tries again.

The live-frame segmenter keeps the privacy rule: the camera goes to MediaPipe as the video element itself, MediaPipe answers with WebGL textures, one small shader folds them into a running value inside MediaPipe's own context, and the compositor uploads that mask canvas (`MeshCompositor.setSeam`, a sixth texture upload, of values and not of the camera). `seammask.js` and `seams.js` may not call `getAsUint8Array`, `getAsFloat32Array`, `readPixels` or any other read-back (a Node test checks it); there is no CPU delegate for this reason.

## Photos at several angles (Stage 3)

**Status: built and tested on synthetic numbers and in Chromium with a fake camera; not seen on a real webcam; fps not measured on
the target laptop.** Option "Photos at several angles", **off by default**. It aims at the top expected defect, side views
stretching one front-on photo. The owner's Stage 2 ranking (`scripts/facemesh_baseline.md`) had not arrived when this was built.

**What it does.**
- With the option on, "Add a side photo" adds photos of the user with the head turned to one side.
- The toggle sits at the end of the control bar. The "Add a side photo" button, the side-photo list and the explanation
  appear at the end of the page only while the option is on, so with it off the page keeps its height. The dashboard tests
  showed that 128 px of extra page height was enough to scroll the label out of the window after a gallery click.
- Scrolling down to those controls takes the "Virtual face" label out of view, which pauses the photo (the existing label
  guard) until you scroll back.
- Each frame, the face is drawn from the photo whose head turn is nearest the live head's (`webapp/src/facemesh/angles.js`).
- It switches only when another photo is at least 5° nearer, with a 200 ms crossfade: the old photo is drawn fully, the new one
  over it at the fade's opacity.
- **Only the face layer** changes photo. The head ring (hair, ears, neck), the moving hair and the body keep the front photo.
- "Hold the mask when turning" measures the turn from the photo being drawn, so a 30° photo is not faded out at 30°. With the
  option off, the hold measures from facing the camera, exactly as before.

**Limits on side photos.**
- A side photo's turn is measured from its own landmarks (signed yaw from the cheek points).
- Refused, with the reason in the status line:
  - turned more than **45°**;
  - within **8°** of the front photo's turn;
  - a fifth side photo (at most 4 per front photo);
  - the same file twice.
- No photo-quality advice is shown for side photos: its "face the camera" tip would be wrong for them.

**Consent.**
- Every side photo has its own signed consent bound to its own hash, asked like any photo.
- The page checks the front photo and its side photos in **one** request every 2 s, `POST /api/facemesh/consent/check-batch`.
  Each record is checked on its own on the server, at most 5 per request. The request carries records and hashes only.
- A side photo the server refuses is dropped and never drawn again, not even to fade out.
- A side photo whose check is merely late is left out of the choice until it is confirmed.
- Side photos end with the front photo they belong to, with Stop, and when the option is turned off.

**Loading, and the 6 s grace.**
- Side photos load **one at a time** (`SerialLoader`), with one image face model that stays open while the option is on.
- While a side photo is decoded and its face found (the part that can block the page, **not** while its consent question is open),
  the 2 s timed check treats a verdict that is only late (no confirmation for 6 s) as **pause**, not end (`gateVerdict`). A
  face-model load can block the page for seconds, and that alone must not end a consent the server never refused.
- A refusal, a revocation or an expiry still ends the photo at once.
- A paused photo is not drawn until the server confirms it again.
- Node test: a 9 s block with no answer pauses and does not end. After the load, a fresh confirmation brings the photo back. The
  same silence with no load in progress still ends it.

**Privacy.**
- No new read-back. Side photos reach the graphics card through the compositor's one photo-upload helper (`_uploadPhoto`), so the
  file still has exactly six `texImage2D` calls.
- The camera is still named only in `uploadCamera`.
- `angles.js` touches no DOM, pixels or network (source check).
- The Chromium test counts zero read-backs by the page with a side photo in use.

**Tests.**
- `webapp/test/angles.test.mjs`, 15 Node tests: yaw sign and size; the 45°, 8° and count limits and their messages; picker start,
  crossfade timing, 5° hysteresis, a dropped photo never drawn; one-at-a-time loading; the grace rule; the batched check and a
  refusal ending only its photo; hold measured from the drawn photo; the compositor's draw order (ring from the front photo, face
  twice mid-fade), its fallbacks, and no texture upload on a switch; source checks.
- `tests/test_facemesh_consent.py`: the batched check, record by record, a malformed batch, the route behind the token, a full
  batch fitting the 4 KiB JSON limit.
- `tests/test_facemesh_angles_browser.py`, Chromium with a fake camera, and only these:
  - the option is off by default;
  - a same-facing side photo is refused with the reason shown;
  - an accepted side photo asks for its own consent;
  - the timed check becomes one batched request;
  - there are zero read-backs;
  - turning the option off ends the side photo's consent.
  - Its "turned" photos are perspective warps of the test portrait (about ±8°), not real side views.

**Not verified (not seen on a real webcam).** How it looks:
- whether a side photo at 20 to 45° stretches less than the front photo;
- whether the crossfade reads as a smooth turn or as a visible swap;
- seams between a side-photo face and the front-photo ring and hair;
- different light or glasses between photos.

Also not verified: the real fps. The estimate is no cost in steady state (one face draw, as before) and one extra face draw
(about 4 ms on the UHD 620, from the 24.6 to 22.4 fps above) during each 200 ms crossfade, not measured. **The 20 fps gate
applies: if the page shows "20 fps gate: not met" with the option on, leave it off.**
