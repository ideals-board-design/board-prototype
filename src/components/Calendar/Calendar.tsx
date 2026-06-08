/* Calendar — Figma node 34696-4767 · 248×290px
   Assembles: Button (tertiary/neutral) · DateCell · YearCell */

import { useState, useMemo, useEffect, useRef } from 'react'
import { Button }   from '../Button/Button'
import { Tooltip }  from '../Tooltip/Tooltip'
import { DateCell } from '../DateCell/DateCell'
import { YearCell } from '../YearCell/YearCell'
import { arrows } from '../../icons/arrows'
import styles from './Calendar.module.css'

/* ── Icons ────────────────────────────────────────────────────────────────── */

const prevSvg     = arrows.find(i => i.name === 'angle-left-fill')!.svg
const nextSvg     = arrows.find(i => i.name === 'angle-right-fill')!.svg
const chevDownSvg = arrows.find(i => i.name === 'angle-down-fill')!.svg

/* ── Constants ────────────────────────────────────────────────────────────── */

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_LABELS = ['SU','MO','TU','WE','TH','FR','SA']

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface CalendarProps {
  /** Currently selected date (single-select mode) */
  value?:      Date | null
  /** Range start — enables range-highlight mode */
  rangeStart?: Date | null
  /** Range end */
  rangeEnd?:   Date | null
  /** Called when the user selects a day */
  onChange?:   (date: Date) => void
  className?:  string
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function Calendar({ value, rangeStart, rangeEnd, onChange, className }: CalendarProps) {
  const today   = useMemo(() => new Date(), [])
  const rootRef  = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const [viewDate, setViewDate] = useState<Date>(() => {
    const d = value ?? new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [yearOpen, setYearOpen] = useState(false)

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  /* ── Click-outside to close year popup ──────────────────────────────── */

  useEffect(() => {
    if (!yearOpen) return
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setYearOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [yearOpen])

  /* ── Auto-scroll to selected year when popup opens ───────────────────── */

  useEffect(() => {
    if (!yearOpen || !popupRef.current) return
    const selected = popupRef.current.querySelector('[data-selected="true"]') as HTMLElement | null
    if (selected) {
      selected.scrollIntoView({ block: 'center' })
    }
  }, [yearOpen])

  /* ── Build 6×7 day grid (always 42 cells → fixed height) ───────────── */

  const dayCells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay()
    const lastDate = new Date(year, month + 1, 0).getDate()
    const prevLast = new Date(year, month, 0).getDate()
    const cells: { day: number; inMonth: boolean }[] = []

    for (let i = 0; i < firstDow; i++) {
      cells.push({ day: prevLast - firstDow + 1 + i, inMonth: false })
    }
    for (let d = 1; d <= lastDate; d++) {
      cells.push({ day: d, inMonth: true })
    }
    for (let d = 1; cells.length < 42; d++) {
      cells.push({ day: d, inMonth: false })
    }
    return cells
  }, [year, month])

  /* ── Build year list (large scrollable range) ───────────────────────── */

  const yearRange = useMemo(() => {
    const start = year - 50
    const end   = year + 10
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [year])

  /* ── Navigation ─────────────────────────────────────────────────────── */

  const prevAction = yearOpen
    ? () => setViewDate(new Date(year - 12, month, 1))
    : () => setViewDate(new Date(year, month - 1, 1))

  const nextAction = yearOpen
    ? () => setViewDate(new Date(year + 12, month, 1))
    : () => setViewDate(new Date(year, month + 1, 1))

  /* ── Cell type helper ───────────────────────────────────────────────── */

  const getCellType = (day: number): 'default' | 'date-range' | 'selected' | 'today' => {
    const thisDate = new Date(year, month, day)

    // Range endpoints
    const isRangeStart = rangeStart != null &&
      rangeStart.getFullYear() === year &&
      rangeStart.getMonth()    === month &&
      rangeStart.getDate()     === day
    const isRangeEnd = rangeEnd != null &&
      rangeEnd.getFullYear() === year &&
      rangeEnd.getMonth()    === month &&
      rangeEnd.getDate()     === day

    if (isRangeStart || isRangeEnd) return 'selected'

    // In-range days
    if (rangeStart != null && rangeEnd != null) {
      const lo = rangeStart < rangeEnd ? rangeStart : rangeEnd
      const hi = rangeStart < rangeEnd ? rangeEnd   : rangeStart
      if (thisDate > lo && thisDate < hi) return 'date-range'
    }

    // Single value
    if (value != null &&
        value.getFullYear() === year &&
        value.getMonth()    === month &&
        value.getDate()     === day) return 'selected'

    // Today
    if (today.getFullYear() === year &&
        today.getMonth()    === month &&
        today.getDate()     === day)  return 'today'

    return 'default'
  }

  /* ── Render ─────────────────────────────────────────────────────────── */

  const iconPrev = <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: prevSvg }} />
  const iconNext = <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: nextSvg }} />

  return (
    <div ref={rootRef} className={[styles.calendar, className ?? ''].filter(Boolean).join(' ')}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <button
          className={styles.monthBtn}
          onClick={() => setYearOpen(v => !v)}
          aria-label={`${MONTHS[month]} ${year}, toggle year picker`}
          aria-expanded={yearOpen}
        >
          <span className={styles.monthLabel}>{MONTHS[month]} {year}</span>
          <span
            className={[styles.chevron, yearOpen ? styles.chevronUp : ''].filter(Boolean).join(' ')}
            aria-hidden="true"
          >
            <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: chevDownSvg }} />
          </span>
        </button>

        {!yearOpen && (
          <div className={styles.navGroup}>
            <Tooltip label="Previous month" position="top">
              <Button
                variant="tertiary"
                intent="neutral"
                size="m"
                iconOnly={iconPrev}
                onClick={prevAction}
                aria-label="Previous month"
              />
            </Tooltip>
            <Tooltip label="Next month" position="top">
              <Button
                variant="tertiary"
                intent="neutral"
                size="m"
                iconOnly={iconNext}
                onClick={nextAction}
                aria-label="Next month"
              />
            </Tooltip>
          </div>
        )}
      </div>

      {/* ── Day labels (always visible) ──────────────────────────────── */}
      <div className={styles.dayLabels}>
        {DAY_LABELS.map(d => (
          <span key={d} className={styles.dayLabel}>{d}</span>
        ))}
      </div>

      {/* ── Day grid (always visible) ─────────────────────────────────── */}
      <div className={styles.dayGrid}>
        {dayCells.map((cell, i) => (
          <div key={i} className={styles.cellSlot}>
            {cell.inMonth && (
              <DateCell
                day={cell.day}
                type={getCellType(cell.day)}
                onClick={() => onChange?.(new Date(year, month, cell.day))}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Year picker popup — overlays day grid ─────────────────────── */}
      {yearOpen && (
        <div className={styles.yearPopup} ref={popupRef}>
          <div className={styles.yearGrid}>
            {yearRange.map(y => (
              <div key={y} data-selected={y === year ? 'true' : undefined}>
                <YearCell
                  year={y}
                  type={y === year ? 'selected' : 'default'}
                  onClick={() => {
                    setViewDate(new Date(y, month, 1))
                    setYearOpen(false)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default Calendar
