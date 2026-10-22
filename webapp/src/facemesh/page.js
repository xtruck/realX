// Face-mesh prototype (step S1): the camera, MediaPipe's face landmarker, and the 468-point mesh drawn as a wireframe
// over the live picture. It answers two questions before anything is built on top: does the mesh follow the face
// without lag, and how much of the frame budget does face tracking alone take.
//
// Privacy rule, same as the tracker: the camera picture is shown by a <video> and handed to MediaPipe. It is never
// drawn to a canvas, read back, recorded, stored or sent; only numbers (landmarks) are drawn on top.
// facemesh.test.mjs checks this file for the calls that would break that.
import { FaceLandmarker, FilesetResolver, HandLandmarker, ImageSegmenter, PoseLandmarker } from "@mediapipe/tasks-vision";
import { MeshCompositor } from "./compositor.js";
import { RollingStats, buildMesh, checkPhotoFaces, extrapolateLandmarks, faceBox, fillSegments } from "./mesh.js";
import { FacePresence, JitterMeter, handCover } from "./stabilize.js";
import { ConsentClient, sha256Hex } from "./consent.js";
import { labelProblem, readLabel } from "./guard.js";
import { Gallery, LiveTimer, Toast, formatClock } from "./gallery.js";
import { photoLuminance } from "./photopixels.js";
import { foreheadHairShare, photoQuality } from "./photoquality.js";
import { BODY_CLASSES, HAIR_CLASSES, glassesShare, headMask, maskUsable } from "./head.js";
import { HairSheet, buildHairSheet, handColliders, similarity } from "./hairsim.js";
import { buildBodyPuppet, easeJoints, jointsFromPose, smoothJoints } from "./puppet.js";
import { gripShapes, handFans, handShapes } from "./handlayer.js";
import { MaskConfidence, holdFactors } from "./confidence.js";
import { StainSet, bindToPuppet, stainFans } from "./stains.js";
import { MotionGate, freshness, headZone, seamDue, seamRate, seamTooSlow } from "./seams.js";
import { edgeRate } from "./edgefeather.js";
import { SeamSegmenter } from "./seammask.js";
import { AnglePicker, SerialLoader, checkAngle, gateVerdict, photoYaw } from "./angles.js";

const GATE_FPS = 20;       // the roadmap's gate for tracking plus compositing at 640x480
const MEASURE_MS = 10000;

const $ = (id) => document.getElementById(id);
const stage = $("stage"), video = $("cam"), overlay = $("overlay"), faceCanvas = $("face"), ctx = overlay.getContext("2d");
const mesh = buildMesh();
const segments = new Float32Array(mesh.edges.length * 2);
const stats = new RollingStats(5000);
const view = { wire: true, points: false };
let landmarker = null, delegate = "", stopped = false;
let detectMs = 0, lastTs = 0, lastVideoTime = -1, measure = null;
// Numbers only, for the browser test and for anyone reading the page's state: no picture, no landmark.
const probe = window.__facemesh = { state: "starting", frames: 0, found: 0, fps: 0, foundPct: 0, detectMs: 0, delegate: "", measured: null, photo: "none", drawn: 0, box: null };
let compositor = null;   // made when the first photo is chosen; draws the photo on the live face
const look = { hold: 100, match: 100, shape: 70, keep: true, hideHands: false, skin: false, glasses: false, keepEyes: false };   // glasses: off, it smears the brows of a photo with none   // colour match in percent; keep the live eyes and mouth; fade out when a hand covers the face
probe.hold = look.hold; probe.match = look.match; probe.keep = look.keep;
// Step S4: smoothing, losing and regaining the face, a hand over the face (the hand model runs only when that option is on).
const presence = new FacePresence();
const jitter = new JitterMeter();
let handLandmarker = null, hands = [], handLast = -Infinity, handTs = 0, handMs = 0;
Object.assign(probe, { smooth: true, shown: false, opacity: 0, cover: 0, jitterRaw: 0, jitterSmooth: 0, hands: "off", handMs: 0 });
const HAND_EVERY_MS_TOP = 50;   // while "Show my hands on top" is on (S10c)
const HAND_EVERY_MS = 100;   // the hand model costs about as much as the face model, so it looks only every few frames
const HAND_IDLE_MS = 500;    // ...and when no hand has been seen it looks even less often (cadence gating): measured at about 26-29 ms a call on the UHD 620

// Step S5: the photo is drawn only under a signed consent for that exact photo, re-checked with the server about every 2 s,
// and only while the "Virtual face" label is really on screen. If either fails the photo stops (consent) or pauses (label).
let consent = new ConsentClient();   // the ACTIVE photo's consent client (every photo in the gallery has its own); an idle one when none is active
const gate = { label: "", timers: [] };
Object.assign(probe, { consent: "none", consentLeft: 0, label: "", endedReason: "", record: null });
const CHECK_EVERY_MS = 2000, LABEL_EVERY_MS = 250;

// Step S6a: a gallery of the user's own photos (kept in memory, each with its own consent), a one-click switch, a LIVE timer,
// a toast, full screen and Stop. The pure parts are in gallery.js.
const gallery = new Gallery(), liveTimer = new LiveTimer(), toast = new Toast();
Object.assign(probe, { avatars: 0, avatar: "", session: "idle", liveSeconds: 0, toast: "", fullscreen: false });
let switching = false, cancelAsk = null, liveText = "";
function applyLook() {
  probe.match = look.match; probe.shape = look.shape; probe.keep = look.keep; probe.skin = look.skin ? 1 : 0; probe.glasses = look.glasses ? 1 : 0; probe.keepEyes = look.keepEyes ? 1 : 0;
  if (compositor) compositor.setLook({ match: look.match / 100, shape: look.shape / 100, keep: look.keep, skin: look.skin ? 1 : 0, glasses: look.glasses ? 1 : 0, keepEyes: look.keepEyes ? 1 : 0 });
}

// Step S8, whole head (option, off by default): hair, ears, top of the forehead and neck come from the same photo. The photo
// (never the camera) is cut into classes ONCE by MediaPipe's multiclass selfie segmenter when the photo goes on screen; each
// frame only adds a ring of extra points around the face (see head.js). Nothing here touches the live frame.
let segmenter = null, headOn = false, glassesTouched = false;
const GLASSES_SHARE = 0.03;   // measured on two photos: 0.096 with spectacles, 0 without
const masks = new WeakMap();        // gallery item -> its head mask, or false when the photo could not be cut
const hairMasks = new WeakMap();    // gallery item -> its hair-only mask (S9), or false
const bodyMasks = new WeakMap();    // gallery item -> its body-and-clothes mask (S10), or false
Object.assign(probe, { head: "off", headCutMs: 0, headDrawn: false });

async function openSegmenter() {
  const fileset = await FilesetResolver.forVisionTasks("/mp/wasm");
  let lastErr;
  for (const d of ["GPU", "CPU"]) {
    try {
      return await ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "/mp/models/selfie_multiclass_256x256.tflite", delegate: d },
        runningMode: "IMAGE", outputCategoryMask: true, outputConfidenceMasks: false,
      });
    } catch (err) { lastErr = err; }
  }
  throw lastErr;
}

function closeSegmenter() {
  if (segmenter) { try { segmenter.close(); } catch (e) { /* already closed */ } }
  segmenter = null;
}

// Cuts the PHOTO of this gallery item (a picture the user chose, not a camera frame) once, and remembers the result.
async function cutHead(item) {
  if (masks.has(item)) return masks.get(item);
  if (!segmenter) segmenter = await openSegmenter();
  const t0 = performance.now();
  let mask = false;
  const result = segmenter.segment(item.image);
  try {
    const cat = result.categoryMask;
    // The one read-back of this page, and it is of the PHOTO: the segmenter's class map of the chosen picture (a list of class numbers).
    // The flag lets the privacy test tell it from any read-back of the camera, which must never happen.
    probe.readingPhotoMask = 1;
    let classes = null;
    try { classes = cat ? cat.getAsUint8Array() : null; } finally { probe.readingPhotoMask = 0; }
    probe.glassesShare = classes ? glassesShare(classes, cat.width, cat.height, item.landmarks, (item.image.naturalWidth || item.image.width) / (item.image.naturalHeight || item.image.height)) : 0;
    const found = classes ? headMask(classes, cat.width, cat.height) : null;
    if (maskUsable(found)) mask = found;
    const hairFound = classes ? headMask(classes, cat.width, cat.height, 2, 512, HAIR_CLASSES) : null;   // the same cut, hair only (S9)
    hairMasks.set(item, maskUsable(hairFound, 0.004, 0.9) ? hairFound : false);
    const bodyFound = classes ? headMask(classes, cat.width, cat.height, 2, 512, BODY_CLASSES) : null;   // and body skin + clothes (S10)
    bodyMasks.set(item, maskUsable(bodyFound, 0.03, 0.95) ? bodyFound : false);
  } finally { try { result.close(); } catch (e) { /* nothing to free */ } }
  probe.headCutMs = performance.now() - t0;
  masks.set(item, mask);
  return mask;
}

// Brings the compositor in line with the option and the photo on screen. Safe to call at any time.
async function applyHead() {
  const item = gallery.active;
  if (!compositor) return;
  if (!headOn) { compositor.setHead(false); probe.head = "off"; return; }
  if (!item) { probe.head = "on"; return; }                    // nothing to cut yet: done when a photo goes on screen
  probe.head = "loading";
  setStatus("Cutting your photo into hair, skin and background (once)...");
  try {
    const mask = await cutHead(item);
    if (!headOn || gallery.active !== item) return;            // the user moved on while the model worked
    if (!mask) {
      compositor.setHead(false); probe.head = "nomask";
      setStatus("Whole head is not available for this photo: the hair and head could not be told from the background. The face alone is drawn.");
      return;
    }
    compositor.setHeadMask(mask); compositor.setHead(true); probe.head = "on";
    if (!glassesTouched) {                                      // S11g: spectacles in the photo are found from the same cut (about 0.1 with, 0 without): hide them unless the user chose
      look.glasses = probe.glassesShare > GLASSES_SHARE; $("glassesBtn").setAttribute("aria-pressed", String(look.glasses)); applyLook();
    }
    setStatus("Whole head on: hair, ears and neck come from your photo. Look at the frames per second.");
  } catch (err) {
    compositor.setHead(false); probe.head = "error";
    setStatus(`The head model could not run: ${err && err.message ? err.message : err}`);
  }
}

