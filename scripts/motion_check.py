"""Measure tracking quality under fast movement. Run: python scripts/motion_check.py"""

from __future__ import annotations

import sys
import time

import numpy as np

from realx.pipeline import Pipeline
from realx.sources import MOTIONS, synthetic_frames
from realx.stages import create


def run(
    motion: str,
    frames: int = 120,
    use_tracker: bool = True,
    degrade: float = 0.0,
    min_cutoff: float = 2.0,
    beta: float = 0.5,
    score_threshold: float | None = None,
) -> dict:
    # with a tracker, low-confidence detections are useful (blurred faces)
    if score_threshold is None:
        score_threshold = 0.3 if use_tracker else 0.6
    stages = [create("detect_yunet", score_threshold=score_threshold)]
    if use_tracker:
        stages += [create("track"), create("one_euro", min_cutoff=min_cutoff, beta=beta)]
    stages.append(create("avatar"))
    shown = covered = multi = 0
    errs_px: list[float] = []
    ids: set[int] = set()
    t0 = time.perf_counter()
    with Pipeline(stages) as pipe:
        for ctx in synthetic_frames(motion, count=frames, degrade=degrade):
            out = pipe.process(ctx)
            shown += 1
            if len(out.faces) > 1:
                multi += 1  # one person in frame, so extra faces are ghosts
            if out.faces:
                covered += 1
                gt = np.array(ctx.meta["gt_center"])
                # judge the face closest to the truth, but count every id that appears
                f = min(
                    out.faces,
                    key=lambda g: np.linalg.norm(np.array([(g.bbox[0] + g.bbox[2]) / 2, (g.bbox[1] + g.bbox[3]) / 2]) - gt),
                )
                for g in out.faces:
                    ids.add(g.track_id if g.track_id is not None else -1)
                c = np.array([(f.bbox[0] + f.bbox[2]) / 2, (f.bbox[1] + f.bbox[3]) / 2])
                errs_px.append(float(np.linalg.norm(c - np.array(ctx.meta["gt_center"]))))
    dt = time.perf_counter() - t0
    return {
        "motion": motion,
        "coverage": covered / shown,
        "ids": len(ids),
        "ghost_frames": multi / shown,
        "median_err_px": float(np.median(errs_px)) if errs_px else float("nan"),
        "p95_err_px": float(np.percentile(errs_px, 95)) if errs_px else float("nan"),
        "fps": shown / dt,
    }


if __name__ == "__main__":
    tracked = "--no-tracker" not in sys.argv
    stress = 1.0 if "--degrade" in sys.argv else 0.0
    print("mode:", "detect+track+one_euro" if tracked else "detection only (baseline)", "| degrade:", stress)
    for m in MOTIONS:
        r = run(m, use_tracker=tracked, degrade=stress)
        print(
            f"{r['motion']:7s} coverage={r['coverage']:.0%} ids={r['ids']} ghosts={r['ghost_frames']:.0%} "
            f"median_err={r['median_err_px']:.1f}px p95={r['p95_err_px']:.1f}px fps={r['fps']:.1f}"
        )
    sys.exit(0)
