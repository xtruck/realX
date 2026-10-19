// S13d: advice about a chosen photo, from its face landmarks and a small luminance sample of the PHOTO (never the camera).
// Pure: no DOM, nothing thrown on bad input. This is advice only: it never replaces or weakens the consent step.
// Every threshold below is a first guess and has not been tuned on real photos.

export const LIMITS = {
  faceWidthPass: 0.25, faceWidthWarn: 0.15,       // face width / image width
  faceCropPass: 256, faceCropWarn: 160,           // face width in pixels of the original photo
  poseDegPass: 12, poseDegWarn: 20,               // yaw, pitch, roll
  eyeOpenPass: 0.2, eyeOpenWarn: 0.12,            // eye height / eye width
  gazePass: 0.12, gazeWarn: 0.2,                  // iris offset from the middle of the eye, in eye widths
  mouthPass: 0.1, mouthWarn: 0.3,                 // inner lip gap / mouth width
  lightPass: 0.75, lightWarn: 0.55,               // darker cheek / brighter cheek
  sharpPass: 60, sharpWarn: 25,                   // variance of a Laplacian on the face crop (0..255 luminance)
  glassesPass: 0.03, glassesWarn: 0.012,          // same share as page.js GLASSES_SHARE: at or above 0.03 is a fail, 0.012 a warn
  hairPass: 0.1, hairWarn: 0.25,                  // share of the forehead covered by hair
};

const fin = (v) => typeof v === "number" && Number.isFinite(v);
const pt = (lm, i) => { const p = lm && lm[i]; return p && fin(p.x) && fin(p.y) ? p : null; };
const dist = (a, b, ax = 1) => Math.hypot((a.x - b.x) * ax, a.y - b.y);
const deg = (r) => r * 180 / Math.PI;
// lower is better: pass up to `pass`, warn up to `warn`, fail beyond
const lowIs = (v, pass, warn) => (v <= pass ? "pass" : v <= warn ? "warn" : "fail");
// higher is better
const highIs = (v, pass, warn) => (v >= pass ? "pass" : v >= warn ? "warn" : "fail");

/** Face width (fraction of the picture) and yaw, pitch, roll in degrees from the mesh; null when the key points are missing. */
export function faceMetrics(lm, aspect = 1) {
  const ax = fin(aspect) && aspect > 0 ? aspect : 1;
  const need = [234, 454, 10, 152, 1, 33, 133, 362, 263].map((i) => pt(lm, i));
  if (need.some((p) => !p)) return null;
  const [l, r, top, chin, nose, e1a, e1b, e2a, e2b] = need;
  const z = (i) => (lm[i] && fin(lm[i].z) ? lm[i].z : 0);
  const width = Math.abs(r.x - l.x);
  const roll = deg(Math.atan2((e2a.y + e2b.y) / 2 - (e1a.y + e1b.y) / 2, ((e2a.x + e2b.x) / 2 - (e1a.x + e1b.x) / 2) * ax));
  // z is in about the same unit as x (MediaPipe), so a turned head shows as a depth difference between the cheeks
  const yaw = deg(Math.atan2(z(454) - z(234), Math.max(1e-6, width * ax)));
  const pitch = deg(Math.atan2(z(152) - z(10), Math.max(1e-6, Math.abs(chin.y - top.y))));
  return { l, r, top, chin, nose, width, yaw, pitch, roll };
}

function eyeRatio(lm, up, down, a, b) {
  const u = pt(lm, up), d = pt(lm, down), c = pt(lm, a), e = pt(lm, b);
  if (!u || !d || !c || !e) return null;
  const w = dist(c, e);
  return w > 1e-9 ? dist(u, d) / w : null;
}

function gazeOffset(lm) {
  if (!lm || lm.length < 478) return null;
  const one = (iris, a, b) => {
    const i = pt(lm, iris), c = pt(lm, a), e = pt(lm, b);
    if (!i || !c || !e) return null;
    const dx = e.x - c.x;
    return Math.abs(dx) > 1e-9 ? Math.abs((i.x - c.x) / dx - 0.5) : null;
  };
  const a = one(468, 33, 133), b = one(473, 362, 263);
  return a === null ? b : b === null ? a : Math.max(a, b);
}

function meanLum(s, cx, cy, rad) {
  const x0 = Math.max(0, Math.floor(cx - rad)), x1 = Math.min(s.width - 1, Math.ceil(cx + rad));
  const y0 = Math.max(0, Math.floor(cy - rad)), y1 = Math.min(s.height - 1, Math.ceil(cy + rad));
  let sum = 0, n = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const v = s.data[y * s.width + x]; if (fin(v)) { sum += v; n++; } }
  return n > 0 ? sum / n : null;
}

