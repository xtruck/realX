import test from "node:test";
import assert from "node:assert/strict";
import { Backoff, DeviceSupervisor } from "../src/recover.js";

// --- fakes: a manual clock and a track that can "end" ------------------------------------------------
function clock() {
  const timers = [];
  let id = 0;
  return {
    setTimer: (fn, ms) => { timers.push({ id: ++id, fn, ms }); return id; },
    clearTimer: (i) => { const k = timers.findIndex((t) => t.id === i); if (k >= 0) timers.splice(k, 1); },
    pending: () => timers.map((t) => t.ms),
    async fire() { const t = timers.shift(); assert.ok(t, "a timer should be waiting"); await t.fn(); },
  };
}
function track() {
  const l = {};
  return {
    addEventListener(type, fn) { (l[type] ||= []).push(fn); },
    removeEventListener(type, fn) { l[type] = (l[type] || []).filter((f) => f !== fn); },
    end() { for (const fn of l.ended || []) fn(); },
    listeners: () => (l.ended || []).length,
  };
}
const handle = () => { const tr = track(); return { tracks: [tr], track: tr, stopped: 0, stop() { this.stopped++; } }; };
const flush = () => new Promise((r) => setImmediate(r));

function rig({ starts }) {
  const c = clock(), events = [], made = [];
  let n = 0;
  const sup = new DeviceSupervisor({
    kind: "camera",
    start: async () => { const step = starts[Math.min(n++, starts.length - 1)]; if (step instanceof Error) throw step; const h = handle(); made.push(h); return h; },
    onState: (e) => events.push(e), setTimer: c.setTimer, clearTimer: c.clearTimer,
  });
  return { sup, c, events, made, last: () => events[events.length - 1] };
}
const err = (name, message = name) => Object.assign(new Error(message), { name });

test("backoff doubles from one second up to a cap, and a reset starts it over", () => {
  const b = new Backoff({ minMs: 1000, maxMs: 15000, factor: 2 });
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map(() => b.next()), [1000, 2000, 4000, 8000, 15000, 15000, 15000]);
  assert.equal(b.attempts, 7);
  b.reset();
  assert.equal(b.attempts, 0);
  assert.equal(b.next(), 1000);
});

test("a device that starts is running, and its tracks are watched", async () => {
  const { sup, events, made } = rig({ starts: [null] });
  await sup.run();
  assert.equal(sup.state, "running");
  assert.equal(events.at(-1).state, "running");
  assert.equal(made.length, 1);
  assert.equal(made[0].track.listeners(), 1);
});

test("when a track ends the device is released, reported as lost, and a retry is scheduled", async () => {
  const { sup, c, made, last } = rig({ starts: [null, null] });
  await sup.run();
  made[0].track.end();
  assert.equal(sup.state, "lost");
  assert.match(last().message, /camera/i);
  assert.match(last().message, /disconnected|unplugged|lost/i);
  assert.equal(made[0].stopped, 1, "the dead device is released");
  assert.deepEqual(c.pending(), [1000]);
});

test("a retry that works brings it back, and the next loss starts the backoff over", async () => {
  const { sup, c, made, last } = rig({ starts: [null, null, null] });
  await sup.run();
  made[0].track.end();
  await c.fire();
  await flush();
  assert.equal(sup.state, "running");
  assert.equal(last().state, "running");
  made[1].track.end();
  assert.deepEqual(c.pending(), [1000], "recovery reset the backoff");
});

test("failed retries back off 1, 2, 4, 8, 15, 15 seconds and report what went wrong", async () => {
  const bad = err("NotFoundError", "Requested device not found");
  const { sup, c, made, last } = rig({ starts: [null, bad] });
  await sup.run();
  made[0].track.end();
  const delays = [];
  for (let i = 0; i < 6; i++) { delays.push(c.pending()[0]); await c.fire(); await flush(); }
  assert.deepEqual(delays, [1000, 2000, 4000, 8000, 15000, 15000]);
  assert.equal(sup.state, "lost");
  assert.ok(last().attempt >= 6);
  assert.match(last().detail, /not found/i);
});

test("a camera that is missing at the start is retried, not treated as final", async () => {
  const { sup, c, last } = rig({ starts: [err("NotFoundError"), null] });
  await sup.run();
  assert.equal(sup.state, "lost");
  assert.deepEqual(c.pending(), [1000]);
  await c.fire(); await flush();
  assert.equal(sup.state, "running");
  assert.equal(last().state, "running");
});

