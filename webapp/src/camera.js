// Which camera the browser pages open.
//
// `getUserMedia({ facingMode: "user" })` lets the browser choose, and the browser's choice is often the wrong one:
//   * a virtual camera that another program registered with Windows (measured on the owner's PC: "CALL ME (Windows Virtual
//     Camera)" is listed first, ahead of "HP HD Camera"), including OBS's and realX's own Softcam, which would feed realX its
//     own output;
//   * on laptops with a face-unlock sensor, the infrared camera ("HP IR Camera", Windows Hello): a dark grey picture.
// Original and Tracking use the camera through realX's own program (the first camera Windows lists), so they were fine while
// Photo face and Full body, which use the browser, were not.
//
// Rules, in order:
//   1. A camera the person chose (deviceId) is opened exactly. If it is gone the error is passed on, never replaced silently.
//   2. Otherwise prefer a real camera: if the device names are already known (permission was granted before) open the first one
//      that is neither virtual nor infrared; if they are not known yet, open the browser's default to get permission, and when
//      that turns out to be virtual or infrared, switch to a real one.
//   3. If there is no real camera, or opening it fails, keep what the browser gave: an infrared-only or virtual-only
//      computer still works as before.

const INFRARED = /\b(ir|infrared|windows hello)\b/i;
// names of cameras that are software, not hardware. Matched on whole words so "Iris" or "Mirror cam" are not caught.
const VIRTUAL = /\b(virtual|softcam|obs|unity capture|manycam|xsplit|snap camera|droidcam|epoccam|iriun|ndi|streamlabs|camo|call me)\b/i;

export const isInfraredLabel = (label) => typeof label === "string" && INFRARED.test(label);
export const isVirtualLabel = (label) => typeof label === "string" && VIRTUAL.test(label);
export const isUnwantedLabel = (label) => isInfraredLabel(label) || isVirtualLabel(label);

// A real camera, preferring the one that is already open. Needs device labels, which the browser only reveals once the camera
// permission has been granted; devices without a label are never preferred (their kind is unknown).
export function preferredCamera(devices, currentId = "") {
  const cams = (devices || []).filter((d) => d && d.kind === "videoinput" && d.deviceId && d.label);
  const real = cams.filter((d) => !isUnwantedLabel(d.label));
  return real.find((d) => d.deviceId === currentId) || real[0] || null;
}

const sizeOf = ({ width, height, frameRate }) => ({ width: { ideal: width }, height: { ideal: height }, frameRate: { ideal: frameRate } });

export async function openCameraStream({ deviceId = null, width = 640, height = 480, frameRate = 30, mediaDevices = navigator.mediaDevices } = {}) {
  const size = sizeOf({ width, height, frameRate });
  const open = (constraints) => mediaDevices.getUserMedia({ video: { ...constraints, ...size }, audio: false });
  if (deviceId) return open({ deviceId: { exact: deviceId } });
  // the names are known when the camera permission was granted before: go straight to a real camera, without ever opening the
  // virtual one (opening it would start the other program's device for a moment)
  try {
    const known = preferredCamera(await mediaDevices.enumerateDevices());
    if (known) return await open({ deviceId: { exact: known.deviceId } });
  } catch (e) { /* fall through to the browser's default */ }
  const stream = await open({ facingMode: "user" });
  try {
    const track = stream.getVideoTracks()[0];
    if (!track || !isUnwantedLabel(track.label)) return stream;
    const other = preferredCamera(await mediaDevices.enumerateDevices(), track.getSettings ? track.getSettings().deviceId : "");
    if (!other) return stream;
    let better;
    try {
      better = await open({ deviceId: { exact: other.deviceId } });
    } catch (e) {
      return stream;   // could not open the real camera (busy): what the browser gave still works
    }
    stream.getTracks().forEach((t) => t.stop());
    return better;
  } catch (e) {
    return stream;   // listing devices is a convenience, never a reason to lose the camera
  }
}

// The cameras to offer in the control room: labels cleaned and capped.
export function cameraList(devices) {
  return (devices || []).filter((d) => d && d.kind === "videoinput" && d.deviceId).slice(0, 20).map((d) => ({
    id: String(d.deviceId).slice(0, 256),
    label: String(d.label || "").replace(/[\u0000-\u001f]/g, "").slice(0, 100),
  }));
}
