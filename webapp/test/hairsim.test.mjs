// Photo hair that swings with the head and is pushed by the hands (src/facemesh/hairsim.js), on a synthetic photo:
// a face of known size, a hair mask with a scalp part and two long curtains, and a simulated hand. No browser, no model.
import test from "node:test";
import assert from "node:assert/strict";
import { FACE_OVAL } from "../src/facemesh/head.js";
import { HairSheet, IDENTITY, apply, buildHairSheet, handColliders, similarity } from "../src/facemesh/hairsim.js";

const W = 400, H = 500, ASPECT = W / H;
const CX = 0.5, CY = 0.33, FW = 0.30, FH = 0.34;       // the face, in normalised image coordinates

function landmarks() {
  const pts = Array.from({ length: 468 }, () => ({ x: CX, y: CY }));
  pts[10] = { x: CX, y: CY - FH / 2 }; pts[152] = { x: CX, y: CY + FH / 2 };
  pts[234] = { x: CX - FW / 2, y: CY }; pts[454] = { x: CX + FW / 2, y: CY };
  FACE_OVAL.forEach((index, k) => {
    const a = (k / FACE_OVAL.length) * 2 * Math.PI;
    pts[index] = { x: CX + (FW / 2) * Math.sin(a), y: CY - (FH / 2) * Math.cos(a) };
  });
  return pts;
}

/** Hair on top of the head and two long curtains hanging from the head down to near the bottom of the photo. */
function hairMask({ curtains = true } = {}) {
  const data = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = x / W, ny = y / H;
    const cap = ((nx - CX) / (FW * 0.75)) ** 2 + ((ny - (CY - 0.06)) / (FH * 0.7)) ** 2 <= 1 && ny < CY - 0.06;
    const side = curtains && ny >= CY - 0.10 && ny < 0.95 && Math.abs(Math.abs(nx - CX) - (FW / 2 + 0.05)) < 0.05;
    if (cap || side) data[y * W + x] = 255;
  }
  return { width: W, height: H, data };
}

function sheet(options) {
  const g = buildHairSheet(hairMask(), landmarks(), ASPECT);
  assert.ok(g, "a sheet is built");
  return new HairSheet(g, options);
}
const run = (s, steps, t = IDENTITY, colliders = []) => { for (let i = 0; i < steps; i++) s.step(1 / 60, t, colliders); };
const dist = (s, i, x, y) => Math.hypot(s.pos[2 * i] - x, s.pos[2 * i + 1] - y);
const farthestFree = (s) => { let best = -1, bestY = -Infinity; for (let i = 0; i < s.count; i++) if (!s.pinned[i] && s.rest[2 * i + 1] > bestY) { bestY = s.rest[2 * i + 1]; best = i; } return best; };
const middleFree = (s) => { const free = []; for (let i = 0; i < s.count; i++) if (!s.pinned[i]) free.push(i); return free.sort((a, b) => s.rest[2 * a + 1] - s.rest[2 * b + 1])[Math.floor(free.length / 2)]; };

test("a photo with hair on the head and long curtains becomes a sheet with a pinned scalp and free hair", () => {
  const g = buildHairSheet(hairMask(), landmarks(), ASPECT);
  assert.ok(g.stats.pinned > 10 && g.stats.free > 30, JSON.stringify(g.stats));
  assert.equal(g.triangles.length % 3, 0);
  for (const i of g.triangles) assert.ok(i < g.stats.points);
  for (const v of g.uv) assert.ok(v >= 0 && v <= 1, "texture coordinates stay inside the photo");
  assert.ok(g.edgeA.length > g.stats.points, "points are joined by springs");
});

test("no hair, or hair only on the scalp, gives no sheet", () => {
  assert.equal(buildHairSheet({ width: W, height: H, data: new Uint8Array(W * H) }, landmarks(), ASPECT), null);
  assert.equal(buildHairSheet(hairMask({ curtains: false }), landmarks(), ASPECT), null, "nothing hangs, so nothing can swing");
  assert.equal(buildHairSheet(null, landmarks(), ASPECT), null);
  assert.equal(buildHairSheet(hairMask(), landmarks().slice(0, 10), ASPECT), null);
});

test("similarity recovers a scale, a turn and a shift", () => {
  const from = [0, 0, 1, 0, 0, 1, 1, 1], s = 1.5, a = 0.4, tx = 3, ty = -2;
  const to = [];
  for (let i = 0; i < 4; i++) { const x = from[2 * i], y = from[2 * i + 1]; to.push(s * (Math.cos(a) * x - Math.sin(a) * y) + tx, s * (Math.sin(a) * x + Math.cos(a) * y) + ty); }
  const t = similarity(from, to);
  assert.ok(Math.abs(t.s - s) < 1e-9 && Math.abs(Math.atan2(t.sin, t.cos) - a) < 1e-9);
  const [x, y] = apply(t, 1, 1);
  assert.ok(Math.abs(x - to[6]) < 1e-9 && Math.abs(y - to[7]) < 1e-9);
  assert.equal(similarity([0, 0], [1, 1]), null, "one point cannot say how the head moved");
});

