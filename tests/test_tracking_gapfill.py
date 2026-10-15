import numpy as np
import pytest

from realx.tracking import FaceTracker, InterpolatedFace, fill_track_gaps, is_interpolated
from realx.types import Face


def face(tid, x, y=100.0, s=100.0, **kw):
    return Face(bbox=np.array([x, y, x + s, y + s], dtype=float), track_id=tid, **kw)


def clip(n, tracks):
    """tracks: {tid: {frame: (x, y, s)}} -> list of per-frame faces."""
    frames = [[] for _ in range(n)]
    for tid, per in tracks.items():
        for i, (x, y, s) in per.items():
            frames[i].append(face(tid, x, y, s))
    return frames


def line(present, x0=100.0, step=10.0):
    return {i: (x0 + step * i, 100.0, 100.0) for i in present}


@pytest.mark.parametrize("gap", [1, 2, 3, 4, 5])
def test_gaps_up_to_five_are_filled_linearly(gap):
    n = gap + 2
    out = fill_track_gaps(clip(n, {1: line([0, n - 1])}))
    for i in range(1, n - 1):
        (f,) = out[i]
        assert is_interpolated(f) and f.track_id == 1
        assert f.bbox[0] == pytest.approx(100 + 10 * i)  # exact on a straight line


def test_gap_longer_than_max_is_left_empty():
    out = fill_track_gaps(clip(8, {1: line([0, 7])}))
    assert all(out[i] == [] for i in range(1, 7))


def test_max_gap_is_configurable():
    frames = clip(10, {1: line([0, 9])})
    assert all(len(o) == 1 for o in fill_track_gaps(frames, max_gap=8)[1:9])
    assert all(o == [] for o in fill_track_gaps(frames, max_gap=3)[1:9])


def test_flags_and_detected_faces_stay_unflagged():
    out = fill_track_gaps(clip(4, {1: line([0, 3])}))
    assert not is_interpolated(out[0][0]) and not is_interpolated(out[3][0])
    f = out[1][0]
    assert isinstance(f, InterpolatedFace) and f.interpolated and not f.predicted


def test_input_not_mutated():
    frames = clip(4, {1: line([0, 3])})
    before = [[f.bbox.copy() for f in fr] for fr in frames]
    out = fill_track_gaps(frames)
    assert [len(fr) for fr in frames] == [1, 0, 0, 1]
    assert out is not frames and out[0] is not frames[0]
    for fr, bb in zip(frames, before):
        for f, b in zip(fr, bb):
            assert np.array_equal(f.bbox, b)


def test_size_jump_not_bridged():
    frames = clip(4, {1: {0: (100, 100, 100), 3: (130, 100, 200)}})
    assert fill_track_gaps(frames)[1:3] == [[], []]


def test_big_position_jump_not_bridged():
    frames = clip(4, {1: {0: (0, 100, 100), 3: (900, 100, 100)}})
    assert fill_track_gaps(frames)[1:3] == [[], []]


def test_crossing_tracks_not_merged_or_filled_through_other_face():
    # track 1 goes right, track 2 goes left; track 1 vanishes while they overlap
    frames = clip(
        7,
        {
            1: {0: (0, 100, 100), 6: (300, 100, 100)},
            2: {i: (300 - 50 * i, 100, 100) for i in range(7)},
        },
    )
    out = fill_track_gaps(frames)
    for i in range(1, 6):
        assert [f.track_id for f in out[i]] == [2]  # nothing invented for track 1
    assert {f.track_id for fr in out for f in fr} == {1, 2}


def test_gap_filled_when_other_track_is_far_away():
    frames = clip(5, {1: line([0, 4]), 2: {i: (800, 400, 100) for i in range(5)}})
    out = fill_track_gaps(frames)
    assert [sorted(f.track_id for f in fr) for fr in out[1:4]] == [[1, 2]] * 3


def test_landmarks_interpolated_and_score_is_weaker_end():
    a = face(1, 0, landmarks=np.zeros((5, 2)), score=0.9)
    b = face(1, 20, landmarks=np.full((5, 2), 20.0), score=0.6)
    f = fill_track_gaps([[a], [], [b]])[1][0]
    assert np.allclose(f.landmarks, 10.0) and f.score == 0.6
    # landmarks missing at one end -> none invented
    assert fill_track_gaps([[a], [], [face(1, 20)]])[1][0].landmarks is None


def test_predicted_face_replaced_and_not_used_as_end():
    pred = face(1, 110, predicted=True)
    frames = [[face(1, 100)], [pred], [face(1, 120)]]
    out = fill_track_gaps(frames)
    assert len(out[1]) == 1 and is_interpolated(out[1][0]) and not out[1][0].predicted
    assert frames[1][0] is pred  # input untouched
    frames = [[face(1, 100)], [], [face(1, 120, predicted=True)]]
    assert fill_track_gaps(frames)[1] == []


def test_untracked_faces_kept_and_block_overlap():
    loose = Face(bbox=np.array([105.0, 100, 205, 200]))
    out = fill_track_gaps([[face(1, 100)], [loose], [face(1, 120)]])
    assert out[1] == [loose]


def test_live_tracker_never_interpolates():
    t = FaceTracker()
    for i in range(10):
        dets = [] if i in (4, 5) else [face(None, 100 + 5 * i)]
        for f in t.update(dets):
            assert not is_interpolated(f)
