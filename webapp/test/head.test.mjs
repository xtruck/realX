import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FACE_OVAL, HEAD_CLASSES, HEAD_VERTEX_COUNT, OVAL_COUNT, REACH, RINGS, RING_TRIANGLES, RING_VERTICES, glassesShare, headFade, INNER_FADE, headMask, maskUsable, ringFlag, ringPoints, ringTriangles } from "../src/facemesh/head.js";
import { TRIANGLE_COUNT, VERTEX_COUNT, buildMesh } from "../src/facemesh/mesh.js";
import { MeshCompositor } from "../src/facemesh/compositor.js";

const mesh = buildMesh();
// a roundish face of width w centred at (cx, cy), with the oval, chin (152), forehead (10) and cheeks (234, 454) where MediaPipe puts them
function round(cx = 0.5, cy = 0.5, w = 0.2, roll = 0) {
  const lm = Array.from({ length: 478 }, () => ({ x: cx, y: cy, z: 0 }));
  const place = (v, a) => {   // a point of an ellipse, then the whole ellipse turned by `roll`
    const x = (w / 2) * Math.cos(a), y = w * 0.7 * Math.sin(a);
    lm[v] = { x: cx + x * Math.cos(roll) - y * Math.sin(roll), y: cy + x * Math.sin(roll) + y * Math.cos(roll), z: 0 };
  };
  FACE_OVAL.forEach((v, k) => place(v, (2 * Math.PI * k) / OVAL_COUNT - Math.PI / 2));   // k = 0 is the top
  place(10, -Math.PI / 2); place(152, Math.PI / 2); place(234, Math.PI); place(454, 0);
  return lm;
}

test("FACE_OVAL is MediaPipe's own face oval, in order round the face", async () => {
  const { FaceLandmarker } = await import("@mediapipe/tasks-vision");
  const conns = FaceLandmarker.FACE_LANDMARKS_FACE_OVAL;
  assert.equal(OVAL_COUNT, 36);
  assert.deepEqual([...FACE_OVAL].sort((a, b) => a - b), [...new Set(conns.flatMap((e) => [e.start, e.end]))].sort((a, b) => a - b));
  const edges = new Set(conns.map((e) => `${Math.min(e.start, e.end)}-${Math.max(e.start, e.end)}`));
  for (let k = 0; k < OVAL_COUNT; k++) {
    const a = FACE_OVAL[k], b = FACE_OVAL[(k + 1) % OVAL_COUNT];
    assert.ok(edges.has(`${Math.min(a, b)}-${Math.max(a, b)}`), `${a} and ${b} are not neighbours on the oval`);
  }
});

test("ring points lie outside the oval, farther for the outer ring; reach is largest below (neck), then above (hair), smallest at the sides", () => {
  const lm = round();
  const ring = ringPoints(lm, 1);
  assert.equal(ring.length, RING_VERTICES * 2);
  const dist = (i, r) => { const o = ((r - 1) * OVAL_COUNT + i) * 2, v = FACE_OVAL[i]; return Math.hypot(ring[o] - lm[v].x, ring[o + 1] - lm[v].y); };
  for (let k = 0; k < OVAL_COUNT; k++) assert.ok(dist(k, 2) > dist(k, 1) && dist(k, 1) > 0);
  const top = dist(0, 2), bottom = dist(OVAL_COUNT / 2, 2), side = dist((OVAL_COUNT * 3) / 4, 2);
  assert.ok(Math.abs(top - 0.2 * REACH.top) < 2e-3, `top ${top}`);
  assert.ok(Math.abs(bottom - 0.2 * REACH.bottom) < 2e-3, `bottom ${bottom}`);
  assert.ok(Math.abs(side - 0.2 * REACH.side) < 2e-3, `side ${side}`);
  assert.ok(bottom > top && top > side)   // S11c: the neck reaches furthest (down towards the collar), then the hair above, then the ears at the sides;
});

test("ring points follow a tilted head", () => {
  const lm = round(0.5, 0.5, 0.2, 0.5);
  const ring = ringPoints(lm, 1);
  const o = (RINGS - 1) * OVAL_COUNT * 2, v = lm[10];
  const dx = ring[o] - v.x, dy = ring[o + 1] - v.y;
  assert.ok(Math.abs(Math.hypot(dx, dy) - 0.2 * REACH.top) < 2e-3);
  assert.ok(Math.abs(Math.atan2(dy, dx) - (-Math.PI / 2 + 0.5)) < 0.05, `direction ${Math.atan2(dy, dx)}`);
});

test("the aspect ratio keeps distances equal in pixels: a face twice as wide in a picture twice as wide gives the same ring", () => {
  const a = ringPoints(round(0.5, 0.5, 0.2), 1);
  const wide = round(0.5, 0.5, 0.2).map((p) => ({ ...p, x: 0.5 + (p.x - 0.5) / 2 }));   // same face, picture twice as wide
  const b = ringPoints(wide, 2);
  for (let i = 0; i < a.length; i += 2) {
    assert.ok(Math.abs((b[i] - 0.5) * 2 - (a[i] - 0.5)) < 1e-4 && Math.abs(b[i + 1] - a[i + 1]) < 1e-4);
  }
});

