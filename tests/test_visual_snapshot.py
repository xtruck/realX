"""Pure parts of scripts/visual_snapshot.py and scripts/visual_compare.py (no browser)."""
import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import visual_compare as vc  # noqa: E402
import visual_snapshot as vs  # noqa: E402


def test_parse_variants():
    assert vs.parse_variants("base;body,hair;body,hair,soft") == [("base",), ("body", "hair"), ("body", "hair", "soft")]
    assert vs.parse_variants("body,hair  soft") == [("body", "hair"), ("soft",)]
    with pytest.raises(ValueError):
        vs.parse_variants("body,wings")
    with pytest.raises(ValueError):
        vs.parse_variants(" ")


def test_args_and_label():
    a = vs.parse_args(["--out", "x", "--label", "my branch/1"])
    assert a.label == "my-branch-1" and a.variants[0] == ("base",)
    with pytest.raises(ValueError):
        vs.safe_label("///")
    assert vs.variant_name(("body", "hair")) == "body+hair"


def test_neck_clip_unmirrored_and_mirrored():
    box = {"x": 0.3, "y": 0.1, "w": 0.2, "h": 0.3}
    canvas = {"x": 10, "y": 20, "width": 400, "height": 500}
    r = vs.neck_clip(box, canvas, False)
    assert r["x"] == pytest.approx(10 + 0.24 * 400) and r["width"] == pytest.approx(0.32 * 400)
    assert r["y"] == pytest.approx(20 + 0.28 * 500) and r["height"] == pytest.approx(0.39 * 500)
    m = vs.neck_clip(box, canvas, True)   # face centre 0.4 -> 0.6 when flipped
    assert m["x"] == pytest.approx(10 + 0.44 * 400)


def test_neck_clip_clamped_and_outside():
    r = vs.neck_clip({"x": 0.0, "y": 0.6, "w": 0.3, "h": 0.5}, {"x": 0, "y": 0, "width": 100, "height": 100}, False, (100, 100))
    assert r["x"] >= 0 and r["y"] + r["height"] <= 100 and r["x"] + r["width"] <= 100
    with pytest.raises(ValueError):
        vs.neck_clip({"x": 0.5, "y": 1.2, "w": 0.1, "h": 0.1}, {"x": 0, "y": 0, "width": 100, "height": 100}, False)


def test_compare_pairs_and_image(tmp_path):
    import cv2

    a, b = tmp_path / "a", tmp_path / "b"
    a.mkdir()
    b.mkdir()
    cv2.imwrite(str(a / "before_base_full.png"), np.zeros((50, 40, 3), np.uint8))
    cv2.imwrite(str(b / "after_base_full.png"), np.zeros((100, 80, 3), np.uint8))
    cv2.imwrite(str(b / "after_hair_full.png"), np.zeros((10, 10, 3), np.uint8))
    pairs = vc.pair_files(a, b)
    assert [k for k, _, _ in pairs] == ["base_full.png"]
    img = vc.side_by_side(cv2.imread(str(pairs[0][1])), cv2.imread(str(pairs[0][2])), "A", "B")
    assert img.shape == (134, 80 + 4 + 80, 3)
    out = tmp_path / "o"
    assert vc.main([str(a), str(b), "--out", str(out)]) == 0 and (out / "compare_base_full.png").exists()
