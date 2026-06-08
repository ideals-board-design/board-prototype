/* TableCell / TableHeaderCell — Figma nodes 31434-6336 (header) · 35294-4837 (body variants)
   Layout: padding 14px 16px · gap 8px · height 48px */

import type { ReactNode } from 'react'
import { arrows }          from '../../icons/arrows'
import { TruncationHint }  from '../TruncationHint/TruncationHint'
import styles from './TableCell.module.css'

/* ── Icons ──────────────────────────────────────────────── */
const sortingIcon     = arrows.find(i => i.name === 'sorting')!.svg
const sortAscIcon     = arrows.find(i => i.name === 'sorting-arrow-up')!.svg
const sortDescIcon    = arrows.find(i => i.name === 'sorting-arrow-down')!.svg
const chevronDownIcon = arrows.find(i => i.name === 'angle-down-fill')!.svg

/* ══════════════════════════════════════════════════════════
   TableHeaderCell — <th>
   ══════════════════════════════════════════════════════════ */

export interface TableHeaderCellProps {
  children: ReactNode
  /** Shows row-count badge (white bg) */
  count?: number
  /** Enables sort interaction — sort icon appears on hover */
  sortable?: boolean
  /** Current sort direction; null = unsorted */
  sortDirection?: 'asc' | 'desc' | null
  /** Called when the sort button is clicked */
  onSort?: () => void
  className?: string
}

export function TableHeaderCell({
  children,
  count,
  sortable,
  sortDirection = null,
  onSort,
  className,
}: TableHeaderCellProps) {
  const sortIcon = sortDirection === 'asc'
    ? sortAscIcon
    : sortDirection === 'desc'
      ? sortDescIcon
      : sortingIcon

  const isSorted = sortDirection != null

  return (
    <th
      className={[
        styles.th,
        sortable ? styles.sortable : null,
        isSorted  ? styles.sorted  : null,
        className,
      ].filter(Boolean).join(' ')}
      onClick={sortable ? onSort : undefined}
      aria-sort={
        !sortable         ? undefined
          : isSorted && sortDirection === 'asc'  ? 'ascending'
          : isSorted && sortDirection === 'desc' ? 'descending'
          : 'none'
      }
    >
      <div className={[styles.inner, styles.headerInner].join(' ')}>
        <span className={styles.headerLabel}>{children}</span>

        {count != null && (
          <span className={styles.countBadgeHeader}>{count}</span>
        )}

        {sortable && (
          <span
            className={styles.sortIcon}
            dangerouslySetInnerHTML={{ __html: sortIcon }}
            aria-hidden
          />
        )}
      </div>
    </th>
  )
}

/* ══════════════════════════════════════════════════════════
   TableCell — <td>
   ══════════════════════════════════════════════════════════ */

export interface TableCellProps {
  /** Text content */
  children?: ReactNode
  /** Secondary text colour instead of primary */
  secondary?: boolean
  /** Shows a BadgeCounter next to the text (stone-300 bg) */
  count?: number
  /** Icon SVG string (from src/icons/*.ts) */
  icon?: string
  /** Shows a status badge pill with this label */
  badge?: string
  /** Badge background colour — defaults to --green-50 (Figma success-50) */
  badgeColor?: string
  /** Shows a dropdown chevron trigger */
  dropdown?: boolean
  onDropdownClick?: () => void
  /** Red text colour for overdue / error states */
  error?: boolean
  /** Truncate text with ellipsis + show DS Tooltip with full text on hover */
  truncate?: boolean
  className?: string
}

export function TableCell({
  children,
  secondary,
  count,
  icon,
  badge,
  badgeColor = 'var(--green-50)',
  dropdown,
  truncate,
  onDropdownClick,
  error,
  className,
}: TableCellProps) {
  return (
    <td
      className={[
        styles.td,
        secondary ? styles.secondary : null,
        error     ? styles.error     : null,
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className={[styles.inner, truncate ? styles.innerTruncate : null].filter(Boolean).join(' ')}>
        {/* Icon slot */}
        {icon && (
          <span
            className={styles.icon}
            dangerouslySetInnerHTML={{ __html: icon }}
            aria-hidden
          />
        )}

        {/* Text label */}
        {children != null && !dropdown && !truncate && (
          <span className={styles.label}>{children}</span>
        )}

        {/* Truncated label — DS TruncationHint shows hint only when text overflows */}
        {children != null && !dropdown && truncate && (
          <TruncationHint
            text={typeof children === 'string' ? children : ''}
            className={styles.truncationHintFlex}
          >
            {children}
          </TruncationHint>
        )}

        {/* Badge counter */}
        {count != null && (
          <span className={styles.countBadgeBody}>{count}</span>
        )}

        {/* Status badge only */}
        {badge && (
          <span
            className={styles.statusBadge}
            style={{ background: badgeColor }}
          >
            {badge}
          </span>
        )}

        {/* Dropdown trigger */}
        {dropdown && (
          <button
            type="button"
            className={styles.dropdownTrigger}
            onClick={onDropdownClick}
          >
            <span className={styles.label}>{children}</span>
            <span
              className={styles.chevron}
              dangerouslySetInnerHTML={{ __html: chevronDownIcon }}
              aria-hidden
            />
          </button>
        )}
      </div>
    </td>
  )
}

export default TableCell
