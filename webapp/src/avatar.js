// Renders the original realX character from rig numbers sent by the tracker.
// The page never sees camera pixels: only head pose and smile width arrive.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { BodySolver, restFrom } from "./retarget.js";
import { startTracker } from "./tracker.js";
import { hasFlag, packStats, unpackBody } from "./body.js";
import { idleQuats } from "./idle.js";
import { BONES, EXPRESSIONS } from "./skeleton.js";
import { applyExpressions } from "./express.js";
import { startMic } from "./mic.js";
import { collectHairTips, healHair, tipPositions } from "./hair.js";
import { GestureController } from "./utils/gestureRecognizer.js";
import { FaceConfidence, withAmplitudeFloor } from "./utils/audioLipSync.js";
import { DynamicLighting, makeCanvasSampler } from "./utils/dynamicLighting.js";
import { DeviceSupervisor } from "./recover.js";
import { DelayLine, MouthBlender, MouthFromAudio, avSyncOffset } from "./speech.js";

const params = new URLSearchParams(location.search);
const MIRROR = params.get("mirror") !== "0"; // selfie view: the character moves like your reflection
// ?track=1 turns on this page's own camera and drives the character from it; ?publish=1 also shares the
// result with other pages (an OBS Browser Source); ?preview=1 shows the camera in a corner
const TRACK = params.get("track") === "1";
const PUBLISH = TRACK && params.get("publish") === "1";
const PREVIEW = TRACK && params.get("preview") === "1";
const DESK = params.get("view") === "desk"; // seated at a desk: only the upper body is seen and followed
const LEGS = DESK ? "off" : ["auto", "off", "on"].includes(params.get("legs")) ? params.get("legs") : "auto";
const DELEGATE = ["auto", "cpu", "gpu"].includes(params.get("delegate")) ? params.get("delegate") : "auto";
const clipParam = (name) => (params.get(name) || "").replace(/[\u0000-\u001f]/g, "").slice(0, 256) || null;
const CAM = clipParam("cam");               // a camera's deviceId, chosen in the control room
const QUALITY_NAME = params.get("quality"); // low | balanced | high; anything else means balanced
const MIC = clipParam("mic");               // a microphone's deviceId ("default" for the system one); absent means no microphone
// the label can be hidden for a plain OBS view, but never on a page that is running someone's camera
const SHOW_BADGE = params.get("badge") !== "off" || params.get("track") === "1";
const FRAMING = DESK ? { dist: 1.95, y: 0.80 } : params.get("frame") === "full" ? { dist: 2.7, y: 0.68 } : { dist: 1.75, y: 0.86 };

const OUTFITS = { // [outfit, accent]; the character's skin and face never change
  coral: ["#f28573", "#333f73"], ocean: ["#3a86d1", "#1d2b53"], sunny: ["#f2c14e", "#7a4e1d"],
  berry: ["#b5446e", "#3a1c40"], forest: ["#3f8f5a", "#1f3d2b"],
};
const OUTFIT = OUTFITS[params.get("outfit")] ? params.get("outfit") : "coral";
const HEX = /^[0-9a-fA-F]{6}$/;   // ?hair=5b3a29 and ?skin=eeb89a recolour a character that has materials named "hair" / "skin" (Mira)
const HAIR_COLOR = HEX.test(params.get("hair") || "") ? `#${params.get("hair")}` : null;
const SKIN_COLOR = HEX.test(params.get("skin") || "") ? `#${params.get("skin")}` : null;
const clip = (v, n) => (v || "").replace(/[\u0000-\u001f]/g, "").slice(0, n);
const SHOP = clip(params.get("name"), 40), TAGLINE = clip(params.get("tagline"), 80);

// test and debugging hook; holds numbers only
const probe = (window.__realx = {
  outfit: OUTFIT, emotes: [], gestures: [], micMuted: false, connected: false, modelLoaded: false, error: null, frames: 0, rigMessages: 0, pose: null,
  tracking: null, bodyMessages: 0, bodyLive: false, bodyFlags: null, rejected: 0, sent: 0, recenter: () => {},
});

