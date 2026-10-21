"""Logging for realx: one logger tree ("realx.*"), plain text by default, JSON lines on request.

Rules the rest of the code follows:
- log what an operator needs to find a fault: the failing part, the exception type and message, a traceback;
- never log picture, audio, body-message or consent contents, only counts, names and error text;
- text that came from outside (a path, an error string) goes through `clip()` first so it cannot inject lines;
- a fault that repeats every retry is logged once (`Dedup`), not once per retry.

Set the level with `--log-level` or the REALX_LOG_LEVEL environment variable; `--log-json` writes JSON lines.
"""

from __future__ import annotations

import json
import logging
import os
import sys
import threading
import time
import traceback
from typing import IO

ROOT = "realx"
_MAX = 200
_PLAIN = "%(asctime)s %(levelname)s %(name)s: %(message)s"

# a library should say nothing until the application chooses to listen
logging.getLogger(ROOT).addHandler(logging.NullHandler())


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name if name == ROOT or name.startswith(ROOT + ".") else f"{ROOT}.{name}")


def clip(value: object, limit: int = _MAX) -> str:
    """Printable text only, at most `limit` characters: safe to put in a log line."""
    if value is None:
        return ""
    if isinstance(value, bytes):
        value = value.decode("utf-8", "replace")
    return "".join(ch for ch in str(value) if ch.isprintable())[:limit]


class Dedup:
    """`first(key)` is True the first time a key is seen and again only after `every_s` seconds."""

    def __init__(self, every_s: float = 300.0) -> None:
        self.every_s = every_s
        self._seen: dict[object, float] = {}
        self._lock = threading.Lock()

    def first(self, key: object) -> bool:
        with self._lock:
            return self._first(key)

    def _first(self, key: object) -> bool:
        now = time.monotonic()
        last = self._seen.get(key)
        if last is None or now - last > self.every_s:
            if len(self._seen) > 256:  # bounded: forget the oldest rather than grow with every new message
                self._seen.pop(min(self._seen, key=self._seen.get))
            self._seen[key] = now
            return True
        return False

    def forget(self, key: object) -> None:
        with self._lock:
            self._seen.pop(key, None)


class _Json(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        stamp = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(record.created)) + f".{int(record.msecs):03d}Z"
        out: dict[str, str] = {"ts": stamp, "level": record.levelname, "logger": record.name, "msg": record.getMessage()}
        if record.exc_info and record.exc_info[1] is not None:
            kind, err, tb = record.exc_info
            out["exc"] = f"{kind.__name__}: {err}"
            out["trace"] = "".join(traceback.format_exception(kind, err, tb))
        return json.dumps(out, ensure_ascii=False)


def configure(level: str | None = None, json_lines: bool = False, stream: IO[str] | None = None) -> logging.Handler:
    """Install the one handler. Safe to call again: it replaces its own handler, never stacks them."""
    name = str(level or os.environ.get("REALX_LOG_LEVEL") or "INFO")
    value = logging.getLevelName(name.upper())
    if not isinstance(value, int):
        raise ValueError(f"unknown log level {name!r} (use DEBUG, INFO, WARNING or ERROR)")
    root = logging.getLogger(ROOT)
    reset()
    handler = logging.StreamHandler(stream or sys.stderr)
    handler._realx = True  # type: ignore[attr-defined]
    handler.setFormatter(_Json() if json_lines else logging.Formatter(_PLAIN))
    root.addHandler(handler)
    root.setLevel(value)
    return handler


def reset() -> None:
    """Remove the handler installed by `configure` (used by tests and before re-configuring)."""
    root = logging.getLogger(ROOT)
    for handler in [h for h in root.handlers if getattr(h, "_realx", False)]:
        root.removeHandler(handler)
    root.setLevel(logging.NOTSET)
