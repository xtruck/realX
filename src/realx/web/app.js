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
function trackerUrl() {
  const legs = $("legsMode").value === "off" ? "off" : "auto";
  const frame = $("frameFull").checked ? "full" : "half";
  return `/avatar?track=1&publish=1&preview=1&frame=${frame}&legs=${legs}`;
}
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
    if (!tracker.getAttribute("src")) tracker.setAttribute("src", trackerUrl());
  } else {
    releaseTracker();
  }
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
$("frameFull").addEventListener("change", () => { if (mode === "body") tracker.setAttribute("src", trackerUrl()); });
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
