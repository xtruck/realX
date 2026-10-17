// The body and dress puppet (src/facemesh/puppet.js) on a synthetic photo: a torso and two arms in a mask, with a known pose.
import test from "node:test";
import assert from "node:assert/strict";
import { BONES, BodyPuppet, boneSegments, boneTransform, buildBodyPuppet, jointsFromPose, smoothJoints } from "../src/facemesh/puppet.js";

const W = 400, H = 500, ASPECT = W / H;

function pose(overrides = {}) {
  const lm = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0, visibility: 0 }));
  const set = (i, x, y, v = 0.99) => { lm[i] = { x, y, z: 0, visibility: v }; };
  set(11, 0.68, 0.55); set(12, 0.32, 0.55);          // the person's left shoulder is on the image's right
  set(13, 0.80, 0.72); set(14, 0.20, 0.72);
  set(15, 0.82, 0.90); set(16, 0.18, 0.90);
  set(23, 0.62, 0.98, 0.1); set(24, 0.38, 0.98, 0.1);   // hips not really in the picture
  for (const [i, v] of Object.entries(overrides)) lm[Number(i)] = v === null ? { x: 0, y: 0, z: 0, visibility: 0 } : { ...lm[Number(i)], ...v };
  return lm;
}

function bodyMask() {
  const data = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = x / W, ny = y / H;
    const torso = nx >= 0.30 && nx <= 0.70 && ny >= 0.50 && ny <= 1.0;
    const rightArm = nx >= 0.14 && nx <= 0.30 && ny >= 0.55 && ny <= 0.95;
    const leftArm = nx >= 0.70 && nx <= 0.86 && ny >= 0.55 && ny <= 0.95;
    if (torso || rightArm || leftArm) data[y * W + x] = 255;
  }
  return { width: W, height: H, data };
}

const puppet = () => buildBodyPuppet(bodyMask(), pose(), ASPECT);
const live = (overrides, aspect = ASPECT) => jointsFromPose(pose(overrides), aspect);
const nearest = (p, x, y) => { let best = 0, d = Infinity; for (let i = 0; i < p.count; i++) { const e = Math.hypot(p.rest[2 * i] - x, p.rest[2 * i + 1] - y); if (e < d) { d = e; best = i; } } return best; };

test("a photo with shoulders, arms and a body mask becomes a puppet with five bones and weights that add up to one", () => {
  const p = puppet();
  assert.ok(p && p.stats.points > 40 && p.stats.bones === 5, JSON.stringify(p && p.stats));
  for (let i = 0; i < p.count; i++) {
    let sum = 0;
    for (let b = 0; b < BONES.length; b++) sum += p.weights[i * BONES.length + b];
    assert.ok(Math.abs(sum - 1) < 1e-5);
  }
  for (const idx of p.triangles) assert.ok(idx < p.count);
  for (const v of p.uv) assert.ok(v >= 0 && v <= 1);
});

test("a photo without visible shoulders, with almost no body, or without a mask gives no puppet", () => {
  assert.equal(buildBodyPuppet(bodyMask(), pose({ 11: null }), ASPECT), null);
  assert.equal(buildBodyPuppet({ width: W, height: H, data: new Uint8Array(W * H) }, pose(), ASPECT), null);
  assert.equal(buildBodyPuppet(null, pose(), ASPECT), null);
  assert.equal(buildBodyPuppet(bodyMask(), pose().slice(0, 5), ASPECT), null);
});

test("when the live pose equals the photo's pose nothing moves", () => {
  const p = puppet();
  assert.equal(p.update(live({})), true);
  for (let i = 0; i < p.rest.length; i++) assert.ok(Math.abs(p.pos[i] - p.rest[i]) < 1e-5);
});

test("moving every joint the same way moves every point the same way, exactly", () => {
  const p = puppet();
  const dx = 0.12, dy = -0.05;
  const moved = pose();
  for (const i of [11, 12, 13, 14, 15, 16, 23, 24]) { moved[i] = { ...moved[i], x: moved[i].x + dx / ASPECT, y: moved[i].y + dy }; }
  assert.equal(p.update(jointsFromPose(moved, ASPECT)), true);
  for (let i = 0; i < p.count; i++) {
    assert.ok(Math.abs(p.pos[2 * i] - (p.rest[2 * i] + dx)) < 1e-4 && Math.abs(p.pos[2 * i + 1] - (p.rest[2 * i + 1] + dy)) < 1e-4);
  }
});

