import styles from './TextEditorPage.module.css'
import { TextEditor } from '../../components/TextEditor/TextEditor'
import { Button } from '../../components/Button/Button'
import { SourceLink } from '../SourceLink'

export default function TextEditorPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Text Editor</h1>
      <p className={styles.subtitle}>Rich text area with formatting toolbar and action bar.</p>
      <SourceLink path="src/components/TextEditor/TextEditor.tsx" />

      {/* ── States ─────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>States</h2>
      <div className={styles.table}>
        <span className={styles.rowLabel}>Active</span>
        <TextEditor defaultValue="Filled text" placeholder="Prompt text" />

        <span className={styles.rowLabel}>Disabled</span>
        <TextEditor defaultValue="Filled text" placeholder="Prompt text" disabled />

        <span className={styles.rowLabel}>Error</span>
        <TextEditor defaultValue="Filled text" placeholder="Prompt text" error />
      </div>

      {/* ── Options ──────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Options</h2>

      <h3 className={styles.subsectionTitle}>Label</h3>
      <div className={styles.exampleRow}>
        <TextEditor label="Label" defaultValue="Filled text" placeholder="Prompt text" />
        <TextEditor label="Label" defaultValue="Filled text" placeholder="Prompt text" disabled />
      </div>

      <h3 className={styles.subsectionTitle}>Helper text</h3>
      <div className={styles.exampleRow}>
        <TextEditor

          defaultValue="Filled text"
          placeholder="Prompt text"
          helper="This is a hint message"
        />
      </div>

      <h3 className={styles.subsectionTitle}>Helper text with action</h3>
      <div className={styles.exampleRow}>
        <TextEditor
          defaultValue="Filled text"
          placeholder="Prompt text"
          helper="This is a hint message"
          action={<Button variant="tertiary" size="m">Action</Button>}
        />
      </div>

      <h3 className={styles.subsectionTitle}>Error message</h3>
      <div className={styles.exampleRow}>
        <TextEditor

          defaultValue="Filled text"
          placeholder="Prompt text"
          error="This field is required"
        />
      </div>
    </div>
  )
}
