"""The studio controller: avatar by default, portrait behind a flag, and a safe fallback for every failure.
All engines here are fakes and all images are generated noise: no model, network, credential or real face."""

from __future__ import annotations

import threading
import time

import numpy as np
import pytest
import fake_portrait
from fake_portrait import FAKE_FILL, consent, noise_png, reset

from realx.pipeline import PipelineConfigError
from realx.stages import create
from realx.stages.builtin import Disclosure
from realx.stages import portrait as portrait_module
from realx.stages.portrait import portrait_stages
from realx.studio import (
    PORTRAIT_FLAG_ENV, DegradeReason, GuardFailure, OutputGuard, StudioController, StudioError, StudioState,
)
from realx.types import FrameContext

KEY = b"studio-test-key-0123456789abcdef"


@pytest.fixture(autouse=True)
def _allow_test_engines(monkeypatch):
    monkeypatch.setitem(portrait_module._ENGINES, "fake_portrait", fake_portrait.entry())
    monkeypatch.setenv("REALX_ALLOW_TEST_ENGINES", "1")
    monkeypatch.delenv(PORTRAIT_FLAG_ENV, raising=False)


def frame(i=0):
    return FrameContext(pixels=np.zeros((120, 160, 3), np.uint8), index=i, timestamp=i / 30)


def chain(store, record, image, engine="fake_portrait", key=KEY):
    return lambda: portrait_stages(store, record, image, "Test Host", watermark_key=key, engine=engine)


def is_avatar(out):
    return int(out.pixels.max()) == 0 and "portrait" not in out.meta


def is_portrait(out):
    return "portrait" in out.meta and int(out.pixels[:50].max()) in (FAKE_FILL, FAKE_FILL - 1, FAKE_FILL + 1)


@pytest.fixture()
def studio():
    s = StudioController([create("passthrough")], portrait_enabled=True, setup_timeout=2.0)
    s.setup()
    yield s
    s.close()


# --- defaults -----------------------------------------------------------------------------------------
def test_avatar_is_the_default_and_portrait_is_off_without_the_flag():
    s = StudioController([create("passthrough")])
    s.setup()
    try:
        st = s.status()
        assert st.state is StudioState.AVATAR and st.portrait_enabled is False
        assert is_avatar(s.process(frame()))
        store, record, image = consent()
        reset()
        with pytest.raises(StudioError, match=PORTRAIT_FLAG_ENV):
            s.enable_portrait(chain(store, record, image))
        assert s.state is StudioState.AVATAR
    finally:
        s.close()


def test_the_flag_comes_from_the_environment_only_when_set_to_one(monkeypatch):
    for value, expected in (("1", True), ("0", False), ("true", False), ("", False)):
        monkeypatch.setenv(PORTRAIT_FLAG_ENV, value)
        s = StudioController([create("passthrough")])
        assert s.status().portrait_enabled is expected, value


# --- the happy path ------------------------------------------------------------------------------------
def test_portrait_output_carries_the_label_and_the_mark(studio):
    store, record, image = consent()
    b = reset()
    assert studio.enable_portrait(chain(store, record, image), OutputGuard(KEY)).state is StudioState.PORTRAIT
    out = studio.process(frame())
    assert is_portrait(out) and out.meta["disclosure"].startswith(Disclosure.PREFIX)
    h = out.pixels.shape[0]
    bar = out.pixels[h - Disclosure.bar_height(h):]
    assert (np.abs(bar.astype(int) - Disclosure.BAR_RGB) <= 2).all(axis=-1).mean() > 0.6
    assert b.loads == 1 and b.animations == 1
    assert studio.status().portrait_frames == 1


def test_disable_returns_to_avatar_and_releases_the_engine(studio):
    store, record, image = consent()
    b = reset()
    studio.enable_portrait(chain(store, record, image), OutputGuard(KEY))
    studio.process(frame())
    assert studio.disable_portrait().state is StudioState.AVATAR
    assert b.closed.is_set() and is_avatar(studio.process(frame()))


def test_a_chain_without_the_label_is_refused_loudly_and_changes_nothing(studio):
    store, record, image = consent()
    reset()

    def no_label():
        stages = portrait_stages(store, record, image, "Test Host", watermark_key=KEY, engine="fake_portrait")
        return [s for s in stages if not getattr(s, "is_disclosure", False)]

    with pytest.raises(PipelineConfigError):
        studio.enable_portrait(no_label, OutputGuard(KEY))
    assert studio.state is StudioState.AVATAR and is_avatar(studio.process(frame()))


