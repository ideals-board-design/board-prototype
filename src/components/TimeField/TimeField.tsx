/* TimeField — segmented time input (MUI TimeField-style) with a pick-list.
   Sections hours : minutes meridiem (hh:mm aa), each set by typing or ↑/↓.
   Clicking/focusing the field also opens a droplist of times to pick from.
   The borderless variant carries the experimental hover fill. See PRD: Time Picker. */

import {
  useEffect, useRef, useState,
  type KeyboardEvent, type ClipboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import styles from './TimeField.module.css'

export type TimeFieldVariant = 'outline' | 'no-border'

export interface TimeFieldProps {
  /** "hh:mm AM" (e.g. "10:00 AM") or "" when not fully set */
  value?: string
  onChange?: (value: string) => void
  variant?: TimeFieldVariant
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

type Meridiem = '' | 'AM' | 'PM'

/* Pick-list — every 30 minutes, 12-hour with meridiem */
const TIME_LIST = (() => {
  const out: string[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of ['00', '30']) {
      const ampm = h < 12 ? 'AM' : 'PM'
      const hr = h % 12 === 0 ? 12 : h % 12
      out.push(`${String(hr).padStart(2, '0')}:${m} ${ampm}`)
    }
  }
  return out
})()

function parse(v: string) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((v ?? '').trim())
  return m
    ? { h: m[1].padStart(2, '0'), mm: m[2], mer: m[3].toUpperCase() as Meridiem }
    : { h: '', mm: '', mer: '' as Meridiem }
}

