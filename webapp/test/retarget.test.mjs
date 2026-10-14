import test from "node:test";
import assert from "node:assert/strict";
import { Quaternion, Vector3 } from "three";
import { BodySolver, restFrom } from "../src/retarget.js";
import { BONES, EXPRESSIONS, PARENT } from "../src/skeleton.js";
import { faceToExpressions, gaze } from "../src/blend.js";
import { OneEuro, QuatFilter } from "../src/oneeuro.js";

// Pip's rest layout (see scripts/make_character.py)
function pipPos(bone) {
  const m = /^(left|right)(.*)$/.exec(bone);
  if (!m) return null;
  const sx = m[1] === "left" ? 1 : -1, n = m[2];
  const table = {
    LowerArm: [0.12, 0, 0], Hand: [0.11, 0, 0], LowerLeg: [0, -0.14, 0], Foot: [0, -0.14, 0], Toes: [0, -0.10, 0.09],
  };
  if (table[n]) { const [x, y, z] = table[n]; return new Vector3(x * (n === "LowerLeg" || n === "Foot" || n === "Toes" ? 1 : sx), y, z); }
  const f = /^(Index|Middle|Ring|Little)(Proximal|Intermediate|Distal)$/.exec(n);
  if (f) {
    const z = { Index: 0.026, Middle: 0.008, Ring: -0.010, Little: -0.027 }[f[1]];
    if (f[2] === "Proximal") return new Vector3(sx * 0.062, 0, z);
    return new Vector3(sx * (f[2] === "Intermediate" ? 0.032 : 0.022), 0, 0);
  }
  if (n === "ThumbMetacarpal") return new Vector3(sx * 0.02, 0, 0.026);
  if (n === "ThumbProximal") return new Vector3(sx * 0.012, 0, 0.020);
  if (n === "ThumbDistal") return new Vector3(sx * 0.010, 0, 0.018);
  return null;
}
const rest = restFrom(pipPos);

// MediaPipe pose world space: x toward the image right, y DOWN, z toward the camera is negative.
function tPose(over = {}) {
  const lm = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0, visibility: 1 }));
  const set = (i, x, y, z = 0) => { lm[i] = { x, y, z, visibility: 1 }; };
  set(11, 0.18, -0.45); set(12, -0.18, -0.45);            // shoulders (subject's left is image right)
  set(13, 0.40, -0.45); set(14, -0.40, -0.45);            // elbows
  set(15, 0.65, -0.45); set(16, -0.65, -0.45);            // wrists
  set(23, 0.10, 0); set(24, -0.10, 0);                    // hips
  set(25, 0.10, 0.45); set(26, -0.10, 0.45);              // knees
  set(27, 0.10, 0.90); set(28, -0.10, 0.90);              // ankles
  set(29, 0.10, 0.95, 0.05); set(30, -0.10, 0.95, 0.05);  // heels
  set(31, 0.10, 1.02, -0.108); set(32, -0.10, 1.02, -0.108);// foot index, in line with Pip's resting foot
  for (const [i, v] of Object.entries(over)) lm[i] = { ...lm[i], ...v };
  return { world: lm };
}
const angle = (q) => 2 * Math.acos(Math.min(1, Math.abs(q.w)));
const apply = (q, v) => v.clone().applyQuaternion(q);
const near = (a, b, eps = 0.05) => assert.ok(a.distanceTo(b) < eps, `${a.toArray().map((x) => x.toFixed(3))} vs ${b.toArray().map((x) => x.toFixed(3))}`);

test("skeleton: every bone has a parent chain ending at hips, and order is fixed", () => {
  for (const b of BONES) { let c = b, n = 0; while (c !== "hips") { c = PARENT[c]; assert.ok(c, b); assert.ok(++n < 10); } }
  assert.equal(new Set(BONES).size, BONES.length);
  assert.ok(BONES.length >= 50 && BONES.length * 4 <= 400);
});

test("T-pose with the legs in view gives identity rotations everywhere", () => {
  const out = new BodySolver(rest, { mirror: false }).solve({ pose: tPose() });
  assert.ok(out.live.pose && out.live.legs);
  for (const b of ["hips", "spine", "chest", "leftUpperArm", "leftLowerArm", "rightUpperArm", "rightLowerArm", "leftUpperLeg", "rightLowerLeg"]) {
    assert.ok(angle(out.quats[b]) < 0.05, `${b} ${angle(out.quats[b])}`);
  }
  // toes point forward (+Z) at rest and toward the camera here, so the foot barely turns
  assert.ok(angle(out.quats.leftFoot) < 0.1);
  const tiptoe = new BodySolver(rest, { mirror: false }).solve({ pose: tPose({ 31: { y: 0.80, z: -0.04 } }) });
  assert.ok(angle(tiptoe.quats.leftFoot) > 0.5, "toes lifted: the foot rotates");
});

