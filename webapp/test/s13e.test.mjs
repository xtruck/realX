// S13e: keep the mask only where it holds. Pure functions of the landmarks; nothing here touches a camera, a page or WebGL.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LIMITS, MaskConfidence, fade, headAngles, holdFactors, mouthOpening, outsideShare } from "../src/facemesh/confidence.js";

// a synthetic head: cheeks 234/454 (width 0.2), forehead 10, chin 152, mouth 13/14, and the rest on the nose. yaw/pitch in degrees.
function head({ yaw = 0, pitch = 0, gap = 0.01, cx = 0.5, cy = 0.5, fill = null } = {}) {
  const lm = Array.from({ length: 478 }, () => ({ x: cx, y: cy, z: 0 }));
  const half = 0.1, ry = yaw * Math.PI / 180, rp = pitch * Math.PI / 180;
  lm[234] = { x: cx - half * Math.cos(ry), y: cy, z: -half * Math.sin(ry) };
  lm[454] = { x: cx + half * Math.cos(ry), y: cy, z: half * Math.sin(ry) };
  lm[10] = { x: cx, y: cy - 0.14 * Math.cos(rp), z: -0.14 * Math.sin(rp) };
  lm[152] = { x: cx, y: cy + 0.14 * Math.cos(rp), z: 0.14 * Math.sin(rp) };
  lm[13] = { x: cx, y: cy + 0.06 - gap / 2, z: 0 };
  lm[14] = { x: cx, y: cy + 0.06 + gap / 2, z: 0 };
  lm[1] = { x: cx + 0.01, y: cy, z: -0.05 };
  if (fill) for (let i = 0; i < 478; i++) if (![234, 454, 10, 152, 13, 14, 1].includes(i)) lm[i] = fill(i);
  return lm;
}
const settle = (c, lm, n = 60) => { let r; for (let i = 0; i < n; i++) r = c.update(lm); return r; };

test("angles come out of the landmarks", () => {
  const a = headAngles(head({ yaw: 30, pitch: 10 }));
  assert.ok(Math.abs(a.yaw - 30) < 0.5 && Math.abs(a.pitch - 10) < 0.5 && a.roll < 0.5);
  assert.ok(Math.abs(headAngles(head({ yaw: -30 })).yaw - 30) < 0.5);   // either way round
  assert.equal(headAngles(head({ yaw: 0 })).yaw, 0);
});

test("the fade is full up to 25 degrees, gone by 55, and monotone in between", () => {
  assert.equal(fade(0, LIMITS.full, LIMITS.none), 1);
  assert.equal(fade(25, LIMITS.full, LIMITS.none), 1);
  assert.equal(fade(55, LIMITS.full, LIMITS.none), 0);
  let prev = 1;
  for (let a = 0; a <= 90; a += 1) { const v = fade(a, LIMITS.full, LIMITS.none); assert.ok(v <= prev + 1e-12); prev = v; }
  // settled confidence falls monotonically with yaw and with pitch; the ring is never above the face and leaves earlier
  let pc = 2, pr = 2;
  for (let a = 0; a <= 80; a += 5) {
    const r = settle(new MaskConfidence(), head({ yaw: a }));
    assert.ok(r.confidence <= pc + 1e-9 && r.ring <= r.confidence + 1e-9 && r.ring <= pr + 1e-9, `yaw ${a}`);
    pc = r.confidence; pr = r.ring;
  }
  assert.equal(settle(new MaskConfidence(), head({ yaw: 0 })).confidence, 1);
  assert.equal(settle(new MaskConfidence(), head({ yaw: 60 })).confidence, 0);
  const mid = settle(new MaskConfidence(), head({ yaw: 40 }));
  assert.ok(mid.confidence > 0.1 && mid.confidence < 0.9);
  assert.equal(mid.ring < mid.confidence, true);                                    // the head ring goes first
  assert.equal(settle(new MaskConfidence(), head({ yaw: 45 })).ring, 0);
  assert.ok(settle(new MaskConfidence(), head({ yaw: 45 })).confidence > 0);       // while the face is still there
  assert.ok(settle(new MaskConfidence(), head({ pitch: 45 })).confidence < 1);
  assert.equal(settle(new MaskConfidence(), head({ pitch: 70 })).confidence, 0);
});

test("hysteresis: noise around a threshold does not flicker", () => {
  const c = new MaskConfidence();
  settle(c, head({ yaw: 38 }));
  const seen = [];
  for (let i = 0; i < 200; i++) seen.push(c.update(head({ yaw: 38 + (i % 2 ? 0.6 : -0.6) })).confidence);
  assert.equal(new Set(seen).size, 1, "constant while the input wobbles by a degree");
  // it still follows a real change, and returns more gently than it leaves
  const down = c.update(head({ yaw: 60 })).confidence;
  assert.ok(down < seen[0]);
  const c2 = new MaskConfidence(); settle(c2, head({ yaw: 60 }));
  const up = c2.update(head({ yaw: 0 })).confidence;
  assert.ok(up > 0 && up < 0.2, "comes back over several frames");
  assert.equal(settle(c2, head({ yaw: 0 })).confidence, 1);
});

