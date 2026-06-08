import styles from './CheckboxPage.module.css'
import { Checkbox } from '../../components/Checkbox/Checkbox'

export default function CheckboxPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Checkbox</h1>
      <p className={styles.subtitle}>Form control for boolean and indeterminate selection.</p>

      {/* ── Checkbox only ── */}
      <h2 className={styles.sectionTitle}>Checkbox only</h2>

      <div className={styles.table}>
        <span />
        <span className={styles.colHeader}>Default</span>
        <span className={styles.colHeader}>Checked</span>
        <span className={styles.colHeader}>Indeterminate</span>

        <span className={styles.rowLabel}>Active</span>
        <Checkbox />
        <Checkbox defaultChecked />
        <Checkbox indeterminate />

        <span className={styles.rowLabel}>Hover</span>
        <Checkbox data-state="hover" />
        <Checkbox defaultChecked data-state="hover" />
        <Checkbox indeterminate data-state="hover" />

        <span className={styles.rowLabel}>Disabled</span>
        <Checkbox disabled />
        <Checkbox defaultChecked disabled />
        <Checkbox indeterminate disabled />
      </div>

      {/* ── Checkbox + Label ── */}
      <h2 className={styles.sectionTitle}>With label</h2>

      <div className={styles.table}>
        <span />
        <span className={styles.colHeader}>Default</span>
        <span className={styles.colHeader}>Checked</span>
        <span className={styles.colHeader}>Indeterminate</span>

        <span className={styles.rowLabel}>Active</span>
        <Checkbox label="Text" />
        <Checkbox label="Text" defaultChecked />
        <Checkbox label="Text" indeterminate />

        <span className={styles.rowLabel}>Hover</span>
        <Checkbox label="Text" data-state="hover" />
        <Checkbox label="Text" defaultChecked data-state="hover" />
        <Checkbox label="Text" indeterminate data-state="hover" />

        <span className={styles.rowLabel}>Disabled</span>
        <Checkbox label="Text" disabled />
        <Checkbox label="Text" defaultChecked disabled />
        <Checkbox label="Text" indeterminate disabled />
      </div>
    </div>
  )
}
