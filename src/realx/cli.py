from __future__ import annotations

import argparse
import json
import os
import sys
import time
import webbrowser

import numpy as np

from realx import __version__
from realx import log as rlog
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
    failed: list[str] = []
    for name, spec in MANIFEST.items():
        try:
            path = ensure_model(name, download=(action == "fetch"))
            status = f"ready ({path.name})"
        except ModelError as exc:
            status = f"{'failed' if action == 'fetch' else 'missing'}: {exc}"
            failed.append(name)
        print(f"  {name:12s} {spec.license:10s} commercial_ok={spec.commercial_ok}  {status}")
    for name, why in BLOCKED.items():
        print(f"  {name:12s} BLOCKED  {why}")
    if action == "fetch" and failed:
        print(f"fetch incomplete, not ready: {', '.join(failed)}", file=sys.stderr)
        return 1
    return 0


def _cohost(args) -> int:
    from realx.safety import ConsentError
    from realx.safety.cohost import AGREEMENT, CohostVault

    vault = CohostVault()
    try:
        if args.action == "grant":
            g = vault.grant(args.name, days=args.days, agreed=args.friend_agreed)
            print(f"consent saved: {g.path}")
            print(f"REVOKE CODE (give it to {g.display_name}, it is shown only once): {g.revoke_code}")
        elif args.action == "list":
            for r in vault.list():
                print(f"  {r['id']}  {r['name']:20s} {r['state']}")
        elif args.action == "check":
            _, name = vault.check(args.file)
            print(f"valid: {name}")
        elif args.action == "revoke":
            vault.revoke(args.id, args.code)
            print("revoked: this person's likeness can no longer be used")
    except (ConsentError, ValueError) as exc:
        print(f"{exc}", file=sys.stderr)
        if args.action == "grant" and not args.friend_agreed:
            print(f"Pass --friend-agreed only if true: {AGREEMENT}", file=sys.stderr)
        return 2
    return 0


def _voices() -> int:
    from realx.audio import presets

    for p in presets.PRESETS.values():
        print(f"  {p.id:8s} {p.description}")
    print(presets.NOTE)
    return 0


def _voice(src: str, dst: str, semitones: float, preset: str | None = None) -> int:
    from realx.audio import offline
    from realx.audio.wavio import read_wav

    import wave

    try:
        samples, rate = read_wav(src)
    except (OSError, ValueError, EOFError, wave.Error) as exc:
        print(f"cannot read {src}: {exc}", file=sys.stderr)
        return 2
    try:
        _, pcm = offline.convert(samples, rate, semitones, preset=preset)
    except ValueError as exc:
        print(f"cannot convert: {exc}", file=sys.stderr)
        return 2
    from realx.audio.wavio import write_wav

    write_wav(dst, pcm.astype(np.float32) / 32767.0, rate)
    how = f"preset '{preset}'" if preset else f"{semitones:+g} semitones"
    print(f"wrote {dst}: {pcm.size / rate:.1f}s at {rate} Hz, {how}, provenance mark embedded")
    return 0


