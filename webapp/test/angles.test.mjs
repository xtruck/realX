// Stage 3, "Photos at several angles": pure numbers (synthetic landmarks, a fake clock, a fake server, a stand-in WebGL context).
// No camera, no model, no browser. Nothing here says how it LOOKS: that has not been seen on a real webcam.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ANGLE_LIMIT, AnglePicker, FADE_MS, HYSTERESIS, MAX_ANGLES, MIN_APART, SerialLoader, checkAngle, gateVerdict, photoYaw } from "../src/facemesh/angles.js";
import { MaskConfidence, headAngles, signedYaw } from "../src/facemesh/confidence.js";
import { ConsentClient } from "../src/facemesh/consent.js";
import { MeshCompositor } from "../src/facemesh/compositor.js";
import { RING_TRIANGLES } from "../src/facemesh/head.js";
import { TRIANGLE_COUNT, buildMesh } from "../src/facemesh/mesh.js";

// the same synthetic head as s13e.test.mjs: cheeks 234/454 turned by `yaw` degrees
function head({ yaw = 0, cx = 0.5, cy = 0.5 } = {}) {
  const lm = Array.from({ length: 478 }, () => ({ x: cx, y: cy, z: 0 }));
  const half = 0.1, ry = yaw * Math.PI / 180;
  lm[234] = { x: cx - half * Math.cos(ry), y: cy, z: -half * Math.sin(ry) };
  lm[454] = { x: cx + half * Math.cos(ry), y: cy, z: half * Math.sin(ry) };
  lm[10] = { x: cx, y: cy - 0.14, z: 0 }; lm[152] = { x: cx, y: cy + 0.14, z: 0 };
  lm[13] = { x: cx, y: cy + 0.055, z: 0 }; lm[14] = { x: cx, y: cy + 0.065, z: 0 };
  lm[1] = { x: cx + 0.01, y: cy, z: -0.05 };
  return lm;
}

// --- the head turn of a photo -----------------------------------------------------------------------------------------------

test("photoYaw keeps the sign of the turn and matches headAngles in size", () => {
  for (const yaw of [-40, -15, 0, 15, 30, 44]) {
    const lm = head({ yaw });
    assert.ok(Math.abs(photoYaw(lm) - yaw) < 0.5, `yaw ${yaw}: got ${photoYaw(lm)}`);
    assert.ok(Math.abs(Math.abs(signedYaw(lm)) - headAngles(lm).yaw) < 1e-9);
  }
  assert.equal(photoYaw(null), null);
  assert.equal(photoYaw(head().slice(0, 100)), null, "too few landmarks");
  const flipped = head(); [flipped[234], flipped[454]] = [flipped[454], flipped[234]];
  assert.equal(photoYaw(flipped), null, "cheeks in the wrong order: not a usable face");
});

test("checkAngle refuses photos turned past 45 degrees, too close to the front photo, or one too many, with a reason for the page", () => {
  assert.equal(ANGLE_LIMIT, 45);
  assert.deepEqual(checkAngle(30, 0, 0), { ok: true, reason: "" });
  assert.deepEqual(checkAngle(-44.9, 2, 3), { ok: true, reason: "" });
  const far = checkAngle(52, 0, 0);
  assert.equal(far.ok, false); assert.match(far.reason, /about 52°/); assert.match(far.reason, /at most 45°/);
  assert.equal(checkAngle(-46, 0, 0).ok, false, "either side");
  const same = checkAngle(3, 0, 0);
  assert.equal(same.ok, false); assert.match(same.reason, /same way as your front photo/);
  assert.ok(checkAngle(MIN_APART + 0.5, 0, 0).ok);
  const many = checkAngle(30, 0, MAX_ANGLES);
  assert.equal(many.ok, false); assert.match(many.reason, /remove one first/);
  assert.equal(checkAngle(NaN, 0, 0).ok, false);
  assert.match(checkAngle(null, 0, 0).reason, /could not be measured/);
});

// --- which photo is drawn ---------------------------------------------------------------------------------------------------

const FRONT = { id: "", yaw: 0 }, RIGHT = { id: "a1", yaw: 30 }, LEFT = { id: "a2", yaw: -30 };

