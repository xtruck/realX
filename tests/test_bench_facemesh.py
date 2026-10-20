"""The pure parts of scripts/bench_facemesh.py: how samples become a step summary, when a report is called representative, and the table.
No browser, no camera, no GPU: the benchmark itself is run by hand (see the script's header)."""

import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _bench():
    spec = importlib.util.spec_from_file_location("bench_facemesh", ROOT / "scripts" / "bench_facemesh.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _samples(fps, drawn=1, badge=True, **extra):
    return [{"fps": f, "detectMs": 40.0, "poseMs": extra.get("poseMs"), "handMs": None, "hairMs": None, "drawn": drawn,
             "badge_visible": badge, "body": extra.get("body", "off"), "hair": "off", "liveHands": "off", "stains": 0} for f in fps]


def test_a_step_summary_has_the_medians_the_gate_and_what_started():
    b = _bench()
    s = b.summarize_step("body", _samples([18, 22, 24, 20, 21], poseMs=30.0, body="on"))
    assert s["fps_median"] == 21 and s["fps_p95"] == 24 and s["detectMs_median"] == 40.0 and s["poseMs_median"] == 30.0
    assert s["gate_20fps"] is True and s["states"]["body"] == "on" and s["samples"] == 5
    assert b.summarize_step("slow", _samples([5, 6, 7]))["gate_20fps"] is False


def test_the_label_check_only_counts_the_samples_where_something_was_drawn():
    b = _bench()
    ok = b.summarize_step("a", _samples([20, 20], badge=True))
    assert ok["label_visible_while_drawn"] is True
    bad = b.summarize_step("b", _samples([20, 20], badge=False))
    assert bad["label_visible_while_drawn"] is False, "a picture drawn without the label is reported as a failure"
    idle = b.summarize_step("c", _samples([20, 20], drawn=0, badge=False))
    assert idle["label_visible_while_drawn"] is None and idle["drawn_samples"] == 0, "nothing drawn: no claim either way"


def test_missing_numbers_do_not_break_the_summary():
    b = _bench()
    s = b.summarize_step("empty", [])
    assert s["fps_median"] is None and s["gate_20fps"] is None and s["label_visible_while_drawn"] is None
    odd = b.summarize_step("odd", [{"fps": None}, {"fps": float("nan")}, {"fps": 12}])
    assert odd["fps_median"] == 12


def test_a_software_renderer_or_other_browsers_make_the_report_not_representative():
    b = _bench()
    steps = [b.summarize_step("x", _samples([20]))]
    quiet = {"browser_processes_before": 0, "warning": None}
    assert b.build_report({}, {}, quiet, "ANGLE (Intel, Intel(R) UHD Graphics 620)", steps)["representative"] is True
    soft = b.build_report({}, {}, quiet, "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device))", steps)
    assert soft["representative"] is False and any("SOFTWARE renderer" in n for n in soft["notes"])
    busy = b.build_report({}, {}, {"browser_processes_before": 12, "warning": "12 other Chrome processes"}, "Intel UHD", steps)
    assert busy["representative"] is False and any("12 other Chrome" in n for n in busy["notes"])
    assert any("no hand" in n for n in soft["notes"]), "the report always says the fake camera has no hand"


def test_the_table_has_one_row_per_step_and_flags_a_missing_label():
    b = _bench()
    steps = [b.summarize_step("face only", _samples([22, 23])), b.summarize_step("hidden label", _samples([22, 23], badge=False))]
    doc = b.build_report({}, {}, {"warning": None}, "Intel UHD", steps)
    lines = b.format_table(doc).splitlines()
    assert len(lines) == 2 + 2 and lines[0].startswith("| Step")
    assert "| yes |" in lines[2] and "| NO |" in lines[3]
    assert "hand runs/s" in lines[0]


def test_resolution_helper_is_the_existing_one():
    import pytest

    b = _bench()
    assert b.parse_resolution("640x480") == (640, 480)
    with pytest.raises(ValueError):
        b.parse_resolution("641x480")


def test_the_hand_polling_rate_comes_from_the_poll_counter_and_the_clock():
    b = _bench()
    samples = [{"fps": 20, "drawn": 1, "badge_visible": True, "t": 100.0 + i, "handPolls": 10 + 4 * i} for i in range(6)]
    assert b.summarize_step("idle", samples)["hand_hz"] == 4.0, "four runs a second"
    assert b.summarize_step("none", _samples([20, 20]))["hand_hz"] is None, "no counter, no claim"
    one = [{"fps": 20, "t": 1.0, "handPolls": 3}]
    assert b.summarize_step("single", one)["hand_hz"] is None


def test_clean_the_edges_has_its_own_column_and_a_note_when_it_stopped_itself():
    b = _bench()
    on = [dict(x, seam="on", seamMs=80.0) for x in _samples([20, 21])]
    off = [dict(x, seam="off", seamMs=None) for x in _samples([24, 25])]
    s_on, s_off = b.summarize_step("edges on", on), b.summarize_step("edges off", off)
    assert s_on["seamMs_median"] == 80.0 and s_on["states"]["seam"] == "on"
    assert s_off["seamMs_median"] is None and s_off["states"]["seam"] == "off"
    lines = b.format_table(b.build_report({}, {}, {"warning": None}, "Intel UHD", [s_off, s_on])).splitlines()
    assert "edges ms" in lines[0] and "| 80.0 |" in lines[3]
    slow = b.summarize_step("slow", [dict(x, seam="too slow", seamSlowMs=12000) for x in _samples([2])])
    doc = b.build_report({}, {}, {"warning": None}, "Intel UHD", [slow])
    assert slow["seam_slow_ms"] == 12000 and any("turned itself off as too slow" in n and "12000" in n for n in doc["notes"])


def test_a_stopped_option_does_not_report_its_last_pass_time():
    b = _bench()

    class Page:
        def evaluate(self, _):
            return {"fps": 20, "seam": "off", "seamMs": 12000.0}

        def is_visible(self, _):
            return True

    assert b._sample(Page())["seamMs"] is None
