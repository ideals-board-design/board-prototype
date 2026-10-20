# Design Review: Board book — document navigation (Version 1, 2, 3)

- **Reviewed against:** there is no dedicated `DESIGN_BRIEF.md` for this feature. The reference is the task brief from chat (the Version 1 / 2 / 3 descriptions), the Figma mockups (Meetings › 32114-124836, "Navigation" 32133-81902) and the DS rules in `CLAUDE.md`.
- **Philosophy:** Board DS (Ideals) — a calm, utilitarian interface with the document at the centre.
- **Date:** 2026-10-19
- **Page:** `localhost:5173/board-book-page-nav.html?tab=v1|v2|v3`, document — Q4 board pack (7 pages).

> This review covers DS fidelity, layout and heuristics. The persona-based evaluation (board-usability-study method) is in the **Usability study** section of this page, and the 5-lens scoring is in **UX audit**.

## Screenshots Captured

| Screenshot | Breakpoint | Description |
| --- | --- | --- |
| `screenshots/review-v1-desktop-1280.png` | Desktop (1280×800) | V1 — full width, toolbar with page counter, zoom card on the left |
| `screenshots/review-v2-desktop-1280.png` | Desktop (1280×800) | V2 — agenda on the left; floating controls hidden without hover |
| `screenshots/review-v3-desktop-1280.png` | Desktop (1280×800) | V3 — reading mode, bottom bar, progress bar |
| `screenshots/review-v1-tablet-768.png` | Tablet (768×1024) | V1 — toolbar fits, agenda closed |
| `screenshots/review-v2-tablet-768.png` | Tablet (768×1024) | V2 — no page indicator at all |
| `screenshots/review-v3-tablet-768.png` | Tablet (768×1024) | V3 — bar fits; progress shown as 100% (see Should fix 1) |
| `screenshots/review-v1-mobile-375.png` | Mobile (375×812) | V1 — document field collides with the page field; the 635px sheet doesn't fit |
| `screenshots/review-v2-mobile-375.png` | Mobile (375×812) | V2 — controls visible (touch) and covering the document text |
| `screenshots/review-v3-mobile-375.png` | Mobile (375×812) | V3 — sheet fits, but the bottom bar is cut off on the right |
| `screenshots/fixed-v1-mobile-375.png` | Mobile (375×812) | After the fix: V1 — document · 1 / 7 · ⌄ ⌃ · "⋯" all fit |
| `screenshots/fixed-v2-desktop-1280.png` | Desktop (1280×800) | After the fix: V2 — controls visible without hover, "1 / 7" counter at the bottom |
| `screenshots/fixed-v2-tablet-768.png` | Tablet (768×1024) | After the fix: V2 — same on tablet |
| `screenshots/fixed-v3-mobile-375.png` | Mobile (375×812) | After the fix: V3 — ‹ 1 / 7 › · zoom · "⋯" in one bar |

> Screenshots are in `.design/board-book-page-nav/screenshots/`. Desktop and tablet — headless Chrome; mobile — the in-app browser (headless Chrome distorts the 375 width). Dark mode was not checked: the test page has no theme toggle.

## Summary

All three versions are built from DS components, and continuous scrolling with the real document works in all of them. **Version 3** is the strongest base: every key action (page, zoom, annotations) lives in one always-visible place, there is reading progress, and on mobile the sheet fits. **Version 2** is the weakest for board members: the position in the document isn't shown anywhere, and the controls hide until hover. **Version 1** is the most familiar PDF pattern, but its toolbar breaks on mobile.

> **Update 2026-10-19:** all 4 Must-fix items have been fixed (status in each item below). Scores in the table reflect the state before the fixes.

> **Update 2026-10-19 — platform constraint:** continuous scrolling works only **within one document**. Nothing can be added inside the document (for example, a "Next document" button under the last page). Moving to the next document is possible **only through the viewer's navigation panels**: "next page" on the last page, the document dropdown, the keyboard. The prototype now follows this behaviour in every version: `PageStack` renders only the current document's pages. This makes **the placement of the navigation panels the key criterion**. Details in "Document boundaries" below.

## Comparison

Scores 1–5 (5 = best).

