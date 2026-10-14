# realX

Real-time face tracking, avatar and voice tools that keep working when you move fast,
with **consent, provenance and license checks built in**.

> Status: working avatar and voice tiers, tested on a CPU-only laptop. Face swapping is
> designed but **not shipped**: its models are license-blocked (see
> [License audit](docs/LICENSE-AUDIT.md)).

## What works today

- **Control room** (`realx serve`): live preview in your browser with a tracking ribbon,
  picture and voice controls, and a safety panel.
- **Fast-motion tracking**: stays locked on one face through dancing, jumping,
  sprinting and head spins, with motion blur and noise, and when your machine drops
  frames. Measured below.
- **Avatar tier**: a cartoon avatar follows your face and head tilt. No real face is
  synthesized, so no restricted model is involved.
- **3D character**: Pip, an original VRM character, rendered in your browser with
  three.js and @pixiv/three-vrm and driven by head pose over a local WebSocket. Add
  `http://127.0.0.1:8765/avatar` as an OBS Browser Source (transparent background).
  Bring your own model with `realx serve --avatar my.vrm`.
- **Background replacement**: cut yourself out of your own camera picture and put a
  photo, a blur or a colour behind you (PP-HumanSeg, Apache-2.0). Nothing is generated.
- **Character voices**: `realx voices` lists presets (pip, bear, imp, robot, radio).
  They colour your own voice and cannot imitate anyone.
- **Voice**: pitch shifting with a streaming phase vocoder, noise gate, normalization,
  A/V delay matching, WAV conversion, and a provenance mark on every output.
- **Safety by construction**: a pipeline that synthesizes a face or voice cannot be
  built without a consent gate before it and a watermark after it.

## Quick start (Windows, Python 3.10+)

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -e ".[dev]"
.\.venv\Scripts\realx models fetch      # downloads the face detector (MIT) and person segmenter (Apache-2.0), hash-verified
.\.venv\Scripts\realx serve             # opens http://127.0.0.1:8765/
.\.venv\Scripts\realx voice in.wav out.wav --semitones 3
.\.venv\Scripts\python -m pytest
```

The server listens on `127.0.0.1` only. Choose "Camera" in the control room to use your
webcam, or use the built-in dancing, jumping, sprinting and spinning demos.

## Measured results

CPU only (Intel i5-7300U, no GPU), 640x480, demo footage with motion blur and noise:

| Motion | Face found (detector alone) | Face found (realX) | Identity switches | Median position error |
|---|---|---|---|---|
| Dancing | 48% | 94% | 0 | 5 px |
| Jumping | 64% | 96% | 0 | 4 px |
| Sprinting | 44% | 93% | 0 | 4 px |
| Head spin | 100% | 99% | 0 | 2 px |

Real webcam (640x480, dim room, face about 140 px wide): the face was found in 99% of
frames with one stable identity and no duplicates, at about 10 fps. The first version
found it in only 72% of frames. The cause was a single-scale face detector that
struggles with large faces; detection now runs at small input widths and brightens dark
frames. Under blur, position error is now 7-8 px at the 95th percentile.

Reproduce with `python scripts/motion_check.py --degrade`. The test suite also checks
that no duplicate "ghost" faces appear when 1 to 12 frames are skipped between
processed frames, which is what a loaded machine does.

## Documentation

- [Progress log](docs/PROGRESS.md) · [Roadmap](docs/ROADMAP.md) · [Ideas](docs/IDEAS.md)
- [Architecture](docs/ARCHITECTURE.md) · [Safety](docs/SAFETY.md)
- [Research](docs/RESEARCH.md) · [License audit](docs/LICENSE-AUDIT.md)

## Responsible use

realX does not bundle face-swap models. Voice conversion to a named person and any
future face swap require a signed consent record for that person, and outputs carry a
provenance mark. Do not use it to impersonate, defraud or harass anyone.
