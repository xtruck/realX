"""Portrait animation: a still image of a real person, moved by the user's own head and face.

No neural engine is enabled (see docs/PORTRAIT.md), so these tests run the stage with a labelled
test-only warp. What they pin down is the part that has to be right before any real engine is allowed:

* the image must be covered by a consent record bound to *that image*, checked on every frame
* the pipeline refuses to build without gate -> animation -> visible label -> watermark, in that order
* the portrait lives in memory only, and an unusable or hostile image is refused before decoding
"""

import builtins
import struct
import types

import cv2
import numpy as np
import pytest

from realx.pipeline import Pipeline, PipelineConfigError
from realx.safety import ConsentError, ConsentStore, watermark
from realx.safety.portrait_consent import check_portrait, issue_portrait_consent, portrait_scope
from realx.stages import available, create
from realx.stages import portrait as portrait_mod
from realx.stages.portrait import PortraitError, PortraitUnavailable, decode_portrait, portrait_stages
from realx.types import FrameContext

KEY = bytes(range(1, 33))
STORE_KEY = bytes(range(40, 72))


def make_png(seed=1, shape=(96, 128)):
    rng = np.random.default_rng(seed)
    img = cv2.GaussianBlur(rng.integers(0, 255, (*shape, 3), dtype=np.uint8), (0, 0), 3)
    ok, buf = cv2.imencode(".png", img)
    assert ok
    return buf.tobytes()


def frame(h=240, w=320, rig=None):
    ctx = FrameContext(pixels=np.full((h, w, 3), 120, np.uint8))
    if rig is not None:
        ctx.meta["rig"] = [rig]
    return ctx


@pytest.fixture(autouse=True)
def allow_test_engine(monkeypatch):
    monkeypatch.setenv("REALX_ALLOW_TEST_ENGINES", "1")


@pytest.fixture
def store():
    return ConsentStore(STORE_KEY)


@pytest.fixture
def png():
    return make_png(1)


@pytest.fixture
def record(store, png):
    return issue_portrait_consent(store, "ama", png, 3600, attested_owner_or_authorized=True)


class _Edit:
    """A stage that changes pixels: it must not sit between the label and the watermark."""

    name = "edit"
    alters_media = True

    def setup(self): ...
    def process(self, ctx):
        return ctx

    def close(self): ...


# --- consent is bound to the image and refuses without an attestation ------------------------
@pytest.mark.parametrize("attested", [False, None, 1, "yes"])
def test_issuing_needs_an_explicit_attestation(store, png, attested):
    with pytest.raises(ConsentError, match="owner|authori"):
        issue_portrait_consent(store, "ama", png, 3600, attested_owner_or_authorized=attested)


def test_the_record_is_bound_to_the_exact_image_bytes(store, png, record):
    assert record.scope == portrait_scope(png) == "portrait:" + __import__("hashlib").sha256(png).hexdigest()
    check_portrait(store, record, png)
    with pytest.raises(ConsentError, match="does not allow"):
        check_portrait(store, record, make_png(2))  # another picture is another identity
    with pytest.raises(ConsentError, match="does not allow"):
        check_portrait(store, record, png + b"\0")  # even one extra byte


def test_other_records_and_tampering_are_refused(store, png, record):
    with pytest.raises(ConsentError, match="portrait"):
        check_portrait(store, store.issue("ama", "live", 60), png)  # a face-swap consent is not a portrait consent
    forged = type(record)(record.subject_id, portrait_scope(make_png(2)), record.expires_at, record.record_id, record.key_id, record.signature)
    with pytest.raises(ConsentError, match="signature"):
        check_portrait(store, forged, make_png(2))  # re-pointing a signed record at another image breaks the signature
    other = ConsentStore(bytes(range(100, 132)))
    with pytest.raises(ConsentError):
        check_portrait(other, record, png)


