import http.client
import json
import struct
import time

import numpy as np
import pytest

cv2 = pytest.importorskip("cv2")
skimage_data = pytest.importorskip("skimage.data")

from realx.models import BLOCKED, MANIFEST, ModelError, ensure_model
from realx.pipeline import Pipeline, PipelineConfigError
from realx.safety import watermark
from realx.stages import create
from realx.stages.background import (
    BackgroundError,
    cover,
    decode_background,
    guided_filter,
    image_dimensions,
    load_background,
)
from realx.types import FrameContext


def encode(rgb, ext):
    ok, buf = cv2.imencode(ext, cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))
    assert ok
    return buf.tobytes()


@pytest.fixture(scope="module")
def photo():
    return skimage_data.coffee()  # public domain / CC0 sample photograph


@pytest.fixture(scope="module")
def segmenter_ready():
    try:
        ensure_model("pphumanseg")
    except ModelError as exc:
        pytest.skip(f"pphumanseg model unavailable: {exc}")


# --- the model is permissive, pinned, and the blocked list is untouched ---------------
def test_segmentation_model_is_permissive_pinned_and_blocked_list_is_intact():
    spec = MANIFEST["pphumanseg"]
    assert spec.license == "Apache-2.0" and spec.commercial_ok and len(spec.sha256) == 64
    assert all(u.startswith("https://") for u in (spec.url, *spec.mirrors))
    assert {"inswapper_128", "buffalo_l"} <= set(BLOCKED)
    for name in BLOCKED:
        with pytest.raises(ModelError, match="blocked"):
            ensure_model(name)
    assert not any(not m.commercial_ok for m in MANIFEST.values())  # nothing restricted is loadable


# --- image intake ---------------------------------------------------------------------
def test_header_check_reads_png_and_jpeg_sizes_without_decoding(photo):
    assert image_dimensions(encode(photo, ".png"))[:2] == (photo.shape[1], photo.shape[0])
    assert image_dimensions(encode(photo, ".jpg")) == (photo.shape[1], photo.shape[0], "jpeg")
    bomb = b"\x89PNG\r\n\x1a\n" + struct.pack(">I", 13) + b"IHDR" + struct.pack(">II", 60000, 60000) + b"\0" * 20
    with pytest.raises(BackgroundError, match="megapixels"):
        decode_background(bomb)


@pytest.mark.parametrize("data", [b"", b"GIF89a....", b"<svg/>", b"\xff\xd8\xff", b"\x89PNG\r\n\x1a\n"])
def test_non_photos_and_truncated_files_are_refused(data):
    with pytest.raises(BackgroundError):
        decode_background(data)


def test_photo_size_and_format_limits(photo):
    with pytest.raises(BackgroundError, match="12 MB"):
        decode_background(b"\xff\xd8\xff" + b"\0" * (12 * 1024 * 1024 + 1))
    big = np.zeros((2500, 3000, 3), np.uint8)
    out = decode_background(encode(big, ".png"))
    assert max(out.shape[:2]) == 1920 and out.dtype == np.uint8 and out.shape[2] == 3
    rgb = decode_background(encode(photo, ".png"))
    assert np.array_equal(rgb, photo)  # colours are not swapped


def test_load_background_checks_the_path(tmp_path, photo):
    with pytest.raises(BackgroundError, match="not found"):
        load_background(str(tmp_path / "missing.jpg"))
    f = tmp_path / "p.png"
    f.write_bytes(encode(photo, ".png"))
    assert load_background(str(f)).shape == photo.shape


def test_cover_fills_the_frame_without_stretching():
    img = np.zeros((100, 400, 3), np.uint8)
    img[:, 100:200] = 255  # white block; the centred 100 px crop sees its right half (source 150-200)
    out = cover(img, 100, 100)
    assert out.shape == (100, 100, 3)
    assert out[50, 10, 0] == 255 and out[50, 90, 0] == 0
    assert (out[50, :, 0] == 255).sum() == pytest.approx(50, abs=2)  # 50 source px, scale 1: no stretching


def test_guided_filter_snaps_a_coarse_matte_to_the_edges_of_the_picture():
    from realx.stages.background import smoothstep

    rng = np.random.default_rng(0)
    truth = np.zeros((480, 640), np.float32)
    cv2.ellipse(truth, (320, 170), (80, 100), 0, 0, 360, 1, -1)
    cv2.rectangle(truth, (200, 260), (440, 480), 1, -1)
    guide = np.where(truth > 0, 0.65, 0.3).astype(np.float32) + rng.normal(0, 0.03, truth.shape).astype(np.float32)
    # what the 192 px model hands us: a soft, low-resolution silhouette
    coarse = cv2.GaussianBlur(cv2.resize(cv2.resize(truth, (192, 192), interpolation=cv2.INTER_AREA), (640, 480)), (0, 0), 3)
    plain = np.abs(smoothstep(coarse, 0.35, 0.65) - truth).mean()
    snapped = np.abs(smoothstep(guided_filter(guide, coarse, radius=7, eps=2e-3), 0.35, 0.65) - truth).mean()
    assert snapped < 0.3 * plain


