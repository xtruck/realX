// Speech-driven mouth, voice activity and A/V sync, tested with made-up signals only.
// Nothing here has touched a real microphone.
import test from "node:test";
import assert from "node:assert/strict";
import {
  DelayLine, MouthBlender, MouthFromAudio, VoiceActivity, avSyncOffset, describeSync, visemeFromSpectrum,
} from "../src/speech.js";
import { startMic } from "../src/mic.js";

const VISEMES = ["aa", "ih", "ou", "ee", "oh"];
const SR = 48000, FFT = 1024;

// a spectrum (dB per bin) with narrow peaks at the given formant frequencies
function spectrum(formants, { floor = -100, peak = -30, bw = 90 } = {}) {
  const bins = FFT / 2, out = new Float32Array(bins).fill(floor);
  for (let k = 0; k < bins; k++) {
    const f = (k * SR) / FFT;
    for (const fc of formants) out[k] = Math.max(out[k], peak - 20 * ((f - fc) / bw) ** 2);
  }
  return out;
}
const VOWELS = { aa: [700, 1100], ih: [300, 2300], ou: [300, 800], ee: [500, 1800], oh: [500, 900] };
const top = (m) => VISEMES.slice().sort((a, b) => m[b] - m[a])[0];
const sum = (m) => VISEMES.reduce((s, k) => s + m[k], 0);

// --- voice activity ---------------------------------------------------------------------------------
function run(vad, db, fromMs, toMs, step = 20) {
  let r;
  for (let t = fromMs; t < toMs; t += step) r = vad.update(typeof db === "function" ? db(t) : db, t);
  return r;
}

test("vad: a steady hum is not speech, even with a little flutter", () => {
  const v = new VoiceActivity();
  let speaking = false;
  for (let t = 0; t < 3000; t += 20) speaking ||= v.update(-45 + (t % 40 ? 0.5 : -0.5), t).speaking;
  assert.equal(speaking, false);
});

test("vad: a burst 12 dB over the floor starts speech, and it stops after the hangover", () => {
  const v = new VoiceActivity({ hangoverMs: 200 });
  run(v, -45, 0, 1000);
  assert.equal(run(v, -33, 1000, 1200).speaking, true);
  assert.equal(run(v, -45, 1200, 1300).speaking, true, "still inside the hangover");
  assert.equal(run(v, -45, 1300, 1700).speaking, false, "past the hangover");
});

test("vad: level is 0..1, zero when silent, and louder speech gives a bigger level", () => {
  const quiet = new VoiceActivity(), loud = new VoiceActivity();
  run(quiet, -50, 0, 1000); run(loud, -50, 0, 1000);
  const a = run(quiet, -38, 1000, 1300), b = run(loud, -15, 1000, 1300);
  assert.ok(a.speaking && b.speaking);
  assert.ok(b.level > a.level && a.level > 0 && b.level <= 1, `${a.level} ${b.level}`);
  assert.equal(run(new VoiceActivity(), -50, 0, 500).level, 0);
});

test("vad: the noise floor falls fast and rises slowly, so a slow change in room noise is not speech", () => {
  const v = new VoiceActivity();
  run(v, -45, 0, 1000);
  const dropped = run(v, -60, 1000, 2000);
  assert.ok(dropped.floorDb <= -58, `falls fast: ${dropped.floorDb}`);
  const w = new VoiceActivity();
  run(w, -50, 0, 1000);
  let speaking = false;
  for (let t = 1000; t < 21000; t += 20) speaking ||= w.update(-44, t).speaking;   // room got 6 dB louder
  assert.equal(speaking, false);
  assert.ok(w.update(-44, 21000).floorDb > -46, "and the floor followed it up");
});

test("vad: nonsense input is safe", () => {
  const v = new VoiceActivity();
  run(v, -45, 0, 500);
  for (const bad of [NaN, Infinity, -Infinity, undefined, null, "x"]) {
    const r = v.update(bad, 600);
    assert.ok(Number.isFinite(r.level) && Number.isFinite(r.floorDb) && typeof r.speaking === "boolean");
  }
  const r = v.update(-45, NaN);
  assert.ok(Number.isFinite(r.floorDb));
});

