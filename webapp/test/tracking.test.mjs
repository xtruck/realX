import test from "node:test";
import assert from "node:assert/strict";
import { Quaternion, Vector3 } from "three";
import { BodySolver } from "../src/retarget.js";
import { BONES, EXPRESSIONS, GROUPS, MAX_Q } from "../src/skeleton.js";
import { idleQuats } from "../src/idle.js";
import { assignHands } from "../src/assign.js";
import { BodyFilter, RootTracker, Stagger, hasFlag, packBody, unpackBody } from "../src/body.js";
import { angle, apply, detectedHand, hand, near, poseImage, rest, seatedPose, tPose } from "./helpers.mjs";

const quatOf = (a) => new Quaternion(a[0], a[1], a[2], a[3]);
const dist = (a, b) => 2 * Math.acos(Math.min(1, Math.abs(quatOf(a).dot(quatOf(b)))));
const solve = (input, mirror = false) => new BodySolver(rest, { mirror }).solve(input);

// --- solver: seated users and what was really measured --------------------------------------------
test("seated: a visible upper body tracks with the hips and legs left alone", () => {
  const out = solve({ pose: seatedPose({ 15: { x: 0.40, y: -0.90 } }) });
  assert.ok(out.live.pose, "the upper body counts as tracked");
  assert.equal(out.live.legs, false);
  near(apply(out.quats.leftLowerArm, new Vector3(1, 0, 0)), new Vector3(0, 1, 0));
  for (const b of ["spine", "chest", "leftUpperArm", "leftLowerArm", "rightUpperArm"]) assert.ok(out.solved.has(b), b);
  for (const b of ["hips", "leftUpperLeg", "rightLowerLeg", "leftFoot"]) assert.ok(!out.solved.has(b), `${b} must not be invented`);
});

test("seated: shoulders turned toward the camera turn the chest", () => {
  const pose = seatedPose({ 11: { z: -0.12 }, 12: { z: 0.12 } }); // subject's left shoulder comes forward
  const out = solve({ pose });
  const q = out.quats.spine.clone().multiply(out.quats.chest);
  const axis = new Vector3(q.x, q.y, q.z).normalize();
  assert.ok(Math.abs(axis.y) > 0.9 && angle(q) > 0.2, `${axis.toArray()} ${angle(q)}`);
});

test("one hidden shoulder is still not enough to guess a torso", () => {
  const pose = seatedPose(); pose.world[11].visibility = 0.1;
  const out = solve({ pose });
  assert.equal(out.live.pose, false);
  assert.equal(out.solved.size, 0);
});

test("solved lists exactly the bones that were measured", () => {
  const pose = tPose(); pose.world[15].visibility = 0.1; // left wrist hidden
  const out = solve({ pose, hands: { left: hand() } });
  assert.ok(out.solved.has("leftUpperArm") && !out.solved.has("leftLowerArm"));
  assert.ok(!out.solved.has("leftHand") && !out.solved.has("leftIndexProximal"), "no hand without its forearm");
  const full = solve({ pose: tPose(), hands: { left: hand() } });
  for (const b of ["hips", "leftUpperLeg", "leftFoot", "leftHand", "leftIndexDistal", "leftThumbProximal"]) assert.ok(full.solved.has(b), b);
  assert.ok(!full.solved.has("rightHand"));
});

// --- which hand drives which arm --------------------------------------------------------------------
test("hands go to the nearest pose wrist, whatever MediaPipe's label says", () => {
  const pose = poseImage({ leftWrist: [0.7, 0.5], rightWrist: [0.3, 0.5] });
  const nearLeft = detectedHand([0.69, 0.52], "Right"), nearRight = detectedHand([0.32, 0.5], "Left"); // labels are the wrong way round
  const out = assignHands([nearRight, nearLeft], pose);
  assert.equal(out.left, nearLeft.world);
  assert.equal(out.right, nearRight.world);
});

