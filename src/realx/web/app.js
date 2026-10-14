const $ = (id) => document.getElementById(id);
const api = async (path, opts = {}) => {
  const res = await fetch(path, opts);
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let message = "Something went wrong";
    try { message = (await res.json()).error || message; } catch (e) {}
    throw new Error(message);
  }
  return ct.includes("json") ? res.json() : res.blob();
};

// --- live view and measurements -------------------------------------------------
const view = $("view"), character = $("character"), tracker = $("tracker");
let lastFrames = -1, stalled = 0, mode = null;
view.addEventListener("load", () => { $("notice").hidden = true; applyMode(mode); }, { once: true });

// The 3D character is its own page (also used as an OBS Browser Source); the camera
// preview is the MJPEG image. Only one of them shows at a time.
// Full body mode is a third page: the same character plus this computer's camera, tracked inside
// that page. The server's own camera is released, and the OBS source receives the relayed numbers.
// Studio settings. Camera and microphone are remembered by id (plus the chosen device's own name so the
// select can show it before the list arrives); other devices' names are never stored.
const STUDIO_KEY = "realx.studio";
const QUALITY = ["low", "balanced", "high"];
const OUTFITS = ["coral", "ocean", "sunny", "berry", "forest"];
const VIEWS = ["full", "desk"];
const studio = { cam: null, mic: null, quality: "balanced", outfit: "coral", view: "full" };
// The browser only gives the microphone to a page the server sent with that permission, and the server does
// that only for a page requested with ?mic=1. So a microphone is in use only while this page carries the flag.
const micAllowed = new URLSearchParams(location.search).get("mic") === "1";
const isText = (v, max) => typeof v === "string" && v.length <= max;
const device = (d) => (d && typeof d === "object" && isText(d.id, 256) && d.id.length > 0 && isText(d.label, 128) ? { id: d.id, label: d.label } : null);
try {
  const saved = JSON.parse(localStorage.getItem(STUDIO_KEY) || "{}");
  studio.cam = device(saved.cam);
  studio.mic = micAllowed ? device(saved.mic) : null;
  if (QUALITY.includes(saved.quality)) studio.quality = saved.quality;
  if (OUTFITS.includes(saved.outfit)) studio.outfit = saved.outfit;
  if (VIEWS.includes(saved.view)) studio.view = saved.view;
} catch (e) { /* private window or a damaged value: start from the defaults */ }
function saveStudio() {
  try { localStorage.setItem(STUDIO_KEY, JSON.stringify(studio)); } catch (e) { /* simply not remembered */ }
}
function trackerUrl() {
  const p = new URLSearchParams({
    track: "1", publish: "1", preview: "1",
    frame: $("frameFull").checked ? "full" : "half",
    legs: $("legsMode").value === "off" ? "off" : "auto",
    quality: studio.quality,
  });
  if (studio.view === "desk") p.set("view", "desk");   // upper body only; the page forces the legs off itself
  if (studio.cam) p.set("cam", studio.cam.id);
  if (studio.mic && micAllowed) p.set("mic", studio.mic.id);
  if (studio.outfit !== "coral") p.set("outfit", studio.outfit);
  return `/avatar?${p}`;
}
const trackerAllow = () => (studio.mic && micAllowed ? "camera; microphone" : "camera");
function releaseTracker() {
  if (!tracker.getAttribute("src")) return;
  // removing the attribute alone would leave the old page (and its camera) running
  try { tracker.contentWindow.location.replace("about:blank"); } catch (e) { /* already gone */ }
  tracker.removeAttribute("src");
}
function applyMode(next) {
  mode = next;
  const isCharacter = mode === "character", isBody = mode === "body";
  const noPicture = isCharacter || isBody;   // neither draws the server's MJPEG picture
  if (isCharacter && !character.getAttribute("src")) character.src = "/avatar";
  if (isBody) {
    if (!tracker.getAttribute("src")) {
      tracker.setAttribute("allow", trackerAllow());
      tracker.setAttribute("src", trackerUrl());
    }
  } else {
    releaseTracker();
    lastStats = null;
  }
  $("studioStatus").hidden = !isBody;
  // the video stream only exists outside these modes; drop it so it frees its connection
  if (noPicture && view.getAttribute("src")) view.removeAttribute("src");
  if (!noPicture && !view.getAttribute("src")) view.src = "/stream.mjpg";
  character.hidden = !isCharacter;
  tracker.hidden = !isBody;
  view.hidden = noPicture || lastFrames < 1;
  if (isBody) $("notice").hidden = true;
  $("obs").hidden = !noPicture;
  $("obsBodyNote").hidden = !isBody;
  $("bodyPanel").hidden = !isBody;
  $("obsUrl").value = location.origin + "/avatar";
}
const tellTracker = (message) => { if (tracker.contentWindow) tracker.contentWindow.postMessage(message, location.origin); };
$("legsMode").addEventListener("change", (e) => tellTracker({ type: "realx-legs", mode: e.target.value === "off" ? "off" : "auto" }));
$("recenter").addEventListener("click", () => tellTracker({ type: "realx-recenter" }));
function reloadTracker() {   // a new camera, quality or outfit needs a fresh tracking page
  if (mode !== "body") return;
  tracker.setAttribute("allow", trackerAllow());
  tracker.setAttribute("src", trackerUrl());
}
$("frameFull").addEventListener("change", reloadTracker);

