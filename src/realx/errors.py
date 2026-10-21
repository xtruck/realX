"""Fixed error codes for the control room: what went wrong, in words a person can act on.

The engine used to publish one free-text `error` string. That string is still published (nothing that read it breaks), and
`stats()["error_info"]` now carries a stable `code`, a short `title`, a `hint` and whether trying again can help. The text of the
original message is kept as `detail`, clipped, so a developer can still see it. Matching is by plain substrings of messages that
realX itself raises (see `sources.py`); anything else falls into `engine_error` or `unknown`, never silently dropped.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass

MAX_DETAIL = 200


@dataclass(frozen=True)
class ErrorInfo:
    code: str
    title: str
    hint: str
    retryable: bool
    detail: str = ""

    def as_dict(self) -> dict:
        return asdict(self)


# (code, title, hint, retryable, substrings that select it); the first match wins
_RULES: tuple[tuple[str, str, str, bool, tuple[str, ...]], ...] = (
    ("camera_unavailable", "The camera cannot be opened",
     "Close other apps that use the camera and check Windows Settings > Privacy > Camera allows desktop apps.", True,
     ("cannot open camera",)),
    ("camera_stalled", "The camera stopped sending pictures",
     "Check the cable or the other app that may have taken the camera. realX keeps trying again by itself.", True,
     ("camera stopped delivering frames",)),
    ("video_unreadable", "That video file cannot be read",
     "Pick another file, or choose the demo footage.", False,
     ("cannot open video",)),
    ("source_ended", "The video source ended",
     "Choose a source again. realX keeps trying again by itself.", True,
     ("video source stopped",)),
    ("model_not_ready", "A model is not ready",
     "Fetch the models (realx models fetch) and check the disk has room, then try again.", True,
     ("model",)),
)


def classify(message: str | None) -> ErrorInfo | None:
    """Turn a raw engine message into an ErrorInfo; None when there is no error."""
    if not message:
        return None
    text = str(message)
    detail = text if len(text) <= MAX_DETAIL else text[: MAX_DETAIL - 1] + "…"
    low = text.lower()
    for code, title, hint, retryable, needles in _RULES:
        if any(n in low for n in needles):
            return ErrorInfo(code, title, hint, retryable, detail)
    # the engine formats unexpected exceptions as "TypeName: message"
    head = text.split(":", 1)[0]
    if ":" in text and head.isidentifier():
        return ErrorInfo("engine_error", "realX hit an unexpected problem",
                         "realX rebuilds the pipeline and tries again. If it keeps happening, copy the detail into a bug report.",
                         True, detail)
    return ErrorInfo("unknown", "Something went wrong", "Try again, or choose another source.", True, detail)


def stop_state(thread_alive: bool, stop_requested: bool) -> dict:
    """Where a requested stop stands. `pending` means the worker has not exited yet, so stopping can be retried."""
    if not thread_alive:
        state = "stopped"
    elif stop_requested:
        state = "pending"
    else:
        state = "running"
    return {"state": state, "retryable": state == "pending"}
