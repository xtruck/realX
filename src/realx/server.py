"""Local control-room server: live preview, stats, controls and voice conversion.

Binds to 127.0.0.1 only. Defences against a hostile web page or local process:
exact Host match (DNS rebinding), Sec-Fetch-Site/Origin checks (cross-site embedding
and CSRF), strict CSP, request size and time limits, and a connection cap.
"""

from __future__ import annotations

import json
import threading
import time
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from importlib import resources
from urllib.parse import parse_qs, urlparse

import numpy as np

from realx import __version__
from realx.audio import offline
from realx.models import BLOCKED, MANIFEST
from realx import ws
from realx.pipeline import Pipeline
from realx.rig import hello_message, rig_message
from realx.sources import MOTIONS, SourceError, SyntheticScene, camera_frames
from realx.stages import create

MODES = ("avatar", "character", "boxes", "original")
MAX_JSON = 4096
MAX_AVATAR_BYTES = 32 * 1024 * 1024
MAX_CONNECTIONS = 16
SOCKET_TIMEOUT = 15.0

CSP = (
    "default-src 'none'; img-src 'self'; media-src 'self' blob:; connect-src 'self'; frame-src 'self'; "
    "style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'none'; form-action 'none'; "
    "object-src 'none'; frame-ancestors 'none'"
)


def avatar_csp(port: int) -> str:
    """The avatar page loads one model file and listens to one WebSocket, nothing else."""
    sockets = f"ws://127.0.0.1:{port} ws://localhost:{port}"
    return (
        f"default-src 'none'; img-src 'self' blob: data:; connect-src 'self' {sockets}; "
        "style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'none'; form-action 'none'; "
        "object-src 'none'; frame-ancestors 'self'"
    )


def load_avatar(path: str | None) -> bytes:
    """The character model: the bundled original, or a VRM file the user chose."""
    if path is None:
        return _asset("avatars/pip.vrm")
    with open(path, "rb") as fh:
        data = fh.read(MAX_AVATAR_BYTES + 1)
    if len(data) > MAX_AVATAR_BYTES:
        raise ValueError("avatar file is larger than 32 MB")
    if data[:4] != b"glTF":
        raise ValueError("avatar must be a .vrm (binary glTF) file")
    return data


def _smoothing_to_cutoff(s: float) -> float:
    return 3.0 - 2.5 * min(1.0, max(0.0, s))


