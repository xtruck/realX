// S13d: the photo-quality advice. Pure scoring with made-up numbers; thresholds are first guesses, never tuned on real photos.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { foreheadHairShare, laplacianVariance, photoQuality } from "../src/facemesh/photoquality.js";

// A frontal face of width w centred at (0.5, 0.5) in a W x H picture, 478 points (iris included). Options bend single things.
function face({ w = 0.4, yawZ = 0, tilt = 0, eyeOpen = 0.3, iris = 0.5, mouth = 0.02 } = {}) {
  const lm = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  const set = (i, x, y, z = 0) => { lm[i] = { x, y, z }; };
  set(234, 0.5 - w / 2, 0.5, -yawZ * w / 2); set(454, 0.5 + w / 2, 0.5, yawZ * w / 2);
  set(10, 0.5, 0.5 - w * 0.7); set(152, 0.5, 0.5 + w * 0.7); set(1, 0.5, 0.52); set(9, 0.5, 0.5 - w * 0.4);
  set(109, 0.5 - w * 0.3, 0.5 - w * 0.65); set(338, 0.5 + w * 0.3, 0.5 - w * 0.65);
  const ew = w * 0.2;
  const eye = (a, b, up, down, ir, cx) => {
    const y = 0.45 + (cx > 0.5 ? tilt : 0);
    set(a, cx - ew / 2, y); set(b, cx + ew / 2, y);
    set(up, cx, y - ew * eyeOpen / 2); set(down, cx, y + ew * eyeOpen / 2);
    set(ir, cx - ew / 2 + ew * iris, y);
  };
  eye(33, 133, 159, 145, 468, 0.5 - w * 0.25);
  eye(362, 263, 386, 374, 473, 0.5 + w * 0.25);
  set(61, 0.5 - w * 0.2, 0.7); set(291, 0.5 + w * 0.2, 0.7);
  set(13, 0.5, 0.7 - w * 0.4 * mouth); set(14, 0.5, 0.7 + w * 0.4 * mouth);
  set(205, 0.5 - w * 0.35, 0.58); set(425, 0.5 + w * 0.35, 0.58);
  return lm;
}

// a luminance sample with a texture whose contrast is `detail`, and left/right brightness
function sample({ W = 200, H = 200, left = 140, right = 140, detail = 40 } = {}) {
  const data = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const base = x < W / 2 ? left : right;
    data[y * W + x] = Math.max(0, Math.min(255, base + (((x * 7 + y * 13) % 5) - 2) * detail / 2));
  }
  return { width: W, height: H, data };
}
const GOOD_EXTRA = { imageWidth: 1000, imageHeight: 1000, faceCount: 1, glassesShare: 0, foreheadHair: 0 };
const level = (r, id) => r.checks.find((c) => c.id === id).level;
const run = (lm, s = sample(), extra = GOOD_EXTRA) => photoQuality(lm, s, extra);

test("a good photo passes every check and scores 100", () => {
  const r = run(face());
  for (const c of r.checks) assert.equal(c.level, "pass", `${c.id}: ${c.message}`);
  assert.equal(r.score, 100);
  assert.equal(r.worst, "pass");
  assert.ok(r.checks.every((c) => typeof c.message === "string" && c.message.length > 0));
});

test("face size in the picture: pass, warn, fail", () => {
  assert.equal(level(run(face({ w: 0.4 })), "size"), "pass");
  assert.equal(level(run(face({ w: 0.2 })), "size"), "warn");
  assert.equal(level(run(face({ w: 0.1 })), "size"), "fail");
});

test("face resolution in pixels: pass and fail", () => {
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, imageWidth: 1000 }), "resolution"), "pass");
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, imageWidth: 300 }), "resolution"), "fail");
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, imageWidth: 550 }), "resolution"), "warn");
});

test("frontal pose from yaw, pitch and roll", () => {
  assert.equal(level(run(face({ yawZ: 0.1 })), "pose"), "pass");
  assert.equal(level(run(face({ yawZ: 0.3 })), "pose"), "warn");    // about 17 degrees
  assert.equal(level(run(face({ yawZ: 0.8 })), "pose"), "fail");    // about 39 degrees
  assert.equal(level(run(face({ tilt: 0.1 })), "pose"), "fail");    // the eye line is rolled by about 27 degrees
  const pitched = face(); pitched[152].z = 0.4; pitched[10].z = -0.4;
  assert.equal(level(run(pitched), "pose"), "fail");
});

test("eyes open", () => {
  assert.equal(level(run(face({ eyeOpen: 0.3 })), "eyes"), "pass");
  assert.equal(level(run(face({ eyeOpen: 0.15 })), "eyes"), "warn");
  assert.equal(level(run(face({ eyeOpen: 0.02 })), "eyes"), "fail");
});

test("gaze roughly centred", () => {
  assert.equal(level(run(face({ iris: 0.5 })), "gaze"), "pass");
  assert.equal(level(run(face({ iris: 0.66 })), "gaze"), "warn");
  assert.equal(level(run(face({ iris: 0.9 })), "gaze"), "fail");
  assert.equal(level(run(face().slice(0, 468)), "gaze"), "skip");   // no iris points: not judged
});

