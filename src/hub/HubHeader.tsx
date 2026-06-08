/* HubHeader — shared top navigation bar
   Logo always links to / (home = board hub).
   Design system link → /design-system.html */

import logoSvg from './logo-sidebar.svg?raw'
import styles from './HubHeader.module.css'

export interface HubHeaderProps {
  /** Mark which link is the current page (no href, visually active) */
  activePage?: 'design-system'
}

export function HubHeader({ activePage }: HubHeaderProps) {
  return (
    <header className={styles.header}>
      <a href="/" className={styles.logoLink} aria-label="Board home">
        <span
          className={styles.logo}
          dangerouslySetInnerHTML={{ __html: logoSvg }}
          aria-hidden
        />
      </a>

      <nav className={styles.nav} aria-label="Utilities">
        {activePage === 'design-system'
          ? <span className={[styles.navLink, styles.navLinkActive].join(' ')}>Design system</span>
          : <a href="/design-system.html" className={styles.navLink}>Design system</a>
        }
      </nav>
    </header>
  )
}

export default HubHeader
