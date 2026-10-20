# Feature Value Check (Full): "Show documents only" toggle in the Board Book agenda panel

| | |
|---|---|
| **Idea** | A DS Toggle "Show documents only" in the header of the Board Book viewer's agenda (table of contents) panel. Off: the full agenda outline (time, duration, presenter, description, motions, documents, links). On: a flat list of every document and link in agenda order, with the same row actions. |
| **Origin** | Internal idea: Yaroslav (senior designer), developed by Elena |
| **Date** | 2026-10-19 |
| **Depth** | **Full check.** Grilled Elena (5 questions); reviewed the prototype and code; searched Slack (#board-feedback-all, #board-product-*, DMs), the Ideals Board Help Center and 9 competitor portals. Re-runs the Quick check in `FEATURE_VALUE_CHECK.md`. |
| **Personas (locked roster)** | James Whitfield (Core), Rosa Almeida (Core), Eleanor Whitcomb (stress test), Margaret Chen (Secondary) |
| **Sources used** | Prototype `board-book-page-nav.html?tab=doc-toggle`; `BoardBookReadingViewer.tsx`, `BoardBookDocToggleViewer.tsx`; `DESIGN_REVIEW.md`, `usability-study.json`, `ux-audit.json`; Slack threads and Jira IBP-19546 (via Slack); help.idealsboard.com; competitor help pages and reviews |
| **Not used** | Microsoft Clarity, Zenlytic, NPS/CSAT. Asked at Step 3.5; Elena couldn't provide them. |
| **Snapshot flag** | **Synthetic.** It came from grilling Elena, and every answer matched the recommended default. |

---

## 1. Verdict

**Park. FVS 36 / 100, confidence medium.** The full check made the case weaker, not stronger. Production already shows this exact agenda panel. No director, customer or CS rep in Slack has asked for a documents-only view. The one director-side signal we found (CML) asks for a *tighter* link between agenda items and documents, the opposite of hiding the agenda. Every competitor reviewed builds the reader around the agenda. Readers also already have three ways to get past the panel: the document dropdown, ‹ › and hiding the panel. The noise that customers *did* complain about (agenda item times) has already been fixed by removing the data (IBP-19546), not by adding a mode. That is the pattern to repeat.

**Compared with the Quick check (FVS 37, confidence low):** the score is about the same, but confidence rose. We looked for signal and found none for the core claim, plus some counter-signal.

---

## 2. Problem Snapshot

| | | Source |
|---|---|---|
| **Problem** | The Board Book agenda panel repeats most of the Agenda tab (time, presenter, description, motions), so documents get lost among text blocks. | (grill), E0 |
| **JTBD** | When I prepare for a meeting in the Board Book, I want to find and open the next document I need, so I can finish my pre-reading without re-reading the agenda. | (grill) |
| **Who** | Board members: James and Rosa (Core), Eleanor (stress test). Margaret is secondary, when she previews the pack. | (grill) |
| **Trigger** | The Board Book navigation redesign (V3 won), which is redoing the agenda panel too. It's a convenient moment to simplify it. | (grill) |
| **Current state** | Production already has the full outline in the panel, like the prototype. No complaints from directors are known. The panel can be hidden, and documents are reachable from it, from the document dropdown and with ‹ ›. | (grill); Help Center "Board book overview" |
| **Desired outcome** | Less scanning and scrolling to reach a document from the panel, without losing what each document is for. | (synthetic) |
| **Constraints / non-goals** | Continuous scroll stops at each document's end, so the panel is one of only three ways to move between documents and can't get harder to scan. Effort is unknown (ask the tech lead). Non-goal: removing agenda information from the Board Book. | Platform constraint; (grill) |

**Solution-first check.** "Add a toggle" is one of at least five ways to cut panel noise (see section 6). It's also the only one that adds a hidden mode and splits documents from their agenda context.

---

## 3. Persona fit

| Persona | Relevance | How often they hit the problem | Pain today (1–5) | Linked disengage trigger? | Could the feature *hurt* them? |
|---|---|---|---|---|---|
| **James Whitfield**, independent director on 3 boards; iPad for deep reading | **Core** | ~30 meetings a year, 100+ pre-read pages a cycle | 2–3. Long outlines on big packs mean scrolling, but he reads in order with ‹ › and jumps with the dropdown. | ">2 taps to my pack": not triggered today. The dropdown is 2 taps. | **Low.** He'd benefit the most. Risk: the panel looks different across his 3 boards if the state persists per board. |
| **Rosa Almeida**, first-year member, mobile-first | **Core** | 4–6 meetings a year, 15–30 pages; short outlines | 1–2. Her packs are short, and the descriptions and motions are what tell her what's asked of her. | "Didn't know it was required": **a risk if the toggle is on.** The flat list hides item titles and motions. | **Medium.** She loses decision context, and a toggle is a hidden mode she's unlikely to discover or remember. |
| **Eleanor Whitcomb**, long-serving chair; text scaling, tremor, prints packs | **Stress test** | ~16 meetings a year, 80–150 pages | 3. At 200% text the outline gets very long. | "The tool, not me, is wrong": low | **Low.** The DS Toggle has a visible label. Check the target size at text scaling and that the state is announced to screen readers. |
| **Margaret Chen**, Corporate Secretary, previews packs | **Secondary** | 4–8 meetings a quarter, 50–200 documents a cycle | 2 | "Zero surprises for directors": directors seeing different panels complicates support ("I don't see the motion"). | **Low.** She'll ask whether she can set the default per board. |

---

## 4. Evidence

| Claim | Source | E-level |
|---|---|---|
| The agenda panel is noisy and directors mainly want the documents | Yaroslav and Elena (internal) | **E0** |
| Production already shows the full outline in the Board Book panel; no complaints from directors known | Elena (grill); Help Center: "The board book opens and contains a list of agenda items" ([Board book overview](https://help.idealsboard.com/en/articles/11887911-board-book-overview)) | E0 (absence of signal) |
| No Slack mention of a documents-only view, a noisy agenda panel, or directors struggling to find documents in the Board Book | Slack search: "board book" + agenda, "table of contents", #board-feedback-all, 2025–2026 | Absence of signal (searched) |
| **Agenda metadata is noise for some customers:** at least 4–5 customers (latest Madison County) asked to remove agenda item times. Resolved by IBP-19546: no timing, and timing also removed from minutes and the Board Book. | #board-feedback-all, Sofia Cortina, 24 Jun 2025; Madison County renewal, 22 May 2026; Louis Smith DM, 22 Jul 2026 | **E2**, but *adjacent*: secretaries, about printed agendas. Already acted on. |
| **The agenda ↔ document link is valued:** CML (Board Ambassador) wants agenda links to open the exact Board Book item. Louis: "we will be adjusting this soon in our redesign". | #board-feedback-all, David Moth, 12 Mar 2026 | **E1**, *counter-signal* (wants agenda and documents tied closer, not separated) |
| **Distraction-free reading is wanted:** a prospect asked for an option to hide public annotations "so there are no distractions when viewing" | #board-feedback-all, Shajed Rahman, 19 Dec 2025 | E1, *adjacent* (about annotations, not the agenda) |
| Madison County: "Board book works great for them" | #board-feedback-all, 22 May 2026 | E1, *counter-signal* |
| Every competitor reviewed puts the agenda (with documents nested under it) in the reader | OnBoard ([Open Book](https://help.passageways.com/hc/en-us/articles/43812174069901), [meeting book navigation](https://help.passageways.com/hc/en-us/articles/360046235791)), Ansarada ([board reading](https://help.ansarada.com/en/articles/5375329-board-reading-agenda-documents)), Boardlogic ([document viewer](https://support-boardlogic.formidium.com/en/support/solutions/articles/75000003141-using-the-document-viewer)), BoardEffect ([Bowdoin guide](https://bowdoin.teamdynamix.com/TDClient/1814/Portal/KB/Article/38677/Prepare-Board-Meeting-Materials-in-BoardEffect)), Diligent ([U of T quickstart](https://governingcouncil.utoronto.ca/media/6739)) | Desk research |
| No competitor has a reader-side "documents only" toggle in the sources found. Nasdaq Boardvantage, Azeus Convene and Boardable docs showed nothing either way. | Same, plus [Boardvantage fact sheet](https://events.irmagazine.com/csforumus/wp-content/uploads/sites/106/2021/10/nasdaq_document-5_NBV-Fact-Sheet_3.16.20.pdf), [Convene brochure](https://cdn.azeusconvene.com/wp-content/uploads/brochures/AU-Convene-Brochure.pdf) | Desk research (absence ≠ proof) |
| Simulated readers jump to an item's documents from the panel or the dropdown; V3's closed panel costs one extra step | `usability-study.json` US04 | E0 (simulated) |

**Overall evidence for the core claim: E0.** Adjacent signals are E1–E2. They point to cutting *specific* metadata and keeping documents tied to agenda items, not to a documents-only mode.

---

## 5. Alternatives and competitors

### Current workarounds (V3 and production)

| Workaround | Covers the job? | Where it fails |
|---|---|---|
| **Document dropdown** (top bar) | Yes. It already is a documents list grouped by agenda item, one click away. | Gives no persistent overview while reading |
| **‹ › bottom bar** | Yes, for linear pre-reading, the main path | Can't jump |
| **Hide the panel** (production and V3) | Removes the noise entirely | Loses the overview |
| **Scroll the outline** | Works | Friction on large packs and at text scaling |

### Cheaper or better fixes, best first

1. **Cut metadata that readers don't need in the panel, like IBP-19546 did.** Drop time and duration (already gone for 0-duration items) and presenter avatars. Clamp descriptions to 2 lines with "Show more". Shrink motions to one line plus a status badge. This uses proven precedent and adds no new mode.
2. **A condensed outline by default.** Item number and title plus documents, with description and motions behind a per-item "Details". Grouping stays, and Rosa still has context one tap away.
3. **Agenda ↔ document anchoring (CML).** Selecting an item scrolls the panel and opens its first document, and the open document's item stays highlighted. This addresses the one real director request found.
4. **If a documents-only list survives:** keep item numbers and titles as group labels, and rename the header so it doesn't still say "Agenda".

### Competitors

| Product | Reader TOC | Status for this feature |
|---|---|---|
| OnBoard | Agenda left, compiled book right ("Open Book") | Agenda-structured is table stakes |
| Ansarada | Coloured tabs per agenda item plus a progress bar | Agenda-structured |
| Boardlogic, BoardDocs | Agenda items with linked files in the left column | Agenda-structured |
| BoardEffect | Agenda categories with files; the admin can hide file names | Admin setting, the opposite direction |
| Diligent | Book sections plus "View Agenda" | Agenda-structured |
| Boardvantage, Convene, Boardable | Nothing found either way | Unknown |
| **Reader "documents only" toggle** | Not found anywhere | Not a table-stakes gap, so leaving it out costs nothing competitively |

---

## 6. FVS: Feature Value Score

This scores **the problem** ("directors find documents hard to spot in the dense agenda panel"), not the toggle.

| # | Dimension | Score | Evidence | Weight | Weighted |
|---|---|---|---|---|---|
| V1 | Problem severity | **35** | Friction, not failure. The full panel is already in production with no director complaints found, and Madison says the Board Book "works great". Worst at big packs and text scaling. | 25% | 8.75 |
| V2 | Reach × frequency | **55** | Every director reads every pack, but panel usage frequency is unknown (no Clarity) | 20% | 11.0 |
| V3 | Evidence strength | **20** | E0 for the core claim. Adjacent E1–E2 signals exist, but they are about printed agendas (already fixed) or point the other way (CML). | 20% | 4.0 |
| V4 | Strategic fit | **45** | Helps board-member consumption, but separating documents from agenda items works against "understand what you approve". All competitors keep them together. | 20% | 9.0 |
| V5 | Alternative gap | **20** | Dropdown, ‹ › and hiding the panel already cover it; cheaper metadata cuts exist; no competitor gap | 15% | 3.0 |
| | **FVS** | | | | **≈ 36** |

- **Band:** 35–49, **Park**. It sits at the bottom edge, next to "Don't build".
- **Evidence cap:** applies (E0). The verdict couldn't go above "Validate first" anyway.
- **Effort:** Unknown, ask the tech lead (Elena confirmed it hasn't been estimated).
- **Persona harm risk:** **Medium for Rosa (Core)** without item group labels; Low with them. No harm override needed, because the verdict is already Park.

---

## 7. Risks and kill criteria

| Risk | What could go wrong |
|---|---|
| **Value** | Directors keep reading with ‹ › and jumping with the dropdown, so the toggle is rarely turned on and becomes permanent header chrome. Production has had the full outline without director complaints. |
| **Usability** | It's a hidden mode: users forget it's on, then "can't find the motions". The flat list breaks the document-to-decision link (Rosa). In docs-only mode the header still says "Agenda". Two panel shapes make support harder (Margaret). |
| **Feasibility** | Unknown. Open questions: is the state per user, per board or per session? Does it ship on the iPad and mobile apps too? |
| **Viability** | Low. Data is hidden, not removed. Watch for "I didn't see the motion" after a vote. |

**Kill criteria (any one stops the toggle):**
- Fewer than 3 of 5 directors describe the panel as getting in the way of finding documents, unprompted.
- Metadata cuts (alternative 1) or the condensed outline (alternative 2) match the toggle on time-to-document in a prototype test.
- If shipped behind a flag: under 10% of panel-opening director sessions turn it on within 4 weeks.

---

## 8. Validation plan

Cheapest first. Thresholds are set before running.

| # | Test | Who / time | Pass threshold |
|---|---|---|---|
| 1 | **Ship alternative 1 (metadata cuts) as part of the V3 redesign** and treat it as the baseline. No new mode is needed to do this. | Elena, plus the dev team's estimate | n/a. This is the default move. |
| 2 | **5 short director interviews** (Board Ambassador accounts such as CML; at least 2 with large packs and 1 iPad-first). Ask how they move through a pack and what they use the panel for. Don't show the toggle first. | Elena with CS (David Moth / Louis); about 1 week | At least 4 of 5 say, unprompted, that agenda detail in the panel gets in the way. Otherwise close the idea. |
| 3 | **Prototype A/B** on a large pack (25+ documents). A = condensed outline with metadata cuts. B = full outline plus the toggle. Tasks: open the audit committee report; say which motion the cash-flow forecast supports; continue to the next document. | Elena; 1–2 weeks; 8–10 participants | B must beat A on time-to-document by at least 20% **and** not lose on the motion-context task. Otherwise ship A. |
| 4 | **Clarity baseline** before deciding: panel open rate, panel scroll depth, and clicks from panel vs dropdown vs ‹ › for board-member roles | Product analytics; 2 weeks | If the panel is used in under 20% of director Board Book sessions, close the idea. Whatever happens in the panel matters little. |
| 5 | *(If the toggle goes ahead)* `board-usability-audit` from Rosa's and Eleanor's perspectives | Claude; under 1 day | ESQ at least 70 for both |

This Problem Snapshot can serve as the **Intent Snapshot** for a later `board-ux-audit`. The thresholds in tests 3–4 become its success criteria.

---

## 9. Data gaps

- **Microsoft Clarity:** Board Book panel usage by board members. Asked at Step 3.5; Elena couldn't provide it.
- **Zenlytic:** not available. Asked at Step 3.5. Paste-ready questions for Zoë:
  - "In demo calls from the last 12 months, how often do prospects mention the board book table of contents, agenda panel, or finding documents in the board book? Quote examples."
  - "In production audit logs, what share of board-book document opens come from the table of contents vs the document dropdown vs next/previous page?"
- **NPS/CSAT verbatims:** not available. Asked at Step 3.5.
- **Production pack sizes:** median and 90th-percentile documents per pack. The toggle's value grows with pack size, and the only real signal is one account with 600+ page books (Slack, Jan 2026).
- **Jira:** only seen through Slack (IBP-19546). The Jira backlog wasn't searched directly for related tickets.
- **Figma:** node 32114-124875 not inspected (Figma connector not authorised).
- **Competitors:** Boardvantage, Convene and Boardable reader TOCs couldn't be confirmed from public docs.
