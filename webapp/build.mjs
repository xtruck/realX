// Bundles the renderer and its two dependencies (three, @pixiv/three-vrm; both MIT)
// into one file the local server can serve under a strict Content-Security-Policy.
import { build } from "esbuild";
import { copyFileSync, mkdirSync } from "node:fs";

await build({
  entryPoints: ["src/avatar.js"],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["chrome110", "firefox110", "safari16"],
  legalComments: "none",
  outfile: "../src/realx/web/avatar.bundle.js",
  logLevel: "info",
});

// onnxruntime-web's runtime (the all-in-one "jsep" build, which runs WebGPU and WebAssembly), copied from the
// installed package so a version bump is one `npm run build` away. Served from /ort/ by the local server.
mkdirSync("../src/realx/web/ort", { recursive: true });
for (const f of ["ort-wasm-simd-threaded.jsep.mjs", "ort-wasm-simd-threaded.jsep.wasm"]) {
  copyFileSync(`node_modules/onnxruntime-web/dist/${f}`, `../src/realx/web/ort/${f}`);
}
