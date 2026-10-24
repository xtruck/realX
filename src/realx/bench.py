"""`realx bench`: a repeatable benchmark of the Python video pipeline.

It runs the real stages (face detection, tracking, smoothing, rig, optionally background
replacement) over a deterministic synthetic scene at each requested resolution and reports what it
measured. It claims nothing else: results are tied to the hardware block and the exact configuration
written next to them. The stages here run on the CPU through OpenCV; ONNX Runtime providers are listed
for reference but no stage in this benchmark uses them.

Two passes per resolution, each on fresh stages so no state leaks between them:

* timing pass: every stage timed separately on every frame (warm-up frames excluded)
* stream pass: the frames are offered at the target rate through `pipeline.run_stream`, which drops
  stale frames instead of queueing them; the report says how many were delivered and dropped

The synthetic frames are rendered before anything is timed, so rendering cost is not in the numbers.
"""

from __future__ import annotations

import datetime
import gc
import math
import os
import platform
import re
import sys
import threading
import time
from collections import deque
from collections.abc import Callable, Sequence

import numpy as np

from realx import __version__
from realx.models import ModelError, ensure_model
from realx.pipeline import Pipeline, run_stream
from realx.runtime import describe
from realx.types import FrameContext

SCHEMA = "realx-bench/1"
DEFAULT_RESOLUTIONS = ((320, 240), (640, 480), (1280, 720))
MIN_FRAMES = 10
MODES = ("cold", "warm", "both")
DEFAULT_MODE, DEFAULT_CYCLES, MAX_CYCLES = "warm", 3, 50
MIN_DIM, MAX_DIM, MAX_RESOLUTIONS = 16, 7680, 8
MAX_FRAME_BYTES = 1_500_000_000  # frames are pre-rendered; refuse a run that would need more than this
MIN_CUTOFF = 2.125  # the control room's default steadiness (35%), see server._smoothing_to_cutoff
MAX_IN_FLIGHT = 2
CAMERA_BUFFER = 2  # frames a camera keeps for a pipeline that is behind; a typical webcam driver keeps one or two


def parse_resolutions(text: str) -> list[tuple[int, int]]:
    """'320x240,640x480' -> [(320, 240), (640, 480)]. Raises ValueError with the reason."""
    parts = [p.strip() for p in str(text).split(",") if p.strip()]
    if not parts:
        raise ValueError("give at least one resolution, for example 640x480")
    out: list[tuple[int, int]] = []
    for part in parts:
        m = re.fullmatch(r"(\d+)[xX](\d+)", part)
        if not m:
            raise ValueError(f"'{part}' is not a resolution like 640x480")
        w, h = int(m.group(1)), int(m.group(2))
        if not (MIN_DIM <= w <= MAX_DIM and MIN_DIM <= h <= MAX_DIM):
            raise ValueError(f"'{part}': each side must be between {MIN_DIM} and {MAX_DIM}")
        if (w, h) in out:
            raise ValueError(f"'{part}' is listed twice")
        out.append((w, h))
    if len(out) > MAX_RESOLUTIONS:
        raise ValueError(f"at most {MAX_RESOLUTIONS} resolutions per run")
    return out


def percentile(values: Sequence[float], q: float) -> float:
    """Linear-interpolated percentile (the same definition numpy uses by default)."""
    if not values:
        raise ValueError("percentile of nothing")
    ordered = sorted(values)
    k = (len(ordered) - 1) * q / 100.0
    lo, hi = math.floor(k), math.ceil(k)
    return ordered[lo] + (ordered[hi] - ordered[lo]) * (k - lo)


def _cpu_name() -> str | None:
    try:
        if sys.platform == "win32":
            import winreg

            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0") as key:
                return str(winreg.QueryValueEx(key, "ProcessorNameString")[0]).strip()
        if os.path.exists("/proc/cpuinfo"):
            with open("/proc/cpuinfo", encoding="utf-8", errors="replace") as fh:
                for line in fh:
                    if line.lower().startswith("model name"):
                        return line.split(":", 1)[1].strip()
        return platform.processor() or None
    except Exception:  # a name is nice to have, never worth failing a benchmark for
        return None


BUSY_PERCENT = 25.0  # a machine this busy before the run makes every number worse than it should be


