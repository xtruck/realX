"""Baseline provenance watermark (LSB). Not robust to re-encoding.

Production replaces this with a compression-robust watermark plus C2PA credentials
(roadmap M4). The interface (embed/extract) stays the same.

Without a key the payload is plain data anyone can forge. With a key, a 16 byte
HMAC tag is appended and `extract` only returns payloads whose tag verifies.
Absence of a watermark proves nothing: it is trivially removed.
"""

from __future__ import annotations

import hashlib
import hmac

import numpy as np

_MAGIC = b"RX1"
_TAG_BYTES = 16
MAX_PAYLOAD = 255


def _tag(key: bytes, payload: bytes) -> bytes:
    return hmac.new(key, b"realx-watermark-v1\0" + payload, hashlib.sha256).digest()[:_TAG_BYTES]


def embed(pixels: np.ndarray, payload: bytes, key: bytes | None = None) -> np.ndarray:
    if pixels.dtype != np.uint8:
        raise ValueError("pixels must be uint8")
    if not payload or len(payload) > MAX_PAYLOAD:
        raise ValueError(f"payload must be 1..{MAX_PAYLOAD} bytes")
    body = payload + (_tag(key, payload) if key else b"")
    data = _MAGIC + bytes([1 if key else 0, len(payload)]) + body
    bits = np.unpackbits(np.frombuffer(data, dtype=np.uint8))
    flat = np.ascontiguousarray(pixels).reshape(-1).copy()
    if bits.size > flat.size:
        raise ValueError("frame too small for watermark payload")
    flat[: bits.size] = (flat[: bits.size] & 0xFE) | bits
    return flat.reshape(pixels.shape)


def extract(pixels: np.ndarray, key: bytes | None = None) -> bytes | None:
    """Return the payload, or None if absent (or, with `key`, if not authentic)."""
    if pixels.dtype != np.uint8:
        return None
    flat = np.ascontiguousarray(pixels).reshape(-1)
    header_bytes = len(_MAGIC) + 2
    header_bits = header_bytes * 8
    if flat.size < header_bits:
        return None
    header = np.packbits(flat[:header_bits] & 1).tobytes()
    if header[: len(_MAGIC)] != _MAGIC:
        return None
    signed, length = header[len(_MAGIC)], header[len(_MAGIC) + 1]
    if length == 0:
        return None
    total_bits = header_bits + (length + (_TAG_BYTES if signed else 0)) * 8
    if flat.size < total_bits:
        return None
    body = np.packbits(flat[header_bits:total_bits] & 1).tobytes()
    payload, tag = body[:length], body[length:]
    if key is None:
        return payload
    if not signed or not hmac.compare_digest(_tag(key, payload), tag):
        return None
    return payload
