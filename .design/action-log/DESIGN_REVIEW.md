# Design Review: Action log tab (Version 1)

- **Reviewed against:** the Figma mockups (Meetings › Action log 33037:404462, group gap 33161:531311, expand icon 33043:18165), the Tasks and Reports responsive patterns (Design system 32455:25282, 33097:14479) and the DS rules in `CLAUDE.md`.
- **Philosophy:** Board DS (Ideals) — a calm, utilitarian table where the list comes first and the details sit in a drawer.
- **Date:** 2026-11-10
- **Page:** `localhost:5173/action-log.html` (tab Version 1), seed data: 5 meetings, 22 actions, 11 users.

> This review covers DS fidelity, layout, responsiveness and heuristics. The persona-based evaluation is in **Usability study** and the 5-lens scoring is in **UX audit** on this page.

## Screenshots Captured

| Screenshot | Breakpoint | Description |
| --- | --- | --- |
| `screenshots/review-desktop-1280.png` | Desktop (1280×800) | Filters inline, all three columns, first two meetings open |
| `screenshots/review-laptop-1024.png` | Laptop / iPad landscape (1024×768) | Columns still fit; the drawer is 360px when open |
| `screenshots/review-tablet-800.png` | iPad portrait (800×1024) | Due date collapses below 960px of pane width |
| `screenshots/review-phone-390.png` | Phone (390×844) | Single-column list, filters fold into a Filters button |

> Screenshots are in `.design/action-log/screenshots/` (headless Chrome). The drawer, the Filters modal and dark mode were checked in the browser but are not in the gallery.

## Summary

The Action log follows the mockups: a toolbar with two multi-select filters, Clear filters and Export, over a table grouped by meeting. Columns collapse by the width of the table pane, not the window, so they also react when the drawer opens. On a phone the table becomes a list with status and owner under the title. All components come from the DS; styles use tokens only; `npm run verify` is clean.

The main gaps are not visual: delete has no confirmation, three meetings share one name, and the owner disappears when the pane narrows.

## Responsive behaviour

Scores 1–5 (5 = best).

| Pane width | What changes | Score |
| --- | --- | --- |
| ≥ 960px | Filters inline; Status, Assignee and Due date columns | 5 — matches the mockup |
| 800–959px | Due date column collapses; filters still inline | 4 — the date is only in the drawer |
| 480–799px | Assignee collapses too; filters fold into a **Filters** button + modal | 3 — the owner is no longer visible |
| < 480px | Full-width list; 'status • assignee' under the title; Export is icon-only | 4 — owner kept, but the due date is not |

Conclusions:

1. **The rule follows the pane, not the window**, so opening the drawer at 1024px collapses columns exactly as a narrower screen would.
2. **Assignee should not disappear** at 480–799px: the phone pattern ('status • assignee' under the title) fits there too.

## Must Fix

1. **Delete has no confirmation or undo.** The trash icon in the drawer footer removes the action at once, on desktop and phone. _Fix: a confirmation modal (a bottom sheet on phone) that names the action, or a Toast with Undo._

## Should Fix

1. **Meeting names repeat.** Three groups are called "Board of Directors / February 2026"; only the count differs. _Fix: show the meeting date in the group row and sort groups by date._
2. **The owner is hidden at 480–799px.** After filtering by assignee on iPad portrait the table no longer shows who owns an action. _Fix: reuse the phone meta line under the title._
3. **Filter values read '2 selected'.** The reader must reopen the dropdown to see what is applied (DS Dropdown limitation). _Fix: show names or +N, or chips under the toolbar._
4. **Mark-done and expand-all are icon-only.** Tooltips need hover, which touch does not have. _Fix: persistent text or a visible state on touch._

## Could Improve

1. **Touch targets.** The mark-done circle is 32×32, below the recommended 44×44 on iPad.
2. **Export feedback.** A CSV downloads silently; a Toast could say how many actions were exported and whether filters applied.
3. **Assignee filter** has 11 names and no search.
4. **Board member view.** The Action log tab there is still an empty state.
5. **Dark mode.** Checked on the table; the drawer and the Filters modal rely on tokens, so the risk is low.

## What Works Well

- **Overdue is never colour alone:** a badge and a red date.
- **Group rows have an 8px gap** and a chevron on the whole row, so the target is large.
- **One interaction pattern:** the row opens the drawer — inline from 1024px, overlay below.
- **The drawer holds the detail:** per-assignee completion ('Completed N/M'), Choose user, due date, linked to, description and attachments.
- **DS discipline:** tokens only, no inline SVGs, tertiary icon buttons separated by 2px, `npm run verify` is clean.
