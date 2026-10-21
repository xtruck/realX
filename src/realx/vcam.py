"""A virtual camera output: realX's picture appears as a camera in Zoom, Meet, OBS and so on.

Safety, in the order it is applied to every frame that leaves through here
    * Off unless the owner turns it on (`VirtualCameraConfig.enabled`, default False). There is no switch outside the settings object.
    * The visible "DIGITAL HOST" bar and the provenance watermark are drawn on every frame *here*, after resizing and
      immediately before the backend sees the pixels, whatever the engine did before. If either step fails the frame is
      dropped, never sent bare. Measured through OBS's camera: the bar survives the YUV conversion, the (least-significant-bit)
      watermark does not, so the visible bar is what protects this output.
    * Nothing leaves the computer: the backends hand pixels to a camera driver on this PC.

Threading: the engine calls `offer(frame)`, which only stores the newest frame (latest wins) and returns at once. A
separate thread resizes, marks and sends. A slow or stuck driver therefore drops frames; it cannot slow the engine.

Backends
    pyvirtualcam  OBS Virtual Camera (needs OBS installed) or Unity Capture. `pip install pyvirtualcam` (GPL-2.0).
    softcam       the MIT-licensed Softcam DirectShow filter. Needs `softcam.dll` (built from github.com/tshino/softcam)
                  and the camera registered once with administrator rights. DirectShow only: apps that use the newer
                  Windows camera stack may not list it (see docs/SOFTCAM.md for the test table).
"""

from __future__ import annotations

import ctypes
import threading
import time
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import numpy as np

from realx import log as rlog
from realx.safety import watermark
from realx.stages.builtin import Disclosure
from realx.types import FrameContext

log = rlog.get_logger("vcam")

BACKENDS = ("pyvirtualcam", "softcam")
MARK_PAYLOAD = b"realx-vcam-1"
DEFAULT_LABEL_NAME = "realX avatar"


class VcamError(RuntimeError):
    """The virtual camera cannot start or send. Messages are fixed words plus the backend name, never pixels."""

    def __init__(self, code: str, message: str = "") -> None:
        super().__init__(message or code)
        self.code = code


@dataclass(frozen=True)
class VirtualCameraConfig:
    enabled: bool = False
    backend: str = "pyvirtualcam"
    width: int = 1280
    height: int = 720
    fps: float = 30.0
    label_name: str = DEFAULT_LABEL_NAME
    softcam_dll: str | None = None  # absolute path to softcam.dll; required for the softcam backend
    watermark_key: bytes | None = None

    def __post_init__(self) -> None:
        if self.backend not in BACKENDS:
            raise ValueError(f"backend must be one of {BACKENDS}")
        if not (16 <= self.width <= 3840 and 16 <= self.height <= 2160) or self.width % 4 or self.height % 4:
            raise ValueError("width and height must be 16..3840 / 16..2160 and multiples of four")
        if not 1 <= self.fps <= 120:
            raise ValueError("fps must be 1..120")
        if not str(self.label_name).strip():
            raise ValueError("label_name must not be empty")


class Backend(Protocol):
    name: str

    def open(self, width: int, height: int, fps: float) -> None: ...
    def send(self, frame_rgb: np.ndarray) -> None: ...
    def connected(self) -> bool | None: ...
    def close(self) -> None: ...


class PyVirtualCamBackend:
    name = "pyvirtualcam"

    def __init__(self) -> None:
        self._cam = None

    def open(self, width: int, height: int, fps: float) -> None:
        try:
            import pyvirtualcam
        except ImportError as exc:
            raise VcamError("backend_missing", "pyvirtualcam is not installed (pip install pyvirtualcam)") from exc
        try:
            self._cam = pyvirtualcam.Camera(width=width, height=height, fps=fps, fmt=pyvirtualcam.PixelFormat.RGB)
        except Exception as exc:  # the library raises RuntimeError for "no virtual camera found"
            raise VcamError("device_unavailable", f"pyvirtualcam could not open a virtual camera: {type(exc).__name__}") from exc

    def send(self, frame_rgb: np.ndarray) -> None:
        assert self._cam is not None
        self._cam.send(frame_rgb)

    def connected(self) -> bool | None:
        return None  # pyvirtualcam cannot tell whether an application is reading

    def close(self) -> None:
        cam, self._cam = self._cam, None
        if cam is not None:
            try:
                cam.close()
            except Exception:
                log.debug("closing the virtual camera failed", exc_info=True)


