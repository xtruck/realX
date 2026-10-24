// S13a: the neck's skin test must not run on the raw camera pixel (the camera's 8x8 compression blocks showed as a checkerboard)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("the neck skin test runs on a blurred live picture, not the raw pixel", () => {
  const src = readFileSync(new URL("../src/facemesh/compositor.js", import.meta.url), "utf8");
  assert.match(src, /skinWeight\(soften\(u_cam, v_scr, u_rl\)\)/);
  assert.doesNotMatch(src, /skinWeight\(cam\) \* neckX/);
});
