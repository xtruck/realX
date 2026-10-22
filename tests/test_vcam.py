"""The virtual camera output: off by default, label and watermark on every frame sent, never blocks the engine, honest status."""

from __future__ import annotations

import threading
import time
from pathlib import Path

import numpy as np
import pytest

from realx.safety import watermark
from realx.server import VCAM_MODES, Engine
from realx.stages.builtin import Disclosure
from realx.vcam import (
    MARK_PAYLOAD,
    PyVirtualCamBackend,
    SoftcamBackend,
    VcamError,
    VirtualCamera,
    VirtualCameraConfig,
)

KEY = b"k" * 16


class FakeBackend:
    name = "fake"

    def __init__(self, delay: float = 0.0, fail_open: str | None = None, fail_send: bool = False) -> None:
        self.delay, self.fail_open, self.fail_send = delay, fail_open, fail_send
        self.opened = self.closed = False
        self.sent: list[np.ndarray] = []
        self.size = None

    def open(self, width, height, fps):
        if self.fail_open:
            raise VcamError(self.fail_open)
        self.opened, self.size = True, (width, height)

    def send(self, frame_rgb):
        if self.fail_send:
            raise OSError("driver went away")
        if self.delay:
            time.sleep(self.delay)
        self.sent.append(frame_rgb.copy())

    def connected(self):
        return True

    def close(self):
        self.closed = True


def make(fake=None, **kw):
    fake = fake or FakeBackend()
    cfg = VirtualCameraConfig(enabled=kw.pop("enabled", True), width=kw.pop("width", 320), height=kw.pop("height", 240),
                              fps=kw.pop("fps", 60), watermark_key=KEY, **kw)
    return VirtualCamera(cfg, backend_factory=lambda _c: fake), fake


