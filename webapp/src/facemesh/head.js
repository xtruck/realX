// Whole head (step S8): hair, ears, the top of the forehead and the neck, drawn from the same photo.
//
// How, and why this way (the cheaper of the two options looked at; docs/FACEMESH.md, "Whole head (S8)"):
//  * Geometry. The 468-point mesh stops at the face oval. Here two rings of extra points are put around that oval, pushed
//    outwards by a fraction of the face width (more above, for hair; less at the sides, for ears; down, for the neck). The same
//    function is applied to the LIVE face and to the PHOTO's face, so each ring point of the live head has a matching point
//    in the photo. That is a few hundred multiplications per frame, no model.
//  * Which parts of the photo are head. The photo (not the camera) is cut into classes ONCE, when it is chosen, by MediaPipe's
//    multiclass selfie segmenter (hair, face skin, body skin, clothes...). Only hair, skin and accessories are kept, so the
//    photo's background and clothes are never pasted around the user's head. Nothing about the live camera frame is segmented.
// Pure functions on numbers, no DOM, so node can test them.
import { VERTEX_COUNT } from "./mesh.js";

/** MediaPipe's face oval, in order around the face (FaceLandmarker.FACE_LANDMARKS_FACE_OVAL; checked against the library in the tests). */
export const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
export const OVAL_COUNT = FACE_OVAL.length;
export const RINGS = 2;
export const RING_VERTICES = OVAL_COUNT * RINGS;
export const HEAD_VERTEX_COUNT = VERTEX_COUNT + RING_VERTICES;
export const RING_TRIANGLES = OVAL_COUNT * (RINGS) * 2;

// How far the outermost ring lies from the oval, in face widths: above the head (hair), at the sides (ears), below (neck).
export const REACH = { top: 0.55, side: 0.3, bottom: 0.7 };   // S11c: the neck reaches further down, so the photo's neck runs on towards the collar

// The classes of MediaPipe's multiclass selfie segmenter: 0 background, 1 hair, 2 body skin, 3 face skin, 4 clothes, 5 others
// (hats, glasses, earrings...). The head is hair, both skins and the accessories; the background and the clothes are not.
export const HEAD_CLASSES = [1, 2, 3, 5];
export const BODY_CLASSES = [2, 4];   // body skin and clothes: what the body and dress puppet of step S10 is cut from
export const HAIR_CLASSES = [1];   // hair only: what the moving hair of step S9 is cut from

/**
 * Positions of the ring points around a face. `landmarks` are normalised points; `aspect` is the picture's width / height,
 * so "outwards by 0.3 of the face width" is the same distance in x and y. Returns RING_VERTICES x, y pairs (inner ring first,
 * each ring in the oval's order), or null when the face is incomplete or degenerate.
 */
export function ringPoints(landmarks, aspect = 1) {
  if (!landmarks || landmarks.length < VERTEX_COUNT || !(aspect > 0)) return null;
  const at = (i) => [landmarks[i].x * aspect, landmarks[i].y];   // work in a space where x and y have the same unit
  let cx = 0, cy = 0;
  for (const i of FACE_OVAL) { const [x, y] = at(i); cx += x; cy += y; }
  cx /= OVAL_COUNT; cy /= OVAL_COUNT;
  // the face's own "up": from the chin (152) to the top of the forehead (10); the head may be tilted
  const [tx, ty] = at(10), [bx, by] = at(152), [lx, ly] = at(234), [rx, ry] = at(454);
  let ux = tx - bx, uy = ty - by;
  const ulen = Math.hypot(ux, uy);
  const width = Math.hypot(rx - lx, ry - ly);
  if (!(ulen > 1e-6) || !(width > 1e-6)) return null;
  ux /= ulen; uy /= ulen;
  const out = new Float32Array(RING_VERTICES * 2);
  FACE_OVAL.forEach((index, k) => {
    const [x, y] = at(index);
    let dx = x - cx, dy = y - cy;
    const len = Math.hypot(dx, dy);
    if (!(len > 1e-9)) { dx = ux; dy = uy; } else { dx /= len; dy /= len; }
    const up = dx * ux + dy * uy;                                        // 1 straight above the head, -1 below the chin
    const reach = width * (REACH.side + (up > 0 ? (REACH.top - REACH.side) * up : (REACH.bottom - REACH.side) * -up));
    for (let r = 1; r <= RINGS; r++) {
      const d = (reach * r) / RINGS, o = ((r - 1) * OVAL_COUNT + k) * 2;
      out[o] = (x + dx * d) / aspect; out[o + 1] = y + dy * d;
    }
  });
  return out;
}

/** The triangles that join the oval to ring 1 and ring 1 to ring 2: indices into [468 mesh points..., ring points...]. */
export function ringTriangles() {
  const out = [];
  const vertex = (ring, k) => (ring === 0 ? FACE_OVAL[k] : VERTEX_COUNT + (ring - 1) * OVAL_COUNT + k);
  for (let r = 0; r < RINGS; r++) {
    for (let k = 0; k < OVAL_COUNT; k++) {
      const n = (k + 1) % OVAL_COUNT;
      const a = vertex(r, k), b = vertex(r, n), c = vertex(r + 1, k), d = vertex(r + 1, n);
      out.push(a, b, c, b, d, c);
    }
  }
  return Uint16Array.from(out);
}