def _serve(port: int, source: str, open_browser: bool, avatar: str | None = None) -> int:
    from realx.models import ModelError, ensure_model
    from realx.server import Engine, Server

    try:
        ensure_model("yunet")
    except ModelError as exc:
        print(f"cannot start: {exc}", file=sys.stderr)
        return 2
    try:
        server = Server(Engine(source=source), port=port, avatar_path=avatar)
    except (OSError, ValueError) as exc:
        print(f"cannot start: {exc}", file=sys.stderr)
        return 2
    server.start()
    url = f"http://127.0.0.1:{server.port}/"
    link = f"{url}?token={server.token}"  # the page swaps it for a cookie at once; anything else on this PC lacks it
    print(f"realX control room: {link}  (Ctrl+C to stop)")
    if open_browser:
        webbrowser.open(link)
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
    parser.add_argument("--log-level", default=None, help="DEBUG, INFO, WARNING or ERROR (default INFO, or REALX_LOG_LEVEL)")
    parser.add_argument("--log-json", action="store_true", help="write log lines as JSON, one per line")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("providers", help="show execution providers, fastest first")
    hw = sub.add_parser("hardware", help="show what this computer can do and the quality setting that suits it")
    hw.add_argument("--json", action="store_true", help="print the result as JSON")
    sub.add_parser("stages", help="list registered pipeline stages")
    sub.add_parser("selftest", help="run a minimal pipeline end to end")

    m = sub.add_parser("models", help="list models and their licenses, or fetch them")
    m.add_argument("action", nargs="?", choices=["list", "fetch"], default="list")

    v = sub.add_parser("voice", help="clean up and pitch-shift a WAV recording")
    v.add_argument("input")
    v.add_argument("output")
    v.add_argument("--semitones", type=float, default=0.0)
    v.add_argument("--preset", default=None, help="character voice (see `realx voices`); not combined with --semitones")
    sub.add_parser("voices", help="list the character voice presets")

    c = sub.add_parser("cohost", help="consent records for a real person who agrees to be a digital co-host")
    c.add_argument("action", choices=["grant", "list", "check", "revoke"])
    c.add_argument("--name")
    c.add_argument("--days", type=float, default=30)
    c.add_argument("--friend-agreed", action="store_true")
    c.add_argument("--file")
    c.add_argument("--id")
    c.add_argument("--code")

    b = sub.add_parser("bench", help="measure the video pipeline on this machine (results are tied to its hardware)")
    b.add_argument("--frames", type=int, default=60, help="frames per resolution, at least 10 (default 60)")
    b.add_argument("--resolutions", default="320x240,640x480,1280x720", help="comma-separated WxH list")
    b.add_argument("--fps", type=float, default=30.0, help="rate at which frames are offered in the stream pass")
    b.add_argument("--stream-seconds", type=float, default=6.0, help="how long each resolution is streamed at --fps (default 6)")
    b.add_argument("--mode", choices=("cold", "warm", "both"), default="warm",
                   help="cold = clear caches before each cycle (first-run cost); warm = one untimed run, then timed cycles (default warm)")
    b.add_argument("--cycles", type=int, default=3, help="timed cycles per resolution and mode, 1 to 50 (default 3)")
    b.add_argument("--background", action="store_true", help="include background replacement (needs the pphumanseg model)")
    b.add_argument("--seed", type=int, default=0)
    b.add_argument("--json", default=None, metavar="PATH", help="also write the full result as JSON")

    bc = sub.add_parser("bench-camera", help="measure camera capture FPS and frame age (needs a camera, or --synthetic)")
    bc.add_argument("--seconds", type=float, default=10.0)
    bc.add_argument("--index", type=int, default=0, help="camera index")
    bc.add_argument("--consumer-ms", type=float, default=0.0, help="simulate a consumer that takes this long per frame")
    bc.add_argument("--synthetic", action="store_true", help="no hardware: a paced fake source, checks the harness only")
    bc.add_argument("--json", default=None, metavar="PATH")

    s = sub.add_parser("serve", help="open the control room in your browser")
    s.add_argument("--port", type=int, default=8765)
    s.add_argument("--source", default="demo:dance", help="camera or demo:<dance|jump|sprint|spin|static>")
    s.add_argument("--avatar", default=None, help="your own .vrm character (default: the bundled original, Pip)")
    s.add_argument("--no-browser", action="store_true")
    s.add_argument("--offline", action="store_true", help="never download models (same as REALX_OFFLINE=1)")

    args = parser.parse_args(argv)
    try:
        rlog.configure(level=args.log_level, json_lines=args.log_json)
    except ValueError as exc:  # an unknown level is a usage error, not a crash
        parser.error(str(exc))
    if args.command == "hardware":
        from realx import hardware

        profile = hardware.detect()
        advice = hardware.recommend(profile)
        print(json.dumps(hardware.to_dict(profile, advice), indent=2) if args.json else hardware.describe(profile, advice))
        return 0
    if args.command == "providers":
        print("\n".join(pick_providers()))
        return 0
    if args.command == "stages":
        print("\n".join(available()))
        return 0
    if args.command == "models":
        return _models(args.action)
    if args.command == "voice":
        return _voice(args.input, args.output, args.semitones, args.preset)
    if args.command == "cohost":
        return _cohost(args)
    if args.command == "voices":
        return _voices()
    if args.command == "bench":
        from realx.bench import run_cli

        return run_cli(args)
    if args.command == "bench-camera":
        from realx.bench_camera import run_cli as bench_camera

        return bench_camera(args)
    if args.command == "serve":
        if args.offline:
            os.environ["REALX_OFFLINE"] = "1"
        return _serve(args.port, args.source, not args.no_browser, args.avatar)
    return _selftest()


if __name__ == "__main__":
    sys.exit(main())
