"""`realx models fetch` exit code."""

from realx import cli, models


def test_fetch_exits_nonzero_and_names_failures_when_offline(monkeypatch, tmp_path, capsys):
    monkeypatch.setenv("REALX_MODELS_DIR", str(tmp_path))
    monkeypatch.setenv("REALX_OFFLINE", "1")
    assert cli.main(["models", "fetch"]) != 0
    out = capsys.readouterr()
    assert "failed:" in out.out and "not ready: yunet" in out.err


def test_fetch_exits_zero_when_every_model_is_ready(monkeypatch, tmp_path, capsys):
    monkeypatch.setenv("REALX_MODELS_DIR", str(tmp_path))
    monkeypatch.setattr(models, "ensure_model", lambda name, download=True: tmp_path / name)
    assert cli.main(["models", "fetch"]) == 0


def test_list_stays_zero_even_when_models_are_missing(monkeypatch, tmp_path, capsys):
    monkeypatch.setenv("REALX_MODELS_DIR", str(tmp_path))
    assert cli.main(["models", "list"]) == 0
    assert "missing:" in capsys.readouterr().out
