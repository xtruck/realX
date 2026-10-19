// S13c: the live-frame segmenter for clean seams (hair and body skin round the live head), kept entirely on the graphics card.
//
// PRIVACY: the camera picture is never read back. MediaPipe takes the <video> element itself and answers with confidence MASKS that
// stay as WebGL textures inside its own graphics context (MPMask.getAsWebGLTexture). This file runs one small shader over them in
// that same context (the running value per pixel, see seams.js) and shows the result on MediaPipe's hidden canvas. The compositor
// then uploads that canvas as a texture (one texImage2D in compositor.js, setSeam). No mask value ever reaches JavaScript: this file
// never calls getAsUint8Array or getAsFloat32Array, and none of the read-back calls listed in facemesh.test.mjs.
//
// NOT VERIFIED on a real driver or a real webcam (see docs/CPU-STATUS.md): the texture format MediaPipe hands out, and sharing its
// context state, were written from its documentation and bundle, not run. Any failure here switches the effect off (open() throws, or
// run() returns false and `failed` is set) and the page draws exactly what it drew before this step.
import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";
import { SEAM } from "./seams.js";

const HAIR = 1, BODY_SKIN = 2;   // classes of selfie_multiclass_256x256: 0 background, 1 hair, 2 body-skin, 3 face-skin, 4 clothes, 5 other