| Criterion | V1 Full width | V2 Floating controls | V3 Reading mode |
| --- | --- | --- | --- |
| Where am I (page / document) | 5 — "1 / 7" + document in the toolbar | 2 — document name only, no page number | 5 — "1 / 7" + document + progress |
| Findability of controls | 4 — everything visible, but two zones (toolbar + card) | 2 — palette, zoom and arrows appear only on hover | 5 — one persistent bar |
| Agenda context | 3 — closed by default, toggled with a button | 5 — open next to the document | 3 — closed, toggled with a button |
| Reading space | 4 | 3 — palette and arrows overlap the margins | 5 |
| Mobile (375) | 1 — toolbar collides, sheet doesn't fit | 2 — controls cover the text | 3 — sheet OK, bar cut off |
| Consistent "next / back" semantics | 2 — ⌄ / ⌃ while the hint says ← → | 4 — ‹ › | 4 — ‹ › |
| **Total** | **19** | **18** | **25** |

**Recommendation:** use V3 as the base (even more confidently after the constraint was clarified, see "Document boundaries"). From V2, take only the agenda open beside the document as an option (V3 can already open it with a button). For this audience, V2's hover-only controls are best dropped.

## Document boundaries (after the constraint was clarified)

A document ends "silently": there is nothing under the last page, and the only way on is a control in a navigation panel. So what matters is **where that panel sits relative to the point where the reader finishes the document**: the bottom of the last page.

| What matters at a document boundary | V1 Full width | V2 Floating controls | V3 Reading mode |
| --- | --- | --- | --- |
| Where "next page / document" is when you reach the bottom | at the top, in the toolbar (⌄) — eyes and pointer must travel across the whole screen | beside the sheet, at mid-height (›) — close, but not where you finished | at the bottom, in the bar (›) — exactly where you finished reading |
| Control visibility | always | always (after the fix) | always |
| How you can tell the document ended | page counter / name in the document field only | page counter / document name | page counter + progress + document name |
| Previous document | ⌃ on the first page (top) | ‹ on the first page (side) | ‹ on the first page (bottom) |
| Score | 2 | 4 | 5 |

Conclusions:

1. **The recommendation gets stronger — V3.** The bottom bar sits where the reader finishes the document, so moving on is the shortest path with no change of focus. Progress also signals that the document has ended.
2. **V1 loses the most.** Moving on is only possible from the toolbar at the top, and the vertical ⌄ / ⌃ don't read as "next document". For V1, consider duplicating "next" at the bottom (e.g. a floating › in the bottom-right corner — that is also a navigation panel, not document content).
3. **V2 is the middle option.** The › arrows beside the sheet are always in view, but at mid-height rather than near the end of the page.
4. **New (Should fix):** on a document's last page the "next" control should signal that it leads to another document — e.g. a tooltip "Next document: Opening, quorum, and minutes.pdf" instead of "Next page", or an accent state on the button. This is a change in the panel itself, so it respects the constraint.
5. **New (Should fix):** the "N / 7" counter counts pages across the whole board book, while only one document is on screen. Show the local position too, e.g. "4 / 7 · page 1 of 2".
6. **New (Should fix): Figma mockups.** In the "Navigation" section, page 2 of another document appeared right under the cover. The mockups have been updated to show only the current document.

## Must Fix

