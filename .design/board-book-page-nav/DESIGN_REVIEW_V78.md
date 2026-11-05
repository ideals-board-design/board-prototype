# Design Review: Board book — toolbar (Version 1, 8)

- **Reviewed against:** the the earlier version toolbar feedback (action order — Search → Download → Ask AI "feels off") and the Figma mockup (Meetings › 32957-307272), plus the DS rules in `CLAUDE.md`.
- **Philosophy:** Board DS (Ideals) — a calm, utilitarian interface with the document at the centre.
- **Date:** 2026-11-05
- **Page:** `localhost:5173/board-book-page-nav.html?tab=v1|v2`, document — Q4 board pack (7 pages).

> This review covers DS fidelity, layout and heuristics. The persona-based evaluation is in **Usability study** and the 5-lens scoring is in **UX audit** on this page. The earlier Version 1–3 reports are on the **Reports** tab.

## Screenshots Captured

| Screenshot | Breakpoint | Description |
| --- | --- | --- |
| `screenshots/review-v7-desktop-1280.png` | Desktop (1280×800) | V1 — one top bar: contents · borderless dropdown · page nav · zoom · six icon-only tools |
| `screenshots/review-v8-desktop-1280.png` | Desktop (1280×800) | V2 — bar with a labelled "Download"; tool rail at the top-right of the document |
| `screenshots/review-v7-laptop-1024.png` | Laptop / iPad landscape (1024×768) | V1 — bar fits |
| `screenshots/review-v8-laptop-1024.png` | Laptop / iPad landscape (1024×768) | V2 — rail sits in the gutter beside the sheet |

> Screenshots are in `.design/board-book-page-nav/screenshots/` (headless Chrome). Below 1024px the viewer sits behind the Agenda / Board book segment, so 768 and 375 were not captured for this review; phones (<640px) keep the Document tools sheet in both versions. Dark mode was not checked: the test page has no theme toggle.

## Summary

Version 1 is the earlier version with a borderless, hug-content document dropdown (max 200px, ellipsis). Version 2 is Version 1 with Search · Ask AI · Comment / Draw / Highlight moved into a floating vertical rail and a labelled "Download" button in the top bar. Both share the borderless dropdown, so the comparison isolates the rail and the Download label.

**Version 2** answers the feedback directly: Download is no longer squeezed between Search and Ask AI, and the annotation tools sit beside the page instead of at the far end of the bar. **Version 1** keeps every tool in one familiar strip, but all 15 buttons are icon-only, which is the main cost for low-proficiency and touch readers. V2 still has 14 icon-only buttons, so it moves tools rather than removing the label problem. All components are DS components, `npm run verify` is clean.

## Comparison

Scores 1–5 (5 = best).

| Criterion | V1 Borderless dropdown | V2 Tool rail |
| --- | --- | --- |
| Where am I (page / document) | 4 — name and "1 / 7" in the bar; the name reads as a title | 4 — same bar, same dropdown |
| Findability of controls | 3 — 15 icon-only buttons in one bar, three tool groups at the right end | 4 — Download labelled; tools grouped in a card; still icon-only |
| Agenda context | 5 — open by default (product decision 2026-10-23; not yet built into the prototype) | 5 — same |
| Reading space | 5 — no overlays on the sheet | 4 — the rail floats in the gutter at 100% (not checked at higher zoom) |
| Mobile (375) | 4 — the earlier version sheet, unchanged | 4 — the earlier version sheet, unchanged |
| Consistent "next / back" semantics | 4 — ‹ › for pages, \|< >\| for documents | 4 — same |
| **Total** | **25** | **25** |

> Both versions are scored as built, with the same rules as the earlier review. The totals tie; the difference between them is in findability and reading space, which the usability study then separates.

**Recommendation:** V2 is the base for the toolbar, with labels added to the rail (R1 in the study). Keep V1's hug dropdown but give it an affordance and test it against the earlier version.

## Document boundaries

The document boundary is unchanged since the earlier review: the end of a document is silent, and the only way on is a navigation control.

| What matters at a document boundary | V1 Borderless dropdown | V2 Tool rail |
| --- | --- | --- |
| Where "next page / document" is when you reach the bottom | top bar, centred (›, >\|) | top bar, centred (›, >\|) — unchanged |
| Control visibility | always | always |
| How you can tell the document ended | page counter / document name | page counter / document name |
| Previous document | \|< from any page | \|< from any page |
| Next document | >\| from any page; tooltip names the document | >\| from any page; tooltip names the document |
| Score | 4 | 4 |

Conclusions:

1. **Nothing changes at the boundary between V1 and V2**, so it does not separate them; both inherit the open Should-fix from the earlier review (a "Next document: <name>" label on the last page).
2. Both keep page navigation centred in the top bar, away from the bottom of the page where reading ends — the pattern the earlier review preferred.

## Must Fix

No new Must-fix issues in V1 or V2. The document-end problem is carried over (see Should Fix 4).

## Should Fix

1. **V1: 15 icon-only buttons in one bar.** Six tools sit after zoom, fit and fullscreen; Search, Download and Ask AI are side by side with no label. _Fix: adopt V2's placement and labelled Download._ **Status: addressed in V2.**
2. **Both: the borderless dropdown reads as a title.** There is no field outline; only the chevron and the hover fill say it is a menu. _Fix: a hairline on hover / focus, or keep the outline below 1280px; compare the earlier version and V1 in a separate test._
3. **V2: the rail is icon-only.** The sparkle (Ask AI) and Draw / Highlight carry no names; tooltips open to the left and need hover. _Fix: icon + text at ≥1280px, persistent labels on touch._
4. **Both: the end of a document is silent.** Carried over from the earlier review: the next control should say "Next document: <name>" on the last page, and the counter should show local position.
5. **V2: verify the rail against the sheet.** At 100% zoom it sits in the gutter on 1280 and 1024. Not checked at higher zoom, with the agenda open, or on tablet portrait. _Fix: test and, if needed, offset or auto-hide the rail while panning._

## Could Improve

1. **Touch targets.** 32×32 buttons (DS M) are below the recommended 44×44 on iPad; the rail stacks them 2px apart (the DS tertiary spacing). _Suggestion: larger hit areas on touch._
2. **Rail grouping.** Search · Ask AI and Comment · Draw · Highlight are separated by 16px; a hairline or a label could make the two groups clearer.
3. **Dark mode.** Not checked: the test page has no theme toggle. All colours use tokens, so the risk is low.
4. **Tabs at 375px** scroll horizontally. Acceptable for a test page.

## What Works Well

- **V2's labelled Download** resolves the feedback about action order and is the only text button in the bar.
- **The rail is built from DS parts:** tertiary icon buttons, `--elevation-100` on the card (shadow in light, border ring in dark), 2px between buttons, `role="toolbar"` with `aria-orientation="vertical"`.
- **V1 / V2 dropdown:** the arrow stays next to the text, the name is capped at 200px with an ellipsis, so long document names do not push the page navigation.
- **Page navigation stays centred and unchanged** in both versions, so users who learned the earlier version lose nothing.
- **DS discipline:** tokens only, no inline SVGs, `npm run verify` is clean.
