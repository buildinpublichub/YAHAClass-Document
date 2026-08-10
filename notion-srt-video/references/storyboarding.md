# SRT-to-Beat Storyboarding

## Parse and preserve timing

Run:

```bash
python3 scripts/srt_to_json.py input.srt --output subtitles.json
```

For an excerpt, add `--start` and `--end` in seconds. Preserve original start/end times in the generated timeline after subtracting the excerpt start.

## Build semantic beats

Treat SRT entries as narration timing, not as a required visual cut list.

- Merge adjacent entries when they complete one sentence or one idea.
- Start a new card when the subject, claim, example, step, contrast, or emotional function changes.
- Target roughly 4–8 seconds per settled card. Short 2–3 second cards are acceptable for a punchline or simple keyword.
- For longer explanations, keep the same visual card and update only the highlighted phrase or support sentence.
- Never place a dense multi-item overview on screen merely because the narration lists several items. Show the items sequentially.

## Write on-screen card copy

Derive card copy from the narration; do not duplicate the entire subtitle in the main card.

- Thesis: 4–14 Chinese characters when possible.
- Support: one concise sentence, usually 12–28 Chinese characters.
- Caption: preserve the spoken wording and timing.
- Use concrete nouns and verbs. Remove filler words from card copy.
- Keep technical terms intact. Do not invent factual claims not present in the SRT.

## Choose visual roles

Use text-only cards by default. Add a character only when pose or emotion clarifies the idea: questioning, presenting, comparing, warning, researching, or verifying.

Map poses by function:

- Curious/questioning → `01-curious.png`
- Reading/researching → `02-researcher.png`
- Presenting/explaining → `03-presenter.png`
- Library/comparison → `04-librarian.png`
- Concern/risk → `05-concerned-researcher.png`
- Skeptical/verification → `06-skeptical-reader.png`
- Connected search/process → `07-connected-search.png`
- Guide/decision → `08-guide.png`
- Source verification → `09-verifier.png`

Mirror the PNG when the natural gaze or gesture points away from the card content.

## Caption handling

- Keep the bottom caption card synchronized to the SRT.
- Break long Chinese subtitles at semantic pauses into no more than two centered lines.
- If a subtitle cannot fit at 42 px, split its display across its original time interval while preserving the spoken sequence.
- Never reduce the caption container width below the main card width.

## Approval and delivery

Build without re-asking about this established style. Provide a browser preview and representative contact sheet. If rendering was requested, render only after lint, layout, transition, and contrast checks pass.
