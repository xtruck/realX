// One-Euro filter (Casiez, Roussel and Vogel, 2012): steady when still, quick when moving.
// Tune: beta 0, lower minCutoff until the jitter stops, then raise beta until the lag stops.
const alpha = (cutoff, dt) => 1 / (1 + 1 / (2 * Math.PI * cutoff * dt));

export class OneEuro {
  constructor(minCutoff = 1.2, beta = 0.05, dCutoff = 1.0) {
    this.minCutoff = minCutoff; this.beta = beta; this.dCutoff = dCutoff;
    this.x = null; this.dx = 0; this.t = null;
  }
  filter(value, t) {
    if (this.x === null || this.t === null || t <= this.t) { this.x = value; this.t = t; this.dx = 0; return value; }
    const dt = t - this.t;
    const rawD = (value - this.x) / dt;
    this.dx += alpha(this.dCutoff, dt) * (rawD - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += alpha(cutoff, dt) * (value - this.x);
    this.t = t;
    return this.x;
  }
}

// Filters a unit quaternion component-wise. Keeps it in one hemisphere first, so q and -q
// (the same rotation) never make the filter swing the long way round.
export class QuatFilter {
  constructor(minCutoff, beta) { this.f = [0, 1, 2, 3].map(() => new OneEuro(minCutoff, beta)); this.prev = null; }
  filter(q, t) {
    let [x, y, z, w] = q;
    if (this.prev && this.prev[0] * x + this.prev[1] * y + this.prev[2] * z + this.prev[3] * w < 0) { x = -x; y = -y; z = -z; w = -w; }
    const out = [x, y, z, w].map((v, i) => this.f[i].filter(v, t));
    const n = Math.hypot(...out) || 1;
    this.prev = out.map((v) => v / n);
    return this.prev;
  }
}
