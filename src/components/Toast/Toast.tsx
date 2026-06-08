/* Toast — Figma nodes 9829-100949 (component set), 34940-39518…39521 (instances)
   Layout: [icon] [body: message / optional? / action?]  |  [dismiss?]
   Size: fixed 400px wide, 48px single-line (pad 14px 16px) */

import type { ReactNode } from 'react'
import { condition } from '../../icons/condition'
import { actions }   from '../../icons/actions'
import { Tooltip }   from '../Tooltip/Tooltip'
import { Button }    from '../Button/Button'
import styles from './Toast.module.css'

export type ToastState = 'success' | 'info' | 'warning' | 'error'

export interface ToastProps {
  /** Semantic state — controls background, icon, accent colour */
  state?:     ToastState
  /** Primary message — max 2 lines, then ellipsis */
  message:    ReactNode
  /** Secondary description — max 3 lines, then ellipsis */
  optional?:  ReactNode
  /** Action element — use tertiary Button with matching intent */
  action?:    ReactNode
  /** When provided, renders dismiss (×) button */
  onDismiss?: () => void
  className?: string
}

const STATE_ICON: Record<ToastState, string> = {
  success: condition.find(i => i.name === 'check-circle')!.svg,
  info:    condition.find(i => i.name === 'info-circle')!.svg,
  warning: condition.find(i => i.name === 'alert-triangle')!.svg,
  error:   condition.find(i => i.name === 'exclamation-circle')!.svg,
}

const multiplySvg = actions.find(i => i.name === 'multiply')!.svg

const STATE_CLASS: Record<ToastState, string> = {
  success: styles.success,
  info:    styles.info,
  warning: styles.warning,
  error:   styles.error,
}

export function Toast({
  state     = 'info',
  message,
  optional,
  action,
  onDismiss,
  className,
}: ToastProps) {
  const cls = [
    styles.toast,
    STATE_CLASS[state],
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={cls} role="alert">
      <div className={styles.left}>
        <span
          className={styles.icon}
          dangerouslySetInnerHTML={{ __html: STATE_ICON[state] }}
        />
        <div className={styles.body}>
          <div className={styles.texts}>
            <span className={styles.message}>{message}</span>
            {optional && <span className={styles.optional}>{optional}</span>}
          </div>
          {action && <span className={styles.action}>{action}</span>}
        </div>
      </div>

      {onDismiss && (
        <Tooltip label="Dismiss" position="top">
          <Button
            variant="tertiary"
            intent="neutral"
            size="m"
            iconOnly={
              <span
                style={{ display: 'contents' }}
                dangerouslySetInnerHTML={{ __html: multiplySvg }}
              />
            }
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{ width: 20, height: 20, margin: 0 }}
          />
        </Tooltip>
      )}
    </div>
  )
}

export default Toast
