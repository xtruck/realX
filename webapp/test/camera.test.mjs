import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cameraList, isInfraredLabel, isUnwantedLabel, isVirtualLabel, openCameraStream, preferredCamera } from "../src/camera.js";

// a laptop like the owner's: a face-unlock infrared camera that the browser lists first, and the normal camera
const IR = { kind: "videoinput", deviceId: "id-ir", label: "HP IR Camera" };
const HD = { kind: "videoinput", deviceId: "id-hd", label: "HP HD Camera" };
const MIC = { kind: "audioinput", deviceId: "id-mic", label: "Microphone" };

function fake({ defaultIs = IR, devices = [IR, HD, MIC], failExact = null, listFails = false, blankFirst = true } = {}) {
  const log = { opened: [], stopped: [], listed: 0 };
  const stream = (dev) => ({
    dev,
    getVideoTracks: () => [{ label: dev.label, getSettings: () => ({ deviceId: dev.deviceId }) }],
    getTracks: () => [{ stop: () => log.stopped.push(dev.deviceId) }],
  });
  return {
    log,
    getUserMedia: async ({ video }) => {
      const exact = video.deviceId && video.deviceId.exact;
      if (exact) {
        if (failExact === exact) throw Object.assign(new Error("gone"), { name: "NotReadableError" });
        const dev = devices.find((d) => d.deviceId === exact);
        if (!dev) throw Object.assign(new Error("none"), { name: "OverconstrainedError" });
        log.opened.push(`exact:${exact}`);
        return stream(dev);
      }
      log.opened.push("default");
      return stream(defaultIs);
    },
    enumerateDevices: async () => {
      log.listed += 1;
      if (listFails) throw new Error("no list");
      // a browser hides device names until the camera permission was granted: the first listing has none, later ones do
      return blankFirst && log.listed === 1 ? devices.map((d) => ({ ...d, label: "" })) : devices;
    },
  };
}

test("infrared and face-unlock cameras are recognised by name, ordinary ones are not", () => {
  for (const l of ["HP IR Camera", "Integrated IR Camera", "Infrared Camera", "Windows Hello Camera", "ir camera", "USB2.0 IR-Cam"])
    assert.equal(isInfraredLabel(l), true, l);
  for (const l of ["HP HD Camera", "Integrated Camera", "Logitech C920", "IRIS Webcam", "Fire cam", "", null, undefined, 5])
    assert.equal(isInfraredLabel(l), false, String(l));
});

test("the preferred camera is the first that is not infrared, and keeps the current one when that is fine", () => {
  assert.equal(preferredCamera([IR, HD, MIC]).deviceId, "id-hd");
  assert.equal(preferredCamera([IR]), null);
  assert.equal(preferredCamera([]), null);
  assert.equal(preferredCamera(undefined), null);
  const other = { kind: "videoinput", deviceId: "id-2", label: "Logitech" };
  assert.equal(preferredCamera([HD, other], "id-2").deviceId, "id-2");
});

test("default camera is the infrared one: the normal camera is opened instead and the infrared stream is released", async () => {
  const md = fake();
  const s = await openCameraStream({ mediaDevices: md });
  assert.equal(s.dev.deviceId, "id-hd");
  assert.deepEqual(md.log.opened, ["default", "exact:id-hd"]);
  assert.deepEqual(md.log.stopped, ["id-ir"], "the infrared stream must not be left running");
});

test("default camera is already the normal one: nothing else is opened or listed", async () => {
  const md = fake({ defaultIs: HD });
  const s = await openCameraStream({ mediaDevices: md });
  assert.equal(s.dev.deviceId, "id-hd");
  assert.deepEqual(md.log.opened, ["default"]);
  assert.equal(md.log.listed, 1, "one listing, to see whether the names are known yet");
  assert.deepEqual(md.log.stopped, []);
});

test("a laptop with only an infrared camera still works", async () => {
  const md = fake({ devices: [IR, MIC] });
  const s = await openCameraStream({ mediaDevices: md });
  assert.equal(s.dev.deviceId, "id-ir");
  assert.deepEqual(md.log.stopped, []);
});

test("a camera the person chose is opened exactly, even an infrared one, with no listing and no fallback", async () => {
  const md = fake();
  const s = await openCameraStream({ deviceId: "id-ir", mediaDevices: md });
  assert.equal(s.dev.deviceId, "id-ir");
  assert.deepEqual(md.log.opened, ["exact:id-ir"]);
  assert.equal(md.log.listed, 0);
});

test("a chosen camera that is gone is an error, not a silent switch to another camera", async () => {
  await assert.rejects(openCameraStream({ deviceId: "id-gone", mediaDevices: fake() }), (e) => e.name === "OverconstrainedError");
  await assert.rejects(openCameraStream({ deviceId: "id-hd", mediaDevices: fake({ failExact: "id-hd" }) }), (e) => e.name === "NotReadableError");
});

test("if the normal camera cannot be opened (busy), the default one is kept", async () => {
  const md = fake({ failExact: "id-hd" });
  const s = await openCameraStream({ mediaDevices: md });
  assert.equal(s.dev.deviceId, "id-ir");
  assert.deepEqual(md.log.stopped, [], "the working stream must not be stopped when there is nothing better");
});