test("a bigger live person scales the shirt up around the shoulders", () => {
  const p = puppet();
  const mid = [0.5 * ASPECT, 0.55], k = 1.4;
  const scaled = pose();
  for (const i of [11, 12, 13, 14, 15, 16, 23, 24]) {
    scaled[i] = { ...scaled[i], x: (mid[0] + k * (scaled[i].x * ASPECT - mid[0])) / ASPECT, y: mid[1] + k * (scaled[i].y - mid[1]) };
  }
  assert.equal(p.update(jointsFromPose(scaled, ASPECT)), true);
  for (let i = 0; i < p.count; i += 7) {
    assert.ok(Math.abs(p.pos[2 * i] - (mid[0] + k * (p.rest[2 * i] - mid[0]))) < 2e-3, "x");
    assert.ok(Math.abs(p.pos[2 * i + 1] - (mid[1] + k * (p.rest[2 * i + 1] - mid[1]))) < 2e-3, "y");
  }
});

test("raising one forearm moves that sleeve and leaves the other side alone", () => {
  const p = puppet();
  const wristRight = nearest(p, 0.18 * ASPECT, 0.90), wristLeft = nearest(p, 0.82 * ASPECT, 0.90), chest = nearest(p, 0.5 * ASPECT, 0.7);
  assert.equal(p.update(live({ 16: { x: 0.30, y: 0.50 } })), true);       // the person's right wrist goes up toward the face
  const shift = (i) => Math.hypot(p.pos[2 * i] - p.rest[2 * i], p.pos[2 * i + 1] - p.rest[2 * i + 1]);
  assert.ok(shift(wristRight) > 0.15, `the raised sleeve moved (${shift(wristRight).toFixed(3)})`);
  assert.ok(shift(wristLeft) < 0.01, `the other sleeve did not (${shift(wristLeft).toFixed(4)})`);
  assert.ok(shift(chest) < 0.05, `the chest barely moved (${shift(chest).toFixed(4)})`);
});

test("an arm that the live camera does not see moves with the torso instead of vanishing", () => {
  const p = puppet();
  const dx = 0.1;
  const moved = pose({ 13: null, 15: null });                                // the left elbow and wrist are not visible live
  for (const i of [11, 12, 14, 16, 23, 24]) moved[i] = { ...moved[i], x: moved[i].x + dx / ASPECT };
  assert.equal(p.update(jointsFromPose(moved, ASPECT)), true);
  const wristLeft = nearest(p, 0.82 * ASPECT, 0.90);
  assert.ok(Math.abs(p.pos[2 * wristLeft] - (p.rest[2 * wristLeft] + dx)) < 1e-3 && Number.isFinite(p.pos[2 * wristLeft + 1]));
});

test("an unusable live pose leaves the puppet where it was", () => {
  const p = puppet();
  assert.equal(p.update(live({})), true);
  const before = Float32Array.from(p.pos);
  assert.equal(p.update(live({ 11: null })), false);
  assert.deepEqual(Array.from(p.pos), Array.from(before));
  assert.equal(p.update(null), false);
  assert.ok(p.pos.every(Number.isFinite));
});

test("a bone's scale is limited, so one bad joint cannot blow the shirt up", () => {
  const t = boneTransform([[0, 0], [0, 1]], [[0, 0], [0, 10]]);
  assert.equal(t.s, 2.5);
  assert.equal(boneTransform([[0, 0], [0, 1]], [[0, 0], [0, 0.01]]).s, 0.4);
  assert.equal(boneTransform([[0, 0], [0, 0]], [[0, 0], [0, 1]]), null);
  assert.equal(boneTransform(null, [[0, 0], [0, 1]]), null);
});

test("joints below the visibility limit are not trusted, and the hips are estimated below the shoulders", () => {
  const j = jointsFromPose(pose(), ASPECT);
  assert.equal(j.lHip, null, "hips seen at 0.1 are not trusted");
  assert.ok(Math.abs(j.lSh[0] - 0.68 * ASPECT) < 1e-9);
  const seg = boneSegments(j);
  assert.ok(seg.bones.torso[1][1] > seg.bones.torso[0][1], "the estimated hips are below the shoulders");
  assert.equal(boneSegments(jointsFromPose(pose({ 12: null }), ASPECT)), null);
  assert.equal(jointsFromPose(pose().slice(0, 10), ASPECT), null);
});

test("a puppet that is handed non-finite numbers falls back to the rest pose instead of NaN", () => {
  const p = puppet();
  const j = live({});
  j.lSh = [NaN, 0.5];
  assert.equal(p.update(j), false);
  assert.ok(p.pos.every(Number.isFinite));
  assert.ok(p instanceof BodyPuppet);
});

