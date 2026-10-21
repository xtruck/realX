// Draws a photo wrapped on the tracked face mesh (steps S2-S3), on a transparent WebGL canvas laid over the live camera <video>.
//
// Privacy rule, and the exceptions (the first reviewed and granted for step S3; the second, S10c, requested by the owner and recorded in
// docs/FACEMESH.md, awaiting his explicit confirmation):
//  * The camera picture is never READ BACK. Nothing here, or anywhere in the page, may call readPixels, getImageData,
//    toDataURL, toBlob, drawImage, createImageBitmap, capture or record it, or send it anywhere. The result of the colour
//    work goes to the screen and nowhere else.
//  * The exception: `uploadCamera` hands the current video frame to the graphics card as a texture, once per drawn frame,
//    while colour matching is on, and (S10c) while "Show my hands on top" is on. The shader reads it to take the live face's colour and lighting (a blurred
//    copy) and give them to the photo's detail, so the photo does not look like a sticker. That one method is the only
//    place the video is named; facemesh.test.mjs checks it, and a browser test counts real read-back calls (must be 0).
import { LEFT_EYE, RIGHT_EYE, TRIANGLE_COUNT, VERTEX_COUNT, blendShape, edgeDepth, faceBox, flatten, keepMask, mouthKeepWeights, shapeWeights } from "./mesh.js";
import { HEAD_VERTEX_COUNT, REACH, RING_TRIANGLES, headFade, neckAnchor, ringFlag, ringPoints, ringTriangles } from "./head.js";

const FADE_STEPS = 3;   // the picture fades in over this many rings of triangles from the edge of the face
const RING_MATCH = 0.35;   // how much of the live colour the head ring takes (the face takes the Colour match setting in full)
const SPOTS = [10, 1, 50, 280, 152];   // mesh points whose brightness stands for the face's own skin level: forehead, nose tip, cheeks, chin
const BLUR = 0.12;      // colour is matched at the scale of this fraction of the face width

const VERT = `attribute vec2 a_pos; attribute vec2 a_uv; attribute float a_fade; attribute float a_keep; attribute float a_ring;
varying vec2 v_uv; varying vec2 v_scr; varying float v_fade; varying float v_keep; varying float v_ring;
void main() {
  v_uv = a_uv; v_scr = a_pos; v_fade = a_fade; v_keep = a_keep; v_ring = a_ring;
  gl_Position = vec4(a_pos.x * 2.0 - 1.0, 1.0 - a_pos.y * 2.0, 0.0, 1.0);
}`;

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv; varying vec2 v_scr; varying float v_fade; varying float v_keep; varying float v_ring;
uniform sampler2D u_photo; uniform sampler2D u_cam; uniform sampler2D u_mask;
uniform float u_head; uniform float u_ringMatch;
uniform float u_keepEyes; uniform float u_match; uniform float u_keep; uniform float u_opacity; uniform vec2 u_rl; uniform vec2 u_rp;
uniform float u_relight; uniform vec2 u_lp[5]; uniform vec2 u_pp[5];   // S11: lighting-only match, see lightOf()
uniform float u_glasses; uniform vec2 u_eyeA; uniform vec2 u_eyeB; uniform vec2 u_eyeAsp;   // S11: the photo's spectacles (see glassesBand)

// 13 taps: the centre and two hexagon rings. A cheap blur whose size follows the face.
vec3 soften(sampler2D t, vec2 c, vec2 r) {
  const float h = 0.8660254;
  vec3 s = texture2D(t, c).rgb;
  s += texture2D(t, c + vec2( 1.0, 0.0) * r).rgb + texture2D(t, c + vec2( 0.5,  h) * r).rgb + texture2D(t, c + vec2(-0.5,  h) * r).rgb;
  s += texture2D(t, c + vec2(-1.0, 0.0) * r).rgb + texture2D(t, c + vec2(-0.5, -h) * r).rgb + texture2D(t, c + vec2( 0.5, -h) * r).rgb;
  s += texture2D(t, c + vec2( 2.0, 0.0) * r).rgb + texture2D(t, c + vec2( 1.0,  2.0 * h) * r).rgb + texture2D(t, c + vec2(-1.0,  2.0 * h) * r).rgb;
  s += texture2D(t, c + vec2(-2.0, 0.0) * r).rgb + texture2D(t, c + vec2(-1.0, -2.0 * h) * r).rgb + texture2D(t, c + vec2( 1.0, -2.0 * h) * r).rgb;
  return s / 13.0;
}

float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
// the average brightness of a face from five spots on it (forehead, nose, both cheeks, chin): the face's own skin level
float lightOf(sampler2D t, vec2 p[5], vec2 r) {
  float s = 0.0;
  for (int i = 0; i < 5; i++) s += lum(texture2D(t, p[i]).rgb) + lum(texture2D(t, p[i] + r).rgb) + lum(texture2D(t, p[i] - r).rgb);
  return s / 15.0;
}
vec3 toYcc(vec3 c) { float y = lum(c); return vec3(y, (c.b - y) * 0.564, (c.r - y) * 0.713); }
vec3 fromYcc(vec3 q) { float r = q.x + q.z / 0.713, b = q.x + q.y / 0.564; return vec3(r, (q.x - 0.299 * r - 0.114 * b) / 0.587, b); }
// S11b, the live eyes and mouth that are kept: the live pixel, but its SKIN (the lids, the lips' surround) moves to the photo's skin tone so
// the kept parts do not sit on the face as lighter or darker patches. Not-skin pixels (the whites, the iris, the teeth) are left alone.
float skinWeight(vec3 cam) {
  vec3 s = toYcc((texture2D(u_cam, u_lp[2]).rgb + texture2D(u_cam, u_lp[3]).rgb) * 0.5);
  return (1.0 - smoothstep(0.07, 0.15, distance(toYcc(cam).yz, s.yz))) * u_relight;
}
vec3 liveKept(vec3 cam) {
  vec3 s = toYcc((texture2D(u_cam, u_lp[2]).rgb + texture2D(u_cam, u_lp[3]).rgb) * 0.5);
  vec3 t = toYcc((texture2D(u_photo, u_pp[2]).rgb + texture2D(u_photo, u_pp[3]).rgb) * 0.5);
  vec3 q = toYcc(cam);
  float w = (1.0 - smoothstep(0.05, 0.12, distance(q.yz, s.yz))) * u_relight;
  q.yz += w * (t.yz - s.yz);
  q.x *= mix(1.0, clamp(t.x / max(s.x, 0.04), 0.3, 3.0), w);
  return clamp(fromYcc(q), 0.0, 1.0);
}
float glassesBand() {
  vec2 d = (v_uv - u_eyeA) * u_eyeAsp, e = (u_eyeB - u_eyeA) * u_eyeAsp;
  float t = clamp(dot(d, e) / max(dot(e, e), 1e-6), -0.6, 1.6);
  float band = 1.0 - smoothstep(0.34, 0.5, length(d - e * t) / sqrt(max(dot(e, e), 1e-6)));
  // not the eyes themselves (lids, lashes, iris): an ellipse around each eye, long along the eye line, short across it
  float len = sqrt(max(dot(e, e), 1e-6));
  vec2 ax = e / len, pr = vec2(-ax.y, ax.x);
  vec2 da = d, db = d - e;
  vec2 ea = vec2(dot(da, ax), dot(da, pr)) / len, eb = vec2(dot(db, ax), dot(db, pr)) / len;
  float eyeA = 1.0 - smoothstep(0.7, 1.0, length(ea * vec2(1.0 / 0.26, 1.0 / 0.13)));
  float eyeB = 1.0 - smoothstep(0.7, 1.0, length(eb * vec2(1.0 / 0.26, 1.0 / 0.13)));
  return band * (1.0 - max(eyeA, eyeB));
}

