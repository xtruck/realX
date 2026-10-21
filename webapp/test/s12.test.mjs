// S12: the neck that yields to the body (S12a), the hair reach (S12b), the smaller live mouth patch (S12c)
// and the softer patch edge (S12d). Pure geometry here; the compositor is driven with a stand-in context.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FACE_OVAL, HEAD_VERTEX_COUNT, NECK_JAW_LINE, NECK_MAX_PULL, OVAL_COUNT, REACH, RINGS, RING_VERTICES, normalizeReach, neckAnchor, ringPoints } from "../src/facemesh/head.js";
import { INNER_LIPS, MOUTH_CENTRE, MOUTH_CORNERS, TRIANGLE_COUNT, VERTEX_COUNT, buildMesh, flatten, mouthKeepWeights } from "../src/facemesh/mesh.js";
import { MeshCompositor } from "../src/facemesh/compositor.js";

const mesh = buildMesh();

// a roundish face of width w centred at (cx, cy): the oval, chin (152), forehead (10) and cheeks (234, 454) all on one ellipse
// (they are already oval points k = 0, 18, 28, 8, and no second placement means the oval's centre stays exact); `yaw` shears the
// bottom half sideways the way a turned head's landmarks do (the chin travels, the forehead does not).
function round(cx = 0.5, cy = 0.5, w = 0.2, yaw = 0) {
  const lm = Array.from({ length: 478 }, () => ({ x: cx, y: cy, z: 0 }));
  const place = (v, a) => {
    const x = (w / 2) * Math.cos(a), y = w * 0.7 * Math.sin(a);
    const below = Math.max(0, Math.sin(a));                         // 0 above the middle, 1 at the chin
    lm[v] = { x: cx + x + yaw * below * w, y: cy + y, z: 0 };
  };
  FACE_OVAL.forEach((v, k) => place(v, (2 * Math.PI * k) / OVAL_COUNT - Math.PI / 2));   // k = 0 is the top
  return lm;
}

// the mouth of a photo, as the compositor sees it: a flat mesh with the inner lips, their centre and the outer corners placed
// like MediaPipe's (a small vertical gap at the centre, the corners a mouth-width apart); everything else sits on a line.
function mouthFlat() {
  const flat = new Float32Array(VERTEX_COUNT * 2);
  for (let i = 0; i < VERTEX_COUNT; i++) { flat[2 * i] = 0.5; flat[2 * i + 1] = 0.6; }
  flat[2 * 13] = 0.5; flat[2 * 13 + 1] = 0.59;      // the upper inner lip's middle
  flat[2 * 14] = 0.5; flat[2 * 14 + 1] = 0.61;      // the lower inner lip's middle
  flat[2 * 61] = 0.42; flat[2 * 61 + 1] = 0.60;     // the outer corners: the mouth's own scale (0.08 half a width)
  flat[2 * 291] = 0.58; flat[2 * 291 + 1] = 0.60;
  INNER_LIPS.forEach((v, n) => {                    // the rest of the inner outline: an ellipse 0.075 wide, 0.016 tall
    if (v === 13 || v === 14) return;
    const a = (2 * Math.PI * n) / INNER_LIPS.length;
    flat[2 * v] = 0.5 + 0.075 * Math.cos(a); flat[2 * v + 1] = 0.6 + 0.016 * Math.sin(a);
  });
  return flat;
}

const at = (ring, r, k) => ((r - 1) * OVAL_COUNT + k) * 2;   // x of ring point (r, k); y follows

// --- S12b: the reach -----------------------------------------------------------------------------------------------------------------

