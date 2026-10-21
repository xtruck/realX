"""The machine on the other end of the Path B link (docs/DECISION-PATH-B.md): a small HTTP server for a rented GPU.

It lives at the repository top level, outside `src/realx`, so it is never part of the `realx` wheel. This skeleton only moves frames
through a neutral filter (`PassThrough`); no model is imported, loaded or named here. A model, once the owner has a licence for it
and has downloaded the weights onto the rented machine, would be another `FrameFilter`.
"""

from gpu_server.app import FrameFilter, GpuServer, PassThrough, ServerConfig, startup_check

__all__ = ["FrameFilter", "GpuServer", "PassThrough", "ServerConfig", "startup_check"]
