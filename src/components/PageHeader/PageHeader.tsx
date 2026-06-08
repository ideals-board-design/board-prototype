/* PageHeader — Figma nodes 34914-4984, 34914-4987 */

import { Button }  from '../Button/Button'
import { Tooltip } from '../Tooltip/Tooltip'
import { arrows }  from '../../icons/arrows'
import styles from './PageHeader.module.css'

const angleLeftSvg = arrows.find(i => i.name === 'angle-left-b')!.svg

export interface PageHeaderProps {
  title:      string
  onBack?:    () => void   // shows back button when provided
  className?: string
}

export function PageHeader({ title, onBack, className }: PageHeaderProps) {
  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')}>
      {onBack && (
        <Tooltip label="Back" position="bottom">
          <Button
            variant="tertiary"
            intent="neutral"
            size="s"
            iconOnly={
              <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: angleLeftSvg }} />
            }
            onClick={onBack}
            aria-label="Go back"
          />
        </Tooltip>
      )}
      <h1 className={styles.title}>{title}</h1>
    </header>
  )
}

export default PageHeader
