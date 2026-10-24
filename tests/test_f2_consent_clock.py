"""F2: expiry survives a clock set back (B3-06)."""

from __future__ import annotations

import pytest

from realx.safety.cohost import CohostVault
from realx.safety.consent import ConsentError, ConsentStore


def _store():
    return ConsentStore(bytes(range(1, 40)))


def test_expired_consent_stays_expired_when_the_clock_goes_back():
    s = _store()
    rec = s.issue("p", "live", 100, now=1000.0)
    s.verify(rec, "live", now=1050.0)
    with pytest.raises(ConsentError, match="expired"):
        s.verify(rec, "live", now=1200.0)
    with pytest.raises(ConsentError, match="expired"):
        s.verify(rec, "live", now=1050.0)  # wall clock set back: still expired


def test_a_clock_set_back_before_the_first_use_is_not_penalised():
    s = _store()
    rec = s.issue("p", "live", 100, now=1000.0)
    s.verify(rec, "live", now=1010.0)


def test_the_high_water_mark_survives_a_restart_of_the_vault(tmp_path):
    v = CohostVault(tmp_path / "v")
    g = v.grant("Kofi", days=1, agreed=True)
    rec = g.record
    far = rec.expires_at + 10
    with pytest.raises(ConsentError, match="expired"):
        v.store.verify(rec, "live", now=far)
    v2 = CohostVault(tmp_path / "v")  # new process, same folder
    with pytest.raises(ConsentError, match="expired"):
        v2.store.verify(rec, "live", now=rec.expires_at - 5)


