# B5 - Python test suite audit (tests/ vs src/realx)

Branch `audit-backend-b5-tests-perf` (from photoreal-integration, f8f989e). Read-only: no application code and no existing test changed.
Note: `docs/audit/AUDIT-2026-10-21.md` is not present on this branch, so finding A3 (the 90 skipped tests) was not read; it is not duplicated here.

## Summary

- Whole suite run once with `coverage run --branch -m pytest -m "not browser"` (coverage 7.16.2 installed in a throw-away venv `E:\realx\audit-tmp\covenv`, shared venv untouched).
  Result: **646 passed, 4 skipped, 2 failed, 110 deselected** (7m23s on a loaded machine, coverage on).
- **Overall coverage: 91% (5121 statements, 393 missed; 1540 branches, 156 partial).** Browser-marked tests were excluded, so
  JS-facing server paths and `sources.py` camera code are under-measured; code run in subprocesses is not measured either.
- Safety-critical modules are well covered (consent 91%, watermark 91%, pipeline 96%, gate 100%, cohost 95%) and the mutation check
  caught 8 of 10 realistic mutations. The two escapes are real gaps: stereo/8-bit WAV reading and execution-provider ordering beyond TRT/CUDA/CPU.
- The two failures are **timing-based flaky tests** (`test_camera_grabber.py`), both failing under coverage overhead. Not application bugs.
- No test uses the real network (the only mention is an AST guard in test_remote.py). Servers bind port 0. Fixed sleeps are mostly short.

## Coverage per module (branch coverage, non-browser suite)

| Module | Cover | Never-executed or mostly-unexecuted functions |
|---|---|---|
| audio/dsp.py | 93% | `flush` (L222) |
| audio/offline.py | 88% | error branches L26,30,37,43,92 |
| audio/presets.py | 94% | - |
| audio/stages.py | 95% | - |
| audio/wavio.py | 84% | `read_wav`: non-16-bit rejection (L14) and multi-channel downmix (L19) never run |
| bench.py | 91% | `stages` (L313), `_cpu_name`, `_cpu_times` (platform branches), `validate_result` (6 lines) |
| bench_camera.py | 63% | `run_cli`, real-camera path of `run` |
| cli.py | 73% | `_models`, `_serve`, most of `main` (L100-126: serve/models subcommands) |
| diag.py | 90% | `process_rss_bytes` (non-Windows branches) |
| filters.py | 99% | `OneEuroFilter.reset` |
| hardware.py | 72% | `_powershell_json`, `_cpu`, `_memory`, `_gpus`, `_providers`, `_nvidia`, `default_probes` (real probes; tests use injected fakes) |
| log.py | 97% | - |
| models.py | 90% | download success/mismatch paths L169-181, L195-199 |
| pipeline.py | 96% | L147-169 (worker/shutdown branches) |
| remote.py | 97% | - |
| rig.py | 97% | - |
| runtime/providers.py | 89% | `onnxruntime_session_factory` (needs onnxruntime), close-error branches L141-142 |
| safety/consent.py | 91% | malformed-record branches L95-106 (non-str subject, non-finite expiry, non-ASCII signature) |
| safety/portrait_consent.py | 86% | L40,58,98,100,102 |
| safety/facemesh_consent.py | 97% | L42-43 |
| safety/cohost.py | 95% | L66-67, 98-99, 165-169 |
| safety/watermark.py | 91% | `embed` frame-too-small (L45), `extract` non-uint8 / too-short / length-0 branches (L56,59) |
| safety/gate.py | 100% | - |
| server.py | 94% | `load_avatar` (9 lines), `make_handler` (17 lines), `do_POST` (8), `process_request` (6) |
| sources.py | 79% | `_open_camera`, `camera_frames`, `video_frames`, `__iter__` (real camera/video file) |
| stages/background.py | 92% | - |
| stages/builtin.py | 92% | `subject_id` (L145) |
| stages/portrait.py | 93% | - |
| stages/vision.py | 89% | `process` L100-115 |
| studio.py | 91% | `__enter__`/`__exit__`, `enable_portrait` (10 lines) |
| tracking.py, ws.py, types.py, others | 92-100% | - |
| **TOTAL** | **91%** | |

## Findings