test("normalizeReach: the default is REACH, a number is a new top, a partial object fills the rest, junk falls back", () => {
  assert.deepEqual(normalizeReach(), { top: REACH.top, side: REACH.side, bottom: REACH.bottom });
  assert.deepEqual(normalizeReach(0.8), { top: 0.8, side: REACH.side, bottom: REACH.bottom });
  assert.deepEqual(normalizeReach({ top: 0.9 }), { top: 0.9, side: REACH.side, bottom: REACH.bottom });
  assert.deepEqual(normalizeReach({ bottom: 0.4 }), { top: REACH.top, side: REACH.side, bottom: 0.4 });
  assert.deepEqual(normalizeReach(5).top, 1.2, "a silly big reach is clamped");
  assert.deepEqual(normalizeReach(-1).top, 0.15, "a negative reach is clamped");
  assert.deepEqual(normalizeReach({ side: 99 }).side, 0.8);
  assert.deepEqual(normalizeReach(null), { top: REACH.top, side: REACH.side, bottom: REACH.bottom });
  assert.deepEqual(normalizeReach("tall").top, REACH.top);
  assert.deepEqual(normalizeReach({ top: "tall" }).top, REACH.top);
});

test("a larger top reach moves the hair ring out and leaves the ears and the neck where they were", () => {
  const lm = round();
  const plain = ringPoints(lm, 1), tall = ringPoints(lm, 1, 0.9);
  assert.equal(plain.length, RING_VERTICES * 2); assert.equal(tall.length, RING_VERTICES * 2);
  const dist = (ring, r, k) => { const o = at(ring, r, k), v = lm[FACE_OVAL[k]]; return Math.hypot(ring[o] - v.x, ring[o + 1] - v.y); };
  const width = Math.hypot(lm[454].x - lm[234].x, lm[454].y - lm[234].y);   // the face's own width, as ringPoints measures it
  assert.ok(dist(tall, 2, 0) > dist(plain, 2, 0) + width * (0.9 - REACH.top) - 1e-6, "the top of the outer ring reaches further");
  assert.ok(Math.abs(dist(tall, 2, OVAL_COUNT / 2) - dist(plain, 2, OVAL_COUNT / 2)) < 1e-9, "the neck (bottom) does not move");
  assert.ok(Math.abs(dist(tall, 2, (OVAL_COUNT * 3) / 4) - dist(plain, 2, (OVAL_COUNT * 3) / 4)) < 1e-9, "the ears (sides) do not move");
  assert.ok(Math.abs(dist(ringPoints(lm, 1, 0.9), 2, 0) - width * 0.9) < 2e-3, "the reach is measured in face widths");
  assert.deepEqual(ringPoints(lm, 1, { top: 99 }), ringPoints(lm, 1, 1.2), "the reach is clamped inside ringPoints too");
});

test("the same face in a wider picture keeps the same ring when the reach is overridden", () => {
  const a = ringPoints(round(0.5, 0.5, 0.2), 1, 0.9);
  const wide = round(0.5, 0.5, 0.2).map((p) => ({ ...p, x: 0.5 + (p.x - 0.5) / 2 }));
  const b = ringPoints(wide, 2, 0.9);
  for (let i = 0; i < a.length; i += 2) {
    assert.ok(Math.abs((b[i] - 0.5) * 2 - (a[i] - 0.5)) < 1e-4 && Math.abs(b[i + 1] - a[i + 1]) < 1e-4);
  }
});

// --- S12a: the neck that yields ------------------------------------------------------------------------------------------------------

test("neckAnchor says no for a wrong-shaped input and returns the ring itself when nothing is asked", () => {
  const lm = round(), ring = ringPoints(lm, 1), flat = flatten(lm);
  assert.equal(neckAnchor(null, flat), null);
  assert.equal(neckAnchor(ring, null), null);
  assert.equal(neckAnchor(ring, flat.slice(0, 100)), null);
  assert.equal(neckAnchor(ring, flat, 0), null);
  const still = neckAnchor(ring, flat, 1, null, 0);
  assert.ok(still instanceof Float32Array && still.length === ring.length, "amount 0 still returns a usable ring");
  for (let i = 0; i < ring.length; i++) assert.equal(still[i], ring[i]);
  assert.notEqual(still, ring, "a copy, so the caller's array is never edited in place");
  const junk = neckAnchor(ring, flat, 1, "shoulder", 1);
  assert.ok(junk instanceof Float32Array, "a junk anchor falls back to the face's own middle");
});