test("the picker starts on the front photo and crossfades to the nearer side photo over 200 ms", () => {
  const p = new AnglePicker();
  assert.deepEqual(p.update(2, [FRONT, RIGHT, LEFT], 0), { from: "", to: "", t: 1 });
  const start = p.update(28, [FRONT, RIGHT, LEFT], 1000);
  assert.deepEqual(start, { from: "", to: "a1", t: 0 });
  assert.deepEqual(p.update(28, [FRONT, RIGHT, LEFT], 1000 + FADE_MS / 2), { from: "", to: "a1", t: 0.5 });
  assert.deepEqual(p.update(28, [FRONT, RIGHT, LEFT], 1000 + FADE_MS), { from: "a1", to: "a1", t: 1 }, "the fade is over: only the side photo");
  const back = p.update(-29, [FRONT, RIGHT, LEFT], 2000);
  assert.equal(back.from, "a1"); assert.equal(back.to, "a2", "straight across to the other side's photo");
});

test("the picker does not flicker between two photos near the middle (5 degree hysteresis)", () => {
  const p = new AnglePicker();
  p.update(0, [FRONT, RIGHT], 0);
  for (const live of [14, 16, 15.9, 14.1, 16.5]) assert.equal(p.update(live, [FRONT, RIGHT], 10).to, "", `live ${live}: no switch`);
  assert.equal(HYSTERESIS, 5);
  assert.equal(p.update(18, [FRONT, RIGHT], 20).to, "a1", "18 is 6 degrees nearer the side photo: switch");
});

test("a photo whose consent ended is never drawn again, not even to fade out", () => {
  const p = new AnglePicker();
  p.update(0, [FRONT, RIGHT], 0);
  p.update(30, [FRONT, RIGHT], 100);                        // fading front -> a1
  assert.deepEqual(p.update(30, [FRONT], 150), { from: "", to: "", t: 1 }, "a1 left mid-fade: back to the front photo at once");
  const q = new AnglePicker();
  q.update(30, [FRONT, RIGHT], 0); q.update(30, [FRONT, RIGHT], FADE_MS);   // settled on a1
  assert.deepEqual(q.update(30, [FRONT, LEFT], 300), { from: "", to: "", t: 1 }, "a1 gone: the nearest remaining photo, no fade from a1");
  assert.deepEqual(q.update(30, [], 400), { from: "", to: "", t: 1 }, "nothing left: the front photo (the page draws nothing without consent)");
  assert.deepEqual(new AnglePicker().update(NaN, [FRONT, RIGHT], 0), { from: "", to: "", t: 1 }, "no live turn: stay put");
});

// --- one at a time, and the consent grace while a photo loads --------------------------------------------------------------

test("SerialLoader runs side-photo loads strictly one at a time, and a failed one does not stop the next", async () => {
  const loader = new SerialLoader(), order = [];
  let release;
  const first = loader.run(() => new Promise((r) => { order.push("first starts"); release = r; }));
  const second = loader.run(async () => { order.push("second starts"); return 2; });
  const failing = loader.run(async () => { throw new Error("no face"); });
  const after = loader.run(async () => "ok");
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(order, ["first starts"], "the second waits for the first");
  assert.equal(loader.busy, true);
  release(1);
  assert.equal(await first, 1); assert.equal(await second, 2);
  await assert.rejects(failing, /no face/);
  assert.equal(await after, "ok");
  assert.equal(loader.busy, false);
});

function clock(t = 1_000_000) { return { now: () => t, advance: (ms) => { t += ms; } }; }
function fakeServer() {
  const calls = [];
  const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
  const state = { refuse: new Set(), down: false };
  const fetchFn = async (path, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ path, body });
    if (state.down) throw new Error("connection refused");
    if (path === "/api/facemesh/consent") return reply(200, { record: { record_id: body.sha256.slice(0, 8) }, seconds: 7200 });
    if (path === "/api/facemesh/consent/check") return state.refuse.has(body.sha256) ? reply(403, { error: "consent revoked" }) : reply(200, { ok: true, seconds: 7000 });
    if (path === "/api/facemesh/consent/check-batch") {
      return reply(200, { results: body.items.map((i) => (state.refuse.has(i.sha256) ? { ok: false, error: "consent revoked" } : { ok: true, seconds: 7000 })) });
    }
    if (path === "/api/facemesh/consent/revoke") return reply(200, { ok: true });
    return reply(404, { error: "not found" });
  };
  return { fetchFn, calls, state };
}
const sha = (c) => c.repeat(64);

