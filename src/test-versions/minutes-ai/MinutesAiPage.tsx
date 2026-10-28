/* MinutesAiPage — Test versions › Minutes AI.

   Same shell as the Meeting prototype (side navigation, meeting header, tabs),
   but each tab is a separate UI version of the meeting minutes so they can be
   compared side by side:
     • Version 1 — the current Minutes tab (src/meeting/MinutesTab), the
       baseline new versions are compared against.
   (Version 2 — an independent copy in ./v2 — was removed on 2026-10-27.) */

import { useEffect, useState } from 'react'
import { SideNavigation, DEFAULT_NAV_ITEMS } from '../../components/SideNavigation/SideNavigation'
import type { NavMenuItemKey } from '../../components/SideNavigationItem/SideNavigationItem'
import { PageHeader } from '../../components/PageHeader/PageHeader'
import { BadgeStatus } from '../../components/BadgeStatus/BadgeStatus'
import { Button } from '../../components/Button/Button'
import { Drawer } from '../../components/Drawer/Drawer'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { Tabs, type TabItem } from '../../components/Tabs/Tabs'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { functional } from '../../icons/functional'
import { actions } from '../../icons/actions'
import { MinutesTab } from '../../meeting/MinutesTab'
import styles from './MinutesAiPage.module.css'

const bookmarkSvg = functional.find(i => i.name === 'bookmark')!.svg
const removeSvg   = actions.find(i => i.name === 'multiply')!.svg

const MEETING_TITLE = 'Board of Directors / October 2026'

const WORKSPACES = [{ id: 'star', name: 'STAR Enterprises', initials: 'ST', color: '#28a560' }]
const USER = {
  userSrc:   'https://i.pravatar.cc/64?img=47',
  userName:  'Olivia Thompson',
  userEmail: 'thompsonolivia@gmail.com',
}

type VersionTab = 'v1'

const TABS: TabItem[] = [
  { id: 'v1', label: 'Version 1' },
]


export default function MinutesAiPage() {
  const [navItem,   setNavItem]   = useState<NavMenuItemKey>('meetings')
  const [workspace, setWorkspace] = useState('star')
  /* `?tab=v1` (etc.) opens a version directly — handy for sharing and screenshots. */
  const [activeTab, setActiveTab] = useState<VersionTab>(() => {
    const t = new URLSearchParams(window.location.search).get('tab')
    return TABS.some(x => x.id === t) ? (t as VersionTab) : 'v1'
  })

  const { tier, isCompact } = useBreakpoint()
  const [navOpen, setNavOpen] = useState(false)
  useEffect(() => { if (tier !== 'mobile') setNavOpen(false) }, [tier])

  const onMenuClick = tier === 'mobile' ? () => setNavOpen(true) : undefined
  const menuTier: 'tablet' | 'mobile' = isCompact ? 'tablet' : 'mobile'

  const navProps = {
    workspaces: WORKSPACES,
    activeWorkspaceId: workspace,
    onWorkspaceSelect: setWorkspace,
    navItems: DEFAULT_NAV_ITEMS,
    activeItem: navItem,
    onItemClick: (key: NavMenuItemKey) => { setNavItem(key); setNavOpen(false) },
    ...USER,
    twoFaEnabled: true,
    onProfileClick: () => console.log('profile'),
    onConnectionsClick: () => console.log('connections'),
    onLogoutClick: () => console.log('logout'),
  }

  return (
    <div className={styles.shell}>
      {tier !== 'mobile' && (
        <SideNavigation variant={tier === 'laptop' ? 'rail' : 'sidebar'} {...navProps} />
      )}

      <main className={styles.main}>
        <PageHeader
          onMenuClick={onMenuClick}
          menuTier={menuTier}
          onBack={() => { window.location.href = '/board.html' }}
          title={MEETING_TITLE}
          badge={<BadgeStatus type="neutral" label="Agenda published" />}
          className={styles.pageHeader}
          actions={
            <Tooltip label="Bookmark" position="bottom">
              <Button
                variant="tertiary"
                intent="neutral"
                size="m"
                iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: bookmarkSvg }} />}
                onClick={() => console.log('bookmark')}
                aria-label="Bookmark meeting"
              />
            </Tooltip>
          }
        />

        <Tabs
          tabs={TABS}
          value={activeTab}
          onChange={id => setActiveTab(id as VersionTab)}
          className={styles.tabsRoot}
        />

        <div className={styles.content}>
          {activeTab === 'v1' && <MinutesTab />}
        </div>
      </main>

      {tier === 'mobile' && (
        <Drawer
          variant="overlay"
          side="left"
          width={isCompact ? 460 : '100%'}
          open={navOpen}
          onClose={() => setNavOpen(false)}
          ariaLabel="Main navigation"
          header={
            <div className={[styles.navDrawerHeader, isCompact ? styles.navDrawerHeaderTablet : styles.navDrawerHeaderMobile].join(' ')}>
              <Button
                variant="tertiary"
                intent="neutral"
                size="m"
                iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: removeSvg }} />}
                onClick={() => setNavOpen(false)}
                aria-label="Close navigation menu"
              />
            </div>
          }
          bodyClassName={styles.navDrawerBody}
        >
          <SideNavigation variant={isCompact ? 'drawer-tablet' : 'drawer-mobile'} {...navProps} />
        </Drawer>
      )}
    </div>
  )
}
