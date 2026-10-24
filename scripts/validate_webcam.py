"""Numbers from a REAL webcam session, recorded while YOU use the control room. It never opens a camera.

You start the server and pick "Camera" in the control room yourself; this script only reads `/api/stats` once a second from the
running server and writes the numbers (no pictures, no sound, nothing from the camera) to a JSON file and a short table.
It talks to this computer only: a URL that is not 127.0.0.1 or localhost is refused. The token is never printed or written.

Windows PowerShell, in a second window while `realx serve` runs:
    $env:REALX_TOKEN = "the-same-token-realx-serve-uses"     # set it before `realx serve` too, so both agree
    python scripts/validate_webcam.py --seconds 120 --json webcam-numbers.json

What it can see: the server-side camera path (fps, latency, faces found, drops, session state, error code, CPU, memory, camera
outages). Browser tracking numbers (model milliseconds, pose/hand rates) are shown on the page itself; copy those by hand
(`REAL-WEBCAM-VALIDATION.md`, `facemesh_baseline.md`). No pass/fail line is invented here: the table is the evidence.
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import statistics
import sys
import time
import urllib.error
import urllib.request
from urllib.parse import urlparse

SCHEMA = "realx-validate-webcam/1"
LOCAL_HOSTS = ("127.0.0.1", "localhost")


def check_url(url: str) -> str:
    """The base address, or ValueError: this script talks to this computer only."""
    parsed = urlparse(url)
    if parsed.scheme != "http" or parsed.hostname not in LOCAL_HOSTS or parsed.port is None:
        raise ValueError("the server address must look like http://127.0.0.1:8765 (this computer only)")
    return f"http://{parsed.hostname}:{parsed.port}"


def pick(stats: dict) -> dict:
    """The few numbers worth keeping from one /api/stats answer. Missing or odd values become None, never an exception."""

    def num(value):
        return float(value) if isinstance(value, (int, float)) and not isinstance(value, bool) and value == value else None

    diag = stats.get("diag") if isinstance(stats.get("diag"), dict) else {}
    age = diag.get("frame_age_ms") if isinstance(diag.get("frame_age_ms"), dict) else {}
    info = stats.get("error_info") if isinstance(stats.get("error_info"), dict) else {}
    return {
        "fps": num(stats.get("fps")),
        "latency_ms": num(stats.get("latency_ms")),
        "faces": num(stats.get("faces")),
        "dropped": num(stats.get("dropped")),
        "frames": num(stats.get("frames")),
        "session": stats.get("session") if isinstance(stats.get("session"), str) else None,
        "error_code": info.get("code") if isinstance(info.get("code"), str) else None,
        "cpu_percent": num(diag.get("cpu_percent")),
        "rss_mb": num(diag.get("rss_mb")),
        "frame_age_p95_ms": num(age.get("p95")),
        "source_outages": num(diag.get("source_outages")),
    }


def _values(rows: list[dict], key: str) -> list[float]:
    return [r[key] for r in rows if r.get(key) is not None]


def _pct(values: list[float], q: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    return ordered[min(len(ordered) - 1, int(round(q * (len(ordered) - 1))))]


def _round(value, digits=2):
    return None if value is None else round(value, digits)


def _span(values: list[float]) -> int | None:
    return int(values[-1] - values[0]) if len(values) > 1 else None


def summarize(rows: list[dict]) -> dict:
    """Plain numbers from the per-second rows. Empty input gives a document that says so."""
    fps = _values(rows, "fps")
    faces = _values(rows, "faces")
    rss = _values(rows, "rss_mb")
    cpu = _values(rows, "cpu_percent")
    sessions: dict[str, int] = {}
    errors: dict[str, int] = {}
    for r in rows:
        if r.get("session"):
            sessions[r["session"]] = sessions.get(r["session"], 0) + 1
        if r.get("error_code"):
            errors[r["error_code"]] = errors.get(r["error_code"], 0) + 1
    return {
        "seconds_sampled": len(rows),
        "seconds_live": sessions.get("live", 0),
        "session_seconds": sessions,
        "error_code_seconds": errors,
        "fps": {
            "median": _round(statistics.median(fps)) if fps else None,
            "p5": _round(_pct(fps, 0.05)),
            "min": _round(min(fps)) if fps else None,
        },
        "face_found_share": _round(sum(1 for f in faces if f > 0) / len(faces), 3) if faces else None,
        "frames_total": _span(_values(rows, "frames")),
        "dropped_total": _span(_values(rows, "dropped")),
        "frame_age_p95_ms_worst": _round(max(_values(rows, "frame_age_p95_ms"), default=None)),
        "cpu_percent": {"median": _round(statistics.median(cpu), 1) if cpu else None, "p95": _round(_pct(cpu, 0.95), 1)},
        "rss_mb": {
            "first": _round(rss[0], 1) if rss else None,
            "last": _round(rss[-1], 1) if rss else None,
            "growth": _round(rss[-1] - rss[0], 1) if len(rss) > 1 else None,
        },
        "camera_outages_during_run": _span(_values(rows, "source_outages")),
    }


def format_table(doc: dict) -> str:
    s = doc["summary"]
    fps = s["fps"]
    lines = [
        f"seconds sampled: {s['seconds_sampled']}   live: {s['seconds_live']}   sessions: {s['session_seconds']}",
        f"fps median / 5th percentile / min: {fps['median']} / {fps['p5']} / {fps['min']}",
        f"face found in {s['face_found_share']} of the seconds   frames: {s['frames_total']}   dropped: {s['dropped_total']}",
        f"worst 95th-percentile frame age: {s['frame_age_p95_ms_worst']} ms",
        f"cpu median / p95: {s['cpu_percent']['median']} / {s['cpu_percent']['p95']} %   "
        f"memory first -> last: {s['rss_mb']['first']} -> {s['rss_mb']['last']} MB (growth {s['rss_mb']['growth']})",
        f"camera outages during the run: {s['camera_outages_during_run']}   error codes seen: {s['error_code_seconds'] or 'none'}",
        "These are server-side numbers from a session YOU ran. Nothing here says how the picture looks.",
    ]
    return "\n".join(lines)


def fetch(base: str, token: str, timeout: float = 5.0) -> dict:
    request = urllib.request.Request(base + "/api/stats", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(request, timeout=timeout) as response:  # noqa: S310 (address checked by check_url)
        return json.loads(response.read(1_000_000))


def main(argv: list[str] | None = None, fetcher=fetch, sleep=time.sleep) -> int:
    ap = argparse.ArgumentParser(description="Record /api/stats numbers while you use a real webcam. Never opens a camera.")
    ap.add_argument("--url", default="http://127.0.0.1:8765", help="the running control room (this computer only)")
    ap.add_argument("--seconds", type=int, default=60, help="how long to record, one sample a second (default 60)")
    ap.add_argument("--json", default=None, metavar="PATH")
    args = ap.parse_args(argv)
    if not 1 <= args.seconds <= 86400:
        print("validate_webcam: --seconds must be between 1 and 86400", file=sys.stderr)
        return 2
    try:
        base = check_url(args.url)
    except ValueError as exc:
        print(f"validate_webcam: {exc}", file=sys.stderr)
        return 2
    token = os.environ.get("REALX_TOKEN", "")
    if not token:
        print("validate_webcam: set REALX_TOKEN to the token `realx serve` uses (it is never printed)", file=sys.stderr)
        return 2

    rows: list[dict] = []
    failures = 0
    for _ in range(args.seconds):
        try:
            rows.append(pick(fetcher(base, token)))
        except (urllib.error.URLError, OSError, ValueError):
            failures += 1
        sleep(1.0)
    if not rows:
        print("validate_webcam: the server never answered; is `realx serve` running with the same REALX_TOKEN?", file=sys.stderr)
        return 1
    doc = {
        "schema": SCHEMA,
        "when": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "seconds_requested": args.seconds,
        "failed_requests": failures,
        "summary": summarize(rows),
        "samples": rows,
    }
    print(format_table(doc))
    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(doc, fh, indent=2)
        print(f"written: {args.json}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