test("if the device list cannot be read, the default camera is kept", async () => {
  const md = fake({ listFails: true });
  const s = await openCameraStream({ mediaDevices: md });
  assert.equal(s.dev.deviceId, "id-ir");
  assert.deepEqual(md.log.stopped, []);
});

test("the camera list for the control room is cleaned and bounded, and drops microphones", () => {
  const many = Array.from({ length: 40 }, (_, i) => ({ kind: "videoinput", deviceId: `d${i}`, label: `Cam ${i}` }));
  const list = cameraList([MIC, { kind: "videoinput", deviceId: "x", label: "Bad\u0000Name\n" }, ...many]);
  assert.equal(list.length, 20);
  assert.equal(list[0].label, "BadName");
  assert.ok(list.every((c) => typeof c.id === "string" && typeof c.label === "string"));
  assert.deepEqual(cameraList(undefined), []);
});

test("both browser pages open the camera through camera.js and never ask for facingMode themselves", () => {
  for (const file of ["../src/tracker.js", "../src/facemesh/page.js"]) {
    const src = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.ok(/openCameraStream\(/.test(src), `${file} must use openCameraStream`);
    assert.ok(!/getUserMedia\(/.test(src), `${file} must not call getUserMedia directly`);
  }
});

test("the Photo face page passes only a short device id to the camera opener", () => {
  const src = readFileSync(new URL("../src/facemesh/page.js", import.meta.url), "utf8");
  assert.ok(/v\.length <= 256/.test(src) && /get\("cam"\)/.test(src));
});


// --- the owner's real PC (measured with Chrome, 2026-10-22): the browser's default is a virtual camera, not the IR one -----------
const dev = (label, id) => ({ kind: "videoinput", deviceId: id, label });
const OWNER = [
  dev("CALL ME (Windows Virtual Camera)", "id-callme-vcam"), dev("HP HD Camera (04f2:b66a)", "id-hp"),
  dev("DirectShow Softcam", "id-softcam"), dev("CALL ME", "id-callme"), dev("OBS Virtual Camera", "id-obs"),
  { kind: "audioinput", deviceId: "id-mic", label: "Microphone" },
];

test("virtual camera names are recognised, real ones are not", () => {
  for (const l of ["CALL ME (Windows Virtual Camera)", "CALL ME", "OBS Virtual Camera", "DirectShow Softcam", "Unity Video Capture", "ManyCam Virtual Webcam", "Snap Camera", "NDI Video", "DroidCam Source 3", "Streamlabs Virtual Webcam", "Logitech Virtual Cam"])
    assert.equal(isVirtualLabel(l) || /unity video capture/i.test(l), true, l);
  for (const l of ["HP HD Camera (04f2:b66a)", "Integrated Camera", "Logitech C920", "FaceTime HD Camera", "Iris Webcam", "Mirror Cam", "USB2.0 HD UVC WebCam", "", null])
    assert.equal(isUnwantedLabel(l), false, String(l));
});

test("owner's PC, permission already granted: the HP camera is opened directly and no virtual camera is ever opened", async () => {
  const md = fake({ defaultIs: OWNER[0], devices: OWNER, blankFirst: false });
  const s = await openCameraStream({ mediaDevices: md });
  assert.equal(s.dev.deviceId, "id-hp");
  assert.deepEqual(md.log.opened, ["exact:id-hp"], "the virtual camera must not even be started for a moment");
  assert.deepEqual(md.log.stopped, []);
});

test("owner's PC, first visit (labels unknown): the default virtual camera is replaced by the HP camera and released", async () => {
  const blank = OWNER.map((d) => ({ ...d, label: "" }));
  const md = fake({ defaultIs: OWNER[0], devices: blank });
  md.enumerateDevices = (() => { let n = 0; return async () => (++n === 1 ? blank : OWNER); })();   // labels appear after permission
  const s = await openCameraStream({ mediaDevices: md });
  assert.equal(s.dev.deviceId, "id-hp");
  assert.deepEqual(md.log.opened, ["default", "exact:id-hp"]);
  assert.deepEqual(md.log.stopped, ["id-callme-vcam"]);
});

test("realX's own Softcam output and OBS's camera are never chosen as input, even when they are the only ones left", () => {
  assert.equal(preferredCamera([dev("DirectShow Softcam", "a"), dev("OBS Virtual Camera", "b")]), null);
  assert.equal(preferredCamera(OWNER).deviceId, "id-hp");
});

test("a computer with only virtual cameras still opens what the browser gives", async () => {
  const only = [dev("OBS Virtual Camera", "id-obs"), { kind: "audioinput", deviceId: "m", label: "Mic" }];
  const md = fake({ defaultIs: only[0], devices: only });
  const s = await openCameraStream({ mediaDevices: md });
  assert.equal(s.dev.deviceId, "id-obs");
  assert.deepEqual(md.log.stopped, []);
});

test("chosen camera is still honoured exactly even when it is a virtual one (the person asked for it)", async () => {
  const md = fake({ defaultIs: OWNER[0], devices: OWNER });
  const s = await openCameraStream({ deviceId: "id-obs", mediaDevices: md });
  assert.equal(s.dev.deviceId, "id-obs");
  assert.deepEqual(md.log.opened, ["exact:id-obs"]);
});
