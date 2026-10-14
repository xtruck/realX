"""Benchmark of the BROWSER full-body tracker (MediaPipe in a Chromium page) on this machine.

It starts the real server, plays a short clip as the camera (Chromium's fake-camera feature; the clip is the
public-domain astronaut portrait, so the picture is the same on every machine), opens
/avatar?track=1, waits for tracking to start and then samples what the page reports about itself:
tracker rate, milliseconds per model, how often each model ran, which delegate (GPU or CPU) was used,
and how fast the character itself kept rendering.

The numbers belong to this machine and this moment. The report records other running Chrome processes
BEFORE it starts, because a tracking tab that is already open shares the GPU and makes every number
look worse; when any are found the report says "not representative" next to the numbers.

Windows PowerShell:
    $env:REALX_CHROMIUM = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    python scripts/bench_tracking.py --resolution 640x480 --headed --seconds 20 --json tracking.json
"""

from __future__ import annotations

import argparse
import datetime
import json
import math
import os
import re
import statistics
import subprocess
import sys
import tempfile
import time
from collections.abc import Callable
from pathlib import Path

from realx import __version__
from realx.models import ModelError, ensure_model

SCHEMA = "realx-bench-tracking/1"
MODELS = ("mp_face", "mp_pose", "mp_hand")
CAMERA_FLAGS = ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"]
SOFTWARE_GL = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]  # headless has no GPU
MODEL_KEYS = ("pose", "face", "hands")


def parse_resolution(text: str) -> tuple[int, int]:
    m = re.fullmatch(r"(\d+)[xX](\d+)", str(text).strip())
    if not m:
        raise ValueError(f"'{text}' is not a resolution like 640x480")
    w, h = int(m.group(1)), int(m.group(2))
    if not (64 <= w <= 4096 and 64 <= h <= 4096):
        raise ValueError("each side must be between 64 and 4096")
    if w % 2 or h % 2:
        raise ValueError("each side must be even (the fake-camera clip is 4:2:0)")
    return w, h


def write_clip(path: Path, size: tuple[int, int], frames: int = 30) -> None:
    """A y4m clip for Chromium's fake camera: the portrait, nudged side to side, at the requested size."""
    import cv2
    import numpy as np
    from skimage import data

    w, h = size
    side = min(w, h)
    portrait = cv2.resize(data.astronaut(), (side, side))
    with open(path, "wb") as fh:
        fh.write(f"YUV4MPEG2 W{w} H{h} F30:1 Ip A1:1 C420jpeg\n".encode("ascii"))
        for i in range(frames):
            canvas = np.zeros((h, w, 3), np.uint8)
            x0 = (w - side) // 2 + int(round(4 * side / 480 * math.sin(i / 3)))
            x0 = max(0, min(w - side, x0))
            y0 = (h - side) // 2
            canvas[y0 : y0 + side, x0 : x0 + side] = portrait
            fh.write(b"FRAME\n" + cv2.cvtColor(canvas, cv2.COLOR_RGB2YUV_I420).tobytes())


# --- other browsers on the machine ---------------------------------------------------------------------
def count_browser_processes() -> int:
    """How many Chrome or Chromium processes are running right now."""
    if sys.platform == "win32":
        total = 0
        for image in ("chrome.exe", "chromium.exe"):
            out = subprocess.run(
                ["tasklist", "/FI", f"IMAGENAME eq {image}", "/FO", "CSV", "/NH"], capture_output=True, text=True, timeout=30
            ).stdout
            total += sum(1 for line in out.splitlines() if line.lower().startswith(f'"{image}"'))
        return total
    out = subprocess.run(["ps", "-A", "-o", "comm="], capture_output=True, text=True, timeout=30).stdout
    return sum(1 for line in out.splitlines() if "chrome" in line.lower() or "chromium" in line.lower())


def detect_contention(count: Callable[[], int] = count_browser_processes) -> dict:
    try:
        n = int(count())
    except Exception:
        n = -1
    if n < 0:
        return {
            "browser_processes_before": -1,
            "warning": "could not check for other browser processes, so contention on the GPU is unknown",
        }
    if n == 0:
        return {"browser_processes_before": 0, "warning": None}
    return {
        "browser_processes_before": n,
        "warning": (
            f"{n} Chrome/Chromium process(es) were already running before the benchmark started. A tracking page that is "
            "open shares the same GPU, so these numbers are not representative. Close other browser windows and run again."
        ),
    }


