"""Optional remote adapter: a transport abstraction, a fake transport, and nothing that touches a network.

STATE TODAY: there is no real transport. `Transport` is an interface, `FakeTransport` records what it is
given, and the only way to send anything is through `RemoteAdapter`, which refuses unless every one of
these holds:

    * the adapter is enabled on purpose (`RemoteConfig.enabled`, default False; `REALX_REMOTE=1` selects it
      in `RemoteConfig.from_env`)
    * the destination is an https URL whose host is in `allowed_hosts` (exact match, no userinfo, no
      redirect following by this layer)
    * a credential, when the destination needs one, comes from an environment variable named in the config.
      It is read at send time, passed to the transport as a header value, and never stored on the adapter,
      printed, logged, or put in an exception message
    * the call has a bounded timeout and can be cancelled; only one request is in flight (a newer rig
      replaces waiting, it never queues)

What is serialised: `serialize_rig` takes the numbers the local tracker already produces (x, y, scale,
depth, yaw, pitch, roll, smile) and a sequence number, and nothing else. It cannot be given camera frames,
a portrait, a file, text, or a face identity: any other key or type is an error, not silently dropped.
`tests/test_remote.py` proves the exact bytes.

Not decided here, and so not implemented: any provider, any real HTTP client, any upload of images. Adding
a real transport must come with its own review (docs/REMOTE.md lists what that review has to cover).
"""

from __future__ import annotations

import json
import math
import os
import re
import threading
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Protocol, runtime_checkable
from urllib.parse import urlsplit

from realx import log as rlog

log = rlog.get_logger("remote")

REMOTE_ENV = "REALX_REMOTE"
DEFAULT_TOKEN_ENV = "REALX_REMOTE_TOKEN"
MAX_TIMEOUT_S = 30.0
MAX_REQUEST_BYTES = 2048
MAX_RESPONSE_BYTES = 4096
SCHEMA = 1

# the only things that may leave the machine, with the range each must be inside
RIG_FIELDS: dict[str, tuple[float, float]] = {
    "x": (-1.5, 1.5), "y": (-1.5, 1.5), "scale": (0.0, 10.0), "depth": (0.0, 20.0),
    "yaw": (-1.5, 1.5), "pitch": (-1.5, 1.5), "roll": (-1.5, 1.5), "smile": (0.0, 1.0),
}
_HOST = re.compile(r"[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+")
_TOKEN_OK = re.compile(r"[\x21-\x7e]{8,4096}")  # printable ASCII, no spaces or line breaks (no header injection)


class RemoteError(RuntimeError):
    """The adapter refused, the transport failed, or the answer was not acceptable. Messages never hold data."""


class RemoteDisabled(RemoteError):
    """Remote processing is off (the default) or not allowed for this destination."""


class RemoteTimeout(RemoteError):
    pass


class RemoteCancelled(RemoteError):
    pass


@dataclass(frozen=True)
class RemoteRequest:
    url: str
    body: bytes
    headers: Mapping[str, str]  # contains the credential value: transports must not log it
    timeout_s: float

    def __repr__(self) -> str:  # a request shows up in tracebacks and logs: show its shape, never its content
        return f"RemoteRequest(host={urlsplit(self.url).hostname!r}, bytes={len(self.body)}, header_names={sorted(self.headers)})"


@dataclass(frozen=True)
class RemoteResponse:
    status: int
    body: bytes


@runtime_checkable
class Transport(Protocol):
    """Sends one request and returns the answer. A real implementation must honour `timeout_s`, check
    `cancel` while waiting, refuse redirects to other hosts, and never log `request.headers` or `request.body`."""

    def send(self, request: RemoteRequest, cancel: threading.Event) -> RemoteResponse: ...