# --- consent -------------------------------------------------------------------------------------------
def test_revoking_consent_stops_portrait_output_on_the_next_frame_and_stays_stopped(studio):
    store, record, image = consent()
    b = reset()
    studio.enable_portrait(chain(store, record, image), OutputGuard(KEY))
    assert is_portrait(studio.process(frame(0)))
    store.revoke(record.record_id)
    out = studio.process(frame(1))
    assert is_avatar(out), "the frame after revocation is the avatar, never a portrait frame"
    st = studio.status()
    assert st.state is StudioState.DEGRADED and st.reason is DegradeReason.CONSENT and st.fallback_frames == 1
    assert b.closed.is_set(), "the engine and image are released at once"
    animations = b.animations
    for i in range(2, 8):
        assert is_avatar(studio.process(frame(i)))
    assert b.animations == animations, "the engine is never called again"
    again = studio.enable_portrait(chain(store, record, image), OutputGuard(KEY))
    assert again.state is StudioState.DEGRADED and again.reason is DegradeReason.CONSENT, "a revoked record cannot be reused"


def test_consent_that_expires_mid_stream_ends_portrait_output():
    store, record, image = consent(ttl=0.4)
    reset()
    s = StudioController([create("passthrough")], portrait_enabled=True)
    s.setup()
    try:
        s.enable_portrait(chain(store, record, image), OutputGuard(KEY))
        assert is_portrait(s.process(frame()))
        time.sleep(0.5)
        assert is_avatar(s.process(frame(1))) and s.status().reason is DegradeReason.CONSENT
    finally:
        s.close()


def test_consent_for_a_different_image_is_refused_at_start(studio):
    store, record, _image = consent()
    reset()
    st = studio.enable_portrait(chain(store, record, noise_png(seed=99)), OutputGuard(KEY))
    assert st.state is StudioState.DEGRADED and st.reason is DegradeReason.CONSENT
    assert is_avatar(studio.process(frame()))


# --- engine failures -----------------------------------------------------------------------------------
def test_an_engine_that_fails_to_load_falls_back_and_is_closed(studio):
    store, record, image = consent()
    b = reset(fail_load=RuntimeError("weights missing at C:\\secret\\path"))
    st = studio.enable_portrait(chain(store, record, image), OutputGuard(KEY))
    assert st.state is StudioState.DEGRADED and st.reason is DegradeReason.ENGINE_ERROR
    assert "secret" not in st.detail and st.detail == "RuntimeError", "only the exception class is kept"
    assert b.closed.is_set() and is_avatar(studio.process(frame()))


def test_an_engine_that_fails_mid_stream_gives_the_avatar_for_that_same_frame(studio):
    store, record, image = consent()
    b = reset(fail_animate_at=3)
    studio.enable_portrait(chain(store, record, image), OutputGuard(KEY))
    outs = [studio.process(frame(i)) for i in range(5)]
    assert [is_portrait(o) for o in outs[:2]] == [True, True]
    assert all(is_avatar(o) for o in outs[2:]), "the failing frame and every later one are the avatar"
    assert studio.status().reason is DegradeReason.ENGINE_ERROR and b.closed.is_set()


def test_an_engine_returning_garbage_is_not_emitted(studio):
    store, record, image = consent()
    reset(bad_output=True)
    studio.enable_portrait(chain(store, record, image), OutputGuard(KEY))
    assert is_avatar(studio.process(frame()))
    assert studio.status().reason is DegradeReason.ENGINE_ERROR


def test_a_memory_or_os_failure_is_a_resource_failure(studio):
    store, record, image = consent()
    reset(fail_animate_at=1, animate_error=MemoryError())
    studio.enable_portrait(chain(store, record, image), OutputGuard(KEY))
    assert is_avatar(studio.process(frame()))
    assert studio.status().reason is DegradeReason.RESOURCE


def test_an_unknown_missing_or_blocked_engine_is_unavailable_not_a_crash(studio, monkeypatch):
    store, record, image = consent()
    reset()
    monkeypatch.setitem(portrait_module._ENGINES, "blocked_by_model", {"factory": lambda: None, "model": "liveportrait", "test_only": False})
    for name in ("no_such_engine", "liveportrait", "blocked_by_model"):
        st = studio.enable_portrait(chain(store, record, image, engine=name), OutputGuard(KEY))
        assert st.state is StudioState.DEGRADED and st.reason is DegradeReason.UNAVAILABLE, name
        assert is_avatar(studio.process(frame()))


def test_a_stuck_engine_times_out_without_freezing_the_video_and_is_cleaned_up_later():
    store, record, image = consent()
    release = threading.Event()
    b = reset(block_load=release)
    s = StudioController([create("passthrough")], portrait_enabled=True, setup_timeout=0.3)
    s.setup()
    try:
        started = time.perf_counter()
        st = s.enable_portrait(chain(store, record, image), OutputGuard(KEY))
        assert time.perf_counter() - started < 2
        assert st.state is StudioState.DEGRADED and st.reason is DegradeReason.ENGINE_TIMEOUT
        assert is_avatar(s.process(frame()))
        release.set()  # the stuck engine finally returns: whatever it built is closed, not leaked
        assert b.closed.wait(3)
        assert s.state is StudioState.DEGRADED, "and it does not sneak into portrait mode"
    finally:
        release.set()
        s.close()