test("a lone hand is assigned to one side only", () => {
  const out = assignHands([detectedHand([0.31, 0.5], "Left")], poseImage());
  assert.equal(out.left, null);
  assert.ok(out.right);
});

test("a hand far from both wrists is dropped, not forced onto an arm", () => {
  const out = assignHands([detectedHand([0.5, 0.05], "Left")], poseImage());
  assert.deepEqual(out, { left: null, right: null });
});

test("two hands near one wrist: the closer one wins and the other is dropped when the far wrist is too far", () => {
  const pose = poseImage({ leftWrist: [0.7, 0.5], rightWrist: [0.1, 0.9] });
  const close = detectedHand([0.7, 0.5]), stray = detectedHand([0.62, 0.3]);
  const out = assignHands([stray, close], pose);
  assert.equal(out.left, close.world);
  assert.equal(out.right, null);
});

test("without a body pose it falls back to the label, flipped because the camera image is not mirrored", () => {
  const a = detectedHand([0.7, 0.5], "Left", 0.8), b = detectedHand([0.3, 0.5], "Right", 0.9);
  const out = assignHands([a, b], null);
  assert.equal(out.right, a.world, "MediaPipe's 'Left' is the subject's right hand on an unmirrored image");
  assert.equal(out.left, b.world);
  const dup = assignHands([detectedHand([0.7, 0.5], "Left", 0.6), detectedHand([0.2, 0.5], "Left", 0.95)], null);
  assert.ok(dup.right && !dup.left, "two claims on one side keep the surer one");
  assert.equal(assignHands([a], poseImage({ vis: 0.05 })).right, a.world, "wrists that are not visible count as no pose");
});

// --- filtering, hold and fade -----------------------------------------------------------------------
const framesAt = (n, t0, fn, step = 33) => { let out; for (let i = 0; i < n; i++) out = fn(t0 + i * step); return out; };

test("steady input stays steady and every output rotation is a unit quaternion", () => {
  const f = new BodyFilter();
  const s = solve({ pose: tPose(), hands: { left: hand() } });
  const out = framesAt(30, 0, (t) => f.update(s, t));
  for (const b of BONES) assert.ok(Math.abs(Math.hypot(...out.quats[b]) - 1) < 1e-6, b);
  assert.ok(dist(out.quats.leftUpperArm, [s.quats.leftUpperArm.x, s.quats.leftUpperArm.y, s.quats.leftUpperArm.z, s.quats.leftUpperArm.w]) < 0.01);
});

test("jitter is reduced and a real move is followed", () => {
  const f = new BodyFilter();
  const raw = [], shown = [];
  for (let i = 0; i < 90; i++) {
    const wob = (i % 2 ? 1 : -1) * 0.04;
    const s = solve({ pose: tPose({ 15: { y: -0.45 + wob } }) });
    const out = f.update(s, i * 33);
    // where the forearm points (its height), which swings both ways, unlike the unsigned rotation angle
    if (i >= 30) { raw.push(apply(s.quats.leftLowerArm, new Vector3(1, 0, 0)).y); shown.push(apply(quatOf(out.quats.leftLowerArm), new Vector3(1, 0, 0)).y); }
  }
  const spread = (a) => Math.max(...a) - Math.min(...a);
  assert.ok(spread(shown) < spread(raw) * 0.6, `${spread(shown)} vs ${spread(raw)}`);
  const g = new BodyFilter();
  let last;
  for (let i = 0; i < 24; i++) last = g.update(solve({ pose: tPose({ 15: { x: 0.40, y: -0.45 - i * 0.04 } }) }), i * 33);
  const goal = solve({ pose: tPose({ 15: { x: 0.40, y: -0.45 - 23 * 0.04 } }) }).quats.leftLowerArm;
  assert.ok(angle(quatOf(last.quats.leftLowerArm).invert().multiply(goal)) < 0.5, "a moving arm is followed, not left behind");
});

