import json
import os
import stat

import numpy as np
import pytest

from realx.pipeline import Pipeline, PipelineConfigError
from realx.safety import ConsentError, watermark
from realx.safety.cohost import AGREEMENT, CohostVault, cohost_stages
from realx.stages import create
from realx.types import FrameContext

KEY = bytes(range(1, 33))


@pytest.fixture
def vault(tmp_path):
    return CohostVault(tmp_path / "vault")


def frame(h=240, w=320):
    return FrameContext(pixels=np.full((h, w, 3), 120, np.uint8))


# --- granting needs a real agreement and leaves the co-host in control ----------------
def test_grant_needs_confirmation_and_a_usable_name(vault):
    with pytest.raises(ConsentError, match="agreed"):
        vault.grant("Kofi", days=7)
    for bad in ("", "   ", "!!!"):
        with pytest.raises(ValueError):
            vault.grant(bad, agreed=True)
    assert "revoke code" in AGREEMENT


def test_grant_check_and_expiry_limits(vault):
    g = vault.grant("Kofi M.", days=7, agreed=True)
    record, name = vault.check(g.path)
    assert name == "Kofi M." and record.subject_id == "kofi-m" and record.scope == "live"
    with pytest.raises(ValueError):
        vault.grant("Kofi", days=400, agreed=True)  # more than a year is refused by the store
    with pytest.raises(ConsentError, match="allow"):
        vault.check(g.path, scope="export")


def test_only_the_holder_of_the_revoke_code_can_switch_consent_off(vault):
    g = vault.grant("Kofi", agreed=True)
    stored = json.loads(g.path.read_text())
    assert g.revoke_code not in json.dumps(stored)  # only a hash is kept
    for bad in ("", "guess", g.revoke_code + "x"):
        with pytest.raises(ConsentError, match="wrong revoke code"):
            vault.revoke(g.record.record_id, bad)
    vault.check(g.path)
    vault.revoke(g.record.record_id, g.revoke_code)
    with pytest.raises(ConsentError, match="revoked"):
        vault.check(g.path)
    assert CohostVault(vault.root).list()[0]["state"] == "consent revoked"  # still revoked after a restart
    with pytest.raises(ConsentError, match="revoked"):
        CohostVault(vault.root).check(g.path)
    with pytest.raises(ConsentError, match="no such"):
        vault.revoke("../../etc/passwd", "x")


def test_edited_or_foreign_consent_files_are_rejected(vault, tmp_path):
    g = vault.grant("Kofi", agreed=True)
    doc = json.loads(g.path.read_text())
    doc["record"]["expires_at"] += 10**7  # stretch the expiry
    forged = tmp_path / "forged.json"
    forged.write_text(json.dumps(doc))
    with pytest.raises(ConsentError, match="signature"):
        vault.check(forged)
    other = CohostVault(tmp_path / "other")  # someone else's vault key
    with pytest.raises(ConsentError):
        other.check(g.path)
    garbage = tmp_path / "g.json"
    garbage.write_text("{}")
    with pytest.raises(ConsentError, match="cannot read"):
        vault.check(garbage)


@pytest.mark.skipif(os.name == "nt", reason="POSIX permissions")
def test_signing_key_is_private_to_the_user(vault):
    mode = stat.S_IMODE((vault.root / "signing.key").stat().st_mode)
    assert mode == 0o600


# --- the disclosure label ------------------------------------------------------------
def test_disclosure_is_a_solid_readable_bar_on_every_frame():
    st = create("disclosure", display_name="Kofi")
    for h, w in ((240, 320), (480, 640), (720, 1280)):
        out = st.process(frame(h, w))
        bar = max(24, round(0.06 * h))
        band = out.pixels[h - bar :]
        assert out.pixels[: h - bar].max() == 120  # nothing else is touched
        assert band.mean() < 120 and band.max() == 255  # dark bar with white text
        assert (band == 255).all(axis=2).sum() > 40  # text really got drawn
        assert "DIGITAL HOST" in out.meta["disclosure"] and "Kofi" in out.meta["disclosure"]
        assert "shown with permission" in out.meta["disclosure"]


def test_disclosure_cleans_names_and_cannot_be_empty():
    assert "\n" not in create("disclosure", display_name="A\nB\x00C").text
    assert len(create("disclosure", display_name="x" * 500).text) < 90
    with pytest.raises(ValueError):
        create("disclosure", display_name="\n\t")


