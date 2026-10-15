import test from "node:test";
import assert from "node:assert/strict";
import { DynamicLighting, MIN_INTENSITY, averageColor, intensityOf, lerp, luminance, makeCanvasSampler, smoothing, tintOf } from "../src/utils/dynamicLighting.js";

const px = (...rgba) => Uint8ClampedArray.from(rgba.flat());
const near = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) <= e, `${a} != ${b}`);
const light = (intensity = 1) => ({ intensity, color: { r: 1, g: 1, b: 1, setRGB(r, g, b) { Object.assign(this, { r, g, b }); } } });

test("average colour of a few pixels", () => {
  const c = averageColor(px([255, 0, 0, 255], [0, 0, 255, 255]));
  near(c.r, 0.5); near(c.g, 0); near(c.b, 0.5);
});
test("transparent pixels are ignored and alpha weights the rest", () => {
  const c = averageColor(px([255, 0, 0, 255], [0, 255, 0, 0]));
  near(c.r, 1); near(c.g, 0);
  assert.equal(averageColor(px([10, 10, 10, 0])), null);
  assert.equal(averageColor(new Uint8ClampedArray(0)), null);
});
test("luminance: white 1, black 0, green brighter than blue", () => {
  near(luminance(1, 1, 1), 1); near(luminance(0, 0, 0), 0);
  assert.ok(luminance(0, 1, 0) > luminance(0, 0, 1));
});
test("intensity follows brightness but never drops under 0.2", () => {
  near(intensityOf(0), MIN_INTENSITY);
  assert.ok(intensityOf(0.5) > intensityOf(0.1));
  assert.ok(intensityOf(-5) >= 0.2 && intensityOf(9) <= 1.2);
});
test("tint pulls the colour toward white", () => {
  const t = tintOf({ r: 1, g: 0, b: 0 });
  near(t.r, 1); near(t.g, 0.5); near(t.b, 0.5);
});
test("lerp and smoothing", () => {
  near(lerp(0, 10, 0.25), 2.5);
  near(smoothing(0, 1), 0);
  assert.ok(smoothing(10, 1) > 0.99);
  assert.ok(smoothing(0.1, 1) < smoothing(0.5, 1));
});

test("the light moves smoothly toward a dark red picture and stays above the minimum", () => {
  const ambient = light(1), sun = light(1.5);
  const L = new DynamicLighting({ ambient, sun, sample: () => px([40, 0, 0, 255]), intervalMs: 500, tau: 0.5 });
  let prev = ambient.intensity;
  for (let t = 0; t <= 6000; t += 16) {
    L.update(t, 0.016);
    assert.ok(ambient.intensity <= prev + 1e-9, "no overshoot or jump up");
    assert.ok(ambient.intensity >= MIN_INTENSITY - 1e-9);
    prev = ambient.intensity;
  }
  assert.ok(ambient.intensity < 0.45, "dim");
  assert.ok(ambient.color.r > ambient.color.g, "tinted red");
  assert.ok(sun.intensity < 1.5 && sun.intensity > 0);
});
test("a black picture still leaves the avatar lit", () => {
  const ambient = light(1);
  const L = new DynamicLighting({ ambient, sample: () => px([0, 0, 0, 255]), tau: 0.1 });
  for (let t = 0; t < 5000; t += 16) L.update(t, 0.016);
  near(ambient.intensity, MIN_INTENSITY, 0.01);
});
test("sampling happens at the interval, not every frame", () => {
  let calls = 0;
  const L = new DynamicLighting({ ambient: light(), sample: () => { calls++; return px([255, 255, 255, 255]); }, intervalMs: 500 });
  for (let t = 0; t <= 2000; t += 16) L.update(t, 0.016);
  assert.ok(calls >= 4 && calls <= 5, `calls ${calls}`);
});
test("no picture yet (null) keeps the current light; disabled does nothing", () => {
  const ambient = light(0.9);
  const L = new DynamicLighting({ ambient, sample: () => null });
  for (let t = 0; t < 2000; t += 16) L.update(t, 0.016);
  near(ambient.intensity, 0.9, 0.01);
  L.setEnabled(false); ambient.intensity = 0.5; L.update(5000, 1);
  near(ambient.intensity, 0.5);
});
test("the sampler draws the source into a 16x16 canvas and returns its bytes; a failure gives null", () => {
  const log = [];
  const ctx = {
    clearRect() {}, drawImage: (...a) => log.push(a.slice(1)), getImageData: () => ({ data: px([1, 2, 3, 255]) }),
  };
  const sample = makeCanvasSampler({}, { createCanvas: () => ({ getContext: () => ctx }) });
  assert.deepEqual([...sample()], [1, 2, 3, 255]);
  assert.deepEqual(log[0], [0, 0, 16, 16]);
  ctx.drawImage = () => { throw new Error("tainted"); };
  assert.equal(sample(), null);
});

test("changing the picture switches the target; removing it eases back to the starting light", () => {
  const ambient = light(1);
  const L = new DynamicLighting({ ambient, sample: null, tau: 0.2 });
  for (let t = 0; t < 1000; t += 16) L.update(t, 0.016);
  near(ambient.intensity, 1, 1e-9);   // no picture: nothing changes
  L.setSample(() => px([30, 30, 200, 255]));
  for (let t = 1000; t < 4000; t += 16) L.update(t, 0.016);
  assert.ok(ambient.intensity < 0.8 && ambient.color.b > ambient.color.r, "dim and blue");
  L.setSample(() => px([250, 250, 250, 255]));
  for (let t = 4000; t < 7000; t += 16) L.update(t, 0.016);
  assert.ok(ambient.intensity > 1.0, "bright picture");
  L.setSample(null);
  for (let t = 7000; t < 10000; t += 16) L.update(t, 0.016);
  near(ambient.intensity, 1, 0.01); near(ambient.color.r, 1, 0.01); near(ambient.color.b, 1, 0.01);
});
