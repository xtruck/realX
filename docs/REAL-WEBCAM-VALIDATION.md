# Validating on a real webcam and microphone

**Status: this procedure has not been run by the maintainers on a real person.** The automated tests use
a fake camera that plays a portrait photo, and made-up landmark data. Hands, legs, fast movement, a
microphone and OBS have never been checked with a person in front of the camera. The pass thresholds
below are **provisional**: they were chosen before any real measurement and should be changed when real
numbers show they are wrong. Record what you see even when you think it is fine.

You need about 40 minutes, the computer you will stream from, a webcam, optionally a microphone, and OBS.
Install and start the control room first (`docs\WINDOWS.md`). Choose **Full body**, allow the camera, and
leave **Quality** on *Balanced* for the first pass.

Where this guide says "read the status panel", it means the **Streaming status** block under the picture.

## 1. Set up the picture (5 minutes)

1. Light your face from the front. No window or lamp behind you.
2. Sit or stand so your head, shoulders and both arms are in the camera preview (the small picture in the
   corner), with room to raise a hand beside your head. For the leg tests (step 11) you also need your
   whole body in view.
3. Press **Recenter** while sitting or standing the way you will during the stream.
4. Wait 10 seconds. Read and write down, with your hands in your lap:

| Reading | Pass |
|---|---|
| Tracker state | `Running` |
| Tracker speed | >= 15 frames per second |
| Model updates per second, pose and face | each >= 8 per second |
| Running on | note GPU or CPU for each model |

If the speed or the updates are below the pass line, set **Quality** to *Low*, close other programs that
use the GPU (browser video, games, screen recorders), wait 10 seconds and read again. Write down both
sets of numbers.

## 2. Head, eyes, blinks, mouth (5 minutes)

| Step | What to do | Pass |
|---|---|---|
| 2.1 | Turn your head slowly left, then right, about 45 degrees, over 10 s | the character's head follows; *What it sees* says `face yes` for at least 9 of the 10 seconds |
| 2.2 | Nod and tilt over 10 s | the head follows both movements |
| 2.3 | Blink firmly 10 times, one per second | the character blinks on at least 8 |
| 2.4 | Open your mouth wide 5 times | the character's mouth opens on at least 4 |
| 2.5 | Smile 5 times | the character smiles on at least 4 |
| 2.6 | Look left, right, up, down, without moving your head | the character's eyes move in the same directions |

## 3. Arms and the delay (10 minutes)

| Step | What to do | Pass |
|---|---|---|
| 3.1 | Raise your right arm slowly to shoulder height, then overhead, then lower it. Then the left | the character's matching arm follows through the whole range, no snapping |
| 3.2 | Wave both hands for 5 s | the arms keep up; no limb disappears for more than 1 s |
| 3.3 | **Delay.** Record the screen with Win+G at 60 frames per second. Raise a hand quickly. In the recording, step frame by frame: count the frames from the moment the hand in the preview inset starts to move to the moment the character's hand starts to move | at most 12 frames (200 ms). Write down the number you measured |
| 3.4 | Cross your arms for 3 s, then uncross | no arm stays swapped for more than 1 s |
| 3.5 | Lower both arms out of the picture for 5 s, then raise them | the character's arms relax to its resting pose (they do not freeze in the air) and recover when you return |

## 4. Hands and fingers (10 minutes)

| Step | What to do | Pass |
|---|---|---|
| 4.1 | Hold one open hand in front of you, palm to the camera, for 10 s. Repeat with the other hand | *What it sees* says `hand(s) tracked` in >= 90% of the 10 s with the hand in view (9 seconds or more), for each hand |
| 4.2 | Hold both hands up together for 10 s | `2 hand(s) tracked` in >= 90% of the 10 s |
| 4.3 | Make a fist, then open it, 5 times | the character's fingers close and open each time |
| 4.4 | Curl one finger at a time (thumb, index, middle, ring, little) | at least 4 of 5 fingers can be told apart on the character |
| 4.5 | Hold a hand near your face and near the edge of the picture | note what *What it sees* says; write down when it shows `hand seen, but it is not next to a wrist...` or `hand found, but its arm is not visible enough` |

If hands fail 4.1: read what *What it sees* says during the failure. `no hand seen` means the hand model
does not find your hand (more light, larger in the picture, palm toward the camera, try *High* quality).
`not next to a wrist` or `arm is not visible enough` means the body model does not see your arm; show more
of your forearm.

## 5. Legs and feet (5 minutes)

Seated: for 60 s sit with your legs under a desk. **Pass:** the character's legs stay relaxed and do not
twitch. Standing (optional): tick **Show the whole character**, step back until your whole body is in view,
and stand still for 10 s. **Pass:** after about a second the legs follow you; lift one foot and the
character lifts its foot. Toe movement is expected to be weak. Write down what you see.

## 6. Fast movement and recovery (5 minutes)

1. Wave quickly for 5 s, then spin your hand: **pass** when tracking recovers within 1 s after you stop.
2. Cover your face with a hand for 2 s: **pass** when the head keeps a sensible pose and recovers.
3. Unplug a USB camera while tracking (skip for a built-in camera): **pass** when the tracker state shows an
   error within 5 seconds and the character relaxes. Plug it back in and reload the tab: **pass** when
   tracking resumes.

## 7. Microphone (only if the Microphone row is available; 5 minutes)

1. Choose your microphone (the page reloads). Speak normally for 10 s.
2. **Pass:** *Microphone* shows `Speaking` while you talk and `Listening` when you stop, and the character's
   mouth moves with your speech.
3. **Pass:** *Audio and video sync* shows `In sync` (within 40 ms) for most of the 10 s. If it shows
   `audio ahead` or `audio behind`, write down the number of milliseconds.
4. Choose **Off** again: **pass** when the page reloads and the microphone row says `Off`.

## 8. Ten-minute soak

Leave the control room running for 10 minutes while you move now and then. Open Task Manager (Ctrl+Shift+Esc)
before and after and note the memory of the browser process that has the control room. **Pass:** the speed
afterwards is at least 80% of the speed at the start, and the memory grew by less than 200 MB. Note the
numbers.

## 9. OBS (5 minutes)

Follow `docs\OBS.md`, then check:

| Check | Pass |
|---|---|
| *Publishing to OBS* and *Viewers connected* | `Yes` and `1` |
| The character moves when you move | yes, with no more delay than step 3.3 |
| The background is transparent over a coloured scene | yes |
| The **Virtual character** label is visible | yes |
| In OBS, View > Stats | no dropped frames over 2 minutes |
| Close the control room tab | the character freezes (expected), then recovers when you reopen it |

## What to write down and send

Copy this table and fill it in.

```
Windows version:            (winver)
Browser and version:        (chrome://version)
GPU and driver:             (dxdiag > Display)
Camera model and connection:
Microphone:
Quality setting used:
Step 1 numbers:             speed ___ fps, pose ___/s, face ___/s, hands ___/s, GPU/CPU ___
Step 3.3 delay:             ___ frames at 60 fps
Step 4.1 hand tracked:      left ___ s of 10, right ___ s of 10
Step 7 sync:                ___ ms (ahead / behind / in sync)
Step 8 soak:                speed start ___ end ___, memory start ___ end ___
Steps that failed:          (step number, what you saw, what *What it sees* said)
```

For a **bug report**, attach this table and a screenshot of the status panel taken while the problem
happens. A screen recording helps, but it shows your face: attach one only if you are comfortable. The
status panel itself contains no picture of you. Never attach anything showing another person without their
permission.
