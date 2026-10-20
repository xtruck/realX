// S13c: clean seams where the photo's head meets the live picture. This file is plain numbers only (no camera, no canvas, no DOM):
// the timing of the low-rate live segmenter, the smoothing of its answer in time, and the zone round the head where it may act.
// The segmenter itself and its picture-to-mask path are in seammask.js; the pixels of the mask never reach this code.
//
// What the segmenter gives (MediaPipe selfie multiclass): per-pixel confidence for hair (class 1) and body skin (class 2).
// A single answer is jumpy under head rotation, so the page keeps a running value per pixel on the graphics card
// (stepMask, the same rule as the shader in seammask.js) and only a value that has stayed up for a few answers counts (gate).

export const SEAM = Object.freeze({
  rateHz: 5,          // segmenter runs this often at most (4 to 6 a second); the page may ask for less (?seamHz=, see seamRate)
  minHz: 0.5,         // the lowest rate the page accepts
  up: 0.3,            // how far the running value moves towards a higher answer per answer
  down: 0.3,          // and towards a lower one: a one-answer flicker reaches 0.3, below `lo`, so it never shows
  lo: 0.35, hi: 0.65, // the gate: nothing below lo, everything above hi, a soft step between
  maxAgeMs: 800,      // an answer older than this is stale: the effect fades out and the plain picture is drawn
  fadeMs: 300,        // ... over this long
  slowMs: 60,         // the face model slower than this per frame: run the segmenter half as often
  maxShare: 0.15,     // the segmenter may use this share of the time (its own measured cost sets a floor on the gap between runs)
  slowPassMs: 250,    // one pass blocks the page for its whole duration: two passes in a row slower than this turn the option off
  stopPassMs: 1000,   // ... and one pass slower than this turns it off at once (software renderer: about 12 000 ms; UHD 620: about 26 ms)
});

const clamp01 = (v) => (v > 0 ? (v > 1 ? 1 : v) : 0);   // NaN becomes 0

/** One step of the running mask value: moves `prev` towards `sample` by `up` when rising and by `down` when falling. */
export function stepMask(prev, sample, up = SEAM.up, down = SEAM.down) {
  const p = clamp01(prev), s = clamp01(sample);
  return p + (s - p) * (s > p ? up : down);
}

/** The same step over whole arrays (a new array); `prev` may be null for the first answer, which starts from nothing. */
export function stepMaskArray(prev, sample, up = SEAM.up, down = SEAM.down) {
  const out = new Float32Array(sample.length);
  for (let i = 0; i < sample.length; i++) out[i] = stepMask(prev ? prev[i] : 0, sample[i], up, down);
  return out;
}

/** The gate the shader applies to the running value: 0 below lo, 1 above hi, a smooth step between. */
export function gate(v, lo = SEAM.lo, hi = SEAM.hi) {
  const t = clamp01((v - lo) / (hi - lo));
  return t * t * (3 - 2 * t);
}

/** When the next segmenter pass may start. state: { last, cost } in ms (cost = its measured time); faceMs = the face model's time per frame. */
export function seamDue(now, state, faceMs = 0, rateHz = SEAM.rateHz) {
  if (!Number.isFinite(state.last)) return true;
  let gap = 1000 / rateHz;
  if (faceMs > SEAM.slowMs) gap *= 2;                                  // the face tracker is struggling: leave it the time
  if (state.cost > 0) gap = Math.max(gap, state.cost / SEAM.maxShare);  // and never use more than maxShare of the time
  return now - state.last >= gap;
}

/**
 * Whether the segmenter is too slow on this computer to keep running. A pass runs on the page's main thread, so the picture freezes
 * for as long as it takes. Measured 2026-10-20: on the target laptop (UHD 620) the FIRST pass took 6.5 and 8.3 s (the model being
 * prepared on the graphics card) and the next ones about 26 ms; on a software renderer (SwiftShader) every pass took about 12 s.
 * So the first pass (`warmup`) is never judged; after it, one pass over `stopPassMs`, or two in a row over `slowPassMs`, stop it.
 * `state.slowRuns` counts slow passes in a row.
 */
