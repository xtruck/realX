"""Local control-room server: live preview, stats, controls and voice conversion.

Binds to 127.0.0.1 only. Defences against a hostile web page or local process:
a per-run access token on every route, exact Host match (DNS rebinding), Sec-Fetch-Site/Origin
checks (cross-site embedding and CSRF), strict CSP, request size and time limits, and a connection cap.

The access token matters because "127.0.0.1 only" keeps other computers out, not other programs or
users on this one: without it any local process could read the camera-derived preview or change the
studio's settings. It is random per run (or `REALX_TOKEN`, for a stable one), is carried as
`Authorization: Bearer`, the `realx_token` cookie (HttpOnly, SameSite=Strict) or `?token=` on GET only,
and the first page load swaps the query form for the cookie and drops it from the address bar.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import threading
import time
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from importlib import resources
from typing import NamedTuple
from urllib.parse import parse_qs, urlencode, urlparse

import numpy as np

from realx import __version__
from realx.diag import Diagnostics
from realx.audio import offline, presets
from realx.models import BLOCKED, MANIFEST, ModelError, ensure_model
from realx import ws
from realx.pipeline import Pipeline
from realx.studio import StudioController
from realx.rig import EMOTES, MAX_BODY_BYTES, hello_message, parse_body_message, rig_message
from realx.sources import MOTIONS, SourceError, SyntheticScene, camera_frames
from realx.stages.background import MAX_IMAGE_BYTES, BackgroundError, decode_background
from realx.stages import create
from realx import hardware
from realx import log as rlog

log = rlog.get_logger("server")

# "body": the browser tracks the camera (full body) and publishes it; the Python side releases the camera
MODES = ("avatar", "character", "boxes", "original", "body")
BACKGROUNDS = ("off", "blur", "photo")
BACKGROUND_THUMB_PATH = "/avatar/background.png"
BACKGROUND_THUMB_SIDE = 32  # px on the long edge
MAX_JSON = 4096
MAX_AVATAR_BYTES = 32 * 1024 * 1024
MAX_CONNECTIONS = 16
SOCKET_TIMEOUT = 15.0
BODY_MAX_AGE = 1.0            # seconds: an older body message is never (re)sent to a viewer
PUBLISH_IDLE_SECONDS = 15.0   # a publisher that sends nothing this long is dropped
PUBLISH_RATE_LIMIT = 200      # messages per second from one publisher before it is cut off
HEARTBEAT_SECONDS = 0.1       # rig messages while the engine has no video of its own (body mode)
TOKEN_COOKIE = "realx_token"
TOKEN_ENV = "REALX_TOKEN"
_TOKEN_SHAPE = re.compile(r"[A-Za-z0-9._~-]{16,128}")  # cookie- and URL-safe without escaping
DRAIN_LIMIT = 64 * 1024  # an early error reply first reads up to this much of the request body (see _drain)
PERMISSIONS = "camera=(self), microphone=(), geolocation=()"  # only this origin's own pages may ask for the camera
PERMISSIONS_WITH_MIC = "camera=(self), microphone=(self), geolocation=()"


def resolve_token(explicit: str | None = None) -> str:
    """The access token: the argument, else REALX_TOKEN, else a fresh random one."""
    token = explicit if explicit is not None else os.environ.get(TOKEN_ENV)
    if not token:
        return secrets.token_urlsafe(32)
    if not _TOKEN_SHAPE.fullmatch(token):
        raise ValueError("the access token must be 16-128 characters from A-Z a-z 0-9 . _ ~ -")
    return token


def permissions_for(query: str) -> str:
    """The microphone is off by default. A page asks for it by carrying a non-empty `mic` parameter,
    which the control room adds only after the user chooses a microphone; unchosen, nothing may use it."""
    return PERMISSIONS_WITH_MIC if (parse_qs(query).get("mic") or [""])[0] else PERMISSIONS
ASSET_MAX_AGE = 3600  # seconds: MediaPipe runtime and models are pinned by hash, so they cannot change within a release
MP_MODELS = ("mp_face", "mp_pose", "mp_hand")  # the only models /mp/models serves
_WASM_NAME = re.compile(r"[a-z0-9_]+\.(js|wasm)")
# onnxruntime-web's runtime, served from this origin because the CSP allows nothing else. Only the all-in-one "jsep" build
# (it runs both the WebGPU and the WebAssembly backends), under its exact file names.
_ORT_NAME = re.compile(r"ort-wasm-simd-threaded\.jsep\.(mjs|wasm)")

CSP = (
    "default-src 'none'; img-src 'self'; media-src 'self' blob:; connect-src 'self'; frame-src 'self'; "
    "style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'none'; form-action 'none'; "
    "object-src 'none'; frame-ancestors 'none'"
)


def dock_csp(port: int) -> str:
    """The OBS dock: its own script and styles, this server's API, one read-only WebSocket. Nothing else, and no framing."""
    sockets = f"ws://127.0.0.1:{port} ws://localhost:{port}"
    return (
        f"default-src 'none'; connect-src 'self' {sockets}; style-src 'self'; script-src 'self'; "
        "base-uri 'none'; form-action 'none'; object-src 'none'; frame-ancestors 'none'"
    )


