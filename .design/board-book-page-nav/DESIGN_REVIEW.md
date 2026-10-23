# Design Review: Board book — document navigation (Version 1, 2, 3)

- **Reviewed against:** there is no dedicated `DESIGN_BRIEF.md` for this feature. The reference is the task brief from chat (the Version 1 / 2 / 3 descriptions), the Figma mockups (Meetings › 32114-124836, "Navigation" 32133-81902) and the DS rules in `CLAUDE.md`.
- **Philosophy:** Board DS (Ideals) — a calm, utilitarian interface with the document at the centre.
- **Date:** 2026-10-19 · Version 2 re-reviewed 2026-10-22 · Version 3 re-reviewed 2026-10-23
- **Page:** `localhost:5173/board-book-page-nav.html?tab=v1|v2|v3`, document — Q4 board pack (7 pages).

> This review covers DS fidelity, layout and heuristics. The persona-based evaluation (board-usability-study method) is in the **Usability study** section of this page, and the 5-lens scoring is in **UX audit**.

## Screenshots Captured

| Screenshot | Breakpoint | Description |
| --- | --- | --- |
| `screenshots/review-v1-desktop-1280.png` | Desktop (1280×800) | V1 — full width, toolbar with page counter, zoom card on the left |
| `screenshots/review-v2-desktop-1280.png` | Desktop (1280×800) | V2 (new, 2026-10-22) — agenda open; one view card left, palette right, bottom pill \|< ‹ 1 / 7 › >\| |
| `screenshots/review-v3-desktop-1280.png` | Desktop (1280×800) | V3 (before 2026-10-20) — reading mode, bottom bar, progress bar |
| `screenshots/review-v1-tablet-768.png` | Tablet (768×1024) | V1 — toolbar fits, agenda closed |
| `screenshots/review-v2-tablet-768.png` | Tablet (768×1024) | V2 (new) — agenda closed; cards in the gutters beside the sheet, pill at the bottom |
| `screenshots/review-v3-tablet-768.png` | Tablet (768×1024) | V3 — bar fits; progress shown as 100% (see Should fix 1) |
| `screenshots/review-v1-mobile-375.png` | Mobile (375×812) | V1 — document field collides with the page field; the 635px sheet doesn't fit |
| `screenshots/review-v2-mobile-375.png` | Mobile (375×812) | V2 (new) — one "Document tools" button; sheet fits; pill fits |
| `screenshots/review-v2-mobile-sheet-375.png` | Mobile (375×812) | V2 (new) — "Document tools" bottom sheet with labelled rows |
| `screenshots/review-v3-mobile-375.png` | Mobile (375×812) | V3 — sheet fits, but the bottom bar is cut off on the right |
| `screenshots/fixed-v1-mobile-375.png` | Mobile (375×812) | After the fix: V1 — document · 1 / 7 · ⌄ ⌃ · "⋯" all fit |
| `screenshots/fixed-v2-desktop-1280.png` | Desktop (1280×800) | Old V2 (removed 2026-10-22) — after the fix: controls visible without hover, "1 / 7" counter at the bottom |
| `screenshots/fixed-v2-tablet-768.png` | Tablet (768×1024) | Old V2 (removed) — same on tablet |
| `screenshots/fixed-v3-mobile-375.png` | Mobile (375×812) | After the fix: V3 — ‹ 1 / 7 › · zoom · "⋯" in one bar |
| `screenshots/updated-v3-desktop-1280.png` | Desktop (1280×800) | Update 2026-10-20: V3 — ‹‹ ‹ 1 / 7 › ›› · zoom · Fit width · Focus · annotations in the bottom bar; top bar has only Search / Download / Ask AI |
| `screenshots/updated-v3-tablet-768.png` | Tablet (768×1024) | Update 2026-10-20: V3 — same bar on tablet |

> Screenshots are in `.design/board-book-page-nav/screenshots/`. Desktop and tablet — headless Chrome; mobile — the in-app browser (headless Chrome distorts the 375 width; the 2026-10-22 mobile captures were rescaled from the browser pane). Dark mode was not checked: the test page has no theme toggle.

