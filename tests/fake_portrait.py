"""A configurable fake portrait engine for tests. It never loads a model, never touches a network, and the
"portrait" it animates is random noise generated in memory: no real face is involved anywhere."""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field

import cv2
import numpy as np

from realx.safety.consent import ConsentStore
from realx.safety.portrait_consent import issue_portrait_consent

FAKE_FILL = 200  # every pixel of a "portrait" frame has this value, so tests can tell it from the avatar's output
SECRET = bytes(range(1, 40))


@dataclass
class Behaviour:
    fail_load: Exception | None = None
    fail_animate_at: int | None = None       # 1-based call number
    animate_error: Exception | None = None
    bad_output: bool = False
    animate_seconds: float = 0.0
    block_load: threading.Event | None = None  # load() waits for this (a stuck engine)
    loads: int = 0
    animations: int = 0
    closed: threading.Event = field(default_factory=threading.Event)


CURRENT = Behaviour()


class FakeEngine:
    name = "fake_portrait"
    test_only = True

    def load(self, portrait_rgb) -> None:
        CURRENT.loads += 1
        if CURRENT.block_load is not None:
            CURRENT.block_load.wait(10)
        if CURRENT.fail_load is not None:
            raise CURRENT.fail_load
        self._h, self._w = portrait_rgb.shape[:2]

    def animate(self, rig, ctx_pixels):
        CURRENT.animations += 1
        if CURRENT.animate_seconds:
            time.sleep(CURRENT.animate_seconds)
        if CURRENT.fail_animate_at is not None and CURRENT.animations == CURRENT.fail_animate_at:
            raise CURRENT.animate_error or RuntimeError("engine blew up")
        if CURRENT.bad_output:
            return np.zeros((8, 8), np.float32)
        return np.full((self._h, self._w, 3), FAKE_FILL, np.uint8)

    def close(self) -> None:
        CURRENT.closed.set()


def entry() -> dict:
    """The registry entry for the fake. Tests add it with `monkeypatch.setitem(_ENGINES, "fake_portrait", entry())`,
    so it exists only for the duration of one test and the real registry is left untouched."""
    return {"factory": FakeEngine, "model": None, "test_only": True}


def reset(**kw) -> Behaviour:
    global CURRENT
    CURRENT = Behaviour(**kw)
    return CURRENT


def noise_png(seed: int = 0, side: int = 96) -> bytes:
    rng = np.random.default_rng(seed)
    ok, buf = cv2.imencode(".png", rng.integers(0, 255, (side, side, 3), dtype=np.uint8))
    assert ok
    return buf.tobytes()


def consent(ttl: float = 60.0, image: bytes | None = None, subject: str = "test-subject"):
    store = ConsentStore(SECRET)
    image = image or noise_png()
    record = issue_portrait_consent(store, subject, image, ttl, attested_owner_or_authorized=True)
    return store, record, image
