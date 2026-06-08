/* BadgeStatus — Figma node 23996-1024 */

import type { ReactNode } from 'react'
import styles from './BadgeStatus.module.css'

export type BadgeStatusType =
  | 'neutral'
  | 'positive'
  | 'danger'
  | 'warning'
  | 'disable'
  | 'pending'

export interface BadgeStatusProps {
  type?:       BadgeStatusType
  label:       string
  iconLeft?:   ReactNode
  iconRight?:  ReactNode
  className?:  string
}

export function BadgeStatus({
  type      = 'neutral',
  label,
  iconLeft,
  iconRight,
  className,
}: BadgeStatusProps) {
  return (
    <span className={[styles.badge, styles[type], className].filter(Boolean).join(' ')}>
      {iconLeft !== undefined && (
        <span className={styles.icon} aria-hidden="true">{iconLeft}</span>
      )}
      {label}
      {iconRight !== undefined && (
        <span className={styles.icon} aria-hidden="true">{iconRight}</span>
      )}
    </span>
  )
}

export default BadgeStatus
