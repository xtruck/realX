// Everything between "the solver measured these bones" and "the character moves", as plain logic
// with no camera, no DOM and no MediaPipe, so it can be tested with made-up numbers.
//
//   BodyFilter  smooths each bone, holds a lost limb briefly, then eases it to the relaxed pose
//   packBody / unpackBody  the one message that travels from the tracker to the character
//   RootTracker  where the body sits in the picture, relative to where you started
//   Stagger  shares the CPU between the face, pose and hand models
//
// Times are milliseconds unless a name says otherwise.
import { Quaternion } from "three";
import { BONES, EXPRESSIONS, GROUPS, MAX_Q } from "./skeleton.js";
import { OneEuro, QuatFilter } from "./oneeuro.js";
import { idleQuats } from "./idle.js";

export const hasFlag = (flags, group) => (flags & (1 << GROUPS.indexOf(group))) !== 0;
const toFlags = (live) => GROUPS.reduce((acc, g, i) => acc | (live[g] ? 1 << i : 0), 0);
const round = (v, places) => { const k = 10 ** places; return Math.round(v * k) / k; };

// --- filtering ----------------------------------------------------------------------------------------
// One-Euro [minCutoff Hz, beta] per kind of bone. Lower cutoff = steadier, higher beta = quicker on fast moves.
// Starting values, not yet tuned on a live camera.
const KIND_PARAMS = { eye: [4, 0.8], head: [2.5, 0.4], torso: [1.2, 0.2], arm: [1.5, 0.35], finger: [2.0, 0.5], leg: [1.2, 0.25] };
const LEG = /(UpperLeg|LowerLeg|Foot|Toes)$/;
function kindOf(bone) {
  if (/Eye$/.test(bone)) return "eye";
  if (bone === "neck" || bone === "head") return "head";
  if (bone === "hips" || bone === "spine" || bone === "chest") return "torso";
  if (/(Thumb|Index|Middle|Ring|Little)/.test(bone)) return "finger";
  if (LEG.test(bone)) return "leg";
  return "arm";
}
const sideOf = (bone) => (bone.startsWith("left") ? "left" : bone.startsWith("right") ? "right" : null);
const makeQuatFilter = (bone) => new QuatFilter(...KIND_PARAMS[kindOf(bone)]);
const makeExprFilter = (name) => (name.startsWith("blink") ? new OneEuro(3, 1.0) : new OneEuro(2, 0.5));
const makeRootFilters = () => [0, 1, 2].map(() => new OneEuro(1.0, 0.05));

const NOTHING = { quats: null, expr: {}, live: {}, solved: new Set() };

export class BodyFilter {
  /**
   * holdMs      keep a lost limb where it was this long
   * fadeMs      then ease it to the relaxed pose over this long
   * resumeMs    ease a returning limb in over this long, so nothing snaps
   * legs        "auto": legs follow only after they stayed well visible for legsStableMs; "off"; "on"
   */
  constructor({ holdMs = 250, fadeMs = 600, resumeMs = 150, legs = "auto", legsStableMs = 600, idle = idleQuats() } = {}) {
    this.cfg = { holdMs, fadeMs, resumeMs, legs, legsStableMs };
    this.idle = Object.fromEntries(BONES.map((b) => [b, [idle[b].x, idle[b].y, idle[b].z, idle[b].w]]));
    this.bones = Object.fromEntries(BONES.map((b) => [b, { f: makeQuatFilter(b), last: null, lastLive: -Infinity, w: 0 }]));
    this.expr = Object.fromEntries(EXPRESSIONS.map((e) => [e, { f: makeExprFilter(e), last: 0, lastLive: -Infinity, w: 0 }]));
    this.rootState = { f: makeRootFilters(), last: [0, 0, 1], lastLive: -Infinity, w: 0 };
    this.legState = { left: { since: null, lastSeen: -Infinity }, right: { since: null, lastSeen: -Infinity } };
    this.lastT = null;
  }

  set legsMode(mode) { this.cfg.legs = mode; }

