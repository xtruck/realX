// Draws a photo wrapped on the tracked face mesh (steps S2-S3), on a transparent WebGL canvas laid over the live camera <video>.
//
// Privacy rule, and the one exception (reviewed and granted for step S3):
//  * The camera picture is never READ BACK. Nothing here, or anywhere in the page, may call readPixels, getImageData,
//    toDataURL, toBlob, drawImage, createImageBitmap, capture or record it, or send it anywhere. The result of the colour
//    work goes to the screen and nowhere else.
//  * The exception: `uploadCamera` hands the current video frame to the graphics card as a texture, once per drawn frame,
//    and only while colour matching is on. The shader reads it to take the live face's colour and lighting (a blurred
//    copy) and give them to the photo's detail, so the photo does not look like a sticker. That one method is the only
//    place the video is named; facemesh.test.mjs checks it, and a browser test counts real read-back calls (must be 0).
import { TRIANGLE_COUNT, VERTEX_COUNT, edgeDepth, faceBox, flatten, keepMask } from "./mesh.js";

const FADE_STEPS = 3;   // the picture fades in over this many rings of triangles from the edge of the face
const BLUR = 0.12;      // colour is matched at the scale of this fraction of the face width

const VERT = `attribute vec2 a_pos; attribute vec2 a_uv; attribute float a_fade; attribute float a_keep;
varying vec2 v_uv; varying vec2 v_scr; varying float v_fade; varying float v_keep;
void main() {
  v_uv = a_uv; v_scr = a_pos; v_fade = a_fade; v_keep = a_keep;
  gl_Position = vec4(a_pos.x * 2.0 - 1.0, 1.0 - a_pos.y * 2.0, 0.0, 1.0);
}`;

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv; varying vec2 v_scr; varying float v_fade; varying float v_keep;
uniform sampler2D u_photo; uniform sampler2D u_cam;
uniform float u_match; uniform float u_keep; uniform vec2 u_rl; uniform vec2 u_rp;

// 13 taps: the centre and two hexagon rings. A cheap blur whose size follows the face.
vec3 soften(sampler2D t, vec2 c, vec2 r) {
  const float h = 0.8660254;
  vec3 s = texture2D(t, c).rgb;
  s += texture2D(t, c + vec2( 1.0, 0.0) * r).rgb + texture2D(t, c + vec2( 0.5,  h) * r).rgb + texture2D(t, c + vec2(-0.5,  h) * r).rgb;
  s += texture2D(t, c + vec2(-1.0, 0.0) * r).rgb + texture2D(t, c + vec2(-0.5, -h) * r).rgb + texture2D(t, c + vec2( 0.5, -h) * r).rgb;
  s += texture2D(t, c + vec2( 2.0, 0.0) * r).rgb + texture2D(t, c + vec2( 1.0,  2.0 * h) * r).rgb + texture2D(t, c + vec2(-1.0,  2.0 * h) * r).rgb;
  s += texture2D(t, c + vec2(-2.0, 0.0) * r).rgb + texture2D(t, c + vec2(-1.0, -2.0 * h) * r).rgb + texture2D(t, c + vec2( 1.0, -2.0 * h) * r).rgb;
  return s / 13.0;
}

