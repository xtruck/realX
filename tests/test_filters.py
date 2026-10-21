import numpy as np
import pytest

from realx.filters import OneEuroFilter, ParamTimeline, average_embeddings
from realx.stages import create
from realx.types import Face, FrameContext


def test_one_euro_first_sample_passes_through_and_steady_input_is_stable():
    f = OneEuroFilter(min_cutoff=1.0, beta=0.0)
    first = f(np.array([10.0, 20.0]), 0.0)
    assert np.allclose(first, [10, 20])
    for i in range(1, 30):
        out = f(np.array([10.0, 20.0]), i / 30)
    assert np.allclose(out, [10, 20])


def test_one_euro_reduces_jitter_but_follows_fast_motion():
    rng = np.random.default_rng(1)
    noisy = 5.0 + rng.normal(0, 0.5, 300)
    f = OneEuroFilter(min_cutoff=0.5, beta=0.0)
    out = np.array([f(np.array([v]), i / 30)[0] for i, v in enumerate(noisy)])
    assert out[30:].std() < 0.5 * noisy[30:].std()

    g = OneEuroFilter(min_cutoff=0.5, beta=5.0)
    ramp = np.arange(0, 60, dtype=float)  # fast movement
    res = np.array([g(np.array([v]), i / 30)[0] for i, v in enumerate(ramp)])
    assert abs(res[-1] - ramp[-1]) < 5.0  # tracks the motion with small lag


def test_one_euro_holds_on_duplicate_timestamp_and_validates_params():
    f = OneEuroFilter()
    f(np.array([1.0]), 1.0)
    assert np.allclose(f(np.array([9.0]), 1.0), [1.0])
    with pytest.raises(ValueError):
        OneEuroFilter(min_cutoff=0)
    with pytest.raises(ValueError):
        OneEuroFilter(beta=-1)


def test_one_euro_handles_shape_change_by_restarting():
    f = OneEuroFilter()
    f(np.zeros(4), 0.0)
    assert f(np.ones(6), 0.1).shape == (6,)


def test_param_timeline_interpolates_and_clamps():
    tl = ParamTimeline({10: 0.0, 20: 1.0})
    assert tl.at(0) == 0.0
    assert tl.at(15) == pytest.approx(0.5)
    assert tl.at(99) == 1.0
    with pytest.raises(ValueError):
        ParamTimeline({})
    with pytest.raises(ValueError):
        ParamTimeline({-1: 1.0})
    with pytest.raises(ValueError):
        ParamTimeline({1: float("nan")})


def test_average_embeddings_is_unit_length_and_validates():
    a, b = np.array([1.0, 0.0]), np.array([0.0, 1.0])
    avg = average_embeddings([a, b])
    assert np.allclose(np.linalg.norm(avg), 1.0)
    assert np.allclose(avg, [2**-0.5, 2**-0.5])
    with pytest.raises(ValueError):
        average_embeddings([])
    with pytest.raises(ValueError):
        average_embeddings([np.zeros(2)])
    with pytest.raises(ValueError):
        average_embeddings([a, -a])


def _ctx(i, box, tid=1):
    c = FrameContext(pixels=np.zeros((8, 8, 3), dtype=np.uint8), index=i)
    c.faces = [Face(bbox=np.array(box, dtype=float), landmarks=np.array([[1.0, 1.0]]), track_id=tid)]
    return c


def test_one_euro_stage_smooths_per_track_and_evicts_stale():
    stage = create("one_euro", min_cutoff=0.5, beta=0.0, fps=30.0, max_age=2)
    stage.setup()
    stage.process(_ctx(0, [0, 0, 10, 10]))
    jumped = stage.process(_ctx(1, [10, 10, 20, 20]))
    assert 0 < jumped.faces[0].bbox[0] < 10  # smoothed, not a hard jump
    for i in range(2, 8):  # track 1 disappears
        stage.process(FrameContext(pixels=np.zeros((8, 8, 3), dtype=np.uint8), index=i))
    back = stage.process(_ctx(8, [100, 100, 110, 110]))
    assert np.allclose(back.faces[0].bbox, [100, 100, 110, 110])  # fresh filter, no stale blend


