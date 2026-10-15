import test from "node:test";
import assert from "node:assert/strict";
import { faceToExpressions } from "../src/blend.js";
import { applyExpressions } from "../src/express.js";
import { OneEuro } from "../src/oneeuro.js";
import { EXPRESSIONS } from "../src/skeleton.js";

// a stand-in for a VRM expressionManager that remembers the last value of each name
const fakeManager = () => {
  const values = {};
  return { values, setValue(name, v) { values[name] = v; } };
};

test("the requested MediaPipe blendshapes drive the matching VRM expressions", () => {
  const m = (b) => faceToExpressions(b, false);
  const blinkL = m({ eyeBlinkLeft: 1, eyeBlinkRight: 0 });
  assert.ok(blinkL.blinkLeft > 0.99 && blinkL.blinkRight === 0, "eyeBlinkLeft -> blinkLeft");
  const blinkR = m({ eyeBlinkLeft: 0, eyeBlinkRight: 1 });
  assert.ok(blinkR.blinkRight > 0.99 && blinkR.blinkLeft === 0, "eyeBlinkRight -> blinkRight");
  assert.ok(m({ jawOpen: 0.8 }).aa > 0.7, "jawOpen -> aa");
  assert.ok(m({ mouthPucker: 1 }).ou > 0.7, "mouthPucker -> ou");
  assert.ok(m({ mouthFunnel: 1, jawOpen: 0.6 }).oh > 0.4, "mouthFunnel -> oh");
  assert.ok(m({ mouthSmileLeft: 0.8, mouthSmileRight: 0.8 }).happy > 0.8, "mouthSmile -> happy");
  assert.ok(m({ browDownLeft: 0.7, browDownRight: 0.7 }).angry > 0.9, "browDown -> angry");
  assert.ok(m({ browInnerUp: 0.8 }).surprised > 0.9, "browInnerUp -> surprised");
});

test("a neutral face gives every expression at zero, and every score stays between 0 and 1", () => {
  const rest = faceToExpressions({}, false);
  for (const name of EXPRESSIONS) assert.equal(rest[name], 0, name);
  const wild = faceToExpressions(Object.fromEntries(["eyeBlinkLeft", "eyeBlinkRight", "jawOpen", "mouthPucker", "mouthFunnel",
    "mouthSmileLeft", "mouthSmileRight", "browDownLeft", "browDownRight", "browInnerUp"].map((k) => [k, 5])), false);
  for (const name of EXPRESSIONS) assert.ok(wild[name] >= 0 && wild[name] <= 1, `${name}=${wild[name]}`);
});

test("one brow pulled down is half an angry face, and the mirror does not change symmetric brows", () => {
  const half = faceToExpressions({ browDownLeft: 0.8, browDownRight: 0 }, false).angry;
  const full = faceToExpressions({ browDownLeft: 0.8, browDownRight: 0.8 }, false).angry;
  assert.ok(half > 0 && half < full);
  assert.equal(faceToExpressions({ browDownLeft: 0.5, browDownRight: 0.5 }, true).angry, faceToExpressions({ browDownLeft: 0.5, browDownRight: 0.5 }, false).angry);
});

test("a tracked face sets every expression on the manager, including angry and surprised", () => {
  const em = fakeManager();
  applyExpressions(em, { blink: 0.2, blinkLeft: 0.1, aa: 0.5, happy: 0.3, angry: 0.6, surprised: 0.4, oh: 0.1 }, { live: true, faceSeen: true });
  assert.deepEqual(Object.keys(em.values).sort(), ["aa", "angry", "blink", "blinkLeft", "blinkRight", "ee", "happy", "ih", "oh", "ou", "surprised"]);
  assert.equal(em.values.angry, 0.6);
  assert.equal(em.values.surprised, 0.4);
  assert.equal(em.values.aa, 0.5);
  assert.equal(em.values.blink, 0.2);
});

test("with no face in view the idle blink keeps the eyes from staring; with a face it does not interfere", () => {
  const away = fakeManager();
  applyExpressions(away, { blink: 0 }, { live: true, faceSeen: false, idleBlink: 0.7 });
  assert.equal(away.values.blink, 0.7);
  const seen = fakeManager();
  applyExpressions(seen, { blink: 0 }, { live: true, faceSeen: true, idleBlink: 0.7 });
  assert.equal(seen.values.blink, 0);
});

test("a gesture can raise an expression but never lower a tracked one", () => {
  const raised = fakeManager();
  applyExpressions(raised, { happy: 0.1, surprised: 0.1 }, { live: true, faceSeen: true, boost: { happy: 0.8, surprised: 1 } });
  assert.equal(raised.values.happy, 0.8);
  assert.equal(raised.values.surprised, 1);
  const kept = fakeManager();
  applyExpressions(kept, { happy: 0.9, surprised: 0.9 }, { live: true, faceSeen: true, boost: { happy: 0.2, surprised: 0.2 } });
  assert.equal(kept.values.happy, 0.9);
  assert.equal(kept.values.surprised, 0.9);
});

test("values are clamped to 0..1 before they reach the manager", () => {
  const em = fakeManager();
  applyExpressions(em, { happy: 3, angry: 2, surprised: -1, oh: 9 }, { live: true, faceSeen: true });
  assert.equal(em.values.happy, 1);
  assert.equal(em.values.angry, 1);
  assert.equal(em.values.surprised, 0);
  assert.equal(em.values.oh, 1);
});

test("when the character runs its own idle animation nothing from the tracked face stays stuck", () => {
  const em = fakeManager();
  applyExpressions(em, { angry: 1, surprised: 1 }, { live: true, faceSeen: true });
  applyExpressions(em, { angry: 1, surprised: 1 }, { live: false, idleBlink: 0.3, smile: 0.5, boost: { oh: 0.4 } });
  assert.equal(em.values.angry, 0);
  assert.equal(em.values.surprised, 0);
  assert.equal(em.values.blink, 0.3);
  assert.equal(em.values.oh, 0.4);
  assert.ok(Math.abs(em.values.happy - 0.45) < 1e-9);
});

// a deterministic stand-in for webcam noise
const noise = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };
const std = (a) => { const m = a.reduce((s, v) => s + v, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length); };

test("the One-Euro filter used for expressions removes most of the jitter on a still face", () => {
  const f = new OneEuro(2, 0.5);                 // the values body.js uses for expression weights
  const raw = [], out = [];
  for (let i = 0; i < 300; i++) { const v = 0.4 + 0.05 * noise(i); raw.push(v); out.push(f.filter(v, i / 30)); }
  assert.ok(std(out.slice(30)) < std(raw.slice(30)) * 0.6, `raw ${std(raw)}, filtered ${std(out)}`);
});

test("the One-Euro filter follows a real expression change within a few frames", () => {
  const f = new OneEuro(2, 0.5);
  for (let i = 0; i < 60; i++) f.filter(0, i / 30);
  let reached = -1;
  for (let i = 60; i < 120; i++) { const v = f.filter(1, i / 30); if (reached < 0 && v > 0.9) reached = i - 60; }
  assert.ok(reached >= 0 && reached <= 8, `took ${reached} frames`);
});