void main() {
  vec3 photo = texture2D(u_photo, v_uv).rgb;
  vec3 matched = photo;
  if (u_match > 0.0) {
    // the photo's detail (what is left when its own blur is taken away) on top of the live face's colour and light
    // limited, so strong edges in the photo (lips, glasses' glare) do not leave bright halos on the live colours
    vec3 detail = clamp(photo - soften(u_photo, v_uv, u_rp), -0.16, 0.16);
    matched = clamp(soften(u_cam, v_scr, u_rl) + detail, 0.0, 1.0);
  }
  vec3 colour = mix(photo, matched, u_match);
  float alpha = smoothstep(0.0, 1.0, v_fade) * (1.0 - u_keep * v_keep);
  gl_FragColor = vec4(colour * alpha, alpha);
}`;

export class MeshCompositor {
  /** canvas: the WebGL canvas; mesh: buildMesh()'s result. Throws when WebGL is not available. */
  constructor(canvas, mesh) {
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) throw new Error("WebGL is not available in this browser");
    this.gl = gl; this.canvas = canvas; this.mesh = mesh;
    this.positions = new Float32Array(VERTEX_COUNT * 2);
    this.photo = null; this.camera = null;
    this.photoRadius = [0.05, 0.05];
    this.look = { match: 1, keep: 1 };
    this.program = link(gl, VERT, FRAG);
    gl.useProgram(this.program);
    const attr = (name) => gl.getAttribLocation(this.program, name);
    this.loc = { pos: attr("a_pos"), uv: attr("a_uv"), fade: attr("a_fade"), keep: attr("a_keep") };
    this.uni = Object.fromEntries(["u_photo", "u_cam", "u_match", "u_keep", "u_rl", "u_rp"].map((n) => [n, gl.getUniformLocation(this.program, n)]));
    this.posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions.byteLength, gl.DYNAMIC_DRAW);
    this.uvBuffer = gl.createBuffer();
    this.fadeBuffer = filled(gl, Float32Array.from(edgeDepth(mesh.triangles), (d) => Math.min(Math.max(d, 0) / FADE_STEPS, 1)));
    this.keepBuffer = filled(gl, keepMask());
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.triangles, gl.STATIC_DRAW);
    this.camera = emptyTexture(gl);   // a single transparent pixel until a frame is uploaded
    gl.clearColor(0, 0, 0, 0);
  }

  get hasPhoto() { return this.photo !== null; }

  /** How the photo is drawn: `match` 0..1 (how much of the live face's colour and light it takes), `keep` (live eyes and mouth show through). */
  setLook({ match = this.look.match, keep = this.look.keep } = {}) {
    this.look = { match: Math.min(1, Math.max(0, Number(match) || 0)), keep: keep ? 1 : 0 };
  }

  /**
   * `image` is the loaded photo (an <img>), `photoLandmarks` its face as the face model sees it: they say where each
   * mesh vertex sits in the photo, which is the texture coordinate of that vertex.
   */
  setPhoto(image, photoLandmarks) {
    const gl = this.gl;
    const uv = flatten(photoLandmarks);
    const box = faceBox(photoLandmarks);
    if (!uv || !box) throw new Error("the photo has no complete face");
    const w = image.naturalWidth || image.width, h = image.naturalHeight || image.height;
    const max = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (!(w > 0 && h > 0) || w > max || h > max) throw new Error("this photo is too large for this graphics card: use a smaller one");
    if (this.photo) gl.deleteTexture(this.photo);
    this.photo = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.photo);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);   // the photo
    setSampling(gl);
    this.photoRadius = [BLUR * box.w, BLUR * box.w * (w / h)];
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
  }

  /** Forget the photo (the picture and its texture coordinates). */
  clearPhoto() {
    if (this.photo) this.gl.deleteTexture(this.photo);
    this.photo = null;
    this.clear();
  }

  clear() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  /**
   * Draws the photo on the live face. `camera` is the live picture's element, used only to match colours (see the top of
   * this file); leave it out, or set match to 0, and the picture is not touched at all.
   * Returns the number of triangles drawn: 0 when there is no photo or no face.
   */
  draw(liveLandmarks, camera = null) {
    const gl = this.gl;
    this.clear();
    if (!this.photo || !flatten(liveLandmarks, this.positions)) return 0;
    const box = faceBox(liveLandmarks);
    const useCamera = this.look.match > 0 && camera !== null;
    if (useCamera) this.uploadCamera(camera);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions);
    this.point(this.posBuffer, this.loc.pos, 2);
    this.point(this.uvBuffer, this.loc.uv, 2);
    this.point(this.fadeBuffer, this.loc.fade, 1);
    this.point(this.keepBuffer, this.loc.keep, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.photo);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.camera);
    const aspect = this.canvas.width / Math.max(1, this.canvas.height);
    gl.uniform1i(this.uni.u_photo, 0);
    gl.uniform1i(this.uni.u_cam, 1);
    gl.uniform1f(this.uni.u_match, useCamera ? this.look.match : 0);
    gl.uniform1f(this.uni.u_keep, this.look.keep);
    gl.uniform2f(this.uni.u_rl, BLUR * box.w, BLUR * box.w * aspect);
    gl.uniform2f(this.uni.u_rp, this.photoRadius[0], this.photoRadius[1]);
    gl.drawElements(gl.TRIANGLES, TRIANGLE_COUNT * 3, gl.UNSIGNED_SHORT, 0);
    return TRIANGLE_COUNT;
  }

  point(buffer, location, size) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  // THE EXCEPTION: the live frame goes to the graphics card as a texture and is only ever sampled by the shader.
  uploadCamera(video) {
    const gl = this.gl;
    if (!video || video.readyState < 2) return;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.camera);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
  }

  dispose() {
    const gl = this.gl;
    for (const t of [this.photo, this.camera]) if (t) gl.deleteTexture(t);
    for (const b of [this.posBuffer, this.uvBuffer, this.fadeBuffer, this.keepBuffer, this.indexBuffer]) gl.deleteBuffer(b);
    gl.deleteProgram(this.program);
    this.photo = null; this.camera = null;
  }
}

function filled(gl, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

function setSampling(gl) {   // any picture size: no mipmaps, no repeat
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

function emptyTexture(gl) {
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  setSampling(gl);
  return t;
}

function link(gl, vertexSource, fragmentSource) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(`shader: ${gl.getShaderInfoLog(shader)}`);
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`program: ${gl.getProgramInfoLog(program)}`);
  return program;
}
