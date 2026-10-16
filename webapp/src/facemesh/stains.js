// Spills, stains, drips and crumbs on the photo's shirt (step S10g).
//
// A stain is stuck to a spot on the shirt, so it moves with the shirt when you move. It grows quickly to its size, may drip downward, and
// fades away on its own if it is water. Wiping a stain with your hand (a hand shape passing over it) rubs it out. Crumbs from eating are
// not stuck to anything: they fall and fade. Everything is plain circles with a colour and an opacity; the compositor fills them.
//
// This is an effect on top of the picture, not a simulation of liquid: it does not know what you are really pouring or eating, and it is
// started by a button or by the mouth opening with a hand near it. Pure numbers in, numbers out: no DOM, no WebGL, so node can test it.
import { FAN_VERTS, handFans } from "./handlayer.js";

export const KINDS = {
  water: { rgb: [0.18, 0.24, 0.32], alpha: 0.40, fades: true },
  juice: { rgb: [0.93, 0.55, 0.12], alpha: 0.62, fades: false },
  coffee: { rgb: [0.26, 0.15, 0.08], alpha: 0.72, fades: false },
  sauce: { rgb: [0.62, 0.10, 0.08], alpha: 0.72, fades: false },
  crumbs: { rgb: [0.78, 0.62, 0.38], alpha: 0.88, fades: true },
};
export const MAX_STAINS = 24;
const DRIP_STEP = 0.06;          // of the shoulder width: spacing of the circles along a drip
const MAX_DRIP_CIRCLES = 14;

/**
 * Sticks a spot of the PHOTO (in the same units as the puppet's rest points) to the puppet's mesh: the triangle that holds it and the
 * weights of its three corners, or the nearest corner when the spot is outside the mesh. Returns { tri: [a, b, c], w: [wa, wb, wc] } or null.
 */
export function bindToPuppet(puppet, x, y) {
  if (!puppet || !puppet.triangles || !puppet.rest || !Number.isFinite(x) || !Number.isFinite(y)) return null;
  const r = puppet.rest, t = puppet.triangles;
  let nearest = -1, nd = Infinity;
  for (let k = 0; k < t.length; k += 3) {
    const a = t[k], b = t[k + 1], c = t[k + 2];
    const ax = r[2 * a], ay = r[2 * a + 1], bx = r[2 * b], by = r[2 * b + 1], cx = r[2 * c], cy = r[2 * c + 1];
    const den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    if (Math.abs(den) > 1e-12) {
      const wa = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / den, wb = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / den, wc = 1 - wa - wb;
      if (wa >= -1e-9 && wb >= -1e-9 && wc >= -1e-9) return { tri: [a, b, c], w: [wa, wb, wc] };
    }
    for (const v of [a, b, c]) { const d = Math.hypot(r[2 * v] - x, r[2 * v + 1] - y); if (d < nd) { nd = d; nearest = v; } }
  }
  return nearest < 0 ? null : { tri: [nearest, nearest, nearest], w: [1, 0, 0] };
}

export class StainSet {
  constructor(max = MAX_STAINS) { this.max = max; this.items = []; }

  get count() { return this.items.length; }

  clear() { this.items.length = 0; }

  /** A spill on the shirt at a bound spot (from bindToPuppet). `size` scales its final radius (1 = about a quarter of the shoulder width). */
  spill(kind, binding, { size = 1, drips = 2, seed = Math.random() } = {}) {
    const k = KINDS[kind];
    if (!k || !binding) return false;
    if (this.items.length >= this.max) this.items.shift();                       // the oldest one goes first
    const rnd = (n) => { const v = Math.sin((seed + n) * 12.9898) * 43758.5453; return v - Math.floor(v); };
    const list = [];
    for (let i = 0; i < Math.max(0, Math.min(4, drips)); i++) list.push({ dx: (rnd(i) - 0.5) * 0.18, len: 0, speed: 0.10 + 0.12 * rnd(i + 7), w: 0.035 + 0.02 * rnd(i + 3) });
    this.items.push({ kind, bind: binding, free: false, x: 0, y: 0, size: Math.max(0.2, Math.min(3, size)), grow: 0, a: 1, drips: list, age: 0 });
    return true;
  }

