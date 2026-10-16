// Spills, stains, drips and crumbs (src/facemesh/stains.js) on a synthetic puppet mesh.
import test from "node:test";
import assert from "node:assert/strict";
import { KINDS, MAX_STAINS, StainSet, bindToPuppet, stainFans } from "../src/facemesh/stains.js";
import { FAN_VERTS } from "../src/facemesh/handlayer.js";

/** A small flat mesh: a 3 x 3 grid of points over [0, 1] x [0, 1], two triangles per cell. */
function mesh() {
  const rest = [], tris = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) rest.push(c * 0.5, r * 0.5);
  const id = (r, c) => r * 3 + c;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) tris.push(id(r, c), id(r, c + 1), id(r + 1, c), id(r, c + 1), id(r + 1, c + 1), id(r + 1, c));
  return { rest: Float32Array.from(rest), triangles: Uint16Array.from(tris) };
}

test("a spot inside the mesh is bound to its triangle with weights that add to one and give the spot back", () => {
  const m = mesh();
  const b = bindToPuppet(m, 0.3, 0.7);
  assert.ok(b && Math.abs(b.w[0] + b.w[1] + b.w[2] - 1) < 1e-9 && b.w.every((v) => v >= -1e-9));
  const x = b.w[0] * m.rest[2 * b.tri[0]] + b.w[1] * m.rest[2 * b.tri[1]] + b.w[2] * m.rest[2 * b.tri[2]];
  const y = b.w[0] * m.rest[2 * b.tri[0] + 1] + b.w[1] * m.rest[2 * b.tri[1] + 1] + b.w[2] * m.rest[2 * b.tri[2] + 1];
  assert.ok(Math.abs(x - 0.3) < 1e-9 && Math.abs(y - 0.7) < 1e-9);
});

test("a spot outside the mesh is bound to the nearest corner, and bad input gives null", () => {
  const m = mesh();
  const b = bindToPuppet(m, 3, 3);
  assert.deepEqual(b.tri, [8, 8, 8]);
  assert.equal(bindToPuppet(null, 0, 0), null);
  assert.equal(bindToPuppet(m, NaN, 0), null);
  assert.equal(bindToPuppet({ rest: m.rest }, 0, 0), null);
});

test("a spill grows to its size, drips downward, and sticks to the shirt as the shirt moves", () => {
  const m = mesh(), set = new StainSet();
  assert.equal(set.spill("juice", bindToPuppet(m, 0.5, 0.5), { drips: 2, seed: 0.3 }), true);
  const pos = Float32Array.from(m.rest);
  set.step(0.05, pos, 1);
  const early = set.circles(1)[0].r;
  for (let i = 0; i < 40; i++) set.step(0.05, pos, 1);
  const late = set.circles(1);
  assert.ok(late[0].r > early * 2 && Math.abs(late[0].r - 0.22) < 0.02, "it grew to about a quarter of the shoulder width");
  assert.ok(late.length > 2, "and it has drips");
  const dripBottoms = late.slice(1).map((c) => c.y);
  assert.ok(Math.max(...dripBottoms) > late[0].y + 0.1, "the drips run down");
  const moved = pos.map((v, i) => v + (i % 2 === 0 ? 0.3 : -0.1));             // the shirt moves right and up
  set.step(0.05, moved, 1);
  const after = set.circles(1)[0];
  assert.ok(Math.abs(after.x - (late[0].x + 0.3)) < 1e-6 && Math.abs(after.y - (late[0].y - 0.1)) < 1e-6, "the stain went with the shirt");
});

test("water dries on its own, other spills stay", () => {
  const m = mesh(), set = new StainSet(), pos = Float32Array.from(m.rest);
  set.spill("water", bindToPuppet(m, 0.5, 0.5), { drips: 0 });
  set.spill("coffee", bindToPuppet(m, 0.2, 0.2), { drips: 0 });
  for (let i = 0; i < 600; i++) set.step(0.1, pos, 1);                          // a minute
  assert.equal(set.items.filter((s) => s.kind === "water").length, 0);
  assert.equal(set.items.filter((s) => s.kind === "coffee").length, 1);
});

test("a hand wiping over a stain rubs it out, and a hand far away does not", () => {
  const m = mesh(), set = new StainSet(), pos = Float32Array.from(m.rest);
  set.spill("sauce", bindToPuppet(m, 0.5, 0.5), { drips: 0 });
  for (let i = 0; i < 30; i++) set.step(0.05, pos, 1);
  for (let i = 0; i < 30; i++) set.step(0.05, pos, 1, [{ x: 0.95, y: 0.95, r: 0.05 }]);
  assert.equal(set.count, 1, "a far hand changed nothing");
  for (let i = 0; i < 40; i++) set.step(0.05, pos, 1, [{ x: 0.5, y: 0.5, r: 0.1 }]);
  assert.equal(set.count, 0, "wiped clean");
});

test("crumbs are not stuck to the shirt: they fall and fade away", () => {
  const set = new StainSet();
  set.crumb("crumbs", 0.5, 0.2);
  const y0 = set.circles(1)[0].y;
  for (let i = 0; i < 10; i++) set.step(0.05, null, 1);
  assert.ok(set.circles(1)[0].y > y0, "it fell");
  for (let i = 0; i < 60; i++) set.step(0.05, null, 1);
  assert.equal(set.count, 0, "and it faded");
});

test("the number of stains is capped (the oldest goes), and unknown kinds or bad input are refused", () => {
  const m = mesh(), set = new StainSet();
  for (let i = 0; i < MAX_STAINS + 10; i++) set.spill("coffee", bindToPuppet(m, 0.5, 0.5), { drips: 0 });
  assert.equal(set.count, MAX_STAINS);
  assert.equal(set.spill("lava", bindToPuppet(m, 0.5, 0.5)), false);
  assert.equal(set.spill("coffee", null), false);
  assert.equal(set.crumb("crumbs", NaN, 0), false);
  set.clear();
  assert.equal(set.count, 0);
  set.step(0, null, 1); set.step(0.1, null, 0);
  assert.deepEqual(set.circles(0), []);
});

test("stain fans carry one colour per vertex and the stain's own opacity", () => {
  const circles = [{ x: 0.4, y: 0.5, r: 0.1, a: 0.5, rgb: KINDS.juice.rgb }, { x: 0.8, y: 0.5, r: 0.05, a: 1, rgb: KINDS.coffee.rgb }];
  const f = stainFans(circles, 1);
  assert.equal(f.count, 2 * FAN_VERTS);
  assert.equal(f.colors.length, f.count * 3);
  assert.equal(f.alphas[0], 0.5, "the centre of the first circle has its opacity");
  assert.equal(f.alphas[FAN_VERTS], 1);
  assert.deepEqual(Array.from(f.colors.slice(0, 3)), KINDS.juice.rgb.map((v) => Math.fround(v)));
  assert.deepEqual(Array.from(f.colors.slice(3 * FAN_VERTS, 3 * FAN_VERTS + 3)), KINDS.coffee.rgb.map((v) => Math.fround(v)));
  assert.equal(stainFans([], 1), null);
  assert.equal(stainFans(null, 1), null);
});