class SoftcamBackend:
    name = "softcam"

    def __init__(self, dll_path: str | None) -> None:
        self._dll_path = dll_path
        self._lib: ctypes.CDLL | None = None
        self._cam = None
        self._buf = None

    def open(self, width: int, height: int, fps: float) -> None:
        if not self._dll_path or not Path(self._dll_path).is_absolute() or not Path(self._dll_path).is_file():
            raise VcamError("backend_missing", "softcam.dll was not found; give its absolute path")
        try:
            lib = ctypes.CDLL(self._dll_path)  # cdecl, as declared in softcam.h
        except OSError as exc:
            raise VcamError("backend_missing", "softcam.dll could not be loaded (32/64-bit mismatch?)") from exc
        lib.scCreateCamera.restype = ctypes.c_void_p
        lib.scCreateCamera.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_float]
        lib.scDeleteCamera.argtypes = [ctypes.c_void_p]
        lib.scSendFrame.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
        lib.scIsConnected.restype = ctypes.c_bool
        lib.scIsConnected.argtypes = [ctypes.c_void_p]
        cam = lib.scCreateCamera(width, height, ctypes.c_float(0.0))  # 0 = no pacing: realX decides the rate
        if not cam:
            raise VcamError("device_unavailable", "softcam could not create the camera (another instance may exist)")
        self._lib, self._cam = lib, cam
        self._buf = np.empty((height, width, 3), np.uint8)

    def send(self, frame_rgb: np.ndarray) -> None:
        assert self._lib is not None and self._buf is not None
        self._buf[:, :, 0] = frame_rgb[:, :, 2]  # Softcam wants 24-bit BGR
        self._buf[:, :, 1] = frame_rgb[:, :, 1]
        self._buf[:, :, 2] = frame_rgb[:, :, 0]
        self._lib.scSendFrame(self._cam, self._buf.ctypes.data_as(ctypes.c_void_p))

    def connected(self) -> bool | None:
        return bool(self._lib.scIsConnected(self._cam)) if self._lib is not None and self._cam else None

    def close(self) -> None:
        lib, cam = self._lib, self._cam
        self._lib = self._cam = self._buf = None
        if lib is not None and cam:
            try:
                lib.scDeleteCamera(cam)
            except Exception:
                log.debug("deleting the softcam camera failed", exc_info=True)


def make_backend(config: VirtualCameraConfig) -> Backend:
    if config.backend == "softcam":
        return SoftcamBackend(config.softcam_dll)
    return PyVirtualCamBackend()


def _fit(frame: np.ndarray, width: int, height: int) -> np.ndarray:
    """Scale to fit inside width x height, keep the aspect ratio, pad with black."""
    import cv2

    h, w = frame.shape[:2]
    if (w, h) == (width, height):
        return frame
    scale = min(width / w, height / h)
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    resized = cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR)
    canvas = np.zeros((height, width, 3), np.uint8)
    y0, x0 = (height - nh) // 2, (width - nw) // 2
    canvas[y0 : y0 + nh, x0 : x0 + nw] = resized
    return canvas


