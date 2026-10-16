// Hair from a consented photo that moves with the head and reacts to the hands (step S9).
//
// The idea, in short: the photo's hair is cut out once (the segmenter's "hair" class). It becomes a sheet: a grid of points over
// the hair, joined by springs. The points on the scalp are pinned to the head, so they follow it exactly. The rest hangs: it falls
// under gravity, is held to its length by the springs, is pulled gently back toward the hairstyle in the photo (so it swings and
// then settles instead of collapsing straight down), and is pushed out of the way by circles that stand for the hands and
// fingers. The renderer draws the photo's own pixels on that moving sheet, so colour and texture stay real.
//
// What this is not: single strands. Hair moves as a soft textured sheet. That is convincing for swinging and for brushing it aside;
// it is not combing through individual hairs. Pure numbers in, numbers out: no DOM, no WebGL, so node can test it.
//
// Units: the photo's points are in "image heights" (x is pixel / image height, y is pixel / image height, y down), the same space
// head.js uses after multiplying x by the aspect ratio. The live head is the same space scaled and rotated by `transform`.
import { FACE_OVAL } from "./head.js";

const EDGE = { structural: 1.0, shear: 0.6, bend: 0.35 };       // how hard each kind of spring pulls back to its length
const MAX_CELLS = 70;

/** Similarity transform (scale s, angle, translation) mapping `from` points onto `to` points, least squares. Points are [x, y, ...]. */
export function similarity(from, to) {
  const n = from.length / 2;
  if (!(n >= 2) || to.length !== from.length) return null;
  let fx = 0, fy = 0, tx = 0, ty = 0;
  for (let i = 0; i < n; i++) { fx += from[2 * i]; fy += from[2 * i + 1]; tx += to[2 * i]; ty += to[2 * i + 1]; }
  fx /= n; fy /= n; tx /= n; ty /= n;
  let dot = 0, cross = 0, norm = 0;
  for (let i = 0; i < n; i++) {
    const px = from[2 * i] - fx, py = from[2 * i + 1] - fy, qx = to[2 * i] - tx, qy = to[2 * i + 1] - ty;
    dot += px * qx + py * qy; cross += px * qy - py * qx; norm += px * px + py * py;
  }
  if (!(norm > 1e-12)) return null;
  const a = dot / norm, b = cross / norm;                        // s*cos, s*sin
  const s = Math.hypot(a, b);
  if (!(s > 1e-9)) return null;
  return { s, cos: a / s, sin: b / s, ox: fx, oy: fy, tx, ty };
}

export const IDENTITY = { s: 1, cos: 1, sin: 0, ox: 0, oy: 0, tx: 0, ty: 0 };

/** Where a photo-space point lands under a transform. */
export function apply(t, x, y) {
  const dx = x - t.ox, dy = y - t.oy;
  return [t.s * (t.cos * dx - t.sin * dy) + t.tx, t.s * (t.sin * dx + t.cos * dy) + t.ty];
}

/**
 * The circles that stand for a hand: the palm, and each finger as a short chain. `landmarks` is MediaPipe's 21 hand points as
 * [{x, y}, ...] already in live space (image heights); `faceWidth` sizes the circles so a bigger face means a bigger hand.
 */
export function handColliders(landmarks, faceWidth) {
  if (!landmarks || landmarks.length < 21 || !(faceWidth > 0)) return [];
  const p = (i) => [landmarks[i].x, landmarks[i].y];
  const out = [];
  const circle = (x, y, r) => { if (Number.isFinite(x) && Number.isFinite(y)) out.push({ x, y, r }); };
  const palm = [0, 5, 9, 13, 17].map(p);
  circle(palm.reduce((s, q) => s + q[0], 0) / 5, palm.reduce((s, q) => s + q[1], 0) / 5, faceWidth * 0.30);
  for (const chain of [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]]) {
    for (let k = 0; k < chain.length; k++) {
      const [x, y] = p(chain[k]);
      circle(x, y, faceWidth * (k === chain.length - 1 ? 0.085 : 0.075));
      if (k > 0) { const [px, py] = p(chain[k - 1]); circle((x + px) / 2, (y + py) / 2, faceWidth * 0.07); }   // no gap between joints
    }
  }
  return out;
}