| ID | Sev | File | What | Evidence | Fix | Effort |
|---|---|---|---|---|---|---|
| B5-01 | High | tests/test_camera_grabber.py:48,276 | Two wall-clock tests are flaky: `seq1 - seq0 > 20` after `sleep(0.15)` against a 2 ms capture thread, and `20 < capture_fps < 40` | Both FAILED in the coverage run (`assert (17 - 0) > 20`, `assert 40.2 < 40`) | Drive the fake capture with an injected clock/event, or widen to ratios (`> 5`, `< 60`) | S |
| B5-02 | Med | tests/test_logging.py:100,120 | `time.sleep(1.8)` to wait for 2 retry attempts of a real `Engine` thread, then asserts exactly one logged error | Sleep sized to a 0.5 s + 1 s backoff; a slow host gets fewer attempts, a backoff change breaks it silently | Poll with a deadline for `attempts >= 2` or patch the backoff constant | S |
| B5-03 | Med | tests/test_background.py:249 | `time.sleep(2.0)` then compares a rendered frame to the backdrop (`< 14`) | Fixed sleep waiting for an engine thread to apply a setting | Poll `engine.stats()["config"]` and the frame against a deadline | S |
| B5-04 | Med | tests/test_core.py:164,185 | `ttl_seconds=0.01` then `sleep(0.05)` for "expired consent" | Safe direction, but `verify(now=...)` is injectable and used elsewhere | Pass `now=` instead of sleeping | XS |
| B5-05 | Med | src audio/wavio.py / tests/test_audio.py | `read_wav` has no test for stereo downmix or non-16-bit rejection | Mutation 9 (downmix mean -> first channel) NOT caught; L14 and L19 uncovered | Test stereo mean and 8/24-bit raising ValueError | XS |
| B5-06 | Med | tests/test_providers.py:45, test_core.py:329 | Provider ranking test only pins TRT > CUDA > CPU | Mutation 10 (swap CUDA and DML in PREFERENCE) NOT caught | Assert the whole order with all five accelerators present | XS |
| B5-07 | Low | tests/test_pipeline_strict.py:49,59; test_providers.py:252 | Tests with no assertion: pass iff no exception | AST scan: 3 assertion-free tests in non-browser files (3 more in test_control_room_studio.py:315,365,403 assert via helper state/`s.errors`) | Assert resulting `pipe.stages` / that the session was created | XS |
| B5-08 | Low | tests/test_bench_facemesh.py:127-135 | Greps `scripts/bench_facemesh.py` text for argparse literals (`add_argument("--edges", ... default="on"`, `?seamHz=`) | Rewording the source breaks them with unchanged behaviour: brittle change-detector | Use the parser (`parse_args([])`) and assert `args.edges == "on"` | S |
| B5-09 | Low | tests/test_control_room_studio.py:442-455,483,526-532 | Greps PowerShell scripts and docs for strings (`pip install`, `.[dev,onnx,video]`, `npm ci`, `DryRun`) | Positive string checks are brittle; the negative safety checks (no `Set-ExecutionPolicy`, `Invoke-Expression`, `RunAs`) are a legitimate guard | Keep the negative checks, drop exact-string positives | S |
| B5-10 | Info | tests/test_facemesh_skin.py:47, test_speech_privacy.py:25, test_tracking_browser.py:38 | Regex/strip-comments over JS source (shader extraction; forbidden APIs `new Worker`, `eval(`, `captureStream`) | Privacy guards are legitimate; shader extract is coupled to source layout but feeds a real browser run | Keep | - |
| B5-11 | Info | tests/test_webapp.py:42, test_character.py:89 | Assert strings in committed `avatar.bundle.js` (`ws/rig`, `FaceLandmarker`, no `https://cdn`) | Legitimate stale-bundle and no-external-host guards; message says how to rebuild | Keep | - |
| B5-12 | Info | tests/test_remote.py:279 | AST-scans `remote.py` imports, forbids network libs, asserts no class with `send` besides Transport/FakeTransport | Legitimate structural guard of "no real transport"; depends on the name `FakeTransport` | Keep | - |
| B5-13 | Info | tests/test_character.py:69,271 | `build()` output must equal committed `pip.vrm`/`mira.vrm` byte for byte | Change-detector by design (determinism guard) | Keep; document how to regenerate | XS |
| B5-14 | Low | tests (browser files) | About 50 `time.sleep(0.05..1.5)` in test_body_server.py, test_facemesh_browser.py, test_control_room_photoface.py:87,101 (1.5 s negative waits), test_character.py:129 (3 s) | Mostly inside deadline polling loops (fine); the fixed negative waits ("must not come back") are the slow/flaky ones | Replace with bounded polls asserting non-appearance over N frames | M |
| B5-15 | Low | src cli.py, sources.py, hardware.py, bench_camera.py | CLI `serve`/`models` subcommands and real hardware probes never executed (cli 73%, hardware 72%, sources 79%, bench_camera 63%) | Coverage table | Smoke `main(["models","list"])`; `default_probes()` key shape | S |
| B5-16 | Info | tests/conftest.py:34-45 | Global monkeypatch of `http.client.HTTPConnection.putrequest` adds the token to every request | Tests about auth must opt out with `raw_http`; a forgotten marker could mask a missing-token bug | Fine; consider failing if `raw_http` tests see the header | - |
| B5-17 | Low | tests/test_core.py | Consent and watermark guards are concentrated in a few test_core tests (first failing test for 4 of 8 caught mutants) | Mutation table | Add a dedicated test_safety.py with per-function unit tests | S |