// --- full-body state: the newest validated body message, from this page's tracker or from the relay ---
const body = { t: -Infinity, quats: null, expr: null, root: [0, 0, 1], flags: null };
const shownQ = Object.fromEntries(BONES.map((b) => [b, new THREE.Quaternion()]));
const targetQ = Object.fromEntries(BONES.map((b) => [b, new THREE.Quaternion()]));
const shownRoot = [0, 0, 1], shownExpr = {};
const IDLE = idleQuats(DESK);
let bodyWasLive = false;
let tracker = null, socket = null;

function onBody(raw) {
  const msg = unpackBody(raw);
  if (!msg) { probe.rejected++; return; }       // anything malformed is dropped, never applied
  probe.bodyMessages++;
  body.t = performance.now() / 1000;
  body.quats = msg.quats; body.expr = msg.expr; body.root = msg.root; body.flags = msg.flags;
  probe.bodyFlags = msg.flags;
  for (const b of BONES) targetQ[b].set(...msg.quats[b]);
}

const canvas = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true });
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
camera.position.set(0, FRAMING.y + 0.05, FRAMING.dist);
camera.lookAt(0, FRAMING.y, 0);
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(0.8, 1.2, 1.5);
const ambient = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(sun, ambient);

// Dynamic lighting follows the background photo chosen in the control room. The server names it in the rig
// stream as a tiny same-origin picture (see followBackground); with no photo in use the light eases back to neutral.
// The camera is never sampled (see utils/dynamicLighting.js). ?light=off keeps the lights fixed.
const lighting = params.get("light") === "off" ? null : new DynamicLighting({ ambient, sun, sample: null });
let lightUrl = null;
const LIGHT_URL = /^\/avatar\/background\.png\?v=\d{1,9}$/;
function followBackground(bg) {
  const url = bg && typeof bg.url === "string" && LIGHT_URL.test(bg.url) ? bg.url : null;
  if (!lighting || url === lightUrl) return;
  lightUrl = url;
  probe.lightUrl = url;
  if (!url) return lighting.setSample(null);
  const img = new Image();
  img.src = url;   // same origin only (img-src 'self'), so the canvas is never tainted
  lighting.setSample(makeCanvasSampler(img));
}

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

// --- rig state: targets arrive at the tracker rate, the display runs at its own rate ---
const KEYS = ["x", "y", "depth", "yaw", "pitch", "roll", "smile"];
const target = Object.fromEntries(KEYS.map((k) => [k, k === "depth" ? 1 : 0]));
const shown = { ...target };
let lastRig = -Infinity; // seconds, performance.now() based
let present = false;

let lastEmoteId = null;
const EMOTE_SECONDS = { wave: 2.2, happy: 1.8, surprised: 1.4, bow: 1.6 };
let emote = null; // { name, start }
function startEmote(name) {
  if (!EMOTE_SECONDS[name]) return;
  emote = { name, start: performance.now() / 1000 };
  probe.emotes.push(name);
}

function onRig(msg) {
  probe.rigMessages++;
  const face = msg.faces && msg.faces[0];
  followBackground(msg.background);
  followServerMute(msg.mic);
  if (msg.emote && msg.emote.id !== lastEmoteId) {
    if (msg.emote.age < 2.5) startEmote(msg.emote.name); // never replay an old press after a reconnect
    lastEmoteId = msg.emote.id;
  }
  if (!face) { present = false; return; }
  present = true;
  lastRig = performance.now() / 1000;
  for (const k of KEYS) {
    const v = Number(face[k]);
    if (Number.isFinite(v)) target[k] = v;
  }
  if (MIRROR) { target.x = -target.x; target.yaw = -target.yaw; target.roll = -target.roll; }
}

function connect(delay = 500) {
  const ws = new WebSocket(`ws://${location.host}/ws/rig${PUBLISH ? "?publish=1" : ""}`);
  socket = ws;
  ws.onopen = () => { probe.connected = true; delay = 500; };
  ws.onmessage = (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch (e) { return; }
    if (msg.type === "hello") showBadge(msg.provenance);
    else if (msg.type === "rig") onRig(msg);
    else if (msg.type === "body" && !TRACK) onBody(msg);   // a tracking page trusts its own camera, not the relay
  };
  ws.onclose = () => {
    probe.connected = false;
    socket = null;
    present = false;
    setTimeout(() => connect(Math.min(delay * 2, 5000)), delay);
  };
  ws.onerror = () => ws.close();
}

