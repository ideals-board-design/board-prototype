/* Reports78Page — "Reports (1,2)" tab: the same four reports as the Reports
   tab (Results · UX audit · Usability study · Design review), for the toolbar
   variants Version 1 (borderless dropdown) and Version 2 (tool rail + labelled
   Download).

   Sources (all in `.design/board-book-page-nav/`): usability-study-v78.json,
   ux-audit-v78.json, DESIGN_REVIEW_V78.md and the review-v7 / review-v8
   screenshots. The report components are the shared ones; only the data and
   the Results copy differ. */

import ReportsPage, { type ReportDef } from './ReportsPage'
import ReportPage from './ReportPage'
import ResultsPage, { type ResultsConfig } from './ResultsPage'
import UsabilityStudyPage, { type StudyData } from './UsabilityStudyPage'
import UxAuditPage, { type AuditData } from './UxAuditPage'
import reviewMd from '../../../.design/board-book-page-nav/DESIGN_REVIEW_V78.md?raw'
import studyJson from '../../../.design/board-book-page-nav/usability-study-v78.json'
import auditJson from '../../../.design/board-book-page-nav/ux-audit-v78.json'
import shotV7 from '../../../.design/board-book-page-nav/screenshots/review-v7-desktop-1280.png'
import shotV8 from '../../../.design/board-book-page-nav/screenshots/review-v8-desktop-1280.png'
import shotV7Laptop from '../../../.design/board-book-page-nav/screenshots/review-v7-laptop-1024.png'
import shotV8Laptop from '../../../.design/board-book-page-nav/screenshots/review-v8-laptop-1024.png'

const study = studyJson as unknown as StudyData
const audit = auditJson as unknown as AuditData

const SHOTS = [
  { src: shotV7, label: 'Version 1 — Borderless dropdown' },
  { src: shotV8, label: 'Version 2 — Tool rail + labelled Download' },
  { src: shotV7Laptop, label: 'Version 1 — laptop 1024' },
  { src: shotV8Laptop, label: 'Version 2 — laptop 1024' },
]

const RESULTS: ResultsConfig = {
  eyebrow: 'Board book toolbar · Version 1 vs Version 2',
  variants: [
    { id: 'v1', name: 'Version 1', kind: 'Borderless dropdown', shot: shotV7 },
    { id: 'v2', name: 'Version 2', kind: 'Tool rail', shot: shotV8 },
  ],
  reviewMd,
  study: study as unknown as ResultsConfig['study'],
  audit: audit as unknown as ResultsConfig['audit'],
  why: ({ overall, success, leads, total }) => [
    { icon: 'success', title: `Best or tied on ${leads === total ? 'all' : leads} of ${total} criteria`, text: `Highest overall score (${Math.max(...Object.values(overall))}) with ${Math.round(Math.max(...Object.values(success)) * 100)}% task success.` },
    { icon: 'boundaries', title: 'Tools sit beside the page', text: 'Search, Ask AI, Comment, Draw and Highlight move into a rail next to the document; the top bar keeps navigation and zoom.' },
    { icon: 'ease', title: 'A labelled Download', text: 'Every persona finds it — in Version 1 low-proficiency and touch readers do not. Most buttons are still icon-only, so labels remain the next fix.' },
  ],
  note: 'Version 1 and Version 2 share the borderless document dropdown, so the comparison isolates the tool rail and the labelled Download; the dropdown itself (V6 vs V7) still needs its own test. The rail was checked at 100% zoom on 1280 and 1024 only. All scores are simulated — validate with directors.',
}

const REPORTS_78: ReportDef[] = [
  { id: 'results', title: 'Results', subtitle: 'Winner · summary', Comp: ({ onOpenVersion }) => <ResultsPage config={RESULTS} onOpenVersion={onOpenVersion} /> },
  { id: 'audit',  title: 'UX audit', subtitle: '5 lenses · UXS · EN', Comp: () => <UxAuditPage audit={audit} study={study} /> },
  { id: 'study',  title: 'Usability study', subtitle: '4 personas · SEQ · EN', Comp: () => <UsabilityStudyPage study={study} /> },
  { id: 'review', title: 'Design review', subtitle: 'DS & heuristics · EN', Comp: () => <ReportPage md={reviewMd} shots={SHOTS} /> },
]

export default function Reports78Page({ onOpenVersion }: { onOpenVersion?: (v: string) => void }) {
  return <ReportsPage reports={REPORTS_78} onOpenVersion={onOpenVersion} />
}
