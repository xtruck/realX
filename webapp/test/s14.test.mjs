// S14a: the neck blends into the live collar (reach, skin-weight guard, soft fade) without painting over live clothes
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { REACH, normalizeReach } from "../src/facemesh/head.js";

const src = readFileSync(new URL("../src/facemesh/compositor.js", import.meta.url), "utf8");

test("the neck reaches further than the old 0.7 but stays inside the sane bound", () => {
  assert.ok(REACH.bottom >= 0.85 && REACH.bottom <= 1.2, `bottom ${REACH.bottom}`);
  assert.equal(normalizeReach().bottom, REACH.bottom);
});

test("collar guard: the photo's alpha is cut where the live pixel below the chin is not skin", () => {
  const re = /alpha \*= 1\.0 - below \* \(1\.0 - smoothstep\(0\.15, 0\.75, liveSkin \/ max\(u_relight, 1e-3\)\)\) \* 0\.9;/;
  assert.match(src, re);
  // the guard must come before the recolour block that can raise alpha again, and must act only below the chin
  assert.ok(src.search(re) < src.indexOf("float a = max(alpha, w);"));
  assert.match(src, /float below = smoothstep\(u_pp\[4\]\.y - 0\.02, u_pp\[4\]\.y \+ 0\.05, v_uv\.y\)/);
});

test("the guard never removes the photo's neck completely (soft remainder) and reuses one blurred read", () => {
  assert.match(src, /\* 0\.9;/);                                   // at most 90% cut: a soft remainder, not a hard hole
  assert.equal((src.match(/skinWeight\(soften\(u_cam/g) || []).length, 1);   // no second blurred read, no extra taps
  assert.doesNotMatch(src, /skinWeight\(cam\)/);
});

test("privacy and cost: the neck block reads nothing back and starts no extra pass", () => {
  const block = src.slice(src.indexOf("float liveSkin"), src.indexOf("gl_FragColor = vec4(colour * alpha, alpha);"));
  assert.ok(block.length > 200);
  assert.doesNotMatch(block, /readPixels|getImageData|framebuffer/i);
  assert.equal((block.match(/texture2D\(/g) || []).length, 0);   // the block adds no texture tap of its own (the one blurred read is the soften() call)
});
