# Feature Value Check: "Show documents only" toggle in the Board Book agenda panel

| | |
|---|---|
| **Idea** | A DS Toggle "Show documents only" in the header of the Board Book viewer's agenda (table of contents) panel. Off: the full agenda outline (time, duration, presenter, description, motions, documents, links). On: a flat list of every document and link in agenda order, with the same rows and row actions. |
| **Origin** | Internal idea (Yaroslav, senior designer), developed by Elena |
| **Date** | 2026-10-19 |
| **Depth** | Quick check: prototype and code review, the existing design review, usability study and UX audit, and desk research on competitors. No Clarity, Zenlytic, CS or NPS data. |
| **Personas (locked roster)** | James Whitfield (Core), Rosa Almeida (Core), Eleanor Whitcomb (stress test), Margaret Chen (Secondary) |
| **Sources used** | Prototype `board-book-page-nav.html?tab=doc-toggle`; `BoardBookReadingViewer.tsx` (`documentsToggle`) and `TocPanel` / `DocRows` in `BoardBookDocToggleViewer.tsx`; `q4BoardPack.ts`; `DESIGN_REVIEW.md`, `usability-study.json`, `ux-audit.json`; web search (Diligent, OnBoard, BoardEffect). The Figma node was not opened because the Figma connector isn't authorised in this session. |
| **Snapshot flag** | **Synthetic.** It was built from the designer's rationale and the persona file. Nobody grilled real users. |

---

## 1. Verdict

**Park the toggle. FVS 37 / 100, confidence low.** The problem behind the idea is plausible: the agenda panel is long and repeats the Agenda tab, so documents are hard to spot. But the only evidence is an internal opinion (E0). Readers can already get a document-only list from V3's document dropdown. And a cheaper fix would solve most of the noise without adding a mode: a condensed default outline, with descriptions and motions collapsed and documents always visible. Validate the problem with directors first. If it is confirmed, test the condensed outline against the toggle before building either one.

---

## 2. Problem Snapshot

| | | Source |
|---|---|---|
| **Problem** | The Board Book's agenda panel repeats most of what the Agenda tab already shows (time, presenter, description, motions). The documents, which are what directors came to read, sit between long text blocks, which adds visual noise and scrolling. | Designer rationale (E0) |
| **JTBD** | When I prepare for a meeting in the Board Book, I want to find and open the next document I need to read, so I can finish my pre-reading quickly without re-reading the agenda. | Synthetic, from the persona file |
| **Who** | Board members (James, Rosa, Eleanor), who consume the pack. Secretaries (Margaret) preview it before distribution. | Persona roster |
| **Trigger** | The Board Book navigation redesign (V1/V2/V3). V3 won, and the agenda panel is being redesigned along with it. | Chat context, DESIGN_REVIEW.md |
| **Current workaround** | (a) The V3 document dropdown in the top bar lists the documents. (b) ‹ › in the bottom bar steps through the pack in order. (c) Users scroll the outline. (d) In V3 the panel is closed by default, so the noise only appears when the reader opens it. | Prototype, DESIGN_REVIEW.md |
| **Desired outcome** | Less time and scrolling to reach a given document from the panel. Readers don't lose agenda context (what a document is for, what will be voted on). | Synthetic |
| **Constraints / non-goals** | Continuous scroll stops at each document's end, so moving between documents happens only through the viewer's panels. The panel is one of those panels, so it can't become harder to scan. Non-goal: removing agenda information from the Board Book entirely. | Platform constraint |

**Solution-first check.** The request names a solution (a toggle). The underlying problem is that documents are hard to scan in a dense outline. A toggle is one of at least four ways to solve it (see section 6), and it is the only one that adds a hidden mode.

---

## 3. Persona fit

| Persona | Relevance | How often they hit the problem | Pain today (1–5) | Linked disengage trigger? | Could the feature *hurt* them? |
|---|---|---|---|---|---|
| **James Whitfield**, independent director on 3 boards, reads deeply on iPad | **Core** | ~30 meetings a year, 100+ pre-read pages a cycle; uses the panel every cycle | 3. With many items, scrolling past descriptions to reach documents is real friction. | "More than 2 taps to my pack": partly. The toggle adds a tap, and the dropdown already gets him there in 2. | **Low.** He benefits the most. Risk: the panel has a different shape on each of his 3 boards if one board leaves the toggle on. |
| **Rosa Almeida**, first-year member, mobile-first | **Core** | 4–6 meetings a year, 15–30 pages | 2. Short packs, so the outline isn't long. She *needs* descriptions and motions to understand what's asked of her. | "Didn't know it was required": **yes, as a risk.** The flat list drops item titles and motions, so she loses the link between a document and the decision it supports. | **Medium.** Turning the toggle on hides the context she relies on. A toggle is also a hidden mode she probably won't discover. |
| **Eleanor Whitcomb**, long-serving chair; text scaling, tremor, prints packs | **Stress test** | ~16 meetings a year, 80–150 pages | 3. At 200% text scaling the outline gets very long, so a shorter list helps. | "The tool, not me, is wrong": low. | **Low.** The DS Toggle has a text label (good). Check the target size at text scaling, and that the state is announced to screen readers. |
| **Margaret Chen**, Corporate Secretary, previews packs | **Secondary** | 4–8 meetings a quarter, 50–200 documents a cycle | 2. She checks agenda and documents together; the outline is useful to her. | "Zero surprises for directors": a per-user toggle means directors see different panels, which makes support harder ("I don't see the motion"). | **Low.** She'd ask whether the toggle state persists and whether she can set a default. |

