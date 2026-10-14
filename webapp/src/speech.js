// Speech-driven mouth, voice activity and audio/video sync, as plain logic.
// No DOM and no Web Audio objects: everything takes numbers in and gives numbers out, so it is tested
// with made-up signals. mic.js feeds it; nothing here can reach a microphone or the network.
//
// Mouth shapes follow the VRM presets: aa = "a", ih = "i", ou = "u", ee = "e", oh = "o".

const VISEMES = ["aa", "ih", "ou", "ee", "oh"];
const finite = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const clamp01 = (v) => (finite(v) ? clamp(v, 0, 1) : 0);
const zeroMouth = () => ({ aa: 0, ih: 0, ou: 0, ee: 0, oh: 0 });

// --- voice activity ---------------------------------------------------------------------------------
export class VoiceActivity {
  /**
   * onDb / offDb   dB above the noise floor that start / keep speech going (hysteresis)
   * hangoverMs     keep "speaking" this long after the sound drops, so gaps between words do not chop it
   * riseDbPerS     how fast the floor may follow a louder room (slow: speech must not teach it to ignore speech)
   * fallDbPerS     how fast it follows a quieter room (fast)
   */
  constructor({ hangoverMs = 200, onDb = 10, offDb = 5, riseDbPerS = 1.5, fallDbPerS = 60, minFloorDb = -100 } = {}) {
    this.cfg = { hangoverMs, onDb, offDb, riseDbPerS, fallDbPerS, minFloorDb };
    this.floor = null; this.speaking = false; this.lastLoud = -Infinity; this.t = null;
  }

  /** levelDb: loudness in dBFS (<= 0); tMs: time in ms. Returns { speaking, level 0..1, floorDb }. */
  update(levelDb, tMs) {
    const c = this.cfg;
    const t = finite(tMs) && (this.t === null || tMs >= this.t) ? tMs : this.t ?? 0;
    const dt = this.t === null ? 0 : (t - this.t) / 1000;
    this.t = t;
    // a bad reading is treated as "nothing new": exactly the floor
    let db = finite(levelDb) ? clamp(levelDb, c.minFloorDb, 0) : this.floor ?? c.minFloorDb;

    if (this.floor === null) this.floor = db;
    else if (db < this.floor) this.floor = Math.max(db, this.floor - c.fallDbPerS * dt);
    else this.floor = Math.min(db, this.floor + (this.speaking ? c.riseDbPerS * 0.25 : c.riseDbPerS) * dt);
    this.floor = clamp(this.floor, c.minFloorDb, 0);

    const above = db - this.floor;
    if (!this.speaking && above >= c.onDb) { this.speaking = true; this.lastLoud = t; }
    if (this.speaking) {
      if (above >= c.offDb) this.lastLoud = t;
      else if (t - this.lastLoud > c.hangoverMs) this.speaking = false;
    }
    const level = this.speaking ? clamp01((above - c.offDb) / 30) : 0;
    return { speaking: this.speaking, level, floorDb: this.floor };
  }
}

// --- vowel shape from a spectrum --------------------------------------------------------------------
// Where the first two formants (F1, F2) sit decides the vowel. Prototype values in Hz.
const PROTOTYPES = { aa: [700, 1100], ih: [300, 2300], ou: [300, 800], ee: [500, 1800], oh: [500, 900] };
const SIGMA = 0.25;            // how fast a vowel stops matching, in octaves
const BAND = [200, 3200];      // Hz searched for formants
const MIN_PEAK_GAP = 250;      // Hz between F1 and F2
const PEAK_RANGE_DB = 25;      // a peak this far below the strongest is ignored
const SMOOTH = 2;              // bins each side, averaged in power

/**
 * freqDb: dB per bin (an AnalyserNode's getFloatFrequencyData). Returns { aa, ih, ou, ee, oh, open }:
 * the five weights add up to `open` (0 for silence or flat noise, up to 1 for a clear voiced sound).
 */