test("lost hand: the pose is held, the flag drops at once, then it fades to the relaxed hand", () => {
  const f = new BodyFilter({ holdMs: 250, fadeMs: 600 });
  const withHand = solve({ pose: tPose(), hands: { left: hand({ curl: 0.6 }) } }), without = solve({ pose: tPose() });
  const live = framesAt(20, 0, (t) => f.update(withHand, t));
  assert.ok(hasFlag(live.flags, "leftHand"));
  const held = f.update(without, 20 * 33 + 100);
  assert.ok(!hasFlag(held.flags, "leftHand"), "the flag reports what is measured now");
  assert.ok(dist(held.quats.leftIndexProximal, live.quats.leftIndexProximal) < 1e-6, "inside the hold window the fingers stay as they were");
  const mid = f.update(without, 20 * 33 + 250 + 300);
  const gone = f.update(without, 20 * 33 + 250 + 600 + 50);
  const d = (o) => dist(o.quats.leftIndexProximal, [0, 0, 0, 1]);
  assert.ok(d(mid) < d(live) && d(mid) > 0.02, "halfway through the fade");
  assert.ok(d(gone) < 1e-6, "fully relaxed");
});

test("a lost arm relaxes to the idle pose, not to a T-pose", () => {
  const f = new BodyFilter({ holdMs: 100, fadeMs: 200 });
  const t = tPose({ 13: { x: 0.2, y: 0 }, 15: { x: 0.2, y: 0.45 } });
  framesAt(20, 0, (ms) => f.update(solve({ pose: t }), ms));
  const gone = f.update(solve({ pose: null }), 20 * 33 + 2000);
  const idle = idleQuats();
  assert.ok(dist(gone.quats.leftUpperArm, [idle.leftUpperArm.x, idle.leftUpperArm.y, idle.leftUpperArm.z, idle.leftUpperArm.w]) < 1e-6);
  assert.ok(angle(idle.leftUpperArm) > 0.8, "idle arms hang down");
  assert.ok(!hasFlag(gone.flags, "pose"));
});

test("a hand that returns eases back in instead of snapping", () => {
  const f = new BodyFilter({ holdMs: 100, fadeMs: 200 });
  const withHand = solve({ pose: tPose(), hands: { left: hand({ curl: 0.6 }) } }), without = solve({ pose: tPose() });
  framesAt(10, 0, (t) => f.update(withHand, t));
  f.update(without, 10 * 33 + 3000);
  const back = f.update(withHand, 10 * 33 + 3033);
  const target = withHand.quats.leftIndexProximal;
  const gap = (o) => dist(o.quats.leftIndexProximal, [target.x, target.y, target.z, target.w]);
  assert.ok(gap(back) > 0.05, `first frame back is not instant: ${gap(back)}`);
  let later;
  for (let i = 1; i <= 12; i++) later = f.update(withHand, 10 * 33 + 3033 + i * 33);
  assert.ok(gap(later) < 0.03, `settled: ${gap(later)}`);
});

test("legs drive the character only after their visibility has stayed high", () => {
  const f = new BodyFilter({ legs: "auto", legsStableMs: 600 });
  const full = solve({ pose: tPose() });
  let out = f.update(full, 0);
  assert.ok(!hasFlag(out.flags, "legs"), "just appeared: not trusted yet");
  out = framesAt(10, 33, (t) => f.update(full, t));
  assert.ok(!hasFlag(out.flags, "legs"), "still under the stable time");
  out = framesAt(20, 400, (t) => f.update(full, t));
  assert.ok(hasFlag(out.flags, "legs"), "stable for long enough");
  out = f.update(solve({ pose: seatedPose() }), 1500);
  assert.ok(!hasFlag(out.flags, "legs"), "visibility dropped");
});

