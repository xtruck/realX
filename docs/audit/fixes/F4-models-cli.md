# F4: models, cli, diag, hardware fixes (audit B4)

Branch `fix-f4-models-cli`. One commit per finding, test first.

| Finding | Before | After | Test |
|---|---|---|---|
| B4-01 | `IncompleteRead` escaped `ensure_model` as a traceback, mirror skipped | `HTTPException`/`ValueError` caught like `OSError`: mirror tried, then a clean `ModelError` | `tests/test_models_download.py` |
| B4-02 | `models fetch` always exit 0, failures printed as `missing:` | `fetch` prints `failed:`, lists the models not ready on stderr, exit 1; `list` stays 0; licence column widened | `tests/test_cli_models.py` |
| B4-03 | licence gate trusted the self-declared `license` label | every manifest key needs a `(key, sha256, license)` row in the new "Manifest register" of `docs/LICENSE-AUDIT.md`; test also denies blocked-family fragments in key/filename/URL | `tests/test_model_licenses.py` |
| B4-10 | `realx voice` traceback (exit 1) on missing, 24-bit or non-WAV input | `cannot read <file>: <reason>`, exit 2 | `tests/test_cli_voice.py` |
| B4-11 | `process_rss_bytes()` returned `None` on Windows (OverflowError) | `argtypes`/`restype` declared; returns a positive int; test requires it on win32 | `tests/test_camera_grabber.py` |
| B4-12 | `realx hardware` 3.17 s in this session (11.9 s in the audit) | 1.28 s and 1.42 s (two runs); same output (4 cores, 8 threads) | `tests/test_hardware.py` |

B4-12 timings are indicative only (shared machine). The CPU name now comes from the registry, threads from
`os.cpu_count()`, physical cores from `GetLogicalProcessorInformationEx`; PowerShell stays as the fallback. The GPU probe still
uses one PowerShell call (about 1.2 s of the remaining time).

## Proposed docs/PROGRESS.md entry

- Audit B4 fixes (F4): `ensure_model` survives truncated downloads (mirror fallback, clean error); `realx models fetch` exits 1 and names
  the models not ready; the licence gate requires a (name, sha256, license) row in `docs/LICENSE-AUDIT.md` and rejects blocked-family
  names; `realx voice` reports unreadable input in one line (exit 2); Windows process memory is read correctly; `realx hardware` no longer
  starts PowerShell for the CPU (3.2 s to 1.3 s here).
