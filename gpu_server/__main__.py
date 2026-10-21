"""Run on the rented machine:  GPU_SERVER_TOKEN=... python -m gpu_server --ephemeral [--port 8443]

Binds 127.0.0.1 unless told otherwise; put TLS in front of it. The token is read from the environment, never from the command line,
so it does not show in the process list.
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

from gpu_server.app import GpuServer, ServerConfig, startup_check


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="gpu_server")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8443)
    ap.add_argument("--ephemeral", action="store_true", help="state that this instance is created for one session and destroyed after")
    ap.add_argument("--data-dir", default=None, help="a directory that must be empty; frames are never written there")
    args = ap.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s")
    config = ServerConfig(token=os.environ.get("GPU_SERVER_TOKEN", ""), host=args.host, port=args.port,
                          ephemeral=args.ephemeral, data_dir=args.data_dir)
    problems = startup_check(config)
    if problems:
        for p in problems:
            print("refusing to start:", p, file=sys.stderr)
        return 2
    server = GpuServer(config)
    print(f"gpu_server listening on {config.host}:{server.port} (passthrough filter, no model)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
