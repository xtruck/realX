"""Runtime proof that a frame passed the consent gate.

The token is a private object, so a stage cannot be satisfied by a forged string
placed in `ctx.meta`. Stages that synthesize faces call `require_consent`.
"""

from __future__ import annotations

from realx.safety.consent import ConsentError, ConsentRecord, ConsentStore
from realx.types import FrameContext

_TOKEN = object()
_SUBJECT_KEY = "consent_subject"
_TOKEN_KEY = "consent_token"


def grant(ctx: FrameContext, store: ConsentStore, record: ConsentRecord, scope: str = "live") -> None:
    """Mint the pass for this frame. The record is verified first (signature, scope, expiry, revocation),
    so there is no way to get a token without a consent check."""
    store.verify(record, scope)
    subject_id = record.subject_id
    ctx.meta[_TOKEN_KEY] = _TOKEN
    ctx.meta[_SUBJECT_KEY] = subject_id


def require_consent(ctx: FrameContext, subject_id: str) -> None:
    """Raise unless this frame was gated for exactly `subject_id`."""
    if ctx.meta.get(_TOKEN_KEY) is not _TOKEN:
        raise ConsentError("frame did not pass the consent gate")
    if ctx.meta.get(_SUBJECT_KEY) != subject_id:
        raise ConsentError("consent does not cover this identity")
