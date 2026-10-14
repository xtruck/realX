# Avatar renderer and body tracker

Source of `src/realx/web/avatar.bundle.js`: three.js and @pixiv/three-vrm (both MIT),
@mediapipe/tasks-vision (Apache-2.0) plus the files in `src/`, bundled by esbuild so the local
server can serve one script under a strict Content-Security-Policy. The bundle is committed, so end
users need no Node.

    cd webapp && npm ci && npm run build
    node --test test/*.test.mjs        # 36 tests, no browser or camera needed

Versions are pinned in `package.json` and `package-lock.json`. Rebuild and re-run the
tests (`tests/test_character.py` and `tests/test_tracking_browser.py` drive the bundle in a real
browser) after changing them.

## Modules

| File | Job |
|---|---|
| `skeleton.js` | bone and expression order shared by every end of the message |
| `retarget.js` | `BodySolver`: landmarks to bone rotations (spine, arms, hands, fingers, legs, feet, head, eyes); reports which bones it really measured; seated (shoulders only) fallback |
| `blend.js` | 52 face blendshapes to the character's blink, mouth shapes, smile and gaze |
| `assign.js` | which detected hand belongs to which arm (nearest pose wrist) |
| `oneeuro.js` | One-Euro filter for numbers and quaternions |
| `idle.js` | the relaxed stance a lost limb returns to |
| `body.js` | `BodyFilter` (smoothing, hold-and-fade, leg gating), the `body` message and its validator, `RootTracker`, `Stagger` (shares the CPU between the three models) |
| `tracker.js` | camera, MediaPipe, glue. The only file that touches the camera; it never reads pixels |
| `avatar.js` | the page: renders the character, applies body messages, publishes them |

## Page parameters (`/avatar?...`)

| Parameter | Effect |
|---|---|
| `track=1` | open this page's camera and drive the character from it |
| `publish=1` | also send the result to other pages (the OBS Browser Source) through the server |
| `preview=1` | show the camera in a corner, for checking your framing (not part of the stream) |
| `legs=auto\|off\|on` | `auto` (default): legs follow only after staying well visible for 0.6 s |
| `delegate=auto\|cpu\|gpu` | MediaPipe backend; `auto` tries the GPU and falls back to the CPU |
| `mirror=0` | character moves like the camera sees you instead of like your reflection |
| `frame=full` | frame the whole body instead of the upper body |

The filter constants in `body.js` (`KIND_PARAMS`, hold 250 ms, fade 600 ms) are starting values that
have not been tuned on a live camera yet; see the backlog in `docs/IDEAS.md`.
