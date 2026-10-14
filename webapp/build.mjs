// Bundles the renderer and its two dependencies (three, @pixiv/three-vrm; both MIT)
// into one file the local server can serve under a strict Content-Security-Policy.
import { build } from "esbuild";

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
