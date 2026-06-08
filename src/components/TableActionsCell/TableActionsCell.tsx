/* TableActionsCell — Figma node 31434-6276 / 35306-5625
   Sticky right-edge overlay on row hover.
   Uses DS Button tertiary/neutral/s for each action icon. */

import { Button }  from '../Button/Button'
import { Tooltip } from '../Tooltip/Tooltip'
import styles from './TableActionsCell.module.css'

export interface TableAction {
  /** Icon SVG string from src/icons/*.ts */
  icon: string
  /** Accessible label */
  label: string
  onClick: () => void
}

export interface TableActionsCellProps {
  actions: TableAction[]
  /** Controlled by parent <tr> onMouseEnter/onMouseLeave */
  visible?: boolean
}

export function TableActionsCell({ actions, visible }: TableActionsCellProps) {
  return (
    <td className={styles.td}>
      <div className={[styles.inner, visible ? styles.innerVisible : null].filter(Boolean).join(' ')}>
        {actions.map((a) => (
          <Tooltip key={a.label} label={a.label} position="top">
            <Button
              variant="tertiary"
              intent="neutral"
              size="m"
              aria-label={a.label}
              iconOnly={
                <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: a.icon }} />
              }
              onClick={(e) => { e.stopPropagation(); a.onClick() }}
            />
          </Tooltip>
        ))}
      </div>
    </td>
  )
}

export default TableActionsCell
