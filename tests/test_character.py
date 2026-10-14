import glob
import importlib.util
import json
import os
import struct
import time
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_BONES = {
    "hips", "spine", "head", "leftUpperLeg", "leftLowerLeg", "leftFoot", "rightUpperLeg", "rightLowerLeg",
    "rightFoot", "leftUpperArm", "leftLowerArm", "leftHand", "rightUpperArm", "rightLowerArm", "rightHand",
}


def load_glb(data: bytes):
    magic, version, length = struct.unpack("<4sII", data[:12])
    assert magic == b"glTF" and version == 2 and length == len(data)
    jlen, jtype = struct.unpack("<I4s", data[12:20])
    assert jtype == b"JSON"
    gltf = json.loads(data[20 : 20 + jlen])
    blen, btype = struct.unpack("<I4s", data[20 + jlen : 28 + jlen])
    assert btype == b"BIN\x00" and 28 + jlen + blen == len(data)
    return gltf, blen


@pytest.fixture(scope="module")
def pip():
    return load_glb((ROOT / "src/realx/web/avatars/pip.vrm").read_bytes())


def test_bundled_character_is_a_valid_vrm1_humanoid(pip):
    gltf, blen = pip
    vrm = gltf["extensions"]["VRMC_vrm"]
    assert vrm["specVersion"] == "1.0"
    bones = vrm["humanoid"]["humanBones"]
    assert REQUIRED_BONES <= set(bones)
    assert all(0 <= b["node"] < len(gltf["nodes"]) for b in bones.values())
    assert len({b["node"] for b in bones.values()}) == len(bones)
    assert gltf["buffers"][0]["byteLength"] == blen
    for view in gltf["bufferViews"]:
        assert view["byteOffset"] + view["byteLength"] <= blen


def test_expressions_bind_to_real_morph_targets(pip):
    gltf, _ = pip
    presets = gltf["extensions"]["VRMC_vrm"]["expressions"]["preset"]
    assert {"blink", "aa", "ih", "ou", "ee", "oh", "happy"} <= set(presets)
    for name, expr in presets.items():
        for bind in expr["morphTargetBinds"]:
            mesh = gltf["meshes"][gltf["nodes"][bind["node"]]["mesh"]]
            assert bind["index"] < len(mesh["primitives"][0]["targets"]), name


def test_character_is_original_and_openly_licensed(pip):
    gltf, _ = pip
    meta = gltf["extensions"]["VRMC_vrm"]["meta"]
    assert meta["name"] == "Pip" and "CC0" in meta["copyrightInformation"]
    assert "not based on any real person" in meta["copyrightInformation"]
    assert meta["allowExcessivelySexualUsage"] is False and meta["allowAntisocialOrHateUsage"] is False
    assert not gltf.get("images") and not gltf.get("textures")  # no photographic data inside


