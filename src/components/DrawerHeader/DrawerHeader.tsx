/* DrawerHeader — Figma nodes 34916-4993, 34916-4994, 34916-4995 */

import { type ReactNode } from 'react'
import { Button }  from '../Button/Button'
import { Tooltip } from '../Tooltip/Tooltip'
import { actions } from '../../icons/actions'
import styles from './DrawerHeader.module.css'

const multiplySvg = actions.find(i => i.name === 'multiply')!.svg
const plusSvg     = actions.find(i => i.name === 'plus')!.svg

export interface DrawerHeaderProps {
  title:          string
  onClose:        () => void
  type?:          string       // shows the "+ type" icon+text meta when provided
  badge?:         ReactNode    // status badge slot (right of type)
  className?:     string
}

export function DrawerHeader({
  title,
  onClose,
  type,
  badge,
  className,
}: DrawerHeaderProps) {
  const hasMeta = type !== undefined || badge !== undefined

  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')}>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>

        {hasMeta && (
          <div className={styles.meta}>
            {type !== undefined && (
              <span className={styles.type}>
                <span
                  className={styles.typeIcon}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: plusSvg }}
                />
                {type}
              </span>
            )}
            {badge}
          </div>
        )}
      </div>

      <Tooltip label="Close" position="bottom">
        <Button
          variant="tertiary"
          intent="neutral"
          size="m"
          iconOnly={
            <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: multiplySvg }} />
          }
          onClick={onClose}
          aria-label="Close"
        />
      </Tooltip>
    </header>
  )
}

export default DrawerHeader