def frame(w=320, h=240, seed=1):
    y, x = np.mgrid[0:h, 0:w]
    return np.stack([x * 255 // max(w - 1, 1), y * 255 // max(h - 1, 1), np.full_like(x, (seed * 37) % 255)], axis=2).astype(np.uint8)


def wait_for(cond, secs=3.0):
    end = time.monotonic() + secs
    while time.monotonic() < end:
        if cond():
            return True
        time.sleep(0.01)
    return cond()


def assert_marked(px, w=320, h=240):
    """What every frame that reaches a driver must show: the visible bar and a verifiable provenance mark."""
    assert px.shape == (h, w, 3) and px.dtype == np.uint8
    bar = Disclosure.bar_height(h)
    rows = px[h - bar :].astype(np.int16)
    near = np.all(np.abs(rows - np.array(Disclosure.BAR_RGB, np.int16)) <= 2, axis=-1)
    assert float(near.mean()) > 0.6, "the DIGITAL HOST bar is not visible"
    assert watermark.extract(px, KEY) == MARK_PAYLOAD, "the provenance mark is missing"


# --- off by default ---------------------------------------------------------------------------------------------------


def test_default_config_is_off_and_nothing_is_opened():
    assert VirtualCameraConfig().enabled is False
    opened = []
    cam = VirtualCamera(VirtualCameraConfig(), backend_factory=lambda c: opened.append(c) or FakeBackend())
    assert cam.start()["state"] == "off" and not opened
    cam.offer(frame())
    assert cam.status()["offered"] == 0
    cam.stop()


def test_there_is_no_environment_switch():
    import realx.vcam as module

    source = Path(module.__file__).read_text(encoding="utf-8")
    assert "environ" not in source and "getenv" not in source


@pytest.mark.parametrize("kw", [{"backend": "dshow"}, {"width": 322}, {"height": 15}, {"width": 4000}, {"fps": 0}, {"fps": 500}, {"label_name": " "}])
def test_bad_settings_are_refused(kw):
    with pytest.raises(ValueError):
        VirtualCameraConfig(enabled=True, **kw)


# --- every frame is labelled and marked -------------------------------------------------------------------------------


def test_prepare_resizes_pads_labels_and_marks():
    cam, _ = make()
    for src in (frame(320, 240), frame(640, 480), frame(1280, 720), frame(100, 400)):
        assert_marked(cam.prepare(src))


def test_every_frame_that_reaches_the_driver_is_marked():
    cam, fake = make()
    cam.start()
    try:
        for i in range(12):
            cam.offer(frame(seed=i))
            time.sleep(0.02)
        assert wait_for(lambda: len(fake.sent) >= 3)
    finally:
        cam.stop()
    for px in fake.sent:
        assert_marked(px)
    assert fake.closed


def test_a_frame_whose_marking_fails_is_dropped_not_sent_bare(monkeypatch):
    cam, fake = make()
    monkeypatch.setattr(watermark, "embed", lambda *a, **k: (_ for _ in ()).throw(ValueError("boom")))
    cam.start()
    try:
        for _ in range(5):
            cam.offer(frame())
            time.sleep(0.02)
        assert wait_for(lambda: cam.status()["failed"] >= 1)
    finally:
        cam.stop()
    assert fake.sent == []


@pytest.mark.parametrize("bad", [np.zeros((10, 10), np.uint8), np.zeros((10, 10, 3), np.float32), np.zeros((10, 10, 4), np.uint8)])
def test_only_rgb_uint8_pictures_are_accepted(bad):
    cam, _ = make()
    with pytest.raises(VcamError):
        cam.prepare(bad)


def test_the_caller_frame_is_not_modified():
    cam, _ = make()
    src = frame()
    before = src.copy()
    cam.prepare(src)
    assert (src == before).all()


# --- never blocks the engine -----------------------------------------------------------------------------------------


def test_a_slow_driver_drops_frames_and_offer_returns_at_once():
    cam, fake = make(FakeBackend(delay=0.3))
    cam.start()
    try:
        t0 = time.perf_counter()
        for i in range(40):
            cam.offer(frame(seed=i))
        assert time.perf_counter() - t0 < 0.5, "offer() must not wait for the driver"
        assert wait_for(lambda: cam.status()["sent"] >= 1)
        st = cam.status()
        assert st["offered"] == 40 and st["dropped"] >= 30
    finally:
        cam.stop()


def test_latest_frame_wins():
    cam, fake = make(FakeBackend(delay=0.2))
    cam.start()
    try:
        for i in range(10):
            cam.offer(np.full((240, 320, 3), i * 20, np.uint8))
        assert wait_for(lambda: len(fake.sent) >= 2, 5)
    finally:
        cam.stop()
    # the last picture offered is among those sent; the thread never replays an old backlog afterwards
    assert any(abs(int(p[10, 10, 0]) - 180) <= 3 for p in fake.sent)


# --- failures are reported, not raised -------------------------------------------------------------------------------


def test_a_backend_that_cannot_open_is_an_error_status_and_the_engine_goes_on():
    cam, _ = make(FakeBackend(fail_open="device_unavailable"))
    st = cam.start()
    assert st["state"] == "error" and st["error"] == "device_unavailable"
    cam.offer(frame())  # harmless
    assert cam.status()["offered"] == 0
    cam.stop()
    assert cam.status()["state"] == "error"  # stop does not hide the reason


def test_a_driver_that_fails_mid_stream_keeps_the_thread_alive():
    cam, fake = make(FakeBackend(fail_send=True))
    cam.start()
    try:
        for _ in range(6):
            cam.offer(frame())
            time.sleep(0.03)
        assert wait_for(lambda: cam.status()["failed"] >= 2)
        assert cam.status()["state"] == "running" and cam.status()["error"] == "OSError"
    finally:
        cam.stop()


def test_start_twice_and_stop_twice_are_safe():
    cam, fake = make()
    cam.start()
    first = cam._thread
    cam.start()
    assert cam._thread is first
    cam.stop()
    cam.stop()
    assert cam.status()["state"] == "off" and fake.closed


# --- the real backends ------------------------------------------------------------------------------------------------


def test_pyvirtualcam_missing_is_a_clear_error():
    pytest.importorskip("builtins")
    try:
        import pyvirtualcam  # noqa: F401
    except ImportError:
        with pytest.raises(VcamError) as err:
            PyVirtualCamBackend().open(320, 240, 30)
        assert err.value.code == "backend_missing"
    else:
        pytest.skip("pyvirtualcam is installed here")


@pytest.mark.parametrize("path", [None, "", "softcam.dll", r"E:\no\such\softcam.dll"])
def test_softcam_needs_an_existing_absolute_dll_path(path):
    with pytest.raises(VcamError) as err:
        SoftcamBackend(path).open(320, 240, 30)
    assert err.value.code == "backend_missing"


SOFTCAM_DLL = Path(r"E:\Dev\softcam\dist\bin\x64\softcam.dll")


@pytest.mark.skipif(not SOFTCAM_DLL.is_file(), reason="softcam.dll has not been built on this machine")
def test_softcam_dll_loads_creates_sends_and_deletes():
    """Real DLL, no registration needed: it makes the shared-memory camera, takes frames, and cleans up."""
    be = SoftcamBackend(str(SOFTCAM_DLL))
    be.open(320, 240, 30)
    try:
        for i in range(5):
            be.send(frame(seed=i))
        assert be.connected() is False  # no application is reading it
        with pytest.raises(VcamError):
            SoftcamBackend(str(SOFTCAM_DLL)).open(320, 240, 30)  # the DLL allows one camera at a time
    finally:
        be.close()
    be2 = SoftcamBackend(str(SOFTCAM_DLL))
    be2.open(320, 240, 30)  # the slot is free again
    be2.close()


@pytest.mark.skipif(not SOFTCAM_DLL.is_file(), reason="softcam.dll has not been built on this machine")
def test_softcam_gets_bgr():
    be = SoftcamBackend(str(SOFTCAM_DLL))
    be.open(8 * 4, 4 * 4, 30)
    try:
        px = np.zeros((16, 32, 3), np.uint8)
        px[..., 0] = 200  # red in RGB
        be.send(px)
        assert (be._buf[..., 2] == 200).all() and (be._buf[..., 0] == 0).all()
    finally:
        be.close()


# --- engine integration -----------------------------------------------------------------------------------------------


def test_engine_without_a_virtual_camera_reports_none():
    assert Engine(fps=10).stats()["vcam"] is None


def test_engine_feeds_the_camera_only_in_avatar_mode():
    assert VCAM_MODES == ("avatar",)
    cam, fake = make(width=320, height=240)
    eng = Engine(source="demo:static", mode="avatar", fps=15, vcam=cam)
    eng.start()
    try:
        assert wait_for(lambda: len(fake.sent) >= 3, 15)
        st = eng.stats()["vcam"]
        assert st["state"] == "running" and st["feeding"] is True and st["app_connected"] is True
        for px in list(fake.sent):
            assert_marked(px)
        eng.update({"mode": "original"})
        time.sleep(0.5)
        offered = cam.status()["offered"]
        time.sleep(0.6)
        st = eng.stats()["vcam"]
        assert cam.status()["offered"] == offered, "no frames may be offered outside avatar mode"
        assert st["feeding"] is False and "avatar mode" in st["note"]
    finally:
        eng.stop()
    assert fake.closed and eng.stats()["vcam"]["state"] == "off"


def test_engine_still_runs_when_the_camera_cannot_open():
    cam, _ = make(FakeBackend(fail_open="device_unavailable"))
    eng = Engine(source="demo:static", fps=15, vcam=cam)
    eng.start()
    try:
        assert wait_for(lambda: eng.stats()["frames"] > 3, 15)
        assert eng.stats()["vcam"]["state"] == "error" and eng.stats()["vcam"]["error"] == "device_unavailable"
    finally:
        eng.stop()


def test_cli_refuses_a_bad_size_and_adds_nothing_when_the_flag_is_absent(capsys):
    from realx.cli import main

    with pytest.raises(SystemExit) as err:
        main(["serve", "--no-browser", "--virtual-camera", "softcam", "--vcam-size", "7x7"])
    assert err.value.code == 2
    assert "virtual camera" in capsys.readouterr().err
    import inspect
    from realx import cli

    assert "vcam=None" in inspect.getsource(cli._serve)  # default: no virtual camera
