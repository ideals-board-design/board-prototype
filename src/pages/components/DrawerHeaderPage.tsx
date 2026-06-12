/* DrawerHeaderPage — Figma nodes 34916-4993, 34916-4994, 34916-4995 */

import { DrawerHeader } from '../../components/DrawerHeader/DrawerHeader'
import { BadgeStatus } from '../../components/BadgeStatus/BadgeStatus'
import styles from './DrawerHeaderPage.module.css'
import { SourceLink } from '../SourceLink'

export default function DrawerHeaderPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Drawer Header</h1>
      <p className={styles.subtitle}>Figma · 34916-4993, 34916-4994, 34916-4995</p>
      <SourceLink path="src/components/DrawerHeader/DrawerHeader.tsx" />

      {/* ── Default ─────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Default</h2>
      <div className={styles.preview}>
        <DrawerHeader title="Drawer header" onClose={() => {}} />
      </div>

      {/* ── Multi lines ─────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Multi lines</h2>
      <div className={styles.preview}>
        <DrawerHeader
          title="Consideration of a structured approach to assessment of Nursing and Homes"
          onClose={() => {}}
        />
      </div>

      {/* ── Type and status ─────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Type and status</h2>
      <div className={styles.preview}>
        <DrawerHeader
          title="Drawer header"
          onClose={() => {}}
          type="Type"
          onTypeClick={() => {}}
          badge={<BadgeStatus type="neutral" label="Badge" />}
        />
      </div>
    </div>
  )
}
