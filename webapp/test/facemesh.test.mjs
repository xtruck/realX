import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { INNER_LIPS, LEFT_EYE, RIGHT_EYE, TRIANGLE_COUNT, VERTEX_COUNT, RollingStats, buildMesh, checkPhotoFaces, edgeDepth, faceBox, fillSegments, flatten, keepMask, uniqueEdges } from "../src/facemesh/mesh.js";
import { MeshCompositor } from "../src/facemesh/compositor.js";

const mesh = buildMesh();

test("the canonical mesh has MediaPipe's 468 vertices and 898 triangles, all of them used", () => {
  assert.equal(mesh.triangles.length, TRIANGLE_COUNT * 3);
  assert.equal(mesh.uv.length, VERTEX_COUNT * 2);
  assert.ok(mesh.triangles.every((v) => v < VERTEX_COUNT));
  assert.equal(new Set(mesh.triangles).size, VERTEX_COUNT);
});

test("texture coordinates lie inside the texture", () => {
  for (const c of mesh.uv) assert.ok(c >= 0 && c <= 1, `uv ${c} is outside 0..1`);
});

test("no triangle is degenerate", () => {
  for (let i = 0; i < mesh.triangles.length; i += 3) {
    const [a, b, c] = [mesh.triangles[i], mesh.triangles[i + 1], mesh.triangles[i + 2]];
    assert.ok(a !== b && b !== c && a !== c, `triangle ${i / 3} repeats a vertex`);
  }
});

test("each edge is listed once, smaller index first, and the count fits a triangle mesh", () => {
  const e = mesh.edges, seen = new Set();
  for (let i = 0; i < e.length; i += 2) {
    assert.ok(e[i] < e[i + 1]);
    const key = `${e[i]}-${e[i + 1]}`;
    assert.ok(!seen.has(key), `edge ${key} is listed twice`);
    seen.add(key);
  }
  const edges = e.length / 2;
  assert.ok(edges >= (3 * TRIANGLE_COUNT) / 2 && edges <= 3 * TRIANGLE_COUNT, `${edges} edges for ${TRIANGLE_COUNT} triangles`);
});

test("uniqueEdges on two triangles that share a side", () => {
  assert.deepEqual(Array.from(uniqueEdges(Uint16Array.of(0, 1, 2, 2, 1, 3))), [0, 1, 1, 2, 0, 2, 1, 3, 2, 3]);
});

test("a mesh with the wrong size or a stray index is refused", () => {
  assert.throws(() => buildMesh({ vertices: 10, triangles: [], uv: [] }), /wrong size/);
  const bad = { vertices: VERTEX_COUNT, triangles: new Array(TRIANGLE_COUNT * 3).fill(0), uv: new Array(VERTEX_COUNT * 2).fill(0) };
  bad.triangles[5] = VERTEX_COUNT;
  assert.throws(() => buildMesh(bad), /uses vertex/);
});

const face = (x, y) => Array.from({ length: 478 }, (_, i) => ({ x: x + (i % 10) / 100, y: y + Math.floor(i / 10) / 1000, z: 0 }));

test("fillSegments puts both ends of every edge in pixels", () => {
  const lm = face(0.25, 0.5);
  const out = new Float32Array(mesh.edges.length * 2);
  assert.equal(fillSegments(lm, mesh.edges, 640, 480, out), true);
  const [a, b] = [mesh.edges[0], mesh.edges[1]];
  assert.ok(Math.abs(out[0] - lm[a].x * 640) < 1e-3 && Math.abs(out[1] - lm[a].y * 480) < 1e-3);
  assert.ok(Math.abs(out[2] - lm[b].x * 640) < 1e-3 && Math.abs(out[3] - lm[b].y * 480) < 1e-3);
});

test("fillSegments and faceBox say no when there is no face or too few points", () => {
  const out = new Float32Array(mesh.edges.length * 2).fill(7);
  assert.equal(fillSegments(null, mesh.edges, 640, 480, out), false);
  assert.equal(fillSegments(face(0, 0).slice(0, 100), mesh.edges, 640, 480, out), false);
  assert.ok(out.every((v) => v === 7), "the output is left alone");
  assert.equal(faceBox(null), null);
  assert.equal(faceBox([]), null);
});