// Step S9, hair that moves (option, off by default): the hair of the PHOTO becomes a sheet that follows the head, swings, and is
// pushed by the tracked hands (hairsim.js). It needs the photo cut once (shared with Whole head) and the hand model. Nothing here
// touches the camera picture; the hands are the same landmarks the hand option already reads.
const HAIR_ANCHORS = [10, 152, 234, 454, 33, 263, 1];   // points on the rigid part of the head: they say how the head moved
let hairOn = false, hairSheet = null, hairItem = null, hairAspect = 1, hairNeedsReset = true, hairLast = 0;
Object.assign(probe, { hair: "off", hairPoints: 0, hairFree: 0, hairResets: 0, hairMs: 0, hairHands: 0 });

function forgetHair() {
  hairSheet = null; hairItem = null; hairNeedsReset = true;
  if (compositor) compositor.clearHair();
  probe.hairPoints = 0; probe.hairFree = 0;
}

async function applyHair() {
  const item = gallery.active;
  if (!compositor) return;
  forgetHair();
  if (!hairOn) { probe.hair = "off"; return; }
  if (!item) { probe.hair = "on"; return; }                    // nothing to cut yet: done when a photo goes on screen
  probe.hair = "loading";
  setStatus("Cutting the hair out of your photo (once)...");
  try {
    await cutHead(item);
    if (!hairOn || gallery.active !== item) return;            // the user moved on while the model worked
    const hairMask = hairMasks.get(item);
    probe.hairShare = hairMask ? hairMask.data.reduce((n, v) => n + (v > 127 ? 1 : 0), 0) / hairMask.data.length : 0;   // how much of the photo is hair
    if (!hairMask) { probe.hair = "nomask"; setStatus("Moving hair is not available for this photo: the hair could not be told from the background."); return; }
    const w = item.image.naturalWidth || item.image.width, h = item.image.naturalHeight || item.image.height;
    const geometry = buildHairSheet(hairMask, item.landmarks, w / h);
    if (!geometry) { probe.hair = "nohair"; setStatus("No hair that can swing was found in this photo (short hair, or hair only on top of the head)."); return; }
    if (!handLandmarker) handLandmarker = await openHandLandmarker();   // the hands are what touch the hair
    if (!hairOn || gallery.active !== item) return;
    hairSheet = new HairSheet(geometry); hairItem = item; hairAspect = w / h; hairNeedsReset = true;
    compositor.setHair(geometry, hairMask);
    Object.assign(probe, { hair: "on", hairPoints: geometry.stats.points, hairFree: geometry.stats.free });
    setStatus("Moving hair is on: the hair of your photo swings with your head and your hands can push it. Look at the frames per second.");
  } catch (err) {
    forgetHair(); probe.hair = "error"; probe.lastError = String((err && err.message) || err).slice(0, 160);
    setStatus(`Moving hair could not start: ${err && err.message ? err.message : err}`);
  }
}

// One frame of the hair: how the head moved, where the hands are, one physics step, and the result to the compositor.
function stepHair(now, shown) {
  const sheet = hairSheet;
  if (!sheet || hairItem !== gallery.active || !compositor.hairReady || !shown) {
    if (!shown) hairNeedsReset = true;                         // the face was lost: the hair starts again from the head when it is back
    compositor.setHairPositions(null);
    return;
  }
  const t0 = performance.now();
  const aspect = faceCanvas.width / Math.max(1, faceCanvas.height);
  const live = shown.landmarks, photo = hairItem.landmarks;
  const from = new Float32Array(HAIR_ANCHORS.length * 2), to = new Float32Array(HAIR_ANCHORS.length * 2);
  HAIR_ANCHORS.forEach((i, k) => { from[2 * k] = photo[i].x * hairAspect; from[2 * k + 1] = photo[i].y; to[2 * k] = live[i].x * aspect; to[2 * k + 1] = live[i].y; });
  const head = similarity(from, to);
  if (!head) { compositor.setHairPositions(null); return; }
  if (hairNeedsReset) { sheet.reset(head); hairNeedsReset = false; hairLast = now; }
  const dt = Math.min(0.05, Math.max(0.001, (now - hairLast) / 1000)); hairLast = now;
  const faceWidth = Math.hypot((live[454].x - live[234].x) * aspect, live[454].y - live[234].y);
  const colliders = [];
  for (const hand of hands) colliders.push(...handColliders(hand.map((p) => ({ x: p.x * aspect, y: p.y })), faceWidth));
  sheet.step(dt, head, colliders);
  probe.hairResets = sheet.heals;
  compositor.setHairPositions(sheet.pos, aspect);
  probe.hairMs = probe.hairMs ? 0.9 * probe.hairMs + 0.1 * (performance.now() - t0) : performance.now() - t0;
  probe.hairHands = hands.length;
}

// Step S10, body and dress (option, off by default): the photo's shirt and arms become a puppet (puppet.js) that follows the live
// shoulders, elbows and wrists. The photo is cut once (shared with Whole head and Hair) and run through the pose model once; the live
// pose comes from the pose model on the video every POSE_EVERY_MS. Nothing here reads back, stores or sends the camera picture.
const POSE_EVERY_MS = 250;   // S11k: the pose model costs about 45 ms a run on the dev laptop; the shirt follows the shoulders, which move slowly, so it is asked 4 times a second and the joints are eased in between
let coverGrow = 0, bodyOn = false, puppet = null, bodyItem = null, poseLandmarker = null, poseLast = -Infinity, poseTs = 0, poseSmooth = null, poseJoints = null, poseTarget = null;
Object.assign(probe, { body: "off", bodyPoints: 0, bodyBones: 0, poseMs: 0, bodyDrawn: 0 });

async function openPoseLandmarker(mode) {
  const fileset = await FilesetResolver.forVisionTasks("/mp/wasm");
  let lastErr;
  for (const d of ["GPU", "CPU"]) {
    try {
      return await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "/mp/models/pose_landmarker_lite.task", delegate: d }, runningMode: mode, numPoses: 1,
        minPoseDetectionConfidence: 0.4, minPosePresenceConfidence: 0.4, minTrackingConfidence: 0.4,
      });
    } catch (err) { lastErr = err; }
  }
  throw lastErr;
}

function closePose() {
  if (poseLandmarker) { try { poseLandmarker.close(); } catch (e) { /* already closed */ } }
  poseLandmarker = null; poseLast = -Infinity; poseSmooth = null; poseJoints = null; poseTarget = null;
}

function forgetBody() {
  puppet = null; bodyItem = null;
  if (compositor) { compositor.clearBody(); compositor.setNeckAnchor(null, 0.6); }   // S12a: the shoulders are gone; the face's own middle takes over
  probe.bodyPoints = 0; probe.bodyBones = 0;
}

async function applyBody() {
  const item = gallery.active;
  if (!compositor) return;
  forgetBody();
  if (!bodyOn) { probe.body = "off"; return; }
  if (!item) { probe.body = "on"; return; }                    // nothing to cut yet: done when a photo goes on screen
  probe.body = "loading";
  setStatus("Cutting the body and clothes out of your photo and finding its shoulders (once)...");
  try {
    await cutHead(item);
    if (!bodyOn || gallery.active !== item) return;            // the user moved on while the model worked
    const mask = bodyMasks.get(item);
    if (!mask) { probe.body = "nomask"; setStatus("Body and clothes are not available for this photo: the body could not be told from the background."); return; }
    const w = item.image.naturalWidth || item.image.width, h = item.image.naturalHeight || item.image.height;
    const still = await openPoseLandmarker("IMAGE");           // the PHOTO's pose, once; the model is closed straight after
    let photoPose = null;
    try { photoPose = (still.detect(item.image).landmarks || [])[0] || null; } finally { try { still.close(); } catch (e) { /* already closed */ } }
    if (!bodyOn || gallery.active !== item) return;
    const geometry = buildBodyPuppet(mask, photoPose, w / h);
    if (!geometry) { probe.body = "nopose"; setStatus("No shoulders were found in this photo, so the body and clothes cannot follow you. Use a photo that shows the shoulders."); return; }
    if (!poseLandmarker) poseLandmarker = await openPoseLandmarker("VIDEO");
    if (!bodyOn || gallery.active !== item) return;
    puppet = geometry; puppet.torsoOnly = true; bodyItem = item;   // S11j: one-piece shirt
    compositor.setBody(geometry, mask);
    Object.assign(probe, { body: "on", bodyPoints: geometry.stats.points, bodyBones: geometry.stats.bones });
    setStatus("Body and clothes on: the shirt and sleeves of your photo follow your shoulders and arms. Look at the frames per second.");
  } catch (err) {
    forgetBody(); probe.body = "error"; probe.lastError = String((err && err.message) || err).slice(0, 160);
    setStatus(`Body and clothes could not start: ${err && err.message ? err.message : err}`);
  }
}

