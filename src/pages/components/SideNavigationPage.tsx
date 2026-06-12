/* SideNavigationPage — unified showcase for sidebar components
   SideNavigation: 34973-6191 · SideNavigationItem: 34954-1796/1797/1798
   WorkspaceSwitcher: 34956-1814/1816/1932
   SideNavUserItem: 34960-1126/1127/1128 · 3194-1280 · 3194-1374 */

import { useState } from 'react'
import { SideNavigation, DEFAULT_NAV_ITEMS } from '../../components/SideNavigation/SideNavigation'
import { SideNavigationItem } from '../../components/SideNavigationItem/SideNavigationItem'
import type { NavMenuItemKey } from '../../components/SideNavigationItem/SideNavigationItem'
import { WorkspaceSwitcher } from '../../components/WorkspaceSwitcher/WorkspaceSwitcher'
import type { Workspace } from '../../components/WorkspaceSwitcher/WorkspaceSwitcher'
import { SideNavUserItem } from '../../components/SideNavUserItem/SideNavUserItem'
import { condition } from '../../icons/condition'
import styles from './SideNavigationPage.module.css'
import { SourceLink } from '../SourceLink'

const shieldCheckSvg       = condition.find(i => i.name === 'shield-check')!.svg
const shieldExclamationSvg = condition.find(i => i.name === 'shield-exclamation')!.svg

const DEMO_WORKSPACES = [
  { id: 'star',  name: 'STAR Enterprises', initials: 'ST', color: '#28a560' },
  { id: 'acme',  name: 'Acme Corp',        initials: 'AC', color: '#2b6cb0' },
  { id: 'globex',name: 'Globex Inc',       initials: 'GX', color: '#9b59b6' },
]

const WS_WORKSPACES: Workspace[] = [
  { id: 'lu', name: 'Luminara Systems',          initials: 'LU', color: 'var(--tag-kepeel)'   },
  { id: 'ne', name: 'NexaWave Solutions',         initials: 'NE', color: 'var(--tag-red)'      },
  { id: 'qu', name: 'QuantumPulse Innovations',   initials: 'QU', color: 'var(--tag-navyblue)' },
  { id: 'st', name: 'STAR Enterprises',           initials: 'ST', color: 'var(--green-500)'    },
  { id: 've', name: 'VerdeoTech Enterprises',     initials: 'VE', color: 'var(--tag-beetroot)' },
]

const DEMO_USER = {
  userSrc:   'https://i.pravatar.cc/64?img=47',
  userName:  'Olivia Thompson',
  userEmail: 'thompsonolivia@gmail.com',
}

const USER_PROPS = {
  src:   'https://i.pravatar.cc/64?img=47',
  name:  'Olivia Thompson',
  email: 'thompsonolivia@gmail.com',
}

const ALL_ITEMS: { menuItem: NavMenuItemKey; label: string }[] = [
  { menuItem: 'dashboard',  label: 'Dashboard'  },
  { menuItem: 'directory',  label: 'Directory'  },
  { menuItem: 'documents',  label: 'Documents'  },
  { menuItem: 'help',       label: 'Help'       },
  { menuItem: 'meetings',   label: 'Meetings'   },
  { menuItem: 'reports',    label: 'Reports'    },
  { menuItem: 'search',     label: 'Search'     },
  { menuItem: 'settings',   label: 'Settings'   },
  { menuItem: 'tasks',      label: 'Tasks'      },
]