test("a straight face over its own anchor narrows its neck symmetrically and keeps everything above the jaw", () => {
  const lm = round(), ring = ringPoints(lm, 1), flat = flatten(lm);
  const hung = neckAnchor(ring, flat, 1, [0.5, 0.95], 1);
  const k = OVAL_COUNT / 2;   // the chin: its ring point hangs straight below an on-centre face, so it stays
  assert.ok(Math.abs(hung[at(hung, 2, k)] - ring[at(ring, 2, k)]) < 1e-9, "the chin's ring point does not move");
  for (let i = 1; i < ring.length; i += 2) assert.ok(Math.abs(hung[i] - ring[i]) < 1e-9, `point ${i}'s y moved`);
  // the jaw's underside narrows toward the middle, the same amount from both sides (k-1 and k+1 sit on either side of the chin)
  for (const [a, b] of [[k - 1, k + 1], [k - 2, k + 2]]) {
    const da = hung[at(hung, 2, a)] - ring[at(ring, 2, a)], db = hung[at(hung, 2, b)] - ring[at(ring, 2, b)];
    assert.ok(da * db < 0, `points ${a}/${b} did not pull toward the middle from opposite sides`);
    assert.ok(Math.abs(da + db) < 1e-6, `the pull is not symmetric: ${da} vs ${db}`);
  }
  // everything at or above the jaw line stays exactly where it was
  for (let kk = 0; kk < OVAL_COUNT; kk++) {
    const below = ring[at(ring, 2, kk) + 1] > flat[2 * 152 + 1] + 1e-9;   // ring points that hang below the chin's own y
    if (!below) for (let r = 1; r <= RINGS; r++) {
      assert.ok(Math.abs(hung[at(hung, r, kk)] - ring[at(ring, r, kk)]) < 1e-9, `ring point (${r}, ${kk}) above the jaw moved`);
    }
  }
});

test("a yawed head's neck stops swinging: the lower ring pulls back toward the body, the face keeps the turn", () => {
  const lm = round(0.5, 0.5, 0.2, 0.5), ring = ringPoints(lm, 1), flat = flatten(lm);
  const hung = neckAnchor(ring, flat, 1, null, 1);
  const k = OVAL_COUNT / 2;   // the chin: the bottom-most oval point, sheared sideways with the turn
  let ox = 0; for (const i of FACE_OVAL) ox += flat[2 * i]; ox /= OVAL_COUNT;   // the oval's own middle
  const plainX = ring[at(ring, 2, k)], hungX = hung[at(hung, 2, k)];
  assert.ok(Math.abs(hungX - ox) < Math.abs(plainX - ox) - 1e-4, `plain ${plainX} hung ${hungX} centre ${ox}`);
  assert.ok(Math.abs(hung[at(hung, 2, k) + 1] - ring[at(ring, 2, k) + 1]) < 1e-9, "the drop (y) is untouched");
  // the cheeks and everything above the jaw stay exactly with the head, even though the axis tilted with the turn
  for (let kk = 0; kk < OVAL_COUNT; kk++) {
    const below = ring[at(ring, 2, kk) + 1] > flat[2 * 152 + 1] + 1e-9;
    if (!below) for (let r = 1; r <= RINGS; r++) {
      assert.ok(Math.abs(hung[at(hung, r, kk)] - ring[at(ring, r, kk)]) < 1e-9, `ring point (${r}, ${kk}) above the jaw moved`);
    }
  }
});