test("raising the left forearm bends the character's left elbow up", () => {
  const pose = tPose({ 15: { x: 0.40, y: -0.90 } }); // wrist straight above the elbow
  const out = new BodySolver(rest, { mirror: false }).solve({ pose });
  near(apply(out.quats.leftLowerArm, new Vector3(1, 0, 0)), new Vector3(0, 1, 0));
  assert.ok(angle(out.quats.leftUpperArm) < 0.05 && angle(out.quats.rightLowerArm) < 0.05);
});

test("mirror: your left arm becomes the character's right arm, like a reflection", () => {
  const pose = tPose({ 15: { x: 0.40, y: -0.90 } });
  const out = new BodySolver(rest, { mirror: true }).solve({ pose });
  near(apply(out.quats.rightLowerArm, new Vector3(-1, 0, 0)), new Vector3(0, 1, 0));
  assert.ok(angle(out.quats.leftLowerArm) < 0.05);
});

test("arm hanging down and a bent knee come out right", () => {
  const pose = tPose({ 13: { x: 0.2, y: -0.0 }, 15: { x: 0.2, y: 0.45 }, 25: { x: 0.1, y: 0.40, z: -0.3 } });
  const out = new BodySolver(rest, { mirror: false }).solve({ pose });
  near(apply(out.quats.leftUpperArm, new Vector3(1, 0, 0)), new Vector3(0.02, -0.45, 0).normalize(), 0.08);  // elbow just 0.02 right of the shoulder, 0.45 below
  assert.ok(angle(out.quats.leftUpperLeg) > 0.2, "thigh swings forward when the knee comes toward the camera");
});

test("legs out of view stay at rest and do not count as live", () => {
  const pose = tPose();
  for (const i of [25, 26, 27, 28, 29, 30, 31, 32]) pose.world[i].visibility = 0.1;
  const out = new BodySolver(rest, { mirror: false }).solve({ pose });
  assert.equal(out.live.legs, false);
  assert.ok(angle(out.quats.leftUpperLeg) === 0 && angle(out.quats.rightFoot) === 0);
  assert.ok(out.live.pose, "the upper body still tracks");
});

test("hidden torso or wrist: nothing is invented", () => {
  const pose = tPose(); pose.world[15].visibility = 0.1;
  const out = new BodySolver(rest, { mirror: false }).solve({ pose });
  assert.ok(angle(out.quats.leftLowerArm) === 0);
  pose.world[11].visibility = 0.1;
  assert.equal(new BodySolver(rest, { mirror: false }).solve({ pose }).live.pose, false);
  assert.equal(new BodySolver(rest, { mirror: false }).solve({ pose: null }).live.pose, false);
});

// a left hand pointing toward the image right, palm to the camera side: fingers straight or curled
function hand({ curl = 0 } = {}) {
  const lm = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  lm[0] = { x: 0, y: 0, z: 0 };
  const base = { 5: -0.026, 9: -0.008, 13: 0.010, 17: 0.027 }; // MP z: toward camera is negative
  for (const [start, z] of Object.entries(base)) {
    const s = Number(start);
    let x = 0.062, y = 0, dirx = 1, diry = 0, ang = 0;
    lm[s] = { x, y, z };
    for (let i = 1; i <= 3; i++) {
      ang += curl; dirx = Math.cos(ang); diry = Math.sin(ang);
      x += 0.03 * dirx; y += 0.03 * diry; lm[s + i] = { x, y, z };
    }
  }
  [[1, 0.02, 0, -0.026], [2, 0.032, 0, -0.046], [3, 0.044, 0, -0.064], [4, 0.054, 0, -0.082]].forEach(([i, x, y, z]) => { lm[i] = { x, y, z }; });
  return lm;
}

test("an open hand leaves the fingers at rest; a curled one bends every finger the same way", () => {
  const pose = tPose();
  const solver = new BodySolver(rest, { mirror: false });
  const open = solver.solve({ pose, hands: { left: hand() } });
  assert.ok(open.live.leftHand && !open.live.rightHand);
  assert.ok(angle(open.quats.leftHand) < 0.1, `hand ${angle(open.quats.leftHand)}`);
  for (const b of ["leftIndexProximal", "leftMiddleIntermediate", "leftLittleDistal"]) assert.ok(angle(open.quats[b]) < 0.1, b);
  const fist = solver.solve({ pose, hands: { left: hand({ curl: 0.6 }) } });
  const bends = ["leftIndexProximal", "leftMiddleProximal", "leftRingProximal", "leftLittleProximal"].map((b) => angle(fist.quats[b]));
  assert.ok(bends.every((a) => a > 0.3 && a < 0.9), bends.join(" "));
  // all fingers bend about the same axis
  const axes = ["leftIndexProximal", "leftRingProximal"].map((b) => new Vector3(fist.quats[b].x, fist.quats[b].y, fist.quats[b].z).normalize());
  assert.ok(axes[0].dot(axes[1]) > 0.9);
});

