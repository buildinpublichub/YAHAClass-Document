# Planted gaps in docs/designs/reminders.md (written 2026-11-15 BEFORE any EGM run)

A review "finds" a gap if any report names the problem, in any wording.

G1. `due` stored as the raw string "friday 9am": no parsing, no format (ISO), sorting by it is impossible.
G2. Time zones / which Friday / past dates not addressed.
G3. Reminder process: how it is started, kept running, stopped (no daemon/launch story); runs when terminal closed?
G4. Duplicate reminders: checks every minute with no "already notified" flag -> notifies every minute forever.
G5. Desktop notification mechanism unspecified and OS-dependent (Linux/macOS/Windows).
G6. Concurrent writes: reminder process and CLI both read/write ~/.todo.json with no locking (lost updates).
G7. Existing tasks have no `due` field (backward compatibility / migration).
G8. "We will test it manually": no automated tests although tests/ exists.
G9. Existing bug the doc builds on: id = len(tasks)+1 (not part of design but code-fit reviewers may spot it).
