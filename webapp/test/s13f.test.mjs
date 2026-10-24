// S13f: "Soft edges", the model-free feathered band along the mesh outline. Pure geometry and source checks; the shader was not run on a real driver.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FEATHER, edgeRate, featherBand } from "../src/facemesh/edgefeather.js";
import { SEAM, seamRate } from "../src/facemesh/seams.js";

const src = (name) => readFileSync(new URL(`../src/facemesh/${name}`, import.meta.url), "utf8");
const code = (name) => src(name).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

// a circle of n points in picture coordinates (aspect 1), counter-clockwise or clockwise
function circle(n, r = 0.2, cw = false) {
  const out = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { const a = (cw ? -1 : 1) * (i / n) * 2 * Math.PI; out[i * 2] = 0.5 + r * Math.cos(a); out[i * 2 + 1] = 0.5 + r * Math.sin(a); }
  return out;
}
const dist = (p, i) => Math.hypot(p[i * 2] - 0.5, p[i * 2 + 1] - 0.5);

test("the band has one ring per level, moving outwards, with alpha falling to nothing", () => {
  const n = 36, b = featherBand(circle(n), 1, 0.4);
  assert.equal(b.vertices, FEATHER.levels.length * n);
  for (let i = 0; i < n; i++) {
    const r = FEATHER.levels.map((_, l) => dist(b.positions, l * n + i));
    assert.ok(r[0] < 0.2 && r[1] > 0.2 && r[2] > r[1], `ring radii must grow past the outline: ${r}`);
  }
  assert.equal(b.alphas[0], 1);
  assert.ok(b.alphas[n] > 0 && b.alphas[n] < 1);
  assert.equal(b.alphas[2 * n], 0);
});

test("outwards is outwards whichever way the outline is wound", () => {
  for (const cw of [false, true]) {
    const n = 24, b = featherBand(circle(n, 0.2, cw), 1, 0.4);
    for (let i = 0; i < n; i++) assert.ok(dist(b.positions, 2 * n + i) > 0.2, `cw=${cw} point ${i}`);
  }
});

test("offsets are equal in x and y on a wide picture (aspect 16:9)", () => {
  const aspect = 16 / 9, n = 36, pts = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI; pts[i * 2] = 0.5 + (0.1 / aspect) * Math.cos(a); pts[i * 2 + 1] = 0.5 + 0.1 * Math.sin(a); }
  const b = featherBand(pts, aspect, 0.2);
  for (let i = 0; i < n; i++) {
    const o = 2 * n + i;
    const dx = (b.positions[o * 2] - 0.5) * aspect, dy = b.positions[o * 2 + 1] - 0.5;
    assert.ok(Math.abs(Math.hypot(dx, dy) - (0.1 + FEATHER.levels[2].offset * 0.2)) < 1e-3, `point ${i} is a true circle in screen units`);
  }
});

test("triangles cover every gap between neighbouring levels and stay inside the vertex range", () => {
  const n = 12, b = featherBand(circle(n), 1, 0.4);
  assert.equal(b.indices.length, (FEATHER.levels.length - 1) * n * 6);
  assert.ok(b.indices.every((v) => v < b.vertices));
  const used = new Set(b.indices);
  assert.equal(used.size, b.vertices, "no vertex is left out");
});

test("strength scales alpha, zero (or a bad outline) gives nothing", () => {
  const half = featherBand(circle(12), 1, 0.4, 0.5);
  assert.equal(half.alphas[0], 0.5);
  assert.equal(featherBand(circle(12), 1, 0.4, 0), null);
  assert.equal(featherBand(circle(12), 1, 0, 1), null);
  assert.equal(featherBand(new Float32Array(4), 1, 0.4), null);
  assert.equal(featherBand(null, 1, 0.4), null);
  const bad = circle(12); bad[3] = NaN;
  assert.equal(featherBand(bad, 1, 0.4), null);
});

test("a sharp corner cannot throw a vertex far away (mitre limit)", () => {
  const spike = Float32Array.of(0.4, 0.5, 0.6, 0.5, 0.5, 0.5001, 0.5, 0.9);   // a near-degenerate spike
  const b = featherBand(spike, 1, 0.2);
  for (let i = 0; i < b.positions.length; i++) assert.ok(Math.abs(b.positions[i]) < 2, "all vertices stay near the picture");
  const n = 4;
  for (let i = 0; i < n; i++) assert.ok(Math.hypot(b.positions[(2 * n + i) * 2] - spike[i * 2], b.positions[(2 * n + i) * 2 + 1] - spike[i * 2 + 1]) <= FEATHER.levels[2].offset * 0.2 * FEATHER.miter + 1e-6);
});

test("with Soft edges on, the segmenter rate is capped; off, it is left alone", () => {
  assert.equal(edgeRate(5, true), FEATHER.maxHz);
  assert.equal(edgeRate(1, true), 1);
  assert.equal(edgeRate(5, false), 5);
  assert.equal(edgeRate(SEAM.rateHz, true), FEATHER.maxHz);
  assert.ok(FEATHER.maxHz >= SEAM.minHz && FEATHER.maxHz < SEAM.rateHz);
  assert.equal(seamRate("2"), 2);
});

test("it is off by default and wired in the page, the compositor and the html", () => {
  const page = code("page.js"), comp = code("compositor.js"), html = src("facemesh.html");
  assert.match(page, /let softOn = false/);
  assert.match(page, /setSoftEdges\(softOn \? 1 : 0\)/);
  assert.match(page, /edgeRate\(seamHz, softOn\)/);
  assert.match(html, /<button id="softBtn"[^>]*aria-pressed="false"/);
  assert.match(comp, /this\.feather = \{ strength: 0,/);
  const draw = comp.indexOf("this.featherDrawn = this._drawFeather"), seam = comp.indexOf("this.seamDrawn = this._drawSeam");
  assert.ok(draw > 0 && draw < seam, "drawn first, under the seam patch and the photo's layers");
});

test("privacy: no read-back, no camera, no model in the soft-edge path", () => {
  const feather = code("edgefeather.js");
  for (const bad of ["readPixels", "getImageData", "getAsUint8Array", "getAsFloat32Array", "toDataURL", "getUserMedia", "ImageSegmenter", "FaceLandmarker", "document", "canvas"]) {
    assert.ok(!feather.includes(bad), `edgefeather.js must not mention ${bad}`);
  }
  const comp = src("compositor.js");
  const fn = comp.slice(comp.indexOf("_drawFeather(opacity"), comp.indexOf("/** S13c: take the segmenter"));
  assert.ok(fn.length > 100 && !/readPixels|uploadCamera|texImage2D|TEXTURE1\b/.test(fn), "the draw touches only the photo texture and the mesh");
  const frag = comp.slice(comp.indexOf("const FEATHER_FRAG"), comp.indexOf("export class MeshCompositor"));
  assert.ok(!frag.includes("u_cam") && !frag.includes("u_seam"), "the shader reads no camera and no mask");
});

test("every triangle of the band is a real triangle (no collapsed ones)", () => {
  const b = featherBand(circle(12), 1, 0.4);
  for (let t = 0; t < b.indices.length; t += 3) {
    const s = new Set([b.indices[t], b.indices[t + 1], b.indices[t + 2]]);
    assert.equal(s.size, 3, `triangle ${t / 3} is degenerate`);
  }
});
