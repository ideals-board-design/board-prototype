/* PurposeField — inline no-border purpose picker for an agenda item.
   Figma "Purpose (new)" (11808-127255): the "Purpose ⌄" meta chip opens a menu of
   the group's purpose options, each with a coloured tag. Selecting one saves it to
   the item and the chip becomes the coloured tag. Options are scoped per group and
   passed in by the caller; an "Edit options" action sits at the bottom. */

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { arrows }  from '../icons/arrows'
import { actions } from '../icons/actions'
import styles from './PurposeField.module.css'

const chevronDownSvg = arrows.find(i => i.name === 'angle-down-fill')!.svg
const chevronUpSvg   = arrows.find(i => i.name === 'angle-up-fill')!.svg
const labelSvg       = actions.find(i => i.name === 'label')!.svg
const editSvg        = actions.find(i => i.name === 'edit-alt')!.svg

export interface PurposeOption {
  value: string
  label: string
  /** CSS colour for the tag — a token string, e.g. "var(--tag-orange)" */
  color: string
}

export interface PurposeFieldProps {
  /** The group's purpose options (scoped per group/subcommittee) */
  options:        PurposeOption[]
  value?:         string
  onChange:       (value: string) => void
  onEditOptions?: () => void
  disabled?:      boolean
}

export function PurposeField({ options, value, onChange, onEditOptions, disabled = false }: PurposeFieldProps) {
  const [open, setOpen] = useState(false)
  const [pos,  setPos]  = useState({ top: 0, left: 0 })

  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left })
  }, [])

  const openMenu  = useCallback(() => {
    if (disabled) return
    calcPos()
    setOpen(true)
  }, [disabled, calcPos])
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

  const pick = (v: string) => { onChange(v); closeMenu() }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[styles.trigger, selected ? styles.triggerSelected : ''].filter(Boolean).join(' ')}
        onClick={() => (open ? closeMenu() : openMenu())}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <>
            <span className={styles.tagIcon} style={{ color: selected.color }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: labelSvg }} />
            {selected.label}
          </>
        ) : 'Purpose'}
        <span className={styles.chevron} aria-hidden="true" dangerouslySetInnerHTML={{ __html: open ? chevronUpSvg : chevronDownSvg }} />
      </button>

      {open && createPortal(
        <div ref={menuRef} className={styles.menu} style={{ top: pos.top, left: pos.left }} role="listbox">
          {options.map(o => {
            const isSel = o.value === value
            return (
              <div
                key={o.value}
                className={[styles.item, isSel ? styles.itemSelected : ''].filter(Boolean).join(' ')}
                role="option"
                aria-selected={isSel}
                onMouseDown={e => e.preventDefault()}
                onClick={() => pick(o.value)}
              >
                <span className={styles.tagIcon} style={{ color: o.color }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: labelSvg }} />
                <span className={styles.itemLabel}>{o.label}</span>
              </div>
            )
          })}
          {onEditOptions && (
            <>
              <div className={styles.divider} role="separator" />
              <div
                className={styles.item}
                role="option"
                aria-selected={false}
                onMouseDown={e => e.preventDefault()}
                onClick={() => { closeMenu(); onEditOptions() }}
              >
                <span className={styles.editIcon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: editSvg }} />
                <span className={styles.itemLabelMuted}>Edit options</span>
              </div>
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  )
}

export default PurposeField
