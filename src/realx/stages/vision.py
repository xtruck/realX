from __future__ import annotations

import math

import numpy as np

from realx.models import ensure_model
from realx.stages.base import register
from realx.tracking import FaceTracker, same_face
from realx.types import Face, FrameContext

# Gamma lift for dim frames: darker skin tones in poor light otherwise fall below the
# detector's confidence floor (measured on a real webcam: 3% -> 43% of frames at 0.6).
_DARK_BELOW = 110
_LIFT = np.array([255.0 * (i / 255.0) ** 0.6 for i in range(256)], dtype=np.uint8)


@register("detect_yunet")
class YuNetDetector:
    """Face boxes + 5 landmarks with the MIT-licensed YuNet model (CPU friendly).

    YuNet is trained for faces roughly 20-80 px wide. A webcam selfie face is often
    150+ px, which it finds poorly, so the frame is searched at several small input
    widths (`input_widths`) and results are merged. The full-size frame is only tried
    when nothing was found. Measured on a real 640x480 webcam in a dim room: 3% of
    frames at the single-scale default versus 100% with a 192 px input, in 3 ms.
    """

    name = "detect"

    def __init__(
        self,
        score_threshold: float = 0.3,
        input_widths: tuple[int, ...] = (192, 352),
        full_size_fallback: bool = True,
        lift_dark: bool = True,
        top_k: int = 20,
        max_side: int = 640,
    ) -> None:
        if not 0.0 < score_threshold <= 1.0 or top_k < 1 or max_side < 64:
            raise ValueError("invalid detector options")
        if not input_widths or any(w < 64 for w in input_widths):
            raise ValueError("input_widths must be >= 64 px")
        self.score_threshold = score_threshold
        self.input_widths = tuple(sorted(input_widths))
        self.full_size_fallback = full_size_fallback
        self.lift_dark = lift_dark
        self.top_k = top_k
        self.max_side = max_side
        self._det = None
        self._size: tuple[int, int] | None = None

    def setup(self) -> None:
        import cv2  # local import: optional dependency

        path = ensure_model("yunet")
        self._det = cv2.FaceDetectorYN.create(str(path), "", (320, 320), self.score_threshold, 0.3, 5000)
        self._size = None

    def _detect(self, rgb: np.ndarray, width: int) -> list[Face]:
        import cv2

        h, w = rgb.shape[:2]
        scale = min(1.0, width / w)
        img = rgb
        if scale < 1.0:
            img = cv2.resize(rgb, (max(1, int(round(w * scale))), max(1, int(round(h * scale)))), interpolation=cv2.INTER_AREA)
        ih, iw = img.shape[:2]
        if self._size != (iw, ih):
            self._det.setInputSize((iw, ih))
            self._size = (iw, ih)
        _, rows = self._det.detect(cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
        out: list[Face] = []
        if rows is not None:
            for r in rows:
                x, y, bw, bh = (float(v) / scale for v in r[:4])
                lm = np.array(r[4:14], dtype=float).reshape(5, 2) / scale
                out.append(Face(bbox=np.array([x, y, x + bw, y + bh]), landmarks=lm, score=float(r[14])))
        return out

    @staticmethod
    def _merge(per_scale: list[list[Face]]) -> list[Face]:
        """Finest scale first. A coarser-scale box that lands on a face we already have
        is a duplicate, so box size stays consistent from frame to frame."""
        kept: list[Face] = []
        for faces in per_scale:
            for f in sorted(faces, key=lambda f: -f.score):
                if all(not same_face(f.bbox, k.bbox) for k in kept):
                    kept.append(f)
        return kept

    def process(self, ctx: FrameContext) -> FrameContext:
        rgb = ctx.pixels
        if self.lift_dark and float(rgb.mean()) < _DARK_BELOW:
            import cv2

            rgb = cv2.LUT(rgb, _LIFT)
        h, w = rgb.shape[:2]
        if max(h, w) > self.max_side:  # bound the cost on very large frames
            import cv2

            s = self.max_side / max(h, w)
            small = cv2.resize(rgb, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
            ratio = 1.0 / s
        else:
            small, ratio = rgb, 1.0
        per_scale = [self._detect(small, width) for width in self.input_widths]
        if not any(per_scale) and self.full_size_fallback:
            per_scale = [self._detect(small, small.shape[1])]
        faces = self._merge(per_scale)[: self.top_k]
        if ratio != 1.0:
            for f in faces:
                f.bbox = f.bbox * ratio
                if f.landmarks is not None:
                    f.landmarks = f.landmarks * ratio
        ctx.faces = faces
        return ctx

    def close(self) -> None:
        self._det = None


@register("track")
class Track:
    """Gives faces stable ids and bridges missed detections (fast motion)."""

    name = "track"
    stateful = True

    def __init__(self, fps: float = 30.0, use_flow: bool = True, **options) -> None:
        self.fps = fps
        self.use_flow = use_flow
        self._opts = options
        self._tracker = FaceTracker(**options)
        self._last_ts: float | None = None
        self._last_index: int | None = None
        self._prev_gray: np.ndarray | None = None

    def setup(self) -> None:
        self._tracker = FaceTracker(**self._opts)
        self._last_ts = self._last_index = None
        self._prev_gray = None

    def _flow_hints(self, gray: np.ndarray) -> dict[int, np.ndarray]:
        """Measure how each tracked face moved since the previous frame (LK flow).

        Follows image texture inside the box, which keeps working when motion blur
        makes the detector miss the face for a few frames.
        """
        import cv2

        prev = self._prev_gray
        if prev is None or prev.shape != gray.shape:
            return {}
        hints: dict[int, np.ndarray] = {}
        for tid, box, confirmed in self._tracker.track_boxes():
            if not confirmed:
                continue
            x1, y1, x2, y2 = box
            w, h = x2 - x1, y2 - y1
            if w < 16 or h < 16:
                continue
            xs = np.linspace(x1 + 0.2 * w, x2 - 0.2 * w, 5)
            ys = np.linspace(y1 + 0.2 * h, y2 - 0.2 * h, 5)
            pts = np.array([[x, y] for y in ys for x in xs], dtype=np.float32).reshape(-1, 1, 2)
            inside = (
                (pts[:, 0, 0] >= 0) & (pts[:, 0, 0] < gray.shape[1]) & (pts[:, 0, 1] >= 0) & (pts[:, 0, 1] < gray.shape[0])
            )
            if inside.sum() < 8:
                continue
            nxt, status, err = cv2.calcOpticalFlowPyrLK(
                prev, gray, pts, None, winSize=(31, 31), maxLevel=4,
                criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 20, 0.03),
            )
            ok = (status.reshape(-1) == 1) & inside & np.isfinite(nxt).all(axis=(1, 2))
            if ok.sum() < 8:
                continue
            shift = (nxt - pts).reshape(-1, 2)[ok]
            dx, dy = np.median(shift, axis=0)
            spread = np.median(np.abs(shift - np.array([dx, dy])), axis=0)
            size = max(w, h)
            if spread.max() > 0.25 * size or np.hypot(dx, dy) > 3.0 * size:
                continue  # points disagree or implausible jump: do not trust
            hints[tid] = np.array([dx, dy])
        return hints

    def _elapsed_frames(self, ctx: FrameContext) -> float:
        """Real frames since the previous processed frame (skipped frames count)."""
        dt = 1.0
        if ctx.timestamp > 0 and self._last_ts is not None and ctx.timestamp > self._last_ts:
            dt = (ctx.timestamp - self._last_ts) * self.fps
        elif self._last_index is not None and ctx.index > self._last_index:
            dt = float(ctx.index - self._last_index)
        self._last_ts = ctx.timestamp if ctx.timestamp > 0 else self._last_ts
        self._last_index = ctx.index
        return min(max(dt, 1.0), 60.0)

    def process(self, ctx: FrameContext) -> FrameContext:
        ctx.meta["elapsed_frames"] = dt = self._elapsed_frames(ctx)
        hints: dict[int, np.ndarray] = {}
        if self.use_flow:
            import cv2

            gray = cv2.cvtColor(ctx.pixels, cv2.COLOR_RGB2GRAY)
            if dt <= 8:  # flow is only reliable across short gaps
                hints = self._flow_hints(gray)
            self._prev_gray = gray
        ctx.faces = self._tracker.update(ctx.faces, dt=dt, hints=hints)
        return ctx

    def close(self) -> None:
        self._tracker.reset()


@register("debug_boxes")
class DebugBoxes:
    """Draws what the tracker sees: boxes, landmarks and ids. Amber means coasting."""

    name = "debug_boxes"

    def setup(self) -> None: ...

    def process(self, ctx: FrameContext) -> FrameContext:
        import cv2

        canvas = ctx.pixels.copy()  # never draw on the caller's buffer
        for face in ctx.faces:
            if not np.all(np.isfinite(face.bbox)):
                continue
            x1, y1, x2, y2 = (int(round(v)) for v in face.bbox)
            color = (232, 162, 58) if face.predicted else (14, 190, 140)
            cv2.rectangle(canvas, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)
            if face.landmarks is not None:
                for px, py in face.landmarks:
                    cv2.circle(canvas, (int(px), int(py)), 3, color, -1, cv2.LINE_AA)
            label = f"#{face.track_id}" + (" coasting" if face.predicted else "")
            cv2.putText(canvas, label, (x1, max(14, y1 - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)
        ctx.pixels = canvas
        return ctx

    def close(self) -> None: ...


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

        canvas = ctx.pixels.copy()  # never draw on the caller's buffer
        for face in ctx.faces:
            if not np.all(np.isfinite(face.bbox)):
                continue
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
