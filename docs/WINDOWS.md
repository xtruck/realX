# Install, test and run on Windows

Tested on Windows 11 with Python 3.14, Node.js 24 and Chrome 155. The scripts need no administrator
rights and never touch your global Python: everything goes into a virtual environment that sits beside
the repository (`..\realx-venv`).

## You need

- Windows 10 or 11 with PowerShell 5.1 or newer (already installed)
- Python 3.10 or newer from python.org (tick "Add python.exe to PATH")
- Chrome or Edge (the control room and the tests use it)
- Node.js 22 or newer: **optional**. The built browser bundle is committed. Node is only for changing
  files in `webapp\src` and for the JavaScript tests.
- About 23 MB of model downloads and roughly 0.6 GB of disk for the Python environment (563 MB measured on the
  maintainer's machine)

## Install

Open PowerShell in the folder where you want the project:

```powershell
git clone https://github.com/xtruck/realX.git
cd realX
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows\install.ps1
```

`-ExecutionPolicy Bypass` applies to that one command only; it does not change your system setting.
The script creates the environment, runs `python -m pip install -e ".[dev,onnx,video]"` inside it,
builds the browser bundle if Node.js is present, and runs `realx models fetch`, which downloads the
models and checks each one against a pinned SHA-256. Run it again at any time; finished parts are reused.

To see what it would do without doing it:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows\install.ps1 -DryRun
```

Other options: `-VenvPath D:\somewhere\venv`, `-Python C:\Python314\python.exe`, `-SkipModels`.

## Test

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows\test.ps1
```

This runs the JavaScript tests (if Node.js is present) and then `pytest`, including the tests that start
Chrome with a **fake** camera. It finds Chrome or Edge by itself and sets `REALX_CHROMIUM`; set that
variable yourself to use another browser. `-Quick` skips the real-browser tests. `-DryRun` prints the
commands. These tests use made-up video and sound. They do not use your camera or microphone and do not
prove that tracking works for you; for that, follow `docs\REAL-WEBCAM-VALIDATION.md`.

## Run

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\windows\run.ps1
```

This starts the control room on `http://127.0.0.1:8765/` and opens it with a one-time access token in the link
(see `docs\OBS.md`, Access token). It listens on your own computer only, and refuses any request without the token. Options:

| Option | Meaning |
|---|---|
| `-Port 9000` | another port (1024 to 65535) |
| `-Source camera` | let the server use your camera for the Cartoon and Tracking modes. Default is `demo:static` because **Full body** mode uses the browser's camera, and Windows lets only one program use a camera at a time. |
| `-NoBrowser` | do not open a browser window |
| `-DryRun` | print the command and do nothing |

Then choose **Full body**, allow the camera when the browser asks, and read `docs\OBS.md`.

## If something goes wrong

| Symptom | What to do |
|---|---|
| "Python was not found" | install Python 3.10+ and tick "Add to PATH", or pass `-Python` with the full path |
| `pip` or model download fails | check the network or proxy, then run the install script again |
| "cannot start: ... model missing" | run `.\..\realx-venv\Scripts\realx.exe models fetch` |
| Port already in use | `run.ps1 -Port 9000` |
| The browser never asks for the camera, or says it is blocked | click the camera icon in the address bar, allow it, reload; check Windows Settings > Privacy > Camera |
| Camera "in use" or black | close Teams, Zoom, OBS and other camera users; use `-Source demo:static` for Full body mode |
| Tests skip the browser tests | no Chrome or Edge was found; set `REALX_CHROMIUM` |
| Git shows the bundled WASM file as changed | Windows line-ending conversion (`core.autocrlf`); the content is identical |

To remove everything: delete the `..\realx-venv` folder and the `models` folder in the repository.