def test_generator_output_matches_the_committed_file():
    spec = importlib.util.spec_from_file_location("make_character", ROOT / "scripts/make_character.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    assert mod.build() == (ROOT / "src/realx/web/avatars/pip.vrm").read_bytes()


def test_custom_avatar_must_be_a_small_glb(tmp_path):
    from realx.server import MAX_AVATAR_BYTES, load_avatar

    bad = tmp_path / "x.vrm"
    bad.write_bytes(b"<html>not a model</html>")
    with pytest.raises(ValueError, match="vrm"):
        load_avatar(str(bad))
    good = tmp_path / "y.vrm"
    good.write_bytes(b"glTF" + b"\0" * 100)
    assert load_avatar(str(good)).startswith(b"glTF")
    huge = tmp_path / "z.vrm"
    huge.write_bytes(b"glTF" + b"\0" * (MAX_AVATAR_BYTES + 1))
    with pytest.raises(ValueError, match="larger"):
        load_avatar(str(huge))


def test_bundle_has_no_hardcoded_external_hosts():
    js = (ROOT / "src/realx/web/avatar.bundle.js").read_text(encoding="utf-8", errors="ignore")
    # real hosts only: MediaPipe's protobuf type names contain "type.googleapis.com/..." but are never requested
    for needle in ("https://cdn", "http://cdn", "storage.googleapis.com", "fonts.googleapis.com", "www.googleapis.com", "analytics"):
        assert needle not in js


# --- real browser check: loads the model, receives rig numbers over the WebSocket ----
def _chromium():
    exe = os.environ.get("REALX_CHROMIUM")
    if exe and os.path.exists(exe):
        return exe
    hits = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    return hits[-1] if hits else None


def test_character_renders_and_follows_the_tracker_in_a_real_browser():
    sync_api = pytest.importorskip("playwright.sync_api")
    pytest.importorskip("skimage")
    exe = _chromium()
    if not exe:
        pytest.skip("no Chromium found (set REALX_CHROMIUM)")
    from realx.models import ensure_model

    try:
        ensure_model("yunet")
    except Exception as exc:
        pytest.skip(f"yunet model unavailable: {exc}")
    from realx.server import Engine, Server

    srv = Server(Engine(source="demo:dance"), port=0)
    srv.start()
    try:
        with sync_api.sync_playwright() as p:
            browser = p.chromium.launch(
                executable_path=exe,
                args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
            )
            page = browser.new_page(viewport={"width": 480, "height": 480})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{srv.port}/avatar")
            page.wait_for_function("window.__realx && window.__realx.modelLoaded", timeout=30000)
            time.sleep(3)
            state = page.evaluate("window.__realx")
            badge = page.inner_text("#badge")
            shot = page.screenshot()
            browser.close()
        assert not errors and state["error"] is None
        assert state["connected"] and state["rigMessages"] > 5 and state["pose"]["live"]
        assert "Virtual character" in badge
        import cv2
        import numpy as np

        img = cv2.imdecode(np.frombuffer(shot, np.uint8), cv2.IMREAD_COLOR)
        painted = int((img.min(axis=2) < 235).sum())  # the page is white; the character is not
        assert painted > 0.1 * img.shape[0] * img.shape[1]
    finally:
        srv.stop()


def test_emote_button_reaches_the_character_page_and_outfit_recolours_only_the_outfit():
    sync_api = pytest.importorskip("playwright.sync_api")
    pytest.importorskip("skimage")
    exe = _chromium()
    if not exe:
        pytest.skip("no Chromium found (set REALX_CHROMIUM)")
    from realx.models import ensure_model

    try:
        ensure_model("yunet")
    except Exception as exc:
        pytest.skip(f"yunet model unavailable: {exc}")
    import http.client

    from realx.server import Engine, Server

    srv = Server(Engine(source="demo:static"), port=0)
    srv.start()
    try:
        with sync_api.sync_playwright() as p:
            browser = p.chromium.launch(
                executable_path=exe,
                args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
            )
            page = browser.new_page(viewport={"width": 320, "height": 320})
            page.goto(f"http://127.0.0.1:{srv.port}/avatar?outfit=ocean")
            page.wait_for_function("window.__realx && window.__realx.modelLoaded", timeout=30000)
            time.sleep(1.5)
            c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
            c.request("POST", "/api/emote", body=json.dumps({"name": "wave"}),
                      headers={"Host": f"127.0.0.1:{srv.port}", "Content-Type": "application/json"})
            assert c.getresponse().status == 200
            c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=10)
            c.request("POST", "/api/emote", body=json.dumps({"name": "explode"}),
                      headers={"Host": f"127.0.0.1:{srv.port}", "Content-Type": "application/json"})
            assert c.getresponse().status == 400
            for _ in range(50):  # polled with plain evaluate calls: the page's CSP forbids eval
                if "wave" in page.evaluate("window.__realx.emotes"):
                    break
                time.sleep(0.2)
            assert "wave" in page.evaluate("window.__realx.emotes")
            assert page.evaluate("window.__realx.outfit") == "ocean"
            browser.close()
    finally:
        srv.stop()