# --- the pipeline will not run a likeness without gate, label and mark ----------------
def test_likeness_needs_gate_then_visible_label_then_watermark(vault):
    g = vault.grant("Kofi", agreed=True)
    record, _ = vault.check(g.path)
    gate = lambda: create("consent_gate", store=vault.store, record=record)  # noqa: E731
    swap = lambda: create("swap_stub", source_identity=record.subject_id)  # noqa: E731
    mark = lambda: create("watermark", payload=b"x")  # noqa: E731
    label = lambda: create("disclosure", display_name="Kofi")  # noqa: E731
    with pytest.raises(PipelineConfigError, match="disclosure"):
        Pipeline([gate(), swap(), mark()], strict=False)  # no label
    with pytest.raises(PipelineConfigError, match="disclosure"):
        Pipeline([gate(), swap(), mark(), label()], strict=False)  # label after the mark is not accepted
    with pytest.raises(PipelineConfigError):
        Pipeline([swap(), label(), mark()], strict=False)  # no consent gate
    with pytest.raises(PipelineConfigError, match="watermark"):
        Pipeline([gate(), swap(), label()], strict=False)  # no mark
    Pipeline([gate(), swap(), label(), mark()], strict=False)


def test_cohost_pipeline_runs_labelled_marked_and_stops_when_consent_is_revoked(vault):
    g = vault.grant("Kofi", agreed=True)
    stages = cohost_stages(vault, g.path, create("swap_stub", source_identity="kofi"), watermark_key=KEY)
    with Pipeline(stages, strict=False) as pipe:
        out = pipe.process(frame(480, 640))
        assert out.meta["swapped_with"] == "kofi" and "DIGITAL HOST" in out.meta["disclosure"]
        assert watermark.extract(out.pixels, key=KEY) == f"realx|cohost|{g.record.record_id[:8]}".encode()
        vault.revoke(g.record.record_id, g.revoke_code)
        with pytest.raises(ConsentError, match="revoked"):  # a stream already running stops at the next frame
            pipe.process(frame(480, 640))
    with pytest.raises(ConsentError, match="revoked"):
        cohost_stages(vault, g.path, create("swap_stub", source_identity="kofi"))  # and cannot restart


def test_a_different_persons_consent_does_not_cover_the_renderer(vault):
    g = vault.grant("Kofi", agreed=True)
    stages = cohost_stages(vault, g.path, create("swap_stub", source_identity="someone-else"))
    with Pipeline(stages, strict=False) as pipe:
        with pytest.raises(ConsentError, match="does not cover"):
            pipe.process(frame())


def test_no_real_face_renderer_ships_and_blocked_models_stay_blocked():
    from realx.models import BLOCKED, MANIFEST
    from realx.stages import available

    assert {"inswapper_128", "buffalo_l"} <= set(BLOCKED)
    # landmark and detection models are fine; nothing that swaps or generates a face may be loadable
    assert not any("swap" in m.name or "swap" in m.purpose or "generat" in m.purpose for m in MANIFEST.values())
    assert "swap_stub" in available() and "face_swap" not in available()


def test_cli_grant_needs_the_friend_flag_and_revoke_works(tmp_path, monkeypatch, capsys):
    from realx.cli import main

    monkeypatch.setenv("REALX_HOME", str(tmp_path))
    assert main(["cohost", "grant", "--name", "Kofi"]) == 2
    assert main(["cohost", "grant", "--name", "Kofi", "--friend-agreed"]) == 0
    out = capsys.readouterr().out
    code = out.split("shown only once): ")[1].split()[0]
    path = out.split("consent saved: ")[1].split()[0]
    rid = os.path.basename(path)[:-5]  # portable: Windows paths use backslashes
    assert main(["cohost", "check", "--file", path]) == 0
    assert main(["cohost", "revoke", "--id", rid, "--code", "nope"]) == 2
    assert main(["cohost", "revoke", "--id", rid, "--code", code]) == 0
    assert main(["cohost", "check", "--file", path]) == 2


# --- hardening found in review ----------------------------------------------------------
def test_revoking_from_another_process_stops_a_stream_that_is_already_running(tmp_path):
    root = tmp_path / "v"
    running = CohostVault(root)
    g = running.grant("Kofi", agreed=True)
    stages = cohost_stages(running, g.path, create("swap_stub", source_identity="kofi"))
    with Pipeline(stages, strict=False) as pipe:
        pipe.process(frame())
        CohostVault(root).revoke(g.record.record_id, g.revoke_code)  # the co-host, in a separate process
        with pytest.raises(ConsentError, match="revoked"):
            pipe.process(frame())


def test_emptying_or_corrupting_vault_files_cannot_undo_a_revocation(vault):
    g = vault.grant("Kofi", agreed=True)
    vault.revoke(g.record.record_id, g.revoke_code)
    (vault.root / "revoked.json").write_text("[]")  # the old list file means nothing now
    (vault.root / f"{g.record.record_id}.revoked").write_text("garbage")  # even damaged, it still counts
    with pytest.raises(ConsentError, match="revoked"):
        CohostVault(vault.root).check(g.path)