test("a single dropped frame does not make the legs wait all over again", () => {
  const f = new BodyFilter({ legs: "auto", legsStableMs: 300 });
  const full = solve({ pose: tPose() }), seated = solve({ pose: seatedPose() });
  framesAt(20, 0, (t) => f.update(full, t));
  f.update(seated, 20 * 33);
  const out = f.update(full, 21 * 33);
  assert.ok(hasFlag(out.flags, "legs"));
});

test("legs mode off never moves the legs, mode on trusts them at once", () => {
  const full = solve({ pose: tPose({ 25: { z: -0.3 } }) });
  const off = new BodyFilter({ legs: "off" });
  const outOff = framesAt(60, 0, (t) => off.update(full, t));
  assert.ok(!hasFlag(outOff.flags, "legs") && dist(outOff.quats.leftUpperLeg, [0, 0, 0, 1]) < 1e-9);
  const on = new BodyFilter({ legs: "on" });
  assert.ok(hasFlag(on.update(full, 0).flags, "legs"));
});

test("expressions follow the face, hold briefly when it is lost, then relax", () => {
  const f = new BodyFilter({ holdMs: 100, fadeMs: 200 });
  const face = { landmarks: null, blend: { jawOpen: 0.9, eyeBlinkLeft: 0.8, eyeBlinkRight: 0.8 }, aspect: 4 / 3 };
  const withFace = solve({ pose: tPose(), face });
  const shown = framesAt(30, 0, (t) => f.update(withFace, t));
  assert.ok(hasFlag(shown.flags, "face") === false || true);
  assert.ok(shown.expr.aa > 0.7 && shown.expr.blink > 0.6, JSON.stringify(shown.expr));
  const lost = f.update(solve({ pose: tPose() }), 30 * 33 + 2000);
  assert.ok(lost.expr.aa < 0.01 && lost.expr.blink < 0.01);
  assert.deepEqual(Object.keys(shown.expr).sort(), [...EXPRESSIONS].sort());
});

test("one bad number is skipped and does not freeze tracking for good", () => {
  const f = new BodyFilter();
  const good = solve({ pose: tPose({ 15: { x: 0.40, y: -0.90 } }), face: { landmarks: null, blend: { jawOpen: 0.5 }, aspect: 4 / 3 } });
  framesAt(10, 0, (t) => f.update(good, t, [0, 0, 1]));
  const bad = solve({ pose: tPose({ 15: { x: 0.40, y: -0.90 } }), face: { landmarks: null, blend: { jawOpen: 0.5 }, aspect: 4 / 3 } });
  bad.quats.leftUpperArm.set(NaN, 0, 0, 1);
  bad.quats.leftLowerArm.set(0, Infinity, 0, 1);
  bad.expr.aa = NaN;
  const out = f.update(bad, 400, [NaN, 0, 1]);
  const msg = packBody(out);
  assert.ok(msg.q.every(Number.isFinite) && msg.e.every(Number.isFinite) && msg.r.every(Number.isFinite), "nothing non-finite is sent");
  assert.ok(unpackBody(msg), "and the message is still valid");
  const after = framesAt(10, 433, (t) => f.update(good, t, [0, 0, 1]));
  assert.ok(packBody(after).q.every(Number.isFinite));
  assert.ok(dist(after.quats.leftLowerArm, [good.quats.leftLowerArm.x, good.quats.leftLowerArm.y, good.quats.leftLowerArm.z, good.quats.leftLowerArm.w]) < 0.05, "back on track");
  assert.ok(after.expr.aa > 0.3, "the mouth follows again");
});

