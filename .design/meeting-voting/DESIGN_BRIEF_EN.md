# Meeting Voting (Motions) — Design Review & Brief

**Source:** Figma › Meetings › section "Voting" (`18636:58546`) — [open in Figma](https://www.figma.com/design/8I0d6Pc5e5yvKW2Fxhgdrx/Meetings?node-id=18636-58546)
**Date:** 2026-10-13
**Scope:** 6 flows, ~25 screens: Add motion in meeting minutes · Start voting · Vote in progress (edit results) · Delete / Reset · Copy results and paste to TinyMCE · CS vote
**Language versions:** this file (EN) and `DESIGN_BRIEF_UK.md` (UK) have identical content.

---

## 1. Summary

The flow covers the core job well: a secretary can attach a motion to an agenda item, record proposer/seconder, run a vote, watch progress against a majority line, and drop the result into the minutes. The drawer pattern is consistent with the rest of the Minutes tab and the status badges map cleanly onto the agenda list.

The main risks are not visual — they're **trust and record accuracy**. Board minutes are a legal record, and the current mockups let the record diverge from reality in several places:

| # | Top issue | Severity |
|---|-----------|----------|
| 1 | Pasted minutes text names a different seconder (Sophia Anson) than the motion (Alexander Anderson) — and outputs "Result: All for" instead of a recorded tally | Critical |
| 2 | "All for" records a *For* vote for members who declined (RSVP ✕) or never answered | Critical |
| 3 | No defined outcome: "Completed" doesn't say whether the motion **carried** or **failed**; majority basis (present / eligible / cast) is undefined | High |
| 4 | Vote vocabulary is inconsistent across 5 places (For / Vote for / Against / Vote against / Abstain / You abstained) | High |
| 5 | Participant (CS vote) pop-over shows a different agenda item (item 2) than the motion that's actually in progress (item 1) | High |
| 6 | A new, empty motion shows the status "In progress" | Medium |
| 7 | Typo in Reset modal: "Rest vote?" | Medium |

---

## 2. Findings by flow

Severity: **Critical** = wrong legal record / data loss · **High** = users likely to make a mistake · **Medium** = friction or confusion · **Low** = polish.

### 2.1 Add motion in meeting minutes

| Screen | Finding | Severity | Recommendation |
|---|---|---|---|
| Enter point | "Add motion" and "Add draft action" are hidden behind a `···` that only appears on hover per agenda item. Discoverable once learned, but the first motion is hard to find. | Low | Keep the menu; also add an inline text button "Add motion" under items with no motion while the meeting is live. |
| Empty fields | Title placeholder "Add motion title" is rendered as the drawer heading in grey — reads as a heading, not an editable field. | Medium | Use a real TextArea labelled **Motion** with placeholder "e.g. I move to approve the minutes of…". Drawer heading = "New motion". |
| Empty fields | Badge says **In progress** for a motion that has no content and no vote. | Medium | New motions are **Draft** (neutral). Status lifecycle — see §4.4. |
| Empty fields | Footer has only Delete; no Save / Cancel. Unclear when the motion is created and whether closing discards it. | High | Footer: primary **Save motion**, secondary **Cancel**. Autosave is fine too, but show it (DS `Autosave`). |
| Select seconder | Dropdown contains **Christopher Lee twice** with no differentiator. | Medium | Show role/email as a second line when names collide. |
| Select seconder | The candidate list (Alexander Anderson, Bella Martinez, Christopher Lee) is not the same set as the voter list below — seconder may be someone not present. | High | Restrict proposer/seconder to members marked present (or warn: "Alexander Anderson isn't marked as present."). Block proposer = seconder. |
| With value / New motion | Default motion text "Approve the proposed action related to this agenda item" ends up as the real motion and later as the RESOLVED line. Generic placeholder text leaks into the legal record. | High | Don't prefill; or prefill from agenda item title ("Approve the minutes of the previous meeting") and visibly mark as editable. |
| All | Header shows **March 2026**, minutes document shows **March 2024**. | Low (mock data) | Align mock data before user testing — testers anchor on it. |

### 2.2 Start voting

| Screen | Finding | Severity | Recommendation |
|---|---|---|---|
| Not started | Two adjacent secondary buttons **All for** and **Start vote** carry very different consequences (instant result vs. open a live vote) yet look identical. | High | Primary **Start vote**; move unanimous recording into a secondary/overflow action **Record unanimous vote…** with a confirmation that lists who will be recorded. |
| Not started | "Not started" uses the yellow (warning) badge — reads as "something is wrong". | Low | Neutral badge for Draft/Not started; yellow only for attention states. |
| Not started | RSVP column icons (✕, person, ?, camera) have no legend or tooltip. | Medium | Tooltip on each icon: "Declined", "Attending in person", "No response", "Attending remotely". |
| In progress | Counter **0/10** — but only 9 people visible in the list, and it's unclear what 10 means. | Medium | Label it: "0 of 10 voted". Make sure the denominator matches the eligible voter list. |
| In progress | **Colin Thompson (Secretary)** is in the voter list. Secretaries usually don't vote. | Medium | Exclude non-voting roles by default; show them greyed with "Non-voting". Confirm with PM (§6). |
| In progress | Member with RSVP **Declined** (Brian Rubinstein) can be assigned a vote. | High | Absent members default to **Absent** (not counted), editable only with an explicit action. |

### 2.3 Vote in progress (edit results)

| Screen | Finding | Severity | Recommendation |
|---|---|---|---|
| Edit | Vote menu offers **Pending / Vote for / Vote against / Abstain**, but the cell shows **Against**, and the legend shows **Against**. "Pending" as an option means "clear vote" but reads as a status. | High | One vocabulary everywhere: **For · Against · Abstain · Not voted**. Menu option to clear = "Clear vote". |
| Edit | Hover (lavender) and selected (green) states in the menu look like two selections. | Low | Use DS Dropdown selected state (check icon) + standard hover. |
| Voting progress | Legend "Abstain(2)" — missing space; "Vote for (6)" vs "Against (1)" — mixed prefixes. | Low | "For 6 · Against 1 · Abstain 2". |
| Voting progress | Bar order is For → Abstain → Against; legend order matches, but conventional reading order is For → Against → Abstain. | Low | For → Against → Abstain, remaining = not voted. |
| Voting progress | "Majority" marker sits at 60% (6/10) with no explanation of the rule. With 6 For of 10, is the motion carried? Of votes cast or of eligible? | High | Tooltip on marker: "Simple majority of eligible voters: 6 of 10". Show live projection: "Passing — 6 For needed, 6 reached". |
| Voting progress | Name truncation "Colin Thompson (Se…" appears only once the Vote column is added. | Low | Move role to a second line or drop "(Secretary)" from voter rows. |
| All for | Every member — including declined/no-response — shows **Vote for**; 10/10. | Critical | See §2.2; unanimous recording applies only to present, eligible members. |
| All for | Table header/rows shift left (no 16px inset) compared with the other states. | Low | Same table component/padding in all states. |
| All for / Completed | **Completed** badge, no outcome. Legend disappears. | High | Outcome badge: **Carried** (success) / **Not carried** (error) / **Withdrawn** (neutral). Keep tally line visible. |
| In progress | **End vote** has no confirmation and no warning about members who haven't voted. | Medium | Confirm if anyone is still "Not voted": "2 members haven't voted. End the vote anyway?" |

### 2.4 Delete / Reset

| Screen | Finding | Severity | Recommendation |
|---|---|---|---|
| Delete modal | Copy is repetitive ("will be deleted permanently… cannot be undone. Delete this motion?"). Doesn't say whether the result already pasted in minutes is affected. | Low | See copy deck §5. |
| Reset modal | Typo "**Rest** vote?". "votes submitted will not be counted" is vague. | Medium | See copy deck. |
| Both | Delete (trash) sits in the drawer footer at all times, including during a live vote. | Medium | During a live vote: hide Delete; offer **End vote** / **Reset vote** only. |

### 2.5 Copy results and paste to TinyMCE

| Screen | Finding | Severity | Recommendation |
|---|---|---|---|
| Copy (agenda) | Icon-only copy button next to "Manage motion" — tooltip helps, but the action is the key payoff of the flow. | Low | Text button "Copy result" or add "Insert into minutes" (see below). |
| Copy (agenda) | "Completed ⓘ" — the info icon's content is not designed. | Medium | Tooltip shows the tally: "Carried · For 9 · Against 0 · Abstain 0 · Ended 11:04". |
| Toast | "Voting results copied to clipboard" — fine, but the user still has to find the right spot in the doc and paste. | Medium | Consider **Insert into minutes** that inserts at the matching agenda item; keep Copy as fallback. |
| Paste in MM | Pasted block: seconder = **Sophia Anson** (drawer says Alexander Anderson); **"Result: All for"**; already flagged "Need UX copy review" in Figma. | Critical | Use the minutes template in §5.3. Output must come from the stored motion data. |
| Paste in MM | Olivia Thompson is listed "In attendance — Secretary" (non-member) but is the **proposer**. Mock data contradiction. | Medium | Fix mock data; enforce proposer = voting member. |

### 2.6 CS vote (participant casts own vote)

| Screen | Finding | Severity | Recommendation |
|---|---|---|---|
| Pop over 1 | Pop-over shows **"2. Approval of Previous Meeting Minutes"** while the live motion is on **"1. Call to order"** (item 2 is "Not started"). | High | Pop-over always reflects the motion that's actually open. |
| Pop over 1 | Buttons **For / Against / Abstain** — differ from the secretary's vocabulary ("Vote for"). | Medium | Unify (§5.1). |
| Pop over 1 | "Go to meeting" while the user is already on the meeting page. | Low | Hide when already on the meeting; or "Open motion". |
| Pop over 1/2 | Pop-over overlaps the bottom of the drawer and hides voter rows. | Medium | Dock the pop-over to the left of the drawer, or render the voting card inside the drawer when it's open. |
| Pop over 2 | Minimised bar "Vote in progress" gives no context (which motion, have I voted?). | Low | "Vote in progress · Item 1 · You haven't voted". |
| Toast | Toast covers the drawer title. "You voted: For" vs "You abstained" — inconsistent grammar. | Low | "Your vote: For" / "Your vote: Abstain" + "Change". Place toast at standard position, not over drawer header. |
| All | The participant sees the full admin table with editable dropdowns for everyone's votes. | High (if not intentional) | Confirm role: if CS = Corporate Secretary voting as a member, fine; if any director, they must see a read-only tally (and possibly no per-person votes if secret ballot). |

---

## 3. Cross-cutting observations

- **Accessibility.** Progress bar relies on colour; add text tally (already partially there) and `aria-valuenow`. RSVP icons need accessible names. Drawer focus must move to the first field on open and return to "Manage motion" on close. Vote menu must be keyboard operable.
- **DS conformance.** Use `Drawer`, `DrawerHeader`, `StickyFooter`, `BadgeStatus`, `Dropdown`, `ProgressBar`, `Modal`, `Toast`, `Tooltip` from `src/components`. Floating surfaces (vote menu, CS pop-over) use `--elevation-100`; modals `--elevation-200`. Adjacent tertiary icon buttons in the drawer header: `gap: var(--space-2)`.
- **Real-time.** The secretary's table and the participant's pop-over must update live; define what the participant sees when the secretary ends or resets the vote mid-way ("The vote was reset. Please vote again.").
- **Audit trail.** Overriding a member's vote on their behalf (Edit flow) should be logged ("Recorded by Colin Thompson on behalf of Emily Johnson").

---

## 4. Design brief

### 4.1 Problem
During a board meeting the secretary needs to record motions and votes fast and accurately, and the minutes must reflect exactly what was moved, by whom, and how the board voted. Directors (remote or in-person) need a low-friction way to cast and confirm their own vote.

### 4.2 Users
- **Secretary / Corporate secretary (primary):** runs the vote, records votes for in-room members, ends the vote, inserts result into minutes.
- **Chair:** announces outcome; needs to see whether the motion carried.
- **Director (voter):** casts own vote, can change it while the vote is open, gets confirmation.

### 4.3 Goals & success criteria
1. Minutes text is generated from stored data — zero manual retyping of names or counts.
2. Outcome (Carried / Not carried) is unambiguous at every point after the vote ends.
3. Absent / non-voting members can't be counted by accident.
4. One vote vocabulary across drawer, menu, legend, pop-over, toast, minutes.
5. Secretary can go from "Add motion" to result in minutes in ≤ 6 clicks for a unanimous vote.

### 4.4 Status model

| Status | Badge tone | Meaning | Footer actions |
|---|---|---|---|
| Draft | Neutral | Motion created, no vote yet | Start vote (primary) · Record unanimous… · Delete |
| Voting open | Info (blue) | Live vote | End vote (primary) · Reset vote |
| Carried | Success | Ended, majority reached | Insert into minutes (primary) · Copy · Reset vote · Delete |
| Not carried | Error | Ended, majority not reached | Insert into minutes · Copy · Reset vote · Delete |
| Withdrawn | Neutral | Proposer withdrew | Delete |

Agenda list shows the same badge next to "Motion".

### 4.5 Drawer structure
1. Header: "Motion" eyebrow + motion text (editable in Draft) + close.
2. Status badge.
3. Proposed by / Seconded by (person pickers, present members only).
4. Voting rule line: "Simple majority of eligible voters (6 of 10)".
5. Tally: progress bar + "For 6 · Against 1 · Abstain 2 · Not voted 1".
6. Voter table: Name · Attendance · Vote. Absent and non-voting rows grouped at the bottom, greyed.
7. Sticky footer per status (4.4).

### 4.6 Edge cases to design
- Tie (e.g. 5–5) → Not carried; chair's casting vote if the organisation allows it.
- Member joins/leaves mid-vote.
- Conflict of interest → member recused ("Recused" row state, not counted).
- Vote reset after result was already pasted into minutes → warn.
- Proposer and seconder are the same person → block.
- Long motion text (3+ lines) in header and in pop-over.
- Secret ballot (per-person votes hidden) — confirm if in scope.

---

## 5. UX copy deck

### 5.1 Vote vocabulary (use everywhere)

| Concept | Label | Notes |
|---|---|---|
| Vote in favour | **For** | Menu, legend, table, pop-over, minutes |
| Vote against | **Against** | |
| Abstention | **Abstain** | Minutes: "abstentions" |
| No vote yet | **Not voted** | Replaces "Pending" |
| Clear a recorded vote | **Clear vote** | Menu item |
| Not attending | **Absent** | Not counted |
| Excluded for interest | **Recused** | Not counted |

### 5.2 Screen copy

| Location | Current | Proposed |
|---|---|---|
| Agenda `···` menu | Add motion | Add motion |
| Drawer heading (new) | Add motion title | New motion |
| Motion field placeholder | — | e.g. I move to approve the minutes of the previous meeting as presented. |
| Status (new) | In progress | Draft |
| Proposer placeholder | Choose user | Select a member |
| Seconder validation | — | The seconder must be different from the proposer. |
| Non-present warning | — | {Name} isn't marked as present. |
| Primary action (draft) | Start vote | Start vote |
| Unanimous action | All for | Record unanimous vote… |
| Unanimous confirm title | — | Record a unanimous vote? |
| Unanimous confirm body | — | All 8 present voting members will be recorded as voting **For**. Absent members won't be counted. |
| Counter | 9/10 | 9 of 10 voted |
| Majority marker tooltip | Majority | Majority: 6 For needed (simple majority of 10 eligible voters) |
| Projection (live) | — | On track to carry · 6 of 6 For needed |
| End vote | End vote | End vote |
| End vote confirm | — | **End the vote?** 2 members haven't voted. Their votes won't be counted. [Cancel] [End vote] |
| Status after end | Completed | Carried / Not carried |
| Completed tooltip | ⓘ (undefined) | Carried · For 9 · Against 0 · Abstain 0 · Ended at 11:04 |
| Copy button | (icon) tooltip "Copy results" | Copy result |
| Insert action | — | Insert into minutes |
| Copy toast | Voting results copied to clipboard | Result copied. Paste it into the minutes. |
| Insert toast | — | Result added to minutes under "1. Call to order". |
| Delete modal title | Delete motion | Delete motion? |
| Delete modal body | This motion will be deleted permanently. This action cannot be undone. Delete this motion? | The motion and all recorded votes will be deleted. Text already added to the minutes won't change. This can't be undone. |
| Delete confirm | Delete | Delete motion |
| Reset modal title | Reset vote | Reset vote? |
| Reset modal body | Upon resetting, votes submitted will not be counted and voters will need to vote again. Rest vote? | All recorded votes will be cleared and voting will start again. Members will need to vote again. |
| Reset confirm | Reset vote | Reset vote |
| Participant pop-over title | Vote in progress | Vote in progress |
| Participant buttons | For / Against / Abstain | For / Against / Abstain |
| Participant link | Go to meeting | Open motion |
| Minimised bar | Vote in progress | Vote in progress · You haven't voted |
| Participant toast | You voted: For / You abstained | Your vote: For · Change / Your vote: Abstain · Change |
| Participant: vote reset | — | The vote was reset. Please vote again. |
| Participant: vote ended | — | Voting has ended. The motion was carried. |

### 5.3 Minutes output template

```
RESOLVED: {motion text}.
Moved by {proposer}; seconded by {seconder}.
Vote: {outcome} ({for} for, {against} against, {abstain} abstentions{, n not voted}).
```

Examples:

> **RESOLVED:** That the minutes of the Board of Directors quarterly meeting Q1'24 be approved as presented.
> Moved by Olivia Thompson; seconded by Alexander Anderson.
> Vote: Carried unanimously (9 for, 0 against, 0 abstentions).

> **RESOLVED:** That the proposed action related to this agenda item be approved.
> Moved by Olivia Thompson; seconded by Alexander Anderson.
> Vote: Carried (6 for, 1 against, 2 abstentions; 1 not voted).

> **MOTION NOT CARRIED:** That the FY26 budget be approved as presented.
> Moved by Cheryl Jameson; seconded by Michael Donaldson.
> Vote: Not carried (4 for, 5 against, 1 abstention).

---

## 6. Open questions (for PM / legal)

1. Majority basis: of eligible members, of members present, or of votes cast? Is abstain counted in the denominator?
2. Can the Secretary vote? Which roles are non-voting by default?
3. Can the secretary change a member's self-cast vote? Must it be logged?
4. Is secret ballot in scope?
5. What does "CS" in "CS vote" mean in this flow — Corporate Secretary or any participant? Determines whether the per-person table is visible.
6. Quorum: should Start vote be blocked if quorum isn't met?
7. After the vote ends, can it be reopened, or only reset?

---

## 7. Acceptance checklist

- [ ] Single vote vocabulary (§5.1) in every screen and in the minutes output.
- [ ] Status model (§4.4) applied; no "In progress" on drafts; outcome badge after end.
- [ ] Absent / non-voting members excluded from counts and from "Record unanimous vote".
- [ ] Minutes text generated from stored data; names match drawer.
- [ ] Confirmation for End vote (when votes missing), Record unanimous, Reset, Delete.
- [ ] Participant pop-over shows the live motion and does not cover the drawer.
- [ ] Majority rule explained in UI.
- [ ] RSVP icons have tooltips/accessible names; progress bar has text equivalent.
- [ ] Mock data aligned (dates, seconder, secretary role).
- [ ] Reset modal typo fixed.
