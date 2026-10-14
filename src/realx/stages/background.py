"""Background replacement for the user's own camera picture.

A person-segmentation model (PP-HumanSeg, Apache-2.0) finds where the person is; the
rest of the frame is swapped for a photo you chose, blurred, or a flat colour. The
person's pixels are never regenerated or edited, so this is not face synthesis and
needs no consent gate. It does change the picture, so it is marked `alters_media`:
a pipeline refuses to place it after a provenance watermark, which it would damage.
"""

from __future__ import annotations

import struct

import numpy as np

from realx.models import ensure_model
from realx.stages.base import register
from realx.types import FrameContext

MAX_IMAGE_BYTES = 12 * 1024 * 1024
MAX_IMAGE_PIXELS = 50_000_000
MAX_BACKGROUND_SIDE = 1920  # stored photos are shrunk to this; a stream never needs more
_MODEL_SIZE = 192
_WORK_SIDE = 640  # matte refinement runs at this size at most


class BackgroundError(ValueError):
    pass


def image_dimensions(data: bytes) -> tuple[int, int, str]:
    """Width, height and kind of a PNG or JPEG from its header, without decoding it.

    Checking the header first means a small file that claims to be huge (a decompression
    bomb) is refused before any pixel memory is allocated.
    """
    if data[:8] == b"\x89PNG\r\n\x1a\n" and len(data) >= 24 and data[12:16] == b"IHDR":
        w, h = struct.unpack(">II", data[16:24])
        return w, h, "png"
    if data[:3] == b"\xff\xd8\xff":
        pos = 2
        while pos + 9 < len(data):
            if data[pos] != 0xFF:
                pos += 1
                continue
            marker = data[pos + 1]
            if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7 or marker == 0xFF:
                pos += 1 if marker == 0xFF else 2
                continue
            (length,) = struct.unpack(">H", data[pos + 2 : pos + 4])
            if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):  # a start-of-frame marker
                h, w = struct.unpack(">HH", data[pos + 5 : pos + 9])
                return w, h, "jpeg"
            pos += 2 + length
    raise BackgroundError("the background must be a JPEG or PNG photo")


def decode_background(data: bytes) -> np.ndarray:
    """RGB uint8 photo from JPEG/PNG bytes, bounded in size and shrunk for streaming."""
    import cv2

    if not data:
        raise BackgroundError("no image was sent")
    if len(data) > MAX_IMAGE_BYTES:
        raise BackgroundError("the photo is larger than 12 MB")
    w, h, _ = image_dimensions(data)
    if w < 16 or h < 16 or w * h > MAX_IMAGE_PIXELS:
        raise BackgroundError("the photo must be between 16 px and 50 megapixels")
    bgr = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)  # drops alpha and EXIF
    if bgr is None:
        raise BackgroundError("the photo could not be read")
    scale = MAX_BACKGROUND_SIDE / max(bgr.shape[:2])
    if scale < 1:
        bgr = cv2.resize(bgr, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    return np.ascontiguousarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))


def load_background(path: str) -> np.ndarray:
    import os

    if not os.path.isfile(path):
        raise BackgroundError(f"background photo not found: {path}")
    if os.path.getsize(path) > MAX_IMAGE_BYTES:
        raise BackgroundError("the photo is larger than 12 MB")
    with open(path, "rb") as fh:
        return decode_background(fh.read())


def cover(photo: np.ndarray, width: int, height: int) -> np.ndarray:
    """Scale and centre-crop `photo` to fill width x height without stretching it."""
    import cv2

    ph, pw = photo.shape[:2]
    s = max(width / pw, height / ph)
    nw, nh = max(width, int(round(pw * s))), max(height, int(round(ph * s)))
    big = cv2.resize(photo, (nw, nh), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_LINEAR)
    x0, y0 = (nw - width) // 2, (nh - height) // 2
    return np.ascontiguousarray(big[y0 : y0 + height, x0 : x0 + width])


def guided_filter(guide: np.ndarray, src: np.ndarray, radius: int, eps: float) -> np.ndarray:
    """Edge-aware smoothing (He et al.): snaps a soft matte to the edges of the picture."""
    import cv2

    k = (2 * radius + 1, 2 * radius + 1)

    def box(x: np.ndarray) -> np.ndarray:
        return cv2.boxFilter(x, -1, k)

    mean_i, mean_p = box(guide), box(src)
    cov = box(guide * src) - mean_i * mean_p
    var = box(guide * guide) - mean_i * mean_i
    a = cov / (var + eps)
    b = mean_p - a * mean_i
    return box(a) * guide + box(b)


