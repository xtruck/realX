# F1 - server fixes (branch fix-f1-server)

## Proposed PROGRESS.md entry

- [x] F1 server fixes (2026-10-21): a GET with a foreign `Origin` is refused (403) like POST and the websocket (A7); `/api/stats` now reports `security.watermark: false` plus a `note` because the live MJPEG preview and `/avatar` carry no watermark stage (B3-03, truthfulness only, no watermark algorithm changed; the dock shows "unknown" instead of "on"); `/stream.mjpg` frees its thread and connection slot when the client leaves even in body/character/photoface modes (B1-01, socket EOF check on every wake); the request head has a 10 s total deadline so slow-trickle sockets are freed (B1-02); `do_GET` returns a logged JSON 500 and client resets no longer print stdlib tracebacks (B1-03); on Windows a second server cannot bind a port already held (SO_EXCLUSIVEADDRUSE, B1-04); `log.Dedup` is thread-safe (B1-06). Tests: `tests/test_server_f1.py`, `tests/test_server_security_audit.py`. Not done: B1-05 (encode only with viewers, behaviour change) and the other Low/Info findings.

## Before / after

| Finding | Before | After |
|---|---|---|
| A7-1 | GET with foreign Origin served | 403 |
| B3-03 | `security.watermark: true` always | `false` + `note` |
| B1-01 | stream thread + slot held after client leaves in no-JPEG modes | released within ~2 s (test: slot count returns) |
| B1-02 | per-recv timeout only | + `HEAD_DEADLINE` 10 s total for the head |
| B1-03 | GET exception: empty reply + stderr traceback; resets print tracebacks | JSON 500 + `log.exception`; OSError quiet (debug) |
| B1-04 | Windows: two servers on one port | second bind raises OSError (POSIX unchanged) |
| B1-06 | `Dedup.first` unlocked | lock |
