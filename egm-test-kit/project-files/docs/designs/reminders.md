# Design: Due dates and reminders

## Goal

Users forget tasks. Let them give a task a due date and get a reminder.

## Proposal

- `todo add "pay rent" --due "friday 9am"` stores a `due` field on the task.
- A background reminder process checks every minute and shows a desktop
  notification when a task is due.
- `todo list` shows the due date next to each task and sorts overdue tasks first.

## Data

Each task gets a new field:

    {"id": 4, "title": "pay rent", "done": false, "due": "friday 9am"}

## Implementation plan

1. Add a `--due` option to `add` in `cli.py`.
2. Write `reminder.py` with a loop that loads tasks and notifies.
3. Update `list` to sort by due date.

## Testing

We will test it manually.
