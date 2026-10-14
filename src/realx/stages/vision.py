from __future__ import annotations

import math

import numpy as np

from realx.models import ensure_model
from realx.stages.base import register
from realx.tracking import FaceTracker
from realx.types import Face, FrameContext


@register("detect_yunet")
class YuNetDetector:
    """Face boxes + 5 landmarks with the MIT-licensed YuNet model (CPU friendly).

    `max_side` downsizes large frames before detection and maps results back, which
    keeps latency low on weak machines.
    """

    name = "detect"

    def __init__(self, score_threshold: float = 0.6, max_side: int = 640, top_k: int = 20) -> None:
        if not 0.0 < score_threshold <= 1.0 or max_side < 64 or top_k < 1:
            raise ValueError("invalid detector options")
        self.score_threshold = score_threshold
        self.max_side = max_side
        self.top_k = top_k
        self._det = None
        self._size: tuple[int, int] | None = None

    def setup(self) -> None:
        import cv2  # local import: optional dependency

        path = ensure_model("yunet")
        self._det = cv2.FaceDetectorYN.create(str(path), "", (320, 320), self.score_threshold, 0.3, 5000)
        self._size = None

    def process(self, ctx: FrameContext) -> FrameContext:
        import cv2

        h, w = ctx.pixels.shape[:2]
        scale = min(1.0, self.max_side / max(h, w))
        img = ctx.pixels
        if scale < 1.0:
            img = cv2.resize(img, (max(1, int(w * scale)), max(1, int(h * scale))), interpolation=cv2.INTER_AREA)
        ih, iw = img.shape[:2]
        if self._size != (iw, ih):
            self._det.setInputSize((iw, ih))
            self._size = (iw, ih)
        _, rows = self._det.detect(cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
        faces: list[Face] = []
        if rows is not None:
            for r in rows[: self.top_k]:
                x, y, bw, bh = (float(v) / scale for v in r[:4])
                lm = (np.array(r[4:14], dtype=float).reshape(5, 2)) / scale
                faces.append(
                    Face(
                        bbox=np.array([x, y, x + bw, y + bh]),
                        landmarks=lm,
                        score=float(r[14]),
                    )
                )
        ctx.faces = faces
        return ctx

    def close(self) -> None:
        self._det = None


@register("track")
class Track:
    """Gives faces stable ids and bridges missed detections (fast motion)."""

    name = "track"
    stateful = True

    def __init__(self, **options) -> None:
        self._opts = options
        self._tracker = FaceTracker(**options)

    def setup(self) -> None:
        self._tracker = FaceTracker(**self._opts)

    def process(self, ctx: FrameContext) -> FrameContext:
        ctx.faces = self._tracker.update(ctx.faces)
        return ctx

    def close(self) -> None:
        self._tracker.reset()


_PALETTE = ((255, 205, 148), (134, 212, 192), (180, 160, 255), (255, 170, 190))


@register("avatar")
class AvatarOverlay:
    """Draws a stylized cartoon avatar on each tracked face.

    No real person's face is synthesized, so this tier needs no consent gate and no
    restricted model. Eyes and mouth follow the landmarks; head tilt follows the eye
    line, so it keeps up with dancing and head turns.
    """

    name = "avatar"

    def setup(self) -> None: ...

    def process(self, ctx: FrameContext) -> FrameContext:
        import cv2

        canvas = np.ascontiguousarray(ctx.pixels)
        for face in ctx.faces:
            x1, y1, x2, y2 = (int(round(v)) for v in face.bbox)
            w, h = max(2, x2 - x1), max(2, y2 - y1)
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
            color = _PALETTE[(face.track_id or 0) % len(_PALETTE)]
            angle = 0.0
            lm = face.landmarks
            if lm is not None and len(lm) >= 5:
                dx, dy = lm[1][0] - lm[0][0], lm[1][1] - lm[0][1]
                angle = math.degrees(math.atan2(dy, dx))
            overlay = canvas.copy()
            cv2.ellipse(overlay, (cx, cy), (int(w * 0.62), int(h * 0.68)), angle, 0, 360, color, -1, cv2.LINE_AA)
            cv2.addWeighted(overlay, 0.92, canvas, 0.08, 0, dst=canvas)
            if lm is not None and len(lm) >= 5:
                eye_r = max(2, int(w * 0.09))
                for ex, ey in (lm[0], lm[1]):
                    cv2.circle(canvas, (int(ex), int(ey)), eye_r, (255, 255, 255), -1, cv2.LINE_AA)
                    cv2.circle(canvas, (int(ex), int(ey)), max(1, eye_r // 2), (30, 30, 40), -1, cv2.LINE_AA)
                nx, ny = int(lm[2][0]), int(lm[2][1])
                cv2.circle(canvas, (nx, ny), max(1, int(w * 0.04)), (200, 120, 100), -1, cv2.LINE_AA)
                m1, m2 = lm[3], lm[4]
                mid = ((m1 + m2) / 2.0 + np.array([0.0, h * 0.05])).astype(int)
                pts = np.array([m1.astype(int), mid, m2.astype(int)], dtype=np.int32)
                cv2.polylines(canvas, [pts], False, (60, 30, 50), max(2, int(w * 0.035)), cv2.LINE_AA)
            if face.predicted:
                cv2.ellipse(canvas, (cx, cy), (int(w * 0.62), int(h * 0.68)), angle, 0, 360, (255, 255, 255), 1, cv2.LINE_AA)
        ctx.pixels = canvas
        return ctx

    def close(self) -> None: ...