test("missing or NaN landmarks give 0 and never throw or return NaN", () => {
  const bad = [null, undefined, [], {}, "x", 5, Array(10).fill(null), Array.from({ length: 478 }, () => ({ x: NaN, y: NaN, z: NaN })),
    Array.from({ length: 478 }, () => null), head().map((p, i) => (i === 234 ? { x: NaN, y: 0.5, z: 0 } : p)), head().slice(0, 300)];
  for (const lm of bad) {
    const c = new MaskConfidence(); settle(c, head());
    let r;
    assert.doesNotThrow(() => { r = c.update(lm, NaN); });
    assert.equal(r.confidence, 0); assert.equal(r.ring, 0);
    for (const v of [headAngles(lm), mouthOpening(lm), outsideShare(lm)]) assert.ok(v === null || typeof v === "object" || Number.isFinite(v));
  }
  // NaN z or aspect alone is tolerated (z treated as flat)
  const nz = head(); nz[1].z = NaN;
  assert.ok(Number.isFinite(new MaskConfidence().update(nz, undefined).confidence));
  // after a loss it returns gently, not in one frame
  const c = new MaskConfidence(); settle(c, head()); c.update(null);
  assert.ok(c.update(head()).confidence < 0.2);
  for (const h of [NaN, undefined, -1, 5, "x"]) for (const cc of [null, {}, { confidence: NaN, ring: NaN }]) {
    const f = holdFactors(h, cc); assert.ok(Number.isFinite(f.photo) && Number.isFinite(f.ring) && f.photo >= 0 && f.photo <= 1 && f.ring >= 0 && f.ring <= 1);
  }
});

test("an open mouth lowers it only past a limit", () => {
  const at = (gap) => settle(new MaskConfidence(), head({ gap })).confidence;
  assert.equal(at(0.005), 1);
  assert.equal(at(0.03), 1);                                  // an ordinary talking mouth (gap 0.1 of the face height = 0.028)
  assert.equal(at(LIMITS.mouthFrom * 0.28), 1);               // right at the limit: still full
  const wide = at(0.28 * 0.25);                              // a very wide mouth
  assert.ok(wide < 1 && wide >= LIMITS.mouthFloor - 1e-9);
  assert.ok(at(0.28 * 0.5) <= wide);
  assert.ok(Math.abs(mouthOpening(head({ gap: 0.028 })) - 0.1) < 1e-9);
});

test("a face partly out of frame loses the photo", () => {
  const inside = settle(new MaskConfidence(), head()).confidence;
  const half = settle(new MaskConfidence(), head({ cx: 0.0 })).confidence;       // fill the cloud so points leave the frame
  const spread = (i) => ({ x: i < 234 ? -0.2 : 0.5, y: 0.5, z: 0 });
  const out = settle(new MaskConfidence(), head({ fill: spread })).confidence;
  assert.equal(inside, 1);
  assert.ok(half <= 1 && out < 0.5, `out ${out}`);
  assert.ok(outsideShare(head({ fill: spread })) > 0.4);
  assert.equal(outsideShare(head()), 0);
});

test("a jump of the face shape from one frame to the next lowers it", () => {
  const c = new MaskConfidence(); settle(c, head());
  const jumpy = head({ fill: () => ({ x: 0.5, y: 0.5, z: 0 }) });
  jumpy[6] = { x: 0.9, y: 0.1, z: 0 }; jumpy[1] = { x: 0.3, y: 0.7, z: -0.05 }; jumpy[33] = { x: 0.9, y: 0.9, z: 0 };
  assert.ok(c.update(jumpy).confidence < 1);
});

test("the hold strength: 0 is the old behaviour exactly, 100 follows the confidence, the ring leaves first", () => {
  assert.deepEqual(holdFactors(0, { confidence: 0, ring: 0 }), { photo: 1, ring: 1 });
  assert.deepEqual(holdFactors(1, { confidence: 1, ring: 1 }), { photo: 1, ring: 1 });
  assert.equal(holdFactors(1, { confidence: 0, ring: 0 }).photo, 0);
  assert.equal(holdFactors(0.5, { confidence: 0, ring: 0 }).photo, 0.5);
  const f = holdFactors(1, { confidence: 0.6, ring: 0.3 });
  assert.ok(Math.abs(f.photo * f.ring - 0.3) < 1e-9 && f.ring < 1);
});

test("wiring: the slider exists, defaults on, and the compositor and label path stay intact at confidence 0", () => {
  const html = readFileSync(new URL("../src/facemesh/facemesh.html", import.meta.url), "utf8");
  assert.match(html, /Hold the mask when turning <input id="hold" type="range" min="0" max="100" value="100"/);
  const page = readFileSync(new URL("../src/facemesh/page.js", import.meta.url), "utf8");
  assert.match(page, /holdFactors\(look\.hold \/ 100, conf\)/);
  // the guard and the consent checks come before the draw call, so no confidence value can skip them
  const draw = page.indexOf("compositor.draw(");
  assert.ok(page.indexOf("consent.valid()") < draw && page.indexOf("gate.label") < draw);
  const comp = readFileSync(new URL("../src/facemesh/compositor.js", import.meta.url), "utf8");
  assert.match(comp, /opacity > 0\.002/);       // opacity 0 draws nothing (the live picture); the DOM label is not drawn by the compositor
});
