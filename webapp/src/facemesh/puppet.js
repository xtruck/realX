// The body and the dress from a consented photo (step S10): the photo's shirt and arms become a skinned 2D puppet that follows
// the live shoulders, elbows and wrists.
//
// The idea: the photo is cut into body skin and clothes (the segmenter's classes 2 and 4). Over that region a grid of points is
// laid. The photo's pose says where its shoulders, elbows and wrists are, which gives five bones (torso, two upper arms, two
// forearms). Each grid point is tied to the nearest bones by weights. Each frame the live pose gives each bone a new place, size and
// angle; a point goes where its bones say, blended by its weights (linear blend skinning). So the photo's shirt turns with the
// live shoulders, the sleeves follow the live arms, and the whole thing is scaled to the live person's size.
//
// What this is not: a 3D body. It is a flat cut-out bent along the arms. It works for the part of the body the photo shows (often
// shoulders and torso), and a bone the photo does not show simply moves with the torso. Pure numbers in, numbers out: no DOM, no
// WebGL, so node can test it.
//
// Units are "image heights" (x is pixel / image height), like hairsim.js, with y down. MediaPipe pose landmarks are 33 points
// {x, y, z, visibility}, normalised 0..1 on each axis; `aspect` turns x into image heights.

export const POSE = { lSh: 11, rSh: 12, lEl: 13, rEl: 14, lWr: 15, rWr: 16, lHip: 23, rHip: 24 };
export const BONES = ["torso", "lUpper", "lFore", "rUpper", "rFore"];
const HIP_DROP = 1.7;          // the hips are this many shoulder widths below the shoulders when they are not in the picture
const SIGMA = 0.45;            // a point is tied to a bone within about this many shoulder widths
const MAX_CELLS = 70;
const MIN_SCALE = 0.4, MAX_SCALE = 2.5;

/** The joints of a pose as [x, y] in image heights, or null for one that is not seen well enough. */
export function jointsFromPose(landmarks, aspect, minVisibility = 0.5) {
  if (!landmarks || landmarks.length < 25 || !(aspect > 0)) return null;
  const j = {};
  for (const [name, index] of Object.entries(POSE)) {
    const p = landmarks[index];
    const seen = p && Number.isFinite(p.x) && Number.isFinite(p.y) && (p.visibility === undefined || p.visibility >= minVisibility);
    j[name] = seen ? [p.x * aspect, p.y] : null;
  }
  return j;
}

/** The five bones as [[x0, y0], [x1, y1]] or null, from joints. Needs both shoulders; the hips are estimated when not seen. */
export function boneSegments(j) {
  if (!j || !j.lSh || !j.rSh) return null;
  const mid = [(j.lSh[0] + j.rSh[0]) / 2, (j.lSh[1] + j.rSh[1]) / 2];
  const across = [j.lSh[0] - j.rSh[0], j.lSh[1] - j.rSh[1]];            // the person's right shoulder to their left
  const width = Math.hypot(across[0], across[1]);
  if (!(width > 1e-6)) return null;
  const down = [-across[1] / width, across[0] / width];                  // perpendicular to the shoulder line, pointing toward the hips
  const hipMid = j.lHip && j.rHip ? [(j.lHip[0] + j.rHip[0]) / 2, (j.lHip[1] + j.rHip[1]) / 2] : [mid[0] + down[0] * HIP_DROP * width, mid[1] + down[1] * HIP_DROP * width];
  const seg = (a, b) => (a && b ? [a, b] : null);
  return {
    width,
    bones: { torso: [mid, hipMid], lUpper: seg(j.lSh, j.lEl), lFore: seg(j.lEl, j.lWr), rUpper: seg(j.rSh, j.rEl), rFore: seg(j.rEl, j.rWr) },
  };
}

function distToSegment(px, py, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  const t = l2 > 1e-12 ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l2)) : 0;
  return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy));
}

/** Rotation + scale of a bone from where it rests to where it is now: { cos, sin, s, a0, a1 } or null. */
export function boneTransform(rest, now) {
  if (!rest || !now) return null;
  const d0 = [rest[1][0] - rest[0][0], rest[1][1] - rest[0][1]], d1 = [now[1][0] - now[0][0], now[1][1] - now[0][1]];
  const l0 = Math.hypot(d0[0], d0[1]), l1 = Math.hypot(d1[0], d1[1]);
  if (!(l0 > 1e-9) || !(l1 > 1e-9)) return null;
  const dot = d0[0] * d1[0] + d0[1] * d1[1], cross = d0[0] * d1[1] - d0[1] * d1[0];
  const m = Math.hypot(dot, cross);
  return { cos: dot / m, sin: cross / m, s: Math.max(MIN_SCALE, Math.min(MAX_SCALE, l1 / l0)), a0: rest[0], a1: now[0] };
}