test("gateVerdict: a consent that is only late is paused while a side photo loads, and ended otherwise; a refusal always ends it", async () => {
  const s = fakeServer(), c = clock();
  const client = new ConsentClient({ fetchFn: s.fetchFn, now: c.now });
  await client.issue(sha("a"), 2, true);
  assert.equal(gateVerdict(client.valid(), true), "ok");
  c.advance(8000);                                           // no confirmation for 8 s: past the 6 s grace
  const late = client.valid();
  assert.equal(late.stale, true);
  assert.equal(gateVerdict(late, true), "pause", "loading: paused, not ended");
  assert.equal(gateVerdict(late, false), "end", "not loading: the old rule, it ends");
  s.state.refuse.add(sha("a"));
  await client.check();
  assert.equal(gateVerdict(client.valid(), true), "end", "the server said no: it ends even while loading");
  const expiring = new ConsentClient({ fetchFn: s.fetchFn, now: c.now });
  await expiring.issue(sha("b"), 2, true);
  c.advance(7300 * 1000);
  assert.equal(gateVerdict(expiring.valid(), true), "end", "expired: it ends even while loading");
});

test("a side photo that blocks the page for longer than the 6 s grace cannot end the photo on screen", async () => {
  // The page's timed check, as page.js runs it: checkMany, then gateVerdict(valid(), loader.busy). The load "blocks" by moving the clock
  // 9 s while no answer can be read (the server is unreachable from the page's point of view), then the page is free again.
  const s = fakeServer(), c = clock();
  const front = new ConsentClient({ fetchFn: s.fetchFn, now: c.now });
  await front.issue(sha("f"), 2, true);
  const loader = new SerialLoader(), decisions = [];
  const gateTick = async () => { await ConsentClient.checkMany([front]); decisions.push(gateVerdict(front.valid(), loader.busy)); };
  await loader.run(async () => {
    s.state.down = true;                                     // no answer reaches the page while it is blocked
    c.advance(9000);
    await gateTick();                                        // a tick that fires during (or right after) the block
    s.state.down = false;
  });
  assert.deepEqual(decisions, ["pause"], "late while loading: paused, never ended");
  assert.equal(front.endedReason, "", "nothing final happened to the consent");
  await gateTick();                                          // the next tick after the load: the server answers again
  assert.deepEqual(decisions, ["pause", "ok"], "and it is drawn again after a fresh confirmation");
  // without a load in progress the same silence still ends it, as before
  s.state.down = true; c.advance(9000);
  await gateTick();
  assert.equal(decisions.at(-1), "end");
});

test("checkMany checks the front photo and its side photos in ONE request, and a refusal ends only that photo", async () => {
  const s = fakeServer(), c = clock();
  const clients = [];
  for (const ch of ["f", "1", "2"]) { const k = new ConsentClient({ fetchFn: s.fetchFn, now: c.now }); await k.issue(sha(ch), 2, true); clients.push(k); }
  s.calls.length = 0;
  c.advance(4000);
  s.state.refuse.add(sha("2"));
  const results = await ConsentClient.checkMany(clients);
  assert.equal(s.calls.length, 1, "one request");
  assert.equal(s.calls[0].path, "/api/facemesh/consent/check-batch");
  assert.deepEqual(s.calls[0].body.items.map((i) => i.sha256), [sha("f"), sha("1"), sha("2")]);
  assert.deepEqual(results.map((r) => r.ok), [true, true, false]);
  assert.equal(clients[0].valid().ok, true); assert.equal(clients[1].valid().ok, true);
  assert.match(clients[2].valid().reason, /consent ended: consent revoked/);
  // the request fails: nothing is final, every photo keeps its grace and goes stale later instead of ending
  s.state.down = true;
  await ConsentClient.checkMany(clients.slice(0, 2));
  assert.equal(clients[0].endedReason, ""); assert.equal(clients[1].endedReason, "");
  c.advance(7000);
  assert.equal(clients[0].valid().stale, true);
  // one client alone uses the old single check
  s.state.down = false; s.calls.length = 0;
  await ConsentClient.checkMany([clients[0]]);
  assert.deepEqual(s.calls.map((k) => k.path), ["/api/facemesh/consent/check"]);
  assert.deepEqual(await ConsentClient.checkMany([new ConsentClient({ fetchFn: s.fetchFn })]), [{ ok: false, reason: "no consent" }]);
});

// --- the hold option measures from the photo being drawn ----------------------------------------------------------------------

