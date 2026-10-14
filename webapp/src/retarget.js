// Turns body, hand and face landmarks into bone rotations for the character.
// The maths is a clean-room implementation: aim each bone at the direction its landmarks
// give, using the character's own rest directions, so any VRM humanoid works.
//
// World space is the character's: +X is its left, +Y up, +Z toward the viewer.
import { Matrix4, Quaternion, Vector3 } from "three";
import { BONES, CHILD, FINGERS, PARENT, SEGMENTS, THUMB_SEGMENTS } from "./skeleton.js";
import { faceToExpressions, gaze } from "./blend.js";

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const V = (x, y, z) => new Vector3(x, y, z);
const I = () => new Quaternion();
const MIN_VIS = 0.5; // below this a body point is a guess, not a measurement
const MIN_VIS_WITH_HAND = 0.2; // ...except a wrist the hand model has also found

// subject's left landmarks in MediaPipe pose order
const POSE = { shoulder: [11, 12], elbow: [13, 14], wrist: [15, 16], hip: [23, 24], knee: [25, 26], ankle: [27, 28], heel: [29, 30], toe: [31, 32] };
// MediaPipe hand landmarks: wrist 0; thumb 1-4; index 5-8; middle 9-12; ring 13-16; little 17-20
const FINGER_START = { index: 5, middle: 9, ring: 13, little: 17 };
// face mesh: outer eye corners, forehead, chin
const FACE = { eyeSubjectLeft: 263, eyeSubjectRight: 33, forehead: 10, chin: 152 };

/** Rest directions and frames, learned from the model. `pos(bone)` -> local rest Vector3 or null. */
export function restFrom(pos) {
  const dir = {};
  for (const [bone, child] of Object.entries(CHILD)) {
    const p = pos(child);
    if (p && p.lengthSq() > 1e-12) dir[bone] = p.clone().normalize();
  }
  for (const bone of BONES) {  // last joint of a chain has no child: reuse its parent's direction
    if (!dir[bone] && /Distal$/.test(bone)) dir[bone] = dir[PARENT[bone]]?.clone() ?? V(1, 0, 0);
  }
  const frames = {};
  for (const s of ["left", "right"]) {
    const mid = pos(`${s}MiddleProximal`), idx = pos(`${s}IndexProximal`), lit = pos(`${s}LittleProximal`);
    if (mid && idx && lit) frames[s] = { axis: mid.clone().normalize(), side: idx.clone().sub(lit).normalize() };
  }
  return { dir, frames };
}

export function frameMatrix(a, b) {
  const X = a.clone().normalize();
  const Y = b.clone().addScaledVector(X, -b.dot(X));
  if (Y.lengthSq() < 1e-10) return null;
  Y.normalize();
  const Z = new Vector3().crossVectors(X, Y);
  return new Matrix4().makeBasis(X, Y, Z);
}

/** World rotation whose x axis follows `x` and whose y axis leans toward `y` (identity = x:+X, y:+Y). */
export function basisQuat(x, y) {
  const m = frameMatrix(x, y);
  return m ? new Quaternion().setFromRotationMatrix(m) : null;
}

const aim = (rest, targetLocal) => new Quaternion().setFromUnitVectors(rest, targetLocal.clone().normalize());
const local = (parentWorld, world) => parentWorld.clone().invert().multiply(world);

export class BodySolver {
  /**
   * upperBody: the desk view. The hips and legs are never read, even when the pose model reports them with some
   * confidence: behind a desk they are guesses, and a guessed hip line tilts the whole torso.
   */
  constructor(rest, { mirror = true, upperBody = false } = {}) { this.rest = rest; this.mirror = mirror; this.upperBody = upperBody; }

  /** subject-space landmark -> character space */
  conv(p) { return V(this.mirror ? -p.x : p.x, -p.y, -p.z); }

