// S13b: the photo looks filmed by the live webcam (blur, grain and grade match), measured in the shader only.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MeshCompositor, lookStrength } from "../src/facemesh/compositor.js";

const src = readFileSync(new URL("../src/facemesh/compositor.js", import.meta.url), "utf8");
const start = src.indexOf("// ---- S13b");
const end = src.indexOf("// ---- end S13b");
const block = src.slice(start, end);

test("the S13b block is small and clearly delimited", () => {
  assert.ok(start > 0 && end > start);
  assert.ok(block.split("\n").length < 45, "a small block");
});

test("lookStrength clamps and rejects junk", () => {
  assert.equal(lookStrength(0.6), 0.6);
  assert.equal(lookStrength(-1), 0);
  assert.equal(lookStrength(7), 1);
  assert.equal(lookStrength("x"), 0);
  assert.equal(lookStrength(NaN), 0);
  assert.equal(lookStrength(undefined), 0);
});

test("the compositor defaults to 60% and setWebcamLook clamps", () => {
  const c = Object.create(MeshCompositor.prototype);
  c.setWebcamLook(2); assert.equal(c.webcamLook, 1);
  c.setWebcamLook(0); assert.equal(c.webcamLook, 0);
  assert.match(src, /this\.webcamLook = 0\.6;/);
});

test("the shader measures on the GPU: blur, grain, grade, all gated", () => {
  assert.match(block, /1\. blur/); assert.match(block, /2\. grain/); assert.match(block, /3\. grade/);
  assert.match(block, /u_camTexel/);
  assert.match(block, /u_seed/);                                  // temporally varying
  assert.match(block, /u_cam, u_lp\[2\]/);                        // measured on the live cheeks
  assert.match(block, /clamp\(liveHf \/ max\(photoHf/);           // the sharpness ratio is clamped
  assert.match(block, /0\.96, 1\.04/); assert.match(block, /0\.88, 1\.12/);   // the grade nudge is clamped
  assert.match(block, /smoothstep\(0\.4, 0\.95, y\)/);            // luminance weighted
  assert.match(src, /if \(u_webcam > 0\.0 && u_match > 0\.0\) colour = webcamLook\(colour, step\(0\.002, smoothstep\(0\.0, 1\.0, v_fade\) \* u_opacity \* head\)\)/);   // never where alpha is 0
  assert.match(block, /float k = u_webcam \* visible/);           // 0% is exactly the old picture
});

test("the block never reads camera pixels back to JavaScript", () => {
  for (const bad of ["readPixels", "getImageData", "toDataURL", "drawImage", "createImageBitmap"]) assert.ok(!block.includes(bad), bad);
  const at = src.indexOf("this.frameNo = (this.frameNo");
  assert.ok(!/readPixels|getImageData/.test(src.slice(at, at + 600)));
});

test("the page has the slider, labelled, default 60%, wired to the compositor", () => {
  const html = readFileSync(new URL("../src/facemesh/facemesh.html", import.meta.url), "utf8");
  assert.match(html, /<label>Match the webcam's look <input id="webcamLook" type="range" min="0" max="100" value="60"/);
  assert.match(html, /id="webcamLookValue">60%/);
  assert.match(html, /id="webcamLookNote"/);
  const page = readFileSync(new URL("../src/facemesh/page.js", import.meta.url), "utf8").replace(/\/\/.*$/gm, "");
  assert.match(page, /compositor\.setWebcamLook\(Number\(e\.currentTarget\.value\) \/ 100\)/);
});
