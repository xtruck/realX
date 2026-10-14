from __future__ import annotations

import hashlib
import hmac
import json
import math
import secrets
import time
from dataclasses import dataclass

_DOMAIN = b"realx-consent-v1\0"
_VALID_SCOPES = frozenset({"live", "export"})
MIN_KEY_BYTES = 32


class ConsentError(PermissionError):
    """Raised when a swap is attempted without valid consent."""


@dataclass(frozen=True)
class ConsentRecord:
    """A signed permission to use one identity's face."""

    subject_id: str
    scope: str
    expires_at: float
    record_id: str = ""
    key_id: str = "k1"
    signature: str = ""

    def payload(self) -> bytes:
        body = {
            "subject_id": self.subject_id,
            "scope": self.scope,
            "expires_at": self.expires_at,
            "record_id": self.record_id,
            "key_id": self.key_id,
        }
        encoded = json.dumps(body, sort_keys=True, separators=(",", ":"), allow_nan=False)
        return _DOMAIN + encoded.encode()


class ConsentStore:
    """Issues and verifies consent records (HMAC-SHA256, domain separated).

    The same object can sign and verify. Production splits these roles with
    asymmetric keys so a runtime host cannot mint consent (roadmap M4).
    """

    def __init__(self, secret: bytes, key_id: str = "k1") -> None:
        if len(secret) < MIN_KEY_BYTES:
            raise ValueError(f"secret must be at least {MIN_KEY_BYTES} bytes")
        if len(set(secret)) < 8:
            raise ValueError("secret has too little entropy")
        self.__secret = bytes(secret)
        self.key_id = key_id
        self._revoked: set[str] = set()

    def __repr__(self) -> str:
        return f"ConsentStore(key_id={self.key_id!r})"

    def issue(self, subject_id: str, scope: str, ttl_seconds: float, now: float | None = None) -> ConsentRecord:
        if not isinstance(subject_id, str) or not subject_id:
            raise ValueError("subject_id must be a non-empty string")
        if scope not in _VALID_SCOPES:
            raise ValueError(f"scope must be one of {sorted(_VALID_SCOPES)}")
        if not math.isfinite(ttl_seconds) or not 0 < ttl_seconds <= 366 * 86400:
            raise ValueError("ttl_seconds must be finite and between 0 and one year")
        now = time.time() if now is None else now
        unsigned = ConsentRecord(
            subject_id, scope, now + ttl_seconds, record_id=secrets.token_hex(16), key_id=self.key_id
        )
        return ConsentRecord(
            unsigned.subject_id,
            unsigned.scope,
            unsigned.expires_at,
            unsigned.record_id,
            unsigned.key_id,
            self._sign(unsigned),
        )

    def revoke(self, record_id: str) -> None:
        self._revoked.add(record_id)

    def verify(self, record: ConsentRecord, scope: str, now: float | None = None) -> None:
        now = time.time() if now is None else now
        try:
            if not (isinstance(record.subject_id, str) and isinstance(record.scope, str)):
                raise ConsentError("consent record malformed")
            if not math.isfinite(record.expires_at):
                raise ConsentError("consent record malformed")
            if record.key_id != self.key_id:
                raise ConsentError("consent signed with an unknown key")
            if not (isinstance(record.signature, str) and record.signature.isascii()):
                raise ConsentError("consent signature invalid")
            expected = self._sign(record)
            if not hmac.compare_digest(expected, record.signature):
                raise ConsentError("consent signature invalid")
        except (TypeError, ValueError) as exc:
            raise ConsentError("consent record malformed") from exc
        if record.record_id in self._revoked:
            raise ConsentError("consent revoked")
        if record.scope != scope:
            raise ConsentError(f"consent scope '{record.scope}' does not allow '{scope}'")
        if now >= record.expires_at:
            raise ConsentError("consent expired")

    def _sign(self, record: ConsentRecord) -> str:
        return hmac.new(self.__secret, record.payload(), hashlib.sha256).hexdigest()
