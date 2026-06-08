/* DateCell — Figma node 24002-7087
   Individual day cell used in a calendar / date-picker grid.
   32×32px. Type drives the visual variant; hover handled by CSS :hover.
   Pass forceHover=true to pin the hover appearance (showcase/testing). */

import styles from './DateCell.module.css'

/* ── Types ────────────────────────────────────────────────────────────────── */

export type DateCellType = 'default' | 'date-range' | 'selected' | 'today'

export interface DateCellProps {
  /** Day number to display (1–31) */
  day:         number
  type?:       DateCellType
  disabled?:   boolean
  onClick?:    () => void
  /** Forces hover visual state — for showcase / Storybook only */
  forceHover?: boolean
  className?:  string
}

/* ── Type → CSS class map ─────────────────────────────────────────────────── */

const typeCls: Record<DateCellType, string> = {
  'default':    styles.typeDefault,
  'date-range': styles.typeDateRange,
  'selected':   styles.typeSelected,
  'today':      styles.typeToday,
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function DateCell({
  day,
  type       = 'default',
  disabled   = false,
  onClick,
  forceHover = false,
  className,
}: DateCellProps) {

  const cls = [
    styles.cell,
    typeCls[type],
    disabled   ? styles.isDisabled : '',
    forceHover ? styles.isHover    : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cls}
      role={disabled ? undefined : 'button'}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={e => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <span className={styles.day}>{day}</span>
    </div>
  )
}

export default DateCell
