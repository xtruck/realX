"""Shared helpers for the Path B link tests: real loopback sockets, no mocks of the network.

`RawServer` is a tiny TCP server that records the exact bytes of every request and answers with whatever the
test scripts, so the tests can look at what really crossed the socket (G10) and at hostile replies (G6).
"""

from __future__ import annotations

import socket
import sys
import threading
from collections.abc import Callable
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:  # gpu_server lives at the repo top level, next to src/
    sys.path.insert(0, str(ROOT))

TOKEN = "gl-SECRET-0123456789abcdef"
CONSENT_ID = "0123456789abcdef0123456789abcdef"


def make_frame(w: int = 320, h: int = 240, seed: int = 1) -> np.ndarray:
    """A smooth, compressible RGB test picture (a gradient plus a disc), so JPEGs stay small."""
    y, x = np.mgrid[0:h, 0:w]
    frame = np.stack([x * 255 // max(w - 1, 1), y * 255 // max(h - 1, 1), np.full_like(x, (seed * 40) % 255)], axis=2)
    frame = frame.astype(np.uint8)
    cv2.circle(frame, (w // 2, h // 2), min(w, h) // 4, (250, 200, 30), -1)
    return frame


def jpeg_of(frame_rgb: np.ndarray, quality: int = 80) -> bytes:
    ok, buf = cv2.imencode(".jpg", cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, quality])
    assert ok
    return buf.tobytes()


def http_response(status: int, body: bytes = b"", ctype: str | None = "image/jpeg", extra: str = "") -> bytes:
    head = f"HTTP/1.1 {status} X\r\nContent-Length: {len(body)}\r\nConnection: close\r\n{extra}"
    if ctype:
        head += f"Content-Type: {ctype}\r\n"
    return head.encode() + b"\r\n" + body


def split_request(raw: bytes) -> tuple[str, dict[str, str], bytes]:
    head, _, body = raw.partition(b"\r\n\r\n")
    lines = head.decode("latin-1").split("\r\n")
    headers = {}
    for line in lines[1:]:
        k, _, v = line.partition(":")
        headers[k.strip().lower()] = v.strip()
    return lines[0], headers, body


def echo_jpeg(conn: socket.socket, raw: bytes) -> None:
    """A responder that behaves like a passthrough GPU: it sends the JPEG it received straight back."""
    conn.sendall(http_response(200, split_request(raw)[2]))


class RawServer:
    def __init__(self, responder: Callable[[socket.socket, bytes], None] = echo_jpeg) -> None:
        self.responder = responder
        self.requests: list[bytes] = []
        self.connections = 0
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._sock = socket.socket()
        self._sock.bind(("127.0.0.1", 0))
        self._sock.listen(16)
        self.port = self._sock.getsockname()[1]
        threading.Thread(target=self._accept, daemon=True).start()

    @property
    def url(self) -> str:
        return f"http://127.0.0.1:{self.port}"

    def _accept(self) -> None:
        while not self._stop.is_set():
            try:
                conn, _ = self._sock.accept()
            except OSError:
                return
            with self._lock:
                self.connections += 1
            threading.Thread(target=self._handle, args=(conn,), daemon=True).start()

    def _handle(self, conn: socket.socket) -> None:
        try:
            conn.settimeout(5)
            buf = b""
            while b"\r\n\r\n" not in buf:
                chunk = conn.recv(65536)
                if not chunk:
                    return
                buf += chunk
            _, headers, body = split_request(buf)
            need = int(headers.get("content-length", "0"))
            while len(body) < need:
                chunk = conn.recv(65536)
                if not chunk:
                    break
                buf += chunk
                body += chunk
            with self._lock:
                self.requests.append(buf)
            self.responder(conn, buf)
        except OSError:
            pass
        finally:
            try:
                conn.close()
            except OSError:
                pass

    def close(self) -> None:
        self._stop.set()
        try:
            self._sock.close()
        except OSError:
            pass