1. **V1, mobile: the toolbar breaks.** At 375px the document field shrinks to zero and the page field overlaps it. Tools after "Download" are cut off at the screen edge. Cause: `.docSelectWrap { flex: 0 1 272px; min-width: 0 }` in `BoardBookPageNavViewer.module.css`, and the toolbar has no mobile variant. See `screenshots/review-v1-mobile-375.png`. _Fix: below 768 move the tools into a "⋯" menu, and give the document field a `min-width` (e.g. 120px) or move it to a second row._ **Status: fixed.** Below 768 the tools moved into "⋯", the document field has `min-width: 120px`, and the toolbar uses tighter spacing. See `screenshots/fixed-v1-mobile-375.png`.
2. **V2: no position indicator.** There is no page number or "N / 7" anywhere. The user only sees the document name (Nielsen heuristic #1, "Visibility of system status"). See `screenshots/review-v2-desktop-1280.png`, `review-v2-tablet-768.png`. _Fix: add an "N / 7" counter between the arrows or in the zoom card._ **Status: fixed.** A floating "[N] / 7" counter with an input field was added at the bottom centre. See `screenshots/fixed-v2-desktop-1280.png`.
3. **V2: controls hidden until hover.** The palette, zoom and arrows have `opacity: 0` until hover or focus (`.floating` in `BoardBookFilmstripViewer.module.css`). On desktop an open document looks as if it had no tools. See `screenshots/review-v2-desktop-1280.png`. _Fix: show the controls permanently (as V3 already does), or keep at least the arrows and the counter visible._ **Status: fixed.** Hover-hiding was removed; the controls are always visible.
4. **V3, mobile: the bottom bar is cut off.** At 375px "Fit page", "Highlight" and "Comment" are not visible. The bar has `max-width: calc(100% - 32px)` but doesn't wrap or collapse its contents. See `screenshots/review-v3-mobile-375.png`. _Fix: below 768 keep ‹ N / 7 › and zoom, and move "Fit" and annotations into "⋯"._ **Status: fixed.** Below 768 "Fit width / Fit page / Highlight / Comment" moved into a "⋯" menu that opens upward. For this, `ActionMenu` got an optional `placement="top"` prop. See `screenshots/fixed-v3-mobile-375.png`.

## Should Fix

1. **V3: progress shows 100% until the pages have loaded.** **Status: fixed** together with the behaviour change. Progress is now computed across the whole board book (documents before the current one + scroll within it) and recalculated via `ResizeObserver` whenever the content height changes. Original description: `updateProgress` only ran on scroll and on `sheetWidth`/`focus` changes. If page images load late, `scrollHeight == clientHeight` at start and the bar stays full until the first scroll. Reproduced in headless Chrome. See `screenshots/review-v3-desktop-1280.png`, `review-v3-tablet-768.png`. _Fix: recompute progress with a `ResizeObserver` on the page stack in `BoardBookReadingViewer.tsx`._
2. **Inconsistent "next page" semantics.** V1 uses ⌄ / ⌃ (vertical), V2/V3 use ‹ ›, and the hint at the bottom shows ← → everywhere. _Fix: pick one pattern for all versions; for vertical scrolling ⌃ / ⌄ are logical, but then the hint should be ↑ ↓._
3. **V1, mobile: the sheet doesn't fit.** The sheet width is a fixed 635px (`calc(635px * zoom)`), so 375px needs horizontal scrolling. V2/V3 already use `min(635px, 100%)`. See `screenshots/review-v1-mobile-375.png`. _Fix: apply the same `min()` in V1._
4. **The zoom percentage means different things.** V3 on mobile shows "54%" by default (relative to 635px), while V2 shows "100%" even though the sheet is shrunk to fit. _Fix: compute the percentage relative to the fitted sheet, or show "Fit" when the sheet is fitted._
5. **V3: the "Focus mode" icon is ambiguous.** The DS `expand` icon (⌃⌄) reads as "expand / collapse". _Fix: use `arrow-resize-diagonal` as in V1/V2, or an icon such as `eye-opened`._
6. **Different tool sets.** V3 has no "Draw", V2 had no page field. This makes the comparison of versions not quite fair. _Fix: align the set of actions before the usability test._
7. **Hardcoded px in inline styles.** `635px`, `960px`, `56px` and the 72px gutters are set in TSX (`style={{ width: … }}`), so stylelint can't see them. This breaks the CLAUDE.md "tokens only" rule. _Fix: move base sizes into module CSS variables or tokens._
8. **Code duplication.** `useMediaQuery`, `FORMAT_ICON` and the `.docSelect*` styles are copied into 4 viewers (about 5.3k lines). _Fix: once a direction is chosen, keep one viewer and move shared parts into `PageStack`/shared._

## Could Improve

1. **Touch targets.** 32×32 buttons (DS M) are below the recommended 44×44 on mobile. _Suggestion: size L, or a larger hit area below 768._
2. **Keyboard hint.** It is `aria-hidden`, so screen readers don't announce it, and "← →" means nothing to trackpad and touch users. _Suggestion: hide it on touch devices; for keyboard users add a "Keyboard shortcuts" item to a menu._
3. **Dark mode.** The test page has no theme toggle, so it couldn't be checked. All colours use tokens, so the risk is low. _Suggestion: add a theme toggle to the test page header._
4. **Tabs at 375px** scroll horizontally and "Only document toggle" is cut off. Acceptable for a test page.

## What Works Well

- **Continuous scrolling within a document** (`PageStack`): a document's pages follow each other, the position is derived from scrolling, and navigation scrolls to the target. The reader moves to the next document only through the navigation panel ("next page" on the last page, the document field, the keyboard), as on the platform. This works the same in every version.
- **Real document and content.** The Q4 pack with a matching agenda makes the comparison realistic.
- **The document field** is the same in every version and opens a menu with agenda items and documents. Easy to find.
- **DS discipline in CSS.** Colours, spacing and shadows come from tokens (`--elevation-100` on floating surfaces), `npm run verify` is clean for `src/test-versions`, buttons have `aria-label` and tooltips.
- **V3:** one persistent control zone, reading progress and a quiet top bar — the best balance of "document in focus / controls at hand".
