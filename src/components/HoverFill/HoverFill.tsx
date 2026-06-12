import type { ReactNode } from 'react'
import styles from './HoverFill.module.css'

export type HoverFillAs = 'button' | 'field'

export interface HoverFillProps {
  /** The borderless element to wrap (button or input field) */
  children: ReactNode
  /**
   * `'button'` — strong fill on press/focus (`:active` / `:focus-within`).
   * `'field'`  — strong fill persists in edit mode (`:focus-within`).
   */
  as?: HoverFillAs
  /** Disables the hover/focus background effect */
  disabled?: boolean
  className?: string
}

/**
 * Experimental wrapper. Gives a borderless element a soft background that
 * appears on hover and intensifies on press/focus, extending 6px beyond the
 * element on every side without shifting layout. Borderless elements only.
 */
export function HoverFill({ children, as = 'button', disabled = false, className }: HoverFillProps) {
  const cls = [
    styles.wrapper,
    as === 'field' ? styles.field : styles.button,
    disabled ? styles.disabled : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return <span className={cls}>{children}</span>
}
