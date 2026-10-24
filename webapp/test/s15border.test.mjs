// S15: the body puppet fades out where the photo itself ends, so a photo cropped at the chest does not leave a straight cut
// across the live clothes. Source checks of the shader (it was run in a browser only with a fake camera, on a software renderer).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/facemesh/compositor.js", import.meta.url), "utf8");
const join = src.slice(src.indexOf("if (u_join > 0.0) {"), src.indexOf("// ---- end S14 join ----"));
const FADE = /a \*= smoothstep\(0\.0, max\(([0-9.]+) \* u_join, 0\.0001\), bd\);/;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

test("the border fade lives inside the join block, so join 0 keeps exactly the old picture", () => {
  assert.ok(join.length > 400);
  assert.match(join, FADE);
  assert.match(join, /float bd = min\(min\(v_uv\.x, 1\.0 - v_uv\.x\), 1\.0 - v_uv\.y\);/);
  assert.equal(src.split("float bd = ").length - 1, 1, "only the body's join block has it");
});

test("it fades to nothing at the photo's bottom and side edges, and is full inside the band", () => {
  const width = Number(join.match(FADE)[1]);
  assert.ok(width >= 0.08 && width <= 0.2, `band ${width}`);
  const w = width * 0.7;                                   // the default bodyJoin
  assert.equal(smooth(0, w, 0), 0);                        // exactly at the photo's edge: nothing drawn
  assert.ok(smooth(0, w, w / 2) > 0.4 && smooth(0, w, w / 2) < 0.6);
  assert.equal(smooth(0, w, w), 1);                        // at the band's inner end: full
  assert.equal(smooth(0, w, 0.5), 1);                      // the middle of the photo is untouched
  assert.equal(smooth(0, Math.max(width * 0, 0.0001), 0.0001), 1);   // join near 0: the band is almost nothing, no division by zero
});

test("the top of the photo is not faded (the head takes over there) and the rule uses no new texture tap or read-back", () => {
  // sides and bottom only: the plain top edge (v_uv.y itself, not 1.0 - v_uv.y) is not in the expression
  assert.equal(join.match(/float bd = [^;]+;/)[0], "float bd = min(min(v_uv.x, 1.0 - v_uv.x), 1.0 - v_uv.y);");
  const added = join.slice(join.indexOf("// 1b."), join.indexOf("// 2. neck line"));
  assert.ok(added.length > 100);
  assert.equal((added.match(/texture2D\(/g) || []).length, 0);
  assert.doesNotMatch(added, /readPixels|getImageData|toDataURL|framebuffer/i);
});