def test_ttl_is_bounded_and_the_subject_is_required(store, png):
    for bad in (0, -5, float("nan"), float("inf"), 367 * 86400):
        with pytest.raises(ValueError):
            issue_portrait_consent(store, "ama", png, bad, attested_owner_or_authorized=True)
    with pytest.raises(ValueError):
        issue_portrait_consent(store, "", png, 60, attested_owner_or_authorized=True)


# --- the pipeline will not run a portrait without gate, label and watermark -------------------
def test_pipeline_ordering_is_enforced(store, png, record):
    gate = lambda: create("consent_gate", store=store, record=record, scope=record.scope)  # noqa: E731
    anim = lambda: create("portrait_animate", portrait=png, record=record, store=store, engine="synthetic_warp")  # noqa: E731
    label = lambda: create("disclosure", display_name="Ama")  # noqa: E731
    mark = lambda: create("watermark", payload=b"x")  # noqa: E731
    with pytest.raises(PipelineConfigError, match="consent gate"):
        Pipeline([anim(), label(), mark()])
    with pytest.raises(PipelineConfigError, match="disclosure"):
        Pipeline([gate(), anim(), mark()])
    with pytest.raises(PipelineConfigError, match="disclosure"):
        Pipeline([gate(), anim(), mark(), label()])  # a label after the mark does not count
    with pytest.raises(PipelineConfigError, match="watermark"):
        Pipeline([gate(), anim(), label()])
    with pytest.raises(PipelineConfigError, match="cover the disclosure"):
        Pipeline([gate(), anim(), label(), _Edit(), mark()])  # nothing may paint over the label
    Pipeline([gate(), anim(), label(), mark()])


def test_the_stage_declares_what_the_pipeline_needs_to_know():
    cls = portrait_mod.PortraitAnimate
    assert cls.requires_consent and cls.uses_likeness and cls.stateful and cls.alters_media
    assert "portrait_animate" in available() and "face_swap" not in available()


def test_the_stage_refuses_a_frame_that_did_not_pass_the_right_gate(store, png, record):
    stage = create("portrait_animate", portrait=png, record=record, store=store, engine="synthetic_warp")
    stage.setup()
    with pytest.raises(ConsentError, match="did not pass"):
        stage.process(frame())  # no gate ran
    bob = issue_portrait_consent(store, "bob", png, 3600, attested_owner_or_authorized=True)
    stages = [create("consent_gate", store=store, record=bob, scope=bob.scope), stage,
              create("disclosure", display_name="Ama"), create("watermark", payload=b"x")]
    with Pipeline(stages) as pipe:
        with pytest.raises(ConsentError, match="does not cover"):
            pipe.process(frame())  # a gate for bob does not cover ama's portrait


def test_consent_for_one_image_does_not_authorise_another(store, png, record):
    with pytest.raises(ConsentError, match="does not allow"):
        create("portrait_animate", portrait=make_png(2), record=record, store=store, engine="synthetic_warp")


# --- it runs labelled and marked, and stops at the next frame when consent ends ---------------
def test_the_chain_runs_labelled_marked_and_animated(store, png, record):
    stages = portrait_stages(store, record, png, "Ama", watermark_key=KEY, engine="synthetic_warp")
    with Pipeline(stages) as pipe:
        out = pipe.process(frame(240, 320, rig={"yaw": 0.4, "pitch": 0.1, "roll": 0.05, "smile": 0.5}))
    h, w = out.pixels.shape[:2]
    bar = max(24, round(0.06 * h))
    band = out.pixels[h - bar :]
    assert band.mean() < 120 and band.max() == 255 and (band == 255).all(axis=2).sum() > 40  # the visible label
    assert "DIGITAL HOST" in out.meta["disclosure"] and "Ama" in out.meta["disclosure"]
    assert watermark.extract(out.pixels, key=KEY) == f"realx|portrait|{record.record_id[:8]}".encode()
    assert out.pixels.shape == (240, 320, 3)
    assert out.pixels[: h - bar].std() > 5, "the picture is the portrait, not the flat camera frame"
    assert out.meta["portrait"] == {"engine": "synthetic_warp", "test_only": True}