// --- provenance badge: states plainly that this is a virtual character ---
function showBadge(p) {
  const el = document.getElementById("badge");
  if (!el || !SHOW_BADGE || !p) return;
  el.textContent = p.synthetic ? "Virtual character · " + p.generator : "";
  el.hidden = !p.synthetic;
}

// --- shop name lower third: plain text only ---
(function lowerThird() {
  const el = document.getElementById("lower");
  if (!el || (!SHOP && !TAGLINE)) return;
  el.querySelector("b").textContent = SHOP;
  el.querySelector("span").textContent = TAGLINE;
  el.hidden = false;
})();

// --- model ---
let vrm = null;
const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));
loader.load(
  "/avatar/model.vrm",
  (gltf) => {
    vrm = gltf.userData.vrm;
    if (!vrm) { probe.error = "file is not a VRM model"; return; }
    dress(vrm);
    hairTips.push(...collectHairTips(vrm.scene));   // Mira's strands: measured by tests, and watched for a broken simulation
    scene.add(vrm.scene);
    probe.modelLoaded = true;
    if (TRACK) {
      beginTracking().catch((e) => {   // e.g. a VRM without the humanoid bones the solver needs
        probe.error = String((e && e.message) || e);
        probe.tracking = { ...(probe.tracking || {}), state: "error", detail: probe.error };
      });
    }
  },
  undefined,
  (err) => { probe.error = String((err && err.message) || err); },
);

function dress(model) {
  const [outfit, accent] = OUTFITS[OUTFIT];
  model.scene.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) {
      const hex = m.name === "outfit" ? outfit : m.name === "accent" ? accent : m.name === "hair" ? HAIR_COLOR : m.name === "skin" ? SKIN_COLOR : null;
      if (!hex || !m.color) continue;
      m.color.set(hex);
      if (m.shadeColorFactor) m.shadeColorFactor.set(hex).multiplyScalar(0.72);
    }
  });
}

const bone = (name) => (vrm ? vrm.humanoid.getNormalizedBoneNode(name) : null);

// --- tracking: this page's own camera. The picture goes to MediaPipe in this page and nowhere else. ---
async function beginTracking() {
  const cam = document.getElementById("cam"), note = document.getElementById("trackstate");
  let lastReadout = 0;
  if (PREVIEW && cam) {
    cam.hidden = false;
    if (MIRROR) cam.classList.add("mirror");
  }
  const say = (state, detail) => {
    probe.tracking = { ...(probe.tracking || {}), state, detail };
    if (note && PREVIEW) { note.hidden = state === "running"; note.textContent = state === "error" ? detail : `Camera: ${state}…`; }
  };
  // rest directions come from the model itself, so any VRM humanoid works, not just Pip
  const rest = restFrom((name) => { const n = bone(name); return n ? n.position.clone() : null; });
  const solver = new BodySolver(rest, { mirror: MIRROR, upperBody: DESK });
  tracker = await startTracker({
    solver, mirror: MIRROR, legs: LEGS, desk: DESK, delegate: DELEGATE, video: PREVIEW ? cam : null, deviceId: CAM, quality: QUALITY_NAME,
    onStatus: say,
    onHands: (hands, now) => { const hit = gestures.feed(hands, now); if (hit) runGestureAction(hit); },
    onFrame: (msg, info) => {
      probe.tracking = { ...probe.tracking, frames: info.frames, fps: Math.round(info.fps), ms: info.ms, hz: info.hz, diag: info.diag, delegates: info.delegates };
      mixMouth(msg, info.latencyMs, performance.now(), info.mouthCover);
      onBody(msg);
      const now = performance.now();
      if (PREVIEW && note && info.diag && now - lastReadout > 400) {   // a live account of what the models see, for the person being tracked
        lastReadout = now;
        const d = info.diag, tick = (ok) => (ok ? "yes" : "no");
        note.hidden = false;
        note.textContent = `body: ${tick(d.pose)} · face: ${tick(d.face)} · hands: ${d.handHint} · mic: ${micInfo ? (micInfo.speaking ? "speaking" : "quiet") : MIC ? (probe.micError ? "unavailable" : "starting") : "off"} · updates/s pose ${info.hz.pose}, face ${info.hz.face}, hands ${info.hz.hands}`;
      }
      if (PUBLISH && socket && socket.readyState === WebSocket.OPEN && socket.bufferedAmount < 65536) {
        socket.send(JSON.stringify(msg));        // numbers only; never a picture
        probe.sent++;
      }
    },
  });
  probe.recenter = () => tracker.recenter();
  announceDevices();   // the camera permission is granted by now, so the device names are readable
  navigator.mediaDevices?.addEventListener?.("devicechange", announceDevices);
  if (MIC) beginMic();
  setInterval(() => toParent(packStats({ info: tracker.stats(), state: probe.tracking?.state, detail: probe.tracking?.detail, mic: micInfo, avSyncMs: avSync })), 500);
}

