import styles from './YearCell.module.css'

export type YearCellType = 'default' | 'selected'

export interface YearCellProps {
  year:        number
  type?:       YearCellType
  disabled?:   boolean
  onClick?:    () => void
  className?:  string
}

const typeCls: Record<YearCellType, string> = {
  'default':  styles.typeDefault,
  'selected': styles.typeSelected,
}

export function YearCell({
  year,
  type     = 'default',
  disabled = false,
  onClick,
  className,
}: YearCellProps) {
  const cls = [
    styles.cell,
    typeCls[type],
    disabled ? styles.isDisabled : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cls}
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? undefined : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={disabled ? undefined : e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() }
      }}
    >
      <span className={styles.year}>{year}</span>
    </div>
  )
}