def _cpu_times() -> tuple[int, int] | None:
    """(idle, total) processor time counters, or None where this platform does not offer them cheaply."""
    try:
        if sys.platform == "win32":
            import ctypes
            from ctypes import wintypes

            idle, kernel, user = wintypes.FILETIME(), wintypes.FILETIME(), wintypes.FILETIME()
            if not ctypes.windll.kernel32.GetSystemTimes(ctypes.byref(idle), ctypes.byref(kernel), ctypes.byref(user)):
                return None
            value = lambda f: (f.dwHighDateTime << 32) | f.dwLowDateTime  # noqa: E731
            return value(idle), value(kernel) + value(user)  # the kernel counter includes idle time
        if os.path.exists("/proc/stat"):
            with open("/proc/stat", encoding="utf-8") as fh:
                fields = [int(v) for v in fh.readline().split()[1:]]
            return fields[3] + fields[4], sum(fields)  # idle + iowait, all
    except Exception:
        return None
    return None


def cpu_load_percent(interval: float = 0.5, sleep: Callable[[float], None] | None = None) -> float | None:
    """How busy the whole machine is right now, measured over `interval` seconds."""
    first = _cpu_times()
    if first is None:
        return None
    (sleep or time.sleep)(interval)
    second = _cpu_times()
    if second is None or second[1] <= first[1]:
        return None
    return round(100.0 * (1.0 - (second[0] - first[0]) / (second[1] - first[1])), 1)


def measure_conditions() -> dict:
    load = cpu_load_percent()
    warning = None
    if load is None:
        warning = "could not measure how busy the machine was, so interference from other programs is unknown"
    elif load >= BUSY_PERCENT:
        warning = (
            f"the CPU was already {load:.0f}% busy before the run started (other programs were working), "
            "so these numbers are not representative. Close other programs and run again."
        )
    return {"cpu_load_percent_before": load, "warning": warning}


def _version(module: str) -> str | None:
    try:
        return str(__import__(module).__version__)
    except Exception:
        return None


def hardware_info() -> dict:
    return {
        "platform": platform.platform(),
        "machine": platform.machine(),
        "python": platform.python_version(),
        "cpu_count": os.cpu_count(),
        "cpu_name": _cpu_name(),
        "numpy": np.__version__,
        "opencv": _version("cv2"),
        "onnxruntime": _version("onnxruntime"),
        "providers": describe(),
    }


# --- default pipeline and scene -------------------------------------------------------------------
def default_scene_factory(motion: str, size: tuple[int, int], fps: float, seed: int):
    from realx.sources import SyntheticScene

    # the head keeps the same share of the picture at every resolution, so detection difficulty is comparable
    return SyntheticScene(motion, size=size, fps=fps, head_height=max(24, round(150 * size[1] / 480)), degrade=0.0, seed=seed)


def default_stage_factory(with_background: bool) -> list:
    from realx import rig  # noqa: F401  (importing it registers the "rig" stage)
    from realx.stages import create

    stages = [
        create("detect_yunet", score_threshold=0.3),
        create("track"),
        create("one_euro", min_cutoff=MIN_CUTOFF, beta=0.5),
        create("rig"),
    ]
    if with_background:
        stages.append(create("bg_replace", mode="blur", image=None))
    return stages


_OWN_STAGES = default_stage_factory  # captured now: a replacement installed later is not realX's own


def _fresh(ctx: FrameContext) -> FrameContext:
    """Stages edit frames in place, so each pass works on its own copy of the pre-rendered picture."""
    return FrameContext(pixels=ctx.pixels.copy(), index=ctx.index, timestamp=ctx.timestamp, meta=dict(ctx.meta))


def _stats(values: list[float]) -> dict:
    return {"mean": round(sum(values) / len(values), 3), "p50": round(percentile(values, 50), 3), "p95": round(percentile(values, 95), 3)}


def _pipeline(stage_factory, with_background: bool) -> Pipeline:
    """realX's own stage list is checked strictly; a factory the caller injected (tests, experiments) is theirs to vouch for."""
    return Pipeline(stage_factory(with_background), strict=stage_factory is _OWN_STAGES)


