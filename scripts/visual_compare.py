"""Side-by-side before/after PNGs from two directories made by scripts/visual_snapshot.py.

    python scripts/visual_compare.py snaps/before snaps/after --out snaps/compare

Files are matched by the part of the name after the first "_" (the label comes first), so "before_body+hair_neck.png" pairs with
"after_body+hair_neck.png". Each half carries a label text (the directory name by default; override with --left-label / --right-label).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


def pair_files(left: Path, right: Path) -> list[tuple[str, Path, Path]]:
    def key(p: Path) -> str:
        return p.name.split("_", 1)[1] if "_" in p.name else p.name

    a = {key(p): p for p in sorted(left.glob("*.png"))}
    b = {key(p): p for p in sorted(right.glob("*.png"))}
    return [(k, a[k], b[k]) for k in sorted(a.keys() & b.keys())]


def side_by_side(left, right, left_label: str, right_label: str):
    """Two BGR images joined left|right at the height of the taller one, each under a banner with its label."""
    import cv2
    import numpy as np

    h = max(left.shape[0], right.shape[0])

    def panel(img, label):
        if img.shape[0] != h:   # scale to a common height, keeping the aspect ratio
            img = cv2.resize(img, (round(img.shape[1] * h / img.shape[0]), h), interpolation=cv2.INTER_AREA)
        banner = np.full((34, img.shape[1], 3), 32, np.uint8)
        cv2.putText(banner, label, (8, 23), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1, cv2.LINE_AA)
        return np.vstack([banner, img])

    gap = np.full((h + 34, 4, 3), 255, np.uint8)
    return np.hstack([panel(left, left_label), gap, panel(right, right_label)])


def main(argv: list[str] | None = None) -> int:
    import cv2

    ap = argparse.ArgumentParser(description="Write side-by-side PNGs of two snapshot directories.")
    ap.add_argument("left", type=Path)
    ap.add_argument("right", type=Path)
    ap.add_argument("--out", type=Path, default=None, help="default: ./compare_<left>_vs_<right>")
    ap.add_argument("--left-label", default=None)
    ap.add_argument("--right-label", default=None)
    args = ap.parse_args(argv)
    for d in (args.left, args.right):
        if not d.is_dir():
            print(f"error: {d} is not a directory", file=sys.stderr)
            return 2
    out = args.out or Path(f"compare_{args.left.name}_vs_{args.right.name}")
    out.mkdir(parents=True, exist_ok=True)
    pairs = pair_files(args.left, args.right)
    if not pairs:
        print("error: no file names in common", file=sys.stderr)
        return 1
    for k, lp, rp in pairs:
        li, ri = cv2.imread(str(lp)), cv2.imread(str(rp))
        if li is None or ri is None:
            print("skipped (unreadable):", k)
            continue
        dest = out / f"compare_{k}"
        cv2.imwrite(str(dest), side_by_side(li, ri, args.left_label or args.left.name, args.right_label or args.right.name))
        print("wrote", dest)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
