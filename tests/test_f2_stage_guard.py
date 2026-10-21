"""F2: stage-ordering guard cannot be dodged by omitting flags; gate.grant needs a consent check."""

from __future__ import annotations

import numpy as np
import pytest

from realx.pipeline import Pipeline, PipelineConfigError, validate_stages
from realx.safety import gate
from realx.safety.consent import ConsentError, ConsentStore
from realx.stages import create
from realx.stages.builtin import ConsentGate, Disclosure, Watermark
from realx.types import FrameContext


class Plain:
    name = "plain"

    def setup(self) -> None: ...
    def process(self, ctx): return ctx
    def close(self) -> None: ...


class RoleSynth(Plain):
    """Forgot to declare requires_consent, but says what it is."""
    name = "role_synth"
    role = "synthesizer"


class RoleEditor(Plain):
    name = "role_editor"
    role = "editor"


class Neutral(Plain):
    name = "neutral"
    role = "neutral"


class LyingNeutral(Plain):
    name = "liar"
    role = "neutral"
    alters_media = True


def _store():
    return ConsentStore(bytes(range(1, 40)))


def _chain_head():
    s = _store()
    return [ConsentGate(s, s.issue("p", "live", 60))]


def test_a_synthesizer_role_needs_a_gate_even_without_flags():
    with pytest.raises(PipelineConfigError, match="consent gate"):
        validate_stages([RoleSynth(), Watermark(b"x")])


def test_a_synthesizer_role_needs_a_watermark_after_it():
    with pytest.raises(PipelineConfigError, match="watermark"):
        validate_stages([*_chain_head(), RoleSynth()])


def test_an_editor_role_cannot_follow_the_watermark():
    with pytest.raises(PipelineConfigError, match="after the watermark"):
        validate_stages([Watermark(b"x"), RoleEditor()])


def test_strict_rejects_an_allowed_class_with_no_declared_role():
    with pytest.raises(PipelineConfigError, match="role"):
        Pipeline([Plain()], strict=True, allow=[Plain])


def test_strict_accepts_an_allowed_class_with_a_neutral_role():
    Pipeline([Neutral()], strict=True, allow=[Neutral])


def test_strict_rejects_a_neutral_role_that_contradicts_its_flags():
    with pytest.raises(PipelineConfigError, match="role"):
        Pipeline([LyingNeutral()], strict=True, allow=[LyingNeutral])


def test_strict_role_synth_still_needs_gate_and_mark():
    with pytest.raises(PipelineConfigError):
        Pipeline([RoleSynth()], strict=True, allow=[RoleSynth])


def test_an_audio_watermark_does_not_cover_a_video_synthesizer_at_build_time():
    s = _store()
    chain = [ConsentGate(s, s.issue("p", "live", 60)), create("swap_stub", source_identity="p"),
             Disclosure("p"), create("audio_watermark", payload=b"x")]
    with pytest.raises(PipelineConfigError, match="watermark"):
        Pipeline(chain, strict=True)


def test_a_video_watermark_does_not_cover_a_voice_synthesizer():
    s = _store()
    chain = [ConsentGate(s, s.issue("p", "live", 60)), create("voice_convert", target="p"), Watermark(b"x")]
    with pytest.raises(PipelineConfigError, match="watermark"):
        Pipeline(chain, strict=True)


def test_cohost_and_portrait_helpers_return_validated_chains(tmp_path):
    from realx.safety.cohost import CohostVault, cohost_stages

    v = CohostVault(tmp_path / "v")
    g = v.grant("Kofi", agreed=True)
    with pytest.raises(PipelineConfigError):  # an unregistered renderer with no role is refused on return
        cohost_stages(v, g.path, Plain())
    Pipeline(cohost_stages(v, g.path, create("swap_stub", source_identity="kofi")), strict=True)


def test_gate_grant_requires_a_consent_check():
    s = _store()
    rec = s.issue("p", "live", 60)
    ctx = FrameContext(pixels=np.zeros((4, 4, 3), np.uint8))
    with pytest.raises(TypeError):
        gate.grant(ctx, "p")  # type: ignore[call-arg]
    s.revoke(rec.record_id)
    with pytest.raises(ConsentError):
        gate.grant(ctx, s, rec)
    with pytest.raises(ConsentError):
        gate.require_consent(ctx, "p")
