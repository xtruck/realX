"""The local end of the Path B link: sends one JPEG frame to the rented GPU and gets one JPEG frame back.

What the guard rails (docs/DECISION-PATH-B.md) turn into here:
  G1  off unless `GpuLinkConfig.enabled`; `status()` says whether frames may leave the machine
  G2  https only with verified TLS, own socket code (no proxy variables, no redirects)
  G3  the bearer token is read from the environment at send time and never kept, logged or put in an error
  G5  the request is a JPEG body plus a fixed set of headers: the consent id, a sequence number, nothing else.
      One frame in flight; a frame that arrives while another is out, or faster than `max_fps`, is dropped
  G6  the answer is bytes from a stranger: status, type, length, JPEG decode and size are all checked here,
      and the caller draws the label and watermark afterwards (see `GpuLinkStage`)
  G7  one attempt per frame, at most `budget_s` (<= 1 s) in total, then None so the caller shows the local picture
  G8  the consent check runs before every send, and again before an answer is used
  G9  logs hold the host, byte counts and latency, never pixels or tokens
"""

from __future__ import annotations

import os
import re
import socket
import ssl
import threading
import time
from collections.abc import Callable

import numpy as np

from realx import log as rlog
from realx.gpulink.config import GpuLinkConfig

log = rlog.get_logger("gpulink")

_TOKEN_OK = re.compile(r"[\x21-\x7e]{8,4096}")  # printable ASCII, no spaces or line breaks (no header injection)
_CONSENT_OK = re.compile(r"[0-9a-f]{32}")
_MAX_HEAD = 16384


class GpuLinkError(RuntimeError):
    """A send failed. `code` is a short fixed word; the message never holds pixels, tokens or server text."""

    def __init__(self, code: str) -> None:
        super().__init__(code)
        self.code = code


