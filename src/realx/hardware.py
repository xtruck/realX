"""What this computer can do, found at run time, and the quality setting that suits it.

Detection reads: CPU name and thread count, RAM, the graphics adapters Windows reports, `nvidia-smi` when it
exists, and the ONNX Runtime providers that are installed. Every read is a probe that can fail on its own; a
failure is recorded in `notes` and never stops detection.

The rules in `recommend` are plain and listed in the order they apply. The one that matters most: **CUDA is never
assumed.** It counts as usable only when an NVIDIA adapter is present AND ONNX Runtime has a CUDA or TensorRT
provider installed. An Intel integrated GPU is never CUDA-capable.
"""

from __future__ import annotations

import ctypes
import json
import os
import platform
import re
import shutil
import subprocess
import sys
from collections.abc import Callable
from dataclasses import dataclass

from realx import log as rlog

log = rlog.get_logger("hardware")

PROBE_TIMEOUT_S = 8.0
CUDA_PROVIDERS = ("CUDAExecutionProvider", "TensorrtExecutionProvider")


@dataclass(frozen=True)
class Gpu:
    name: str
    vendor: str          # nvidia | amd | intel | other
    dedicated: bool
    driver: str | None
    vram_mb: int | None  # as reported; Windows caps this figure at 4 GB for some adapters, so treat it as a hint


@dataclass(frozen=True)
class HardwareProfile:
    os: str
    cpu_name: str | None
    cpu_cores: int | None
    cpu_threads: int | None
    ram_total_gb: float | None
    ram_free_gb: float | None
    gpus: tuple[Gpu, ...]
    onnx_providers: tuple[str, ...]
    cuda_usable: bool
    directml_available: bool
    notes: tuple[str, ...]


@dataclass(frozen=True)
class Recommendation:
    quality: str                 # low | balanced | high (the presets of the control room)
    reasons: tuple[str, ...]
    warnings: tuple[str, ...]


@dataclass(frozen=True)
class Probes:
    """The five reads, as callables, so tests can replace them. Each returns plain data or raises."""

    cpu: Callable[[], dict]                    # {"name", "cores", "threads"}
    memory: Callable[[], tuple[float, float]]  # (total GB, free GB)
    gpus: Callable[[], list[dict]]             # [{"name", "driver", "vram_mb"}]
    providers: Callable[[], list[str]]
    nvidia: Callable[[], list[dict] | None]    # [{"name", "memory_mb"}] or None when nvidia-smi is absent


# --- classification and parsing (pure) ---------------------------------------------------------------------
def classify_gpu(name: str) -> tuple[str, bool]:
    """(vendor, dedicated?) from the adapter's name."""
    n = name.lower()
    if "nvidia" in n or "geforce" in n or "quadro" in n or re.search(r"\brtx\b|\bgtx\b", n):
        return "nvidia", True
    if "intel" in n:
        return "intel", bool(re.search(r"\barc\b\W*\(?tm\)?\W*a\d{3}", n))   # Arc A380 and up; "Arc Graphics" and Iris/UHD are integrated
    if "amd" in n or "radeon" in n or "ati " in n:
        return "amd", bool(re.search(r"radeon\W*(rx|pro)\b|radeon\(tm\) (rx|pro)", n))
    return "other", False


