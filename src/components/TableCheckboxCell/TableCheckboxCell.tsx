/* TableCheckboxCell — Figma node 31434-6343 (Table: Special / Checkbox)
   Row-selection cell for data tables. Wraps the DS Checkbox.
   Layout: cell padding 14px 0 14px 16px · checkbox wrapper padding 2px · 36×48 */

import { Checkbox, type CheckboxProps } from '../Checkbox/Checkbox'
import styles from './TableCheckboxCell.module.css'

export interface TableCheckboxCellProps extends CheckboxProps {
  /** Render as <th> for the header select-all cell (default renders <td>) */
  header?: boolean
  /** Class applied to the cell element */
  className?: string
}

export function TableCheckboxCell({ header, className, ...checkbox }: TableCheckboxCellProps) {
  const Tag = header ? 'th' : 'td'
  return (
    <Tag className={[styles.cell, className].filter(Boolean).join(' ')}>
      <span className={styles.inner}>
        <Checkbox className={styles.checkbox} {...checkbox} />
      </span>
    </Tag>
  )
}

export default TableCheckboxCell