test("faceBox is the box around the 468 mesh points and ignores the iris points", () => {
  const lm = face(0.2, 0.3);
  lm[470] = { x: 0.99, y: 0.99, z: 0 };   // an iris point far away must not stretch the box
  const box = faceBox(lm);
  assert.ok(box.x >= 0.2 && box.x + box.w < 0.6 && box.y >= 0.3 && box.y + box.h < 0.9, JSON.stringify(box));
});

test("RollingStats: frames per second and the share of frames with a face, over a window", () => {
  const s = new RollingStats(5000);
  assert.deepEqual(s.read(), { fps: 0, foundPct: 0 });
  for (let i = 0; i <= 60; i++) s.mark(i * 50, i % 4 !== 0);   // 20 fps for 3 s, a face in 3 of 4 frames
  const r = s.read();
  assert.ok(Math.abs(r.fps - 20) < 0.5, `fps ${r.fps}`);
  assert.ok(Math.abs(r.foundPct - 75) < 3, `found ${r.foundPct}`);
});

test("RollingStats forgets frames older than the window", () => {
  const s = new RollingStats(1000);
  for (let i = 0; i < 10; i++) s.mark(i * 100, false);
  for (let i = 0; i < 12; i++) s.mark(5000 + i * 100, true);
  assert.equal(s.read().foundPct, 100);
});

// The prototype shows the camera in a <video> and draws only numbers on top. It must never copy, read, record or send the picture.
test("the face-mesh page never reads, records, stores or sends the camera picture", () => {
  const src = readFileSync(new URL("../src/facemesh/page.js", import.meta.url), "utf8").replace(/\/\/.*$/gm, "");
  for (const call of ["getImageData", "readPixels", "toDataURL", "toBlob", "drawImage", "texImage2D", "createImageBitmap", "captureStream",
    "MediaRecorder", "fetch(", "XMLHttpRequest", "WebSocket", "sendBeacon", "localStorage", "sessionStorage", "indexedDB", "navigator.clipboard"]) {
    assert.ok(!src.includes(call), `page.js must not use ${call}`);
  }
});

// --- step S2: the photo wrapped on the mesh ---------------------------------------------------------------------

test("flatten gives x, y for each of the 468 mesh points, and null without a full face", () => {
  const lm = face(0.25, 0.5);
  const flat = flatten(lm);
  assert.equal(flat.length, VERTEX_COUNT * 2);
  assert.ok(Math.abs(flat[2] - lm[1].x) < 1e-6 && Math.abs(flat[3] - lm[1].y) < 1e-6);
  assert.equal(flatten(null), null);
  assert.equal(flatten(lm.slice(0, 10)), null);
});

// a face of the right size at a given place, as a list of 478 points
const sized = (x, y, w, h) => Array.from({ length: 478 }, (_, i) => ({ x: x + w * ((i % 20) / 19), y: y + h * (Math.floor(i / 20) / 23), z: 0 }));

test("checkPhotoFaces accepts one big enough face and says why it refuses the others", () => {
  assert.equal(checkPhotoFaces([sized(0.2, 0.2, 0.5, 0.5)]).ok, true);
  assert.match(checkPhotoFaces([]).reason, /no face/);
  assert.match(checkPhotoFaces(null).reason, /no face/);
  assert.match(checkPhotoFaces([sized(0.1, 0.1, 0.4, 0.4), sized(0.5, 0.1, 0.4, 0.4)]).reason, /more than one face/);
  assert.match(checkPhotoFaces([sized(0.4, 0.4, 0.1, 0.1)]).reason, /too small/);
  assert.match(checkPhotoFaces([sized(0.7, 0.2, 0.5, 0.5)]).reason, /cut off/);
  assert.match(checkPhotoFaces([sized(0.2, -0.1, 0.5, 0.5)]).reason, /cut off/);
  assert.match(checkPhotoFaces([[{ x: 0.5, y: 0.5, z: 0 }]]).reason, /incomplete/);
});

// A stand-in for a WebGL context: it records the calls and answers like a graphics card with 4096-pixel textures.
function fakeGl() {
  const calls = [];
  const gl = new Proxy({}, {
    get(_t, name) {
      if (name === "calls") return calls;
      if (name === "getParameter") return () => 4096;
      if (name === "getShaderParameter" || name === "getProgramParameter") return () => true;
      if (typeof name === "string" && /^[A-Z_0-9]+$/.test(name)) return name;   // constants
      return (...args) => { calls.push([name, ...args]); return { id: calls.length }; };
    },
  });
  return gl;
}
const canvasWith = (gl) => ({ width: 640, height: 480, getContext: () => gl });
const photo = (w, h) => ({ naturalWidth: w, naturalHeight: h });