test("mouth closed or nearly", () => {
  assert.equal(level(run(face({ mouth: 0.02 })), "mouth"), "pass");
  assert.equal(level(run(face({ mouth: 0.1 })), "mouth"), "warn");
  assert.equal(level(run(face({ mouth: 0.4 })), "mouth"), "fail");
});

test("even lighting: left against right cheek", () => {
  assert.equal(level(run(face(), sample({ left: 140, right: 130 })), "light"), "pass");
  assert.equal(level(run(face(), sample({ left: 140, right: 90 })), "light"), "warn");
  assert.equal(level(run(face(), sample({ left: 200, right: 40 })), "light"), "fail");
});

test("sharpness: Laplacian variance on the face crop", () => {
  assert.equal(level(run(face(), sample({ detail: 60 })), "sharp"), "pass");
  assert.equal(level(run(face(), sample({ detail: 0 })), "sharp"), "fail");   // flat, like a blurred photo
  assert.equal(laplacianVariance(sample({ detail: 0 }), 10, 10, 100, 100), 0);
  assert.equal(laplacianVariance(sample(), 5, 5, 6, 6), null);   // crop too small
});

test("glasses from the existing detector's share", () => {
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, glassesShare: 0 }), "glasses"), "pass");
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, glassesShare: 0.02 }), "glasses"), "warn");
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, glassesShare: 0.096 }), "glasses"), "fail");
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, glassesShare: undefined }), "glasses"), "skip");
});

test("hair on the forehead", () => {
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, foreheadHair: 0.02 }), "hair"), "pass");
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, foreheadHair: 0.2 }), "hair"), "warn");
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, foreheadHair: 0.7 }), "hair"), "fail");
  // the share itself, from a made-up class map: the whole forehead box is hair
  const lm = face(), W = 100, H = 100, classes = new Uint8Array(W * H).fill(1);
  assert.ok(foreheadHairShare(classes, W, H, lm) > 0.99);
  assert.equal(foreheadHairShare(new Uint8Array(W * H), W, H, lm), 0);
  assert.equal(foreheadHairShare(classes, W, H, null), null);
});

test("more than one face", () => {
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, faceCount: 1 }), "faces"), "pass");
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, faceCount: 2 }), "faces"), "fail");
  assert.equal(level(run(face(), sample(), { ...GOOD_EXTRA, faceCount: 0 }), "faces"), "fail");
});

test("a bad photo scores low and reports fail", () => {
  const r = run(face({ w: 0.1, yawZ: 0.8, eyeOpen: 0.02, mouth: 1.5 }), sample({ left: 200, right: 40, detail: 0 }), { ...GOOD_EXTRA, faceCount: 2, glassesShare: 0.1, foreheadHair: 0.7 });
  assert.equal(r.worst, "fail");
  assert.ok(r.score < 30, `score ${r.score}`);
});

test("hostile input never throws and always gives a report", () => {
  const nan = face(); nan[234] = { x: NaN, y: NaN, z: NaN }; nan[13] = null;
  const cases = [
    [null, null, null], [undefined, undefined, undefined], [[], {}, {}], [face().slice(0, 10), sample(), GOOD_EXTRA],
    [nan, sample(), GOOD_EXTRA], [face(), { width: NaN, height: 5, data: [] }, GOOD_EXTRA],
    [face(), { width: 4, height: 4, data: new Uint8Array(3) }, GOOD_EXTRA], [face(), sample(), { faceCount: NaN, glassesShare: NaN, foreheadHair: Infinity, imageWidth: NaN }],
    [{ length: 478 }, sample(), GOOD_EXTRA], ["x", 5, "y"],
    [Array.from({ length: 478 }, () => ({ x: NaN, y: NaN })), sample({ left: NaN }), GOOD_EXTRA],
  ];
  for (const [lm, s, e] of cases) {
    const r = photoQuality(lm, s, e);
    assert.ok(Number.isFinite(r.score) && r.score >= 0 && r.score <= 100);
    assert.ok(Array.isArray(r.checks));
    for (const c of r.checks) assert.ok(["pass", "warn", "fail", "skip"].includes(c.level) && typeof c.message === "string");
  }
  assert.equal(level(photoQuality(null, null, null), "size"), "fail");
});

test("the advice cannot touch consent and photopixels never sees the camera", () => {
  const strip = (f) => readFileSync(new URL(`../src/facemesh/${f}`, import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const pure = strip("photoquality.js");
  for (const word of ["document", "window", "canvas", "video", "fetch(", "consent", "localStorage"]) assert.ok(!pure.includes(word), `photoquality.js must not use ${word}`);
  const px = strip("photopixels.js");
  for (const word of ["video", "getUserMedia", "fetch(", "toDataURL", "toBlob", "localStorage"]) assert.ok(!px.includes(word), `photopixels.js must not use ${word}`);
  const page = strip("page.js");
  // a failed check adds a click to the consent question, never removes the statement or the server-signed consent
  assert.match(page, /ready = \(\) => attest\.checked && \(!needOverride \|\| over\.checked\)/);
  assert.match(page, /client\.issue\(sha, Number\(\$\("consentHours"\)\.value\), attest\.checked\)/);
});
