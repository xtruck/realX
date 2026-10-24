// S13c: clean seams between the photo's head and the live picture. Pure logic (timing, smoothing in time, hysteresis, zone) and
// source checks of the privacy rules; the shaders and the segmenter were not run on a real driver here.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SEAM, MotionGate, freshness, gate, headZone, maxAge, seamDue, seamRate, seamTooSlow, stepMask, stepMaskArray } from "../src/facemesh/seams.js";

const src = (name) => readFileSync(new URL(`../src/facemesh/${name}`, import.meta.url), "utf8");
const code = (name) => src(name).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

// run a pixel through a list of answers and return what the output (gate of the running value) does
function outputs(answers, start = 0) {
  let v = start; const out = [];
  for (const a of answers) { v = stepMask(v, a); out.push(gate(v)); }
  return out;
}

test("a mask that flickers for one answer does not flicker the output", () => {
  const off = outputs([0, 0, 0, 1, 0, 0, 0]);
  assert.ok(off.every((o) => o === 0), `one stray 'hair' answer must never show: ${off}`);
  const on = outputs([1, 1, 1, 1, 1, 1, 0, 1, 1, 1], 1);           // a stable pixel with one missing answer
  assert.ok(on.every((o) => o === 1), `one missing answer must not make a hole: ${on}`);
});

test("a pixel that really changes does come through, within a few answers, and goes away the same way", () => {
  const rise = outputs([1, 1, 1, 1, 1, 1]);
  assert.equal(rise[0], 0);
  assert.equal(rise[5], 1);
  assert.ok(rise.every((o, i) => i === 0 || o >= rise[i - 1]), "monotone");
  const fall = outputs([0, 0, 0, 0, 0, 0], 1);
  assert.equal(fall[5], 0);
});

test("one answer never shows, two only half, four fully (5 a second: about half a second to appear)", () => {
  const rise = outputs([1, 1, 1, 1]);
  assert.ok(rise[0] === 0 && rise[1] < 0.6);
  assert.ok(rise[3] === 1);
});

test("stepMask keeps its value in 0..1 and ignores garbage", () => {
  for (const [p, s] of [[-3, 5], [2, -1], [0.5, 0.5], [NaN, 1]]) {
    const v = stepMask(p, s);
    assert.ok(v >= 0 && v <= 1 || Number.isNaN(v) === false, `${p},${s} -> ${v}`);
  }
  assert.equal(stepMask(0.5, 0.5), 0.5);
  const arr = stepMaskArray(null, Float32Array.of(0, 1, 0.5));
  assert.deepEqual(Array.from(arr, (x) => Math.round(x * 100)), [0, 30, 15]);
});

test("the shader and the page use the same numbers as seams.js", () => {
  const mask = src("seammask.js"), comp = src("compositor.js");
  assert.ok(mask.includes("uniform1f(gl.getUniformLocation(this.step, \"up\"), SEAM.up)") && mask.includes("SEAM.down"));
  assert.ok(comp.includes(`smoothstep(${SEAM.lo.toFixed(2)}, ${SEAM.hi.toFixed(2)}, v)`), "compositor gate = SEAM.lo/hi");
});

test("gate: nothing below lo, everything above hi", () => {
  assert.equal(gate(SEAM.lo - 0.01), 0); assert.equal(gate(SEAM.hi + 0.01), 1);
  assert.ok(gate(0.5) > 0 && gate(0.5) < 1);
});

test("seamDue: first run at once, then about SEAM.rateHz a second, slower when the face model is slow or the segmenter is costly", () => {
  const st = { last: -Infinity, cost: 0 };
  assert.equal(seamDue(0, st), true);
  st.last = 1000;
  assert.equal(seamDue(1100, st), false);
  assert.equal(seamDue(1000 + 1000 / SEAM.rateHz + 1, st), true);
  assert.equal(seamDue(1000 + 1000 / SEAM.rateHz + 1, st, SEAM.slowMs + 10), false, "face model slow: twice the gap");
  assert.equal(seamDue(1000 + 2000 / SEAM.rateHz + 1, st, SEAM.slowMs + 10), true);
  st.cost = 90;                                                          // a 90 ms pass may not use more than maxShare of the time
  assert.equal(seamDue(1000 + 400, st), false);
  assert.equal(seamDue(1000 + 90 / SEAM.maxShare + 1, st), true);
  // over a second of 30 fps frames it never starts more than rateHz + 1 passes
  const s2 = { last: -Infinity, cost: 0 }; let runs = 0;
  for (let t = 0; t < 1000; t += 33) if (seamDue(t, s2)) { s2.last = t; runs++; }
  assert.ok(runs >= 4 && runs <= SEAM.rateHz + 1, `${runs} runs`);
});

test("freshness: full while the answer is recent, fades out when it is old, none without an answer", () => {
  assert.equal(freshness(0), 1); assert.equal(freshness(SEAM.maxAgeMs), 1);
  assert.ok(freshness(SEAM.maxAgeMs + SEAM.fadeMs / 2) > 0.4 && freshness(SEAM.maxAgeMs + SEAM.fadeMs / 2) < 0.6);
  assert.equal(freshness(SEAM.maxAgeMs + SEAM.fadeMs), 0);
  assert.equal(freshness(Infinity), 0); assert.equal(freshness(NaN), 0); assert.equal(freshness(-5), 0);
});

