from __future__ import annotations

from collections.abc import Callable
from typing import Any, Protocol, runtime_checkable

from realx.types import FrameContext


@runtime_checkable
class Stage(Protocol):
    """One step of the pipeline. Stages are created from config by name.

    Optional class attributes the pipeline understands:
      requires_consent  stage synthesizes faces; needs a consent gate before it
      is_gate           stage is a consent gate
      uses_likeness     stage renders a real person's likeness; needs a disclosure label after it
      is_disclosure     stage burns a visible "digital host" label into the picture
      is_watermark      stage embeds provenance; must follow synthesizing stages
      alters_media      stage edits pixels or samples; must come before any watermark
      stateful          stage keeps per-stream state; forces workers=1
    """

    name: str

    def setup(self) -> None: ...

    def process(self, ctx: FrameContext) -> FrameContext: ...

    def close(self) -> None: ...


_REGISTRY: dict[str, Callable[..., Stage]] = {}


def register(name: str) -> Callable[[Any], Any]:
    def deco(factory: Any) -> Any:
        if name in _REGISTRY:
            raise ValueError(f"stage already registered: {name}")
        _REGISTRY[name] = factory
        return factory

    return deco


def create(name: str, **options: Any) -> Stage:
    try:
        factory = _REGISTRY[name]
    except KeyError:
        known = ", ".join(sorted(_REGISTRY)) or "none"
        raise KeyError(f"unknown stage '{name}' (known: {known})") from None
    return factory(**options)


def available() -> list[str]:
    return sorted(_REGISTRY)
