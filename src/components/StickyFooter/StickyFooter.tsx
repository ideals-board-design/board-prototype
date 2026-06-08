/* StickyFooter — Figma nodes 34928-9456 (page), 34928-9470 (drawer)
   Layout: left = primary + secondary + overflow | right = destructive action
   Height: 72px via padding 16px 24px + 40px buttons */

import { type ReactNode } from 'react'
import styles from './StickyFooter.module.css'

export interface StickyFooterProps {
  /** Left slot — primary button, optional secondary buttons, optional overflow */
  left?:      ReactNode
  /** Right slot — destructive action (full page: labeled button; drawer: icon-only) */
  right?:     ReactNode
  /** 'page' = full-width sticky bottom; 'drawer' = fits drawer width */
  variant?:   'page' | 'drawer'
  className?: string
}

export function StickyFooter({
  left,
  right,
  variant    = 'page',
  className,
}: StickyFooterProps) {
  const cls = [
    styles.footer,
    variant === 'drawer' ? styles.drawer : styles.page,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <div className={styles.left}>{left}</div>
      {right && <div className={styles.right}>{right}</div>}
    </div>
  )
}

export default StickyFooter