test("smoothing blends joints toward their new place, holds a missing joint for a few frames, then lets it go", () => {
  const a = jointsFromPose(pose(), ASPECT);
  let r = smoothJoints(null, a, 0.5);
  assert.deepEqual(r.joints.lSh, a.lSh, "the first sight of a joint is taken as it is");
  const b = jointsFromPose(pose({ 11: { x: 0.78 } }), ASPECT);
  r = smoothJoints(r.state, b, 0.5);
  assert.ok(Math.abs(r.joints.lSh[0] - (a.lSh[0] + b.lSh[0]) / 2) < 1e-9, "half way there");
  const gone = jointsFromPose(pose({ 11: null }), ASPECT);
  for (let i = 0; i < 4; i++) { r = smoothJoints(r.state, gone, 0.5); assert.ok(r.joints.lSh, `held on missed frame ${i + 1}`); }
  r = smoothJoints(r.state, gone, 0.5);
  assert.equal(r.joints.lSh, null, "after the hold it is gone");
  r = smoothJoints(r.state, b, 0.5);
  assert.deepEqual(r.joints.lSh, b.lSh, "and a joint that comes back is taken as it is");
  assert.equal(smoothJoints(null, null).joints.lSh, null);
});

test("the cover (halo) grows the silhouette outward from the bones, and grow 0 is the normal pose", () => {
  const p = puppet();
  assert.equal(p.update(live({})), true);
  const same = Float32Array.from(p.halo(0));
  for (let i = 0; i < p.pos.length; i++) assert.ok(Math.abs(same[i] - p.pos[i]) < 1e-9);
  const grown = p.halo(0.2);
  const width = (a) => { let lo = Infinity, hi = -Infinity; for (let i = 0; i < a.length; i += 2) { lo = Math.min(lo, a[2 * (i / 2)]); hi = Math.max(hi, a[2 * (i / 2)]); } return hi - lo; };
  assert.ok(width(grown) > width(p.pos) + 0.1 * p.liveWidth, "the cover is wider than the shirt");
  const move = (i) => Math.hypot(grown[2 * i] - p.pos[2 * i], grown[2 * i + 1] - p.pos[2 * i + 1]);
  let maxMove = 0;
  for (let i = 0; i < p.count; i++) maxMove = Math.max(maxMove, move(i));
  assert.ok(Math.abs(maxMove - 0.2 * p.liveWidth) < 1e-6, "no point moves more than the grow amount");
  assert.ok(grown.every(Number.isFinite));
});

test("the cover follows the live shoulder width and is limited, so a bad number cannot blow it up", () => {
  const p = puppet();
  p.update(live({}));
  const a = Float32Array.from(p.halo(0.1));
  assert.ok(p.halo(5).every(Number.isFinite), "an extreme grow is capped");
  p.update(live({ 11: { x: 0.80 } }));                              // the live shoulders move apart: a wider person
  assert.ok(p.liveWidth > p.shoulderWidth * 1.2);
  const b = p.halo(0.1);
  let m = 0; for (let i = 0; i < p.count; i++) m = Math.max(m, Math.hypot(b[2 * i] - p.pos[2 * i], b[2 * i + 1] - p.pos[2 * i + 1]));
  assert.ok(Math.abs(m - 0.1 * p.liveWidth) < 1e-6, "the push scales with the live width");
  assert.ok(a.every(Number.isFinite));
  assert.ok(p.halo(NaN).every(Number.isFinite) && p.halo(-1).every(Number.isFinite));
});

test("torsoOnly: the shirt moves as one piece even when a forearm is raised (the arm bones are not used)", () => {
  const raised = { 15: { x: 0.85, y: 0.40 } };         // the live person's left wrist goes up
  const free = puppet(); free.update(live(raised));
  const one = puppet(); one.torsoOnly = true; one.update(live(raised));
  const i = nearest(one, 0.80 * W / H, 0.85);          // a point on the sleeve near the raised wrist, in image heights
  const still = puppet(); still.update(live({}));
  assert.ok(Math.hypot(free.pos[2 * i] - still.pos[2 * i], free.pos[2 * i + 1] - still.pos[2 * i + 1]) > 1e-3, "with arm bones the sleeve moves");
  assert.ok(Math.hypot(one.pos[2 * i] - still.pos[2 * i], one.pos[2 * i + 1] - still.pos[2 * i + 1]) < 1e-6, "torsoOnly: the sleeve stays with the torso");
});
