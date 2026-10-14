"""`realx bench` and scripts/bench_tracking.py: result assembly, schema and failure handling.

Everything except `test_real_pipeline_smoke` uses fake stages, fake scenes and an injected clock, so
none of it depends on a model, a camera, a GPU or a browser, and none of it measures anything.
"""

import copy
import json
import sys
import threading
from pathlib import Path

import numpy as np
import pytest

from realx import bench
from realx.models import ModelError
from realx.types import Face, FrameContext

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))


# --- fakes -----------------------------------------------------------------------------------------
QUIET = {"cpu_load_percent_before": 3.0, "warning": None}


class FakeClock:
    """Time that only moves when something advances it (sleep or a stage 'working')."""

    def __init__(self):
        self.t = 100.0
        self._lock = threading.Lock()

    def __call__(self):
        with self._lock:
            return self.t

    def advance(self, seconds):
        with self._lock:
            self.t += seconds

    def sleep(self, seconds):
        self.advance(max(0.0, seconds))


class FakeStage:
    def __init__(self, name, cost_s, clock, finds_face=True):
        self.name, self.cost_s, self.clock, self.finds_face = name, cost_s, clock, finds_face
        self.setups = self.closes = 0

    def setup(self):
        self.setups += 1

    def process(self, ctx):
        self.clock.advance(self.cost_s)
        if self.finds_face:
            ctx.faces = [Face(bbox=np.array([1.0, 1.0, 5.0, 5.0]), track_id=1)]
        return ctx

    def close(self):
        self.closes += 1


class FakeScene:
    def __init__(self, motion, size, fps, seed):
        self.w, self.h = size

    def render(self, i):
        return FrameContext(pixels=np.zeros((self.h, self.w, 3), np.uint8), index=i, timestamp=i / 30.0)


def fake_run(clock=None, frames=24, resolutions=((32, 24), (64, 48)), **kw):
    clock = clock or FakeClock()
    created = []

    def stage_factory(with_background):
        stages = [FakeStage("detect", 0.004, clock), FakeStage("track", 0.001, clock)]
        if with_background:
            stages.append(FakeStage("bg_replace", 0.002, clock))
        created.append(stages)
        return stages

    doc = bench.run_benchmark(
        frames=frames,
        resolutions=resolutions,
        scene_factory=FakeScene,
        stage_factory=stage_factory,
        clock=clock,
        sleep=clock.sleep,
        hardware={"platform": "test", "providers": {"installed": []}},
        conditions=kw.pop("conditions", QUIET),
        stream_seconds=kw.pop("stream_seconds", 1.0),
        **kw,
    )
    return doc, created


# --- resolutions --------------------------------------------------------------------------------------
def test_resolutions_parse_and_reject_nonsense():
    assert bench.parse_resolutions("320x240, 640x480,1280X720") == [(320, 240), (640, 480), (1280, 720)]
    for bad in ["", "640", "640x", "0x480", "-1x5", "axb", "99999x480", "320x240,320x240", "1x1,2x2,3x3,4x4,5x5,6x6,7x7,8x8,9x9"]:
        with pytest.raises(ValueError):
            bench.parse_resolutions(bad)


def test_percentile_is_the_usual_interpolated_one():
    assert bench.percentile([1, 2, 3, 4, 5], 50) == 3
    assert bench.percentile([10], 95) == 10
    assert bench.percentile([0, 10], 50) == 5
    assert bench.percentile([1, 2, 3, 4], 95) == pytest.approx(3.85)
    with pytest.raises(ValueError):
        bench.percentile([], 50)


# --- result assembly ----------------------------------------------------------------------------------
def test_a_run_produces_a_valid_complete_document():
    doc, _ = fake_run()
    bench.validate_result(doc)
    assert doc["schema"] == "realx-bench/1"
    assert [(r["width"], r["height"]) for r in doc["results"]] == [(32, 24), (64, 48)]
    assert doc["config"]["frames"] == 24 and doc["config"]["stages"] == ["detect", "track"]
    json.loads(json.dumps(doc))  # plain JSON all the way down


def test_stage_statistics_come_from_the_injected_clock():
    doc, _ = fake_run()
    r = doc["results"][0]
    by = {s["name"]: s for s in r["stages"]}
    assert by["detect"]["mean_ms"] == pytest.approx(4.0, abs=0.01)
    assert by["track"]["p50_ms"] == pytest.approx(1.0, abs=0.01)
    assert by["detect"]["p50_ms"] <= by["detect"]["p95_ms"]
    assert r["frame_ms"]["mean"] == pytest.approx(5.0, abs=0.02)
    assert r["sequential_fps"] == pytest.approx(200.0, rel=0.01)  # 1000 / 5 ms
    assert r["faces_found"] == 1.0


