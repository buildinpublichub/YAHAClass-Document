import os, tempfile, importlib

def test_add_and_complete(tmp_path, monkeypatch):
    monkeypatch.setenv("TODO_DB", str(tmp_path / "db.json"))
    from todo import store
    importlib.reload(store)
    t = store.add("buy milk")
    store.complete(t["id"])
    assert store.load()[0]["done"] is True