export default function SideNavigationPage() {
  const [activeItem, setActiveItem] = useState<NavMenuItemKey>('dashboard')
  const [workspaceId, setWorkspaceId] = useState('star')
  const [selectedItem, setSelectedItem] = useState<NavMenuItemKey>('dashboard')
  const [wsActiveId, setWsActiveId] = useState('st')

  return (
    <div className={styles.page}>

      {/* ══════════════ SIDE NAVIGATION ══════════════════════════════ */}

      <h1 className={styles.title}>Side Navigation</h1>
      <p className={styles.subtitle}>
        Figma nodes 34973-6191 · 34954-1796 · 34954-1797 · 34954-1798 · 32820-53135
      </p>
      <SourceLink path={['src/components/SideNavigation/SideNavigation.tsx', 'src/components/SideNavigationItem/SideNavigationItem.tsx', 'src/components/SideNavUserItem/SideNavUserItem.tsx', 'src/components/WorkspaceSwitcher/WorkspaceSwitcher.tsx']} />

      {/* ── Full sidebar ────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Full sidebar</h2>
      <p className={styles.description}>
        Composite of WorkspaceSwitcher + nav items + SideNavUserItem.
        Click items to select, switch workspace via the dropdown.
      </p>
      <div className={styles.viewportOuter}>
        <div className={styles.viewport}>
          <SideNavigation
            workspaces={DEMO_WORKSPACES}
            activeWorkspaceId={workspaceId}
            onWorkspaceSelect={setWorkspaceId}
            navItems={DEFAULT_NAV_ITEMS}
            activeItem={activeItem}
            onItemClick={setActiveItem}
            {...DEMO_USER}
            twoFaEnabled
            onProfileClick={() => console.log('My profile')}
            onConnectionsClick={() => console.log('Connections')}
            onLogoutClick={() => console.log('Log out')}
          />
          <div className={styles.viewportContent} />
        </div>
      </div>

      {/* ── Nav item states ─────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Nav item states</h2>
      <div className={styles.statesRow}>
        <div className={styles.stateGroup}>
          <div className={styles.stateLabel}>Default</div>
          <SideNavigationItem menuItem="dashboard" label="Dashboard" />
        </div>
        <div className={styles.stateGroup}>
          <div className={styles.stateLabel}>Hover</div>
          <div className={styles.forceHover}>
            <SideNavigationItem menuItem="dashboard" label="Dashboard" />
          </div>
        </div>
        <div className={styles.stateGroup}>
          <div className={styles.stateLabel}>Selected</div>
          <SideNavigationItem menuItem="dashboard" label="Dashboard" selected />
        </div>
      </div>

      {/* ── Interactive item demo ────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Interactive item demo</h2>
      <p className={styles.description}>Click to select.</p>
      <div className={styles.demoNav}>
        {ALL_ITEMS.map(({ menuItem, label }) => (
          <SideNavigationItem
            key={menuItem}
            menuItem={menuItem}
            label={label}
            selected={selectedItem === menuItem}
            onClick={() => setSelectedItem(menuItem)}
          />
        ))}
      </div>

      {/* ── All icons — Default ──────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>All icons — Default</h2>
      <div className={styles.iconGrid}>
        {ALL_ITEMS.map(({ menuItem, label }) => (
          <SideNavigationItem key={menuItem} menuItem={menuItem} label={label} />
        ))}
      </div>

      {/* ── All icons — Selected ─────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>All icons — Selected</h2>
      <div className={styles.iconGrid}>
        {ALL_ITEMS.map(({ menuItem, label }) => (
          <SideNavigationItem key={menuItem} menuItem={menuItem} label={label} selected />
        ))}
      </div>

      {/* ══════════════ WORKSPACE SWITCHER ═══════════════════════════ */}

      <h2 className={styles.groupTitle}>Workspace Switcher</h2>
      <p className={styles.subtitle}>
        Figma nodes 34956-1814 · 34956-1816 · 34956-1932
      </p>

      {/* ── Live demo ───────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Live demo</h2>
      <p className={styles.description}>Click to open. Select a workspace to switch.</p>
      <div className={styles.wsDemoWrap}>
        <WorkspaceSwitcher
          workspaces={WS_WORKSPACES}
          activeId={wsActiveId}
          onSelect={setWsActiveId}
        />
      </div>

      {/* ── States ──────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>States</h2>
      <div className={styles.wsStatesRow}>
        <div className={styles.stateGroup}>
          <div className={styles.stateLabel}>Default</div>
          <div className={styles.wsDemo}>
            <WorkspaceSwitcher workspaces={WS_WORKSPACES} activeId="st" />
          </div>
        </div>
        <div className={styles.stateGroup}>
          <div className={styles.stateLabel}>Opened</div>
          <div className={styles.wsDemo}>
            <WorkspaceSwitcher workspaces={WS_WORKSPACES} activeId="st" defaultOpen />
          </div>
        </div>
      </div>

      {/* ── Guidelines ──────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Guidelines</h2>
      <ul className={styles.guidelines}>
        <li>Trigger width: 240px. Outer padding: 4px. Inner padding-left: 8px, padding-right: 4px. Gap: 12px.</li>
        <li>Workspace avatar: 32px in trigger and list. Border-radius 4px (<code>--radius-sm</code>).</li>
        <li>Dropdown panel: calc(100% - 8px) wide, 4px left offset, 4px gap below trigger. Background: <code>--stone-0</code>. Shadow: <code>--shadow-100</code>.</li>
        <li>List item padding: 4px 12px 4px 4px. Gap: 12px. Border-radius: <code>--radius-sm</code>.</li>
        <li>Active item: <code>--color-bg-selected</code> background.</li>
        <li>Hover item: <code>--color-bg-hover</code> background.</li>
        <li>Each workspace needs: <code>id</code>, <code>name</code>, <code>initials</code> (2 chars), <code>color</code> (CSS value).</li>
        <li>Chevron: <code>angle-down-fill</code> closed, <code>angle-up-fill</code> opened. Both 16×16px inside a 32×32 icon button.</li>
        <li>Closes on outside click, Escape key, or workspace selection.</li>
      </ul>

      {/* ══════════════ SIDE NAV — USER ITEM ════════════════════════ */}

      <h2 className={styles.groupTitle}>Side Nav — User Item</h2>
      <p className={styles.subtitle}>
        Figma nodes 34960-1126 · 34960-1128 · 34960-1127 · 3194-1280 · 3194-1374
      </p>

      {/* ── Live demo ───────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Live demo</h2>
      <p className={styles.description}>
        Click to open the menu. Hover Language to reveal the sublist.
      </p>
      <div className={styles.userDemoWrap}>
        <SideNavUserItem
          {...USER_PROPS}
          twoFaEnabled
          onProfileClick={() => console.log('My profile')}
          onConnectionsClick={() => console.log('Connections')}
          onLogoutClick={() => console.log('Log out')}
        />
      </div>

      {/* ── States ──────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>States</h2>
      <div className={styles.userStatesRow}>
        <div className={styles.stateGroup}>
          <div className={styles.stateLabel}>Default</div>
          <div className={styles.wsDemo}>
            <SideNavUserItem {...USER_PROPS} />
          </div>
        </div>
        <div className={[styles.stateGroup, styles.stateGroupOpened].join(' ')}>
          <div className={styles.stateLabel}>Opened</div>
          <div className={styles.wsDemo}>
            <SideNavUserItem {...USER_PROPS} twoFaEnabled defaultOpen />
          </div>
        </div>
      </div>

      {/* ── 2FA Banner states ───────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>2FA Banner</h2>
      <p className={styles.description}>
        Figma nodes 3196-1375 (not protected) · 3196-1383 (protected)
      </p>
      <div className={styles.bannerStates}>
        <div className={styles.bannerStateGroup}>
          <div className={styles.stateLabel}>Not protected</div>
          <div className={[styles.bannerWrap, styles.bannerWrapWarning].join(' ')}>
            <span
              className={[styles.bannerIcon, styles.bannerIconWarning].join(' ')}
              dangerouslySetInnerHTML={{ __html: shieldExclamationSvg }}
            />
            <span className={styles.bannerLabel}>Account not 2FA-protected</span>
            <button type="button" className={styles.bannerProtectBtn}>Protect</button>
          </div>
        </div>
        <div className={styles.bannerStateGroup}>
          <div className={styles.stateLabel}>Protected</div>
          <div className={styles.bannerWrap}>
            <span
              className={[styles.bannerIcon, styles.bannerIconGreen].join(' ')}
              dangerouslySetInnerHTML={{ __html: shieldCheckSvg }}
            />
            <span className={styles.bannerLabel}>Account 2FA-protected</span>
          </div>
        </div>
      </div>

      {/* ── Initials fallback ───────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Initials fallback</h2>
      <p className={styles.description}>Shown when no photo is provided.</p>
      <div className={styles.userDemoWrap}>
        <SideNavUserItem
          name="Jordan Parker"
          email="jordan.parker@example.com"
        />
      </div>

      {/* ── 2FA disabled variant ─────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>2FA disabled</h2>
      <div className={styles.userDemoWrap}>
        <SideNavUserItem
          {...USER_PROPS}
          twoFaEnabled={false}
          defaultOpen
        />
      </div>

    </div>
  )
}