def test_warmup_frames_are_not_counted():
    doc, _ = fake_run(frames=30)
    r = doc["results"][0]
    assert r["warmup_frames"] >= 1
    assert r["frames"] == 30 - r["warmup_frames"]


def test_the_stream_pass_accounts_for_every_frame_it_offered():
    doc, _ = fake_run(frames=40, fps=30.0)
    s = doc["results"][0]["stream"]
    assert s["offered"] == 40
    assert s["delivered"] + s["dropped"] == s["offered"]
    assert s["delivered"] >= 1 and s["wall_s"] > 0 and s["target_fps"] == 30.0


def test_a_short_scene_is_replayed_so_the_stream_pass_can_run_long_enough():
    doc, _ = fake_run(frames=30, fps=30.0, stream_seconds=4.0)
    r = doc["results"][0]
    assert r["frames"] + r["warmup_frames"] == 30, "only 30 frames are rendered"
    s = r["stream"]
    assert s["offered"] == 120, "but 4 seconds at 30 fps are offered"
    assert s["delivered"] + s["dropped"] == 120
    assert doc["config"]["stream_seconds"] == 4.0
    for key in ("mean", "p50", "p95"):
        assert s["process_ms"][key] >= 0


def test_stream_seconds_must_be_positive():
    with pytest.raises(ValueError, match="stream_seconds"):
        bench.run_benchmark(frames=20, resolutions=[(32, 24)], scene_factory=FakeScene, stage_factory=lambda b: [], stream_seconds=0)


def test_the_two_kinds_of_drop_add_up_to_the_total():
    doc, _ = fake_run(frames=40, fps=30.0)
    s = doc["results"][0]["stream"]
    assert s["dropped_camera_buffer"] + s["dropped_by_run_stream"] == s["dropped"]
    assert s["camera_buffer_frames"] == bench.CAMERA_BUFFER


def test_a_pipeline_slower_than_the_camera_loses_frames_and_every_one_is_accounted_for():
    """Real time on purpose: a 20 ms stage can finish at most 50 frames a second, and 100 are offered.

    run_stream used to block the source when it was full, so the loss showed up at the simulated camera buffer.
    It now drops the oldest frame that has not started, so the loss is counted as dropped_by_run_stream.
    """
    import time as real_time

    class Slow:
        name = "slow"

        def setup(self):
            pass

        def process(self, ctx):
            real_time.sleep(0.02)
            return ctx

        def close(self):
            pass

    doc = bench.run_benchmark(
        frames=40, resolutions=[(32, 24)], fps=100.0, scene_factory=FakeScene, stage_factory=lambda b: [Slow()],
        hardware={"platform": "test", "providers": {"installed": []}}, conditions=QUIET, stream_seconds=0.4,
    )
    s = doc["results"][0]["stream"]
    assert s["dropped"] > 0, "frames offered faster than the stage can take them must be lost, not queued"
    assert s["dropped_by_run_stream"] > 0, "the runner drops stale frames itself instead of blocking the camera"
    assert s["dropped_camera_buffer"] + s["dropped_by_run_stream"] == s["dropped"]
    assert s["delivered"] + s["dropped"] == 40
    assert s["delivered_fps"] < 60, "the delivered rate cannot exceed what a 20 ms stage allows"
    bench.validate_result(doc)


def test_every_pass_gets_fresh_stages_and_all_are_set_up_and_closed():
    _, created = fake_run()
    assert len(created) >= 4, "two resolutions x (timing pass + stream pass), each with its own stages"
    for stages in created:
        assert all(s.setups == 1 and s.closes == 1 for s in stages)


def test_background_replacement_is_an_option_recorded_in_the_config():
    doc, _ = fake_run(with_background=True)
    assert doc["config"]["with_background"] is True and "bg_replace" in doc["config"]["stages"]
    assert "bg_replace" in [s["name"] for s in doc["results"][0]["stages"]]


def test_a_face_that_is_never_found_is_reported_not_hidden():
    clock = FakeClock()

    def stage_factory(with_background):
        return [FakeStage("detect", 0.004, clock, finds_face=False)]

    doc = bench.run_benchmark(
        frames=20, resolutions=[(32, 24)], scene_factory=FakeScene, stage_factory=stage_factory, clock=clock,
        sleep=clock.sleep, hardware={"platform": "test", "providers": {"installed": []}}, conditions=QUIET,
    )
    assert doc["results"][0]["faces_found"] == 0.0
    bench.validate_result(doc)