  /** A crumb or splash that is not stuck to the shirt: it starts at a spot of the live picture and falls. */
  crumb(kind, x, y, { size = 1 } = {}) {
    if (!KINDS[kind] || !Number.isFinite(x) || !Number.isFinite(y)) return false;
    if (this.items.length >= this.max) this.items.shift();
    this.items.push({ kind, free: true, x, y, vy: 0, size: Math.max(0.2, Math.min(2, size)), grow: 1, a: 1, drips: [], age: 0 });
    return true;
  }

  /**
   * One step of `dt` seconds. `puppetPos` is the puppet's live positions (what the stains are stuck to), `scale` the live shoulder width,
   * `wipers` the hand circles ({ x, y, r }) that rub stains out.
   */
  step(dt, puppetPos, scale, wipers = []) {
    if (!(dt > 0) || !(scale > 0)) return;
    dt = Math.min(dt, 0.1);
    for (const s of this.items) {
      s.age += dt;
      s.grow += (1 - s.grow) * Math.min(1, dt * 2.5);
      if (s.free) { s.vy += 1.4 * scale * dt; s.y += s.vy * dt; s.a -= dt * 0.55; }
      else if (puppetPos && s.bind) {
        const [a, b, c] = s.bind.tri, [wa, wb, wc] = s.bind.w;
        s.x = wa * puppetPos[2 * a] + wb * puppetPos[2 * b] + wc * puppetPos[2 * c];
        s.y = wa * puppetPos[2 * a + 1] + wb * puppetPos[2 * b + 1] + wc * puppetPos[2 * c + 1];
        for (const d of s.drips) { d.len = Math.min(1.1, d.len + d.speed * dt); d.speed *= Math.max(0, 1 - 0.45 * dt); }
      }
      if (KINDS[s.kind].fades && !s.free) s.a -= dt * 0.04;                          // water dries
    }
    for (const s of this.items) {                                                    // a hand passing over a stain rubs it out
      if (s.free || !wipers.length) continue;
      const r = s.grow * s.size * 0.22 * scale;
      for (const w of wipers) if (Math.hypot(w.x - s.x, w.y - s.y) < r + w.r) { s.a -= dt * 1.6; break; }
    }
    this.items = this.items.filter((s) => s.a > 0.02 && Number.isFinite(s.x) && Number.isFinite(s.y));
  }

  /** The circles to draw, in the puppet's live units: { x, y, r, a, rgb }. `scale` is the live shoulder width. */
  circles(scale) {
    const out = [];
    if (!(scale > 0)) return out;
    for (const s of this.items) {
      const k = KINDS[s.kind], a = Math.max(0, Math.min(1, s.a)) * k.alpha;
      const r = s.free ? 0.035 * s.size * scale : s.grow * s.size * 0.22 * scale;
      if (!(r > 0)) continue;
      out.push({ x: s.x, y: s.y, r, a, rgb: k.rgb });
      for (const d of s.drips) {
        if (d.len <= 0) continue;
        const n = Math.min(MAX_DRIP_CIRCLES, Math.ceil((d.len * scale) / (DRIP_STEP * scale)));
        for (let i = 1; i <= n; i++) out.push({ x: s.x + d.dx * scale, y: s.y + r * 0.6 + (d.len * scale * i) / n, r: d.w * scale * (1 - 0.35 * (i / n)), a: a * 0.9, rgb: k.rgb });
      }
    }
    return out;
  }
}

/**
 * Triangle fans for stain circles, like handFans but with a colour per vertex and the circle's opacity in the vertex alpha:
 * { positions, alphas, colors, indices, count }, or null when there is nothing to draw.
 */
export function stainFans(circles, aspect) {
  if (!circles || circles.length === 0) return null;
  const f = handFans(circles, aspect);
  if (!f) return null;
  const colors = new Float32Array(f.count * 3);
  circles.forEach((c, k) => {
    for (let v = 0; v < FAN_VERTS; v++) {
      const i = k * FAN_VERTS + v;
      f.alphas[i] *= c.a;
      colors[3 * i] = c.rgb[0]; colors[3 * i + 1] = c.rgb[1]; colors[3 * i + 2] = c.rgb[2];
    }
  });
  return { ...f, colors };
}
