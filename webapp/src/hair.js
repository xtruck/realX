// Hair support for characters with simulated hair (Mira): finding the strand tips, reading where they are, and recovering when
// the physics goes wrong. Pure functions on three.js objects, so node can test them without a browser.
//
// Why a guard: the spring-bone solver divides by the distance between a collider and a hair joint. If a hand's sphere ever lands
// exactly on a joint that distance is 0, the result is NaN, and a NaN never heals: that strand (and the ones it carries) would
// stay broken for the rest of the stream. `healHair` notices and resets the simulation, so one bad frame costs one frame.

/** The tip node of every hair strand ("hair_<k>_tip"), in a stable order. */
export function collectHairTips(scene) {
  const tips = [];
  scene.traverse((o) => { if (/^hair_\d+_tip$/.test(o.name)) tips.push(o); });
  return tips;
}

/** World positions of the tips as plain numbers [[x, y, z], ...], rounded to 0.1 mm. `scratch` is a reusable Vector3. */
export function tipPositions(tips, scratch) {
  return tips.map((o) => { o.getWorldPosition(scratch); return [+scratch.x.toFixed(4), +scratch.y.toFixed(4), +scratch.z.toFixed(4)]; });
}

export function allFinite(points) {
  return points.every((p) => p.every(Number.isFinite));
}

/**
 * After a physics step: if any strand tip is not a finite number, put the whole hair simulation back to its starting state.
 * Returns true when it had to.
 */
export function healHair(vrm, points) {
  if (allFinite(points)) return false;
  if (vrm.springBoneManager && typeof vrm.springBoneManager.reset === "function") vrm.springBoneManager.reset();
  return true;
}