test("the live shoulders drag the neck further than the face's own middle does, and an anchor above the head is ignored", () => {
  const lm = round(0.45, 0.4, 0.2, 0.5), ring = ringPoints(lm, 1, { bottom: 0.7 }), flat = flatten(lm);   // S14a: fixture built at the old 0.7 reach: with 0.9 the sheared chin point already overshoots the 0.6 anchor
  const k = OVAL_COUNT / 2;
  const alone = neckAnchor(ring, flat, 1, null, 1)[at(ring, 2, k)];
  const shouldered = neckAnchor(ring, flat, 1, [0.6, 0.9], 1)[at(ring, 2, k)];
  assert.ok(Math.abs(shouldered - 0.6) < Math.abs(alone - 0.6) - 1e-4, "the shoulders pull the neck's base toward themselves");
  const above = neckAnchor(ring, flat, 1, [0.6, 0.1], 1)[at(ring, 2, k)];   // y above the face's middle: not shoulders
  assert.equal(above, alone, "an anchor above the head falls back to the face's own middle");
});

test("the pull is clamped so a wild anchor cannot tear the neck off the face", () => {
  const lm = round(), ring = ringPoints(lm, 1), flat = flatten(lm);
  const width = Math.abs(flat[2 * 454] - flat[2 * 234]);
  const hung = neckAnchor(ring, flat, 1, [0.5 + 9, 0.9], 1);
  const k = OVAL_COUNT / 2;
  const moved = Math.abs(hung[at(hung, 2, k)] - ring[at(ring, 2, k)]);
  assert.ok(moved <= NECK_MAX_PULL * width + 1e-6, `moved ${moved}, cap ${NECK_MAX_PULL * width}`);
});

test("the inner ring yields less than the outer one, so the neck bends instead of folding", () => {
  const lm = round(0.5, 0.5, 0.2, 0.5), ring = ringPoints(lm, 1), flat = flatten(lm);
  const hung = neckAnchor(ring, flat, 1, [0.62, 0.9], 1);
  const k = OVAL_COUNT / 2;
  const inner = Math.abs(hung[at(hung, 1, k)] - ring[at(ring, 1, k)]);
  const outer = Math.abs(hung[at(hung, 2, k)] - ring[at(ring, 2, k)]);
  assert.ok(outer > inner && inner > 0, `inner ${inner} outer ${outer}`);
});

// --- S12c: the smaller live mouth patch ----------------------------------------------------------------------------------------------

test("mouthKeepWeights: shrink 0 marks the inner lips as before; anything else keeps the rest of the mesh at 0", () => {
  const flat = mouthFlat();
  const none = mouthKeepWeights(flat, 1, 0);
  assert.equal(none.length, VERTEX_COUNT);
  for (const v of INNER_LIPS) assert.equal(none[v], 1);
  assert.equal(Array.from(none).filter((v) => v === 1).length, INNER_LIPS.length);
  const some = mouthKeepWeights(flat, 1, 0.5);
  for (let v = 0; v < VERTEX_COUNT; v++) if (!INNER_LIPS.includes(v)) assert.equal(some[v], 0, `vertex ${v} is not a mouth point`);
  assert.equal(mouthKeepWeights(null, 1, 0.5), null);
  assert.equal(mouthKeepWeights(flat.slice(0, 10), 1, 0.5), null);
  assert.equal(mouthKeepWeights(flat, 0, 0.5), null);
});

