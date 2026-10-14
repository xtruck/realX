# Photoreal face replacement on a CPU-only computer (study, not implemented)

Owner's request (2026-10-14): replace the user's face with a photoreal synthetic face, on a computer without a
GPU. This is a study with the facts that were verified and the ones that were not. **No code for it exists yet and
nothing here has been measured for this feature.**

## The machine

HP EliteBook 850 G6, Intel Core i5-8365U (4 cores / 8 threads, 15 W), Intel UHD 620, 7.8 GB RAM, **no NVIDIA GPU**.
The face, pose and hand tracking alone already uses the whole frame budget there: about 25 fps in total, each of
the three MediaPipe models costing 27-41 ms (`BENCHMARKS.md`).

## Why a neural swap is not the way on this machine

* **Licence.** InsightFace states, on its model zoo page, that "ALL models are available for non-commercial
  research purposes only" (fetched 2026-10-14). `inswapper_128` and the `buffalo_l` detector are InsightFace models,
  so `models.py` blocks them. The page says nothing about `inswapper_128` itself, and InsightFace does not appear to
  publish it officially, so **its provenance and hash cannot be pinned to an official source**. Distribution is
  personal for now, but "research purposes only" is not obviously "personal streaming"; that reading is the owner's
  to make, and the code keeps the models blocked until an explicit, documented opt-in exists.
* **Speed.** A neural swap adds a face detector, an embedding network and a generator on top of the tracker. No such
  model has been run on this CPU here, so no figure is claimed; the tracker's own 25 fps suggests no spare budget.

## A route that fits a CPU and is licence-clean: texture-mapped face mesh

What AR face filters do. Instead of a neural network, the synthetic face is **a photo wrapped on the tracked face mesh**.

```
webcam frame ──► MediaPipe FaceLandmarker (already running, 478 points, Apache-2.0)
avatar photo ──► the same landmarker, once  ──► where each mesh point sits in the photo (texture coordinates)
canonical mesh triangles ─► 898 triangles over 468 vertices (MediaPipe, Apache-2.0)
                 ▼
WebGL: draw the camera frame, then the triangle mesh at the user's landmark positions, textured with the photo,
       soft edge on the face oval, user's eyes and mouth interior kept or replaced (a setting)
```

Verified today: the MediaPipe JS API exposes the landmarks and the face-oval, lips and eye outlines; the canonical
face model (`canonical_face_model.obj`, 45,999 bytes, sha256 `8bac80443397e113...`) has **468 vertices, 468 texture
coordinates and 898 triangles**; the package licence is Apache-2.0. Every drawing step is WebGL on the integrated GPU,
which is what renders the 3D character at ~48 fps today; the tracker already runs there.

### What it gives, and what it does not

| Gives | Does not give |
|---|---|
| Real time on a CPU plus integrated GPU, no model to download | A neural swap: the **face shape stays the user's**; only skin, texture and local features change |
| Follows head turns and expressions because the user's own landmarks drive it | Convincing profile views (the photo is stretched), beards, glasses, hair, lighting changes |
| No licensing problem: MediaPipe and the mesh are Apache-2.0, the code is ours | An inner-mouth or teeth texture (keep the user's mouth interior, or cut it out) |

Expect a "mask" look at first. Colour matching (skin tone and brightness of the photo to the live face) is what
decides whether it looks like a filter or like a person; it is part of the prototype, not an extra.

### Open questions (each needs a measurement or a decision)

1. **Frame rate:** tracking plus compositing at 640x480 on this laptop. Gate: at least 20 fps, measured idle, with
   the character still rendering; otherwise a lower preset.
2. **Looks:** only the owner can judge it. Gate: the owner's approval on a live test.
3. **Where the composed picture goes.** The compositor needs the camera picture as a texture, so it runs in the
   page that holds the camera. OBS shows a different page. Options: (a) test whether an OBS Browser Source may open
   the camera itself; (b) capture the control-room window (the badge can then be cropped); (c) a native virtual camera
   fed by the page (Softcam, see `SOFTCAM.md`), which is the only route where realX controls the final pixels and
   the "Avatar IA" badge can be guaranteed. (c) means camera frames travel over loopback to a local helper, so the
   privacy statement changes from "never leaves the page" to "never leaves this computer".
4. **The source faces.** Rule: only synthetic faces, or the user's own verified face. The images need a licence
   that allows this use; none has been chosen or checked. Candidate: generate a small set once on the CPU with a
   permissively licensed generator, or use a CC0 set. Unverified.
5. **The privacy lint.** `tracker.js` is checked for never reading pixels. The compositor must use the video as a
   texture (`texImage2D`), so the lint needs a narrow, reviewed exception for that module only; network, encoding
   and storage calls stay forbidden there.

### Rules that do not change

Visible "Avatar IA" badge applied last (impossible to switch off on realX's own output), consent record and
disclosure for any likeness, no anti-detection mode, models blocked until verified. A photo of another real person
is never accepted.

## Order of work

1. Validate the existing pipeline through OBS Virtual Camera (owner's request, first).
2. Study Softcam (`SOFTCAM.md`).
3. Build the mesh-texture prototype as a standalone page; measure fps; owner judges the look.
4. Only then decide how composed frames reach OBS or a virtual camera, and choose the source faces.
