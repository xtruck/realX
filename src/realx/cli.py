from __future__ import annotations

import argparse
import sys

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


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="realx")
    parser.add_argument("--version", action="version", version=f"realx {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("providers", help="show execution providers, fastest first")
    sub.add_parser("stages", help="list registered pipeline stages")
    sub.add_parser("selftest", help="run a minimal pipeline end to end")
    args = parser.parse_args(argv)

    if args.command == "providers":
        print("\n".join(pick_providers()))
        return 0
    if args.command == "stages":
        print("\n".join(available()))
        return 0
    return _selftest()


if __name__ == "__main__":
    sys.exit(main())