test("the hair stays close to the photo's hairstyle when the head is still", () => {
  const s = sheet();
  run(s, 240);
  const free = [...Array(s.count).keys()].filter((i) => !s.pinned[i]);
  const worst = Math.max(...free.map((i) => dist(s, i, s.rest[2 * i], s.rest[2 * i + 1]))) / s.headHeight;
  assert.ok(worst < 0.12, `no point drifts far from the photo's hairstyle (worst ${worst.toFixed(3)} head heights)`);
});

test("pinned scalp hair follows the head exactly; the hanging hair lags, then catches up", () => {
  const s = sheet();
  run(s, 60);
  const far = farthestFree(s);
  const move = (dx) => ({ ...IDENTITY, tx: dx });
  let lag = 0;
  for (let i = 1; i <= 8; i++) {
    const t = move(0.03 * i * s.headHeight);
    s.step(1 / 60, t);
    for (let k = 0; k < s.count; k++) if (s.pinned[k]) assert.ok(Math.abs(s.pos[2 * k] - (s.rest[2 * k] + t.tx)) < 1e-6, "scalp hair is rigid with the head");
    lag = Math.max(lag, Math.abs(s.pos[2 * far] - (s.rest[2 * far] + t.tx)) / s.headHeight);
  }
  assert.ok(lag > 0.03, `the ends trail behind a quick head move (lag ${lag.toFixed(3)} head heights)`);
  const end = move(0.24 * s.headHeight);
  run(s, 400, end);
  assert.ok(Math.abs(s.pos[2 * far] - (s.rest[2 * far] + end.tx)) / s.headHeight < 0.06, "and hangs back in place once the head is still");
});

test("a hand pushes hanging hair out of its way, and the hair swings back when the hand leaves", () => {
  const s = sheet();
  run(s, 120);
  const i = middleFree(s);
  const rx = s.rest[2 * i], ry = s.rest[2 * i + 1];
  const hand = { x: rx + 0.01, y: ry, r: s.faceWidth * 0.3 };
  run(s, 90, IDENTITY, [hand]);
  assert.ok(dist(s, i, hand.x, hand.y) >= hand.r * 0.99, "the hair is outside the hand, not through it");
  assert.ok(dist(s, i, rx, ry) > hand.r * 0.5, "and was actually moved aside");
  run(s, 400);
  assert.ok(dist(s, i, rx, ry) / s.headHeight < 0.08, "it returns to the hairstyle once the hand is gone");
});

test("a big hand does not stretch the hair like rubber", () => {
  const s = sheet();
  run(s, 60);
  const i = middleFree(s);
  const hand = { x: s.rest[2 * i], y: s.rest[2 * i + 1], r: s.faceWidth * 0.45 };
  run(s, 90, IDENTITY, [hand]);
  let worst = 0;
  for (let e = 0; e < s.edgeA.length; e++) {
    const a = s.edgeA[e], b = s.edgeB[e];
    worst = Math.max(worst, Math.hypot(s.pos[2 * a] - s.pos[2 * b], s.pos[2 * a + 1] - s.pos[2 * b + 1]) / s.edgeLen[e]);
  }
  assert.ok(worst < 2.2, `no spring is stretched past about twice its length (worst ${worst.toFixed(2)}x)`);
});

test("a hand circle centred exactly on a hair point cannot produce NaN", () => {
  const s = sheet();
  run(s, 60);
  const i = middleFree(s);
  run(s, 30, IDENTITY, [{ x: s.pos[2 * i], y: s.pos[2 * i + 1], r: s.faceWidth * 0.2 }]);
  assert.ok(s.pos.every(Number.isFinite));
  assert.equal(s.heals, 0, "it never even needed the guard");
});

test("if the simulation ever goes invalid it is reset in one frame and keeps working", () => {
  const s = sheet();
  run(s, 30);
  s.pos[2 * middleFree(s)] = NaN;                 // a hanging point (a scalp point is rewritten from the head every step)
  assert.equal(s.step(1 / 60, IDENTITY), true);
  assert.equal(s.heals, 1);
  assert.ok(s.pos.every(Number.isFinite) && s.prev.every(Number.isFinite));
  run(s, 60);
  assert.ok(s.pos.every(Number.isFinite));
  assert.equal(s.step(1 / 60, IDENTITY), false, "healthy frames report nothing");
});

test("a hand becomes a palm circle plus finger circles that scale with the face, and bad input gives none", () => {
  const hand = Array.from({ length: 21 }, (_, k) => ({ x: 0.2 + 0.01 * k, y: 0.3 + 0.005 * k }));
  const small = handColliders(hand, 0.2), big = handColliders(hand, 0.4);
  assert.equal(small.length, 1 + 5 * (4 + 3), "a palm, and for each finger four joints with the gaps between them filled");
  assert.ok(small.every((c) => Number.isFinite(c.x) && Number.isFinite(c.y) && c.r > 0));
  assert.ok(Math.abs(big[0].r / small[0].r - 2) < 1e-9, "a bigger face means a bigger hand");
  assert.deepEqual(handColliders(null, 0.2), []);
  assert.deepEqual(handColliders(hand.slice(0, 5), 0.2), []);
  assert.deepEqual(handColliders(hand, 0), []);
});
