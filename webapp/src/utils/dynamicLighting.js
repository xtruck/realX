// Dynamic lighting: tint and dim the scene's ambient light after a picture (the background the character
// stands in front of). Plain logic plus a tiny 16x16 canvas sampler.
//
// Privacy: this is NEVER pointed at the camera. realX promises that the camera picture only goes to MediaPipe
// and is never drawn to a canvas or read back (tests/test_tracking_browser.py). Feed it a background image only.

export const SAMPLE_SIZE = 16;
export const MIN_INTENSITY = 0.2;   // the character never goes fully dark
export const MAX_INTENSITY = 1.2;

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, k) => a + (b - a) * k;

// Rec. 709 relative luminance of 0..1 channels
export const luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/**
 * Mean colour of RGBA bytes (e.g. ImageData.data). Fully transparent pixels are ignored; pixels are weighted by alpha.
 * Returns { r, g, b } in 0..1 and { luma } in 0..1, or null when nothing is visible.
 */
export function averageColor(rgba) {
  let r = 0, g = 0, b = 0, w = 0;
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    const a = rgba[i + 3] / 255;
    if (a <= 0) continue;
    r += rgba[i] * a; g += rgba[i + 1] * a; b += rgba[i + 2] * a; w += a;
  }
  if (w === 0) return null;
  const color = { r: r / w / 255, g: g / w / 255, b: b / w / 255 };
  return { ...color, luma: luminance(color.r, color.g, color.b) };
}

/** Light tint from an average colour: the colour pulled halfway to white so a red wall tints, not reddens. */
export function tintOf({ r, g, b }, strength = 0.5) {
  const mix = (c) => lerp(1, c, strength);
  return { r: mix(r), g: mix(g), b: mix(b) };
}

/** Target ambient intensity from brightness: dark pictures give dimmer light, never below `min`. */
export function intensityOf(luma, { min = MIN_INTENSITY, max = MAX_INTENSITY } = {}) {
  return clamp(lerp(min, max, clamp(luma, 0, 1)), min, max);
}

/** Frame-rate independent smoothing factor for a time constant `tau` seconds. */
export const smoothing = (dt, tau) => 1 - Math.exp(-Math.max(0, dt) / Math.max(1e-6, tau));

/** Reads a 16x16 thumbnail of `source` (an <img>, <canvas> or <video> of a BACKGROUND, not the camera). */
export function makeCanvasSampler(source, { size = SAMPLE_SIZE, createCanvas = () => document.createElement("canvas") } = {}) {
  const canvas = createCanvas();
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  return () => {
    try {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(source, 0, 0, size, size);
      return ctx.getImageData(0, 0, size, size).data;
    } catch (e) { return null; }   // not loaded yet, or a tainted picture: keep the current light
  };
}

/**
 * ambient, sun   anything with .color {r,g,b settable via .setRGB or fields} and .intensity (Three.js lights)
 * sample         () => RGBA bytes | null, called at most every `intervalMs`
 * update(nowMs, dtSeconds) moves the lights toward the target; call it once per rendered frame.
 */
export class DynamicLighting {
  constructor({ ambient, sun = null, sample, intervalMs = 500, tau = 0.8, minIntensity = MIN_INTENSITY, maxIntensity = MAX_INTENSITY, sunShare = 0.75 }) {
    Object.assign(this, { ambient, sun, sample, intervalMs, tau, minIntensity, maxIntensity, sunShare });
    this.sunBase = sun ? sun.intensity : 0;
    this.enabled = true;
    this.lastSample = -Infinity;
    this.target = { tint: { r: 1, g: 1, b: 1 }, intensity: ambient.intensity };
    this.shown = { r: ambient.color.r, g: ambient.color.g, b: ambient.color.b, intensity: ambient.intensity };
  }
  setEnabled(on) { this.enabled = !!on; }
  update(nowMs, dt) {
    if (!this.enabled) return;
    if (nowMs - this.lastSample >= this.intervalMs) {
      this.lastSample = nowMs;
      const avg = averageColor(this.sample() ?? []);
      if (avg) this.target = { tint: tintOf(avg), intensity: intensityOf(avg.luma, { min: this.minIntensity, max: this.maxIntensity }) };
    }
    const k = smoothing(dt, this.tau), s = this.shown, t = this.target;
    s.r = lerp(s.r, t.tint.r, k); s.g = lerp(s.g, t.tint.g, k); s.b = lerp(s.b, t.tint.b, k);
    s.intensity = lerp(s.intensity, t.intensity, k);
    const lit = Math.max(this.minIntensity, s.intensity);
    this.ambient.color.setRGB ? this.ambient.color.setRGB(s.r, s.g, s.b) : Object.assign(this.ambient.color, { r: s.r, g: s.g, b: s.b });
    this.ambient.intensity = lit;
    if (this.sun) {
      this.sun.color.setRGB ? this.sun.color.setRGB(s.r, s.g, s.b) : Object.assign(this.sun.color, { r: s.r, g: s.g, b: s.b });
      this.sun.intensity = this.sunBase * lerp(1, lit, this.sunShare);   // follows the ambient brightness, more gently (ambient 1.0 = unchanged)
    }
  }
}
