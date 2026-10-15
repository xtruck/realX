// Camera -> MediaPipe face, pose and hand landmarkers -> bone rotations, all inside this page.
//
// Privacy rule: the camera picture is only ever given to MediaPipe. It is never drawn to a canvas,
// read back, encoded or sent anywhere; what leaves this module is the numbers from packBody().
// test_tracker_never_reads_camera_pixels (tests/test_tracking_browser.py) checks this file for the
// calls that would break that.
import { FaceLandmarker, FilesetResolver, HandLandmarker, PoseLandmarker } from "@mediapipe/tasks-vision";
import { assignHands } from "./assign.js";
import { mouthCover } from "./utils/audioLipSync.js";
import { BodyFilter, RootTracker, Stagger, packBody, qualityOf } from "./body.js";
import { DeviceSupervisor } from "./recover.js";

const FRESH_MIN_MS = 300; // a model result older than this (or 8 frame intervals, if longer) is treated as "not seen"
const FROZEN_MS = 3000;   // no new camera frame for this long, with the page visible: treat the camera as gone

/**
 * solver     a BodySolver built from the character's rest pose
 * mirror     selfie view (the character moves like your reflection); the solver must use the same value
 * legs       "auto" | "off" | "on"
 * desk       the desk view (upper body): legs off, arms held longer, seated rest pose; the solver must use upperBody too
 * delegate   "auto" tries the GPU and falls back to the CPU; "cpu" and "gpu" force one
 * base       URL prefix for /mp/wasm and /mp/models (same origin)
 * video      an existing <video> to show the camera in (a preview), or omitted for a hidden one
 * onFrame    (message, info) called with each packed body message
 * onHands    (hands, now) once per NEW hand-model result (hands: [{ image, world, label, score }], maybe empty); for gestures
 * onStatus   (state, detail) state: camera | models | running | error | stopped
 */
