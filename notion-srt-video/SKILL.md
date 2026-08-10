---
name: notion-srt-video
description: Turn Chinese or multilingual SRT subtitle files into finished 9:16 HyperFrames animations using the approved card-led Notion minimalist style. Use when the user provides an .srt and asks to generate, animate, preview, or render a video; asks to reuse “现在这个版本/这套规范”; requests a Notion-style subtitle explainer; or explicitly invokes $notion-srt-video. Enforce a centered 3:4 content module, mobile-readable typography, one card per beat, text-first hierarchy, separate transparent character PNGs, and strict no-overlap validation.
---

# Notion SRT Video

Create a 1080×1920 vertical explainer directly from an SRT. Treat text as the lead actor and monochrome half-body characters as optional supporting annotations.

## Required companion skills

Load `hyperframes` first for every build. Load `motion-doctrine` before composing motion and `media-use` when resolving or generating imagery. Follow their validation and rendering workflows.

## Workflow

1. Read the entire SRT. If the user specifies a time range, clip to it; otherwise use the full duration.
2. Run `scripts/srt_to_json.py` to normalize timecodes and preserve the original subtitle text.
3. Read [references/storyboarding.md](references/storyboarding.md), then group subtitles into semantic beats. Use one dominant card at a time; do not turn every subtitle line into a separate composition unless the meaning changes.
4. Read [references/design-system.md](references/design-system.md) completely before laying out the first scene.
5. Copy `assets/template/` into a new project beside the source SRT. Keep the CSS geometry and character assets, but replace all episode-specific text, timing, scene names, and captions.
6. Build the HyperFrames timeline from the SRT timestamps. Keep captions synchronized to the source; adapt line breaks for mobile without changing meaning.
7. Preview and snapshot representative frames plus every distinct card state. Fix all overlap, overflow, contrast, and readability issues.
8. Run `hyperframes lint` and `hyperframes check --at-transitions`. Deliver the preview. Render only when the user asks for an exported movie or when rendering is explicitly part of the request.

Do not ask the user to reconfirm the established visual style. Ask only when a missing choice materially changes scope, such as an unspecified excerpt when they clearly do not want the full SRT.

## Non-negotiable rules

- Use the exact 1080×1920 geometry in the design reference.
- Make the upper visual card and lower caption card exactly the same width and x-position.
- Reserve equal 336 px whitespace at the top and bottom; keep the complete content system inside the centered 936×1248 (3:4) module.
- Show only one main card/state per beat. Replace it with the next card instead of accumulating a dense list.
- Keep primary Chinese text at least 48 px whenever practical; support copy at least 36 px; small English labels may be 20–28 px.
- Keep primary card text to 1–2 lines and support text to 2–3 short lines. Split overloaded ideas into consecutive cards.
- Use white/off-white, black outlines, restrained gray, rounded rectangular cards, and no decorative color unless the user explicitly overrides the style.
- Use separate transparent PNG files for characters. Never use a sprite sheet as multiple visible timeline layers.
- Place characters behind text, usually at a bottom corner, cropped to half body, and small enough that text remains dominant. Mirror a character when needed so gaze and gesture point toward the content.
- Never allow a character, arrow, card, or transition state to cover readable text.
- Keep subtitles inside the lower bordered container; do not reserve a detached black caption band.

## Quality gate

Reject the build until all checks below pass:

- Main and caption containers both equal 936 px width at x=72.
- Visible content stays inside y=336–1584.
- No main card exceeds y=1270; caption card occupies y=1310–1584.
- No text smaller than the mobile thresholds except labels.
- No empty half-frame caused by a tiny card or oversized character.
- No simultaneous stack of small cards that becomes unreadable on a phone.
- No character faces away from the information they are presenting.
- `hyperframes check` reports zero layout errors at scene midpoints and transition boundaries.

## Bundled resources

- `scripts/srt_to_json.py`: deterministic SRT parser and time-range clipper.
- `references/design-system.md`: exact geometry, typography, layering, and scene patterns.
- `references/storyboarding.md`: subtitle-to-beat and mobile-density rules.
- `assets/template/`: the approved HyperFrames composition, card system, and nine separate transparent character PNGs. Treat it as a reusable visual template, not reusable episode content.
