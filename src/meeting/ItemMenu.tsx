/* ItemMenu — the agenda item "…" (More options) menu: Duplicate / Delete.
   Figma 29644-51384. Anchored below-right of the ellipsis trigger. */

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Button }    from '../components/Button/Button'
import { functional } from '../icons/functional'
import { actions }   from '../icons/actions'
import styles from './ItemMenu.module.css'

const ellipsisSvg  = functional.find(i => i.name === 'ellipsis-h')!.svg
const duplicateSvg = actions.find(i => i.name === 'copy')!.svg
const deleteSvg    = actions.find(i => i.name === 'trash-alt')!.svg

export interface ItemMenuProps {
  onDuplicate: () => void
  onDelete:    () => void
}

export function ItemMenu({ onDuplicate, onDelete }: ItemMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos,  setPos]  = useState({ top: 0, right: 0 })

  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)

  /* Anchor the menu's top-right under the trigger's right edge. */
  const calcPos = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
  }, [])

  const openMenu  = useCallback(() => { calcPos(); setOpen(true) }, [calcPos])
  const closeMenu = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      closeMenu()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, closeMenu])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, closeMenu])

  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [open, calcPos])

  const run = (fn: () => void) => { closeMenu(); fn() }

  return (
    <div ref={triggerRef} className={styles.wrap}>
      <Button
        variant="tertiary"
        intent="neutral"
        size="m"
        iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: ellipsisSvg }} />}
        onClick={() => (open ? closeMenu() : openMenu())}
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
      />

      {open && createPortal(
        <div ref={menuRef} className={styles.menu} style={{ top: pos.top, right: pos.right }} role="menu">
          <button type="button" className={styles.item} role="menuitem" onClick={() => run(onDuplicate)}>
            <span className={styles.icon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: duplicateSvg }} />
            Duplicate
          </button>
          <button type="button" className={[styles.item, styles.itemDanger].join(' ')} role="menuitem" onClick={() => run(onDelete)}>
            <span className={styles.icon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: deleteSvg }} />
            Delete
          </button>
        </div>,
        document.body,
      )}
    </div>
  )
}

export default ItemMenu