test("MotionGate: switches off in a fast turn, back on when calm, and does not pulse near one threshold", () => {
  const g = new MotionGate();
  const box = (x) => ({ x, y: 0.3, w: 0.2, h: 0.3 });
  let t = 0, x = 0.4;
  g.update(box(x), t);
  for (let i = 0; i < 15; i++) { t += 33; g.update(box(x), t); }          // still
  assert.ok(g.amount > 0.99);
  for (let i = 0; i < 30; i++) { t += 33; x += 0.2 * 2.5 * 0.033; g.update(box(x), t); }   // 2.5 face widths a second
  assert.ok(g.amount < 0.1, `fast: ${g.amount}`);
  // speed hovering between on (0.7) and off (1.4): it stays off, it does not flip back and forth
  const seen = new Set();
  for (let i = 0; i < 60; i++) { t += 33; x += 0.2 * (i % 2 ? 1.0 : 1.2) * 0.033; g.update(box(x), t); seen.add(g.open); }
  assert.deepEqual([...seen], [false]);
  for (let i = 0; i < 40; i++) { t += 33; g.update(box(x), t); }          // calm
  assert.ok(g.amount > 0.9, `calm: ${g.amount}`);
});

test("MotionGate: no face, no change and no crash", () => {
  const g = new MotionGate();
  assert.equal(g.update(null, 0), 1);
  assert.equal(g.update({ x: 0, y: 0, w: 0, h: 0 }, 10), 1);
});

test("headZone: round the face, face left alone, null without a face", () => {
  assert.equal(headZone(null), null);
  const z = headZone({ x: 0.4, y: 0.3, w: 0.2, h: 0.3 });
  assert.ok(Math.abs(z.cx - 0.5) < 1e-9 && Math.abs(z.cy - 0.45) < 1e-9);
  assert.ok(z.rx > z.fx * 2 && z.ry > z.fy * 2);
  assert.ok(z.chin > 0.6);
});

// --- privacy: the camera is never read back, and the masks never reach JavaScript ----------------------------------------------------
const NEVER = ["readPixels", "getImageData", "toDataURL", "toBlob", "drawImage", "createImageBitmap", "captureStream", "MediaRecorder", "ImageCapture",
  "fetch(", "XMLHttpRequest", "WebSocket", "sendBeacon", "localStorage", "sessionStorage", "indexedDB", "getUserMedia", "copyTexImage2D", "copyTexSubImage2D",
  "getAsUint8Array", "getAsFloat32Array", "readBuffer"];

test("seams.js and seammask.js never read back, keep or send anything, and the masks stay on the graphics card", () => {
  for (const file of ["seams.js", "seammask.js"]) {
    const s = code(file);
    for (const call of NEVER) assert.ok(!s.includes(call), `${file} must not use ${call}`);
  }
  const mask = code("seammask.js");
  for (const call of mask.match(/texImage2D\([^;]*;/g) || []) assert.ok(/, null\);$/.test(call), `only an empty allocation: ${call}`);
  assert.ok(mask.includes("getAsWebGLTexture"), "the mask is taken as a texture");
  assert.ok(!/delegate: "CPU"/.test(mask), "no CPU delegate: it would hand the masks to the CPU");
  assert.ok(!/outputCategoryMask: true/.test(mask));
});

test("the page, not the compositor, runs the segmenter; the compositor only uploads the mask canvas and never names the video for it", () => {
  const page = code("page.js");
  assert.ok(page.includes("stepSeams(now, shown)") && page.includes("seamBtn"));
  assert.ok(src("facemesh.html").includes('id="seamBtn" type="button" aria-pressed="false"'), "Clean the edges is off by default (owner's decision, 2026-10-20)");
  const comp = code("compositor.js");
  const method = comp.match(/setSeam\(source\) \{[\s\S]*?\n  \}/);
  assert.ok(method && (method[0].match(/texImage2D/g) || []).length === 1 && !/video/i.test(method[0]));
});

test("with no mask, an option off or a stale answer the compositor draws no seam patch", () => {
  // the amount that reaches the compositor is 0 in all of these (see stepSeams in page.js): option off or no face -> 0; failed -> 0; stale -> freshness 0
  const page = code("page.js");
  assert.ok(page.includes("if (!seamOn || !shown) { compositor.setSeamAmount(0, null)"));
  assert.ok(page.includes("seamSeg.failed ? 0 : freshness(now - seamAt, edgeRate(seamHz, softOn))"));
  const comp = code("compositor.js");
  assert.ok(comp.includes("if (!this.seam.ready || !z || !(this.seam.amount > 0.002)) return 0;"));
});

