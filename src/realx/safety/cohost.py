"""Consent for a real person who agrees to be a digital co-host on your stream.

The flow is built so the co-host stays in control:
  * you can only grant consent after confirming the person agreed and knows the stream
    labels them as a digital host;
  * granting prints a revoke code once. Hand it to the co-host: with it, they alone can
    switch consent off, and every pipeline that checks the vault stops using their face;
  * consent is scoped, expires (default 30 days, at most one year) and is signed.

This module issues and checks consent. Rendering a real person's face is a separate stage
that must declare `uses_likeness`, which makes the pipeline demand a gate before it and a
visible disclosure and watermark after it (see `realx.pipeline.validate_stages`).
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import secrets
import time
from dataclasses import dataclass
from pathlib import Path

from realx.safety.consent import ConsentError, ConsentRecord, ConsentStore
from realx.stages import create
from realx.stages.base import Stage

AGREEMENT = (
    "The person has agreed to appear as a digital host, has seen how the stream labels them, "
    "and has been given the revoke code."
)


def vault_dir() -> Path:
    return Path(os.environ.get("REALX_HOME") or Path.home() / ".realx") / "cohost"


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:32]


def _revoke_code() -> str:
    """A random code that is safe to type after `--code`: a leading '-' would be read as another option."""
    while True:
        code = secrets.token_urlsafe(12)
        if not code.startswith("-"):
            return code


@dataclass(frozen=True)
class Grant:
    record: ConsentRecord
    display_name: str
    revoke_code: str  # shown once; only its hash is stored
    path: Path


class CohostVault:
    def __init__(self, root: Path | None = None) -> None:
        self.root = Path(root) if root else vault_dir()
        self.root.mkdir(parents=True, exist_ok=True, mode=0o700)
        try:
            os.chmod(self.root, 0o700)  # mkdir's mode is ignored when the folder already exists
        except OSError:
            pass
        self._key = self._secret()
        self._store = ConsentStore(self._key)
        # asked on every frame: a revocation made by another process stops a running stream
        self._store.set_revocation_source(self._is_revoked)

    # -- storage ---------------------------------------------------------------------
    def _secret(self) -> bytes:
        path = self.root / "signing.key"
        try:
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        except FileExistsError:
            return bytes.fromhex(path.read_text().strip())
        key = secrets.token_bytes(32)
        with os.fdopen(fd, "w") as fh:
            fh.write(key.hex())
        return key

    def _tombstone(self, record_id: str) -> Path:
        return self.root / f"{record_id}.revoked"

    def _is_revoked(self, record_id: str) -> bool:
        """A tombstone file means revoked. Any file there counts, even a damaged or forged one:
        extra tombstones can only make consent stricter, never looser. Unreadable means revoked.

        Limit: the vault lives on the streamer's computer, so someone with full control of it
        can delete the tombstone. Enforcement the streamer cannot undo needs a key they do not
        hold (roadmap M4).
        """
        try:
            return self._tombstone(record_id).exists()
        except OSError:
            return True

    def _write_private(self, path: Path, text: str) -> None:
        tmp = path.with_name(path.name + f".{secrets.token_hex(4)}.tmp")
        fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "w") as fh:
            fh.write(text)
        os.replace(tmp, path)  # atomic: readers never see half a file

    @property
    def store(self) -> ConsentStore:
        return self._store

    # -- operations ------------------------------------------------------------------
    def grant(self, display_name: str, days: float = 30, agreed: bool = False, scope: str = "live") -> Grant:
        if not agreed:
            raise ConsentError(f"refusing to grant: confirm that this is true. {AGREEMENT}")
        name = "".join(ch for ch in display_name if ch.isprintable()).strip()[:40]
        if not name or not _slug(name):
            raise ValueError("a display name with letters or digits is required")
        record = self._store.issue(_slug(name), scope, days * 86400)
        code = _revoke_code()
        doc = {
            "display_name": name,
            "record": {
                "subject_id": record.subject_id, "scope": record.scope, "expires_at": record.expires_at,
                "record_id": record.record_id, "key_id": record.key_id, "signature": record.signature,
            },
            "revoke_hash": hashlib.sha256(code.encode()).hexdigest(),
            "granted_at": time.time(),
        }
        path = self.root / f"{record.record_id}.json"
        self._write_private(path, json.dumps(doc, indent=2))
        return Grant(record, name, code, path)

    def load(self, path: str | Path) -> tuple[ConsentRecord, str]:
        try:
            doc = json.loads(Path(path).read_text())
            record, name = ConsentRecord(**doc["record"]), str(doc["display_name"])
        except (OSError, ValueError, KeyError, TypeError) as exc:
            raise ConsentError(f"cannot read consent file: {exc}") from exc
        if _slug(name) != record.subject_id:  # the signed id names the person; the label must match it
            raise ConsentError("display name does not match the signed consent record")
        return record, name

    def check(self, path: str | Path, scope: str = "live") -> tuple[ConsentRecord, str]:
        record, name = self.load(path)
        self._store.verify(record, scope)  # signature, scope, expiry, revocation
        return record, name

    def revoke(self, record_id: str, code: str) -> None:
        path = self.root / f"{record_id}.json"
        if not re.fullmatch(r"[0-9a-f]{32}", record_id) or not path.exists():
            raise ConsentError("no such consent record")
        doc = json.loads(path.read_text())
        if not secrets.compare_digest(doc["revoke_hash"], hashlib.sha256(code.encode()).hexdigest()):
            raise ConsentError("wrong revoke code")
        self._write_private(self._tombstone(record_id), f"revoked {time.time():.0f}\n")
        self._store.revoke(record_id)

    def list(self) -> list[dict]:
        out = []
        for f in sorted(self.root.glob("*.json")):
            try:
                doc = json.loads(f.read_text())
                rec = doc["record"]
            except (OSError, ValueError, KeyError, TypeError):
                continue  # not a consent file
            try:
                self._store.verify(ConsentRecord(**rec), rec["scope"])
                state = "active"
            except ConsentError as exc:
                state = str(exc)
            out.append({"id": rec["record_id"], "name": doc["display_name"], "scope": rec["scope"],
                        "expires_at": rec["expires_at"], "state": state})
        return out


def cohost_stages(vault: CohostVault, consent_file: str | Path, renderer: Stage, watermark_key: bytes | None = None) -> list[Stage]:
    """gate -> renderer -> visible disclosure -> watermark, for one consenting co-host.

    The consent file is checked now (so a revoked or expired one fails before anything
    starts) and again on every frame by the gate.
    """
    record, name = vault.check(consent_file)
    return [
        create("consent_gate", store=vault.store, record=record, scope=record.scope),
        renderer,
        create("disclosure", display_name=name),
        create("watermark", payload=f"realx|cohost|{record.record_id[:8]}".encode(), key=watermark_key),
    ]
