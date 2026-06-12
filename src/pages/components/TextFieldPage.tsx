import styles from './TextFieldPage.module.css'
import { TextField } from '../../components/TextField/TextField'
import { condition } from '../../icons/condition'
import { SourceLink } from '../SourceLink'

const infoIcon = condition.find(i => i.name === 'info-circle')!.svg

function Icon({ svg }: { svg: string }) {
  return (
    <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
  )
}

export default function TextFieldPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Text Field</h1>
      <p className={styles.subtitle}>Single-line text input. Foundation for Dropdown, Search, and Date Picker.</p>
      <SourceLink path="src/components/TextField/TextField.tsx" />

      {/* ── Variants ─────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Variants</h2>

      <h3 className={styles.subsectionTitle}>Outline</h3>
      <div className={styles.table}>
        <span className={styles.rowLabel}>Active</span>
        <TextField size="m" variant="outline" defaultValue="Filled text" placeholder="Prompt text" />

        <span className={styles.rowLabel}>Disabled</span>
        <TextField size="m" variant="outline" defaultValue="Filled text" placeholder="Prompt text" disabled />

        <span className={styles.rowLabel}>Error</span>
        <TextField size="m" variant="outline" defaultValue="Filled text" placeholder="Prompt text" error />
      </div>

      <h3 className={styles.subsectionTitle}>No border</h3>
      <div className={styles.table}>
        <span className={styles.rowLabel}>Active</span>
        <TextField size="m" variant="no-border" defaultValue="Filled text" placeholder="Prompt text" />

        <span className={styles.rowLabel}>Disabled</span>
        <TextField size="m" variant="no-border" defaultValue="Filled text" placeholder="Prompt text" disabled />

        <span className={styles.rowLabel}>Error</span>
        <TextField size="m" variant="no-border" defaultValue="Filled text" placeholder="Prompt text" error />
      </div>

      {/* ── Sizes ────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Sizes</h2>
      <div className={styles.sizeRow}>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>S — 32px</span>
          <TextField size="s" variant="outline" defaultValue="Filled text" placeholder="Prompt text" />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>M — 40px</span>
          <TextField size="m" variant="outline" defaultValue="Filled text" placeholder="Prompt text" />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>L — 48px</span>
          <TextField size="l" variant="outline" defaultValue="Filled text" placeholder="Prompt text" />
        </div>
      </div>

      {/* ── Options ──────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Options</h2>

      <h3 className={styles.subsectionTitle}>Label</h3>
      <div className={styles.exampleRow}>
        <TextField size="m" variant="outline" label="Label" defaultValue="Filled text" placeholder="Prompt text" />
        <TextField size="m" variant="outline" label="Label" defaultValue="Filled text" placeholder="Prompt text" disabled />
      </div>

      <h3 className={styles.subsectionTitle}>Helper text</h3>
      <div className={styles.exampleRow}>
        <TextField size="m" variant="outline" label="Label" defaultValue="Filled text" placeholder="Prompt text" helper="This is a hint message" />
      </div>

      <h3 className={styles.subsectionTitle}>Prefix icon</h3>
      <div className={styles.exampleRow}>
        <TextField size="s" variant="outline" defaultValue="Filled text" placeholder="Prompt text" prefix={<Icon svg={infoIcon} />} />
        <TextField size="m" variant="outline" defaultValue="Filled text" placeholder="Prompt text" prefix={<Icon svg={infoIcon} />} />
        <TextField size="l" variant="outline" defaultValue="Filled text" placeholder="Prompt text" prefix={<Icon svg={infoIcon} />} />
      </div>

      <h3 className={styles.subsectionTitle}>Suffix icon</h3>
      <div className={styles.exampleRow}>
        <TextField size="s" variant="outline" defaultValue="Filled text" placeholder="Prompt text" suffix={<Icon svg={infoIcon} />} />
        <TextField size="m" variant="outline" defaultValue="Filled text" placeholder="Prompt text" suffix={<Icon svg={infoIcon} />} />
        <TextField size="l" variant="outline" defaultValue="Filled text" placeholder="Prompt text" suffix={<Icon svg={infoIcon} />} />
      </div>

      <h3 className={styles.subsectionTitle}>Error message</h3>
      <div className={styles.exampleRow}>
        <TextField size="m" variant="outline" label="Label" defaultValue="Filled text" placeholder="Prompt text" error="This field is required" />
      </div>

      <h3 className={styles.subsectionTitle}>Loading</h3>
      <div className={styles.exampleRow}>
        <TextField size="s" variant="outline" defaultValue="Filled text" placeholder="Prompt text" loading />
        <TextField size="m" variant="outline" defaultValue="Filled text" placeholder="Prompt text" loading />
        <TextField size="l" variant="outline" defaultValue="Filled text" placeholder="Prompt text" loading />
      </div>
    </div>
  )
}