// --- vowel shapes from a spectrum -----------------------------------------------------------------
test("viseme: each vowel's formants light up the matching mouth shape most", () => {
  for (const [name, formants] of Object.entries(VOWELS)) {
    const m = visemeFromSpectrum(spectrum(formants), SR, FFT);
    assert.equal(top(m), name, `${name}: ${JSON.stringify(m)}`);
    assert.ok(sum(m) <= 1.0001 && VISEMES.every((k) => Number.isFinite(m[k]) && m[k] >= 0), name);
    assert.ok(m.open > 0.8, `${name} open ${m.open}`);
  }
});

test("viseme: a vowel between two shapes blends them; a small shift keeps the winner", () => {
  const mid = visemeFromSpectrum(spectrum([600, 1000]), SR, FFT);
  const best2 = VISEMES.slice().sort((a, b) => mid[b] - mid[a]).slice(0, 2).sort();
  assert.deepEqual(best2, ["aa", "oh"], JSON.stringify(mid));
  assert.equal(top(visemeFromSpectrum(spectrum([740, 1140]), SR, FFT)), "aa");
});

test("viseme: silence, flat noise and bad input give zeros, never NaN or a throw", () => {
  const zeros = (m) => VISEMES.every((k) => m[k] === 0) && m.open === 0;
  assert.ok(zeros(visemeFromSpectrum(new Float32Array(512).fill(-100), SR, FFT)));
  const flat = Float32Array.from({ length: 512 }, (_, i) => -60 + (i % 3) * 0.5);
  assert.ok(zeros(visemeFromSpectrum(flat, SR, FFT)), "flat noise is not a vowel");
  for (const bad of [[], null, undefined, new Float32Array(512).fill(NaN), new Float32Array(512).fill(-Infinity), "abc"]) {
    assert.ok(zeros(visemeFromSpectrum(bad, SR, FFT)));
  }
  assert.ok(zeros(visemeFromSpectrum(spectrum(VOWELS.aa), NaN, FFT)));
  assert.ok(zeros(visemeFromSpectrum(spectrum(VOWELS.aa), SR, 0)));
});

// --- mouth from audio -------------------------------------------------------------------------------
function speak(mouth, vowel, level, fromMs, toMs, step = 10) {
  let r;
  for (let t = fromMs; t < toMs; t += step) r = mouth.update({ levelDb: level, freqDb: spectrum(VOWELS[vowel]), sampleRate: SR, fftSize: FFT }, t);
  return r;
}

test("mouth from audio: silence makes no mouth, speech opens the right shape, it closes after", () => {
  const m = new MouthFromAudio();
  const quiet = speak(m, "aa", -50, 0, 1000);                       // the spectrum has a vowel, the level says nobody is talking
  assert.ok(quiet.speaking === false && VISEMES.every((k) => quiet[k] === 0), JSON.stringify(quiet));
  const talking = speak(m, "aa", -20, 1000, 1600);
  assert.ok(talking.speaking && top(talking) === "aa" && talking.aa > 0.4, JSON.stringify(talking));
  const after = speak(m, "aa", -50, 1600, 2800);
  assert.ok(VISEMES.every((k) => after[k] < 0.02), JSON.stringify(after));
});

test("mouth from audio: fast to open, slower to close", () => {
  const m = new MouthFromAudio({ attackMs: 40, releaseMs: 120 });
  speak(m, "aa", -50, 0, 500);
  const settled = speak(m, "aa", -20, 500, 1500).aa;
  const probe = new MouthFromAudio({ attackMs: 40, releaseMs: 120 });
  speak(probe, "aa", -50, 0, 500);
  const opening = speak(probe, "aa", -20, 500, 560).aa;             // ~60 ms into the word
  assert.ok(opening >= 0.5 * settled, `opened to ${opening} of ${settled} in 60 ms`);
  const closer = new MouthFromAudio({ attackMs: 40, releaseMs: 120 });
  speak(closer, "aa", -50, 0, 500); speak(closer, "aa", -20, 500, 1500);
  const closing = speak(closer, "aa", -50, 1500, 1750).aa;          // 250 ms after: hangover is 200, so ~50 ms of release
  assert.ok(closing > 0.3 * settled, "release is gentler than attack");
});