def test_too_many_frames_for_the_memory_is_refused_up_front():
    with pytest.raises(ValueError, match="memory"):
        bench.run_benchmark(frames=100000, resolutions=[(3840, 2160)], scene_factory=FakeScene, stage_factory=lambda b: [])


def test_too_few_frames_is_refused():
    with pytest.raises(ValueError, match="frames"):
        bench.run_benchmark(frames=3, resolutions=[(32, 24)], scene_factory=FakeScene, stage_factory=lambda b: [])


# --- schema validation ----------------------------------------------------------------------------------
def test_validate_result_rejects_damaged_documents():
    doc, _ = fake_run()
    bench.validate_result(doc)
    cases = []

    def mutated(fn):
        d = copy.deepcopy(doc)
        fn(d)
        cases.append(d)

    mutated(lambda d: d.pop("hardware"))
    mutated(lambda d: d.pop("conditions"))
    mutated(lambda d: d["conditions"].pop("warning"))
    mutated(lambda d: d["conditions"].update(cpu_load_percent_before=250))
    mutated(lambda d: d.update(schema="other/1"))
    mutated(lambda d: d["results"].clear())
    mutated(lambda d: d["results"][0].pop("stream"))
    mutated(lambda d: d["results"][0]["stages"][0].update(mean_ms=float("nan")))
    mutated(lambda d: d["results"][0]["stages"][0].update(p50_ms=99.0, p95_ms=1.0))
    mutated(lambda d: d["results"][0]["stream"].update(dropped=-1))
    mutated(lambda d: d["results"][0]["stream"].update(delivered=999))
    mutated(lambda d: d["results"][0]["stream"].update(dropped_camera_buffer=5, dropped_by_run_stream=5))
    mutated(lambda d: d["results"][0]["stream"].pop("camera_buffer_frames"))
    mutated(lambda d: d["results"][0]["stream"].pop("process_ms"))
    mutated(lambda d: d["results"][0].update(faces_found=1.5))
    mutated(lambda d: d["results"][0].update(width="wide"))
    for broken in cases:
        with pytest.raises(ValueError):
            bench.validate_result(broken)
    with pytest.raises(ValueError):
        bench.validate_result("not a document")


# --- how busy the machine was ------------------------------------------------------------------------------
def test_cpu_load_comes_from_the_change_in_idle_time(monkeypatch):
    readings = iter([(1000, 2000), (1750, 3000)])  # 750 of 1000 ticks idle -> 25% busy
    monkeypatch.setattr(bench, "_cpu_times", lambda: next(readings))
    assert bench.cpu_load_percent(interval=0.0, sleep=lambda s: None) == 25.0


def test_cpu_load_is_none_when_the_platform_cannot_say(monkeypatch):
    monkeypatch.setattr(bench, "_cpu_times", lambda: None)
    assert bench.cpu_load_percent(interval=0.0, sleep=lambda s: None) is None
    readings = iter([(10, 100), (10, 100)])  # no time passed: no answer rather than a divide by zero
    monkeypatch.setattr(bench, "_cpu_times", lambda: next(readings))
    assert bench.cpu_load_percent(interval=0.0, sleep=lambda s: None) is None


def test_a_busy_machine_gets_a_warning_next_to_the_numbers(monkeypatch):
    monkeypatch.setattr(bench, "cpu_load_percent", lambda *a, **k: 97.0)
    c = bench.measure_conditions()
    assert c["cpu_load_percent_before"] == 97.0 and "not representative" in c["warning"] and "97%" in c["warning"]
    monkeypatch.setattr(bench, "cpu_load_percent", lambda *a, **k: 4.0)
    assert bench.measure_conditions() == {"cpu_load_percent_before": 4.0, "warning": None}
    monkeypatch.setattr(bench, "cpu_load_percent", lambda *a, **k: None)
    assert "could not measure" in bench.measure_conditions()["warning"]


def test_the_warning_is_part_of_the_document_and_the_printed_summary():
    busy = {"cpu_load_percent_before": 91.0, "warning": "the CPU was already 91% busy; not representative"}
    doc, _ = fake_run(conditions=busy)
    bench.validate_result(doc)
    assert doc["conditions"] == busy
    assert "WARNING" in bench.format_summary(doc) and "91%" in bench.format_summary(doc)
    quiet_doc, _ = fake_run()
    assert "WARNING" not in bench.format_summary(quiet_doc)