def parse_video_controllers(text: str) -> list[dict]:
    """Win32_VideoController as JSON (one object, or a list) to [{"name", "driver", "vram_mb"}]."""
    try:
        data = json.loads(text) if text and text.strip() else []
    except ValueError:
        return []
    if isinstance(data, dict):
        data = [data]
    out = []
    for item in data if isinstance(data, list) else []:
        if not isinstance(item, dict) or not item.get("Name"):
            continue
        ram = item.get("AdapterRAM")
        out.append({
            "name": str(item["Name"]),
            "driver": str(item["DriverVersion"]) if item.get("DriverVersion") else None,
            "vram_mb": int(ram // (1024 * 1024)) if isinstance(ram, int) and ram > 0 else None,
        })
    return out


# --- real probes ------------------------------------------------------------------------------------------
def _powershell_json(command: str) -> str:
    exe = shutil.which("powershell") or shutil.which("pwsh")
    if not exe:
        raise OSError("PowerShell is not available")
    flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    run = subprocess.run(
        [exe, "-NoProfile", "-NonInteractive", "-Command", command],
        capture_output=True, text=True, timeout=PROBE_TIMEOUT_S, creationflags=flags, check=False,
    )
    if run.returncode != 0:
        raise OSError(f"PowerShell exited with {run.returncode}")
    return run.stdout


def _windows_cpu_fast() -> dict:
    """CPU name from the registry, threads from os.cpu_count, physical cores from kernel32: no process is started."""
    import winreg

    with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0") as key:
        name = str(winreg.QueryValueEx(key, "ProcessorNameString")[0]).strip()
    if not name:
        raise OSError("empty processor name")
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.GetLogicalProcessorInformationEx.argtypes = [ctypes.c_int, ctypes.c_void_p, ctypes.POINTER(ctypes.c_ulong)]
    kernel.GetLogicalProcessorInformationEx.restype = ctypes.c_int
    size = ctypes.c_ulong(0)
    kernel.GetLogicalProcessorInformationEx(0, None, ctypes.byref(size))  # 0 = RelationProcessorCore; learn the size
    if size.value == 0:
        raise OSError("GetLogicalProcessorInformationEx gave no size")
    buf = ctypes.create_string_buffer(size.value)
    if not kernel.GetLogicalProcessorInformationEx(0, buf, ctypes.byref(size)):
        raise OSError("GetLogicalProcessorInformationEx failed")
    cores, offset = 0, 0
    while offset + 8 <= size.value:  # each record: DWORD relationship, DWORD size, ...
        record_size = int.from_bytes(buf.raw[offset + 4:offset + 8], "little")
        if record_size <= 0:
            break
        cores += 1
        offset += record_size
    return {"name": name, "cores": cores or None, "threads": os.cpu_count()}


def _cpu() -> dict:
    if sys.platform == "win32":
        try:
            return _windows_cpu_fast()
        except Exception as exc:  # fall back to PowerShell, the slow last resort
            log.debug("fast CPU probe failed, using PowerShell: %s", rlog.clip(exc))
        text = _powershell_json(
            "Get-CimInstance Win32_Processor | Select-Object -First 1 Name,NumberOfCores,NumberOfLogicalProcessors | ConvertTo-Json -Compress"
        )
        d = json.loads(text)
        return {"name": str(d["Name"]).strip(), "cores": d.get("NumberOfCores"), "threads": d.get("NumberOfLogicalProcessors")}
    return {"name": platform.processor() or None, "cores": None, "threads": os.cpu_count()}


class _MemoryStatus(ctypes.Structure):
    _fields_ = [
        ("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong), ("ullTotalPhys", ctypes.c_ulonglong),
        ("ullAvailPhys", ctypes.c_ulonglong), ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
        ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong), ("sullAvailExtendedVirtual", ctypes.c_ulonglong),
    ]


def _memory() -> tuple[float, float]:
    if sys.platform == "win32":
        status = _MemoryStatus()
        status.dwLength = ctypes.sizeof(_MemoryStatus)
        if not ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(status)):  # type: ignore[attr-defined]
            raise OSError("GlobalMemoryStatusEx failed")
        return status.ullTotalPhys / 2**30, status.ullAvailPhys / 2**30
    page = os.sysconf("SC_PAGE_SIZE")
    return os.sysconf("SC_PHYS_PAGES") * page / 2**30, os.sysconf("SC_AVPHYS_PAGES") * page / 2**30


def _gpus() -> list[dict]:
    if sys.platform != "win32":
        raise OSError("graphics adapters are only read on Windows")
    return parse_video_controllers(
        _powershell_json("Get-CimInstance Win32_VideoController | Select-Object Name,DriverVersion,AdapterRAM | ConvertTo-Json -Compress")
    )


def _providers() -> list[str]:
    from realx.runtime.providers import installed

    return installed()


def _nvidia() -> list[dict] | None:
    exe = shutil.which("nvidia-smi")
    if not exe:
        return None
    flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    run = subprocess.run(
        [exe, "--query-gpu=name,memory.total", "--format=csv,noheader,nounits"],
        capture_output=True, text=True, timeout=PROBE_TIMEOUT_S, creationflags=flags, check=False,
    )
    if run.returncode != 0:
        raise OSError(f"nvidia-smi exited with {run.returncode}")
    out = []
    for line in run.stdout.splitlines():
        name, _, mem = line.partition(",")
        if name.strip():
            out.append({"name": name.strip(), "memory_mb": int(mem.strip()) if mem.strip().isdigit() else None})
    return out


def default_probes() -> Probes:
    return Probes(cpu=_cpu, memory=_memory, gpus=_gpus, providers=_providers, nvidia=_nvidia)