// --- microphone: speech keeps the mouth honest when the face is lost. Audio never leaves this page; only the
// five mouth-shape weights it produces travel on, inside the body message, so OBS shows the same mouth. ---
const MOUTH = ["aa", "ih", "ou", "ee", "oh"];
const MOUTH_AT = Object.fromEntries(MOUTH.map((k) => [k, EXPRESSIONS.indexOf(k)]));
const audioMouth = new MouthFromAudio(), blender = new MouthBlender();
const trackedLine = new DelayLine(), audioLine = new DelayLine();
// --- hand gestures: fist = mute/unmute the microphone, thumb up = happy, V = wave, open palm = recenter.
// Recognised here, in the page that holds the camera; only the gesture name is reported to the control room.
const gestures = new GestureController();
let micMuted = false;
function setMicMuted(muted) {
  micMuted = muted;
  if (mic) for (const t of mic.tracks || []) t.enabled = !muted;   // a muted track delivers silence
  probe.micMuted = muted;
}
function runGestureAction({ gesture, action }) {
  if (action === "toggle-mic") setMicMuted(!micMuted);
  else if (action === "emote-happy") startEmote("happy");
  else if (action === "emote-wave") startEmote("wave");
  else if (action === "recenter") { if (tracker) tracker.recenter(); emote = null; }
  probe.gestures.push(gesture);
  toParent({ type: "realx-gesture", gesture, action, micMuted });
}
let mic = null, micInfo = null, lastAudio = { aa: 0, ih: 0, ou: 0, ee: 0, oh: 0, speaking: false, level: 0 }, avSync = null;

// The microphone is optional and never stops the camera. If it is unplugged, or taken by another app, the
// supervisor releases it, the mouth goes back to the tracked face alone, and it reconnects by itself.
async function beginMic() {
  const supervisor = new DeviceSupervisor({
    kind: "microphone",
    explain: (e) => String((e && e.message) || "The microphone is not available.").slice(0, 140),   // startMic throws plain messages
    start: async () => {
      const m = await startMic({
        deviceId: MIC === "default" ? undefined : MIC,
        onFeatures: (f) => {
          lastAudio = withAmplitudeFloor(audioMouth.update(f, f.t), f.levelDb);
          micInfo = { active: true, speaking: lastAudio.speaking, levelDb: f.levelDb, latencyMs: mic ? mic.latencyMs : null };
          probe.mic = micInfo;
        },
      });
      mic = m;
      if (micMuted) for (const t of m.tracks || []) t.enabled = false;   // a reconnected microphone stays muted
      micInfo = { active: true, speaking: false, levelDb: null, latencyMs: m.latencyMs };
      probe.mic = micInfo;
      probe.micError = null;
      return m;   // { stop, tracks }: the supervisor watches the tracks
    },
    onState: (e) => {
      if (e.state === "lost" || e.state === "blocked") {
        mic = null; micInfo = null; probe.mic = null;
        probe.micError = e.message;
      }
    },
  });
  await supervisor.run();
}