function coverageAt(mask, x0, y0, x1, y1) {
  const { width, height, data } = mask;
  const ax = Math.max(0, Math.floor(x0)), bx = Math.min(width, Math.ceil(x1)), ay = Math.max(0, Math.floor(y0)), by = Math.min(height, Math.ceil(y1));
  if (bx <= ax || by <= ay) return 0;
  let sum = 0;
  for (let y = ay; y < by; y++) for (let x = ax; x < bx; x++) sum += data[y * width + x];
  return sum / (255 * (bx - ax) * (by - ay));
}

export class BodyPuppet {
  constructor(g) {
    Object.assign(this, g);
    this.pos = Float32Array.from(this.rest);
    this.anchorLive = Float32Array.from(this.anchors);     // where each point's nearest spot on its main bone is now (for the cover)
    this.haloPos = Float32Array.from(this.rest);
    this.liveWidth = this.shoulderWidth;                    // the live shoulder width, in the same units
    this.torsoOnly = false;                                 // S11j: true = the shirt moves as ONE piece (the arm bones are not used): the arm joints of a cropped photo or a webcam are too shaky and tear the shirt into blocks
  }

  get count() { return this.rest.length / 2; }

  /**
   * Moves the puppet to the live pose. `liveJoints` is jointsFromPose()'s result for the live person. Returns true when the pose was
   * usable (both shoulders seen); false leaves the puppet where it was.
   */
  update(liveJoints) {
    const live = boneSegments(liveJoints);
    if (!live) return false;
    const torso = boneTransform(this.restBones.torso, live.bones.torso);
    if (!torso) return false;
    // a bone that is not seen (in the photo or live) moves with the torso
    const tf = BONES.map((name) => (name === "torso" || this.torsoOnly ? torso : boneTransform(this.restBones[name], live.bones[name]) || torso));
    const B = BONES.length, w = this.weights, rest = this.rest, out = this.pos;
    const anchors = this.anchors, anchorLive = this.anchorLive;
    for (let i = 0; i < this.count; i++) {
      const px = rest[2 * i], py = rest[2 * i + 1], qx = anchors[2 * i], qy = anchors[2 * i + 1];
      let x = 0, y = 0, ax = 0, ay = 0;
      for (let b = 0; b < B; b++) {
        const wb = w[i * B + b];
        if (wb === 0) continue;
        const t = tf[b], dx = px - t.a0[0], dy = py - t.a0[1], ex = qx - t.a0[0], ey = qy - t.a0[1];
        x += wb * (t.a1[0] + t.s * (t.cos * dx - t.sin * dy));
        y += wb * (t.a1[1] + t.s * (t.sin * dx + t.cos * dy));
        ax += wb * (t.a1[0] + t.s * (t.cos * ex - t.sin * ey));
        ay += wb * (t.a1[1] + t.s * (t.sin * ex + t.cos * ey));
      }
      out[2 * i] = x; out[2 * i + 1] = y; anchorLive[2 * i] = ax; anchorLive[2 * i + 1] = ay;
    }
    for (let i = 0; i < out.length; i++) {
      if (!Number.isFinite(out[i]) || !Number.isFinite(anchorLive[i])) { out.set(rest); anchorLive.set(anchors); return false; }   // never hand the renderer a NaN
    }
    this.liveWidth = live.width;
    return true;
  }

  /**
   * The same mesh grown outward, for the cover drawn under the shirt (step S10e): each point moves away from its nearest spot on its main
   * bone by `grow` live shoulder widths, so the silhouette gets bigger all round and hides the edges of the live person's own clothes.
   * Returns the positions (reused between calls). `grow` 0 gives the normal pose.
   */
  halo(grow) {
    const out = this.haloPos, pos = this.pos, q = this.anchorLive, push = Math.max(0, Math.min(1, Number(grow) || 0)) * this.liveWidth;
    for (let i = 0; i < this.count; i++) {
      const dx = pos[2 * i] - q[2 * i], dy = pos[2 * i + 1] - q[2 * i + 1], d = Math.hypot(dx, dy);
      if (d > 1e-9 && push > 0) { out[2 * i] = pos[2 * i] + (dx / d) * push; out[2 * i + 1] = pos[2 * i + 1] + (dy / d) * push; }
      else { out[2 * i] = pos[2 * i]; out[2 * i + 1] = pos[2 * i + 1]; }
    }
    return out;
  }
}

/**
 * Builds the puppet for a photo. `mask` is { width, height, data } (255 = body skin or clothes), `photoPose` the photo's 33 pose points,
 * `aspect` its width / height. Returns null when the photo shows too little body (no shoulders, or almost none of the body).
 */