export function sampleOk(s) {
  return !!s && s.width >= 3 && s.height >= 3 && !!s.data && s.data.length >= s.width * s.height;
}

/** Variance of a 4-neighbour Laplacian over the box (sample pixels); null when the box is too small or the sample unusable. */
export function laplacianVariance(s, x0, y0, x1, y1) {
  if (!sampleOk(s) || ![x0, y0, x1, y1].every(fin)) return null;
  x0 = Math.max(1, Math.floor(x0)); y0 = Math.max(1, Math.floor(y0));
  x1 = Math.min(s.width - 2, Math.ceil(x1)); y1 = Math.min(s.height - 2, Math.ceil(y1));
  if (!(x1 - x0 >= 2 && y1 - y0 >= 2)) return null;
  const w = s.width, d = s.data;
  let sum = 0, sq = 0, n = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const v = d[y * w + x - 1] + d[y * w + x + 1] + d[(y - 1) * w + x] + d[(y + 1) * w + x] - 4 * d[y * w + x];
    if (!fin(v)) continue;
    sum += v; sq += v * v; n++;
  }
  if (n === 0) return null;
  const m = sum / n;
  return sq / n - m * m;
}

/**
 * Share of the forehead covered by hair, from the segmenter's class map of the PHOTO (class 1 = hair). The forehead is the box between
 * the top of the face (10) and the brow line (9), between the temples (109 and 338). null when it cannot be told.
 */
export function foreheadHairShare(classes, width, height, lm) {
  const a = pt(lm, 109), b = pt(lm, 338), t = pt(lm, 10), e = pt(lm, 9);
  if (!classes || !(width > 0) || !(height > 0) || classes.length !== width * height || !a || !b || !t || !e) return null;
  const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(t.y, e.y), y1 = Math.max(t.y, e.y);
  let n = 0, hair = 0;
  for (let y = Math.max(0, Math.floor(y0 * height)); y <= Math.min(height - 1, Math.floor(y1 * height)); y++) {
    for (let x = Math.max(0, Math.floor(x0 * width)); x <= Math.min(width - 1, Math.floor(x1 * width)); x++) { n++; if (classes[y * width + x] === 1) hair++; }
  }
  return n > 0 ? hair / n : null;
}

const MSG = {
  size: { pass: "The face is big enough in the picture.", warn: "The face is a bit small in the picture. A closer photo works better.", fail: "The face is too small in the picture. Use a closer photo." },
  resolution: { pass: "The face has enough detail.", warn: "The face is a little low in detail. A larger photo works better.", fail: "The face has too few pixels. Use a larger photo." },
  pose: { pass: "The head faces the camera.", warn: "The head is a little turned or tilted. Face the camera straight on.", fail: "The head is turned or tilted too much. Use a front-facing photo." },
  eyes: { pass: "The eyes are open.", warn: "The eyes look half closed. Open eyes work better.", fail: "The eyes look closed. Use a photo with open eyes." },
  gaze: { pass: "The gaze is roughly centred.", warn: "The eyes look a little to the side.", fail: "The eyes look far to the side. Look at the camera." },
  mouth: { pass: "The mouth is closed.", warn: "The mouth is slightly open. A closed mouth works better.", fail: "The mouth is wide open. Use a photo with a closed mouth." },
  light: { pass: "The light is even on both cheeks.", warn: "One cheek is darker than the other.", fail: "The light is very uneven. Use a photo lit from the front." },
  sharp: { pass: "The photo is sharp.", warn: "The photo is a little soft.", fail: "The photo looks blurry. Use a sharper one." },
  glasses: { pass: "No glasses found.", warn: "Glasses may be in the photo. They can smear the result.", fail: "Glasses are in the photo. They can smear the result." },
  hair: { pass: "The forehead is clear.", warn: "Hair covers part of the forehead.", fail: "Hair covers much of the forehead. Use a photo with the forehead visible." },
  faces: { pass: "One face in the photo.", warn: "", fail: "There is more than one face. Use a photo of one person." },
};
const SKIP = (what) => `${what} was not checked.`;

/**
 * lm: the photo's face mesh (468 or 478 normalised points). sample: {width, height, data} luminance 0..255 of the whole photo, possibly
 * downscaled. extra: {imageWidth, imageHeight (original pixels), faceCount, glassesShare, foreheadHair}; any may be missing.
 * Returns {score 0..100, worst, checks:[{id, level: pass|warn|fail|skip, message}]}. Never throws.
 */
