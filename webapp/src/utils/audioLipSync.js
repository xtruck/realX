// Hybrid lip sync helpers: how much to trust the camera's mouth, and a plain amplitude -> mouth mapping for when
// the sound has to take over. Plain logic plus one small Web Audio wrapper; no camera pixels are ever touched
// (the mouth-cover test uses landmark NUMBERS only), and audio never leaves the page.
//
// The crossfade itself lives in speech.js (MouthBlender: audio takes over below 0.45 confidence, the camera
// comes back above 0.6). This file supplies the confidence it needs.

const finite = (v) => typeof v === "number" && Number.isFinite(v);
const clamp01 = (v) => (finite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0);

// --- audio level ------------------------------------------------------------------------------------
/** Root-mean-square energy of float samples in -1..1. Non-finite samples count as silence. */
export function rmsOf(samples) {
  if (!samples || !samples.length) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) { const v = samples[i]; if (finite(v)) sum += v * v; }
  return Math.sqrt(sum / samples.length);
}
/** dBFS of an RMS value, floored at -100 for silence. */
export const rmsToDb = (rms) => (rms > 1e-5 ? 20 * Math.log10(rms) : -100);

/**
 * Amplitude -> mouth opening for "aa" (the jaw). Below `floorDb` the mouth is shut; at `fullDb` it is wide open.
 * `floorDb` should be the room's noise floor plus a margin, so room noise does not move the mouth.
 */
export function amplitudeToAa(levelDb, { floorDb = -50, fullDb = -20 } = {}) {
  if (!finite(levelDb) || fullDb <= floorDb) return 0;
  return clamp01((levelDb - floorDb) / (fullDb - floorDb));
}

/**
 * Makes sure a speaking audio mouth opens at least as far as the loudness says: the spectral vowel guess can come
 * out empty on a muffled or noisy sound, and a talking character with a shut mouth reads as broken.
 */
export function withAmplitudeFloor(audioMouth, levelDb, opts) {
  const a = audioMouth || {};
  if (!a.speaking) return { ...a, aa: clamp01(a.aa) };
  const open = ["aa", "ih", "ou", "ee", "oh"].reduce((s, k) => s + clamp01(a[k]), 0);
  const floor = 0.6 * amplitudeToAa(levelDb, opts);
  return open >= floor ? a : { ...a, aa: clamp01((a.aa || 0) + (floor - open)) };
}

// --- is the camera's mouth believable? --------------------------------------------------------------
// MediaPipe gives no confidence for the face landmarks, so it is built from what can be observed:
//   1. no face            -> 0
//   2. a hand over the mouth (landmark positions only) -> low
//   3. the voice is clearly speaking while the tracked mouth stays shut -> low (a cup, a mask, bad light)
const MOUTH_CORNERS = [61, 291], LIP_TOP = 0, LIP_BOTTOM = 17;

/** Mouth box (normalized image coordinates) from face landmarks, or null. */
export function mouthBox(faceLandmarks, margin = 0.5) {
  const L = faceLandmarks;
  if (!L || L.length < 292) return null;
  const [a, b, t, u] = [L[MOUTH_CORNERS[0]], L[MOUTH_CORNERS[1]], L[LIP_TOP], L[LIP_BOTTOM]];
  if (![a, b, t, u].every((p) => p && finite(p.x) && finite(p.y))) return null;
  const w = Math.abs(b.x - a.x), h = Math.max(Math.abs(u.y - t.y), w * 0.4);
  const cx = (a.x + b.x) / 2, cy = (t.y + u.y) / 2;
  return { x0: cx - w * (0.5 + margin), x1: cx + w * (0.5 + margin), y0: cy - h * (0.5 + margin), y1: cy + h * (0.5 + margin) };
}

/** 0..1: how much of a hand sits on the mouth. Counts hand landmarks (21 per hand) inside the box; 4+ means covered. */
export function mouthCover(faceLandmarks, hands) {
  const box = mouthBox(faceLandmarks);
  if (!box || !hands || !hands.length) return 0;
  let inside = 0;
  for (const h of hands) {
    const pts = h && h.image;
    if (!pts) continue;
    for (const p of pts) if (p && p.x >= box.x0 && p.x <= box.x1 && p.y >= box.y0 && p.y <= box.y1) inside++;
  }
  return clamp01(inside / 4);
}

export class FaceConfidence {
  /** disagreeMs: how long speech with a shut tracked mouth must last before the camera is distrusted. */
  constructor({ disagreeMs = 500, speakingAbove = 0.15, shutBelow = 0.04 } = {}) {
    Object.assign(this, { disagreeMs, speakingAbove, shutBelow });
    this.since = null;
  }
  /**
   * faceSeen   a face was tracked this frame
   * cover      mouthCover() 0..1
   * trackedAa  the camera's jawOpen-driven "aa" 0..1
   * audio      { speaking, level 0..1 } or null when there is no microphone
   * Returns confidence 0..1.
   */
  update({ faceSeen, cover = 0, trackedAa = 0, audio = null }, tMs) {
    if (!faceSeen) { this.since = null; return 0; }
    let c = 1 - 0.9 * clamp01(cover);
    const loud = !!audio && audio.speaking && clamp01(audio.level) >= this.speakingAbove;
    if (loud && clamp01(trackedAa) < this.shutBelow) {
      if (this.since === null) this.since = tMs;
      if (tMs - this.since >= this.disagreeMs) c = Math.min(c, 0.3);
    } else this.since = null;
    return c;
  }
}

// --- microphone wrapper -----------------------------------------------------------------------------
/**
 * Opens an AudioContext + AnalyserNode on a microphone MediaStream and reports { rms, levelDb, t } every
 * `intervalMs`. (The avatar page itself uses mic.js, which adds the spectrum; this is the small standalone form.)
 * `env` lets tests pass fakes for AudioContext and the timer.
 */
export function createAudioLipSync(stream, onLevel, { intervalMs = 25, fftSize = 1024, env = globalThis } = {}) {
  const Context = env.AudioContext ?? env.webkitAudioContext;
  if (!Context) throw new Error("Web Audio is not available in this browser.");
  const ctx = new Context();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0;
  ctx.createMediaStreamSource(stream).connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  const timer = (env.setInterval ?? setInterval)(() => {
    analyser.getFloatTimeDomainData(buf);
    const rms = rmsOf(buf);
    onLevel({ rms, levelDb: rmsToDb(rms), t: (env.performance ?? performance).now() });
  }, intervalMs);
  return {
    stop() { (env.clearInterval ?? clearInterval)(timer); try { Promise.resolve(ctx.close()).catch(() => {}); } catch (e) { /* closed */ } },
  };
}
