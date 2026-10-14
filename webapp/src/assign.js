// Decides which arm each detected hand belongs to.
//
// MediaPipe labels hands "Left"/"Right" assuming a mirrored selfie image, and the label flips when the
// hand turns or two hands cross. The body pose knows where each wrist is, so the wrist nearest to a
// hand's own wrist decides. The label is only a fallback for frames with no usable body pose.
const MIN_VIS = 0.3;      // a wrist below this is a guess
const MAX_DIST = 0.28;    // picture heights; farther than this and the hand is not on that arm

const seen = (p) => p && (p.visibility ?? 1) >= MIN_VIS;

/**
 * hands: [{ image: 21 normalized {x,y}, world: 21 {x,y,z}, label: "Left"|"Right"|null, score }]
 * pose:  33 normalized image landmarks {x,y,visibility} | null
 * returns the SUBJECT's { left, right } as world landmark arrays (or null for a side with no hand)
 */
export function assignHands(hands, pose, { aspect = 4 / 3, maxDist = MAX_DIST, mirroredInput = false } = {}) {
  const list = (hands || []).filter((h) => h && h.world && h.world.length >= 21).slice(0, 2);
  const wrist = pose ? { left: pose[15], right: pose[16] } : null;
  if (!wrist || !(seen(wrist.left) || seen(wrist.right))) return byLabel(list, mirroredInput);

  const cost = (h, side) => {
    const w = wrist[side], p = h.image && h.image[0];
    if (!seen(w) || !p) return Infinity;
    const d = Math.hypot((p.x - w.x) * aspect, p.y - w.y);
    return d <= maxDist ? d : Infinity;
  };
  // at most two hands and two arms: try every assignment, prefer more hands placed, then less distance
  const choices = ["left", "right", null];
  let best = null;
  const walk = (i, picked, placed, total) => {
    if (i === list.length) {
      if (!best || placed > best.placed || (placed === best.placed && total < best.total)) best = { picked: picked.slice(), placed, total };
      return;
    }
    for (const side of choices) {
      if (side && picked.includes(side)) continue;
      const c = side ? cost(list[i], side) : 0;
      if (c === Infinity) continue;
      picked.push(side);
      walk(i + 1, picked, placed + (side ? 1 : 0), total + c);
      picked.pop();
    }
  };
  walk(0, [], 0, 0);
  const out = { left: null, right: null };
  if (best) best.picked.forEach((side, i) => { if (side) out[side] = list[i].world; });
  return out;
}

function byLabel(list, mirroredInput) {
  const out = { left: null, right: null };
  const best = { left: -1, right: -1 };
  for (const h of list) {
    if (h.label !== "Left" && h.label !== "Right") continue;
    // on an image that is not mirrored, MediaPipe's "Left" is the subject's right hand
    const side = (h.label === "Left") === mirroredInput ? "left" : "right";
    const score = h.score ?? 0;
    if (score > best[side]) { best[side] = score; out[side] = h.world; }
  }
  return out;
}
