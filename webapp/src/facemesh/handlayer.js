// Your own hands, and what is in them, drawn on top of the photo's body (step S10c).
//
// The photo's shirt and arms are drawn over your live body, which would also cover your hands and a bottle you hold. So the live
// picture is drawn back on top, but only inside shapes around the tracked hands: a big soft circle for the palm and a chain of
// smaller circles along each finger, each with a soft edge. This file makes those shapes as triangles. The compositor fills them
// with the live picture (it never reads that picture back; see compositor.js).
//
// How much of a held object shows depends on `reach`: the shapes cover a bottle's width only as far as they extend. An object much
// bigger than the hand is cut off at the edge of the shapes. Finding the held object itself is a later step.
//
// Pure numbers in, numbers out: no DOM, no WebGL, so node can test it.

const CHAINS = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]];
const PALM = [0, 5, 9, 13, 17];
const SEGMENTS = 14;                 // sides of each circle
const CORE = 0.62;                   // the share of a circle's radius that is fully solid; the rest fades out
export const MAX_CIRCLES = 80;

/**
 * The circles to show for the hands, as { x, y, r } in image heights (x already times the aspect), like hairsim's units.
 * `hands` is a list of 21-point hands ({x, y} each, normalised 0..1), `aspect` the camera's width / height, `faceWidth` the live
 * face's width in the same units (so a bigger face means a bigger hand), `reach` scales every circle (1 = normal).
 */
export function handShapes(hands, aspect, faceWidth, reach = 1) {
  if (!Array.isArray(hands) || !(aspect > 0) || !(faceWidth > 0) || !(reach > 0)) return [];
  const R = Math.min(3, reach);
  const out = [];
  for (const hand of hands) {
    if (!hand || hand.length < 21) continue;
    const p = (i) => [hand[i].x * aspect, hand[i].y];
    const add = (x, y, r) => { if (Number.isFinite(x) && Number.isFinite(y) && out.length < MAX_CIRCLES) out.push({ x, y, r: r * R }); };
    const palm = PALM.map(p);
    add(palm.reduce((s, q) => s + q[0], 0) / palm.length, palm.reduce((s, q) => s + q[1], 0) / palm.length, faceWidth * 0.36);
    const [wx, wy] = p(0);
    add(wx, wy, faceWidth * 0.20);                                    // the wrist: the live hand joins the photo's sleeve here
    for (const chain of CHAINS) {
      for (let k = 0; k < chain.length; k++) {
        const [x, y] = p(chain[k]);
        add(x, y, faceWidth * (k === chain.length - 1 ? 0.11 : 0.12));
        if (k > 0) { const [qx, qy] = p(chain[k - 1]); add((x + qx) / 2, (y + qy) / 2, faceWidth * 0.11); }
      }
    }
  }
  return out;
}

/**
 * Triangle fans for the circles, in 0..1 screen coordinates (x divided back by the aspect). Each circle is a solid inner disc and a
 * ring that fades to nothing. Returns { positions, alphas, indices, count } (count is the number of vertices), or null when empty.
 */
export function handFans(circles, aspect) {
  if (!circles || circles.length === 0 || !(aspect > 0)) return null;
  const per = 1 + 2 * SEGMENTS;
  const n = circles.length;
  if (n * per > 65535) return null;
  const positions = new Float32Array(n * per * 2), alphas = new Float32Array(n * per), indices = new Uint16Array(n * SEGMENTS * 9);
  let ii = 0;
  circles.forEach((c, k) => {
    const base = k * per;
    const put = (v, x, y, a) => { positions[2 * (base + v)] = x / aspect; positions[2 * (base + v) + 1] = y; alphas[base + v] = a; };
    put(0, c.x, c.y, 1);
    for (let s = 0; s < SEGMENTS; s++) {
      const t = (s / SEGMENTS) * 2 * Math.PI, cx = Math.cos(t), cy = Math.sin(t);
      put(1 + s, c.x + cx * c.r * CORE, c.y + cy * c.r * CORE, 1);                // the solid edge
      put(1 + SEGMENTS + s, c.x + cx * c.r, c.y + cy * c.r, 0);                   // the faded edge
    }
    for (let s = 0; s < SEGMENTS; s++) {
      const n1 = (s + 1) % SEGMENTS;
      const a = base + 1 + s, b = base + 1 + n1, A = base + 1 + SEGMENTS + s, B = base + 1 + SEGMENTS + n1;
      indices[ii++] = base; indices[ii++] = a; indices[ii++] = b;                  // the solid disc
      indices[ii++] = a; indices[ii++] = A; indices[ii++] = b;                     // the soft ring
      indices[ii++] = b; indices[ii++] = A; indices[ii++] = B;
    }
  });
  return { positions, alphas, indices: indices.subarray(0, ii), count: n * per };
}
