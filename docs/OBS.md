# Show the character in OBS

OBS draws the character with a **Browser Source**, so no virtual camera or extra software is needed.

## Setup

1. Start the control room (`scripts\windows\run.ps1`) and choose **Full body** (or **Character**).
2. In OBS, add a source: **Sources > + > Browser**.
3. Set:
   - **URL:** `http://127.0.0.1:8765/avatar?token=YOUR_TOKEN` (use the port you started the control room on)
     and see **Access token** below for where the token comes from
   - **Width 1280, Height 720**
   - Leave **Custom CSS** as it is. The background is **transparent**, so whatever is behind the character
     in your scene shows through.
   - Untick "Shutdown source when not visible" and "Refresh browser when scene becomes active" if you
     switch scenes often, so the character does not reload.
4. Click OK. The character appears. In Full body mode it moves when you move.

**Keep the control room tab open while you stream.** In Full body mode your camera, the tracking and the
models run in that tab; OBS only receives the joint angles from it. Closing or sleeping the tab freezes
the character. Browsers slow down or pause tabs in windows that are minimized or fully covered, so keep
the control room in a visible window (it can sit behind OBS if part of it stays uncovered).

The OBS source has no camera of its own and never needs camera or microphone permission.

## Access token

The control room refuses every request that does not carry its access token, so another program on your
PC cannot read the preview or change settings. `realx serve` prints a link ending in `?token=...`; copy the
token from it into the OBS URL. A new token is made each run, so OBS would need updating each time: set a
fixed one instead, in PowerShell before starting the control room:

```powershell
$env:REALX_TOKEN = "choose-16-to-128-letters-digits-dot-dash"
```

OBS then keeps the same URL. The token is a password for your studio: do not post it or show it on stream
(OBS's source properties window shows the URL, so keep that off screen).

## What viewers see

- A transparent 3D character: Pip, or the character you started with `realx serve --avatar my.vrm`.
- A small label in the corner: **Virtual character**. It tells viewers this is an avatar and not a real
  person's picture. Do not hide it for a live stream, and do not present an avatar as a real person.
  (`?badge=off` hides it on the plain OBS page; that is for a private preview only, and it is ignored on
  any page that runs your camera.)
- Never your camera picture. The page receives joint angles only.

Platform rules still apply: TikTok, for example, requires you to disclose AI avatars and limits animated
figures that cover more than half the screen.

## Options on the address

Add them after `/avatar?`, separated by `&`:

| Option | Effect |
|---|---|
| `outfit=ocean` | coral (default), ocean, sunny, berry, forest |
| `frame=full` | show the whole body instead of the upper body |
| `mirror=0` | do not mirror: the character copies you as the camera sees you |
| `name=Mika&tagline=Live+now` | a name bar at the bottom |

The camera, microphone, quality and legs settings belong to the control room; set them there.

## Check that it works

1. Control room: **Streaming status** shows *Publishing to OBS: Yes* and *Viewers connected: 1* (OBS).
2. Raise your hand: the character should raise its hand (a short delay is normal; the status panel shows
   the real update rates).
3. If the character does not move, see below.

## Validate the route: realX, OBS, OBS Virtual Camera, your apps

This is route A, the one that works today. realX's character goes into OBS as a Browser Source, and **OBS Virtual
Camera** hands it to other programs as a camera. Nothing has been run through this route in Zoom, Meet, WhatsApp
Desktop or TikTok Live Studio by the maintainers: the table below is yours to fill in.

1. Start realX with a token you choose, so the OBS address never changes:

       $env:REALX_TOKEN = "choose-a-long-private-token-1234"
       realx serve --no-browser

2. Run the read-only check. It changes nothing; it tells you what is missing and prints the OBS settings:

       .\scripts\windows\obs-check.ps1

3. In OBS add the Browser Source it printed (1280 x 720, 30 fps), then **Controls > Start Virtual Camera**.
4. In each app below, choose **OBS Virtual Camera** as the camera, then fill in the row.

| App | Sees "OBS Virtual Camera" | Character appears | Moves with you | Notes |
|---|---|---|---|---|
| OBS preview | | | | |
| Google Meet (Chrome) | | | | |
| Zoom | | | | |
| WhatsApp Desktop | | | | |
| TikTok Live Studio | | | | |

The route is validated when the apps you actually use all show the character and it follows you. Write down
the frame rate you see and any lag; the status panel in the control room gives the real model update rates.

What this route cannot do: OBS lets whoever runs it crop, cover or hide parts of a source, so a label inside a
Browser Source cannot be guaranteed to reach the other app. The label is a courtesy to your viewers, and a rule
of the platforms you stream on. A virtual camera that realX itself feeds is the only way to control the final
picture; that is what `SOFTCAM.md` studies.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Blank source or an error page | the control room is not running, or the port differs; open the URL in a normal browser tab first |
| Character visible but frozen | the control room tab was closed, slept or lost the camera; bring it back and check *Tracker state* |
| *Publishing to OBS: No* | the tracking page cannot see the camera (permission blocked or camera in use); fix that, then reload the tab |
| *Viewers connected: 0* | OBS has the wrong address or port; the control room tab and OBS must use the same one |
| Choppy movement | lower **Quality**; close other programs that use the GPU; read the *Model updates per second* line |
| Arms or hands lag | read *Model updates per second* in the status panel: low pose or hand numbers mean the computer is the limit, so try **Low** quality and close other GPU programs |
| Black box instead of transparency | in OBS the source must be a Browser Source, not a window capture |
| Only one tracker may publish | a second control room tab or window is also publishing; close it |