test("hand data without a visible arm is ignored", () => {
  const pose = tPose(); pose.world[15].visibility = 0.1;
  const out = new BodySolver(rest, { mirror: false }).solve({ pose, hands: { left: hand() } });
  assert.equal(out.live.leftHand, false);
});

function faceMesh({ lz = 0, rz = 0 } = {}) {
  const lm = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  lm[263] = { x: 0.60, y: 0.40, z: lz }; lm[33] = { x: 0.40, y: 0.40, z: rz };   // subject's left eye is image right
  lm[10] = { x: 0.50, y: 0.30, z: 0 }; lm[152] = { x: 0.50, y: 0.70, z: 0 };
  return lm;
}

test("head: facing the camera is neutral, turning moves it about the vertical axis", () => {
  const solver = new BodySolver(rest, { mirror: false });
  const straight = solver.solve({ pose: tPose(), face: { landmarks: faceMesh(), blend: {}, aspect: 4 / 3 } });
  assert.ok(straight.live.face && angle(straight.quats.head) < 0.05 && angle(straight.quats.neck) < 0.05);
  const turned = solver.solve({ pose: tPose(), face: { landmarks: faceMesh({ lz: -0.08, rz: 0.08 }), blend: {}, aspect: 4 / 3 } });
  const q = new Quaternion().copy(turned.quats.neck).multiply(turned.quats.head);
  const axis = new Vector3(q.x, q.y, q.z).normalize();
  assert.ok(Math.abs(axis.y) > 0.9 && angle(q) > 0.3, `${axis.toArray()} ${angle(q)}`);
  assert.ok(angle(turned.quats.neck) < angle(q), "the neck takes only part of the turn");
});

test("blendshapes: blink, mouth shapes, smile, gaze and mirroring", () => {
  const e = faceToExpressions({ eyeBlinkLeft: 1, eyeBlinkRight: 1, jawOpen: 0 }, false);
  assert.ok(e.blink > 0.99 && e.blinkLeft === 0 && e.blinkRight === 0);
  const wink = faceToExpressions({ eyeBlinkLeft: 1, eyeBlinkRight: 0 }, false);
  assert.ok(wink.blinkLeft > 0.99 && wink.blinkRight === 0 && wink.blink === 0);
  assert.ok(faceToExpressions({ eyeBlinkLeft: 1, eyeBlinkRight: 0 }, true).blinkRight > 0.99, "mirror swaps eyes");
  const open = faceToExpressions({ jawOpen: 0.8 });
  assert.ok(open.aa > 0.8 && open.oh < 0.3);
  assert.ok(faceToExpressions({ mouthPucker: 1 }).ou > 0.7);
  assert.ok(faceToExpressions({ mouthSmileLeft: 0.8, mouthSmileRight: 0.8 }).happy > 0.8);
  const all = faceToExpressions({ jawOpen: 1, mouthFunnel: 1, mouthPucker: 1, mouthStretchLeft: 1, mouthStretchRight: 1 });
  assert.ok(all.aa + all.ih + all.ou + all.ee + all.oh <= 1.0001);
  assert.deepEqual(Object.keys(e).sort(), [...EXPRESSIONS].sort());
  const g = gaze({ eyeLookOutLeft: 1, eyeLookInRight: 1, eyeLookUpLeft: 0.5 }, false);
  assert.ok(g.left[1] > 0.4 && g.left[0] < 0, "left eye looks out (+X) and up");
  assert.ok(g.right[1] > 0, "right eye looks in, toward +X as well");
});

test("one-euro: steady input stays steady, a fast move is followed, quaternion sign flips do not swing", () => {
  const f = new OneEuro(1.0, 0.05);
  let last = 0;
  for (let i = 0; i < 60; i++) last = f.filter(1 + (i % 2 ? 0.01 : -0.01), i / 30);
  assert.ok(Math.abs(last - 1) < 0.02);
  const g = new OneEuro(1.0, 0.5);
  let v = 0; for (let i = 0; i < 15; i++) v = g.filter(i * 0.2, i / 30);
  assert.ok(v > 2.0, `follows a ramp: ${v}`);
  const qf = new QuatFilter(1, 0.05);
  const a = qf.filter([0, 0, 0, 1], 0), b = qf.filter([0, 0, 0, -1], 1 / 30); // the same rotation, opposite sign
  assert.ok(b[3] > 0.99 && Math.hypot(...b) > 0.999 && a[3] > 0.99);
});
