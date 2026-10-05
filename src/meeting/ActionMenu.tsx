/* ActionMenu — a small popover action menu anchored under a trigger button.
   Generalises the ItemMenu pattern (portal, outside-click / Escape close,
   reposition on scroll/resize) so it can drive both an icon-only "…" kebab
   (e.g. an attachment row) and a labelled secondary button (e.g. "Add
   document"). Figma 11998-197472 (attachment contextual menu). */

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../components/Button/Button'
import { functional } from '../icons/functional'
import styles from './ActionMenu.module.css'

const ellipsisSvg = functional.find(i => i.name === 'ellipsis-h')!.svg

export interface ActionMenuItem {
  key:     string
  label:   string
  icon:    string            // raw SVG string from an icon set
  danger?: boolean
  onSelect: () => void
}

export interface ActionMenuProps {
  items: ActionMenuItem[]
  /** Which edge of the trigger the menu's matching edge anchors under. */
  align?: 'left' | 'right'
  /** 'kebab' = icon-only "…" trigger; 'button' = labelled secondary button. */
  trigger?: 'kebab' | 'button'
  triggerLabel?: string
  /** Leading icon for a 'button' trigger. */
  triggerIcon?: string
  /** Trigger button size (S=32px kebab for compact rows). */
  size?: 's' | 'm' | 'l'
  ariaLabel?: string
  disabled?: boolean
  className?: string
}

export function ActionMenu({
  items,
  align = 'right',
  trigger = 'kebab',
  triggerLabel,
  triggerIcon,
  size = 'm',
  ariaLabel,
  disabled,
  className,
}: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos,  setPos]  = useState({ top: 0, left: 0, right: 0 })

  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left, right: window.innerWidth - r.right })
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

  const anchor = align === 'right' ? { top: pos.top, right: pos.right } : { top: pos.top, left: pos.left }

  return (
    <div ref={triggerRef} className={[styles.wrap, className].filter(Boolean).join(' ')}>
      {trigger === 'kebab' ? (
        <Button
          variant="tertiary"
          intent="neutral"
          size={size}
          disabled={disabled}
          iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: ellipsisSvg }} />}
          onClick={() => (open ? closeMenu() : openMenu())}
          aria-label={ariaLabel ?? 'More options'}
          aria-haspopup="menu"
          aria-expanded={open}
        />
      ) : (
        <Button
          variant="secondary"
          intent="neutral"
          size="m"
          disabled={disabled}
          iconLeft={triggerIcon ? <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: triggerIcon }} /> : undefined}
          onClick={() => (open ? closeMenu() : openMenu())}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {triggerLabel}
        </Button>
      )}

      {open && createPortal(
        <div ref={menuRef} className={styles.menu} style={anchor} role="menu">
          {items.map(it => (
            <button
              key={it.key}
              type="button"
              className={[styles.item, it.danger ? styles.itemDanger : ''].filter(Boolean).join(' ')}
              role="menuitem"
              onClick={() => run(it.onSelect)}
            >
              <span className={styles.icon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: it.icon }} />
              {it.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}

export default ActionMenu
