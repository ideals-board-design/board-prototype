import styles from './SegmentControlPage.module.css'
import { SegmentControl } from '../../components/SegmentControl/SegmentControl'
import { SourceLink } from '../SourceLink'

const plusIcon = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 4.25V9.25H15.75V10.75H10.75V15.75H9.25V10.75H4.25V9.25H9.25V4.25H10.75Z" fill="currentColor"/></svg>`

const items3 = [
  { id: 'a', label: 'Label' },
  { id: 'b', label: 'Label' },
  { id: 'c', label: 'Label' },
]

const items3Icon = [
  { id: 'a', label: 'Label', icon: plusIcon },
  { id: 'b', label: 'Label', icon: plusIcon },
  { id: 'c', label: 'Label', icon: plusIcon },
]

export default function SegmentControlPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Segment Control</h1>
      <p className={styles.subtitle}>Single-select button group for switching between views or options.</p>
      <SourceLink path="src/components/SegmentControl/SegmentControl.tsx" />

      {/* ── Sizes ── */}
      <h2 className={styles.sectionTitle}>Sizes</h2>

      <div className={styles.table}>
        <span className={styles.rowLabel}>L</span>
        <SegmentControl size="l" defaultValue="a" items={items3} />

        <span className={styles.rowLabel}>M</span>
        <SegmentControl size="m" defaultValue="a" items={items3} />

        <span className={styles.rowLabel}>S</span>
        <SegmentControl size="s" defaultValue="a" items={items3} />
      </div>

      {/* ── With icon ── */}
      <h2 className={styles.sectionTitle}>With icon</h2>

      <div className={styles.table}>
        <span className={styles.rowLabel}>L</span>
        <SegmentControl size="l" defaultValue="a" items={items3Icon} />

        <span className={styles.rowLabel}>M</span>
        <SegmentControl size="m" defaultValue="a" items={items3Icon} />

        <span className={styles.rowLabel}>S</span>
        <SegmentControl size="s" defaultValue="a" items={items3Icon} />
      </div>

      {/* ── Min-width ── */}
      <h2 className={styles.sectionTitle}>Min-width per size</h2>

      <div className={styles.table}>
        <span className={styles.rowLabel}>L — 88px</span>
        <SegmentControl size="l" defaultValue="a" items={[{ id: 'a', label: 'Label' }]} />

        <span className={styles.rowLabel}>M — 80px</span>
        <SegmentControl size="m" defaultValue="a" items={[{ id: 'a', label: 'Label' }]} />

        <span className={styles.rowLabel}>S — 72px</span>
        <SegmentControl size="s" defaultValue="a" items={[{ id: 'a', label: 'Label' }]} />
      </div>
    </div>
  )
}