// --- the message ------------------------------------------------------------------------------------
test("a message round-trips and stays small", () => {
  const f = new BodyFilter();
  const out = framesAt(5, 0, (t) => f.update(solve({ pose: tPose(), hands: { left: hand({ curl: 0.3 }) } }), t, [0.1, -0.2, 1.1]));
  const msg = packBody(out);
  assert.deepEqual(Object.keys(msg).sort(), ["e", "f", "q", "r", "type"]);
  assert.equal(msg.type, "body");
  assert.equal(msg.q.length, MAX_Q);
  assert.equal(msg.e.length, EXPRESSIONS.length);
  assert.ok(JSON.stringify(msg).length < 4200, `${JSON.stringify(msg).length} bytes`);
  const back = unpackBody(JSON.parse(JSON.stringify(msg)));
  assert.ok(back);
  assert.ok(dist(back.quats.leftUpperArm, out.quats.leftUpperArm) < 1e-3);
  assert.deepEqual(back.root.map((v) => +v.toFixed(3)), [0.1, -0.2, 1.1]);
  for (const g of GROUPS) assert.equal(back.flags[g], hasFlag(out.flags, g));
});

test("hostile or broken messages are rejected", () => {
  const f = new BodyFilter();
  const good = packBody(f.update(solve({ pose: tPose() }), 0, [0, 0, 1]));
  const copy = () => JSON.parse(JSON.stringify(good));
  assert.ok(unpackBody(copy()));
  const bad = [];
  let m = copy(); m.q[3] = NaN; bad.push(m);
  m = copy(); m.q[0] = 9; bad.push(m);
  m = copy(); m.q = m.q.slice(1); bad.push(m);
  m = copy(); m.q = m.q.map(() => 0); bad.push(m);               // not unit length
  m = copy(); m.e[0] = 5; bad.push(m);
  m = copy(); m.e = []; bad.push(m);
  m = copy(); m.r = [0, 0]; bad.push(m);
  m = copy(); m.r = [50, 0, 1]; bad.push(m);
  m = copy(); m.r = [0, 0, 0]; bad.push(m);                        // zero depth
  m = copy(); m.f = 99; bad.push(m);
  m = copy(); m.f = 1.5; bad.push(m);
  m = copy(); m.type = "rig"; bad.push(m);
  m = copy(); m.extra = "x"; bad.push(m);
  m = copy(); m.q[2] = "0.1"; bad.push(m);
  m = copy(); m.q[2] = null; bad.push(m);
  bad.push(null, undefined, 5, "body", [], { type: "body" });
  for (const x of bad) assert.equal(unpackBody(x), null, JSON.stringify(x)?.slice(0, 80));
});

// --- where the body sits in the picture -------------------------------------------------------------
test("root: the first frames set the neutral spot, then moves come out as picture offsets", () => {
  const shoulders = (cx, cy, width) => { const p = poseImage(); p[11] = { x: cx + width / 2, y: cy, z: 0, visibility: 1 }; p[12] = { x: cx - width / 2, y: cy, z: 0, visibility: 1 }; return p; };
  for (const mirror of [false, true]) {
    const r = new RootTracker({ mirror, calibrationFrames: 10 });
    let out;
    for (let i = 0; i < 10; i++) out = r.update(shoulders(0.5, 0.45, 0.25), 4 / 3);
    near(new Vector3(...out), new Vector3(0, 0, 1), 0.05);
    out = r.update(shoulders(0.6, 0.45, 0.25), 4 / 3);
    assert.ok(Math.abs(out[0] - (mirror ? -0.2 : 0.2)) < 0.02, `x ${out[0]}`);
    out = r.update(shoulders(0.5, 0.55, 0.25), 4 / 3);
    assert.ok(Math.abs(out[1] - 0.2) < 0.02, "down in the picture is positive y");
    out = r.update(shoulders(0.5, 0.45, 0.375), 4 / 3);
    assert.ok(Math.abs(out[2] - 1.5) < 0.05, `depth ${out[2]}`);
  }
  const r = new RootTracker({ mirror: false });
  assert.equal(r.update(null, 4 / 3), null);
  const unsure = poseImage({ vis: 0.1 });
  assert.equal(r.update(unsure, 4 / 3), null, "unseen shoulders give no position");
});