class Engine:
    """Runs the video pipeline on a background thread and keeps the latest frame."""

    def __init__(self, source: str = "demo:dance", mode: str = "avatar", smoothing: float = 0.35, fps: float = 30.0):
        self.fps = fps
        self._lock = threading.Lock()
        self._cond = threading.Condition(self._lock)
        self._jpeg: bytes | None = None
        self._seq = 0
        self._rig = json.dumps(rig_message(0, 0.0, (0, 0), []))
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._config = {"source": source, "mode": mode, "smoothing": smoothing}
        self._config_version = 0
        self._open_source: str | None = None
        self._ribbon: deque[int] = deque(maxlen=120)  # 0 lost, 1 detected, 2 predicted
        self._stats = {"fps": 0.0, "latency_ms": 0.0, "faces": 0, "dropped": 0, "frames": 0, "error": None}

    # -- public -------------------------------------------------------------------
    @property
    def stopped(self) -> bool:
        return self._stop.is_set()

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._run, name="realx-engine", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        with self._cond:
            self._cond.notify_all()
        if self._thread:
            self._thread.join(timeout=5)

    def config(self) -> dict:
        with self._lock:
            return dict(self._config)

    def update(self, changes: dict) -> dict:
        allowed = {"source", "mode", "smoothing"}
        unknown = set(changes) - allowed
        if unknown:
            raise ValueError(f"unknown settings: {sorted(unknown)}")
        staged: dict = {}
        if "mode" in changes:
            if changes["mode"] not in MODES:
                raise ValueError(f"mode must be one of {MODES}")
            staged["mode"] = changes["mode"]
        if "smoothing" in changes:
            s = changes["smoothing"]
            if isinstance(s, bool) or not isinstance(s, (int, float)) or not 0 <= s <= 1:
                raise ValueError("smoothing must be a number between 0 and 1")
            staged["smoothing"] = float(s)
        if "source" in changes:
            src = changes["source"]
            ok = src == "camera" or (isinstance(src, str) and src.startswith("demo:") and src[5:] in MOTIONS)
            if not ok:
                raise ValueError(f"source must be 'camera' or 'demo:<{'|'.join(MOTIONS)}>'")
            staged["source"] = src
        with self._lock:  # one read-modify-write, so concurrent updates cannot lose each other
            self._config = {**self._config, **staged}
            self._config_version += 1
            return dict(self._config)

    def stats(self) -> dict:
        with self._lock:
            out = dict(self._stats)
            out["ribbon"] = list(self._ribbon)
            out["config"] = dict(self._config)
            out["version"] = __version__
        return out

    def wait_frame(self, last_seq: int, timeout: float = 2.0) -> tuple[bytes | None, int]:
        with self._cond:
            if self._seq == last_seq and not self._stop.is_set():
                self._cond.wait(timeout)
            return self._jpeg, self._seq

    def wait_rig(self, last_seq: int, timeout: float = 1.0) -> tuple[str, int]:
        """Latest rig message; blocks until a frame newer than `last_seq` or timeout."""
        with self._cond:
            if self._seq == last_seq and not self._stop.is_set():
                self._cond.wait(timeout)
            return self._rig, self._seq

    # -- internals ----------------------------------------------------------------
    def _snapshot(self) -> tuple[dict, int]:
        with self._lock:  # config and its version must be read together
            return dict(self._config), self._config_version

    def _build(self, cfg: dict) -> Pipeline:
        stages = [create("detect_yunet", score_threshold=0.3)]
        stages += [create("track"), create("one_euro", min_cutoff=_smoothing_to_cutoff(cfg["smoothing"]), beta=0.5)]
        stages.append(create("rig"))  # the character renderer in the browser reads this
        if cfg["mode"] == "avatar":
            stages.append(create("avatar"))
        elif cfg["mode"] == "boxes":
            stages.append(create("debug_boxes"))
        return Pipeline(stages)

    def _open(self, source: str):
        if source == "camera":
            return camera_frames(0)
        return SyntheticScene(source.split(":", 1)[1], fps=self.fps, degrade=0.6)

    @staticmethod
    def _close_source(frames) -> None:
        close = getattr(frames, "close", None)
        if callable(close):
            try:
                close()
            except Exception:
                pass

    def _set_error(self, message: str | None) -> None:
        with self._lock:
            self._stats["error"] = message

    def _run(self) -> None:
        import cv2

        version = -1
        pipe: Pipeline | None = None
        frames = None
        started = time.perf_counter()
        last_index = -1
        last = time.perf_counter()
        backoff = 0.5
        try:
            while not self._stop.is_set():
                try:
                    cfg, current = self._snapshot()
                    if current != version:
                        if pipe:
                            pipe.close()
                            pipe = None
                        pipe = self._build(cfg)
                        pipe.setup()
                        if frames is None or cfg["source"] != self._open_source:
                            self._close_source(frames)
                            frames = self._open(cfg["source"])
                            self._open_source = cfg["source"]
                            started, last_index = time.perf_counter(), -1
                        version = current

                    dropped = 0
                    if isinstance(frames, SyntheticScene):
                        # render the frame for "now"; skipped indices were unaffordable
                        index = int((time.perf_counter() - started) * self.fps)
                        if index == last_index:
                            self._stop.wait(0.002)
                            continue
                        if last_index >= 0:
                            dropped = index - last_index - 1
                        last_index = index
                        ctx = frames.render(index)
                    else:
                        ctx = next(frames)

                    t0 = time.perf_counter()
                    if cfg["mode"] == "original":
                        out = ctx
                        out.faces = []
                    else:
                        out = pipe.process(ctx)
                    latency = (time.perf_counter() - t0) * 1000
                    buf = None
                    if cfg["mode"] != "character":  # the browser draws the character itself
                        ok, buf = cv2.imencode(
                            ".jpg", cv2.cvtColor(out.pixels, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 82]
                        )
                        if not ok:
                            raise RuntimeError("could not encode frame")
                    fh, fw = out.pixels.shape[:2]
                    rig_faces = out.meta.get("rig", []) if cfg["mode"] != "original" else []
                    state = 0 if not out.faces else (2 if all(f.predicted for f in out.faces) else 1)
                    now = time.perf_counter()
                    inst_fps = 1.0 / max(now - last, 1e-6)
                    last = now
                    backoff = 0.5
                    with self._cond:
                        s = self._stats
                        s["fps"] = round(0.9 * s["fps"] + 0.1 * inst_fps if s["frames"] else inst_fps, 1)
                        s["latency_ms"] = round(0.9 * s["latency_ms"] + 0.1 * latency if s["frames"] else latency, 1)
                        s["faces"] = len(out.faces)
                        s["dropped"] += dropped
                        s["frames"] += 1
                        s["error"] = None
                        self._ribbon.append(state)
                        self._jpeg = None if buf is None else buf.tobytes()
                        self._seq += 1
                        self._rig = json.dumps(rig_message(self._seq, now, (fw, fh), rig_faces))
                        self._cond.notify_all()
                except (SourceError, StopIteration) as exc:
                    # camera unplugged or busy: say so, drop the dead generator, retry
                    self._set_error(str(exc) or "The video source stopped.")
                    self._close_source(frames)
                    frames, self._open_source, version = None, None, -1
                    self._stop.wait(backoff)
                    backoff = min(backoff * 2, 5.0)
                except Exception as exc:  # never let the engine thread die silently
                    self._set_error(f"{type(exc).__name__}: {exc}")
                    version = -1  # rebuild the pipeline on the next pass
                    self._stop.wait(backoff)
                    backoff = min(backoff * 2, 5.0)
        finally:
            if pipe:
                try:
                    pipe.close()
                except Exception:
                    pass
            self._close_source(frames)


