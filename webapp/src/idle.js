// The character's relaxed stance: what a limb eases back to when tracking loses it.
// Rest (identity) is a T-pose, so arms need to be brought down; everything else rests at identity.
import { Euler, Quaternion } from "three";
import { BONES } from "./skeleton.js";

// [x, y, z] radians in "YXZ" order, the same values the renderer uses when nobody is tracked
export const IDLE_EULER = {
  leftUpperArm: [0, 0, -1.15], rightUpperArm: [0, 0, 1.15],
  leftLowerArm: [0, 0.1, 0.12], rightLowerArm: [0, -0.1, -0.12],
};

/** bone -> Quaternion for the whole skeleton */
export function idleQuats() {
  const out = {};
  for (const b of BONES) {
    const e = IDLE_EULER[b];
    out[b] = e ? new Quaternion().setFromEuler(new Euler(e[0], e[1], e[2], "YXZ")) : new Quaternion();
  }
  return out;
}
