"""Settings for the Path B link (docs/DECISION-PATH-B.md). Off by default (G1); the destination is checked here (G2).

Nothing in this module looks at process settings: whether the link is on is decided by the caller, in code, on purpose.
The one way to point the link at plain http is `unsafe_loopback_http_for_tests`, which accepts only http://127.0.0.1.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from urllib.parse import urlsplit

MAX_BUDGET_S = 1.0  # G7: fall back to the local picture within one second
DEFAULT_TOKEN_ENV = "REALX_GPULINK_TOKEN"
_LABEL = r"[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?"
_HOST = re.compile(rf"{_LABEL}(\.{_LABEL})+")
_ENV_NAME = re.compile(r"[A-Za-z_][A-Za-z0-9_]{0,63}")


class GpuLinkConfigError(ValueError):
    """The settings were refused. Messages never hold a token."""


def _dns_name(host: str) -> bool:
    """A real DNS name: at least two labels, a last label that is not a number (so no IPv4 in decimal, octal or hex form)."""
    if not _HOST.fullmatch(host) or len(host) > 253:
        return False
    last = host.rsplit(".", 1)[1]
    return not (last.isdigit() or last.startswith("0x"))


@dataclass(frozen=True)
class GpuLinkConfig:
    enabled: bool = False
    url: str = ""
    allowed_hosts: tuple[str, ...] = ()
    budget_s: float = MAX_BUDGET_S
    max_fps: float = 30.0
    max_jpeg_bytes: int = 400_000
    max_dim: int = 1280
    token_env: str = DEFAULT_TOKEN_ENV
    jpeg_quality: int = 80
    # set only by unsafe_loopback_http_for_tests; init=False, so dataclasses.replace() drops it
    _loopback: bool = field(default=False, init=False, repr=False, compare=False)

    def __post_init__(self) -> None:
        self._check()

    # -- derived ------------------------------------------------------------------------------------------------

    @property
    def host(self) -> str:
        return urlsplit(self.url).hostname or ""

    @property
    def port(self) -> int:
        parts = urlsplit(self.url)
        return parts.port or (80 if parts.scheme == "http" else 443)

    @property
    def tls(self) -> bool:
        return urlsplit(self.url).scheme == "https"

    @property
    def path(self) -> str:
        return "/v1/frame"

    # -- validation ---------------------------------------------------------------------------------------------

    def _check(self) -> None:
        if not (0 < float(self.budget_s) <= MAX_BUDGET_S):
            raise GpuLinkConfigError(f"budget_s must be above 0 and at most {MAX_BUDGET_S}")
        if not self.max_fps > 0:
            raise GpuLinkConfigError("max_fps must be above 0")
        if int(self.max_jpeg_bytes) <= 0 or int(self.max_dim) <= 0:
            raise GpuLinkConfigError("max_jpeg_bytes and max_dim must be above 0")
        if not 1 <= int(self.jpeg_quality) <= 100:
            raise GpuLinkConfigError("jpeg_quality must be 1..100")
        if not _ENV_NAME.fullmatch(self.token_env):
            raise GpuLinkConfigError("token_env is not a valid variable name")
        if not self.enabled and not self.url:
            return
        if self.enabled and not self.url:
            raise GpuLinkConfigError("the link is enabled but no url is set")
        self._check_url()

    def _check_url(self) -> None:
        try:
            parts = urlsplit(self.url)
            port = parts.port
        except ValueError as exc:
            raise GpuLinkConfigError("the url cannot be parsed") from exc
        if self._loopback:
            if parts.scheme != "http" or parts.hostname != "127.0.0.1":
                raise GpuLinkConfigError("the test escape accepts only http://127.0.0.1")
        else:
            if parts.scheme != "https":
                raise GpuLinkConfigError("the url must be https")
            host = parts.hostname or ""
            if not _dns_name(host):
                raise GpuLinkConfigError("the host must be a DNS name (no IP address, no trailing dot)")
            if not self.allowed_hosts:
                raise GpuLinkConfigError("allowed_hosts is empty")
            if any(not isinstance(h, str) or not _dns_name(h) for h in self.allowed_hosts):
                raise GpuLinkConfigError("allowed_hosts may only hold DNS names")
            if host not in {h for h in self.allowed_hosts}:
                raise GpuLinkConfigError("the host is not on the allow-list")
        if parts.username is not None or parts.password is not None:
            raise GpuLinkConfigError("the url must not carry credentials")
        if parts.query or parts.fragment or parts.path not in ("", "/"):
            raise GpuLinkConfigError("the url must be a bare origin")
        if port is not None and not 0 < port < 65536:
            raise GpuLinkConfigError("bad port")

    @classmethod
    def unsafe_loopback_http_for_tests(cls, url: str, enabled: bool = True, **kw) -> GpuLinkConfig:
        """Plain http to 127.0.0.1 for the loopback tests. The result cannot be copied into another destination."""
        cfg = object.__new__(cls)
        values = {f.name: f.default for f in cls.__dataclass_fields__.values() if f.init}
        values.update(kw, enabled=enabled, url=url)
        for name, value in values.items():
            object.__setattr__(cfg, name, value)
        object.__setattr__(cfg, "_loopback", True)
        cfg._check()
        return cfg