  /**
   * pose: { world: [33 {x,y,z,visibility}] } | null
   * hands: { left: [21 {x,y,z}] | null, right: [...] | null } in the SUBJECT's left/right
   * face: { landmarks: [478 {x,y,z}] normalized, blend: {name: score}, aspect: w/h } | null
   */
  solve({ pose = null, hands = {}, face = null } = {}) {
    const q = {}; // bone -> Quaternion (local)
    for (const b of BONES) q[b] = I();
    this.solved = new Set(); // bones measured this frame; the rest stay at identity and mean "no data"
    // a hand the hand model has found proves the wrist is there, so the pose model's doubt about it counts for less
    const handFor = (s) => { const h = hands[this.mirror ? (s === "left" ? "right" : "left") : s]; return !!(h && h.length >= 21); };
    const live = { face: false, pose: false, legs: false, leftHand: false, rightHand: false };
    const world = {};  // bone -> world quaternion, for chaining
    world.hips = I();
    const sideOf = (avatarSide) => ((avatarSide === "left") === !this.mirror ? 0 : 1); // index into [left,right] pairs
    const P = (name, avatarSide) => pose.world[POSE[name][sideOf(avatarSide)]];
    const vis = (name, avatarSide) => (P(name, avatarSide).visibility ?? 1);

    if (pose && pose.world && pose.world.length >= 33) {
      const hipL = this.conv(P("hip", "left")), hipR = this.conv(P("hip", "right"));
      const shL = this.conv(P("shoulder", "left")), shR = this.conv(P("shoulder", "right"));
      const torsoOk = [P("hip", "left"), P("hip", "right"), P("shoulder", "left"), P("shoulder", "right")].every((p) => (p.visibility ?? 1) >= MIN_VIS);
      const shouldersOk = [P("shoulder", "left"), P("shoulder", "right")].every((p) => (p.visibility ?? 1) >= MIN_VIS);
      if (torsoOk && !this.upperBody) {
        const hipMid = hipL.clone().add(hipR).multiplyScalar(0.5), shMid = shL.clone().add(shR).multiplyScalar(0.5);
        const up = shMid.clone().sub(hipMid);
        const hipsQ = basisQuat(hipL.clone().sub(hipR), up), chestQ = basisQuat(shL.clone().sub(shR), up);
        if (hipsQ && chestQ) {
          live.pose = true;
          this.put(q, "hips", hipsQ);
          const spineW = hipsQ.clone().slerp(chestQ, 0.45);
          this.put(q, "spine", local(hipsQ, spineW));
          this.put(q, "chest", local(spineW, chestQ));
          world.hips = hipsQ; world.spine = spineW; world.chest = chestQ;
          world.neck = chestQ; world.head = chestQ;
          for (const s of ["left", "right"]) this.arm(s, P, vis, q, world, chestQ, handFor(s));
          this.legs(P, vis, q, world, hipsQ, live);
        }
      } else if (shouldersOk) {
        // seated or close to the camera: the desk hides the hips. The shoulder line gives the chest its
        // turn and tilt; with no hips there is no lean, so "up" is plain up and the hips are not touched.
        const chestQ = basisQuat(shL.clone().sub(shR), V(0, 1, 0));
        if (chestQ) {
          live.pose = true;
          const spineW = I().slerp(chestQ, 0.45);
          this.put(q, "spine", spineW);
          this.put(q, "chest", local(spineW, chestQ));
          world.hips = I(); world.spine = spineW; world.chest = chestQ;
          world.neck = chestQ; world.head = chestQ;
          for (const s of ["left", "right"]) this.arm(s, P, vis, q, world, chestQ, handFor(s));
        }
      }
    }
    this.handsAndFingers(hands, pose && live.pose, q, world, live);
    const out = { quats: q, expr: {}, live, root: null, solved: this.solved };
    if (face) this.faceSolve(face, q, world, live, out);
    if (pose && live.pose) out.root = this.rootFrom(pose);
    return out;
  }

  arm(s, P, vis, q, world, chestQ, hasHand = false) {
    const sh = this.conv(P("shoulder", s)), el = this.conv(P("elbow", s)), wr = this.conv(P("wrist", s));
    const rest = this.rest.dir;
    if (vis("elbow", s) < MIN_VIS || vis("shoulder", s) < MIN_VIS) return;
    const upW = chestQ.clone();
    const toUpper = el.clone().sub(sh).applyQuaternion(chestQ.clone().invert());
    this.put(q, `${s}UpperArm`, aim(rest[`${s}UpperArm`], toUpper));
    const upperWorld = upW.clone().multiply(q[`${s}UpperArm`]);
    world[`${s}UpperArm`] = upperWorld;
    if (vis("wrist", s) < (hasHand ? MIN_VIS_WITH_HAND : MIN_VIS)) return;
    const toLower = wr.clone().sub(el).applyQuaternion(upperWorld.clone().invert());
    this.put(q, `${s}LowerArm`, aim(rest[`${s}LowerArm`], toLower));
    world[`${s}LowerArm`] = upperWorld.clone().multiply(q[`${s}LowerArm`]);
    world[`${s}Hand`] = world[`${s}LowerArm`]; // until a detected hand says more
  }

