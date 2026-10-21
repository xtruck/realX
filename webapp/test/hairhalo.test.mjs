// Gap #2, the hair halo: the photo's hair is widened and softened past its silhouette so less of the live user's longer hair shows.
// Pure rule (hairhalo.js) and source checks of the shader and the page; the shader was NOT run on a real driver or a webcam here.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HALO, haloAmount, haloPick, haloScale, haloWeights, withHalo } from "../src/facemesh/hairhalo.js";

const src = (name) => readFileSync(new URL(`../src/facemesh/${name}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const shaderHalo = () => { const c = src("compositor.js"); const a = c.indexOf("Gap #2, the hair halo"); const b = c.indexOf("float alpha = smoothstep(0.0, 1.0, v_fade) * (1.0 - keepAmt)"); assert.ok(a > 0 && b > a); return c.slice(a, b); };

const ring = (inner, outer) => [...Array(HALO.taps).fill(0).map((_, i) => ({ m: inner[i] ?? 0, w: HALO.innerWeight })), ...Array(HALO.taps).fill(0).map((_, i) => ({ m: outer[i] ?? 0, w: HALO.outerWeight }))];

test("haloAmount clamps and ignores garbage; 0 means off", () => {
  assert.equal(haloAmount(2), 1); assert.equal(haloAmount(-1), 0); assert.equal(haloAmount("x"), 0); assert.equal(haloAmount(NaN), 0); assert.equal(haloAmount(0.4), 0.4);
  assert.equal(haloScale(0), 0);
  assert.equal(haloScale(undefined), 0);
});

test("the reach grows with the slider and is a quarter of a face width at 100%", () => {
  assert.ok(haloScale(0.5) > 0 && haloScale(0.5) < haloScale(1));
  assert.ok(Math.abs(haloScale(1) * HALO.blur - HALO.reach) < 1e-9, "scale x the colour-match radius (0.12 face widths) = the reach");
  assert.ok(HALO.reach <= 0.3, "never more than a small part of the face width: it must not look like a wig");
});

test("a pixel with no head pixel round it gets no halo, at any amount", () => {
  const r = haloPick(ring([], []));
  assert.deepEqual(r, { cover: 0, index: -1 });
});

test("a head pixel on the inner ring covers fully, one only on the outer ring covers less (the edge fades)", () => {
  const inner = haloPick(ring([0, 0, 1], []));
  const outer = haloPick(ring([], [0, 0, 1]));
  assert.equal(inner.cover, 1); assert.equal(inner.index, 2);
  assert.ok(outer.cover > 0 && outer.cover <= HALO.outerWeight + 1e-9 && outer.cover < inner.cover);
  assert.equal(outer.index, HALO.taps + 2);
});

test("the colour is the nearest head pixel's: the best-scoring tap wins, a weak background-ish tap does not", () => {
  const r = haloPick(ring([0.3, 0, 0, 0, 1], [1, 1, 1]));
  assert.equal(r.index, 4, "the inner full-mask tap beats the outer ones");
  assert.equal(haloPick(ring([0.5, 0.5], [0.5])).cover, 0, "below the mask gate nothing is drawn");
});

test("the mask gate is the silhouette's own (0.62 to 0.92) and the weights follow the rule", () => {
  assert.equal(haloPick(ring([HALO.lo - 0.01], [])).cover, 0);
  assert.equal(haloPick(ring([HALO.hi + 0.01], [])).cover, 1);
  const w = haloWeights();
  assert.equal(w.length, 2 * HALO.taps);
  assert.ok(w.slice(0, HALO.taps).every((x) => x === HALO.innerWeight) && w.slice(HALO.taps).every((x) => x === HALO.outerWeight));
});

test("the halo only ever adds: withHalo is never below the silhouette's own opacity, and is the old value at 0", () => {
  for (const head of [0, 0.3, 1]) for (const cover of [0, 0.5, 1]) assert.ok(withHalo(head, cover, 0.5) >= head);
  assert.equal(withHalo(0, 1, 0), 0);
  assert.equal(withHalo(0.2, 0.8, 1), 0.8);
});

test("shader: 16 taps in two rings, the same numbers as hairhalo.js, only above the nose and outside the silhouette", () => {
  const s = shaderHalo();
  assert.ok(s.includes("for (int k = 0; k < 16; k++)"));
  assert.equal(HALO.taps * 2, 16);
  assert.ok(s.includes(`smoothstep(${HALO.lo.toFixed(2)}, ${HALO.hi.toFixed(2)}, texture2D(u_mask`), "mask gate = HALO.lo/hi");
  assert.ok(s.includes(`k < 8 ? ${HALO.inner.toFixed(1)} : 1.0`), "inner ring at HALO.inner of the radius");
  assert.ok(s.includes(`k < 8 ? ${HALO.innerWeight.toFixed(1)} : ${HALO.outerWeight.toFixed(1)}`), "weights = HALO.innerWeight / outerWeight");
  assert.ok(s.includes(String(2 * Math.PI / HALO.taps).slice(0, 7)), "45 degree steps");
  assert.ok(s.includes("u_halo > 0.0") && s.includes("head < 0.999") && s.includes("v_uv.y < u_pp[1].y"));
  assert.ok(s.includes("* u_rp"), "the radius follows the face size (u_rp)");
  assert.ok(s.includes("smoothstep(0.06, 0.14, tch)") && s.includes("smoothstep(0.38, 0.58, lum(tc))"), "a bright colourless tap (backdrop) is never used");
  assert.ok(s.includes("if (cover > head)"), "only adds");
});

test("privacy: the halo block samples only the photo and its mask, never the camera", () => {
  const s = shaderHalo();
  assert.ok(!/u_cam|u_seam|v_scr/.test(s), "no camera / live-mask read in the halo");
  const c = src("compositor.js").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  assert.ok(!/readPixels|getImageData|toDataURL|createImageBitmap/.test(c), "no read-back anywhere in the compositor");
  assert.ok(!/readPixels|getImageData|toDataURL/.test(src("hairhalo.js")));
});

test("compositor and page: uniform declared and set, 0 when the head is off, slider wired, default 50%", () => {
  const c = src("compositor.js"), p = src("page.js"), h = src("facemesh.html");
  assert.ok(c.includes("uniform float u_halo;") && c.includes('"u_halo"'));
  assert.ok(c.includes("gl.uniform1f(this.uni.u_halo, head ? haloScale(this.hairHalo) : 0)"));
  assert.ok(c.includes("setHairHalo(v) { this.hairHalo = haloAmount(v); }") && c.includes("this.hairHalo = HALO.defaultAmount"));
  assert.ok(p.includes('$("hairHalo")') && p.includes("compositor.setHairHalo(") );
  assert.ok(/id="hairHalo"[^>]*value="50"/.test(h) && HALO.defaultAmount === 0.5);
});

test("per-frame cost: no new texture upload, buffer or program for the halo", () => {
  const c = src("compositor.js");
  assert.equal((c.match(/hairHalo/g) || []).length, 3, "only the amount is kept and passed as one uniform");
  assert.ok(!/texImage2D[^;]*halo/i.test(c));
});
