/* EmptyState — Figma nodes 35292-596 (component) · 35292-629 · 35292-1106 */

import type { ReactNode } from 'react'
import { illustrations } from '../../illustrations/illustrations'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  /** Illustration name from illustrations.ts, e.g. 'folder-no-results', 'web-page-warning' */
  illustration: string
  /** Optional bold title rendered above the description */
  title?: string
  /** Main body text */
  description: ReactNode
  /** Optional action(s) — one or two <Button> elements */
  action?: ReactNode
  className?: string
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const svg = illustrations.find(i => i.name === illustration)?.svg ?? ''

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div className={styles.container}>

        <span
          className={styles.illustration}
          dangerouslySetInnerHTML={{ __html: svg }}
          aria-hidden
        />

        <div className={styles.details}>
          <div className={styles.text}>
            {title && <p className={styles.title}>{title}</p>}
            <p className={styles.description}>{description}</p>
          </div>

          {action != null && (
            <div className={styles.action}>{action}</div>
          )}
        </div>

      </div>
    </div>
  )
}

export default EmptyState
