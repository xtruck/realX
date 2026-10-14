from __future__ import annotations

import argparse
import sys
import time
import webbrowser

import numpy as np

from realx import __version__
from realx.pipeline import Pipeline
from realx.runtime import pick_providers
from realx.stages import available, create
from realx.types import FrameContext


def _selftest() -> int:
    frame = np.zeros((64, 64, 3), dtype=np.uint8)
    with Pipeline([create("passthrough"), create("smooth")]) as pipe:
        out = pipe.process(FrameContext(pixels=frame))
    ok = out.pixels.shape == frame.shape
    print("selftest:", "ok" if ok else "FAILED")
    return 0 if ok else 1


def _models(action: str) -> int:
    from realx.models import BLOCKED, MANIFEST, ModelError, ensure_model, models_dir

    print(f"models folder: {models_dir()}")
    for name, spec in MANIFEST.items():
        try:
            path = ensure_model(name, download=(action == "fetch"))
            status = f"ready ({path.name})"
        except ModelError as exc:
            status = f"missing: {exc}"
        print(f"  {name:12s} {spec.license:6s} commercial_ok={spec.commercial_ok}  {status}")
    for name, why in BLOCKED.items():
        print(f"  {name:12s} BLOCKED  {why}")
    return 0


def _voice(src: str, dst: str, semitones: float) -> int:
    from realx.audio import offline
    from realx.audio.wavio import read_wav

    samples, rate = read_wav(src)
    _, pcm = offline.convert(samples, rate, semitones)
    from realx.audio.wavio import write_wav

    write_wav(dst, pcm.astype(np.float32) / 32767.0, rate)
    print(f"wrote {dst}: {pcm.size / rate:.1f}s at {rate} Hz, {semitones:+g} semitones, provenance mark embedded")
    return 0


def _serve(port: int, source: str, open_browser: bool) -> int:
    from realx.models import ModelError, ensure_model
    from realx.server import Engine, Server

    try:
        ensure_model("yunet")
    except ModelError as exc:
        print(f"cannot start: {exc}", file=sys.stderr)
        return 2
    server = Server(Engine(source=source), port=port)
    server.start()
    url = f"http://127.0.0.1:{server.port}/"
    print(f"realX control room: {url}  (Ctrl+C to stop)")
    if open_browser:
        webbrowser.open(url)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        server.stop()
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="realx")
    parser.add_argument("--version", action="version", version=f"realx {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("providers", help="show execution providers, fastest first")
    sub.add_parser("stages", help="list registered pipeline stages")
    sub.add_parser("selftest", help="run a minimal pipeline end to end")

    m = sub.add_parser("models", help="list models and their licenses, or fetch them")
    m.add_argument("action", nargs="?", choices=["list", "fetch"], default="list")

    v = sub.add_parser("voice", help="clean up and pitch-shift a WAV recording")
    v.add_argument("input")
    v.add_argument("output")
    v.add_argument("--semitones", type=float, default=0.0)

    s = sub.add_parser("serve", help="open the control room in your browser")
    s.add_argument("--port", type=int, default=8765)
    s.add_argument("--source", default="demo:dance", help="camera or demo:<dance|jump|sprint|spin|static>")
    s.add_argument("--no-browser", action="store_true")

    args = parser.parse_args(argv)
    if args.command == "providers":
        print("\n".join(pick_providers()))
        return 0
    if args.command == "stages":
        print("\n".join(available()))
        return 0
    if args.command == "models":
        return _models(args.action)
    if args.command == "voice":
        return _voice(args.input, args.output, args.semitones)
    if args.command == "serve":
        return _serve(args.port, args.source, not args.no_browser)
    return _selftest()


if __name__ == "__main__":
    sys.exit(main())
