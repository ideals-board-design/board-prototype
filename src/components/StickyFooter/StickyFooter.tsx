/* StickyFooter — Figma nodes 34928-9456 (page), 34928-9470 (drawer)
   Layout: left = primary + secondary + overflow | right = destructive action
   Height: 72px via padding 16px 24px + 40px buttons

   Motion (opt-in via `open`): when a consumer passes `open`, the footer
   mounts/animates through usePresence instead of always being present —
   e.g. a drawer form's footer appearing once the form goes dirty. It slides
   up on `transform` only, faster than the Drawer it typically lives in
   (--dur-base in vs Drawer's --dur-slow) and faster still on the way out
   (--dur-snap), so it never outlasts a form field's own state change.
   Callers that omit `open` keep the original static behaviour — always
   mounted, no transition — so every existing usage is unaffected. */

import { type ReactNode } from 'react'
import { usePresence } from '../shared/usePresence'
import styles from './StickyFooter.module.css'

export interface StickyFooterProps {
  /** Left slot — primary button, optional secondary buttons, optional overflow */
  left?:      ReactNode
  /** Right slot — destructive action (full page: labeled button; drawer: icon-only) */
  right?:     ReactNode
  /** 'page' = full-width sticky bottom; 'drawer' = fits drawer width */
  variant?:   'page' | 'drawer'
  /** Omit for the default static footer (always mounted, no animation).
   *  Pass a boolean to animate it in/out — e.g. bound to "form is dirty". */
  open?:      boolean
  className?: string
}

export function StickyFooter({
  left,
  right,
  variant    = 'page',
  open,
  className,
}: StickyFooterProps) {
  const animated = open !== undefined
  const { mounted, state } = usePresence(open ?? true, '--dur-snap')

  if (animated && !mounted) return null

  const cls = [
    styles.footer,
    variant === 'drawer' ? styles.drawer : styles.page,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={cls} data-state={animated ? state : undefined}>
      <div className={styles.left}>{left}</div>
      {right && <div className={styles.right}>{right}</div>}
    </div>
  )
}

export default StickyFooter