test("mouth from audio: hostile frames are safe", () => {
  const m = new MouthFromAudio();
  for (const f of [null, undefined, {}, { levelDb: NaN, freqDb: [], sampleRate: 0, fftSize: 0 }, { levelDb: -20, freqDb: "x" }]) {
    const r = m.update(f, 100);
    assert.ok(VISEMES.every((k) => Number.isFinite(r[k]) && r[k] >= 0 && r[k] <= 1));
  }
});

// --- tracked mouth versus audio mouth ---------------------------------------------------------------
const mouth = (o = {}) => ({ aa: 0, ih: 0, ou: 0, ee: 0, oh: 0, ...o });
const talkingAudio = mouth({ oh: 0.8 }), trackedAa = mouth({ aa: 0.9 });

test("blender: a confidently tracked face drives the mouth, the audio does not leak in", () => {
  const b = new MouthBlender();
  let r;
  for (let t = 0; t < 500; t += 10) r = b.update(trackedAa, 0.9, talkingAudio, t);
  assert.ok(Math.abs(r.aa - 0.9) < 1e-6 && r.oh === 0);
  assert.equal(r.source, "tracked");
});

test("blender: losing the face crossfades to the audio over about 150 ms, and back on recovery", () => {
  const b = new MouthBlender({ fadeMs: 150 });
  for (let t = 0; t < 500; t += 10) b.update(trackedAa, 0.9, talkingAudio, t);
  let half, full;
  for (let t = 500; t <= 700; t += 10) {
    const r = b.update(null, 0, talkingAudio, t);
    if (t === 570) half = r;      // 7 steps of 10 ms into a 150 ms fade
    if (t === 660) full = r;
  }
  assert.ok(half.oh > 0.25 && half.oh < 0.55 && half.aa > 0.3 && half.aa < 0.65, `mid-fade ${JSON.stringify(half)}`);
  assert.ok(full.oh > 0.79 && full.aa < 0.01 && full.source === "audio", `after the fade ${JSON.stringify(full)}`);
  let back;
  for (let t = 700; t <= 900; t += 10) back = b.update(trackedAa, 0.95, talkingAudio, t);
  assert.ok(back.aa > 0.89 && back.oh < 0.01 && back.source === "tracked");
});

test("blender: weights stay in [0,1] and never add up to more than either source allows", () => {
  const b = new MouthBlender();
  for (let t = 0; t < 2000; t += 10) {
    const conf = 0.5 + 0.5 * Math.sin(t / 90);
    const r = b.update(mouth({ aa: 1, oh: 1 }), conf, mouth({ ee: 1, ih: 1 }), t);
    for (const k of VISEMES) assert.ok(Number.isFinite(r[k]) && r[k] >= 0 && r[k] <= 1, `${k} ${r[k]}`);
    assert.ok(r.aa + r.ee <= 1.0001 && r.oh + r.ih <= 1.0001, "a channel is never double-counted");
  }
});

test("blender: a flickering confidence around the threshold does not flap between sources", () => {
  const b = new MouthBlender();
  for (let t = 0; t < 500; t += 10) b.update(trackedAa, 0.9, talkingAudio, t);
  let changes = 0, prev = "tracked";
  for (let t = 500; t < 1500; t += 10) {
    const r = b.update(trackedAa, 0.5 + (t % 20 ? 0.04 : -0.04), talkingAudio, t);   // 0.46 / 0.54, inside the 0.45-0.6 dead band
    if (r.source !== prev) { changes++; prev = r.source; }
  }
  assert.equal(changes, 0, "stays on the tracked mouth");
});

test("blender: bad input is safe", () => {
  const b = new MouthBlender();
  for (const [tr, c, au] of [[null, NaN, null], [{ aa: NaN }, 0.9, { oh: Infinity }], [undefined, undefined, undefined], [mouth({ aa: 5 }), 2, mouth({ oh: -3 })]]) {
    const r = b.update(tr, c, au, 100);
    for (const k of VISEMES) assert.ok(Number.isFinite(r[k]) && r[k] >= 0 && r[k] <= 1);
  }
});

// --- delay line and A/V sync ------------------------------------------------------------------------
test("delay line: returns the newest value that is at least `delay` old", () => {
  const d = new DelayLine();
  for (let t = 0; t <= 1000; t += 10) d.push(t, t);
  assert.equal(d.read(500, 100), 400);
  assert.equal(d.read(500, 0), 500);
  assert.equal(d.read(505, 100), 400);
  assert.equal(d.read(50, 100), undefined, "nothing is old enough yet");
  assert.equal(new DelayLine().read(10, 0), undefined);
});