def _timing_pass(frames: list[FrameContext], stage_factory, with_background: bool, clock) -> dict:
    warmup = min(5, max(1, len(frames) // 10))
    pipe = _pipeline(stage_factory, with_background)
    pipe.setup()
    try:
        per_stage: dict[str, list[float]] = {s.name: [] for s in pipe.stages}
        totals: list[float] = []
        found = 0
        for i, original in enumerate(frames):
            ctx = _fresh(original)
            began = clock()
            laps = []
            for stage in pipe.stages:
                a = clock()
                ctx = stage.process(ctx)
                laps.append((stage.name, (clock() - a) * 1000.0))
            total = (clock() - began) * 1000.0
            if i < warmup:
                continue
            totals.append(total)
            for name, ms in laps:
                per_stage[name].append(ms)
            found += 1 if ctx.faces else 0
    finally:
        pipe.close()
    return {
        "warmup_frames": warmup,
        "frames": len(totals),
        "stages": [{"name": n, "mean_ms": _stats(v)["mean"], "p50_ms": _stats(v)["p50"], "p95_ms": _stats(v)["p95"]} for n, v in per_stage.items()],
        "frame_ms": _stats(totals),
        "sequential_fps": round(1000.0 / max(sum(totals) / len(totals), 1e-9), 2),
        "faces_found": round(found / len(totals), 4),
    }


def clear_process_caches() -> None:
    """What a cold cycle clears by default: garbage the previous cycle left behind.

    No pipeline stage uses `runtime.SessionCache` yet (YuNet and PP-HumanSeg run through OpenCV), so there is no
    ONNX session cache to empty here; once one is in use, pass its clearing function as `clear_caches`. The
    operating system's file cache is not touched, so "cold" means "this process starts over", not "after a reboot".
    """
    gc.collect()


def _cycle(frames: list[FrameContext], stage_factory, with_background: bool, clock) -> dict:
    """One full run on fresh stages with nothing excluded: setup, the first frame, then the rest."""
    began = clock()
    pipe = _pipeline(stage_factory, with_background)
    pipe.setup()
    try:
        setup_ms = (clock() - began) * 1000.0
        per_frame: list[float] = []
        for original in frames:
            ctx = _fresh(original)
            a = clock()
            for stage in pipe.stages:
                ctx = stage.process(ctx)
            per_frame.append((clock() - a) * 1000.0)
    finally:
        pipe.close()
    total_s = (setup_ms + sum(per_frame)) / 1000.0
    return {
        "setup_ms": round(setup_ms, 3),
        "first_frame_ms": round(per_frame[0], 3),
        "first_frame_with_setup_ms": round(setup_ms + per_frame[0], 3),
        "fps": round(len(frames) / max(total_s, 1e-9), 2),
    }


def _fps_summary(cycles: list[dict]) -> dict:
    fps = [c["fps"] for c in cycles]
    fastest = max(fps)
    average = sum(fps) / len(fps)
    return {
        "average_fps": round(average, 2),
        "fastest_fps": round(fastest, 2),
        "slowest_fps": round(min(fps), 2),
        "relative_fps": round(average / max(fastest, 1e-9), 4),  # 1.0 = every cycle was as fast as the best one
        "first_frame_with_setup_ms": _stats([c["first_frame_with_setup_ms"] for c in cycles]),
        "cycles": cycles,
    }


def _cycle_modes(frames, stage_factory, with_background, clock, mode: str, cycles: int, clear_caches) -> dict:
    """Cold: caches cleared before every cycle, the first-frame cost is the point. Warm: one untimed run, then timed ones.

    `cold_vs_warm_fps` (both modes only) is the cold average divided by the warm average.
    """
    out: dict = {}
    if mode in ("cold", "both"):
        runs = []
        for _ in range(cycles):
            clear_caches()
            runs.append(_cycle(frames, stage_factory, with_background, clock))
        out["cold"] = _fps_summary(runs)
    if mode in ("warm", "both"):
        _cycle(frames, stage_factory, with_background, clock)  # untimed warm-up, result discarded
        out["warm"] = _fps_summary([_cycle(frames, stage_factory, with_background, clock) for _ in range(cycles)])
    if "cold" in out and "warm" in out:
        out["cold_vs_warm_fps"] = round(out["cold"]["average_fps"] / max(out["warm"]["average_fps"], 1e-9), 4)
    return out


class _Timed:
    """Wraps a pipeline so the time each frame really takes is measured while the camera thread is running too."""

    def __init__(self, pipe: Pipeline, clock) -> None:
        self.pipe, self.clock, self.ms = pipe, clock, []

    @property
    def stages(self):
        return self.pipe.stages

    def process(self, ctx: FrameContext) -> FrameContext:
        began = self.clock()
        out = self.pipe.process(ctx)
        self.ms.append((self.clock() - began) * 1000.0)
        return out


def _stream_pass(frames: list[FrameContext], stage_factory, with_background: bool, fps: float, clock, sleep, stream_seconds: float) -> dict:
    """Offer frames at `fps` the way a camera does: it does not wait for the pipeline.

    A producer thread delivers a frame every 1/fps seconds into a short buffer (`CAMERA_BUFFER` frames);
    when the pipeline has not taken the oldest one in time, the camera overwrites it and that frame is lost.
    `run_stream` then reads from that buffer. (`run_stream` alone back-pressures a source instead of dropping
    frames, so it cannot show how many frames a real camera would lose; its own drops are counted separately.)

    The pass runs for at least `stream_seconds` by replaying the rendered frames in a loop (new index and
    timestamp each time). A short run hides a shortfall: the buffers hold about four frames, so a pipeline that is
    10% too slow only starts losing frames after ~40 frames.
    """
    offered = max(len(frames), math.ceil(fps * stream_seconds))
    cond = threading.Condition()
    buffer: deque[FrameContext] = deque()
    state = {"finished": False, "camera_dropped": 0}
    pipeline_dropped = delivered = 0

    def on_drop(_ctx: FrameContext) -> None:
        nonlocal pipeline_dropped
        pipeline_dropped += 1

    def camera() -> None:
        t0 = clock()
        for i in range(offered):
            delay = t0 + i / fps - clock()
            if delay > 0:
                sleep(delay)
            original = frames[i % len(frames)]
            frame = FrameContext(pixels=original.pixels.copy(), index=i, timestamp=i / fps, meta=dict(original.meta))
            with cond:
                if len(buffer) >= CAMERA_BUFFER:
                    buffer.popleft()  # overwritten before the pipeline got to it
                    state["camera_dropped"] += 1
                buffer.append(frame)
                cond.notify()
        with cond:
            state["finished"] = True
            cond.notify_all()

    def from_camera():
        while True:
            with cond:
                while not buffer and not state["finished"]:
                    cond.wait(0.05)
                if not buffer:
                    return  # the camera is finished and everything it produced has been taken
                frame = buffer.popleft()
            yield frame

    producer = threading.Thread(target=camera, name="bench-camera", daemon=True)
    with _pipeline(stage_factory, with_background) as pipe:
        timed = _Timed(pipe, clock)
        started = clock()
        producer.start()
        for _ in run_stream(timed, from_camera(), workers=1, max_in_flight=MAX_IN_FLIGHT, on_drop=on_drop):
            delivered += 1
        wall = clock() - started
    producer.join(timeout=10)
    return {
        "target_fps": float(fps),
        "offered": offered,
        "process_ms": _stats(timed.ms) if timed.ms else {"mean": 0.0, "p50": 0.0, "p95": 0.0},
        "delivered": delivered,
        "dropped": state["camera_dropped"] + pipeline_dropped,
        "dropped_camera_buffer": state["camera_dropped"],
        "dropped_by_run_stream": pipeline_dropped,
        "camera_buffer_frames": CAMERA_BUFFER,
        "wall_s": round(wall, 3),
        "delivered_fps": round(delivered / wall, 2) if wall > 0 else 0.0,
    }


def run_benchmark(
    frames: int = 60,
    resolutions: Sequence[tuple[int, int]] = DEFAULT_RESOLUTIONS,
    fps: float = 30.0,
    with_background: bool = False,
    seed: int = 0,
    motion: str = "dance",
    scene_factory: Callable | None = None,
    stage_factory: Callable | None = None,
    clock: Callable[[], float] | None = None,
    sleep: Callable[[float], None] | None = None,
    hardware: dict | None = None,
    conditions: dict | None = None,
    stream_seconds: float = 6.0,
    mode: str = DEFAULT_MODE,
    cycles: int = DEFAULT_CYCLES,
    clear_caches: Callable[[], None] | None = None,
) -> dict:
    if frames < MIN_FRAMES:
        raise ValueError(f"frames must be at least {MIN_FRAMES} so the statistics mean something")
    if not fps > 0:
        raise ValueError("fps must be positive")
    if not stream_seconds > 0:
        raise ValueError("stream_seconds must be positive")
    if mode not in MODES:
        raise ValueError(f"mode must be one of {', '.join(MODES)}")
    if isinstance(cycles, bool) or not isinstance(cycles, int) or not 1 <= cycles <= MAX_CYCLES:
        raise ValueError(f"cycles must be a whole number from 1 to {MAX_CYCLES}")
    for w, h in resolutions:
        if frames * w * h * 3 > MAX_FRAME_BYTES:
            raise ValueError(f"{frames} frames at {w}x{h} would need too much memory (frames are rendered up front); use fewer")
    clock = clock or time.perf_counter
    sleep = sleep or time.sleep
    clear_caches = clear_caches or clear_process_caches
    scene_factory = scene_factory or default_scene_factory
    stage_factory = stage_factory or default_stage_factory
    conditions = conditions if conditions is not None else measure_conditions()  # before any of our own work starts
    results = []
    for w, h in resolutions:
        scene = scene_factory(motion, (w, h), fps, seed)
        rendered = [scene.render(i) for i in range(frames)]
        timing = _timing_pass(rendered, stage_factory, with_background, clock)
        stream = _stream_pass(rendered, stage_factory, with_background, fps, clock, sleep, stream_seconds)
        modes = _cycle_modes(rendered, stage_factory, with_background, clock, mode, cycles, clear_caches)
        results.append({"width": w, "height": h, **timing, "stream": stream, "modes": modes})
        del rendered
    return {
        "schema": SCHEMA,
        "created_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "realx_version": __version__,
        "hardware": hardware if hardware is not None else hardware_info(),
        "conditions": conditions,
        "config": {
            "frames": frames,
            "resolutions": [[w, h] for w, h in resolutions],
            "fps": float(fps),
            "stream_seconds": float(stream_seconds),
            "mode": mode,
            "cycles": cycles,
            "with_background": bool(with_background),
            "seed": seed,
            "motion": motion,
            "degrade": 0.0,
            "stages": [s["name"] for s in results[0]["stages"]],
            "workers": 1,
            "max_in_flight": MAX_IN_FLIGHT,
        },
        "results": results,
        "notes": [
            "Scene rendering is done before timing and is not included in any number.",
            "The stream pass imitates a camera: frames arrive at the target rate whether or not the pipeline is ready, and a "
            f"{CAMERA_BUFFER}-frame buffer overwrites its oldest frame when the pipeline is behind. Those are the drops reported.",
            "These stages run on the CPU through OpenCV. The providers block lists what ONNX Runtime offers; no stage here uses it.",
            "Cold cycles clear this process's caches and rebuild the stages first; warm cycles follow one untimed run. Cycle fps "
            "counts every frame and the stage setup; the OS file cache is not cleared.",
            "Numbers describe this machine, this configuration and this moment. They are not a promise for any other.",
        ],
    }


# --- schema check -----------------------------------------------------------------------------------
def _num(value, where: str, lo: float = 0.0, hi: float = math.inf) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not lo <= value <= hi:
        raise ValueError(f"{where}: expected a finite number in [{lo}, {hi}], got {value!r}")
    return float(value)


def _count(value, where: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ValueError(f"{where}: expected a non-negative integer, got {value!r}")
    return value


def _triplet(block, where: str, names: tuple[str, str, str]) -> None:
    if not isinstance(block, dict):
        raise ValueError(f"{where}: expected an object")
    mean, p50, p95 = (_num(block.get(n), f"{where}.{n}") for n in names)
    if p50 > p95 + 1e-9:
        raise ValueError(f"{where}: p50 {p50} is above p95 {p95}")


def _check_modes(modes, where: str) -> None:
    if not isinstance(modes, dict) or not set(modes) & {"cold", "warm"}:
        raise ValueError(f"{where}: expected a cold and/or warm block")
    for name in ("cold", "warm"):
        if name not in modes:
            continue
        block = modes[name]
        if not isinstance(block, dict) or not isinstance(block.get("cycles"), list) or not block["cycles"]:
            raise ValueError(f"{where}.{name}: cycles are missing")
        slow, avg, fast = (_num(block.get(k), f"{where}.{name}.{k}") for k in ("slowest_fps", "average_fps", "fastest_fps"))
        _num(block.get("relative_fps"), f"{where}.{name}.relative_fps", 0.0, 1.0 + 1e-9)
        if not (slow <= avg + 0.01 and avg <= fast + 0.01):
            raise ValueError(f"{where}.{name}: slowest, average and fastest are out of order")
        _triplet(block.get("first_frame_with_setup_ms"), f"{where}.{name}.first_frame_with_setup_ms", ("mean", "p50", "p95"))


def validate_result(doc) -> None:
    """Raise ValueError unless `doc` is a complete, self-consistent `realx-bench/1` document."""
    if not isinstance(doc, dict):
        raise ValueError("a benchmark document is a JSON object")
    if doc.get("schema") != SCHEMA:
        raise ValueError(f"schema must be {SCHEMA}")
    for key in ("created_utc", "realx_version"):
        if not isinstance(doc.get(key), str):
            raise ValueError(f"{key} is missing")
    for key in ("hardware", "config", "conditions"):
        if not isinstance(doc.get(key), dict):
            raise ValueError(f"{key} is missing")
    load = doc["conditions"].get("cpu_load_percent_before", "absent")
    if load is not None and (load == "absent" or isinstance(load, bool) or not isinstance(load, (int, float)) or not 0 <= load <= 100):
        raise ValueError("conditions.cpu_load_percent_before must be a percentage or null")
    if "warning" not in doc["conditions"]:
        raise ValueError("conditions.warning is missing")
    if not isinstance(doc.get("notes"), list):
        raise ValueError("notes is missing")
    results = doc.get("results")
    if not isinstance(results, list) or not results:
        raise ValueError("results must list at least one resolution")
    for n, r in enumerate(results):
        where = f"results[{n}]"
        if not isinstance(r, dict):
            raise ValueError(f"{where}: expected an object")
        for key in ("width", "height", "frames", "warmup_frames"):
            _count(r.get(key), f"{where}.{key}")
        if r["width"] < 1 or r["height"] < 1 or r["frames"] < 1:
            raise ValueError(f"{where}: empty result")
        stages = r.get("stages")
        if not isinstance(stages, list) or not stages:
            raise ValueError(f"{where}.stages is empty")
        for s in stages:
            if not isinstance(s, dict) or not isinstance(s.get("name"), str):
                raise ValueError(f"{where}.stages: a stage needs a name")
            _triplet(s, f"{where}.stages[{s['name']}]", ("mean_ms", "p50_ms", "p95_ms"))
        _triplet(r.get("frame_ms"), f"{where}.frame_ms", ("mean", "p50", "p95"))
        _num(r.get("sequential_fps"), f"{where}.sequential_fps")
        _num(r.get("faces_found"), f"{where}.faces_found", 0.0, 1.0)
        if "modes" in r:
            _check_modes(r["modes"], f"{where}.modes")
        st = r.get("stream")
        if not isinstance(st, dict):
            raise ValueError(f"{where}.stream is missing")
        offered, delivered, dropped = (_count(st.get(k), f"{where}.stream.{k}") for k in ("offered", "delivered", "dropped"))
        if delivered + dropped != offered:
            raise ValueError(f"{where}.stream: {delivered} delivered + {dropped} dropped is not {offered} offered")
        lost_camera = _count(st.get("dropped_camera_buffer"), f"{where}.stream.dropped_camera_buffer")
        lost_stream = _count(st.get("dropped_by_run_stream"), f"{where}.stream.dropped_by_run_stream")
        if lost_camera + lost_stream != dropped:
            raise ValueError(f"{where}.stream: the two kinds of drop do not add up to {dropped}")
        _count(st.get("camera_buffer_frames"), f"{where}.stream.camera_buffer_frames")
        _triplet(st.get("process_ms"), f"{where}.stream.process_ms", ("mean", "p50", "p95"))
        for key in ("target_fps", "wall_s", "delivered_fps"):
            _num(st.get(key), f"{where}.stream.{key}")


def format_summary(doc: dict) -> str:
    hw = doc["hardware"]
    lines = [
        f"realx bench ({doc['realx_version']}, {doc['created_utc']})",
        f"  machine : {hw.get('cpu_name') or hw.get('machine')}, {hw.get('cpu_count')} threads, {hw.get('platform')}",
        f"  runtime : python {hw.get('python')}, opencv {hw.get('opencv')}, onnxruntime {hw.get('onnxruntime')}",
        f"  stages  : {' > '.join(doc['config']['stages'])}  ({doc['config']['frames']} frames, target {doc['config']['fps']:g} fps)",
        f"  mode    : {doc['config'].get('mode', 'n/a')}, {doc['config'].get('cycles', 'n/a')} cycles",
    ]
    if doc["conditions"]["warning"]:
        lines.append(f"  WARNING : {doc['conditions']['warning']}")
    for r in doc["results"]:
        s = r["stream"]
        lines.append(
            f"\n{r['width']}x{r['height']}: {r['sequential_fps']:.1f} fps one frame at a time "
            f"(mean {r['frame_ms']['mean']:.1f} ms, p95 {r['frame_ms']['p95']:.1f} ms); "
            f"at {s['target_fps']:g} fps offered: {s['delivered']}/{s['offered']} delivered "
            f"({s['delivered_fps']:.1f} fps), {s['dropped']} lost to the camera buffer (frame time while streaming: "
            f"mean {s['process_ms']['mean']:.1f} ms, p95 {s['process_ms']['p95']:.1f} ms); face found in {r['faces_found']:.0%}"
        )
        for name in ("cold", "warm"):
            m = r.get("modes", {}).get(name)
            if m:
                lines.append(
                    f"    {name:4s} x{len(m['cycles'])} cycles: avg {m['average_fps']:.1f} fps, fastest {m['fastest_fps']:.1f}, "
                    f"slowest {m['slowest_fps']:.1f}, relative {m['relative_fps']:.2f}; first frame incl. setup "
                    f"{m['first_frame_with_setup_ms']['mean']:.1f} ms"
                )
        if "cold_vs_warm_fps" in r.get("modes", {}):
            lines.append(f"    cold is {r['modes']['cold_vs_warm_fps']:.2f}x the warm average fps")
        for st in r["stages"]:
            lines.append(f"    {st['name']:14s} mean {st['mean_ms']:7.2f} ms   p50 {st['p50_ms']:7.2f}   p95 {st['p95_ms']:7.2f}")
    return "\n".join(lines)


def run_cli(args) -> int:
    """Entry point for `realx bench`. Returns the process exit code; never raises for user errors."""
    import json

    try:
        resolutions = parse_resolutions(args.resolutions)
        if args.frames < MIN_FRAMES:
            raise ValueError(f"frames must be at least {MIN_FRAMES}")
        needed = ["yunet"] + (["pphumanseg"] if args.background else [])
        for name in needed:
            ensure_model(name, download=False)  # a benchmark must not start downloading things on its own
        doc = run_benchmark(
            frames=args.frames, resolutions=resolutions, fps=args.fps, with_background=args.background, seed=args.seed,
            stream_seconds=args.stream_seconds, mode=getattr(args, "mode", DEFAULT_MODE),
            cycles=getattr(args, "cycles", DEFAULT_CYCLES),
        )
        validate_result(doc)
    except ModelError as exc:
        print(f"cannot run the benchmark: {exc}", file=sys.stderr)
        return 2
    except ValueError as exc:
        print(f"bench: {exc}", file=sys.stderr)
        return 2
    except ImportError as exc:
        print(f"bench needs opencv and scikit-image ({exc}); install with: pip install -e .[dev,video]", file=sys.stderr)
        return 2
    print(format_summary(doc))
    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(doc, fh, indent=2)
        print(f"\nwrote {args.json}")
    return 0
