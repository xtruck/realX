// Bundles the renderer and its two dependencies (three, @pixiv/three-vrm; both MIT)
// into one file the local server can serve under a strict Content-Security-Policy.
import { build } from "esbuild";
import { copyFileSync } from "node:fs";

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

// The OBS dock: a small script plus its page and styles, served by the local server next to the avatar page.
await build({
  entryPoints: ["src/dock/dock.js"],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["chrome110", "firefox110", "safari16"],
  legalComments: "none",
  outfile: "../src/realx/web/dock.js",
  logLevel: "info",
});
copyFileSync("src/dock/dock.html", "../src/realx/web/dock.html");
copyFileSync("src/dock/dock.css", "../src/realx/web/dock.css");