// Tracked mouth when the face is seen, speech estimate when it is not, cross-faded; the faster of the two
// streams is delayed so the mouth and the sound line up.
// the OBS dock's Mute button: the server says so in the rig stream; act only when that value changes, so the fist
// gesture and the dock do not fight over a state neither of them changed
let serverMuted = false;
function followServerMute(m) {
  const muted = !!(m && m.muted === true);
  if (muted === serverMuted) return;
  serverMuted = muted;
  setMicMuted(muted);
}
const faceConfidence = new FaceConfidence();
function mixMouth(msg, videoLatencyMs, now, cover = 0) {
  if (!mic || !micInfo) return;
  const tracked = Object.fromEntries(MOUTH.map((k) => [k, msg.e[MOUTH_AT[k]]]));
  const sync = avSyncOffset({ audioLatencyMs: mic.latencyMs, videoLatencyMs: Number.isFinite(videoLatencyMs) ? videoLatencyMs : 0 });
  trackedLine.push(tracked, now);
  audioLine.push(lastAudio, now);
  const confidence = faceConfidence.update({ faceSeen: hasFlag(msg.f, "face"), cover, trackedAa: tracked.aa, audio: lastAudio }, now);
  const mix = blender.update(trackedLine.read(now, sync.delayVideoMs) ?? tracked, confidence, audioLine.read(now, sync.delayAudioMs) ?? lastAudio, now);
  for (const k of MOUTH) msg.e[MOUTH_AT[k]] = Math.round(Math.min(1, Math.max(0, mix[k])) * 1000) / 1000;
  probe.mouth = { ...Object.fromEntries(MOUTH.map((k) => [k, msg.e[MOUTH_AT[k]]])), source: mix.source, confidence: Math.round(confidence * 100) / 100 };
  avSync =Number.isFinite(videoLatencyMs) ? sync.offsetMs : null;
}

// --- telling the control room (same origin only): which devices exist, and how tracking is doing ---
function toParent(msg) {
  if (window.parent !== window) window.parent.postMessage(msg, location.origin);
}
async function announceDevices() {
  if (window.parent === window || !navigator.mediaDevices?.enumerateDevices) return;
  try {
    const all = await navigator.mediaDevices.enumerateDevices();
    const list = (kind) => all.filter((d) => d.kind === kind && d.deviceId).slice(0, 20).map((d) => ({
      id: String(d.deviceId).slice(0, 256), label: String(d.label || "").replace(/[\u0000-\u001f]/g, "").slice(0, 100),
    }));
    toParent({ type: "realx-devices", cameras: list("videoinput"), mics: list("audioinput") });
  } catch (e) { /* the list is a convenience; tracking does not depend on it */ }
}
// the control room (same origin) can ask this page to recenter or change the legs setting
window.addEventListener("message", (ev) => {
  if (ev.origin !== location.origin || !ev.data || !tracker) return;
  if (ev.data.type === "realx-recenter") tracker.recenter();
  else if (ev.data.type === "realx-gestures") gestures.setEnabled(ev.data.enabled === true);
  else if (ev.data.type === "realx-legs" && ["auto", "off", "on"].includes(ev.data.mode)) tracker.setLegs(ev.data.mode);
});
const damp = (cur, goal, dt, tau) => cur + (goal - cur) * (1 - Math.exp(-dt / tau));

let nextBlink = 2.5, blinkStart = -1;
function blinkValue(t) {
  if (blinkStart < 0 && t >= nextBlink) blinkStart = t;
  if (blinkStart < 0) return 0;
  const k = (t - blinkStart) / 0.16;
  if (k >= 1) { blinkStart = -1; nextBlink = t + 2 + Math.random() * 3.5; return 0; }
  return 1 - Math.abs(2 * k - 1);
}