  /** solved: BodySolver output (or null when nothing was tracked); root: [x, y, depth] or null */
  update(solved, now, root = null) {
    const s = solved || NOTHING;
    const dt = this.lastT === null ? 0 : Math.min(100, Math.max(0, now - this.lastT));
    this.lastT = now;
    const trusted = this.trustedLegs(s.solved, now);

    const quats = {};
    for (const b of BONES) {
      const st = this.bones[b];
      const side = LEG.test(b) ? sideOf(b) : null;
      const q0 = s.solved.has(b) ? s.quats[b] : null;
      // a bone with any non-finite number counts as not measured: one bad landmark must not poison the filter
      const live = q0 !== null && Number.isFinite(q0.x + q0.y + q0.z + q0.w) && (side === null || trusted[side]);
      if (live) {
        if (now - st.lastLive > this.cfg.holdMs + this.cfg.fadeMs) st.f = makeQuatFilter(b);  // back from a long loss: no stale smoothing
        const q = s.quats[b];
        st.last = st.f.filter([q.x, q.y, q.z, q.w], now / 1000);
      }
      quats[b] = this.blend(st, live, now, dt, this.idle[b], st.last);
    }

    const faceLive = Object.keys(s.expr || {}).length > 0;
    const expr = {};
    for (const e of EXPRESSIONS) {
      const st = this.expr[e];
      const v = s.expr[e] ?? 0;
      const live = faceLive && Number.isFinite(v);
      if (live) {
        if (now - st.lastLive > this.cfg.holdMs + this.cfg.fadeMs) st.f = makeExprFilter(e);
        st.last = st.f.filter(v, now / 1000);
      }
      expr[e] = this.blendScalar(st, live, now, dt, 0);
    }

    const rs = this.rootState;
    root = root && root.every(Number.isFinite) ? root : null;
    if (root) {
      if (now - rs.lastLive > this.cfg.holdMs + this.cfg.fadeMs) rs.f = makeRootFilters();
      rs.last = root.map((v, i) => rs.f[i].filter(v, now / 1000));
    }
    const home = [0, 0, 1];
    const rootOut = this.blendVector(rs, !!root, now, dt, home);

    const live = { ...(s.live || {}), legs: trusted.left || trusted.right };
    return { quats, expr, root: rootOut, flags: toFlags(live) };
  }

  /** hold, then fade; a returning value ramps in. Returns the weight to use for this value. */
  weight(st, live, now, dt) {
    if (live) {
      st.lastLive = now;
      st.w = Math.min(1, st.w + dt / this.cfg.resumeMs);
      if (st.w < 1 && dt === 0) st.w = 1;       // very first frame ever: nothing to ease from
      return st.w;
    }
    const age = now - st.lastLive;
    const target = age <= this.cfg.holdMs ? 1 : Math.max(0, 1 - (age - this.cfg.holdMs) / this.cfg.fadeMs);
    st.w = Math.min(st.w, target);
    return st.w;
  }

  blend(st, live, now, dt, idle, last) {
    const w = this.weight(st, live, now, dt);
    if (!last || w <= 0) return idle.slice();
    const q = new Quaternion(idle[0], idle[1], idle[2], idle[3]).slerp(new Quaternion(last[0], last[1], last[2], last[3]), w);
    return [q.x, q.y, q.z, q.w];
  }

  blendScalar(st, live, now, dt, idle) {
    const w = this.weight(st, live, now, dt);
    return idle + (st.last - idle) * w;
  }

  blendVector(st, live, now, dt, idle) {
    const w = this.weight(st, live, now, dt);
    return st.last.map((v, i) => idle[i] + (v - idle[i]) * w);
  }

  /** Legs are trusted only after they stayed measured (so: well visible) for a while; a short flicker does not reset that. */
  trustedLegs(solved, now) {
    const out = { left: false, right: false };
    for (const side of ["left", "right"]) {
      const st = this.legState[side];
      const measured = solved.has(`${side}UpperLeg`) && solved.has(`${side}LowerLeg`);
      if (measured) {
        if (st.since === null) st.since = now;
        st.lastSeen = now;
      } else if (now - st.lastSeen > 200) {
        st.since = null;
      }
      const mode = this.cfg.legs;
      out[side] = mode === "on" ? measured : mode === "off" ? false : measured && st.since !== null && now - st.since >= this.cfg.legsStableMs;
    }
    return out;
  }
}

// --- the message --------------------------------------------------------------------------------------
// {type:"body", f, q, e, r}   f: group flags as a number   q: every bone's quaternion in BONES order, flat
// e: expressions in EXPRESSIONS order   r: [x, y, depth] in the picture. Numbers only: no pixels, no names.
// The Python server checks the same limits (src/realx/rig.py); keep them in step.
export const LIMITS = { quatBound: 1.0001, normMin: 0.9, normMax: 1.1, exprMin: -0.01, exprMax: 1.01, rootXY: 4, depthMin: 0.05, depthMax: 6 };

