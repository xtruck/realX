# Decision record: Path B, a rented NVIDIA GPU for a private build (2026-10-21)

Status: **approved by the owner on 2026-10-21, in chat, for a private, non-distributed build only.** Nothing in this record is legal advice and nothing
here says any model is licensed for the owner's use. It says what the project may now build, and under which limits.

## What the owner decided

1. **Use:** personal and private. Nothing is sold, offered to customers or given to other users. (Asked and answered 2026-10-21.)
2. **Rule 1, models** (`CLAUDE.md`, `docs/LICENSE-AUDIT.md`, `tests/test_model_licenses.py`): face-swap or face-reenactment models may be used
   **in the private build only**, on the rented GPU machine. The owner downloads the weights from their original source onto that machine.
3. **Rule 2, frames** (`docs/REMOTE.md`): camera frames or face crops may be sent to a **rented GPU the owner controls**, under the guard rails below.

## What does NOT change

* The default `realx` package and its tests are unchanged. `BLOCKED` in `src/realx/models.py` and `tests/test_model_licenses.py` stay exactly as they are.
  No blocked weight is ever added to this repository, to a wheel, to CI, or to a release artifact.
* **Consent gate before, visible "Virtual face" label and watermark after** every synthesised face, on every path including the fallback. Per-use consent
  stays per photo or person, signed, revocable.
* The control-room server still binds 127.0.0.1 and needs the token on every route.
* No model files are committed. Weights live on the rented machine (or the owner's disk), fetched by the owner, hash-recorded in a local file.

## Guard rails for the remote link (these become tests before any transport is merged)

| # | Guard rail |
|---|---|
| G1 | Off by default. Enabled only by an explicit setting, and the UI shows when frames are leaving the machine. |
| G2 | HTTPS / WSS only, host on an allow-list (a DNS name, no IP literals), certificate verification on, no proxies unless set explicitly. |
| G3 | Bearer token per session, read from an environment variable at send time, never stored, logged or put in an exception. |
| G4 | The rented instance is ephemeral: created for a session, destroyed after, no disk snapshot, no frame written to disk on the server. Recorded in a start-up check. |
| G5 | What may be sent: JPEG frames or face crops at a fixed maximum size, and the consent record id. Nothing else (no audio, no names, no other files). Bounded sizes and rates, one frame in flight, latest wins. |
| G6 | The returned frame is treated as untrusted pixels: size and format checked, then the label and the watermark are drawn **locally** after it arrives. The server cannot remove them. |
| G7 | If the link is down, slow (more than a set budget) or the consent record is invalid or revoked, output falls back to the local picture within one second. No silent retry loop. |
| G8 | Revoking a consent stops sending frames immediately. |
| G9 | Logs: host, byte counts, latency. No pixels, no tokens, no names. |
| G10 | A test captures the real request bytes and asserts G5 and G3. |

## Licence status of the candidate models (as of this date, unchanged by this decision)

| Model family | What the sources say | Status for the private build |
|---|---|---|
| InsightFace `inswapper_128`, `buffalo_l` | Code MIT; models need a separate commercial licence, sold by quote; non-commercial research otherwise | **Not licensed.** Whether private personal use fits their terms is **not confirmed**. Owner to ask InsightFace in writing. |
| LivePortrait with a MediaPipe detector (fork) | Fork author claims MIT + Apache-2.0; the official path depends on InsightFace; training-data provenance not verified | Unverified. Not a legal clearance. |
| Per-identity model trained on consented data, permissive code | Ours | Not started. |

The owner accepts the licence risk of a private build. The project does not claim these models are cleared.

## Order of work

1. This record, `REMOTE.md` Path B section, `CLAUDE.md` scoped exception (this commit).
2. A GPU-side server skeleton and a local client that move frames through a neutral GPU-free passthrough over loopback, with G1 to G10 as tests.
3. Measure real latency and throughput on a rented GPU with the passthrough (needs the owner's provider account and a budget cap).
4. Only then, the model on the rented machine, evaluated against the owner's pass mark.
