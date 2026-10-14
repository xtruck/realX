// Keeps a camera or microphone alive: notices when its tracks end (unplugged, taken by another app, a driver
// reset), releases the dead device, says so in plain words, and tries again with a growing pause. A refused
// permission is final: asking again would only repeat the same refusal.
//
// Plain logic, no DOM: the clock and the device are passed in, so the retry behaviour is tested exactly.
const TERMINAL = new Set(["NotAllowedError", "SecurityError"]);
const clean = (s, n = 200) => String(s ?? "").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, n);

export class Backoff {
  /** 1 s, 2 s, 4 s ... up to `maxMs`; `reset()` after a success */
  constructor({ minMs = 1000, maxMs = 15000, factor = 2 } = {}) {
    this.minMs = minMs; this.maxMs = maxMs; this.factor = factor; this.attempts = 0;
  }
  next() {
    const ms = Math.min(this.maxMs, this.minMs * this.factor ** this.attempts);
    this.attempts++;
    return ms;
  }
  reset() { this.attempts = 0; }
}

export class DeviceSupervisor {
  /**
   * kind     "camera" | "microphone", used in the messages
   * start    async () => { stop(), tracks?: MediaStreamTrack[] }: opens the device, or throws
   * onState  ({ kind, state, message, detail, attempt, nextRetryMs }) with state running | lost | blocked | stopped
   */
  constructor({ kind, start, explain = null, onState = () => {}, backoff = new Backoff(), setTimer = setTimeout, clearTimer = clearTimeout }) {
    this.kind = kind; this.startDevice = start; this.explain = explain; this.onState = onState; this.backoff = backoff;
    this.setTimer = setTimer; this.clearTimer = clearTimer;
    this.state = "idle"; this.handle = null; this.timer = null; this.stopped = false;
    this.onEnded = () => this.lost();
  }

  /** the first attempt; resolves once it has either succeeded or scheduled a retry */
  async run() { await this.attempt(); }

  async attempt() {
    if (this.stopped) return;
    let handle;
    try {
      handle = await this.startDevice();
    } catch (err) {
      return this.failed(err);
    }
    if (this.stopped) { this.release(handle); return; }   // stopped while it was opening: never leak the device
    this.handle = handle;
    for (const track of handle?.tracks ?? []) track.addEventListener("ended", this.onEnded);
    this.backoff.reset();
    this.emit("running");
  }

  lost() {
    if (this.state !== "running" || this.stopped) return;   // already handled, or being shut down
    this.release(this.handle);
    this.handle = null;
    this.emit("lost", `The ${this.kind} was disconnected or stopped. Trying to reconnect…`, "");
    this.schedule();
  }

  failed(err) {
    if (this.stopped) return;
    const detail = clean(`${err?.name ?? "Error"}: ${err?.message ?? err}`);
    let why = null;
    try { why = this.explain ? clean(this.explain(err), 140) : null; } catch (e) { /* an explainer must never break recovery */ }
    if (TERMINAL.has(err?.name)) {
      this.emit("blocked", `${why || `The ${this.kind} permission was refused.`} Allow it in the browser's address bar, then reload.`, detail);
      return;
    }
    this.emit("lost", `${why || `The ${this.kind} is not available.`} Trying again…`, detail);
    this.schedule();
  }

  schedule() {
    const ms = this.backoff.next();
    this.nextRetryMs = ms;
    this.emitAgain();
    this.timer = this.setTimer(() => { this.timer = null; this.attempt(); }, ms);
  }

  stop() {
    this.stopped = true;
    if (this.timer !== null) { this.clearTimer(this.timer); this.timer = null; }
    this.release(this.handle);
    this.handle = null;
    this.emit("stopped");
  }

  // stop the device and stop listening to it
  release(handle) {
    for (const track of handle?.tracks ?? []) track.removeEventListener("ended", this.onEnded);
    try { handle?.stop?.(); } catch (e) { /* already gone */ }
  }

  emit(state, message = "", detail = "") {
    this.state = state;
    this.last = { kind: this.kind, state, message: clean(message), detail: clean(detail), attempt: this.backoff.attempts, nextRetryMs: null };
    this.onState(this.last);
  }

  // the same state again, now that the next retry delay is known
  emitAgain() {
    this.last = { ...this.last, attempt: this.backoff.attempts, nextRetryMs: this.nextRetryMs };
    this.onState(this.last);
  }
}
