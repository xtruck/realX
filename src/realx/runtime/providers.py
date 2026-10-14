from __future__ import annotations

import os
import threading
from collections.abc import Callable, Sequence
from dataclasses import dataclass, field
from typing import Any

CPU = "CPUExecutionProvider"

# Fastest first. Names match ONNX Runtime execution providers.
PREFERENCE = (
    "TensorrtExecutionProvider",
    "CUDAExecutionProvider",
    "DmlExecutionProvider",
    "OpenVINOExecutionProvider",
    "CoreMLExecutionProvider",
    CPU,
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
    if CPU not in chosen:
        chosen.append(CPU)
    return chosen


def describe(available: list[str] | None = None) -> dict:
    """What this machine offers versus what realX would like to use.

    `installed` is what ONNX Runtime reports (empty when it is not installed), `selected` the ranked
    list realX would try, `missing_accelerators` the faster providers that are not available. Presence
    of a provider does not prove it works: a driver or model problem only shows when a session starts,
    which is what `SessionCache` handles.
    """
    have = installed() if available is None else list(available)
    selected = pick_providers(have)
    return {
        "installed": have,
        "selected": selected,
        "first_choice": selected[0],
        "accelerated": selected[0] != CPU,
        "missing_accelerators": [p for p in PREFERENCE if p != CPU and p not in have],
    }


class SessionError(RuntimeError):
    """No provider, including the CPU, could start a session for this model."""


@dataclass(frozen=True)
class SessionInfo:
    model: str
    providers: tuple[str, ...]  # what was asked for, CPU last
    provider: str  # the one that actually started
    failures: dict[str, str] = field(default_factory=dict)  # provider -> why it did not start


def _ranked(providers: Sequence[str] | None) -> tuple[str, ...]:
    """The caller's order, duplicates removed, CPU always last so there is always a fallback."""
    wanted = pick_providers() if providers is None else list(providers)
    seen: list[str] = []
    for p in wanted:
        if p != CPU and p not in seen:
            seen.append(p)
    return (*seen, CPU)


def onnxruntime_session_factory(model_path: str | os.PathLike, provider: str) -> Any:
    """The real factory: one ONNX Runtime session on one provider. Raises if that provider cannot start it."""
    import onnxruntime as ort  # type: ignore

    options = ort.SessionOptions()
    options.log_severity_level = 3  # a provider that cannot start is reported through the exception, not the log
    session = ort.InferenceSession(str(model_path), sess_options=options, providers=[provider])
    if provider not in session.get_providers():  # ONNX Runtime may quietly substitute the CPU
        raise RuntimeError(f"{provider} is not active (got {session.get_providers()})")
    return session


class SessionCache:
    """Creates each inference session once, reuses it, and falls back provider by provider.

    `factory(model_path, provider)` builds a session on exactly one provider and raises when that
    provider cannot run the model. Injected so the logic is testable without onnxruntime.
    Thread-safe: concurrent `get()` calls for one model build a single session, and a slow model
    does not hold up another. Failures are not cached, so a later call tries the faster providers again.
    """

    def __init__(self, factory: Callable[[Any, str], Any] = onnxruntime_session_factory) -> None:
        self._factory = factory
        self._lock = threading.Lock()  # guards the dicts below, never held while a session is built
        self._entries: dict[tuple, tuple[Any, SessionInfo]] = {}
        self._building: dict[tuple, threading.Lock] = {}
        self._closed = False

    def __enter__(self) -> "SessionCache":
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    def __len__(self) -> int:
        with self._lock:
            return len(self._entries)

    @staticmethod
    def _key(model_path: Any, providers: Sequence[str] | None) -> tuple:
        return str(model_path), _ranked(providers)

    def get(self, model_path: Any, providers: Sequence[str] | None = None) -> Any:
        key = self._key(model_path, providers)
        with self._lock:
            if self._closed:
                raise RuntimeError("the session cache is closed")
            hit = self._entries.get(key)
            if hit:
                return hit[0]
            build = self._building.setdefault(key, threading.Lock())
        with build:  # one builder per key; others wait here and then find the entry
            with self._lock:
                if self._closed:
                    raise RuntimeError("the session cache is closed")
                hit = self._entries.get(key)
                if hit:
                    return hit[0]
            session, info = self._build(key)
            with self._lock:
                if self._closed:  # closed while this session was being built
                    self._close_one(session)
                    raise RuntimeError("the session cache is closed")
                self._entries[key] = (session, info)
                self._building.pop(key, None)
            return session

    def _build(self, key: tuple) -> tuple[Any, SessionInfo]:
        model, ranked = key
        failures: dict[str, str] = {}
        for provider in ranked:
            try:
                session = self._factory(model, provider)
            except Exception as exc:  # a driver, a missing DLL, an unsupported operator: all mean "try the next one"
                failures[provider] = f"{type(exc).__name__}: {exc}"
                continue
            return session, SessionInfo(model, ranked, provider, failures)
        detail = "; ".join(f"{p}: {why}" for p, why in failures.items())
        raise SessionError(f"no execution provider could start {model} ({detail})")

    def info(self, model_path: Any, providers: Sequence[str] | None = None) -> SessionInfo:
        with self._lock:
            hit = self._entries.get(self._key(model_path, providers))
        if hit is None:
            raise KeyError(f"no session loaded for {model_path}")
        return hit[1]

    def loaded(self) -> list[dict]:
        """What is loaded now, for a status display or a benchmark's report."""
        with self._lock:
            infos = [i for _, i in self._entries.values()]
        return [
            {"model": i.model, "provider": i.provider, "requested": list(i.providers), "failures": dict(i.failures)}
            for i in infos
        ]

    @staticmethod
    def _close_one(session: Any) -> None:
        closer = getattr(session, "close", None)
        if callable(closer):
            try:
                closer()
            except Exception:  # one stubborn session must not keep the others open
                pass

    def close(self) -> None:
        with self._lock:
            self._closed = True
            sessions = [s for s, _ in self._entries.values()]
            self._entries.clear()
        for session in sessions:
            self._close_one(session)
