// The canonical face mesh and the small geometry the face-mesh prototype needs. Pure functions, no DOM, so node can test them.
//
// MediaPipe's FaceLandmarker returns 478 points per face: 468 mesh vertices, then 10 for the irises. The mesh below
// (898 triangles over the first 468) is MediaPipe's own canonical model (Apache-2.0), see tools/make-canonical-mesh.mjs.
import canonical from "./canonical.json" with { type: "json" };

export const VERTEX_COUNT = 468;
export const TRIANGLE_COUNT = 898;

/** The mesh as typed arrays: `triangles` (3 vertex indices each), `uv` (2 per vertex) and the unique `edges` (2 indices each). */
export function buildMesh(data = canonical) {
  if (data.vertices !== VERTEX_COUNT || data.triangles.length !== TRIANGLE_COUNT * 3 || data.uv.length !== VERTEX_COUNT * 2) {
    throw new Error("canonical face mesh has the wrong size");
  }
  const triangles = Uint16Array.from(data.triangles);
  for (const v of triangles) if (v >= VERTEX_COUNT) throw new Error(`triangle uses vertex ${v}`);
  return { triangles, uv: Float32Array.from(data.uv), edges: uniqueEdges(triangles) };
}

/** Each edge of the mesh once (neighbouring triangles share edges), so a wireframe draws every line a single time. */
export function uniqueEdges(triangles) {
  const seen = new Set();
  const out = [];
  for (let i = 0; i < triangles.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      const a = triangles[i + k], b = triangles[i + ((k + 1) % 3)];
      const lo = Math.min(a, b), hi = Math.max(a, b);
      const key = lo * 1024 + hi;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(lo, hi);
    }
  }
  return Uint16Array.from(out);
}

/**
 * Pixel coordinates of every edge: for edge e, `out[4e..4e+3]` = x1, y1, x2, y2. `landmarks` are MediaPipe's normalised
 * points ({x, y} in 0..1 of the camera frame); width and height are the frame's size in pixels.
 * Returns false (and leaves `out` alone) when the landmarks are missing or too few.
 */
export function fillSegments(landmarks, edges, width, height, out) {
  if (!landmarks || landmarks.length < VERTEX_COUNT) return false;
  for (let e = 0, o = 0; e < edges.length; e += 2, o += 4) {
    const p = landmarks[edges[e]], q = landmarks[edges[e + 1]];
    out[o] = p.x * width; out[o + 1] = p.y * height;
    out[o + 2] = q.x * width; out[o + 3] = q.y * height;
  }
  return true;
}

/**
 * How many triangle-steps each vertex is from the mesh's outer edge: 0 on the edge, 1 for its neighbours, and so on.
 * The renderer fades the picture in over the first few steps, so the edge of the face blends into the live picture.
 */
export function edgeDepth(triangles) {
  const count = new Map();                       // edge -> number of triangles using it (an edge used once lies on the outline)
  const neighbours = Array.from({ length: VERTEX_COUNT }, () => new Set());
  for (let i = 0; i < triangles.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      const a = triangles[i + k], b = triangles[i + ((k + 1) % 3)];
      const key = Math.min(a, b) * 1024 + Math.max(a, b);
      count.set(key, (count.get(key) || 0) + 1);
      neighbours[a].add(b); neighbours[b].add(a);
    }
  }
  const depth = new Float32Array(VERTEX_COUNT).fill(-1);
  let frontier = [];
  for (const [key, n] of count) {
    if (n !== 1) continue;
    for (const v of [Math.floor(key / 1024), key % 1024]) if (depth[v] < 0) { depth[v] = 0; frontier.push(v); }
  }
  for (let d = 1; frontier.length; d++) {
    const next = [];
    for (const v of frontier) for (const w of neighbours[v]) if (depth[w] < 0) { depth[w] = d; next.push(w); }
    frontier = next;
  }
  return depth;
}

// Where the eyes and the inside of the mouth are, as MediaPipe numbers them. "Keep my eyes and mouth" shows the live ones
// through the photo; the photo is then drawn only around them.
export const LEFT_EYE = [249, 263, 362, 373, 374, 380, 381, 382, 384, 385, 386, 387, 388, 390, 398, 466];
export const RIGHT_EYE = [7, 33, 133, 144, 145, 153, 154, 155, 157, 158, 159, 160, 161, 163, 173, 246];
export const INNER_LIPS = [13, 14, 78, 80, 81, 82, 87, 88, 95, 178, 191, 308, 310, 311, 312, 317, 318, 324, 402, 415];

