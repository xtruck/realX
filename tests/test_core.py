import math
import time

import numpy as np
import pytest

from realx.cli import main as cli_main
from realx.pipeline import Pipeline, PipelineConfigError, run_stream
from realx.runtime import pick_providers
from realx.safety import ConsentError, ConsentRecord, ConsentStore, watermark
from realx.stages import available, create
from realx.types import Face, FrameContext

KEY = bytes(range(1, 33))
OTHER_KEY = bytes(range(33, 65))


def frame(i=0, size=64):
    return FrameContext(pixels=np.full((size, size, 3), 100, dtype=np.uint8), index=i)


def store():
    return ConsentStore(KEY)


def safe_pipeline(st, identity="alice", wm_key=None, scope="live"):
    rec = st.issue(identity, scope, ttl_seconds=60)
    return Pipeline(
        [
            create("consent_gate", store=st, record=rec, scope=scope),
            create("swap_stub", source_identity=identity),
            create("watermark", payload=b"realx|s1", key=wm_key),
        ]
    )


# --- types / registry -----------------------------------------------------
def test_frame_rejects_bad_shape_and_dtype():
    with pytest.raises(ValueError):
        FrameContext(pixels=np.zeros((4, 4), dtype=np.uint8))
    with pytest.raises(ValueError):
        FrameContext(pixels=np.zeros((4, 4, 3), dtype=np.float32))


def test_builtin_stages_registered_and_unknown_fails():
    assert {"passthrough", "smooth", "consent_gate", "swap_stub", "watermark"} <= set(available())
    with pytest.raises(KeyError):
        create("nope")


# --- consent --------------------------------------------------------------
def test_consent_valid_expired_scope_and_tampered():
    st = store()
    rec = st.issue("alice", "live", ttl_seconds=60, now=1000.0)
    st.verify(rec, "live", now=1030.0)
    with pytest.raises(ConsentError):
        st.verify(rec, "live", now=1061.0)
    with pytest.raises(ConsentError):
        st.verify(rec, "export", now=1030.0)
    forged = ConsentRecord(rec.subject_id, rec.scope, rec.expires_at + 9999, rec.record_id, rec.key_id, rec.signature)
    with pytest.raises(ConsentError):
        st.verify(forged, "live", now=1030.0)


def test_consent_rejects_other_key_revoked_and_malformed_signature():
    st = store()
    other = ConsentStore(OTHER_KEY)
    with pytest.raises(ConsentError):
        st.verify(other.issue("mallory", "live", ttl_seconds=60), "live")
    rec = st.issue("alice", "live", ttl_seconds=60)
    st.revoke(rec.record_id)
    with pytest.raises(ConsentError):
        st.verify(rec, "live")
    fresh = st.issue("alice", "live", ttl_seconds=60)
    bad = ConsentRecord(fresh.subject_id, fresh.scope, fresh.expires_at, fresh.record_id, fresh.key_id, "é" * 64)
    with pytest.raises(ConsentError):
        st.verify(bad, "live")


def test_consent_issue_validates_inputs_and_key():
    st = store()
    for ttl in (math.nan, math.inf, -1.0, 0.0):
        with pytest.raises(ValueError):
            st.issue("alice", "live", ttl_seconds=ttl)
    with pytest.raises(ValueError):
        st.issue("alice", "bogus", ttl_seconds=10)
    with pytest.raises(ValueError):
        ConsentStore(b"short")
    with pytest.raises(ValueError):
        ConsentStore(b"A" * 32)
    assert "secret" not in repr(st).lower()


def test_each_issued_record_is_unique():
    st = store()
    a, b = st.issue("alice", "live", 60), st.issue("alice", "live", 60)
    assert a.record_id != b.record_id


# --- safety ordering --------------------------------------------------------
def test_swap_without_gate_is_refused_at_build_time():
    with pytest.raises(PipelineConfigError):
        Pipeline([create("swap_stub", source_identity="alice"), create("watermark", payload=b"x")])


def test_swap_before_gate_is_refused():
    st = store()
    rec = st.issue("alice", "live", 60)
    with pytest.raises(PipelineConfigError):
        Pipeline(
            [
                create("swap_stub", source_identity="alice"),
                create("consent_gate", store=st, record=rec),
                create("watermark", payload=b"x"),
            ]
        )


