# realX

Real-time face tracking, avatar and voice tools with consent, provenance and license checks built in.
Python 3.10+ package in `src/realx`, browser avatar renderer in `webapp/` (bundled into `src/realx/web`).

## Commands

```bash
python -m venv .venv && .venv/bin/pip install -e ".[dev]"   # Windows: .\.venv\Scripts\...
python -m pytest -q                                         # ~2 min, no model downloads needed
python -m pytest -q -m "not browser"                        # same, never starts a browser (CI runs -m browser as its own job)
pip install -e ".[browser]" && python -m playwright install chromium   # optional: then the ~90 browser tests run too (they fetch the MediaPipe models; ~30 min on a software renderer)
cd webapp && npm ci --ignore-scripts && npm test            # node tests
cd webapp && npm run build                                  # rebuild src/realx/web/avatar.bundle.js
realx serve                                                 # control room on 127.0.0.1:8765
```

## Rules

- Safety is structural: a pipeline that synthesizes a face or voice must have a consent gate before it
  and a watermark after it. Never bypass this; see `docs/SAFETY.md`.
- Do not add face-swap models or weights; they are license-blocked (`docs/LICENSE-AUDIT.md`,
  `tests/test_model_licenses.py`). One scoped exception, owner decision of 2026-10-21 (`docs/DECISION-PATH-B.md`): a
  private, non-distributed build may run such models on a rented GPU the owner controls, fetched by the owner from the
  original source and never committed. The `BLOCKED` list, its tests and the default package stay as they are.
- Camera frames leave the machine only through the Path B link and only under the guard rails G1 to G10 of
  `docs/DECISION-PATH-B.md`; otherwise `docs/REMOTE.md` applies unchanged.
- Server binds to 127.0.0.1 and every route needs the access token. Keep it that way.
- Model files (`*.onnx`, `models/`) are never committed; they are fetched hash-verified by `realx models fetch`.
- Update `docs/PROGRESS.md` when behaviour changes.