export function visemeFromSpectrum(freqDb, sampleRate, fftSize) {
  const out = { ...zeroMouth(), open: 0 };
  if (!freqDb || typeof freqDb === "string" || !finite(freqDb.length) || freqDb.length < 8) return out;
  if (!finite(sampleRate) || sampleRate <= 0 || !finite(fftSize) || fftSize <= 0) return out;
  const binHz = sampleRate / fftSize;
  const lo = Math.max(1, Math.ceil(BAND[0] / binHz)), hi = Math.min(freqDb.length - 2, Math.floor(BAND[1] / binHz));
  if (hi - lo < 6) return out;

  const db = (k) => { const v = freqDb[k]; return finite(v) ? clamp(v, -140, 20) : -140; };
  const power = new Float64Array(freqDb.length);
  for (let k = 0; k < freqDb.length; k++) power[k] = 10 ** (db(k) / 10);
  const env = new Float64Array(freqDb.length);                // smoothed spectrum, in dB, over the band
  for (let k = lo; k <= hi; k++) {
    let s = 0, n = 0;
    for (let j = Math.max(0, k - SMOOTH); j <= Math.min(freqDb.length - 1, k + SMOOTH); j++) { s += power[j]; n++; }
    env[k] = 10 * Math.log10(s / n + 1e-14);
  }

  const band = Array.from(env.subarray(lo, hi + 1)).sort((a, b) => a - b);
  const maxDb = band[band.length - 1], medianDb = band[band.length >> 1];
  const open = clamp01((maxDb - medianDb - 6) / 24);        // how far a voice stands out of the background
  if (open <= 0) return out;

  const peaks = [];                                          // local maxima, strongest first
  for (let k = lo + 1; k < hi; k++) {
    if (env[k] >= env[k - 1] && env[k] > env[k + 1] && env[k] >= maxDb - PEAK_RANGE_DB) {
      const l = env[k - 1], c = env[k], r = env[k + 1], d = l - 2 * c + r;
      const shift = d < -1e-9 ? clamp(0.5 * (l - r) / d, -0.5, 0.5) : 0;   // parabola through the top three bins
      peaks.push({ hz: (k + shift) * binHz, db: c });
    }
  }
  if (!peaks.length) return out;
  peaks.sort((a, b) => b.db - a.db);
  const first = peaks[0];
  const second = peaks.find((p) => Math.abs(p.hz - first.hz) >= MIN_PEAK_GAP) ?? first;
  const [f1, f2] = first.hz <= second.hz ? [first.hz, second.hz] : [second.hz, first.hz];

  const dist = {};
  for (const v of VISEMES) {
    const [p1, p2] = PROTOTYPES[v];
    dist[v] = Math.log2(f1 / p1) ** 2 + Math.log2(f2 / p2) ** 2;
  }
  const best = Math.min(...Object.values(dist));
  let total = 0;
  const w = {};
  for (const v of VISEMES) { w[v] = Math.exp(-(dist[v] - best) / (2 * SIGMA * SIGMA)); total += w[v]; }
  for (const v of VISEMES) out[v] = (w[v] / total) * open;
  out.open = open;
  return out;
}

// --- mouth from audio -------------------------------------------------------------------------------
export class MouthFromAudio {
  constructor({ attackMs = 40, releaseMs = 120, ...vad } = {}) {
    this.attackMs = attackMs; this.releaseMs = releaseMs;
    this.vad = new VoiceActivity(vad);
    this.state = zeroMouth(); this.t = null;
  }

  /** frame: { levelDb, freqDb, sampleRate, fftSize }. Returns { aa, ih, ou, ee, oh, speaking, level }. */
  update(frame, tMs) {
    const f = frame && typeof frame === "object" ? frame : {};
    const v = this.vad.update(f.levelDb, tMs);
    const t = this.vad.t;
    const dt = this.t === null ? 0 : Math.max(0, t - this.t);
    this.t = t;
    const shape = v.speaking ? visemeFromSpectrum(f.freqDb, f.sampleRate, f.fftSize) : null;
    const loud = 0.5 + 0.5 * v.level;                        // louder speech opens the mouth wider
    for (const k of VISEMES) {
      const target = shape ? clamp01(shape[k] * loud) : 0;
      const tau = target > this.state[k] ? this.attackMs : this.releaseMs;
      this.state[k] += (target - this.state[k]) * (dt > 0 ? 1 - Math.exp(-dt / tau) : 0);
      if (this.state[k] < 1e-6) this.state[k] = 0;
    }
    return { ...this.state, speaking: v.speaking, level: v.level };
  }
}

// --- tracked mouth versus audio mouth ---------------------------------------------------------------
const cleanMouth = (m) => {
  const out = zeroMouth();
  if (m && typeof m === "object") for (const k of VISEMES) out[k] = clamp01(m[k]);
  return out;
};