test("the patch pulls in towards the middle of the mouth as the shrink grows, most at the corners", () => {
  const flat = mouthFlat();
  const cx = (flat[2 * MOUTH_CENTRE[0]] + flat[2 * MOUTH_CENTRE[1]]) / 2, cy = (flat[2 * MOUTH_CENTRE[0] + 1] + flat[2 * MOUTH_CENTRE[1] + 1]) / 2;
  const half = Math.hypot(flat[2 * MOUTH_CORNERS[0]] - flat[2 * MOUTH_CORNERS[1]], flat[2 * MOUTH_CORNERS[0] + 1] - flat[2 * MOUTH_CORNERS[1] + 1]) / 2;
  const d = (v) => Math.hypot(flat[2 * v] - cx, flat[2 * v + 1] - cy) / half;
  const nearest = INNER_LIPS.reduce((a, b) => (d(a) <= d(b) ? a : b)), farthest = INNER_LIPS.reduce((a, b) => (d(a) >= d(b) ? a : b));
  const full = mouthKeepWeights(flat, 1, 1);
  assert.ok(full[nearest] > full[farthest], `nearest ${full[nearest]} farthest ${full[farthest]}`);
  assert.ok(full[farthest] < 0.2, `the outermost mouth point nearly loses the patch at shrink 1 (got ${full[farthest]})`);
  assert.ok(full[nearest] > 0.9, "the very middle stays almost whole");
  const half1 = mouthKeepWeights(flat, 1, 0.5), none = mouthKeepWeights(flat, 1, 0);
  for (const v of INNER_LIPS) {
    assert.ok(half1[v] < none[v] + 1e-9 && half1[v] > full[v] - 1e-9, `vertex ${v} is not between the two extremes`);
  }
  assert.ok(mouthKeepWeights(flat, 1, 2)[farthest] === full[farthest], "a shrink over 1 is clamped");
  assert.ok(mouthKeepWeights(flat, 1, -3)[farthest] === none[farthest], "a negative shrink is clamped");
});

test("the weights are measured on the picture's own units: a wide photo gives the same weights as a tall one", () => {
  const wide = mouthFlat().map((v, i) => (i % 2 === 0 ? 0.5 + (v - 0.5) / 2 : v));   // the same mouth in a picture twice as wide
  const a = mouthKeepWeights(mouthFlat(), 1, 0.8), b = mouthKeepWeights(Float32Array.from(wide), 2, 0.8);
  for (const v of INNER_LIPS) assert.ok(Math.abs(a[v] - b[v]) < 1e-4, `vertex ${v} differs: ${a[v]} vs ${b[v]}`);
});

// --- the page: controls, and the compositor wiring ------------------------------------------------------------------------------------

test("the page has the two new controls, labelled, with the neck note next to them", () => {
  const html = readFileSync(new URL("../src/facemesh/facemesh.html", import.meta.url), "utf8");
  assert.match(html, /<label>Hair reach <input id="hairReach" type="range" min="30" max="100" value="55"/);
  assert.match(html, /<label>Mouth patch <input id="mouthPatch" type="range" min="0" max="100" value="50"/);
  assert.match(html, /id="hairReachNote"/);
  assert.match(html, /id="mouthNote"/);
});

