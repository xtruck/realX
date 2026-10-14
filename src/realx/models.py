"""Model manifest: every model realX may load, with license and integrity data.

Models flagged `blocked` can never be loaded. Downloads are verified against a pinned
SHA-256 so a swapped or corrupted file is rejected.
"""

from __future__ import annotations

import hashlib
import os
import urllib.request
from dataclasses import dataclass
from pathlib import Path


class ModelError(RuntimeError):
    pass


@dataclass(frozen=True)
class ModelSpec:
    name: str
    filename: str
    url: str
    sha256: str
    license: str
    commercial_ok: bool
    purpose: str


MANIFEST: dict[str, ModelSpec] = {
    "yunet": ModelSpec(
        name="yunet",
        filename="face_detection_yunet_2023mar.onnx",
        url="https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/"
        "face_detection_yunet_2023mar.onnx",
        sha256="8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4",
        license="MIT",
        commercial_ok=True,
        purpose="face detection + 5 landmarks (CPU friendly)",
    ),
}

# Never loaded, listed so the audit trail is explicit. See docs/LICENSE-AUDIT.md.
BLOCKED = {
    "inswapper_128": "InsightFace models are non-commercial research only",
    "buffalo_l": "InsightFace models are non-commercial research only",
}


def models_dir() -> Path:
    base = os.environ.get("REALX_MODELS_DIR")
    if base:
        return Path(base)
    return Path(__file__).resolve().parents[2] / "models"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def ensure_model(name: str, download: bool = True) -> Path:
    if name in BLOCKED:
        raise ModelError(f"model '{name}' is blocked: {BLOCKED[name]}")
    spec = MANIFEST.get(name)
    if spec is None:
        raise ModelError(f"unknown model '{name}' (known: {', '.join(sorted(MANIFEST))})")
    path = models_dir() / spec.filename
    if path.is_file():
        if sha256_file(path) != spec.sha256:
            raise ModelError(f"{spec.filename}: checksum mismatch, delete it and retry")
        return path
    if not download:
        raise ModelError(f"{spec.filename} missing; run `realx models fetch`")
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".part")
    try:
        with urllib.request.urlopen(spec.url, timeout=60) as resp, open(tmp, "wb") as out:
            out.write(resp.read())
        if sha256_file(tmp) != spec.sha256:
            raise ModelError(f"{spec.filename}: downloaded file failed checksum")
        tmp.replace(path)
    finally:
        tmp.unlink(missing_ok=True)
    return path