class VirtualCamera:
    def __init__(self, config: VirtualCameraConfig, backend_factory: Callable[[VirtualCameraConfig], Backend] = make_backend,
                 clock: Callable[[], float] = time.perf_counter) -> None:
        self.config = config
        self._factory = backend_factory
        self._clock = clock
        self._backend: Backend | None = None
        self._cond = threading.Condition()
        self._latest: np.ndarray | None = None
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._label = Disclosure(config.label_name)
        self._state = "off"
        self._error: str | None = None
        self._counts = {"offered": 0, "sent": 0, "dropped": 0, "failed": 0}

    # -- lifecycle ----------------------------------------------------------------------------------------------

    def start(self) -> dict:
        """Open the backend and start sending. A refusal is reported in the status, not raised: the engine goes on without it."""
        if not self.config.enabled:
            return self.status()
        if self._thread and self._thread.is_alive():
            return self.status()
        try:
            backend = self._factory(self.config)
            backend.open(self.config.width, self.config.height, self.config.fps)
        except VcamError as exc:
            self._state, self._error = "error", exc.code
            log.warning("virtual camera not started: %s (%s)", exc.code, self.config.backend)
            return self.status()
        self._backend = backend
        self._stop.clear()
        self._state, self._error = "running", None
        self._thread = threading.Thread(target=self._loop, name="realx-vcam", daemon=True)
        self._thread.start()
        log.info("virtual camera running: %s %dx%d @ %g fps", backend.name, self.config.width, self.config.height, self.config.fps)
        return self.status()

    def stop(self) -> None:
        self._stop.set()
        with self._cond:
            self._cond.notify_all()
        if self._thread:
            self._thread.join(timeout=3)
        backend, self._backend = self._backend, None
        if backend is not None:
            backend.close()
        if self._state != "error":
            self._state = "off"

    # -- engine side --------------------------------------------------------------------------------------------

    def offer(self, frame_rgb: np.ndarray) -> None:
        """Hand over the newest picture. Never blocks; an unsent older picture is replaced and counted as dropped."""
        if self._state != "running":
            return
        with self._cond:
            if self._latest is not None:
                self._counts["dropped"] += 1
            self._latest = frame_rgb
            self._counts["offered"] += 1
            self._cond.notify()

    def status(self) -> dict:
        backend = self._backend
        connected = None
        try:
            connected = backend.connected() if backend is not None else None
        except Exception:
            connected = None
        return {"enabled": self.config.enabled, "state": self._state, "error": self._error, "backend": self.config.backend,
                "size": [self.config.width, self.config.height], "fps": self.config.fps, "app_connected": connected, **self._counts}

    # -- sender thread ------------------------------------------------------------------------------------------

    def prepare(self, frame_rgb: np.ndarray) -> np.ndarray:
        """Resize, then draw the label and the watermark. Public so the tests can check exactly what would be sent."""
        if frame_rgb.dtype != np.uint8 or frame_rgb.ndim != 3 or frame_rgb.shape[2] != 3:
            raise VcamError("bad_frame", "frame must be HxWx3 uint8 RGB")
        ctx = FrameContext(pixels=_fit(np.ascontiguousarray(frame_rgb), self.config.width, self.config.height).copy())
        ctx = self._label.process(ctx)
        ctx.pixels = watermark.embed(ctx.pixels, MARK_PAYLOAD, self.config.watermark_key)
        return ctx.pixels

    def _loop(self) -> None:
        period = 1.0 / self.config.fps
        next_at = self._clock()
        while not self._stop.is_set():
            with self._cond:
                while self._latest is None and not self._stop.is_set():
                    self._cond.wait(0.5)
                frame, self._latest = self._latest, None
            if frame is None or self._stop.is_set():
                continue
            try:
                out = self.prepare(frame)
                assert self._backend is not None
                self._backend.send(out)
                self._counts["sent"] += 1
            except Exception as exc:  # a bare frame is never sent: a failed prepare drops the frame
                self._counts["failed"] += 1
                code = exc.code if isinstance(exc, VcamError) else type(exc).__name__
                if self._counts["failed"] == 1 or self._counts["failed"] % 300 == 0:
                    log.warning("virtual camera frame not sent: %s (%d so far)", code, self._counts["failed"])
                self._error = code
            next_at += period
            wait = next_at - self._clock()
            if wait > 0:
                self._stop.wait(wait)
            else:
                next_at = self._clock()  # behind schedule: do not try to catch up with a burst