## Summary

> **Product decision 2026-10-23:** in every version the agenda is **open by default** and the phone tools open from the same **"Document tools" (dots) sheet**. Both are scored as shared, not as V2 strengths (the V1 / V3 prototypes don't implement them yet).
>
> **Update 2026-10-23 — Version 3 re-reviewed.** The reading-progress bar was removed from Version 3. Its column below is now re-scored in its current state (bottom bar with \|< ‹ N / 7 › >\|, zoom, fit width, focus, annotations; no progress), the same way as the new Version 2, so V2 and V3 are compared as built. See `screenshots/updated-v3-desktop-1280.png`.

> **Update 2026-10-22 — Version 2 replaced.** The original "floating controls" Version 2 (round ‹ › arrows beside the sheet, counter at the bottom) was removed. **Version 2 is now the former Version 4:** agenda open beside the document; one view card on the left (+ % − | Fit width · Fullscreen icon buttons with tooltips, merged 2026-10-22); the annotation palette on the right (draw · highlight · comment); **one bottom pill** `|< ‹ [N] / 7 › >|` with "Previous / Next document: <name>" tooltips; on phones (<768px) both cards fold into one **"Document tools"** button that opens a labelled DS bottom sheet (Zoom − % +, Fit to width, Fit to page, Actual size, Fullscreen, Annotate, Add comment). Pressed controls keep the hover fill. The V2 column below was re-scored; V1 / V3 scores are unchanged. Shared changes since 2026-10-19 in all versions: the "← → pages" keyboard hint was removed (keys still work), Search / Ask AI panels follow Figma, and the agenda collapses while Search / Ask AI is open below 1800px.

All three versions are built from DS components, and continuous scrolling with the real document works in all of them. **Version 3** is the strongest base: every key action (page, zoom, annotations) lives in one always-visible place, there is reading progress, and on mobile the sheet fits. **Version 2 (new)** is a close second: it has the same bottom-bar navigation as V3, but three control zones instead of one. Its open agenda and phone sheet are now the default for every version. Since V3 lost its progress bar, neither shows how much is left. **Version 1** is the most familiar PDF pattern, but its toolbar breaks on mobile.

> **Update 2026-10-19:** all 4 Must-fix items have been fixed (status in each item below). Scores in the table reflect the state before the fixes.

> **Update 2026-10-20 — V3 bottom bar:** (1) **Previous / Next document** buttons (‹‹ ››, DS `angle-double-left/right-fill`) were added around the page controls; their tooltip names the target document ("Next document: CEO report.pdf") and they are disabled on the first / last document. (2) "Fit width" and "Fit page" were merged back into one **Fit width** button. (3) **Focus mode** moved from the top bar to the bottom bar, with the `arrow-resize-diagonal` icon. The top bar now holds only Search, Download and Ask AI. Below 768px zoom, Fit width, Focus mode and annotations live in the "⋯" menu. See `screenshots/updated-v3-desktop-1280.png`. Scores were not re-rated; the change closes Should fix 5 and most of the document-boundary point 4.

> **Update 2026-10-19 — platform constraint:** continuous scrolling works only **within one document**. Nothing can be added inside the document (for example, a "Next document" button under the last page). Moving to the next document is possible **only through the viewer's navigation panels**: "next page" on the last page, the document dropdown, the keyboard. The prototype now follows this behaviour in every version: `PageStack` renders only the current document's pages. This makes **the placement of the navigation panels the key criterion**. Details in "Document boundaries" below.

## Comparison

Scores 1–5 (5 = best).

| Criterion | V1 Full width | V2 Floating controls (new) | V3 Reading mode |
| --- | --- | --- | --- |
| Where am I (page / document) | 5 — "1 / 7" + document in the toolbar | 4 — document in the top bar, "1 / 7" in the bottom pill; no progress | 4 — document in the top bar, "1 / 7" in the bottom bar; no progress |
| Findability of controls | 4 — everything visible, but two zones (toolbar + card) | 4 — always visible, three zones (view card, palette, pill) | 5 — one persistent bar |
| Agenda context | 5 — open by default (product decision) | 5 — open next to the document | 5 — open by default (product decision) |
| Reading space | 4 | 4 — cards sit in the gutters beside the sheet; one button on phones | 5 |
| Mobile (375) | 1 — toolbar collides, sheet doesn't fit | 4 — sheet and pill fit; labelled "Document tools" sheet | 4 — sheet and bar fit; tools in an unlabeled ⋯ |
| Consistent "next / back" semantics | 2 — ⌄ / ⌃ while the hint says ← → | 4 — ‹ › for pages, \|< >\| for documents | 4 — ‹ › for pages, \|< >\| for documents |
| **Total** | **21** | **25** | **27** |

> V1 scores reflect the state before the 2026-10-19 fixes; V2 (2026-10-22) and V3 (2026-10-23) are scored as built, with the same rules.

**Recommendation:** V3 is the base — one control zone and a quiet top bar, with the agenda open by default and the shared "Document tools" sheet on phones (product decision 2026-10-23). V2 is a close second; its extra floating cards are the main difference.

## Document boundaries (after the constraint was clarified)

A document ends "silently": there is nothing under the last page, and the only way on is a control in a navigation panel. So what matters is **where that panel sits relative to the point where the reader finishes the document**: the bottom of the last page.

| What matters at a document boundary | V1 Full width | V2 Floating controls (new) | V3 Reading mode |
| --- | --- | --- | --- |
| Where "next page / document" is when you reach the bottom | at the top, in the toolbar (⌄) — eyes and pointer must travel across the whole screen | at the bottom, in the pill (› / >\|) — exactly where you finished reading | at the bottom, in the bar (›) — exactly where you finished reading |
| Control visibility | always | always | always |
| How you can tell the document ended | page counter / name in the document field only | page counter / document name (no progress) | page counter / document name (no progress) |
| Previous document | ⌃ on the first page (top) | ‹ on the first page, or \|< from any page (bottom) | ‹ on the first page, or \|< from any page (bottom) |
| Next document | ⌄ on the last page (top) | › on the last page, or >\| from any page, tooltip names the document (bottom) | › on the last page, or >\| from any page, tooltip names the document (bottom) |
| Score | 2 | 4 | 4 |

Conclusions:

1. **Bottom placement wins — V2 and V3.** The bar sits where the reader finishes the document, so moving on is the shortest path with no change of focus. Since 2026-10-23 neither shows reading progress, so both score 4.
2. **V1 loses the most.** Moving on is only possible from the toolbar at the top, and the vertical ⌄ / ⌃ don't read as "next document". For V1, consider duplicating "next" at the bottom (e.g. a floating › in the bottom-right corner — that is also a navigation panel, not document content).
3. **V2 (new) matches V3's placement.** Page and document buttons sit in the bottom pill where reading ends; like V3 it has no "how much is left" signal.
4. **New (Should fix):** on a document's last page the "next" control should signal that it leads to another document — e.g. a tooltip "Next document: Opening, quorum, and minutes.pdf" instead of "Next page", or an accent state on the button. This is a change in the panel itself, so it respects the constraint. **Status (V3): mostly fixed** — dedicated ‹‹ / ›› buttons with "Next document: <name>" tooltips sit in the bottom bar; the › button on the last page still says "Next page".
5. **New (Should fix):** the "N / 7" counter counts pages across the whole board book, while only one document is on screen. Show the local position too, e.g. "4 / 7 · page 1 of 2".
6. **New (Should fix): Figma mockups.** In the "Navigation" section, page 2 of another document appeared right under the cover. The mockups have been updated to show only the current document.

## Must Fix

1. **V1, mobile: the toolbar breaks.** At 375px the document field shrinks to zero and the page field overlaps it. Tools after "Download" are cut off at the screen edge. Cause: `.docSelectWrap { flex: 0 1 272px; min-width: 0 }` in `BoardBookPageNavViewer.module.css`, and the toolbar has no mobile variant. See `screenshots/review-v1-mobile-375.png`. _Fix: below 768 move the tools into a "⋯" menu, and give the document field a `min-width` (e.g. 120px) or move it to a second row._ **Status: fixed.** Below 768 the tools moved into "⋯", the document field has `min-width: 120px`, and the toolbar uses tighter spacing. See `screenshots/fixed-v1-mobile-375.png`.
2. **Old V2 (removed 2026-10-22): no position indicator.** There is no page number or "N / 7" anywhere. The user only sees the document name (Nielsen heuristic #1, "Visibility of system status"). See `screenshots/review-v2-desktop-1280.png`, `review-v2-tablet-768.png`. _Fix: add an "N / 7" counter between the arrows or in the zoom card._ **Status: fixed.** A floating "[N] / 7" counter with an input field was added at the bottom centre. See `screenshots/fixed-v2-desktop-1280.png`.
3. **Old V2 (removed 2026-10-22): controls hidden until hover.** The palette, zoom and arrows have `opacity: 0` until hover or focus (`.floating` in `BoardBookFilmstripViewer.module.css`). On desktop an open document looks as if it had no tools. See `screenshots/review-v2-desktop-1280.png`. _Fix: show the controls permanently (as V3 already does), or keep at least the arrows and the counter visible._ **Status: fixed.** Hover-hiding was removed; the controls are always visible.
4. **V3, mobile: the bottom bar is cut off.** At 375px "Fit page", "Highlight" and "Comment" are not visible. The bar has `max-width: calc(100% - 32px)` but doesn't wrap or collapse its contents. See `screenshots/review-v3-mobile-375.png`. _Fix: below 768 keep ‹ N / 7 › and zoom, and move "Fit" and annotations into "⋯"._ **Status: fixed.** Below 768 "Fit width / Fit page / Highlight / Comment" moved into a "⋯" menu that opens upward. For this, `ActionMenu` got an optional `placement="top"` prop. See `screenshots/fixed-v3-mobile-375.png`.

## Should Fix

1. **V3: progress shows 100% until the pages have loaded.** **Status: fixed** together with the behaviour change. Progress is now computed across the whole board book (documents before the current one + scroll within it) and recalculated via `ResizeObserver` whenever the content height changes. Original description: `updateProgress` only ran on scroll and on `sheetWidth`/`focus` changes. If page images load late, `scrollHeight == clientHeight` at start and the bar stays full until the first scroll. Reproduced in headless Chrome. See `screenshots/review-v3-desktop-1280.png`, `review-v3-tablet-768.png`. _Fix: recompute progress with a `ResizeObserver` on the page stack in `BoardBookReadingViewer.tsx`._
2. **Inconsistent "next page" semantics.** V1 uses ⌄ / ⌃ (vertical), V2/V3 use ‹ ›, and the hint at the bottom shows ← → everywhere. _Fix: pick one pattern for all versions; for vertical scrolling ⌃ / ⌄ are logical, but then the hint should be ↑ ↓._
3. **V1, mobile: the sheet doesn't fit.** The sheet width is a fixed 635px (`calc(635px * zoom)`), so 375px needs horizontal scrolling. V2/V3 already use `min(635px, 100%)`. See `screenshots/review-v1-mobile-375.png`. _Fix: apply the same `min()` in V1._
4. **The zoom percentage means different things.** V3 on mobile shows "54%" by default (relative to 635px). _Fix: compute the percentage relative to the fitted sheet, or show "Fit" when the sheet is fitted._ **Status (V2): fixed** — the new V2 shows "Fit" when fitted.
5. **V3: the "Focus mode" icon is ambiguous.** The DS `expand` icon (⌃⌄) reads as "expand / collapse". _Fix: use `arrow-resize-diagonal` as in V1/V2, or an icon such as `eye-opened`._ **Status: fixed.** Focus mode now uses `arrow-resize-diagonal` and sits in the bottom bar.
6. **Different tool sets.** V3 has no "Draw", V2 had no page field. This makes the comparison of versions not quite fair. _Fix: align the set of actions before the usability test._
7. **Hardcoded px in inline styles.** `635px`, `960px`, `56px` and the 72px gutters are set in TSX (`style={{ width: … }}`), so stylelint can't see them. This breaks the CLAUDE.md "tokens only" rule. _Fix: move base sizes into module CSS variables or tokens._
8. **Code duplication.** `useMediaQuery`, `FORMAT_ICON` and the `.docSelect*` styles are copied into 3 viewers (the old V2 viewer was deleted on 2026-10-22). _Fix: once a direction is chosen, keep one viewer and move shared parts into `PageStack`/shared._

## Version 2 (new) — re-review 2026-10-22

See `screenshots/review-v2-desktop-1280.png`, `review-v2-tablet-768.png`, `review-v2-mobile-375.png`, `review-v2-mobile-sheet-375.png`. No Must-fix items.

**Should fix**

1. **Tablet portrait (768–1023) still shows both floating cards.** They sit in the 16px gutters beside the sheet and don't cover text, but the phone's labelled "Document tools" sheet would be calmer there. _Fix: use the sheet below 1024px, not only below 768px._
2. **The phone trigger is icon-only (6 dots).** Low-proficiency readers hesitate to open unlabeled menus (study I-08). _Fix: add a text label ("Tools") or use a labelled DS secondary button._
3. **No reading progress (V2 and V3).** The bar shows "N / 7" only, so the end of a document is signalled by the page number alone. _Fix: "page 1 of 2" next to the counter (study R3)._

**Could improve**

1. **Pill buttons are 28px (size S).** Below the 44px touch recommendation on phones. _Suggestion: size M in the pill below 768px._
2. **Three control zones on desktop.** The view card and the palette could merge into one card, or move into the top bar, to approach V3's single bar.

**What works well**

- One bottom pill for page and document stepping, with distinct icons (‹ › pages, |< >| documents) and named tooltips.
- The agenda open beside the document by default — the fastest way to jump to an agenda item.
- The phone "Document tools" sheet: DS bottom Drawer, every row labelled, selected state shown, the sheet closes after a choice.
- Consistent pressed state (hover fill) across the palette, cards and sheet; "Fit" replaces a misleading 100%.

## Could Improve

1. **Touch targets.** 32×32 buttons (DS M) are below the recommended 44×44 on mobile. _Suggestion: size L, or a larger hit area below 768._
2. **Keyboard hint.** It is `aria-hidden`, so screen readers don't announce it, and "← →" means nothing to trackpad and touch users. _Suggestion: hide it on touch devices; for keyboard users add a "Keyboard shortcuts" item to a menu._
3. **Dark mode.** The test page has no theme toggle, so it couldn't be checked. All colours use tokens, so the risk is low. _Suggestion: add a theme toggle to the test page header._
4. **Tabs at 375px** scroll horizontally and "Reports" is cut off. Acceptable for a test page.

## What Works Well

- **Continuous scrolling within a document** (`PageStack`): a document's pages follow each other, the position is derived from scrolling, and navigation scrolls to the target. The reader moves to the next document only through the navigation panel ("next page" on the last page, the document field, the keyboard), as on the platform. This works the same in every version.
- **Real document and content.** The Q4 pack with a matching agenda makes the comparison realistic.
- **The document field** is the same in every version and opens a menu with agenda items and documents. Easy to find.
- **DS discipline in CSS.** Colours, spacing and shadows come from tokens (`--elevation-100` on floating surfaces), `npm run verify` is clean for `src/test-versions`, buttons have `aria-label` and tooltips.
- **V3:** one persistent control zone and a quiet top bar — the best balance of "document in focus / controls at hand".
