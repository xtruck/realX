// Step S4: keeps the drawn face steady and well-behaved. Numbers only (landmarks in, landmarks and an opacity out): no DOM,
// no picture. Three jobs:
//  1. smoothing: a One-Euro filter on each mesh point, so the photo does not shake when you hold still, and does not lag
//     when you move (the constants come from a simulation: still, normal and very fast head motion, see stabilize.test.mjs);
//  2. presence: when the face is lost the photo stays for a moment, then fades out; when it comes back it fades in from the
//     new place instead of sliding in from the old one; a single wild frame (the mesh jumping across the picture) is ignored;
//  3. covering: when a hand is over the face the photo fades out, so it is not drawn over the hand or stretched around it.
import { OneEuro } from "../oneeuro.js";
import { VERTEX_COUNT, faceBox } from "./mesh.js";

/** One-Euro settings for normalised landmark coordinates at about 25 fps. */
export const SMOOTH = { minCutoff: 1.0, beta: 150, dCutoff: 1.0 };

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Smooths the 468 mesh points. `t` is in seconds. Returns the same array of {x, y, z} objects each time (do not keep it). */
export class LandmarkSmoother {
  constructor(params = SMOOTH) {
    this.params = params;
    const make = () => Array.from({ length: VERTEX_COUNT }, () => new OneEuro(params.minCutoff, params.beta, params.dCutoff));
    this.fx = make(); this.fy = make();
    this.out = Array.from({ length: VERTEX_COUNT }, () => ({ x: 0, y: 0, z: 0 }));
  }

  /** Forget the past: the next frame is taken as it is (used when the face comes back somewhere else). */
  reset() {
    for (const f of [...this.fx, ...this.fy]) { f.x = null; f.t = null; f.dx = 0; }
  }

  update(landmarks, t) {
    for (let i = 0; i < VERTEX_COUNT; i++) {
      const p = landmarks[i], o = this.out[i];
      o.x = this.fx[i].filter(p.x, t); o.y = this.fy[i].filter(p.y, t); o.z = p.z || 0;
    }
    return this.out;
  }
}

/** A frame whose face box jumped by more than `maxJump` face widths, or changed size by more than `maxScale` times. */
export function isJump(box, previous, maxJump = 0.35, maxScale = 1.5) {
  if (!box || !previous || !(previous.w > 0)) return false;
  const shift = Math.hypot(box.x + box.w / 2 - (previous.x + previous.w / 2), box.y + box.h / 2 - (previous.y + previous.h / 2));
  const scale = box.w / previous.w;
  return shift / previous.w > maxJump || scale > maxScale || scale < 1 / maxScale;
}

/**
 * 0..1: how much of the face a hand covers. `hands` is the hand model's `landmarks` (a list of 21-point lists, normalised);
 * points inside the middle of the face box count, and six or more mean the face is covered.
 */
export function handCover(box, hands, shrink = 0.1) {
  if (!box || !hands || !hands.length) return 0;
  const x0 = box.x + box.w * shrink, x1 = box.x + box.w * (1 - shrink), y0 = box.y + box.h * shrink, y1 = box.y + box.h * (1 - shrink);
  let inside = 0;
  for (const hand of hands) for (const p of hand || []) if (p && p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) inside++;
  return clamp01(inside / 6);
}

/**
 * Decides what to draw each frame. `update(raw, nowMs, cover)` takes this frame's face (or null) and returns
 * { landmarks, opacity } or null (draw nothing). `smoothing` can be switched off to compare.
 */
export class FacePresence {
  constructor({ holdMs = 120, fadeOutMs = 250, fadeInMs = 150, coverMs = 120, glitchMs = 300, smoothing = true } = {}) {
    Object.assign(this, { holdMs, fadeOutMs, fadeInMs, coverMs, glitchMs, smoothing });
    this.smoother = new LandmarkSmoother();
    this.shown = Array.from({ length: VERTEX_COUNT }, () => ({ x: 0, y: 0, z: 0 }));
    this.lastSeen = -Infinity; this.lastBox = null; this.lastNow = null;
    this.presence = 0; this.cover = 0; this.glitchSince = null;
  }

  update(raw, nowMs, cover = 0) {
    const dt = this.lastNow === null ? 0 : Math.max(0, nowMs - this.lastNow);
    this.lastNow = nowMs;
    const box = faceBox(raw);
    const gap = nowMs - this.lastSeen;
    const away = !(gap <= this.holdMs + this.fadeOutMs);   // never seen, or gone so long that the photo has faded out
    let seen = box !== null, relocated = false;
    if (box === null) this.glitchSince = null;
    else if (!away && isJump(box, this.lastBox)) {         // the mesh jumped: ignore it for a moment, then believe it
      if (this.glitchSince === null) this.glitchSince = nowMs;
      if (nowMs - this.glitchSince < this.glitchMs) seen = false; else relocated = true;
    } else this.glitchSince = null;

    if (seen) {
      if (away || relocated) { this.smoother.reset(); this.presence = 0; this.glitchSince = null; }   // start from here and fade in
      const source = this.smoothing ? this.smoother.update(raw, nowMs / 1000) : raw;
      for (let i = 0; i < VERTEX_COUNT; i++) { this.shown[i].x = source[i].x; this.shown[i].y = source[i].y; this.shown[i].z = source[i].z || 0; }
      this.lastSeen = nowMs; this.lastBox = faceBox(this.shown);
      this.presence = clamp01(this.presence + (this.fadeInMs > 0 ? dt / this.fadeInMs : 1));
    } else {
      if (away) { this.presence = 0; return null; }
      if (gap > this.holdMs) this.presence = clamp01(this.presence - (this.fadeOutMs > 0 ? dt / this.fadeOutMs : 1));   // hold, then fade
    }
    const step = this.coverMs > 0 ? dt / this.coverMs : 1;
    this.cover += Math.max(-step, Math.min(step, clamp01(cover) - this.cover));
    return { landmarks: this.shown, opacity: this.presence * (1 - this.cover) };
  }
}

/** How much the nose tip moves from frame to frame, raw and smoothed (running averages): smoothing should lower the second. */
export class JitterMeter {
  constructor(index = 1, keep = 0.95) { this.index = index; this.keep = keep; this.prevRaw = null; this.prevSmooth = null; this.raw = 0; this.smooth = 0; this.n = 0; }
  mark(raw, smooth) {
    const r = raw && raw[this.index], s = smooth && smooth[this.index];
    if (!r || !s) { this.prevRaw = this.prevSmooth = null; return; }
    if (this.prevRaw) {
      const a = Math.hypot(r.x - this.prevRaw.x, r.y - this.prevRaw.y), b = Math.hypot(s.x - this.prevSmooth.x, s.y - this.prevSmooth.y);
      this.raw = this.n ? this.keep * this.raw + (1 - this.keep) * a : a;
      this.smooth = this.n ? this.keep * this.smooth + (1 - this.keep) * b : b;
      this.n++;
    }
    this.prevRaw = { x: r.x, y: r.y }; this.prevSmooth = { x: s.x, y: s.y };
  }
}