export function photoQuality(lm, sample, extra = {}) {
  const checks = [];
  const add = (id, level, message) => checks.push({ id, level, message: message || (MSG[id] && MSG[id][level]) || "" });
  try {
    extra = extra || {};
    const aspect = fin(extra.imageWidth) && fin(extra.imageHeight) && extra.imageHeight > 0 ? extra.imageWidth / extra.imageHeight : (sampleOk(sample) ? sample.width / sample.height : 1);
    const m = faceMetrics(lm, aspect);
    const faces = extra.faceCount;
    if (fin(faces)) add("faces", faces === 1 ? "pass" : "fail", faces < 1 ? "No face was found in the photo." : undefined);
    else add("faces", "skip", SKIP("The number of faces"));
    if (!m) {
      add("size", "fail", "The face could not be measured in this photo.");
    } else {
      const wFrac = m.width;
      add("size", highIs(wFrac, LIMITS.faceWidthPass, LIMITS.faceWidthWarn));
      if (fin(extra.imageWidth) && extra.imageWidth > 0) add("resolution", highIs(wFrac * extra.imageWidth, LIMITS.faceCropPass, LIMITS.faceCropWarn));
      else add("resolution", "skip", SKIP("The size in pixels"));
      add("pose", lowIs(Math.max(Math.abs(m.yaw), Math.abs(m.pitch), Math.abs(m.roll)), LIMITS.poseDegPass, LIMITS.poseDegWarn));
      const eyes = [eyeRatio(lm, 159, 145, 33, 133), eyeRatio(lm, 386, 374, 362, 263)].filter((v) => v !== null && fin(v));
      if (eyes.length) add("eyes", highIs(Math.min(...eyes), LIMITS.eyeOpenPass, LIMITS.eyeOpenWarn));
      else add("eyes", "skip", SKIP("The eyes"));
      const g = gazeOffset(lm);
      if (g !== null && fin(g)) add("gaze", lowIs(g, LIMITS.gazePass, LIMITS.gazeWarn));
      else add("gaze", "skip", SKIP("The gaze"));
      const up = pt(lm, 13), lo = pt(lm, 14), c1 = pt(lm, 61), c2 = pt(lm, 291);
      if (up && lo && c1 && c2 && dist(c1, c2) > 1e-9) add("mouth", lowIs(dist(up, lo) / dist(c1, c2), LIMITS.mouthPass, LIMITS.mouthWarn));
      else add("mouth", "skip", SKIP("The mouth"));
      if (sampleOk(sample)) {
        const rad = Math.max(1, 0.06 * wFrac * sample.width);
        const a = pt(lm, 205), b = pt(lm, 425);
        const la = a ? meanLum(sample, a.x * sample.width, a.y * sample.height, rad) : null;
        const lb = b ? meanLum(sample, b.x * sample.width, b.y * sample.height, rad) : null;
        if (la !== null && lb !== null && Math.max(la, lb) > 1e-6) add("light", highIs(Math.min(la, lb) / Math.max(la, lb), LIMITS.lightPass, LIMITS.lightWarn));
        else add("light", "skip", SKIP("The lighting"));
        const v = laplacianVariance(sample, Math.min(m.l.x, m.r.x) * sample.width, m.top.y * sample.height, Math.max(m.l.x, m.r.x) * sample.width, m.chin.y * sample.height);
        if (v !== null && fin(v)) add("sharp", highIs(v, LIMITS.sharpPass, LIMITS.sharpWarn));
        else add("sharp", "skip", SKIP("The sharpness"));
      } else {
        add("light", "skip", SKIP("The lighting")); add("sharp", "skip", SKIP("The sharpness"));
      }
    }
    if (fin(extra.glassesShare)) add("glasses", extra.glassesShare >= LIMITS.glassesPass ? "fail" : extra.glassesShare >= LIMITS.glassesWarn ? "warn" : "pass");
    else add("glasses", "skip", SKIP("Glasses"));
    if (fin(extra.foreheadHair)) add("hair", lowIs(extra.foreheadHair, LIMITS.hairPass, LIMITS.hairWarn));
    else add("hair", "skip", SKIP("Hair on the forehead"));
  } catch (err) {
    add("error", "skip", "The photo check could not finish.");
  }
  const counted = checks.filter((c) => c.level !== "skip");
  const pts = { pass: 1, warn: 0.5, fail: 0 };
  const score = counted.length ? Math.round(100 * counted.reduce((s, c) => s + pts[c.level], 0) / counted.length) : 0;
  const worst = counted.some((c) => c.level === "fail") ? "fail" : counted.some((c) => c.level === "warn") ? "warn" : counted.length ? "pass" : "skip";
  return { score, worst, checks };
}
