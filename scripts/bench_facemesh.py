"""Benchmark of the FACE-MESH PAGE pipeline (face, hair, body, hands on top, stains) on this machine.

It starts the real server, plays a short clip as the camera (Chromium's fake-camera feature; the public-domain astronaut portrait, so
the picture is the same on every machine), opens /facemesh, chooses a photo (with the consent step), and then turns the features on
ONE AT A TIME, sampling what the page reports about itself after each step: frames per second, milliseconds per model, which
features really started, and whether the "Virtual face" label was on screen while the picture was drawn.

What the numbers can and cannot say:
* They belong to this machine and this moment. The report records other running Chrome processes before it starts and says "not
  representative" when it finds any, because another tab shares the GPU.
* The WebGL renderer is recorded. A software renderer ("SwiftShader") means the numbers are NOT the real GPU's: use --headed.
* "Clean the edges" (S13c) is measured as its own step ("edges ms" = one segmenter pass); if it turns itself off as too slow, the
  report says so and the later steps run without it.
* The camera is a fake one playing a portrait with no hand, so the hand model runs but finds no hand: the hands-on-top and wiping
  costs with a real hand are not included. This is stated in the report.

Windows PowerShell:
    $env:REALX_CHROMIUM = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    python scripts/bench_facemesh.py --headed --seconds 12 --json facemesh.json
"""

from __future__ import annotations

import argparse
import datetime
import json
import statistics
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from bench_tracking import (  # noqa: E402
    CAMERA_FLAGS, SOFTWARE_GL, _find_browser, detect_contention, open_authenticated_page, parse_resolution, write_clip,
)

FIELDS = ("fps", "detectMs", "poseMs", "handMs", "hairMs", "seamMs")
# Acceptance figure from the roadmap: tracking plus compositing at 640x480.
GATE_FPS = 20.0


def _median(values: list) -> float | None:
    vals = [v for v in values if isinstance(v, (int, float)) and v == v]
    return round(statistics.median(vals), 2) if vals else None


def _p95(values: list) -> float | None:
    vals = sorted(v for v in values if isinstance(v, (int, float)) and v == v)
    return round(vals[min(len(vals) - 1, int(0.95 * (len(vals) - 1) + 0.5))], 2) if vals else None


def summarize_step(name: str, samples: list[dict]) -> dict:
    """One step's samples in one record: medians of the numbers, and what the page said about each feature."""
    out: dict = {"step": name, "samples": len(samples)}
    for f in FIELDS:
        out[f + "_median"] = _median([s.get(f) for s in samples])
    out["fps_p95"] = _p95([s.get("fps") for s in samples])
    timed = [s for s in samples if isinstance(s.get("t"), (int, float)) and isinstance(s.get("handPolls"), (int, float))]
    span = (timed[-1]["t"] - timed[0]["t"]) if len(timed) >= 2 else 0
    out["hand_hz"] = round((timed[-1]["handPolls"] - timed[0]["handPolls"]) / span, 2) if span > 0 else None   # how often the hand model really ran
    last = samples[-1] if samples else {}
    out["states"] = {k: last.get(k) for k in ("body", "hair", "liveHands", "stains", "seam")}
    out["seam_slow_ms"] = last.get("seamSlowMs")   # set when "Clean the edges" turned itself off as too slow (S13c)
    out["seam_warm_ms"] = last.get("seamWarmMs")   # its first pass, while the model is prepared: the picture freezes that long once
    drawn = [s for s in samples if (s.get("drawn") or 0) > 0]
    out["drawn_samples"] = len(drawn)
    out["label_visible_while_drawn"] = (all(s.get("badge_visible") for s in drawn) if drawn else None)
    out["gate_20fps"] = (out["fps_median"] >= GATE_FPS) if out["fps_median"] is not None else None
    return out


def build_report(config: dict, hardware: dict, contention: dict, renderer: str, steps: list[dict]) -> dict:
    software = "swiftshader" in (renderer or "").lower() or "software" in (renderer or "").lower()
    notes = []
    if contention.get("warning"):
        notes.append(contention["warning"])
    if software:
        notes.append("The WebGL renderer is a SOFTWARE renderer, not the GPU: these numbers are not this laptop's real speed. Run with --headed.")
    notes.append("The fake camera shows no hand, so the hand model ran but found none: costs with a real hand are not included.")
    warm = next((s.get("seam_warm_ms") for s in steps if s.get("seam_warm_ms")), None)
    if warm:
        notes.append(f"\"Clean the edges\" first pass (the model being prepared on the graphics card) took {warm} ms: the picture froze that "
                     "long once; \"edges ms\" is the cost of the passes after it.")
    slow = next((s for s in steps if s.get("states", {}).get("seam") == "too slow"), None)
    if slow:
        notes.append(f"\"Clean the edges\" turned itself off as too slow (one pass took {slow.get('seam_slow_ms')} ms): on this machine it would freeze the "
                     "picture, so the steps after it ran without it.")
    return {
        "kind": "realx-facemesh-bench", "version": 1, "date_utc": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M"),
        "config": config, "hardware": hardware, "contention": contention, "webgl_renderer": renderer,
        "representative": not (software or bool(contention.get("warning"))), "notes": notes, "steps": steps,
    }