# --- the stage ------------------------------------------------------------------------
def _scene_frame():
    from realx.sources import SyntheticScene

    return SyntheticScene("static", head_height=300).render(0)


def test_person_is_kept_and_the_rest_becomes_the_photo(segmenter_ready, photo):
    ctx = _scene_frame()
    original = ctx.pixels.copy()
    cx, cy = (int(v) for v in ctx.meta["gt_center"])
    with Pipeline([create("bg_replace", mode="photo", image=photo)]) as pipe:
        for _ in range(3):  # let the temporal smoothing settle
            out = pipe.process(FrameContext(pixels=original.copy()))
    backdrop = cover(photo, 640, 480)
    face = (slice(cy - 30, cy + 30), slice(cx - 30, cx + 30))
    kept = (np.abs(out.pixels[face].astype(int) - original[face].astype(int)).max(axis=2) < 12).mean()
    corners = (slice(0, 70), slice(0, 70)), (slice(0, 70), slice(570, 640)), (slice(410, 480), slice(0, 70))
    replaced = np.mean(
        [(np.abs(out.pixels[c].astype(int) - backdrop[c].astype(int)).max(axis=2) < 12).mean() for c in corners]
    )
    assert kept > 0.9, f"face pixels changed: only {kept:.0%} kept"
    assert replaced > 0.95, f"background not replaced: {replaced:.0%}"
    info = out.meta["background"]
    assert info["model"] == "pphumanseg" and 0.05 < info["person_fraction"] < 0.6


def test_a_natural_photo_keeps_the_person_and_replaces_the_room(segmenter_ready, photo):
    shot = skimage_data.astronaut()  # a real portrait with a real background
    with Pipeline([create("bg_replace", mode="photo", image=photo)]) as pipe:
        out = pipe.process(FrameContext(pixels=shot.copy()))
    backdrop = cover(photo, 512, 512)
    face = (slice(85, 135), slice(205, 245))
    sky = (slice(0, 60), slice(400, 500))  # behind the shuttle model, far from the person
    same = lambda a, b, r: (np.abs(a[r].astype(int) - b[r].astype(int)).max(axis=2) < 12).mean()  # noqa: E731
    assert same(out.pixels, shot, face) > 0.9
    assert same(out.pixels, backdrop, sky) > 0.9


def test_blur_and_colour_modes_and_a_steady_matte(segmenter_ready):
    ctx = _scene_frame()
    for kw in ({"mode": "blur"}, {"mode": "color", "color": (10, 200, 30)}):
        with Pipeline([create("bg_replace", **kw)]) as pipe:
            out = pipe.process(FrameContext(pixels=ctx.pixels.copy()))
        assert out.pixels.shape == ctx.pixels.shape and out.pixels.dtype == np.uint8
    assert tuple(out.pixels[5, 5]) == (10, 200, 30)
    with Pipeline([create("bg_replace", mode="blur")]) as pipe:
        a = pipe.process(FrameContext(pixels=ctx.pixels.copy())).pixels.astype(int)
        b = pipe.process(FrameContext(pixels=ctx.pixels.copy())).pixels.astype(int)
    assert np.abs(a - b).mean() < 1.5  # identical input must not flicker


def test_stage_rejects_bad_options(photo):
    with pytest.raises(ValueError):
        create("bg_replace", mode="photo")  # photo mode needs a photo
    with pytest.raises(ValueError):
        create("bg_replace", mode="video", image=photo)
    with pytest.raises(ValueError):
        create("bg_replace", mode="color", color=(0, 0, 999))
    with pytest.raises(BackgroundError):
        create("bg_replace", mode="photo", image=np.zeros((4, 4, 3), np.uint8))


# --- provenance stays intact ----------------------------------------------------------
def test_pixel_edits_cannot_follow_a_watermark(photo):
    mark = create("watermark", payload=b"realx|s1")
    with pytest.raises(PipelineConfigError, match="after the watermark"):
        Pipeline([mark, create("bg_replace", mode="color")])
    with pytest.raises(PipelineConfigError, match="after the watermark"):
        Pipeline([create("watermark", payload=b"x"), create("avatar")])
    with pytest.raises(PipelineConfigError, match="after the watermark"):
        Pipeline([create("audio_watermark", payload=b"x"), create("voice_normalize")])
    Pipeline([create("bg_replace", mode="color"), create("watermark", payload=b"x")])  # the right order builds


def test_watermark_after_background_replacement_still_reads_back(segmenter_ready):
    key = bytes(range(1, 33))
    ctx = _scene_frame()
    with Pipeline([create("bg_replace", mode="blur"), create("watermark", payload=b"realx|bg", key=key)]) as pipe:
        out = pipe.process(FrameContext(pixels=ctx.pixels.copy()))
    assert watermark.extract(out.pixels, key=key) == b"realx|bg"