def test_swap_without_watermark_after_it_is_refused():
    st = store()
    rec = st.issue("alice", "live", 60)
    with pytest.raises(PipelineConfigError):
        Pipeline([create("consent_gate", store=st, record=rec), create("swap_stub", source_identity="alice")])


def test_gated_swap_runs_and_is_watermarked_with_authentic_tag():
    st = store()
    with safe_pipeline(st, wm_key=KEY) as pipe:
        out = pipe.process(frame())
    assert out.meta["swapped_with"] == "alice"
    assert watermark.extract(out.pixels, key=KEY) == b"realx|s1"
    assert watermark.extract(out.pixels, key=OTHER_KEY) is None


def test_consent_for_one_identity_does_not_cover_another():
    st = store()
    rec = st.issue("alice", "live", 60)
    pipe = Pipeline(
        [
            create("consent_gate", store=st, record=rec),
            create("swap_stub", source_identity="victim"),
            create("watermark", payload=b"x"),
        ]
    )
    with pipe:
        with pytest.raises(ConsentError):
            pipe.process(frame())


def test_forged_meta_string_does_not_pass_the_gate():
    stage = create("swap_stub", source_identity="alice")
    ctx = frame()
    ctx.meta["consent_token"] = "granted"
    ctx.meta["consent_subject"] = "alice"
    with pytest.raises(ConsentError):
        stage.process(ctx)


def test_expired_consent_blocks_pipeline_setup():
    st = store()
    rec = st.issue("alice", "live", ttl_seconds=0.01)
    time.sleep(0.05)
    pipe = Pipeline([create("consent_gate", store=st, record=rec)])
    with pytest.raises(ConsentError):
        pipe.setup()


def test_failed_setup_closes_already_started_stages():
    closed = []

    class Probe:
        name = "probe"

        def setup(self): ...
        def process(self, ctx):
            return ctx

        def close(self):
            closed.append(True)

    st = store()
    expired = st.issue("alice", "live", ttl_seconds=0.01)
    time.sleep(0.05)
    pipe = Pipeline([Probe(), create("consent_gate", store=st, record=expired)])
    with pytest.raises(ConsentError):
        pipe.setup()
    assert closed == [True]


# --- pipeline / streaming ---------------------------------------------------
def test_pipeline_requires_setup_and_records_timings():
    pipe = Pipeline([create("passthrough")])
    with pytest.raises(RuntimeError):
        pipe.process(frame())
    with pipe:
        pipe.process(frame())
    assert pipe.timings["passthrough"].calls == 1


def test_run_stream_keeps_order_and_counts_every_frame():
    with Pipeline([create("passthrough")]) as pipe:
        out = list(run_stream(pipe, (frame(i) for i in range(20)), workers=1, max_in_flight=20))
    assert [c.index for c in out] == list(range(20))


def test_run_stream_reports_drops_and_accounts_for_all_frames():
    class Slow:
        name = "slow"

        def setup(self): ...
        def process(self, ctx):
            time.sleep(0.01)
            return ctx

        def close(self): ...

    dropped = []
    with Pipeline([Slow()]) as pipe:
        out = list(
            run_stream(pipe, (frame(i, 8) for i in range(40)), workers=1, max_in_flight=2, on_drop=dropped.append)
        )
    got = [c.index for c in out]
    assert got == sorted(got)
    assert len(got) + len(dropped) == 40
    assert not set(got) & {c.index for c in dropped}


def test_run_stream_propagates_stage_errors_and_stops():
    seen = []

    class Boom:
        name = "boom"

        def setup(self): ...
        def process(self, ctx):
            seen.append(ctx.index)
            if ctx.index >= 3:  # frames may be dropped, so fail every frame from 3 on
                raise RuntimeError("stage failed")
            return ctx

        def close(self): ...

    with Pipeline([Boom()]) as pipe:
        with pytest.raises(RuntimeError, match="stage failed"):
            list(run_stream(pipe, (frame(i, 8) for i in range(500)), workers=1, max_in_flight=2))
    assert len(seen) < 500


def test_run_stream_validates_arguments_and_stateful_workers():
    with Pipeline([create("smooth")]) as pipe:
        with pytest.raises(ValueError):
            list(run_stream(pipe, [], workers=0))
        with pytest.raises(PipelineConfigError):
            list(run_stream(pipe, [], workers=2))