export class HairSheet {
  /** @param g what `buildHairSheet` makes */
  constructor(g, options = {}) {
    Object.assign(this, g);
    this.opt = { gravity: 22, damping: 0.965, rest: 0.16, iterations: 5, maxMove: 0.35, pad: 0.012, ...options };
    const n = this.rest.length / 2;
    this.pos = new Float32Array(n * 2);
    this.prev = new Float32Array(n * 2);
    this.target = new Float32Array(n * 2);
    this.heals = 0;
    this.reset(IDENTITY);
  }

  get count() { return this.rest.length / 2; }

  _targets(t) {
    for (let i = 0; i < this.count; i++) {
      const [x, y] = apply(t, this.rest[2 * i], this.rest[2 * i + 1]);
      this.target[2 * i] = x; this.target[2 * i + 1] = y;
    }
  }

  /** Puts every point on its resting place for this head position, with no motion. */
  reset(t) {
    this._targets(t);
    this.pos.set(this.target); this.prev.set(this.target);
  }

  /**
   * One step of `dt` seconds with the head at `t` and the hands as circles in live space. Returns true when the simulation had
   * gone invalid and was reset (a NaN never heals by itself; one bad frame must not ruin the stream).
   */
  step(dt, t, colliders = []) {
    if (!(dt > 0) || !t) return false;
    dt = Math.min(dt, 1 / 20);
    this._targets(t);
    const o = this.opt, n = this.count, pos = this.pos, prev = this.prev, tgt = this.target;
    const unit = t.s * this.headHeight;                              // one head height, in live units
    const g = o.gravity * unit * dt * dt, maxMove = o.maxMove * unit, pad = o.pad * unit;
    for (let i = 0; i < n; i++) {
      const a = 2 * i, b = a + 1;
      if (this.pinned[i]) { pos[a] = prev[a] = tgt[a]; pos[b] = prev[b] = tgt[b]; continue; }
      const vx = (pos[a] - prev[a]) * o.damping, vy = (pos[b] - prev[b]) * o.damping;
      const k = o.rest * this.restWeight[i];
      prev[a] = pos[a]; prev[b] = pos[b];
      let dx = vx + (tgt[a] - pos[a]) * k, dy = vy + g + (tgt[b] - pos[b]) * k;
      const m = Math.hypot(dx, dy);
      if (m > maxMove) { dx *= maxMove / m; dy *= maxMove / m; }
      pos[a] += dx; pos[b] += dy;
    }
    for (let it = 0; it < o.iterations; it++) {
      for (let e = 0; e < this.edgeA.length; e++) {
        const i = this.edgeA[e], j = this.edgeB[e];
        const ax = 2 * i, ay = ax + 1, bx = 2 * j, by = bx + 1;
        const dx = pos[bx] - pos[ax], dy = pos[by] - pos[ay];
        const d = Math.hypot(dx, dy);
        if (!(d > 1e-9)) continue;
        const want = this.edgeLen[e] * t.s;
        const w = this.edgeK[e] * (d - want) / d;
        const pi = this.pinned[i], pj = this.pinned[j];
        if (pi && pj) continue;
        const wi = pi ? 0 : (pj ? 1 : 0.5), wj = pj ? 0 : (pi ? 1 : 0.5);
        pos[ax] += dx * w * wi; pos[ay] += dy * w * wi;
        pos[bx] -= dx * w * wj; pos[by] -= dy * w * wj;
      }
      for (const c of colliders) {
        const r = c.r + pad;
        for (let i = 0; i < n; i++) {
          if (this.pinned[i]) continue;
          const a = 2 * i, b = a + 1;
          const dx = pos[a] - c.x, dy = pos[b] - c.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= r * r) continue;
          const d = Math.sqrt(d2);
          if (d > 1e-9) { pos[a] = c.x + (dx / d) * r; pos[b] = c.y + (dy / d) * r; }
          else { pos[a] = c.x + r; }                                  // exactly on the centre: any way out will do (no 0/0)
        }
      }
      for (let i = 0; i < n; i++) if (this.pinned[i]) { pos[2 * i] = tgt[2 * i]; pos[2 * i + 1] = tgt[2 * i + 1]; }
    }
    for (let i = 0; i < pos.length; i++) {
      if (!Number.isFinite(pos[i]) || !Number.isFinite(prev[i])) { this.reset(t); this.heals++; return true; }
    }
    return false;
  }
}

