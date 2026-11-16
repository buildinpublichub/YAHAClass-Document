#!/usr/bin/env python3
"""Rough check: which of the 9 planted mistakes in docs/designs/reminders.md
appear in the EGM review reports in a folder. Keyword search only, so open the
report and read the line before you say it on camera.
Usage: python3 check_gaps.py ~/egm-demo
"""
import re, sys, pathlib

GAPS = [
    ("G1", "Due date stored as raw text (\"friday 9am\")", r"ISO|raw text|can't be sorted|free text|free-form"),
    ("G2", "Time zones / which Friday", r"time ?zone|UTC|local time"),
    ("G3", "Who starts / stops the background process", r"who starts|reboot|stopped|systemd|cron"),
    ("G4", "Same reminder every minute, forever", r"every minute|repeat|reminded|fire.once|spam"),
    ("G5", "Desktop notifications differ per OS", r"platform|each OS|macOS|notify-send"),
    ("G6", "Two programs writing one file", r"half-written|overwrite|atomic|os\.replace|lock"),
    ("G7", "Old tasks have no due field", r"no .due. field|missing|existing tasks|old tasks"),
    ("G8", "\"We will test it manually\"", r"manual|pytest|automated tests"),
    ("G9", "Existing id bug: len(tasks) + 1", r"duplicate id|len\(tasks\)"),
]

folder = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
reports = sorted(folder.glob("*_report.md"))
if not reports:
    sys.exit(f"No *_report.md files in {folder}. Run the review first.")
text = {r.name: r.read_text(encoding="utf-8", errors="replace") for r in reports}
found = 0
for gid, name, pat in GAPS:
    hits = [n for n, t in text.items() if re.search(pat, t, re.I)]
    found += bool(hits)
    print(f"{'FOUND' if hits else 'missed'}  {gid}  {name:45s} {len(hits)} report(s)")
print(f"\n{found} of {len(GAPS)} planted mistakes found in {len(reports)} reports")