// --- studio controls --------------------------------------------------------------------------------
function fillDevices(select, offLabel, noun, list, chosen) {
  select.textContent = "";
  const first = document.createElement("option");
  first.value = ""; first.textContent = offLabel;
  select.append(first);
  const have = new Set();
  list.forEach((d, i) => {
    const o = document.createElement("option");
    o.value = d.id; o.textContent = d.label || `${noun} ${i + 1}`;   // text, never markup
    select.append(o);
    have.add(d.id);
  });
  if (chosen && !have.has(chosen.id)) {   // keep showing the remembered choice until the list says otherwise
    const o = document.createElement("option");
    o.value = chosen.id; o.textContent = chosen.label || noun;
    select.append(o);
  }
  select.value = chosen ? chosen.id : "";
}
const optionLabel = (select) => (select.selectedOptions[0] ? select.selectedOptions[0].textContent.slice(0, 128) : "");
fillDevices($("camSelect"), "Default camera", "Camera", [], studio.cam);
fillDevices($("micSelect"), "Off", "Microphone", [], studio.mic);
$("qualitySelect").value = studio.quality;
$("outfitSelect").value = studio.outfit;
$("viewMode").value = studio.view;
function syncView() {   // in the desk view the legs and whole-character options do not apply
  const desk = studio.view === "desk";
  $("legsMode").disabled = desk;
  $("frameFull").disabled = desk;
}
syncView();

$("camSelect").addEventListener("change", (e) => {
  studio.cam = e.target.value ? { id: e.target.value, label: optionLabel(e.target) } : null;
  saveStudio(); reloadTracker();
});
$("micSelect").addEventListener("change", (e) => {
  studio.mic = e.target.value ? { id: e.target.value, label: optionLabel(e.target) } : null;
  saveStudio();
  // the microphone permission belongs to the page load: switching it on or off reloads this page
  if (studio.mic && !micAllowed) location.replace("/?mic=1");
  else if (!studio.mic && micAllowed) location.replace("/");
  else reloadTracker();
});
$("qualitySelect").addEventListener("change", (e) => {
  studio.quality = QUALITY.includes(e.target.value) ? e.target.value : "balanced";
  saveStudio(); reloadTracker();
});
$("viewMode").addEventListener("change", (e) => {
  studio.view = VIEWS.includes(e.target.value) ? e.target.value : "full";
  syncView(); saveStudio(); reloadTracker();
});
$("outfitSelect").addEventListener("change", (e) => {
  studio.outfit = OUTFITS.includes(e.target.value) ? e.target.value : "coral";
  saveStudio(); reloadTracker();
});

