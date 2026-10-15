// The OBS dock's plain logic: what to send for each button, how the server's numbers become the lights, and a
// small self-reconnecting WebSocket. No DOM, so it is tested with fakes.
//
// Commands go out over the authenticated /api routes (same origin, token cookie), the same ones the control
// room uses. /ws/rig is a read-only stream: the dock listens to it for a live "connected" light and the
// stream's provenance statement, it cannot change anything through it.

const JSON_HEADERS = { "Content-Type": "application/json" };
const post = (path, payload) => ({ path, method: "POST", headers: JSON_HEADERS, body: JSON.stringify(payload) });

export const VOICES = ["pip", "bear", "imp", "robot", "radio"];
export const BACKGROUNDS = ["off", "blur", "photo"];
export const BLUR_MIN = 3, BLUR_MAX = 151;
export const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

export const commands = {
  voice: (id) => {
    if (id !== "" && !VOICES.includes(id)) throw new Error(`unknown voice preset: ${id}`);
    return post("/api/dock", { voice: id });
  },
  mute: (muted) => post("/api/dock", { mic_muted: !!muted }),
  background: (mode) => {
    if (!BACKGROUNDS.includes(mode)) throw new Error(`unknown background: ${mode}`);
    return post("/api/config", { background: mode });
  },
  blur: (n) => {
    const v = Math.round(Number(n));
    if (!Number.isFinite(v)) throw new Error("blur must be a number");
    return post("/api/config", { blur: Math.min(BLUR_MAX, Math.max(BLUR_MIN, v)) });
  },
  photo: (file) => {
    if (!file || !["image/jpeg", "image/png"].includes(file.type)) throw new Error("Choose a JPEG or PNG picture.");
    if (file.size > MAX_PHOTO_BYTES) throw new Error("The picture is larger than 12 MB.");
    return { path: "/api/background", method: "POST", headers: { "Content-Type": file.type }, body: file };
  },
};

/** Turns /api/stats into what the dock shows. Anything missing reads as "unknown", never as "fine". */
export function viewOf(stats, { rigConnected = false, now = Date.now(), at = now } = {}) {
  const s = stats && typeof stats === "object" ? stats : null;
  const fresh = !!s && now - at < 4000;
  const cfg = (s && s.config) || {}, dock = (s && s.dock) || {}, sec = (s && s.security) || {};
  const server = !s ? "down" : !fresh ? "stale" : s.error ? "problem" : "ok";
  return {
    server,
    rig: rigConnected,
    token: sec.token === "fixed" ? "fixed" : sec.token === "per-run" ? "per-run" : "unknown",
    watermark: sec.watermark === true ? "on" : "unknown",
    muted: dock.mic_muted === true,
    voice: typeof dock.voice === "string" ? dock.voice : "",
    background: BACKGROUNDS.includes(cfg.background) ? cfg.background : "off",
    blur: Number.isInteger(cfg.blur) ? cfg.blur : 41,
    mode: typeof cfg.mode === "string" ? cfg.mode : "",
  };
}

/** One sentence per light, for the tooltips and for screen readers. */
export function describeView(v) {
  return {
    server: { ok: "Server running", stale: "No answer from the server for a few seconds", down: "Cannot reach the server", problem: "Server reports a problem" }[v.server],
    rig: v.rig ? "Live stream to the character is connected" : "Character stream is not connected",
    token: { fixed: "Access token is fixed (REALX_TOKEN): this OBS setup keeps working after a restart", "per-run": "Access token changes every run: set REALX_TOKEN so OBS keeps working", unknown: "Access token status unknown" }[v.token],
    watermark: v.watermark === "on" ? "Provenance mark is on for voice output" : "Provenance mark status unknown",
  };
}

/** The lights as green/amber/red. A fixed token is the good state; a per-run one is only a heads-up. */
export function lights(v) {
  return {
    server: v.server === "ok" ? "ok" : v.server === "problem" || v.server === "stale" ? "warn" : "bad",
    rig: v.rig ? "ok" : "warn",
    token: v.token === "fixed" ? "ok" : v.token === "per-run" ? "warn" : "bad",
    watermark: v.watermark === "on" ? "ok" : "bad",
  };
}

/** Calls fn at most once per `ms`, with the latest arguments (for the blur slider). */
export function debounce(fn, ms, timers = { set: setTimeout, clear: clearTimeout }) {
  let id = null, last;
  const run = (...args) => { last = args; if (id !== null) timers.clear(id); id = timers.set(() => { id = null; fn(...last); }, ms); };
  run.cancel = () => { if (id !== null) timers.clear(id); id = null; };
  return run;
}

/**
 * A read-only rig socket that reconnects with growing pauses (1 s up to 10 s).
 * handlers: { open(), close(), hello(msg), message(msg) }. Only plain objects with a string `type` are passed on.
 */
export function connectRig(url, handlers, { WebSocketCtor = globalThis.WebSocket, timers = { set: setTimeout, clear: clearTimeout } } = {}) {
  let sock = null, retry = null, wait = 1000, closed = false;
  const open = () => {
    if (closed) return;
    sock = new WebSocketCtor(url);
    sock.onopen = () => { wait = 1000; handlers.open && handlers.open(); };
    sock.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (!msg || typeof msg !== "object" || typeof msg.type !== "string") return;
      if (msg.type === "hello") handlers.hello && handlers.hello(msg);
      else handlers.message && handlers.message(msg);
    };
    sock.onclose = () => {
      handlers.close && handlers.close();
      if (closed) return;
      retry = timers.set(open, wait);
      wait = Math.min(wait * 2, 10000);
    };
    sock.onerror = () => { try { sock.close(); } catch (e) { /* already closed */ } };
  };
  open();
  return { close() { closed = true; if (retry !== null) timers.clear(retry); try { sock && sock.close(); } catch (e) { /* done */ } } };
}
