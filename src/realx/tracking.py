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


def same_face(a: np.ndarray, b: np.ndarray) -> bool:
    """True when two boxes plausibly cover one face: they overlap, or one sits mostly
    inside the other (detectors at different scales disagree on how much of the head
    a 'face' box covers)."""
    ix = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    iy = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    smaller = min((a[2] - a[0]) * (a[3] - a[1]), (b[2] - b[0]) * (b[3] - b[1]))
    return iou(a, b) > 0.3 or (smaller > 0 and ix * iy / smaller > 0.5)


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
        new_track_score: float = 0.5,
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
        # ids keep counting so a rebuilt pipeline never reuses an id for another face
        self._tracks.clear()

    def track_boxes(self) -> list[tuple[int, np.ndarray, bool]]:
        """(id, box, confirmed) for every live track, so callers can measure motion."""
        return [(t.track_id, t.bbox.copy(), t.hits >= self.min_hits) for t in self._tracks]

    def _score(self, track: _Track, det: Face, dt: float, hint: np.ndarray | None = None) -> float:
        elapsed = dt + track.lost  # how long this track has been without a sighting
        pred = track.bbox + (hint if hint is not None else track.velocity * dt)
        overlap = iou(pred, det.bbox)
        dist = float(np.linalg.norm(_center(pred) - _center(det.bbox))) / (
            0.5 * (_size(pred) + _size(det.bbox))
        )
        # the longer we have not seen the face, the further it may legitimately be
        gate = self.gate * min(max(1.0, elapsed), self.max_gate_scale)
        if dist > gate:
            return 0.0
        # A face does not double or halve in size between frames. Weak detections under
        # blur are often much too large; refuse to merge them into a healthy track.
        ratio = _size(det.bbox) / _size(pred)
        limit = (1.35 if det.score < self.new_track_score else 1.8) + 0.05 * min(elapsed, 10.0)
        if ratio > limit or ratio < 1.0 / limit:
            return 0.0
        proximity = max(0.0, 1.0 - dist / gate)
        # equal weight: a face that jumped a couple of box widths has no overlap but
        # is still clearly the same face
        return 0.5 * overlap + 0.5 * proximity

    def update(
        self,
        detections: list[Face],
        dt: float = 1.0,
        hints: dict[int, np.ndarray] | None = None,
    ) -> list[Face]:
        """`hints` maps a track id to a measured (dx, dy) shift since the last frame
        (for example from optical flow). It beats extrapolation when available."""
        hints = hints or {}
        hint_box = {
            tid: np.array([h[0], h[1], h[0], h[1]], dtype=float)
            for tid, h in hints.items()
            if np.all(np.isfinite(h))
        }
        dt = float(dt)
        dt = min(max(1.0, dt), 60.0) if np.isfinite(dt) else 1.0
        # a corrupt box must never become a track (it would crash the drawers later)
        detections = [
            d
            for d in detections
            if np.all(np.isfinite(d.bbox))
            and d.bbox[2] > d.bbox[0]
            and d.bbox[3] > d.bbox[1]
            and np.isfinite(d.score)
        ]
        pairs = []
        for ti, track in enumerate(self._tracks):
            for di, det in enumerate(detections):
                s = self._score(track, det, dt, hint_box.get(track.track_id))
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
            if det.score < self.new_track_score:
                # trust a weak detection's position but not its size: keep the track's
                # established size and move it to the detected centre
                old_w, old_h = tr.last_seen[2] - tr.last_seen[0], tr.last_seen[3] - tr.last_seen[1]
                w = 0.7 * old_w + 0.3 * (new_box[2] - new_box[0])
                h = 0.7 * old_h + 0.3 * (new_box[3] - new_box[1])
                c = _center(new_box)
                new_box = np.array([c[0] - w / 2, c[1] - h / 2, c[0] + w / 2, c[1] + h / 2])
            gap = dt + tr.lost  # frames since the last real sighting
            # translation only: extrapolating size change collapses or inflates the box
            shift = (_center(new_box) - _center(tr.last_seen)) / gap
            observed = np.array([shift[0], shift[1], shift[0], shift[1]])
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
            if tr.hits < self.min_hits:
                tr.lost = self.max_lost + 1  # a tentative track that misses once was noise
                continue
            tr.lost += dt
            measured = hint_box.get(tr.track_id)
            move = measured.copy() if measured is not None else tr.velocity * dt
            # never travel further than ~1.5 box sizes (3 when measured) from the last sighting
            limit = 3.0 if measured is not None else 1.5
            budget = max(0.0, limit - tr.coasted) * _size(tr.bbox)
            step = float(np.linalg.norm(move[:2]))
            if step > budget:
                move = move * (budget / step if step > 0 else 0.0)
            tr.coasted += float(np.linalg.norm(move[:2])) / _size(tr.bbox)
            tr.bbox = tr.bbox + move
            if tr.landmarks is not None:
                tr.landmarks = tr.landmarks + move[:2]
            if measured is not None:
                tr.velocity = 0.5 * tr.velocity + 0.5 * (move / dt)  # learn from what we saw
            else:
                tr.velocity = tr.velocity * (0.7 ** dt)  # coast, but fade out quickly

        self._tracks = [t for t in self._tracks if t.lost <= self.max_lost]
        live = [t.bbox for t in self._tracks]
        for di, det in enumerate(detections):
            if di in used_d or det.score < self.new_track_score:
                continue
            # a second box on a face we already follow is a duplicate, not a new person
            if any(same_face(np.asarray(det.bbox, dtype=float), box) for box in live):
                continue
            live.append(np.asarray(det.bbox, dtype=float))
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


