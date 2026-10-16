import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Gallery, LiveTimer, TOAST_MS, Toast, formatClock } from "../src/facemesh/gallery.js";

const photo = (name) => ({ name, sha: `sha-${name}`, client: { id: name }, image: {}, landmarks: [], url: `blob:${name}` });

test("a new gallery is empty and idle", () => {
  const g = new Gallery();
  assert.equal(g.size, 0);
  assert.equal(g.active, null);
  assert.equal(g.session, "idle");
  assert.deepEqual(g.list(), []);
});

test("adding a photo gives it an id, makes it active and starts the session", () => {
  const g = new Gallery();
  const a = g.add(photo("me.jpg"));
  assert.match(a.id, /^p\d+$/);
  assert.equal(g.active, a);
  assert.equal(g.session, "live");
  assert.equal(a.client.id, "me.jpg", "what the page handed in is kept as it is");
  const b = g.add(photo("me2.jpg"));
  assert.notEqual(a.id, b.id);
  assert.equal(g.active, b, "the newest photo is the active one");
  assert.equal(g.size, 2);
});

test("two photos with the same file name get distinct names", () => {
  const g = new Gallery();
  assert.equal(g.add(photo("face.jpg")).name, "face.jpg");
  assert.equal(g.add(photo("face.jpg")).name, "face.jpg (2)");
  assert.equal(g.add(photo("face.jpg")).name, "face.jpg (3)");
  assert.equal(g.add({ ...photo("x"), name: "   " }).name, "photo", "a blank name becomes 'photo'");
  assert.equal(g.add({ ...photo("x"), name: undefined }).name, "photo (2)");
});

test("activating switches the active photo; an unknown id changes nothing", () => {
  const g = new Gallery();
  const a = g.add(photo("a")), b = g.add(photo("b"));
  assert.equal(g.activate(a.id), a);
  assert.equal(g.active, a);
  assert.equal(g.activate("p99"), null);
  assert.equal(g.active, a);
  assert.equal(g.get(b.id), b);
  assert.equal(g.get("nope"), null);
});

test("removing a photo that is not active leaves the active one alone", () => {
  const g = new Gallery();
  const a = g.add(photo("a")), b = g.add(photo("b"));
  const r = g.remove(a.id);
  assert.equal(r.item, a);
  assert.equal(r.wasActive, false);
  assert.equal(r.active, b);
  assert.equal(g.size, 1);
  assert.equal(g.session, "live");
});

test("removing the active photo leaves nothing active, and the last removal ends the live session", () => {
  const g = new Gallery();
  const a = g.add(photo("a")), b = g.add(photo("b"));
  const r = g.remove(b.id);
  assert.equal(r.wasActive, true);
  assert.equal(r.active, null);
  assert.equal(g.active, null, "the user picks the next one");
  assert.equal(g.session, "live", "a photo is still in the gallery");
  g.remove(a.id);
  assert.equal(g.session, "idle");
});

test("removing with select 'neighbour' makes the next photo active, or the one before when it was the last", () => {
  const g = new Gallery();
  const a = g.add(photo("a")), b = g.add(photo("b")), c = g.add(photo("c"));
  g.activate(b.id);
  assert.equal(g.remove(b.id, { select: "neighbour" }).active, c);
  assert.equal(g.active, c);
  assert.equal(g.remove(c.id, { select: "neighbour" }).active, a);
  assert.equal(g.remove(a.id, { select: "neighbour" }).active, null, "nothing left to select");
});

test("removing an unknown id is harmless", () => {
  const g = new Gallery();
  const a = g.add(photo("a"));
  const r = g.remove("p99");
  assert.deepEqual({ item: r.item, wasActive: r.wasActive }, { item: null, wasActive: false });
  assert.equal(g.active, a);
  assert.equal(g.drop("p99", "why").item, null);
  assert.deepEqual(g.dropped, []);
});

test("dropping keeps the name and the reason, so the page can say why a photo disappeared", () => {
  const g = new Gallery();
  const a = g.add(photo("a.jpg")), b = g.add(photo("b.jpg"));
  const r = g.drop(a.id, "consent expired");
  assert.equal(r.item, a);
  assert.equal(r.wasActive, false);
  g.drop(b.id, "consent ended: consent revoked");
  assert.deepEqual(g.dropped, [
    { id: a.id, name: "a.jpg", reason: "consent expired" },
    { id: b.id, name: "b.jpg", reason: "consent ended: consent revoked" },
  ]);
  assert.equal(g.session, "idle");
});