@dataclass(frozen=True)
class RemoteConfig:
    enabled: bool = False
    url: str = ""
    allowed_hosts: tuple[str, ...] = ()
    timeout_s: float = 5.0
    token_env: str | None = DEFAULT_TOKEN_ENV  # NAME of the environment variable; None sends no credential

    @staticmethod
    def from_env(url: str, allowed_hosts: tuple[str, ...], **kw) -> "RemoteConfig":
        return RemoteConfig(enabled=os.environ.get(REMOTE_ENV, "").strip() == "1", url=url, allowed_hosts=allowed_hosts, **kw)

    def checked_host(self) -> str:
        """The destination host, once the url and allowlist are acceptable. Raises RemoteDisabled otherwise."""
        if not self.enabled:
            raise RemoteDisabled(f"remote processing is off; it needs enabled=True ({REMOTE_ENV}=1)")
        if not self.allowed_hosts:
            raise RemoteDisabled("no host is allowlisted")
        for h in self.allowed_hosts:
            if not isinstance(h, str) or h != h.lower() or not _HOST.fullmatch(h) or not h.rsplit(".", 1)[1][0].isalpha():
                raise RemoteDisabled("allowed_hosts must be lower-case DNS names with at least one dot (no IPs, wildcards or ports)")
        parts = urlsplit(self.url)
        if parts.scheme != "https":
            raise RemoteDisabled("the destination must be an https URL")
        if parts.username is not None or parts.password is not None or "@" in parts.netloc:
            raise RemoteDisabled("the destination URL must not contain credentials")
        host = (parts.hostname or "").lower()
        if host not in self.allowed_hosts:
            raise RemoteDisabled("the destination host is not allowlisted")
        if parts.port not in (None, 443):
            raise RemoteDisabled("the destination must use the standard https port")
        if not 0 < self.timeout_s <= MAX_TIMEOUT_S:
            raise RemoteDisabled(f"timeout_s must be between 0 and {MAX_TIMEOUT_S:g}")
        return host


def serialize_rig(rig: Mapping[str, object], seq: int) -> bytes:
    """The exact bytes sent: {"v":1,"seq":n,"rig":{...eight numbers...}}. Anything else is refused."""
    if not isinstance(rig, Mapping):
        raise RemoteError("the rig must be a mapping of numbers")
    if isinstance(seq, bool) or not isinstance(seq, int) or not 0 <= seq < 2**31:
        raise RemoteError("seq must be a small non-negative integer")
    extra = set(rig) - set(RIG_FIELDS)
    if extra:
        raise RemoteError(f"not allowed to send: {len(extra)} unexpected field(s)")  # the names could hold data: not echoed
    missing = set(RIG_FIELDS) - set(rig)
    if missing:
        raise RemoteError(f"missing rig field(s): {', '.join(sorted(missing))}")
    out: dict[str, float] = {}
    for name, (lo, hi) in RIG_FIELDS.items():
        v = rig[name]
        if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) or not lo <= v <= hi:
            raise RemoteError(f"rig field '{name}' must be a finite number between {lo:g} and {hi:g}")
        out[name] = round(float(v), 4)
    body = json.dumps({"v": SCHEMA, "seq": seq, "rig": out}, separators=(",", ":"), sort_keys=True, allow_nan=False).encode()
    if len(body) > MAX_REQUEST_BYTES:
        raise RemoteError("request too large")
    return body


def parse_response(raw: bytes) -> dict[str, float]:
    """An answer is the same eight numbers, in range. Extra keys, text or oversize bodies are rejected."""
    if len(raw) > MAX_RESPONSE_BYTES:
        raise RemoteError("response too large")
    try:
        doc = json.loads(raw)
    except (ValueError, RecursionError):
        raise RemoteError("response is not valid JSON") from None
    if not isinstance(doc, dict) or set(doc) != {"v", "seq", "rig"} or doc["v"] != SCHEMA:
        raise RemoteError("response has an unexpected shape")
    rig = doc["rig"]
    if not isinstance(rig, dict):
        raise RemoteError("response has an unexpected shape")
    serialize_rig(rig, doc["seq"] if isinstance(doc["seq"], int) and not isinstance(doc["seq"], bool) else -1)  # same checks
    return {k: float(rig[k]) for k in RIG_FIELDS}


