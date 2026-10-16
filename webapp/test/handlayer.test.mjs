// The shapes drawn around the live hands (src/facemesh/handlayer.js): circles from hand points, then triangles for the compositor.
import test from "node:test";
import assert from "node:assert/strict";
import { MAX_CIRCLES, handFans, handShapes } from "../src/facemesh/handlayer.js";

const ASPECT = 4 / 3;
const FACE_W = 0.3;

/** A flat hand: the wrist at (cx, cy), the fingers fanned upward, in normalised coordinates. */
function hand(cx = 0.5, cy = 0.6) {
  const pts = Array.from({ length: 21 }, () => ({ x: cx, y: cy }));
  const finger = (start, dx) => { for (let k = 0; k < 4; k++) pts[start + k] = { x: cx + dx, y: cy - 0.06 - 0.03 * (k + 1) }; };
  finger(1, -0.06); finger(5, -0.03); finger(9, 0); finger(13, 0.03); finger(17, 0.06);
  return pts;
}

test("a hand becomes a palm circle, a wrist circle, and circles along every finger", () => {
  const c = handShapes([hand()], ASPECT, FACE_W);
  assert.equal(c.length, 1 + 1 + 5 * (4 + 3), "palm, wrist, and for each finger four joints with the gaps filled");
  for (const s of c) assert.ok(Number.isFinite(s.x) && Number.isFinite(s.y) && s.r > 0);
});

test("two hands give two sets, a bigger face or a bigger reach gives bigger circles", () => {
  assert.equal(handShapes([hand(0.3), hand(0.7)], ASPECT, FACE_W).length, 2 * 37);
  const small = handShapes([hand()], ASPECT, 0.2)[0].r, big = handShapes([hand()], ASPECT, 0.4)[0].r;
  assert.ok(Math.abs(big / small - 2) < 1e-9);
  const wide = handShapes([hand()], ASPECT, FACE_W, 1.5)[0].r, normal = handShapes([hand()], ASPECT, FACE_W, 1)[0].r;
  assert.ok(Math.abs(wide / normal - 1.5) < 1e-9);
  assert.ok(handShapes([hand()], ASPECT, FACE_W, 100)[0].r <= normal * 3 + 1e-9, "the reach is capped");
});

test("bad input gives no shapes, and a broken point is skipped instead of poisoning the rest", () => {
  assert.deepEqual(handShapes(null, ASPECT, FACE_W), []);
  assert.deepEqual(handShapes([hand()], 0, FACE_W), []);
  assert.deepEqual(handShapes([hand()], ASPECT, 0), []);
  assert.deepEqual(handShapes([hand()], ASPECT, FACE_W, -1), []);
  assert.deepEqual(handShapes([hand().slice(0, 5)], ASPECT, FACE_W), []);
  const bad = hand(); bad[8] = { x: NaN, y: 0.3 };
  const c = handShapes([bad], ASPECT, FACE_W);
  assert.ok(c.length > 20 && c.every((s) => Number.isFinite(s.x) && Number.isFinite(s.y)));
});

test("the number of circles is capped", () => {
  const many = Array.from({ length: 10 }, () => hand());
  assert.equal(handShapes(many, ASPECT, FACE_W).length, MAX_CIRCLES);
});

test("fans: a solid disc and a fading ring per circle, in 0..1 screen coordinates, with valid triangles", () => {
  const circles = [{ x: 0.6 * ASPECT, y: 0.5, r: 0.1 }];
  const f = handFans(circles, ASPECT);
  assert.equal(f.count, 29);
  assert.equal(f.positions.length, 58);
  assert.equal(f.alphas[0], 1, "the centre is solid");
  assert.ok(Math.abs(f.positions[0] - 0.6) < 1e-6 && Math.abs(f.positions[1] - 0.5) < 1e-6);
  assert.ok(f.alphas.slice(15).every((a) => a === 0), "the outer ring fades to nothing");
  assert.ok(f.alphas.slice(1, 15).every((a) => a === 1), "the inner ring is solid");
  for (const i of f.indices) assert.ok(i < f.count);
  assert.equal(f.indices.length % 3, 0);
  assert.equal(f.indices.length, 14 * 9);
  for (const v of f.positions) assert.ok(v >= 0 && v <= 1);
});

test("fans: the rim of a circle is where the radius says, shrunk back to screen units", () => {
  const f = handFans([{ x: 0.5 * ASPECT, y: 0.5, r: 0.1 }], ASPECT);
  const ox = f.positions[2 * 15] * ASPECT - 0.5 * ASPECT, oy = f.positions[2 * 15 + 1] - 0.5;   // the first vertex of the outer ring
  assert.ok(Math.abs(Math.hypot(ox, oy) - 0.1) < 1e-6);
});

test("fans: nothing to draw gives null, and too many circles for 16-bit indices give null instead of a wrong picture", () => {
  assert.equal(handFans([], ASPECT), null);
  assert.equal(handFans(null, ASPECT), null);
  assert.equal(handFans([{ x: 0, y: 0, r: 1 }], 0), null);
  assert.equal(handFans(Array.from({ length: 3000 }, () => ({ x: 0.1, y: 0.1, r: 0.05 })), ASPECT), null);
});