test("MeshCompositor draws nothing without a photo or without a face, and 898 triangles with both", () => {
  const gl = fakeGl();
  const c = new MeshCompositor(canvasWith(gl), mesh);
  assert.equal(c.hasPhoto, false);
  assert.equal(c.draw(face(0.3, 0.3)), 0);
  c.setPhoto(photo(720, 1280 > 4096 ? 4096 : 1280), face(0.2, 0.2));
  assert.equal(c.hasPhoto, true);
  assert.equal(c.draw(null), 0);
  assert.equal(c.draw(face(0.3, 0.3)), TRIANGLE_COUNT);
  assert.ok(gl.calls.some((k) => k[0] === "drawElements" && k[2] === TRIANGLE_COUNT * 3));
  c.clearPhoto();
  assert.equal(c.hasPhoto, false);
  assert.equal(c.draw(face(0.3, 0.3)), 0);
});

test("MeshCompositor refuses a photo with no complete face or too large for the graphics card", () => {
  const c = new MeshCompositor(canvasWith(fakeGl()), mesh);
  assert.throws(() => c.setPhoto(photo(720, 1280), null), /no complete face/);
  assert.throws(() => c.setPhoto(photo(5000, 1280), face(0.2, 0.2)), /too large/);
  assert.throws(() => c.setPhoto(photo(0, 0), face(0.2, 0.2)), /too large/);
  assert.equal(c.hasPhoto, false);
});

test("MeshCompositor says so when WebGL is not available", () => {
  assert.throws(() => new MeshCompositor({ getContext: () => null }, mesh), /WebGL is not available/);
});

// THE PRIVACY EXCEPTION (step S3): the live frame may go to the graphics card as a texture, in one method of the compositor,
// and nowhere else. Everything that could read it back, keep it or send it stays forbidden everywhere in the face-mesh page.
const FORBIDDEN = ["readPixels", "getImageData", "toDataURL", "toBlob", "drawImage", "createImageBitmap", "captureStream", "MediaRecorder",
  "ImageCapture", "fetch(", "XMLHttpRequest", "WebSocket", "sendBeacon", "localStorage", "sessionStorage", "indexedDB", "getUserMedia",
  "copyTexImage2D", "copyTexSubImage2D", "readBuffer", "framebufferTexture2D", "createFramebuffer"];
