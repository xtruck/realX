"""Runtime hardware detection and the quality it recommends.

The detection is tested with injected probes (no real machine needed). The rules under test come from the
owner's brief: detect capabilities at runtime, give low-resource defaults and a higher preset for stronger
hardware, and never assume CUDA: "do not assume that an Intel integrated GPU supports CUDA".
"""

import json
import os

import pytest

from realx import hardware
from realx.hardware import Probes, detect, recommend

PROVIDERS_CPU = ["AzureExecutionProvider", "CPUExecutionProvider"]


def probes(cpu=None, memory=(7.8, 1.8), gpus=None, providers=None, nvidia=None):
    return Probes(
        cpu=lambda: cpu or {"name": "Intel(R) Core(TM) i5-8365U CPU @ 1.60GHz", "cores": 4, "threads": 8},
        memory=lambda: memory,
        gpus=lambda: gpus if gpus is not None else [{"name": "Intel(R) UHD Graphics 620", "driver": "31.0.101.2135", "vram_mb": 1024}],
        providers=lambda: providers if providers is not None else PROVIDERS_CPU,
        nvidia=lambda: nvidia,
    )


def test_the_owners_laptop_is_integrated_graphics_cpu_only_and_gets_balanced():
    p = detect(probes())
    assert p.gpus[0].vendor == "intel" and p.gpus[0].dedicated is False
    assert p.cuda_usable is False and p.onnx_providers == tuple(PROVIDERS_CPU)
    r = recommend(p)
    assert r.quality == "balanced"
    assert any("integrated" in x.lower() for x in r.reasons)
    assert not any("cuda" in x.lower() and "use" in x.lower() for x in r.reasons), "never claims CUDA here"


def test_an_nvidia_card_alone_does_not_mean_cuda_without_a_provider_that_uses_it():
    gpu = [{"name": "NVIDIA GeForce RTX 3060 Laptop GPU", "driver": "552.12", "vram_mb": 6144}]
    p = detect(probes(gpus=gpu, providers=PROVIDERS_CPU, nvidia=[{"name": "NVIDIA GeForce RTX 3060 Laptop GPU", "memory_mb": 6144}]))
    assert p.gpus[0].vendor == "nvidia" and p.gpus[0].dedicated is True
    assert p.cuda_usable is False
    r = recommend(p)
    assert r.quality == "high", "the browser GPU path still benefits from a dedicated card"
    assert any("cuda" in w.lower() for w in r.warnings), "it says why CUDA is not in use"


def test_cuda_is_usable_only_with_an_nvidia_card_and_a_cuda_or_tensorrt_provider():
    gpu = [{"name": "NVIDIA GeForce RTX 3060", "driver": "552.12", "vram_mb": 6144}]
    for provider in ("CUDAExecutionProvider", "TensorrtExecutionProvider"):
        assert detect(probes(gpus=gpu, providers=[provider, "CPUExecutionProvider"])).cuda_usable is True
    assert detect(probes(providers=["CUDAExecutionProvider", "CPUExecutionProvider"])).cuda_usable is False, "an Intel GPU never is"


def test_directml_is_reported_separately_from_cuda():
    p = detect(probes(providers=["DmlExecutionProvider", "CPUExecutionProvider"]))
    assert p.directml_available is True and p.cuda_usable is False


def test_little_ram_means_low():
    r = recommend(detect(probes(memory=(4.0, 1.5))))
    assert r.quality == "low" and any("ram" in x.lower() for x in r.reasons)


def test_no_graphics_adapter_means_low_and_a_clear_warning():
    r = recommend(detect(probes(gpus=[])))
    assert r.quality == "low"
    assert any("graphics" in w.lower() for w in r.warnings)


def test_low_free_memory_is_a_warning_not_a_silent_downgrade():
    r = recommend(detect(probes(memory=(7.8, 0.6))))
    assert r.quality == "balanced"
    assert any("free memory" in w.lower() or "close" in w.lower() for w in r.warnings)


def test_a_strong_machine_gets_the_higher_preset_and_a_weak_cpu_does_not():
    gpu = [{"name": "AMD Radeon RX 6600M", "driver": "1", "vram_mb": 8192}]
    strong = recommend(detect(probes(cpu={"name": "Ryzen 7", "cores": 8, "threads": 16}, memory=(16.0, 9.0), gpus=gpu)))
    assert strong.quality == "high"
    weak = recommend(detect(probes(cpu={"name": "Celeron", "cores": 2, "threads": 2}, gpus=gpu, memory=(8.0, 4.0))))
    assert weak.quality in ("low", "balanced") and weak.quality != "high"