def test_expiry_stops_a_running_stream_at_its_next_frame(store, png, monkeypatch):
    clock = [1000.0]
    monkeypatch.setattr("realx.safety.consent.time", types.SimpleNamespace(time=lambda: clock[0]))
    rec = issue_portrait_consent(store, "ama", png, 60, attested_owner_or_authorized=True, now=1000.0)
    with Pipeline(portrait_stages(store, rec, png, "Ama", watermark_key=KEY, engine="synthetic_warp")) as pipe:
        clock[0] = 1010.0
        pipe.process(frame())
        clock[0] = 1061.0
        with pytest.raises(ConsentError, match="expired"):
            pipe.process(frame())
    with pytest.raises(ConsentError, match="expired"):
        portrait_stages(store, rec, png, "Ama", engine="synthetic_warp")  # and it cannot restart


def test_revocation_stops_a_running_stream_at_its_next_frame(store, png, record):
    with Pipeline(portrait_stages(store, record, png, "Ama", watermark_key=KEY, engine="synthetic_warp")) as pipe:
        pipe.process(frame())
        store.revoke(record.record_id)
        with pytest.raises(ConsentError, match="revoked"):
            pipe.process(frame())
    with pytest.raises(ConsentError, match="revoked"):
        portrait_stages(store, record, png, "Ama", engine="synthetic_warp")


def test_a_revocation_made_elsewhere_counts_too(store, png, record):
    revoked = set()
    store.set_revocation_source(lambda rid: rid in revoked)  # like the co-host vault's tombstone files
    with Pipeline(portrait_stages(store, record, png, "Ama", watermark_key=KEY, engine="synthetic_warp")) as pipe:
        pipe.process(frame())
        revoked.add(record.record_id)
        with pytest.raises(ConsentError, match="revoked"):
            pipe.process(frame())


def test_the_stage_checks_consent_itself_on_every_frame_even_if_the_gate_proof_is_stale(store, png, record):
    from realx.safety.gate import grant

    stage = create("portrait_animate", portrait=png, record=record, store=store, engine="synthetic_warp")
    stage.setup()
    ok = frame()
    grant(ok, record.subject_id)
    stage.process(ok)
    store.revoke(record.record_id)
    stale = frame()
    grant(stale, record.subject_id)  # a gate stage that did not re-check would still vouch for this frame
    with pytest.raises(ConsentError, match="revoked"):
        stage.process(stale)


def test_no_frame_reaches_the_engine_once_consent_is_gone(store, png, record, monkeypatch):
    calls = []

    class Counting(portrait_mod.SyntheticWarp):
        def animate(self, rig, ctx_pixels):
            calls.append(1)
            return super().animate(rig, ctx_pixels)

    monkeypatch.setattr(portrait_mod, "_ENGINES", dict(portrait_mod._ENGINES))
    portrait_mod.register_engine("counting", Counting, test_only=True)
    with Pipeline(portrait_stages(store, record, png, "Ama", watermark_key=KEY, engine="counting")) as pipe:
        pipe.process(frame())
        pipe.process(frame())
        store.revoke(record.record_id)
        for _ in range(3):
            with pytest.raises(ConsentError):
                pipe.process(frame())
    assert len(calls) == 2


# --- engines: none is enabled, and the test engine is fenced off ------------------------------
def test_without_a_verified_engine_the_stage_says_so(store, png, record):
    with pytest.raises(PortraitUnavailable, match="no verified portrait engine"):
        create("portrait_animate", portrait=png, record=record, store=store)
    with pytest.raises(PortraitUnavailable):
        create("portrait_animate", portrait=png, record=record, store=store, engine="liveportrait")