def test_background_stage_is_not_a_way_around_the_consent_gate():
    # replacing a background is not identity synthesis, but a swap in the same pipeline still needs its gate
    with pytest.raises(PipelineConfigError, match="consent gate"):
        Pipeline([create("bg_replace", mode="color"), create("swap_stub", source_identity="alice"), create("watermark", payload=b"x")])


# --- control room server --------------------------------------------------------------
@pytest.fixture(scope="module")
def server(segmenter_ready):
    try:
        ensure_model("yunet")
    except ModelError as exc:
        pytest.skip(f"yunet model unavailable: {exc}")
    from realx.server import Engine, Server

    srv = Server(Engine(source="demo:static"), port=0)
    srv.start()
    deadline = time.time() + 20
    while time.time() < deadline and srv.engine.stats()["frames"] < 3:
        time.sleep(0.1)
    yield srv
    srv.stop()


def call(server, path, body, ctype):
    c = http.client.HTTPConnection("127.0.0.1", server.port, timeout=20)
    c.request("POST", path, body=body, headers={"Host": f"127.0.0.1:{server.port}", "Content-Type": ctype})
    r = c.getresponse()
    data = r.read()
    c.close()
    return r.status, data


def jpeg_frame(server):
    c = http.client.HTTPConnection("127.0.0.1", server.port, timeout=15)
    c.request("GET", "/stream.mjpg", headers={"Host": f"127.0.0.1:{server.port}"})
    r = c.getresponse()
    buf = r.read(60000)
    c.close()
    start = buf.index(b"\xff\xd8")
    return cv2.imdecode(np.frombuffer(buf[start:], np.uint8), cv2.IMREAD_COLOR)


def test_server_background_flow_validates_and_changes_the_picture(server, photo):
    cfg = lambda d: call(server, "/api/config", json.dumps(d).encode(), "application/json")  # noqa: E731
    assert cfg({"background": "photo"})[0] == 400  # no photo uploaded yet
    assert cfg({"background": "sparkles"})[0] == 400
    assert call(server, "/api/background", b"GIF89a", "image/gif")[0] == 400  # wrong type
    assert call(server, "/api/background", b"not an image", "image/png")[0] == 400
    assert call(server, "/api/background", encode(photo, ".jpg"), "image/jpeg")[0] == 200
    assert cfg({"background": "photo", "mode": "original"})[0] == 200
    time.sleep(2.0)
    frame = jpeg_frame(server)
    backdrop = cv2.cvtColor(cover(photo, 640, 480), cv2.COLOR_RGB2BGR)
    corner = (slice(0, 60), slice(0, 60))
    assert np.abs(frame[corner].astype(int) - backdrop[corner].astype(int)).mean() < 14
    assert server.engine.stats()["config"]["background"] == "photo"
    assert cfg({"background": "off", "mode": "avatar"})[0] == 200


# --- B2-07: the cheaper blend and smoothstep must match the old code within one level -------------


def _old_smoothstep(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def _old_blend(rgb, alpha2d, backdrop):
    alpha = alpha2d[..., None]
    out = rgb.astype(np.float32) * alpha + backdrop.astype(np.float32) * (1.0 - alpha)
    return np.clip(out + 0.5, 0, 255).astype(np.uint8)


def test_smoothstep_matches_the_old_formula():
    from realx.stages.background import smoothstep

    x = np.random.default_rng(3).uniform(-0.2, 1.2, (64, 64)).astype(np.float32)
    new, old = smoothstep(x, 0.35, 0.65), _old_smoothstep(x, 0.35, 0.65)
    assert new.dtype == old.dtype
    assert np.abs(new - old).max() < 1e-5
    assert np.array_equal(x, x.copy())  # the input is not modified in place


def test_bg_replace_blend_matches_the_old_code_within_one_level():
    from realx.stages.background import BackgroundReplace
    from realx.types import FrameContext

    rng = np.random.default_rng(7)
    h, w = 120, 160
    rgb = rng.integers(0, 256, (h, w, 3), dtype=np.uint8)
    yy, xx = np.mgrid[0:h, 0:w]
    alpha = _old_smoothstep(np.clip(1.0 - np.hypot(xx - 80, yy - 60) / 50.0, 0, 1).astype(np.float32), 0.2, 0.8)
    alpha = alpha.astype(np.float32)  # exact 0 and 1 regions plus a soft edge

    class FakeSeg:
        def matte(self, _rgb):
            return alpha

        def setup(self): ...
        def close(self): ...

    stage = BackgroundReplace(mode="color", color=(20, 200, 90))
    stage._seg = FakeSeg()
    backdrop = np.full_like(rgb, (20, 200, 90))
    original = rgb.copy()
    ctx = stage.process(FrameContext(pixels=rgb, index=0))
    expected = _old_blend(original, alpha, backdrop)
    assert ctx.pixels.dtype == np.uint8 and ctx.pixels.shape == rgb.shape
    assert np.abs(ctx.pixels.astype(int) - expected.astype(int)).max() <= 1
    assert np.array_equal(rgb, original)  # the camera buffer is never edited
    assert ctx.meta["background"]["person_fraction"] == pytest.approx(float(alpha.mean()))
