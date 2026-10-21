# F3 filters and tracking fixes (branch fix-f3-filters)

## Before / after

| Finding | Before | After | Test |
|---|---|---|---|
| B2-01 One-Euro frozen on looped timestamps | `dt <= 0` held the last value until time passed its old maximum (output stuck at 49.5 in the audit repro) | `dt < 0` restarts the filter at the new sample; `dt == 0` still holds | `tests/test_filters.py` (filter and `one_euro` stage with looped timestamps) |
| B2-03 NaN/inf poisons smoothing | one non-finite landmark made every later output of that track NaN (`one_euro` and `smooth`) | filter resets on a non-finite sample or time; stages drop the bad landmarks (box kept) and reset that track's filter; `FaceTracker.update` drops non-finite or non-(N,2) landmarks and keeps the face | `tests/test_filters.py` (NaN and inf, next finite frame is finite) |
| B2-04 `YuNetDetector` not flagged | `run_stream(workers>1)` accepted it | `stateful = True`; `run_stream(workers=2)` raises `PipelineConfigError` | `tests/test_pipeline_strict.py` |
| B2-07 `bg_replace` glue (safe parts only) | blend: 2 `astype` copies + about 5 float32 temporaries; smoothstep: 5 temporaries | blend in one float32 buffer, in place; smoothstep in place; guide scaled in place; model and engine untouched | `tests/test_background.py` (old code kept in test, within 1/255) |
| B5 missing tests | stereo, 8-bit, 24-bit `read_wav` and full `pick_providers` order untested; CUDA/DML swap not caught | tests added (8/24-bit assert the existing `ValueError`); swap mutation now fails 2 tests; DirectML rank not changed | `tests/test_audio.py`, `tests/test_providers.py` |

## B2-07 measurement (indicative only)

One short micro-timing on a shared machine, 640x480, best of 5 batches of 200 calls, synthetic data, matte excluded:

| Piece | Old | New | Ratio |
|---|---|---|---|
| blend | 20.1 ms | 11.0 ms | 0.55 |
| smoothstep (480x640 float32) | 5.2 ms | 4.1 ms | 0.79 |

Absolute numbers are inflated by machine load; read the ratios only, and they come from a single run. Not measured end to end with the model.

## Proposed docs/PROGRESS.md entry

```
- Filters/tracking (F3): One-Euro filter restarts on a backwards timestamp (looped clips no longer freeze smoothing, B2-01); non-finite landmarks are dropped and the track's filter reset instead of poisoning smoothing, tracker validates landmark shape and finiteness (B2-03); `detect_yunet` is `stateful`, so `run_stream(workers>1)` refuses it (B2-04); `bg_replace` blend and smoothstep use fewer temporaries, output within 1/255 of before (B2-07, model and engine unchanged); new tests for stereo/8-bit/24-bit `read_wav` and the full provider order (B5).
```

## Not done

B2-07 items needing a model or engine change (ONNX Runtime vs cv2.dnn, guided filter resolution, matte skipping) were left alone as instructed.
