/* SideNavigation — Figma node 34973-6191
   Composite: WorkspaceSwitcher + SideNavigationItems + SideNavUserItem + Board brand */

import { WorkspaceSwitcher } from '../WorkspaceSwitcher/WorkspaceSwitcher'
import type { Workspace } from '../WorkspaceSwitcher/WorkspaceSwitcher'
import { SideNavigationItem } from '../SideNavigationItem/SideNavigationItem'
import type { NavMenuItemKey } from '../SideNavigationItem/SideNavigationItem'
import { SideNavUserItem } from '../SideNavUserItem/SideNavUserItem'
import styles from './SideNavigation.module.css'

export interface SideNavItem {
  key:   NavMenuItemKey
  label: string
}

export const DEFAULT_NAV_ITEMS: SideNavItem[] = [
  { key: 'search',    label: 'Search'    },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'meetings',  label: 'Meetings'  },
  { key: 'tasks',     label: 'Tasks'     },
  { key: 'documents', label: 'Documents' },
  { key: 'directory', label: 'Directory' },
  { key: 'reports',   label: 'Reports'   },
  { key: 'settings',  label: 'Settings'  },
  { key: 'help',      label: 'Help'      },
]

export interface SideNavigationProps {
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
  return (
    <nav className={styles.root} aria-label="Main navigation">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className={styles.header}>
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeId={activeWorkspaceId}
          onSelect={onWorkspaceSelect}
        />
      </div>

      {/* ── Nav items ────────────────────────────────────────── */}
      <div className={styles.navList} role="list">
        {navItems.map(({ key, label }) => (
          <SideNavigationItem
            key={key}
            menuItem={key}
            label={label}
            selected={activeItem === key}
            onClick={() => onItemClick?.(key)}
          />
        ))}
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className={styles.footer}>
        <SideNavUserItem
          src={userSrc}
          name={userName}
          email={userEmail}
          twoFaEnabled={twoFaEnabled}
          onProfileClick={onProfileClick}
          onConnectionsClick={onConnectionsClick}
          onLogoutClick={onLogoutClick}
        />
      </div>

    </nav>
  )
}

export default SideNavigation