def test_the_test_engine_refuses_to_run_without_the_environment_switch(store, png, record, monkeypatch):
    monkeypatch.delenv("REALX_ALLOW_TEST_ENGINES")
    with pytest.raises(PortraitUnavailable, match="test"):
        create("portrait_animate", portrait=png, record=record, store=store, engine="synthetic_warp")
    monkeypatch.setenv("REALX_ALLOW_TEST_ENGINES", "0")
    with pytest.raises(PortraitUnavailable, match="test"):
        create("portrait_animate", portrait=png, record=record, store=store, engine="synthetic_warp")


def test_the_test_engine_is_deterministic_and_follows_the_rig():
    eng = portrait_mod.create_engine("synthetic_warp")
    img = cv2.imdecode(np.frombuffer(make_png(3), np.uint8), cv2.IMREAD_COLOR)[:, :, ::-1].copy()
    eng.load(img)
    still = eng.animate({"yaw": 0, "pitch": 0, "roll": 0, "smile": 0}, None)
    turned = eng.animate({"yaw": 0.8, "pitch": 0, "roll": 0, "smile": 0}, None)
    assert still.shape == img.shape and still.dtype == np.uint8
    assert not np.array_equal(still, turned)
    assert np.array_equal(turned, eng.animate({"yaw": 0.8, "pitch": 0, "roll": 0, "smile": 0}, None))
    eng.close()
    assert portrait_mod.engine_info("synthetic_warp")["test_only"] is True


# --- the portrait stays in memory and a hostile image is refused before it is decoded ---------
def test_nothing_is_written_to_disk_and_the_image_is_not_exposed(store, png, record, monkeypatch):
    real_open = builtins.open

    def guarded(file, mode="r", *a, **k):
        if any(c in mode for c in "wax+"):
            raise AssertionError(f"tried to write a file: {file!r}")
        return real_open(file, mode, *a, **k)

    stages = portrait_stages(store, record, png, "Ama", watermark_key=KEY, engine="synthetic_warp")
    with monkeypatch.context() as m:
        m.setattr(builtins, "open", guarded)
        with Pipeline(stages) as pipe:
            out = pipe.process(frame(rig={"yaw": 0.2}))
    for st in stages:
        assert repr(png[:24]) not in repr(st) and png[:24].hex() not in repr(st).lower()

    def scan(v):
        if isinstance(v, dict):
            [scan(x) for x in v.values()]
        elif isinstance(v, (list, tuple)):
            [scan(x) for x in v]
        else:
            assert not isinstance(v, (bytes, bytearray, np.ndarray)), "image data leaked into the frame metadata"

    scan(out.meta)


def test_decoding_checks_size_and_header_before_it_allocates_anything():
    for bad in (b"", b"not an image at all" * 10, b"\x89PNG\r\n\x1a\n" + b"\0" * 8):
        with pytest.raises(PortraitError):
            decode_portrait(bad)
    with pytest.raises(PortraitError, match="12 MB"):
        decode_portrait(b"\x89PNG\r\n\x1a\n" + b"\0" * (12 * 1024 * 1024 + 1))
    bomb = b"\x89PNG\r\n\x1a\n" + struct.pack(">I", 13) + b"IHDR" + struct.pack(">II", 30000, 30000) + b"\x08\x02\0\0\0"
    with pytest.raises(PortraitError, match="megapixels|between"):
        decode_portrait(bomb)  # a tiny file that claims to be enormous
    tiny = cv2.imencode(".png", np.zeros((8, 8, 3), np.uint8))[1].tobytes()
    with pytest.raises(PortraitError, match="between|small"):
        decode_portrait(tiny)


def test_decoding_returns_a_bounded_rgb_image(png):
    img = decode_portrait(png)
    assert img.dtype == np.uint8 and img.ndim == 3 and img.shape[2] == 3 and max(img.shape[:2]) <= portrait_mod.MAX_PORTRAIT_SIDE
    big = cv2.imencode(".jpg", np.random.default_rng(0).integers(0, 255, (2400, 1800, 3), dtype=np.uint8))[1].tobytes()
    out = decode_portrait(big)
    assert max(out.shape[:2]) <= portrait_mod.MAX_PORTRAIT_SIDE