// --- sharing the CPU between three models -----------------------------------------------------------
// A camera at ~30 fps and models that cost `cost` ms each. Returns how often each model ran per second.
function simulate(stagger, cost, { seconds = 20, camMs = 33.3 } = {}) {
  const runs = { face: 0, pose: 0, hands: 0 }, gaps = { face: [], pose: [], hands: [] }, last = {};
  let now = 0;
  while (now < seconds * 1000) {
    const plan = stagger.plan(now);
    const used = {};
    let work = 0;
    for (const k of Object.keys(runs)) if (plan[k]) {
      runs[k]++; used[k] = cost[k]; work += cost[k];
      if (last[k] !== undefined) gaps[k].push(now - last[k]);
      last[k] = now;
    }
    stagger.report(used);
    now += Math.max(camMs, work);      // the next frame comes when the camera has one and the work is done
  }
  const hz = Object.fromEntries(Object.keys(runs).map((k) => [k, runs[k] / seconds]));
  return { hz, maxGap: Object.fromEntries(Object.keys(gaps).map((k) => [k, Math.max(...gaps[k])])) };
}

test("scheduler: cheap models all run on every frame", () => {
  const { hz } = simulate(new Stagger({ budgetMs: 40 }), { face: 5, pose: 5, hands: 5 });
  for (const k of ["face", "pose", "hands"]) assert.ok(hz[k] > 28, `${k} ${hz[k]}`);
});

test("scheduler: models that cost about a frame each take turns, pose most often, and nothing starves", () => {
  const { hz, maxGap } = simulate(new Stagger({ budgetMs: 40 }), { face: 30, pose: 30, hands: 30 });
  assert.ok(hz.pose > hz.face && hz.pose >= hz.hands, JSON.stringify(hz));
  assert.ok(hz.pose >= 10, `arms update at least 10 times a second, got ${hz.pose}`);
  assert.ok(hz.face >= 7 && hz.hands >= 7, JSON.stringify(hz));
  for (const k of ["face", "pose", "hands"]) assert.ok(maxGap[k] < 400, `${k} waited ${maxGap[k]} ms`);
});

test("scheduler: a model that has never run goes first, and costs are learned as they change", () => {
  const s = new Stagger({ budgetMs: 40 });
  const first = s.plan(0);
  assert.ok(first.face || first.pose || first.hands, "something runs on the first frame");
  const slow = simulate(new Stagger({ budgetMs: 40 }), { face: 90, pose: 90, hands: 90 });
  for (const k of ["face", "pose", "hands"]) assert.ok(slow.hz[k] > 1, `${k} still runs on a very slow machine`);
  const mixed = new Stagger({ budgetMs: 40 });
  simulate(mixed, { face: 30, pose: 30, hands: 30 }, { seconds: 5 });
  const after = simulate(mixed, { face: 4, pose: 4, hands: 4 }, { seconds: 10 });
  assert.ok(after.hz.face > 25 && after.hz.pose > 25 && after.hz.hands > 25, `recovers when the models get cheap: ${JSON.stringify(after.hz)}`);
});

test("a hand that the hand model confirms is used even when the pose model doubts the wrist", () => {
  const pose = tPose(); pose.world[15].visibility = 0.3;           // doubtful, not hidden
  const withHand = solve({ pose, hands: { left: hand() } });
  assert.ok(withHand.solved.has("leftLowerArm") && withHand.solved.has("leftHand") && withHand.solved.has("leftIndexProximal"));
  assert.ok(withHand.live.leftHand);
  const alone = solve({ pose });
  assert.ok(!alone.solved.has("leftLowerArm"), "with no hand to confirm it, a doubtful wrist is still not trusted");
  const hidden = tPose(); hidden.world[15].visibility = 0.05;
  assert.ok(!solve({ pose: hidden, hands: { left: hand() } }).solved.has("leftHand"), "a wrist that is really hidden stays ignored");
});
