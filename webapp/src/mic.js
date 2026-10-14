// Microphone -> loudness and spectrum numbers, inside this page.
//
// Privacy rules (checked by tests/test_speech_privacy.py):
//  * the sound is analysed, never played: no node is connected to the speakers
//  * samples are never recorded, copied out of the page or sent anywhere
//  * nothing is stored; stop() releases the microphone and closes the audio context
// The browser does the noise suppression, echo cancellation and gain control (getUserMedia constraints).

/**
 * deviceId     a microphone id from enumerateDevices(), or omitted for the default one
 * onFeatures   ({ levelDb, freqDb, sampleRate, fftSize, t }) every intervalMs. `freqDb` is a reused buffer:
 *              valid during the call only
 * Returns { stop(), latencyMs, label }. Throws an Error with a plain message when the microphone cannot be used.
 */
export async function startMic({ deviceId, onFeatures, intervalMs = 20 } = {}) {
  const devices = globalThis.navigator && globalThis.navigator.mediaDevices;
  if (!devices || typeof devices.getUserMedia !== "function") throw new Error("Microphone access is not available in this browser.");

  const audio = { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 };
  if (deviceId) audio.deviceId = { exact: deviceId };
  let stream;
  try {
    stream = await devices.getUserMedia({ audio, video: false });
  } catch (err) {
    throw new Error(describe(err));
  }

  let ctx = null, timer = null, stopped = false;
  const release = () => {
    if (timer !== null) { clearInterval(timer); timer = null; }
    stream.getTracks().forEach((t) => t.stop());
    if (ctx) { try { Promise.resolve(ctx.close()).catch(() => {}); } catch (e) { /* already closed */ } }
  };

  let analyser;
  try {
    const Context = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    ctx = new Context();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0;        // raw frames; smoothing is the mouth logic's job
    ctx.createMediaStreamSource(stream).connect(analyser);
    if (ctx.state === "suspended" && typeof ctx.resume === "function") ctx.resume().catch(() => {});
  } catch (err) {
    release();
    throw new Error(describe(err));
  }

  const time = new Float32Array(analyser.fftSize);
  const freq = new Float32Array(analyser.frequencyBinCount);
  const tick = () => {
    analyser.getFloatTimeDomainData(time);
    analyser.getFloatFrequencyData(freq);
    let sum = 0;
    for (let i = 0; i < time.length; i++) sum += time[i] * time[i];
    const rms = Math.sqrt(sum / time.length);
    const levelDb = rms > 1e-5 ? 20 * Math.log10(rms) : -100;
    try {
      onFeatures({ levelDb, freqDb: freq, sampleRate: ctx.sampleRate, fftSize: analyser.fftSize, t: performance.now() });
    } catch (e) { /* a bug in the consumer must not stop the microphone loop */ }
  };
  timer = setInterval(tick, intervalMs);

  const onHide = () => stop();
  function stop() {
    if (stopped) return;
    stopped = true;
    if (globalThis.window && typeof window.removeEventListener === "function") window.removeEventListener("pagehide", onHide);
    release();
  }
  if (globalThis.window && typeof window.addEventListener === "function") window.addEventListener("pagehide", onHide);

  const track = stream.getAudioTracks ? stream.getAudioTracks()[0] : null;
  return {
    stop,
    label: (track && track.label) || "",
    // how long a sound takes to show up in the numbers: the audio system's own delay plus the analysis window
    latencyMs: (ctx.baseLatency || 0) * 1000 + (analyser.fftSize / ctx.sampleRate) * 1000,
  };
}

function describe(err) {
  const name = err && err.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "Microphone permission was refused.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No microphone was found.";
  if (name === "NotReadableError") return "The microphone is in use by another app.";
  return String((err && err.message) || err).slice(0, 200);
}