def test_conditions_are_measured_before_any_work_when_not_supplied(monkeypatch):
    order = []
    monkeypatch.setattr(bench, "measure_conditions", lambda: order.append("measured") or QUIET)
    clock = FakeClock()

    class Marker(FakeStage):
        def process(self, ctx):
            order.append("work")
            return super().process(ctx)

    bench.run_benchmark(
        frames=12, resolutions=[(32, 24)], scene_factory=FakeScene, stage_factory=lambda b: [Marker("detect", 0.001, clock)],
        clock=clock, sleep=clock.sleep, hardware={"platform": "test", "providers": {"installed": []}},
    )
    assert order[0] == "measured" and "work" in order


# --- hardware block ---------------------------------------------------------------------------------------
def test_hardware_block_has_what_a_reader_needs_to_compare_machines():
    hw = bench.hardware_info()
    for key in ("platform", "machine", "python", "cpu_count", "cpu_name", "numpy", "opencv", "onnxruntime", "providers"):
        assert key in hw, key
    assert hw["cpu_count"] and hw["providers"]["selected"][-1] == "CPUExecutionProvider"
    json.dumps(hw)


# --- the command line --------------------------------------------------------------------------------------
def _args(**kw):
    import argparse

    base = dict(frames=20, resolutions="32x24", fps=30.0, background=False, json=None, seed=0, stream_seconds=1.0)
    base.update(kw)
    return argparse.Namespace(**base)


def test_missing_model_is_a_clear_nonzero_exit_not_a_traceback(monkeypatch, capsys):
    def boom(name, download=True):
        raise ModelError(f"{name} missing; run `realx models fetch`")

    monkeypatch.setattr(bench, "ensure_model", boom)
    assert bench.run_cli(_args()) == 2
    err = capsys.readouterr().err
    assert "realx models fetch" in err and "Traceback" not in err


def test_bad_arguments_are_a_clear_nonzero_exit(capsys):
    assert bench.run_cli(_args(resolutions="nonsense")) == 2
    assert bench.run_cli(_args(frames=2)) == 2
    assert "bench:" in capsys.readouterr().err


def test_cli_writes_json_and_prints_a_summary(monkeypatch, tmp_path, capsys):
    clock = FakeClock()
    monkeypatch.setattr(bench, "ensure_model", lambda name, download=True: tmp_path)
    monkeypatch.setattr(bench, "default_stage_factory", lambda with_background: [FakeStage("detect", 0.004, clock)])
    monkeypatch.setattr(bench, "default_scene_factory", FakeScene)
    monkeypatch.setattr(bench.time, "perf_counter", clock)
    monkeypatch.setattr(bench.time, "sleep", clock.sleep)
    out = tmp_path / "result.json"
    assert bench.run_cli(_args(json=str(out))) == 0
    bench.validate_result(json.loads(out.read_text()))
    text = capsys.readouterr().out
    assert "32x24" in text and "detect" in text and "fps" in text


def test_the_bench_subcommand_is_registered():
    from realx.cli import main

    with pytest.raises(SystemExit) as exc:
        main(["bench", "--help"])
    assert exc.value.code == 0


# --- one real run, when the pieces are present -------------------------------------------------------------
def test_real_pipeline_smoke():
    pytest.importorskip("cv2")
    pytest.importorskip("skimage")
    from realx.models import ensure_model

    try:
        ensure_model("yunet", download=False)
    except ModelError as exc:
        pytest.skip(f"yunet not downloaded: {exc}")
    doc = bench.run_benchmark(frames=14, resolutions=[(320, 240)], fps=30.0, stream_seconds=1.0)
    bench.validate_result(doc)
    names = [s["name"] for s in doc["results"][0]["stages"]]
    assert names == ["detect", "track", "one_euro", "rig"]  # each stage's own name (the detector registers as detect_yunet)
    assert doc["results"][0]["faces_found"] > 0.5, "the synthetic face is found, so the numbers describe real work"
    assert doc["results"][0]["stream"]["offered"] == 30, "1 second at 30 fps is offered, replaying the 14 rendered frames"


# ============================================================================================
# scripts/bench_tracking.py: report assembly only; no browser is started
# ============================================================================================
@pytest.fixture()
def bt():
    import bench_tracking

    return bench_tracking


def sample(t, frames, fps=20.0, pose_ms=30.0):
    return {
        "t": t, "tracker_fps": fps, "tracker_frames": int(t * fps), "frames": frames,
        "ms": {"pose": pose_ms, "face": 28.0, "hands": 31.0}, "hz": {"pose": 10, "face": 9, "hands": 8},
        "hint": "no hand seen", "delegates": {"pose": "GPU", "face": "GPU", "hands": "GPU"},
    }


