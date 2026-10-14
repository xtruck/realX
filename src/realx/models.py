"""Model manifest: every model realX may load, with license and integrity data.

Models flagged `blocked` can never be loaded. Downloads are verified against a pinned
SHA-256 so a swapped or corrupted file is rejected.
"""

from __future__ import annotations

import hashlib
import os
import tempfile
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from realx import log as rlog

log = rlog.get_logger("models")

MAX_MODEL_BYTES = 64 * 1024 * 1024


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
    mirrors: tuple[str, ...] = ()  # same bytes elsewhere; the pinned hash decides what is accepted


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
        mirrors=(
            "https://huggingface.co/opencv/face_detection_yunet/resolve/main/face_detection_yunet_2023mar.onnx",
        ),
    ),
    # PaddleSeg PP-HumanSeg (Apache-2.0, ported by OpenCV). Used only to cut the user's own
    # camera picture from its background; it never produces or alters a face.
    "pphumanseg": ModelSpec(
        name="pphumanseg",
        filename="human_segmentation_pphumanseg_2023mar.onnx",
        url="https://github.com/opencv/opencv_zoo/raw/main/models/human_segmentation_pphumanseg/"
        "human_segmentation_pphumanseg_2023mar.onnx",
        sha256="552d8a984054e59b5d773d24b9b12022b22046ceb2bbc4c9aaeaceb36a9ddf24",
        license="Apache-2.0",
        commercial_ok=True,
        purpose="person segmentation for background replacement (CPU friendly)",
        mirrors=(
            "https://huggingface.co/opencv/human_segmentation_pphumanseg/resolve/main/"
            "human_segmentation_pphumanseg_2023mar.onnx",
        ),
    ),
    # MediaPipe Tasks (Apache-2.0 code; model cards state Apache-2.0). They run in the browser
    # (the avatar page), where they track the whole body; Python only serves the files.
    "mp_face": ModelSpec(
        name="mp_face",
        filename="face_landmarker.task",
        url="https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
        sha256="64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff",
        license="Apache-2.0",
        commercial_ok=True,
        purpose="face landmarks and 52 blendshapes (eyes, gaze, mouth) for the character",
    ),
    "mp_pose": ModelSpec(
        name="mp_pose",
        filename="pose_landmarker_lite.task",
        url="https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
        sha256="59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a",
        license="Apache-2.0",
        commercial_ok=True,
        purpose="33-point body pose in 3D (spine, arms, legs, feet) for the character",
    ),
    "mp_hand": ModelSpec(
        name="mp_hand",
        filename="hand_landmarker.task",
        url="https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
        sha256="fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1",
        license="Apache-2.0",
        commercial_ok=True,
        purpose="21-point hands and every finger for the character",
    ),
}

# Never loaded, listed so the audit trail is explicit. See docs/LICENSE-AUDIT.md.
BLOCKED = {
    "inswapper_128": "InsightFace models are non-commercial research only",
    "buffalo_l": "InsightFace models are non-commercial research only",
    # Portrait-animation components, reviewed against primary sources on 2026-10-14; see docs/PORTRAIT.md.
    "liveportrait": (
        "LivePortrait's official bundle runs InsightFace buffalo_l (non-commercial research only; its own LICENSE says "
        "to remove and replace those models for commercial use), and its weights were trained on datasets whose terms "
        "are unverified (the paper names RAVDESS, which is CC BY-NC-SA 4.0, and a private dataset)"
    ),
    "liveportrait_animals": "LivePortrait animals mode needs X-Pose, whose license is not stated (GitHub: NOASSERTION); same training-data caveat",
    "xpose": "X-Pose (IDEA-Research) has no standard license (GitHub reports NOASSERTION); not verified for any use here",
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
    failures: list[str] = []
    for url in (spec.url, *spec.mirrors):
        host = url.split("/")[2] if url.count("/") >= 2 else "unknown host"
        log.info("model %s: downloading from %s", name, host)
        try:
            _download(spec, url, path)
            log.info("model %s: downloaded and verified (%s)", name, spec.filename)
            return path
        except ModelError as exc:
            log.warning("model %s: download from %s refused: %s", name, host, rlog.clip(exc))
            failures.append(str(exc))
        except OSError as exc:  # network error, HTTP error status, timeout
            log.warning("model %s: download from %s failed: %s", name, host, rlog.clip(exc))
            failures.append(f"{spec.filename}: {url.split('/')[2]}: {exc}")
    raise ModelError("; ".join(failures))


def _download(spec: ModelSpec, url: str, path: Path) -> None:
    if not url.startswith("https://"):
        raise ModelError(f"{spec.filename}: refusing a non-HTTPS download")
    # unique, exclusively created temp file: a pre-planted link cannot redirect the write
    fd, tmp_name = tempfile.mkstemp(prefix=spec.filename + ".", suffix=".part", dir=path.parent)
    tmp = Path(tmp_name)
    try:
        h = hashlib.sha256()
        size = 0
        with os.fdopen(fd, "wb") as out, urllib.request.urlopen(url, timeout=60) as resp:
            while True:
                chunk = resp.read(1 << 16)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_MODEL_BYTES:
                    raise ModelError(f"{spec.filename}: download is larger than {MAX_MODEL_BYTES} bytes")
                h.update(chunk)
                out.write(chunk)
        if h.hexdigest() != spec.sha256:
            raise ModelError(f"{spec.filename}: downloaded file failed checksum")
        os.replace(tmp, path)
    finally:
        tmp.unlink(missing_ok=True)
