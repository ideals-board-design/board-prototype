import styles from './TogglePage.module.css'
import { Toggle } from '../../components/Toggle/Toggle'

export default function TogglePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Toggle</h1>
      <p className={styles.subtitle}>Switch control for binary on/off states.</p>

      {/* ── Toggle only ── */}
      <h2 className={styles.sectionTitle}>Toggle only</h2>

      <div className={styles.table}>
        <span />
        <span className={styles.colHeader}>Off</span>
        <span className={styles.colHeader}>On</span>

        <span className={styles.rowLabel}>Active</span>
        <Toggle />
        <Toggle defaultChecked />

        <span className={styles.rowLabel}>Disabled</span>
        <Toggle disabled />
        <Toggle defaultChecked disabled />
      </div>

      {/* ── With label ── */}
      <h2 className={styles.sectionTitle}>With label</h2>

      <div className={styles.table}>
        <span />
        <span className={styles.colHeader}>Off</span>
        <span className={styles.colHeader}>On</span>

        <span className={styles.rowLabel}>Active</span>
        <Toggle label="Label" />
        <Toggle label="Label" defaultChecked />

        <span className={styles.rowLabel}>Disabled</span>
        <Toggle label="Label" disabled />
        <Toggle label="Label" defaultChecked disabled />
      </div>
    </div>
  )
}
