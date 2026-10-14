"""Rig solver: turns tracked face boxes and 5 landmarks into avatar control numbers.

The numbers describe head pose and expression of the person in front of the camera.
They carry no image data and no identity, so a renderer can only ever draw its own
original character from them. Angles are in radians and use the view on screen:
positive yaw turns toward the right of the image, positive pitch looks up, positive
roll tilts the top of the head toward the right of the image.

Five landmarks (eyes, nose tip, mouth corners) give head pose and smile width. They do
not give blinks or an open mouth; `TRACKED` says so, and the renderer fills those in
with idle animation until a landmark model with more points is added.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np

from realx.stages.base import register
from realx.types import Face, FrameContext

RIG_VERSION = 1
TRACKED = ("pose", "smile")  # what the numbers really measure

_CALIBRATION_FRAMES = 20
_MAX_YAW, _MAX_PITCH, _MAX_ROLL = 1.0, 0.7, 0.9
_NOSE_PROTRUSION = 0.6  # nose tip distance from the eye line plane, in eye distances
_PITCH_GAIN = 2.2
_SMILE_GAIN = 2.5


def _clamp(v: float, lo: float, hi: float) -> float:
    return lo if v < lo else hi if v > hi else v


@dataclass
class _Calibration:
    """Neutral face of one person, learned from the first frames of a track."""

    pitch_ratio: list[float] = field(default_factory=list)
    mouth_width: list[float] = field(default_factory=list)
    scale: list[float] = field(default_factory=list)
    yaw_offset: list[float] = field(default_factory=list)
    neutral_pitch: float = 0.5
    neutral_mouth: float = 1.0
    neutral_scale: float = 0.2
    neutral_yaw: float = 0.0
    done: bool = False

    def add(self, pitch_ratio: float, mouth_width: float, scale: float, yaw: float) -> None:
        if self.done:
            return
        self.pitch_ratio.append(pitch_ratio)
        self.mouth_width.append(mouth_width)
        self.scale.append(scale)
        self.yaw_offset.append(yaw)
        if len(self.pitch_ratio) >= _CALIBRATION_FRAMES:
            self.neutral_pitch = float(np.median(self.pitch_ratio))
            self.neutral_mouth = float(np.median(self.mouth_width))
            self.neutral_scale = float(np.median(self.scale))
            self.neutral_yaw = float(np.median(self.yaw_offset))
            self.done = True


class RigSolver:
    """Stateful: learns each track's neutral pose over its first frames."""

    def __init__(self) -> None:
        self._calib: dict[int, _Calibration] = {}

    def reset(self) -> None:
        self._calib.clear()

    def solve(self, faces: list[Face], frame_size: tuple[int, int]) -> list[dict]:
        """Rig numbers for each face, biggest face first."""
        w, h = frame_size
        out: list[dict] = []
        live = set()
        for face in sorted(faces, key=lambda f: -float(max(0.0, (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1])))):
            if face.track_id is None or not np.all(np.isfinite(face.bbox)):
                continue
            live.add(face.track_id)
            item = self._solve_one(face, w, h)
            if item is not None:
                out.append(item)
        for gone in set(self._calib) - live:
            if len(self._calib) > 32:  # bounded memory; keep recent tracks otherwise
                del self._calib[gone]
        return out

    def _solve_one(self, face: Face, w: int, h: int) -> dict | None:
        x1, y1, x2, y2 = (float(v) for v in face.bbox)
        bw, bh = x2 - x1, y2 - y1
        if bw <= 1 or bh <= 1 or w <= 0 or h <= 0:
            return None
        cal = self._calib.setdefault(face.track_id, _Calibration())
        scale = bw / w
        item = {
            "id": int(face.track_id),
            "predicted": bool(face.predicted),
            "x": _clamp(((x1 + x2) / 2) / w * 2 - 1, -1.5, 1.5),
            "y": _clamp(((y1 + y2) / 2) / h * 2 - 1, -1.5, 1.5),
            "scale": scale,
            "depth": scale / cal.neutral_scale if cal.done else 1.0,
            "yaw": 0.0,
            "pitch": 0.0,
            "roll": 0.0,
            "smile": 0.0,
        }
        lm = face.landmarks
        if lm is None or len(lm) < 5 or not np.all(np.isfinite(lm)):
            return item
        e0, e1, nose, m0, m1 = (np.asarray(p, dtype=float) for p in lm[:5])
        axis = e1 - e0
        iod = float(np.hypot(*axis))
        if iod < 2.0:
            return item
        axis /= iod
        down = np.array([-axis[1], axis[0]])  # perpendicular, pointing toward the mouth
        eye_mid = (e0 + e1) / 2
        mouth_mid = (m0 + m1) / 2
        u = float(np.dot(nose - eye_mid, axis)) / iod
        nose_v = float(np.dot(nose - eye_mid, down))
        mouth_v = float(np.dot(mouth_mid - eye_mid, down))
        ratio = nose_v / mouth_v if mouth_v > 1e-6 else cal.neutral_pitch
        mouth_width = float(np.hypot(*(m1 - m0))) / iod
        raw_yaw = math.asin(_clamp(u / _NOSE_PROTRUSION, -1.0, 1.0))
        if not face.predicted:
            cal.add(ratio, mouth_width, scale, raw_yaw)
        item["roll"] = _clamp(math.atan2(axis[1], axis[0]), -_MAX_ROLL, _MAX_ROLL)
        item["yaw"] = _clamp(raw_yaw - cal.neutral_yaw, -_MAX_YAW, _MAX_YAW)
        item["pitch"] = _clamp((cal.neutral_pitch - ratio) * _PITCH_GAIN, -_MAX_PITCH, _MAX_PITCH)
        item["smile"] = _clamp((mouth_width - cal.neutral_mouth) * _SMILE_GAIN, 0.0, 1.0)
        return item


@register("rig")
class RigStage:
    """Puts the rig numbers for this frame in `ctx.meta["rig"]`."""

    name = "rig"
    stateful = True

    def __init__(self) -> None:
        self._solver = RigSolver()

    def setup(self) -> None:
        self._solver.reset()

    def process(self, ctx: FrameContext) -> FrameContext:
        h, w = ctx.pixels.shape[:2]
        ctx.meta["rig"] = self._solver.solve(ctx.faces, (w, h))
        return ctx

    def close(self) -> None:
        self._solver.reset()


EMOTES = ("wave", "happy", "surprised", "bow")


def rig_message(
    seq: int, timestamp: float, frame_size: tuple[int, int], faces: list[dict], emote: dict | None = None
) -> dict:
    msg = {
        "v": RIG_VERSION,
        "type": "rig",
        "seq": seq,
        "t": round(timestamp, 4),
        "frame": list(frame_size),
        "faces": [{k: (round(v, 4) if isinstance(v, float) else v) for k, v in f.items()} for f in faces],
    }
    if emote:
        msg["emote"] = emote  # {"name", "id", "age"}: a button the streamer pressed, not tracked data
    return msg


def hello_message(version: str) -> dict:
    """Sent once per connection. States plainly what the stream is and is not."""
    return {
        "v": RIG_VERSION,
        "type": "hello",
        "tracked": list(TRACKED),
        "provenance": {
            "kind": "original-character",
            "synthetic": True,
            "real_person_likeness": False,
            "generator": f"realx {version}",
        },
    }
