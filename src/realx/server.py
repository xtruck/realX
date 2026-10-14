"""Local control-room server: live preview, stats, controls and voice conversion.

Binds to 127.0.0.1 only. Requests must carry a local Host header and, for writes, a
same-origin Origin, which blocks DNS-rebinding and cross-site requests against the
camera and microphone features.
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
from realx.pipeline import Pipeline
from realx.sources import MOTIONS, SourceError, SyntheticScene, camera_frames
from realx.stages import create

MODES = ("avatar", "boxes", "original")
MAX_JSON = 4096


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
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._config = {"source": source, "mode": mode, "smoothing": smoothing}
        self._config_version = 0
        self._ribbon: deque[int] = deque(maxlen=120)  # 0 lost, 1 detected, 2 predicted
        self._stats = {"fps": 0.0, "latency_ms": 0.0, "faces": 0, "dropped": 0, "frames": 0, "error": None}

    # -- public -------------------------------------------------------------------
    def start(self) -> None:
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
        new = self.config()
        if "mode" in changes:
            if changes["mode"] not in MODES:
                raise ValueError(f"mode must be one of {MODES}")
            new["mode"] = changes["mode"]
        if "smoothing" in changes:
            s = changes["smoothing"]
            if isinstance(s, bool) or not isinstance(s, (int, float)) or not 0 <= s <= 1:
                raise ValueError("smoothing must be a number between 0 and 1")
            new["smoothing"] = float(s)
        if "source" in changes:
            src = changes["source"]
            ok = src == "camera" or (isinstance(src, str) and src.startswith("demo:") and src[5:] in MOTIONS)
            if not ok:
                raise ValueError(f"source must be 'camera' or 'demo:<{'|'.join(MOTIONS)}>'")
            new["source"] = src
        with self._lock:
            self._config = new
            self._config_version += 1
        return new

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

    # -- internals ----------------------------------------------------------------
    def _build(self, cfg: dict) -> Pipeline:
        stages = [create("detect_yunet", score_threshold=0.3)]
        stages += [create("track"), create("one_euro", min_cutoff=_smoothing_to_cutoff(cfg["smoothing"]), beta=0.5)]
        if cfg["mode"] == "avatar":
            stages.append(create("avatar"))
        elif cfg["mode"] == "boxes":
            stages.append(create("debug_boxes"))
        return Pipeline(stages)

    def _open(self, source: str):
        if source == "camera":
            return camera_frames(0)
        return SyntheticScene(source.split(":", 1)[1], fps=self.fps, degrade=0.6)

    def _run(self) -> None:
        import cv2

        version = -1
        pipe: Pipeline | None = None
        frames = None
        started = time.perf_counter()
        last_index = -1
        last = time.perf_counter()
        try:
            while not self._stop.is_set():
                cfg = self.config()
                with self._lock:
                    current = self._config_version
                if current != version:
                    if pipe:
                        pipe.close()
                    pipe = self._build(cfg)
                    pipe.setup()
                    if frames is None or cfg["source"] != getattr(self, "_open_source", None):
                        frames = self._open(cfg["source"])
                        self._open_source = cfg["source"]
                        started, last_index = time.perf_counter(), -1
                    version = current
                dropped = 0
                if isinstance(frames, SyntheticScene):
                    # render the frame for "now"; skipped indices are frames we could not afford
                    index = int((time.perf_counter() - started) * self.fps)
                    if index == last_index:
                        self._stop.wait(0.002)
                        continue
                    if last_index >= 0:
                        dropped = index - last_index - 1
                    last_index = index
                    ctx = frames.render(index)
                else:
                    try:
                        ctx = next(frames)
                    except SourceError as exc:
                        with self._lock:
                            self._stats["error"] = str(exc)
                        self._stop.wait(1.0)
                        continue
                t0 = time.perf_counter()
                if cfg["mode"] == "original":
                    out = ctx
                    out.faces = []
                else:
                    out = pipe.process(ctx)
                latency = (time.perf_counter() - t0) * 1000
                ok, buf = cv2.imencode(".jpg", cv2.cvtColor(out.pixels, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 82])
                if not ok:
                    continue
                state = 0 if not out.faces else (2 if all(f.predicted for f in out.faces) else 1)
                now = time.perf_counter()
                inst_fps = 1.0 / max(now - last, 1e-6)
                last = now
                with self._cond:
                    s = self._stats
                    s["fps"] = round(0.9 * s["fps"] + 0.1 * inst_fps if s["frames"] else inst_fps, 1)
                    s["latency_ms"] = round(0.9 * s["latency_ms"] + 0.1 * latency if s["frames"] else latency, 1)
                    s["faces"] = len(out.faces)
                    s["dropped"] += dropped
                    s["frames"] += 1
                    s["error"] = None
                    self._ribbon.append(state)
                    self._jpeg = buf.tobytes()
                    self._seq += 1
                    self._cond.notify_all()
        finally:
            if pipe:
                pipe.close()


def _page() -> bytes:
    return resources.files("realx.web").joinpath("index.html").read_bytes()


def make_handler(engine: Engine, port_getter):
    class Handler(BaseHTTPRequestHandler):
        server_version = "realX/" + __version__

        def log_message(self, *args) -> None:  # quiet
            pass

        # security -------------------------------------------------------------
        def _local_host(self) -> bool:
            host = (self.headers.get("Host") or "").lower()
            port = port_getter()
            return host in (f"127.0.0.1:{port}", f"localhost:{port}")

        def _same_origin(self) -> bool:
            origin = self.headers.get("Origin")
            if origin is None:
                return True
            return origin.lower() in (f"http://127.0.0.1:{port_getter()}", f"http://localhost:{port_getter()}")

        def _deny(self, code: int, msg: str) -> None:
            body = json.dumps({"error": msg}).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def _json(self, payload: dict, code: int = 200) -> None:
            body = json.dumps(payload).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def _body(self, limit: int) -> bytes:
            n = int(self.headers.get("Content-Length") or 0)
            if n < 0 or n > limit:
                raise ValueError("request body too large")
            return self.rfile.read(n)

        # routes ---------------------------------------------------------------
        def do_GET(self) -> None:
            if not self._local_host():
                return self._deny(403, "forbidden host")
            path = urlparse(self.path).path
            if path == "/":
                page = _page()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Security-Policy", "default-src 'self'; img-src 'self' blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'")
                self.send_header("X-Content-Type-Options", "nosniff")
                self.send_header("Content-Length", str(len(page)))
                self.end_headers()
                self.wfile.write(page)
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
            self.send_header("Content-Type", "multipart/x-mixed-replace; boundary=frame")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            seq = -1
            try:
                while True:
                    jpeg, new = engine.wait_frame(seq)
                    if jpeg is None or new == seq:
                        continue
                    seq = new
                    self.wfile.write(b"--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %d\r\n\r\n" % len(jpeg))
                    self.wfile.write(jpeg)
                    self.wfile.write(b"\r\n")
            except (BrokenPipeError, ConnectionResetError, OSError):
                return

        def do_POST(self) -> None:
            if not self._local_host() or not self._same_origin():
                return self._deny(403, "forbidden origin")
            parsed = urlparse(self.path)
            try:
                if parsed.path == "/api/config":
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
                        tone = (0.4 * np.sin(2 * np.pi * 220 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 2 * t))).astype(np.float32)
                        data = offline.wav_bytes(tone, 16000)
                    out = offline.convert_wav_bytes(data, semitones)
                    self.send_response(200)
                    self.send_header("Content-Type", "audio/wav")
                    self.send_header("Content-Length", str(len(out)))
                    self.end_headers()
                    self.wfile.write(out)
                else:
                    self._deny(404, "not found")
            except (ValueError, json.JSONDecodeError) as exc:
                self._deny(400, str(exc))

    return Handler


class Server:
    def __init__(self, engine: Engine, port: int = 8765) -> None:
        self.engine = engine
        self._httpd = ThreadingHTTPServer(("127.0.0.1", port), make_handler(engine, lambda: self.port))
        self._httpd.daemon_threads = True
        self._thread: threading.Thread | None = None

    @property
    def port(self) -> int:
        return self._httpd.server_address[1]

    def start(self) -> None:
        self.engine.start()
        self._thread = threading.Thread(target=self._httpd.serve_forever, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._httpd.shutdown()
        self._httpd.server_close()
        self.engine.stop()
