"""Stores tasks in a JSON file in the user's home folder."""
import json
import os
from pathlib import Path

DB_PATH = Path(os.environ.get("TODO_DB", Path.home() / ".todo.json"))


def load():
    if not DB_PATH.exists():
        return []
    return json.loads(DB_PATH.read_text())


def save(tasks):
    DB_PATH.write_text(json.dumps(tasks, indent=2))


def add(title):
    tasks = load()
    task = {"id": len(tasks) + 1, "title": title, "done": False}
    tasks.append(task)
    save(tasks)
    return task


def complete(task_id):
    tasks = load()
    for t in tasks:
        if t["id"] == task_id:
            t["done"] = True
    save(tasks)
