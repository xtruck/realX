// S13e: keep the mask only where it holds. The photo is a flat picture warped on the live face; it breaks when the head turns far, when the
// mouth opens very wide or when the face is partly hidden. This module turns the 478 landmarks into one number per frame, 0 (show the live
// picture) to 1 (the photo holds), and a second one for the head ring (hair, ear, neck from the photo), which is dropped first.
// Pure JS: no DOM, no WebGL. Every angle and limit below is a FIRST GUESS, never tuned on a real webcam.

export const LIMITS = {
  full: 25, none: 55,          // degrees of head turn (yaw or pitch): the photo is full up to `full`, gone by `none`
  ringFull: 20, ringNone: 42,  // the head ring leaves earlier than the face
  mouthFrom: 0.14, mouthTo: 0.30, mouthFloor: 0.4,   // inner-lip gap over face height: no effect up to `mouthFrom`, down to `mouthFloor` at `mouthTo`
  outFrom: 0.02, outTo: 0.2,   // share of landmarks outside the frame: no effect up to `outFrom`, confidence 0 at `outTo`
  jumpFrom: 0.08, jumpTo: 0.3, // frame-to-frame change of the face's shape (in face widths): no effect up to `jumpFrom`, 0 at `jumpTo`
  deadband: 0.03,              // hysteresis: a change smaller than this is ignored
  fall: 0.35, rise: 0.08,      // most the value may move per frame going down / coming back (the photo leaves quickly and returns gently)
};

const RAD = 180 / Math.PI;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ok = (p) => !!p && Number.isFinite(p.x) && Number.isFinite(p.y);
/** 1 at a <= from, 0 at a >= to, smooth in between; monotone. NaN gives 0. */
export function fade(a, from, to) {
  if (!Number.isFinite(a)) return 0;
  const t = clamp01((a - from) / (to - from));
  return 1 - t * t * (3 - 2 * t);
}

const KEY = [1, 6, 10, 13, 14, 33, 133, 152, 234, 263, 362, 454];   // nose tip and bridge, forehead, inner lips, eye corners, chin, cheeks
const SHAPE = [1, 33, 263, 152, 61, 291];                            // points whose layout is compared from one frame to the next

/** Head turn from the landmarks, in degrees (absolute yaw, pitch, roll) or null when they are unusable. x is scaled by `aspect` (width/height) to match y. */
export function headAngles(lm, aspect = 1) {
  if (!lm || !(lm.length >= 468)) return null;
  for (const i of KEY) if (!ok(lm[i])) return null;
  const a = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const z = (p) => (Number.isFinite(p.z) ? p.z : 0) * a;           // MediaPipe's z is on the same scale as x (image width)
  const L = lm[234], R = lm[454], T = lm[10], C = lm[152];
  const dx = (R.x - L.x) * a;
  let yaw = Math.abs(Math.atan2(z(R) - z(L), dx)) * RAD;
  if (dx < 0) yaw = 180 - yaw;                                      // x order flipped: far past any limit
  const pitch = Math.abs(Math.atan2(z(C) - z(T), C.y - T.y)) * RAD;
  const roll = Math.abs(Math.atan2(R.y - L.y, dx)) * RAD;
  return [yaw, pitch, roll].every(Number.isFinite) ? { yaw, pitch, roll } : null;
}

/** Inner-lip gap over face height (0 closed, about 0.1 wide open), or 0 when unusable. */
export function mouthOpening(lm) {
  if (!lm || !ok(lm[13]) || !ok(lm[14]) || !ok(lm[10]) || !ok(lm[152])) return 0;
  const h = Math.abs(lm[152].y - lm[10].y);
  return h > 1e-6 ? Math.abs(lm[13].y - lm[14].y) / h : 0;
}

/** Share of the 468 face landmarks outside the frame (0..1); a missing or NaN point counts as outside. */
export function outsideShare(lm) {
  if (!lm || !lm.length) return 1;
  let out = 0;
  const n = Math.min(lm.length, 468);
  for (let i = 0; i < n; i++) { const p = lm[i]; if (!ok(p) || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) out++; }
  return out / n;
}

function shapeOf(lm) {
  const w = Math.hypot(lm[454].x - lm[234].x, lm[454].y - lm[234].y);
  if (!(w > 1e-6)) return null;
  const cx = lm[1].x, cy = lm[1].y, v = [];
  for (const i of SHAPE) { if (!ok(lm[i])) return null; v.push((lm[i].x - cx) / w, (lm[i].y - cy) / w); }
  return v;
}

export class MaskConfidence {
  constructor(limits = {}) {
    this.limits = { ...LIMITS, ...limits };
    this.reset();
  }
  reset() { this.value = 0; this.ring = 0; this.prevShape = null; this.info = { yaw: 0, pitch: 0, roll: 0, mouth: 0, outside: 1, jump: 0 }; }
  /** One frame. Returns { confidence, ring } in 0..1; never throws and never returns NaN. Missing or broken landmarks give 0 at once. */
  update(lm, aspect = 1) {
    let tc = 0, tr = 0;
    try {
      const ang = headAngles(lm, aspect);
      if (ang) {
        const L = this.limits, mouth = mouthOpening(lm), outside = outsideShare(lm);
        const shape = shapeOf(lm);
        let jump = 0;
        if (shape && this.prevShape) { let s = 0; for (let i = 0; i < shape.length; i++) s += Math.abs(shape[i] - this.prevShape[i]); jump = s / shape.length; }
        this.prevShape = shape;
        const turn = Math.max(ang.yaw, ang.pitch);
        const others = fade(outside, L.outFrom, L.outTo) * fade(jump, L.jumpFrom, L.jumpTo)
          * (L.mouthFloor + (1 - L.mouthFloor) * fade(mouth, L.mouthFrom, L.mouthTo));
        tc = fade(turn, L.full, L.none) * others;
        tr = Math.min(tc, fade(turn, L.ringFull, L.ringNone) * others);
        this.info = { ...ang, mouth, outside, jump };
      } else this.prevShape = null;
    } catch (e) { tc = 0; tr = 0; this.prevShape = null; }
    if (!(tc > 0)) { this.value = 0; this.ring = 0; return { confidence: 0, ring: 0 }; }   // nothing to trust: the live picture at once
    this.value = this._step(this.value, tc);
    this.ring = Math.min(this.value, this._step(this.ring, tr));
    return { confidence: this.value, ring: this.ring };
  }
  _step(cur, target) {
    const d = target - cur, L = this.limits;
    if (Math.abs(d) < L.deadband && target < 1) return cur;   // hysteresis: noise around a threshold changes nothing (full is always reached)
    return clamp01(cur + (d < 0 ? Math.max(d, -L.fall) : Math.min(d, L.rise)));
  }
}

/**
 * Opacity multipliers for a "Hold the mask when turning" strength `hold` in 0..1. At 0 both are exactly 1 (the old behaviour).
 * `photo` multiplies the whole photo's opacity; `ring` multiplies the head ring on top of that.
 */
export function holdFactors(hold, c) {
  const h = Number.isFinite(hold) ? clamp01(hold) : 0;
  if (h === 0) return { photo: 1, ring: 1 };
  const cf = c && Number.isFinite(c.confidence) ? clamp01(c.confidence) : 0;
  const rf = c && Number.isFinite(c.ring) ? clamp01(c.ring) : 0;
  const photo = 1 - h * (1 - cf);
  return { photo, ring: Math.min(1, (1 - h * (1 - rf)) / Math.max(photo, 1e-6)) };
}
