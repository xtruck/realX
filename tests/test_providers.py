"""Execution-provider ranking, `describe()`, and the inference-session cache.

The cache is tested with fake factories, so none of this needs onnxruntime. One smoke test at the end
loads a real model through onnxruntime on the CPU provider when both are present.
"""

import threading
import time

import pytest

from realx.runtime import providers as prov
from realx.runtime.providers import SessionCache, SessionError, describe, pick_providers

CPU = "CPUExecutionProvider"
CUDA = "CUDAExecutionProvider"
TRT = "TensorrtExecutionProvider"
DML = "DmlExecutionProvider"


class FakeSession:
    def __init__(self, path, provider):
        self.path, self.provider, self.closed = path, provider, False

    def close(self):
        self.closed = True


def make_factory(failing=(), calls=None, delay=0.0):
    """factory(path, provider): raises for providers in `failing`, records every call."""

    def factory(path, provider):
        if calls is not None:
            calls.append((str(path), provider))
        if delay:
            time.sleep(delay)
        if provider in failing:
            raise RuntimeError(f"{provider} could not start")
        return FakeSession(path, provider)

    return factory


# --- ranking and description ----------------------------------------------------------------
def test_pick_providers_is_unchanged_fastest_first_and_ends_with_cpu():
    assert pick_providers([CPU, CUDA, TRT]) == [TRT, CUDA, CPU]
    assert pick_providers([]) == [CPU]


def test_describe_separates_installed_from_missing_accelerators():
    d = describe([CPU, CUDA])
    assert d["installed"] == [CPU, CUDA]
    assert d["selected"] == [CUDA, CPU] and d["first_choice"] == CUDA
    assert TRT in d["missing_accelerators"] and DML in d["missing_accelerators"] and CPU not in d["missing_accelerators"]
    assert d["accelerated"] is True


def test_describe_on_a_cpu_only_machine_says_so():
    d = describe([CPU])
    assert d["accelerated"] is False and d["first_choice"] == CPU
    assert d["missing_accelerators"][0] == TRT  # still in preference order
    d = describe([])
    assert d["selected"] == [CPU] and d["installed"] == []


def test_describe_ignores_names_it_does_not_rank():
    d = describe([CPU, "SomethingNewExecutionProvider"])
    assert d["selected"] == [CPU]
    assert "SomethingNewExecutionProvider" in d["installed"]


# --- the session cache ------------------------------------------------------------------------
def test_a_session_is_created_once_and_reused():
    calls = []
    cache = SessionCache(make_factory(calls=calls))
    a = cache.get("m.onnx", [CPU])
    b = cache.get("m.onnx", [CPU])
    assert a is b and len(calls) == 1
    assert cache.get("other.onnx", [CPU]) is not a and len(calls) == 2


def test_the_key_is_the_model_and_the_provider_list():
    calls = []
    cache = SessionCache(make_factory(calls=calls))
    cpu_only = cache.get("m.onnx", [CPU])
    gpu_first = cache.get("m.onnx", [CUDA, CPU])
    assert cpu_only is not gpu_first
    assert cache.get("m.onnx", [CUDA, CPU]) is gpu_first
    assert cache.get("m.onnx", [CPU, CPU]) is cpu_only, "duplicates in the list do not make a new key"


def test_same_model_and_different_providers_give_different_sessions():
    calls = []
    cache = SessionCache(make_factory(calls=calls))
    cuda = cache.get("m.onnx", [CUDA])
    dml = cache.get("m.onnx", [DML])
    cpu = cache.get("m.onnx", [CPU])
    assert len({id(cuda), id(dml), id(cpu)}) == 3
    assert (cuda.provider, dml.provider, cpu.provider) == (CUDA, DML, CPU)
    assert len(cache) == 3 and len(calls) == 3
    assert cache.get("m.onnx", [DML]) is dml and len(calls) == 3, "and each is still reused"


def test_provider_order_is_part_of_the_key():
    cache = SessionCache(make_factory())
    assert cache.get("m.onnx", [CUDA, DML]) is not cache.get("m.onnx", [DML, CUDA])


def test_default_providers_and_the_same_explicit_list_share_one_session(monkeypatch):
    monkeypatch.setattr(prov, "installed", lambda: [CPU, CUDA])
    calls = []
    cache = SessionCache(make_factory(calls=calls))
    assert cache.get("m.onnx") is cache.get("m.onnx", [CUDA, CPU]) and len(calls) == 1


def test_concurrent_gets_with_different_providers_build_one_session_each():
    calls = []
    cache = SessionCache(make_factory(calls=calls, delay=0.05))
    out = []

    def worker(providers):
        out.append(cache.get("m.onnx", providers))

    threads = [threading.Thread(target=worker, args=(p,)) for p in ([CUDA], [CPU]) * 4]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert len({id(s) for s in out}) == 2 and sorted(c[1] for c in calls) == [CPU, CUDA]
    assert len(cache) == 2


def test_a_failed_provider_falls_back_without_poisoning_other_requests():
    calls = []
    cache = SessionCache(make_factory(failing={CUDA}, calls=calls))
    fallen = cache.get("m.onnx", [CUDA])  # CUDA fails, CPU serves this request
    assert fallen.provider == CPU
    assert cache.info("m.onnx", [CUDA]).failures.keys() == {CUDA}
    # a plain CPU request is a different key: it gets its own session, with no failure recorded
    cpu = cache.get("m.onnx", [CPU])
    assert cpu is not fallen and cache.info("m.onnx", [CPU]).failures == {}
    # a request for a working accelerator is not served the CPU fallback either
    dml = cache.get("m.onnx", [DML])
    assert dml.provider == DML
    assert len(cache) == 3