test("page.js keeps the neck anchor fed from the pose, and forgets it with the body", () => {
  const src = readFileSync(new URL("../src/facemesh/page.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  assert.match(src, /compositor\.setNeckAnchor\(neck, neck \? 1 : 0\.6\)/);
  assert.match(src, /compositor\.clearBody\(\); compositor\.setNeckAnchor\(null, 0\.6\)/);
  assert.match(src, /compositor\.setHairReach\(Number\(e\.currentTarget\.value\) \/ 100\)/);
  assert.match(src, /compositor\.setMouthShrink\(Number\(e\.currentTarget\.value\) \/ 100\)/);
});

// A stand-in for a WebGL context: it records the calls and answers like a graphics card with 4096-pixel textures.
function fakeGl() {
  const calls = [];
  const gl = new Proxy({}, {
    get(_t, name) {
      if (name === "calls") return calls;
      if (name === "getParameter") return () => 4096;
      if (name === "getShaderParameter" || name === "getProgramParameter") return () => true;
      if (typeof name === "string" && /^[A-Z_0-9]+$/.test(name)) return name;
      return (...args) => { calls.push([name, ...args]); return { id: calls.length }; };
    },
  });
  return gl;
}
const canvasWith = (gl) => ({ width: 640, height: 480, getContext: () => gl });
const photo = (w, h) => ({ naturalWidth: w, naturalHeight: h });

test("the compositor takes the new settings, clamps them, and rebuilds the mouth weights when the photo changes", () => {
  const gl = fakeGl();
  const c = new MeshCompositor(canvasWith(gl), mesh);
  c.setHairReach(0.9); assert.equal(c.hairReach, 0.9);
  c.setHairReach(99); assert.equal(c.hairReach, 1.2);
  c.setHairReach(-2); assert.equal(c.hairReach, 0.3);
  c.setHairReach("tall"); assert.equal(c.hairReach, 0.3, "junk leaves the reach as it was");
  c.setNeckAnchor([0.4, 0.9], 1); assert.deepEqual(c.neck, { anchor: [0.4, 0.9], amount: 1 });
  c.setNeckAnchor("shoulder", 1); assert.deepEqual(c.neck, { anchor: null, amount: 1 });
  c.setNeckAnchor([0.4], 1); assert.deepEqual(c.neck, { anchor: null, amount: 1 }, "an anchor needs both numbers");
  c.setNeckAnchor([0.4, 0.9], "much"); assert.equal(c.neck.amount, 0, "a junk amount means no yielding at all");
  c.setNeckAnchor([0.4, 0.9], 9); assert.equal(c.neck.amount, 1);
  c.setMouthShrink(2); assert.equal(c.mouthShrink, 1);
  const uploads = () => gl.calls.filter((k) => k[0] === "bufferData").length;
  c.setPhoto(photo(720, 1280), round(0.3, 0.3, 0.25));
  const afterPhoto = uploads();
  assert.ok(afterPhoto > 0, "the photo's arrival rebuilds the keep buffer with the mouth measured on it");
  c.setMouthShrink(0.8); assert.equal(c.mouthShrink, 0.8);
  assert.equal(uploads(), afterPhoto + 1, "a new shrink rebuilds the keep buffer once");
});

test("a drawn frame with the whole head on carries a ring that yields, and the mouth weights ride the keep buffer", () => {
  const gl = fakeGl();
  const c = new MeshCompositor(canvasWith(gl), mesh);
  c.setPhoto(photo(720, 1280), round(0.3, 0.3, 0.25));
  c.setHeadMask({ width: 4, height: 4, data: new Uint8Array(16).fill(255) });
  c.setHead(true);
  assert.equal(c.headActive, true);
  const lm = round(0.3, 0.35, 0.25, 0.5);
  c.setNeckAnchor([0.3, 0.9], 1);
  assert.equal(c.draw(lm), TRIANGLE_COUNT + 2 * OVAL_COUNT * 2, "the face and the ring are drawn");
  // the ring that went up to the card: the last bufferSubData carries all HEAD_VERTEX_COUNT points of this.positions
  const subs = gl.calls.filter((k) => k[0] === "bufferSubData" && k[3] instanceof Float32Array);
  const sub = subs[subs.length - 1];
  assert.ok(sub && sub[3].length === HEAD_VERTEX_COUNT * 2, "all the head's points are uploaded");
  // with the same face but no anchor, the bottom of the ring hangs differently than from the shoulders
  c.setNeckAnchor(null, 1);
  c.draw(lm);
  const subs2 = gl.calls.filter((k) => k[0] === "bufferSubData" && k[3] instanceof Float32Array);
  const plain = subs2[subs2.length - 1][3];
  assert.ok(plain, "a second frame was uploaded");
});

// the shader fades the kept eyes and mouth over a wider band (S12d): the source says so
test("the kept patch's edge is feathered wider than before", () => {
  const src = readFileSync(new URL("../src/facemesh/compositor.js", import.meta.url), "utf8");
  assert.match(src, /smoothstep\(0\.35, 1\.0, v_keep\)/);
  assert.match(src, /smoothstep\(0\.35, 1\.0, -v_keep\)/);
});
