import { useState } from 'react'
import { SideNavigation, DEFAULT_NAV_ITEMS } from '../components/SideNavigation/SideNavigation'
import type { NavMenuItemKey } from '../components/SideNavigationItem/SideNavigationItem'
import { Drawer } from '../components/Drawer/Drawer'
import { Button } from '../components/Button/Button'
import { actions } from '../icons/actions'
import { useBreakpoint } from '../hooks/useBreakpoint'
import TasksPage         from './features/tasks/TasksPage'
import DashboardPage     from './features/dashboard/DashboardPage'
import CSBeforeMeetingPage from './features/cs-before-meeting/CSBeforeMeetingPage'
import GenericPage       from './features/generic/GenericPage'
import styles from './App.module.css'

const multiplySvg = actions.find(i => i.name === 'multiply')!.svg

type AppPage = NavMenuItemKey
/** Which dashboard variant to render when `page === 'dashboard'` */
export type DashboardVariant = 'default' | 'cs-before-meeting'
/** Which meetings variant to render when `page === 'meetings'` */
export type MeetingsVariant = 'default' | 'create-public'

const WORKSPACES = [
  { id: 'star', name: 'STAR Enterprises', initials: 'ST', color: 'var(--color-brand)' },
]

const USER = {
  userSrc:   'https://i.pravatar.cc/64?img=47',
  userName:  'Olivia Thompson',
  userEmail: 'thompsonolivia@gmail.com',
}

/* Title + illustration for every nav key except tasks (which has TasksPage) */
const PAGE_META: Record<Exclude<AppPage, 'tasks'>, { title: string; illustration: string }> = {
  search:    { title: 'Search',    illustration: 'folder-no-results'   },
  chats:     { title: 'Chats',     illustration: 'cards-chats'         },
  dashboard: { title: 'Dashboard', illustration: 'cards-stack-pending' },
  meetings:  { title: 'Meetings',  illustration: 'calendar'            },
  documents: { title: 'Documents', illustration: 'document'            },
  directory: { title: 'Directory', illustration: 'cards-users'         },
  reports:   { title: 'Reports',   illustration: 'presentation-report' },
  settings:  { title: 'Settings',  illustration: 'desktop-user'        },
  help:      { title: 'Help',      illustration: 'clipboard'           },
}

export default function App({
  initialPage = 'tasks',
  dashboardVariant = 'default',
  meetingsVariant = 'default',
}: { initialPage?: AppPage; dashboardVariant?: DashboardVariant; meetingsVariant?: MeetingsVariant } = {}) {
  const [page, setPage]        = useState<AppPage>(initialPage)
  const [workspaceId, setWsId] = useState('star')
  const [navOpen, setNavOpen]  = useState(false)

  const { tier, isCompact } = useBreakpoint()

  /* Mobile/tablet tier closes the drawer on navigation — otherwise the new
     page would render behind an open overlay. */
  function handleItemClick(key: NavMenuItemKey) {
    setPage(key)
    setNavOpen(false)
  }

  const navProps = {
    workspaces: WORKSPACES,
    activeWorkspaceId: workspaceId,
    onWorkspaceSelect: setWsId,
    navItems: DEFAULT_NAV_ITEMS,
    activeItem: page,
    onItemClick: handleItemClick,
    ...USER,
    twoFaEnabled: true,
    onProfileClick: () => console.log('profile'),
    onConnectionsClick: () => console.log('connections'),
    onLogoutClick: () => console.log('logout'),
  }

  const onMenuClick = tier === 'mobile' ? () => setNavOpen(true) : undefined
  const menuTier = isCompact ? 'tablet' : 'mobile'

  const pageContent = (
    <>
      {page === 'tasks'     && <TasksPage onMenuClick={onMenuClick} menuTier={menuTier} />}
      {page === 'dashboard' && (
        dashboardVariant === 'cs-before-meeting'
          ? <CSBeforeMeetingPage onMenuClick={onMenuClick} menuTier={menuTier} />
          : <DashboardPage onMenuClick={onMenuClick} menuTier={menuTier} />
      )}
      {page === 'meetings' && (
        meetingsVariant === 'create-public'
          ? <GenericPage title="Meeting creation public" illustration="calendar" onMenuClick={onMenuClick} menuTier={menuTier} />
          : <GenericPage {...PAGE_META.meetings} onMenuClick={onMenuClick} menuTier={menuTier} />
      )}
      {page !== 'tasks' && page !== 'dashboard' && page !== 'meetings' && (
        <GenericPage {...PAGE_META[page]} onMenuClick={onMenuClick} menuTier={menuTier} />
      )}
    </>
  )

  if (tier === 'mobile') {
    return (
      <div className={styles.shell}>
        <main className={styles.main}>{pageContent}</main>

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
                iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: multiplySvg }} />}
                onClick={() => setNavOpen(false)}
                aria-label="Close navigation menu"
              />
            </div>
          }
          bodyClassName={styles.navDrawerBody}
        >
          <SideNavigation variant={isCompact ? 'drawer-tablet' : 'drawer-mobile'} {...navProps} />
        </Drawer>
      </div>
    )
  }

  return (
    <div className={styles.shell}>
      <SideNavigation variant={tier === 'laptop' ? 'rail' : 'sidebar'} {...navProps} />
      <main className={styles.main}>{pageContent}</main>
    </div>
  )
}
