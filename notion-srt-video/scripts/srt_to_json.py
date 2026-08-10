#!/usr/bin/env python3
"""Parse an SRT file into deterministic JSON, optionally clipped to a time range."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


TIMECODE = re.compile(
    r"(?P<sh>\d{1,2}):(?P<sm>\d{2}):(?P<ss>\d{2})[,.](?P<sms>\d{3})"
    r"\s*-->\s*"
    r"(?P<eh>\d{1,2}):(?P<em>\d{2}):(?P<es>\d{2})[,.](?P<ems>\d{3})"
)


def seconds(h: str, m: str, s: str, ms: str) -> float:
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def parse_srt(path: Path) -> list[dict]:
    raw = path.read_text(encoding="utf-8-sig").replace("\r\n", "\n")
    blocks = re.split(r"\n{2,}", raw.strip()) if raw.strip() else []
    entries: list[dict] = []

    for block in blocks:
        lines = [line.strip() for line in block.splitlines()]
        timing_index = next((i for i, line in enumerate(lines) if "-->" in line), None)
        if timing_index is None:
            continue
        match = TIMECODE.search(lines[timing_index])
        if not match:
            raise ValueError(f"Invalid SRT timecode: {lines[timing_index]}")

        g = match.groupdict()
        start = seconds(g["sh"], g["sm"], g["ss"], g["sms"])
        end = seconds(g["eh"], g["em"], g["es"], g["ems"])
        if end <= start:
            raise ValueError(f"Subtitle ends before it starts: {lines[timing_index]}")

        text_lines = [line for line in lines[timing_index + 1 :] if line]
        if not text_lines:
            continue
        entries.append(
            {
                "index": len(entries) + 1,
                "start": round(start, 3),
                "end": round(end, 3),
                "duration": round(end - start, 3),
                "lines": text_lines,
                "text": " ".join(text_lines),
            }
        )

    return entries


def clip(entries: list[dict], start: float, end: float | None) -> list[dict]:
    result: list[dict] = []
    for entry in entries:
        if entry["end"] <= start or (end is not None and entry["start"] >= end):
            continue
        clipped_start = max(entry["start"], start)
        clipped_end = min(entry["end"], end) if end is not None else entry["end"]
        item = dict(entry)
        item["source_start"] = entry["start"]
        item["source_end"] = entry["end"]
        item["start"] = round(clipped_start - start, 3)
        item["end"] = round(clipped_end - start, 3)
        item["duration"] = round(item["end"] - item["start"], 3)
        item["index"] = len(result) + 1
        result.append(item)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Input .srt file")
    parser.add_argument("--output", "-o", type=Path, help="Output JSON file; defaults to stdout")
    parser.add_argument("--start", type=float, default=0.0, help="Excerpt start in seconds")
    parser.add_argument("--end", type=float, help="Excerpt end in seconds")
    args = parser.parse_args()

    if args.start < 0 or (args.end is not None and args.end <= args.start):
        parser.error("Require start >= 0 and end > start")

    source_entries = parse_srt(args.input)
    entries = clip(source_entries, args.start, args.end)
    payload = {
        "source": str(args.input.resolve()),
        "excerpt_start": args.start,
        "excerpt_end": args.end,
        "entry_count": len(entries),
        "duration": round(max((entry["end"] for entry in entries), default=0), 3),
        "entries": entries,
    }
    rendered = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.write_text(rendered, encoding="utf-8")
    else:
        print(rendered, end="")


if __name__ == "__main__":
    main()