/** Per-vertex fade for the whole head: 1 over the face and at the oval, INNER_FADE on the inner ring, 0 on the outermost ring. S11c: the inner ring used to be 0.5, which made hair edges and the neck ghostly; the photo's own head mask already gives the soft outline. */
export const INNER_FADE = 0.85;
export function headFade() {
  const out = new Float32Array(HEAD_VERTEX_COUNT).fill(1);
  for (let r = 1; r <= RINGS; r++) for (let k = 0; k < OVAL_COUNT; k++) out[VERTEX_COUNT + (r - 1) * OVAL_COUNT + k] = r === 1 ? INNER_FADE : 0;
  return out;
}

/** 1 for the ring points, 0 for the face mesh (the head mask only applies to the ring). */
export function ringFlag() {
  const out = new Float32Array(HEAD_VERTEX_COUNT);
  out.fill(1, VERTEX_COUNT);
  return out;
}

/**
 * The head mask of a photo from the segmenter's class map: 255 where the class is hair, skin or an accessory, 0 elsewhere,
 * softened by a box blur (`soften` pixels each way) so the edge is not a staircase. `classes` is one class number per pixel
 * (width x height); a mask bigger than `maxSide` is thinned first. Returns { width, height, data } with one byte per pixel (of the
 * thinned size); null when the sizes do not agree.
 */
export function headMask(classes, width, height, soften = 2, maxSide = 512, keepClasses = HEAD_CLASSES) {
  if (!classes || !(width > 0) || !(height > 0) || classes.length !== width * height) return null;
  const keep = new Set(keepClasses);
  const step = Math.max(1, Math.ceil(Math.max(width, height) / maxSide));   // a big photo's mask is thinned to about maxSide pixels
  const w = Math.ceil(width / step), h = Math.ceil(height / step);
  const hard = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) hard[y * w + x] = keep.has(classes[y * step * width + x * step]) ? 255 : 0;
  width = w; height = h;
  if (soften <= 0) return { width, height, data: hard };
  const pass = (src, horizontal) => {
    const dst = new Uint8Array(src.length), span = 2 * soften + 1;
    const [outer, inner] = horizontal ? [height, width] : [width, height];
    for (let a = 0; a < outer; a++) {
      let sum = 0;
      const idx = (b) => (horizontal ? a * width + Math.min(inner - 1, Math.max(0, b)) : Math.min(inner - 1, Math.max(0, b)) * width + a);
      for (let b = -soften; b <= soften; b++) sum += src[idx(b)];
      for (let b = 0; b < inner; b++) {
        dst[horizontal ? a * width + b : b * width + a] = Math.round(sum / span);
        sum += src[idx(b + soften + 1)] - src[idx(b - soften)];
      }
    }
    return dst;
  };
  return { width, height, data: pass(pass(hard, true), false) };
}

/**
 * S11g: does the PHOTO's face wear spectacles? The share of "accessory" pixels (class 5) in a band along the eye line (temple to temple,
 * 0.4 eye-distances either side of it) of the segmenter's class map. `landmarks` are the photo's face mesh (normalised), `aspect` the
 * photo's width / height. 0 when the face is incomplete. Frames and lenses usually come out as accessories; a bare face gives about 0.
 */
export function glassesShare(classes, width, height, landmarks, aspect = 1) {
  if (!classes || !(width > 0) || !(height > 0) || classes.length !== width * height || !landmarks || landmarks.length < VERTEX_COUNT) return 0;
  const mid = (a, b) => [(landmarks[a].x + landmarks[b].x) / 2 * aspect, (landmarks[a].y + landmarks[b].y) / 2];
  const A = mid(33, 133), B = mid(362, 263);
  const ex = B[0] - A[0], ey = B[1] - A[1], d2 = ex * ex + ey * ey, d = Math.sqrt(d2);
  if (!(d > 1e-6)) return 0;
  let inside = 0, glass = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const px = (x + 0.5) / width * aspect - A[0], py = (y + 0.5) / height - A[1];
    const t = Math.min(1.3, Math.max(-0.3, (px * ex + py * ey) / d2));
    if (Math.hypot(px - ex * t, py - ey * t) > 0.4 * d) continue;
    inside++;
    if (classes[y * width + x] === 5) glass++;
  }
  return inside > 0 ? glass / inside : 0;
}

/** Share of the pixels that are head: a mask with almost none (or almost all) is not believed (the segmenter found nothing useful). */
export function maskUsable(mask, lo = 0.02, hi = 0.95) {
  if (!mask) return false;
  let on = 0;
  for (let i = 0; i < mask.data.length; i++) if (mask.data[i] > 127) on++;
  const share = on / mask.data.length;
  return share >= lo && share <= hi;
}
