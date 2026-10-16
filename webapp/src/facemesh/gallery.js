// Step S6a: the pure logic behind the dashboard: the gallery of the user's own photos (each with its own consent), the LIVE
// timer and the toast. No DOM, no network, no picture: the page owns those and hands items in as opaque objects.
// The gallery lives in memory only. Closing the page, or "Stop", forgets everything.

export const TOAST_MS = 3000;

/** mm:ss; minutes can go past 59 (100:05). Anything that is not a finite number counts as 0. */
export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export class Gallery {
  constructor() { this.items = []; this.activeId = ""; this.session = "idle"; this.counter = 0; this.dropped = []; }

  get size() { return this.items.length; }
  get active() { return this.items.find((i) => i.id === this.activeId) || null; }
  get(id) { return this.items.find((i) => i.id === id) || null; }
  list() { return this.items.slice(); }

  /** A name that is not already in the gallery: "face.jpg", then "face.jpg (2)", "face.jpg (3)"... */
  uniqueName(name) {
    const base = String(name || "").trim() || "photo";
    const taken = new Set(this.items.map((i) => i.name));
    if (!taken.has(base)) return base;
    for (let n = 2; ; n++) if (!taken.has(`${base} (${n})`)) return `${base} (${n})`;
  }

  /** Adds an item (what the page needs: name, sha, client, image, landmarks, url) and makes it the active one. */
  add(item) {
    const entry = { ...item, id: `p${++this.counter}`, name: this.uniqueName(item && item.name) };
    this.items.push(entry);
    this.activeId = entry.id;
    this.session = "live";
    return entry;
  }

  /** The id of the item that would take over if `id` left: the one after it, else the one before it, else "". */
  neighbourOf(id) {
    const index = this.items.findIndex((i) => i.id === id);
    if (index < 0) return "";
    const next = this.items[index + 1] || this.items[index - 1];
    return next ? next.id : "";
  }

  /** Makes an item the active one. Returns it, or null when there is no such item. */
  activate(id) {
    const item = this.get(id);
    if (!item) return null;
    this.activeId = id;
    return item;
  }

  /**
   * Takes an item out. If it was the active one nothing is active afterwards (the user picks the next one), unless
   * `select` is "neighbour": then the nearest remaining item, the one after it first, becomes active.
   * Returns { item, wasActive, active } (item is null when there was no such item).
   */
  remove(id, { select = "none" } = {}) {
    const index = this.items.findIndex((i) => i.id === id);
    if (index < 0) return { item: null, wasActive: false, active: this.active };
    const [item] = this.items.splice(index, 1);
    const wasActive = this.activeId === id;
    if (wasActive) {
      this.activeId = select === "neighbour" && this.items.length ? this.items[Math.min(index, this.items.length - 1)].id : "";
    }
    if (this.items.length === 0 && this.session === "live") this.session = "idle";
    return { item, wasActive, active: this.active };
  }

  /** Like remove, and keeps the reason (its consent ended, say) so the page can say why it disappeared. */
  drop(id, reason, options) {
    const result = this.remove(id, options);
    if (result.item) this.dropped.push({ id, name: result.item.name, reason: String(reason || "") });
    return result;
  }

  /** The user pressed Stop: everything goes, and the session is over until a new photo starts a new one. Returns the items that were here. */
  stop() {
    const gone = this.items.slice();
    this.items = []; this.activeId = ""; this.session = "stopped";
    return gone;
  }
}

/** Counts the time a photo was really being drawn: a tick adds the time since the last one only if both ticks were drawing. */
export class LiveTimer {
  constructor(maxStepMs = 1000) { this.ms = 0; this.last = null; this.drawing = false; this.maxStepMs = maxStepMs; }

  /** Feed it once per frame. A long gap (a throttled tab) adds at most `maxStepMs`. Returns the seconds so far. */
  tick(nowMs, drawing) {
    if (this.last !== null && this.drawing && drawing) this.ms += Math.min(Math.max(0, nowMs - this.last), this.maxStepMs);
    this.last = nowMs; this.drawing = !!drawing;
    return this.seconds;
  }

  get seconds() { return this.ms / 1000; }
  reset() { this.ms = 0; this.last = null; this.drawing = false; }
}

/** One message shown for a few seconds. */
export class Toast {
  constructor(durationMs = TOAST_MS) { this.durationMs = durationMs; this.message = ""; this.until = 0; }
  show(text, nowMs) { this.message = String(text); this.until = nowMs + this.durationMs; }
  /** The message while it is still on, else "". */
  current(nowMs) { return nowMs < this.until ? this.message : ""; }
}
