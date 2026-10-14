"""Multi-face tracker built for fast, jumpy motion on machines that drop frames.

All time-like quantities are measured in *elapsed frames*, not processed frames. When
the machine skips frames, `update(..., dt=N)` tells the tracker N frames went by, so
the matching gate widens, velocity stays correct and stale estimates expire in real
time instead of lingering as ghosts.

Association uses IoU plus a normalized centre-distance term. When a detection drops
out, the track coasts on its (fading) velocity for a few frames (`predicted=True`).
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

from realx.types import Face


def iou(a: np.ndarray, b: np.ndarray) -> float:
    x1, y1 = max(a[0], b[0]), max(a[1], b[1])
    x2, y2 = min(a[2], b[2]), min(a[3], b[3])
    inter = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return float(inter / union) if union > 0 else 0.0


def _center(b: np.ndarray) -> np.ndarray:
    return np.array([(b[0] + b[2]) / 2.0, (b[1] + b[3]) / 2.0])


def _size(b: np.ndarray) -> float:
    return float(max(1.0, ((b[2] - b[0]) + (b[3] - b[1])) / 2.0))


@dataclass
class _Track:
    track_id: int
    bbox: np.ndarray
    landmarks: np.ndarray | None
    score: float
    velocity: np.ndarray = field(default_factory=lambda: np.zeros(4))  # per frame
    hits: int = 1
    lost: float = 0.0  # elapsed frames since a real detection
    last_seen: np.ndarray = field(default_factory=lambda: np.zeros(4))
    coasted: float = 0.0  # distance travelled while undetected, in box sizes


class FaceTracker:
    def __init__(
        self,
        max_lost: float = 45.0,
        max_predict: float = 8.0,
        min_hits: int = 2,
        match_threshold: float = 0.15,
        gate: float = 4.0,
        new_track_score: float = 0.6,
        low_score_penalty: float = 0.85,
        max_gate_scale: float = 6.0,
    ) -> None:
        # Low-confidence detections (motion blur) may keep an existing track alive
        # but never start a new one, so false positives cannot create ghost faces.
        self.new_track_score = new_track_score
        self.low_score_penalty = low_score_penalty
        self.max_lost = max_lost  # elapsed frames before a track is forgotten
        self.max_predict = max_predict  # elapsed frames an estimate may be shown
        self.min_hits = min_hits
        self.match_threshold = match_threshold
        self.gate = gate  # max centre distance, in box sizes, per frame of uncertainty
        self.max_gate_scale = max_gate_scale
        self._tracks: list[_Track] = []
        self._next_id = 1

    def reset(self) -> None:
        self._tracks.clear()
        self._next_id = 1

    def _score(self, track: _Track, det: Face, dt: float) -> float:
        elapsed = dt + track.lost  # how long this track has been without a sighting
        pred = track.bbox + track.velocity * dt
        overlap = iou(pred, det.bbox)
        dist = float(np.linalg.norm(_center(pred) - _center(det.bbox))) / (
            0.5 * (_size(pred) + _size(det.bbox))
        )
        # the longer we have not seen the face, the further it may legitimately be
        gate = self.gate * min(max(1.0, elapsed), self.max_gate_scale)
        if dist > gate:
            return 0.0
        proximity = max(0.0, 1.0 - dist / gate)
        # equal weight: a face that jumped a couple of box widths has no overlap but
        # is still clearly the same face
        return 0.5 * overlap + 0.5 * proximity

    def update(self, detections: list[Face], dt: float = 1.0) -> list[Face]:
        dt = max(1.0, float(dt))
        pairs = []
        for ti, track in enumerate(self._tracks):
            for di, det in enumerate(detections):
                s = self._score(track, det, dt)
                if det.score < self.new_track_score:
                    s *= self.low_score_penalty
                if s >= self.match_threshold:
                    pairs.append((s, ti, di))
        pairs.sort(reverse=True)
        used_t: set[int] = set()
        used_d: set[int] = set()
        for _, ti, di in pairs:
            if ti in used_t or di in used_d:
                continue
            used_t.add(ti)
            used_d.add(di)
            tr, det = self._tracks[ti], detections[di]
            new_box = np.asarray(det.bbox, dtype=float)
            gap = dt + tr.lost  # frames since the last real sighting
            observed = (new_box - tr.last_seen) / gap
            tr.velocity = 0.5 * tr.velocity + 0.5 * observed if tr.lost == 0 else observed
            tr.bbox = new_box
            tr.last_seen = new_box.copy()
            tr.landmarks = None if det.landmarks is None else np.asarray(det.landmarks, dtype=float)
            tr.score = det.score
            tr.hits += 1
            tr.lost = 0.0
            tr.coasted = 0.0

        for ti, tr in enumerate(self._tracks):
            if ti in used_t:
                continue
            tr.lost += dt
            move = tr.velocity * dt
            # never extrapolate further than ~1.5 box sizes from the last sighting
            budget = max(0.0, 1.5 - tr.coasted) * _size(tr.bbox)
            step = float(np.linalg.norm(move[:2]))
            if step > budget:
                move = move * (budget / step if step > 0 else 0.0)
            tr.coasted += float(np.linalg.norm(move[:2])) / _size(tr.bbox)
            tr.bbox = tr.bbox + move
            if tr.landmarks is not None:
                tr.landmarks = tr.landmarks + move[:2]
            tr.velocity = tr.velocity * (0.7 ** dt)  # coast, but fade out quickly

        self._tracks = [t for t in self._tracks if t.lost <= self.max_lost]
        for di, det in enumerate(detections):
            if di in used_d or det.score < self.new_track_score:
                continue
            self._tracks.append(
                _Track(
                    self._next_id,
                    np.asarray(det.bbox, dtype=float),
                    None if det.landmarks is None else np.asarray(det.landmarks, dtype=float),
                    det.score,
                    last_seen=np.asarray(det.bbox, dtype=float).copy(),
                )
            )
            self._next_id += 1

        out: list[Face] = []
        seen = [t.bbox for t in self._tracks if t.lost == 0 and t.hits >= self.min_hits]
        for tr in self._tracks:
            confirmed = tr.hits >= self.min_hits
            if not confirmed or tr.lost > self.max_predict:
                continue
            # a coasting estimate that sits on a face we can really see is a ghost
            if tr.lost > 0 and any(iou(tr.bbox, other) > 0.25 for other in seen):
                continue
            out.append(
                Face(
                    bbox=tr.bbox.copy(),
                    landmarks=None if tr.landmarks is None else tr.landmarks.copy(),
                    score=tr.score,
                    track_id=tr.track_id,
                    predicted=tr.lost > 0,
                )
            )
        return out
