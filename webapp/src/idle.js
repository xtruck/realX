// The character's relaxed stance: what a limb eases back to when tracking loses it.
// Rest (identity) is a T-pose, so arms need to be brought down; everything else rests at identity.
import { Euler, Quaternion } from "three";
import { BONES } from "./skeleton.js";

// [x, y, z] radians in "YXZ" order, the same values the renderer uses when nobody is tracked
export const IDLE_EULER = {
  leftUpperArm: [0, 0, -1.15], rightUpperArm: [0, 0, 1.15],
  leftLowerArm: [0, 0.1, 0.12], rightLowerArm: [0, -0.1, -0.12],
};

// Seated at a desk: the upper arms hang a little forward and the forearms come up to rest on the desk, where
// the hands would be on a keyboard. Used for a lost arm in the desk view instead of arms hanging at the sides.
export const DESK_EULER = {
  leftUpperArm: [0.35, 0, -1.05], rightUpperArm: [0.35, 0, 1.05],
  leftLowerArm: [0, -1.0, 0], rightLowerArm: [0, 1.0, 0],
};

/** bone -> Quaternion for the whole skeleton; `desk` swaps in the seated arm pose */
export function idleQuats(desk = false) {
  const table = desk ? { ...IDLE_EULER, ...DESK_EULER } : IDLE_EULER;
  const out = {};
  for (const b of BONES) {
    const e = table[b];
    out[b] = e ? new Quaternion().setFromEuler(new Euler(e[0], e[1], e[2], "YXZ")) : new Quaternion();
  }
  return out;
}
