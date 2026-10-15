// Hand gestures from MediaPipe's 21 hand landmarks -> studio actions. Plain logic (no DOM, no three.js).
// Only a gesture NAME ever leaves this module; the landmarks are never stored or sent anywhere.
//
// Landmark indices: 0 wrist; thumb 1-4 (CMC, MCP, IP, TIP); then index, middle, ring, pinky as
// MCP, PIP, DIP, TIP = 5-8, 9-12, 13-16, 17-20.

export const GESTURES = Object.freeze({
  CLOSED_FIST: "Closed_Fist",
  THUMB_UP: "Thumb_Up",
  VICTORY: "Victory",
  OPEN_PALM: "Open_Palm",
});

// gesture -> studio action (the avatar page decides how to carry each action out)
export const GESTURE_ACTIONS = Object.freeze({
  [GESTURES.CLOSED_FIST]: "toggle-mic",
  [GESTURES.THUMB_UP]: "emote-happy",
  [GESTURES.VICTORY]: "emote-wave",
  [GESTURES.OPEN_PALM]: "recenter",
});

const FINGERS = [[5, 6, 8], [9, 10, 12], [13, 14, 16], [17, 18, 20]]; // [mcp, pip, tip]
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));

// A finger is extended when its tip is clearly farther from the wrist than its middle joint is. Distances
// are rotation-invariant, so the hand may point in any direction. Use the metric (world) landmarks when given.
function fingerExtended(lm, [, pip, tip]) {
  return dist(lm[tip], lm[0]) > dist(lm[pip], lm[0]) * 1.12;
}
function thumbExtended(lm) {
  // tip far from the pinky's base compared with the thumb's own middle joint
  return dist(lm[4], lm[17]) > dist(lm[3], lm[17]) * 1.08 && dist(lm[4], lm[5]) > dist(lm[3], lm[5]) * 1.05;
}

/**
 * Classifies one hand. `image` (normalized x right, y DOWN) gives the thumb's "up" direction; `world`
 * (or `image` when absent) gives finger curl.
 * Returns the gesture name, or null when the hand shows none of the four.
 */
export function classifyHand(hand) {
  const image = hand && hand.image, lm = (hand && (hand.world || hand.image)) || null;
  if (!image || !lm || image.length < 21 || lm.length < 21) return null;
  const ext = FINGERS.map((f) => fingerExtended(lm, f)); // index, middle, ring, pinky
  const thumb = thumbExtended(lm);
  const open = ext.filter(Boolean).length;

  if (open === 4 && thumb) return GESTURES.OPEN_PALM;
  if (ext[0] && ext[1] && !ext[2] && !ext[3]) {
    // two fingers must be apart ("V"), not pressed together ("pointing with two")
    const spread = dist(lm[8], lm[12]) > dist(lm[5], lm[9]) * 1.25;
    if (spread) return GESTURES.VICTORY;
  }
  if (open === 0) {
    // thumb raised above the fist: tip above its own joints on screen and mostly vertical
    const dy = image[3].y - image[4].y, dx = Math.abs(image[4].x - image[3].x);
    const up = thumb && dy > 0 && dy > dx * 1.5 && image[4].y < image[2].y && image[4].y < image[5].y;
    if (up) return GESTURES.THUMB_UP;
    if (!thumb) return GESTURES.CLOSED_FIST;
    return null;
  }
  return null;
}

/** The gesture of the first hand showing one (hands are checked in order; the most confident first). */
export function classifyHands(hands) {
  const list = (hands || []).slice().sort((a, b) => (b.score || 0) - (a.score || 0));
  for (const h of list) { const g = classifyHand(h); if (g) return g; }
  return null;
}

/**
 * Confirms a gesture only after it is seen on `frames` consecutive processed frames AND held for `holdMs`,
 * so a hand swinging past does not fire. It fires once per hold: the gesture must go away (or change) before
 * it can fire again, and `cooldownMs` spaces repeats of the same gesture.
 */
export class GestureDebouncer {
  constructor({ frames = 3, holdMs = 300, cooldownMs = 1500, graceFrames = 1 } = {}) {
    this.frames = frames; this.holdMs = holdMs; this.cooldownMs = cooldownMs; this.graceFrames = graceFrames;
    this.reset();
  }
  reset() { this.cand = null; this.count = 0; this.since = 0; this.misses = 0; this.fired = false; this.lastFire = {}; }
  /** gesture: name or null for this frame; now: ms. Returns the confirmed gesture name once, else null. */
  update(gesture, now) {
    if (gesture === null) {
      if (this.cand !== null && ++this.misses <= this.graceFrames) return null; // one dropped frame is not a release
      this.cand = null; this.count = 0; this.misses = 0; this.fired = false;
      return null;
    }
    this.misses = 0;
    if (gesture !== this.cand) { this.cand = gesture; this.count = 1; this.since = now; this.fired = false; return null; }
    this.count++;
    if (this.fired || this.count < this.frames || now - this.since < this.holdMs) return null;
    if (now - (this.lastFire[gesture] ?? -Infinity) < this.cooldownMs) return null;
    this.fired = true; this.lastFire[gesture] = now;
    return gesture;
  }
}

/** classify + debounce + map to an action. feed(hands, now) returns { gesture, action } once per confirmed gesture. */
export class GestureController {
  constructor(opts = {}) { this.debounce = new GestureDebouncer(opts); this.enabled = true; this.last = null; }
  setEnabled(on) { this.enabled = !!on; if (!this.enabled) this.debounce.reset(); }
  feed(hands, now) {
    if (!this.enabled) return null;
    const g = this.debounce.update(classifyHands(hands), now);
    if (!g) return null;
    this.last = { gesture: g, action: GESTURE_ACTIONS[g], at: now };
    return this.last;
  }
}
