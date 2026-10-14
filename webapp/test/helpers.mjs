// Synthetic MediaPipe-shaped data shared by the node tests. No camera, no models.
import assert from "node:assert/strict";
import { Vector3 } from "three";
import { restFrom } from "../src/retarget.js";

// Pip's rest layout (see scripts/make_character.py)
export function pipPos(bone) {
  const m = /^(left|right)(.*)$/.exec(bone);
  if (!m) return null;
  const sx = m[1] === "left" ? 1 : -1, n = m[2];
  const table = {
    LowerArm: [0.12, 0, 0], Hand: [0.11, 0, 0], LowerLeg: [0, -0.14, 0], Foot: [0, -0.14, 0], Toes: [0, -0.10, 0.09],
  };
  if (table[n]) { const [x, y, z] = table[n]; return new Vector3(x * (n === "LowerLeg" || n === "Foot" || n === "Toes" ? 1 : sx), y, z); }
  const f = /^(Index|Middle|Ring|Little)(Proximal|Intermediate|Distal)$/.exec(n);
  if (f) {
    const z = { Index: 0.026, Middle: 0.008, Ring: -0.010, Little: -0.027 }[f[1]];
    if (f[2] === "Proximal") return new Vector3(sx * 0.062, 0, z);
    return new Vector3(sx * (f[2] === "Intermediate" ? 0.032 : 0.022), 0, 0);
  }
  if (n === "ThumbMetacarpal") return new Vector3(sx * 0.02, 0, 0.026);
  if (n === "ThumbProximal") return new Vector3(sx * 0.012, 0, 0.020);
  if (n === "ThumbDistal") return new Vector3(sx * 0.010, 0, 0.018);
  return null;
}
export const rest = restFrom(pipPos);

// MediaPipe pose world space: x toward the image right, y DOWN, z toward the camera is negative.
export function tPose(over = {}) {
  const lm = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0, visibility: 1 }));
  const set = (i, x, y, z = 0) => { lm[i] = { x, y, z, visibility: 1 }; };
  set(11, 0.18, -0.45); set(12, -0.18, -0.45);            // shoulders (subject's left is image right)
  set(13, 0.40, -0.45); set(14, -0.40, -0.45);            // elbows
  set(15, 0.65, -0.45); set(16, -0.65, -0.45);            // wrists
  set(23, 0.10, 0); set(24, -0.10, 0);                    // hips
  set(25, 0.10, 0.45); set(26, -0.10, 0.45);              // knees
  set(27, 0.10, 0.90); set(28, -0.10, 0.90);              // ankles
  set(29, 0.10, 0.95, 0.05); set(30, -0.10, 0.95, 0.05);  // heels
  set(31, 0.10, 1.02, -0.108); set(32, -0.10, 1.02, -0.108);// foot index, in line with Pip's resting foot
  for (const [i, v] of Object.entries(over)) lm[i] = { ...lm[i], ...v };
  return { world: lm };
}

// a seated user: shoulders and arms are seen, the desk hides the hips and everything below
export function seatedPose(over = {}) {
  const p = tPose(over);
  for (const i of [23, 24, 25, 26, 27, 28, 29, 30, 31, 32]) p.world[i].visibility = 0.1;
  return p;
}

// a left hand pointing toward the image right, palm to the camera side: fingers straight or curled
export function hand({ curl = 0 } = {}) {
  const lm = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  lm[0] = { x: 0, y: 0, z: 0 };
  const base = { 5: -0.026, 9: -0.008, 13: 0.010, 17: 0.027 }; // MP z: toward camera is negative
  for (const [start, z] of Object.entries(base)) {
    const s = Number(start);
    let x = 0.062, y = 0, dirx = 1, diry = 0, ang = 0;
    lm[s] = { x, y, z };
    for (let i = 1; i <= 3; i++) {
      ang += curl; dirx = Math.cos(ang); diry = Math.sin(ang);
      x += 0.03 * dirx; y += 0.03 * diry; lm[s + i] = { x, y, z };
    }
  }
  [[1, 0.02, 0, -0.026], [2, 0.032, 0, -0.046], [3, 0.044, 0, -0.064], [4, 0.054, 0, -0.082]].forEach(([i, x, y, z]) => { lm[i] = { x, y, z }; });
  return lm;
}

export function faceMesh({ lz = 0, rz = 0 } = {}) {
  const lm = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  lm[263] = { x: 0.60, y: 0.40, z: lz }; lm[33] = { x: 0.40, y: 0.40, z: rz };   // subject's left eye is image right
  lm[10] = { x: 0.50, y: 0.30, z: 0 }; lm[152] = { x: 0.50, y: 0.70, z: 0 };
  return lm;
}

/** Image-space (normalized 0..1) pose landmarks with the wrists where you ask. */
export function poseImage({ leftWrist = [0.7, 0.5], rightWrist = [0.3, 0.5], vis = 1 } = {}) {
  const lm = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: vis }));
  lm[11] = { x: 0.62, y: 0.45, z: 0, visibility: vis }; lm[12] = { x: 0.38, y: 0.45, z: 0, visibility: vis };
  lm[15] = { x: leftWrist[0], y: leftWrist[1], z: 0, visibility: vis };
  lm[16] = { x: rightWrist[0], y: rightWrist[1], z: 0, visibility: vis };
  return lm;
}

/** A detected hand as the tracker hands it over: image landmarks, world landmarks, MediaPipe's own label. */
export function detectedHand(wristXY, label = "Left", score = 0.9) {
  const image = Array.from({ length: 21 }, (_, i) => ({ x: wristXY[0] + i * 0.002, y: wristXY[1] - i * 0.002, z: 0 }));
  return { image, world: hand(), label, score };
}

export const angle = (q) => 2 * Math.acos(Math.min(1, Math.abs(q.w)));
export const apply = (q, v) => v.clone().applyQuaternion(q);
export const near = (a, b, eps = 0.05) => assert.ok(a.distanceTo(b) < eps, `${a.toArray().map((x) => x.toFixed(3))} vs ${b.toArray().map((x) => x.toFixed(3))}`);
