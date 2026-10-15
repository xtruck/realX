// MediaPipe's 52 face blendshape scores -> the character's expressions and eye gaze.
const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);

// `mirror` swaps which of your eyes drives which of the character's (it moves like your reflection)
export function faceToExpressions(b, mirror = true) {
  const g = (n) => b[n] || 0;
  const eyeL = g(mirror ? "eyeBlinkRight" : "eyeBlinkLeft"), eyeR = g(mirror ? "eyeBlinkLeft" : "eyeBlinkRight");
  const blink = clamp(Math.min(eyeL, eyeR));
  const stretch = (g("mouthStretchLeft") + g("mouthStretchRight")) / 2;
  const smile = (g("mouthSmileLeft") + g("mouthSmileRight")) / 2;
  let aa = clamp(g("jawOpen") * 1.4 - g("mouthClose") * 0.6 - g("mouthFunnel") * 0.5 - g("mouthPucker") * 0.5);
  let oh = clamp(g("mouthFunnel") * 1.3 * (0.4 + g("jawOpen")));
  let ou = clamp(g("mouthPucker") * 1.4);
  let ee = clamp(stretch * 1.6 + smile * 0.4) * (1 - aa * 0.5);
  let ih = clamp(stretch * 0.7 + g("jawOpen") * 0.25) * (1 - aa) * (1 - oh);
  const sum = aa + oh + ou + ee + ih;
  if (sum > 1) { aa /= sum; oh /= sum; ou /= sum; ee /= sum; ih /= sum; } // one mouth shape at a time
  return {
    blink, blinkLeft: clamp(eyeL - blink), blinkRight: clamp(eyeR - blink),
    aa, ih, ou, ee, oh, happy: clamp(smile * 1.3),
    angry: clamp(((g("browDownLeft") + g("browDownRight")) / 2) * 1.5),   // both brows pulled down
    surprised: clamp(g("browInnerUp") * 1.3),                              // inner brows raised
  };
}

// Where each of the character's eyes looks, as [pitch, yaw] radians (rotation about X, about Y).
export function gaze(b, mirror = true) {
  const g = (n) => b[n] || 0;
  const pick = (side) => {
    // the character's left eye follows the subject's right eye when mirrored
    const s = (side === "left") === mirror ? "Right" : "Left";
    const out = g(`eyeLookOut${s}`), inn = g(`eyeLookIn${s}`), up = g(`eyeLookUp${s}`), down = g(`eyeLookDown${s}`);
    const sign = side === "left" ? 1 : -1; // "out" is toward +X for the left eye, -X for the right
    return [(down - up) * 0.35, sign * (out - inn) * 0.5];
  };
  return { left: pick("left"), right: pick("right") };
}
