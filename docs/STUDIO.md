# Studio controller

`realx.studio.StudioController` runs the avatar pipeline and, only when allowed, a portrait pipeline.

| State | Meaning |
|---|---|
| `AVATAR` | The 3D avatar pipeline produces the output. The default; the control room always starts here. |
| `PORTRAIT` | A consented still image is animated. Needs `REALX_ENABLE_PORTRAIT=1` (or `portrait_enabled=True`), a consent record for that exact image, and a verified engine. **No engine is enabled today**, so this state is reachable only with test fakes. |
| `DEGRADED` | Portrait mode was started and failed. The avatar is the output. Nothing retries by itself. |

Why a frame can fall back to the avatar (the reason is in `/api/stats` under `studio.reason`): `consent_revoked_or_expired`,
`engine_or_model_unavailable`, `engine_error`, `engine_timeout`, `too_slow`, `resource_failure`, `output_guard_refused`.
The failing frame is never emitted: the avatar frame for that same input is sent instead. Only the exception class is
kept as the detail, never its message.

Guarantees, each covered by `tests/test_studio.py` with fake engines and generated noise images:

* Revoked or expired consent ends portrait output on the next frame, closes the engine and image, and a revoked
  record cannot start portrait mode again.
* The chain must be gate -> animation -> visible label -> watermark (`Pipeline` validation, strict mode). A chain
  without the label raises `PipelineConfigError` and changes nothing.
* `OutputGuard` checks the pixels leaving the studio: the "DIGITAL HOST" bar is visible and the provenance mark extracts
  (verified with the key when one is set). A frame it cannot verify is not emitted.
* Setup of the portrait path has a time limit; a stuck engine cannot freeze the video, and whatever it eventually builds is closed.
* Shutdown closes the portrait pipeline before the avatar, and is safe to call twice.

Limits: portrait mode is not offered in the control room, and there is no UI or API to switch to it. The fallback
runs the avatar pipeline on the failing frame, so its tracker state can be briefly out of date after a long portrait stretch.
