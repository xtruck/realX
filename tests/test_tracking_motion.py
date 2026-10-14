import sys
from pathlib import Path

import numpy as np
import pytest

from realx.models import ModelError, ensure_model
from realx.tracking import FaceTracker, iou
from realx.types import Face

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))


def det(x, y, s=100.0, score=0.9):
    return Face(bbox=np.array([x, y, x + s, y + s], dtype=float), score=score)


# --- tracker unit tests (no model needed) --------------------------------------
def test_iou_basics():
    a = np.array([0, 0, 10, 10.0])
    assert iou(a, a) == 1.0
    assert iou(a, np.array([20, 20, 30, 30.0])) == 0.0
    assert iou(a, np.array([5, 0, 15, 10.0])) == pytest.approx(1 / 3)


def test_tracker_keeps_id_through_large_jumps():
    t = FaceTracker()
    ids = set()
    for i in range(30):
        # 70 px per frame (0.7 box widths) bouncing left and right like a sprint
        phase = (i * 70) % 800
        x = 100 + (phase if phase <= 400 else 800 - phase)
        for f in t.update([det(x, 100 + 40 * (i % 2))]):
            ids.add(f.track_id)
    assert len(ids) == 1


def test_tracker_coasts_through_dropout_then_recovers_same_id():
    t = FaceTracker(min_hits=2)
    first = None
    for i in range(6):
        out = t.update([det(100 + 20 * i, 100)])
        first = out[0].track_id if out else first
    coasted = [t.update([]) for _ in range(4)]
    assert all(c and c[0].predicted and c[0].track_id == first for c in coasted)
    back = t.update([det(100 + 20 * 11, 100)])
    assert back and back[0].track_id == first and not back[0].predicted


def test_tracker_coast_is_bounded_and_track_expires():
    t = FaceTracker(max_lost=5, max_predict=3)
    for i in range(5):
        t.update([det(100 + 80 * i, 100)])
    start = t.update([det(100 + 80 * 5, 100)])[0].bbox[0]
    for _ in range(3):
        last = t.update([])
    assert abs(last[0].bbox[0] - start) <= 1.6 * 100  # never flies off
    assert t.update([]) == []  # beyond max_predict nothing is reported
    for _ in range(10):
        t.update([])
    new = t.update([det(300, 300)]) + t.update([det(300, 300)])
    assert new and new[0].track_id > 1  # expired track is not resurrected


def test_two_faces_keep_separate_ids_when_crossing_paths():
    t = FaceTracker()
    ids_a, ids_b = set(), set()
    for i in range(40):
        a = det(50 + 10 * i, 100)
        b = det(450 - 10 * i, 140)
        out = t.update([a, b])
        for f in out:
            (ids_a if f.bbox[1] < 120 else ids_b).add(f.track_id)
    assert len(ids_a) == 1 and len(ids_b) == 1 and ids_a != ids_b


def test_low_score_detection_keeps_track_but_cannot_start_one():
    t = FaceTracker(new_track_score=0.6)
    assert t.update([det(50, 50, score=0.4)]) == []  # no ghost face from noise
    for i in range(4):
        t.update([det(50 + 5 * i, 50, score=0.9)])
    out = t.update([det(70, 50, score=0.4)])  # blurred but plausible
    assert out and not out[0].predicted


def test_motion_hints_beat_linear_coasting_when_the_face_accelerates():
    def run(use_hints):
        t = FaceTracker(min_hits=2)
        x = 100.0
        for v in (10, 10, 10):  # steady, then the detector loses the face
            x += v
            t.update([det(x, 100)])
        errors = []
        speed = 10.0
        for _ in range(4):
            speed += 15.0  # the person suddenly speeds up (a jump or a dance step)
            x += speed
            hint = {1: np.array([speed, 0.0])} if use_hints else None
            out = t.update([], hints=hint)
            errors.append(abs(out[0].bbox[0] - x))
        return max(errors)

    assert run(True) < 0.25 * run(False)


def test_corrupt_detections_never_become_tracks():
    t = FaceTracker()
    nan_box = Face(bbox=np.array([np.nan, 0, 10, 10.0]), score=0.99)
    flat = Face(bbox=np.array([5, 5, 5, 20.0]), score=0.99)
    inf_score = Face(bbox=np.array([0, 0, 10, 10.0]), score=float("inf"))
    for _ in range(4):
        assert t.update([nan_box, flat, inf_score], dt=float("nan")) == []


def test_duplicate_box_on_the_same_face_does_not_make_a_second_id():
    t = FaceTracker()
    for _ in range(3):
        out = t.update([det(100, 100, 100, 0.95), det(104, 102, 100, 0.90)])
    assert len(out) == 1


def test_ids_are_never_reused_after_reset():
    t = FaceTracker()
    first = [f.track_id for _ in range(3) for f in t.update([det(50, 50)])][-1]
    t.reset()
    second = [f.track_id for _ in range(3) for f in t.update([det(50, 50)])][-1]
    assert second > first


def test_one_frame_noise_blip_does_not_survive_or_steal_a_face():
    t = FaceTracker()
    t.update([det(300, 300, 60, 0.9)])  # single sighting: tentative
    t.update([])  # missed once, so it is discarded as noise
    for i in range(3):
        out = t.update([det(300 + 4 * i, 300, 60, 0.9)])
    assert out and out[0].track_id == 2  # a fresh track, not the blip


def test_blocked_and_unknown_models_are_refused():
    with pytest.raises(ModelError):
        ensure_model("inswapper_128")
    with pytest.raises(ModelError):
        ensure_model("does-not-exist")


# --- end to end with the real detector -------------------------------------------
@pytest.fixture(scope="module")
def detector_ready():
    try:
        ensure_model("yunet")
    except Exception as exc:  # offline CI
        pytest.skip(f"yunet model unavailable: {exc}")
    pytest.importorskip("cv2")
    pytest.importorskip("skimage")


@pytest.mark.parametrize("motion", ["dance", "jump", "sprint", "spin"])
def test_fast_motion_with_blur_and_noise_stays_locked(detector_ready, motion):
    from motion_check import run

    r = run(motion, frames=90, degrade=1.0)
    assert r["ids"] == 1, f"identity switched under {motion}"
    assert r["coverage"] >= 0.85
    assert r["median_err_px"] < 25


@pytest.mark.parametrize("motion", ["dance", "sprint"])
def test_dropped_frames_do_not_spawn_ghost_faces(detector_ready, motion):
    """A slow machine skips frames; the face then jumps far between processed frames."""
    from realx.pipeline import Pipeline
    from realx.sources import SyntheticScene
    from realx.stages import create

    scene = SyntheticScene(motion, degrade=0.6)
    seen_ids: set[int] = set()
    ghost_frames = 0
    rng = np.random.default_rng(3)
    stages = [create("detect_yunet", score_threshold=0.3), create("track"), create("one_euro")]
    index = 0
    with Pipeline(stages) as pipe:
        for _ in range(70):
            index += int(rng.integers(1, 14))  # a loaded machine skips 0 to 12 frames
            out = pipe.process(scene.render(index))
            seen_ids.update(f.track_id for f in out.faces)
            ghost_frames += len(out.faces) > 1
    assert ghost_frames == 0, "duplicate faces appeared after large jumps"
    assert len(seen_ids) == 1


def test_clean_motion_is_precise(detector_ready):
    from motion_check import run

    r = run("dance", frames=60, degrade=0.0)
    assert r["coverage"] >= 0.95 and r["ids"] == 1
    assert r["median_err_px"] < 15