def test_a_probe_that_fails_never_breaks_detection():
    def boom():
        raise OSError("no access")

    p = detect(Probes(cpu=boom, memory=boom, gpus=boom, providers=boom, nvidia=boom))
    assert p.cpu_name is None and p.ram_total_gb is None and p.gpus == ()
    assert len(p.notes) >= 3, "each failure is recorded, not hidden"
    r = recommend(p)
    assert r.quality in ("low", "balanced") and r.warnings


def test_gpu_vendor_and_dedicated_classification():
    c = hardware.classify_gpu
    assert c("Intel(R) UHD Graphics 620") == ("intel", False)
    assert c("Intel(R) Iris(R) Xe Graphics") == ("intel", False)
    assert c("Intel(R) Arc(TM) A380 Graphics") == ("intel", True)
    assert c("NVIDIA GeForce GTX 1650") == ("nvidia", True)
    assert c("AMD Radeon(TM) Graphics") == ("amd", False)
    assert c("AMD Radeon RX 6600M") == ("amd", True)
    assert c("Microsoft Basic Display Adapter") == ("other", False)


def test_powershell_json_is_parsed_whether_one_adapter_or_several():
    one = json.dumps({"Name": "Intel(R) UHD Graphics 620", "DriverVersion": "31.0", "AdapterRAM": 1073741824})
    many = json.dumps([{"Name": "A", "DriverVersion": None, "AdapterRAM": None}, {"Name": "B", "DriverVersion": "2", "AdapterRAM": 5}])
    assert [g["name"] for g in hardware.parse_video_controllers(one)] == ["Intel(R) UHD Graphics 620"]
    assert [g["name"] for g in hardware.parse_video_controllers(many)] == ["A", "B"]
    assert hardware.parse_video_controllers("") == [] and hardware.parse_video_controllers("not json") == []


def test_the_profile_serialises_to_plain_json():
    p = detect(probes())
    doc = json.loads(json.dumps(hardware.to_dict(p, recommend(p))))
    assert {"cpu", "ram", "gpus", "onnx_providers", "cuda_usable", "recommendation"} <= set(doc)
    assert doc["recommendation"]["quality"] in ("low", "balanced", "high")


def test_the_cli_prints_a_readable_summary_and_json(monkeypatch, capsys):
    from realx.cli import main

    monkeypatch.setattr(hardware, "default_probes", lambda: probes())
    assert main(["hardware"]) == 0
    out = capsys.readouterr().out
    assert "UHD Graphics 620" in out and "balanced" in out.lower()
    assert main(["hardware", "--json"]) == 0
    assert json.loads(capsys.readouterr().out)["recommendation"]["quality"] == "balanced"


def test_the_control_room_api_returns_the_profile_and_needs_the_token(monkeypatch):
    import http.client

    from realx.server import Engine, Server

    monkeypatch.setattr(hardware, "default_probes", lambda: probes())
    srv = Server(Engine(source="demo:static", mode="original"), port=0)
    srv.start()
    try:
        c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=20)
        c.request("GET", "/api/hardware", headers={"Host": f"127.0.0.1:{srv.port}"})  # conftest adds the token
        r = c.getresponse()
        doc = json.loads(r.read())
        assert r.status == 200 and doc["recommendation"]["quality"] == "balanced" and doc["gpus"][0]["vendor"] == "intel"
    finally:
        srv.stop()


@pytest.mark.raw_http
def test_the_hardware_api_refuses_a_request_without_the_token():
    import http.client

    from realx.server import Engine, Server

    srv = Server(Engine(source="demo:static", mode="original"), port=0)
    srv.start()
    try:
        c = http.client.HTTPConnection("127.0.0.1", srv.port, timeout=15)
        c.request("GET", "/api/hardware", headers={"Host": f"127.0.0.1:{srv.port}"})
        assert c.getresponse().status == 401
    finally:
        srv.stop()


def test_windows_cpu_probe_needs_no_powershell(monkeypatch):
    import sys

    if sys.platform != "win32":
        pytest.skip("Windows registry and kernel32 probe")

    def no_powershell(*a, **k):
        raise AssertionError("PowerShell must not be started when the registry and kernel32 answer")

    monkeypatch.setattr(hardware.subprocess, "run", no_powershell)
    cpu = hardware._cpu()
    assert cpu["name"] and len(cpu["name"]) > 3
    assert cpu["threads"] == os.cpu_count()
    assert 1 <= cpu["cores"] <= cpu["threads"]
