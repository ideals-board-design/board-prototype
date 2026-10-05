/* DurationField — inline no-border duration picker for an agenda item.
   Figma "Duration, Purpose" section (11710-104361): the "5 min ⌄" meta chip opens
   a menu of preset durations (0/1/5/10/15/30 min) plus a "Custom" action that
   swaps the chip for a minutes input. Selecting a preset updates the item's
   duration. Time-range recalculation is intentionally left out — the designer
   note ("New logic 💡") flags that duration→time behaviour is still being decided. */

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { arrows } from '../icons/arrows'
import styles from './DurationField.module.css'

const chevronDownSvg = arrows.find(i => i.name === 'angle-down-fill')!.svg
const chevronUpSvg   = arrows.find(i => i.name === 'angle-up-fill')!.svg

/** Preset options shown in the menu, in Figma order */
const PRESET_MINUTES = [0, 1, 5, 10, 15, 30]

export interface DurationFieldProps {
  /** Current duration in whole minutes */
  minutes:   number
  onChange:  (minutes: number) => void
  disabled?: boolean
}

export function DurationField({ minutes, onChange, disabled = false }: DurationFieldProps) {
  const [open,       setOpen]       = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [pos,        setPos]        = useState({ top: 0, left: 0 })

  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)

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

  /* Outside click closes the menu */
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

  /* Escape closes the menu */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, closeMenu])

  /* Re-anchor on scroll / resize while open */
  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [open, calcPos])

  const pickPreset  = (m: number) => { onChange(m); closeMenu() }
  const startCustom = () => { closeMenu(); setCustomMode(true) }

  const commitCustom = (raw: string) => {
    const parsed = parseInt(raw, 10)
    if (!Number.isNaN(parsed) && parsed >= 0) onChange(parsed)
    setCustomMode(false)
  }

  /* ── Custom input mode — chip swaps for a minutes field ─────────────────── */
  if (customMode) {
    return (
      <span className={styles.customWrap}>
        <input
          className={styles.customInput}
          type="number"
          min={0}
          autoFocus
          defaultValue={minutes}
          onBlur={e => commitCustom(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter')  { e.preventDefault(); commitCustom((e.target as HTMLInputElement).value) }
            if (e.key === 'Escape') { e.preventDefault(); setCustomMode(false) }
          }}
          aria-label="Custom duration in minutes"
        />
        <span className={styles.customSuffix} aria-hidden="true">min</span>
      </span>
    )
  }

  /* ── Chip trigger + menu ────────────────────────────────────────────────── */
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => (open ? closeMenu() : openMenu())}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {minutes} min
        <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: open ? chevronUpSvg : chevronDownSvg }} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className={styles.menu}
          style={{ top: pos.top, left: pos.left }}
          role="listbox"
        >
          {PRESET_MINUTES.map(m => {
            const selected = m === minutes
            return (
              <div
                key={m}
                className={[styles.item, selected ? styles.itemSelected : ''].filter(Boolean).join(' ')}
                role="option"
                aria-selected={selected}
                onMouseDown={e => e.preventDefault()}
                onClick={() => pickPreset(m)}
              >
                {m} min
              </div>
            )
          })}
          <div
            className={styles.item}
            role="option"
            aria-selected={false}
            onMouseDown={e => e.preventDefault()}
            onClick={startCustom}
          >
            Custom
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

export default DurationField