# --- sampling and summary -------------------------------------------------------------------------------
def collect(sampler: Callable[[], dict], seconds: float, interval: float = 1.0, clock=time.perf_counter, sleep=time.sleep) -> list[dict]:
    samples: list[dict] = []
    t0 = clock()
    while True:
        elapsed = clock() - t0
        if elapsed >= seconds:
            break
        sample = dict(sampler())
        sample["t"] = round(elapsed, 2)
        samples.append(sample)
        sleep(interval)
    return samples


def _median(values: list[float]) -> float | None:
    values = [v for v in values if isinstance(v, (int, float)) and math.isfinite(v)]
    return round(statistics.median(values), 2) if values else None


def summarize(samples: list[dict]) -> dict:
    if not samples:
        return {
            "sample_count": 0, "tracker_fps_median": None, "ms_per_model_median": {}, "hz_median": {},
            "render_fps": None, "delegates": {}, "last_hand_hint": None,
        }
    first, last = samples[0], samples[-1]
    span = last["t"] - first["t"]
    render = (last["frames"] - first["frames"]) / span if span > 0 and "frames" in first and "frames" in last else None
    return {
        "sample_count": len(samples),
        "tracker_fps_median": _median([s.get("tracker_fps") for s in samples]),
        "ms_per_model_median": {k: _median([(s.get("ms") or {}).get(k) for s in samples]) for k in MODEL_KEYS},
        "hz_median": {k: _median([(s.get("hz") or {}).get(k) for s in samples]) for k in MODEL_KEYS},
        "render_fps": round(render, 2) if render is not None else None,
        "delegates": dict(last.get("delegates") or {}),
        "last_hand_hint": last.get("hint"),
    }


def build_report(config: dict, hardware: dict, contention: dict, samples: list[dict]) -> dict:
    return {
        "schema": SCHEMA,
        "created_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "realx_version": __version__,
        "hardware": hardware,
        "config": config,
        "contention": contention,
        "samples": samples,
        "summary": summarize(samples),
    }


def validate_report(doc) -> None:
    if not isinstance(doc, dict) or doc.get("schema") != SCHEMA:
        raise ValueError(f"not a {SCHEMA} document")
    for key in ("created_utc", "realx_version"):
        if not isinstance(doc.get(key), str):
            raise ValueError(f"{key} is missing")
    for key in ("hardware", "config", "contention", "summary"):
        if not isinstance(doc.get(key), dict):
            raise ValueError(f"{key} is missing")
    c = doc["contention"]
    if not isinstance(c.get("browser_processes_before"), int) or "warning" not in c:
        raise ValueError("contention must say how many browser processes were running and carry a warning field")
    if not isinstance(doc.get("samples"), list):
        raise ValueError("samples is missing")
    for key in ("sample_count", "tracker_fps_median", "ms_per_model_median", "hz_median", "render_fps", "delegates"):
        if key not in doc["summary"]:
            raise ValueError(f"summary.{key} is missing")


def format_summary(doc: dict) -> str:
    s, hw, cfg = doc["summary"], doc["hardware"], doc["config"]
    lines = [
        f"browser tracker benchmark ({doc['created_utc']})",
        f"  machine   : {hw.get('cpu_name') or hw.get('machine')}, {hw.get('platform')}",
        f"  browser   : {cfg.get('browser')}, {'windowed' if cfg.get('headed') else 'headless (software GL)'}, "
        f"camera {cfg['resolution'][0]}x{cfg['resolution'][1]}, delegate {cfg.get('delegate')}",
    ]
    if doc["contention"]["warning"]:
        lines.append(f"  WARNING   : {doc['contention']['warning']}")
    lines += [
        f"  samples   : {s['sample_count']}",
        f"  tracker   : {s['tracker_fps_median']} fps (median); delegates {s['delegates']}",
        f"  per model : {s['ms_per_model_median']} ms (median)   ran/s {s['hz_median']}",
        f"  character : rendered at {s['render_fps']} fps while tracking",
        f"  hands     : {s['last_hand_hint']}",
    ]
    return "\n".join(lines)


# --- the browser run --------------------------------------------------------------------------------------
def _find_browser() -> str | None:
    exe = os.environ.get("REALX_CHROMIUM")
    return exe if exe and os.path.exists(exe) else None