const VS = `#version 300 es
in vec2 p; out vec2 t;
void main() { t = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
// the running value per pixel (R = hair, G = body skin): moves towards the new answer by `up` when it rises and `down` when it falls.
// Keep these two numbers equal to SEAM.up / SEAM.down in seams.js (a test checks the source).
const FS_STEP = `#version 300 es
precision highp float;
in vec2 t; out vec4 o;
uniform sampler2D hair, skin, prev; uniform float up, down;
void main() {
  vec2 s = clamp(vec2(texture(hair, t).r, texture(skin, t).r), 0.0, 1.0);
  vec2 p = texture(prev, t).rg;
  vec2 k = mix(vec2(down), vec2(up), step(p + 1e-4, s));
  o = vec4(p + (s - p) * k, 0.0, 1.0);
}`;
const FS_SHOW = `#version 300 es
precision highp float;
in vec2 t; out vec4 o; uniform sampler2D src;
void main() { o = vec4(texture(src, t).rg, 0.0, 1.0); }`;

function program(gl, fs) {
  const make = (type, source) => {
    const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`seam shader: ${gl.getShaderInfoLog(s)}`);
    return s;
  };
  const pr = gl.createProgram();
  gl.attachShader(pr, make(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, make(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(pr, 0, "p");
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(`seam program: ${gl.getProgramInfoLog(pr)}`);
  return pr;
}

export class SeamSegmenter {
  /** Opens the model on the graphics card. Throws when it cannot (no GPU delegate, no WebGL2, model missing): the page then keeps the old look. */
  static async open() {
    const canvas = document.createElement("canvas");
    const fileset = await FilesetResolver.forVisionTasks("/mp/wasm");
    const task = await ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: "/mp/models/selfie_multiclass_256x256.tflite", delegate: "GPU" },   // no CPU fallback: it would need the masks on the CPU
      canvas, runningMode: "VIDEO", outputCategoryMask: false, outputConfidenceMasks: true,
    });
    const seg = new SeamSegmenter(task, canvas);
    seg.setup();
    return seg;
  }

  constructor(task, canvas) {
    this.task = task; this.canvas = canvas;
    this.failed = false; this.answers = 0; this.lastTs = 0; this.costMs = 0; this.gl = null;
  }

  setup() {
    const gl = this.gl = this.canvas.getContext("webgl2");   // the context MediaPipe already made on this canvas
    if (!gl) throw new Error("the segmenter has no WebGL2 context");
    this.step = program(gl, FS_STEP); this.show = program(gl, FS_SHOW);
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null); gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.buf = buf; this.targets = null; this.flip = 0;
    this.floatLinear = !!gl.getExtension("OES_texture_float_linear");
  }

  _targets(w, h) {
    const gl = this.gl;
    if (this.targets && this.targets.w === w && this.targets.h === h) return this.targets;
    if (this.targets) for (const t of this.targets.list) { gl.deleteFramebuffer(t.fb); gl.deleteTexture(t.tex); }
    const list = [0, 1].map(() => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);   // empty: the running value starts at nothing
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, fb };
    });
    this.targets = { w, h, list };
    return this.targets;
  }

  /** Folds one answer (the hair and body-skin confidence masks) into the running value and shows it on the canvas. Returns false on any problem. */
  _fold(masks) {
    const gl = this.gl;
    const hair = masks && masks[HAIR], skin = masks && masks[BODY_SKIN];
    if (!hair || !skin) return false;
    // the parts of MediaPipe's context state this touches, put back afterwards
    const keep = {
      program: gl.getParameter(gl.CURRENT_PROGRAM), fb: gl.getParameter(gl.FRAMEBUFFER_BINDING), vao: gl.getParameter(gl.VERTEX_ARRAY_BINDING),
      active: gl.getParameter(gl.ACTIVE_TEXTURE), viewport: gl.getParameter(gl.VIEWPORT), blend: gl.isEnabled(gl.BLEND),
      depth: gl.isEnabled(gl.DEPTH_TEST), scissor: gl.isEnabled(gl.SCISSOR_TEST), cull: gl.isEnabled(gl.CULL_FACE),
    };
    const bound = [];
    for (let u = 0; u < 3; u++) { gl.activeTexture(gl.TEXTURE0 + u); bound.push(gl.getParameter(gl.TEXTURE_BINDING_2D)); }
    try {
      const hairTex = hair.getAsWebGLTexture(), skinTex = skin.getAsWebGLTexture();
      const to = this._targets(hair.width, hair.height);
      const from = to.list[this.flip], into = to.list[1 - this.flip];
      gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST); gl.disable(gl.SCISSOR_TEST); gl.disable(gl.CULL_FACE);
      gl.bindVertexArray(this.vao);
      // the masks are float textures; without linear float filtering they must be sampled NEAREST or they read as 0
      for (const tex of [hairTex, skinTex]) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        const f = this.floatLinear ? gl.LINEAR : gl.NEAREST;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
      }
      gl.useProgram(this.step);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, hairTex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, skinTex);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, from.tex);
      gl.uniform1i(gl.getUniformLocation(this.step, "hair"), 0);
      gl.uniform1i(gl.getUniformLocation(this.step, "skin"), 1);
      gl.uniform1i(gl.getUniformLocation(this.step, "prev"), 2);
      gl.uniform1f(gl.getUniformLocation(this.step, "up"), SEAM.up);
      gl.uniform1f(gl.getUniformLocation(this.step, "down"), SEAM.down);
      gl.bindFramebuffer(gl.FRAMEBUFFER, into.fb);
      gl.viewport(0, 0, to.w, to.h);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      // show it on the canvas, for the compositor to take as a texture
      gl.useProgram(this.show);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, into.tex);
      gl.uniform1i(gl.getUniformLocation(this.show, "src"), 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      this.flip = 1 - this.flip;
      return gl.getError() === gl.NO_ERROR;
    } finally {
      bound.forEach((tex, u) => { gl.activeTexture(gl.TEXTURE0 + u); gl.bindTexture(gl.TEXTURE_2D, tex); });
      gl.activeTexture(keep.active); gl.useProgram(keep.program); gl.bindFramebuffer(gl.FRAMEBUFFER, keep.fb); gl.bindVertexArray(keep.vao);
      gl.viewport(keep.viewport[0], keep.viewport[1], keep.viewport[2], keep.viewport[3]);
      for (const [on, cap] of [[keep.blend, gl.BLEND], [keep.depth, gl.DEPTH_TEST], [keep.scissor, gl.SCISSOR_TEST], [keep.cull, gl.CULL_FACE]]) (on ? gl.enable : gl.disable).call(gl, cap);
    }
  }

  /**
   * One pass over the current camera frame. Returns true when the canvas now holds a fresh answer, which the caller hands to the
   * compositor at once (the canvas is only guaranteed to hold it until the browser next draws).
   */
  run(video) {
    if (this.failed) return false;
    const t0 = performance.now();
    let ok = false;
    try {
      this.lastTs = Math.max(this.lastTs + 1, Math.round(t0));   // MediaPipe wants strictly rising timestamps
      this.task.segmentForVideo(video, this.lastTs, (result) => {
        try { ok = this._fold(result.confidenceMasks); } catch (err) { this.failed = true; this.error = String((err && err.message) || err); }
      });
    } catch (err) { this.failed = true; this.error = String((err && err.message) || err); }
    if (!ok && !this.error) this.error = "no usable mask in the answer";
    if (!ok) this.failed = true;
    const took = performance.now() - t0;
    this.costMs = this.costMs ? 0.8 * this.costMs + 0.2 * took : took;
    if (ok) this.answers++;
    return ok;
  }

  close() {
    try { this.task.close(); } catch (e) { /* already closed */ }
    this.task = null; this.failed = true;
  }
}
