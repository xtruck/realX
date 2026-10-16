import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { ConsentClient, sha256Hex } from "../src/facemesh/consent.js";
import { LABEL, labelProblem, readLabel } from "../src/facemesh/guard.js";

// --- the client, against a stand-in for the server -------------------------------------------------------------------------

const SHA = createHash("sha256").update("a photo").digest("hex");

function server({ seconds = 3600, fail = null } = {}) {
  const calls = [];
  const reply = (status, body) => ({ ok: status < 400, status, json: async () => body });
  const fetchFn = async (path, init = {}) => {
    calls.push({ path, init, body: init.body ? JSON.parse(init.body) : null });
    if (fail && fail.path === path) { if (fail.throws) throw new Error("network down"); return reply(fail.status, { error: fail.error || "no" }); }
    if (path === "/api/facemesh/terms") return reply(200, { attestation: "This photo is of you", default_hours: 2, max_hours: 12 });
    if (path === "/api/facemesh/consent") return reply(200, { record: { subject_id: "self", scope: `portrait:${JSON.parse(init.body).sha256}`, record_id: "r1" }, seconds });
    if (path === "/api/facemesh/consent/check") return reply(200, { ok: true, seconds: seconds - 1 });
    if (path === "/api/facemesh/consent/revoke") return reply(200, { ok: true });
    return reply(404, { error: "not found" });
  };
  return { fetchFn, calls };
}
const clock = (start = 1_000_000) => { let t = start; return { now: () => t, tick: (ms) => { t += ms; } }; };