test("ringPoints says no for a missing, short or degenerate face", () => {
  assert.equal(ringPoints(null), null);
  assert.equal(ringPoints(round().slice(0, 100)), null);
  assert.equal(ringPoints(round(0.5, 0.5, 0), 1), null);
  assert.equal(ringPoints(round(), 0), null);
});

test("the ring's triangles join oval to ring 1 to ring 2: indices exist, none degenerate, every ring point used", () => {
  const t = ringTriangles();
  assert.equal(t.length, RING_TRIANGLES * 3);
  assert.equal(RING_TRIANGLES, 144);
  assert.ok(t.every((v) => v < HEAD_VERTEX_COUNT));
  for (let i = 0; i < t.length; i += 3) assert.ok(t[i] !== t[i + 1] && t[i + 1] !== t[i + 2] && t[i] !== t[i + 2]);
  const used = new Set(t);
  for (let v = VERTEX_COUNT; v < HEAD_VERTEX_COUNT; v++) assert.ok(used.has(v), `ring point ${v} unused`);
  for (const v of FACE_OVAL) assert.ok(used.has(v));
});

test("the fade is 1 over the face and at the oval, INNER_FADE on the inner ring and 0 on the outer ring; the ring flag marks only ring points", () => {
  const f = headFade(), r = ringFlag();
  assert.ok(Array.from(f.slice(0, VERTEX_COUNT)).every((v) => v === 1));
  assert.ok(Array.from(f.slice(VERTEX_COUNT, VERTEX_COUNT + OVAL_COUNT)).every((v) => v === Math.fround(INNER_FADE)));
  assert.ok(Array.from(f.slice(VERTEX_COUNT + OVAL_COUNT)).every((v) => v === 0));
  assert.equal(Array.from(r).filter((v) => v === 1).length, RING_VERTICES);
  assert.ok(Array.from(r.slice(0, VERTEX_COUNT)).every((v) => v === 0));
});

test("headMask keeps hair, both skins and accessories, drops background and clothes, and softens the edge", () => {
  assert.deepEqual(HEAD_CLASSES, [1, 2, 3, 5]);
  const w = 20, h = 10, classes = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) classes[y * w + x] = x < 4 ? 0 : x < 8 ? 1 : x < 12 ? 3 : x < 16 ? 4 : 5;
  const hard = headMask(classes, w, h, 0);
  assert.deepEqual(Array.from(hard.data.slice(0, w)), [0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 255, 255, 255, 255]);
  const soft = headMask(classes, w, h, 1);
  assert.equal(soft.data[10 + 5 * w], 255);                          // inside the head
  assert.equal(soft.data[1 + 5 * w], 0);                             // inside the background
  const edge = soft.data[3 + 5 * w], inner = soft.data[4 + 5 * w];
  assert.ok(edge > 0 && edge < 255 && inner > 0 && inner < 255, `the edge is soft: ${edge}, ${inner}`);
  assert.equal(headMask(classes, w + 1, h), null, "a wrong size is refused");
  assert.equal(headMask(null, w, h), null);
});

test("a big photo's mask is thinned to about 512 pixels", () => {
  const w = 2048, h = 1024, classes = new Uint8Array(w * h).fill(1);
  const m = headMask(classes, w, h, 1);
  assert.equal(m.width, 512); assert.equal(m.height, 256); assert.equal(m.data.length, 512 * 256);
  assert.ok(m.data.every((v) => v === 255));
});

test("maskUsable refuses a mask with almost nothing, or almost everything, in it", () => {
  const mk = (share) => ({ width: 10, height: 10, data: Uint8Array.from({ length: 100 }, (_, i) => (i < share * 100 ? 255 : 0)) });
  assert.equal(maskUsable(mk(0.3)), true);
  assert.equal(maskUsable(mk(0)), false);
  assert.equal(maskUsable(mk(1)), false);
  assert.equal(maskUsable(null), false);
});

// --- the compositor with the head ----------------------------------------------------------------------------------
function fakeGl() {
  const calls = [];
  return new Proxy({}, {
    get(_t, name) {
      if (name === "calls") return calls;
      if (name === "getParameter") return () => 4096;
      if (name === "getShaderParameter" || name === "getProgramParameter") return () => true;
      if (typeof name === "string" && /^[A-Z_0-9]+$/.test(name)) return name;
      return (...args) => { calls.push([name, ...args]); return { id: calls.length }; };
    },
  });
}
const canvasWith = (gl) => ({ width: 640, height: 480, getContext: () => gl });
const photo = (w, h) => ({ naturalWidth: w, naturalHeight: h });
const maskOf = { width: 4, height: 4, data: new Uint8Array(16).fill(255) };