export function packBody({ quats, expr, flags, root }) {
  const q = [];
  for (const b of BONES) for (const v of quats[b]) q.push(round(v, 4));
  return {
    type: "body",
    f: flags,
    q,
    e: EXPRESSIONS.map((n) => round(expr[n] ?? 0, 3)),
    r: (root || [0, 0, 1]).map((v) => round(v, 3)),
  };
}

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Returns the decoded message, or null when anything is off. Never throws. */
export function unpackBody(msg) {
  if (!msg || typeof msg !== "object" || Array.isArray(msg)) return null;
  const keys = Object.keys(msg);
  if (keys.length !== 5 || !["type", "f", "q", "e", "r"].every((k) => keys.includes(k))) return null;
  if (msg.type !== "body") return null;
  if (!Number.isInteger(msg.f) || msg.f < 0 || msg.f >= 1 << GROUPS.length) return null;
  const { q, e, r } = msg;
  if (!Array.isArray(q) || q.length !== MAX_Q || !q.every((v) => isNum(v) && Math.abs(v) <= LIMITS.quatBound)) return null;
  if (!Array.isArray(e) || e.length !== EXPRESSIONS.length || !e.every((v) => isNum(v) && v >= LIMITS.exprMin && v <= LIMITS.exprMax)) return null;
  if (!Array.isArray(r) || r.length !== 3 || !r.every(isNum)) return null;
  if (Math.abs(r[0]) > LIMITS.rootXY || Math.abs(r[1]) > LIMITS.rootXY || r[2] < LIMITS.depthMin || r[2] > LIMITS.depthMax) return null;
  const quats = {};
  for (let i = 0; i < BONES.length; i++) {
    const a = q.slice(i * 4, i * 4 + 4);
    const n = Math.hypot(...a);
    if (n < LIMITS.normMin || n > LIMITS.normMax) return null;
    quats[BONES[i]] = a.map((v) => v / n);
  }
  return {
    flags: Object.fromEntries(GROUPS.map((g) => [g, hasFlag(msg.f, g)])),
    quats,
    expr: Object.fromEntries(EXPRESSIONS.map((n, i) => [n, e[i]])),
    root: r.slice(),
  };
}

// --- position in the picture --------------------------------------------------------------------------
const SHOULDERS = [11, 12];
const median = (a) => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };

export class RootTracker {
  /** Calibrates on the first frames: wherever you sit then is "home", at depth 1. */
  constructor({ mirror = true, calibrationFrames = 20 } = {}) {
    this.mirror = mirror; this.need = calibrationFrames;
    this.recenter();
  }

  recenter() { this.samples = []; this.neutral = null; }

  /** img: normalized image pose landmarks. Returns [x, y, depth] (x, y in picture halves, y down) or null. */
  update(img, aspect = 4 / 3) {
    if (!img) return null;
    const [a, b] = SHOULDERS.map((i) => img[i]);
    if (!a || !b || (a.visibility ?? 1) < 0.5 || (b.visibility ?? 1) < 0.5) return null;
    const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    const width = Math.hypot((a.x - b.x) * aspect, a.y - b.y);
    if (!(width > 1e-4)) return null;
    if (!this.neutral) {
      this.samples.push([cx, cy, width]);
      const m = [0, 1, 2].map((k) => median(this.samples.map((s) => s[k])));
      if (this.samples.length >= this.need) this.neutral = m;
      return this.offset([cx, cy, width], m);
    }
    return this.offset([cx, cy, width], this.neutral);
  }

  offset([cx, cy, width], [nx, ny, nw]) {
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    return [
      clamp((cx - nx) * 2 * (this.mirror ? -1 : 1), -3, 3),
      clamp((cy - ny) * 2, -3, 3),
      clamp(width / nw, 0.3, 3),
    ];
  }
}

// --- scheduling ---------------------------------------------------------------------------------------
// Each frame, run the models that are most overdue and that fit the time budget. Cheap models all run
// every frame; when each costs about a frame they take turns, and the one whose result goes stale
// soonest (pose: arms show lag the most) runs most often. Costs are measured, not assumed.
const KEYS = ["pose", "face", "hands"];
const TARGET_MS = { pose: 70, face: 100, hands: 90 }; // how old each result may get before it is due again

export class Stagger {
  /** budgetMs: the most model work to start in one frame (one model always runs, however slow) */
  constructor({ budgetMs = 40, targets = TARGET_MS } = {}) {
    this.budget = budgetMs; this.targets = targets;
    this.cost = { pose: 30, face: 30, hands: 30 };                  // ms, learned from report()
    this.last = { pose: -Infinity, face: -Infinity, hands: -Infinity };
  }

  due(key, now) {
    const age = now - this.last[key];
    return Number.isFinite(age) ? age / this.targets[key] : 1e9 - KEYS.indexOf(key); // never run: first, pose first
  }

  /** which models to run for the camera frame at `now` (ms) */
  plan(now) {
    const out = { face: false, pose: false, hands: false };
    let spent = 0;
    for (const key of KEYS.slice().sort((a, b) => this.due(b, now) - this.due(a, now))) {
      if (spent > 0 && spent + this.cost[key] > this.budget) continue;
      out[key] = true; spent += this.cost[key]; this.last[key] = now;
    }
    return out;
  }

  /** ms each model that ran really took: { pose?, face?, hands? } */
  report(ms) {
    for (const key of KEYS) if (Number.isFinite(ms[key])) this.cost[key] = 0.8 * this.cost[key] + 0.2 * ms[key];
  }
}
