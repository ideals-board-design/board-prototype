import styles from './TextAreaPage.module.css'
import { TextArea } from '../../components/TextArea/TextArea'
import { Button } from '../../components/Button/Button'
import { SourceLink } from '../SourceLink'

export default function TextAreaPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Text Area</h1>
      <p className={styles.subtitle}>Multi-line text input for longer content.</p>
      <SourceLink path="src/components/TextArea/TextArea.tsx" />

      {/* ── Variants ─────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>States</h2>
      <div className={styles.table}>
        <span className={styles.rowLabel}>Active</span>
        <TextArea size="m" defaultValue="Filled text" placeholder="Prompt text" />

        <span className={styles.rowLabel}>Disabled</span>
        <TextArea size="m" defaultValue="Filled text" placeholder="Prompt text" disabled />

        <span className={styles.rowLabel}>Error</span>
        <TextArea size="m" defaultValue="Filled text" placeholder="Prompt text" error />
      </div>

      {/* ── Sizes ────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Sizes</h2>
      <div className={styles.sizeRow}>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>S — 32px</span>
          <TextArea size="s" defaultValue="Filled text" placeholder="Prompt text" />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>M — 40px</span>
          <TextArea size="m" defaultValue="Filled text" placeholder="Prompt text" />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>L — 48px</span>
          <TextArea size="l" defaultValue="Filled text" placeholder="Prompt text" />
        </div>
      </div>

      {/* ── Options ──────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Options</h2>

      <h3 className={styles.subsectionTitle}>Label</h3>
      <div className={styles.exampleRow}>
        <TextArea size="m" label="Label" defaultValue="Filled text" placeholder="Prompt text" />
        <TextArea size="m" label="Label" defaultValue="Filled text" placeholder="Prompt text" disabled />
      </div>

      <h3 className={styles.subsectionTitle}>Helper text</h3>
      <div className={styles.exampleRow}>
        <TextArea size="m" label="Label" defaultValue="Filled text" placeholder="Prompt text" helper="This is a hint message" />
      </div>

      <h3 className={styles.subsectionTitle}>Helper text with action</h3>
      <div className={styles.exampleRow}>
        <TextArea
          size="m" label="Label"
          defaultValue="Filled text" placeholder="Prompt text"
          helper="This is a hint message"
          action={<Button variant="tertiary" size="m">Action</Button>}
        />
      </div>

      <h3 className={styles.subsectionTitle}>Error message</h3>
      <div className={styles.exampleRow}>
        <TextArea size="m" label="Label" defaultValue="Filled text" placeholder="Prompt text" error="This field is required" />
      </div>
    </div>
  )
}