class RemoteAdapter:
    """Sends rig numbers through a `Transport` under the rules above. One request at a time; a request that
    arrives while another is running is refused (the caller keeps using its local result)."""

    def __init__(self, config: RemoteConfig, transport: Transport) -> None:
        self._config = config
        self._transport = transport
        self._busy = threading.Lock()
        self._cancel = threading.Event()
        self._seq = 0
        self.sent = 0
        self.refused = 0

    def __repr__(self) -> str:
        return f"RemoteAdapter(enabled={self._config.enabled}, transport={type(self._transport).__name__})"

    def _credential(self) -> str | None:
        name = self._config.token_env
        if name is None:
            return None
        token = os.environ.get(name)
        if not token:
            raise RemoteDisabled("the credential variable is not set")  # the variable's name is the user's, the value is not shown
        if not _TOKEN_OK.fullmatch(token):
            raise RemoteDisabled("the credential has an invalid form")
        return token

    def cancel(self) -> None:
        """Ask the running request (if any) to stop. The next request starts fresh."""
        self._cancel.set()

    def submit(self, rig: Mapping[str, object]) -> dict[str, float]:
        try:
            host = self._config.checked_host()
            token = self._credential()
            body = serialize_rig(rig, self._seq)
        except RemoteError:
            self.refused += 1
            raise
        if not self._busy.acquire(blocking=False):
            self.refused += 1
            raise RemoteError("a request is already in flight")
        try:
            self._cancel.clear()
            headers = {"Content-Type": "application/json", "Accept": "application/json"}
            if token is not None:
                headers["Authorization"] = f"Bearer {token}"
            request = RemoteRequest(self._config.url, body, headers, self._config.timeout_s)
            self._seq += 1
            self.sent += 1
            log.info("remote request: host=%s bytes=%d", host, len(body))  # never the body, never a header
            response = self._send_bounded(request)
        finally:
            self._busy.release()
        if response.status != 200:
            raise RemoteError(f"the server answered with status {int(response.status)}")
        return parse_response(response.body)

    def _send_bounded(self, request: RemoteRequest) -> RemoteResponse:
        """Run the transport on a daemon thread and stop waiting at the deadline, whatever the transport does."""
        box: dict = {}
        done = threading.Event()

        def run() -> None:
            try:
                box["response"] = self._transport.send(request, self._cancel)
            except BaseException as exc:
                box["error"] = exc
            finally:
                done.set()

        threading.Thread(target=run, name="realx-remote", daemon=True).start()
        if not done.wait(request.timeout_s):
            self._cancel.set()
            raise RemoteTimeout(f"no answer within {request.timeout_s:g} s")
        if self._cancel.is_set() and "response" not in box:
            raise RemoteCancelled("the request was cancelled")
        error = box.get("error")
        if error is not None:
            if isinstance(error, RemoteError):
                raise error
            raise RemoteError(f"the transport failed ({type(error).__name__})") from None  # never the message: it may hold a URL or token
        response = box.get("response")
        if not isinstance(response, RemoteResponse):
            raise RemoteError("the transport returned something that is not a response")
        return response


@dataclass
class FakeTransport:
    """For tests. Records what it was asked to send (the credential value is kept out of the record) and
    answers from a script. It opens no sockets."""

    reply: object = None            # RemoteResponse, a callable(request) -> RemoteResponse, or an Exception to raise
    delay_s: float = 0.0
    requests: list = field(default_factory=list)  # (url, body, header_names, authorization_present, timeout_s)
    cancelled_seen: int = 0

    def send(self, request: RemoteRequest, cancel: threading.Event) -> RemoteResponse:
        self.requests.append((request.url, request.body, tuple(sorted(request.headers)), "Authorization" in request.headers, request.timeout_s))
        if self.delay_s and cancel.wait(self.delay_s):
            self.cancelled_seen += 1
            raise RemoteCancelled("cancelled")
        reply = self.reply
        if isinstance(reply, BaseException):
            raise reply
        if callable(reply):
            return reply(request)
        if isinstance(reply, RemoteResponse):
            return reply
        return RemoteResponse(200, echo_body(request.body))


def echo_body(body: bytes) -> bytes:
    """A well-formed answer: the same numbers back."""
    doc = json.loads(body)
    return json.dumps({"v": SCHEMA, "seq": doc["seq"], "rig": doc["rig"]}, separators=(",", ":")).encode()
