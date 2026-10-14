// Renders the original realX character from rig numbers sent by the tracker.
// The page never sees camera pixels: only head pose and smile width arrive.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";

const params = new URLSearchParams(location.search);
const MIRROR = params.get("mirror") !== "0"; // selfie view: the character moves like your reflection
const SHOW_BADGE = params.get("badge") !== "off";
const FRAMING = params.get("frame") === "full" ? { dist: 2.7, y: 0.68 } : { dist: 1.75, y: 0.86 };

const OUTFITS = { // [outfit, accent]; the character's skin and face never change
  coral: ["#f28573", "#333f73"], ocean: ["#3a86d1", "#1d2b53"], sunny: ["#f2c14e", "#7a4e1d"],
  berry: ["#b5446e", "#3a1c40"], forest: ["#3f8f5a", "#1f3d2b"],
};
const OUTFIT = OUTFITS[params.get("outfit")] ? params.get("outfit") : "coral";
const clip = (v, n) => (v || "").replace(/[\u0000-\u001f]/g, "").slice(0, n);
const SHOP = clip(params.get("name"), 40), TAGLINE = clip(params.get("tagline"), 80);

// test and debugging hook; holds numbers only
const probe = (window.__realx = { outfit: OUTFIT, emotes: [], connected: false, modelLoaded: false, error: null, frames: 0, rigMessages: 0, pose: null });

const canvas = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true });
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
camera.position.set(0, FRAMING.y + 0.05, FRAMING.dist);
camera.lookAt(0, FRAMING.y, 0);
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(0.8, 1.2, 1.5);
scene.add(sun, new THREE.AmbientLight(0xffffff, 1.0));

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
  const ws = new WebSocket(`ws://${location.host}/ws/rig`);
  ws.onopen = () => { probe.connected = true; delay = 500; };
  ws.onmessage = (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch (e) { return; }
    if (msg.type === "hello") showBadge(msg.provenance);
    else if (msg.type === "rig") onRig(msg);
  };
  ws.onclose = () => {
    probe.connected = false;
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
    scene.add(vrm.scene);
    probe.modelLoaded = true;
  },
  undefined,
  (err) => { probe.error = String((err && err.message) || err); },
);

function dress(model) {
  const [outfit, accent] = OUTFITS[OUTFIT];
  model.scene.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) {
      const hex = m.name === "outfit" ? outfit : m.name === "accent" ? accent : null;
      if (!hex || !m.color) continue;
      m.color.set(hex);
      if (m.shadeColorFactor) m.shadeColorFactor.set(hex).multiplyScalar(0.72);
    }
  });
}

const bone = (name) => (vrm ? vrm.humanoid.getNormalizedBoneNode(name) : null);
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

  set("head", -s.pitch * 0.6, s.yaw * 0.6, -s.roll * 0.65);
  set("neck", -s.pitch * 0.4, s.yaw * 0.4, -s.roll * 0.35);
  const breath = Math.sin(t * 1.7);
  set("chest", 0.015 * breath + clamp(s.depth - 1, -0.5, 0.5) * 0.25, s.yaw * 0.12, -s.x * 0.12);
  set("spine", 0, s.yaw * 0.08, -s.x * 0.10);
  set("leftUpperArm", 0, 0, -1.15 + 0.02 * breath);
  set("rightUpperArm", 0, 0, 1.15 - 0.02 * breath);
  set("leftLowerArm", 0, 0.1, 0.12);
  set("rightLowerArm", 0, -0.1, -0.12);
  let bounce = 0, happyBoost = 0, ohBoost = 0;
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
        ohBoost = 0.85 * env; bounce = 0.04 * env;
        set("head", -s.pitch * 0.6 - 0.18 * env, s.yaw * 0.6, -s.roll * 0.65);
      } else if (emote.name === "bow") {
        set("spine", 0.55 * env, 0, 0); set("neck", 0.25 * env, 0, 0); happyBoost = 0.5 * env;
      }
    }
  }
  vrm.scene.position.set(clamp(s.x, -1.2, 1.2) * 0.28, -clamp(s.y, -1, 1) * 0.12 + bounce, clamp((s.depth - 1) * 0.5, -0.4, 0.4));

  const em = vrm.expressionManager;
  em.setValue("blink", blinkValue(t));
  em.setValue("happy", clamp(clamp(s.smile, 0, 1) * 0.9 + happyBoost, 0, 1));
  em.setValue("oh", ohBoost);
  probe.pose = { ...s, live };
}

// --- loop ---
let prev = performance.now() / 1000;
function frame() {
  requestAnimationFrame(frame);
  const t = performance.now() / 1000;
  const dt = Math.min(0.1, Math.max(0.001, t - prev));
  prev = t;
  if (vrm) {
    pose(t, dt);
    vrm.update(dt);
  }
  renderer.render(scene, camera);
  probe.frames++;
}
requestAnimationFrame(frame);
connect();