def format_table(doc: dict) -> str:
    lines = [
        "| Step | fps (median) | fps p95 | face ms | pose ms | hand ms | hand runs/s | hair ms | edges ms | started | label shown | >= 20 fps |",
        "|---|---|---|---|---|---|---|---|---|---|---|---|",
    ]
    for s in doc["steps"]:
        started = ", ".join(f"{k}={v}" for k, v in s["states"].items() if v not in (None, "off", 0))
        lines.append("| {step} | {fps} | {p95} | {det} | {pose} | {hand} | {hz} | {hair} | {seam} | {started} | {label} | {gate} |".format(
            step=s["step"], fps=s["fps_median"], p95=s["fps_p95"], det=s["detectMs_median"], pose=s["poseMs_median"],
            hand=s["handMs_median"], hz=s.get("hand_hz"), hair=s["hairMs_median"], seam=s.get("seamMs_median"), started=started or "-",
            label={True: "yes", False: "NO", None: "n/a"}[s["label_visible_while_drawn"]],
            gate={True: "yes", False: "no", None: "n/a"}[s["gate_20fps"]]))
    return "\n".join(lines)


# --- the browser run ---------------------------------------------------------------------------------------------------
def _wait(page, expr: str, timeout: float) -> None:
    end = time.time() + timeout   # plain evaluate calls: the page's policy forbids wait_for_function
    while time.time() < end:
        if page.evaluate(f"!!({expr})"):
            return
        time.sleep(0.25)
    raise RuntimeError(f"timed out after {timeout:.0f}s waiting for: {expr}; state={page.evaluate('window.__facemesh')}")


def _photo(tmp: Path) -> Path:
    import cv2
    from skimage import data

    path = tmp / "shoulders.png"
    cv2.imwrite(str(path), cv2.cvtColor(cv2.resize(data.astronaut()[0:420, 40:440], (480, 504)), cv2.COLOR_RGB2BGR))
    return path


def _sample(page) -> dict:
    s = page.evaluate("window.__facemesh") or {}
    out = {k: s.get(k) for k in (*FIELDS, "drawn", "body", "hair", "liveHands", "stains", "handPolls", "seam", "seamSlowMs", "seamWarmMs")}
    if out.get("seam") != "on":
        out["seamMs"] = None   # the page keeps its last pass time after the option stops: only count it while it runs
    out["t"] = time.time()
    try:
        out["badge_visible"] = bool(page.is_visible("#badge"))
    except Exception:
        out["badge_visible"] = False
    return out