// One frame of the body: the live pose (looked at every POSE_EVERY_MS, smoothed in between), then the puppet moves to it.
function stepBody(now, shown) {
  if (!puppet || bodyItem !== gallery.active || !compositor.bodyReady || !shown || !poseLandmarker) { compositor.setBodyPositions(null); return; }
  const aspect = faceCanvas.width / Math.max(1, faceCanvas.height);
  if (now - poseLast >= POSE_EVERY_MS) {
    poseLast = now; poseTs = Math.max(poseTs + 1, now);
    const t0 = performance.now();
    let landmarks = null;
    try { landmarks = (poseLandmarker.detectForVideo(video, poseTs).landmarks || [])[0] || null; } catch (err) { landmarks = null; }
    const took = performance.now() - t0;
    probe.poseMs = probe.poseMs ? 0.8 * probe.poseMs + 0.2 * took : took;
    const s = smoothJoints(poseSmooth, jointsFromPose(landmarks, aspect), 0.6);
    poseSmooth = s.state; poseTarget = s.joints;
  }
  poseJoints = poseTarget ? easeJoints(poseJoints, poseTarget, 0.35) : null;   // every frame: a step toward the latest pose
  // S12a: the photo's neck hangs from the live shoulders when the pose model sees them (a softer pull on the face's own middle when it does not),
  // so it stops swinging sideways with the head like a doll's neck. Numbers only: the anchor rides the same rig message, nothing new leaves the page.
  const neck = poseJoints && poseJoints.lSh && poseJoints.rSh
    ? [(poseJoints.lSh[0] + poseJoints.rSh[0]) / 2, (poseJoints.lSh[1] + poseJoints.rSh[1]) / 2] : null;
  compositor.setNeckAnchor(neck, neck ? 1 : 0.6);
  if (!poseJoints || !puppet.update(poseJoints)) { compositor.setBodyPositions(null); compositor.setBodyHalo(null); return; }
  compositor.setBodyPositions(puppet.pos, aspect);
  compositor.setBodyHalo(coverGrow > 0 ? puppet.halo(coverGrow) : null, aspect);     // S10e: a slightly bigger copy underneath hides your own clothes' edges
}

// Step S10c, your hands on top (option, off by default): the photo's sleeves are drawn over your live body, which would cover your hands
// and what you hold. This draws the live picture back on top, only inside soft shapes around the tracked hands (handlayer.js). The camera
// picture goes to the graphics card only through the compositor's one upload method and only to the screen: never read back or stored.
let liveHandsOn = false, handReach = 1, gripReach = 1;
Object.assign(probe, { liveHands: "off", liveDrawn: 0, handCircles: 0, gripCircles: 0 });

function stepLiveHands(shown) {
  if (!liveHandsOn || !shown || hands.length === 0) { compositor.setLiveHands(null); probe.handCircles = 0; return; }
  const aspect = faceCanvas.width / Math.max(1, faceCanvas.height);
  const live = shown.landmarks;
  const faceWidth = Math.hypot((live[454].x - live[234].x) * aspect, live[454].y - live[234].y);
  const circles = handShapes(hands, aspect, faceWidth, handReach);
  const grip = gripShapes(hands, aspect, faceWidth, gripReach);    // a guess about a curled hand's object: stretches along the knuckle line
  probe.handCircles = circles.length; probe.gripCircles = grip.length;
  compositor.setLiveHands(handFans(circles.concat(grip), aspect));
}

// Step S10g, spills, stains and eating (needs "Body and clothes", because the stains stick to the shirt): a button spills something on
// the shirt, a hand wiped over a stain rubs it out, and "Messy eating" drops crumbs and a stain when the mouth opens with a hand near it.
// These are effects on the picture: they do not know what you really pour or eat.
const stains = new StainSet();
let messyEating = false, mouthWasOpen = false, stainLast = 0;
Object.assign(probe, { stains: 0, stainsDrawn: 0, messy: "off" });

function spillNow(kind) {
  if (!puppet || bodyItem !== gallery.active) { setStatus("Turn on Body and clothes first: spills stick to the shirt."); return false; }
  const torso = puppet.restBones.torso;                       // a spot on the chest, a little off centre
  const side = (Math.random() - 0.5) * 0.5 * puppet.shoulderWidth;
  const across = [torso[1][1] - torso[0][1], -(torso[1][0] - torso[0][0])];
  const len = Math.hypot(across[0], across[1]) || 1;
  const x = torso[0][0] + 0.35 * (torso[1][0] - torso[0][0]) + (across[0] / len) * side;
  const y = torso[0][1] + 0.35 * (torso[1][1] - torso[0][1]) + (across[1] / len) * side;
  const ok = stains.spill(kind, bindToPuppet(puppet, x, y), { size: 0.8 + Math.random() * 0.6, drips: kind === "water" ? 1 : 2 });
  if (ok) setStatus(`Spilled ${kind} on the shirt. Wipe it with your hand, or press Clean.`);
  return ok;
}

// One frame of the effects: eating detection, the stains' own motion and wiping by your hands, then the circles to the compositor.
function stepStains(now, shown) {
  if (stains.count === 0 && !messyEating) { compositor.setStains(null); probe.stains = 0; return; }
  const dt = stainLast ? Math.min(0.1, (now - stainLast) / 1000) : 0.016;
  stainLast = now;
  const aspect = faceCanvas.width / Math.max(1, faceCanvas.height);
  const scale = puppet && puppet.liveWidth > 0 ? puppet.liveWidth : 0.25 * aspect;
  const wipers = [];
  if (shown && hands.length) {
    const live = shown.landmarks, faceWidth = Math.hypot((live[454].x - live[234].x) * aspect, live[454].y - live[234].y);
    wipers.push(...handShapes(hands, aspect, faceWidth, 1));
    if (messyEating) {                                         // the mouth opens with a hand near it: a bite
      const open = live[14].y - live[13].y > 0.012;
      const mx = live[13].x * aspect, my = (live[13].y + live[14].y) / 2;
      const near = hands.some((h) => h.some((p) => Math.hypot(p.x * aspect - mx, p.y - my) < faceWidth * 0.55));
      if (open && near && !mouthWasOpen) {
        for (let i = 0; i < 3; i++) stains.crumb("crumbs", mx + (Math.random() - 0.5) * faceWidth * 0.4, my + faceWidth * 0.25, { size: 0.7 + Math.random() * 0.6 });
        if (puppet && Math.random() < 0.45) spillNow(Math.random() < 0.5 ? "sauce" : "juice");
      }
      mouthWasOpen = open && near;
    }
  }
  stains.step(dt, puppet ? puppet.pos : null, scale, wipers);
  probe.stains = stains.count;
  compositor.setStains(stainFans(stains.circles(scale), aspect));
}

// Step S13c, "Clean the edges" (OFF by default since 2026-10-20: at 5 passes a second it cost about 8 fps on the UHD 620, see
// docs/BENCHMARKS.md section 11; the rate can be lowered with ?seamHz= in the page address): a live-frame segmenter runs a few times a second ON THE GRAPHICS CARD (seammask.js; the
// camera picture and the masks never reach this code) and the compositor hides live hair and ears round the photo's head with the photo's
// own background colour. Off, not loaded, failed, stale or slow: nothing is drawn extra, which is the look before this step.
let seamOn = false, seamSeg = null, seamLoading = false, seamGaveUp = false, seamAt = -Infinity;
const seamState = { last: -Infinity, cost: 0, slowRuns: 0 };
const seamMotion = new MotionGate();
const seamHz = seamRate(new URLSearchParams(location.search).get("seamHz"));
// S13f "Soft edges": a model-free feathered band along the mesh outline (edgefeather.js), off by default (unmeasured). With it on, the segmenter
// above needs to run no more often than edgeRate() allows; `softOn` is the only state, the band is rebuilt from the mesh every frame.
let softOn = false;
Object.assign(probe, { soft: "off", seam: "off", seamHz, seamMs: 0, seamAnswers: 0, seamAmount: 0, seamDrawn: 0 });

async function loadSeams() {
  if (seamSeg || seamLoading || seamGaveUp) return;
  seamLoading = true; probe.seam = "loading";
  try { seamSeg = await SeamSegmenter.open(); probe.seam = seamOn ? "on" : "off"; }
  catch (err) { seamGaveUp = true; probe.seam = "unavailable"; probe.seamError = String((err && err.message) || err).slice(0, 160); }
  finally { seamLoading = false; }
}

function closeSeams() { if (seamSeg) seamSeg.close(); seamSeg = null; }

// A pass freezes the page while it runs; on a computer where it is that slow the option turns itself off and says so. Only this
// optional look feature stops: the photo, the consent checks and the "Virtual face" label carry on unchanged. Clicking the button
// again retries.
function stopSlowSeams(ms) {
  seamOn = false; seamState.slowRuns = 0;
  $("seamBtn").setAttribute("aria-pressed", "false");
  compositor.setSeamAmount(0, null); closeSeams();
  probe.seam = "too slow"; probe.seamSlowMs = Math.round(ms); probe.seamAmount = 0;
  setStatus(`Clean the edges was turned off: one pass took ${(ms / 1000).toFixed(1)} s on this computer and froze the picture. Click it to try again.`);
}

// Called every drawn frame; does model work only when it is due (seams.js seamDue), and always sets how much to draw.
function stepSeams(now, shown) {
  if (!compositor) return;
  if (!seamOn || !shown) { compositor.setSeamAmount(0, null); seamMotion.update(null, now); probe.seamAmount = 0; return; }
  if (!seamSeg) { loadSeams(); compositor.setSeamAmount(0, null); probe.seamAmount = 0; return; }
  if (!seamSeg.failed && seamDue(now, seamState, detectMs, edgeRate(seamHz, softOn))) {
    seamState.last = now;
    if (seamSeg.run(video)) { compositor.setSeam(seamSeg.canvas); seamAt = now; probe.seamAnswers = seamSeg.answers; }
    seamState.cost = seamSeg.costMs; probe.seamMs = seamSeg.costMs;
    if (seamSeg.failed) { probe.seam = "unavailable"; probe.seamError = String(seamSeg.error || "").slice(0, 160); }
    else if (seamSeg.warmup) probe.seamWarmMs = Math.round(seamSeg.lastMs);      // the one-off freeze while the model is prepared
    else if (seamTooSlow(seamSeg.lastMs, seamState, seamSeg.warmup)) { stopSlowSeams(seamSeg.lastMs); return; }
  }
  const box = faceBox(shown.landmarks);
  const amount = seamSeg.failed ? 0 : freshness(now - seamAt, edgeRate(seamHz, softOn)) * seamMotion.update(box, now);
  compositor.setSeamAmount(amount, headZone(box));
  probe.seamAmount = amount;
}

