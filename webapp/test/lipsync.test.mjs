import test from "node:test";
import assert from "node:assert/strict";
import { FaceConfidence, amplitudeToAa, createAudioLipSync, mouthBox, mouthCover, rmsOf, rmsToDb, withAmplitudeFloor } from "../src/utils/audioLipSync.js";
import { MouthBlender } from "../src/speech.js";

const near = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) <= e, `${a} != ${b}`);

test("RMS: silence, a constant, a sine, and bad samples", () => {
  assert.equal(rmsOf(new Float32Array(100)), 0);
  assert.equal(rmsOf([]), 0);
  assert.equal(rmsOf(null), 0);
  near(rmsOf(new Float32Array(50).fill(0.5)), 0.5);
  const sine = Float32Array.from({ length: 1000 }, (_, i) => Math.sin((2 * Math.PI * 10 * i) / 1000));
  near(rmsOf(sine), Math.SQRT1_2, 1e-3);
  near(rmsOf([NaN, 1, 1, 1]), Math.sqrt(3 / 4));   // a bad sample counts as silence, not as NaN
});
test("dB: full scale is 0, half is about -6, silence is floored", () => {
  near(rmsToDb(1), 0);
  near(rmsToDb(0.5), -6.0206, 1e-3);
  assert.equal(rmsToDb(0), -100);
});
test("amplitude maps to the jaw between the floor and the full level", () => {
  assert.equal(amplitudeToAa(-60), 0);
  near(amplitudeToAa(-35), 0.5);
  assert.equal(amplitudeToAa(-5), 1);
  assert.equal(amplitudeToAa(NaN), 0);
});
test("a speaking mouth is lifted to the loudness; silence and an already open mouth are left alone", () => {
  const quiet = { aa: 0, ih: 0, ou: 0, ee: 0, oh: 0, speaking: true };
  assert.ok(withAmplitudeFloor(quiet, -25).aa > 0.4);
  assert.equal(withAmplitudeFloor({ ...quiet, speaking: false }, -25).aa, 0);
  assert.equal(withAmplitudeFloor({ ...quiet, aa: 0.9 }, -25).aa, 0.9);
});

// a face whose mouth sits at (0.5, 0.6): corners 61/291 at x 0.46/0.54, lips 0/17 at y 0.58/0.62
const face = () => {
  const L = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.4 }));
  L[61] = { x: 0.46, y: 0.6 }; L[291] = { x: 0.54, y: 0.6 }; L[0] = { x: 0.5, y: 0.58 }; L[17] = { x: 0.5, y: 0.62 };
  return L;
};
const handAt = (x, y) => ({ image: Array.from({ length: 21 }, (_, i) => ({ x: x + (i % 5) * 0.004, y: y + Math.floor(i / 5) * 0.004 })) });
test("a hand over the mouth is covering; a hand far away or no hand is not", () => {
  assert.ok(mouthBox(face()));
  assert.equal(mouthCover(face(), [handAt(0.49, 0.59)]), 1);
  assert.equal(mouthCover(face(), [handAt(0.1, 0.9)]), 0);
  assert.equal(mouthCover(face(), []), 0);
  assert.equal(mouthCover(null, [handAt(0.5, 0.6)]), 0);
  assert.equal(mouthBox([]), null);
});

test("confidence: no face is 0, a clear face is 1, a covered mouth is low", () => {
  const f = new FaceConfidence();
  assert.equal(f.update({ faceSeen: false }, 0), 0);
  assert.equal(f.update({ faceSeen: true }, 10), 1);
  assert.ok(f.update({ faceSeen: true, cover: 1 }, 20) < 0.2);
});
test("confidence: speech with a shut tracked mouth is distrusted only after half a second", () => {
  const f = new FaceConfidence({ disagreeMs: 500 });
  const speaking = { speaking: true, level: 0.6 };
  assert.equal(f.update({ faceSeen: true, trackedAa: 0, audio: speaking }, 0), 1);
  assert.equal(f.update({ faceSeen: true, trackedAa: 0, audio: speaking }, 400), 1);
  assert.ok(f.update({ faceSeen: true, trackedAa: 0, audio: speaking }, 600) <= 0.3);
  assert.equal(f.update({ faceSeen: true, trackedAa: 0.5, audio: speaking }, 700), 1, "the mouth moves again: trusted again");
  assert.equal(f.update({ faceSeen: true, trackedAa: 0, audio: { speaking: false, level: 0 } }, 800), 1, "silence is not a disagreement");
});

test("switch: visual above 0.6, audio when confidence drops, visual again on recovery (with a dead band)", () => {
  const b = new MouthBlender({ fadeMs: 100, onConfidence: 0.6, offConfidence: 0.45 });
  const tracked = { aa: 0.8, ih: 0, ou: 0, ee: 0, oh: 0 }, audio = { aa: 0.2, ih: 0, ou: 0, ee: 0, oh: 0 };
  let t = 0, out;
  const run = (conf, ms) => { for (const end = t + ms; t < end; t += 10) out = b.update(tracked, conf, audio, t); };
  run(0.9, 500);
  assert.equal(out.source, "tracked"); near(out.aa, 0.8);
  run(0.5, 300);                                  // between the thresholds: still the camera
  assert.equal(out.source, "tracked");
  run(0.3, 300);                                  // below: the sound takes over
  assert.equal(out.source, "audio"); near(out.aa, 0.2);
  run(0.5, 300);                                  // between again: still audio, no flapping
  assert.equal(out.source, "audio");
  run(0.8, 300);                                  // recovered
  assert.equal(out.source, "tracked");
});
test("a hand over the mouth hands the mouth to the audio end to end", () => {
  const conf = new FaceConfidence(), blend = new MouthBlender({ fadeMs: 50 });
  const tracked = { aa: 0.05, ih: 0, ou: 0, ee: 0, oh: 0 }, audio = { aa: 0.7, ih: 0, ou: 0, ee: 0, oh: 0, speaking: true, level: 0.7 };
  let out;
  for (let t = 0; t < 1000; t += 10) out = blend.update(tracked, conf.update({ faceSeen: true, cover: mouthCover(face(), [handAt(0.49, 0.59)]), trackedAa: tracked.aa, audio }, t), audio, t);
  assert.equal(out.source, "audio"); near(out.aa, 0.7, 0.01);
});

test("the Web Audio wrapper reports RMS from the analyser and cleans up", () => {
  const calls = [];
  class FakeContext {
    createAnalyser() { return { fftSize: 0, smoothingTimeConstant: 1, getFloatTimeDomainData: (b) => b.fill(0.25) }; }
    createMediaStreamSource() { return { connect: (a) => calls.push(["connect", a.fftSize]) }; }
    close() { calls.push(["close"]); return Promise.resolve(); }
  }
  let tick = null;
  const env = { AudioContext: FakeContext, setInterval: (fn) => { tick = fn; return 7; }, clearInterval: (id) => calls.push(["clear", id]), performance: { now: () => 42 } };
  const got = [];
  const h = createAudioLipSync({}, (x) => got.push(x), { env });
  tick();
  near(got[0].rms, 0.25); near(got[0].levelDb, -12.04, 0.01); assert.equal(got[0].t, 42);
  h.stop();
  assert.deepEqual(calls.map((c) => c[0]), ["connect", "clear", "close"]);
  assert.throws(() => createAudioLipSync({}, () => {}, { env: {} }), /Web Audio/);
});
