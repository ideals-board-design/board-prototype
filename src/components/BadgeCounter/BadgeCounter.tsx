/* BadgeCounter — Figma node 9801-63513 */

import styles from './BadgeCounter.module.css'

export type BadgeCounterVariant =
  | 'new'
  | 'regular'
  | 'disabled'
  | 'primary'
  | 'secondary'
  | 'inverted'
  | 'dot'

export interface BadgeCounterProps {
  /** Displayed number or string. Ignored for dot variant. */
  count?:    number | string
  variant?:  BadgeCounterVariant
  className?: string
}

export function BadgeCounter({
  count   = '99+',
  variant = 'new',
  className,
}: BadgeCounterProps) {
  if (variant === 'dot') {
    return (
      <span
        className={[styles.dot, className].filter(Boolean).join(' ')}
        aria-hidden="true"
      />
    )
  }

  return (
    <span className={[styles.badge, styles[variant], className].filter(Boolean).join(' ')}>
      {count}
    </span>
  )
}

export default BadgeCounter
