"""Light runtime diagnostics for the live loop.

Everything the engine thread does here is O(1): it appends a number to a small bounded ring. Percentiles
and process figures are computed when someone asks for a snapshot (a stats request), never in the frame
loop, so a slow reader cannot delay video and nothing here grows without bound.

These are measurements of this process on this machine at this moment. They are not targets.
"""

from __future__ import annotations

import sys
import threading
import time
from collections import deque
from collections.abc import Callable, Sequence

WINDOW = 120            # frames kept for percentiles
PROCESS_SAMPLE_S = 2.0  # CPU and memory are sampled at most this often


def percentile(values: Sequence[float], q: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    pos = (len(ordered) - 1) * q
    lo = int(pos)
    hi = min(lo + 1, len(ordered) - 1)
    return ordered[lo] + (ordered[hi] - ordered[lo]) * (pos - lo)


def process_rss_bytes() -> int | None:
    """Resident memory of this process, or None where it cannot be read cheaply."""
    try:
        if sys.platform.startswith("linux"):
            with open("/proc/self/statm", "rb") as fh:
                pages = int(fh.read().split()[1])
            import os

            return pages * os.sysconf("SC_PAGE_SIZE")
        if sys.platform == "win32":
            import ctypes
            from ctypes import wintypes

            class _Counters(ctypes.Structure):
                _fields_ = [("cb", wintypes.DWORD), ("PageFaultCount", wintypes.DWORD),
                            ("PeakWorkingSetSize", ctypes.c_size_t), ("WorkingSetSize", ctypes.c_size_t),
                            ("QuotaPeakPagedPoolUsage", ctypes.c_size_t), ("QuotaPagedPoolUsage", ctypes.c_size_t),
                            ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t), ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                            ("PagefileUsage", ctypes.c_size_t), ("PeakPagefileUsage", ctypes.c_size_t)]

            counters = _Counters()
            counters.cb = ctypes.sizeof(counters)
            kernel = ctypes.windll.kernel32
            kernel.GetCurrentProcess.restype = wintypes.HANDLE
            ok = ctypes.windll.psapi.GetProcessMemoryInfo(
                kernel.GetCurrentProcess(), ctypes.byref(counters), counters.cb
            )
            return int(counters.WorkingSetSize) if ok else None
        import resource  # other Unix: only the peak is available

        peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        return int(peak) * (1 if sys.platform == "darwin" else 1024)
    except Exception:
        return None


class Diagnostics:
    """Bounded rings of recent frame figures plus throttled process CPU and memory."""

    def __init__(
        self,
        clock: Callable[[], float] = time.perf_counter,
        cpu_clock: Callable[[], float] = time.process_time,
        rss: Callable[[], int | None] = process_rss_bytes,
    ) -> None:
        self._clock, self._cpu_clock, self._rss = clock, cpu_clock, rss
        self._lock = threading.Lock()
        self._age: deque[float] = deque(maxlen=WINDOW)       # ms from camera arrival to the start of processing
        self._total: deque[float] = deque(maxlen=WINDOW)     # ms from camera arrival to the frame being published
        self._process: deque[float] = deque(maxlen=WINDOW)   # ms spent in the pipeline
        self._frames = 0
        self._cpu_percent: float | None = None
        self._rss_bytes: int | None = None
        self._last_sample = (clock(), cpu_clock())
        self._next_sample = self._last_sample[0] + PROCESS_SAMPLE_S
        self._outages = 0
        self._outage_started: float | None = None
        self._last_outage_s: float | None = None

    def frame(self, age_ms: float | None, total_ms: float | None, process_ms: float) -> None:
        with self._lock:
            self._frames += 1
            self._process.append(process_ms)
            if age_ms is not None:
                self._age.append(max(0.0, age_ms))
            if total_ms is not None:
                self._total.append(max(0.0, total_ms))
        self._maybe_sample()

    def source_lost(self) -> None:
        with self._lock:
            if self._outage_started is None:
                self._outage_started = self._clock()

    def source_back(self) -> None:
        with self._lock:
            if self._outage_started is not None:
                self._last_outage_s = round(self._clock() - self._outage_started, 2)
                self._outage_started = None
                self._outages += 1

    def _maybe_sample(self) -> None:
        now = self._clock()
        if now < self._next_sample:
            return
        cpu = self._cpu_clock()
        with self._lock:
            wall = now - self._last_sample[0]
            if wall > 0:  # process CPU time over wall time: 100 means one fully busy core
                self._cpu_percent = round(100.0 * (cpu - self._last_sample[1]) / wall, 1)
            self._last_sample = (now, cpu)
            self._next_sample = now + PROCESS_SAMPLE_S
        self._rss_bytes = self._rss()

    def snapshot(self, stage_ms: dict[str, float] | None = None, capture: dict | None = None) -> dict:
        with self._lock:
            def block(ring: deque[float]) -> dict:
                values = list(ring)
                return {"p50": round(percentile(values, 0.5), 1), "p95": round(percentile(values, 0.95), 1),
                        "max": round(max(values), 1) if values else 0.0, "samples": len(values)}

            out = {
                "frame_age_ms": block(self._age),
                "end_to_end_ms": block(self._total),
                "process_ms": block(self._process),
                "stage_mean_ms": {k: round(v, 2) for k, v in (stage_ms or {}).items()},
                "cpu_percent": self._cpu_percent,
                "rss_mb": None if self._rss_bytes is None else round(self._rss_bytes / 1048576, 1),
                "source_outages": self._outages,
                "last_outage_s": self._last_outage_s,
                "frames_measured": self._frames,
            }
        if capture:
            out["camera"] = capture
        return out