export class MouthBlender {
  /**
   * While the face is tracked with confidence, the tracked mouth is used. When confidence drops (or the face
   * is lost) the audio mouth takes over, crossfaded over `fadeMs`, and back again on recovery. The two
   * thresholds form a dead band so a flickering confidence does not flap between sources.
   */
  constructor({ fadeMs = 150, onConfidence = 0.6, offConfidence = 0.45 } = {}) {
    this.fadeMs = Math.max(1, fadeMs); this.on = onConfidence; this.off = offConfidence;
    this.mix = 1;                 // 0 = all tracked, 1 = all audio; starts on audio until a face earns trust
    this.useTracked = false; this.t = null;
    this.last = zeroMouth();      // the most recent tracked mouth
  }

  update(tracked, confidence, audio, tMs) {
    const c = clamp01(confidence);
    const hasTracked = !!tracked && typeof tracked === "object";
    if (!hasTracked) this.useTracked = false;
    else if (!this.useTracked && c >= this.on) this.useTracked = true;
    else if (this.useTracked && c < this.off) this.useTracked = false;

    const t = finite(tMs) && (this.t === null || tMs >= this.t) ? tMs : this.t ?? 0;
    const dt = this.t === null ? 0 : t - this.t;
    this.t = t;
    const target = this.useTracked ? 0 : 1;
    const step = dt / this.fadeMs;
    this.mix = clamp01(this.mix < target ? Math.min(target, this.mix + step) : Math.max(target, this.mix - step));

    // when the face is lost, fade out from the last mouth it showed rather than snapping it to closed
    const a = hasTracked ? (this.last = cleanMouth(tracked)) : this.last, b = cleanMouth(audio);
    const out = {};
    for (const k of VISEMES) out[k] = clamp01((1 - this.mix) * a[k] + this.mix * b[k]);
    out.mix = this.mix;
    out.source = this.mix <= 0.001 ? "tracked" : this.mix >= 0.999 ? "audio" : "mixed";
    return out;
  }
}

// --- delay and sync ---------------------------------------------------------------------------------
export class DelayLine {
  /** Remembers recent values so one stream can be shown later than it arrived. Bounded by age and by count. */
  constructor({ maxAgeMs = 2000, maxSize = 512 } = {}) {
    this.maxAge = maxAgeMs; this.maxSize = Math.max(1, maxSize); this.items = [];
  }

  get size() { return this.items.length; }

  push(value, tMs) {
    if (!finite(tMs)) return;
    const last = this.items.length ? this.items[this.items.length - 1][0] : -Infinity;
    const t = Math.max(tMs, last);                           // never reorder: an early timestamp is clamped
    this.items.push([t, value]);
    while (this.items.length > this.maxSize || t - this.items[0][0] > this.maxAge) this.items.shift();
  }

  /** The newest value at least `delayMs` old at time `tMs`; undefined if nothing is that old yet. */
  read(tMs, delayMs) {
    if (!finite(tMs) || !finite(delayMs)) return undefined;
    const cutoff = tMs - Math.max(0, delayMs);
    for (let i = this.items.length - 1; i >= 0; i--) if (this.items[i][0] <= cutoff) return this.items[i][1];
    return undefined;
  }
}

const MAX_SYNC_DELAY_MS = 250;

/**
 * How late each stream arrives (ms) -> how much to hold back the earlier one so they line up.
 * offsetMs is video latency minus audio latency: positive means the sound comes before the picture.
 */
export function avSyncOffset(latency) {
  const l = latency && typeof latency === "object" ? latency : {};
  const audio = finite(l.audioLatencyMs) ? Math.max(0, l.audioLatencyMs) : 0;
  const video = finite(l.videoLatencyMs) ? Math.max(0, l.videoLatencyMs) : 0;
  const offsetMs = Math.round(video - audio) || 0;
  return {
    delayAudioMs: offsetMs > 0 ? Math.min(offsetMs, MAX_SYNC_DELAY_MS) : 0,
    delayVideoMs: offsetMs < 0 ? Math.min(-offsetMs, MAX_SYNC_DELAY_MS) : 0,
    offsetMs,
  };
}

/** A few words a person can read: "in sync", "audio ahead by 80 ms", "video ahead by 80 ms". */
export function describeSync(offsetMs) {
  if (!finite(offsetMs)) return "unknown";
  if (Math.abs(offsetMs) < 20) return "in sync";
  return offsetMs > 0 ? `audio ahead by ${Math.round(offsetMs)} ms` : `video ahead by ${Math.round(-offsetMs)} ms`;
}
