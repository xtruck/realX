import test from "node:test";
import assert from "node:assert/strict";
import { GESTURES, GESTURE_ACTIONS, GestureController, GestureDebouncer, classifyHand, classifyHands } from "../src/utils/gestureRecognizer.js";

// Builds a hand pointing up the screen (image y grows downward) from per-finger extension flags.
// Finger k has its base on the knuckle line; extended fingers reach 0.22 above it, curled ones fold back to 0.04.
function hand({ index = false, middle = false, ring = false, pinky = false, thumb = "in", spread = true } = {}) {
  const lm = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.8, z: 0 }));
  lm[0] = { x: 0.5, y: 0.8, z: 0 };
  const xs = [0.44, 0.48, 0.52, 0.56];   // index, middle, ring, pinky bases
  [index, middle, ring, pinky].forEach((ext, k) => {
    const base = 5 + 4 * k, x = xs[k];
    const sp = spread && k < 2 ? (k === 0 ? -0.03 : 0.03) : 0;
    lm[base] = { x, y: 0.6, z: 0 };
    lm[base + 1] = { x: x + sp * 0.3, y: ext ? 0.5 : 0.56, z: 0 };
    lm[base + 2] = { x: x + sp * 0.6, y: ext ? 0.42 : 0.62, z: 0 };
    lm[base + 3] = { x: x + sp, y: ext ? 0.36 : 0.66, z: 0 };   // curled tip lies back near the palm
  });
  lm[1] = { x: 0.45, y: 0.74, z: 0 };
  lm[2] = { x: 0.40, y: 0.68, z: 0 };
  if (thumb === "up") { lm[3] = { x: 0.38, y: 0.56, z: 0 }; lm[4] = { x: 0.38, y: 0.44, z: 0 }; }
  else if (thumb === "out") { lm[3] = { x: 0.33, y: 0.66, z: 0 }; lm[4] = { x: 0.26, y: 0.62, z: 0 }; }
  else { lm[3] = { x: 0.43, y: 0.64, z: 0 }; lm[4] = { x: 0.46, y: 0.66, z: 0 }; }   // tucked across the fingers
  return { image: lm, world: lm, label: "Right", score: 0.9 };
}

test("a closed fist is a fist", () => assert.equal(classifyHand(hand()), GESTURES.CLOSED_FIST));
test("an open hand is an open palm", () =>
  assert.equal(classifyHand(hand({ index: true, middle: true, ring: true, pinky: true, thumb: "out" })), GESTURES.OPEN_PALM));
test("index and middle up, others curled, is a V", () =>
  assert.equal(classifyHand(hand({ index: true, middle: true })), GESTURES.VICTORY));
test("fingers curled with the thumb raised is a thumb up", () =>
  assert.equal(classifyHand(hand({ thumb: "up" })), GESTURES.THUMB_UP));
test("a thumb pointing sideways is not a thumb up", () => assert.equal(classifyHand(hand({ thumb: "out" })), null));
test("one finger, or three, is no gesture", () => {
  assert.equal(classifyHand(hand({ index: true })), null);
  assert.equal(classifyHand(hand({ index: true, middle: true, ring: true })), null);
});
test("two fingers pressed together are not a V", () =>
  assert.equal(classifyHand(hand({ index: true, middle: true, spread: false })), null));
test("malformed input is ignored", () => {
  assert.equal(classifyHand(null), null);
  assert.equal(classifyHand({ image: [], world: [] }), null);
  assert.equal(classifyHands([]), null);
});
test("the most confident hand wins", () => {
  const a = { ...hand(), score: 0.4 }, b = { ...hand({ index: true, middle: true }), score: 0.95 };
  assert.equal(classifyHands([a, b]), GESTURES.VICTORY);
});
test("every gesture maps to a studio action", () => {
  assert.deepEqual(GESTURE_ACTIONS, {
    Closed_Fist: "toggle-mic", Thumb_Up: "emote-happy", Victory: "emote-wave", Open_Palm: "recenter",
  });
});

test("debounce: needs 3 frames and 300 ms", () => {
  const d = new GestureDebouncer({ frames: 3, holdMs: 300 });
  assert.equal(d.update("Victory", 0), null);
  assert.equal(d.update("Victory", 100), null);
  assert.equal(d.update("Victory", 200), null, "3 frames but only 200 ms");
  assert.equal(d.update("Victory", 300), "Victory");
});
test("debounce: fast frames alone do not fire before the hold time", () => {
  const d = new GestureDebouncer({ frames: 3, holdMs: 300 });
  for (let t = 0; t < 250; t += 10) assert.equal(d.update("Open_Palm", t), null);
  assert.equal(d.update("Open_Palm", 300), "Open_Palm");
});
test("debounce: a hand swinging past (changing gesture) never fires", () => {
  const d = new GestureDebouncer();
  const seq = ["Victory", "Open_Palm", "Victory", "Closed_Fist", "Open_Palm", "Victory"];
  seq.forEach((g, i) => assert.equal(d.update(g, i * 100), null));
});
test("debounce: fires once per hold and needs a release before firing again", () => {
  const d = new GestureDebouncer({ frames: 2, holdMs: 100, cooldownMs: 0, graceFrames: 0 });
  d.update("Thumb_Up", 0);
  assert.equal(d.update("Thumb_Up", 100), "Thumb_Up");
  for (let t = 200; t < 1000; t += 100) assert.equal(d.update("Thumb_Up", t), null, "still held: no repeat");
  d.update(null, 1000);
  d.update("Thumb_Up", 1100);
  assert.equal(d.update("Thumb_Up", 1200), "Thumb_Up");
});
test("debounce: one dropped frame does not break a hold, two do", () => {
  const d = new GestureDebouncer({ frames: 3, holdMs: 200, graceFrames: 1 });
  d.update("Victory", 0); d.update("Victory", 100);
  assert.equal(d.update(null, 150), null);
  assert.equal(d.update("Victory", 200), "Victory");
  const e = new GestureDebouncer({ frames: 3, holdMs: 200, graceFrames: 1 });
  e.update("Victory", 0); e.update(null, 50); e.update(null, 100);
  assert.equal(e.update("Victory", 200), null, "the hold restarted");
});
test("debounce: the cooldown spaces repeats of the same gesture", () => {
  const d = new GestureDebouncer({ frames: 2, holdMs: 0, cooldownMs: 1500, graceFrames: 0 });
  d.update("Closed_Fist", 0);
  assert.equal(d.update("Closed_Fist", 10), "Closed_Fist");
  d.update(null, 100);
  d.update("Closed_Fist", 200);
  assert.equal(d.update("Closed_Fist", 300), null, "inside the cooldown");
  d.update(null, 1600);
  d.update("Closed_Fist", 1700);
  assert.equal(d.update("Closed_Fist", 1800), "Closed_Fist");
});

test("controller: a held V reports the wave action once; disabling stops it", () => {
  const c = new GestureController({ frames: 3, holdMs: 300 });
  const v = [hand({ index: true, middle: true })];
  assert.equal(c.feed(v, 0), null);
  assert.equal(c.feed(v, 150), null);
  const hit = c.feed(v, 320);
  assert.deepEqual({ g: hit.gesture, a: hit.action }, { g: "Victory", a: "emote-wave" });
  assert.equal(c.feed(v, 400), null);
  c.setEnabled(false);
  c.feed([hand({ thumb: "up" })], 2000); c.feed([hand({ thumb: "up" })], 2200);
  assert.equal(c.feed([hand({ thumb: "up" })], 2500), null);
});
