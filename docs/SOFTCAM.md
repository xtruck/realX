# Softcam study: a virtual camera realX could own (study, not integrated)

Why: with OBS Virtual Camera the "Avatar IA" badge sits in a browser page that the user composes in OBS, where it
can be cropped or covered. A virtual camera that realX itself feeds is the only route where realX controls the final
pixels. This document says what is known about Softcam and what has to be tested. **Nothing here has been built or
run.** The facts below come from the project's README and licence, fetched 2026-10-14 (the fetching tool summarises,
so quote-check anything you rely on in the repository itself).

## Verified

| Fact | Source |
|---|---|
| Licence: **MIT**, "Copyright (c) 2020 tshino" | `LICENSE` on the main branch |
| The README says its bundled Base Classes library comes from Microsoft's Windows Samples, also MIT | README |
| Maintained: last push 2026-10-13, not archived | GitHub API |
| What it is: a DLL implementing a **DirectShow filter** in the Video Input Device category, plus a **sender API**; "any camera application which is using DirectShow API will recognize the filter as a camera-like device" | README |
| Sender API shape: `scCreateCamera(width, height, fps)` then `scSendFrame(camera, image)`; the sample sends a 320x240 24-bit buffer at 60 fps | README sample |
| Build: Visual Studio 2022 with "Desktop development with C++" and the Windows 10 SDK, open `softcam.sln`, Release / x64; output in `dist/bin/x64` | README |
| Install: `softcam_installer.exe` (run through `RegisterSoftcam.bat`) writes the DLL's absolute path to the registry; **needs administrator permission** (UAC); unregister scripts exist | README |
| 32-bit and 64-bit applications each need the matching DLL built and registered | README |
| A `python_binding` example exists (the README gives no details) | README |
| If the device is missing from a browser's camera list: "try to reboot the browser (or Windows)" | README |

## Not documented, so unknown until tested

* Pixel formats and resolutions beyond the sample (only 320x240 at 60 fps is shown).
* Which applications see it. The README names none and does not mention Media Foundation, the Windows Camera app,
  Chrome, Zoom, Teams, WhatsApp Desktop or TikTok Live Studio. A DirectShow-only device may be invisible to
  applications that use Windows' newer camera stack.
  *Update 2026-10-21 (pyvirtualcam source read with REA):* OBS's own Virtual Camera, which pyvirtualcam writes to, is also a
  DirectShow filter (CLSID `{A3FCE0F5-3493-419F-958A-ABA1250EC20B}`, frames go through the shared-memory queue `OBSVirtualCamVideo`)
  and is widely accepted by Zoom and Meet. So a DirectShow-only camera is less likely to be a problem for those apps than this
  document first feared. The Windows Camera app and other Media Foundation-only programs remain untested. Nothing here is a
  measurement on this machine: the test table below still decides.
* Behaviour with two senders, with a sender that stops, and with the camera in use by several applications at once.
* Antivirus and SmartScreen reactions to an unsigned, self-built DLL and an installer that edits the registry.

## What it would mean for realX

* A small native helper (C++ or the Python binding) receives frames from realX and calls `scSendFrame`. Frames
  therefore travel over **loopback** from the page to that helper, authenticated with the access token. The privacy
  statement changes from "camera pictures never leave the page" to "never leave this computer".
* The badge is burned into the pixels realX sends (last stage, checked by `OutputGuard`), so every application that
  reads this camera shows it. A user who films the screen or routes the picture through other software can still
  alter it; that cannot be prevented, only made impossible on realX's own output.
* An installer step that needs administrator rights, 64-bit and 32-bit builds, code signing to avoid SmartScreen
  warnings, and a clear uninstall. This belongs in the Windows packaging step, not before.

## Test plan (the study is finished when this table is filled in on the owner's machine)

Build both Release x64 (and x86 only if a tested application needs it). Send a test pattern with a visible badge at
640x480, 30 fps, and note for each application: appears in the camera list (yes/no), shows the picture (yes/no),
badge readable (yes/no), frame rate seen, any restart needed.

| Application | In list | Picture | Badge | Notes |
|---|---|---|---|---|
| ffmpeg (DirectShow client, 2026-10-22) | yes ("DirectShow Softcam") | yes | yes | one frame read back at 640x480; colours and orientation correct; registered with softcam_installer (UAC) on the owner's PC |
| OBS Studio (Video Capture Device) | | | | |
| Google Meet in Chrome | | | | |
| Google Meet in Edge | | | | |
| Zoom (desktop) | | | | |
| WhatsApp Desktop | | | | |
| TikTok Live Studio | | | | |
| Windows Camera app | | | | expected to be the hardest case |
| Microsoft Teams (new) | | | | |

Go / no-go: it is a go only if the applications the owner actually uses (Zoom, Meet, WhatsApp Desktop, TikTok Live
Studio) all see it. If one does not, the OBS Virtual Camera route stays the supported one and the badge limitation
above is documented to the user.

## Order

1. Validate the pipeline through OBS Virtual Camera first (`OBS.md`).
2. Build Softcam, register it on the owner's machine, run the table above.
3. Only then write the helper and the packaging.