class GpuLinkClient:
    def __init__(self, config: GpuLinkConfig, consent_check: Callable[[str], bool], clock: Callable[[], float] = time.perf_counter) -> None:
        self.config = config
        self._consent_check = consent_check
        self._clock = clock
        self._lock = threading.Lock()
        self._stopped = False
        self._inflight: threading.Thread | None = None
        self._last_send = -1e9
        self._seq = 0
        self._stats: dict = {"sent": 0, "received": 0, "dropped": 0, "failed": 0, "bytes_out": 0, "bytes_in": 0,
                             "last_latency_ms": None, "last_error": None}

    # -- state --------------------------------------------------------------------------------------------------

    def stop(self) -> None:
        """End the session: no frame leaves after this (G1/G8)."""
        self._stopped = True

    def status(self) -> dict:
        """What the UI shows (G1): whether frames may leave this machine, to which host, and the counters."""
        live = self.config.enabled and not self._stopped
        return {"frames_leaving_machine": live, "host": self.config.host if live else None, "enabled": self.config.enabled,
                "stopped": self._stopped, **self._stats}

    def _ssl_context(self) -> ssl.SSLContext:
        ctx = ssl.create_default_context()  # verifies the chain and the host name
        ctx.minimum_version = ssl.TLSVersion.TLSv1_2
        return ctx

    # -- sending ------------------------------------------------------------------------------------------------

    def send(self, frame_rgb: np.ndarray, consent_id: str) -> np.ndarray | None:
        """Return the processed RGB frame, or None when the caller should keep its own picture. Never raises for link trouble."""
        cfg = self.config
        if not cfg.enabled or self._stopped:
            return None
        if not _CONSENT_OK.fullmatch(str(consent_id)) or not self._consent_ok(consent_id):
            self._note("consent")
            return None
        now = self._clock()
        with self._lock:
            busy = self._inflight is not None and self._inflight.is_alive()
            if busy or now - self._last_send < 1.0 / cfg.max_fps:
                self._stats["dropped"] += 1
                return None
            self._last_send = now
            result: list = []
            worker = threading.Thread(target=self._worker, args=(frame_rgb, consent_id, result), daemon=True)
            self._inflight = worker
            worker.start()
        worker.join(cfg.budget_s)
        if worker.is_alive():
            self._note("timeout")
            return None
        if not result or isinstance(result[0], GpuLinkError):
            self._note(result[0].code if result else "internal")
            return None
        if self._stopped or not self._consent_ok(consent_id):  # revoked while the frame was out: do not use the answer
            self._note("consent")
            return None
        return result[0]

    def _consent_ok(self, consent_id: str) -> bool:
        try:
            return bool(self._consent_check(consent_id))
        except Exception:  # a broken check is a "no"
            return False

    def _note(self, code: str) -> None:
        self._stats["failed"] += 1
        self._stats["last_error"] = code
        log.warning("gpulink frame not used: %s (host=%s)", code, self.config.host)

    def _worker(self, frame_rgb: np.ndarray, consent_id: str, out: list) -> None:
        try:
            out.append(self._exchange(frame_rgb, consent_id))
        except GpuLinkError as exc:
            out.append(exc)
        except Exception:
            out.append(GpuLinkError("internal"))

    def _exchange(self, frame_rgb: np.ndarray, consent_id: str) -> np.ndarray:
        import cv2

        cfg = self.config
        deadline = self._clock() + cfg.budget_s
        if frame_rgb.dtype != np.uint8 or frame_rgb.ndim != 3 or frame_rgb.shape[2] != 3:
            raise GpuLinkError("frame-size")
        h, w = frame_rgb.shape[:2]
        if max(h, w) > cfg.max_dim:
            raise GpuLinkError("frame-size")
        ok, buf = cv2.imencode(".jpg", cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, int(cfg.jpeg_quality)])
        body = buf.tobytes() if ok else b""
        if not body or len(body) > cfg.max_jpeg_bytes:
            raise GpuLinkError("frame-size")
        token = os.environ.get(cfg.token_env, "")  # read now, used now, not stored (G3)
        if not _TOKEN_OK.fullmatch(token):
            raise GpuLinkError("no-token")
        self._seq += 1
        head = (f"POST {cfg.path} HTTP/1.1\r\nHost: {cfg.host}\r\nAuthorization: Bearer {token}\r\nContent-Type: image/jpeg\r\n"
                f"Content-Length: {len(body)}\r\nX-Consent-Id: {consent_id}\r\nX-Seq: {self._seq}\r\nConnection: close\r\n\r\n").encode("ascii")
        del token
        t0 = self._clock()
        sock = self._connect(deadline)
        try:
            self._sendall(sock, head + body, deadline)
            status, ctype, payload = self._read_response(sock, deadline)
        finally:
            try:
                sock.close()
            except OSError:
                pass
        if status != 200:
            raise GpuLinkError(f"http-{status}" if status in (401, 403, 404, 413, 429, 500, 502, 503) else "http-other")
        if ctype != "image/jpeg":
            raise GpuLinkError("bad-type")
        frame = self._decode(payload, (h, w))
        self._stats["sent"] += 1
        self._stats["received"] += 1
        self._stats["bytes_out"] += len(head) + len(body)
        self._stats["bytes_in"] += len(payload)
        self._stats["last_latency_ms"] = round((self._clock() - t0) * 1000, 1)
        log.info("gpulink frame host=%s out=%d in=%d ms=%s", cfg.host, len(body), len(payload), self._stats["last_latency_ms"])
        return frame

    # -- socket work with one overall deadline ------------------------------------------------------------------

    def _left(self, deadline: float) -> float:
        left = deadline - self._clock()
        if left <= 0:
            raise GpuLinkError("timeout")
        return left

    def _connect(self, deadline: float) -> socket.socket:
        cfg = self.config
        try:
            sock = socket.create_connection((cfg.host, cfg.port), timeout=self._left(deadline))
        except GpuLinkError:
            raise
        except socket.timeout as exc:
            raise GpuLinkError("timeout") from exc
        except OSError as exc:
            raise GpuLinkError("connect") from exc
        if cfg.tls:
            try:
                sock.settimeout(self._left(deadline))
                sock = self._ssl_context().wrap_socket(sock, server_hostname=cfg.host)
            except GpuLinkError:
                sock.close()
                raise
            except (ssl.SSLError, OSError) as exc:
                sock.close()
                raise GpuLinkError("tls") from exc
        return sock

    def _sendall(self, sock: socket.socket, data: bytes, deadline: float) -> None:
        try:
            sock.settimeout(self._left(deadline))
            sock.sendall(data)
        except GpuLinkError:
            raise
        except socket.timeout as exc:
            raise GpuLinkError("timeout") from exc
        except OSError as exc:
            raise GpuLinkError("send") from exc

    def _recv(self, sock: socket.socket, n: int, deadline: float) -> bytes:
        try:
            sock.settimeout(self._left(deadline))
            return sock.recv(n)
        except GpuLinkError:
            raise
        except socket.timeout as exc:
            raise GpuLinkError("timeout") from exc
        except OSError as exc:
            raise GpuLinkError("recv") from exc

    def _read_response(self, sock: socket.socket, deadline: float) -> tuple[int, str, bytes]:
        buf = b""
        while b"\r\n\r\n" not in buf:
            chunk = self._recv(sock, 4096, deadline)
            if not chunk:
                raise GpuLinkError("short-reply")
            buf += chunk
            if len(buf) > _MAX_HEAD:
                raise GpuLinkError("bad-reply")
        head, _, body = buf.partition(b"\r\n\r\n")
        lines = head.decode("latin-1").split("\r\n")
        m = re.fullmatch(r"HTTP/1\.[01] (\d{3})(?: .*)?", lines[0])
        if not m:
            raise GpuLinkError("bad-reply")
        headers: dict[str, str] = {}
        for line in lines[1:]:
            k, sep, v = line.partition(":")
            key = k.strip().lower()
            if not sep or key in headers:  # a malformed or repeated header is never legitimate here
                raise GpuLinkError("bad-reply")
            headers[key] = v.strip()
        status = int(m.group(1))
        if status != 200:
            return status, "", b""  # redirects and errors: nothing is followed and no body is read
        if "transfer-encoding" in headers or "content-encoding" in headers:
            raise GpuLinkError("bad-reply")
        length = headers.get("content-length", "")
        if not length.isdigit() or int(length) == 0 or int(length) > self.config.max_jpeg_bytes:
            raise GpuLinkError("too-big")
        need = int(length)
        while len(body) < need:
            chunk = self._recv(sock, min(65536, need - len(body)), deadline)
            if not chunk:
                raise GpuLinkError("short-reply")
            body += chunk
        if len(body) != need:
            raise GpuLinkError("bad-reply")
        ctype = headers.get("content-type", "").split(";")[0].strip().lower()
        return status, ctype, body

    def _decode(self, payload: bytes, expect_hw: tuple[int, int]) -> np.ndarray:
        import cv2

        if payload[:3] != b"\xff\xd8\xff":
            raise GpuLinkError("bad-image")
        arr = cv2.imdecode(np.frombuffer(payload, dtype=np.uint8), cv2.IMREAD_COLOR)
        if arr is None or arr.ndim != 3 or arr.shape[2] != 3:
            raise GpuLinkError("bad-image")
        if arr.shape[:2] != expect_hw:  # the answer must be the size we sent: nothing else is composited
            raise GpuLinkError("bad-size")
        return np.ascontiguousarray(cv2.cvtColor(arr, cv2.COLOR_BGR2RGB))
