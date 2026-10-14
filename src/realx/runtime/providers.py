from __future__ import annotations

# Fastest first. Names match ONNX Runtime execution providers.
PREFERENCE = (
    "TensorrtExecutionProvider",
    "CUDAExecutionProvider",
    "DmlExecutionProvider",
    "OpenVINOExecutionProvider",
    "CoreMLExecutionProvider",
    "CPUExecutionProvider",
)


def installed() -> list[str]:
    try:
        import onnxruntime  # type: ignore
    except ImportError:
        return []
    return list(onnxruntime.get_available_providers())


def pick_providers(available: list[str] | None = None) -> list[str]:
    """Return providers in preference order, always ending with CPU."""
    have = installed() if available is None else available
    chosen = [p for p in PREFERENCE if p in have]
    if "CPUExecutionProvider" not in chosen:
        chosen.append("CPUExecutionProvider")
    return chosen
