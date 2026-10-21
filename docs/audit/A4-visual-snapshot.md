# A4: repeatable visual snapshot of the face-mesh page

Photorealism work (neck, hair halo, body seams, soft edges) can only be judged by eye. Two scripts make a before/after
repeatable.

## Usage

Needs Playwright (`pip install -e ".[browser]"`) and a headed Chrome: `REALX_CHROMIUM` must point at `chrome.exe`.
The models are fetched by the page on first use, so the first run is slow.

```powershell
$env:REALX_CHROMIUM = "C:\Program Files\Google\Chrome\Application\chrome.exe"
# on each branch (one worktree each), same label scheme:
python scripts/visual_snapshot.py --out snaps/before --label before --variants "base;body,hair;body,hair,soft"
python scripts/visual_snapshot.py --out snaps/after  --label after  --variants "base;body,hair;body,hair,soft"
# then, anywhere:
python scripts/visual_compare.py snaps/before snaps/after --out snaps/compare
```

* `--variants`: option sets separated by `;`, options within a set by `,`. Options: `base` (nothing extra), `body`, `hair`, `soft`.
  Options are switched on in order and off again when a later variant does not list them.
* Per variant two PNGs: `<label>_<variant>_full.png` (the drawn preview) and `<label>_<variant>_neck.png` (the neck/chin
  area at 4x, placed from the page's own `window.__facemesh.box`, taking the Mirror flip into account).
* `visual_compare.py` pairs files by the name after the first `_` and writes `compare_<variant>_<part>.png` with the
  directory name (or `--left-label` / `--right-label`) printed on each half.
* The viewport is fixed at 800x1800: the page pauses drawing while its "Virtual face" label is outside the window.
* Uses a fake camera (astronaut clip) and the astronaut photo, so the input is identical on every run and machine.
  Run both snapshots on the same machine, with no other Chrome open, for a fair comparison.

Sample output from this branch: `docs/audit/A4-samples/` (downscaled to 50% to stay small; real runs are full size).

Tests of the pure parts (variant parsing, crop rectangle, side-by-side): `python -m pytest -q tests/test_visual_snapshot.py`.
