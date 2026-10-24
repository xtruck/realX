# Virtual camera output (branch `feat-virtual-camera`)

realX can send its **avatar picture** to a virtual camera on this PC, so Zoom, Meet, OBS or WhatsApp Desktop can choose it as a camera.
Off by default. Nothing leaves the computer: the backends hand pixels to a camera driver here.

## Turn it on

    realx serve --virtual-camera pyvirtualcam                       # OBS Virtual Camera (OBS installed) or Unity Capture
    realx serve --virtual-camera softcam --softcam-dll E:\Dev\softcam\dist\bin\x64\softcam.dll
    realx serve --virtual-camera softcam --softcam-dll ... --vcam-size 640x480

* `pyvirtualcam`: `pip install pyvirtualcam` (GPL-2.0; fine for a private build, check before distributing realX). Windows needs OBS
  installed (its Virtual Camera is used, one camera at a time) or Unity Capture. Start OBS's virtual camera once if a program does not list it.
* `softcam`: MIT. Build the DLL from github.com/tshino/softcam (done here: `E:\Dev\softcam\dist\bin\x64\softcam.dll`, built with the
  v145 toolset: `msbuild softcam.sln /p:Configuration=Release /p:Platform=x64 /p:PlatformToolset=v145`). The camera must be registered
  once **with administrator rights** (Softcam's `softcam_installer.exe`, see its README); realX does not do that for you. DirectShow only.
  The `docs/SOFTCAM.md` test table (Zoom, Meet, WhatsApp, TikTok Live Studio) is still to be filled in on your machine.

## What it guarantees

* Every frame gets the **"DIGITAL HOST" bar** and the provenance watermark drawn at the last step, after resizing, whatever came before.
  If marking fails the frame is dropped, never sent bare. `tests/test_vcam.py` checks the exact pixels that reach the driver.
* **What survives the camera path (measured 2026-10-21/22, one frame read back with ffmpeg through each camera, lossless PNG):**

  | Route | Visible bar | Watermark |
  |---|---|---|
  | Softcam (DirectShow, 24-bit colour in shared memory) | intact (85% of bar pixels within tolerance 12) | **survives** (`realx-vcam-1` extracted) |
  | OBS Virtual Camera via pyvirtualcam (converted to NV12 / YUV) | intact (80%) | **lost** |

  realX's watermark hides in the lowest bit of each colour value (`safety/watermark.py`: "not robust to re-encoding"). The Softcam
  path does not convert the picture, so the mark reaches a reader that takes raw pixels; the OBS path converts to YUV and erases it.
  **Any app that compresses the video (Zoom, Meet, WhatsApp, a recording) will erase it on either route**, so the visible bar is the
  protection that always arrives. A re-encode-robust watermark is roadmap item M4.
* It only carries the **avatar** mode (the picture realX makes). `original` (raw camera), `boxes`, `character`, `body` and `photoface`
  are not sent; `/api/stats` says so in `vcam.note`.
* It never slows the engine: a separate thread sends the newest picture and drops older ones (`vcam.dropped`).
* Failures are reported in `/api/stats` under `vcam` (`state`: off / running / error, `error`: a fixed code such as `backend_missing`,
  `device_unavailable`), and realX keeps running without the camera.

## Limits

* Only one virtual-camera client at a time for OBS's camera and for Softcam.
* `vcam.app_connected` is known for Softcam only (pyvirtualcam cannot tell).
* Softcam takes 24-bit BGR; realX converts. Channel order and orientation were confirmed by reading a frame back with ffmpeg (red grows to the right, green downward, text readable, not mirrored).

## Another route worth knowing (seen on this PC, not built)

`ffmpeg -f dshow -list_devices true -i dummy` lists a device named "CALL ME (Windows Virtual Camera)" registered through the Windows
virtual-camera API (device path `swd#vcamdevapi`, Windows 11's Media Foundation `MFCreateVirtualCamera`). That API needs no custom driver
and is meant for the newer camera stack that DirectShow-only filters (Softcam, OBS) may not reach. If the test table shows a needed app
cannot see a DirectShow camera, this is the next backend to look at.