// Stage 3, "Photos at several angles" (off by default): side photos of the user, each under its own consent, drawn on the FACE when the
// live head turns towards them (angles.js). The head ring, hair and body keep the front photo. Side photos are loaded one at a time, by one
// face model that stays open while the option is on; while one loads, a consent that is only waiting for the server is paused, not ended.
let anglesOn = false, angleFinder = null;
let angleBlocking = false;   // true only while a side photo is decoded and its face found (the part that can block the page), never while the user reads the consent question
const angleLoader = new SerialLoader(), anglePicker = new AnglePicker();
Object.assign(probe, { angles: "off", angleCount: 0, angleFrom: "", angleTo: "", angleT: 1, liveYaw: null, angleRejected: "", angleLoading: false });

function closeAngleFinder() {
  if (angleFinder) { try { angleFinder.close(); } catch (e) { /* already closed */ } }
  angleFinder = null;
}

/** One side photo leaves for good: its texture, its consent and its thumbnail address. */
function dropAngle(item, angle) {
  if (compositor) compositor.removeAngle(angle.slot);
  angle.client.revoke();
  if (angle.url) URL.revokeObjectURL(angle.url);
  item.angles = item.angles.filter((a) => a !== angle);
}

function forgetAngles(item) { for (const a of [...((item && item.angles) || [])]) dropAngle(item, a); }

/** Side photos whose consent the server ended (not merely late) leave the photo they belong to. */
function dropEndedAngles(item) {
  if (!item || !item.angles) return;
  for (const a of [...item.angles]) {
    const v = a.client.valid();
    if (!v.ok && !v.stale) { dropAngle(item, a); setStatus(`A side photo was removed: ${v.reason}.`); }
  }
  if (item === gallery.active) renderAngles();
}

function renderAngles() {
  const item = gallery.active, box = $("angles");
  const list = (item && item.angles) || [];
  probe.angleCount = list.length;
  box.replaceChildren();
  for (const a of list) {
    const cell = document.createElement("div");
    cell.className = "thumb-cell";
    const img = document.createElement("img");
    img.alt = ""; img.src = a.url; img.className = "angle-thumb";
    const label = document.createElement("span");
    label.textContent = `${Math.round(Math.abs(a.yaw))}°`;
    const del = document.createElement("button");
    del.type = "button"; del.className = "thumb-remove"; del.dataset.slot = a.slot;
    del.setAttribute("aria-label", `Remove side photo ${a.name}`); del.textContent = "×";
    cell.append(img, label, del);
    box.append(cell);
  }
  box.hidden = list.length === 0;
  $("angleAdd").disabled = !anglesOn || !item;
  $("angleBar").hidden = !anglesOn; $("anglesNote").hidden = !anglesOn;   // off: no extra height on the page
}

/** Adds one side photo to the photo on screen, after its own consent. Queued: side photos are loaded strictly one at a time. */
function addAnglePhoto(file) {
  return angleLoader.run(async () => {
    const item = gallery.active;
    if (!anglesOn || !item || !compositor) { setStatus("Choose your front photo first, then add side photos."); return; }
    probe.angleLoading = true; probe.angleRejected = "";
    const url = URL.createObjectURL(file);
    let client = null, kept = false;
    try {
      setStatus("Reading the side photo...");
      const image = new Image();
      let faces = [];
      angleBlocking = true;
      try {
        image.src = url;
        await image.decode();
        if (!angleFinder) angleFinder = await openLandmarker("IMAGE", 2);   // opened once while the option is on, reused for every side photo
        faces = angleFinder.detect(image).faceLandmarks || [];
      } finally { angleBlocking = false; }
      const faceCheck = checkPhotoFaces(faces);
      if (!faceCheck.ok) throw new Error(faceCheck.reason);
      const yaw = photoYaw(faces[0], (image.naturalWidth || image.width) / (image.naturalHeight || image.height));
      const fit = checkAngle(yaw, item.yaw, item.angles.length);
      if (!fit.ok) throw new Error(fit.reason);
      const sha = await sha256Hex(file);
      if (sha === item.sha || item.angles.some((a) => a.sha === sha)) throw new Error("this photo is already in use");
      client = new ConsentClient();                // every side photo has its own consent, like every gallery photo
      const agreed = await askConsent(sha, client);
      settleFlow();                                // the question changed the page's state: back to the photo on screen
      if (!agreed) { setStatus("The side photo is not used: no consent was given."); return; }
      if (!anglesOn || gallery.active !== item) return;   // the user moved on while we asked
      const slot = compositor.addAngle(image, faces[0]);
      item.angles.push({ name: file.name, sha, client, image, landmarks: faces[0], yaw, url, slot });
      kept = true;
      renderAngles();
      setStatus(`Side photo added (turned about ${Math.round(Math.abs(yaw))}°). It is drawn when you turn your head that way.`);
    } catch (err) {
      const reason = String((err && err.message) || err);
      probe.angleRejected = reason.slice(0, 160);
      setStatus(`This side photo cannot be used: ${reason}`);
    } finally {
      if (!kept) { if (client && client.record) client.revoke(); URL.revokeObjectURL(url); }
      probe.angleLoading = false;
    }
  });
}

/** Which photo the face is drawn from this frame, and the head turn the hold option should measure from. */
function stepAngles(now, shown) {
  const item = gallery.active;
  if (!anglesOn || !item || !item.angles || item.angles.length === 0 || !shown) {
    compositor.setFaceMix(null); anglePicker.reset();
    Object.assign(probe, { angleFrom: "", angleTo: "", angleT: 1, liveYaw: null });
    return null;
  }
  const live = photoYaw(shown.landmarks, video.videoWidth / Math.max(1, video.videoHeight));
  const candidates = [{ id: "", yaw: item.yaw }, ...item.angles.filter((a) => a.client.valid().ok).map((a) => ({ id: a.slot, yaw: a.yaw }))];
  const pick = anglePicker.update(live, candidates, now);
  compositor.setFaceMix(pick);
  Object.assign(probe, { angleFrom: pick.from, angleTo: pick.to, angleT: pick.t, liveYaw: live });
  const drawn = candidates.find((c) => c.id === pick.to);
  return drawn ? drawn.yaw : null;
}

function setStatus(text) { $("status").textContent = text; }

function explain(err) {
  const name = err && err.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "The camera is blocked. Allow it for this page and reload.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No camera was found.";
  if (name === "NotReadableError") return "Another application is using the camera.";
  return `Could not start: ${err && err.message ? err.message : err}`;
}

async function openCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  return stream;
}

async function openLandmarker(runningMode = "VIDEO", numFaces = 1) {
  const fileset = await FilesetResolver.forVisionTasks("/mp/wasm");
  let lastErr;
  for (const d of ["GPU", "CPU"]) {   // GPU first, CPU when it cannot be created: same order as the tracker
    try {
      const lm = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "/mp/models/face_landmarker.task", delegate: d },
        runningMode, numFaces, outputFaceBlendshapes: false,
      });
      if (runningMode === "VIDEO") delegate = d;
      return lm;
    } catch (err) { lastErr = err; }
  }
  throw lastErr;
}

async function openHandLandmarker() {
  const fileset = await FilesetResolver.forVisionTasks("/mp/wasm");
  let lastErr;
  for (const d of ["GPU", "CPU"]) {
    try {
      return await HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "/mp/models/hand_landmarker.task", delegate: d }, runningMode: "VIDEO", numHands: 2,
        minHandDetectionConfidence: 0.4, minHandPresenceConfidence: 0.4,
      });
    } catch (err) { lastErr = err; }
  }
  throw lastErr;
}

// How much of the face a hand covers, from the hand model run every HAND_EVERY_MS (the last result is reused in between).
function coverNow(now, rawLandmarks) {
  // Fast while a hand is in view (faster still while the hands are drawn, so the shape keeps up). With no hand in view it backs off to
  // HAND_IDLE_MS, unless the cover option needs a quick answer: a hand can then enter the picture up to HAND_IDLE_MS before it is noticed.
  const every = hands.length > 0 ? (liveHandsOn ? HAND_EVERY_MS_TOP : HAND_EVERY_MS) : (look.hideHands ? HAND_EVERY_MS : HAND_IDLE_MS);
  if (now - handLast >= every) {
    handLast = now; handTs = Math.max(handTs + 1, now); probe.handPolls = (probe.handPolls || 0) + 1;
    const t0 = performance.now();
    try { hands = handLandmarker.detectForVideo(video, handTs).landmarks || []; } catch (err) { hands = []; }
    const took = performance.now() - t0;
    handMs = handMs ? 0.8 * handMs + 0.2 * took : took;
    probe.handMs = handMs;
  }
  return handCover(rawLandmarks ? faceBox(rawLandmarks) : presence.lastBox, hands);
}

function closeHands() {
  if (handLandmarker) { try { handLandmarker.close(); } catch (e) { /* already closed */ } }
  handLandmarker = null; hands = []; handLast = -Infinity;
}