export async function startTracker({ solver, mirror = true, legs = "auto", desk = false, delegate = "auto", base = "", video = null, deviceId = null, quality = "balanced", onFrame, onHands = null, onStatus = () => {} }) {
  const preset = qualityOf(quality);
  const status = (state, detail = "") => onStatus(state, detail);
  let stopped = false;
  let watchdog = null, modelsReady = false, restarted = false, lastNewFrameAt = performance.now();
  video = video || document.createElement("video");   // the camera shows here; a hidden one when there is no preview
  video.muted = true; video.playsInline = true;
  // Opens the camera. The supervisor calls it again, with growing pauses, when the camera is unplugged or taken
  // by another app, so tracking resumes by itself.
  const openCamera = async () => {
    const s = await navigator.mediaDevices.getUserMedia({
      video: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" }),
        width: { ideal: preset.width }, height: { ideal: preset.height }, frameRate: { ideal: 30 },
      },
      audio: false,
    });
    video.srcObject = s;
    await video.play();
    restarted = true;                 // the camera's own frame counter starts over
    lastNewFrameAt = performance.now();
    return { tracks: s.getVideoTracks(), stop() { s.getTracks().forEach((t) => t.stop()); if (video.srcObject === s) video.srcObject = null; } };
  };
  const camera = new DeviceSupervisor({
    kind: "camera", start: openCamera, explain: describe,
    onState: (e) => {                 // while the models load, start-up reports its own progress
      if (!modelsReady) return;
      if (e.state === "running") status("running");
      else if (e.state === "lost" || e.state === "blocked") status("error", e.message);
    },
  });
  const tasks = {};      // face | pose | hands -> landmarker
  const used = {};       // face | pose | hands -> "GPU" | "CPU"

  try {
    status("camera");
    await camera.run();
    if (camera.state === "blocked") throw new Error(camera.last.message);   // a refused permission is final

    status("models");
    const fileset = await FilesetResolver.forVisionTasks(`${base}/mp/wasm`);
    const model = (name) => `${base}/mp/models/${name}`;
    const make = (key, factory) => build(key, factory, delegate, used, tasks);
    // allSettled, not all: when one model fails to load the others must finish before cleanup() can close them
    const loaded = await Promise.allSettled([
      make("face", (d) => FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: model("face_landmarker.task"), delegate: d }, runningMode: "VIDEO",
        numFaces: 1, outputFaceBlendshapes: true,
      })),
      make("pose", (d) => PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: model("pose_landmarker_lite.task"), delegate: d }, runningMode: "VIDEO", numPoses: 1,
      })),
      make("hands", (d) => HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: model("hand_landmarker.task"), delegate: d }, runningMode: "VIDEO", numHands: 2,
        minHandDetectionConfidence: 0.4, minHandPresenceConfidence: 0.4,   // a little below the 0.5 default: small or tilted hands
      })),
    ]);
    const failure = loaded.find((r) => r.status === "rejected");
    if (failure) throw failure.reason;
  } catch (err) {
    cleanup();
    status("error", describe(err));
    return { stop() {}, recenter() {}, setLegs() {}, stats: () => ({}) };
  }

  const filter = new BodyFilter({ legs, desk });
  const root = new RootTracker({ mirror });
  const stagger = new Stagger({ budgetMs: preset.budgetMs }); // balanced: ~28 ms per model measured on an integrated GPU, so about one per frame
  const latest = { face: null, pose: null, hands: null }; // { t, result } of the newest run of each model
  const ran = { face: 0, pose: 0, hands: 0 };
  const stats = {
    fps: 0, interval: 33, ms: { face: 0, pose: 0, hands: 0 }, hz: { face: 0, pose: 0, hands: 0 }, frames: 0, delegates: used, diag: null,
    skipped: 0,        // camera frames that arrived but were not processed (the models were busy)
    latencyMs: null,   // from the camera capturing a frame to its numbers being ready; null when the browser gives no capture time
  };
  let presented = 0, captureTime = null, presentedBase = null, processedSince = 0;
  const watch = (_now, meta) => {   // a light per-frame watcher: the camera's own frame counter and capture time
    presented = meta.presentedFrames ?? presented;
    captureTime = Number.isFinite(meta.captureTime) ? meta.captureTime : null;
    if (!stopped) video.requestVideoFrameCallback(watch);
  };
  if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(watch);
  let lastTs = 0, lastVideoTime = -1, lastFrameAt = 0, failures = 0, hzSince = performance.now();

  function step() {
    if (stopped) return;
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      lastNewFrameAt = performance.now();
      try {
        process();
        failures = 0;
      } catch (err) {
        // one bad frame is not the end; five in a row means something is really wrong
        if (++failures >= 5) { status("error", describe(err)); stop(true); return; }
      }
    }
    schedule();
  }
  // When a model pass takes as long as a camera frame, the next frame has already come and gone by the time
  // a callback is requested, which would halve the rate. So: a newer frame already waiting is handled at
  // once; otherwise wait for the next one.
  const schedule = () => {
    if (stopped) return;
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) setTimeout(step, 0);
    else if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(step);
    else requestAnimationFrame(step);
  };

  function process() {
    const now = performance.now();
    lastTs = Math.max(lastTs + 1, now); // MediaPipe wants strictly increasing timestamps
    const plan = stagger.plan(now);
    const took = {};
    for (const key of ["pose", "face", "hands"]) {
      if (!plan[key]) continue;
      const a = performance.now();
      const result = tasks[key].detectForVideo(video, lastTs);
      took[key] = performance.now() - a;
      stats.ms[key] = 0.8 * stats.ms[key] + 0.2 * took[key];
      latest[key] = { t: now, result };
      ran[key]++;
    }
    stagger.report(took);
    if (now - hzSince >= 1000) {       // how often each model really ran over the last second
      for (const key of Object.keys(ran)) { stats.hz[key] = Math.round((ran[key] * 1000) / (now - hzSince)); ran[key] = 0; }
      hzSince = now;
    }

    const aspect = video.videoWidth / Math.max(1, video.videoHeight);
    // a slow machine means older results between runs of a model; that is still tracking, not loss
    const freshMs = Math.max(FRESH_MIN_MS, 8 * stats.interval);
    const fresh = (e) => (e && now - e.t <= freshMs ? e.result : null);
    const faceR = fresh(latest.face), poseR = fresh(latest.pose), handR = fresh(latest.hands);

    const poseImage = poseR && poseR.landmarks && poseR.landmarks[0] ? poseR.landmarks[0] : null;
    const poseWorld = poseR && poseR.worldLandmarks && poseR.worldLandmarks[0] ? poseR.worldLandmarks[0] : null;
    const hands = handR && handR.landmarks ? handR.landmarks.map((image, i) => ({
      image, world: handR.worldLandmarks[i],
      label: handR.handedness?.[i]?.[0]?.categoryName ?? null, score: handR.handedness?.[i]?.[0]?.score ?? 0,
    })) : [];
    const face = faceR && faceR.faceLandmarks && faceR.faceLandmarks[0] ? {
      landmarks: faceR.faceLandmarks[0],
      blend: Object.fromEntries((faceR.faceBlendshapes?.[0]?.categories ?? []).map((c) => [c.categoryName, c.score])),
      aspect,
    } : null;

    if (onHands && plan.hands && handR) { try { onHands(hands, now); } catch (e) { /* a gesture bug must not stop tracking */ } }
    stats.mouthCover = mouthCover(face ? face.landmarks : null, hands);   // landmark numbers only: is a hand on the mouth?
    const assigned = assignHands(hands, poseImage, { aspect });
    const solved = solver.solve({ pose: poseWorld ? { world: poseWorld } : null, hands: assigned, face });
    stats.diag = diagnose({ face, poseWorld, hands, assigned, solved, poseImage });
    const msg = packBody(filter.update(solved, now, root.update(poseImage, aspect)));
    stats.frames++;
    if (restarted) { presentedBase = null; processedSince = 0; restarted = false; }   // a reconnected camera counts its frames from zero
    processedSince++;
    if (presented > 0) {   // count from the first processed frame, not from when the camera started (model loading takes seconds)
      if (presentedBase === null) presentedBase = presented - 1;
      stats.skipped = Math.max(0, presented - presentedBase - processedSince);
    }
    if (captureTime !== null) stats.latencyMs = Math.max(0, performance.now() - captureTime);
    if (lastFrameAt) {
      stats.interval = 0.9 * stats.interval + 0.1 * (now - lastFrameAt);
      stats.fps = 1000 / Math.max(1, stats.interval);
    }
    lastFrameAt = now;
    onFrame(msg, stats);
  }

  // `afterError`: keep the error text on screen instead of overwriting it with "stopped"
  function stop(afterError = false) {
    if (stopped) return;
    stopped = true;
    window.removeEventListener("pagehide", onHide);
    cleanup();
    if (!afterError) status("stopped");
  }
  const onHide = () => stop();
  window.addEventListener("pagehide", onHide);   // release the camera and the models if the page is torn down
  function cleanup() {
    for (const t of Object.values(tasks)) { try { t.close(); } catch (e) { /* already closed */ } }
    if (watchdog !== null) clearInterval(watchdog);
    camera.stop();   // releases the camera and stops any pending retry
  }

  modelsReady = true;
  if (camera.state === "running") status("running");
  else if (camera.last) status("error", camera.last.message);   // no camera yet: say so; it keeps trying
  watchdog = setInterval(() => {
    if (stopped || camera.state !== "running" || document.visibilityState !== "visible") return;
    if (performance.now() - lastNewFrameAt > FROZEN_MS) camera.lost();   // a camera can freeze without ever saying it ended
  }, 1000);
  schedule();
  return {
    stop,
    recenter: () => root.recenter(),
    setLegs: (mode) => { filter.legsMode = mode; },
    stats: () => stats,
  };
}