function pose(t, dt) {
  const age = t - lastRig;
  const live = present && age < 0.6;
  for (const k of KEYS) {
    const goal = live ? target[k] : k === "depth" ? 1 : 0; // drift home when the tracker loses you
    shown[k] = damp(shown[k], goal, dt, live ? 0.05 : 0.5);
  }
  const s = shown;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const set = (name, x, y, z) => { const b = bone(name); if (b) b.rotation.set(x, y, z, "YXZ"); };

  const bodyLive = body.quats !== null && t - body.t < 0.6;
  probe.bodyLive = bodyLive;
  const breath = Math.sin(t * 1.7);
  if (bodyLive) {
    applyBody(dt, !bodyWasLive);
  } else {
    if (bodyWasLive) releaseBody();     // the tracker went quiet: hands, legs and fingers go back to rest
    set("head", -s.pitch * 0.6, s.yaw * 0.6, -s.roll * 0.65);
    set("neck", -s.pitch * 0.4, s.yaw * 0.4, -s.roll * 0.35);
    set("chest", 0.015 * breath + clamp(s.depth - 1, -0.5, 0.5) * 0.25, s.yaw * 0.12, -s.x * 0.12);
    set("spine", 0, s.yaw * 0.08, -s.x * 0.10);
    set("leftUpperArm", 0, 0, -1.15 + 0.02 * breath);
    set("rightUpperArm", 0, 0, 1.15 - 0.02 * breath);
    set("leftLowerArm", 0, 0.1, 0.12);
    set("rightLowerArm", 0, -0.1, -0.12);
  }
  bodyWasLive = bodyLive;
  let bounce = 0, happyBoost = 0, ohBoost = 0, surprisedBoost = 0;
  if (emote) {
    const p = (t - emote.start) / EMOTE_SECONDS[emote.name];
    if (p >= 1) emote = null;
    else {
      const env = Math.sin(Math.PI * p);
      if (emote.name === "wave") {
        set("rightUpperArm", 0, 0, 1.15 - env * 2.25);
        set("rightLowerArm", 0, -0.1, -0.12 - env * (0.45 + 0.35 * Math.sin(t * 15)));
        happyBoost = 0.6 * env;
      } else if (emote.name === "happy") {
        bounce = Math.abs(Math.sin(t * 9)) * 0.06 * env; happyBoost = env;
        set("leftUpperArm", 0, 0, -1.15 + env * 0.5); set("rightUpperArm", 0, 0, 1.15 - env * 0.5);
      } else if (emote.name === "surprised") {
        ohBoost = 0.85 * env; surprisedBoost = env; bounce = 0.04 * env;
        set("head", -s.pitch * 0.6 - 0.18 * env, s.yaw * 0.6, -s.roll * 0.65);
      } else if (emote.name === "bow") {
        set("spine", 0.55 * env, 0, 0); set("neck", 0.25 * env, 0, 0); happyBoost = 0.5 * env;
      }
    }
  }
  const where = bodyLive ? { x: shownRoot[0], y: shownRoot[1], depth: shownRoot[2] } : s;
  vrm.scene.position.set(clamp(where.x, -1.2, 1.2) * 0.28, -clamp(where.y, -1, 1) * 0.12 + bounce, clamp((where.depth - 1) * 0.5, -0.4, 0.4));

  // tracked face: blinks, mouth shapes, smile, brows come from the 52 blendshapes; with no face in view the
  // character keeps its own idle blink instead of staring
  applyExpressions(vrm.expressionManager, shownExpr, {
    live: bodyLive, faceSeen: !!(body.flags && body.flags.face), idleBlink: blinkValue(t), smile: s.smile,
    boost: { happy: happyBoost, oh: ohBoost, surprised: surprisedBoost },
  });
  probe.pose = { ...s, live: live || bodyLive };
}

// The tracker updates 15-30 times a second, the screen 60: ease toward the newest values in between.
function applyBody(dt, snap) {
  const k = snap ? 1 : 1 - Math.exp(-dt / 0.035);
  for (const name of BONES) {
    shownQ[name].slerp(targetQ[name], k);
    const node = bone(name);
    if (node) node.quaternion.copy(shownQ[name]);
  }
  for (let i = 0; i < 3; i++) shownRoot[i] = snap ? body.root[i] : damp(shownRoot[i], body.root[i], dt, 0.08);
  for (const [name, v] of Object.entries(body.expr)) shownExpr[name] = snap ? v : damp(shownExpr[name] ?? v, v, dt, 0.03);
}

// Leave the body to the legacy pose: everything it does not set itself returns to the relaxed stance.
function releaseBody() {
  const legacy = new Set(["head", "neck", "chest", "spine", "leftUpperArm", "rightUpperArm", "leftLowerArm", "rightLowerArm"]);
  for (const name of BONES) {
    const node = bone(name);
    if (node && !legacy.has(name)) node.quaternion.copy(IDLE[name]);
  }
  body.quats = null;
}

// --- loop ---
const hairTips = [], tipPos = new THREE.Vector3();   // numbers only, like the rest of the test hook
let prev = performance.now() / 1000;
function frame() {
  requestAnimationFrame(frame);
  const t = performance.now() / 1000;
  const dt = Math.min(0.1, Math.max(0.001, t - prev));
  prev = t;
  if (vrm) {
    pose(t, dt);
    vrm.update(dt);
    if (hairTips.length) {
      const tipsNow = tipPositions(hairTips, tipPos);
      if (healHair(vrm, tipsNow)) probe.hairResets = (probe.hairResets || 0) + 1;   // a NaN never heals by itself
      else probe.hair = tipsNow;
    }
  }
  if (lighting) lighting.update(performance.now(), dt);
  renderer.render(scene, camera);
  probe.frames++;
}
requestAnimationFrame(frame);
connect();
