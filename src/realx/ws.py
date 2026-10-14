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

GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
MAX_CLIENT_PAYLOAD = 1024

OP_TEXT, OP_CLOSE, OP_PING, OP_PONG = 0x1, 0x8, 0x9, 0xA


class WebSocketError(ValueError):
    pass


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


def parse_client_frame(buf: bytes) -> tuple[int, bytes, int] | None:
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
    if n > MAX_CLIENT_PAYLOAD:
        raise WebSocketError("frame too large")
    if len(buf) < pos + 4 + n:
        return None
    mask = buf[pos : pos + 4]
    data = bytes(b ^ mask[i % 4] for i, b in enumerate(buf[pos + 4 : pos + 4 + n]))
    return opcode, data, pos + 4 + n


class Connection:
    """One upgraded socket. `send_text` may be called from one thread only."""

    def __init__(self, sock: socket.socket) -> None:
        self.sock = sock
        self._inbuf = b""
        self.closed = False

    def send_text(self, text: str) -> None:
        self.sock.sendall(encode_text(text))

    def poll(self) -> None:
        """Handle whatever the client has sent, without blocking. Raises on close."""
        while not self.closed:
            ready, _, _ = select.select([self.sock], [], [], 0)
            if not ready:
                return
            chunk = self.sock.recv(4096)
            if not chunk:
                self.closed = True
                return
            self._inbuf += chunk
            if len(self._inbuf) > 4 * (MAX_CLIENT_PAYLOAD + 14):
                raise WebSocketError("too much unread data")
            while (frame := parse_client_frame(self._inbuf)) is not None:
                opcode, data, used = frame
                self._inbuf = self._inbuf[used:]
                if opcode == OP_CLOSE:
                    try:
                        self.sock.sendall(encode_frame(OP_CLOSE, data[:2]))
                    except OSError:
                        pass
                    self.closed = True
                    return
                if opcode == OP_PING:
                    self.sock.sendall(encode_frame(OP_PONG, data))