def test_one_euro_stage_is_marked_stateful():
    assert create("one_euro").stateful is True


def test_one_euro_backwards_timestamp_restarts_from_the_new_sample():
    f = OneEuroFilter(min_cutoff=1.0, beta=0.0)
    for i in range(5):
        f(np.array([float(i * 10)]), 1.0 + i)
    assert np.allclose(f(np.array([100.0]), 0.0), [100.0])  # clock restarted: new sample, no hold
    assert f(np.array([110.0]), 1.0)[0] > 100.0  # and it keeps filtering afterwards


def test_one_euro_stage_does_not_freeze_when_timestamps_loop():
    stage = create("one_euro", min_cutoff=2.0, beta=0.5)
    stage.setup()
    outs = []
    for _loop in range(2):
        for i in range(6):
            face = Face(bbox=np.array([i * 10.0, 0, i * 10.0 + 50, 50]), track_id=1)
            ctx = FrameContext(pixels=np.zeros((8, 8, 3), np.uint8), index=i, timestamp=(i + 1) / 30, faces=[face])
            outs.append(float(stage.process(ctx).faces[0].bbox[0]))
    second = outs[6:]
    assert second[0] == pytest.approx(0.0)
    assert len(set(round(v, 6) for v in second)) == 6  # not a held constant
    assert second[-1] > 30.0


def test_one_euro_filter_recovers_after_a_non_finite_sample():
    f = OneEuroFilter(min_cutoff=1.0, beta=0.0)
    f(np.array([1.0, 2.0]), 0.0)
    f(np.array([np.nan, 2.0]), 1 / 30)
    out = f(np.array([5.0, 6.0]), 2 / 30)
    assert np.allclose(out, [5.0, 6.0])  # restarted from the next finite sample
    assert np.all(np.isfinite(f(np.array([5.0, 6.0]), 3 / 30)))
    g = OneEuroFilter()
    g(np.array([1.0]), 0.0)
    g(np.array([2.0]), float("nan"))
    assert np.allclose(g(np.array([3.0]), 1.0), [3.0])


@pytest.mark.parametrize("name", ["one_euro", "smooth"])
@pytest.mark.parametrize("bad", [np.nan, np.inf])
def test_smoothing_stages_recover_after_one_non_finite_landmark(name, bad):
    stage = create(name)
    stage.setup()
    lm_ok = np.array([[10.0, 10.0], [20.0, 10.0], [15.0, 20.0]])
    outs = []
    for i in range(5):
        lm = lm_ok.copy()
        if i == 1:
            lm[0, 0] = bad
        face = Face(bbox=np.array([0.0, 0, 50, 50]), landmarks=lm, track_id=1)
        ctx = FrameContext(pixels=np.zeros((8, 8, 3), np.uint8), index=i, timestamp=(i + 1) / 30, faces=[face])
        outs.append(stage.process(ctx).faces[0])
    assert all(np.all(np.isfinite(f.bbox)) for f in outs)
    for f in outs[2:]:
        assert f.landmarks is not None and np.all(np.isfinite(f.landmarks))
    assert outs[1].landmarks is None  # the bad frame's landmarks were dropped


def test_tracker_drops_non_finite_or_misshapen_landmarks_but_keeps_the_face():
    from realx.tracking import FaceTracker

    t = FaceTracker()
    for i in range(4):
        lm = np.array([[10.0, 10.0], [20.0, 10.0]])
        if i == 2:
            lm[1, 1] = np.nan
        if i == 3:
            lm = np.array([1.0, 2.0, 3.0])  # wrong shape
        out = t.update([Face(bbox=np.array([0.0, 0, 50, 50]), landmarks=lm, score=0.9)])
        for f in out:
            assert f.landmarks is None or (f.landmarks.ndim == 2 and np.all(np.isfinite(f.landmarks)))
    assert len(out) == 1