test("with a side photo drawn, Hold the mask when turning measures the turn from that photo", () => {
  const settle = (lm, ref) => { const m = new MaskConfidence(); let r; for (let i = 0; i < 60; i++) r = m.update(lm, 1, ref); return r; };
  const turned = head({ yaw: 40 });
  assert.ok(settle(turned).confidence < 0.6, "40 degrees from the camera: the front photo fades");
  assert.equal(settle(turned, 40).confidence, 1, "drawn from a 40 degree photo: it holds");
  assert.ok(settle(turned, -30).confidence === 0, "70 degrees from a photo turned the other way: gone");
  assert.deepEqual(settle(turned, null), settle(turned), "no reference: exactly the old behaviour");
});

// --- the compositor: only the face layer crossfades -------------------------------------------------------------------------

function fakeGl() {
  const calls = [];
  return new Proxy({}, {
    get(_t, name) {
      if (name === "calls") return calls;
      if (name === "getParameter") return () => 4096;
      if (name === "getShaderParameter" || name === "getProgramParameter") return () => true;
      if (typeof name === "string" && /^[A-Z_0-9]+$/.test(name)) return name;
      return (...args) => { calls.push([name, ...args]); return { id: calls.length }; };
    },
  });
}
const canvasWith = (gl) => ({ width: 640, height: 480, getContext: () => gl });
const photo = (w, h) => ({ naturalWidth: w, naturalHeight: h });
const face = (x, y) => Array.from({ length: 478 }, (_, i) => ({ x: x + (i % 10) / 100, y: y + Math.floor(i / 10) / 1000, z: 0 }));

/** Every drawElements of the last draw, with the texture bound to unit 0 and the last opacity sent. */
function draws(gl, from) {
  let unit = null, opacity = null;
  const bound = {}, out = [];
  for (const k of gl.calls.slice(from)) {
    if (k[0] === "activeTexture") unit = k[1];
    if (k[0] === "bindTexture") bound[unit] = k[2];
    if (k[0] === "uniform1f") opacity = k[2];
    if (k[0] === "drawElements") out.push({ count: k[2], offset: k[4], texture: bound.TEXTURE0, opacity });
  }
  return out;
}

function compositorWithAngle() {
  const gl = fakeGl(), c = new MeshCompositor(canvasWith(gl), buildMesh());
  c.setPhoto(photo(720, 1280), face(0.2, 0.2));
  c.setHeadMask({ width: 2, height: 2, data: new Uint8Array(4).fill(255) }); c.setHead(true);
  const id = c.addAngle(photo(720, 1280), face(0.25, 0.2));
  return { gl, c, id };
}

test("without a mix the compositor draws exactly as before: one call for the face and the ring, from the front photo", () => {
  const { gl, c } = compositorWithAngle();
  const n = gl.calls.length;
  c.setFaceMix(null);
  assert.equal(c.draw(face(0.3, 0.3)), TRIANGLE_COUNT + RING_TRIANGLES);
  const d = draws(gl, n);
  assert.equal(d.length, 1);
  assert.equal(d[0].count, (TRIANGLE_COUNT + RING_TRIANGLES) * 3);
  assert.equal(d[0].texture, c.photo);
});

test("mid-crossfade the ring is drawn once from the FRONT photo and the face twice: the old photo fully, the new one over it at t", () => {
  const { gl, c, id } = compositorWithAngle();
  const n = gl.calls.length;
  c.setFaceMix({ from: "", to: id, t: 0.5 });
  c.draw(face(0.3, 0.3), null, 0.8);
  const d = draws(gl, n);
  assert.equal(d.length, 3);
  assert.deepEqual([d[0].count, d[0].offset, d[0].texture], [RING_TRIANGLES * 3, TRIANGLE_COUNT * 6, c.photo], "ring: front photo");
  assert.deepEqual([d[1].count, d[1].offset, d[1].texture, d[1].opacity], [TRIANGLE_COUNT * 3, 0, c.photo, 0.8], "face: the photo it leaves, fully");
  assert.deepEqual([d[2].count, d[2].offset, d[2].texture], [TRIANGLE_COUNT * 3, 0, c.angles.get(id).texture], "face: the side photo over it");
  assert.ok(Math.abs(d[2].opacity - 0.4) < 1e-9, "at opacity x t");
});