def test_multiple_workers_record_all_timings():
    with Pipeline([create("passthrough")]) as pipe:
        out = list(run_stream(pipe, (frame(i, 8) for i in range(50)), workers=4, max_in_flight=50))
    assert len(out) == pipe.timings["passthrough"].calls


# --- smoothing ------------------------------------------------------------
def _face(box, tid=1):
    return Face(bbox=np.array(box, dtype=float), track_id=tid)


def test_smoother_reduces_jitter_and_does_not_alias_state():
    smooth = create("smooth", alpha=0.5)
    smooth.setup()
    c1 = frame(size=8)
    c1.faces = [_face([0, 0, 10, 10])]
    smooth.process(c1)
    c1.faces[0].bbox[:] = 999  # caller mutates the output in place
    c2 = frame(size=8)
    c2.faces = [_face([10, 10, 20, 20])]
    smooth.process(c2)
    assert np.allclose(c2.faces[0].bbox, [5, 5, 15, 15])


def test_smoother_evicts_stale_tracks_and_skips_untracked():
    smooth = create("smooth", alpha=0.5, max_age=2)
    smooth.setup()
    c = frame(size=8)
    c.faces = [_face([0, 0, 10, 10], tid=7)]
    smooth.process(c)
    for _ in range(5):
        smooth.process(frame(size=8))
    back = frame(size=8)
    back.faces = [_face([100, 100, 110, 110], tid=7)]
    smooth.process(back)
    assert np.allclose(back.faces[0].bbox, [100, 100, 110, 110])  # no blend with stale box
    anon = frame(size=8)
    anon.faces = [Face(bbox=np.array([1.0, 1.0, 2.0, 2.0]))]
    smooth.process(anon)
    assert np.allclose(anon.faces[0].bbox, [1, 1, 2, 2])


# --- watermark ------------------------------------------------------------
def test_watermark_plain_roundtrip_absent_and_bounds():
    out = watermark.embed(np.full((32, 32, 3), 9, dtype=np.uint8), b"hello")
    assert watermark.extract(out) == b"hello"
    assert watermark.extract(np.full((32, 32, 3), 7, dtype=np.uint8)) is None
    assert watermark.extract(np.zeros((1, 1, 3), dtype=np.uint8)) is None
    with pytest.raises(ValueError):
        watermark.embed(np.zeros((2, 2, 3), dtype=np.uint8), b"x" * 200)
    with pytest.raises(ValueError):
        watermark.embed(np.zeros((8, 8, 3), dtype=np.float32), b"x")
    with pytest.raises(ValueError):
        watermark.embed(np.zeros((8, 8, 3), dtype=np.uint8), b"")


def test_watermark_signed_payload_rejects_forgery_and_tampering():
    base = np.random.default_rng(0).integers(0, 256, (64, 64, 3), dtype=np.uint8)
    forged = watermark.embed(base, b"claims-real")  # attacker, no key
    assert watermark.extract(forged, key=KEY) is None
    signed = watermark.embed(base, b"realx|s1", key=KEY)
    assert watermark.extract(signed, key=KEY) == b"realx|s1"
    tampered = signed.copy()
    tampered.reshape(-1)[8 * 8 : 8 * 8 + 8] ^= 1  # flip LSBs in the length/payload area
    assert watermark.extract(tampered, key=KEY) != b"realx|s1"
    assert int(np.abs(signed.astype(int) - base.astype(int)).max()) <= 1


# --- providers / cli ------------------------------------------------------
def test_provider_order_and_cpu_fallback():
    got = pick_providers(["CPUExecutionProvider", "CUDAExecutionProvider", "TensorrtExecutionProvider"])
    assert got == ["TensorrtExecutionProvider", "CUDAExecutionProvider", "CPUExecutionProvider"]
    assert pick_providers([]) == ["CPUExecutionProvider"]


def test_cli_commands(capsys):
    assert cli_main(["selftest"]) == 0
    assert cli_main(["providers"]) == 0
    assert cli_main(["stages"]) == 0
    out = capsys.readouterr().out
    assert "selftest: ok" in out and "CPUExecutionProvider" in out and "watermark" in out
