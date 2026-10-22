// S13f: "Soft edges", the cheap complement to "Clean the edges" (S13c). Pure numbers (no camera, no canvas, no DOM, no model).
// S13c asks a segmenter where the live hair is (about 26 ms a pass on the UHD 620, and five passes a second doubled the face model's time).
// This takes the boundary from the MESH instead: the outline of the photo's head (the outermost head ring, or the face oval without the
// head) is known on every frame at no cost, so a feathered band is built along it, in the photo's own background colour, drawn under the
// photo's layers. It is three bands (levels) of falling strength, each wider than the last, so the edge fades like a small pyramid of
// blurs would (a hard core, a soft shoulder, a faint tail) with no extra texture taps: the shader only fills a colour.
// It cannot know where hair really is, so it covers a thin strip all round the head, hair or not; S13c can then run less often (edgeHz).
export const FEATHER = Object.freeze({
  levels: Object.freeze([
    Object.freeze({ offset: -0.04, alpha: 1.0 }),   // just inside the outline (the photo's layers cover it): a solid core, no gap at the outline
    Object.freeze({ offset: 0.10, alpha: 0.55 }),   // the shoulder, in face widths outwards
    Object.freeze({ offset: 0.24, alpha: 0.0 }),    // the tail: gone
  ]),
  maxHz: 1.5,                                       // with Soft edges on, the segmenter needs to run no more often than this
  miter: 2.0,                                       // corners may push a vertex out at most this many times the offset
});

const clamp01 = (v) => (v > 0 ? (v > 1 ? 1 : v) : 0);   // NaN becomes 0

/** The segmenter rate to use: the page's rate, or at most FEATHER.maxHz when Soft edges is on (the band already covers most of the seam). */
export function edgeRate(hz, feather) {
  const h = Number(hz);
  if (!Number.isFinite(h) || h <= 0) return h;
  return feather ? Math.min(h, FEATHER.maxHz) : h;
}

/**
 * Builds the feathered band along a closed outline.
 * outline: Float32Array/array of x, y pairs in the picture's 0..1 coordinates; aspect: width / height (so offsets are the same in x and y);
 * scale: the length one offset unit stands for, in picture HEIGHT units after aspect correction (pass the face width).
 * Returns { positions (x, y pairs, 0..1), alphas, indices (triangles), count } or null for a degenerate outline.
 */
export function featherBand(outline, aspect, scale, strength = 1, levels = FEATHER.levels) {
  const n = outline ? Math.floor(outline.length / 2) : 0;
  if (n < 3 || !(aspect > 0) || !(scale > 0)) return null;
  const k = clamp01(strength);
  if (!(k > 0)) return null;
  const px = new Float64Array(n), py = new Float64Array(n);
  let cx = 0, cy = 0;
  for (let i = 0; i < n; i++) {
    px[i] = outline[i * 2] * aspect; py[i] = outline[i * 2 + 1];
    if (!Number.isFinite(px[i]) || !Number.isFinite(py[i])) return null;
    cx += px[i]; cy += py[i];
  }
  cx /= n; cy /= n;
  // outward unit normal at each point: the edge normals either side, averaged, turned to face away from the middle
  const nx = new Float64Array(n), ny = new Float64Array(n), mit = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = (i + n - 1) % n, b = (i + 1) % n;
    const e1x = px[i] - px[a], e1y = py[i] - py[a], e2x = px[b] - px[i], e2y = py[b] - py[i];
    const l1 = Math.hypot(e1x, e1y) || 1, l2 = Math.hypot(e2x, e2y) || 1;
    let n1x = e1y / l1, n1y = -e1x / l1, n2x = e2y / l2, n2y = -e2x / l2;
    let sx = n1x + n2x, sy = n1y + n2y;
    let sl = Math.hypot(sx, sy);
    if (sl < 1e-6) { sx = n1x; sy = n1y; sl = 1; }
    sx /= sl; sy /= sl;
    const cos = Math.max(0.2, sx * n1x + sy * n1y);                              // how sharp the corner is: 1 straight, small at a spike
    if (sx * (px[i] - cx) + sy * (py[i] - cy) < 0) { sx = -sx; sy = -sy; }       // outwards whichever way the outline is wound
    nx[i] = sx; ny[i] = sy; mit[i] = Math.min(FEATHER.miter, 1 / cos);
  }
  const L = levels.length;
  const positions = new Float32Array(L * n * 2), alphas = new Float32Array(L * n);
  for (let l = 0; l < L; l++) for (let i = 0; i < n; i++) {
    const d = levels[l].offset * scale * (levels[l].offset > 0 ? mit[i] : 1);
    const o = (l * n + i);
    positions[o * 2] = (px[i] + nx[i] * d) / aspect; positions[o * 2 + 1] = py[i] + ny[i] * d;
    alphas[o] = clamp01(levels[l].alpha * k);
  }
  const indices = new Uint16Array((L - 1) * n * 6);
  let w = 0;
  for (let l = 0; l < L - 1; l++) for (let i = 0; i < n; i++) {
    const a = l * n + i, b = l * n + ((i + 1) % n), c = (l + 1) * n + i, d = (l + 1) * n + ((i + 1) % n);
    indices[w++] = a; indices[w++] = b; indices[w++] = c; indices[w++] = b; indices[w++] = d; indices[w++] = c;
  }
  return { positions, alphas, indices, count: indices.length, vertices: L * n };
}