  legs(P, vis, q, world, hipsQ, live) {
    const rest = this.rest.dir;
    const ok = (s) => ["hip", "knee", "ankle"].every((n) => vis(n, s) >= 0.6);
    for (const s of ["left", "right"]) {
      if (!ok(s)) continue;
      live.legs = true;
      const hip = this.conv(P("hip", s)), kn = this.conv(P("knee", s)), an = this.conv(P("ankle", s)), toe = this.conv(P("toe", s));
      const toUpper = kn.clone().sub(hip).applyQuaternion(hipsQ.clone().invert());
      this.put(q, `${s}UpperLeg`, aim(rest[`${s}UpperLeg`], toUpper));
      const upW = hipsQ.clone().multiply(q[`${s}UpperLeg`]);
      const toLower = an.clone().sub(kn).applyQuaternion(upW.clone().invert());
      this.put(q, `${s}LowerLeg`, aim(rest[`${s}LowerLeg`], toLower));
      const lowW = upW.clone().multiply(q[`${s}LowerLeg`]);
      if (vis("toe", s) >= 0.5 && rest[`${s}Foot`]) {  // the foot follows the toes: tiptoes and steps
        const toFoot = toe.clone().sub(an).applyQuaternion(lowW.clone().invert());
        this.put(q, `${s}Foot`, aim(rest[`${s}Foot`], toFoot));
      }
    }
  }

  handsAndFingers(hands, poseLive, q, world, live) {
    for (const s of ["left", "right"]) {
      const pts = hands[this.mirror ? (s === "left" ? "right" : "left") : s]; // subject's hand that drives this side
      const parent = world[`${s}LowerArm`];
      if (!pts || pts.length < 21 || !parent || !poseLive) continue;
      const c = pts.map((p) => this.conv(p));
      const fr = this.rest.frames[s];
      let handW = parent;
      if (fr) {
        const axis = c[9].clone().sub(c[0]), side = c[5].clone().sub(c[17]);
        // the mirror flips handedness, so the side axis flips with it
        const Ft = frameMatrix(axis, this.mirror ? side.clone().negate() : side);
        const Fr = frameMatrix(fr.axis, fr.side);
        if (Ft && Fr) handW = new Quaternion().setFromRotationMatrix(Ft.clone().multiply(Fr.clone().transpose()));
      }
      this.put(q, `${s}Hand`, local(parent, handW));
      world[`${s}Hand`] = handW;
      live[`${s}Hand`] = true;
      const place = (bone, from, to, parentW) => {
        const r = this.rest.dir[bone];
        if (!r) return parentW;
        const dirLocal = c[to].clone().sub(c[from]).applyQuaternion(parentW.clone().invert());
        this.put(q, bone, aim(r, dirLocal));
        return parentW.clone().multiply(q[bone]);
      };
      let pw = handW;
      THUMB_SEGMENTS.forEach((seg, i) => { pw = place(`${s}Thumb${seg}`, 1 + i, 2 + i, pw); });
      for (const f of FINGERS) {
        pw = handW;
        SEGMENTS.forEach((seg, i) => { pw = place(`${s}${cap(f)}${seg}`, FINGER_START[f] + i, FINGER_START[f] + i + 1, pw); });
      }
    }
  }

  faceSolve({ landmarks, blend, aspect = 4 / 3 }, q, world, live, out) {
    if (blend) {
      out.expr = faceToExpressions(blend, this.mirror);
      const g = gaze(blend, this.mirror);
      q.leftEye.setFromEuler({ x: g.left[0], y: g.left[1], z: 0, order: "XYZ", isEuler: true });
      q.rightEye.setFromEuler({ x: g.right[0], y: g.right[1], z: 0, order: "XYZ", isEuler: true });
      this.solved.add("leftEye"); this.solved.add("rightEye");
    }
    if (!landmarks || landmarks.length < 400) return;
    const pt = (i) => this.conv({ x: landmarks[i].x * aspect, y: landmarks[i].y, z: landmarks[i].z * aspect });
    const eyeSubL = pt(FACE.eyeSubjectLeft), eyeSubR = pt(FACE.eyeSubjectRight);
    // the character's left eye is the subject's right one when mirrored
    const leftEye = this.mirror ? eyeSubR : eyeSubL, rightEye = this.mirror ? eyeSubL : eyeSubR;
    const headW = basisQuat(leftEye.clone().sub(rightEye), pt(FACE.forehead).sub(pt(FACE.chin)));
    if (!headW) return;
    live.face = true;
    const chest = world.chest || I();
    const rel = local(chest, headW);
    this.put(q, "neck", I().slerp(rel, 0.4));
    const neckW = chest.clone().multiply(q.neck);
    this.put(q, "head", local(neckW, headW));
  }

  /** Set a bone's local rotation and remember it was measured, not defaulted. */
  put(q, bone, quat) {
    q[bone].copy(quat);
    this.solved.add(bone);
  }

  /** where the body sits in the picture: x,y in [-1,1] (character's view), depth relative to shoulder width */
  rootFrom(pose) {
    return null; // set by the tracker, which knows the image-space points
  }
}