def run(args: argparse.Namespace) -> tuple[list[dict], str, str, dict]:
    from playwright.sync_api import sync_playwright

    from realx.server import Engine, Server

    exe = _find_browser()
    if not exe:
        raise RuntimeError("set REALX_CHROMIUM to the path of chrome.exe (or another Chromium)")
    size = parse_resolution(args.resolution)
    with tempfile.TemporaryDirectory() as tmp_name:
        tmp = Path(tmp_name)
        clip = tmp / "portrait.y4m"
        write_clip(clip, size)
        photo = _photo(tmp)
        server = Server(Engine(source="demo:static", mode="body"), port=0)
        server.start()
        try:
            flags = ["--no-sandbox", *CAMERA_FLAGS, f"--use-file-for-fake-video-capture={clip}"]
            if not args.headed:
                flags += SOFTWARE_GL
            with sync_playwright() as p:
                browser = p.chromium.launch(executable_path=exe, headless=not args.headed, args=flags)
                try:
                    page = open_authenticated_page(browser, server, viewport={"width": 800, "height": 1800})
                    page.goto(f"http://127.0.0.1:{server.port}/facemesh")
                    _wait(page, "window.__facemesh && window.__facemesh.state === 'running' && window.__facemesh.found >= 5", args.startup_timeout)
                    page.set_input_files("#photoFile", str(photo))
                    _wait(page, "window.__facemesh.photo === 'asking'", args.startup_timeout)
                    # S13d: a photo that fails the photo check needs one more tick box before Allow; the bench photo is small, so it may.
                    # The check is advice only and does not change how the photo is drawn; the report records that the override was used.
                    photo_check = page.evaluate("window.__facemesh.photoQuality") or {}
                    photo_check["override_used"] = page.is_visible("#qualityOverrideRow")
                    if photo_check["override_used"]:
                        page.check("#qualityOverride")
                    page.check("#consentAttest")
                    page.click("#consentOk")
                    _wait(page, "window.__facemesh.photo === 'ready' && window.__facemesh.drawn > 0", args.startup_timeout)
                    # the renderer's name, read from the page's OWN WebGL context (a new one would cost memory and, before the page has made its
                    # own, would change how the page's context is created)
                    renderer = page.evaluate("""(() => { const g = document.getElementById('face').getContext('webgl'); if (!g) return 'no webgl';
                        const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); })()""")

                    def step(name: str, action, ready: str | None) -> dict:
                        if action:
                            action()
                        if ready:
                            _wait(page, ready, args.startup_timeout)
                        _wait(page, "window.__facemesh.drawn > 0", args.startup_timeout)   # drawing pauses while a model loads
                        time.sleep(args.settle)
                        samples = []
                        for _ in range(int(args.seconds)):
                            samples.append(_sample(page))
                            time.sleep(1.0)
                        return summarize_step(name, samples)

                    time.sleep(args.warmup)   # models loading and shaders compiling would otherwise bias the first step; nothing is sampled
                    # S13c "Clean the edges" is on by default: measure the face alone without it first, then with it, so its own cost shows
                    seam_off = "() => { const b = document.querySelector('#seamBtn'); if (b.getAttribute('aria-pressed') === 'true') b.click(); }"
                    seam_on = "() => { const b = document.querySelector('#seamBtn'); if (b.getAttribute('aria-pressed') !== 'true') b.click(); }"
                    steps = [
                        step("face only, Clean the edges off", lambda: page.evaluate(seam_off), "window.__facemesh.seam === 'off' || window.__facemesh.seam === 'too slow'"),
                        step("face only (photo on the live face; Clean the edges on, the default)", lambda: page.evaluate(seam_on),
                             "['on', 'too slow', 'unavailable'].includes(window.__facemesh.seam)"),   # 'loading' until the model is open
                        step("+ body and clothes", lambda: page.click("#bodyBtn"), "['on','nopose','nomask','error'].includes(window.__facemesh.body)"),
                        step("+ hair that moves", lambda: page.click("#hairBtn"), "['on','nohair','nomask','error'].includes(window.__facemesh.hair)"),
                        step("+ hands on top (hand model on, no hand in the clip)", lambda: page.click("#handsTop"), "window.__facemesh.liveHands === 'on' || window.__facemesh.liveHands === 'error'"),
                        step("+ a spill on the shirt", lambda: (page.select_option("#stainKind", "coffee"), page.click("#spillBtn")), "window.__facemesh.stains > 0 || window.__facemesh.body !== 'on'"),
                    ]
                    return steps, browser.version, renderer, photo_check
                finally:
                    browser.close()
        finally:
            server.stop()


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Benchmark the face-mesh page pipeline on this machine.")
    ap.add_argument("--resolution", default="640x480", help="fake-camera size, WxH, both even (default 640x480)")
    ap.add_argument("--headed", action="store_true", help="a real window with the real GPU (recommended; the default is software rendering)")
    ap.add_argument("--seconds", type=float, default=12.0, help="samples per step, one per second")
    ap.add_argument("--settle", type=float, default=6.0, help="seconds to wait after each step before sampling")
    ap.add_argument("--warmup", type=float, default=15.0, help="seconds to run the plain page before the first step, discarded")
    ap.add_argument("--startup-timeout", type=float, default=240.0)
    ap.add_argument("--json", default=None, metavar="PATH")
    args = ap.parse_args(argv)
    from realx import hardware

    contention = detect_contention()
    profile = hardware.detect()
    hw = hardware.to_dict(profile, hardware.recommend(profile))
    steps, browser_version, renderer, photo_check = run(args)
    doc = build_report({"resolution": args.resolution, "headed": bool(args.headed), "seconds": args.seconds, "browser": browser_version,
                        "photo_check": photo_check}, hw, contention, renderer, steps)
    print(f"machine: {hw['cpu']['name']}; renderer: {renderer}; representative: {doc['representative']}")
    for n in doc["notes"]:
        print("NOTE:", n)
    print(format_table(doc))
    if args.json:
        Path(args.json).write_text(json.dumps(doc, indent=2), encoding="utf-8")
        print("report written to", args.json)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
