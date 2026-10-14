// The desk view: only the upper body is followed, lost arms are held longer and rest on the desk.
import test from "node:test";
import assert from "node:assert/strict";
import { Quaternion } from "three";
import { BodySolver } from "../src/retarget.js";
import { BONES } from "../src/skeleton.js";
import { idleQuats } from "../src/idle.js";
import { BodyFilter } from "../src/body.js";
import { hand, rest, tPose } from "./helpers.mjs";

const quatOf = (a) => new Quaternion(a[0], a[1], a[2], a[3]);
const dist = (a, b) => 2 * Math.acos(Math.min(1, Math.abs(quatOf(a).dot(quatOf(b)))));
const LEGS = ["leftUpperLeg", "rightUpperLeg", "leftLowerLeg", "rightLowerLeg", "leftFoot", "rightFoot"];
const desk = (input) => new BodySolver(rest, { mirror: false, upperBody: true }).solve(input);
const full = (input) => new BodySolver(rest, { mirror: false }).solve(input);
const q4 = (q) => [q.x, q.y, q.z, q.w];

test("desk: well-visible hips and legs are still not read", () => {
  const pose = tPose();                                   // every landmark visible: a standing T-pose
  const normal = full({ pose });
  assert.ok(normal.solved.has("hips") && normal.live.legs, "control: the normal solver does use them");
  const out = desk({ pose });
  assert.ok(out.live.pose && out.live.legs === false);
  for (const b of ["hips", ...LEGS]) assert.ok(!out.solved.has(b), `${b} must not be solved at a desk`);
  for (const b of ["spine", "chest", "leftUpperArm", "leftLowerArm", "rightUpperArm", "rightLowerArm"]) assert.ok(out.solved.has(b), b);
});

test("desk: a wrong hip line behind the desk cannot tilt the torso", () => {
  const clean = desk({ pose: tPose() });
  const hipsWrong = tPose({ 23: { x: 0.10, y: 0.25, z: 0.3 }, 24: { x: -0.10, y: -0.1, z: -0.2 } }); // visible, but nonsense
  const tilted = desk({ pose: hipsWrong });
  assert.ok(dist(q4(tilted.quats.chest), q4(clean.quats.chest)) < 1e-6 && dist(q4(tilted.quats.spine), q4(clean.quats.spine)) < 1e-6);
  const normal = full({ pose: hipsWrong }), normalClean = full({ pose: tPose() });
  assert.ok(dist(q4(normal.quats.chest), q4(normalClean.quats.chest)) > 0.05, "control: without the desk setting the bad hips do tilt it");
});

test("desk: arms and hands still follow", () => {
  const out = desk({ pose: tPose({ 15: { x: 0.4, y: -0.9 } }), hands: { left: hand({ curl: 0.5 }) } });
  assert.ok(out.live.leftHand && out.solved.has("leftIndexProximal"));
});

test("desk: the filter never lets legs through, even when the mode says on", () => {
  const f = new BodyFilter({ desk: true, legs: "on" });
  const s = full({ pose: tPose() });           // solved legs, as if a normal solver had made them
  let out;
  for (let i = 0; i < 30; i++) out = f.update(s, i * 33);
  assert.equal(f.cfg.legs, "off");
  f.legsMode = "on";
  assert.equal(f.cfg.legs, "off", "the control room's legs setting cannot turn them back on");
  for (const b of LEGS) assert.ok(dist(out.quats[b], [0, 0, 0, 1]) < 1e-6, `${b} stays at rest`);
  assert.equal((out.flags >> 2) & 1, 0, "the legs flag is not raised");
});

test("desk: a lost arm is held for 1.5 s, then eases to the seated pose, not the standing one", () => {
  const f = new BodyFilter({ desk: true });
  const seen = desk({ pose: tPose({ 13: { x: 0.25, y: -0.2 }, 15: { x: 0.30, y: -0.55 } }) });
  let live;
  for (let i = 0; i < 20; i++) live = f.update(seen, i * 33);
  const lost = desk({ pose: null });
  const t0 = 20 * 33;
  const held = f.update(lost, t0 + 1200);
  assert.ok(dist(held.quats.leftLowerArm, live.quats.leftLowerArm) < 1e-6, "still where it was 1.2 s after it left the picture");
  const gone = f.update(lost, t0 + 1500 + 900 + 50);
  const seated = idleQuats(true), standing = idleQuats(false);
  assert.ok(dist(gone.quats.leftLowerArm, q4(seated.leftLowerArm)) < 1e-6, "fully at the desk rest pose");
  assert.ok(dist(gone.quats.leftLowerArm, q4(standing.leftLowerArm)) > 0.5, "and that is not the arms-down pose");
  const normal = new BodyFilter();
  for (let i = 0; i < 20; i++) normal.update(seen, i * 33);
  const nHeld = normal.update(lost, t0 + 1200);
  assert.ok(dist(nHeld.quats.leftLowerArm, live.quats.leftLowerArm) > 0.01 || dist(nHeld.quats.leftLowerArm, q4(standing.leftLowerArm)) < 1e-6,
    "control: the normal filter has already let go by then");
});

test("desk: the head and the face are not slowed down", () => {
  const f = new BodyFilter({ desk: true });
  assert.equal(f.bones.head.hold, undefined);
  assert.equal(f.bones.chest.hold, undefined);
  assert.equal(f.bones.leftIndexProximal.hold, 1500);
  assert.equal(f.bones.rightUpperArm.hold, 1500);
});

test("the desk rest pose is a valid quaternion for every bone and differs only on the arms", () => {
  const d = idleQuats(true), n = idleQuats(false);
  for (const b of BONES) assert.ok(Math.abs(d[b].length() - 1) < 1e-9, b);
  const changed = BONES.filter((b) => dist(q4(d[b]), q4(n[b])) > 1e-9);
  assert.deepEqual(changed.sort(), ["leftLowerArm", "leftUpperArm", "rightLowerArm", "rightUpperArm"]);
});