/** 1 for the vertices that outline the eyes and the inside of the mouth, 0 elsewhere (one number per vertex). */
export function keepMask() {
  const mask = new Float32Array(VERTEX_COUNT);
  for (const v of [...LEFT_EYE, ...RIGHT_EYE, ...INNER_LIPS]) mask[v] = 1;
  return mask;
}

/** The mesh points as a flat x, y array (normalised, y down): a face's live positions, or the photo's texture coordinates. */
export function flatten(landmarks, out = new Float32Array(VERTEX_COUNT * 2)) {
  if (!landmarks || landmarks.length < VERTEX_COUNT) return null;
  for (let i = 0; i < VERTEX_COUNT; i++) { out[2 * i] = landmarks[i].x; out[2 * i + 1] = landmarks[i].y; }
  return out;
}

/**
 * Is this photo usable as a face texture? `faces` is the face model's result for the photo (a list of landmark lists).
 * One face, big enough to carry detail, and not cut off by the photo's edge. A photo of two people is refused so the
 * texture is never a guess about which one is meant.
 */
export function checkPhotoFaces(faces, minWidth = 0.2) {
  if (!faces || faces.length === 0) return { ok: false, reason: "no face was found in this photo" };
  if (faces.length > 1) return { ok: false, reason: "this photo has more than one face: use a photo of one person" };
  const box = faceBox(faces[0]);
  if (!box) return { ok: false, reason: "the face in this photo is incomplete" };
  if (box.w < minWidth) return { ok: false, reason: "the face is too small in this photo: use a closer, front-facing photo" };
  if (box.x < 0 || box.y < 0 || box.x + box.w > 1 || box.y + box.h > 1) return { ok: false, reason: "the face is cut off by the edge of the photo" };
  return { ok: true, reason: "" };
}

