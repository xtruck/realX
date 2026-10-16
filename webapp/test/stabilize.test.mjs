import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { VERTEX_COUNT } from "../src/facemesh/mesh.js";
import { FacePresence, JitterMeter, LandmarkSmoother, handCover, isJump } from "../src/facemesh/stabilize.js";

// a face (478 points) whose box starts at (x, y) and is w wide
const face = (x, y, w = 0.3) => Array.from({ length: 478 }, (_, i) => ({ x: x + w * ((i % 20) / 19), y: y + w * 1.2 * (Math.floor(i / 20) / 23), z: 0 }));
const box = (x, y, w, h) => ({ x, y, w, h });

// --- smoothing: still, normal and very fast head motion (the simulation the constants were chosen from) ----------------------
let seed = 7;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
const SIGMA = 0.0015;   // about one pixel of landmark noise at 640 wide

function simulate(truth, frames = 250, dt = 0.04) {
  const smoother = new LandmarkSmoother();
  let se = 0, seRaw = 0;
  for (let i = 0; i < frames; i++) {
    const t = i * dt, x = truth(t);
    const noisy = face(0, 0).map((p) => ({ x: p.x + x + SIGMA * gauss(), y: p.y, z: 0 }));
    const out = smoother.update(noisy, t + 1);
    if (i > 20) { se += (out[1].x - (face(0, 0)[1].x + x)) ** 2; seRaw += (noisy[1].x - (face(0, 0)[1].x + x)) ** 2; }
  }
  return { rms: Math.sqrt(se / (frames - 21)), raw: Math.sqrt(seRaw / (frames - 21)) };
}

test("smoothing takes away a good part of the shake when the face is still", () => {
  const r = simulate(() => 0.5);
  assert.ok(r.rms < 0.7 * r.raw, `error ${(r.rms * 640).toFixed(2)} px against ${(r.raw * 640).toFixed(2)} px raw`);
});

test("smoothing does not lag behind a normal head turn or a very fast one", () => {
  const normal = simulate((t) => 0.5 + 0.1 * Math.sin(2 * Math.PI * 1.0 * t));
  const fast = simulate((t) => 0.5 + 0.12 * Math.sin(2 * Math.PI * 2.5 * t));   // peak speed about 1.9 widths of the picture per second
  assert.ok(normal.rms * 640 < 3, `normal motion: ${(normal.rms * 640).toFixed(1)} px`);
  assert.ok(fast.rms * 640 < 5, `fast motion: ${(fast.rms * 640).toFixed(1)} px`);
});

test("the smoother keeps the depth value, reuses its output and forgets on reset", () => {
  const s = new LandmarkSmoother();
  const lm = face(0.2, 0.2); lm[5].z = 0.07;
  const a = s.update(lm, 1);
  assert.equal(a[5].z, 0.07);
  const first = a[1].x;
  assert.equal(s.update(face(0.6, 0.2), 1.04), a, "the same array every time");
  s.reset();
  s.update(face(0.6, 0.2), 5);
  assert.ok(Math.abs(a[1].x - face(0.6, 0.2)[1].x) < 1e-9, "after a reset the next frame is taken as it is");
  assert.ok(first < face(0.6, 0.2)[1].x);
});

// --- jumps and hands -----------------------------------------------------------------------------------------------------

test("isJump: a face that moves by a full width or doubles in size in one frame is a glitch; ordinary motion is not", () => {
  const prev = box(0.3, 0.3, 0.3, 0.36);
  assert.equal(isJump(box(0.31, 0.3, 0.3, 0.36), prev), false);
  assert.equal(isJump(box(0.55, 0.3, 0.3, 0.36), prev), true);
  assert.equal(isJump(box(0.3, 0.3, 0.7, 0.8), prev), true);
  assert.equal(isJump(box(0.3, 0.3, 0.1, 0.12), prev), true);
  assert.equal(isJump(null, prev), false);
  assert.equal(isJump(box(0.3, 0.3, 0.3, 0.36), null), false);
});

test("handCover counts hand points inside the middle of the face: six or more is covered", () => {
  const b = box(0.3, 0.3, 0.3, 0.36);
  const hand = (n, x, y) => Array.from({ length: 21 }, (_, i) => ({ x: i < n ? x : 0.9, y: i < n ? y : 0.9, z: 0 }));
  assert.equal(handCover(b, []), 0);
  assert.equal(handCover(b, null), 0);
  assert.equal(handCover(null, [hand(21, 0.4, 0.4)]), 0);
  assert.equal(handCover(b, [hand(0, 0.4, 0.4)]), 0, "a hand elsewhere");
  assert.ok(Math.abs(handCover(b, [hand(3, 0.45, 0.5)]) - 0.5) < 1e-9, "3 of 6 points");
  assert.equal(handCover(b, [hand(10, 0.45, 0.5)]), 1);
  assert.equal(handCover(b, [hand(21, 0.301, 0.301)]), 0, "the very rim of the box does not count");
});

// --- presence over time: a face that comes, stays, goes, comes back ------------------------------------------------------------

const STEP = 40;   // ms, about 25 fps
function play(presence, frames, t0 = 0, cover = 0) {   // frames: a list of faces (or null), one per step
  const out = [];
  frames.forEach((f, i) => { const r = presence.update(f, t0 + i * STEP, cover); out.push(r && { opacity: r.opacity, x: r.landmarks[1].x }); });
  return out;
}

