"""Consent for the face-mesh page: drawing the user's own photo on their live face.

The page (`/facemesh`) keeps the photo in the browser. What reaches this module is only the photo's SHA-256, computed
there, so a consent record covers *that exact image* (`portrait:<sha256>`) and nothing else: a record for one photo does
not cover another. Records are the same signed, expiring, revocable `ConsentRecord`s the rest of realX uses.

Differences from the co-host flow, on purpose:
  * the person agreeing is the person using the page, so the record is for the session: a fresh random key per run, a
    default life of two hours and a ceiling of twelve, no vault on disk. A restart ends every record (they stop verifying);
  * the statement the user makes is the one in `TERMS`: the photo is of them, and the result is never passed off as an
    unlabelled real appearance. realX cannot check it, which is why the label stays on screen (see the page's guard).

The page re-checks the record about every two seconds and stops drawing the photo when the check fails, is refused or
cannot be made. That keeps an honest page honest; it is not a lock against someone who edits the page itself, and it says
so in docs/FACEMESH.md.
"""

from __future__ import annotations

import secrets
import time

from realx.safety.consent import ConsentError, ConsentRecord, ConsentStore
from realx.safety.portrait_consent import check_scope, issue_portrait_consent_for_hash, scope_for_hash

SELF = "self"          # the subject: the person using the page
DEFAULT_HOURS = 2.0
MAX_HOURS = 12.0

TERMS = (
    "This photo is of you, the person using this camera. You will not present the result as a real, unlabelled "
    "appearance of you or of anyone else, and the \"Virtual face\" label stays on screen."
)

_FIELDS = ("subject_id", "scope", "expires_at", "record_id", "key_id", "signature")


def _new_store() -> ConsentStore:
    while True:  # ConsentStore refuses a key with too few distinct bytes: a random one almost never does, so just draw again
        try:
            return ConsentStore(secrets.token_bytes(32))
        except ValueError:
            continue


def record_to_dict(record: ConsentRecord) -> dict:
    return {name: getattr(record, name) for name in _FIELDS}


def record_from_dict(data) -> ConsentRecord:
    """A record from JSON, strictly: exactly the known fields, with the right types. Anything else is refused."""
    if not isinstance(data, dict) or set(data) != set(_FIELDS):
        raise ValueError("a consent record has exactly these fields: " + ", ".join(_FIELDS))
    if not all(isinstance(data[k], str) for k in _FIELDS if k != "expires_at"):
        raise ValueError("consent record fields must be strings")
    expires = data["expires_at"]
    if isinstance(expires, bool) or not isinstance(expires, (int, float)):
        raise ValueError("expires_at must be a number")
    return ConsentRecord(data["subject_id"], data["scope"], float(expires), data["record_id"], data["key_id"], data["signature"])


class FaceMeshConsent:
    """Issues, checks and revokes consent records for photos shown on the face-mesh page."""

    def __init__(self, store: ConsentStore | None = None) -> None:
        self.store = store or _new_store()

    def terms(self) -> dict:
        return {"attestation": TERMS, "default_hours": DEFAULT_HOURS, "max_hours": MAX_HOURS}

    def issue(self, sha256_hex: str, attested, hours=DEFAULT_HOURS, now: float | None = None) -> dict:
        """A signed record for this photo's hash. Refuses unless `attested` is exactly True."""
        if isinstance(hours, bool) or not isinstance(hours, (int, float)):
            raise ValueError("hours must be a number")
        if not 0 < hours <= MAX_HOURS:
            raise ValueError(f"hours must be above 0 and at most {MAX_HOURS:g}")
        record = issue_portrait_consent_for_hash(self.store, SELF, sha256_hex, hours * 3600.0, attested, now)
        return record_to_dict(record)

    def check(self, data, sha256_hex: str, now: float | None = None) -> float:
        """Seconds of consent left. Raises ConsentError (bad signature, wrong photo, expired, revoked) or ValueError (malformed)."""
        record = record_from_dict(data)
        if record.subject_id != SELF:
            raise ConsentError("this record is not for the person using the page")
        check_scope(self.store, record, scope_for_hash(sha256_hex), now)
        return record.expires_at - (time.time() if now is None else now)

    def revoke(self, data) -> None:
        """End a record now. It must be a record this run signed: an unknown or forged one is refused."""
        record = record_from_dict(data)
        self.store.verify(record, record.scope)   # signature, expiry, revocation (an already revoked record raises ConsentError)
        self.store.revoke(record.record_id)
