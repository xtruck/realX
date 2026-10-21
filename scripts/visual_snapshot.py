"""Repeatable picture of the face-mesh page, for judging photorealism changes (neck, hair halo, body seams, soft edges) by eye.

It starts the real server, plays the astronaut clip as the fake camera, opens /facemesh in a HEADED Chrome (Playwright only: no remote
debugging port), chooses a photo with the consent step, then for each option set in --variants switches the options on, waits until the
picture is drawn and saves two PNGs into --out:
    <label>_<variant>_full.png  the whole preview (the drawn canvas)
    <label>_<variant>_neck.png  a 4x zoom on the neck / chin area, placed from the page's own window.__facemesh.box

    $env:REALX_CHROMIUM = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    python scripts/visual_snapshot.py --out snaps/before --label before --variants "base;body,hair;body,hair,soft"

Variants are separated by ";" or spaces; options inside one variant by ",". Options: base (nothing extra), body, hair, soft.
Compare two runs with scripts/visual_compare.py.
"""

from __future__ import annotations

import argparse
import re
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

OPTIONS = ("base", "body", "hair", "soft")
# The viewport is tall on purpose: the page PAUSES drawing while its "Virtual face" label is outside the window, so a short
# window would give a frozen or empty picture.
VIEWPORT = {"width": 800, "height": 1800}
ZOOM = 4


def parse_variants(text: str) -> list[tuple[str, ...]]:
    """'base;body,hair' -> [('base',), ('body', 'hair')]. Unknown options raise ValueError; 'base' alone means no options."""
    out: list[tuple[str, ...]] = []
    for chunk in re.split(r"[;\s]+", text.strip()):
        if not chunk:
            continue
        opts = tuple(o.strip().lower() for o in chunk.split(",") if o.strip())
        bad = [o for o in opts if o not in OPTIONS]
        if bad:
            raise ValueError(f"unknown option {bad[0]!r}; choose from {', '.join(OPTIONS)}")
        out.append(tuple(o for o in opts if o != "base") or ("base",))
    if not out:
        raise ValueError("no variants given")
    return out


def variant_name(opts: tuple[str, ...]) -> str:
    return "+".join(opts)


def safe_label(label: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_.-]+", "-", label.strip()).strip("-")
    if not cleaned:
        raise ValueError("--label must contain letters or digits")
    return cleaned


def neck_clip(box: dict, canvas: dict, mirrored: bool, page_size: tuple[int, int] | None = None) -> dict:
    """Page-pixel rectangle {x, y, width, height} around the neck/chin.

    box: window.__facemesh.box, fractions of the camera frame {x, y, w, h} (x measured in the unmirrored frame).
    canvas: the drawn canvas' bounding rect on the page {x, y, width, height}.
    mirrored: the stage is flipped with CSS (selfie view), so the fraction x runs from the right edge.
    The rectangle spans 1.6 face widths, from the mouth line (60% down the face box) to 0.9 face heights below the chin, clamped to the canvas.
    """
    bx, by, bw, bh = (float(box[k]) for k in ("x", "y", "w", "h"))
    if mirrored:
        bx = 1.0 - bx - bw
    cx = bx + bw / 2
    half = 0.8 * bw
    x0, x1 = max(0.0, cx - half), min(1.0, cx + half)
    y0, y1 = min(1.0, by + 0.6 * bh), min(1.0, by + bh + 0.9 * bh)
    if x1 <= x0 or y1 <= y0:
        raise ValueError("face box lies outside the frame")
    rect = {"x": canvas["x"] + x0 * canvas["width"], "y": canvas["y"] + y0 * canvas["height"],
            "width": (x1 - x0) * canvas["width"], "height": (y1 - y0) * canvas["height"]}
    if page_size:
        rect["x"] = max(0.0, rect["x"])
        rect["y"] = max(0.0, rect["y"])
        rect["width"] = min(rect["width"], page_size[0] - rect["x"])
        rect["height"] = min(rect["height"], page_size[1] - rect["y"])
    return rect


def build_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(description="Save PNG crops of the face-mesh page for before/after comparison.")
    ap.add_argument("--out", required=True, type=Path, help="directory for the PNGs (created)")
    ap.add_argument("--label", default="snap", help="start of every file name (e.g. the branch name)")
    ap.add_argument("--variants", default="base;body,hair;body,hair,soft",
                    help='option sets separated by ";": options base, body, hair, soft, joined with ","')
    ap.add_argument("--resolution", default="640x480", help="fake-camera size WxH (default 640x480)")
    ap.add_argument("--settle", type=float, default=6.0, help="seconds to let each variant draw before the shot")
    ap.add_argument("--startup-timeout", type=float, default=240.0)
    return ap


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    args = build_parser().parse_args(argv)
    args.variants = parse_variants(args.variants)
    args.label = safe_label(args.label)
    return args


