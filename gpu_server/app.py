"""HTTP server for the rented GPU: POST /v1/frame takes one JPEG and answers one JPEG.

Guard rails on this side (docs/DECISION-PATH-B.md):
  G3  every request needs the bearer token (constant-time compare); the token comes from the caller, is never logged
  G4  ephemeral instance: `startup_check` refuses to start unless the operator states the instance is ephemeral and the data
      directory is empty; this module never writes a frame (or anything else) to disk
  G5  only the one route, a bounded body, a valid consent-id shape; nothing is stored (the server ignores other headers,
      such as those a TLS proxy adds, and never copies a request header into the answer)
  G9  logs hold the peer, byte counts and latency, never pixels or tokens

Binding: 127.0.0.1 by default. The operator puts TLS in front (a reverse proxy or the provider's HTTPS port); the client refuses
plain http to anything but the loopback tests.
"""

from __future__ import annotations

import hmac
import logging
import re
import threading
import time
from dataclasses import dataclass
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Protocol

import cv2
import numpy as np

log = logging.getLogger("realx.gpu_server")

_CONSENT_OK = re.compile(r"[0-9a-f]{32}")


class FrameFilter(Protocol):
    """What the server runs on each frame: RGB uint8 in, RGB uint8 of the same size out."""

    def process(self, frame_rgb: np.ndarray) -> np.ndarray: ...


class PassThrough:
    """Neutral filter for the transport tests and the latency measurement: the picture comes back unchanged."""

    def process(self, frame_rgb: np.ndarray) -> np.ndarray:
        return frame_rgb


@dataclass
class ServerConfig:
    token: str
    host: str = "127.0.0.1"
    port: int = 8443
    max_body: int = 400_000
    max_dim: int = 1280
    jpeg_quality: int = 85
    ephemeral: bool = False  # the operator's statement that this instance is created for one session and destroyed after
    data_dir: str | None = None  # must be empty or missing; the server never writes there


def startup_check(config: ServerConfig) -> list[str]:
    """G4: return the reasons this instance must not start (empty list means fine)."""
    problems: list[str] = []
    if not config.ephemeral:
        problems.append("the instance is not declared ephemeral (create it per session, destroy it after, no snapshot)")
    if len(config.token) < 16:
        problems.append("the session token is shorter than 16 characters")
    if config.data_dir:
        path = Path(config.data_dir)
        if path.exists() and any(path.iterdir()):
            problems.append("the data directory is not empty: frames must never be kept")
    return problems


class GpuServer:
    def __init__(self, config: ServerConfig, frame_filter: FrameFilter | None = None, enforce_startup_check: bool = True) -> None:
        if enforce_startup_check:
            problems = startup_check(config)
            if problems:
                raise RuntimeError("startup check failed: " + "; ".join(problems))
        self.config = config
        self.filter = frame_filter or PassThrough()
        self._httpd = ThreadingHTTPServer((config.host, config.port), self._handler())
        self._httpd.daemon_threads = True
        self.port = self._httpd.server_address[1]
        self._thread: threading.Thread | None = None

    def start(self) -> GpuServer:
        self._thread = threading.Thread(target=self._httpd.serve_forever, daemon=True)
        self._thread.start()
        return self

    def stop(self) -> None:
        self._httpd.shutdown()
        self._httpd.server_close()

    def serve_forever(self) -> None:
        self._httpd.serve_forever()

    def _handler(self):
        server = self

        class Handler(BaseHTTPRequestHandler):
            protocol_version = "HTTP/1.1"
            timeout = 10

            def log_message(self, fmt, *args):  # no default access log: it could hold a path with data
                pass

            _unread = 0

            def _drain(self) -> None:
                """Read the rest of a small request body before an early refusal, so the client gets the answer, not a reset."""
                left, self._unread = self._unread, 0
                while left > 0:
                    chunk = self.rfile.read(min(65536, left))
                    if not chunk:
                        break
                    left -= len(chunk)

            def _reply(self, status: int, body: bytes = b"", ctype: str = "text/plain") -> None:
                self._drain()
                self.send_response(status)
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-store")
                self.send_header("Connection", "close")
                self.end_headers()
                self.wfile.write(body)
                self.close_connection = True

            def do_GET(self):
                self._reply(405)

            do_PUT = do_DELETE = do_PATCH = do_GET

            def do_POST(self):
                t0 = time.monotonic()
                cfg = server.config
                declared = self.headers.get("Content-Length", "")
                self._unread = int(declared) if declared.isdigit() and int(declared) <= cfg.max_body else 0
                if self.path != "/v1/frame":
                    return self._reply(404)
                auth = self.headers.get("Authorization", "")
                expected = "Bearer " + cfg.token
                if not hmac.compare_digest(auth.encode("utf-8", "replace"), expected.encode("utf-8")):
                    return self._reply(401)
                if not _CONSENT_OK.fullmatch(self.headers.get("X-Consent-Id", "")):
                    return self._reply(400)
                if self.headers.get("Content-Type", "").split(";")[0].strip().lower() != "image/jpeg":
                    return self._reply(415)
                length = self.headers.get("Content-Length", "")
                if not length.isdigit() or int(length) == 0:
                    return self._reply(400)
                if int(length) > cfg.max_body:
                    return self._reply(413)
                body = self.rfile.read(int(length))
                self._unread = 0
                if len(body) != int(length) or body[:3] != b"\xff\xd8\xff":
                    return self._reply(400)
                arr = cv2.imdecode(np.frombuffer(body, dtype=np.uint8), cv2.IMREAD_COLOR)
                if arr is None or arr.ndim != 3 or max(arr.shape[:2]) > cfg.max_dim:
                    return self._reply(400)
                frame = cv2.cvtColor(arr, cv2.COLOR_BGR2RGB)
                try:
                    out = server.filter.process(frame)
                    ok = isinstance(out, np.ndarray) and out.dtype == np.uint8 and out.shape == frame.shape
                    ok_enc, buf = cv2.imencode(".jpg", cv2.cvtColor(out, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, cfg.jpeg_quality]) if ok else (False, None)
                except Exception:
                    log.exception("filter failed")
                    return self._reply(500)
                if not ok_enc:
                    return self._reply(500)
                payload = buf.tobytes()
                self._reply(200, payload, "image/jpeg")
                log.info("frame peer=%s in=%d out=%d ms=%.1f", self.client_address[0], len(body), len(payload), (time.monotonic() - t0) * 1000)

        return Handler
