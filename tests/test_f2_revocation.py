"""F2: deleting a .revoked tombstone does not restore consent."""

from __future__ import annotations

import pytest

from realx.safety.cohost import CohostVault
from realx.safety.consent import ConsentError


def test_deleting_the_tombstone_does_not_restore_consent(tmp_path):
    v = CohostVault(tmp_path / "v")
    g = v.grant("Kofi", agreed=True)
    v.revoke(g.record.record_id, g.revoke_code)
    (tmp_path / "v" / f"{g.record.record_id}.revoked").unlink()
    with pytest.raises(ConsentError, match="revoked"):
        CohostVault(tmp_path / "v").check(g.path)
    with pytest.raises(ConsentError, match="revoked"):
        v.check(g.path)


def test_a_missing_revocation_index_fails_closed_when_grants_exist(tmp_path):
    v = CohostVault(tmp_path / "v")
    g = v.grant("Kofi", agreed=True)
    (tmp_path / "v" / "revocations.idx").unlink()
    with pytest.raises(ConsentError, match="revoked"):
        CohostVault(tmp_path / "v").check(g.path)


def test_a_tampered_revocation_index_fails_closed(tmp_path):
    v = CohostVault(tmp_path / "v")
    g = v.grant("Kofi", agreed=True)
    (tmp_path / "v" / "revocations.idx").write_text('{"ids": [], "mac": "00"}')
    with pytest.raises(ConsentError, match="revoked"):
        v.check(g.path)


def test_an_untouched_vault_still_works(tmp_path):
    v = CohostVault(tmp_path / "v")
    g = v.grant("Kofi", agreed=True)
    v2 = CohostVault(tmp_path / "v")
    v2.check(g.path)
    v2.revoke(g.record.record_id, g.revoke_code)
    with pytest.raises(ConsentError, match="revoked"):
        v.check(g.path)