def test_providers_are_tried_in_order_and_the_first_that_starts_wins():
    calls = []
    cache = SessionCache(make_factory(failing={TRT}, calls=calls))
    s = cache.get("m.onnx", [TRT, CUDA, CPU])
    assert s.provider == CUDA
    assert [p for _, p in calls] == [TRT, CUDA]
    info = cache.info("m.onnx", [TRT, CUDA, CPU])
    assert info.provider == CUDA
    assert info.failures == {TRT: "RuntimeError: TensorrtExecutionProvider could not start"}


def test_cpu_is_always_the_last_resort_even_if_the_caller_forgot_it():
    calls = []
    cache = SessionCache(make_factory(failing={CUDA}, calls=calls))
    s = cache.get("m.onnx", [CUDA])
    assert s.provider == CPU and [p for _, p in calls] == [CUDA, CPU]


def test_when_everything_fails_the_error_names_every_cause_and_nothing_is_cached():
    calls = []
    cache = SessionCache(make_factory(failing={CUDA, CPU}, calls=calls))
    with pytest.raises(SessionError) as exc:
        cache.get("m.onnx", [CUDA, CPU])
    assert CUDA in str(exc.value) and CPU in str(exc.value) and "m.onnx" in str(exc.value)
    with pytest.raises(SessionError):
        cache.get("m.onnx", [CUDA, CPU])
    assert len(calls) == 4, "a failure is not cached, so a later attempt tries again"


def test_default_providers_follow_the_installed_ranking(monkeypatch):
    monkeypatch.setattr(prov, "installed", lambda: [CPU, CUDA])
    calls = []
    cache = SessionCache(make_factory(calls=calls))
    assert cache.get("m.onnx").provider == CUDA
    assert [p for _, p in calls] == [CUDA]


def test_concurrent_gets_of_one_model_create_a_single_session():
    calls = []
    cache = SessionCache(make_factory(calls=calls, delay=0.05))
    got, barrier = [], threading.Barrier(8)

    def worker():
        barrier.wait()
        got.append(cache.get("m.onnx", [CPU]))

    threads = [threading.Thread(target=worker) for _ in range(8)]
    [t.start() for t in threads]
    [t.join(10) for t in threads]
    assert len(got) == 8 and all(s is got[0] for s in got)
    assert len(calls) == 1


def test_a_slow_model_does_not_block_another():
    started = threading.Event()
    release = threading.Event()

    def factory(path, provider):
        if path == "slow.onnx":
            started.set()
            release.wait(10)
        return FakeSession(path, provider)

    cache = SessionCache(factory)
    slow = threading.Thread(target=lambda: cache.get("slow.onnx", [CPU]))
    slow.start()
    assert started.wait(5)
    t0 = time.perf_counter()
    assert cache.get("fast.onnx", [CPU]).path == "fast.onnx"
    assert time.perf_counter() - t0 < 2, "a different model must not wait for the slow one"
    release.set()
    slow.join(10)


def test_close_closes_every_session_once_and_the_cache_refuses_new_work():
    cache = SessionCache(make_factory())
    a, b = cache.get("a.onnx", [CPU]), cache.get("b.onnx", [CPU])
    cache.close()
    assert a.closed and b.closed
    cache.close()  # idempotent
    with pytest.raises(RuntimeError, match="closed"):
        cache.get("a.onnx", [CPU])


def test_close_survives_a_session_that_cannot_close():
    class Stubborn(FakeSession):
        def close(self):
            raise OSError("busy")

    good = []

    def factory(path, provider):
        s = Stubborn(path, provider) if path == "bad.onnx" else FakeSession(path, provider)
        if path == "ok.onnx":
            good.append(s)
        return s

    cache = SessionCache(factory)
    cache.get("bad.onnx", [CPU])
    cache.get("ok.onnx", [CPU])
    cache.close()
    assert good[0].closed, "one stubborn session must not stop the others from closing"


def test_sessions_without_a_close_method_are_fine():
    cache = SessionCache(lambda path, provider: object())
    cache.get("m.onnx", [CPU])
    cache.close()


def test_context_manager_closes():
    with SessionCache(make_factory()) as cache:
        s = cache.get("m.onnx", [CPU])
    assert s.closed


def test_len_and_describe_sessions_report_what_is_loaded():
    cache = SessionCache(make_factory(failing={CUDA}))
    cache.get("m.onnx", [CUDA, CPU])
    assert len(cache) == 1
    (entry,) = cache.loaded()
    assert entry["model"] == "m.onnx" and entry["provider"] == CPU and CUDA in entry["failures"]


# --- one real session, when the pieces are installed ------------------------------------------
def test_a_real_model_loads_through_onnxruntime_on_the_cpu_provider():
    pytest.importorskip("onnxruntime")
    from realx.models import ModelError, ensure_model

    try:
        path = ensure_model("pphumanseg", download=False)
    except ModelError as exc:
        pytest.skip(f"model not downloaded: {exc}")
    with SessionCache(prov.onnxruntime_session_factory) as cache:
        session = cache.get(path, [CPU])
        assert session.get_inputs(), "a real inference session with inputs"
        assert cache.info(path, [CPU]).provider == CPU
