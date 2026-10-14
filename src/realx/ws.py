"""Minimal RFC 6455 server side, text frames out only. No dependencies.

Just enough for the rig stream: handshake, unfragmented text frames to the client,
and a reader for the small control frames a browser sends back (ping, close).
Client frames must be masked and are capped, so a hostile page cannot make us buffer.
"""

from __future__ import annotations

import base64
import hashlib
import select
import socket
import struct
import time

GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
MAX_CLIENT_PAYLOAD = 1024
MAX_CONTROL_PAYLOAD = 125  # RFC 6455 5.5: ping, pong and close frames carry at most this much

OP_TEXT, OP_CLOSE, OP_PING, OP_PONG = 0x1, 0x8, 0x9, 0xA


class WebSocketError(ValueError):
    """A client frame we refuse. `code` is the close code to tell the client (RFC 6455 7.4.1)."""

    def __init__(self, message: str, code: int = 1002) -> None:
        super().__init__(message)
        self.code = code


def accept_key(client_key: str) -> str:
    return base64.b64encode(hashlib.sha1((client_key + GUID).encode("ascii")).digest()).decode("ascii")


def valid_client_key(key: str | None) -> bool:
    if not key:
        return False
    try:
        return len(base64.b64decode(key, validate=True)) == 16
    except ValueError:
        return False


def encode_frame(opcode: int, payload: bytes) -> bytes:
    n = len(payload)
    if n < 126:
        head = struct.pack("!BB", 0x80 | opcode, n)
    elif n < 1 << 16:
        head = struct.pack("!BBH", 0x80 | opcode, 126, n)
    else:
        head = struct.pack("!BBQ", 0x80 | opcode, 127, n)
    return head + payload


def encode_text(text: str) -> bytes:
    return encode_frame(OP_TEXT, text.encode("utf-8"))


def parse_client_frame(buf: bytes, max_payload: int = MAX_CLIENT_PAYLOAD) -> tuple[int, bytes, int] | None:
    """Return (opcode, payload, bytes_used) or None when `buf` holds a partial frame."""
    if len(buf) < 2:
        return None
    b0, b1 = buf[0], buf[1]
    if b0 & 0x70:
        raise WebSocketError("reserved bits set")
    if not b0 & 0x80:
        raise WebSocketError("fragmented frames are not supported")
    if not b1 & 0x80:
        raise WebSocketError("client frames must be masked")
    opcode, n, pos = b0 & 0x0F, b1 & 0x7F, 2
    if n == 126:
        if len(buf) < 4:
            return None
        (n,), pos = struct.unpack("!H", buf[2:4]), 4
    elif n == 127:
        if len(buf) < 10:
            return None
        (n,), pos = struct.unpack("!Q", buf[2:10]), 10
    if opcode & 0x8 and n > MAX_CONTROL_PAYLOAD:
        raise WebSocketError("control frame is too large")
    if n > max_payload:
        raise WebSocketError("frame too large", code=1009)
    if len(buf) < pos + 4 + n:
        return None
    return opcode, _unmask(buf[pos : pos + 4], buf[pos + 4 : pos + 4 + n]), pos + 4 + n


def _unmask(mask: bytes, data: bytes) -> bytes:
    """XOR with the repeating 4-byte mask as two big integers: one C-speed operation, not a Python loop."""
    n = len(data)
    if not n:
        return b""
    key = (mask * (n // 4 + 1))[:n]
    return (int.from_bytes(data, "big") ^ int.from_bytes(key, "big")).to_bytes(n, "big")


class Connection:
    """One upgraded socket. `send_text` may be called from one thread only."""

    def __init__(self, sock: socket.socket, max_payload: int = MAX_CLIENT_PAYLOAD) -> None:
        self.sock = sock
        self.max_payload = max_payload
        self._inbuf = b""
        self.closed = False
        self.frames = 0  # every frame the client sent, of any kind, for rate limiting

    def send_text(self, text: str) -> None:
        self.sock.sendall(encode_text(text))

    def send_close(self, code: int) -> None:
        """Tell the client why we are hanging up (best effort), then stop reading.

        After the close frame we stop sending and read what the client still has in flight before the socket
        is closed. Closing with unread data makes the operating system reset the connection, and the reset can
        throw away our close frame before the client reads it.
        """
        self.closed = True
        try:
            self.sock.sendall(encode_frame(OP_CLOSE, struct.pack("!H", code)))
            self.sock.shutdown(socket.SHUT_WR)
            self._drain()
        except OSError:
            pass

    def _drain(self, seconds: float = 0.5, limit: int = 1 << 18) -> None:
        end, got = time.monotonic() + seconds, 0
        while got < limit:
            left = end - time.monotonic()
            if left <= 0:
                return
            ready, _, _ = select.select([self.sock], [], [], left)
            if not ready:
                return
            chunk = self.sock.recv(65536)
            if not chunk:
                return
            got += len(chunk)

    def poll(self, timeout: float = 0.0) -> list[str]:
        """Handle whatever the client has sent and return its text messages.

        Waits up to `timeout` seconds for the first bytes, then takes only what is already there. Raises
        WebSocketError on a malformed frame. Returns after a bounded amount of reading, so a flooding client
        cannot keep the caller from checking its rate limit.
        """
        texts: list[str] = []
        wait = timeout
        for _ in range(16):
            if self.closed:
                break
            ready, _, _ = select.select([self.sock], [], [], wait)
            wait = 0.0
            if not ready:
                break
            chunk = self.sock.recv(4096)
            if not chunk:
                self.closed = True
                break
            self._inbuf += chunk
            if len(self._inbuf) > 4 * (self.max_payload + 14):
                raise WebSocketError("too much unread data", code=1009)
            while (frame := parse_client_frame(self._inbuf, self.max_payload)) is not None:
                opcode, data, used = frame
                self._inbuf = self._inbuf[used:]
                self.frames += 1
                if opcode not in (OP_TEXT, OP_CLOSE, OP_PING, OP_PONG):
                    # binary, stray continuation, reserved: this stream only ever carries text
                    raise WebSocketError("unsupported frame type", code=1003)
                if opcode == OP_CLOSE:
                    try:
                        self.sock.sendall(encode_frame(OP_CLOSE, data[:2]))
                    except OSError:
                        pass
                    self.closed = True
                    return texts
                if opcode == OP_PING:
                    self.sock.sendall(encode_frame(OP_PONG, data))
                elif opcode == OP_TEXT:
                    try:
                        texts.append(data.decode("utf-8"))
                    except UnicodeDecodeError:
                        raise WebSocketError("text frame is not valid UTF-8", code=1007) from None
        return texts