test("the head ring is drawn only when it is switched on AND the photo has a head mask", () => {
  const gl = fakeGl();
  const c = new MeshCompositor(canvasWith(gl), mesh);
  c.setPhoto(photo(720, 1280), round(0.5, 0.4, 0.3));
  assert.equal(c.headActive, false);
  assert.equal(c.draw(round()), TRIANGLE_COUNT, "off by default: the face alone, as before");
  c.setHead(true);
  assert.equal(c.draw(round()), TRIANGLE_COUNT, "on but no mask yet: the face alone");
  c.setHeadMask(maskOf);
  assert.equal(c.headActive, true);
  assert.equal(c.draw(round()), TRIANGLE_COUNT + RING_TRIANGLES);
  const last = gl.calls.filter((k) => k[0] === "drawElements").at(-1);
  assert.equal(last[2], (TRIANGLE_COUNT + RING_TRIANGLES) * 3);
  c.setHead(false);
  assert.equal(c.draw(round()), TRIANGLE_COUNT);
});

test("a new photo or a cleared photo forgets the head mask; the mask upload is the photo's mask", () => {
  const gl = fakeGl();
  const c = new MeshCompositor(canvasWith(gl), mesh);
  c.setPhoto(photo(720, 1280), round(0.5, 0.4, 0.3));
  c.setHead(true); c.setHeadMask(maskOf);
  assert.equal(gl.calls.filter((k) => k[0] === "texImage2D" && k.includes(maskOf.data)).length, 1);
  c.setPhoto(photo(720, 1280), round(0.5, 0.4, 0.3));
  assert.equal(c.headActive, false, "the mask belonged to the old photo");
  c.setHeadMask(maskOf);
  c.clearPhoto();
  assert.equal(c.headActive, false);
  assert.equal(c.hasPhoto, false);
});

test("a degenerate live face draws the face alone when the head is on", () => {
  const c = new MeshCompositor(canvasWith(fakeGl()), mesh);
  c.setPhoto(photo(720, 1280), round(0.5, 0.4, 0.3));
  c.setHead(true); c.setHeadMask(maskOf);
  assert.equal(c.draw(round(0.5, 0.5, 0)), TRIANGLE_COUNT);
});

// --- the camera rule, S8 ---------------------------------------------------------------------------------------------
const code = (name) => readFileSync(new URL(`../src/facemesh/${name}`, import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

test("segmentation sees only the user's photo, never the camera: one-shot IMAGE mode, fed the gallery photo", () => {
  const src = code("page.js");
  assert.ok(!/segmentForVideo|segmentWithResult/.test(src), "no per-frame segmentation");
  assert.ok(src.includes('runningMode: "IMAGE", outputCategoryMask: true'));
  assert.deepEqual(src.match(/\.segment\([^)]*\)/g), [".segment(item.image)"]);
});

test("head.js reads no pixels and names no camera", () => {
  const head = code("head.js");
  for (const call of ["readPixels", "getImageData", "drawImage", "createImageBitmap", "fetch(", "video", "getUserMedia"]) assert.ok(!head.includes(call), `head.js must not use ${call}`);
});

test("the model is pinned by sha256 and asked for by its served name", () => {
  const py = readFileSync(new URL("../../src/realx/models.py", import.meta.url), "utf8");
  assert.match(py, /"mp_segmenter"[\s\S]*selfie_multiclass_256x256\.tflite[\s\S]*c6748b1253a99067ef71f7e26ca71096cd449baefa8f101900ea23016507e0e0/);
  assert.ok(code("page.js").includes("/mp/models/selfie_multiclass_256x256.tflite"));
});

test("the page has a clear control for the whole head, off by default", () => {
  const html = readFileSync(new URL("../src/facemesh/facemesh.html", import.meta.url), "utf8");
  assert.match(html, /<button id="headBtn"[^>]*aria-pressed="false"/);
  assert.match(html, /off by default/);
});

test("glassesShare is about 0 for a bare face and large when accessories sit along the eye line", () => {
  const W = 64, H = 64, lm = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5 }));
  Object.assign(lm, { 33: { x: 0.3, y: 0.4 }, 133: { x: 0.4, y: 0.4 }, 362: { x: 0.6, y: 0.4 }, 263: { x: 0.7, y: 0.4 } });
  const bare = new Uint8Array(W * H).fill(3);
  assert.equal(glassesShare(bare, W, H, lm, 1), 0);
  const worn = new Uint8Array(W * H).fill(3);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.abs(y / H - 0.4) < 0.05) worn[y * W + x] = 5;   // a strip of accessories along the eye line
  assert.ok(glassesShare(worn, W, H, lm, 1) > 0.15, "a frame strip along the eye line is found");
  const away = new Uint8Array(W * H).fill(3);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (y / H > 0.8) away[y * W + x] = 5;   // accessories far from the eyes
  assert.equal(glassesShare(away, W, H, lm, 1), 0);
  assert.equal(glassesShare(null, W, H, lm, 1), 0);
  assert.equal(glassesShare(bare, W, H, lm.slice(0, 10), 1), 0, "an incomplete face says 0");
});
