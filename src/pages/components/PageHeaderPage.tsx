/* PageHeaderPage — Figma nodes 34914-4984, 34914-4987 */

import { PageHeader } from '../../components/PageHeader/PageHeader'
import styles from './PageHeaderPage.module.css'
import { SourceLink } from '../SourceLink'

export default function PageHeaderPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Page Header</h1>
      <p className={styles.subtitle}>Figma · 34914-4984, 34914-4987</p>
      <SourceLink path="src/components/PageHeader/PageHeader.tsx" />

      {/* ── Page name only ──────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Page name only</h2>
      <div className={styles.preview}>
        <PageHeader title="Page header" />
      </div>

      {/* ── With back button ────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>With back button</h2>
      <div className={styles.preview}>
        <PageHeader title="Page header" onBack={() => {}} />
      </div>
    </div>
  )
}
