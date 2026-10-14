from realx.stages import builtin, vision  # noqa: F401  (registers built-in stages)
from realx.stages.base import Stage, available, create, register
from realx.audio import stages as _audio_stages  # noqa: E402,F401  (registers voice stages)

__all__ = ["Stage", "available", "create", "register"]
