import test from "node:test";
import assert from "node:assert/strict";
import { BLUR_MAX, BLUR_MIN, VOICES, commands, connectRig, debounce, describeView, lights, viewOf } from "../src/dock/dockLogic.js";

const body = (c) => JSON.parse(c.body);

test("voice buttons post the preset to the dock endpoint; unknown presets are refused", () => {
  assert.deepEqual(VOICES, ["pip", "bear", "imp", "robot", "radio"]);
  for (const id of VOICES) { const c = commands.voice(id); assert.equal(c.path, "/api/dock"); assert.deepEqual(body(c), { voice: id }); }
  assert.deepEqual(body(commands.voice("")), { voice: "" });
  assert.throws(() => commands.voice("elvis"), /unknown voice/);
});
test("mute posts a real boolean", () => {
  assert.deepEqual(body(commands.mute(true)), { mic_muted: true });
  assert.deepEqual(body(commands.mute(0)), { mic_muted: false });
  assert.equal(commands.mute(true).method, "POST");
  assert.equal(commands.mute(true).headers["Content-Type"], "application/json");
});
test("background modes go to /api/config; blur is clamped and rounded", () => {
  assert.deepEqual(body(commands.background("blur")), { background: "blur" });
  assert.throws(() => commands.background("sparkles"), /unknown background/);
  assert.equal(body(commands.blur(0)).blur, BLUR_MIN);
  assert.equal(body(commands.blur(9999)).blur, BLUR_MAX);
  assert.equal(body(commands.blur("41.6")).blur, 42);
  assert.throws(() => commands.blur("lots"), /number/);
});
test("a photo is sent raw with its own type, and only JPEG or PNG under 12 MB", () => {
  const f = { type: "image/png", size: 1000 };
  const c = commands.photo(f);
  assert.equal(c.path, "/api/background"); assert.equal(c.body, f); assert.equal(c.headers["Content-Type"], "image/png");
  assert.throws(() => commands.photo({ type: "image/gif", size: 10 }), /JPEG or PNG/);
  assert.throws(() => commands.photo({ type: "image/png", size: 13 * 1024 * 1024 }), /12 MB/);
  assert.throws(() => commands.photo(null), /JPEG or PNG/);
});

const stats = { config: { background: "blur", blur: 61, mode: "original" }, dock: { mic_muted: true, voice: "robot" }, security: { token: "fixed", watermark: true } };
test("the view reads the server's numbers", () => {
  const v = viewOf(stats, { rigConnected: true, now: 1000, at: 900 });
  assert.deepEqual(v, { server: "ok", rig: true, token: "fixed", watermark: "on", muted: true, voice: "robot", background: "blur", blur: 61, mode: "original" });
  assert.deepEqual(lights(v), { server: "ok", rig: "ok", token: "ok", watermark: "ok" });
});
test("missing or old data is never shown as fine", () => {
  assert.equal(viewOf(null).server, "down");
  assert.equal(viewOf(stats, { now: 10000, at: 1000 }).server, "stale");
  const v = viewOf({}, { now: 1, at: 1 });
  assert.equal(v.token, "unknown"); assert.equal(v.watermark, "unknown");
  assert.deepEqual(lights(v), { server: "ok", rig: "warn", token: "bad", watermark: "bad" });
  const weird = viewOf({ config: { background: "x", blur: "9" }, dock: { voice: 5 }, security: { token: "fixed", watermark: "yes" } }, { now: 1, at: 1 });
  assert.equal(weird.background, "off"); assert.equal(weird.blur, 41); assert.equal(weird.voice, ""); assert.equal(weird.watermark, "unknown");
});
test("a per-run token is a warning, with advice", () => {
  const v = viewOf({ security: { token: "per-run", watermark: true } }, { now: 1, at: 1 });
  assert.equal(lights(v).token, "warn");
  assert.match(describeView(v).token, /REALX_TOKEN/);
  assert.match(describeView(viewOf(null)).server, /Cannot reach/);
});
test("the token itself never appears in anything the dock builds", () => {
  const secret = "s3cret-token-0123456789";
  const v = viewOf({ ...stats, security: { token: "fixed", watermark: true, value: secret } }, { now: 1, at: 1 });
  assert.ok(!JSON.stringify([v, describeView(v), lights(v)]).includes(secret));
});

test("debounce keeps only the last call", () => {
  const timers = []; const calls = [];
  const fake = { set: (fn) => { timers.push(fn); return timers.length; }, clear: (id) => { timers[id - 1] = null; } };
  const d = debounce((x) => calls.push(x), 100, fake);
  d(1); d(2); d(3);
  timers.forEach((t) => t && t());
  assert.deepEqual(calls, [3]);
});

class FakeSocket {
  static all = [];
  constructor(url) { this.url = url; FakeSocket.all.push(this); }
  close() { this.onclose && this.onclose(); }
}
test("the rig socket reports open and close, passes hello and messages, ignores junk, and reconnects with backoff", () => {
  FakeSocket.all = [];
  const waits = []; let pending = null;
  const timers = { set: (fn, ms) => { waits.push(ms); pending = fn; return 1; }, clear: () => { pending = null; } };
  const log = [];
  const h = connectRig("ws://x/ws/rig", {
    open: () => log.push("open"), close: () => log.push("close"), hello: (m) => log.push("hello:" + m.type), message: (m) => log.push("msg:" + m.type),
  }, { WebSocketCtor: FakeSocket, timers });
  const s = FakeSocket.all[0];
  s.onopen();
  s.onmessage({ data: JSON.stringify({ type: "hello" }) });
  s.onmessage({ data: JSON.stringify({ type: "rig", seq: 1 }) });
  s.onmessage({ data: "not json" }); s.onmessage({ data: "[1]" }); s.onmessage({ data: JSON.stringify({ type: 5 }) });
  assert.deepEqual(log, ["open", "hello:hello", "msg:rig"]);
  s.onclose(); pending();                       // dropped: retry after 1 s
  FakeSocket.all[1].onclose(); pending();       // dropped again: 2 s
  FakeSocket.all[2].onclose();
  assert.deepEqual(waits, [1000, 2000, 4000]);
  FakeSocket.all[2].onopen();                   // a good connection resets the pause
  FakeSocket.all[2].onclose();
  assert.equal(waits.at(-1), 1000);
  const before = FakeSocket.all.length;
  h.close();
  assert.equal(FakeSocket.all.length, before, "no reconnect after close()");
});
