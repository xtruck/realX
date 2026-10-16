"""Consent for animating a still portrait of a real person.

A portrait is only ever animated under a signed record whose scope names *that exact image*:
`portrait:<sha256 of the image bytes>`. A record for one picture does not cover another, and
changing a single byte of the file changes the scope, so the permission cannot be re-pointed at a
different face without breaking the signature.

Records are the same signed, expiring, revocable `ConsentRecord`s the rest of realX uses, checked
by the same `ConsentStore` (so the co-host vault's revocation source works here too). Nothing in
this module reads or writes a file, and the image bytes are never stored or logged: only their hash
is kept.

Issuing needs an explicit statement that the portrait is the user's own, or that the person shown has
authorized the animation. That statement is the user's; realX cannot verify it, which is why the
output is always labelled and watermarked (see `realx.pipeline.validate_stages`).
"""

from __future__ import annotations

import hashlib
import math
import re
import secrets
import time

from realx.safety.consent import ConsentError, ConsentRecord, ConsentStore

SCOPE_PREFIX = "portrait:"
MAX_TTL_SECONDS = 366 * 86400  # same ceiling as ConsentStore.issue

ATTESTATION = (
    "The portrait is yours, or the person shown has authorized you to animate it, "
    "and you will not present the result as a real, unlabelled appearance of them."
)


def portrait_scope(image_bytes: bytes) -> str:
    """The scope string for this exact image."""
    if not isinstance(image_bytes, (bytes, bytearray)) or not image_bytes:
        raise ValueError("image_bytes must be non-empty bytes")
    return SCOPE_PREFIX + hashlib.sha256(bytes(image_bytes)).hexdigest()


def issue_portrait_consent(
    store: ConsentStore,
    subject_id: str,
    image_bytes: bytes,
    ttl_seconds: float,
    attested_owner_or_authorized: bool,
    now: float | None = None,
) -> ConsentRecord:
    """Sign a record that covers this one image for `ttl_seconds`. Refuses without the attestation."""
    if attested_owner_or_authorized is not True:  # not merely truthy: it must be said outright
        raise ConsentError(f"refusing to issue: confirm this is true. {ATTESTATION}")
    if not isinstance(subject_id, str) or not subject_id.strip():
        raise ValueError("subject_id must be a non-empty string")
    if isinstance(ttl_seconds, bool) or not isinstance(ttl_seconds, (int, float)):
        raise ValueError("ttl_seconds must be a number")
    if not math.isfinite(ttl_seconds) or not 0 < ttl_seconds <= MAX_TTL_SECONDS:
        raise ValueError("ttl_seconds must be finite and between 0 and one year")
    scope = portrait_scope(image_bytes)
    started = time.time() if now is None else now
    unsigned = ConsentRecord(subject_id, scope, started + ttl_seconds, record_id=secrets.token_hex(16), key_id=store.key_id)
    # ConsentStore.issue only knows the face-swap scopes, so the record is built here and signed by the same
    # store: verification is the store's own, unchanged.
    return ConsentRecord(
        unsigned.subject_id, unsigned.scope, unsigned.expires_at, unsigned.record_id, unsigned.key_id,
        store._sign(unsigned),
    )


_HEX_SHA256 = re.compile(r"[0-9a-f]{64}")


def scope_for_hash(sha256_hex: str) -> str:
    """The scope string for an image whose SHA-256 is already known (the bytes never reach this process).

    The hash is computed where the image is, for example in the browser that shows it, so the image itself is never
    sent. realX cannot check that a hash belongs to a given picture: like the attestation, it is the user's statement.
    """
    if not isinstance(sha256_hex, str) or not _HEX_SHA256.fullmatch(sha256_hex):
        raise ValueError("sha256 must be 64 lowercase hexadecimal characters")
    return SCOPE_PREFIX + sha256_hex


def issue_portrait_consent_for_hash(
    store: ConsentStore,
    subject_id: str,
    sha256_hex: str,
    ttl_seconds: float,
    attested_owner_or_authorized: bool,
    now: float | None = None,
) -> ConsentRecord:
    """Like `issue_portrait_consent`, for an image known only by its SHA-256. Same refusals, same signature."""
    if attested_owner_or_authorized is not True:
        raise ConsentError(f"refusing to issue: confirm this is true. {ATTESTATION}")
    if not isinstance(subject_id, str) or not subject_id.strip():
        raise ValueError("subject_id must be a non-empty string")
    if isinstance(ttl_seconds, bool) or not isinstance(ttl_seconds, (int, float)):
        raise ValueError("ttl_seconds must be a number")
    if not math.isfinite(ttl_seconds) or not 0 < ttl_seconds <= MAX_TTL_SECONDS:
        raise ValueError("ttl_seconds must be finite and between 0 and one year")
    scope = scope_for_hash(sha256_hex)
    started = time.time() if now is None else now
    unsigned = ConsentRecord(subject_id, scope, started + ttl_seconds, record_id=secrets.token_hex(16), key_id=store.key_id)
    return ConsentRecord(
        unsigned.subject_id, unsigned.scope, unsigned.expires_at, unsigned.record_id, unsigned.key_id,
        store._sign(unsigned),
    )


def check_scope(store, record: ConsentRecord, scope: str, now: float | None = None) -> None:
    """Raise ConsentError unless `record` is a valid, unexpired, unrevoked portrait record for `scope`.

    `store` is a ConsentStore (anything with `verify(record, scope, now)`). Cheap enough for every frame.
    """
    record_scope = getattr(record, "scope", None)
    if not isinstance(record_scope, str) or not record_scope.startswith(SCOPE_PREFIX):
        raise ConsentError("this is not a portrait consent record")
    store.verify(record, scope, now)  # signature, scope (which image), expiry, revocation


def check_portrait(store, record: ConsentRecord, image_bytes: bytes, now: float | None = None) -> None:
    """Like `check_scope`, for the image itself. Hashes the bytes: call it once, then use `check_scope`."""
    check_scope(store, record, portrait_scope(image_bytes), now)