/** Smallest box around the mesh points, in normalised units; null when there is no face. */
export function faceBox(landmarks) {
  if (!landmarks || landmarks.length < VERTEX_COUNT) return null;
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (let i = 0; i < VERTEX_COUNT; i++) {
    const { x, y } = landmarks[i];
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/**
 * A rolling count of how many of the last `windowMs` of frames found a face, and how many frames per second were processed.
 * Feed it `mark(now, found)` once per processed frame.
 */
export class RollingStats {
  constructor(windowMs = 5000) { this.windowMs = windowMs; this.items = []; }
  mark(now, found) {
    this.items.push({ t: now, found: !!found });
    const cutoff = now - this.windowMs;
    while (this.items.length && this.items[0].t < cutoff) this.items.shift();
  }
  /** { fps, foundPct } over the window; zeros when there is less than a second of data. */
  read() {
    const n = this.items.length;
    if (n < 2) return { fps: 0, foundPct: 0 };
    const span = this.items[n - 1].t - this.items[0].t;
    if (span < 1000) return { fps: 0, foundPct: 0 };
    const found = this.items.reduce((s, i) => s + (i.found ? 1 : 0), 0);
    return { fps: ((n - 1) * 1000) / span, foundPct: (100 * found) / n };
  }
}

// --- S11l, the photo's own face shape ----------------------------------------------------------------------------------------------
// Without this the photo is warped to the live face's exact shape (its nose, its jaw, its lip width), so the result is "you with a skin
// graft". Here the live mesh is moved part of the way toward the PHOTO's mesh, fitted onto the live face (scale, turn, shift from stable points),
// except where the face moves with expression (eyes, brows, lips), which stay live. When the live head turns, the flat fit stops matching and
// the effect fades out by itself.
export const STABLE_POINTS = [33, 133, 362, 263, 168, 6, 1, 4, 10, 152, 234, 454, 61, 291];   // eye corners, nose bridge and tip, forehead, chin, face sides, mouth corners
const OUTER_LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
const BROWS = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46, 300, 293, 334, 296, 336, 285, 295, 282, 283, 276];

/** One weight per mesh point: 1 = take the photo's shape, 0 = stay live. */
export function shapeWeights() {
  const w = new Float32Array(VERTEX_COUNT).fill(1);
  for (const v of [...LEFT_EYE, ...RIGHT_EYE, ...INNER_LIPS]) w[v] = 0;
  for (const v of OUTER_LIPS) w[v] = 0.35;
  for (const v of BROWS) w[v] = 0.4;
  return w;
}

/**
 * Fits the photo's stable points onto the live ones: a scale + turn + shift (least squares). `live` and `photo` are flat x, y arrays of the
 * whole mesh (normalised), `liveAspect` and `photoAspect` the width / height of their pictures (so x and y have the same unit).
 * Returns { re, im, pc, lc, rms } or null: z = re + i*im is the scale and turn, pc and lc the photo's and live centres, rms the mean gap
 * left over in live face widths (a measure of how well a flat fit matches: a turned head gives a big number).
 */
export function similarityFit(live, photo, liveAspect = 1, photoAspect = 1, points = STABLE_POINTS) {
  const n = points.length;
  let lcx = 0, lcy = 0, pcx = 0, pcy = 0;
  for (const i of points) { lcx += live[2 * i] * liveAspect; lcy += live[2 * i + 1]; pcx += photo[2 * i] * photoAspect; pcy += photo[2 * i + 1]; }
  lcx /= n; lcy /= n; pcx /= n; pcy /= n;
  let num_re = 0, num_im = 0, den = 0;
  for (const i of points) {
    const px = photo[2 * i] * photoAspect - pcx, py = photo[2 * i + 1] - pcy, qx = live[2 * i] * liveAspect - lcx, qy = live[2 * i + 1] - lcy;
    num_re += px * qx + py * qy; num_im += px * qy - py * qx; den += px * px + py * py;
  }
  if (!(den > 1e-12)) return null;
  const re = num_re / den, im = num_im / den;
  let err = 0;
  for (const i of points) {
    const px = photo[2 * i] * photoAspect - pcx, py = photo[2 * i + 1] - pcy, qx = live[2 * i] * liveAspect - lcx, qy = live[2 * i + 1] - lcy;
    const ax = re * px - im * py, ay = im * px + re * py;
    err += (ax - qx) ** 2 + (ay - qy) ** 2;
  }
  const width = Math.hypot((live[2 * 454] - live[2 * 234]) * liveAspect, live[2 * 454 + 1] - live[2 * 234 + 1]);
  if (!(width > 1e-9)) return null;
  return { re, im, pc: [pcx, pcy], lc: [lcx, lcy], rms: Math.sqrt(err / n) / width };
}

/** How far a head is turned, from the mesh alone: [yaw, pitch] as the nose tip's place between the cheeks, and between the eyes and the chin. */
export function headTurn(flat, aspect = 1) {
  const xl = flat[2 * 234] * aspect, xr = flat[2 * 454] * aspect, nx = flat[2 * 1] * aspect;
  const ey = (flat[2 * 133 + 1] + flat[2 * 362 + 1]) / 2, ny = flat[2 * 1 + 1], cy = flat[2 * 152 + 1];
  const w = xr - xl, h = cy - ey;
  return [Math.abs(w) > 1e-9 ? (nx - (xl + xr) / 2) / w : 0, Math.abs(h) > 1e-9 ? (ny - ey) / h : 0];
}

/**
 * Moves the live mesh `live` (flat, edited in place) toward the photo's shape. `amount` 0..1 is how far, `weights` from shapeWeights().
 * The photo is flat (front-on), so the effect fades out as the live head turns away from the photo's own pose: full while the nose sits
 * between the cheeks as the photo's does (within `free`), none beyond `giveUp` (measured by headTurn()). Returns the amount really used.
 */
export function blendShape(live, photo, liveAspect, photoAspect, amount, weights, free = 0.05, giveUp = 0.16) {
  if (!(amount > 0)) return 0;
  const fit = similarityFit(live, photo, liveAspect, photoAspect);
  if (!fit) return 0;
  const a = headTurn(live, liveAspect), b = headTurn(photo, photoAspect);
  const d = Math.abs(a[0] - b[0]);   // yaw only: how far up the face the nose sits differs between people, so pitch cannot be judged this way
  const t = Math.min(1, Math.max(0, (d - free) / (giveUp - free)));
  const k = amount * (1 - t * t * (3 - 2 * t));
  if (!(k > 0)) return 0;
  for (let i = 0; i < VERTEX_COUNT; i++) {
    const w = k * weights[i];
    if (w === 0) continue;
    const px = photo[2 * i] * photoAspect - fit.pc[0], py = photo[2 * i + 1] - fit.pc[1];
    const ax = (fit.re * px - fit.im * py + fit.lc[0]) / liveAspect, ay = fit.im * px + fit.re * py + fit.lc[1];
    live[2 * i] += w * (ax - live[2 * i]); live[2 * i + 1] += w * (ay - live[2 * i + 1]);
  }
  return k;
}