test("seamTooSlow: a pass that freezes the page turns the option off; one slow warm-up pass does not", () => {
  const st = { slowRuns: 0 };
  assert.equal(seamTooSlow(12000, st), true, "about 12 s per pass was measured on a software renderer: off at once");
  assert.equal(seamTooSlow(SEAM.stopPassMs + 1, { slowRuns: 0 }), true);
  const warm = { slowRuns: 0 };
  assert.equal(seamTooSlow(SEAM.slowPassMs + 100, warm), false, "one slow pass may be the graphics card warming up");
  assert.equal(seamTooSlow(20, warm), false, "a fast pass clears the count");
  assert.equal(warm.slowRuns, 0);
  assert.equal(seamTooSlow(SEAM.slowPassMs + 100, warm), false);
  assert.equal(seamTooSlow(SEAM.slowPassMs + 100, warm), true, "two slow passes in a row: off");
  const fast = { slowRuns: 0 };
  for (let i = 0; i < 50; i++) assert.equal(seamTooSlow(30, fast), false, "a normal GPU pass never stops it");
  for (const bad of [NaN, -1, Infinity, undefined, null, "x"]) assert.equal(seamTooSlow(bad, { slowRuns: 1 }), false, String(bad));
});

test("the page stops only the segmenter when it is too slow, says so, and keeps the label and consent untouched", () => {
  const page = readFileSync(new URL("../src/facemesh/page.js", import.meta.url), "utf8");
  const body = page.slice(page.indexOf("function stopSlowSeams"), page.indexOf("}", page.indexOf("setStatus(`Clean the edges was turned off")) + 1);
  assert.ok(page.includes("seamTooSlow(seamSeg.lastMs, seamState, seamSeg.warmup)"), "the page asks the rule after every pass");
  assert.match(body, /seamOn = false/);
  assert.match(body, /aria-pressed", "false"/);
  assert.match(body, /closeSeams\(\)/);
  assert.match(body, /probe\.seam = "too slow"/);
  assert.doesNotMatch(body, /label|consent|guard|watermark|stopCamera|revoke/i, "nothing safety-related is touched by this path");
});

test("seamTooSlow: the first pass (the model being prepared) never stops it; the passes after it are judged", () => {
  const st = { slowRuns: 0 };
  assert.equal(seamTooSlow(8270, st, true), false, "UHD 620: the first pass took 6.5 to 8.3 s, then about 26 ms");
  assert.equal(st.slowRuns, 0, "a warm-up pass is not counted");
  for (let i = 0; i < 20; i++) assert.equal(seamTooSlow(26, st, false), false);
  const soft = { slowRuns: 0 };
  assert.equal(seamTooSlow(12000, soft, true), false, "software renderer: the first 12 s pass is let through ...");
  assert.equal(seamTooSlow(12000, soft, false), true, "... and the second one stops it");
});

test("the segmenter leaves its first pass out of the running cost and tells the page which pass was the warm-up", () => {
  const src = readFileSync(new URL("../src/facemesh/seammask.js", import.meta.url), "utf8");
  assert.match(src, /this\.warmup = this\.passes === 0;/);
  assert.match(src, /if \(!this\.warmup\) this\.costMs =/);
  const page = readFileSync(new URL("../src/facemesh/page.js", import.meta.url), "utf8");
  assert.ok(page.includes("seamTooSlow(seamSeg.lastMs, seamState, seamSeg.warmup)"));
});

test("Clean the edges is off by default: the button, the page flag and the probe agree", () => {
  const page = readFileSync(new URL("../src/facemesh/page.js", import.meta.url), "utf8");
  const html = readFileSync(new URL("../src/facemesh/facemesh.html", import.meta.url), "utf8");
  assert.match(page, /let seamOn = false,/);
  assert.match(page, /seam: "off", seamHz,/);
  assert.match(html, /<button id="seamBtn" type="button" aria-pressed="false">/);
});

test("seamRate: a rate from the page address between minHz and rateHz, the default for anything else", () => {
  assert.equal(seamRate("2"), 2); assert.equal(seamRate("0.5"), 0.5); assert.equal(seamRate("5"), 5); assert.equal(seamRate(" 1 "), 1);
  for (const bad of [null, undefined, "", " ", "0", "0.4", "6", "-1", "abc", "Infinity", "NaN", "2hz", 2]) assert.equal(seamRate(bad), SEAM.rateHz, String(bad));
});

test("a lower rate spaces the passes out and keeps an answer fresh until the next one is due", () => {
  const st = { last: 1000, cost: 0 };
  assert.equal(seamDue(1000 + 499, st, 0, 2), false); assert.equal(seamDue(1000 + 501, st, 0, 2), true);
  assert.equal(seamDue(1000 + 999, st, 0, 1), false); assert.equal(seamDue(1000 + 1001, st, 0, 1), true);
  assert.equal(maxAge(SEAM.rateHz), SEAM.maxAgeMs, "the default rate keeps the old limit");
  assert.equal(maxAge(1), 2500); assert.equal(freshness(2400, 1), 1, "at 1 a second an answer 2.4 s old still shows");
  assert.equal(freshness(2400), 0, "at the default rate it would be stale");
  for (const hz of [0.5, 1, 2, 5]) assert.ok(maxAge(hz) > 1000 / hz * 2, `at ${hz}/s an answer outlives two gaps`);
});
