// S14: seam work for the body puppet (feathered edge, neck thinning, light match to the head). Source checks on the shader plus a
// fake-GL check of what _drawLayer sends. The look itself was never seen (no real webcam, no screenshot).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MeshCompositor } from "../src/facemesh/compositor.js";

const src = readFileSync(new URL("../src/facemesh/compositor.js", import.meta.url), "utf8");
const start = src.indexOf("// ---- S14 join"), end = src.indexOf("// ---- end S14 join");
const block = src.slice(start, end);

test("the S14 block is small, delimited and gated by u_join", () => {
  assert.ok(start > 0 && end > start);
  assert.ok(block.split("\n").length < 25);
  assert.match(block, /if \(u_join > 0\.0\)/);
});

test("the shader feathers the mask, thins the neck line and matches light on the GPU", () => {
  assert.match(block, /1\. feathered edge/); assert.match(block, /2\. neck line/); assert.match(block, /3\. light match/);
  assert.match(block, /smoothstep\(0\.1, 0\.9, soft\)/);                  // a wider ramp than the hard 0.35-0.65
  assert.match(block, /mix\(0\.6, 1\.0, nf\)/);                           // the neck line never thins below 60%
  assert.match(block, /clamp\(live \/ max\(ref, 0\.05\), 0\.85, 1\.15\)/); // the light match is bounded
  assert.match(block, /spotJ\(u_cam, u_lp\[4\]/);                         // measured on the live chin and cheeks, in the shader
  assert.match(block, /nearChin \* u_join/);                              // fades with distance below the chin
});

test("the join costs near zero: a fixed handful of taps, no loops, no read-back", () => {
  assert.equal((block.match(/texture2D\(/g) || []).length, 4);            // 4 extra mask taps; the rest go through spotJ (3 taps x 6)
  assert.ok(!/for\s*\(/.test(block));
  assert.ok(!/\.(readPixels|getImageData)\(/.test(src));
});

test("with join 0 the output is the old hard-edged picture", () => {
  const frag = src.slice(src.indexOf("const HAIR_FRAG"), src.indexOf("// Step S10c"));
  assert.match(frag, /float a = smoothstep\(0\.35, 0\.65, m\);/);
  assert.match(frag, /a \*= inside \* u_opacity;\s*\n\s*gl_FragColor = vec4\(col \* a, a\);/);
});

function fakeGl() {
  const calls = [];
  const gl = new Proxy({}, { get: (_, k) => (k === "calls" ? calls : (...a) => { calls.push([k, ...a]); return null; }) });
  return gl;
}
function compositor(live) {
  const c = Object.create(MeshCompositor.prototype);
  c.gl = fakeGl(); c.hairProgram = {}; c.hairLoc = { pos: 0, uv: 1 };
  c.hairUni = Object.fromEntries(["u_photo", "u_hair", "u_opacity", "u_cam", "u_join", "u_headOn", "u_texel", "u_lp", "u_pp", "u_jr"].map((n) => [n, n]));
  c.point = () => {}; c.photo = {}; c.cheekR = [0.02, 0.03]; c.photoSpots = new Float32Array(10);
  c.bodyJoin = 0.7; c.joinLive = live; c.joinHead = true; c.joinSpots = new Float32Array(10);
  const layer = { unit: 4, uvBuffer: {}, posBuffer: {}, indexBuffer: {}, maskTex: {}, triangles: 2, halo: new Float32Array(4), haloOn: false, positions: new Float32Array(4), texel: [0.01, 0.01] };
  c.body = layer; c.hair = { ...layer, unit: 3 };
  return c;
}
const joinSent = (c, layer) => { c.gl.calls.length = 0; c._drawLayer(layer, 1); const j = c.gl.calls.find((x) => x[0] === "uniform1f" && x[1] === "u_join"); return j[2]; };

test("only the body layer gets the join, and only with a live frame", () => {
  const c = compositor(true);
  assert.equal(joinSent(c, c.body), 0.7);
  assert.equal(joinSent(c, c.hair), 0);                                    // the hair layer is untouched
  const d = compositor(false);
  assert.equal(joinSent(d, d.body), 0);                                    // no camera frame uploaded: the old picture
  d.joinLive = true; d.bodyJoin = 0; assert.equal(joinSent(d, d.body), 0); // slider at 0: the old picture
});

test("setBodyJoin clamps and the default is 0.7", () => {
  const c = Object.create(MeshCompositor.prototype);
  c.setBodyJoin(3); assert.equal(c.bodyJoin, 1);
  c.setBodyJoin("x"); assert.equal(c.bodyJoin, 0);
  assert.match(src, /this\.bodyJoin = 0\.7;/);
});
