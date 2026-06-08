/* DatePicker — Figma node 24002-10435
   Trigger mirrors TextField/Dropdown shell.
   Popover renders the Calendar component. */

import {
  type ReactNode,
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
} from 'react'
import { createPortal } from 'react-dom'
import { HintRow }    from '../shared/HintRow'
import { Tooltip }    from '../Tooltip/Tooltip'
import { Calendar }   from '../Calendar/Calendar'
import { dateTime }   from '../../icons/dateTime'
import { actions }    from '../../icons/actions'
import styles from './DatePicker.module.css'

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toInputFormat(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}/${day}/${d.getFullYear()}`
}

function parseMMDDYYYY(str: string): Date | null {
  const match = str.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null
  const mo = parseInt(match[1], 10)
  const d  = parseInt(match[2], 10)
  const y  = parseInt(match[3], 10)
  const date = new Date(y, mo - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null
  return date
}

/* ── Icons ────────────────────────────────────────────────────────────────── */

const calenderSvg = dateTime.find(i => i.name === 'calender')!.svg
const clearSvg    = actions.find(i => i.name === 'multiply')!.svg

/* ── Types ────────────────────────────────────────────────────────────────── */

export type DatePickerSize    = 's' | 'm' | 'l'
export type DatePickerVariant = 'outline' | 'no-border'

export interface DatePickerProps {
  /** Single-select mode — selected date */
  value?:          Date | null
  onChange?:       (date: Date | null) => void
  /** Range mode — two-click selection inside one popover */
  mode?:           'range'
  rangeStart?:     Date | null
  rangeEnd?:       Date | null
  onRangeChange?:  (start: Date | null, end: Date | null) => void
  size?:           DatePickerSize
  variant?:        DatePickerVariant
  label?:          ReactNode
  placeholder?:    string
  /** Show an × clear button when value is set */
  clearable?:      boolean
  helper?:         ReactNode
  disabled?:       boolean
  /** true = red border only; string = red border + error message */
  error?:          boolean | string
  className?:      string
}

/* ── Size helpers ─────────────────────────────────────────────────────────── */

const sizeCls: Record<DatePickerSize, string> = {
  s: styles.sizeS,
  m: styles.sizeM,
  l: styles.sizeL,
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function DatePicker({
  value,
  onChange,
  mode,
  rangeStart:  rangeStartProp,
  rangeEnd:    rangeEndProp,
  onRangeChange,
  size        = 'm',
  variant     = 'outline',
  label,
  placeholder = 'MM/DD/YYYY',
  clearable   = false,
  helper,
  disabled    = false,
  error       = false,
  className,
}: DatePickerProps) {

  const isRange    = mode === 'range'
  const isNoBorder = variant === 'no-border'
  const hasError   = Boolean(error)
  const hintText   = (typeof error === 'string' ? error : undefined) ?? helper

  /* ── Range state (range mode only) ──────────────────────────────────── */

  const [rStart, setRStart] = useState<Date | null>(rangeStartProp ?? null)
  const [rEnd,   setREnd]   = useState<Date | null>(rangeEndProp   ?? null)

  /* ── Inline editing state ────────────────────────────────────────────── */

  const [editing,   setEditing]   = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef        = useRef<HTMLInputElement>(null)
  const pendingClickX   = useRef<number | null>(null)

  /* ── Derived display values ──────────────────────────────────────────── */

  const hasValue = isRange
    ? Boolean(rStart && rEnd)
    : value instanceof Date

  const displayText = isRange
    ? (rStart && rEnd
        ? `${formatDate(rStart)} – ${formatDate(rEnd)}`
        : rStart
          ? `${formatDate(rStart)} – ...`
          : placeholder)
    : hasValue ? formatDate(value as Date) : placeholder

  const [open, setOpen] = useState(false)
  const [pos,  setPos]  = useState({ top: 0, right: 0 })
  const triggerRef      = useRef<HTMLDivElement>(null)
  const popoverRef      = useRef<HTMLDivElement>(null)
  const uid             = useId()

  /* ── Open / close ─────────────────────────────────────────────────────── */

  const openPopover = useCallback(() => {
    if (!triggerRef.current || disabled) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
    setOpen(true)
  }, [disabled])

  const closePopover = useCallback(() => {
    setOpen(false)
  }, [])

  const toggle = () => (open ? closePopover() : openPopover())

  /* Close on outside click */
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || popoverRef.current?.contains(t)) return
      closePopover()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, closePopover])

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closePopover() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, closePopover])

  /* Reposition on scroll / resize while open */
  useEffect(() => {
    if (!open) return
    const update = () => {
      if (!triggerRef.current) return
      const r = triggerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  /* ── Inline editing ────────────────────────────────────────────────────── */

  const startEditing = (e: React.MouseEvent) => {
    if (disabled || isRange) return
    e.stopPropagation()
    pendingClickX.current = e.clientX
    setEditValue(!isRange && value instanceof Date ? toInputFormat(value) : '')
    setEditing(true)
    openPopover()
  }

  /* Position cursor at click point after input renders */
  useEffect(() => {
    if (!editing || !inputRef.current || pendingClickX.current === null) return
    const input = inputRef.current
    const clickX = pendingClickX.current
    pendingClickX.current = null
    requestAnimationFrame(() => {
      const rect = input.getBoundingClientRect()
      const relX = clickX - rect.left
      const text = input.value
      if (!text || relX <= 0) { input.setSelectionRange(0, 0); return }
      const style = window.getComputedStyle(input)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      let offset = text.length
      for (let i = 1; i <= text.length; i++) {
        if (ctx.measureText(text.slice(0, i)).width >= relX) { offset = i - 1; break }
      }
      input.setSelectionRange(offset, offset)
    })
  }, [editing])

  const commitEdit = () => {
    if (!isRange) {
      const parsed = parseMMDDYYYY(editValue)
      if (parsed) onChange?.(parsed)
      else if (editValue.trim() === '') onChange?.(null)
    }
    setEditing(false)
  }

  /* ── Interactions ─────────────────────────────────────────────────────── */

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isRange) {
      setRStart(null); setREnd(null)
      onRangeChange?.(null, null)
    } else {
      onChange?.(null)
    }
  }

  const handleCalendarChange = (d: Date) => {
    if (!isRange) { onChange?.(d); closePopover(); return }

    if (!rStart || (rStart && rEnd)) {
      setRStart(d)
      setREnd(null)
    } else {
      const lo = rStart <= d ? rStart : d
      const hi = rStart <= d ? d      : rStart
      setRStart(lo); setREnd(hi)
      onRangeChange?.(lo, hi)
      closePopover()
    }
  }

  /* ── CSS classes ──────────────────────────────────────────────────────── */

  const wrapperCls = [
    styles.wrapper,
    sizeCls[size],
    open       ? styles.isOpen     : '',
    editing    ? styles.isEditing  : '',
    disabled   ? styles.isDisabled : '',
    hasError   ? styles.hasError   : '',
    isNoBorder ? styles.noBorder   : styles.outline,
    className ?? '',
  ].filter(Boolean).join(' ')

  const triggerCls = [
    styles.trigger,
    !hasValue && !editing ? styles.isPlaceholder : '',
  ].filter(Boolean).join(' ')

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className={wrapperCls}>

      {/* Label */}
      {label !== undefined && (
        <label className={styles.label} htmlFor={uid}>{label}</label>
      )}

      {/* Trigger */}
      <div
        ref={triggerRef}
        id={uid}
        className={triggerCls}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={!disabled && !editing ? openPopover : undefined}
        onKeyDown={e => {
          if (editing) return
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
          if (e.key === 'Escape') closePopover()
        }}
      >
        {/* Value / placeholder text — click starts inline edit */}
        {editing ? (
          <input
            ref={inputRef}
            className={styles.editInput}
            value={editValue}
            autoFocus
            placeholder="MM/DD/YYYY"
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
              if (e.key === 'Escape') { e.stopPropagation(); setEditing(false) }
            }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span
            className={styles.triggerText}
            onClick={!isRange ? startEditing : undefined}
          >
            {displayText}
          </span>
        )}

        {/* Clear button */}
        {clearable && !disabled && (
          isNoBorder ? (
            hasValue ? (
              <Tooltip label="Clear" position="top">
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={clearValue}
                  aria-label="Clear date"
                  tabIndex={-1}
                >
                  <span className={styles.clearIcon} dangerouslySetInnerHTML={{ __html: clearSvg }} />
                </button>
              </Tooltip>
            ) : null
          ) : (
            hasValue ? (
              <Tooltip label="Clear" position="top">
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={clearValue}
                  aria-label="Clear date"
                  tabIndex={-1}
                >
                  <span className={styles.clearIcon} dangerouslySetInnerHTML={{ __html: clearSvg }} />
                </button>
              </Tooltip>
            ) : (
              <button
                type="button"
                className={`${styles.clearBtn} ${styles.clearBtnHidden}`}
                tabIndex={-1}
                aria-hidden="true"
              >
                <span className={styles.clearIcon} dangerouslySetInnerHTML={{ __html: clearSvg }} />
              </button>
            )
          )
        )}

        {/* Calendar icon — outline: opens popover on click */}
        {!isNoBorder && (
          <span
            className={styles.calendarIcon}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: calenderSvg }}
            onClick={e => { e.stopPropagation(); if (!disabled) toggle() }}
          />
        )}
      </div>

      {/* Hint / error row */}
      {hintText !== undefined && (
        <HintRow text={hintText} error={hasError} />
      )}

      {/* Popover — Calendar, rendered via portal */}
      {open && createPortal(
        <div
          ref={popoverRef}
          className={styles.popover}
          style={{ top: pos.top, right: pos.right }}
          role="dialog"
          aria-label="Date picker"
        >
          <Calendar
            value={!isRange && hasValue ? (value as Date) : null}
            rangeStart={isRange ? rStart : rangeStartProp}
            rangeEnd={isRange ? rEnd   : rangeEndProp}
            onChange={handleCalendarChange}
          />
        </div>,
        document.body,
      )}

    </div>
  )
}

export default DatePicker