def test_the_name_in_the_disclosure_bar_must_match_the_signed_person(vault):
    g = vault.grant("Kofi M.", agreed=True)
    doc = json.loads(g.path.read_text())
    doc["display_name"] = "Pip the mascot"
    g.path.write_text(json.dumps(doc))
    with pytest.raises(ConsentError, match="display name"):
        vault.check(g.path)
    doc["display_name"] = "Kofi M"  # punctuation only: same person, same slug
    g.path.write_text(json.dumps(doc))
    assert vault.check(g.path)[1] == "Kofi M"


@pytest.mark.skipif(os.name == "nt", reason="POSIX permissions")
def test_vault_files_are_private_even_if_the_folder_already_existed(tmp_path):
    root = tmp_path / "v"
    root.mkdir(mode=0o755)
    v = CohostVault(root)
    g = v.grant("Kofi", agreed=True)
    v.revoke(g.record.record_id, g.revoke_code)
    assert stat.S_IMODE(root.stat().st_mode) == 0o700
    for f in root.iterdir():
        assert stat.S_IMODE(f.stat().st_mode) == 0o600, f.name
    assert not list(root.glob("*.tmp"))


class _Paint:
    name = "paint"
    alters_media = True

    def setup(self): ...
    def process(self, ctx):
        ctx.pixels = ctx.pixels.copy()
        ctx.pixels[-40:] = 0
        return ctx
    def close(self): ...


class _OnlyLikeness:
    name = "likeness_only"
    uses_likeness = True  # no requires_consent on purpose

    def setup(self): ...
    def process(self, ctx):
        return ctx
    def close(self): ...


def test_nothing_may_edit_the_picture_between_the_label_and_the_watermark(vault):
    g = vault.grant("Kofi", agreed=True)
    record, _ = vault.check(g.path)
    gate = create("consent_gate", store=vault.store, record=record)
    swap = create("swap_stub", source_identity="kofi")
    label = create("disclosure", display_name="Kofi")
    mark = create("watermark", payload=b"x")
    with pytest.raises(PipelineConfigError, match="cover the disclosure"):
        Pipeline([gate, swap, label, _Paint(), mark], strict=False)
    with pytest.raises(PipelineConfigError, match="cover the disclosure"):
        Pipeline([gate, swap, label, create("bg_replace", mode="color"), mark], strict=False)
    Pipeline([gate, swap, _Paint(), label, mark], strict=False)  # edits before the label are fine


def test_a_likeness_stage_needs_the_gate_and_the_watermark_even_without_requires_consent():
    with pytest.raises(PipelineConfigError, match="consent gate"):
        Pipeline([_OnlyLikeness(), create("disclosure", display_name="Kofi"), create("watermark", payload=b"x")], strict=False)
    with pytest.raises(PipelineConfigError):
        Pipeline([_OnlyLikeness(), create("disclosure", display_name="Kofi")], strict=False)


def test_emote_ids_carry_a_per_start_token_so_restarts_cannot_collide():
    from realx.server import Engine

    a, b = Engine(), Engine()
    for e in (a, b):
        e.emote("wave")
        e.emote("wave")
    assert a._epoch != b._epoch


def test_revoke_codes_never_start_with_a_dash(tmp_path, monkeypatch):
    # token_urlsafe can begin with '-', which argparse would take for an option: `--code -abc...` fails
    import realx.safety.cohost as cohost_mod

    real = cohost_mod.secrets.token_urlsafe
    draws = iter(["-" + "A" * 15, "-" + "B" * 15])
    monkeypatch.setattr(cohost_mod.secrets, "token_urlsafe", lambda n=None: next(draws, None) or real(n))
    g = CohostVault(tmp_path / "v").grant("Kofi", agreed=True)
    assert not g.revoke_code.startswith("-") and len(g.revoke_code) >= 16


def test_cli_revoke_works_for_every_kind_of_code(tmp_path, monkeypatch, capsys):
    from realx.cli import main

    monkeypatch.setenv("REALX_HOME", str(tmp_path))
    for _ in range(100):   # the old code failed about 1 time in 64
        assert main(["cohost", "grant", "--name", "Kofi", "--friend-agreed"]) == 0
        out = capsys.readouterr().out
        code = out.split("shown only once): ")[1].split()[0]
        rid = os.path.basename(out.split("consent saved: ")[1].split()[0])[:-5]
        assert main(["cohost", "revoke", "--id", rid, "--code", code]) == 0
