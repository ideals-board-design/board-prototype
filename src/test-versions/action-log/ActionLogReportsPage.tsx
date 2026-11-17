/* ActionLogReportsPage — "Reports" tab of the Action log test page.

   The same report components as the Board book Reports tab (side navigation +
   scroll-spy), fed with the Action log data: UX audit, Usability study and
   Design review. Sources are in `.design/action-log/`. */

import ReportsPage, { type ReportDef } from '../board-book-page-nav/ReportsPage'
import ReportPage from '../board-book-page-nav/ReportPage'
import UsabilityStudyPage, { type StudyData } from '../board-book-page-nav/UsabilityStudyPage'
import UxAuditPage, { type AuditData } from '../board-book-page-nav/UxAuditPage'
import reviewMd from '../../../.design/action-log/DESIGN_REVIEW.md?raw'
import studyJson from '../../../.design/action-log/usability-study.json'
import auditJson from '../../../.design/action-log/ux-audit.json'
import shotDesktop from '../../../.design/action-log/screenshots/review-desktop-1280.png'
import shotLaptop from '../../../.design/action-log/screenshots/review-laptop-1024.png'
import shotTablet from '../../../.design/action-log/screenshots/review-tablet-800.png'
import shotPhone from '../../../.design/action-log/screenshots/review-phone-390.png'

const study = studyJson as unknown as StudyData
const audit = auditJson as unknown as AuditData

const SHOTS = [
  { src: shotDesktop, label: 'Desktop 1280' },
  { src: shotLaptop, label: 'Laptop 1024' },
  { src: shotTablet, label: 'iPad portrait 800' },
  { src: shotPhone, label: 'Phone 390' },
]

const REPORTS: ReportDef[] = [
  { id: 'audit',  title: 'UX audit', subtitle: '5 lenses · UXS · EN', Comp: () => <UxAuditPage audit={audit} study={study} /> },
  { id: 'study',  title: 'Usability study', subtitle: '4 personas · SEQ · EN', Comp: () => <UsabilityStudyPage study={study} /> },
  { id: 'review', title: 'Design review', subtitle: 'DS & heuristics · EN', Comp: () => <ReportPage md={reviewMd} shots={SHOTS} /> },
]

export default function ActionLogReportsPage() {
  return <ReportsPage reports={REPORTS} />
}