const code = (name) => readFileSync(new URL(`../src/facemesh/${name}`, import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

test("the compositor names the video only inside uploadCamera, which makes exactly one texture upload from it", () => {
  const src = code("compositor.js");
  const method = src.match(/uploadCamera\(video\) \{[\s\S]*?\n  \}/);
  assert.ok(method, "uploadCamera(video) is the one place the video is handled");
  assert.equal((method[0].match(/texImage2D/g) || []).length, 1);
  assert.ok(!/video/i.test(src.replace(method[0], "")), "the video is named nowhere else in compositor.js");
  assert.equal((src.match(/texImage2D/g) || []).length, 4, "photo, live frame, the empty placeholder, and the photo's head mask (S8): nothing else uploads");
  for (const call of FORBIDDEN) assert.ok(!src.includes(call), `compositor.js must not use ${call}`);
});

test("nothing else in the face-mesh page may read back, keep or send the camera picture", () => {
  for (const file of ["page.js", "mesh.js", "stabilize.js", "head.js"]) {
    const src = code(file);
    for (const call of [...FORBIDDEN.filter((c) => c !== "getUserMedia"), "texImage2D"]) assert.ok(!src.includes(call), `${file} must not use ${call}`);   // the page itself opens the camera
  }
});

// --- step S3: edge, eyes and mouth, colour --------------------------------------------------------------------------

test("edgeDepth: 0 on the outline of the mesh, growing inwards, every vertex reached", () => {
  const depth = edgeDepth(mesh.triangles);
  const outline = Array.from(depth).filter((d) => d === 0).length;
  assert.ok(outline >= 30 && outline <= 80, `${outline} outline vertices`);
  assert.ok(depth.every((d) => d >= 0 && Number.isFinite(d)), "a vertex was never reached");
  assert.ok(Math.max(...depth) >= 6 && Math.max(...depth) < 40, `deepest vertex ${Math.max(...depth)}`);
  // a vertex that sits on the outline never has a deeper neighbour-only edge: its depth is 0, its neighbours' at most 1
  for (let e = 0; e < mesh.edges.length; e += 2) assert.ok(Math.abs(depth[mesh.edges[e]] - depth[mesh.edges[e + 1]]) <= 1.0001);
});

test("keepMask marks 52 distinct vertices (both eyes and the inside of the mouth), and they are the library's own points", async () => {
  const mask = keepMask();
  assert.equal(mask.length, VERTEX_COUNT);
  assert.equal(Array.from(mask).filter((v) => v === 1).length, 52);
  assert.equal(new Set([...LEFT_EYE, ...RIGHT_EYE, ...INNER_LIPS]).size, 52);
  const { FaceLandmarker } = await import("@mediapipe/tasks-vision");
  const points = (c) => [...new Set(c.flatMap((e) => [e.start, e.end]))].sort((a, b) => a - b);
  assert.deepEqual([...LEFT_EYE].sort((a, b) => a - b), points(FaceLandmarker.FACE_LANDMARKS_LEFT_EYE));
  assert.deepEqual([...RIGHT_EYE].sort((a, b) => a - b), points(FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE));
  const lips = new Set(points(FaceLandmarker.FACE_LANDMARKS_LIPS));
  assert.equal(INNER_LIPS.length, 20);
  assert.ok(INNER_LIPS.every((v) => lips.has(v)), "the inner lip points are lip points");
});

test("the live frame goes to the graphics card only while colour matching is on and a camera is given", () => {
  const gl = fakeGl();
  const c = new MeshCompositor(canvasWith(gl), mesh);
  c.setPhoto(photo(720, 1280), face(0.2, 0.2));
  const live = { readyState: 4 };
  const uploadsOf = (what) => gl.calls.filter((k) => k[0] === "texImage2D" && k[6] === what).length;
  c.draw(face(0.3, 0.3), live);
  assert.equal(uploadsOf(live), 1, "match is on by default: one upload per drawn frame");
  c.draw(face(0.3, 0.3), live);
  assert.equal(uploadsOf(live), 2);
  c.draw(face(0.3, 0.3));
  assert.equal(uploadsOf(live), 2, "no camera given: nothing uploaded");
  c.setLook({ match: 0 });
  c.draw(face(0.3, 0.3), live);
  assert.equal(uploadsOf(live), 2, "colour match at 0: the live picture is not touched");
  c.setLook({ match: 0.5, keep: false });
  assert.deepEqual(c.look, { match: 0.5, keep: 0 });
  c.setLook({ match: 7 });
  assert.equal(c.look.match, 1, "match is limited to 0..1");
  c.draw(face(0.3, 0.3), { readyState: 0 });
  assert.equal(uploadsOf(live), 2);
});

// --- step S4: the photo fades with the face ---------------------------------------------------------------------------

test("the compositor fades the whole photo with an opacity, and draws nothing at 0", () => {
  const gl = fakeGl();
  const c = new MeshCompositor(canvasWith(gl), mesh);
  c.setPhoto(photo(720, 1280), face(0.2, 0.2));
  const opacities = () => gl.calls.filter((k) => k[0] === "uniform1f" && k[1] && k[1].id !== undefined).map((k) => k[2]);
  assert.equal(c.draw(face(0.3, 0.3), null, 0), 0, "opacity 0: nothing drawn");
  assert.equal(c.draw(face(0.3, 0.3), null, 0.001), 0, "an opacity too small to see is not drawn either");
  const before = gl.calls.filter((k) => k[0] === "drawElements").length;
  assert.equal(c.draw(face(0.3, 0.3), null, 0.4), TRIANGLE_COUNT);
  assert.equal(gl.calls.filter((k) => k[0] === "drawElements").length, before + 1);
  assert.ok(opacities().includes(0.4), "the opacity reaches the shader");
  c.draw(face(0.3, 0.3), null, 7);
  assert.ok(opacities().includes(1) && !opacities().includes(7), "the opacity is limited to 1");
  assert.equal(c.draw(face(0.3, 0.3)), TRIANGLE_COUNT, "left out: fully drawn, as before");
});