function coverageAt(mask, x0, y0, x1, y1) {
  // mean of the mask (0..1) over the pixel box [x0, x1) x [y0, y1)
  const { width, height, data } = mask;
  const ax = Math.max(0, Math.floor(x0)), bx = Math.min(width, Math.ceil(x1)), ay = Math.max(0, Math.floor(y0)), by = Math.min(height, Math.ceil(y1));
  if (bx <= ax || by <= ay) return 0;
  let sum = 0;
  for (let y = ay; y < by; y++) for (let x = ax; x < bx; x++) sum += data[y * width + x];
  return sum / (255 * (bx - ax) * (by - ay));
}

/**
 * Builds the sheet for a photo. `mask` is { width, height, data } with one byte per pixel (255 = hair), `landmarks` the photo's 468
 * face points (normalised 0..1 on each axis) and `aspect` its width / height. Returns null when there is too little hair to move.
 */
export function buildHairSheet(mask, landmarks, aspect, options = {}) {
  if (!mask || !landmarks || landmarks.length < 468 || !(aspect > 0)) return null;
  const at = (i) => [landmarks[i].x * aspect, landmarks[i].y];
  const [tx, ty] = at(10), [bx, by] = at(152), [lx, ly] = at(234), [rx, ry] = at(454);
  const faceH = Math.hypot(tx - bx, ty - by), faceW = Math.hypot(rx - lx, ry - ly);
  if (!(faceH > 1e-6) || !(faceW > 1e-6)) return null;
  const upx = (tx - bx) / faceH, upy = (ty - by) / faceH;                // along the face, chin to forehead
  const sdx = -upy, sdy = upx;                                          // across the face
  let cx = 0, cy = 0;
  for (const i of FACE_OVAL) { const [x, y] = at(i); cx += x; cy += y; }
  cx /= FACE_OVAL.length; cy /= FACE_OVAL.length;

  // the mask's pixels are image heights / mask.height
  const unit = 1 / mask.height;
  const cell = Math.max(faceW / 9, 1e-4);                               // about nine cells across a face
  // bounding box of the hair, in image heights
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, on = 0;
  for (let y = 0; y < mask.height; y++) for (let x = 0; x < mask.width; x++) {
    if (mask.data[y * mask.width + x] > 127) { on++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  }
  if (on < 0.002 * mask.width * mask.height) return null;
  const x0 = minX * unit, y0 = minY * unit, x1 = (maxX + 1) * unit, y1 = (maxY + 1) * unit;
  const cols = Math.min(MAX_CELLS, Math.max(2, Math.ceil((x1 - x0) / cell))), rows = Math.min(MAX_CELLS, Math.max(2, Math.ceil((y1 - y0) / cell)));
  const cw = (x1 - x0) / cols, ch = (y1 - y0) / rows;

  const active = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cov = coverageAt(mask, (x0 + c * cw) / unit, (y0 + r * ch) / unit, (x0 + (c + 1) * cw) / unit, (y0 + (r + 1) * ch) / unit);
    active[r * cols + c] = cov > (options.minCoverage ?? 0.12) ? 1 : 0;
  }
  const vid = new Int32Array((cols + 1) * (rows + 1)).fill(-1);
  const rest = [], tris = [];
  const vertex = (r, c) => {
    const k = r * (cols + 1) + c;
    if (vid[k] < 0) { vid[k] = rest.length / 2; rest.push(x0 + c * cw, y0 + r * ch); }
    return vid[k];
  };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (!active[r * cols + c]) continue;
    const a = vertex(r, c), b = vertex(r, c + 1), d = vertex(r + 1, c), e = vertex(r + 1, c + 1);
    tris.push(a, b, d, b, e, d);
  }
  const n = rest.length / 2;
  if (n < 12) return null;
  const vx = (r, c) => vid[r * (cols + 1) + c];
  const edgeSet = new Map(), edgeA = [], edgeB = [], edgeLen = [], edgeK = [];
  const link = (i, j, k) => {
    if (i < 0 || j < 0 || i === j) return;
    const key = i < j ? i * 1e6 + j : j * 1e6 + i;
    if (edgeSet.has(key)) return;
    edgeSet.set(key, 1);
    edgeA.push(i); edgeB.push(j); edgeK.push(k);
    edgeLen.push(Math.hypot(rest[2 * i] - rest[2 * j], rest[2 * i + 1] - rest[2 * j + 1]));
  };
  for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) {
    const i = vx(r, c);
    if (i < 0) continue;
    if (c < cols) link(i, vx(r, c + 1), EDGE.structural);
    if (r < rows) link(i, vx(r + 1, c), EDGE.structural);
    if (c < cols && r < rows) { link(i, vx(r + 1, c + 1), EDGE.shear); link(vx(r, c + 1), vx(r + 1, c), EDGE.shear); }
    if (c + 2 <= cols) link(i, vx(r, c + 2), EDGE.bend);
    if (r + 2 <= rows) link(i, vx(r + 2, c), EDGE.bend);
  }

  // the scalp: an ellipse around the head, a little larger than the face and shifted up; hair inside it moves rigidly with the head
  const pinned = new Uint8Array(n);
  const a = 0.5 * faceW * (options.scalpWidth ?? 1.3), b = 0.5 * faceH * (options.scalpHeight ?? 1.35);
  const ex = cx + upx * 0.10 * faceH, ey = cy + upy * 0.10 * faceH;
  let pinnedCount = 0;
  for (let i = 0; i < n; i++) {
    const dx = rest[2 * i] - ex, dy = rest[2 * i + 1] - ey;
    const u = dx * sdx + dy * sdy, v = dx * upx + dy * upy;
    const onScalp = (u * u) / (a * a) + (v * v) / (b * b) <= 1;
    const crown = v > 0 && Math.abs(u) <= a * 1.45;                  // hair piled above the head is part of the head, not hanging
    if (onScalp || crown) { pinned[i] = 1; pinnedCount++; }
  }
  if (pinnedCount === 0 || pinnedCount === n) return null;              // all hair on the scalp, or none: nothing to swing

  // how far each point is (in springs) from the scalp: near the head the hairstyle is held firmly, far from it the hair is looser
  const hops = new Int32Array(n).fill(-1), queue = [];
  const adj = Array.from({ length: n }, () => []);
  for (let e = 0; e < edgeA.length; e++) { adj[edgeA[e]].push(edgeB[e]); adj[edgeB[e]].push(edgeA[e]); }
  for (let i = 0; i < n; i++) if (pinned[i]) { hops[i] = 0; queue.push(i); }
  for (let h = 0; h < queue.length; h++) for (const j of adj[queue[h]]) if (hops[j] < 0) { hops[j] = hops[queue[h]] + 1; queue.push(j); }
  const restWeight = new Float32Array(n);
  for (let i = 0; i < n; i++) restWeight[i] = hops[i] < 0 ? 0.3 : 1 / (1 + 0.35 * hops[i]);

  const uv = new Float32Array(n * 2);                                     // texture coordinates: where the point is in the photo (0..1)
  for (let i = 0; i < n; i++) { uv[2 * i] = rest[2 * i] / aspect; uv[2 * i + 1] = rest[2 * i + 1]; }
  return {
    rest: Float32Array.from(rest), uv, pinned, restWeight, headHeight: faceH * 1.35,
    triangles: Uint16Array.from(tris),
    edgeA: Int32Array.from(edgeA), edgeB: Int32Array.from(edgeB), edgeLen: Float32Array.from(edgeLen), edgeK: Float32Array.from(edgeK),
    faceWidth: faceW, faceHeight: faceH, stats: { points: n, pinned: pinnedCount, free: n - pinnedCount, cells: active.reduce((s, v) => s + v, 0), edges: edgeA.length },
  };
}
