/* Q4 board pack — real sample document for the board book test versions.

   Source: Q4_board_pack_sample.pdf ("Board meeting pack · 22 October 2026",
   Meridian Group plc, 7 pages). Each page is pre-rendered to PNG (2×, US
   Letter) in ./q4-pack, and the agenda below mirrors the pack's own contents
   page, so the agenda panel, the document menu and the continuous page counter
   all line up with the real pages:

     p1  cover & agenda             p4–5  3. Financial report, Q3 2026
     p2  1. Opening, quorum, minutes p6    4. Audit committee report
     p3  2. CEO report               p7    5. Any other business and close */

import { buildBoardBook, type BoardBookItem } from '../../meeting/BoardBook/boardBookData'

const pageUrls = import.meta.glob<string>('./q4-pack/page-*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** Rendered image of a 1-based page of the pack (undefined outside 1–7). */
export function q4PageImage(page: number): string | undefined {
  return pageUrls[`./q4-pack/page-${page}.png`]
}

/** Aspect ratio of the pack's pages (US Letter, 612 × 792 pt). */
export const Q4_PAGE_RATIO = '612 / 792'

/* Presenters — the pack names roles only; people are illustrative. */
const CHAIR      = { name: 'Andrew Collins, Chair of the Board',       avatar: 'https://i.pravatar.cc/40?img=13' }
const CEO        = { name: 'Maria Lindqvist, Chief Executive Officer',  avatar: 'https://i.pravatar.cc/40?img=45' }
const CFO        = { name: 'Liam Wilson, Chief Financial Officer',      avatar: 'https://i.pravatar.cc/40?img=51' }
const AUDIT_CHAIR = { name: 'Sophia Anson, Chair of the Audit Committee', avatar: 'https://i.pravatar.cc/40?img=32' }

/* Agenda content is drawn from the pack's own pages; links are supporting
   material referenced in the pack (not part of the paged PDF). The meeting has
   not started yet, so every motion is still "Not started". */
const Q4_ITEMS: BoardBookItem[] = [
  {
    id: 'q4-item-1',
    number: '1',
    title: 'Opening, quorum, and minutes',
    timeRange: '10:00 - 10:10',
    duration: '10min',
    presenter: CHAIR,
    description:
      'The Chair will open the meeting and confirm that a quorum is present. Under article 14.2 of the articles of association, five of nine directors constitute a quorum; seven directors have confirmed attendance, two of them by video link. Directors are asked to declare any interest in the items on this agenda. The draft minutes of the meeting held on 16 July 2026 were circulated on 24 July; two comments were received and have been incorporated.',
    motions: [
      {
        text: 'The board approves the minutes of the meeting held on 16 July 2026 as a true and accurate record, and authorises the Chair to sign them.',
        status: 'not-started',
      },
    ],
    documents: [
      { id: 'q4-cover', name: 'Cover and agenda.pdf', sourceFormat: 'pdf', pages: 1 },
      { id: 'q4-opening', name: 'Opening, quorum, and minutes.pdf', sourceFormat: 'pdf', pages: 1 },
    ],
    links: [
      { id: 'q4-link-interests', name: 'Register of interests (30 Sep 2026)', url: 'https://example.com/register-of-interests' },
      { id: 'q4-link-actions',   name: 'Actions log from previous meetings', url: 'https://example.com/actions-log' },
    ],
  },
  {
    id: 'q4-item-2',
    number: '2',
    title: 'CEO report',
    timeRange: '10:10 - 10:40',
    duration: '30min',
    presenter: CEO,
    description:
      'Revenue grew 12.8% year on year to EUR 48.6m, ahead of plan by EUR 1.2m. Two enterprise contracts were signed in the Nordics with a combined annual value of EUR 3.4m, customer retention held at 96% for the fourth consecutive quarter, and the Warsaw engineering hub reached 140 people. Key risks: slow hiring for senior security roles (94 days average time to fill) and higher exposure to the Polish zloty, 60% of which is hedged for 2027. Q4 priorities: complete the Frankfurt data centre migration, launch the DACH partner programme and finalise the 2027 budget.',
    documents: [
      { id: 'q4-ceo', name: 'CEO report.pdf', sourceFormat: 'pdf', pages: 1 },
    ],
    links: [
      { id: 'q4-link-kpi', name: 'Q3 2026 KPI dashboard', url: 'https://example.com/q3-kpi-dashboard' },
    ],
  },
  {
    id: 'q4-item-3',
    number: '3',
    title: 'Financial report, Q3 2026',
    timeRange: '10:40 - 11:10',
    duration: '30min',
    presenter: CFO,
    description:
      'The group delivered its strongest quarter to date: revenue EUR 48.6m (+12.8%), gross margin 61.4% (+1.6 pp), EBITDA EUR 7.9m (+47.9%) and net cash EUR 31.2m. Gross margin benefited from lower hosting costs after the first wave of the Frankfurt migration; receivables over 60 days fell to EUR 2.1m. The pack also sets out the cash flow forecast to Q3 2027 and the 2027 budget assumptions: 10–12% revenue growth, 8% average headcount growth and EUR 13.5m capital expenditure. Directors are invited to comment on the assumptions before 15 November.',
    motions: [
      {
        text: 'The board notes the Q3 2026 financial report and the cash flow forecast, and endorses the 2027 budget assumptions as the basis for the budget to be presented in January.',
        status: 'not-started',
      },
    ],
    documents: [
      { id: 'q4-financial', name: 'Financial report, Q3 2026.pdf', sourceFormat: 'pdf', pages: 2 },
    ],
    links: [
      { id: 'q4-link-budget', name: '2027 budget assumptions — comments form', url: 'https://example.com/budget-2027-comments' },
    ],
  },
  {
    id: 'q4-item-4',
    number: '4',
    title: 'Audit committee report',
    timeRange: '11:10 - 11:30',
    duration: '20min',
    presenter: AUDIT_CHAIR,
    description:
      'The committee met on 8 October 2026 with all three members, the CFO, the Head of Internal Audit and the external audit partner. It considered the internal audit of revenue recognition for multi-year contracts (no material findings, two low-priority recommendations), the tender for external audit services for FY2027 to FY2031, and an update on the cyber resilience review, which completes in November. After interviews and a scoring review the committee recommends Halden & Partners, whose proposal scored highest on sector experience and audit quality, with fees 6% below the incumbent.',
    motions: [
      {
        text: 'The board approves the appointment of Halden & Partners as external auditor for the financial years 2027 to 2031, subject to shareholder approval at the next annual general meeting.',
        status: 'not-started',
      },
    ],
    documents: [
      { id: 'q4-audit', name: 'Audit committee report.pdf', sourceFormat: 'pdf', pages: 1 },
    ],
    links: [
      { id: 'q4-link-tender', name: 'External audit tender — scoring summary', url: 'https://example.com/audit-tender-scoring' },
    ],
  },
  {
    id: 'q4-item-5',
    number: '5',
    title: 'Any other business and close',
    timeRange: '11:30 - 11:40',
    duration: '10min',
    presenter: CHAIR,
    description:
      'Management requests an in-principle agreement to a retention pool of up to EUR 0.8m for senior security and platform roles; a detailed proposal will go to the Remuneration Committee in November. The annual board evaluation questionnaire will be sent on 2 November, with responses due by 20 November. The next meeting is on Thursday, 21 January 2027, 10:00 EET, in the Kyiv office, and will include approval of the 2027 budget.',
    motions: [
      {
        text: 'The board agrees in principle to a retention pool of up to EUR 0.8m for senior security and platform roles, subject to a detailed proposal to the Remuneration Committee.',
        status: 'not-started',
      },
    ],
    documents: [
      { id: 'q4-aob', name: 'Any other business and close.pdf', sourceFormat: 'pdf', pages: 1 },
    ],
    links: [
      { id: 'q4-link-evaluation', name: 'Board evaluation questionnaire 2026', url: 'https://example.com/board-evaluation-2026' },
    ],
  },
]

export const Q4_BOARD_BOOK = buildBoardBook(Q4_ITEMS)
