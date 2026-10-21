// Stage 3, "Photos at several angles" (off by default): side views stretch one front-on photo, so the user may add photos of
// themself taken at other head turns. Each frame the photo whose turn is nearest the live head's is drawn on the FACE (the head
// ring, hair and body keep the front photo), with a short crossfade when it changes.
//
// Pure numbers, no DOM, no WebGL: node tests it. Every angle photo is a gallery photo of its own, with its own signed consent;
// nothing here relaxes that. The limits below are first guesses, never tuned on a real webcam.
import { signedYaw } from "./confidence.js";

export const ANGLE_LIMIT = 45;     // degrees: an angle photo turned further than this is refused (the mesh fit is unreliable past it)
export const MIN_APART = 8;        // degrees: an angle photo this close to the front photo's turn adds nothing and is refused
export const MAX_ANGLES = 4;       // side photos per front photo; with the front photo that is 5 records in one consent check
export const HYSTERESIS = 5;       // degrees: switch only when another photo is this much nearer the live turn than the current one
export const FADE_MS = 200;        // the crossfade between two photos

/** A photo's head turn in degrees (signed), from its own landmarks; `aspect` is the photo's width / height. null when unusable. */
export function photoYaw(landmarks, aspect = 1) { return signedYaw(landmarks, aspect); }

/**
 * May this photo be added as an angle photo? `yaw` is its turn, `frontYaw` the front photo's, `count` how many angle photos there
 * already are. { ok, reason }: the reason is shown in the page as it is.
 */
export function checkAngle(yaw, frontYaw, count = 0) {
  if (!Number.isFinite(yaw)) return { ok: false, reason: "the head turn could not be measured in this photo" };
  if (count >= MAX_ANGLES) return { ok: false, reason: `you already have ${MAX_ANGLES} side photos: remove one first` };
  if (Math.abs(yaw) > ANGLE_LIMIT) {
    return { ok: false, reason: `this photo is turned about ${Math.ceil(Math.abs(yaw))}°; side photos must be turned at most ${ANGLE_LIMIT}°` };   // rounded up: 45.3 reads 46, never "45"
  }
  if (Number.isFinite(frontYaw) && Math.abs(yaw - frontYaw) < MIN_APART) {   // rounded down below: 7.6 reads 7, never the minimum itself
    return { ok: false, reason: `this photo faces about the same way as your front photo (${Math.floor(Math.abs(yaw - frontYaw))}° apart): use one turned 15° to ${ANGLE_LIMIT}° to the side` };
  }
  return { ok: true, reason: "" };
}

/**
 * Chooses which photo the face is drawn from. `update(liveYaw, candidates, now)`: `candidates` is a list of { id, yaw } of the
 * photos that may be drawn NOW (consent valid; the front photo has id ""). Returns { from, to, t }: draw `from` fully and `to` over
 * it at opacity t (t = 1 and from === to when nothing is changing).
 *
 * A photo that leaves the candidates (its consent ended) is never drawn again, not even to fade out: the choice moves at once.
 */
export class AnglePicker {
  constructor({ hysteresis = HYSTERESIS, fadeMs = FADE_MS } = {}) {
    this.hysteresis = hysteresis; this.fadeMs = fadeMs;
    this.current = ""; this.fade = null;   // fade: { from, to, start }
  }

  reset() { this.current = ""; this.fade = null; }

  update(liveYaw, candidates, now) {
    const list = Array.isArray(candidates) ? candidates.filter((c) => c && typeof c.id === "string" && Number.isFinite(c.yaw)) : [];
    const has = (id) => list.some((c) => c.id === id);
    if (list.length === 0) { this.reset(); return { from: "", to: "", t: 1 }; }
    if (this.fade) {                                                     // a fade in progress: it ends, or loses one end
      if (!has(this.fade.to)) this.fade = null;
      else if (!has(this.fade.from)) { this.current = this.fade.to; this.fade = null; }
      else if (now - this.fade.start >= this.fadeMs) { this.current = this.fade.to; this.fade = null; }
    }
    if (!has(this.current)) { this.current = nearest(list, liveYaw) || list[0].id; this.fade = null; }
    if (!this.fade && Number.isFinite(liveYaw)) {
      const best = nearest(list, liveYaw);
      const gap = (id) => Math.abs(list.find((c) => c.id === id).yaw - liveYaw);
      if (best && best !== this.current && gap(this.current) - gap(best) > this.hysteresis) this.fade = { from: this.current, to: best, start: now };
    }
    if (!this.fade) return { from: this.current, to: this.current, t: 1 };
    const t = Math.min(1, Math.max(0, (now - this.fade.start) / this.fadeMs));
    return { from: this.fade.from, to: this.fade.to, t };
  }
}

function nearest(list, yaw) {
  if (!Number.isFinite(yaw)) return null;
  let best = null, gap = Infinity;
  for (const c of list) { const g = Math.abs(c.yaw - yaw); if (g < gap) { gap = g; best = c.id; } }
  return best;
}

/**
 * Runs one task at a time, in the order asked: angle photos are loaded one by one, so the page never runs two face-model loads at
 * once. `busy` is true while a task runs; a task's error is passed back to its caller and does not stop the next one.
 */
export class SerialLoader {
  constructor() { this.busy = false; this.tail = Promise.resolve(); this.started = 0; this.finished = 0; }
  run(task) {
    const go = async () => {
      this.busy = true; this.started++;
      try { return await task(); } finally { this.finished++; this.busy = this.finished < this.started; }
    };
    const result = this.tail.then(go, go);
    this.tail = result.catch(() => {});
    return result;
  }
}

/**
 * What the page's timed consent check does with a verdict (ConsentClient.valid()'s result): "ok", "pause" or "end".
 *
 * A verdict that is only STALE (the server has not confirmed for 6 s) while an angle photo is `loading` pauses the photo instead of
 * ending it: loading a face model can block the page for seconds, during which no answer can be read, and that must not end a
 * consent the server never refused. A refusal, an end or an expiry still ends it at once. A paused photo is not drawn (the per-frame
 * check also sees "stale" and draws nothing) until the server confirms it again.
 */
export function gateVerdict(verdict, loading = false) {
  if (verdict && verdict.ok) return "ok";
  if (verdict && verdict.stale && loading) return "pause";
  return "end";
}