Not included: Patricia and David. They are secretaries focused on assembling and publishing the pack. This feature lives in the board-member reading view.

> Note: the earlier usability study used "Robert Hale (Director)", who is not in the locked roster. Here his role maps to **James Whitfield**, the same iPad pre-reading use case.

---

## 4. Evidence

| Claim | Source | E-level |
|---|---|---|
| The panel repeats the Agenda tab and adds noise | Designer rationale (Yaroslav, Elena) | **E0** |
| Board members open the Board Book mainly to review documents, not to re-read the agenda | Designer rationale; plausible from the persona file (James: "what needs a decision fast") | **E0** |
| The outline is long: each item has a description (up to ~600 characters in the Q4 pack, collapsed to 120), motions and progress, then documents | Prototype `TocPanel` / `q4BoardPack.ts` | Observed in the prototype (not user behaviour) |
| Readers jump to an agenda item's documents through the panel or the dropdown. In V3 the panel is closed by default, so Margaret used the dropdown (one extra step). | `usability-study.json` US04 (synthetic) | **E0** (simulated) |
| V3 already has a document dropdown listing every document by agenda item | DESIGN_REVIEW.md ("What works well"), prototype | Observed in the prototype |
| Competitors build the reader view around the agenda. OnBoard "Open Book" shows the agenda on the left and the compiled book on the right. | [OnBoard Member/Director Training Guide](https://help.passageways.com/hc/en-us/articles/43812174069901) | Desk research |
| BoardEffect lets the admin hide file names on the agenda, which is the opposite direction: a titles-only agenda | [Bowdoin BoardEffect guide](https://bowdoin.teamdynamix.com/TDClient/1814/Portal/KB/Article/38677/Prepare-Board-Meeting-Materials-in-BoardEffect) | Desk research |
| Diligent reviewers mention navigation between sections as an area to improve | [GetApp: Diligent Boards features](https://www.getapp.com/collaboration-software/a/diligent-boards/features/) | E1 (aggregated reviews, not specific to this need) |
| No competitor shows a reader-side "documents only" toggle in the sources found | Web search; not finding it doesn't prove it's absent | Desk research |

**Overall evidence: E0.** The problem has no behavioural, customer or commercial signal yet.

---

## 5. Alternatives and competitors

### What readers do today (in the V3 prototype)

| Workaround | How well it covers the job | How badly it fails |
|---|---|---|
| **Document dropdown** in the top bar | It already is a "documents only" list, grouped by agenda item, always one click away | Barely: it covers navigation. It doesn't give a persistent overview while reading. |
| **‹ › in the bottom bar** | Linear reading in pack order, which is the dominant pre-reading path | Not at all for linear reading. It can't jump. |
| **Scrolling the outline** | Works, but costs scrolling on long packs | Mild friction, worst for James (big packs) and Eleanor (text scaling) |
| **Keeping the panel closed** (V3 default) | Removes the noise entirely | Loses the overview |

### Cheaper or better fixes for the same problem

1. **A condensed outline by default.** Show item number, title and documents. Put description, motions, time and presenter behind "Details" per item, or behind one "Show details" control. This removes most of the noise without adding a mode, and the grouping stays. **This is the main alternative to test.**
2. **Clamp descriptions to 2 lines** and show motions as one line with a badge. A CSS and copy change that's close to free, and it cuts the panel height.
3. **Show item headers in the documents-only list.** If the toggle survives, the flat list should keep `1. Opening, quorum, and minutes` as a small group label. Without it, directors lose which decision a document supports.
4. **Make the dropdown the "documents" view** and let the panel stay the "agenda" view. The two existing controls then each have a clear job.

### Competitors

| Product | What they show | Status |
|---|---|---|
| OnBoard | Agenda beside the compiled book ("Open Book") | Agenda-structured TOC is table stakes |
| BoardEffect | Agenda with categories and files; the admin can hide file names | An admin-level setting, not a reader toggle |
| Diligent | A book with sections and a "View Agenda" link | Agenda-structured |
| A reader-side "documents only" toggle | Not found | Nobody seems to have it. It's not a table-stakes gap, so leaving it out costs nothing in competitive terms. |

---

## 6. FVS: Feature Value Score

This scores **the problem** ("documents are hard to scan in a dense agenda panel"), not the toggle.

| # | Dimension | Score | Evidence | Weight | Weighted |
|---|---|---|---|---|---|
| V1 | Problem severity | **40** | Friction, not failure. No disengage trigger fires. V3 keeps the panel closed by default, and the dropdown is a working path. Worst for big packs and text scaling. | 25% | 10.0 |
| V2 | Reach × frequency | **55** | Every board member reads every pack, but nobody knows how often the panel is opened in V3 (closed by default). | 20% | 11.0 |
| V3 | Evidence strength | **10** | E0: internal opinion only | 20% | 2.0 |
| V4 | Strategic fit | **50** | Supports board-member consumption (positive). Hiding motions and item context works against "know what you're approving", which is core governance value. | 20% | 10.0 |
| V5 | Alternative gap | **25** | The dropdown already covers document-only navigation, cheaper fixes exist, and no competitor gap exists | 15% | 3.75 |
| | **FVS** | | | | **≈ 37** |

- **Band:** 35–49, **Park**.
- **Evidence cap:** E0. Even with a higher score, the verdict couldn't go above "Validate first".
- **Effort:** Unknown, ask the tech lead. Front-end only in the prototype. Persisting the state per user, and any admin default, would add backend work.
- **Persona harm risk:** **Low–Medium.** Medium for Rosa, who loses agenda context in docs-only mode. Low with mitigation (item headers in the flat list). Rosa is Core, so the mitigation should be in place before anything ships.

---

## 7. Risks and kill criteria

| Risk | What could go wrong |
|---|---|
| **Value** | Directors read linearly with ‹ › and use the dropdown for jumps, so the toggle is rarely turned on. A toggle that's left off is just more header chrome. |
| **Usability** | It's a hidden mode: users who turn it on forget it and later "can't find the motions". The flat list has no item labels, so the document-to-decision link is lost (Rosa). The panel ends up with two shapes, and support has to ask which one the user sees (Margaret). In docs-only mode the header still says "Agenda", which mismatches the content. |
| **Feasibility** | Unknown, ask engineering. Open question: does the state persist per user, per board, or per session? (In the prototype it resets on reload.) |
| **Viability** | Low risk. Agenda data isn't removed, only hidden. Watch for a director saying "I didn't see the motion" after approving something. |

**Kill criteria (any one stops the toggle):**
- In interviews, fewer than 3 of 5 directors describe the panel as noisy, or as getting in the way of finding documents, without being prompted.
- In a prototype test, the condensed outline (alternative 1) reaches the same or better time-to-document and preference as the toggle.
- If shipped behind a flag: under 10% of board-member sessions that open the panel turn the toggle on in the first 4 weeks.

---

## 8. Validation plan

The cheapest test that could change the decision comes first.

| # | Test | Who / time | Pass threshold (set before running) |
|---|---|---|---|
| 1 | **5 short director interviews** (two with very large packs, one with text scaling or iPad use). Ask how they move through a pack and what they use the agenda panel for. Don't show the toggle first. | Elena + CS to recruit. About 1 week. | At least 4 of 5 describe the panel's agenda detail as getting in the way of finding documents, unprompted. Otherwise stop. |
| 2 | **Prototype A/B (unmoderated, Maze/Lyssna or moderated).** A = condensed outline by default. B = the current outline with the "Show documents only" toggle. Use a big pack (25+ documents, not the 6-document Q4 pack). Tasks: open the audit committee report; find which motion the cash-flow forecast supports; continue to the next document. | Elena, 1–2 weeks, 8–10 participants | The toggle earns its place only if B beats A on time-to-document by at least 20% **and** doesn't lose on the motion-context task. Otherwise ship A. |
| 3 | **`board-usability-audit`** on the winning variant, from the Rosa and Eleanor perspectives (text scaling, discoverability, screen-reader state) | Claude, under 1 day | ESQ at least 70 for both |
| 4 | *(If shipped)* **Clarity smart event** on the toggle, and on panel open, for board-member roles | Product analytics, 4 weeks | At least 10% of panel-opening sessions use the toggle, and 25% or more of those keep it on |

The Problem Snapshot above can be the **Intent Snapshot** for a later `board-ux-audit`. The thresholds in tests 2 and 4 become its success criteria.

---

## 9. Data gaps

- **Clarity:** how often board members open the agenda panel in the Board Book, how far they scroll it, and dropdown vs panel vs ‹ › usage. Not available in this session.
- **Customer voice:** no CS tickets, NPS verbatims or interview notes about agenda-panel noise.
- **Zenlytic:** no demo-call mentions checked. Paste-ready questions for Zoë:
  - "In demo calls from the last 12 months, how often do prospects mention the board book table of contents, agenda panel, or finding documents in the board book? Quote examples."
  - "In production audit logs, what share of board-book document opens come from the table of contents vs the document dropdown vs next/previous page?"
- **Real pack sizes:** the Q4 test pack has 5 items and 6 documents. The value of the toggle grows with pack size, so we need the median and 90th-percentile documents per pack from production.
- **Figma:** node 32114-124875 wasn't inspected (Figma connector not authorised). The review relied on the coded prototype.
- **Step 3.5 (data request):** not asked interactively, because this check ran as a delegated session. The gaps above are the request: Clarity access, CS or NPS exports, and production pack-size statistics would let this be re-scored.

---

**Next steps offered:** a validation-plan checklist via `brief-to-tasks`; a quick prototype of the condensed outline (alternative 1) as a fourth tab, for test 2; a re-score once Clarity or interview data arrives.
