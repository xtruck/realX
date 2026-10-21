# A7 security review: local server (src/realx/server.py)

Method: code read (server.py, pipeline.py, docs/SAFETY.md) plus tests against an in-process `Server` on an ephemeral port
(`tests/test_server_security_audit.py`, 44 tests, plus the existing server/auth/gzip/body/facemesh/dock tests, 233 pass).
Note: there is no top-level `server.ts` in this branch; the only server is the Python one.

## Routes (all behind `do_GET` / `do_POST`; nothing else is defined)
GET: `/ /app.js /avatar /facemesh /facemesh.bundle.js /dock /dock.js /dock.css /avatar.bundle.js /avatar/background.png /avatar/model.vrm /mp/wasm/<name> /mp/models/<name> /favicon.ico /ws/rig /api/stats /api/hardware /api/facemesh/terms /api/voices /api/safety /stream.mjpg`, else 404.
POST: `/api/config /api/dock /api/facemesh/consent{,/check,/revoke} /api/emote /api/background /api/voice`, else 404.
Other methods: no handler, so `http.server` answers 501 with no data.

## Findings
| # | Sev | Where | Finding |
|---|-----|-------|---------|
| 1 | Low (FIXED) | server.py:843 (`do_GET`) | GET (including `/stream.mjpg`, `/api/*`) did not check `Origin`; only `Sec-Fetch-Site` was checked. A request with `Origin: http://evil.example` plus a valid cookie/Bearer was served. SameSite=Strict and Sec-Fetch-Site cover real browsers, so this was defence in depth only (POST and WebSocket already checked it). Repro: `curl -H "Origin: http://evil.example" -H "Cookie: realx_token=T" http://127.0.0.1:P/api/stats` returned 200, now 403. |
| 2 | Info | server.py:749 | Host must equal `127.0.0.1:<port>` or `localhost:<port>` exactly. `evil.example`, bare `127.0.0.1`, `[::1]`, `127.0.0.1.evil.example` all 403 on GET and POST (tested). OK. |
| 3 | Info | whole file | Token compared with `hmac.compare_digest`; header/cookie/query on GET, header/cookie only on POST; every GET/POST route and the WebSocket (view and publish) give 401 without a valid token (tested for every route). HEAD/OPTIONS/PUT/DELETE/PATCH/TRACE/CONNECT get 501 and never return data, with or without a token (tested). |
| 4 | Info | server.py:945 | `?token=` is only honoured on GET; on first visit it becomes an HttpOnly SameSite=Strict cookie and a 303 whose Location has the token stripped. `log_message` is a no-op, so URLs are never logged; `Referrer-Policy: no-referrer` on every response; token is not echoed in 404 bodies. Residual: the token is briefly in the browser address bar/history before the redirect (design choice, needed for OBS links). Cookie lacks `Secure` (plain http on loopback; correct). |
| 5 | Info | server.py:92-117, 738 | CSP: `default-src 'none'`, `script-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'` (SAMEORIGIN for /avatar and /facemesh). `style-src 'unsafe-inline'` only on the control room (index) page: low-risk compatibility debt. `nosniff`, `Cross-Origin-Resource-Policy: same-origin`, `Cache-Control: no-store` present. Gap: 4xx/5xx replies from `http.server` itself (501, 431) carry no headers; harmless (no secrets). |
| 6 | Info | server.py:910-913, 955-970 | Static/model routes never touch the filesystem with request input: wasm files are an allowlist dict by exact name, models are looked up by manifest filename, everything else is a fixed branch. `..%2f`, `%2e%2e`, backslashes, absolute and drive-letter paths all 404 (tested). `load_avatar(path)` takes a path only from the CLI, not a request. |
| 7 | Low (design) | server.py:626, 60 | Pre-auth resource use: 16 connection slots and a 15 s socket timeout. A local process (or a rebinding page, which gets refused only after the headers are read) can hold all 16 slots with slow connections, denying the UI for ~15 s at a time. Availability only; no fix made. |
| 8 | Info | server.py:57-68, 827 | Limits: JSON 4 KiB, background image `MAX_IMAGE_BYTES`, WAV `offline.MAX_WAV_BYTES`, avatar 32 MiB, chunked uploads refused, negative/invalid Content-Length refused, headers capped by `http.server` (431 over 64 KiB lines / 100 headers), WebSocket payloads capped and publisher rate-limited. All tested. |
| 9 | Low (design) | pipeline.py:31-75, 110 | Consent/watermark/disclosure ordering is validated structurally (gate before any `requires_consent`/`uses_likeness` stage, disclosure before watermark, no media edit after watermark, watermark after last synthesiser). The checks read attributes the stage declares; a non-strict `Pipeline` accepts a custom stage that omits `requires_consent`. `strict=True` (used by studio.py:155,264) restricts roles to realX's own classes. Recommend keeping every shipped call site strict (it is). The server itself synthesises no face; `/api/voice` applies own-voice presets only, and face-mesh consent (`FaceMeshConsent`) is per-run in memory, 403 on `ConsentError`. |
| 10 | Info | server.py:1007 | WebSocket requires Origin (same-origin only), Host, token, valid key/version; one publisher at a time. OK. |

## Fixes made
- Finding 1: `do_GET` now also refuses a foreign `Origin` (one-line change). Regression test:
  `test_get_with_a_foreign_origin_is_refused_even_with_the_cookie`. New file has 44 test cases in total.

## Not verified
- Real browser behaviour (no Chrome run, as instructed): SameSite handling and what Origin/Sec-Fetch-Site a real hostile page sends.
- Behaviour behind OBS Browser Source (CEF) which may omit Sec-Fetch-Site/Origin; the new Origin check only rejects an Origin that is present and foreign.
- Real DNS rebinding with a resolver; only the Host header was simulated.
- Slow-connection exhaustion (finding 7) was reasoned from the code, not load tested.
- Pipelines built outside this repo, and Windows-specific path handling beyond the tested strings (no request input reaches a filesystem path).