# --- detection and recommendation ---------------------------------------------------------------------------
def detect(probes: Probes | None = None) -> HardwareProfile:
    """Run every probe; a probe that fails is noted and the rest carry on."""
    probes = probes or default_probes()
    notes: list[str] = []

    def run(label: str, fn, default):
        try:
            return fn()
        except Exception as exc:  # a missing tool, a denied query, a timeout: all just mean "unknown"
            notes.append(f"could not read {label}: {type(exc).__name__}: {rlog.clip(exc, 120)}")
            log.warning("hardware probe %s failed: %s: %s", label, type(exc).__name__, rlog.clip(exc))
            return default

    cpu = run("the processor", probes.cpu, {}) or {}
    total, free = run("memory", probes.memory, (None, None))
    raw_gpus = run("the graphics adapters", probes.gpus, []) or []
    providers = tuple(run("the ONNX Runtime providers", probes.providers, []) or [])
    smi = run("nvidia-smi", probes.nvidia, None)

    gpus = []
    for g in raw_gpus:
        vendor, dedicated = classify_gpu(g["name"])
        gpus.append(Gpu(g["name"], vendor, dedicated, g.get("driver"), g.get("vram_mb")))
    for card in smi or []:   # nvidia-smi knows cards the adapter list may have missed
        if not any(x.vendor == "nvidia" and card["name"] in x.name for x in gpus):
            gpus.append(Gpu(card["name"], "nvidia", True, None, card.get("memory_mb")))

    has_nvidia = any(g.vendor == "nvidia" for g in gpus)
    return HardwareProfile(
        os=platform.platform(),
        cpu_name=cpu.get("name"), cpu_cores=cpu.get("cores"), cpu_threads=cpu.get("threads"),
        ram_total_gb=round(total, 1) if total is not None else None,
        ram_free_gb=round(free, 1) if free is not None else None,
        gpus=tuple(gpus), onnx_providers=providers,
        cuda_usable=has_nvidia and any(p in providers for p in CUDA_PROVIDERS),
        directml_available="DmlExecutionProvider" in providers,
        notes=tuple(notes),
    )


def recommend(p: HardwareProfile) -> Recommendation:
    """The control-room quality preset that suits this machine, with the reasons and what to watch."""
    reasons: list[str] = []
    warnings: list[str] = []
    dedicated = [g for g in p.gpus if g.dedicated]
    integrated = [g for g in p.gpus if not g.dedicated]
    quality = "balanced"

    if not p.gpus:
        quality = "low"
        warnings.append("No graphics adapter was detected: the browser tracker may fall back to the CPU, which is about 3 times slower.")
    if p.ram_total_gb is not None and p.ram_total_gb < 6:
        quality = "low"
        reasons.append(f"Only {p.ram_total_gb:.1f} GB of RAM.")
    elif p.cpu_threads is not None and p.cpu_threads <= 2:
        quality = "low"
        reasons.append(f"Only {p.cpu_threads} CPU thread(s).")
    elif dedicated and (p.ram_total_gb is None or p.ram_total_gb >= 7) and (p.cpu_threads is None or p.cpu_threads >= 8):
        quality = "high"
        reasons.append(f"A dedicated graphics card ({dedicated[0].name}) with enough memory and CPU threads.")
    elif integrated:
        reasons.append(
            f"Integrated graphics ({integrated[0].name}): balanced is the setting that was measured on an Intel UHD 620 laptop; "
            "higher settings were not tested there."
        )

    if any(g.vendor == "nvidia" for g in p.gpus) and not p.cuda_usable:
        warnings.append(
            "An NVIDIA card was found, but ONNX Runtime has no CUDA or TensorRT provider installed, so only the browser's "
            "own GPU path uses it. CUDA is not assumed."
        )
    if p.ram_free_gb is not None and p.ram_free_gb < 1.5:
        warnings.append(f"Only {p.ram_free_gb:.1f} GB of memory is free: close other programs (browser tabs use the most).")
    if p.notes:
        warnings.append("Some of this computer could not be read, so the advice is less certain: " + "; ".join(p.notes))
    return Recommendation(quality, tuple(reasons), tuple(warnings))


def to_dict(p: HardwareProfile, r: Recommendation) -> dict:
    return {
        "os": p.os,
        "cpu": {"name": p.cpu_name, "cores": p.cpu_cores, "threads": p.cpu_threads},
        "ram": {"total_gb": p.ram_total_gb, "free_gb": p.ram_free_gb},
        "gpus": [{"name": g.name, "vendor": g.vendor, "dedicated": g.dedicated, "driver": g.driver, "vram_mb": g.vram_mb} for g in p.gpus],
        "onnx_providers": list(p.onnx_providers),
        "cuda_usable": p.cuda_usable,
        "directml_available": p.directml_available,
        "notes": list(p.notes),
        "recommendation": {"quality": r.quality, "reasons": list(r.reasons), "warnings": list(r.warnings)},
    }


def describe(p: HardwareProfile, r: Recommendation) -> str:
    """A short readable summary for `realx hardware`."""
    gpus = ", ".join(f"{g.name} ({'dedicated' if g.dedicated else 'integrated'})" for g in p.gpus) or "none detected"
    lines = [
        f"CPU      : {p.cpu_name or 'unknown'} ({p.cpu_cores or '?'} cores, {p.cpu_threads or '?'} threads)",
        f"Memory   : {p.ram_total_gb if p.ram_total_gb is not None else '?'} GB, {p.ram_free_gb if p.ram_free_gb is not None else '?'} GB free",
        f"Graphics : {gpus}",
        f"ONNX     : {', '.join(p.onnx_providers) or 'unknown'}  (CUDA usable: {'yes' if p.cuda_usable else 'no'})",
        f"Suggested quality: {r.quality}",
    ]
    lines += [f"  - {x}" for x in r.reasons]
    lines += [f"  ! {x}" for x in r.warnings]
    return "\n".join(lines)