test("delay line: memory is bounded by age and by size, and odd timestamps are tolerated", () => {
  const d = new DelayLine({ maxAgeMs: 2000, maxSize: 512 });
  for (let t = 0; t < 100000; t += 10) d.push(t, t);
  assert.ok(d.size <= 512, `${d.size}`);
  assert.equal(d.read(99990, 1500), 98490, "still serves delays inside the window");
  const e = new DelayLine({ maxAgeMs: 1000, maxSize: 4096 });
  for (let t = 0; t < 10000; t += 10) e.push(t, t);
  assert.ok(e.size <= 101, `age bound: ${e.size}`);
  const f = new DelayLine();
  f.push("a", 100); f.push("ignored", NaN); f.push("b", 50);   // out of order: clamped, never reordered
  assert.equal(f.read(1000, 0), "b");
  assert.equal(f.size, 2);
});

test("a/v sync: the faster stream is delayed so both line up", () => {
  assert.deepEqual(avSyncOffset({ audioLatencyMs: 120, videoLatencyMs: 40 }), { delayAudioMs: 0, delayVideoMs: 80, offsetMs: -80 });
  assert.deepEqual(avSyncOffset({ audioLatencyMs: 40, videoLatencyMs: 120 }), { delayAudioMs: 80, delayVideoMs: 0, offsetMs: 80 });
  const big = avSyncOffset({ audioLatencyMs: 10, videoLatencyMs: 900 });
  assert.equal(big.delayAudioMs, 250, "clamped");
  for (const bad of [{}, null, { audioLatencyMs: NaN, videoLatencyMs: 5 }, { audioLatencyMs: -50, videoLatencyMs: Infinity }]) {
    const r = avSyncOffset(bad);
    assert.ok(Number.isFinite(r.delayAudioMs) && Number.isFinite(r.delayVideoMs) && r.delayAudioMs >= 0 && r.delayVideoMs >= 0);
  }
});

test("a/v sync: plain-language description", () => {
  assert.equal(describeSync(0), "in sync");
  assert.equal(describeSync(10), "in sync");
  assert.equal(describeSync(-15), "in sync");
  assert.equal(describeSync(80), "audio ahead by 80 ms");
  assert.equal(describeSync(-80.4), "video ahead by 80 ms");
  assert.equal(describeSync(NaN), "unknown");
});

// --- microphone glue, against fake browser objects ---------------------------------------------------
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// waits for a condition instead of a fixed time: on a loaded machine timers run late, a fixed wait then sees too few frames
const until = async (cond, ms = 3000) => { const end = Date.now() + ms; while (!cond() && Date.now() < end) await wait(5); };
const GLOBALS = ["navigator", "AudioContext", "window"];

