/* DocumentToolsSheet — the phone "Document tools" bottom sheet, shared by the
   board-book test versions (Version 2 opens it from a floating dots button,
   Version 3 from the dots button in its bottom bar).

   DS bottom Drawer laid out like the DS Droplist (Figma Design system
   37434-130412): a Zoom row (− % +), then view rows, a divider and the
   annotation rows. Picking a row applies it and closes the sheet; the zoom
   stepper keeps it open. Selected rows take the hover fill. */

import { Button } from '../../components/Button/Button'
import { Drawer } from '../../components/Drawer/Drawer'
import { actions } from '../../icons/actions'
import styles from './DocumentToolsSheet.module.css'

const icon = (name: string) => actions.find(i => i.name === name)!.svg
const zoomInSvg  = icon('plus')
const zoomOutSvg = icon('minus')

const Ico = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)

export interface SheetRow {
  key: string
  label: string
  /** Raw SVG from a DS icon set. */
  icon: string
  selected?: boolean
  onPick: () => void
}

export interface DocumentToolsSheetProps {
  open: boolean
  onClose: () => void
  zoomLabel: string
  canZoomOut: boolean
  canZoomIn: boolean
  onZoomOut: () => void
  onZoomIn: () => void
  /** Fit / size / fullscreen rows. */
  viewRows: SheetRow[]
  /** Annotation rows, below the divider. */
  toolRows: SheetRow[]
}

export function DocumentToolsSheet({
  open, onClose, zoomLabel, canZoomOut, canZoomIn, onZoomOut, onZoomIn, viewRows, toolRows,
}: DocumentToolsSheetProps) {
  const row = (r: SheetRow) => (
    <button
      key={r.key}
      type="button"
      className={[styles.row, r.selected ? styles.rowSelected : ''].join(' ')}
      aria-pressed={!!r.selected}
      onClick={() => { r.onPick(); onClose() }}
    >
      <span className={styles.icon} aria-hidden="true"><Ico svg={r.icon} /></span>
      {r.label}
    </button>
  )

  return (
    <Drawer
      variant="overlay"
      side="bottom"
      open={open}
      onClose={onClose}
      ariaLabel="Document tools"
      bodyClassName={styles.body}
    >
      <div className={styles.zoom} role="group" aria-label="Zoom">
        <span className={styles.label}>Zoom</span>
        <div className={styles.stepper}>
          <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={zoomOutSvg} />}
            disabled={!canZoomOut} onClick={onZoomOut} aria-label="Zoom out" />
          <span className={styles.zoomValue} aria-live="polite">{zoomLabel}</span>
          <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={zoomInSvg} />}
            disabled={!canZoomIn} onClick={onZoomIn} aria-label="Zoom in" />
        </div>
      </div>
      {viewRows.map(row)}
      <hr className={styles.divider} />
      {toolRows.map(row)}
    </Drawer>
  )
}

export default DocumentToolsSheet
