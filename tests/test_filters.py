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