# --- offline gap filling -------------------------------------------------------
# Only for clips where past AND future frames are known (never the live tracker).
# FaceTracker above is untouched; this is a separate pass over finished results.


@dataclass
class InterpolatedFace(Face):
    """A face synthesised between two real detections of the same track.

    It is never a detection: `interpolated` is always True, `predicted` stays False
    (that flag means live extrapolation) and the score is the weaker of the two ends.
    """

    interpolated: bool = True


def is_interpolated(face: Face) -> bool:
    return bool(getattr(face, "interpolated", False))


def fill_track_gaps(
    frames: list[list[Face]],
    max_gap: int = 5,
    max_size_ratio: float = 1.5,
    max_shift: float = 1.5,
    max_overlap: float = 0.2,
) -> list[list[Face]]:
    """Linearly interpolate short gaps in each track of a finished clip.

    `frames[i]` holds the faces of frame i (each with a `track_id`). For every track,
    a run of 1..`max_gap` frames between two real detections is filled with
    `InterpolatedFace` boxes (and landmarks when both ends have the same shape).
    A gap is left alone when:
      * the two ends differ in size by more than `max_size_ratio` (long side ratio),
      * their centres are further apart than `max_shift` * mean box size,
      * any filled box would overlap (IoU > `max_overlap`) a different face in that frame.
    Faces with `predicted=True` or already interpolated are not used as ends; a live
    prediction inside a bridged gap is replaced by the interpolated box.

    Returns new per-frame lists; the input lists and Face objects are not modified
    (untouched faces are shared by reference). Faces without a track id are kept.
    """
    if max_gap < 1:
        return [list(f) for f in frames]
    out = [list(f) for f in frames]

    anchors: dict[int, list[tuple[int, Face]]] = {}
    for i, faces in enumerate(frames):
        for f in faces:
            if f.track_id is not None and not f.predicted and not is_interpolated(f):
                anchors.setdefault(f.track_id, []).append((i, f))

    for tid, seq in anchors.items():
        for (i, a), (j, b) in zip(seq, seq[1:]):
            gap = j - i - 1
            if gap < 1 or gap > max_gap:
                continue
            sa, sb = _size(a.bbox), _size(b.bbox)
            if min(sa, sb) <= 0 or max(sa, sb) / min(sa, sb) > max_size_ratio:
                continue
            if np.linalg.norm(_center(a.bbox) - _center(b.bbox)) > max_shift * (sa + sb) / 2:
                continue
            lm = (
                a.landmarks is not None
                and b.landmarks is not None
                and a.landmarks.shape == b.landmarks.shape
            )
            made = []
            for k in range(i + 1, j):
                t = (k - i) / (j - i)
                box = (1 - t) * np.asarray(a.bbox, float) + t * np.asarray(b.bbox, float)
                if any(iou(box, o.bbox) > max_overlap for o in frames[k] if o.track_id != tid):
                    made = []
                    break
                made.append(
                    (
                        k,
                        InterpolatedFace(
                            bbox=box,
                            landmarks=(1 - t) * a.landmarks + t * b.landmarks if lm else None,
                            score=min(a.score, b.score),
                            track_id=tid,
                        ),
                    )
                )
            for k, face in made:
                # drop a live prediction of this track inside the gap
                out[k] = [f for f in out[k] if f.track_id != tid]
                out[k].append(face)
    return out
