// ONNX Runtime Web with a WebGPU backend and an automatic fallback to WebAssembly (CPU).
//
//   const { session, backend } = await createInference(modelBytes);   // backend: "webgpu" | "wasm"
//   const out = await runInference(session, { input: new ort.Tensor("float32", data, [1, 4]) });
//
// Every backend is tried on its own, so `backend` says what actually runs (ORT itself does not report which
// provider of a list it picked). Nothing here touches the network by itself: the model arrives as bytes you
// already hold, and the runtime's .wasm files load from `wasmPaths`, which must be a same-origin URL because the
// control room's Content-Security-Policy allows nothing else. Not yet used by the avatar page. The page that
// uses it needs script-src 'wasm-unsafe-eval' (the avatar page has it; the control room and dock do not).

export const BACKENDS = ["webgpu", "wasm"];
export const DEFAULT_WASM_PATHS = "/ort/";   // served by realx/server.py from this origin (see _ORT_NAME there)

/** True when this browser exposes WebGPU (it still may fail to give an adapter; createInference handles that). */
export function webgpuAvailable(nav = globalThis.navigator) {
  return !!nav && typeof nav === "object" && !!nav.gpu;
}

/** The backends to try, best first. WebGPU only when the browser has it; WASM is always the last resort. */
export function backendOrder({ prefer = BACKENDS, nav = globalThis.navigator } = {}) {
  const wanted = prefer.filter((b) => BACKENDS.includes(b));
  const order = wanted.filter((b) => b !== "webgpu" || webgpuAvailable(nav));
  if (!order.includes("wasm")) order.push("wasm");
  return order;
}

async function loadOrt(importer) {
  const ort = await importer();
  return ort && ort.InferenceSession ? ort : ort && ort.default;
}

/**
 * modelBytes   Uint8Array (or ArrayBuffer) of an .onnx file
 * prefer       backend order, default ["webgpu", "wasm"]
 * wasmPaths    URL prefix (same origin) for the runtime's files; default "/ort/", which the realX server serves
 * ort          an onnxruntime-web module (tests pass a fake); default: imported on first use
 * onFallback   (backend, error) called each time a backend fails, before the next is tried
 * Returns { session, backend, ort, tried }. Throws when even WASM cannot create the session.
 */
export async function createInference(modelBytes, { prefer = BACKENDS, wasmPaths = DEFAULT_WASM_PATHS, ort = null, nav = globalThis.navigator, onFallback = () => {}, options = {} } = {}) {
  if (!modelBytes || !(modelBytes.byteLength > 0)) throw new Error("No model was given.");
  const bytes = modelBytes instanceof Uint8Array ? modelBytes : new Uint8Array(modelBytes);
  const runtime = ort || (await loadOrt(() => import("onnxruntime-web/webgpu")))   // the build with both the WebGPU and the WASM backends;
  if (!runtime || !runtime.InferenceSession) throw new Error("onnxruntime-web could not be loaded.");
  if (wasmPaths && runtime.env && runtime.env.wasm) runtime.env.wasm.wasmPaths = wasmPaths;

  const tried = [];
  let last = null;
  for (const backend of backendOrder({ prefer, nav })) {
    try {
      const session = await runtime.InferenceSession.create(bytes, { ...options, executionProviders: [backend] });
      return { session, backend, ort: runtime, tried };
    } catch (err) {
      last = err;
      tried.push({ backend, error: String((err && err.message) || err).slice(0, 200) });
      onFallback(backend, err);
    }
  }
  throw new Error(`No ONNX backend could start: ${tried.map((t) => `${t.backend} (${t.error})`).join("; ")}`, { cause: last });
}

/** Runs the session on named tensors and returns the output tensors by name. */
export async function runInference(session, feeds) {
  if (!session || typeof session.run !== "function") throw new Error("No session.");
  for (const name of session.inputNames || []) {
    if (!(feeds && name in feeds)) throw new Error(`Missing input tensor: ${name}`);
  }
  return session.run(feeds);
}

/** Frees the session's memory (GPU buffers included). Safe to call twice. */
export async function releaseInference(session) {
  if (session && typeof session.release === "function") { try { await session.release(); } catch (e) { /* already gone */ } }
}
