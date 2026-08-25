/* Logo — Board brand mark, rendered in the SideNavigation footer.
   Figma component "Logo" (4720:1306): Type=Full (240px/drawer tiers),
   Type=Symbol (56px laptop rail). */

import fullSvg   from '../../hub/logo-sidebar.svg?raw'
import symbolSvg from '../../hub/logo-symbol.svg?raw'
import styles from './Logo.module.css'

export interface LogoProps {
  /** 'full' (default) — icon + wordmark. 'symbol' — icon mark only (rail). */
  variant?: 'full' | 'symbol'
}

export function Logo({ variant = 'full' }: LogoProps) {
  return (
    <span
      className={variant === 'symbol' ? styles.symbol : styles.full}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: variant === 'symbol' ? symbolSvg : fullSvg }}
    />
  )
}

export default Logo
