"""Pipeline stage for Path B: the frame goes to the rented GPU, then the normal local safety stages follow.

The stage declares what a synthesising stage must declare (`requires_consent`, `uses_likeness`, `alters_media`), so the pipeline
refuses to build without a consent gate before it and a disclosure label and a watermark after it. Those two are drawn locally on
whatever comes back (G6): the server never sees them and cannot remove them. When the link gives nothing within the budget the
local picture stays and goes through the same label and watermark (G7).
"""

from __future__ import annotations

from realx.gpulink.client import GpuLinkClient
from realx.types import FrameContext


class GpuLinkStage:
    name = "gpulink"
    role = "synthesizer"  # strict pipelines: not a registered realX stage, so the caller vouches for it with allow=[GpuLinkStage]
    requires_consent = True
    uses_likeness = True
    alters_media = True
    stateful = True

    def __init__(self, client: GpuLinkClient, consent_id: str) -> None:
        self.client = client
        self.consent_id = consent_id

    def setup(self) -> None: ...

    def process(self, ctx: FrameContext) -> FrameContext:
        out = self.client.send(ctx.pixels, self.consent_id)
        if out is None:
            ctx.meta["gpulink"] = "local"
        else:
            ctx.pixels = out
            ctx.meta["gpulink"] = "remote"
        return ctx

    def close(self) -> None:
        self.client.stop()
