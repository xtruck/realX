"""Strict pipelines: only realX's registered stages, and only realX's own safety stages in safety roles."""

from __future__ import annotations

import pytest

from realx.pipeline import Pipeline, PipelineConfigError
from realx.safety.consent import ConsentStore
from realx.stages import create
from realx.stages.builtin import ConsentGate, Disclosure, PassThrough, Watermark
from realx.types import FrameContext


class Plain:
    name = "plain"

    def setup(self) -> None: ...
    def process(self, ctx): return ctx
    def close(self) -> None: ...


class FakeGate(Plain):
    name = "gate"
    is_gate = True


class FakeLabel(Plain):
    name = "label"
    is_disclosure = True


class FakeMark(Plain):
    name = "mark"
    is_watermark = True


class Synth(Plain):
    name = "synth"
    requires_consent = True
    uses_likeness = True


def real_chain():
    store = ConsentStore(bytes(range(1, 40)))
    return [ConsentGate(store, store.issue("p", "live", 60)), create("swap_stub", source_identity="p"),
            Disclosure("p"), Watermark(b"x")]


def test_strict_accepts_realx_stages():
    Pipeline(real_chain(), strict=True)
    Pipeline([PassThrough()], strict=True)


def test_strict_refuses_an_unregistered_stage():
    with pytest.raises(PipelineConfigError, match="not a registered"):
        Pipeline([Plain()], strict=True)


def test_allow_names_a_class_the_caller_vouches_for():
    Pipeline([Plain()], strict=True, allow=[Plain])


@pytest.mark.parametrize("fake", [FakeGate, FakeLabel, FakeMark])
def test_allowed_classes_still_cannot_claim_a_safety_role(fake):
    with pytest.raises(PipelineConfigError, match="claims"):
        Pipeline([fake()], strict=True, allow=[fake])


def test_an_impostor_gate_cannot_unlock_a_synthesizer():
    chain = [FakeGate(), Synth(), Disclosure("p"), Watermark(b"x")]
    Pipeline(chain)  # flags alone satisfy the ordering rules...
    with pytest.raises(PipelineConfigError):  # ...which is exactly why strict mode exists
        Pipeline(chain, strict=True, allow=[FakeGate, Synth])


def test_stages_are_frozen_after_the_pipeline_is_built():
    chain = real_chain()
    p = Pipeline(chain, strict=True)
    assert isinstance(p.stages, tuple)
    chain.pop()  # the caller's list no longer reaches the pipeline
    assert len(p.stages) == 4
    for name in ("stages", "strict", "allow"):
        with pytest.raises(AttributeError):
            setattr(p, name, ())
    with pytest.raises(AttributeError):
        p.stages.append  # tuple has no append


def test_validation_still_runs_on_a_non_strict_pipeline():
    with pytest.raises(PipelineConfigError):
        Pipeline([Synth()])


def test_a_strict_pipeline_still_processes_frames():
    import numpy as np

    with Pipeline(real_chain(), strict=True) as p:
        out = p.process(FrameContext(pixels=np.zeros((120, 160, 3), np.uint8), index=0, timestamp=0.0))
    assert "disclosure" in out.meta
