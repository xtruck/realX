"""G1 (off by default, explicit enable) and G2 (https only, DNS name on an allow-list, verified TLS, no proxy)."""

from __future__ import annotations

import dataclasses
import pathlib

import pytest

import realx.gpulink.config as config_module
from realx.gpulink import GpuLinkClient, GpuLinkConfig, GpuLinkConfigError

import gpulink_helpers as h

pytestmark = pytest.mark.raw_http

GOOD = "https://gpu.example.com"


def good(**kw):
    return GpuLinkConfig(enabled=True, url=GOOD, allowed_hosts=("gpu.example.com",), **kw)


# --- G1 -----------------------------------------------------------------------------------------------------------


def test_g1_default_config_is_off():
    cfg = GpuLinkConfig()
    assert cfg.enabled is False


def test_g1_off_client_never_opens_a_socket():
    server = h.RawServer()
    try:
        cfg = GpuLinkConfig.unsafe_loopback_http_for_tests(url=server.url, enabled=False)
        client = GpuLinkClient(cfg, consent_check=lambda _id: True)
        assert client.send(h.make_frame(), h.CONSENT_ID) is None
        assert server.connections == 0
        assert client.status()["frames_leaving_machine"] is False
    finally:
        server.close()


def test_g1_enabling_without_a_url_is_an_error():
    with pytest.raises(GpuLinkConfigError):
        GpuLinkConfig(enabled=True)


def test_g1_status_says_when_frames_may_leave():
    client = GpuLinkClient(good(), consent_check=lambda _id: True)
    status = client.status()
    assert status["frames_leaving_machine"] is True and status["host"] == "gpu.example.com"
    client.stop()
    assert client.status()["frames_leaving_machine"] is False


# --- G2 -----------------------------------------------------------------------------------------------------------


def test_g2_a_good_config_is_accepted():
    assert good().host == "gpu.example.com"
    assert GpuLinkConfig(enabled=True, url="https://GPU.Example.com:8443/", allowed_hosts=("gpu.example.com",)).port == 8443


@pytest.mark.parametrize(
    "url",
    [
        "http://gpu.example.com",  # not https
        "ftp://gpu.example.com",
        "https://127.0.0.1",  # IP literals
        "https://10.0.0.5",
        "https://[::1]",
        "https://[2001:db8::1]",
        "https://2130706433",  # integer form of 127.0.0.1
        "https://0x7f.0.0.1",
        "https://localhost",
        "https://user:pw@gpu.example.com",  # credentials in the URL
        "https://other.example.com",  # not on the allow-list
        "https://gpu.example.com./",  # trailing dot
        "https://gpu.example.com/?x=1",  # query
        "https://gpu.example.com/#frag",
        "https:///nohost",
        "https://gpu_example.com",  # not a DNS name
        "//gpu.example.com",
    ],
)
def test_g2_bad_urls_are_refused(url):
    with pytest.raises(GpuLinkConfigError):
        GpuLinkConfig(enabled=True, url=url, allowed_hosts=("gpu.example.com", "localhost"))


def test_g2_empty_allow_list_is_refused():
    with pytest.raises(GpuLinkConfigError):
        GpuLinkConfig(enabled=True, url=GOOD, allowed_hosts=())


@pytest.mark.parametrize("entry", ["127.0.0.1", "10.0.0.1", "::1", "*", "*.example.com", "https://gpu.example.com"])
def test_g2_allow_list_may_only_hold_dns_names(entry):
    with pytest.raises(GpuLinkConfigError):
        GpuLinkConfig(enabled=True, url=GOOD, allowed_hosts=("gpu.example.com", entry))


def test_g2_http_loopback_is_not_reachable_from_the_normal_constructor(monkeypatch):
    for name in ("REALX_GPULINK_ALLOW_HTTP", "REALX_GPULINK_INSECURE", "REALX_GPULINK_LOOPBACK", "REALX_TEST"):
        monkeypatch.setenv(name, "1")
    with pytest.raises(GpuLinkConfigError):
        GpuLinkConfig(enabled=True, url="http://127.0.0.1:9", allowed_hosts=("127.0.0.1",))


def test_g2_config_module_reads_no_environment_variable():
    source = pathlib.Path(config_module.__file__).read_text(encoding="utf-8")
    assert "environ" not in source and "getenv" not in source


def test_g2_test_escape_allows_only_http_127_0_0_1():
    cfg = GpuLinkConfig.unsafe_loopback_http_for_tests(url="http://127.0.0.1:8123", enabled=True)
    assert cfg.host == "127.0.0.1" and cfg.port == 8123
    for bad in ("http://localhost:1", "http://127.0.0.2:1", "http://10.0.0.1:1", "http://gpu.example.com", "https://127.0.0.1:1"):
        with pytest.raises(GpuLinkConfigError):
            GpuLinkConfig.unsafe_loopback_http_for_tests(url=bad, enabled=True)


def test_g2_the_escape_does_not_survive_copying_the_config():
    cfg = GpuLinkConfig.unsafe_loopback_http_for_tests(url="http://127.0.0.1:8123", enabled=True)
    with pytest.raises(GpuLinkConfigError):
        dataclasses.replace(cfg, url="http://127.0.0.1:9999")


def test_g2_tls_verification_is_on():
    import ssl

    ctx = GpuLinkClient(good(), consent_check=lambda _id: True)._ssl_context()
    assert ctx.verify_mode == ssl.CERT_REQUIRED and ctx.check_hostname is True
    assert ctx.minimum_version >= ssl.TLSVersion.TLSv1_2


def test_g2_proxy_environment_is_ignored(monkeypatch):
    proxy, target = h.RawServer(), h.RawServer()
    try:
        for name in ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"):
            monkeypatch.setenv(name, f"http://127.0.0.1:{proxy.port}")
        monkeypatch.setenv("REALX_GPULINK_TOKEN", h.TOKEN)
        cfg = GpuLinkConfig.unsafe_loopback_http_for_tests(url=target.url, enabled=True)
        assert GpuLinkClient(cfg, consent_check=lambda _id: True).send(h.make_frame(), h.CONSENT_ID) is not None
        assert proxy.connections == 0 and target.connections == 1
    finally:
        proxy.close()
        target.close()


@pytest.mark.parametrize(
    "kw",
    [{"budget_s": 1.5}, {"budget_s": 0}, {"max_fps": 0}, {"max_jpeg_bytes": 0}, {"max_dim": 0}, {"token_env": "bad name"}],
)
def test_limits_are_validated(kw):
    with pytest.raises(GpuLinkConfigError):
        good(**kw)


def test_g7_budget_may_not_exceed_one_second():
    assert good(budget_s=1.0).budget_s == 1.0