test("settled on a side photo the face is drawn once from it; an unknown id or a removed photo falls back to the front photo", () => {
  const { gl, c, id } = compositorWithAngle();
  let n = gl.calls.length;
  c.setFaceMix({ from: id, to: id, t: 1 });
  c.draw(face(0.3, 0.3));
  let d = draws(gl, n);
  assert.equal(d.length, 2, "ring + one face draw");
  assert.equal(d[1].texture, c.angles.get(id).texture);
  c.setFaceMix({ from: "", to: "nope", t: 1 });
  assert.equal(c.faceMix, null, "an id the compositor does not know: front photo only");
  c.setFaceMix({ from: "", to: id, t: 0.5 });
  c.removeAngle(id);
  assert.equal(c.faceMix, null, "a removed photo is never drawn");
  n = gl.calls.length;
  c.draw(face(0.3, 0.3));
  d = draws(gl, n);
  assert.equal(d.length, 1); assert.equal(d[0].texture, c.photo);
});

test("side photos need a front photo, go with it, and switching between them uploads nothing", () => {
  const gl = fakeGl(), c = new MeshCompositor(canvasWith(gl), buildMesh());
  assert.throws(() => c.addAngle(photo(720, 1280), face(0.2, 0.2)), /front photo first/);
  c.setPhoto(photo(720, 1280), face(0.2, 0.2));
  const a = c.addAngle(photo(720, 1280), face(0.25, 0.2)), b = c.addAngle(photo(720, 1280), face(0.15, 0.2));
  assert.equal(c.angleCount, 2);
  const uploads = () => gl.calls.filter((k) => k[0] === "texImage2D").length;
  const before = uploads();
  for (const mix of [{ from: "", to: a, t: 0.3 }, { from: a, to: b, t: 0.6 }, { from: b, to: b, t: 1 }]) { c.setFaceMix(mix); c.draw(face(0.3, 0.3)); }
  assert.equal(uploads(), before, "no texture upload when the drawn photo changes (no camera given here)");
  c.setPhoto(photo(720, 1280), face(0.2, 0.2));
  assert.equal(c.angleCount, 0, "a new front photo forgets the side photos");
  const again = c.addAngle(photo(720, 1280), face(0.25, 0.2));
  c.clearPhoto();
  assert.equal(c.angleCount, 0); assert.ok(!c.angles.has(again));
});

// --- privacy: nothing new reads, keeps or sends a picture -------------------------------------------------------------------

test("angles.js reads no pixels and talks to no network, and page.js checks side photos only through the batched consent route", () => {
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const src = strip(readFileSync(new URL("../src/facemesh/angles.js", import.meta.url), "utf8"));
  for (const call of ["readPixels", "getImageData", "toDataURL", "toBlob", "drawImage", "texImage2D", "createImageBitmap", "captureStream", "MediaRecorder",
    "fetch(", "XMLHttpRequest", "WebSocket", "sendBeacon", "localStorage", "sessionStorage", "indexedDB", "getUserMedia", "document", "window"]) {
    assert.ok(!src.includes(call), `angles.js must not use ${call}`);
  }
  const consent = strip(readFileSync(new URL("../src/facemesh/consent.js", import.meta.url), "utf8"));
  const routes = [...consent.matchAll(/"(\/api\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(routes.every((r) => r.startsWith("/api/facemesh/")), routes.join(", "));
  assert.ok(routes.includes("/api/facemesh/consent/check-batch"));
  const page = strip(readFileSync(new URL("../src/facemesh/page.js", import.meta.url), "utf8"));
  assert.match(page, /ConsentClient\.checkMany\(\[client, \.\.\.sides\]\)/, "one request for the photo and its side photos");
  assert.match(page, /gateVerdict\(v, angleBlocking\)/, "the timed check uses the loading-aware rule");
  const blocking = page.match(/angleBlocking = true;[\s\S]*?finally \{ angleBlocking = false; \}/);
  assert.ok(blocking, "the pause covers one bounded block");
  assert.ok(!/askConsent/.test(blocking[0]), "not the consent question: a user reading it for minutes must not stretch the grace");
  assert.match(blocking[0], /openLandmarker\("IMAGE", 2\)/);
  assert.match(page, /angleLoader\.run\(/, "side photos are loaded through the one-at-a-time loader");
  const html = readFileSync(new URL("../src/facemesh/facemesh.html", import.meta.url), "utf8");
  assert.match(html, /<button id="anglesBtn" type="button" aria-pressed="false"/, "the option is off by default");
});