test("a face that appears fades in over about 150 ms and then stays fully drawn", () => {
  const p = new FacePresence();
  const o = play(p, Array(10).fill(face(0.3, 0.3))).map((r) => r.opacity);
  assert.equal(o[0], 0);
  assert.ok(o.every((v, i) => i === 0 || v >= o[i - 1]), "never goes down while the face is there");
  assert.equal(o[o.length - 1], 1);
  assert.ok(o[2] > 0 && o[2] < 1, "it fades, it does not pop");
});

test("when the face is lost the photo is held for 120 ms, fades out over 250 ms, then nothing is drawn", () => {
  const p = new FacePresence();
  const seen = play(p, Array(8).fill(face(0.3, 0.3)));
  const x = seen[seen.length - 1].x;
  const gone = play(p, Array(12).fill(null), 8 * STEP);
  assert.equal(gone[0].opacity, 1);
  assert.equal(gone[0].x, x, "held where it was");
  assert.equal(gone[2].opacity, 1, "still held at 120 ms");
  const mid = gone.find((r, i) => i > 3 && r && r.opacity < 1);
  assert.ok(mid && mid.opacity > 0, "a fade, not a cut");
  const values = gone.filter(Boolean).map((r) => r.opacity);
  assert.ok(values.every((v, i) => i === 0 || v <= values[i - 1]), "only goes down");
  assert.equal(gone[gone.length - 1], null, "after the fade nothing is drawn");
});

test("a face that comes back after a long gap starts where it is now, instead of sliding in from the old place", () => {
  const p = new FacePresence();
  play(p, Array(8).fill(face(0.1, 0.3)));
  play(p, Array(15).fill(null), 8 * STEP);                      // 600 ms: long gone
  const back = play(p, Array(6).fill(face(0.6, 0.3)), 23 * STEP);
  assert.ok(Math.abs(back[0].x - face(0.6, 0.3)[1].x) < 1e-9, "the first frame is drawn at the new place");
  assert.ok(back[0].opacity < 0.4 && back[5].opacity > back[0].opacity, "and fades in");
});

test("a face that comes back during the fade-out keeps fading in from where it was", () => {
  const p = new FacePresence();
  play(p, Array(8).fill(face(0.3, 0.3)));
  const gone = play(p, Array(6).fill(null), 8 * STEP);          // 240 ms: held, then fading
  const dip = gone[5].opacity;
  assert.ok(dip > 0 && dip < 1);
  const back = play(p, Array(4).fill(face(0.3, 0.3)), 14 * STEP);
  assert.ok(back[0].opacity >= dip && back[3].opacity === 1);
});

test("one wild frame is ignored, but a face that really is elsewhere is believed after 300 ms", () => {
  const p = new FacePresence();
  const steady = play(p, Array(10).fill(face(0.2, 0.3)));
  const x = steady[9].x;
  const glitch = play(p, [face(0.7, 0.3)], 10 * STEP);
  assert.equal(glitch[0].x, x, "the wild frame did not move the photo");
  assert.equal(glitch[0].opacity, 1);
  const normal = play(p, [face(0.2, 0.3)], 11 * STEP);
  assert.ok(Math.abs(normal[0].x - x) < 0.01, "back to normal");
  const moved = play(p, Array(12).fill(face(0.7, 0.3)), 12 * STEP);   // 480 ms at the new place
  assert.equal(moved[0].x, x, "held at first");
  const last = moved[moved.length - 1];
  assert.ok(Math.abs(last.x - face(0.7, 0.3)[1].x) < 1e-6, "believed after 300 ms, drawn at the new place");
});

test("a hand over the face fades the photo out within about 120 ms, and back in when it leaves", () => {
  const p = new FacePresence();
  play(p, Array(8).fill(face(0.3, 0.3)));
  const covered = play(p, Array(5).fill(face(0.3, 0.3)), 8 * STEP, 1);
  assert.equal(covered[covered.length - 1].opacity, 0);
  assert.ok(covered[0].opacity > 0 && covered[0].opacity < 1, "a fade, not a cut");
  const freed = play(p, Array(5).fill(face(0.3, 0.3)), 13 * STEP, 0);
  assert.equal(freed[freed.length - 1].opacity, 1);
});

test("with smoothing off the drawn face is the detected one, exactly", () => {
  const p = new FacePresence({ smoothing: false });
  play(p, Array(3).fill(face(0.3, 0.3)));
  const r = p.update(face(0.31, 0.3), 3 * STEP, 0);
  assert.equal(r.landmarks[1].x, face(0.31, 0.3)[1].x);
  assert.equal(r.landmarks.length, VERTEX_COUNT);
});

test("JitterMeter: smoothing lowers the frame-to-frame shake of the nose tip", () => {
  const s = new LandmarkSmoother(), m = new JitterMeter();
  for (let i = 0; i < 200; i++) {
    const noisy = face(0.4, 0.4).map((p) => ({ x: p.x + SIGMA * gauss(), y: p.y + SIGMA * gauss(), z: 0 }));
    m.mark(noisy, s.update(noisy, 1 + i * 0.04));
  }
  assert.ok(m.n > 100 && m.smooth < 0.7 * m.raw, `smoothed ${m.smooth.toFixed(5)}, raw ${m.raw.toFixed(5)}`);
  m.mark(null, null);
  assert.equal(m.prevRaw, null);
});

test("stabilize.js is numbers only: no picture, no DOM, no network, no storage", () => {
  const src = readFileSync(new URL("../src/facemesh/stabilize.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  for (const word of ["document", "window", "canvas", "video", "readPixels", "getImageData", "toDataURL", "drawImage", "texImage2D",
    "fetch(", "XMLHttpRequest", "WebSocket", "localStorage", "sessionStorage", "indexedDB", "getUserMedia"]) {
    assert.ok(!src.includes(word), `stabilize.js must not use ${word}`);
  }
});
