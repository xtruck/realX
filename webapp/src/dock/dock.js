// OBS browser dock for realX. Add it in OBS: View > Docks > Custom Browser Docks, URL
// http://127.0.0.1:8765/dock?token=YOUR_TOKEN (use a fixed REALX_TOKEN so the URL keeps working).
import { VOICES, commands, connectRig, debounce, describeView, lights, viewOf } from "./dockLogic.js";

const $ = (id) => document.getElementById(id);
const msg = (text, err = false) => { $("msg").textContent = text; $("msg").className = err ? "err" : ""; };

async function send(cmd) {
  const res = await fetch(cmd.path, { method: cmd.method, headers: cmd.headers, body: cmd.body, credentials: "same-origin" });
  if (!res.ok) {
    let why = `${res.status}`;
    try { why = (await res.json()).error || why; } catch (e) { /* not JSON */ }
    throw new Error(why);
  }
  return res.json().catch(() => ({}));
}
async function run(build) {
  try { await send(build()); msg(""); poll(); } catch (e) { msg(e.message || "That did not work.", true); }
}

// voice presets
const voices = $("voices");
for (const id of ["", ...VOICES]) {
  const b = document.createElement("button");
  b.dataset.voice = id; b.textContent = id || "Off";
  b.addEventListener("click", () => run(() => commands.voice(id)));
  voices.append(b);
}
$("mute").addEventListener("click", () => run(() => commands.mute($("mute").getAttribute("aria-pressed") !== "true")));
for (const b of document.querySelectorAll("[data-bg]")) b.addEventListener("click", () => run(() => commands.background(b.dataset.bg)));
const sendBlur = debounce((n) => run(() => commands.blur(n)), 200);
$("blur").addEventListener("input", (e) => { $("blurOut").textContent = e.target.value; sendBlur(e.target.value); });
$("photo").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try { await send(commands.photo(file)); await send(commands.background("photo")); msg(""); poll(); } catch (err) { msg(err.message, true); }
});

// state
let stats = null, statsAt = 0, rig = false;
function render() {
  const v = viewOf(stats, { rigConnected: rig, at: statsAt });
  const state = lights(v), say = describeView(v);
  for (const [id, key] of [["lServer", "server"], ["lRig", "rig"], ["lToken", "token"], ["lMark", "watermark"]]) {
    $(id).dataset.state = state[key]; $(id).title = say[key]; $(id).setAttribute("aria-label", say[key]);
  }
  $("mute").setAttribute("aria-pressed", String(v.muted));
  $("mute").textContent = v.muted ? "Microphone muted: tap to unmute" : "Mute microphone";
  for (const b of voices.children) b.classList.toggle("on", b.dataset.voice === v.voice);
  for (const b of document.querySelectorAll("[data-bg]")) b.classList.toggle("on", b.dataset.bg === v.background);
  if (document.activeElement !== $("blur")) { $("blur").value = String(v.blur); $("blurOut").textContent = String(v.blur); }
}
async function poll() {
  try { stats = await (await fetch("/api/stats", { credentials: "same-origin" })).json(); statsAt = Date.now(); } catch (e) { /* the light says so */ }
  render();
}
connectRig(`ws://${location.host}/ws/rig`, { open: () => { rig = true; render(); }, close: () => { rig = false; render(); } });
poll();
setInterval(poll, 1000);
