// The bones and expressions that travel from the tracker to the character, in a fixed order.
// Both ends import this file, so a message is just two arrays of numbers.
const sides = ["left", "right"];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

export const FINGERS = ["index", "middle", "ring", "little"];
export const SEGMENTS = ["Proximal", "Intermediate", "Distal"];
export const THUMB_SEGMENTS = ["Metacarpal", "Proximal", "Distal"];

export const BONES = ["hips", "spine", "chest", "neck", "head", "leftEye", "rightEye"];
for (const s of sides) {
  BONES.push(`${s}Shoulder`, `${s}UpperArm`, `${s}LowerArm`, `${s}Hand`);
  for (const seg of THUMB_SEGMENTS) BONES.push(`${s}Thumb${seg}`);
  for (const f of FINGERS) for (const seg of SEGMENTS) BONES.push(`${s}${cap(f)}${seg}`);
  BONES.push(`${s}UpperLeg`, `${s}LowerLeg`, `${s}Foot`, `${s}Toes`);
}

// the bone a bone points at (its child along the limb); used to learn rest directions from the model
export const CHILD = {};
for (const s of sides) {
  Object.assign(CHILD, {
    [`${s}UpperArm`]: `${s}LowerArm`, [`${s}LowerArm`]: `${s}Hand`,
    [`${s}UpperLeg`]: `${s}LowerLeg`, [`${s}LowerLeg`]: `${s}Foot`, [`${s}Foot`]: `${s}Toes`,
    [`${s}ThumbMetacarpal`]: `${s}ThumbProximal`, [`${s}ThumbProximal`]: `${s}ThumbDistal`,
  });
  for (const f of FINGERS) {
    CHILD[`${s}${cap(f)}Proximal`] = `${s}${cap(f)}Intermediate`;
    CHILD[`${s}${cap(f)}Intermediate`] = `${s}${cap(f)}Distal`;
  }
}

export const PARENT = { spine: "hips", chest: "spine", neck: "chest", head: "neck", leftEye: "head", rightEye: "head" };
for (const s of sides) {
  Object.assign(PARENT, {
    [`${s}Shoulder`]: "chest", [`${s}UpperArm`]: `${s}Shoulder`, [`${s}LowerArm`]: `${s}UpperArm`, [`${s}Hand`]: `${s}LowerArm`,
    [`${s}UpperLeg`]: "hips", [`${s}LowerLeg`]: `${s}UpperLeg`, [`${s}Foot`]: `${s}LowerLeg`, [`${s}Toes`]: `${s}Foot`,
    [`${s}ThumbMetacarpal`]: `${s}Hand`, [`${s}ThumbProximal`]: `${s}ThumbMetacarpal`, [`${s}ThumbDistal`]: `${s}ThumbProximal`,
  });
  for (const f of FINGERS) {
    PARENT[`${s}${cap(f)}Proximal`] = `${s}Hand`;
    PARENT[`${s}${cap(f)}Intermediate`] = `${s}${cap(f)}Proximal`;
    PARENT[`${s}${cap(f)}Distal`] = `${s}${cap(f)}Intermediate`;
  }
}

export const EXPRESSIONS = ["blink", "blinkLeft", "blinkRight", "aa", "ih", "ou", "ee", "oh", "happy", "angry", "surprised"];   // new names go last: the order is the wire format
export const GROUPS = ["face", "pose", "legs", "leftHand", "rightHand"]; // flags sent with each message
export const MAX_Q = BONES.length * 4;
