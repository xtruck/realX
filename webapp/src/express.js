// Puts the character's expression weights onto a VRM expressionManager. Plain logic with no three.js, so a fake
// manager can test it. The weights arrive already smoothed (One-Euro in body.js) and eased on screen (avatar.js).
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * em         the VRM's expressionManager (anything with setValue(name, value))
 * shown      weights by name (EXPRESSIONS): blink, blinkLeft, blinkRight, aa, ih, ou, ee, oh, happy, angry, surprised
 * live       true when the body/face is tracked; false when the character runs its own idle animation
 * faceSeen   live only: a face is in view (when not, the idle blink keeps the eyes from staring)
 * idleBlink  the character's own blink value
 * smile      idle only: smile from the legacy 5-point rig, 0..1
 * boost      gesture weights that may raise (never lower) a tracked value: { happy, oh, surprised }
 */
export function applyExpressions(em, shown, { live = false, faceSeen = false, idleBlink = 0, smile = 0, boost = {} } = {}) {
  const w = (name) => shown[name] || 0;
  const b = (name) => boost[name] || 0;
  if (live) {
    em.setValue("blink", Math.max(w("blink"), faceSeen ? 0 : idleBlink));
    for (const name of ["blinkLeft", "blinkRight", "aa", "ih", "ou", "ee"]) em.setValue(name, w(name));
    em.setValue("happy", clamp01(Math.max(w("happy"), b("happy"))));
    em.setValue("oh", clamp01(Math.max(w("oh"), b("oh"))));
    em.setValue("angry", clamp01(w("angry")));
    em.setValue("surprised", clamp01(Math.max(w("surprised"), b("surprised"))));
  } else {
    em.setValue("blink", idleBlink);
    em.setValue("happy", clamp01(clamp01(smile) * 0.9 + b("happy")));
    em.setValue("oh", clamp01(b("oh")));
    em.setValue("angry", 0);                    // leave nothing stuck from the last tracked frame
    em.setValue("surprised", clamp01(b("surprised")));
  }
}
