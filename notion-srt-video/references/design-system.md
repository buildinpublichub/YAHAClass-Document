# Approved Notion Card Video System

## Canvas and fixed geometry

Use a 1080×1920 canvas. The entire designed content system is a centered 3:4 rectangle:

| Element | x | y | width | height |
|---|---:|---:|---:|---:|
| Content module | 72 | 336 | 936 | 1248 |
| Eyebrow | 64–72 | 336 | auto | 21–28 |
| Scene title | 64–72 | 376 | up to 936 | about 52 |
| Main visual card | 72 | 450 | 936 | 820 |
| Gap | 72 | 1270 | 936 | 40 |
| Caption card | 72 | 1310 | 936 | 274 |

Leave y=0–336 and y=1584–1920 visually quiet. Do not move the main system upward to fill the frame.

The main visual card and caption card must share the same left and right edges. Use a 4 px black border and approximately 18 px corner radius.

## Visual language

- Background: white or subtly warm off-white.
- Ink: near-black `#0A0A0A`.
- Secondary surface: `#F7F7F5`.
- Avoid gradients, drop shadows, glossy UI, saturated accent colors, sketchy crayon marks, and unrelated decorative icons.
- Use clean Notion-like editorial cards: labels, rules, circles, checkmarks, simple line icons, and generous internal padding.
- Prefer one strong visual metaphor over many small illustrations.

## Typography

- Chinese title: 48–58 px, heavy sans-serif.
- Primary card statement: 58–92 px depending on length.
- Secondary statement: 44–58 px.
- Support/explanatory copy: 36–40 px with 1.28–1.38 line height.
- Subtitle: 42–50 px, bold or semibold, centered; normally no more than two lines.
- English eyebrow/label: 20–28 px uppercase with tracking.

At phone preview scale, the primary Chinese sentence must remain readable without zooming. If it does not fit, shorten or split the beat; never solve density by shrinking below the threshold.

## Content hierarchy inside the main card

Use this order:

1. Small category label or step number.
2. One large thesis, question, comparison, or decision.
3. A short horizontal rule.
4. One support sentence that explains the thesis.
5. Optional half-body character in a bottom corner.

Fill the card intentionally, but preserve breathing space between hierarchy levels. Empty space is acceptable around a large statement; a vacant half-frame beside a tiny card is not.

## Characters

- Use individual files under `assets/template/assets/characters/trimmed/`.
- Use zero or one character per card, except a deliberate two-person comparison.
- Display characters as cropped half-body annotations, typically 22–32% of the main card width.
- Anchor the crop to the bottom edge of the main card.
- Put characters behind text and keep a clean text zone.
- Select or mirror the pose so the eyes, face, and hand gesture lead toward the main statement.
- Do not use characters as full-screen protagonists. Text remains the subject.

## Card archetypes

Choose the smallest archetype that explains the beat:

- Search/input card: one large input term plus a simple search icon.
- Question card: a large `?`, short question, then one support sentence.
- Comparison card: two equal columns inside one outer card.
- Source card: one source appears, then is replaced by the next source.
- Decision card: one large option or rule, not four small stacked rows.
- Process card: one step per beat; replace the card for the next step.
- Risk card: number/icon, consequence, and one explanation.
- Verification card: two or three large checklist lines maximum.

## Motion and layering

- Animate a card as a single readable state: opacity plus subtle 0.97→1 scale or short slide.
- Reveal label, thesis, rule, and support copy in sequence when timing permits.
- Replace old cards cleanly; do not keep previous cards visible as timeline clutter.
- Keep all animation seek-safe and timeline-driven.
- Layer order: paper/background → character → card surfaces/diagrams → readable text → caption overlay.
- Verify mid-transition frames, not only settled states.

## Anti-patterns

- Tiny full-body person surrounded by empty white space.
- Four or more mini-cards visible simultaneously.
- Character covering card text or standing in front of arrows.
- Text and character pointing in opposite directions.
- Upper and lower border containers with different widths.
- Main content stretched to the top or bottom edge of 9:16.
- A visually rich character paired with generic non-Notion clip art.