test("a refused permission is final: nothing is retried, with the reason on screen", async () => {
  const first = rig({ starts: [err("NotAllowedError", "Permission denied")] });
  await first.sup.run();
  assert.equal(first.sup.state, "blocked");
  assert.deepEqual(first.c.pending(), []);
  assert.match(first.last().message, /permission/i);

  const later = rig({ starts: [null, err("NotAllowedError")] });   // revoked while the stream was running
  await later.sup.run();
  later.made[0].track.end();
  await later.c.fire(); await flush();
  assert.equal(later.sup.state, "blocked");
  assert.deepEqual(later.c.pending(), []);
});

test("two 'ended' events for one device schedule one retry, not two", async () => {
  const { sup, c, made } = rig({ starts: [null, null] });
  await sup.run();
  made[0].track.end();
  made[0].track.end();
  assert.deepEqual(c.pending(), [1000]);
});

test("stop cancels the pending retry, releases the device, and ignores a late 'ended'", async () => {
  const { sup, c, made, last } = rig({ starts: [null, null] });
  await sup.run();
  made[0].track.end();
  sup.stop();
  assert.deepEqual(c.pending(), []);
  assert.equal(sup.state, "stopped");
  assert.equal(last().state, "stopped");
  made[0].track.end();
  assert.deepEqual(c.pending(), []);
  const running = rig({ starts: [null] });
  await running.sup.run();
  running.sup.stop();
  assert.equal(running.made[0].stopped, 1);
  assert.equal(running.made[0].track.listeners(), 0, "listeners are removed too");
});

test("a device that finishes opening after stop() is released at once, never leaked", async () => {
  let resolve;
  const h = handle();
  const c = clock();
  const sup = new DeviceSupervisor({ kind: "camera", start: () => new Promise((r) => { resolve = r; }), onState: () => {}, setTimer: c.setTimer, clearTimer: c.clearTimer });
  const running = sup.run();
  sup.stop();
  resolve(h);
  await running;
  assert.equal(h.stopped, 1);
  assert.equal(sup.state, "stopped");
});

test("a caller's plain-language explanation is used for failures, with the retry or the way out added", async () => {
  const explain = (e) => (e.name === "NotReadableError" ? "The camera is busy in another app." : e.name === "NotAllowedError" ? "Camera permission was refused." : "Something else.");
  const mk = (starts) => {
    const c = clock(), events = [];
    const sup = new DeviceSupervisor({ kind: "camera", explain, onState: (e) => events.push(e), setTimer: c.setTimer, clearTimer: c.clearTimer,
      start: async () => { throw starts; } });
    return { sup, events, last: () => events.at(-1) };
  };
  const busy = mk(err("NotReadableError"));
  await busy.sup.run();
  assert.match(busy.last().message, /busy in another app/);
  assert.match(busy.last().message, /trying again/i);
  const refused = mk(err("NotAllowedError"));
  await refused.sup.run();
  assert.equal(refused.sup.state, "blocked");
  assert.match(refused.last().message, /permission was refused/);
  assert.match(refused.last().message, /reload/i);
});

test("reported text is short and has no control characters", async () => {
  const nasty = err("OverconstrainedError", "bad\n\u001b[31mred" + "x".repeat(500));
  const { sup, last } = rig({ starts: [nasty] });
  await sup.run();
  for (const field of [last().message, last().detail]) {
    assert.ok(field.length <= 200 && !/[\u0000-\u001f]/.test(field), field);
  }
});

test("the default timers work when called as methods of the supervisor, as a browser's setTimeout requires", async () => {
  // a browser's setTimeout/clearTimeout throw "Illegal invocation" unless called with the window (or no receiver);
  // node does not mind, so imitate the browser's rule
  const real = { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout };
  const strict = (fn) => function (...args) {
    if (this !== undefined && this !== globalThis) throw new TypeError("Illegal invocation");
    return fn(...args);
  };
  globalThis.setTimeout = strict(real.setTimeout);
  globalThis.clearTimeout = strict(real.clearTimeout);
  try {
    const sup = new DeviceSupervisor({ kind: "camera", start: async () => { throw err("NotFoundError"); } });
    await sup.run();                       // the failed start schedules a retry with the default timer
    assert.equal(sup.state, "lost");
    assert.notEqual(sup.timer, null);
    sup.stop();                            // and stop() clears it with the default clearTimer
    assert.equal(sup.timer, null);
  } finally {
    globalThis.setTimeout = real.setTimeout;
    globalThis.clearTimeout = real.clearTimeout;
  }
});
