/* Banner — Figma node 14376-70685
   Layout: [icon] [message]  ·  [action?] [dismiss?]
   Sizes: M=40px, L=48px  ·  Variants: rounded | inline */

import type { ReactNode } from 'react'
import { condition } from '../../icons/condition'
import { actions }   from '../../icons/actions'
import { Tooltip }   from '../Tooltip/Tooltip'
import { Button }    from '../Button/Button'
import styles from './Banner.module.css'

export type BannerState   = 'info-primary' | 'info-secondary' | 'success' | 'error' | 'warning'
export type BannerVariant = 'rounded' | 'inline'
export type BannerSize    = 'm' | 'l'

export interface BannerProps {
  /** Semantic state — controls background, icon and accent colour */
  state?:     BannerState
  /** 'rounded' = border-radius 12px; 'inline' = square corners */
  variant?:   BannerVariant
  /** 'l' = 48px, 'm' = 40px */
  size?:      BannerSize
  /** Banner body copy — truncated to 2 lines */
  message:    ReactNode
  /** Optional action element (use tertiary Button with matching intent) */
  action?:    ReactNode
  /** When provided, shows dismiss (×) button and calls this on click */
  onDismiss?: () => void
  className?: string
}

const STATE_ICON: Record<BannerState, string> = {
  'info-primary':   condition.find(i => i.name === 'info-circle')!.svg,
  'info-secondary': condition.find(i => i.name === 'info-circle')!.svg,
  success:          condition.find(i => i.name === 'check-circle')!.svg,
  error:            condition.find(i => i.name === 'exclamation-circle')!.svg,
  warning:          condition.find(i => i.name === 'alert-triangle')!.svg,
}

const multiplySvg = actions.find(i => i.name === 'multiply')!.svg

const STATE_CLASS: Record<BannerState, string> = {
  'info-primary':   styles.infoPrimary,
  'info-secondary': styles.infoSecondary,
  success:          styles.success,
  error:            styles.error,
  warning:          styles.warning,
}

export function Banner({
  state     = 'info-primary',
  variant   = 'rounded',
  size      = 'l',
  message,
  action,
  onDismiss,
  className,
}: BannerProps) {
  const cls = [
    styles.banner,
    STATE_CLASS[state],
    styles[variant],
    size === 'm' ? styles.m : null,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={cls} role="alert">
      <div className={styles.left}>
        <span
          className={styles.icon}
          dangerouslySetInnerHTML={{ __html: STATE_ICON[state] }}
        />
        <span className={styles.message}>{message}</span>
      </div>

      {(action != null || onDismiss) && (
        <div className={styles.right}>
          {action != null && <span className={styles.action}>{action}</span>}
          {onDismiss && (
            <Tooltip label="Dismiss" position="top">
              <Button
                variant="tertiary"
                intent="neutral"
                size="m"
                className={styles.dismiss}
                iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: multiplySvg }} />}
                onClick={onDismiss}
                aria-label="Dismiss"
              />
            </Tooltip>
          )}
        </div>
      )}
    </div>
  )
}

export default Banner