// S13d: advice about the chosen PHOTO (its own pixels, never the camera's): landmarks plus a small luminance sample of the picture.
// Glasses and forehead hair are only judged when the segmenter is already loaded (the 16 MB model is not fetched for this).
function qualityReport(image, faces) {
  const iw = image.naturalWidth || image.width, ih = image.naturalHeight || image.height;
  const sample = photoLuminance(image, (on) => { probe.readingPhotoMask = on ? 1 : 0; });   // the PHOTO's pixels, flagged for the privacy tests
  const extra = { imageWidth: iw, imageHeight: ih, faceCount: faces.length };
  if (segmenter && faces[0]) {
    let result = null;
    try {
      result = segmenter.segment(image);
      const cat = result.categoryMask;
      probe.readingPhotoMask = 1;
      let classes = null;
      try { classes = cat ? cat.getAsUint8Array() : null; } finally { probe.readingPhotoMask = 0; }
      if (classes) {
        extra.glassesShare = glassesShare(classes, cat.width, cat.height, faces[0], iw / ih);
        extra.foreheadHair = foreheadHairShare(classes, cat.width, cat.height, faces[0]);
      }
    } catch (err) { /* glasses and hair stay unchecked */ } finally { if (result) { try { result.close(); } catch (e) { /* nothing to free */ } } }
  }
  const report = photoQuality(faces[0], sample, extra);
  probe.photoQuality = { score: report.score, worst: report.worst };
  const box = $("photoQuality");
  box.replaceChildren();
  const h = document.createElement("h2");
  h.textContent = `Photo check: ${report.score} out of 100`;
  box.appendChild(h);
  const ul = document.createElement("ul");
  for (const c of report.checks) {
    if (c.level === "pass" || c.level === "skip") continue;
    const li = document.createElement("li");
    li.className = c.level; li.textContent = `${c.level === "fail" ? "Problem" : "Tip"}: ${c.message}`;
    ul.appendChild(li);
  }
  if (!ul.children.length) { const li = document.createElement("li"); li.textContent = "Nothing to fix that we can see."; ul.appendChild(li); }
  box.appendChild(ul);
  const note = document.createElement("p");
  note.textContent = "This is only advice. You still confirm the statement below before the photo is used.";
  box.appendChild(note);
  box.hidden = false;
  return report;
}

// The photo: chosen by the user, shown only in this page (never uploaded, never stored), read by a second, short-lived
// face model that tells where the face is in it. The photo must be of the person using this page.
async function usePhoto(file) {
  const another = gallery.active !== null;          // a photo is already on screen: a refused or failed new one must not stop it
  if (!another) { probe.photo = "loading"; $("badge").hidden = true; }
  const url = URL.createObjectURL(file);
  let finder = null, client = null, kept = false;
  try {
    setStatus("Reading the photo...");
    const image = new Image();
    image.src = url;
    await image.decode();
    finder = await openLandmarker("IMAGE", 2);
    const faces = finder.detect(image).faceLandmarks || [];
    const report = qualityReport(image, faces);   // S13d: advice only, shown before the consent question; it never replaces it
    const verdict = checkPhotoFaces(faces);
    if (!verdict.ok) throw new Error(verdict.reason);
    // consent first: a signed record for this exact photo (its hash; the photo itself stays here), or the photo is not used
    const sha = await sha256Hex(file);
    client = new ConsentClient();                   // every photo has its own consent
    if (!(await askConsent(sha, client, report.worst === "fail"))) { setStatus("The photo is not used: no consent was given."); settleFlow(); return; }
    if (!compositor) compositor = new MeshCompositor(faceCanvas, mesh);
    compositor.setPhoto(image, faces[0]);           // throws (and changes nothing) if the photo is too large for this graphics card
    const frontYaw = photoYaw(faces[0], (image.naturalWidth || image.width) / (image.naturalHeight || image.height));
    const item = gallery.add({ name: file.name, sha, client, image, landmarks: faces[0], url, angles: [], yaw: Number.isFinite(frontYaw) ? frontYaw : 0 });   // Stage 3: its side photos, and its own head turn
    kept = true;
    makeActive(item);
    setStatus("Photo ready: it is drawn on your live face while the consent lasts and the label stays on screen.");
  } catch (err) {
    if (client && client.record && !kept) client.revoke();   // no photo, so no consent left lying around
    $("consent").hidden = true;
    setStatus(`This photo cannot be used: ${err && err.message ? err.message : err}`);
    if (another) settleFlow();
    else {
      probe.photo = "error"; probe.consent = "none"; probe.record = null;
      if (compositor) compositor.clearPhoto();
      stopGate();
      $("badge").hidden = true;
    }
  } finally {
    if (finder) { try { finder.close(); } catch (e) { /* already closed */ } }
    if (!kept) URL.revokeObjectURL(url);            // a kept photo's address stays: its thumbnail uses it
  }
}

// After a refused or failed new photo: back to what the flow was before (a photo still on screen, or nothing).
function settleFlow() {
  const item = gallery.active;
  probe.photo = item ? "ready" : "none"; probe.consent = item ? "active" : "none"; probe.record = item ? item.client.record : null;
}

// Makes this gallery item the one drawn: its consent becomes the one checked, the label is checked before anything is drawn.
// (The compositor already holds its texture: the caller set it.)
function makeActive(item) {
  consent = item.client;
  applyLook();
  $("badge").hidden = false;
  checkLabel();                                     // the label must already be fine before the first picture is drawn
  startGate();
  Object.assign(probe, { photo: "ready", consent: "active", endedReason: "", record: consent.record });
  view.wire = false; $("wire").setAttribute("aria-pressed", "false");
  anglePicker.reset();                              // Stage 3: setPhoto() forgot the textures of side photos; this photo's own come back
  for (const a of item.angles || []) a.slot = compositor.addAngle(a.image, a.landmarks);
  renderAngles();
  syncGallery();
  if (headOn) applyHead();                          // a new photo has no head mask until it has been cut
  if (hairOn) applyHair();                          // and no moving hair until its sheet is built
  if (bodyOn) applyBody();                          // and no body layer until its puppet is built
}

// What the gallery looks like to the page and to a test.
function syncGallery() {
  Object.assign(probe, { avatars: gallery.size, avatar: gallery.activeId, session: gallery.session, dropped: gallery.dropped.slice() });
  renderGallery();
}

function renderGallery() {
  const box = $("gallery");
  box.replaceChildren();
  for (const item of gallery.list()) {
    const cell = document.createElement("div");
    cell.className = "thumb-cell";
    const pick = document.createElement("button");
    pick.type = "button"; pick.className = "thumb"; pick.dataset.id = item.id; pick.title = item.name;
    pick.setAttribute("aria-label", item.name); pick.setAttribute("aria-pressed", String(item.id === gallery.activeId));
    const img = document.createElement("img");
    img.alt = ""; img.src = item.url;
    pick.append(img);
    const del = document.createElement("button");
    del.type = "button"; del.className = "thumb-remove"; del.dataset.id = item.id;
    del.setAttribute("aria-label", `Remove ${item.name}`); del.textContent = "×";
    cell.append(pick, del);
    box.append(cell);
  }
  box.hidden = gallery.size === 0;
}

// An item leaves the gallery for good: its consent is ended and its thumbnail address released.
function releaseItem(item) {
  forgetAngles(item);                               // Stage 3: its side photos and their consents go with it
  item.client.revoke();
  if (item.url) URL.revokeObjectURL(item.url);
  if (item === gallery.active || !gallery.active) renderAngles();
}

function showToast(text) {
  toast.show(text, performance.now());
  probe.toast = text; $("toast").textContent = text; $("toast").hidden = false;
}

function tickToast(now) {
  const text = toast.current(now);
  if (text !== probe.toast) { probe.toast = text; $("toast").textContent = text; $("toast").hidden = text === ""; }
}

// The LIVE badge shows while a photo is really being drawn, and the timer counts that time only.
function tickLive(now, drawing) {
  liveTimer.tick(now, drawing);
  probe.liveSeconds = liveTimer.seconds;
  const live = $("live");
  if (live.hidden === drawing) live.hidden = !drawing;
  if (drawing) { const text = `LIVE ${formatClock(liveTimer.seconds)}`; if (text !== liveText) { liveText = text; live.textContent = text; } }
}

// Switching to another photo of the gallery: its consent is checked with the server first.
async function switchTo(id) {
  const item = gallery.get(id);
  if (!item || item.id === gallery.activeId || switching) return;
  switching = true;
  try {
    setStatus(`Checking the consent for ${item.name}...`);
    await item.client.check();
    const verdict = item.client.valid();
    if (!verdict.ok) {
      gallery.drop(id, verdict.reason); releaseItem(item); syncGallery();
      setStatus(`${item.name} was removed: ${verdict.reason}.`);
      showToast(`${item.name} was removed: ${verdict.reason}`);
      return;
    }
    compositor.setPhoto(item.image, item.landmarks);
    gallery.activate(id);
    makeActive(item);
    showToast(`Avatar changed to ${item.name}`);
    setStatus(`Now drawing ${item.name}.`);
  } catch (err) {
    setStatus(`Could not switch: ${err && err.message ? err.message : err}`);
  } finally { switching = false; }
}

// Photos that are not on screen are not polled, but one whose time is up (or that the server ended) leaves the gallery.
function pruneInactive() {
  let changed = false;
  for (const item of gallery.list()) {
    if (item.id === gallery.activeId) continue;
    if (item.client.secondsLeft() <= 0 || item.client.endedReason) {
      gallery.drop(item.id, item.client.endedReason || "consent expired"); releaseItem(item); changed = true;
      setStatus(`${item.name} was removed: its consent is over.`);
    }
  }
  if (changed) syncGallery();
}

