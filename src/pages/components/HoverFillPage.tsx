/* HoverFillPage — experimental component showcase */

import { HoverFill } from '../../components/HoverFill/HoverFill'
import { Button } from '../../components/Button/Button'
import { TextField } from '../../components/TextField/TextField'
import { actions } from '../../icons/actions'
import { functional } from '../../icons/functional'
import styles from './HoverFillPage.module.css'
import { SourceLink } from '../SourceLink'

const editSvg = actions.find(i => i.name === 'edit-alt')!.svg
const moreSvg = functional.find(i => i.name === 'ellipsis-h')!.svg

function Icon({ svg }: { svg: string }) {
  const colored = svg.replace(/fill="#[0-9A-Fa-f]{3,8}"/gi, 'fill="currentColor"')
  return <span className={styles.icon} dangerouslySetInnerHTML={{ __html: colored }} />
}

/** Borderless square icon button. DS icon sizes only: 16px or 20px glyph. */
function IconButton({ size, svg, label }: { size: 16 | 20; svg: string; label: string }) {
  return (
    <button
      type="button"
      className={styles.iconBtn}
      style={{ width: size, height: size }}
      aria-label={label}
    >
      <Icon svg={svg} />
    </button>
  )
}

export default function HoverFillPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Hover Fill</h1>
      <p className={styles.subtitle}>
        Experimental · A wrapper that gives a borderless element a soft background on hover,
        intensifying on press / focus. The fill extends 6px beyond the element on every side
        and never shifts layout. Borderless buttons and no-border fields only.
      </p>
      <SourceLink path="src/components/HoverFill/HoverFill.tsx" />

      {/* ── Icon buttons ───────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Borderless icon buttons</h2>
      <p className={styles.note}>
        DS icon sizes only. The fixed 6px offset gives a 16px icon a 28×28 hover area and a 20px
        icon a 32×32 hover area. Hover for a light fill (10%); press or focus for the strong fill
        (20%). Hand cursor throughout.
      </p>
      <div className={styles.grid}>
        <span className={styles.colHeader}>16px icon · 28×28 hover</span>
        <span className={styles.colHeader}>20px icon · 32×32 hover</span>
        <HoverFill as="button" className={styles.iconWrap}><IconButton size={16} svg={editSvg} label="Edit" /></HoverFill>
        <HoverFill as="button" className={styles.iconWrap}><IconButton size={20} svg={editSvg} label="Edit" /></HoverFill>
        <HoverFill as="button" className={styles.iconWrap}><IconButton size={16} svg={moreSvg} label="More" /></HoverFill>
        <HoverFill as="button" className={styles.iconWrap}><IconButton size={20} svg={moreSvg} label="More" /></HoverFill>
      </div>

      {/* ── Label-only buttons ─────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Label-only buttons</h2>
      <p className={styles.note}>
        Tertiary text buttons. The fill extends 6px on every side, the same offset used for icon
        buttons and fields.
      </p>
      <div className={styles.row}>
        <HoverFill as="button">
          <Button variant="tertiary" intent="neutral" size="m">Edit label</Button>
        </HoverFill>
        <HoverFill as="button">
          <Button variant="tertiary" intent="neutral" size="s">Rename</Button>
        </HoverFill>
      </div>

      {/* ── Borderless fields ──────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Borderless fields</h2>
      <p className={styles.note}>
        Hover and focus use the same light fill — only the cursor changes (hand on hover, text
        when editing). The fill persists while the field is active (focus-within), with a 6px
        hover area on every side.
      </p>
      <div className={styles.row}>
        <HoverFill as="field" className={styles.fieldInline}>
          <TextField variant="no-border" placeholder="Inline editable title" defaultValue="Project Apollo" />
        </HoverFill>
      </div>

      {/* ── Adjacent / overlap ─────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Adjacent elements</h2>
      <p className={styles.note}>
        Because the fill extends 6px per side, gaps under 12px make hover zones overlap. The tight
        row (4px gap) overlaps; the comfortable row (16px gap) does not. (16px icon buttons.)
      </p>
      <div className={styles.rowTight}>
        <HoverFill as="button" className={styles.iconWrap}><IconButton size={16} svg={editSvg} label="Edit" /></HoverFill>
        <HoverFill as="button" className={styles.iconWrap}><IconButton size={16} svg={moreSvg} label="More" /></HoverFill>
        <HoverFill as="button" className={styles.iconWrap}><IconButton size={16} svg={editSvg} label="Edit" /></HoverFill>
      </div>
      <div className={styles.rowLoose}>
        <HoverFill as="button" className={styles.iconWrap}><IconButton size={16} svg={editSvg} label="Edit" /></HoverFill>
        <HoverFill as="button" className={styles.iconWrap}><IconButton size={16} svg={moreSvg} label="More" /></HoverFill>
        <HoverFill as="button" className={styles.iconWrap}><IconButton size={16} svg={editSvg} label="Edit" /></HoverFill>
      </div>
    </div>
  )
}