export function seamTooSlow(passMs, state, warmup = false) {
  if (warmup) return false;
  if (!Number.isFinite(passMs) || passMs < 0) return false;
  if (passMs > SEAM.stopPassMs) return true;
  state.slowRuns = passMs > SEAM.slowPassMs ? (state.slowRuns || 0) + 1 : 0;
  return state.slowRuns >= 2;
}

/**
 * The segmenter rate the page uses, from the `seamHz` value in its address: SEAM.minHz to SEAM.rateHz, anything else gives the default.
 * Measured 2026-10-20 on the UHD 620: at 5 a second its passes (about 27 ms each) doubled the face model's time and cost about 8 fps, so
 * lower rates are being measured (scripts/bench_facemesh.py --edges-hz).
 */
export function seamRate(value) {
  const hz = typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  return Number.isFinite(hz) && hz >= SEAM.minHz && hz <= SEAM.rateHz ? hz : SEAM.rateHz;
}

/** How old an answer may get before it counts as stale: SEAM.maxAgeMs, or two and a half gaps when the segmenter runs slower than that. */
export function maxAge(rateHz = SEAM.rateHz) {
  return Math.max(SEAM.maxAgeMs, 2500 / rateHz);
}

/** How much of the effect to show for an answer that arrived `ageMs` ago: 1 when fresh, fading to 0 when stale, 0 when there is none. */
export function freshness(ageMs, rateHz = SEAM.rateHz) {
  if (!Number.isFinite(ageMs) || ageMs < 0) return 0;
  const limit = maxAge(rateHz);
  if (ageMs <= limit) return 1;
  return clamp01(1 - (ageMs - limit) / SEAM.fadeMs);
}

/**
 * Switches the effect down while the head moves fast (the mask is a few hundred ms old, so it lags a quick turn) and up again when it
 * calms. Two thresholds (hysteresis) so it does not pulse when the speed hovers near one of them. Speed is in face widths per second.
 */
export class MotionGate {
  constructor({ off = 1.4, on = 0.7, easePerSecond = 4 } = {}) {
    this.off = off; this.on = on; this.rate = easePerSecond;
    this.open = true; this.amount = 1; this.t = null; this.cx = null; this.cy = null;
  }

  /** box: { x, y, w, h } of the live face (or null); returns the amount 0..1 to use now. */
  update(box, nowMs) {
    if (!box || !(box.w > 0)) { this.t = null; this.cx = null; return this.amount; }
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    if (this.t !== null && nowMs > this.t) {
      const dt = (nowMs - this.t) / 1000;
      const speed = Math.hypot(cx - this.cx, cy - this.cy) / box.w / dt;
      if (this.open && speed > this.off) this.open = false;
      else if (!this.open && speed < this.on) this.open = true;
      const target = this.open ? 1 : 0;
      this.amount += (target - this.amount) * clamp01(this.rate * dt);
    }
    this.t = nowMs; this.cx = cx; this.cy = cy;
    return this.amount;
  }
}

/** The zone round the live head where the cleaner may paint, in the camera frame's 0..1 coordinates (box = faceBox()). */
export function headZone(box) {
  if (!box || !(box.w > 0) || !(box.h > 0)) return null;
  return {
    cx: box.x + box.w / 2, cy: box.y + box.h / 2,
    rx: 1.1 * box.w, ry: 1.0 * box.h + 0.25 * box.w,           // hair and ears: this far from the middle of the face
    fx: 0.5 * box.w, fy: 0.5 * box.h,                          // the face itself (left to the photo's face, never painted)
    chin: box.y + box.h + 0.12 * box.h,                        // skin is only cleaned above this line: the neck below is the body layer's business
  };
}