def _save_zoom(png: bytes, path: Path) -> None:
    import cv2
    import numpy as np

    img = cv2.imdecode(np.frombuffer(png, np.uint8), cv2.IMREAD_COLOR)
    cv2.imwrite(str(path), cv2.resize(img, None, fx=ZOOM, fy=ZOOM, interpolation=cv2.INTER_CUBIC))


def run(args: argparse.Namespace) -> list[Path]:
    from playwright.sync_api import sync_playwright

    from bench_facemesh import _photo, _wait
    from bench_tracking import CAMERA_FLAGS, _find_browser, open_authenticated_page, parse_resolution, write_clip
    from realx.server import Engine, Server

    exe = _find_browser()
    if not exe:
        raise RuntimeError("set REALX_CHROMIUM to the path of chrome.exe (or another Chromium)")
    args.out.mkdir(parents=True, exist_ok=True)
    saved: list[Path] = []
    with tempfile.TemporaryDirectory() as tmp_name:
        tmp = Path(tmp_name)
        clip = tmp / "portrait.y4m"
        write_clip(clip, parse_resolution(args.resolution))
        photo = _photo(tmp)
        server = Server(Engine(source="demo:static", mode="body"), port=0)
        server.start()
        try:
            flags = ["--no-sandbox", *CAMERA_FLAGS, f"--use-file-for-fake-video-capture={clip}"]
            with sync_playwright() as p:
                browser = p.chromium.launch(executable_path=exe, headless=False, args=flags)
                try:
                    page = open_authenticated_page(browser, server, viewport=VIEWPORT)
                    page.goto(f"http://127.0.0.1:{server.port}/facemesh")
                    t = args.startup_timeout
                    _wait(page, "window.__facemesh && window.__facemesh.state === 'running' && window.__facemesh.found >= 5", t)
                    page.set_input_files("#photoFile", str(photo))
                    _wait(page, "window.__facemesh.photo === 'asking'", t)
                    if page.is_visible("#qualityOverrideRow"):
                        page.check("#qualityOverride")
                    page.check("#consentAttest")
                    page.click("#consentOk")
                    _wait(page, "window.__facemesh.photo === 'ready' && window.__facemesh.drawn > 0", t)
                    time.sleep(args.settle)
                    on: set[str] = set()
                    buttons = {"body": ("#bodyBtn", "['on','nopose','nomask','error'].includes(window.__facemesh.body)"),
                               "hair": ("#hairBtn", "['on','nohair','nomask','error'].includes(window.__facemesh.hair)"),
                               "soft": ("#softBtn", None)}
                    for opts in args.variants:
                        want = {o for o in opts if o != "base"}
                        for name in sorted(on - want):   # switch off what this variant does not use
                            page.click(buttons[name][0])
                            on.discard(name)
                        for name in sorted(want - on):
                            sel, ready = buttons[name]
                            page.click(sel)
                            on.add(name)
                            if ready:
                                _wait(page, ready, t)
                        _wait(page, "window.__facemesh.drawn > 0", t)   # drawing pauses while a model loads
                        time.sleep(args.settle)
                        _wait(page, "window.__facemesh.box", t)
                        box = page.evaluate("window.__facemesh.box")
                        canvas = page.evaluate("(() => { const r = document.getElementById('face').getBoundingClientRect(); "
                                               "return {x: r.x, y: r.y, width: r.width, height: r.height}; })()")
                        mirrored = bool(page.evaluate("document.getElementById('stage').classList.contains('mirror')"))
                        base = args.out / f"{args.label}_{variant_name(opts)}"
                        full = Path(f"{base}_full.png")
                        page.screenshot(path=str(full), clip=canvas)
                        neck = Path(f"{base}_neck.png")
                        rect = neck_clip(box, canvas, mirrored, (VIEWPORT["width"], VIEWPORT["height"]))
                        _save_zoom(page.screenshot(clip=rect), neck)   # 4x by upscaling the crop (cubic)
                        saved += [full, neck]
                        print("saved", full, neck)
                finally:
                    browser.close()
        finally:
            server.stop()
    return saved


def main(argv: list[str] | None = None) -> int:
    try:
        args = parse_args(argv)
    except ValueError as e:
        print("error:", e, file=sys.stderr)
        return 2
    run(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
