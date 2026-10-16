"""S10h, skin-tone matching for the live hands: the REAL fragment shader (read out of compositor.js) is run in headless Chrome on
synthetic textures: a "camera" with a dark-skinned cheek, a dark-skinned hand (bright and dim parts) and a blue bottle, and a "photo"
of pale skin. Option off: the hand keeps its colour. Option on: the hand moves towards the photo's skin, the bottle stays blue and the
light/dark pattern of the hand is kept. Reading this test's own canvas back is fine: no camera is involved."""

import re
from pathlib import Path

import pytest

SRC = Path(__file__).resolve().parents[1] / "webapp" / "src" / "facemesh" / "compositor.js"

PAGE = """<canvas id=c width=64 height=64></canvas><script>
const FRAG = %(frag)s, VERT = %(vert)s;
const gl = document.getElementById('c').getContext('webgl', {premultipliedAlpha: true, preserveDrawingBuffer: true});
function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(p); gl.useProgram(p);
function tex(unit, w, h, fn) {
  const d = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = fn(x / w, y / h); d.set([c[0], c[1], c[2], 255], (y * w + x) * 4); }
  const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);
  for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR);
  for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE);
}
const DARK = [110, 70, 50], BLUE = [30, 70, 200], PALE = [235, 190, 170];
// camera (texture row 0 = y 0): the cheek area top left; a hand along the bottom left (dim to bright); a blue bottle bottom right
tex(1, 64, 64, (x, y) => (y > 0.5 && x < 0.5) ? DARK.map((v) => v * (0.7 + 0.6 * (x * 2))) : (y > 0.5 && x > 0.5) ? BLUE : DARK);
tex(0, 8, 8, () => PALE);
const q = new Float32Array([0,0, 1,0, 0,1, 1,1]), a = new Float32Array([1,1,1,1]);
function attr(n, d, s) { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW); const l = gl.getAttribLocation(p, n); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, s, gl.FLOAT, false, 0, 0); }
attr('a_pos', q, 2); attr('a_alpha', a, 1);
const set1 = (n, v) => gl.uniform1f(gl.getUniformLocation(p, n), v), set2 = (n, x, y) => gl.uniform2f(gl.getUniformLocation(p, n), x, y);
gl.uniform1i(gl.getUniformLocation(p, 'u_cam'), 1); gl.uniform1i(gl.getUniformLocation(p, 'u_photo'), 0);
set1('u_opacity', 1); set2('u_livePos', 0.25, 0.25); set2('u_photoPos', 0.5, 0.5); set2('u_liveR', 0.04, 0.04); set2('u_photoR', 0.04, 0.04);
function render(skin) {
  set1('u_skin', skin); gl.viewport(0, 0, 64, 64); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  const px = (x, y) => { const o = new Uint8Array(4); gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, o); return Array.from(o).slice(0, 3); };
  return { dim: px(6, 23), bright: px(26, 23), bottle: px(48, 23) };   // readPixels counts from the bottom, the shader flips y: texture row 40 is canvas row 23
}
window.result = { off: render(0), on: render(1) };
</script>"""


def _sources():
    text = SRC.read_text(encoding="utf-8")
    return re.search(r"const LIVE_FRAG = `(.*?)`;", text, re.S).group(1), re.search(r"const LIVE_VERT = `(.*?)`;", text, re.S).group(1)


def test_the_hand_takes_the_photos_skin_and_the_bottle_does_not():
    import json

    sync_api = pytest.importorskip("playwright.sync_api")
    from test_tracking_browser import ARGS, _chromium

    exe = _chromium()
    if not exe:
        pytest.skip("no Chromium found (set REALX_CHROMIUM)")
    frag, vert = _sources()
    with sync_api.sync_playwright() as p:
        browser = p.chromium.launch(executable_path=exe, args=ARGS)
        try:
            page = browser.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.set_content(PAGE % {"frag": json.dumps(frag), "vert": json.dumps(vert)})
            res = page.evaluate("window.result")
            assert not errors, errors
        finally:
            browser.close()
    off, on = res["off"], res["on"]
    assert abs(off["dim"][0] - 110 * 0.7 * 1.0) < 40 and off["dim"][0] < off["dim"][2] + 80, off     # untouched: dark brown
    assert on["dim"][1] > off["dim"][1] + 30 and on["dim"][2] > off["dim"][2] + 30, (off, on)         # moved towards pale skin
    print("skin shader:", off, on)
    assert on["bright"][0] > on["dim"][0], ("the light and dark parts of the hand stay different", off, on)
    assert on["bottle"] == off["bottle"] and on["bottle"][2] > 150, "the blue bottle is left alone"