def smoothstep(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    t = np.clip((x - lo) / (hi - lo), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


class PersonSegmenter:
    """Soft person matte (0 background, 1 person) at the size of the input frame."""

    def __init__(self, temporal: float = 0.65, lo: float = 0.35, hi: float = 0.65) -> None:
        if not 0.0 < temporal <= 1.0 or not 0.0 <= lo < hi <= 1.0:
            raise ValueError("invalid segmenter options")
        self.temporal, self.lo, self.hi = temporal, lo, hi
        self._net = None
        self._prev: np.ndarray | None = None
        self._prev_shape: tuple[int, int] | None = None

    def setup(self) -> None:
        import cv2

        self._net = cv2.dnn.readNet(str(ensure_model("pphumanseg")))
        self._prev = None

    def close(self) -> None:
        self._net = self._prev = None

    def matte(self, rgb: np.ndarray) -> np.ndarray:
        import cv2

        if self._net is None:
            raise RuntimeError("segmenter not set up")
        h, w = rgb.shape[:2]
        small = cv2.resize(rgb, (_MODEL_SIZE, _MODEL_SIZE), interpolation=cv2.INTER_AREA)
        blob = cv2.dnn.blobFromImage((small.astype(np.float32) / 255.0 - 0.5) / 0.5)
        self._net.setInput(blob)
        prob = self._net.forward()[0][1]  # the model already outputs softmax probabilities
        if self._prev is not None and self._prev_shape == (h, w):
            prob = self.temporal * prob + (1.0 - self.temporal) * self._prev
        self._prev, self._prev_shape = prob.copy(), (h, w)

        s = min(1.0, _WORK_SIDE / max(h, w))
        ww, wh = max(16, int(round(w * s))), max(16, int(round(h * s)))
        work = cv2.resize(rgb, (ww, wh), interpolation=cv2.INTER_AREA) if s < 1 else rgb
        guide = cv2.cvtColor(work, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
        coarse = cv2.resize(prob, (ww, wh), interpolation=cv2.INTER_LINEAR)
        refined = guided_filter(guide, coarse, radius=max(3, ww // 90), eps=2e-3)
        alpha = smoothstep(refined, self.lo, self.hi).astype(np.float32)
        if (ww, wh) != (w, h):
            alpha = cv2.resize(alpha, (w, h), interpolation=cv2.INTER_LINEAR)
        return alpha


@register("bg_replace")
class BackgroundReplace:
    """Keeps the person, replaces everything else.

    mode "photo": `image` is an RGB array, or a path to a JPEG/PNG file. Set it later
    with `set_image` to change the photo without rebuilding the pipeline.
    mode "blur": the real background, blurred. mode "color": a flat `color`.
    """

    name = "bg_replace"
    stateful = True
    alters_media = True

    def __init__(
        self,
        mode: str = "photo",
        image: np.ndarray | str | None = None,
        color: tuple[int, int, int] = (20, 28, 36),
        blur: int = 41,
    ) -> None:
        if mode not in ("photo", "blur", "color"):
            raise ValueError("mode must be 'photo', 'blur' or 'color'")
        if blur < 3 or blur > 151:
            raise ValueError("blur must be between 3 and 151")
        if len(color) != 3 or any(not 0 <= c <= 255 for c in color):
            raise ValueError("color must be three values from 0 to 255")
        self.mode, self.color, self.blur = mode, tuple(int(c) for c in color), blur | 1
        self._photo: np.ndarray | None = None
        self._cover: tuple[tuple[int, int], np.ndarray] | None = None
        self._seg = PersonSegmenter()
        if mode == "photo":
            if image is None:
                raise ValueError("photo mode needs a background image")
            self.set_image(image)

    def set_image(self, image: np.ndarray | str) -> None:
        photo = load_background(image) if isinstance(image, str) else np.asarray(image)
        if photo.ndim != 3 or photo.shape[2] != 3 or photo.dtype != np.uint8 or min(photo.shape[:2]) < 16:
            raise BackgroundError("background must be an HxWx3 uint8 RGB image of at least 16 px")
        self._photo, self._cover = photo, None

    def setup(self) -> None:
        self._seg.setup()

    def close(self) -> None:
        self._seg.close()

    def _backdrop(self, rgb: np.ndarray) -> np.ndarray:
        import cv2

        h, w = rgb.shape[:2]
        if self.mode == "blur":
            return cv2.GaussianBlur(rgb, (self.blur, self.blur), 0)
        if self.mode == "color":
            return np.full_like(rgb, self.color)
        if self._cover is None or self._cover[0] != (w, h):
            self._cover = ((w, h), cover(self._photo, w, h))
        return self._cover[1]

    def process(self, ctx: FrameContext) -> FrameContext:
        rgb = ctx.pixels
        alpha = self._seg.matte(rgb)[..., None]
        out = rgb.astype(np.float32) * alpha + self._backdrop(rgb).astype(np.float32) * (1.0 - alpha)
        ctx.pixels = np.clip(out + 0.5, 0, 255).astype(np.uint8)
        ctx.meta["background"] = {"mode": self.mode, "model": "pphumanseg", "person_fraction": float(alpha.mean())}
        return ctx
