import test from "node:test";
import assert from "node:assert/strict";
import * as ort from "onnxruntime-web";
import { backendOrder, createInference, releaseInference, runInference, webgpuAvailable } from "../src/utils/onnxInference.js";

// --- a tiny valid ONNX file, written by hand: Y = X + X over float[1,4] ---
const varint = (n) => { const o = []; while (n > 127) { o.push((n & 127) | 128); n >>>= 7; } o.push(n); return o; };
const field = (no, wire, payload) => [...varint((no << 3) | wire), ...payload];
const bytes = (no, data) => { const b = typeof data === "string" ? [...Buffer.from(data)] : data; return field(no, 2, [...varint(b.length), ...b]); };
const int = (no, v) => field(no, 0, varint(v));
const valueInfo = (name) => bytes(1, name).concat(bytes(2, bytes(1, [...int(1, 1), ...bytes(2, bytes(1, int(1, 1))), ...bytes(2, bytes(1, int(1, 4)))])));
function addModel() {
  const node = [...bytes(1, "X"), ...bytes(1, "X"), ...bytes(2, "Y"), ...bytes(4, "Add")];
  const graph = [...bytes(1, node), ...bytes(2, "g"), ...bytes(11, valueInfo("X")), ...bytes(12, valueInfo("Y"))];
  return Uint8Array.from([...int(1, 8), ...bytes(8, int(2, 13)), ...bytes(7, graph)]);
}

test("backend order: WebGPU first only when the browser has it; WASM always last", () => {
  assert.equal(webgpuAvailable({ gpu: {} }), true);
  assert.equal(webgpuAvailable({}), false);
  assert.equal(webgpuAvailable(undefined), false);
  assert.deepEqual(backendOrder({ nav: { gpu: {} } }), ["webgpu", "wasm"]);
  assert.deepEqual(backendOrder({ nav: {} }), ["wasm"]);
  assert.deepEqual(backendOrder({ prefer: ["webgpu"], nav: { gpu: {} } }), ["webgpu", "wasm"]);
  assert.deepEqual(backendOrder({ prefer: ["junk"], nav: {} }), ["wasm"]);
});

test("a real session is created and a test tensor goes through (WASM backend)", async () => {
  ort.env.wasm.numThreads = 1;
  const { session, backend } = await createInference(addModel(), { ort, nav: {}, wasmPaths: null })   // Node finds the runtime next to the package; "/ort/" is for the browser;
  assert.equal(backend, "wasm");
  assert.deepEqual(session.inputNames, ["X"]);
  const out = await runInference(session, { X: new ort.Tensor("float32", Float32Array.from([1, 2, 3, 4]), [1, 4]) });
  assert.deepEqual([...out.Y.data], [2, 4, 6, 8]);
  assert.deepEqual(out.Y.dims, [1, 4]);
  await releaseInference(session);
  await releaseInference(session);   // twice is fine
});

test("WebGPU is tried first and a failure falls back to WASM, with the reason reported", async () => {
  const log = [], fell = [];
  const fake = { InferenceSession: { create: async (b, o) => { log.push(o.executionProviders[0]); if (o.executionProviders[0] === "webgpu") throw new Error("no adapter"); return { inputNames: [], run: async () => ({}) }; } } };
  const r = await createInference(Uint8Array.of(1, 2, 3), { ort: fake, nav: { gpu: {} }, onFallback: (b, e) => fell.push([b, e.message]) });
  assert.deepEqual(log, ["webgpu", "wasm"]);
  assert.equal(r.backend, "wasm");
  assert.deepEqual(fell, [["webgpu", "no adapter"]]);
  assert.equal(r.tried[0].backend, "webgpu");
});
test("when WebGPU works it is used and WASM is never touched", async () => {
  const log = [];
  const fake = { InferenceSession: { create: async (b, o) => { log.push(o.executionProviders[0]); return {}; } } };
  assert.equal((await createInference(Uint8Array.of(1), { ort: fake, nav: { gpu: {} } })).backend, "webgpu");
  assert.deepEqual(log, ["webgpu"]);
});
test("if every backend fails the error names them all", async () => {
  const fake = { InferenceSession: { create: async (b, o) => { throw new Error(`${o.executionProviders[0]} broke`); } } };
  await assert.rejects(createInference(Uint8Array.of(1), { ort: fake, nav: { gpu: {} } }), /webgpu \(webgpu broke\); wasm \(wasm broke\)/);
});
test("bad input is refused early; wasmPaths is applied; inputs are checked", async () => {
  await assert.rejects(createInference(new Uint8Array(0), { ort }), /No model/);
  await assert.rejects(createInference(null, { ort }), /No model/);
  const fake = { env: { wasm: {} }, InferenceSession: { create: async () => ({ inputNames: ["X"], run: async (f) => f }) } };
  const r = await createInference(new ArrayBuffer(4), { ort: fake, nav: {}, wasmPaths: "/ort/" });
  assert.equal(fake.env.wasm.wasmPaths, "/ort/");
  await assert.rejects(runInference(r.session, {}), /Missing input tensor: X/);
  await assert.rejects(runInference(null, {}), /No session/);
});

test("the runtime is looked up on this origin by default", async () => {
  const { DEFAULT_WASM_PATHS } = await import("../src/utils/onnxInference.js");
  assert.equal(DEFAULT_WASM_PATHS, "/ort/");
  const fake = { env: { wasm: {} }, InferenceSession: { create: async () => ({}) } };
  await createInference(Uint8Array.of(1), { ort: fake, nav: {} });
  assert.equal(fake.env.wasm.wasmPaths, "/ort/");
});