test("sha256Hex hashes the file's bytes into 64 lowercase hex characters", async () => {
  const bytes = new TextEncoder().encode("a photo");
  const file = { arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
  assert.equal(await sha256Hex(file), SHA);
});

test("issuing sends only the hash, the statement and the hours, and keeps the signed record", async () => {
  const s = server(), c = clock();
  const client = new ConsentClient({ fetchFn: s.fetchFn, now: c.now });
  assert.equal(client.valid().ok, false);
  assert.equal(await client.issue(SHA, 2, true), 3600);
  const call = s.calls[0];
  assert.equal(call.path, "/api/facemesh/consent");
  assert.equal(call.init.method, "POST");
  assert.equal(call.init.headers["Content-Type"], "application/json");
  assert.deepEqual(Object.keys(call.body).sort(), ["attested", "hours", "sha256"]);
  assert.deepEqual(call.body, { sha256: SHA, attested: true, hours: 2 });
  assert.equal(client.record.record_id, "r1");
  assert.equal(client.valid().ok, true);
  assert.ok(Math.abs(client.secondsLeft() - 3600) < 1);
});

test("anything but an outright yes is sent as no, and a refusal leaves no record", async () => {
  const s = server({ fail: { path: "/api/facemesh/consent", status: 403, error: "refusing to issue" } });
  const client = new ConsentClient({ fetchFn: s.fetchFn });
  await assert.rejects(() => client.issue(SHA, 2, "yes"), /refusing to issue/);
  assert.equal(s.calls[0].body.attested, false);
  assert.equal(client.record, null);
  assert.equal(client.valid().ok, false);
});

test("a check that the server answers yes keeps the consent going; a no from the server ends it for good", async () => {
  const s = server(), c = clock();
  const client = new ConsentClient({ fetchFn: s.fetchFn, now: c.now });
  await client.issue(SHA, 2, true);
  c.tick(2000);
  assert.deepEqual(await client.check(), { ok: true, reason: "" });
  assert.deepEqual(s.calls[1].body, { record: client.record, sha256: SHA }, "the check sends the record and the hash, nothing else");
  assert.equal(client.valid().ok, true);

  const s2 = server({ fail: { path: "/api/facemesh/consent/check", status: 403, error: "consent revoked" } });
  const ended = new ConsentClient({ fetchFn: s2.fetchFn, now: c.now });
  await ended.issue(SHA, 2, true);
  assert.equal((await ended.check()).ok, false);
  const v = ended.valid();
  assert.equal(v.ok, false);
  assert.match(v.reason, /consent ended: consent revoked/);
  c.tick(1000);
  assert.equal(ended.valid().ok, false, "it does not come back by itself");
});

test("a server that does not answer is tolerated for a few seconds, then the photo must stop", async () => {
  const s = server({ fail: { path: "/api/facemesh/consent/check", throws: true } }), c = clock();
  const client = new ConsentClient({ fetchFn: s.fetchFn, now: c.now });
  await client.issue(SHA, 2, true);
  c.tick(2000);
  assert.deepEqual(await client.check(), { ok: false, reason: "the server did not answer" });
  assert.equal(client.valid().ok, true, "2 s without an answer: still fine");
  c.tick(4500);
  const v = client.valid();
  assert.equal(v.ok, false);
  assert.match(v.reason, /has not confirmed/);
  assert.equal(v.stale, true, "stale is flagged, so a stalled page can ask again before giving up; ended and expired are not stale");
});

test("a record the server ended or whose time is up is never reported as stale", async () => {
  const s = server({ seconds: 10 }), c = clock();
  const client = new ConsentClient({ fetchFn: s.fetchFn, now: c.now });
  await client.issue(SHA, 0.003, true);
  c.tick(11000);
  const v = client.valid();
  assert.equal(v.ok, false);
  assert.notEqual(v.stale, true);
});

test("consent expires at the time the server gave", async () => {
  const s = server({ seconds: 10 }), c = clock();
  const client = new ConsentClient({ fetchFn: s.fetchFn, now: c.now });
  await client.issue(SHA, 0.003, true);          // the server said 10 seconds
  c.tick(5000);
  assert.equal(client.valid().ok, true);
  c.tick(5100);                                  // past the 10 s: expired, whatever else is true
  assert.deepEqual(client.valid(), { ok: false, reason: "consent expired" });
  assert.equal(client.secondsLeft(), 0);
});

test("revoking tells the server and forgets the record, even when the server cannot be reached", async () => {
  const s = server(), client = new ConsentClient({ fetchFn: s.fetchFn });
  await client.issue(SHA, 2, true);
  const record = client.record;
  await client.revoke();
  assert.deepEqual(s.calls[1].body, { record });
  assert.equal(client.record, null);
  assert.equal(client.valid().reason, "no consent");
  const down = server({ fail: { path: "/api/facemesh/consent/revoke", throws: true } });
  const other = new ConsentClient({ fetchFn: down.fetchFn });
  await other.issue(SHA, 2, true);
  await other.revoke();                          // does not throw
  assert.equal(other.record, null);
  await other.revoke();                          // nothing to do
});

test("terms come from the server", async () => {
  const s = server();
  const t = await new ConsentClient({ fetchFn: s.fetchFn }).terms();
  assert.match(t.attestation, /of you/);
  assert.equal(s.calls[0].path, "/api/facemesh/terms");
});

// What the consent code may and may not do: talk to /api/facemesh/* only, keep nothing, touch no picture.
test("consent.js talks only to /api/facemesh/, stores nothing and never touches a picture", () => {
  const src = readFileSync(new URL("../src/facemesh/consent.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  for (const url of src.match(/["'`]\/[^"'`\s]*["'`]/g) || []) assert.ok(/^["'`]\/api\/facemesh\//.test(url), `consent.js may only call /api/facemesh/: ${url}`);
  for (const word of ["localStorage", "sessionStorage", "indexedDB", "document.cookie", "video", "canvas", "readPixels", "getImageData", "toDataURL", "toBlob",
    "drawImage", "createImageBitmap", "FormData", "Blob", "XMLHttpRequest", "WebSocket", "sendBeacon", "getUserMedia"]) {
    assert.ok(!src.includes(word), `consent.js must not use ${word}`);
  }
  assert.equal((src.match(/arrayBuffer\(\)/g) || []).length, 1, "the photo's bytes are read once, to be hashed");
});

// --- the label guard --------------------------------------------------------------------------------------------------------

const VIEW = { width: 800, height: 900 };
const good = () => ({ present: true, hidden: false, display: "", visibility: "visible", opacity: 1, text: `${LABEL}: a photo of you is drawn on your live face`,
  fontPx: 12, covered: false, rect: { left: 10, top: 600, right: 410, bottom: 626, width: 400, height: 26 } });

test("a visible, opaque, readable label on top is fine", () => {
  assert.equal(labelProblem(good(), VIEW), "");
});

test("every way of hiding or spoiling the label is a problem with a reason", () => {
  const bad = (change) => labelProblem({ ...good(), ...change }, VIEW);
  assert.match(labelProblem(null, VIEW), /missing/);
  assert.match(labelProblem({ present: false }, VIEW), /missing/);
  assert.match(bad({ hidden: true }), /hidden/);
  assert.match(bad({ display: "none" }), /hidden/);
  assert.match(bad({ visibility: "hidden" }), /hidden/);
  assert.match(bad({ opacity: 0 }), /see-through/);
  assert.match(bad({ opacity: 0.3 }), /see-through/);
  assert.match(bad({ opacity: NaN }), /see-through/);
  assert.match(bad({ text: "" }), /no longer says/);
  assert.match(bad({ text: "Real face" }), /no longer says/);
  assert.match(bad({ rect: { ...good().rect, width: 20 } }), /too small/);
  assert.match(bad({ rect: { ...good().rect, height: 4 } }), /too small/);
  assert.match(bad({ fontPx: 2 }), /text is too small/);
  assert.match(bad({ rect: { ...good().rect, left: -300, right: 100 } }), /outside the window/);
  assert.match(bad({ rect: { ...good().rect, bottom: 2000, top: 1974 } }), /outside the window/);
  assert.match(bad({ covered: true }), /covers/);
});

// a stand-in page: elements with a parent, a computed style and a rectangle; elementFromPoint answers with whoever is on top
function page({ topIs = "label", ancestorStyle = {}, labelStyle = {}, hidden = false, connected = true } = {}) {
  const parent = { nodeType: 1, parentElement: null, hidden: false, style: { opacity: "1", display: "block", visibility: "visible", ...ancestorStyle } };
  const label = { nodeType: 1, parentElement: parent, hidden, isConnected: connected, textContent: `${LABEL}: test`, contains: (n) => n === label,
    style: { opacity: "1", display: "block", visibility: "visible", fontSize: "12px", ...labelStyle },
    getBoundingClientRect: () => ({ left: 10, top: 600, right: 410, bottom: 626, width: 400, height: 26 }) };
  const cover = { nodeType: 1 };
  return { el: label, doc: { elementFromPoint: () => (topIs === "label" ? label : cover) }, win: { getComputedStyle: (n) => n.style } };
}

test("readLabel describes a healthy label and sees one that is covered, faded by a parent, hidden by a parent or gone", () => {
  let p = page();
  assert.equal(labelProblem(readLabel(p.doc, p.win, p.el), VIEW), "");
  p = page({ topIs: "cover" });
  assert.match(labelProblem(readLabel(p.doc, p.win, p.el), VIEW), /covers/);
  p = page({ ancestorStyle: { opacity: "0.2" } });
  assert.match(labelProblem(readLabel(p.doc, p.win, p.el), VIEW), /see-through/);
  p = page({ ancestorStyle: { display: "none" } });
  assert.match(labelProblem(readLabel(p.doc, p.win, p.el), VIEW), /hidden/);
  p = page({ labelStyle: { visibility: "hidden" } });
  assert.match(labelProblem(readLabel(p.doc, p.win, p.el), VIEW), /hidden/);
  p = page({ hidden: true });
  assert.match(labelProblem(readLabel(p.doc, p.win, p.el), VIEW), /hidden/);
  p = page({ connected: false });
  assert.match(labelProblem(readLabel(p.doc, p.win, p.el), VIEW), /missing/);
  assert.match(labelProblem(readLabel(p.doc, p.win, null), VIEW), /missing/);
});

test("guard.js is numbers and booleans only: no picture, no network, no storage", () => {
  const src = readFileSync(new URL("../src/facemesh/guard.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  for (const word of ["canvas", "video", "readPixels", "getImageData", "toDataURL", "drawImage", "texImage2D", "fetch(", "XMLHttpRequest", "WebSocket",
    "localStorage", "sessionStorage", "indexedDB", "getUserMedia"]) {
    assert.ok(!src.includes(word), `guard.js must not use ${word}`);
  }
});