// ---- S13b: make the photo look filmed by the live webcam. All measuring is done here on the GPU; no camera pixel is ever read back to JavaScript. ----
uniform float u_webcam; uniform vec2 u_camTexel; uniform float u_seed;   // strength 0..1 (0 = off, exactly the old picture), one camera texel, a number that changes every frame
float hf(sampler2D t, vec2 c, vec2 e) {   // fine detail of the luminance at c: the centre against the mean of its four neighbours e away
  return abs(lum(texture2D(t, c).rgb) - 0.25 * (lum(texture2D(t, c + vec2(e.x, 0.0)).rgb) + lum(texture2D(t, c - vec2(e.x, 0.0)).rgb) + lum(texture2D(t, c + vec2(0.0, e.y)).rgb) + lum(texture2D(t, c - vec2(0.0, e.y)).rgb)));
}
vec3 frameMean(sampler2D t) {   // 3 x 3 grid over the whole picture: its average colour
  vec3 s = vec3(0.0);
  for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) s += texture2D(t, vec2(0.2 + 0.3 * float(i), 0.2 + 0.3 * float(j))).rgb;
  return s / 9.0;
}
float frameSpread(sampler2D t, float m) {   // and the spread of its brightness (contrast)
  float s = 0.0;
  for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) { float d = lum(texture2D(t, vec2(0.2 + 0.3 * float(i), 0.2 + 0.3 * float(j))).rgb) - m; s += d * d; }
  return sqrt(s / 9.0);
}
vec3 webcamLook(vec3 c, float visible) {
  float k = u_webcam * visible;
  // 1. blur: live fine detail against the photo's, at the same fraction of the face width, on the cheeks. A softer webcam softens the photo.
  vec2 el = u_rl * 0.25, ep = u_rp * 0.25;
  float liveHf = 0.25 * (hf(u_cam, u_lp[2], el) + hf(u_cam, u_lp[3], el) + hf(u_cam, u_lp[2] + el, el) + hf(u_cam, u_lp[3] - el, el));
  float photoHf = 0.25 * (hf(u_photo, u_pp[2], ep) + hf(u_photo, u_pp[3], ep) + hf(u_photo, u_pp[2] + ep, ep) + hf(u_photo, u_pp[3] - ep, ep));
  float sharp = clamp(liveHf / max(photoHf, 0.004), 0.35, 1.0);              // below 1: the live face is softer than the photo
  c = mix(c, soften(u_photo, v_uv, u_rp * 0.3), (1.0 - sharp) * 0.8 * k);
  // 3. grade: contrast and white balance of the whole live frame against the whole photo, nudged a little (at most 12% and 4%), the photo's face level kept
  vec3 mc = frameMean(u_cam), mp = frameMean(u_photo);
  float con = clamp(frameSpread(u_cam, lum(mc)) / max(frameSpread(u_photo, lum(mp)), 0.02), 0.88, 1.12);
  vec3 wb = clamp((mc / max(lum(mc), 0.02)) / max(mp / max(lum(mp), 0.02), vec3(0.05)), 0.96, 1.04);
  float pivot = lightOf(u_photo, u_pp, u_rp * 0.5);
  c = mix(vec3(pivot), c, mix(1.0, con, 0.5 * k));
  c *= mix(vec3(1.0), wb, 0.5 * k);
  // 2. grain: the live frame's own noise, measured at texel scale on two flat cheek patches, added fresh every frame; a little less in the highlights, none in pure black
  float noise = 0.25 * (hf(u_cam, u_lp[2], u_camTexel) + hf(u_cam, u_lp[3], u_camTexel) + hf(u_cam, u_lp[2] + el, u_camTexel) + hf(u_cam, u_lp[3] - el, u_camTexel));
  float amp = clamp(noise, 0.0, 0.04) * 1.4;
  float y = lum(c);
  float n = fract(sin(dot(v_scr * 997.0 + vec2(u_seed, u_seed * 1.7), vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  float n2 = fract(sin(dot(v_scr * 613.0 + vec2(u_seed * 2.3, u_seed), vec2(39.346, 11.135))) * 24634.6345) - 0.5;
  c += (n * vec3(1.0) + 0.3 * n2 * vec3(1.0, -0.5, 0.8)) * 2.0 * amp * mix(1.0, 0.6, smoothstep(0.4, 0.95, y)) * smoothstep(0.0, 0.06, y) * k;
  return clamp(c, 0.0, 1.0);
}
// ---- end S13b ----

void main() {
  vec3 photo = texture2D(u_photo, v_uv).rgb;
  vec3 matched = photo;
  if (u_match > 0.0 && u_relight > 0.0) {
    // S11, lighting only: the photo keeps ITS OWN skin colour and detail; from the live face it takes only where the light falls.
    // gain = (how bright the live face is here compared with its own average) / (the same for the photo), so a dark-skinned photo on
    // a light-skinned face stays dark-skinned, and a purple room light does not tint it. Spectacles are smoothed away first.
    vec3 p = photo;
    if (u_glasses > 0.0) {
      float gb = u_glasses * glassesBand();
      p = mix(photo, soften(u_photo, v_uv, u_rp * 0.5), gb * 0.7);
      // the lenses tint and wash the skin behind them (a grey haze): pull the colour of the band to the clean cheek's, keep its light
      vec3 q = toYcc(p), c = toYcc((texture2D(u_photo, u_pp[2]).rgb + texture2D(u_photo, u_pp[3]).rgb) * 0.5);
      q.yz = mix(q.yz, c.yz, gb * 0.3);
      q.x = mix(q.x, min(q.x, c.x * 1.05), gb);   // and glare is cut to the cheek's brightness (brows and lashes, being darker, stay)
      p = clamp(fromYcc(q), 0.0, 1.0);
    }
    // a wide blur (twice the colour-match scale) so only the broad light and shade is followed, not patches, noise or the live face's own features
    float live = lum(soften(u_cam, v_scr, u_rl * 2.0)) / max(lightOf(u_cam, u_lp, u_rl * 0.5), 0.03);
    float ref = lum(soften(u_photo, v_uv, u_rp * 2.0)) / max(lightOf(u_photo, u_pp, u_rp * 0.5), 0.03);
    matched = clamp(p * mix(1.0, clamp(live / max(ref, 0.05), 0.9, 1.12), u_relight * 0.5), 0.0, 1.0);
  } else if (u_match > 0.0) {
    // the photo's detail (what is left when its own blur is taken away) on top of the live face's colour and light
    // limited, so strong edges in the photo (lips, glasses' glare) do not leave bright halos on the live colours
    vec3 detail = clamp(photo - soften(u_photo, v_uv, u_rp), -0.16, 0.16);
    if (u_glasses > 0.0) detail *= 1.0 - u_glasses * glassesBand() * 0.85;   // spectacles: frames and glare are fine detail along the eye line
    matched = clamp(soften(u_cam, v_scr, u_rl) + detail, 0.0, 1.0);
  }
  // whole head: the ring around the face keeps most of the photo's own colour (the live picture there is hair or room, not skin)
  // and is drawn only where the photo itself is head (hair, skin, accessories), never its background or clothes
  vec3 colour = mix(photo, matched, u_match * (1.0 - v_ring * (1.0 - u_ringMatch)));
  float inside = step(0.0, v_uv.x) * step(v_uv.x, 1.0) * step(0.0, v_uv.y) * step(v_uv.y, 1.0);
  float ringW = clamp(v_ring * 4.0, 0.0, 1.0);   // S11h: v_ring runs 0 to 1 across the inner band of the ring; the mask must act on all of it
  float head = mix(1.0, smoothstep(0.62, 0.92, texture2D(u_mask, v_uv).r) * inside, ringW * u_head);   // S11h: the edge is taken from inside the head, or the photo's background shows as a light halo
  if (u_webcam > 0.0 && u_match > 0.0) colour = webcamLook(colour, step(0.002, smoothstep(0.0, 1.0, v_fade) * u_opacity * head));   // S13b: never where nothing is drawn
  float keepAmt = u_keep * smoothstep(0.35, 1.0, v_keep) + u_keepEyes * smoothstep(0.35, 1.0, -v_keep);   // S11e: the inside of the mouth (+1) and of the eyes (-1) stay live when asked; S12d: the wider fade also softens the patch edge at the cheeks
  if (u_relight > 0.0 && u_match > 0.0 && keepAmt > 0.0) {      // the kept live eyes and mouth are drawn by us, in the photo's skin tone
    colour = mix(colour, liveKept(texture2D(u_cam, v_scr).rgb), keepAmt);
    keepAmt = 0.0;
  }
  // S11h: a studio backdrop is sometimes called "head" by the segmenter next to the hair and skin. In the ring, a photo pixel that is both
  // bright and nearly colourless is the backdrop (skin has colour, hair is dark): it is not drawn.
  if (u_head > 0.0 && ringW > 0.0) {
    float chroma = max(photo.r, max(photo.g, photo.b)) - min(photo.r, min(photo.g, photo.b));
    head *= 1.0 - ringW * (1.0 - smoothstep(0.06, 0.14, chroma)) * smoothstep(0.38, 0.58, lum(photo));
  }
  float alpha = smoothstep(0.0, 1.0, v_fade) * (1.0 - keepAmt) * u_opacity * head;
  // S11i, the neck: below the chin, the live person's own neck (and ear) is wider than the photo's and shows as pale streaks beside it.
  // Where the live pixel is SKIN (near the live cheek's chroma; walls and clothes are not) and the photo has no neck, it is drawn in the photo's skin tone.
  float neckX = 1.0 - smoothstep(0.6, 0.85, abs(v_uv.x - (u_pp[2].x + u_pp[3].x) * 0.5) / max(abs(u_pp[3].x - u_pp[2].x), 0.02));   // only as wide as a neck, so a beige wall beside it is left alone
  if (u_relight > 0.0 && u_head > 0.0 && v_ring > 0.0 && v_uv.y > u_pp[4].y - 0.02 && u_match > 0.0) {
    vec3 cam = texture2D(u_cam, v_scr).rgb;
    // S13a: the skin test runs on a blurred live picture. On the raw pixel the camera's own 8x8 compression blocks flipped it from pixel to pixel
    // and the neck showed as a checkerboard (seen on a real webcam); the colour itself stays the live pixel.
    float w = skinWeight(soften(u_cam, v_scr, u_rl)) * neckX * (1.0 - head) * v_ring * smoothstep(0.0, 0.5, v_fade + 0.5) * u_opacity;
    if (w > 0.0) {
      float a = max(alpha, w);
      colour = mix(liveKept(cam), colour, alpha / max(a, 1e-4));
      alpha = a;
    }
  }
  gl_FragColor = vec4(colour * alpha, alpha);
}`;

// Step S9, moving hair: the photo's pixels on the hair sheet of hairsim.js, drawn BEHIND the face. Only the PHOTO is sampled
// here (its colour and its hair mask); the camera is not touched.
const HAIR_VERT = `attribute vec2 a_pos; attribute vec2 a_uv; varying vec2 v_uv;
void main() { v_uv = a_uv; gl_Position = vec4(a_pos.x * 2.0 - 1.0, 1.0 - a_pos.y * 2.0, 0.0, 1.0); }`;
const HAIR_FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv; uniform sampler2D u_photo; uniform sampler2D u_hair; uniform float u_opacity;
// S14, the join between the body puppet and the head: u_join (0 = off, exactly the old picture; the hair layer always passes 0).
uniform sampler2D u_cam; uniform float u_join; uniform float u_headOn; uniform vec2 u_texel; uniform vec2 u_lp[5]; uniform vec2 u_pp[5]; uniform vec2 u_jr;
float lumJ(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
float spotJ(sampler2D t, vec2 c, vec2 r) { return (lumJ(texture2D(t, c).rgb) + lumJ(texture2D(t, c + r).rgb) + lumJ(texture2D(t, c - r).rgb)) / 3.0; }
void main() {
  float inside = step(0.0, v_uv.x) * step(v_uv.x, 1.0) * step(0.0, v_uv.y) * step(v_uv.y, 1.0);
  float m = texture2D(u_hair, v_uv).r;
  float a = smoothstep(0.35, 0.65, m);
  vec3 col = texture2D(u_photo, v_uv).rgb;
  // ---- S14 join: feather + light match ----
  if (u_join > 0.0) {
    // 1. feathered edge: a 5-tap blur of the mask read through a wider ramp, so sleeve, shoulder and neck edges fall off over ~4 mask texels instead of a hard step
    vec2 e = u_texel * 2.0;
    float soft = 0.2 * (m + texture2D(u_hair, v_uv + vec2(e.x, 0.0)).r + texture2D(u_hair, v_uv - vec2(e.x, 0.0)).r + texture2D(u_hair, v_uv + vec2(0.0, e.y)).r + texture2D(u_hair, v_uv - vec2(0.0, e.y)).r);
    a = mix(a, smoothstep(0.1, 0.9, soft), u_join);
    // 2. neck line: with the head drawn, the puppet thins a little just under the chin, where the head's own neck takes over (never below 60%)
    float chinY = u_pp[4].y, fh = max(abs(u_pp[4].y - u_pp[0].y), 0.02);
    float nf = smoothstep(chinY + 0.05 * fh, chinY + 0.4 * fh, v_uv.y);
    a *= mix(1.0, mix(0.6, 1.0, nf), u_headOn * u_join);
    // 3. light match: how much brighter the live face's chin is than its cheeks, against the photo's; the puppet takes that ratio (clamped 0.85-1.15),
    // strongest at the chin and gone 1.2 face heights lower, so it meets the live-lit head without a step. Measured on the GPU, on the head's own spots.
    float live = spotJ(u_cam, u_lp[4], u_jr) / max(0.5 * (spotJ(u_cam, u_lp[2], u_jr) + spotJ(u_cam, u_lp[3], u_jr)), 0.03);
    float ref = spotJ(u_photo, u_pp[4], u_jr) / max(0.5 * (spotJ(u_photo, u_pp[2], u_jr) + spotJ(u_photo, u_pp[3], u_jr)), 0.03);
    float nearChin = 1.0 - smoothstep(chinY, chinY + 1.2 * fh, v_uv.y);
    col = clamp(col * mix(1.0, clamp(live / max(ref, 0.05), 0.85, 1.15), nearChin * u_join), 0.0, 1.0);
  }
  // ---- end S14 join ----
  a *= inside * u_opacity;
  gl_FragColor = vec4(col * a, a);
}`;

// Step S10c, your hands on top: the live picture drawn only inside the soft shapes around the tracked hands (handlayer.js), so the
// photo's sleeves do not cover your hands or what you hold. THE SAME EXCEPTION as colour matching: the picture reaches the graphics
// card only through uploadCamera(), is only sampled by this shader, and goes to the screen and nowhere else. Never read back.
const LIVE_VERT = `attribute vec2 a_pos; attribute float a_alpha; varying vec2 v_scr; varying float v_alpha;
void main() { v_scr = a_pos; v_alpha = a_alpha; gl_Position = vec4(a_pos.x * 2.0 - 1.0, 1.0 - a_pos.y * 2.0, 0.0, 1.0); }`;
// Step S10h, skin-tone matching for the hands: u_skin (0 = off) moves the SKIN-coloured pixels of the live hand towards the photo
// person's skin. The two reference colours are both taken on the graphics card: the live one from the camera texture beside the live
// cheek (u_livePos), the photo one from the photo beside its cheek (u_photoPos). A pixel counts as skin when its chroma is near the live
// reference, so a bottle, a sleeve or a ring is left alone. No read-back: the colours never reach the CPU.
const LIVE_FRAG = `precision mediump float;
varying vec2 v_scr; varying float v_alpha; uniform sampler2D u_cam; uniform sampler2D u_photo; uniform float u_opacity;
uniform float u_skin; uniform vec2 u_livePos; uniform vec2 u_photoPos; uniform vec2 u_liveR; uniform vec2 u_photoR;
vec3 toYcc(vec3 c) { return vec3(dot(c, vec3(0.299, 0.587, 0.114)), (c.b - dot(c, vec3(0.299, 0.587, 0.114))) * 0.564, (c.r - dot(c, vec3(0.299, 0.587, 0.114))) * 0.713); }
vec3 fromYcc(vec3 y) { float r = y.x + y.z / 0.713; float b = y.x + y.y / 0.564; return vec3(r, (y.x - 0.299 * r - 0.114 * b) / 0.587, b); }
vec3 around(sampler2D t, vec2 c, vec2 r) {
  return (texture2D(t, c).rgb + texture2D(t, c + vec2(r.x, 0.0)).rgb + texture2D(t, c - vec2(r.x, 0.0)).rgb + texture2D(t, c + vec2(0.0, r.y)).rgb + texture2D(t, c - vec2(0.0, r.y)).rgb) / 5.0;
}
void main() {
  vec3 cam = texture2D(u_cam, v_scr).rgb;
  if (u_skin > 0.0) {
    vec3 s = toYcc(around(u_cam, u_livePos, u_liveR)), t = toYcc(around(u_photo, u_photoPos, u_photoR)), p = toYcc(cam);
    float w = (1.0 - smoothstep(0.04, 0.10, distance(p.yz, s.yz))) * u_skin;
    p.yz += w * (t.yz - s.yz);
    p.x += w * 0.5 * (t.x - s.x);
    cam = clamp(fromYcc(p), 0.0, 1.0);
  }
  float a = v_alpha * u_opacity; gl_FragColor = vec4(cam * a, a);
}`;

// Step S10g, spills and stains: coloured soft circles drawn over the shirt (stains.js). Nothing from the camera is used.
const STAIN_VERT = `attribute vec2 a_pos; attribute float a_alpha; attribute vec3 a_color; varying float v_alpha; varying vec3 v_color;
void main() { v_alpha = a_alpha; v_color = a_color; gl_Position = vec4(a_pos.x * 2.0 - 1.0, 1.0 - a_pos.y * 2.0, 0.0, 1.0); }`;
const STAIN_FRAG = `precision mediump float;
varying float v_alpha; varying vec3 v_color; uniform float u_opacity;
void main() { float a = v_alpha * u_opacity; gl_FragColor = vec4(v_color * a, a); }`;

/** S13b: a slider value (0..1) made safe: anything that is not a number is 0, the rest is clamped. */
export function lookStrength(v) { const n = Number(v); return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0; }

// --- S13c: clean seams (live hair and ears round the photo's head) --------------------------------------------------------------
// A soft patch of the photo's own background colour drawn UNDER the photo's layers wherever the live-frame segmenter (seammask.js) says
// there is live hair or body skin near the head, so the live hair does not show as a second hairline beside the photo's. It uses only the
// mask texture (never the camera picture) and the photo. The mask is the running value over several answers; the gate and the taps below
// make a soft edge. With the option off, no mask, or a stale one, this is not drawn at all.
const SEAM_FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_scr; varying float v_alpha; uniform sampler2D u_seam; uniform sampler2D u_photo; uniform float u_amount; uniform float u_opacity;
uniform vec4 u_zone;   // centre x, y and radii x, y of the area round the head where it may paint
uniform vec4 u_face;   // half-width and half-height of the live face (left alone), the chin line, the width of the skin cut-off
uniform vec2 u_tap;    // one tap step in screen units
float seamGate(float v) { return smoothstep(0.35, 0.65, v); }   // SEAM.lo / SEAM.hi in seams.js
void main() {
  vec2 mean = vec2(0.0), reach = vec2(0.0);
  for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) {
    vec2 v = texture2D(u_seam, v_scr + vec2(float(i), float(j)) * u_tap).rg;
    mean += v; reach = max(reach, v);
  }
  vec2 g = vec2(seamGate(mix(mean.x / 9.0, reach.x, 0.35)), seamGate(mix(mean.y / 9.0, reach.y, 0.35)));   // soft edge, a little reach
  float zone = 1.0 - smoothstep(0.8, 1.0, length((v_scr - u_zone.xy) / u_zone.zw));
  float face = smoothstep(0.85, 1.1, length((v_scr - u_zone.xy) / u_face.xy));
  float above = 1.0 - smoothstep(u_face.z - 0.02, u_face.z + u_face.w, v_scr.y);
  float a = max(g.x, g.y * above) * zone * face * u_amount * u_opacity * v_alpha;
  vec3 fill = (texture2D(u_photo, vec2(0.04, 0.05)).rgb + texture2D(u_photo, vec2(0.96, 0.05)).rgb + texture2D(u_photo, vec2(0.5, 0.02)).rgb
             + texture2D(u_photo, vec2(0.04, 0.4)).rgb + texture2D(u_photo, vec2(0.96, 0.4)).rgb) / 5.0;   // the photo's background, from its edges
  gl_FragColor = vec4(fill * a, a);
}`;

export class MeshCompositor {
  /** canvas: the WebGL canvas; mesh: buildMesh()'s result. Throws when WebGL is not available. */
  constructor(canvas, mesh) {
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) throw new Error("WebGL is not available in this browser");
    this.gl = gl; this.canvas = canvas; this.mesh = mesh;
    this.positions = new Float32Array(HEAD_VERTEX_COUNT * 2);   // 468 face points, then the head ring
    this.photo = null; this.camera = null; this.photoRing = null;
    this.photoRadius = [0.05, 0.05];
    this.look = { match: 1, shape: 0.5, keep: 1, keepEyes: 0, skin: 0, glasses: 0, relight: 1 };
    this.webcamLook = 0.6;            // S13b: how much the photo takes on the webcam's softness, noise and grade (0 = the old picture)
    this.frameNo = 0; this.camTexel = [1 / 640, 1 / 480];   // S13b: one camera pixel, noted in uploadCamera
    this.hairReach = REACH.top;       // S12b: how far the head ring reaches above the head (the photo's UV ring stays at the default, which is what makes the photo's hair grow with it)
    this.neck = { anchor: null, amount: 0.6 };   // S12a: where the photo's neck hangs from; null = the face's own middle
    this.bodyJoin = 0.7;              // S14: how much the body puppet's edges are feathered and its light matched to the head (0 = the old hard join)
    this.joinLive = false; this.joinHead = false; this.joinSpots = null;   // set each frame in draw()
    this.mouthShrink = 0.5;           // S12c: how much the live mouth patch pulls in towards the middle of the mouth (0 = the old full patch)
    this.photoEyes = [0.4, 0.45, 0.6, 0.45, 1, 1]; this.photoSpots = new Float32Array(10).fill(0.5);   // the photo's two eye centres and the aspect, for the glasses band (S11)
    this.photoCheek = [0.5, 0.5]; this.cheekR = [0.03, 0.03];   // where the photo's cheek is, in the photo (S10h)
    this.maskTex = null; this.head = false;   // whole head: the photo's head mask, and whether it is switched on
    this.program = link(gl, VERT, FRAG);
    gl.useProgram(this.program);
    const attr = (name) => gl.getAttribLocation(this.program, name);
    this.loc = { pos: attr("a_pos"), uv: attr("a_uv"), fade: attr("a_fade"), keep: attr("a_keep"), ring: attr("a_ring") };
    this.uni = Object.fromEntries(["u_photo", "u_cam", "u_mask", "u_head", "u_ringMatch", "u_match", "u_keep", "u_keepEyes", "u_opacity", "u_rl", "u_rp", "u_glasses", "u_eyeA", "u_eyeB", "u_eyeAsp", "u_relight", "u_lp", "u_pp", "u_webcam", "u_camTexel", "u_seed"].map((n) => [n, gl.getUniformLocation(this.program, n)]));
    this.posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions.byteLength, gl.DYNAMIC_DRAW);
    this.uvBuffer = gl.createBuffer();
    this.fadeBuffer = filled(gl, Float32Array.from(edgeDepth(mesh.triangles), (d) => Math.min(Math.max(d, 0) / FADE_STEPS, 1)));
    this.headFadeBuffer = filled(gl, headFade());
    const keep = keepMask();
    for (const v of [...LEFT_EYE, ...RIGHT_EYE]) keep[v] = -1;   // S11e: the eyes are marked -1 and the mouth +1, so the two can be switched separately
    this.baseKeep = keep;
    this.keepBuffer = gl.createBuffer();
    this._uploadKeep();                                          // S12c: the mouth weights depend on the photo, so the buffer is rebuilt when it changes
    this.ringBuffer = filled(gl, ringFlag());
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    const faceAndRing = new Uint16Array(mesh.triangles.length + RING_TRIANGLES * 3);   // the face's triangles, then the ring's
    faceAndRing.set(mesh.triangles); faceAndRing.set(ringTriangles(), mesh.triangles.length);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faceAndRing, gl.STATIC_DRAW);
    this.camera = emptyTexture(gl);   // a single transparent pixel until a frame is uploaded
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // premultiplied layers: the hair first, the face over it
    this.hair = null;               // S9: { count, triangles, uvBuffer, posBuffer, indexBuffer, maskTex, positions, on }
    this.hairProgram = link(gl, HAIR_VERT, HAIR_FRAG);
    this.hairLoc = { pos: gl.getAttribLocation(this.hairProgram, "a_pos"), uv: gl.getAttribLocation(this.hairProgram, "a_uv") };
    this.hairUni = Object.fromEntries(["u_photo", "u_hair", "u_opacity", "u_cam", "u_join", "u_headOn", "u_texel", "u_lp", "u_pp", "u_jr"].map((n) => [n, gl.getUniformLocation(this.hairProgram, n)]));
    this.hairDrawn = 0;
    this.body = null; this.bodyDrawn = 0;      // S10: the body and dress layer
    this.liveProgram = link(gl, LIVE_VERT, LIVE_FRAG);                  // S10c: your hands on top
    this.liveLoc = { pos: gl.getAttribLocation(this.liveProgram, "a_pos"), alpha: gl.getAttribLocation(this.liveProgram, "a_alpha") };
    this.liveUni = Object.fromEntries(["u_cam", "u_photo", "u_opacity", "u_skin", "u_livePos", "u_photoPos", "u_liveR", "u_photoR"].map((n) => [n, gl.getUniformLocation(this.liveProgram, n)]));
    this.live = { posBuffer: gl.createBuffer(), alphaBuffer: gl.createBuffer(), indexBuffer: gl.createBuffer(), indexCount: 0, on: false };
    this.liveDrawn = 0;
    this.stainProgram = link(gl, STAIN_VERT, STAIN_FRAG);                // S10g: spills and stains
    this.stainLoc = { pos: gl.getAttribLocation(this.stainProgram, "a_pos"), alpha: gl.getAttribLocation(this.stainProgram, "a_alpha"), color: gl.getAttribLocation(this.stainProgram, "a_color") };
    this.stainUni = { u_opacity: gl.getUniformLocation(this.stainProgram, "u_opacity") };
    this.stains = { posBuffer: gl.createBuffer(), alphaBuffer: gl.createBuffer(), colorBuffer: gl.createBuffer(), indexBuffer: gl.createBuffer(), indexCount: 0, on: false };
    this.stainsDrawn = 0;
    // S13c: clean seams
    this.seamProgram = link(gl, LIVE_VERT, SEAM_FRAG);
    this.seamLoc = { pos: gl.getAttribLocation(this.seamProgram, "a_pos"), alpha: gl.getAttribLocation(this.seamProgram, "a_alpha") };
    this.seamUni = Object.fromEntries(["u_seam", "u_photo", "u_amount", "u_opacity", "u_zone", "u_face", "u_tap"].map((n) => [n, gl.getUniformLocation(this.seamProgram, n)]));
    this.seam = { tex: gl.createTexture(), ready: false, amount: 0, zone: null, posBuffer: filled(gl, new Float32Array([0, 0, 0, 1, 1, 1, 1, 0])), alphaBuffer: filled(gl, new Float32Array([1, 1, 1, 1])) };
    this.seamDrawn = 0;
  }

  /** S13c: take the segmenter's answer (its hidden canvas, seammask.js) as the seam mask texture. Done once per answer, a few times a second. */
  setSeam(source) {
    const gl = this.gl;
    if (!source) return;
    gl.activeTexture(gl.TEXTURE7);
    gl.bindTexture(gl.TEXTURE_2D, this.seam.tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);   // the mask the segmenter drew: values only, no camera pixels
    setSampling(gl);
    this.seam.ready = true;
  }

  /** S13c: how much of the cleaning to draw, 0..1 (0 = the old look), and the zone round the head (seams.js headZone()). */
  setSeamAmount(amount, zone) {
    const a = Number(amount);
    this.seam.amount = Number.isFinite(a) ? Math.min(1, Math.max(0, a)) : 0;
    this.seam.zone = zone || null;
  }

  clearSeam() { this.seam.ready = false; this.seam.amount = 0; this.seamDrawn = 0; }

  _drawSeam(opacity, box, aspect) {
    const gl = this.gl, z = this.seam.zone;
    if (!this.seam.ready || !z || !(this.seam.amount > 0.002)) return 0;
    gl.useProgram(this.seamProgram);
    this.point(this.seam.posBuffer, this.seamLoc.pos, 2);
    this.point(this.seam.alphaBuffer, this.seamLoc.alpha, 1);
    gl.activeTexture(gl.TEXTURE7); gl.bindTexture(gl.TEXTURE_2D, this.seam.tex);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.photo);
    gl.uniform1i(this.seamUni.u_seam, 7);
    gl.uniform1i(this.seamUni.u_photo, 0);
    gl.uniform1f(this.seamUni.u_amount, this.seam.amount);
    gl.uniform1f(this.seamUni.u_opacity, Math.min(1, opacity));
    gl.uniform4f(this.seamUni.u_zone, z.cx, z.cy, z.rx, z.ry);
    gl.uniform4f(this.seamUni.u_face, z.fx, z.fy, z.chin, 0.1 * box.h);
    gl.uniform2f(this.seamUni.u_tap, 0.06 * box.w, 0.06 * box.w * aspect);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    return 1;
  }

  /** The stain circles for this frame (stains.js stainFans()'s result), or null for none. */
  setStains(fans) {
    const gl = this.gl, l = this.stains;
    if (!fans || fans.indices.length === 0) { l.on = false; l.indexCount = 0; return; }
    gl.bindBuffer(gl.ARRAY_BUFFER, l.posBuffer); gl.bufferData(gl.ARRAY_BUFFER, fans.positions, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, l.alphaBuffer); gl.bufferData(gl.ARRAY_BUFFER, fans.alphas, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, l.colorBuffer); gl.bufferData(gl.ARRAY_BUFFER, fans.colors, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, l.indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, fans.indices, gl.DYNAMIC_DRAW);
    l.indexCount = fans.indices.length; l.on = true;
  }

  _drawStains(opacity) {
    const gl = this.gl, l = this.stains;
    gl.useProgram(this.stainProgram);
    this.point(l.posBuffer, this.stainLoc.pos, 2);
    this.point(l.alphaBuffer, this.stainLoc.alpha, 1);
    this.point(l.colorBuffer, this.stainLoc.color, 3);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, l.indexBuffer);
    gl.uniform1f(this.stainUni.u_opacity, Math.min(1, opacity));
    gl.drawElements(gl.TRIANGLES, l.indexCount, gl.UNSIGNED_SHORT, 0);
    return l.indexCount / 3;
  }

  /** The shapes around the hands for this frame (handlayer.js handFans()'s result), or null to draw none. */
  setLiveHands(fans) {
    const gl = this.gl, l = this.live;
    if (!fans || fans.indices.length === 0) { l.on = false; l.indexCount = 0; return; }
    gl.bindBuffer(gl.ARRAY_BUFFER, l.posBuffer); gl.bufferData(gl.ARRAY_BUFFER, fans.positions, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, l.alphaBuffer); gl.bufferData(gl.ARRAY_BUFFER, fans.alphas, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, l.indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, fans.indices, gl.DYNAMIC_DRAW);
    l.indexCount = fans.indices.length; l.on = true;
  }

  get liveHandsReady() { return this.live.on; }

  /** Where the live cheeks are on the screen (middle of mesh points 50 and 280), for the skin reference of S10h. */
  liveCheek() {
    const p = this.positions;
    return [(p[50 * 2] + p[280 * 2]) / 2, (p[50 * 2 + 1] + p[280 * 2 + 1]) / 2];
  }

  _drawLive(opacity) {
    const gl = this.gl, l = this.live;
    gl.useProgram(this.liveProgram);
    this.point(l.posBuffer, this.liveLoc.pos, 2);
    this.point(l.alphaBuffer, this.liveLoc.alpha, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, l.indexBuffer);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.camera);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.photo);
    gl.uniform1i(this.liveUni.u_cam, 1);
    gl.uniform1i(this.liveUni.u_photo, 0);
    gl.uniform1f(this.liveUni.u_opacity, Math.min(1, opacity));
    gl.uniform1f(this.liveUni.u_skin, this.look.skin);
    if (this.look.skin > 0) {
      const c = this.liveCheek();
      gl.uniform2f(this.liveUni.u_livePos, c[0], c[1]);
      gl.uniform2f(this.liveUni.u_photoPos, this.photoCheek[0], this.photoCheek[1]);
      gl.uniform2f(this.liveUni.u_liveR, this.cheekR[0], this.cheekR[1]);
      gl.uniform2f(this.liveUni.u_photoR, this.photoRadius[0] * 0.5, this.photoRadius[1] * 0.5);
    }
    gl.drawElements(gl.TRIANGLES, l.indexCount, gl.UNSIGNED_SHORT, 0);
    return l.indexCount / 3;
  }

  // --- photo layers drawn behind the face: the body and dress (S10) and the moving hair (S9) ---------------------------------
  // A layer is the photo's pixels on a moving mesh, cut by a mask of the PHOTO. Only the photo is sampled; the camera is not touched.

  _makeLayer(geometry, mask, unit) {
    const gl = this.gl;
    const count = geometry.uv.length / 2;
    const maskTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, mask.width, mask.height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, mask.data);   // the photo's mask for this layer
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    setSampling(gl);
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, count * 8, gl.DYNAMIC_DRAW);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.triangles, gl.STATIC_DRAW);
    return { count, unit, texel: [1 / Math.max(1, mask.width), 1 / Math.max(1, mask.height)], triangles: geometry.triangles.length / 3, uvBuffer: filled(gl, geometry.uv), posBuffer, indexBuffer, maskTex, positions: new Float32Array(count * 2), on: false, halo: new Float32Array(count * 2), haloOn: false };
  }

  _freeLayer(layer) {
    if (!layer) return;
    const gl = this.gl;
    gl.deleteTexture(layer.maskTex);
    for (const b of [layer.uvBuffer, layer.posBuffer, layer.indexBuffer]) gl.deleteBuffer(b);
  }

  _placeLayer(layer, units, aspect) {
    if (!layer) return;
    if (!units || !(aspect > 0)) { layer.on = false; return; }
    const out = layer.positions;
    for (let i = 0; i < layer.count; i++) { out[2 * i] = units[2 * i] / aspect; out[2 * i + 1] = units[2 * i + 1]; }
    layer.on = true;
  }

  _drawLayer(layer, opacity) {
    const gl = this.gl;
    gl.useProgram(this.hairProgram);                // the same shader serves every photo layer: the photo's colour, cut by the layer's mask
    this.point(layer.posBuffer, this.hairLoc.pos, 2);
    this.point(layer.uvBuffer, this.hairLoc.uv, 2);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, layer.indexBuffer);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.photo);
    gl.activeTexture(gl.TEXTURE0 + layer.unit); gl.bindTexture(gl.TEXTURE_2D, layer.maskTex);
    gl.uniform1i(this.hairUni.u_photo, 0);
    gl.uniform1i(this.hairUni.u_hair, layer.unit);
    gl.uniform1f(this.hairUni.u_opacity, Math.min(1, opacity));
    const join = layer === this.body && this.joinLive && this.joinSpots ? this.bodyJoin : 0;   // S14: only the body, only with a live frame uploaded and a face placed
    gl.uniform1f(this.hairUni.u_join, join);
    if (join > 0) {
      gl.uniform1i(this.hairUni.u_cam, 1);          // the live frame stays bound to unit 1 from uploadCamera; the shader only samples it
      gl.uniform1f(this.hairUni.u_headOn, this.joinHead ? 1 : 0);
      gl.uniform2f(this.hairUni.u_texel, layer.texel[0], layer.texel[1]);
      gl.uniform2fv(this.hairUni.u_lp, this.joinSpots); gl.uniform2fv(this.hairUni.u_pp, this.photoSpots);
      gl.uniform2f(this.hairUni.u_jr, this.cheekR[0] * 0.5, this.cheekR[1] * 0.5);
    }
    let drawn = 0;
    for (const [positions, wanted] of [[layer.halo, layer.haloOn], [layer.positions, true]]) {   // the cover (S10e) first, then the layer itself
      if (!wanted) continue;
      gl.bindBuffer(gl.ARRAY_BUFFER, layer.posBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
      gl.drawElements(gl.TRIANGLES, layer.triangles * 3, gl.UNSIGNED_SHORT, 0);
      drawn = layer.triangles;
    }
    return drawn;
  }

  /**
   * Moving hair (step S9). `geometry` is hairsim.js buildHairSheet()'s result (texture coordinates and triangles), `mask` the
   * photo's hair mask ({ width, height, data }). Both come from the PHOTO. Pass null to forget the hair.
   */
  setHair(geometry, mask) {
    this.clearHair();
    if (geometry && mask) this.hair = this._makeLayer(geometry, mask, 3);
  }

  clearHair() { this._freeLayer(this.hair); this.hair = null; this.hairDrawn = 0; }

  get hairReady() { return this.hair !== null; }

  /** Where the hair points are this frame (hairsim's units: image heights, x already times the video's aspect) and that aspect. null stops drawing it. */
  setHairPositions(units, aspect) { this._placeLayer(this.hair, units, aspect); }

  /** The body and dress (step S10): `geometry` is puppet.js buildBodyPuppet()'s result, `mask` the photo's body-and-clothes mask. */
  setBody(geometry, mask) {
    this.clearBody();
    if (geometry && mask) this.body = this._makeLayer(geometry, mask, 4);
  }

  clearBody() { this._freeLayer(this.body); this.body = null; this.bodyDrawn = 0; }

  get bodyReady() { return this.body !== null; }

  setBodyPositions(units, aspect) { this._placeLayer(this.body, units, aspect); }

  /** A slightly bigger copy of the body drawn under it to hide the edges of the live person's own clothes (step S10e); null for none. */
  setBodyHalo(units, aspect) {
    const l = this.body;
    if (!l) return;
    if (!units || !(aspect > 0)) { l.haloOn = false; return; }
    for (let i = 0; i < l.count; i++) { l.halo[2 * i] = units[2 * i] / aspect; l.halo[2 * i + 1] = units[2 * i + 1]; }
    l.haloOn = true;
  }

  get hasPhoto() { return this.photo !== null; }

  /** True when the whole head is switched on AND this photo has a head mask: then the ring around the face is drawn too. */
  get headActive() { return this.head && this.maskTex !== null && this.photoRing !== null; }

  /**
   * The photo's head mask ({ width, height, data } of one byte per pixel, from head.js headMask) or null to forget it.
   * It is the PHOTO that was cut into classes, once; no camera frame is involved.
   */
  setHeadMask(mask) {
    const gl = this.gl;
    if (this.maskTex) { gl.deleteTexture(this.maskTex); this.maskTex = null; }
    if (!mask) return;
    this.maskTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.maskTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, mask.width, mask.height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, mask.data);   // the photo's head mask
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    setSampling(gl);
  }

  /** Whole head on or off (it only shows once a head mask is set). */
  setHead(on) { this.head = !!on; }

  /** S12b: how far the head ring reaches above the head, in face widths (0.3 to 1.2). Further out makes the photo's own hair cover more of the live head (a taller live hairstyle); the default is REACH.top. */
  setHairReach(reach) {
    const v = Number(reach);
    if (Number.isFinite(v)) this.hairReach = Math.min(1.2, Math.max(0.3, v));
  }

  /** S14: how much the body puppet's edges are feathered and its light matched to the head, 0 (the old hard join) to 1. */
  setBodyJoin(v) { this.bodyJoin = lookStrength(v); }

  /** S13b: how much the photo looks filmed by the live webcam, 0 (off, the old picture) to 1. */
  setWebcamLook(v) { this.webcamLook = lookStrength(v); }

  /** S12a: where the photo's neck hangs from. `anchor` is [x, y] normalised (the middle of the live shoulders) or null (the face's own middle stands in); `amount` 0..1 is how much the neck yields. */
  setNeckAnchor(anchor, amount = 0.6) {
    const a = Math.min(1, Math.max(0, Number(amount) || 0));
    const ok = anchor && anchor.length >= 2 && Number.isFinite(Number(anchor[0])) && Number.isFinite(Number(anchor[1]));
    this.neck = { anchor: ok ? [Number(anchor[0]), Number(anchor[1])] : null, amount: a };
  }

  /** S12c: how much the live mouth patch pulls in towards the middle of the mouth, 0 (the old full patch) to 1. Needs the photo's mouth to measure; it is applied again when a photo arrives. */
  setMouthShrink(shrink) {
    const v = Number(shrink);
    this.mouthShrink = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
    this._uploadKeep();
  }

  /** The keep values for every vertex: the eyes and the mouth of keepMask(), the mouth reweighted by S12c on the photo's own mouth. */
  _keepValues() {
    const mouth = (this.photoFlat && this.mouthShrink > 0) ? mouthKeepWeights(this.photoFlat, this.photoAspect, this.mouthShrink) : null;
    return Float32Array.from({ length: HEAD_VERTEX_COUNT }, (_, i) => (i < VERTEX_COUNT ? (mouth ? this.baseKeep[i] * mouth[i] : this.baseKeep[i]) : 0));
  }

  _uploadKeep() {
    if (!this.keepBuffer) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.keepBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._keepValues(), gl.DYNAMIC_DRAW);
  }

  /** How the photo is drawn: `match` 0..1 (how much of the live face's colour and light it takes), `keep` (live eyes and mouth show through). */
  setLook({ match = this.look.match, shape = this.look.shape, keep = this.look.keep, keepEyes = this.look.keepEyes, skin = this.look.skin, glasses = this.look.glasses, relight = this.look.relight } = {}) {
    this.look = { match: Math.min(1, Math.max(0, Number(match) || 0)), shape: Math.min(1, Math.max(0, Number(shape) || 0)), keep: keep ? 1 : 0, keepEyes: keepEyes ? 1 : 0, skin: Math.min(1, Math.max(0, Number(skin) || 0)), glasses: glasses ? 1 : 0, relight: relight ? 1 : 0 };
  }

  /**
   * `image` is the loaded photo (an <img>), `photoLandmarks` its face as the face model sees it: they say where each
   * mesh vertex sits in the photo, which is the texture coordinate of that vertex.
   */
  setPhoto(image, photoLandmarks) {
    const gl = this.gl;
    const flat = flatten(photoLandmarks);
    const box = faceBox(photoLandmarks);
    if (!flat || !box) throw new Error("the photo has no complete face");
    const w = image.naturalWidth || image.width, h = image.naturalHeight || image.height;
    // texture coordinates: the face's 468 points, then the same ring around the PHOTO's face that is built around the live one
    const ring = (w > 0 && h > 0) ? ringPoints(photoLandmarks, w / h) : null;
    const uv = new Float32Array(HEAD_VERTEX_COUNT * 2);
    uv.set(flat); if (ring) uv.set(ring, VERTEX_COUNT * 2);
    const max = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (!(w > 0 && h > 0) || w > max || h > max) throw new Error("this photo is too large for this graphics card: use a smaller one");
    if (this.photo) gl.deleteTexture(this.photo);
    this.photo = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.photo);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);   // the photo
    setSampling(gl);
    this.photoRing = ring;
    this.photoFlat = flat; this.photoAspect = w / h; this.shapeW = this.shapeW || shapeWeights();   // S11l: the photo's own face shape
    this._uploadKeep();                             // S12c: the mouth patch is measured on this photo's own mouth
    const eye = (a, b) => [(flat[a * 2] + flat[b * 2]) / 2, (flat[a * 2 + 1] + flat[b * 2 + 1]) / 2];   // the eye corners 33/133 and 362/263 of the face mesh
    const ea = eye(33, 133), eb = eye(362, 263);
    this.photoEyes = [ea[0], ea[1], eb[0], eb[1], w / h];
    this.photoSpots = Float32Array.from(SPOTS.flatMap((i) => [flat[i * 2], flat[i * 2 + 1]]));
    this.photoCheek = [(flat[50 * 2] + flat[280 * 2]) / 2, (flat[50 * 2 + 1] + flat[280 * 2 + 1]) / 2];
    this.setHeadMask(null);                         // a new photo has no mask until it has been cut
    this.clearHair();                               // and no moving hair
    this.clearBody();                               // and no body layer
    this.photoRadius = [BLUR * box.w, BLUR * box.w * (w / h)];
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
  }

  /** Forget the photo (the picture and its texture coordinates). */
  clearPhoto() {
    if (this.photo) this.gl.deleteTexture(this.photo);
    this.photo = null; this.photoRing = null;
    this.setHeadMask(null);
    this.clearHair(); this.clearBody(); this.setLiveHands(null); this.setStains(null);
    this.clear();
  }

  clear() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  /**
   * Draws the photo on the live face. `camera` is the live picture's element, used only to match colours (see the top of
   * this file); leave it out, or set match to 0, and the picture is not touched at all.
   * `opacity` (0..1) fades the whole photo, for a face that is being lost or covered; at 0 nothing is drawn.
   * Returns the number of triangles drawn: 0 when there is no photo, no face or no opacity.
   */
  draw(liveLandmarks, camera = null, opacity = 1, ringFactor = 1) {
    const gl = this.gl;
    this.clear();
    if (!this.photo || !(opacity > 0.002) || !flatten(liveLandmarks, this.positions)) return 0;
    const box = faceBox(liveLandmarks);
    const useCamera = this.look.match > 0 && camera !== null;          // colour matching
    const liveNow = this.live.on && camera !== null;                    // your hands on top
    if (useCamera || liveNow) this.uploadCamera(camera);
    const aspect = this.canvas.width / Math.max(1, this.canvas.height);
    if (this.photoFlat && this.look.shape > 0) this.shapeUsed = blendShape(this.positions, this.photoFlat, aspect, this.photoAspect, this.look.shape, this.shapeW);   // the face takes part of the photo's shape
    this.cheekR = [0.5 * BLUR * box.w, 0.5 * BLUR * box.w * aspect];
    let head = this.headActive;
    if (head) {                                     // the ring around the live face; if the face is degenerate, the face alone
      const live = ringPoints(liveLandmarks, aspect, this.hairReach !== REACH.top ? this.hairReach : REACH);   // S12b: the live ring reaches further out; the photo's UV ring stays put, which is what stretches the photo's hair over more of the live head
      if (live) {
        const hung = neckAnchor(live, this.positions, aspect, this.neck.anchor, this.neck.amount);   // S12a: the neck yields to the body instead of swinging with the head
        this.positions.set(hung || live, VERTEX_COUNT * 2);
      } else head = false;
    }
    this.hairDrawn = 0; this.bodyDrawn = 0;
    this.joinLive = useCamera; this.joinHead = head;                                        // S14: the join's light match needs the live frame
    if (!this.joinSpots) this.joinSpots = new Float32Array(10);
    SPOTS.forEach((v, i) => { this.joinSpots[i * 2] = this.positions[v * 2]; this.joinSpots[i * 2 + 1] = this.positions[v * 2 + 1]; });
    this.seamDrawn = this._drawSeam(opacity, box, aspect);                                  // S13c: first of all, under the photo's own layers
    if (this.body && this.body.on) this.bodyDrawn = this._drawLayer(this.body, opacity);   // the body and dress go down first,
    if (this.hair && this.hair.on) this.hairDrawn = this._drawLayer(this.hair, opacity);   // then the hair over them, all behind the face
    this.stainsDrawn = this.stains.on ? this._drawStains(opacity) : 0;                        // spills and stains on the shirt
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions);
    this.point(this.posBuffer, this.loc.pos, 2);
    this.point(this.uvBuffer, this.loc.uv, 2);
    this.point(head ? this.headFadeBuffer : this.fadeBuffer, this.loc.fade, 1);
    this.point(this.keepBuffer, this.loc.keep, 1);
    this.point(this.ringBuffer, this.loc.ring, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.photo);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.camera);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, head ? this.maskTex : this.photo);   // any texture while the head is off
    gl.uniform1i(this.uni.u_photo, 0);
    gl.uniform1i(this.uni.u_cam, 1);
    gl.uniform1i(this.uni.u_mask, 2);
    gl.uniform1f(this.uni.u_head, head ? 1 : 0);
    gl.uniform1f(this.uni.u_ringMatch, this.look.relight ? 1 : RING_MATCH);   // S11f: with the lighting-only match the ring takes the same light as the face, or a step shows along the face outline
    gl.uniform1f(this.uni.u_match, useCamera ? this.look.match : 0);
    // S11m: the live mouth interior is only shown while the mouth is OPEN (the gap between the inner lips against the face height); closed, the
    // photo's own lips are drawn, with no live patch and no seam round it
    const gap = Math.abs(liveLandmarks[13].y - liveLandmarks[14].y) / Math.max(box.h, 1e-4);
    const open = Math.min(1, Math.max(0, (gap - 0.02) / 0.04));
    gl.uniform1f(this.uni.u_keep, this.look.keep * open * open * (3 - 2 * open));
    gl.uniform1f(this.uni.u_keepEyes, this.look.keepEyes);
    gl.uniform1f(this.uni.u_opacity, Math.min(1, opacity));
    gl.uniform2f(this.uni.u_rl, BLUR * box.w, BLUR * box.w * aspect);
    gl.uniform2f(this.uni.u_rp, this.photoRadius[0], this.photoRadius[1]);
    const pe = this.photoEyes;
    gl.uniform1f(this.uni.u_glasses, this.look.glasses);
    gl.uniform1f(this.uni.u_relight, this.look.relight);
    this.frameNo = (this.frameNo + 1) % 997;                                  // S13b: the grain changes every frame
    gl.uniform1f(this.uni.u_webcam, useCamera ? this.webcamLook : 0);
    gl.uniform1f(this.uni.u_seed, this.frameNo * 0.37 + 1.0);
    gl.uniform2f(this.uni.u_camTexel, this.camTexel[0], this.camTexel[1]);
    const lp = new Float32Array(10); SPOTS.forEach((v, i) => { lp[i * 2] = this.positions[v * 2]; lp[i * 2 + 1] = this.positions[v * 2 + 1]; });
    gl.uniform2fv(this.uni.u_lp, lp); gl.uniform2fv(this.uni.u_pp, this.photoSpots);
    gl.uniform2f(this.uni.u_eyeA, pe[0], pe[1]); gl.uniform2f(this.uni.u_eyeB, pe[2], pe[3]); gl.uniform2f(this.uni.u_eyeAsp, pe[4], 1);
    const triangles = TRIANGLE_COUNT + (head ? RING_TRIANGLES : 0);
    if (head && ringFactor < 1) {                  // S13e: on a turned head the ring (hair, ear, neck) fades before the face: two draws, the ring with its own opacity
      gl.drawElements(gl.TRIANGLES, TRIANGLE_COUNT * 3, gl.UNSIGNED_SHORT, 0);
      const ringOpacity = Math.min(1, opacity) * Math.max(0, ringFactor);
      if (ringOpacity > 0.002) { gl.uniform1f(this.uni.u_opacity, ringOpacity); gl.drawElements(gl.TRIANGLES, RING_TRIANGLES * 3, gl.UNSIGNED_SHORT, TRIANGLE_COUNT * 6); }
    } else gl.drawElements(gl.TRIANGLES, triangles * 3, gl.UNSIGNED_SHORT, 0);
    this.liveDrawn = liveNow ? this._drawLive(opacity) : 0;                // your own hands go over everything, face included
    return triangles;
  }

  point(buffer, location, size) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  // THE EXCEPTION: the live frame goes to the graphics card as a texture and is only ever sampled by the shader.
  uploadCamera(video) {
    const gl = this.gl;
    if (!video || video.readyState < 2) return;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.camera);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    if (video.videoWidth > 0 && video.videoHeight > 0) this.camTexel = [1 / video.videoWidth, 1 / video.videoHeight];   // S13b: the size only, never the pixels
  }

  dispose() {
    const gl = this.gl;
    this.clearHair(); this.clearBody();
    for (const b of [this.live.posBuffer, this.live.alphaBuffer, this.live.indexBuffer, this.stains.posBuffer, this.stains.alphaBuffer, this.stains.colorBuffer, this.stains.indexBuffer]) gl.deleteBuffer(b);
    gl.deleteProgram(this.stainProgram);
    gl.deleteProgram(this.liveProgram); gl.deleteProgram(this.hairProgram);
    gl.deleteProgram(this.seamProgram); gl.deleteTexture(this.seam.tex); gl.deleteBuffer(this.seam.posBuffer); gl.deleteBuffer(this.seam.alphaBuffer);
    for (const t of [this.photo, this.camera, this.maskTex]) if (t) gl.deleteTexture(t);
    for (const b of [this.posBuffer, this.uvBuffer, this.fadeBuffer, this.keepBuffer, this.headFadeBuffer, this.ringBuffer, this.indexBuffer]) gl.deleteBuffer(b);
    gl.deleteProgram(this.program);
    this.photo = null; this.camera = null; this.maskTex = null;
  }
}

function filled(gl, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

function setSampling(gl) {   // any picture size: no mipmaps, no repeat
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

function emptyTexture(gl) {
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  setSampling(gl);
  return t;
}

function link(gl, vertexSource, fragmentSource) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(`shader: ${gl.getShaderInfoLog(shader)}`);
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`program: ${gl.getProgramInfoLog(program)}`);
  return program;
}
