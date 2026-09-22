/* Drawer — the shared 460px side-panel shell used across the app (Tasks list,
   agenda Document Request, …). Two modes:
   - overlay=false (default): an inline column that sits inside a flex-row layout
     and pushes content aside (Tasks pattern, Figma 35354-11460).
   - overlay=true: the same panel floating over the page with a dim backdrop
     (portal), for contexts without a column slot (agenda Document Request).
   Compose it with DrawerHeader in `header` and StickyFooter in `footer`. */

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './Drawer.module.css'

export interface DrawerProps {
  open:       boolean
  onClose:    () => void
  header:     ReactNode
  footer?:    ReactNode
  children:   ReactNode
  /** true = floating panel + dim backdrop (portal); false = inline column. */
  overlay?:   boolean
  width?:     number
  className?: string
}

export function Drawer({
  open,
  onClose,
  header,
  footer,
  children,
  overlay = false,
  width = 460,
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!open || !overlay) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, overlay, onClose])

  if (!open) return null

  const panel = (
    <div
      className={[styles.drawer, className].filter(Boolean).join(' ')}
      style={{ width }}
      role="dialog"
      aria-modal={overlay || undefined}
      onClick={overlay ? e => e.stopPropagation() : undefined}
    >
      {header}
      <div className={styles.body}>{children}</div>
      {footer}
    </div>
  )

  if (!overlay) return panel

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>{panel}</div>,
    document.body,
  )
}

export default Drawer
