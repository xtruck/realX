"""The model manifest as a whole: nothing loads unless its license and intended use are on record.

These checks are about policy, not about any one model: a new manifest entry that is not
permissive, not pinned, or not fetched over HTTPS fails here, and a model on the blocked list can
never be loaded, not even when somebody has already placed the file on disk.
"""

import hashlib
import re
from pathlib import Path

import pytest

from realx import models
from realx.models import BLOCKED, MANIFEST, ModelError, ModelSpec, ensure_model

ROOT = Path(__file__).resolve().parents[1]
PERMISSIVE = {"MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause"}


def test_every_manifest_entry_is_permissive_pinned_and_fetched_over_https():
    assert MANIFEST
    for key, spec in MANIFEST.items():
        assert spec.name == key, key
        assert spec.license in PERMISSIVE, f"{key}: license {spec.license!r} is not on the permissive list"
        assert spec.commercial_ok is True, f"{key}: commercial_ok must be true for a permissive model"
        assert re.fullmatch(r"[0-9a-f]{64}", spec.sha256), f"{key}: sha256 must be pinned"
        assert spec.url.startswith("https://") and all(m.startswith("https://") for m in spec.mirrors), key
        assert re.fullmatch(r"[A-Za-z0-9._-]+", spec.filename), f"{key}: filename must not hold a path"
        assert spec.purpose.strip(), f"{key}: say what the model is for"


def test_blocked_models_are_disjoint_from_the_manifest_and_never_loadable(tmp_path, monkeypatch):
    monkeypatch.setenv("REALX_MODELS_DIR", str(tmp_path))
    assert not set(BLOCKED) & set(MANIFEST)
    assert {"inswapper_128", "buffalo_l"} <= set(BLOCKED)
    for name, reason in BLOCKED.items():
        assert reason.strip(), f"{name}: a blocked model needs its reason on record"
        (tmp_path / f"{name}.onnx").write_bytes(b"already on disk")  # a pre-placed file must not help
        for download in (False, True):  # and neither may it download: the refusal comes first
            with pytest.raises(ModelError, match="blocked"):
                ensure_model(name, download=download)


def test_the_portrait_engines_found_in_the_license_review_are_blocked_with_their_reasons():
    for name in ("liveportrait", "liveportrait_animals", "xpose"):
        assert name in BLOCKED, name
    assert "InsightFace" in BLOCKED["liveportrait"] and "non-commercial" in BLOCKED["liveportrait"]
    assert "RAVDESS" in BLOCKED["liveportrait"] or "training data" in BLOCKED["liveportrait"]
    portrait_doc = (ROOT / "docs" / "PORTRAIT.md").read_text(encoding="utf-8")
    for name in ("liveportrait", "buffalo_l", "xpose"):
        assert name in portrait_doc, f"docs/PORTRAIT.md must explain {name}"


@pytest.fixture
def engines(monkeypatch):
    from realx.stages import portrait

    monkeypatch.setattr(portrait, "_ENGINES", dict(portrait._ENGINES))  # leave the real registry alone
    return portrait


class _Fake:
    name = "fake"
    test_only = False

    def load(self, portrait_rgb): ...
    def animate(self, rig, ctx_pixels): ...
    def close(self): ...


@pytest.mark.parametrize("model", ["inswapper_128", "buffalo_l", "liveportrait", "xpose", "no_such_model"])
def test_an_engine_cannot_be_built_from_a_blocked_or_unlisted_model(engines, model, monkeypatch, tmp_path):
    monkeypatch.setenv("REALX_MODELS_DIR", str(tmp_path))
    engines.register_engine("bad", _Fake, model=model)
    with pytest.raises(engines.PortraitUnavailable):
        engines.create_engine("bad")


def test_an_engine_that_is_not_test_only_must_name_the_model_it_runs(engines):
    with pytest.raises(ValueError, match="model"):
        engines.register_engine("unverified", _Fake)  # no model named: its license could not be on record
    engines.register_engine("labelled_test", _Fake, test_only=True)  # test-only engines need none
    assert "labelled_test" not in engines.available_engines()
    with pytest.raises(ValueError, match="already"):
        engines.register_engine("labelled_test", _Fake, test_only=True)


def test_a_listed_model_must_also_be_listed_for_portrait_use(engines, monkeypatch, tmp_path):
    monkeypatch.setenv("REALX_MODELS_DIR", str(tmp_path))
    engines.register_engine("wrong_use", _Fake, model="yunet")  # a permissive detector, not an animation model
    with pytest.raises(engines.PortraitUnavailable, match="portrait"):
        engines.create_engine("wrong_use")


def test_a_verified_pinned_portrait_model_does_load_and_is_never_downloaded_silently(engines, monkeypatch, tmp_path):
    blob = b"pretend weights"
    spec = ModelSpec(
        name="demo_portrait", filename="demo_portrait.onnx", url="https://example.invalid/demo_portrait.onnx",
        sha256=hashlib.sha256(blob).hexdigest(), license="Apache-2.0", commercial_ok=True,
        purpose="portrait animation (test fixture)",
    )
    monkeypatch.setitem(models.MANIFEST, "demo_portrait", spec)
    monkeypatch.setenv("REALX_MODELS_DIR", str(tmp_path))
    engines.register_engine("demo", _Fake, model="demo_portrait")
    with pytest.raises(engines.PortraitUnavailable, match="missing|fetch"):  # absent file: refuse, do not download
        engines.create_engine("demo")
    (tmp_path / "demo_portrait.onnx").write_bytes(blob)
    assert engines.create_engine("demo").name == "fake"
    (tmp_path / "demo_portrait.onnx").write_bytes(b"tampered")  # a swapped file fails its pin
    with pytest.raises(engines.PortraitUnavailable):
        engines.create_engine("demo")


def test_no_neural_engine_is_registered_and_the_only_engine_is_labelled_test_only(engines):
    assert engines.available_engines() == []  # nothing verified is enabled today
    listed = engines.available_engines(include_test_only=True)
    assert listed == ["synthetic_warp"]
    assert engines.engine_info("synthetic_warp")["test_only"] is True
    assert "neural" not in (engines.SyntheticWarp.__doc__ or "").lower().replace("not a neural", "")


DENIED_FRAGMENTS = ("inswapper", "buffalo", "simswap", "roop", "liveportrait", "xpose", "insightface", "ghost", "sberswap")


def _register_rows():
    """(name, sha256, license) rows of the manifest register in docs/LICENSE-AUDIT.md."""
    text = (ROOT / "docs" / "LICENSE-AUDIT.md").read_text(encoding="utf-8")
    return set(re.findall(r"^\|\s*`(\w+)`\s*\|\s*`([0-9a-f]{64})`\s*\|\s*([\w.-]+)\s*\|", text, re.M))


def test_every_manifest_entry_is_registered_in_the_license_audit_with_its_hash_and_license():
    rows = _register_rows()
    for key, spec in MANIFEST.items():
        assert (key, spec.sha256, spec.license) in rows, (
            f"{key}: add `{key}` | `{spec.sha256}` | {spec.license} to the manifest register in docs/LICENSE-AUDIT.md"
        )
    assert {r[0] for r in rows} <= set(MANIFEST), "register lists a model that is not in the manifest"


def test_no_manifest_entry_looks_like_a_blocked_model():
    for key, spec in MANIFEST.items():
        haystack = f"{key} {spec.filename} {spec.url} {' '.join(spec.mirrors)}".lower()
        for frag in DENIED_FRAGMENTS:
            assert frag not in haystack, f"{key}: '{frag}' marks a blocked or unverified model family"