// Shows the statement and waits for the user to confirm it (or not). Resolves true once the server has signed the consent.
async function askConsent(sha, client, needOverride = false) {
  const terms = await client.terms();
  const attest = $("consentAttest"), ok = $("consentOk"), no = $("consentNo"), panel = $("consent");
  $("consentTerms").textContent = terms.attestation;
  const over = $("qualityOverride");
  over.checked = false; $("qualityOverrideRow").hidden = !needOverride;   // S13d: after a failed photo check one extra click is needed, on top of the statement
  const ready = () => attest.checked && (!needOverride || over.checked);
  attest.checked = false; ok.disabled = true; panel.hidden = false;
  probe.photo = "asking"; probe.consent = "asked";
  setStatus("Read the statement and confirm it to use this photo.");
  return new Promise((resolve) => {
    const finish = (value) => { cancelAsk = null; panel.hidden = true; $("qualityOverrideRow").hidden = true; attest.onchange = over.onchange = ok.onclick = no.onclick = null; resolve(value); };
    cancelAsk = () => finish(false);                // Stop closes the question
    attest.onchange = over.onchange = () => { ok.disabled = !ready(); };
    no.onclick = () => finish(false);
    ok.onclick = async () => {
      if (!ready()) return;
      ok.disabled = true;
      try { await client.issue(sha, Number($("consentHours").value), attest.checked); finish(true); }
      catch (err) { setStatus(`Consent was refused: ${err && err.message ? err.message : err}`); finish(false); }
    };
  });
}

// The label check and the consent check run while a photo is on screen. Both fail closed.
function checkLabel() {
  const view = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
  gate.label = $("badge").hidden && !(compositor && compositor.hasPhoto) ? "" : labelProblem(readLabel(document, window, $("badge")), view);
  if (gate.label !== probe.label) setStatus(gate.label ? `The photo is paused: ${gate.label}.` : "The photo is drawn again: the label is back.");
  probe.label = gate.label;
}

function startGate() {
  stopGate();
  gate.timers.push(setInterval(checkLabel, LABEL_EVERY_MS));
  gate.timers.push(setInterval(async () => {
    pruneInactive();
    const client = consent;                        // the active photo's; it can change while the answer is awaited
    if (!client.record) return;
    const item = gallery.active;
    const sides = item && item.angles ? item.angles.map((a) => a.client) : [];
    if (sides.length) await ConsentClient.checkMany([client, ...sides]);   // Stage 3: the photo and its side photos in ONE request
    else await client.check();
    if (client !== consent) return;
    dropEndedAngles(item);
    const v = client.valid();
    probe.consentLeft = client.secondsLeft();
    // While a side photo loads, a verdict that is only late pauses the photo instead of ending it (angles.js gateVerdict); with no
    // side photo loading this is exactly the old rule: anything but ok ends the photo.
    const decision = gateVerdict(v, angleBlocking);
    probe.gateDecision = decision;
    if (decision === "end") endPhoto(v.reason);
  }, CHECK_EVERY_MS));
}

let rechecking = false;
async function recheckConsent() {
  if (rechecking || !consent.record) return;
  rechecking = true;
  const client = consent;
  const item = gallery.active;
  const sides = item && item.angles ? item.angles.map((a) => a.client) : [];
  try { if (sides.length) await ConsentClient.checkMany([client, ...sides]); else await client.check(); } finally { rechecking = false; }   // Stage 3: one request for all
}

function stopGate() { for (const t of gate.timers) clearInterval(t); gate.timers = []; gate.label = ""; probe.label = ""; }

// The photo stops for good (consent over): it is forgotten, and so is the record. A new photo needs a new consent.
function endPhoto(reason) {
  const item = gallery.active;
  const successor = item ? gallery.neighbourOf(item.id) : "";
  if (item) { gallery.drop(item.id, reason); releaseItem(item); }   // it leaves the gallery; the others stay, none is active
  if (compositor) compositor.clearPhoto();
  consent = new ConsentClient();
  stopGate();
  probe.photo = "none"; probe.drawn = 0; probe.consent = "ended"; probe.endedReason = reason; probe.record = null;
  $("badge").hidden = true;
  $("photoFile").value = "";
  syncGallery();
  setStatus(`The photo was stopped: ${reason}.`);
  if (gallery.size > 0) takeOver(successor, reason);
  else setStatus(`The photo was stopped: ${reason}. No photo is left: choose one to start again.`);
}

// The photo on screen ended but others remain: the neighbour takes over once the server confirms its consent. A photo whose own
// consent is over is dropped on the way (switchTo does that) and the next one is tried; nothing is drawn without a valid consent.
async function takeOver(preferredId, reason) {
  for (let tries = gallery.size; tries > 0 && gallery.size > 0 && !gallery.active; tries--) {
    const id = gallery.get(preferredId) ? preferredId : gallery.list()[0].id;
    await switchTo(id);
    if (!gallery.active && gallery.get(id)) return;           // busy or the server did not answer: the user picks one
    preferredId = "";
  }
  const now = gallery.active;
  if (now) {
    probe.endedReason = reason;
    showToast(`Photo ended (${reason}); now showing ${now.name}`);
  } else if (gallery.size === 0) setStatus(`The photo was stopped: ${reason}. No photo is left: choose one to start again.`);
}

// The user takes a photo out of the gallery: its consent ends. If it was the one on screen, the screen goes back to the plain camera.
function removeItem(id) {
  const { item, wasActive } = gallery.remove(id);
  if (!item) return;
  releaseItem(item);
  if (wasActive) {
    if (compositor) compositor.clearPhoto();
    consent = new ConsentClient();
    stopGate();
    probe.photo = "none"; probe.drawn = 0; probe.consent = "none"; probe.record = null;
    $("badge").hidden = true;
  }
  $("photoFile").value = "";
  syncGallery();
  setStatus("Photo removed, and its consent ended.");
}

// "Remove photo": the one on screen.
function dropPhoto() {
  if (gallery.active) return removeItem(gallery.active.id);
  if (compositor) compositor.clearPhoto();
  stopGate();
  probe.photo = "none"; probe.drawn = 0; probe.consent = "none"; probe.record = null;
  $("badge").hidden = true;
  $("consent").hidden = true;
  $("photoFile").value = "";
  setStatus("Photo removed, and its consent ended.");
}

// "Stop": the session is over. Every consent ends, every photo is forgotten, the screen goes back to the plain camera.
function stopSession() {
  if (cancelAsk) cancelAsk();
  for (const item of gallery.stop()) releaseItem(item);
  if (compositor) compositor.clearPhoto();
  consent = new ConsentClient();
  stopGate();
  Object.assign(probe, { photo: "none", drawn: 0, consent: "none", record: null, endedReason: "" });
  $("badge").hidden = true; $("consent").hidden = true; $("photoFile").value = "";
  liveTimer.reset(); probe.liveSeconds = 0; liveText = "";
  syncGallery();
  tickLive(performance.now(), false);
  showToast("Session stopped");
  setStatus("Session stopped: every consent is ended and every photo is forgotten.");
}

function draw(landmarks) {
  if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
    overlay.width = video.videoWidth; overlay.height = video.videoHeight;
  }
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  if (!fillSegments(landmarks, mesh.edges, overlay.width, overlay.height, segments)) return;
  if (view.wire) {
    ctx.strokeStyle = "rgba(0, 255, 200, 0.55)"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let o = 0; o < segments.length; o += 4) { ctx.moveTo(segments[o], segments[o + 1]); ctx.lineTo(segments[o + 2], segments[o + 3]); }
    ctx.stroke();
  }
  if (view.points) {
    ctx.fillStyle = "#ffd400";
    for (let i = 0; i < 468; i++) ctx.fillRect(landmarks[i].x * overlay.width - 1, landmarks[i].y * overlay.height - 1, 2, 2);
  }
}

