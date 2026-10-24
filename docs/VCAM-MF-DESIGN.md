# Windows 11 virtual camera for realX: what an installed example does, and a design of our own

Written 2026-10-24 for the owner. **Design only: no code was written, built or run for this.** It follows `VCAM.md` ("Another route worth knowing")
and `RESEARCH-2026-10-24.md` (finding 1).

## What this is based on, and what it is not

The owner asked how the app **CALL ME 2.0.26**, installed on their own laptop (`C:\Program Files\CALL-ME`), makes its virtual camera, so that
realX can do the same job. Only **static facts from the files' headers** were read: exported functions, imported Windows functions, class
names and readable text. Nothing was disassembled or decompiled, no code or asset was copied, no running process was observed, and no
licence check or protection was touched. Names of CALL ME's files and classes are not reused here or in realX.

What this cannot tell us: the exact byte layout of the frames, the real flow of control, security details, or anything about what CALL ME
does to the picture. Items marked *inference* are reasoned from imports and text, not seen.

## What the installed example is made of (facts from the headers)

| Part | What the headers show |
|---|---|
| The app | An Electron program (a 95 MB `app.asar`, its own updater). Its virtual-camera parts sit in a separate folder inside its resources. |
| **Camera source DLL** (46 KB, 64-bit, unsigned) | A COM in-process server (exports `DllGetClassObject`, `DllRegisterServer`, `DllUnregisterServer`, `DllCanUnloadNow`). Its classes implement Media Foundation's `IMFMediaSource`/`IMFMediaSourceEx`, one source and one stream, plus an event queue. It reads frames from **a shared memory block** (`CreateFileMappingW`/`MapViewOfFile`). Its log texts show the design: it checks each frame's metadata and falls back if invalid, **serves a black frame while the pipeline warms up**, replays the last frame when a request arrives with nothing new, and queues the source's initialise/start/stop/uninitialise events. |
| **Older camera DLL** (30 KB) | A DirectShow filter with an output pin, also reading a shared memory block. A fallback for programs that only see DirectShow cameras. |
| **Frame publisher** (19 KB program) | Maps a file into memory and writes into it; reads from a handle it gets from the standard handles (*inference*: frames arrive on its standard input from the app). Sets an access list on the shared file so another account can read it. |
| **Registrar** (64 KB program) | Commands `install`, `remove`, `probe`, option `--all-users`. Calls `MFCreateVirtualCamera` (the Windows 11 API), writes the COM class keys under `SOFTWARE\Classes\CLSID\...` (`InprocServer32`), removes the old DirectShow keys, enumerates camera sources to check, and **controls the Windows "Frame Server" service** (stop/start so it reloads the source). |

The picture of the whole thing (reasoned from the above): the app produces frames, hands them to a small publisher, which writes them to a
shared memory file; a COM media source loaded by Windows' Frame Server reads that file and serves frames to any program that opens the
camera; an elevated registrar installs the COM class and creates the camera once.

## Why it matters for realX

- It matches what Microsoft documents for `MFCreateVirtualCamera` (only the software-camera-source type exists; the source must be a COM
  media source; the camera is keyed by its parameters; all-users scope needs administrator rights). So there is no shortcut: **this route
  needs a native COM DLL and an administrator install step.**
- The warm-up and fallback behaviour is worth copying as an *idea*: never show garbage, and never stall a consumer that asks for a frame.
- The Frame Server runs under a different account than the user's program, so the shared frame file's permissions matter.

## Design for realX (our own, from the public API)

1. **Source DLL** (new, C++, built with MSVC): implements the media source. Draws from a shared memory block that realX's Python
   process writes. Returns the last good frame, or a clearly marked "realX is starting" frame, never random memory.
2. **Frame hand-off**: a named shared memory block with a small header (magic, version, width, height, format, frame counter, a
   sequence guard) and one frame; the reader checks the counter before and after copying. realX's existing frame path (`vcam.py`) writes it
   after the label and watermark step.
3. **Safety is not optional and must not move into the DLL**: the "Virtual" bar and the provenance watermark are drawn by realX before the
   frame enters the shared block, exactly as `VCAM.md` guarantees today; the DLL only copies bytes. If marking fails, nothing is
   written, and the DLL shows the "realX is starting" frame. A test must read back what the DLL serves and find the bar.
   (Whether CALL ME marks its frames was not examined and is not claimed.)
4. **Installer**: an elevated `install / remove / probe` command in the style described above, written by us, that registers the COM class
   and creates the camera. Per-user scope first (no admin needed for the camera object; check what the class registration itself needs).
5. **Fallback**: keep Softcam and pyvirtualcam. Add the new backend as a third option, off by default.

## Before building anything (decisions for the owner)

| Question | Why it matters |
|---|---|
| Does the `SOFTCAM.md` test table show an app that cannot see the current camera? | If not, this work is not needed yet. |
| Is an administrator install acceptable for the owner's computers? | The COM class registration is under the machine-wide class keys. |
| Do we need a C++ toolchain on the build machine? | MSVC build tools were **not checked** on this computer. |
| What happens with Teams' remote side? | The MIT sample reports the camera appeared in the local preview but not to the remote party; test early. |

## Checks that would prove it works (none done)

A frame written by realX is read back through the Windows Camera app and through ffmpeg; the bar is visible and the watermark state is
recorded per route (as done for Softcam in `VCAM.md`); the camera stays alive when realX stops; remove leaves no keys behind.