// GPU first (unless forced), CPU when the GPU path cannot be created. The delegate that worked is recorded.
async function build(key, factory, delegate, used, tasks) {
  const order = delegate === "cpu" ? ["CPU"] : delegate === "gpu" ? ["GPU"] : ["GPU", "CPU"];
  let lastErr;
  for (const d of order) {
    try { tasks[key] = await factory(d); used[key] = d; return; } catch (err) { lastErr = err; }
  }
  throw lastErr;
}

// A plain-language account of what the models see right now, so "my hand is not tracked" has a visible reason.
export function diagnose({ face, poseWorld, hands, assigned, solved, poseImage }) {
  const wrist = (i) => (poseImage && poseImage[i] ? Math.round((poseImage[i].visibility ?? 1) * 100) / 100 : null);
  let handHint;
  if (!poseWorld) handHint = "no body seen";
  else if (hands.length === 0) handHint = "no hand seen: raise it into view, palm toward the camera";
  else if (!assigned.left && !assigned.right) handHint = "hand seen, but it is not next to a wrist the body model found";
  else if (!solved.live.leftHand && !solved.live.rightHand) handHint = "hand found, but its arm is not visible enough";
  else handHint = `${(solved.live.leftHand ? 1 : 0) + (solved.live.rightHand ? 1 : 0)} hand(s) tracked`;
  return { face: !!face, pose: !!poseWorld, hands: hands.length, handHint, wrists: [wrist(15), wrist(16)] };
}

function describe(err) {
  if (err && err.name === "NotAllowedError") return "Camera permission was refused.";
  if (err && err.name === "NotFoundError") return "No camera was found.";
  if (err && err.name === "OverconstrainedError") return "That camera is not available. Choose another one.";
  if (err && err.name === "NotReadableError") return "The camera is busy in another app, or it was unplugged.";
  return String((err && err.message) || err).slice(0, 200);
}
