// Face-mesh prototype (step S1): the camera, MediaPipe's face landmarker, and the 468-point mesh drawn as a wireframe
// over the live picture. It answers two questions before anything is built on top: does the mesh follow the face
// without lag, and how much of the frame budget does face tracking alone take.
//
// Privacy rule, same as the tracker: the camera picture is shown by a <video> and handed to MediaPipe. It is never
// drawn to a canvas, read back, recorded, stored or sent; only numbers (landmarks) are drawn on top.
// facemesh.test.mjs checks this file for the calls that would break that.
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { MeshCompositor } from "./compositor.js";
import { RollingStats, buildMesh, checkPhotoFaces, faceBox, fillSegments } from "./mesh.js";

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
const look = { match: 100, keep: true };   // colour match in percent; keep the live eyes and mouth
probe.match = look.match; probe.keep = look.keep;
function applyLook() {
  probe.match = look.match; probe.keep = look.keep;
  if (compositor) compositor.setLook({ match: look.match / 100, keep: look.keep });
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

// The photo: chosen by the user, shown only in this page (never uploaded, never stored), read by a second, short-lived
// face model that tells where the face is in it. The photo must be of the person using this page.
async function usePhoto(file) {
  probe.photo = "loading";
  $("badge").hidden = true;
  const url = URL.createObjectURL(file);
  let finder = null;
  try {
    setStatus("Reading the photo...");
    const image = new Image();
    image.src = url;
    await image.decode();
    finder = await openLandmarker("IMAGE", 2);
    const faces = finder.detect(image).faceLandmarks || [];
    const verdict = checkPhotoFaces(faces);
    if (!verdict.ok) throw new Error(verdict.reason);
    if (!compositor) compositor = new MeshCompositor(faceCanvas, mesh);
    compositor.setPhoto(image, faces[0]);
    applyLook();
    probe.photo = "ready";
    view.wire = false; $("wire").setAttribute("aria-pressed", "false");
    $("badge").hidden = false;
    setStatus("Photo ready: it is drawn on your live face.");
  } catch (err) {
    probe.photo = "error";
    if (compositor) compositor.clearPhoto();
    setStatus(`This photo cannot be used: ${err && err.message ? err.message : err}`);
  } finally {
    if (finder) { try { finder.close(); } catch (e) { /* already closed */ } }
    URL.revokeObjectURL(url);
  }
}

function dropPhoto() {
  if (compositor) compositor.clearPhoto();
  probe.photo = "none"; probe.drawn = 0;
  $("badge").hidden = true;
  $("photoFile").value = "";
  setStatus("Photo removed.");
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

function frame() {
  if (stopped) return;
  if (video.readyState >= 2 && video.videoWidth > 0 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const now = performance.now();
    lastTs = Math.max(lastTs + 1, now);            // MediaPipe wants strictly increasing timestamps
    const took0 = performance.now();
    let landmarks = null;
    try {
      const result = landmarker.detectForVideo(video, lastTs);
      landmarks = result.faceLandmarks && result.faceLandmarks[0] ? result.faceLandmarks[0] : null;
    } catch (err) { setStatus(`Tracking error: ${err.message}`); }
    const took = performance.now() - took0;
    detectMs = detectMs ? 0.8 * detectMs + 0.2 * took : took;
    stats.mark(now, landmarks !== null);
    probe.frames++; probe.found += landmarks ? 1 : 0; probe.detectMs = detectMs;
    if (landmarks) probe.box = faceBox(landmarks);   // where the face is, as fractions of the frame: four numbers
    if (measure) { measure.ms.push(took); measure.found += landmarks ? 1 : 0; measure.times.push(now); }
    draw(landmarks);
    if (compositor && compositor.hasPhoto) {
      if (faceCanvas.width !== video.videoWidth || faceCanvas.height !== video.videoHeight) {
        faceCanvas.width = video.videoWidth; faceCanvas.height = video.videoHeight;
      }
      probe.drawn = compositor.draw(landmarks, video);   // the video goes to the graphics card for colour matching only: see compositor.js
    }
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
  const gate = $("gate");
  if (!r.fps) { gate.textContent = "measuring"; gate.className = ""; }
  else if (r.fps >= GATE_FPS) { gate.textContent = `${GATE_FPS} fps gate: OK`; gate.className = "ok"; }
  else { gate.textContent = `${GATE_FPS} fps gate: not met`; gate.className = "bad"; }
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
  $("photoFile").addEventListener("change", (e) => { const f = e.target.files && e.target.files[0]; if (f) usePhoto(f); });
  $("photoClear").addEventListener("click", dropPhoto);
  $("match").addEventListener("input", (e) => { look.match = Number(e.target.value); $("matchValue").textContent = `${look.match}%`; applyLook(); });
  $("keepFace").addEventListener("click", (e) => {
    look.keep = !look.keep; e.currentTarget.setAttribute("aria-pressed", String(look.keep)); applyLook();
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
    stream.getTracks().forEach((t) => t.stop());
  });
  schedule();
}

main();