export function buildBodyPuppet(mask, photoPose, aspect, options = {}) {
  if (!mask || !(aspect > 0)) return null;
  const joints = jointsFromPose(photoPose, aspect, options.minVisibility ?? 0.5);
  const seg = boneSegments(joints);
  if (!seg) return null;
  const unit = 1 / mask.height;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, on = 0;
  for (let y = 0; y < mask.height; y++) for (let x = 0; x < mask.width; x++) {
    if (mask.data[y * mask.width + x] > 127) { on++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  }
  if (on < 0.01 * mask.width * mask.height) return null;
  const x0 = minX * unit, y0 = minY * unit, x1 = (maxX + 1) * unit, y1 = (maxY + 1) * unit;
  const cell = Math.max(seg.width / 8, 1e-4);
  const cols = Math.min(MAX_CELLS, Math.max(2, Math.ceil((x1 - x0) / cell))), rows = Math.min(MAX_CELLS, Math.max(2, Math.ceil((y1 - y0) / cell)));
  const cw = (x1 - x0) / cols, ch = (y1 - y0) / rows;
  const vid = new Int32Array((cols + 1) * (rows + 1)).fill(-1);
  const rest = [], tris = [];
  const vertex = (r, c) => {
    const k = r * (cols + 1) + c;
    if (vid[k] < 0) { vid[k] = rest.length / 2; rest.push(x0 + c * cw, y0 + r * ch); }
    return vid[k];
  };
  let cells = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cov = coverageAt(mask, (x0 + c * cw) / unit, (y0 + r * ch) / unit, (x0 + (c + 1) * cw) / unit, (y0 + (r + 1) * ch) / unit);
    if (cov <= (options.minCoverage ?? 0.12)) continue;
    const a = vertex(r, c), b = vertex(r, c + 1), d = vertex(r + 1, c), e = vertex(r + 1, c + 1);
    tris.push(a, b, d, b, e, d); cells++;
  }
  const n = rest.length / 2;
  if (n < 12) return null;

  const B = BONES.length, weights = new Float32Array(n * B), sigma = SIGMA * seg.width;
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let b = 0; b < B; b++) {
      const bone = seg.bones[BONES[b]];
      if (!bone) continue;
      const d = distToSegment(rest[2 * i], rest[2 * i + 1], bone[0], bone[1]);
      const w = Math.exp(-((d / sigma) ** 2)) + (b === 0 ? 0.02 : 0);   // the torso always has a small say, so no point is left unbound
      weights[i * B + b] = w; sum += w;
    }
    if (!(sum > 1e-9)) { weights[i * B] = 1; sum = 1; }
    for (let b = 0; b < B; b++) weights[i * B + b] /= sum;
  }
  const anchors = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {                                           // the nearest spot on the bone that holds this point most
    let best = 0;
    for (let b = 1; b < B; b++) if (weights[i * B + b] > weights[i * B + best]) best = b;
    const bone = seg.bones[BONES[best]] || seg.bones.torso;
    const dx = bone[1][0] - bone[0][0], dy = bone[1][1] - bone[0][1], l2 = dx * dx + dy * dy;
    const t = l2 > 1e-12 ? Math.max(0, Math.min(1, ((rest[2 * i] - bone[0][0]) * dx + (rest[2 * i + 1] - bone[0][1]) * dy) / l2)) : 0;
    anchors[2 * i] = bone[0][0] + t * dx; anchors[2 * i + 1] = bone[0][1] + t * dy;
  }
  const uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { uv[2 * i] = rest[2 * i] / aspect; uv[2 * i + 1] = rest[2 * i + 1]; }
  return new BodyPuppet({
    rest: Float32Array.from(rest), uv, anchors, weights, triangles: Uint16Array.from(tris), restBones: seg.bones, shoulderWidth: seg.width,
    stats: { points: n, cells, bones: BONES.filter((b) => seg.bones[b]).length },
  });
}

/**
 * Steadies the live joints: each is blended toward its new place by `alpha` (1 = no smoothing). A joint that is not seen now keeps its
 * last place for `hold` calls and then goes missing; a joint that was missing and is seen jumps straight to it.
 * `state` is the object returned last time (or null at the start); returns { joints, state }.
 */
export function smoothJoints(state, joints, alpha = 0.5, hold = 4) {
  const out = {}, next = { last: {}, missed: {} };
  const prev = state || { last: {}, missed: {} };
  for (const name of Object.keys(POSE)) {
    const now = joints ? joints[name] : null, before = prev.last[name] || null;
    if (now) {
      out[name] = before ? [before[0] + alpha * (now[0] - before[0]), before[1] + alpha * (now[1] - before[1])] : now;
      next.last[name] = out[name]; next.missed[name] = 0;
    } else {
      const missed = (prev.missed[name] || 0) + 1;
      out[name] = before && missed <= hold ? before : null;
      next.last[name] = out[name]; next.missed[name] = missed;
    }
  }
  return { joints: out, state: next };
}