function installFakes({ failWith = null } = {}) {
  const log = { constraints: null, closed: 0, stopped: 0, destinationTouched: false, connected: [], hide: null, removed: 0 };
  const track = { label: "Fake Mic", stop() { log.stopped++; } };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  const navigator = {
    mediaDevices: {
      async getUserMedia(c) {
        log.constraints = c;
        if (failWith) { const e = new Error("raw browser text"); e.name = failWith; throw e; }
        return stream;
      },
    },
  };
  class AudioContext {
    constructor() { this.sampleRate = 48000; this.baseLatency = 0.01; this.state = "running"; }
    get destination() { log.destinationTouched = true; throw new Error("nothing may be played back"); }
    createMediaStreamSource() { return { connect: (node) => log.connected.push(node) }; }
    createAnalyser() {
      return {
        fftSize: 0, smoothingTimeConstant: 1,
        get frequencyBinCount() { return this.fftSize / 2; },
        getFloatTimeDomainData(a) { for (let i = 0; i < a.length; i++) a[i] = 0.1 * Math.sin(i / 5); },
        getFloatFrequencyData(a) { a.fill(-80); a[10] = -20; a[11] = -Infinity; },
        connect() { log.destinationTouched = true; },
      };
    }
    async close() { log.closed++; this.state = "closed"; }
  }
  const win = { addEventListener: (type, fn) => { if (type === "pagehide") log.hide = fn; }, removeEventListener: (type) => { if (type === "pagehide") log.removed++; } };
  const saved = Object.fromEntries(GLOBALS.map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  for (const [k, v] of Object.entries({ navigator, AudioContext, window: win })) Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
  const restore = () => { for (const k of GLOBALS) { if (saved[k]) Object.defineProperty(globalThis, k, saved[k]); else delete globalThis[k]; } };
  return { log, restore };
}

test("mic: asks for echo cancellation, noise suppression and gain control, mono, no video", async () => {
  const { log, restore } = installFakes();
  try {
    const mic = await startMic({ onFeatures() {}, intervalMs: 5 });
    assert.deepEqual(log.constraints.video, false);
    for (const k of ["echoCancellation", "noiseSuppression", "autoGainControl"]) assert.equal(log.constraints.audio[k], true, k);
    assert.equal(log.constraints.audio.channelCount, 1);
    assert.ok(!("deviceId" in log.constraints.audio), "no device named, none requested");
    mic.stop();
    const { log: l2, restore: r2 } = installFakes();
    const m2 = await startMic({ deviceId: "abc", onFeatures() {}, intervalMs: 5 });
    assert.deepEqual(l2.constraints.audio.deviceId, { exact: "abc" });
    m2.stop(); r2();
  } finally { restore(); }
});

test("mic: delivers level, spectrum and timing; reports its label and latency", async () => {
  const { log, restore } = installFakes();
  const seen = [];
  try {
    const mic = await startMic({ onFeatures: (f) => seen.push(f), intervalMs: 5 });
    await until(() => seen.length >= 3);
    mic.stop();
    assert.ok(seen.length >= 3, `${seen.length} frames`);
    const f = seen[0];
    assert.ok(Math.abs(f.levelDb - 20 * Math.log10(0.1 / Math.SQRT2)) < 1.5, `level ${f.levelDb}`);
    assert.equal(f.freqDb.length, 512);
    assert.equal(f.sampleRate, 48000);
    assert.equal(f.fftSize, 1024);
    assert.ok(Number.isFinite(f.t));
    assert.equal(mic.label, "Fake Mic");
    assert.ok(Math.abs(mic.latencyMs - (10 + (1024 / 48000) * 1000)) < 1, `latency ${mic.latencyMs}`);
    assert.equal(log.destinationTouched, false, "the analyser is never connected to the speakers");
    assert.equal(log.connected.length, 1);
  } finally { restore(); }
});

test("mic: stop releases the microphone, closes the audio context, ends the callbacks, and is safe twice", async () => {
  const { log, restore } = installFakes();
  let n = 0;
  try {
    const mic = await startMic({ onFeatures: () => { n++; }, intervalMs: 5 });
    await wait(40);
    mic.stop(); mic.stop();
    const at = n;
    await wait(60);
    assert.equal(n, at, "no callbacks after stop");
    assert.equal(log.stopped, 1);
    assert.equal(log.closed, 1);
    assert.ok(log.removed >= 1, "the pagehide hook is removed");
  } finally { restore(); }
});

test("mic: the page going away stops it", async () => {
  const { log, restore } = installFakes();
  try {
    await startMic({ onFeatures() {}, intervalMs: 5 });
    assert.equal(typeof log.hide, "function");
    log.hide();
    assert.equal(log.stopped, 1);
    assert.equal(log.closed, 1);
  } finally { restore(); }
});

test("mic: refusal and a missing device come back as plain messages", async () => {
  for (const [name, text] of [["NotAllowedError", /permission was refused/i], ["NotFoundError", /no microphone/i]]) {
    const { restore } = installFakes({ failWith: name });
    try { await assert.rejects(() => startMic({ onFeatures() {} }), (e) => text.test(e.message) && !/raw browser text/.test(e.message)); } finally { restore(); }
  }
  const { restore } = installFakes({ failWith: "SomethingElse" });
  try { await assert.rejects(() => startMic({ onFeatures() {} }), /raw browser text/); } finally { restore(); }
});

test("mic: a throwing callback does not kill the timer or leak the microphone", async () => {
  const { log, restore } = installFakes();
  let calls = 0;
  try {
    const mic = await startMic({ onFeatures: () => { calls++; throw new Error("consumer bug"); }, intervalMs: 5 });
    await until(() => calls >= 3);
    assert.ok(calls >= 3, "kept going");
    mic.stop();
    assert.equal(log.stopped, 1);
  } finally { restore(); }
});
