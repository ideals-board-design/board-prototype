/* BadgeCounterPage — Figma node 9801-63513 */

import { Fragment } from 'react'
import { BadgeCounter } from '../../components/BadgeCounter/BadgeCounter'
import styles from './BadgeCounterPage.module.css'
import { SourceLink } from '../SourceLink'

const TEXT_VARIANTS = ['new', 'regular', 'disabled', 'primary', 'secondary', 'inverted'] as const
const COUNTS = ['1', '99', '99+'] as const

export default function BadgeCounterPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Badge Counter</h1>
      <p className={styles.subtitle}>Figma · 9801-63513</p>
      <SourceLink path="src/components/BadgeCounter/BadgeCounter.tsx" />

      {/* ── Text variants ─────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Variants</h2>
      <div className={styles.variantGrid}>
        <span className={styles.colLabel} />
        {TEXT_VARIANTS.map(v => (
          <span key={v} className={styles.colLabel}>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
        ))}

        {COUNTS.map(count => (
          <Fragment key={count}>
            <span className={styles.rowLabel}>{count}</span>
            {TEXT_VARIANTS.map(v => (
              <div key={`${v}-${count}`} className={styles.cell}>
                <BadgeCounter variant={v} count={count} />
              </div>
            ))}
          </Fragment>
        ))}
      </div>

      {/* ── Dot variant ───────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Dot</h2>
      <div className={styles.dotRow}>
        <BadgeCounter variant="dot" />
        <span className={styles.dotLabel}>Online / active indicator</span>
      </div>

      {/* ── Usage examples ────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Usage examples</h2>
      <div className={styles.exampleRow}>
        <div className={styles.exampleItem}>
          <span className={styles.exampleLabel}>Inbox</span>
          <BadgeCounter variant="new" count={3} />
        </div>
        <div className={styles.exampleItem}>
          <span className={styles.exampleLabel}>Notifications</span>
          <BadgeCounter variant="regular" count={12} />
        </div>
        <div className={styles.exampleItem}>
          <span className={styles.exampleLabel}>Updates</span>
          <BadgeCounter variant="primary" count={5} />
        </div>
        <div className={styles.exampleItem}>
          <span className={styles.exampleLabel}>Archived</span>
          <BadgeCounter variant="secondary" count={99} />
        </div>
        <div className={styles.exampleItem}>
          <span className={styles.exampleLabel}>Overflow</span>
          <BadgeCounter variant="new" count="99+" />
        </div>
        <div className={styles.exampleItem}>
          <span className={styles.exampleLabel}>Disabled</span>
          <BadgeCounter variant="disabled" count={7} />
        </div>
      </div>
    </div>
  )
}
