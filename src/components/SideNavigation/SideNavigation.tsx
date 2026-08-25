/* SideNavigation — Figma node 34973-6191
   Composite: WorkspaceSwitcher + SideNavigationItems + SideNavUserItem + Board brand.

   Responsive variants (Figma "Navigation behaviour", file 13o8hAdMO5Vi4KBJiHCFn8):
   - 'sidebar' (default, desktop ≥1440px) — today's full 240px sidebar, unchanged.
   - 'rail' (laptop, 1024–1439px) — 56px icon-only rail, tooltips on hover.
     Threads `rail` down to every child.
   - 'drawer-tablet' / 'drawer-mobile' (mobile/tablet, 390–1023px) — full
     labeled content (same as 'sidebar'), meant to be rendered inside a
     `<Drawer variant="overlay" side="left">` by the app shell. The only
     difference between the two: the workspace switcher always accordions
     in place instead of floating, and the user item is either inline
     ('drawer-tablet') or a bottom sheet ('drawer-mobile') — see
     SideNavUserItem's `variant` prop.

   There is deliberately no manual expand/collapse control anywhere in this
   component — which tier renders is driven entirely by the app shell's
   `useBreakpoint()` result, never by a user-toggled button. */

import { useState } from 'react'
import { WorkspaceSwitcher } from '../WorkspaceSwitcher/WorkspaceSwitcher'
import type { Workspace } from '../WorkspaceSwitcher/WorkspaceSwitcher'
import { SideNavigationItem } from '../SideNavigationItem/SideNavigationItem'
import type { NavMenuItemKey } from '../SideNavigationItem/SideNavigationItem'
import { SideNavUserItem } from '../SideNavUserItem/SideNavUserItem'
import { Logo } from '../Logo/Logo'
import styles from './SideNavigation.module.css'

export type SideNavigationVariant = 'sidebar' | 'rail' | 'drawer-tablet' | 'drawer-mobile'

export interface SideNavItem {
  key:   NavMenuItemKey
  label: string
}

export const DEFAULT_NAV_ITEMS: SideNavItem[] = [
  { key: 'search',    label: 'Search'    },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'meetings',  label: 'Meetings'  },
  { key: 'tasks',     label: 'Tasks'     },
  { key: 'chats',     label: 'Chats'     },
  { key: 'documents', label: 'Documents' },
  { key: 'directory', label: 'Directory' },
  { key: 'reports',   label: 'Reports'   },
  { key: 'settings',  label: 'Settings'  },
  { key: 'help',      label: 'Help'      },
]

export interface SideNavigationProps {
  variant?: SideNavigationVariant

  /* Workspace switcher */
  workspaces:        Workspace[]
  activeWorkspaceId: string
  onWorkspaceSelect?: (id: string) => void

  /* Nav items */
  navItems?:   SideNavItem[]
  activeItem?: NavMenuItemKey
  onItemClick?: (key: NavMenuItemKey) => void

  /* User item */
  userSrc?:             string
  userName:             string
  userEmail:            string
  twoFaEnabled?:        boolean
  onProfileClick?:      () => void
  onConnectionsClick?:  () => void
  onLogoutClick?:       () => void
}

export function SideNavigation({
  variant = 'sidebar',
  workspaces,
  activeWorkspaceId,
  onWorkspaceSelect,
  navItems = DEFAULT_NAV_ITEMS,
  activeItem,
  onItemClick,
  userSrc,
  userName,
  userEmail,
  twoFaEnabled,
  onProfileClick,
  onConnectionsClick,
  onLogoutClick,
}: SideNavigationProps) {
  const rail = variant === 'rail'
  const isDrawer = variant === 'drawer-tablet' || variant === 'drawer-mobile'
  const workspaceVariant = isDrawer ? 'inline' : 'dropdown'
  const userVariant =
    variant === 'drawer-tablet' ? 'inline' :
    variant === 'drawer-mobile' ? 'sheet'  :
    'dropdown'

  // Figma's "workspace selection" frame (drawer tiers only): expanding the
  // switcher replaces the rest of the nav — items and footer disappear while
  // only the header + workspace list show. Dropdown/rail variants are
  // floating panels layered on top instead, so they don't need this.
  const [wsOpen, setWsOpen] = useState(false)
  const hideRest = isDrawer && wsOpen

  return (
    <nav className={[styles.root, rail ? styles.rail : '', isDrawer ? styles.drawer : ''].filter(Boolean).join(' ')} aria-label="Main navigation">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className={styles.header}>
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeId={activeWorkspaceId}
          onSelect={onWorkspaceSelect}
          variant={workspaceVariant}
          rail={rail}
          onOpenChange={isDrawer ? setWsOpen : undefined}
        />
      </div>

      {!hideRest && (
        <>
          {/* ── Nav items ────────────────────────────────────── */}
          <div className={styles.navList} role="list">
            {navItems.map(({ key, label }) => (
              <SideNavigationItem
                key={key}
                menuItem={key}
                label={label}
                selected={activeItem === key}
                onClick={() => onItemClick?.(key)}
                rail={rail}
              />
            ))}
          </div>

          {/* ── Footer ───────────────────────────────────────── */}
          <div className={styles.footer}>
            <SideNavUserItem
              src={userSrc}
              name={userName}
              email={userEmail}
              twoFaEnabled={twoFaEnabled}
              onProfileClick={onProfileClick}
              onConnectionsClick={onConnectionsClick}
              onLogoutClick={onLogoutClick}
              variant={userVariant}
              rail={rail}
            />
            <div className={styles.logoRow}>
              <Logo variant={rail ? 'symbol' : 'full'} />
            </div>
          </div>
        </>
      )}

    </nav>
  )
}

export default SideNavigation