test("stop forgets every photo, returns them so their consents can be ended, and the session is over until a new photo", () => {
  const g = new Gallery();
  const a = g.add(photo("a")), b = g.add(photo("b"));
  const gone = g.stop();
  assert.deepEqual(gone, [a, b]);
  assert.equal(g.size, 0);
  assert.equal(g.active, null);
  assert.equal(g.session, "stopped");
  assert.deepEqual(g.stop(), [], "stopping twice is fine");
  g.add(photo("c"));
  assert.equal(g.session, "live", "a new photo starts a new session");
});

test("ids are never reused, even after photos are removed", () => {
  const g = new Gallery();
  const a = g.add(photo("a"));
  g.remove(a.id);
  const b = g.add(photo("b"));
  assert.notEqual(a.id, b.id);
  g.stop();
  assert.notEqual(g.add(photo("c")).id, b.id);
});

test("formatClock writes mm:ss, goes past 59 minutes and tolerates rubbish", () => {
  assert.equal(formatClock(0), "00:00");
  assert.equal(formatClock(7.9), "00:07");
  assert.equal(formatClock(75), "01:15");
  assert.equal(formatClock(3600 + 5), "60:05");
  assert.equal(formatClock(6005), "100:05");
  for (const bad of [-5, NaN, Infinity, undefined, null, "x"]) assert.equal(formatClock(bad), "00:00");
});

test("LiveTimer counts only the time a photo was really drawn", () => {
  const t = new LiveTimer();
  assert.equal(t.tick(1000, true), 0, "the first drawn frame adds nothing yet");
  assert.equal(t.tick(1500, true), 0.5);
  assert.equal(t.tick(2000, false), 0.5, "not drawn: it waits");
  assert.equal(t.tick(9000, false), 0.5);
  assert.equal(t.tick(9500, true), 0.5, "drawn again: the gap is not counted");
  assert.equal(t.tick(10000, true), 1);
  assert.equal(t.seconds, 1);
});

test("LiveTimer caps one long gap (a throttled tab) and ignores a clock that goes backwards", () => {
  const t = new LiveTimer(1000);
  t.tick(0, true);
  assert.equal(t.tick(60000, true), 1, "a minute-long gap adds at most 1 s");
  assert.equal(t.tick(59000, true), 1, "time going backwards adds nothing");
  t.reset();
  assert.equal(t.seconds, 0);
  assert.equal(t.tick(5, true), 0);
});

test("Toast shows its message for three seconds and then nothing", () => {
  const toast = new Toast();
  assert.equal(toast.durationMs, TOAST_MS);
  assert.equal(toast.current(0), "");
  toast.show("Avatar changed to me.jpg", 1000);
  assert.equal(toast.current(1000), "Avatar changed to me.jpg");
  assert.equal(toast.current(3999), "Avatar changed to me.jpg");
  assert.equal(toast.current(4000), "");
  toast.show("Session stopped", 5000);
  assert.equal(toast.current(5001), "Session stopped", "a new message replaces the old one");
});

test("gallery.js is pure: no DOM, no network, no storage, no picture", () => {
  const src = readFileSync(new URL("../src/facemesh/gallery.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  for (const word of ["document", "window", "canvas", "video", "readPixels", "getImageData", "toDataURL", "drawImage", "texImage2D", "fetch(",
    "XMLHttpRequest", "WebSocket", "localStorage", "sessionStorage", "indexedDB", "getUserMedia", "performance.now", "Date.now"]) {
    assert.ok(!src.includes(word), `gallery.js must not use ${word}`);
  }
});

test("neighbourOf: the item after, else the one before, else nothing, and an unknown id gives nothing", () => {
  const g = new Gallery();
  const a = g.add({ name: "a.png" }), b = g.add({ name: "b.png" }), c = g.add({ name: "c.png" });
  assert.equal(g.neighbourOf(a.id), b.id, "the one after");
  assert.equal(g.neighbourOf(b.id), c.id);
  assert.equal(g.neighbourOf(c.id), b.id, "the last has only one before it");
  assert.equal(g.neighbourOf("nope"), "");
  g.drop(a.id, "x"); g.drop(b.id, "x");
  assert.equal(g.neighbourOf(c.id), "", "alone in the gallery: nobody to take over");
});