const maskConf = new MaskConfidence();   // S13e
let lastDet = null, prevDet = null, skipNext = false;
const SKIP_ABOVE_MS = 28;
function frame() {
  if (stopped) return;
  if (video.readyState >= 2 && video.videoWidth > 0 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const now = performance.now();
    lastTs = Math.max(lastTs + 1, now);            // MediaPipe wants strictly increasing timestamps
    const took0 = performance.now();
    let landmarks = null;
    // S11n: when one detection takes longer than SKIP_ABOVE_MS (slow laptop), every second camera frame reuses the face from its last two
    // detections, moved on by their motion: about 30 frames a second instead of 20, at the price of one frame of guesswork.
    const guess = skipNext && detectMs > SKIP_ABOVE_MS && lastDet && prevDet ? extrapolateLandmarks(prevDet.l, prevDet.t, lastDet.l, lastDet.t, now) : null;
    if (guess) { landmarks = guess; skipNext = false; probe.skipped = (probe.skipped || 0) + 1; }
    else {
      try {
        const result = landmarker.detectForVideo(video, lastTs);
        landmarks = result.faceLandmarks && result.faceLandmarks[0] ? result.faceLandmarks[0] : null;
      } catch (err) { setStatus(`Tracking error: ${err.message}`); }
      if (landmarks) { prevDet = lastDet; lastDet = { l: landmarks, t: now }; skipNext = true; } else { prevDet = null; lastDet = null; skipNext = false; }
    }
    const took = guess ? detectMs : performance.now() - took0;   // a skipped frame did not run the model: it does not change the model's measured time
    detectMs = detectMs ? 0.8 * detectMs + 0.2 * took : took;
    stats.mark(now, landmarks !== null);
    probe.frames++; probe.found += landmarks ? 1 : 0; probe.detectMs = detectMs;
    if (landmarks) probe.box = faceBox(landmarks);   // where the face is, as fractions of the frame: four numbers
    if (measure) { measure.ms.push(took); measure.found += landmarks ? 1 : 0; measure.times.push(now); }
    // What is drawn is the steadied face (smoothed, held for a moment when lost, faded when covered), not the raw detection.
    const handsWanted = handLandmarker && (look.hideHands || hairOn || liveHandsOn || messyEating || stains.count > 0);   // the hair and hands options read the same hand model as the cover option
    const handCoverNow = handsWanted ? coverNow(now, landmarks) : 0;
    const cover = look.hideHands ? handCoverNow : 0;
    const shown = presence.update(landmarks, now, cover);
    jitter.mark(landmarks, shown && shown.landmarks);
    Object.assign(probe, { shown: shown !== null, opacity: shown ? shown.opacity : 0, cover, jitterRaw: jitter.raw, jitterSmooth: jitter.smooth });
    draw(shown ? shown.landmarks : null);
    if (compositor && compositor.hasPhoto) {
      if (faceCanvas.width !== video.videoWidth || faceCanvas.height !== video.videoHeight) {
        faceCanvas.width = video.videoWidth; faceCanvas.height = video.videoHeight;
      }
      // consent and label are checked every frame (cheap: numbers); a failure draws nothing.
      // Only "stale" is not final here: a page stalled for seconds (loading a model for another photo) could not ask the
      // server, so nothing is drawn and the server is asked now. If it does not answer, the timed check ends the photo.
      const verdict = consent.valid();
      if (!verdict.ok && verdict.stale) { compositor.clear(); probe.drawn = 0; recheckConsent(); }
      else if (!verdict.ok) endPhoto(verdict.reason);
      else if (gate.label) { compositor.clear(); probe.drawn = 0; }
      else {
        stepLiveHands(shown);                      // your own hands, drawn over everything (S10c)
        stepStains(now, shown);                    // spills and stains on the shirt (S10g)
        if (bodyOn) stepBody(now, shown);          // the body and dress for this frame (drawn first, behind the hair and the face)
        if (hairOn) stepHair(now, shown);          // the hair sheet for this frame (drawn behind the face by the compositor)
        compositor.setSoftEdges(softOn ? 1 : 0);   // S13f: model-free soft edge along the mesh outline
        stepSeams(now, shown);                     // S13c: clean the seams between the photo's head and the live one
        // the video goes to the graphics card for colour matching only: see compositor.js
        // S13e: the photo gives way to the live picture where it would not hold (head turned far, mouth very wide, face partly out of frame)
        const yawRef = stepAngles(now, shown);     // Stage 3: null unless side photos are in use; then the hold measures from the photo drawn
        const conf = maskConf.update(shown ? shown.landmarks : null, video.videoWidth / Math.max(1, video.videoHeight), yawRef);
        const hold = holdFactors(look.hold / 100, conf);
        probe.confidence = conf.confidence; probe.holdPhoto = hold.photo; probe.holdRing = hold.ring;
        probe.drawn = compositor.draw(shown ? shown.landmarks : null, video, shown ? shown.opacity * hold.photo : 0, hold.ring);
        probe.shapeUsed = compositor.shapeUsed || 0;
        probe.headDrawn = compositor.headActive;
        probe.hairDrawn = compositor.hairDrawn;
        probe.bodyDrawn = compositor.bodyDrawn;
        probe.liveDrawn = compositor.liveDrawn;
        probe.stainsDrawn = compositor.stainsDrawn;
        probe.seamDrawn = compositor.seamDrawn;
        probe.softDrawn = compositor.featherDrawn;
      }
    }
    tickLive(now, probe.drawn > 0);                // LIVE counts the time a photo is really drawn
  }
  schedule();
}

// When a pass takes as long as a camera frame, the next frame is already gone by the time a callback is requested,
// which would halve the rate. So a newer frame that is already waiting is handled at once.
function schedule() {
  if (stopped) return;
  if (video.readyState >= 2 && video.currentTime !== lastVideoTime) setTimeout(frame, 0);
  else if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(frame);
  else requestAnimationFrame(frame);
}

function percentile(sorted, p) { return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] : 0; }

function finishMeasure() {
  const m = measure; measure = null;
  const n = m.ms.length;
  if (n < 2) { $("measure").textContent = "Measurement failed: no frames were processed."; return; }
  const sorted = m.ms.slice().sort((a, b) => a - b);
  const fps = ((n - 1) * 1000) / (m.times[n - 1] - m.times[0]);
  const verdict = fps >= GATE_FPS ? "passes" : "FAILS";
  probe.measured = { frames: n, fps, foundPct: (100 * m.found) / n, p95Ms: percentile(sorted, 0.95), gate: fps >= GATE_FPS };
  $("measure").textContent =
    `10 s measurement: ${n} frames, ${fps.toFixed(1)} fps, face found in ${(100 * m.found / n).toFixed(0)}% of frames, ` +
    `detection ${sorted.reduce((s, v) => s + v, 0) / n | 0} ms on average (95th percentile ${percentile(sorted, 0.95) | 0} ms), ` +
    `${delegate}, ${video.videoWidth}x${video.videoHeight}. The ${GATE_FPS} fps gate ${verdict}.`;
  $("go").disabled = false;
}

function startMeasure() {
  measure = { ms: [], times: [], found: 0 };
  $("go").disabled = true;
  $("measure").textContent = "Measuring for 10 seconds: keep your face in view and move a little...";
  setTimeout(finishMeasure, MEASURE_MS);
}

function updateHud() {
  const r = stats.read();
  probe.fps = r.fps; probe.foundPct = r.foundPct; probe.delegate = delegate;
  $("fps").textContent = r.fps ? r.fps.toFixed(1) : "-";
  $("found").textContent = r.fps ? `${r.foundPct.toFixed(0)}%` : "-";
  $("ms").textContent = detectMs ? `${detectMs.toFixed(0)} ms` : "-";
  $("delegate").textContent = delegate || "-";
  tickToast(performance.now());
  const left = consent.record ? consent.secondsLeft() : 0;
  probe.consentLeft = left;
  $("consentState").textContent = consent.record ? `${Math.floor(left / 3600)} h ${String(Math.floor((left % 3600) / 60)).padStart(2, "0")} min left` : (probe.consent === "ended" ? "ended" : "none");
  const fpsGate = $("gate");
  if (!r.fps) { fpsGate.textContent = "measuring"; fpsGate.className = ""; }
  else if (r.fps >= GATE_FPS) { fpsGate.textContent = `${GATE_FPS} fps gate: OK`; fpsGate.className = "ok"; }
  else { fpsGate.textContent = `${GATE_FPS} fps gate: not met`; fpsGate.className = "bad"; }
}