def _asset(name: str) -> bytes:
    return resources.files("realx.web").joinpath(name).read_bytes()


class _BoundedServer(ThreadingHTTPServer):
    """Caps simultaneous connections so streams or slow clients cannot exhaust threads."""

    daemon_threads = True

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self._slots = threading.BoundedSemaphore(MAX_CONNECTIONS)

    def process_request(self, request, client_address) -> None:
        if not self._slots.acquire(blocking=False):
            try:
                request.sendall(b"HTTP/1.0 503 Service Unavailable\r\nContent-Length: 0\r\n\r\n")
            except OSError:
                pass
            self.shutdown_request(request)
            return
        super().process_request(request, client_address)

    def process_request_thread(self, request, client_address) -> None:
        try:
            super().process_request_thread(request, client_address)
        finally:
            self._slots.release()


def make_handler(engine: Engine, port_getter, avatar: bytes):
    class Handler(BaseHTTPRequestHandler):
        server_version = "realX"
        sys_version = ""
        timeout = SOCKET_TIMEOUT

        def log_message(self, *args) -> None:  # quiet
            pass

        def _headers(self, content_type: str, length: int | None = None, cache: bool = True) -> None:
            self.send_header("Content-Type", content_type)
            if length is not None:
                self.send_header("Content-Length", str(length))
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Cross-Origin-Resource-Policy", "same-origin")
            self.send_header("Referrer-Policy", "no-referrer")
            if cache:
                self.send_header("Cache-Control", "no-store")

        # request screening ------------------------------------------------------
        def _local_host(self) -> bool:
            host = (self.headers.get("Host") or "").lower()
            port = port_getter()
            return host in (f"127.0.0.1:{port}", f"localhost:{port}")

        def _same_origin(self) -> bool:
            origin = self.headers.get("Origin")
            if origin is None:
                return True
            return origin.lower() in (f"http://127.0.0.1:{port_getter()}", f"http://localhost:{port_getter()}")

        def _not_cross_site(self) -> bool:
            # browsers label who is asking; a page on another site is "cross-site"
            return self.headers.get("Sec-Fetch-Site") in (None, "same-origin", "none")

        def _deny(self, code: int, msg: str) -> None:
            body = json.dumps({"error": msg}).encode()
            self.send_response(code)
            self._headers("application/json", len(body))
            self.end_headers()
            self.wfile.write(body)

        def _json(self, payload: dict, code: int = 200) -> None:
            body = json.dumps(payload).encode()
            self.send_response(code)
            self._headers("application/json", len(body))
            self.end_headers()
            self.wfile.write(body)

        def _body(self, limit: int) -> bytes:
            if self.headers.get("Transfer-Encoding"):
                raise ValueError("chunked uploads are not supported")
            try:
                n = int(self.headers.get("Content-Length") or 0)
            except ValueError:
                raise ValueError("invalid Content-Length") from None
            if n < 0 or n > limit:
                raise ValueError("request body too large")
            return self.rfile.read(n)

        # routes ---------------------------------------------------------------
        def do_GET(self) -> None:
            if not self._local_host():
                return self._deny(403, "forbidden host")
            if not self._not_cross_site():
                return self._deny(403, "cross-site requests are not allowed")
            path = urlparse(self.path).path
            if path == "/":
                page = _asset("index.html")
                self.send_response(200)
                self._headers("text/html; charset=utf-8", len(page))
                self.send_header("Content-Security-Policy", CSP)
                self.send_header("X-Frame-Options", "DENY")
                self.end_headers()
                self.wfile.write(page)
            elif path == "/app.js":
                js = _asset("app.js")
                self.send_response(200)
                self._headers("text/javascript; charset=utf-8", len(js))
                self.end_headers()
                self.wfile.write(js)
            elif path == "/avatar":
                page = _asset("avatar.html")
                self.send_response(200)
                self._headers("text/html; charset=utf-8", len(page))
                self.send_header("Content-Security-Policy", avatar_csp(port_getter()))
                self.send_header("X-Frame-Options", "SAMEORIGIN")
                self.end_headers()
                self.wfile.write(page)
            elif path == "/avatar.bundle.js":
                js = _asset("avatar.bundle.js")
                self.send_response(200)
                self._headers("text/javascript; charset=utf-8", len(js))
                self.end_headers()
                self.wfile.write(js)
            elif path == "/avatar/model.vrm":
                self.send_response(200)
                self._headers("model/gltf-binary", len(avatar))
                self.end_headers()
                self.wfile.write(avatar)
            elif path == "/favicon.ico":
                self.send_response(204)
                self._headers("image/x-icon", 0)
                self.end_headers()
            elif path == "/ws/rig":
                self._rig_socket()
            elif path == "/api/stats":
                self._json(engine.stats())
            elif path == "/api/safety":
                self._json(
                    {
                        "watermark": "provenance mark embedded in voice output",
                        "consent": "required before any real-person face or voice synthesis",
                        "models": {
                            n: {"license": m.license, "commercial_ok": m.commercial_ok} for n, m in MANIFEST.items()
                        },
                        "blocked": BLOCKED,
                    }
                )
            elif path == "/stream.mjpg":
                self._stream()
            else:
                self._deny(404, "not found")

        def _stream(self) -> None:
            self.send_response(200)
            self._headers("multipart/x-mixed-replace; boundary=frame")
            self.end_headers()
            seq = -1
            try:
                while not engine.stopped:
                    jpeg, new = engine.wait_frame(seq)
                    if new == seq:
                        continue
                    seq = new
                    if jpeg is None:
                        continue
                    self.wfile.write(b"--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %d\r\n\r\n" % len(jpeg))
                    self.wfile.write(jpeg)
                    self.wfile.write(b"\r\n")
            except OSError:  # client went away or stalled past the timeout
                return

        def _rig_socket(self) -> None:
            """Stream rig numbers to the avatar page. Latest value wins; nothing queues."""
            h = self.headers
            wants = (h.get("Upgrade") or "").lower() == "websocket" and "upgrade" in (h.get("Connection") or "").lower()
            if not wants or h.get("Sec-WebSocket-Version") != "13" or not ws.valid_client_key(h.get("Sec-WebSocket-Key")):
                return self._deny(400, "expected a WebSocket upgrade")
            if not self._same_origin() or h.get("Origin") is None:
                return self._deny(403, "forbidden origin")  # browsers always send Origin on WebSockets
            self.protocol_version = "HTTP/1.1"  # the WebSocket handshake requires it
            self.send_response(101)
            self.send_header("Upgrade", "websocket")
            self.send_header("Connection", "Upgrade")
            self.send_header("Sec-WebSocket-Accept", ws.accept_key(h["Sec-WebSocket-Key"]))
            self.end_headers()
            self.close_connection = True
            conn = ws.Connection(self.connection)
            seq = -1
            try:
                conn.send_text(json.dumps(hello_message(__version__)))
                while not engine.stopped and not conn.closed:
                    message, new = engine.wait_rig(seq)
                    conn.poll()
                    if conn.closed:
                        break
                    if new != seq:
                        seq = new
                        conn.send_text(message)
            except (OSError, ws.WebSocketError):
                return

        def do_POST(self) -> None:
            if not self._local_host() or not self._same_origin() or not self._not_cross_site():
                return self._deny(403, "forbidden origin")
            parsed = urlparse(self.path)
            try:
                if parsed.path == "/api/config":
                    if (self.headers.get("Content-Type") or "").split(";")[0].strip() != "application/json":
                        raise ValueError("Content-Type must be application/json")
                    changes = json.loads(self._body(MAX_JSON) or b"{}")
                    if not isinstance(changes, dict):
                        raise ValueError("expected a JSON object")
                    self._json(engine.update(changes))
                elif parsed.path == "/api/voice":
                    q = parse_qs(parsed.query)
                    semitones = float(q.get("semitones", ["0"])[0])
                    data = self._body(offline.MAX_WAV_BYTES)
                    if q.get("demo", ["0"])[0] == "1" and not data:
                        t = np.arange(16000 * 2) / 16000
                        tone = (0.4 * np.sin(2 * np.pi * 220 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 2 * t))).astype(
                            np.float32
                        )
                        data = offline.wav_bytes(tone, 16000)
                    out = offline.convert_wav_bytes(data, semitones)
                    self.send_response(200)
                    self._headers("audio/wav", len(out))
                    self.end_headers()
                    self.wfile.write(out)
                else:
                    self._deny(404, "not found")
            except (ValueError, json.JSONDecodeError, RecursionError) as exc:
                self._deny(400, str(exc)[:200])
            except OSError:
                return
            except Exception:  # keep details out of the response
                self._deny(500, "internal error")

    return Handler


class Server:
    def __init__(self, engine: Engine, port: int = 8765, avatar_path: str | None = None) -> None:
        self.engine = engine
        avatar = load_avatar(avatar_path)
        self._httpd = _BoundedServer(("127.0.0.1", port), make_handler(engine, lambda: self.port, avatar))
        self._thread: threading.Thread | None = None

    @property
    def port(self) -> int:
        return self._httpd.server_address[1]

    def start(self) -> None:
        self.engine.start()
        self._thread = threading.Thread(target=self._httpd.serve_forever, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self.engine.stop()  # ends open streams first
        if self._thread:
            self._httpd.shutdown()
        self._httpd.server_close()