Isolation: nothing found that needs the network or a particular test order (all non-browser tests passed in default order apart from the two timing failures). Servers use `port=0`.

## Mutation sanity

Mutants were applied to a copy of `src` in `.mut/` inside the worktree (deleted afterwards; `git status` clean), `pytest -x -m "not browser"` on the listed files.

| # | Function | Mutation | Tests run | Caught |
|---|---|---|---|---|
| 1 | ConsentStore.verify (revocation) | `record_id in self._revoked or (...)` -> `False or (...)` | test_core, test_cohost, test_facemesh_consent, test_portrait, test_pipeline_strict, test_audio | yes (test_core::test_consent_rejects_other_key_revoked_and_malformed_signature) |
| 2 | ConsentStore.verify (scope) | `record.scope != scope` -> `False` | same | yes (test_core::test_consent_valid_expired_scope_and_tampered) |
| 3 | watermark.extract | skip HMAC tag comparison | test_core, test_audio, test_pipeline_strict | yes (test_core::test_gated_swap_runs_and_is_watermarked_with_authentic_tag) |
| 4 | watermark.embed | write zero bits instead of payload bits | same | yes (same test) |
| 5 | server token compare | `compare_digest` on first 8 bytes only | test_server_auth | yes (test_wrong_tokens_are_refused_in_every_carrier) |
| 6 | OneEuroFilter | ignore `beta` (cutoff = min_cutoff) | test_filters, test_core, test_tracking_*, test_rig | yes (test_one_euro_reduces_jitter_but_follows_fast_motion) |
| 7 | validate_stages | `if not gate_seen` -> `if False` | test_core, test_pipeline_strict, test_portrait, test_audio, test_studio | yes (test_portrait::test_pipeline_ordering_is_enforced) |
| 8 | models.ensure_model | skip sha256 check of the cached file | test_core, test_resilience, test_model_licenses, test_ort_files, test_logging, test_bench | yes (test_model_licenses::test_a_verified_pinned_portrait_model_does_load...) |
| 9 | audio.wavio.read_wav | stereo mean -> first channel | test_audio, test_voice_presets | **NO** |
| 10 | runtime.providers PREFERENCE | swap CUDA and DML order | test_providers, test_hardware | **NO** |

8 of 10 caught. Because of `-x` I did not measure how many tests catch each mutant.

## Missing tests worth writing first

1. **read_wav stereo and width** (B5-05): write a 2-channel 16-bit WAV with L=+0.5, R=-0.5, assert samples are ~0 and 1-D; write 8-bit and 24-bit files and assert `ValueError("only 16-bit PCM WAV is supported")`.
2. **Provider preference order** (B5-06): `pick_providers([all six])` equals `[TRT, CUDA, DML, OpenVINO, CoreML, CPU]`; unknown providers are dropped; CPU is appended when absent.
3. **Deterministic replacements for the timing tests** (B5-01..04): grabber with an injected clock/event; consent expiry via `now=`; retry test polling an attempt counter.
4. **Consent malformed records** (consent.py L95-106): non-str subject, `expires_at` nan/inf, non-ASCII signature, wrong `key_id` each raise `ConsentError` (never TypeError/ValueError); `now == expires_at` counts as expired.
5. **Watermark negative paths** (watermark.py L45,56,59): too-small frame raises; non-uint8 returns None; header with length 0 returns None; keyed extract of an unsigned mark returns None; 255-byte payload round-trips, 256 raises.
6. **CLI smoke** (`_serve`, `_models`): `main(["models","list"])` exit code/output; `main(["serve"])` with `Server` patched asserts host 127.0.0.1 and that a token is printed (CLAUDE.md rule currently enforced only inside test_server).
7. **models download mismatch and mirror fallback** (models.py L169-199): first mirror returns wrong bytes, nothing left on disk, second mirror used; all fail gives a ModelError listing every failure.
8. **sources.py video/camera iterators** with a fake `cv2.VideoCapture`: end of file stops iteration; open failure raises SourceError.

## Not verified

- The 110 browser-marked tests were not run; the stated 672 pass / 90 skip split was not reproduced (this run: 646 pass, 4 skip, 2 fail, 110 deselected). Coverage excludes code reached only by browser tests.
- Coverage is in-process only; subprocess code and the webapp node tests (`npm test`) are not counted.
- Leaked threads, open ports, temp files and random-order independence were not checked.
- Mutation runs used a hand-picked test subset with `-x`; "not caught" means not caught by that subset (grep showed no other test for the two escapes).
- Flakiness of B5-02/03/04 is judged from reading the code; only B5-01 was observed failing (under coverage load).
- `docs/audit/AUDIT-2026-10-21.md` is absent on this branch.