function wireControls() {
  const toggle = (id, key) => $(id).addEventListener("click", (e) => {
    view[key] = !view[key]; e.currentTarget.setAttribute("aria-pressed", String(view[key]));
  });
  toggle("wire", "wire"); toggle("points", "points");
  $("mirror").addEventListener("click", (e) => {
    const on = stage.classList.toggle("mirror"); e.currentTarget.setAttribute("aria-pressed", String(on));
  });
  $("go").addEventListener("click", startMeasure);
  $("photoBtn").addEventListener("click", () => $("photoFile").click());
  $("photoFile").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";                            // the same file can be chosen again later
    if (f) usePhoto(f);
  });
  $("photoClear").addEventListener("click", dropPhoto);
  $("gallery").addEventListener("click", (e) => {
    const del = e.target.closest(".thumb-remove");
    if (del) return removeItem(del.dataset.id);
    const pick = e.target.closest(".thumb");
    if (pick) switchTo(pick.dataset.id);
  });
  $("stop").addEventListener("click", stopSession);
  $("full").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await $("wrap").requestFullscreen();     // the picture and the label go full screen together
    } catch (err) { setStatus(`Full screen is not available: ${err && err.message ? err.message : err}`); }
  });
  document.addEventListener("fullscreenchange", () => {
    probe.fullscreen = document.fullscreenElement !== null;
    setStatus(probe.fullscreen ? "Full screen: press Esc to leave." : "Left full screen.");
  });
  $("hold").addEventListener("input", (e) => { look.hold = Number(e.target.value); $("holdValue").textContent = `${look.hold}%`; applyLook(); });   // S13e
  $("shape").addEventListener("input", (e) => { look.shape = Number(e.target.value); $("shapeValue").textContent = `${look.shape}%`; applyLook(); });   // S11l
  $("match").addEventListener("input", (e) => { look.match = Number(e.target.value); $("matchValue").textContent = `${look.match}%`; applyLook(); });
  $("keepFace").addEventListener("click", (e) => {
    look.keep = !look.keep; e.currentTarget.setAttribute("aria-pressed", String(look.keep)); applyLook();
  });
  $("smooth").addEventListener("click", (e) => {
    presence.smoothing = !presence.smoothing; presence.smoother.reset(); probe.smooth = presence.smoothing;
    e.currentTarget.setAttribute("aria-pressed", String(presence.smoothing));
  });
  $("headBtn").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    if (headOn) {
      headOn = false; button.setAttribute("aria-pressed", "false");
      if (compositor) compositor.setHead(false);
      if (!hairOn && !bodyOn) closeSegmenter(); probe.head = "off";
      setStatus("Whole head off: only the face is drawn.");
      return;
    }
    button.disabled = true;
    try {
      headOn = true; button.setAttribute("aria-pressed", "true"); probe.head = "on";
      if (gallery.active) await applyHead();
      else setStatus("Whole head is on: it applies to the next photo you choose.");
    } finally { button.disabled = false; }
  });
  $("handsTop").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    if (liveHandsOn) {
      liveHandsOn = false; button.setAttribute("aria-pressed", "false");
      if (compositor) compositor.setLiveHands(null);
      probe.liveHands = "off"; probe.handCircles = 0;
      if (!look.hideHands && !hairOn) closeHands();            // keep the hand model if the cover or hair option still uses it
      setStatus("Your hands are no longer drawn on top.");
      return;
    }
    button.disabled = true;
    setStatus("Loading the hand model...");
    try {
      handLandmarker = handLandmarker || await openHandLandmarker();
      liveHandsOn = true; button.setAttribute("aria-pressed", "true"); probe.liveHands = "on";
      setStatus("Your own hands are drawn on top of the photo: what you hold stays visible. This costs speed: look at the frames per second.");
    } catch (err) {
      probe.liveHands = "error"; probe.lastError = String((err && err.message) || err).slice(0, 160);
      setStatus(`The hand model could not start: ${err && err.message ? err.message : err}`);
    } finally { button.disabled = false; }
  });
  $("eyesBtn").addEventListener("click", (e) => {      // S11e: the live eyes instead of the photo's (they follow every blink exactly, but sit less naturally on the photo)
    look.keepEyes = !look.keepEyes; e.currentTarget.setAttribute("aria-pressed", String(look.keepEyes)); applyLook();
    setStatus(look.keepEyes ? "Your own eyes show through the photo." : "The photo's eyes are used.");
  });
  $("glassesBtn").addEventListener("click", (e) => {   // S11: spectacles in the photo are not drawn on the live face
    glassesTouched = true; look.glasses = !look.glasses; e.currentTarget.setAttribute("aria-pressed", String(look.glasses)); applyLook();
    setStatus(look.glasses ? "The photo's glasses are hidden: your own face shows there." : "The photo's glasses are drawn as they are.");
  });
  $("skinBtn").addEventListener("click", (e) => {      // S10h: the live hand's skin colour moves towards the photo's, on the graphics card only
    look.skin = !look.skin; e.currentTarget.setAttribute("aria-pressed", String(look.skin)); applyLook();
    setStatus(look.skin ? "Your hands take the photo's skin tone (it shows with \"Show my hands on top\")." : "Your hands keep their own colour.");
  });
  $("softBtn").addEventListener("click", (e) => {            // S13f: soft edge along the mesh outline, no model
    softOn = !softOn; e.currentTarget.setAttribute("aria-pressed", String(softOn)); probe.soft = softOn ? "on" : "off";
    setStatus(softOn ? "Soft edges is on: a soft band in the photo's background colour hides live hair along the head's outline." : "Soft edges is off.");
  });
  $("seamBtn").addEventListener("click", (e) => {            // S13c: hide the live hair and ears that peek out round the photo's head
    seamOn = !seamOn; e.currentTarget.setAttribute("aria-pressed", String(seamOn));
    probe.seam = seamOn ? (seamSeg ? "on" : "loading") : "off";
    if (seamOn) { seamGaveUp = false; seamState.slowRuns = 0; seamState.cost = 0; }   // a second try (measured afresh) when the user asks again
    else { if (compositor) compositor.setSeamAmount(0, null); closeSeams(); }
    setStatus(seamOn ? "Clean the edges is on: live hair and ears round the photo's head are hidden." : "Clean the edges is off.");
  });
  $("anglesBtn").addEventListener("click", (e) => {        // Stage 3: side photos, off by default
    anglesOn = !anglesOn; e.currentTarget.setAttribute("aria-pressed", String(anglesOn));
    probe.angles = anglesOn ? "on" : "off";
    if (!anglesOn) {
      for (const item of gallery.list()) forgetAngles(item);   // their consents end with the option
      if (compositor) { compositor.clearAngles(); compositor.setFaceMix(null); }
      anglePicker.reset(); closeAngleFinder();
    }
    renderAngles();
    setStatus(anglesOn ? `Photos at several angles is on: add side photos of yourself, turned 15° to 45° (each needs its own consent).`
      : "Photos at several angles is off: side photos are removed and their consents ended.");
  });
  $("angleAdd").addEventListener("click", () => $("angleFile").click());
  $("angleFile").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (f) addAnglePhoto(f);
  });
  $("angles").addEventListener("click", (e) => {
    const del = e.target.closest(".thumb-remove");
    const item = gallery.active;
    if (!del || !item) return;
    const angle = item.angles.find((a) => a.slot === del.dataset.slot);
    if (angle) { dropAngle(item, angle); renderAngles(); setStatus("Side photo removed, and its consent ended."); }
  });
  $("handReach").addEventListener("input", (e) => {
    handReach = Number(e.currentTarget.value) / 100;
    $("handReachValue").textContent = `${e.currentTarget.value}%`;
  });
  $("hairReach").addEventListener("input", (e) => {          // S12b: the photo's hair grows to cover more of your own
    if (compositor) compositor.setHairReach(Number(e.currentTarget.value) / 100);
    $("hairReachValue").textContent = `${e.currentTarget.value}%`;
  });
  $("hairHalo").addEventListener("input", (e) => {           // gap #2: the photo's hair is widened and softened so less of your own shows round it
    if (compositor) compositor.setHairHalo(Number(e.currentTarget.value) / 100);
    $("hairHaloValue").textContent = `${e.currentTarget.value}%`;
  });
  $("webcamLook").addEventListener("input", (e) => {         // S13b: the photo takes on the webcam's softness, grain and grade (measured on the GPU)
    if (compositor) compositor.setWebcamLook(Number(e.currentTarget.value) / 100);
    $("webcamLookValue").textContent = `${e.currentTarget.value}%`;
  });
  $("mouthPatch").addEventListener("input", (e) => {         // S12c: the live mouth patch pulls in, so it does not read bigger than the photo's lips
    if (compositor) compositor.setMouthShrink(Number(e.currentTarget.value) / 100);
    $("mouthPatchValue").textContent = `${e.currentTarget.value}%`;
  });
  $("spillBtn").addEventListener("click", () => spillNow($("stainKind").value));
  $("cleanBtn").addEventListener("click", () => { stains.clear(); setStatus("The shirt is clean."); });
  $("messyBtn").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    messyEating = !messyEating; mouthWasOpen = false;
    button.setAttribute("aria-pressed", String(messyEating)); probe.messy = messyEating ? "on" : "off";
    if (messyEating && !handLandmarker) {                      // it needs the hands, to know a hand is near the mouth
      button.disabled = true;
      try { handLandmarker = await openHandLandmarker(); setStatus("Messy eating on: open your mouth with a hand near it. Spills need Body and clothes."); }
      catch (err) { messyEating = false; button.setAttribute("aria-pressed", "false"); probe.messy = "error"; probe.lastError = String((err && err.message) || err).slice(0, 160); setStatus("The hand model could not start, so messy eating is off."); }
      finally { button.disabled = false; }
    } else setStatus(messyEating ? "Messy eating on." : "Messy eating off.");
  });
  $("coverClothes").addEventListener("input", (e) => {
    coverGrow = Number(e.currentTarget.value) / 100;
    $("coverClothesValue").textContent = `${e.currentTarget.value}%`;
  });
  $("gripReach").addEventListener("input", (e) => {
    gripReach = Number(e.currentTarget.value) / 100;
    $("gripReachValue").textContent = `${e.currentTarget.value}%`;
  });
  $("bodyBtn").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    if (bodyOn) {
      bodyOn = false; button.setAttribute("aria-pressed", "false");
      forgetBody(); closePose(); probe.body = "off"; probe.poseMs = 0;
      if (!headOn && !hairOn) closeSegmenter();                // keep the segmenter if Whole head or the hair still uses it
      setStatus("Body and clothes off.");
      return;
    }
    button.disabled = true;
    try {
      bodyOn = true; button.setAttribute("aria-pressed", "true"); probe.body = "on";
      if (gallery.active) await applyBody();
      else setStatus("Body and clothes are on: they apply to the next photo you choose.");
    } finally { button.disabled = false; }
  });
  $("hairBtn").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    if (hairOn) {
      hairOn = false; button.setAttribute("aria-pressed", "false");
      forgetHair(); probe.hair = "off";
      if (!look.hideHands && !liveHandsOn) closeHands();       // keep the hand model if the cover or hands option still uses it
      if (!headOn && !bodyOn) closeSegmenter();                // and the segmenter if Whole head or the body still uses it
      setStatus("Moving hair off.");
      return;
    }
    button.disabled = true;
    try {
      hairOn = true; button.setAttribute("aria-pressed", "true"); probe.hair = "on";
      if (gallery.active) await applyHair();
      else setStatus("Moving hair is on: it applies to the next photo you choose.");
    } finally { button.disabled = false; }
  });
  $("hideHands").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    if (look.hideHands) {
      look.hideHands = false; if (!hairOn && !liveHandsOn) closeHands(); probe.hands = "off"; probe.handMs = 0; button.setAttribute("aria-pressed", "false");
      return;
    }
    button.disabled = true;
    setStatus("Loading the hand model...");
    try {
      handLandmarker = handLandmarker || await openHandLandmarker();   // the hair option may have opened it already
      look.hideHands = true; probe.hands = "on"; button.setAttribute("aria-pressed", "true");
      setStatus("The photo fades out when a hand covers your face. This costs speed: look at the frames per second.");
    } catch (err) {
      probe.hands = "error";
      setStatus(`The hand model could not start: ${err && err.message ? err.message : err}`);
    } finally { button.disabled = false; }
  });
}

async function main() {
  wireControls();
  stage.classList.add("mirror");   // selfie view, like the tracker's default
  let stream = null;
  try {
    setStatus("Opening the camera...");
    stream = await openCamera();
    setStatus("Loading the face model...");
    landmarker = await openLandmarker();
  } catch (err) {
    probe.state = "error";
    setStatus(explain(err));
    if (stream) stream.getTracks().forEach((t) => t.stop());
    return;
  }
  setStatus("Running. The camera picture stays in this page; only the drawn mesh is computed from it.");
  $("go").disabled = false;
  probe.state = "running";
  setInterval(updateHud, 500);
  window.addEventListener("pagehide", () => {
    stopped = true;
    try { landmarker.close(); } catch (e) { /* already closed */ }
    closeHands(); closePose(); closeSegmenter(); closeAngleFinder();
    for (const item of gallery.list()) { item.client.revoke(); for (const a of item.angles || []) a.client.revoke(); }   // best effort: the page is going away, so its consents should not outlive it
    stream.getTracks().forEach((t) => t.stop());
  });
  schedule();
}

main();
