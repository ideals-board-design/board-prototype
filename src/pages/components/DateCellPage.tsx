import { DateCell } from '../../components/DateCell/DateCell'
import styles from './DateCellPage.module.css'

const TYPES = ['default', 'date-range', 'selected', 'today'] as const
const TYPE_LABELS = { 'default': 'Default', 'date-range': 'Date range', 'selected': 'Selected', 'today': 'Today' }

export default function DateCellPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Date Cell</h1>
      <p className={styles.subtitle}>Figma node 24002-7087 · 32×32px calendar day cell</p>

      {/* ── States grid ─────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>States</h2>

      <div className={styles.grid}>
        {/* Header row */}
        <div className={styles.cornerCell} />
        {TYPES.map(t => (
          <div key={t} className={styles.colLabel}>{TYPE_LABELS[t]}</div>
        ))}

        {/* Active row */}
        <div className={styles.rowLabel}>Active</div>
        {TYPES.map(t => (
          <div key={t} className={styles.cellWrap}>
            <DateCell day={29} type={t} />
          </div>
        ))}

        {/* Disabled row — only Default per Figma */}
        <div className={styles.rowLabel}>Disabled</div>
        <div className={styles.cellWrap}>
          <DateCell day={29} type="default" disabled />
        </div>
        <div className={styles.cellWrap} />
        <div className={styles.cellWrap} />
        <div className={styles.cellWrap} />
      </div>

      {/* ── Spec ─────────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Spec</h2>
      <table className={styles.specTable}>
        <tbody>
          <tr><td>Size</td><td>32×32px (fixed)</td></tr>
          <tr><td>Default</td><td>No background · primary text</td></tr>
          <tr><td>Date range</td><td>bg green-25 (#EBF8EF) · no border-radius · primary text</td></tr>
          <tr><td>Selected</td><td>bg green-500 · border-radius 4px · inverse text (white)</td></tr>
          <tr><td>Today</td><td>border 1px green-500 · border-radius 4px · primary text</td></tr>
          <tr><td>Disabled</td><td>opacity 0.4 · pointer-events none</td></tr>
          <tr><td>Typography</td><td>14px / 20px Regular · Inter</td></tr>
        </tbody>
      </table>
    </div>
  )
}