export function TimeField({
  value = '',
  onChange,
  variant = 'outline',
  disabled = false,
  'aria-label': ariaLabel,
  className,
}: TimeFieldProps) {
  const init = parse(value)
  const [h, setH]     = useState(init.h)
  const [mm, setMm]   = useState(init.mm)
  const [mer, setMer] = useState<Meridiem>(init.mer)
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0 })

  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const hRef = useRef<HTMLInputElement>(null)
  const mRef = useRef<HTMLInputElement>(null)
  const aRef = useRef<HTMLInputElement>(null)
  const fresh = useRef(true)              // next digit overwrites the section
  const lastEmitted = useRef(value)

  const current = h && mm && mer ? `${h}:${mm} ${mer}` : ''

  /* Re-sync from value prop on genuine external change */
  useEffect(() => {
    if (value === lastEmitted.current) return
    const p = parse(value)
    setH(p.h); setMm(p.mm); setMer(p.mer)
    lastEmitted.current = value
  }, [value])

  const emit = (nh: string, nm: string, na: string) => {
    const out = nh && nm && na ? `${nh.padStart(2, '0')}:${nm} ${na}` : ''
    lastEmitted.current = out
    onChange?.(out)
  }

  /* ── Pick-list ──────────────────────────────────────── */
  const openList = () => {
    if (disabled) return
    const r = rootRef.current?.getBoundingClientRect()
    // +10 = 6px hover-fill that extends below the focused field + 4px gap
    if (r) setPos({ top: r.bottom + 10, left: r.left })
    setOpen(true)
  }
  const closeList = () => setOpen(false)
  const pick = (t: string) => {
    const p = parse(t)
    setH(p.h); setMm(p.mm); setMer(p.mer); emit(p.h, p.mm, p.mer)
    closeList()
  }

  /* Scroll the selected time into view when the list opens */
  useEffect(() => {
    if (!open) return
    const sel = listRef.current?.querySelector('[aria-selected="true"]')
    sel?.scrollIntoView({ block: 'center' })
  }, [open])

  /* Close on outside click */
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (rootRef.current?.contains(t) || listRef.current?.contains(t)) return
      closeList()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  /* ── Hours ──────────────────────────────────────────── */
  const typeHour = (digit: string) => {
    const base = fresh.current ? '' : h
    fresh.current = false
    let d = (base + digit).slice(-2)
    if (d.length === 2 && +d > 12) d = digit
    if (d === '00') d = '12'
    const advance = d.length === 2 || +d > 1
    if (advance) d = d.padStart(2, '0')
    setH(d); emit(d, mm, mer)
    if (advance) focusMin()
  }
  const stepHour = (dir: 1 | -1) => {
    let n = h === '' ? (dir === 1 ? 0 : 1) : +h
    n = dir === 1 ? (n >= 12 ? 1 : n + 1) : (n <= 1 ? 12 : n - 1)
    const d = String(n).padStart(2, '0'); fresh.current = true; setH(d); emit(d, mm, mer)
  }

  /* ── Minutes ────────────────────────────────────────── */
  const typeMin = (digit: string) => {
    const base = fresh.current ? '' : mm
    fresh.current = false
    let d = (base + digit).slice(-2)
    if (d.length === 1 && +d > 5) d = '0' + d
    else if (d.length === 2 && +d > 59) d = digit
    setMm(d); emit(h, d, mer)
    if (d.length === 2) focusMer()
  }
  const stepMin = (dir: 1 | -1) => {
    let n = mm === '' ? 0 : +mm
    n = dir === 1 ? (n >= 59 ? 0 : n + 1) : (n <= 0 ? 59 : n - 1)
    const d = String(n).padStart(2, '0'); fresh.current = true; setMm(d); emit(h, d, mer)
  }

  /* ── Focus helpers ──────────────────────────────────── */
  const focusSel = (el: HTMLInputElement | null) => { fresh.current = true; el?.focus(); el?.select() }
  const focusHour = () => focusSel(hRef.current)
  const focusMin  = () => focusSel(mRef.current)
  const focusMer  = () => focusSel(aRef.current)

  /* ── Key handlers ───────────────────────────────────── */
  const numKey = (
    e: KeyboardEvent<HTMLInputElement>,
    type: (d: string) => void,
    step: (dir: 1 | -1) => void,
    left: (() => void) | null,
    right: (() => void) | null,
    cur: string,
    clear: () => void,
  ) => {
    if (e.key === 'Escape')            { closeList(); return }
    if (/^\d$/.test(e.key))            { e.preventDefault(); type(e.key) }
    else if (e.key === 'ArrowUp')      { e.preventDefault(); step(1) }
    else if (e.key === 'ArrowDown')    { e.preventDefault(); step(-1) }
    else if (e.key === 'ArrowLeft')    { e.preventDefault(); left?.() }
    else if (e.key === 'ArrowRight')   { e.preventDefault(); right?.() }
    else if (e.key === 'Backspace')    { e.preventDefault(); cur === '' ? left?.() : clear() }
    else if (e.key !== 'Tab')          e.preventDefault()
  }
  const hourKey = (e: KeyboardEvent<HTMLInputElement>) =>
    numKey(e, typeHour, stepHour, null, focusMin, h, () => { setH(''); emit('', mm, mer) })
  const minKey = (e: KeyboardEvent<HTMLInputElement>) =>
    numKey(e, typeMin, stepMin, focusHour, focusMer, mm, () => { setMm(''); emit(h, '', mer) })
  const merKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const k = e.key.toLowerCase()
    if (e.key === 'Escape')         { closeList(); return }
    if (k === 'a')                  { e.preventDefault(); setMer('AM'); emit(h, mm, 'AM') }
    else if (k === 'p')             { e.preventDefault(); setMer('PM'); emit(h, mm, 'PM') }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault(); const na: Meridiem = mer === 'AM' ? 'PM' : 'AM'; setMer(na); emit(h, mm, na)
    } else if (e.key === 'ArrowLeft') { e.preventDefault(); focusMin() }
    else if (e.key === 'Backspace')   { e.preventDefault(); setMer(''); emit(h, mm, '') }
    else if (e.key !== 'Tab')         e.preventDefault()
  }

  /* Pad single digits + close list when focus leaves the whole field */
  const onBlur = () => {
    window.setTimeout(() => {
      const el = document.activeElement
      if (el === hRef.current || el === mRef.current || el === aRef.current) return
      if (listRef.current?.contains(el as Node)) return
      const hv = hRef.current?.value ?? ''
      const mv = mRef.current?.value ?? ''
      const av = aRef.current?.value ?? ''
      const nh = hv.length === 1 ? hv.padStart(2, '0') : hv
      const nm = mv.length === 1 ? mv.padStart(2, '0') : mv
      if (nh !== hv) setH(nh)
      if (nm !== mv) setMm(nm)
      if (nh !== hv || nm !== mv) emit(nh, nm, av)
      closeList()
    }, 0)
  }

  /* Paste a full "10:30 PM" into any section */
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const p = parse(e.clipboardData.getData('text'))
    if (!p.h && !p.mm && !p.mer) return
    e.preventDefault()
    setH(p.h); setMm(p.mm); setMer(p.mer); emit(p.h, p.mm, p.mer)
  }

  const cls = [
    styles.field,
    variant === 'no-border' ? styles.noBorder : styles.outline,
    disabled ? styles.disabled : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  const segProps = {
    type: 'text' as const,
    inputMode: 'numeric' as const,
    disabled,
    onPaste,
    onBlur,
    onFocus: () => { fresh.current = true; openList() },
    onClick: openList,
    autoComplete: 'off',
    spellCheck: false,
    onChange: () => {},
  }

  return (
    <div ref={rootRef} className={cls} role="group" aria-label={ariaLabel}>
      <input
        {...segProps}
        ref={hRef} className={styles.seg} value={h} placeholder="hh" onKeyDown={hourKey}
        role="spinbutton" aria-label="Hours"
        aria-valuemin={1} aria-valuemax={12} aria-valuenow={h ? +h : undefined} aria-valuetext={h || 'Empty'}
      />
      <span className={styles.sep}>:</span>
      <input
        {...segProps}
        ref={mRef} className={styles.seg} value={mm} placeholder="mm" onKeyDown={minKey}
        role="spinbutton" aria-label="Minutes"
        aria-valuemin={0} aria-valuemax={59} aria-valuenow={mm ? +mm : undefined} aria-valuetext={mm || 'Empty'}
      />
      <input
        {...segProps}
        ref={aRef} className={styles.segMer} value={mer} placeholder="aa" onKeyDown={merKey}
        role="spinbutton" aria-label="AM or PM" aria-valuetext={mer || 'Empty'}
      />

      {open && createPortal(
        <div
          ref={listRef}
          className={styles.list}
          style={{ top: pos.top, left: pos.left }}
          role="listbox"
          aria-label={ariaLabel ? `${ariaLabel} options` : 'Time options'}
        >
          {TIME_LIST.map(t => (
            <div
              key={t}
              className={`${styles.option} ${t === current ? styles.optionSelected : ''}`.trim()}
              role="option"
              aria-selected={t === current}
              onMouseDown={e => e.preventDefault()}
              onClick={() => pick(t)}
            >
              {t}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}

export default TimeField
