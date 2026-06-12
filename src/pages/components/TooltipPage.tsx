import styles from './TooltipPage.module.css'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { Button } from '../../components/Button/Button'
import { editor } from '../../icons/editor'
import { actions } from '../../icons/actions'
import { SourceLink } from '../SourceLink'

const boldSvg = editor.find(i => i.name === 'bold')!.svg
const plusSvg = actions.find(i => i.name === 'plus')!.svg

function icon(svg: string) {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
}

function DemoBtn({ svg = boldSvg, label = 'Bold' }) {
  return (
    <Button
      variant="tertiary"
      intent="neutral"
      size="s"
      iconOnly={icon(svg)}
      aria-label={label}
    />
  )
}

export default function TooltipPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Tooltip</h1>
      <p className={styles.subtitle}>
        Appears on hover after a 300 ms delay. Required on all icon-only buttons.
      </p>
      <SourceLink path="src/components/Tooltip/Tooltip.tsx" />

      {/* ── Positions ──────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Positions</h2>
      <p className={styles.delayNote}>Hover any button to see the tooltip.</p>

      <div className={styles.positionsGrid}>
        <div className={styles.positionCell}>
          <Tooltip label="Tooltip" position="top">
            <DemoBtn />
          </Tooltip>
          <span className={styles.positionLabel}>Top (default)</span>
        </div>

        <div className={styles.positionCell}>
          <Tooltip label="Tooltip" position="bottom">
            <DemoBtn />
          </Tooltip>
          <span className={styles.positionLabel}>Bottom</span>
        </div>

        <div className={styles.positionCell}>
          <Tooltip label="Tooltip" position="left">
            <DemoBtn />
          </Tooltip>
          <span className={styles.positionLabel}>Left</span>
        </div>

        <div className={styles.positionCell}>
          <Tooltip label="Tooltip" position="right">
            <DemoBtn />
          </Tooltip>
          <span className={styles.positionLabel}>Right</span>
        </div>
      </div>

      {/* ── Hover demo ──────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Hover demo</h2>
      <p className={styles.delayNote}>300 ms delay before appearing, instant hide on leave.</p>

      <div style={{ display: 'flex', gap: 32, alignItems: 'center', paddingTop: 32, paddingBottom: 32 }}>
        <Tooltip label="Bold">
          <DemoBtn svg={boldSvg} label="Bold" />
        </Tooltip>
        <Tooltip label="Add attachment">
          <DemoBtn svg={plusSvg} label="Add attachment" />
        </Tooltip>
        <Tooltip label="Long tooltip text that stays on one line">
          <DemoBtn label="Long label" />
        </Tooltip>
      </div>

      {/* ── Multi-line variant ──────────────────────── */}
      <h2 className={styles.sectionTitle}>Multi-line (document names)</h2>
      <p className={styles.delayNote}>
        Max width 400 px. Text wraps to the next line. Max 250 characters displayed.
      </p>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', paddingTop: 32, paddingBottom: 48 }}>
        <Tooltip
          label="NDA-Agreement Board of Directors_Q3_12_2023"
          position="bottom"
          maxWidth={400}
        >
          <Button variant="secondary" size="s">Docume…name.pdf</Button>
        </Tooltip>
      </div>

      {/* ── Spec ────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Spec</h2>
      <div className={styles.specTable}>
        <span className={styles.specLabel}>Background</span>
        <span className={styles.specValue}>stone-1000 (#1F2129)</span>

        <span className={styles.specLabel}>Text color</span>
        <span className={styles.specValue}>stone-0 (#FFFFFF)</span>

        <span className={styles.specLabel}>Padding</span>
        <span className={styles.specValue}>4px 12px</span>

        <span className={styles.specLabel}>Border radius</span>
        <span className={styles.specValue}>4px (radius-sm)</span>

        <span className={styles.specLabel}>Typography</span>
        <span className={styles.specValue}>14px / 20px, Medium (500)</span>

        <span className={styles.specLabel}>Height (single line)</span>
        <span className={styles.specValue}>28px</span>

        <span className={styles.specLabel}>Offset from trigger</span>
        <span className={styles.specValue}>4px</span>

        <span className={styles.specLabel}>Hover delay</span>
        <span className={styles.specValue}>300 ms</span>

        <span className={styles.specLabel}>Default position</span>
        <span className={styles.specValue}>Top, centered horizontally</span>

        <span className={styles.specLabel}>Document name max-width</span>
        <span className={styles.specValue}>400px</span>
      </div>
    </div>
  )
}