def avatar_csp(port: int) -> str:
    """The avatar page loads its model, the MediaPipe runtime and models from this server, and one WebSocket.

    'wasm-unsafe-eval' lets it compile WebAssembly (the MediaPipe runtime) and nothing else; 'unsafe-eval' stays off.
    """
    sockets = f"ws://127.0.0.1:{port} ws://localhost:{port}"
    return (
        f"default-src 'none'; img-src 'self' blob: data:; connect-src 'self' {sockets}; "
        "style-src 'self' 'unsafe-inline'; script-src 'self' 'wasm-unsafe-eval'; base-uri 'none'; form-action 'none'; "
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


class Update(NamedTuple):
    """What a viewer socket may need to send: the newest rig and body messages, each with its own counter."""

    rev: int
    rig: str
    rig_seq: int
    body: str | None
    body_seq: int


class Engine:
    """Runs the video pipeline on a background thread and keeps the latest frame."""

    def __init__(self, source: str = "demo:dance", mode: str = "avatar", smoothing: float = 0.35, fps: float = 30.0):
        self.fps = fps
        self._dedup = rlog.Dedup()  # a fault that repeats on every retry is logged once
        self._lock = threading.Lock()
        self._cond = threading.Condition(self._lock)
        self._jpeg: bytes | None = None
        self._seq = 0
        self._rev = 0  # bumps on every change a viewer socket cares about: a frame, a heartbeat, a body message
        self._body: str | None = None  # newest validated body message from a tracking page
        self._body_seq = 0
        self._body_time = 0.0
        self._publishing = False
        self._viewers = 0
        self._rig = json.dumps(rig_message(0, 0.0, (0, 0), []))
        self._emote: tuple[str, int, float] | None = None  # name, id, time pressed
        self._epoch = secrets.token_hex(4)  # changes on every server start, so ids never collide across restarts
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._config = {"source": source, "mode": mode, "smoothing": smoothing, "background": "off", "blur": 41}
        self._bg_photo: np.ndarray | None = None  # kept in memory only, never written to disk
        self._mic_muted = False  # set from the OBS dock; the avatar page follows it
        self._voice_preset = ""  # the preset the dock chose ("" = none); the control room's converter starts from it
        self.token_fixed = False  # set by Server: True when the token was chosen (REALX_TOKEN) rather than made per run
        self._bg_version = 0  # counts photo changes; part of the thumbnail URL so a new photo is fetched anew
        self._bg_thumb: tuple[int, bytes] | None = None
        self._config_version = 0
        self._open_source: str | None = None
        self._ribbon: deque[int] = deque(maxlen=120)  # 0 lost, 1 detected, 2 predicted
        self._diag = Diagnostics()
        self._pipe: StudioController | None = None  # read only for per-stage timings and the studio state in stats()
        self._frames_src = None  # the open video source, read only for its capture figures
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
        allowed = {"source", "mode", "smoothing", "background", "blur"}
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
        if "background" in changes:
            if changes["background"] not in BACKGROUNDS:
                raise ValueError(f"background must be one of {BACKGROUNDS}")
            if changes["background"] == "photo" and self._bg_photo is None:
                raise ValueError("choose a background photo first")
            staged["background"] = changes["background"]
        if "blur" in changes:
            b = changes["blur"]
            if isinstance(b, bool) or not isinstance(b, int) or not 3 <= b <= 151:
                raise ValueError("blur must be a whole number between 3 and 151")
            staged["blur"] = b | 1  # the blur kernel must be odd
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

    def set_dock(self, changes: dict) -> dict:
        """Settings the OBS dock owns that need no pipeline rebuild: the microphone mute and the voice preset."""
        unknown = set(changes) - {"mic_muted", "voice"}
        if unknown:
            raise ValueError(f"unknown dock settings: {sorted(unknown)}")
        staged = {}
        if "mic_muted" in changes:
            if not isinstance(changes["mic_muted"], bool):
                raise ValueError("mic_muted must be true or false")
            staged["mic_muted"] = changes["mic_muted"]
        if "voice" in changes:
            v = changes["voice"]
            if not isinstance(v, str) or (v and v not in presets.PRESETS):
                raise ValueError(f"voice must be '' or one of {sorted(presets.PRESETS)}")
            staged["voice"] = v
        with self._lock:
            if "mic_muted" in staged:
                self._mic_muted = staged["mic_muted"]
            if "voice" in staged:
                self._voice_preset = staged["voice"]
            return self.dock_state()

    def dock_state(self) -> dict:  # caller holds the lock, or accepts a slightly stale read
        return {"mic_muted": self._mic_muted, "voice": self._voice_preset}

    def emote(self, name: str) -> None:
        """Play a short gesture on the character (wave, happy, surprised, bow)."""
        if name not in EMOTES:
            raise ValueError(f"emote must be one of {EMOTES}")
        with self._lock:
            self._emote = (name, (self._emote[1] + 1) if self._emote else 1, time.monotonic())

    def set_background(self, photo: np.ndarray) -> None:
        """Use this RGB photo behind the person. Rebuilds the pipeline to pick it up."""
        with self._lock:
            self._bg_photo = photo
            self._bg_version += 1
            self._config_version += 1

    def stats(self) -> dict:
        with self._lock:
            out = dict(self._stats)
            out["ribbon"] = list(self._ribbon)
            out["config"] = dict(self._config)
            out["version"] = __version__
            out["body"] = {"publishing": self._publishing, "viewers": self._viewers}
            out["dock"] = self.dock_state()
            out["security"] = {"token": "fixed" if self.token_fixed else "per-run", "watermark": True}   # never the token itself
            pipe, src = self._pipe, self._frames_src
        stage_ms = {name: t.mean_ms for name, t in list(pipe.timings.items())} if pipe is not None else {}
        capture = None
        grab = getattr(src, "capture_stats", None)
        if callable(grab):
            try:
                capture = grab()
            except Exception:  # diagnostics must never break a stats request
                capture = None
        out["diag"] = self._diag.snapshot(stage_ms, capture)
        status = getattr(pipe, "status", None)  # a plain Pipeline (tests, custom builds) has no studio state
        out["studio"] = status().as_dict() if callable(status) else None
        return out

    # -- full-body relay -------------------------------------------------------------
    def claim_publisher(self) -> bool:
        """One tracking page at a time may publish. False when someone already does."""
        with self._lock:
            if self._publishing:
                return False
            self._publishing = True
        log.info("a tracking page started publishing")
        return True

    def release_publisher(self) -> None:
        log.info("the tracking page stopped publishing")
        with self._cond:
            self._publishing = False
            self._body = None  # a gone tracker leaves no stale pose behind
            self._body_seq += 1
            self._rev += 1
            self._cond.notify_all()

    def publish_body(self, text: str) -> None:
        """Keep the newest validated body message (`parse_body_message` output) and wake the viewers."""
        with self._cond:
            self._body = text
            self._body_time = time.monotonic()
            self._body_seq += 1
            self._rev += 1
            self._cond.notify_all()

    def body_snapshot(self) -> str | None:
        with self._lock:
            return self._fresh_body()

    def _fresh_body(self) -> str | None:  # caller holds the lock
        if self._body is not None and time.monotonic() - self._body_time <= BODY_MAX_AGE:
            return self._body
        return None

    def viewer_joined(self) -> None:
        with self._lock:
            self._viewers += 1

    def viewer_left(self) -> None:
        with self._lock:
            self._viewers = max(0, self._viewers - 1)

    def wait_frame(self, last_seq: int, timeout: float = 2.0) -> tuple[bytes | None, int]:
        with self._cond:
            if self._seq == last_seq and not self._stop.is_set():
                self._cond.wait(timeout)
            return self._jpeg, self._seq

    def wait_rig(self, last_rev: int, timeout: float = 1.0) -> tuple[str, int]:
        """Latest rig message; blocks until something newer than `last_rev` happened or timeout."""
        update = self.wait_update(last_rev, timeout)
        return update.rig, update.rev

    def wait_update(self, last_rev: int, timeout: float = 1.0) -> Update:
        """Blocks until a frame, heartbeat or body message newer than `last_rev` exists, or timeout."""
        with self._cond:
            if self._rev == last_rev and not self._stop.is_set():
                self._cond.wait(timeout)
            return Update(self._rev, self._rig, self._seq, self._fresh_body(), self._body_seq)

    def _heartbeat(self) -> None:
        """Body mode has no video: keep rig messages (and so gestures and socket liveness) flowing."""
        now = time.perf_counter()
        with self._cond:
            self._jpeg = None  # no stale picture for the MJPEG stream
            self._seq += 1
            self._rev += 1
            self._rig = json.dumps(rig_message(self._seq, now, (0, 0), [], self._emote_state(), self._background_state(), self._mic_muted))
            self._cond.notify_all()

    def _background_state(self) -> dict | None:  # caller holds the lock (or is the only writer)
        """Tells the avatar page which photo is behind the person, only while that photo is in use."""
        if self._config["background"] != "photo" or self._bg_photo is None:
            return None
        return {"url": f"{BACKGROUND_THUMB_PATH}?v={self._bg_version}"}

    def background_thumb(self) -> bytes | None:
        """PNG of the active photo shrunk to {BACKGROUND_THUMB_SIDE} px: all the lighting needs, never the photo itself."""
        with self._lock:
            photo, version = (self._bg_photo, self._bg_version) if self._config["background"] == "photo" else (None, 0)
            cached = self._bg_thumb
        if photo is None:
            return None
        if cached and cached[0] == version:
            return cached[1]
        import cv2

        scale = BACKGROUND_THUMB_SIDE / max(photo.shape[:2])
        small = cv2.resize(photo, None, fx=min(1.0, scale), fy=min(1.0, scale), interpolation=cv2.INTER_AREA)
        ok, buf = cv2.imencode(".png", cv2.cvtColor(small, cv2.COLOR_RGB2BGR))
        if not ok:
            return None
        data = buf.tobytes()
        with self._lock:
            self._bg_thumb = (version, data)
        return data

    def _emote_state(self) -> dict | None:  # caller holds the lock (or is the only writer)
        if not self._emote:
            return None
        return {"name": self._emote[0], "id": f"{self._epoch}-{self._emote[1]}", "age": round(time.monotonic() - self._emote[2], 2)}

    # -- internals ----------------------------------------------------------------
    def _snapshot(self) -> tuple[dict, int]:
        with self._lock:  # config and its version must be read together
            return dict(self._config), self._config_version

    def _build(self, cfg: dict) -> StudioController:
        mode, background = cfg["mode"], cfg["background"]
        stages = []
        if mode != "original":  # the plain camera picture needs no tracking
            stages += [create("detect_yunet", score_threshold=0.3), create("track")]
            stages.append(create("one_euro", min_cutoff=_smoothing_to_cutoff(cfg["smoothing"]), beta=0.5))
            stages.append(create("rig"))  # the character renderer in the browser reads this
        if background != "off" and mode != "character":
            with self._lock:
                photo = self._bg_photo
            # cut the person out before anything is drawn on top of the picture
            stages.append(create("bg_replace", mode=background, image=photo, blur=cfg["blur"]))
        if mode == "avatar":
            stages.append(create("avatar"))
        elif mode == "boxes":
            stages.append(create("debug_boxes"))
        # AVATAR is the only state here: portrait mode needs REALX_ENABLE_PORTRAIT=1 and a consented image, and nothing
        # in the control room offers it yet. Strict pipelines mean only realX's own registered stages ever run.
        return StudioController(stages)

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
                log.debug("closing the video source failed", exc_info=True)  # best effort: the camera may already be gone

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
                    if cfg["mode"] == "body":
                        # the browser owns the camera now: let go of ours so it can be opened there
                        if pipe:
                            pipe.close()
                            pipe = None
                        if frames is not None:
                            self._close_source(frames)
                            frames, self._open_source = None, None
                        self._frames_src = self._pipe = None
                        version = current
                        self._set_error(None)
                        self._heartbeat()
                        backoff = 0.5
                        self._stop.wait(HEARTBEAT_SECONDS)
                        continue
                    if current != version:
                        if pipe:
                            pipe.close()
                            pipe = None
                        pipe = self._build(cfg)
                        pipe.setup()
                        self._pipe = pipe
                        if frames is None or cfg["source"] != self._open_source:
                            self._close_source(frames)
                            frames = self._open(cfg["source"])
                            self._frames_src = frames
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
                    captured = ctx.meta.get("captured_at")  # set by a camera: when the frame arrived
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
                    self._diag.source_back()
                    self._diag.frame(
                        None if captured is None else (t0 - captured) * 1000,
                        None if captured is None else (now - captured) * 1000,
                        latency,
                    )
                    with self._cond:
                        s = self._stats
                        s["fps"] = round(0.9 * s["fps"] + 0.1 * inst_fps if s["frames"] else inst_fps, 1)
                        s["latency_ms"] = round(0.9 * s["latency_ms"] + 0.1 * latency if s["frames"] else latency, 1)
                        s["faces"] = len(out.faces)
                        s["dropped"] += dropped
                        s["frames"] += 1
                        if s["error"]:
                            log.info("video is flowing again after: %s", rlog.clip(s["error"]))
                            self._dedup.forget(("source", s["error"]))  # a later repeat of the same fault is news again
                        s["error"] = None
                        self._ribbon.append(state)
                        self._jpeg = None if buf is None else buf.tobytes()
                        self._seq += 1
                        self._rev += 1
                        em = self._emote_state()
                        self._rig = json.dumps(rig_message(self._seq, now, (fw, fh), rig_faces, em, self._background_state(), self._mic_muted))
                        self._cond.notify_all()
                except (SourceError, StopIteration) as exc:
                    # camera unplugged or busy: say so, drop the dead generator, retry
                    reason = str(exc) or "The video source stopped."
                    self._set_error(reason)
                    self._diag.source_lost()
                    if self._dedup.first(("source", reason)):
                        log.warning("video source problem, retrying with backoff: %s", rlog.clip(reason))
                    self._close_source(frames)
                    frames, self._open_source, version = None, None, -1
                    self._stop.wait(backoff)
                    backoff = min(backoff * 2, 5.0)
                except Exception as exc:  # never let the engine thread die silently
                    self._set_error(f"{type(exc).__name__}: {exc}")
                    if self._dedup.first(("engine", type(exc).__name__, str(exc))):
                        log.error("engine error, rebuilding the pipeline: %s: %s", type(exc).__name__, rlog.clip(exc), exc_info=True)
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


def make_handler(engine: Engine, port_getter, avatar: bytes, token: str):
    # MediaPipe runtime files: exactly the ones bundled in the package, by name. Nothing else under /mp is served.
    wasm_root = resources.files("realx.web").joinpath("mp/wasm")
    wasm_files = {p.name: p for p in wasm_root.iterdir() if _WASM_NAME.fullmatch(p.name)} if wasm_root.is_dir() else {}
    ort_root = resources.files("realx.web").joinpath("ort")
    ort_files = {p.name: p for p in ort_root.iterdir() if _ORT_NAME.fullmatch(p.name)} if ort_root.is_dir() else {}
    hw_lock = threading.Lock()
    hw_cache: dict = {"t": 0.0, "doc": None}

    def hardware_doc() -> dict:
        """What this computer can do. Detection can take a couple of seconds, and free memory changes, so it is
        refreshed every 30 s rather than on every request."""
        with hw_lock:
            if hw_cache["doc"] is None or time.monotonic() - hw_cache["t"] > 30.0:
                profile = hardware.detect()
                hw_cache["doc"] = hardware.to_dict(profile, hardware.recommend(profile))
                hw_cache["t"] = time.monotonic()
            return hw_cache["doc"]

    model_cache: dict[str, bytes] = {}  # verified model bytes, kept in memory
    # one lock per model: a slow download of one never makes a request for another wait, and no lock is
    # ever held while a different model downloads
    model_locks = {key: threading.Lock() for key in MP_MODELS}
    prefetch_gate = threading.Lock()  # taken once and never released: the prefetch runs once per server

    def verified_model(key: str) -> bytes:
        """The model's bytes, read once and checked against the pinned SHA-256 before anyone gets them."""
        spec = MANIFEST[key]
        with model_locks[key]:
            cached = model_cache.get(spec.sha256)
            if cached is not None:
                return cached
            data = ensure_model(key).read_bytes()  # downloads on first use; checks the hash itself too
            if hashlib.sha256(data).hexdigest() != spec.sha256:
                raise ModelError(f"{spec.filename}: checksum mismatch")
            model_cache[spec.sha256] = data
            return data

    def prefetch_models() -> None:
        """Best effort, once: fetch and verify the three models in the background so the first tracking
        page does not wait on a download. Failures are ignored; the page's own request reports them."""
        if not prefetch_gate.acquire(blocking=False):
            return

        def run() -> None:
            for key in MP_MODELS:
                try:
                    verified_model(key)
                except Exception as exc:  # best effort: the page asks again, and says why if it still fails
                    log.warning("model prefetch failed for %s: %s", key, rlog.clip(f"{type(exc).__name__}: {exc}"))

        threading.Thread(target=run, name="realx-model-prefetch", daemon=True).start()

    class Handler(BaseHTTPRequestHandler):
        server_version = "realX"
        sys_version = ""
        timeout = SOCKET_TIMEOUT
        _body_taken = False  # set per request: has the handler started reading the body itself?

        def log_message(self, *args) -> None:  # quiet
            pass

        def _headers(self, content_type: str, length: int | None = None, cache: bool = True, max_age: int | None = None) -> None:
            self.send_header("Content-Type", content_type)
            if length is not None:
                self.send_header("Content-Length", str(length))
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Cross-Origin-Resource-Policy", "same-origin")
            self.send_header("Referrer-Policy", "no-referrer")
            if max_age is not None:  # only for content that cannot change: hash-pinned assets
                self.send_header("Cache-Control", f"private, max-age={max_age}")
            elif cache:
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

        def _supplied_tokens(self, allow_query: bool) -> list[tuple[str, str]]:
            """Every token the request carries, with where it came from."""
            found: list[tuple[str, str]] = []
            auth = self.headers.get("Authorization") or ""
            if auth[:7].lower() == "bearer ":
                found.append(("header", auth[7:].strip()))
            for part in (self.headers.get("Cookie") or "").split(";"):
                name, _, value = part.strip().partition("=")
                if name == TOKEN_COOKIE:
                    found.append(("cookie", value))
            if allow_query:
                for value in parse_qs(urlparse(self.path).query).get("token", []):
                    found.append(("query", value))
            return found

        def _auth_source(self, allow_query: bool) -> str | None:
            """Where a valid token came from, or None. The comparison does not leak how much matched."""
            want = token.encode()
            for source, value in self._supplied_tokens(allow_query):
                if hmac.compare_digest(value.encode("utf-8", "replace"), want):
                    return source
            return None

        def _drain(self) -> None:
            """Before an early error reply, read (a bounded amount of) the request body.

            Closing a socket that still holds unread bytes makes the OS reset the connection, and a client
            that is still sending can then lose the reply and see a reset instead of the status. Reading a
            little first lets the reply arrive; a body that is too large is simply cut off.
            """
            if self.command != "POST" or self._body_taken or self.headers.get("Transfer-Encoding"):
                return
            try:
                n = int(self.headers.get("Content-Length") or 0)
                if n > 0:
                    self.rfile.read(min(n, DRAIN_LIMIT))
            except (ValueError, OSError):
                pass
            self.close_connection = True

        def _deny(self, code: int, msg: str) -> None:
            self._drain()
            body = json.dumps({"error": msg}).encode()
            self.send_response(code)
            self._headers("application/json", len(body))
            if code == 401:
                self.send_header("WWW-Authenticate", "Bearer")
            self.end_headers()
            self.wfile.write(body)

        def _json(self, payload: dict, code: int = 200) -> None:
            body = json.dumps(payload).encode()
            self.send_response(code)
            self._headers("application/json", len(body))
            self.end_headers()
            self.wfile.write(body)

        def _body(self, limit: int) -> bytes:
            self._body_taken = True  # from here on the body is this method's business, not _drain's
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
            source = self._auth_source(allow_query=True)
            if source is None:
                return self._deny(401, "access token required")
            path = urlparse(self.path).path
            if source == "query" and path in ("/", "/avatar", "/dock"):  # first visit from a link (browser or OBS): token into a cookie
                return self._adopt_token(path)
            if path == "/":
                page = _asset("index.html")
                self.send_response(200)
                self._headers("text/html; charset=utf-8", len(page))
                self.send_header("Content-Security-Policy", CSP)
                self.send_header("Permissions-Policy", permissions_for(urlparse(self.path).query))
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
                self.send_header("Permissions-Policy", permissions_for(urlparse(self.path).query))
                self.send_header("X-Frame-Options", "SAMEORIGIN")
                self.end_headers()
                self.wfile.write(page)
            elif path in ("/dock", "/dock.js", "/dock.css"):
                name = "dock.html" if path == "/dock" else path[1:]
                body = _asset(name)
                kind = {"/dock": "text/html; charset=utf-8", "/dock.js": "text/javascript; charset=utf-8", "/dock.css": "text/css; charset=utf-8"}[path]
                self.send_response(200)
                self._headers(kind, len(body))
                if path == "/dock":
                    self.send_header("Content-Security-Policy", dock_csp(port_getter()))
                    self.send_header("X-Frame-Options", "DENY")
                self.end_headers()
                self.wfile.write(body)
            elif path == "/avatar.bundle.js":
                js = _asset("avatar.bundle.js")
                self.send_response(200)
                self._headers("text/javascript; charset=utf-8", len(js))
                self.end_headers()
                self.wfile.write(js)
            elif path == BACKGROUND_THUMB_PATH:
                thumb = engine.background_thumb()
                if thumb is None:
                    return self._deny(404, "no background photo is in use")
                self.send_response(200)
                self._headers("image/png", len(thumb))
                self.end_headers()
                self.wfile.write(thumb)
            elif path == "/avatar/model.vrm":
                self.send_response(200)
                self._headers("model/gltf-binary", len(avatar))
                self.end_headers()
                self.wfile.write(avatar)
            elif path.startswith("/mp/wasm/"):
                self._mp_wasm(path[len("/mp/wasm/") :])
            elif path.startswith("/ort/"):
                self._ort_file(path[len("/ort/") :])
            elif path.startswith("/mp/models/"):
                self._mp_model(path[len("/mp/models/") :])
            elif path == "/favicon.ico":
                self.send_response(204)
                self._headers("image/x-icon", 0)
                self.end_headers()
            elif path == "/ws/rig":
                self._rig_socket()
            elif path == "/api/stats":
                self._json(engine.stats())
            elif path == "/api/hardware":
                self._json(hardware_doc())
            elif path == "/api/voices":
                self._json({"presets": presets.describe(), "note": presets.NOTE})
            elif path == "/api/safety":
                self._json(
                    {
                        "watermark": "provenance mark embedded in voice output",
                        "voices": presets.NOTE,
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

        def _adopt_token(self, path: str) -> None:
            rest = {k: v for k, v in parse_qs(urlparse(self.path).query).items() if k != "token"}
            target = path + (("?" + urlencode(rest, doseq=True)) if rest else "")
            self.send_response(303)
            self.send_header("Location", target)
            self.send_header("Set-Cookie", f"{TOKEN_COOKIE}={token}; HttpOnly; SameSite=Strict; Path=/")
            self.send_header("Content-Length", "0")
            self._headers("text/plain")
            self.end_headers()

        def _mp_wasm(self, name: str) -> None:
            entry = wasm_files.get(name)
            if entry is None:
                return self._deny(404, "not found")
            data = entry.read_bytes()
            self.send_response(200)
            self._headers(
                "application/wasm" if name.endswith(".wasm") else "text/javascript; charset=utf-8", len(data), max_age=ASSET_MAX_AGE
            )
            self.end_headers()
            self.wfile.write(data)

        def _ort_file(self, name: str) -> None:
            entry = ort_files.get(name)
            if entry is None:
                return self._deny(404, "not found")
            with entry.open("rb") as fh:  # the runtime is tens of MB: stream it, do not hold it in memory
                size = fh.seek(0, 2)
                fh.seek(0)
                self.send_response(200)
                self._headers(
                    "application/wasm" if name.endswith(".wasm") else "text/javascript; charset=utf-8", size, max_age=ASSET_MAX_AGE
                )
                self.end_headers()
                while chunk := fh.read(1 << 20):
                    self.wfile.write(chunk)

        def _mp_model(self, name: str) -> None:
            key = next((k for k in MP_MODELS if MANIFEST[k].filename == name), None)
            if key is None:
                return self._deny(404, "not found")
            try:
                data = verified_model(key)
            except (ModelError, OSError) as exc:
                if engine._dedup.first(("model", key, str(exc))):
                    log.warning("model %s unavailable: %s: %s", key, type(exc).__name__, rlog.clip(exc))
                return self._deny(503, "model unavailable; run `realx models fetch` and reload")
            self.send_response(200)
            self._headers("application/octet-stream", len(data), max_age=ASSET_MAX_AGE)
            self.end_headers()
            self.wfile.write(data)

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
            publish = parse_qs(urlparse(self.path).query).get("publish") == ["1"]
            if publish and not engine.claim_publisher():
                return self._deny(409, "another tracker is already publishing")
            conn = None
            try:
                self.protocol_version = "HTTP/1.1"  # the WebSocket handshake requires it
                self.send_response(101)
                self.send_header("Upgrade", "websocket")
                self.send_header("Connection", "Upgrade")
                self.send_header("Sec-WebSocket-Accept", ws.accept_key(h["Sec-WebSocket-Key"]))
                self.end_headers()
                self.close_connection = True
                conn = ws.Connection(self.connection, max_payload=MAX_BODY_BYTES if publish else ws.MAX_CLIENT_PAYLOAD)
                conn.send_text(json.dumps(hello_message(__version__)))
                if publish:
                    self._publish_loop(conn)
                else:
                    self._view_loop(conn)
            except ws.WebSocketError as exc:
                if conn is not None:
                    conn.send_close(exc.code)
            except OSError:
                return
            except Exception:  # a bug must end this one connection cleanly, not kill the thread silently
                log.exception("the rig socket crashed; closing it with 1011")
                if conn is not None:
                    conn.send_close(1011)
            finally:
                if publish:
                    engine.release_publisher()

        def _view_loop(self, conn: "ws.Connection") -> None:
            """Forward the newest rig and body messages. Latest value wins; nothing queues."""
            engine.viewer_joined()
            rev = rig_seq = body_seq = -1
            try:
                while not engine.stopped and not conn.closed:
                    update = engine.wait_update(rev)
                    conn.poll()
                    if conn.closed:
                        break
                    rev = update.rev
                    if update.rig_seq != rig_seq:
                        rig_seq = update.rig_seq
                        conn.send_text(update.rig)
                    if update.body_seq != body_seq:
                        body_seq = update.body_seq
                        if update.body is not None:  # a cleared or stale body is simply not sent
                            conn.send_text(update.body)
            finally:
                engine.viewer_left()

        def _publish_loop(self, conn: "ws.Connection") -> None:
            """Take body messages from the one tracking page. Anything invalid, too fast or too quiet ends it."""
            window_start = last_message = time.monotonic()
            count = 0
            try:
                while not engine.stopped and not conn.closed:
                    before = conn.frames
                    texts = conn.poll(timeout=0.25)
                    now = time.monotonic()
                    arrived = conn.frames - before  # frames of every kind (text, ping, pong, anything) count toward the cap
                    if arrived:
                        if now - window_start >= 1.0:
                            window_start, count = now, 0
                        count += arrived
                        if count > PUBLISH_RATE_LIMIT:
                            return conn.send_close(1008)
                    for text in texts:
                        try:
                            engine.publish_body(parse_body_message(text))
                        except ValueError:
                            return conn.send_close(1008)
                        last_message = now  # only a valid body message counts as activity; pings alone do not
                    if now - last_message > PUBLISH_IDLE_SECONDS:
                        return conn.send_close(1001)
            except ws.WebSocketError as exc:
                conn.send_close(exc.code)
            except OSError:
                raise
            except Exception:
                log.exception("the publisher loop crashed; closing it with 1011")
                conn.send_close(1011)

        def do_POST(self) -> None:
            self._body_taken = False
            if not self._local_host() or not self._same_origin() or not self._not_cross_site():
                return self._deny(403, "forbidden origin")
            if self._auth_source(allow_query=False) is None:  # never from the URL: it ends up in logs and history
                return self._deny(401, "access token required")
            parsed = urlparse(self.path)
            try:
                if parsed.path == "/api/config":
                    if (self.headers.get("Content-Type") or "").split(";")[0].strip() != "application/json":
                        raise ValueError("Content-Type must be application/json")
                    changes = json.loads(self._body(MAX_JSON) or b"{}")
                    if not isinstance(changes, dict):
                        raise ValueError("expected a JSON object")
                    result = engine.update(changes)
                    if changes.get("mode") == "body":
                        prefetch_models()
                    self._json(result)
                elif parsed.path == "/api/dock":
                    if (self.headers.get("Content-Type") or "").split(";")[0].strip() != "application/json":
                        raise ValueError("Content-Type must be application/json")
                    changes = json.loads(self._body(MAX_JSON) or b"{}")
                    if not isinstance(changes, dict):
                        raise ValueError("expected a JSON object")
                    self._json(engine.set_dock(changes))
                elif parsed.path == "/api/emote":
                    if (self.headers.get("Content-Type") or "").split(";")[0].strip() != "application/json":
                        raise ValueError("Content-Type must be application/json")
                    body = json.loads(self._body(MAX_JSON) or b"{}")
                    engine.emote(body.get("name") if isinstance(body, dict) else None)
                    self._json({"ok": True})
                elif parsed.path == "/api/background":
                    kind = (self.headers.get("Content-Type") or "").split(";")[0].strip()
                    if kind not in ("image/jpeg", "image/png"):
                        raise ValueError("Content-Type must be image/jpeg or image/png")
                    engine.set_background(decode_background(self._body(MAX_IMAGE_BYTES)))
                    self._json({"ok": True})
                elif parsed.path == "/api/voice":
                    q = parse_qs(parsed.query)
                    semitones = float(q.get("semitones", ["0"])[0])
                    preset = q.get("preset", [""])[0] or None
                    data = self._body(offline.MAX_WAV_BYTES)
                    if q.get("demo", ["0"])[0] == "1" and not data:
                        t = np.arange(16000 * 2) / 16000
                        tone = (0.4 * np.sin(2 * np.pi * 220 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 2 * t))).astype(
                            np.float32
                        )
                        data = offline.wav_bytes(tone, 16000)
                    out = offline.convert_wav_bytes(data, semitones, preset=preset)
                    self.send_response(200)
                    self._headers("audio/wav", len(out))
                    self.end_headers()
                    self.wfile.write(out)
                else:
                    self._deny(404, "not found")
            except (ValueError, BackgroundError, json.JSONDecodeError, RecursionError) as exc:
                self._deny(400, str(exc)[:200])
            except OSError:
                return
            except Exception:  # keep details out of the response, but not out of the log
                log.exception("unexpected error handling POST %s", rlog.clip(parsed.path, 120))
                self._deny(500, "internal error")

    return Handler


class Server:
    def __init__(self, engine: Engine, port: int = 8765, avatar_path: str | None = None, token: str | None = None) -> None:
        self.engine = engine
        avatar = load_avatar(avatar_path)
        self.token = resolve_token(token)
        engine.token_fixed = token is not None or bool(os.environ.get(TOKEN_ENV))
        self._httpd = _BoundedServer(("127.0.0.1", port), make_handler(engine, lambda: self.port, avatar, self.token))
        self._thread: threading.Thread | None = None

    @property
    def port(self) -> int:
        return self._httpd.server_address[1]

    def start(self) -> None:
        self.engine.start()
        self._thread = threading.Thread(target=self._httpd.serve_forever, daemon=True)
        self._thread.start()
        log.info("realx control room listening on http://127.0.0.1:%d/ (this computer only)", self.port)

    def stop(self) -> None:
        self.engine.stop()  # ends open streams first
        if self._thread:
            self._httpd.shutdown()
        self._httpd.server_close()
        log.info("realx control room stopped")