def test_collect_samples_for_the_requested_time_on_an_injected_clock(bt):
    clock = FakeClock()
    count = {"n": 0}

    def sampler():
        count["n"] += 1
        return sample(0, count["n"] * 50)

    samples = bt.collect(sampler, seconds=5, interval=1.0, clock=clock, sleep=clock.sleep)
    assert 5 <= len(samples) <= 6
    assert samples[0]["t"] == 0 and samples[-1]["t"] >= 4


def test_summary_uses_medians_and_the_render_rate_over_the_whole_window(bt):
    samples = [sample(0, 0), sample(1, 55, fps=18), sample(2, 110, fps=22), sample(3, 165, fps=20, pose_ms=300.0)]
    s = bt.summarize(samples)
    assert s["tracker_fps_median"] == 20.0
    assert s["ms_per_model_median"]["pose"] == 30.0, "the median of 30, 30, 30, 300"
    assert s["render_fps"] == pytest.approx(55.0)
    assert s["delegates"] == {"pose": "GPU", "face": "GPU", "hands": "GPU"}
    assert s["last_hand_hint"] == "no hand seen" and s["sample_count"] == 4


def test_median_ignores_one_spike(bt):
    samples = [sample(i, i * 50, pose_ms=30.0) for i in range(4)] + [sample(4, 200, pose_ms=900.0)]
    assert bt.summarize(samples)["ms_per_model_median"]["pose"] == 30.0


def test_summary_of_nothing_is_an_explicit_empty_result_not_a_crash(bt):
    s = bt.summarize([])
    assert s["sample_count"] == 0 and s["tracker_fps_median"] is None and s["render_fps"] is None


def test_contention_warning_appears_when_other_browser_processes_exist(bt):
    assert bt.detect_contention(lambda: 0) == {"browser_processes_before": 0, "warning": None}
    busy = bt.detect_contention(lambda: 7)
    assert busy["browser_processes_before"] == 7 and "7" in busy["warning"] and "not representative" in busy["warning"]
    unknown = bt.detect_contention(lambda: -1)
    assert "could not" in unknown["warning"]
    broken = bt.detect_contention(lambda: (_ for _ in ()).throw(OSError("no tasklist")))
    assert "could not" in broken["warning"]


def test_report_is_valid_json_with_the_contention_next_to_the_numbers(bt):
    samples = [sample(i, i * 50) for i in range(4)]
    contention = {"browser_processes_before": 7, "warning": "7 browser processes were already running; not representative"}
    doc = bt.build_report(
        config={"resolution": [640, 480], "delegate": "auto", "headed": True, "seconds": 3},
        hardware={"platform": "test"}, contention=contention, samples=samples,
    )
    bt.validate_report(doc)
    assert doc["schema"] == "realx-bench-tracking/1"
    assert doc["contention"]["warning"] and doc["summary"]["sample_count"] == 4
    json.loads(json.dumps(doc))
    damaged = copy.deepcopy(doc)
    damaged.pop("contention")
    with pytest.raises(ValueError):
        bt.validate_report(damaged)


def test_resolution_for_the_fake_camera_must_be_even_and_sane(bt):
    assert bt.parse_resolution("640x480") == (640, 480)
    for bad in ["641x480", "640x481", "0x0", "x", "10000x10000", "640"]:
        with pytest.raises(ValueError):
            bt.parse_resolution(bad)


def test_the_clip_for_the_fake_camera_has_the_right_size_and_frame_count(bt, tmp_path):
    pytest.importorskip("cv2")
    pytest.importorskip("skimage")
    clip = tmp_path / "c.y4m"
    bt.write_clip(clip, (64, 48), frames=3)
    data = clip.read_bytes()
    header, rest = data.split(b"\n", 1)
    assert header.startswith(b"YUV4MPEG2 W64 H48")
    assert rest.count(b"FRAME\n") == 3
    assert len(rest) == 3 * (len(b"FRAME\n") + 64 * 48 * 3 // 2)


def test_browser_script_refuses_to_run_without_the_models(bt, monkeypatch, capsys):
    def boom(name, download=True):
        raise ModelError(f"{name} missing; run `realx models fetch`")

    monkeypatch.setattr(bt, "ensure_model", boom)
    assert bt.main(["--seconds", "1"]) == 2
    assert "realx models fetch" in capsys.readouterr().err