// --- what the tracking page tells us --------------------------------------------------------------------
// Only the tracker iframe, from this origin, with exactly the documented shape. Anything else is dropped.
const num = (v, lo, hi) => typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;
const perModel = (o, lo, hi) => !!o && typeof o === "object" && ["pose", "face", "hands"].every((k) => num(o[k], lo, hi));
const STATES = ["camera", "models", "running", "error", "stopped"];
function parseStats(d) {
  const { fps, skipped, latencyMs, hz, ms, delegates, diag, mic, avSyncMs, state, detail } = d;
  if (!num(fps, 0, 1000) || !Number.isInteger(skipped) || skipped < 0 || skipped > 1e9 || !num(latencyMs, 0, 60000)) return null;
  if (!perModel(hz, 0, 1000) || !perModel(ms, 0, 60000)) return null;
  if (!delegates || typeof delegates !== "object" || !["pose", "face", "hands"].every((k) => isText(delegates[k], 8) && /^[A-Za-z]+$/.test(delegates[k]))) return null;
  if (!diag || typeof diag !== "object" || typeof diag.face !== "boolean" || typeof diag.pose !== "boolean") return null;
  if (!Number.isInteger(diag.hands) || diag.hands < 0 || diag.hands > 8 || !isText(diag.handHint, 160)) return null;
  if (!Array.isArray(diag.wrists) || diag.wrists.length !== 2 || !diag.wrists.every((w) => w === null || num(w, 0, 1))) return null;
  if (mic !== null && !(mic && typeof mic === "object" && typeof mic.active === "boolean" && typeof mic.speaking === "boolean" && num(mic.levelDb, -200, 20) && num(mic.latencyMs, 0, 10000))) return null;
  if (avSyncMs !== null && !num(avSyncMs, -10000, 10000)) return null;
  if (!STATES.includes(state) || !isText(detail, 200)) return null;
  return { fps, skipped, latencyMs, hz, ms, delegates, diag, mic, avSyncMs, state, detail };
}
function onDevices(d) {
  const ok = (l) => Array.isArray(l) && l.length <= 32 && l.every((x) => !!device(x));
  if (!ok(d.cameras) || !ok(d.mics)) return;
  const cams = d.cameras.map(device), mics = d.mics.map(device);
  const missing = studio.cam && !cams.some((c) => c.id === studio.cam.id);
  if (missing) { studio.cam = null; saveStudio(); }          // the remembered camera is gone: back to the default
  fillDevices($("camSelect"), "Default camera", "Camera", cams, studio.cam);
  fillDevices($("micSelect"), "Off", "Microphone", mics, studio.mic);
  if (missing) reloadTracker();
}
let lastStats = null, lastStatsAt = 0, lastBody = null;
const STALE_MS = 4000;
window.addEventListener("message", (ev) => {
  try {
    if (ev.origin !== location.origin || !tracker.contentWindow || ev.source !== tracker.contentWindow) return;
    const d = ev.data;
    if (!d || typeof d !== "object" || Array.isArray(d)) return;
    if (d.type === "realx-devices") onDevices(d);
    else if (d.type === "realx-stats") {
      const s = parseStats(d);
      if (s) { lastStats = s; lastStatsAt = performance.now(); renderStudio(); }
    }
  } catch (e) { /* a malformed message must never break the control room */ }
});
function renderStudio() {
  if ($("studioStatus").hidden) return;
  const set = (id, text) => { $(id).textContent = text; };
  const waiting = lastStats === null ? "No measurement yet" : performance.now() - lastStatsAt > STALE_MS ? "No recent measurement" : null;
  $("stViewers").textContent = lastBody ? String(Number.isFinite(lastBody.viewers) ? lastBody.viewers : 0) : "No measurement yet";
  set("stPublishing", lastBody ? (lastBody.publishing ? "Yes" : "No") : "No measurement yet");
  if (waiting) {
    for (const id of ["stFps", "stLatency", "stSkipped", "stRates", "stBackend", "stSees", "stMic", "stSync", "stState"]) set(id, waiting);
    $("micMeter").hidden = true;
    return;
  }
  const s = lastStats, r = Math.round;
  set("stFps", `${s.fps.toFixed(1)} frames per second`);
  set("stLatency", `${r(s.latencyMs)} ms`);
  set("stSkipped", String(s.skipped));
  set("stRates", ["pose", "face", "hands"].map((k) => `${k} ${r(s.hz[k])}/s (${r(s.ms[k])} ms)`).join(" · "));
  set("stBackend", ["pose", "face", "hands"].map((k) => `${k} ${s.delegates[k]}`).join(" · "));
  set("stSees", `body ${s.diag.pose ? "yes" : "no"} · face ${s.diag.face ? "yes" : "no"} · hands: ${s.diag.handHint}`);
  if (s.mic && s.mic.active) {
    set("stMic", `${s.mic.speaking ? "Speaking" : "Listening"} (${r(s.mic.levelDb)} dB, ${r(s.mic.latencyMs)} ms delay)`);
    $("micMeter").setAttribute("value", String(s.mic.levelDb));
    $("micMeter").hidden = false;
  } else { set("stMic", "Off"); $("micMeter").hidden = true; }
  const a = s.avSyncMs;
  set("stSync", a === null ? "No microphone" : Math.abs(a) <= 40 ? "In sync (within 40 ms)" : a > 0 ? `Out of sync: audio ahead by ${r(a)} ms` : `Out of sync: audio behind by ${r(-a)} ms`);
  set("stState", s.state === "running" ? "Running" : s.state === "error" ? `Error: ${s.detail || "unknown"}` : `Starting (${s.state})${s.detail ? ": " + s.detail : ""}`);
}
function bodyStatusText(s) {
  const b = s.body;
  if (!b || !b.publishing) return "Waiting for the camera…";
  return `Tracking is live. Viewers connected: ${Number.isFinite(b.viewers) ? b.viewers : 0}`;
}
document.querySelectorAll(".emote").forEach((b) => b.addEventListener("click", () =>
  api("/api/emote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: b.dataset.emote }) }).catch(() => {})));
$("obsCopy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("obsUrl").value); $("obsCopy").textContent = "Copied"; }
  catch (e) { $("obsUrl").select(); $("obsCopy").textContent = "Press Ctrl+C"; }
  setTimeout(() => { $("obsCopy").textContent = "Copy address"; }, 1800);
});

const ribbon = $("ribbon");
const ctx = ribbon.getContext("2d");
function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function drawRibbon(states) {
  const w = ribbon.width, h = ribbon.height, n = 120, step = w / n;
  ctx.clearRect(0, 0, w, h);
  const colors = [css("--rule"), css("--teal"), css("--amber")];
  const heights = [0.35, 0.9, 0.62];
  states.forEach((s, i) => {
    const x = (n - states.length + i) * step;
    const bh = h * heights[s];
    ctx.fillStyle = colors[s];
    ctx.fillRect(x + 1, h - bh - 4, step - 2, bh);
  });
}

async function poll() {
  try {
    const s = await api("/api/stats");
    $("sFps").textContent = s.fps.toFixed(0);
    $("sLat").textContent = s.latency_ms.toFixed(0);
    $("sFaces").textContent = s.faces;
    $("sDrop").textContent = s.dropped;
    drawRibbon(s.ribbon);
    stalled = s.frames === lastFrames ? stalled + 1 : 0;
    lastFrames = s.frames;
    const inBody = s.config.mode === "body";
    lastBody = inBody && s.body && typeof s.body === "object" ? s.body : null;
    renderStudio();
    // in Full body mode the server has no picture of its own: "live" means a tracker page is publishing
    const live = inBody ? !!(s.body && s.body.publishing) : s.frames > 0 && stalled < 3 && !s.error;
    $("tally").classList.toggle("live", live);
    if (inBody) {
      applyMode("body");
      $("bodyStatus").textContent = bodyStatusText(s);
    } else if (live) { $("notice").hidden = true; applyMode(s.config.mode); }
    $("state").textContent = inBody ? (live ? "Live" : "Waiting for the camera")
      : s.error ? "Needs attention" : live ? "Live" : "Waiting for video";
    if (s.error && !inBody) {
      $("notice").hidden = false;
      $("notice").textContent = s.error + " Choose a demo source or check your camera.";
    }
    $("srcLabel").textContent = inBody ? "This computer's camera" : s.config.source === "camera" ? "Camera" : "Demo footage";
    syncControls(s.config);
  } catch (e) {
    $("tally").classList.remove("live");
    $("state").textContent = "Disconnected";
  }
}
setInterval(poll, 500);
poll();

// --- picture controls -------------------------------------------------------------
let editing = 0;
function syncControls(c) {
  if (Date.now() - editing < 1500) return;
  document.querySelectorAll('input[name="mode"]').forEach((r) => { r.checked = r.value === c.mode; });
  if (c.mode !== mode) applyMode(c.mode);
  document.querySelectorAll('input[name="background"]').forEach((r) => { r.checked = r.value === c.background; });
  $("source").value = c.source;
  $("smooth").value = Math.round(c.smoothing * 100);
  $("smoothOut").textContent = Math.round(c.smoothing * 100) + "%";
}
async function setConfig(changes) {
  editing = Date.now();
  try {
    await api("/api/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) });
    $("cfgMsg").className = "msg ok"; $("cfgMsg").textContent = "Updated";
  } catch (e) {
    $("cfgMsg").className = "msg err"; $("cfgMsg").textContent = e.message;
  }
}
document.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener("change", () => { applyMode(r.value); setConfig({ mode: r.value }); }));
$("source").addEventListener("change", (e) => setConfig({ source: e.target.value }));
let t;
$("smooth").addEventListener("input", (e) => {
  $("smoothOut").textContent = e.target.value + "%";
  clearTimeout(t); t = setTimeout(() => setConfig({ smoothing: e.target.value / 100 }), 200);
});
// --- background -------------------------------------------------------------------
const bgMsg = (cls, text) => { $("bgMsg").className = "msg " + cls; $("bgMsg").textContent = text; };
document.querySelectorAll('input[name="background"]').forEach((r) => r.addEventListener("change", async () => {
  editing = Date.now();
  try {
    await api("/api/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ background: r.value }) });
    bgMsg("ok", "Updated");
  } catch (e) {
    bgMsg("err", e.message);
    poll();  // put the selector back to what the server really has
  }
}));
$("bgFile").addEventListener("change", async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  bgMsg("", "Uploading…");
  editing = Date.now();
  try {
    await api("/api/background", { method: "POST", headers: { "Content-Type": f.type }, body: f });
    await api("/api/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ background: "photo" }) });
    bgMsg("ok", "Photo in place.");
  } catch (err) {
    bgMsg("err", err.message);
  }
  e.target.value = "";
});
$("guideToggle").addEventListener("change", (e) => $("guides").classList.toggle("on", e.target.checked));

// --- voice ------------------------------------------------------------------------
const pitch = $("pitch");
const fmt = (v) => (v > 0 ? "+" : "") + v + (Math.abs(v) === 1 ? " semitone" : " semitones");
pitch.addEventListener("input", () => { $("pitchOut").textContent = fmt(Number(pitch.value)); });
$("pitchOut").textContent = fmt(Number(pitch.value));

const preset = $("preset");
preset.addEventListener("change", () => { $("pitchBox").hidden = preset.value !== ""; });
api("/api/voices").then((v) => {
  v.presets.forEach((p) => {
    const o = document.createElement("option");
    o.value = p.id; o.textContent = `${p.label}: ${p.description}`;
    preset.append(o);
  });
  $("presetNote").textContent = v.note;
}).catch(() => {});

async function convert(body, demo) {
  const buttons = [$("convert"), $("tone")];
  buttons.forEach((b) => (b.disabled = true));
  $("voiceMsg").className = "msg"; $("voiceMsg").textContent = "Converting…";
  try {
    const blob = await api(`/api/voice?${preset.value ? "preset=" + encodeURIComponent(preset.value) : "semitones=" + pitch.value}${demo ? "&demo=1" : ""}`, { method: "POST", body });
    const url = URL.createObjectURL(blob);
    $("player").src = url; $("player").hidden = false;
    $("download").href = url; $("download").download = "realx-voice.wav"; $("download").hidden = false;
    $("voiceMsg").className = "msg ok"; $("voiceMsg").textContent = "Done. Press play to listen.";
  } catch (e) {
    $("voiceMsg").className = "msg err"; $("voiceMsg").textContent = e.message;
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
}
$("convert").addEventListener("click", () => {
  const f = $("file").files[0];
  if (!f) { $("voiceMsg").className = "msg err"; $("voiceMsg").textContent = "Choose a WAV recording first."; return; }
  convert(f, false);
});
$("tone").addEventListener("click", () => convert(new Blob([]), true));

// --- safety -----------------------------------------------------------------------
api("/api/safety").then((s) => {
  const blocked = Object.keys(s.blocked);
  const models = Object.entries(s.models).map(([n, m]) => `${n} (${m.license})`).join(", ");
  const list = $("safety");
  list.textContent = "";
  [
    ["Consent", s.consent],
    ["Provenance", s.watermark],
    ["Voices", s.voices],
    ["Models in use", models],
    ["Blocked", blocked.length ? blocked.join(", ") + " until licensed" : "none"],
  ].forEach(([k, v]) => {
    const li = document.createElement("li");
    const b = document.createElement("b"); b.textContent = k;
    const em = document.createElement("em"); em.textContent = v;
    li.append(b, em); list.append(li);
  });
}).catch(() => {
  const li = document.createElement("li");
  const em = document.createElement("em"); em.textContent = "Safety details are unavailable.";
  li.append(em); $("safety").textContent = ""; $("safety").append(li);
});
