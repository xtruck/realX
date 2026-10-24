# Troubleshooting

Every row below comes from a message or status the code really produces (`src/realx/errors.py`, `src/realx/server.py`,
`webapp/src/facemesh/seams.js`) or from a problem met while working on this repository. If a row does not match what you see,
the row is wrong: tell us rather than guessing.

## The control room shows an error box

`/api/stats` carries `error_info` with a fixed `code`. The box shows its title and hint.

| Code | Meaning | What to do |
|---|---|---|
| `camera_unavailable` | The camera cannot be opened | Close other apps using the camera; Windows Settings > Privacy > Camera must allow desktop apps. realX retries. |
| `camera_stalled` | The camera stopped sending pictures | Check the cable or the app that took the camera. realX retries by itself. |
| `video_unreadable` | A video file cannot be read | Pick another file, or the demo footage. Retrying does not help. |
| `source_ended` | The video source ended | Choose a source again. |
| `model_not_ready` | A model is missing or still downloading | `realx models fetch`, check the disk has room, try again. |
| `engine_error` | An unexpected exception inside the engine | realX rebuilds the pipeline and retries. If it repeats, copy the `detail` text into a bug report. |
| `unknown` | Anything else | Try again or choose another source. |

`session` in `/api/stats` is one word: `connecting`, `live`, `reconnecting` (a retryable problem), `failed` (not retryable),
`stopping` (a stop was asked for and the worker has not exited; stopping can be retried) or `stopped`.

## The browser says 401, 403, 409 or 503

| Answer | Cause | Fix |
|---|---|---|
| 401 "access token required" | The link has no token, or the cookie is gone | Open the full link `realx serve` printed (`...?token=...`). Scripts send `Authorization: Bearer <token>`. A POST never accepts the token in the address. |
| 403 "forbidden host" | The page was opened under another name or address | Use exactly `http://127.0.0.1:<port>/` or `http://localhost:<port>/`. The server answers this computer only, by design. |
| 403 "forbidden origin" / "cross-site requests are not allowed" | Another web page or program asked on your behalf | Expected for anything that is not the control room itself. |
| 409 "another tracker is already publishing" | Two control-room tabs are both tracking | Close one tab; browser tracking needs one open tab while streaming. |
| 503 | The server holds its maximum number of connections | Close extra tabs or OBS sources, wait a moment. |

The token changes every run unless `REALX_TOKEN` is set (16-128 characters of `A-Z a-z 0-9 . _ ~ -`). An OBS source needs a
fixed one.

## Models

- `realx models fetch` downloads hash-verified models. A checksum mismatch means the file is refused; fetch again. Nothing is
  used unverified.
- `realx serve --offline` (or `REALX_OFFLINE=1`) forbids every download. With it, missing models stay missing.
- Model files (`*.onnx`, `models/`) are never committed to git.

## Face-mesh page (`/facemesh`)

- **"Clean the edges" turned itself off, status line says it was too slow**: one segmenter pass took over 1 s, or two in a row
  over 250 ms. The first pass of a session is never judged (it can take 6 to 8 s on an Intel UHD 620 while the model is prepared).
  Clicking the button tries again. The option is off by default; `/facemesh?seamHz=0.5..5` sets its rate.
- **Low fps**: other tabs share the GPU, and a laptop on battery runs slower. The page shows the delegate (GPU or CPU).
  A benchmark that prints "SwiftShader" ran on a software renderer, and its numbers do not count for a real laptop.
- **The "Virtual face" label must always be on screen.** If it is ever missing, stop and report it.

## Running the tests on Windows

| Symptom | Fix |
|---|---|
| Browser tests are skipped | No Chrome or Edge was found. Set `REALX_CHROMIUM` to the browser's `.exe`. |
| `PermissionError` on `pytest-of-<user>` in the temp folder (many errors in tests that use `tmp_path`) | The temp folder is not writable. Run `pytest --basetemp=<a folder you own>`. |
| Browser tests fail one at a time under low memory | Close tabs and apps; run a few at a time. |
| `pytest` runs but `python` is the Microsoft Store stub | Use the project's virtual environment's Python. |
| An environment variable that is too long breaks pytest | Windows limits one to 32,767 characters; shorten the test id. |
| Line-ending warnings (LF will be replaced by CRLF) | Harmless; `core.autocrlf=true`. |