def test_sustained_slowness_degrades_after_the_configured_number_of_frames():
    store, record, image = consent()
    reset(animate_seconds=0.03)
    s = StudioController([create("passthrough")], portrait_enabled=True, slow_frame_s=0.01, slow_frames_to_degrade=3)
    s.setup()
    try:
        s.enable_portrait(chain(store, record, image), OutputGuard(KEY))
        outs = [s.process(frame(i)) for i in range(5)]
        assert [is_portrait(o) for o in outs] == [True, True, True, False, False]
        assert s.status().reason is DegradeReason.TOO_SLOW
    finally:
        s.close()


# --- the output guard ----------------------------------------------------------------------------------
def test_a_frame_the_guard_cannot_verify_is_never_emitted(studio):
    store, record, image = consent()
    reset()
    studio.enable_portrait(chain(store, record, image, key=KEY), OutputGuard(b"another-key-0123456789abcdef-xx"))
    out = studio.process(frame())
    assert is_avatar(out)
    assert studio.status().reason is DegradeReason.OUTPUT_GUARD


def _good_frame():
    store, record, image = consent()
    reset()
    from realx.pipeline import Pipeline

    with Pipeline(portrait_stages(store, record, image, "Test Host", watermark_key=KEY, engine="fake_portrait"), strict=True) as p:
        return p.process(frame())


def test_guard_accepts_a_correct_frame_and_names_each_way_a_frame_can_be_wrong():
    good = _good_frame()
    OutputGuard(KEY).check(good)

    def altered(**changes):
        px = changes.pop("pixels", good.pixels)
        dropped = changes.pop("drop", ())
        meta = {k: v for k, v in good.meta.items() if k not in dropped}
        return FrameContext(pixels=px, index=0, timestamp=0.0, meta=meta)

    with pytest.raises(GuardFailure, match="portrait stage"):
        OutputGuard(KEY).check(altered(drop=("portrait",)))
    with pytest.raises(GuardFailure, match="no disclosure"):
        OutputGuard(KEY).check(altered(drop=("disclosure",)))
    covered = good.pixels.copy()
    covered[-30:] = FAKE_FILL  # something painted over the label bar
    with pytest.raises(GuardFailure, match="bar is not visible"):
        OutputGuard(KEY).check(altered(pixels=covered))
    unmarked = good.pixels.copy()
    unmarked.reshape(-1)[:600] &= 0xFE  # the mark's bits cleared
    with pytest.raises(GuardFailure, match="mark is missing"):
        OutputGuard(KEY).check(altered(pixels=unmarked))
    with pytest.raises(GuardFailure, match="mark is missing"):
        OutputGuard(b"wrong-key-0123456789abcdef-wrong-").check(good)


# --- lifecycle -----------------------------------------------------------------------------------------
def test_shutdown_is_ordered_idempotent_and_final(monkeypatch):
    store, record, image = consent()
    b = reset()
    closed = []
    from realx.pipeline import Pipeline

    original = Pipeline.close

    def spy(self):
        closed.append("portrait" if any(getattr(st, "name", "") == "portrait_animate" for st in self.stages) else "avatar")
        return original(self)

    monkeypatch.setattr(Pipeline, "close", spy)
    s = StudioController([create("passthrough")], portrait_enabled=True)
    s.setup()
    s.enable_portrait(chain(store, record, image), OutputGuard(KEY))
    s.close()
    s.close()
    assert closed == ["portrait", "avatar"] and b.closed.is_set()
    with pytest.raises(StudioError):
        s.process(frame())
    with pytest.raises(StudioError):
        s.enable_portrait(chain(store, record, image))


def test_enable_before_setup_is_an_error():
    s = StudioController([create("passthrough")], portrait_enabled=True)
    store, record, image = consent()
    reset()
    with pytest.raises(StudioError, match="set the studio up"):
        s.enable_portrait(chain(store, record, image))


def test_frames_stay_consistent_while_another_thread_switches_modes(studio):
    store, record, image = consent()
    reset()
    errors, stop = [], threading.Event()

    def worker():
        try:
            for i in range(300):
                out = studio.process(frame(i))
                assert is_avatar(out) or is_portrait(out)
        except Exception as exc:  # pragma: no cover - reported below
            errors.append(exc)
        finally:
            stop.set()

    t = threading.Thread(target=worker)
    t.start()
    while not stop.is_set():
        studio.enable_portrait(chain(store, record, image), OutputGuard(KEY))
        studio.disable_portrait()
    t.join()
    assert not errors, errors
    studio.disable_portrait()
    assert is_avatar(studio.process(frame())), "after disable returns, no frame is a portrait frame"


# --- the engine integration -----------------------------------------------------------------------------
def test_the_engine_reports_avatar_state_and_runs_through_the_controller():
    pytest.importorskip("cv2")
    from realx.server import Engine

    engine = Engine(source="demo:static", mode="original")
    engine.start()
    try:
        end = time.time() + 15
        while time.time() < end and engine.stats()["frames"] < 3:
            time.sleep(0.05)
        studio = engine.stats()["studio"]
        assert studio["state"] == "AVATAR" and studio["portrait_enabled"] is False
        assert engine.stats()["frames"] >= 3
    finally:
        engine.stop()