def open_authenticated_page(browser, server, viewport: dict):
    """A page that already holds the server's access token (the cookie a browser gets after following the printed link)."""
    from realx.server import TOKEN_COOKIE

    ctx = browser.new_context(viewport=viewport, permissions=["camera"])
    ctx.add_cookies([{"name": TOKEN_COOKIE, "value": server.token, "url": f"http://127.0.0.1:{server.port}"}])
    return ctx.new_page()


def run_browser(args: argparse.Namespace, size: tuple[int, int]) -> tuple[list[dict], str]:
    from playwright.sync_api import sync_playwright

    from realx.server import Engine, Server

    exe = _find_browser()
    if not exe:
        raise RuntimeError("set REALX_CHROMIUM to the path of chrome.exe (or another Chromium)")
    with tempfile.TemporaryDirectory() as tmp:
        clip = Path(tmp) / "portrait.y4m"
        write_clip(clip, size)
        server = Server(Engine(source="demo:static", mode="body"), port=0)
        server.start()
        try:
            flags = ["--no-sandbox", *CAMERA_FLAGS, f"--use-file-for-fake-video-capture={clip}"]
            if not args.headed:
                flags += SOFTWARE_GL
            with sync_playwright() as p:
                browser = p.chromium.launch(executable_path=exe, headless=not args.headed, args=flags)
                try:
                    page = open_authenticated_page(browser, server, viewport={"width": 640, "height": 480})
                    page.goto(f"http://127.0.0.1:{server.port}/avatar?track=1&preview=1&delegate={args.delegate}")
                    deadline = time.time() + args.startup_timeout
                    while time.time() < deadline:  # plain evaluate calls: the page's CSP forbids wait_for_function
                        t = page.evaluate("window.__realx && window.__realx.tracking")
                        if t and t.get("state") == "error":
                            raise RuntimeError(f"tracking failed to start: {t.get('detail')}")
                        if t and (t.get("frames") or 0) >= 10:
                            break
                        time.sleep(0.5)
                    else:
                        raise RuntimeError(f"tracking did not start within {args.startup_timeout:.0f} s")
                    time.sleep(3)  # let the scheduler settle before sampling

                    def sampler() -> dict:
                        state = page.evaluate("({frames: window.__realx.frames, tracking: window.__realx.tracking})")
                        t = state.get("tracking") or {}
                        return {
                            "tracker_fps": t.get("fps"), "tracker_frames": t.get("frames"), "frames": state.get("frames"),
                            "ms": t.get("ms") or {}, "hz": t.get("hz") or {},
                            "hint": (t.get("diag") or {}).get("handHint"), "delegates": t.get("delegates") or {},
                        }

                    return collect(sampler, args.seconds), browser.version
                finally:
                    browser.close()
        finally:
            server.stop()


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Benchmark the browser full-body tracker on this machine.")
    ap.add_argument("--resolution", default="640x480", help="fake-camera size, WxH, both even (default 640x480)")
    ap.add_argument("--delegate", choices=["auto", "cpu", "gpu"], default="auto")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--headed", action="store_true", help="a real window with the real GPU (recommended)")
    mode.add_argument("--headless", action="store_true", help="no window; software rendering (the default)")
    ap.add_argument("--seconds", type=float, default=15.0, help="how long to sample")
    ap.add_argument("--startup-timeout", type=float, default=180.0)
    ap.add_argument("--json", default=None, metavar="PATH")
    args = ap.parse_args(argv)
    try:
        for name in MODELS:
            ensure_model(name, download=False)  # never start downloading on its own
        size = parse_resolution(args.resolution)
    except ModelError as exc:
        print(f"cannot run the benchmark: {exc}", file=sys.stderr)
        return 2
    except ValueError as exc:
        print(f"bench_tracking: {exc}", file=sys.stderr)
        return 2
    contention = detect_contention()  # before anything of ours is running
    from realx.bench import hardware_info

    try:
        samples, browser_version = run_browser(args, size)
    except (RuntimeError, ImportError) as exc:
        print(f"bench_tracking: {exc}", file=sys.stderr)
        return 2
    doc = build_report(
        config={
            "resolution": list(size), "delegate": args.delegate, "headed": bool(args.headed), "seconds": args.seconds,
            "browser": browser_version, "page": "/avatar?track=1&preview=1",
        },
        hardware=hardware_info(), contention=contention, samples=samples,
    )
    validate_report(doc)
    print(format_summary(doc))
    if args.json:
        Path(args.json).write_text(json.dumps(doc, indent=2), encoding="utf-8")
        print(f"\nwrote {args.json}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
