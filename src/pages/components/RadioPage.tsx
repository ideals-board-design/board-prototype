import styles from './RadioPage.module.css'
import { Radio } from '../../components/Radio/Radio'

export default function RadioPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Radio</h1>
      <p className={styles.subtitle}>Form control for single selection within a group.</p>

      {/* ── Radio only ── */}
      <h2 className={styles.sectionTitle}>Radio only</h2>

      <div className={styles.table}>
        <span />
        <span className={styles.colHeader}>Default</span>
        <span className={styles.colHeader}>Checked</span>

        <span className={styles.rowLabel}>Active</span>
        <Radio name="only-active" />
        <Radio name="only-active" defaultChecked />

        <span className={styles.rowLabel}>Hover</span>
        <Radio name="only-hover" data-state="hover" />
        <Radio name="only-hover" defaultChecked data-state="hover" />

        <span className={styles.rowLabel}>Disabled</span>
        <Radio name="only-disabled" disabled />
        <Radio name="only-disabled" defaultChecked disabled />
      </div>

      {/* ── Radio + Label ── */}
      <h2 className={styles.sectionTitle}>With label</h2>

      <div className={styles.table}>
        <span />
        <span className={styles.colHeader}>Default</span>
        <span className={styles.colHeader}>Checked</span>

        <span className={styles.rowLabel}>Active</span>
        <Radio label="Text" name="label-active" />
        <Radio label="Text" name="label-active" defaultChecked />

        <span className={styles.rowLabel}>Hover</span>
        <Radio label="Text" name="label-hover" data-state="hover" />
        <Radio label="Text" name="label-hover" defaultChecked data-state="hover" />

        <span className={styles.rowLabel}>Disabled</span>
        <Radio label="Text" name="label-disabled" disabled />
        <Radio label="Text" name="label-disabled" defaultChecked disabled />
      </div>
    </div>
  )
}
