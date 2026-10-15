# Face mesh prototype (steps S1-S3): a photo of the user drawn on their live face

Page: `/facemesh` (needs the access token, like every page). Source: `webapp/src/facemesh/`. Study that led to it:
`SWAP-CPU.md`. Rules it follows: `SAFETY.md`.

## What it does

| Step | What | Status |
|---|---|---|
| S1 | Camera, MediaPipe face landmarker, the 468-point canonical mesh drawn as a wireframe | built, tested in Chrome with a fake camera, speed measured |
| S2 | A photo chosen by the user is wrapped on the tracked mesh (WebGL, transparent canvas over the video) | built, tested |
| S3 | Colour and light of the live face given to the photo's detail, soft edge, live eyes and mouth kept | built, tested; the look has artefacts (below) |

Not done: smoothing of the landmarks (S4), consent record and the final badge guard (S5), integration in the control room
and a virtual camera (S6, S7), putting the face on the 3D character's head. **Nothing here has been checked on a real
person's webcam**: all browser tests use a fake camera that plays a public-domain portrait.

## What it cannot do

The face shape stays the user's: only skin, texture and local features change (a photo wrapped on a mesh, not a neural swap).
Side views stretch the photo, glasses and beards are baked into or hidden by it, and the live eyes and mouth are kept by
default because the photo has no inner-mouth or eye-opening texture. Known artefacts in the one real render looked at:
pale patches next to the mouth and around glasses.

## Measured (2026-10-15, Intel UHD 620, Chrome headless, fake camera, 640x480, face only)

About 23 fps with and without a photo drawn (the 20 fps gate holds), face found in 100% of frames, detection about 23 ms
(95th percentile about 35 ms). Full-body tracking and the 3D character are not running in that page and share the same
budget in the real product.

## Privacy rules, and the one exception (granted for S3)

* The photo is chosen in the page, never uploaded or stored, and is read by a second, short-lived face model.
* A photo with no face, more than one face, a small face or a face cut by the edge is refused, with the reason shown.
* A visible "Virtual face" label stays on screen while a photo is drawn.
* The camera picture is never **read back**: no `readPixels`, `getImageData`, `toDataURL`, `toBlob`, `drawImage`,
  `createImageBitmap`, capture or recording, no network, no storage, anywhere in the page.
* **The exception.** `MeshCompositor.uploadCamera` (the only place the video is named in `compositor.js`) gives the current
  video frame to the graphics card as a texture, once per drawn frame, and only while "Colour match" is above 0. The shader
  samples a blurred copy to take the live face's colour and lighting. The result goes to the screen only.
* How it is enforced: `webapp/test/facemesh.test.mjs` checks the source (the video only inside `uploadCamera`, exactly
  three texture uploads in the file, a list of forbidden calls everywhere in the page), and
  `tests/test_facemesh_browser.py` hooks the browser's read-back calls and fails if any comes from the face-mesh code. MediaPipe's
  own runtime reads pixels for its inference; those calls are recognised by their origin and are not the page's.
* Wanting more (for example reading the live skin colour on the CPU) needs a new reviewed exception; this one does not cover it.

## Use

Run the control room (`realx serve`), then open `/facemesh` with the token link. "Choose my photo" (a photo of yourself, from the
front, face well lit). "Measure 10 s" prints frames per second, face found and detection time. Use a photo of the person using
the page only: the page cannot check that, so it is a rule of use.

## Regenerating the mesh

`node webapp/tools/make-canonical-mesh.mjs canonical_face_model.obj` (MediaPipe's file, Apache-2.0, pinned by SHA-256) writes
`webapp/src/facemesh/canonical.json`. `cd webapp && npm run build` rebuilds `src/realx/web/facemesh.bundle.js`.
