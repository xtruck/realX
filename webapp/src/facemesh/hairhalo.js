// Gap #2, the hair halo: when the photo's hairstyle is shorter than the live user's hair, the live hair shows round the photo's head.
// The photo's hair is widened and softened INSIDE the head ring: a ring pixel just outside the photo's head silhouette (above the nose
// line) is drawn in the colour of the nearest photo head pixel, with a soft falloff. Only the photo and its head mask are sampled
// (16 taps, and only for ring pixels outside the silhouette); no new model, nothing is read back from the camera. Plain numbers here;
// haloScale() feeds the shader and haloPick() is the same rule in JavaScript so it can be tested (the shader in compositor.js mirrors it).

export const HALO = Object.freeze({
  reach: 0.25,        // at amount 1 the photo's hair grows outwards by this fraction of the face width (outer tap ring)
  defaultAmount: 0.5, // slider default (50%)
  inner: 0.5,         // the inner tap ring sits at this fraction of the outer radius
  innerWeight: 1.0,   // a head pixel found on the inner ring counts fully, ...
  outerWeight: 0.6,   // ... one found only on the outer ring counts this much: the edge fades out
  lo: 0.62, hi: 0.92, // the same head-mask gate the shader uses for the silhouette itself
  blur: 0.12,         // BLUR in compositor.js: u_rp is this fraction of the face width
  taps: 8,            // directions per ring
});

/** A slider value (0..1) made safe: not a number is 0, the rest is clamped. */
export function haloAmount(v) { const n = Number(v); return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0; }

/** The multiplier the shader applies to u_rp (the colour-match radius) for the outer tap ring; 0 switches the effect off. */
export function haloScale(amount) { return haloAmount(amount) * HALO.reach / HALO.blur; }

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/**
 * The rule the shader follows. `ring` is 16 samples { m: head mask 0..1, w: weight } (inner ring first, then outer); returns
 * { cover, index }: how much extra photo head to draw here (0..1) and which tap's colour to use (-1 for none).
 * The best-scoring tap wins, so the colour is that of the nearest head pixel, not a blur with the background.
 */
export function haloPick(ring) {
  let best = 0, index = -1;
  ring.forEach((t, i) => {
    const s = smooth(HALO.lo, HALO.hi, t.m) * t.w;
    if (s > best) { best = s; index = i; }
  });
  return { cover: best, index };
}

/** The ring's weights in the order the shader walks them: the inner taps, then the outer taps. */
export function haloWeights() {
  return [...Array(HALO.taps).fill(HALO.innerWeight), ...Array(HALO.taps).fill(HALO.outerWeight)];
}

/** The total opacity of a ring pixel once the halo is added: the silhouette's own, or the halo's cover, whichever is more (never less). */
export function withHalo(head, cover, amount) { return Math.max(head, haloAmount(amount) > 0 ? cover : 0); }
