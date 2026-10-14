"""The microphone code analyses sound in the page and nothing else.

Static check on webapp/src/mic.js and webapp/src/speech.js, like the one for the camera tracker: the
calls that would play, record, store or send the sound must not appear in the code. (Comments may
name them, which is why they are stripped first.)
"""

import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ["mic.js", "speech.js"]
FORBIDDEN = [
    "MediaRecorder", "createScriptProcessor", "ScriptProcessor", "AudioWorklet", "audioWorklet",
    "createMediaStreamDestination", "MediaStreamDestination", "destination",
    "fetch(", "XMLHttpRequest", "WebSocket", "sendBeacon", "postMessage", "BroadcastChannel",
    "localStorage", "sessionStorage", "indexedDB", "document.cookie", "RTCPeerConnection", "importScripts",
    "new Worker", "SharedWorker", "createBuffer", "decodeAudioData", ".captureStream", "eval(", "new Function",
]


def _code(name: str) -> str:
    text = (ROOT / "webapp/src" / name).read_text(encoding="utf-8")
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return "\n".join(re.sub(r"//.*$", "", line) for line in text.splitlines())


@pytest.mark.parametrize("name", SOURCES)
def test_microphone_sources_never_play_record_store_or_send_sound(name):
    code = _code(name)
    assert code.strip(), f"{name} is empty"
    for needle in FORBIDDEN:
        assert needle not in code, f"{name} uses {needle}"


def test_microphone_sources_have_no_imports_so_nothing_else_can_reach_the_sound():
    for name in SOURCES:
        assert not re.search(r"^\s*import\s", _code(name), re.M), f"{name} imports another module"


def test_the_analyser_is_the_only_thing_the_microphone_is_connected_to():
    code = _code("mic.js")
    assert code.count(".connect(") == 1 and ".connect(analyser)" in code
    assert "getUserMedia" in code and "video: false" in code


def test_the_microphone_is_released_when_the_page_goes_away():
    code = _code("mic.js")
    assert '"pagehide"' in code and "getTracks().forEach" in code and "clearInterval" in code
