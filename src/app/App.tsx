import { useState } from 'react'
import { SideNavigation, DEFAULT_NAV_ITEMS } from '../components/SideNavigation/SideNavigation'
import type { NavMenuItemKey } from '../components/SideNavigationItem/SideNavigationItem'
import TasksPage         from './features/tasks/TasksPage'
import DashboardPage     from './features/dashboard/DashboardPage'
import CSBeforeMeetingPage from './features/cs-before-meeting/CSBeforeMeetingPage'
import GenericPage       from './features/generic/GenericPage'
import styles from './App.module.css'

type AppPage = NavMenuItemKey
/** Which dashboard variant to render when `page === 'dashboard'` */
export type DashboardVariant = 'default' | 'cs-before-meeting'

const WORKSPACES = [
  { id: 'star', name: 'STAR Enterprises', initials: 'ST', color: '#28a560' },
]

const USER = {
  userSrc:   'https://i.pravatar.cc/64?img=47',
  userName:  'Olivia Thompson',
  userEmail: 'thompsonolivia@gmail.com',
}

/* Title + illustration for every nav key except tasks (which has TasksPage) */
const PAGE_META: Record<Exclude<AppPage, 'tasks'>, { title: string; illustration: string }> = {
  search:    { title: 'Search',    illustration: 'folder-no-results'   },
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
}: { initialPage?: AppPage; dashboardVariant?: DashboardVariant } = {}) {
  const [page, setPage]        = useState<AppPage>(initialPage)
  const [workspaceId, setWsId] = useState('star')

  return (
    <div className={styles.shell}>
      <SideNavigation
        workspaces={WORKSPACES}
        activeWorkspaceId={workspaceId}
        onWorkspaceSelect={setWsId}
        navItems={DEFAULT_NAV_ITEMS}
        activeItem={page}
        onItemClick={setPage}
        {...USER}
        twoFaEnabled
        onProfileClick={() => console.log('profile')}
        onConnectionsClick={() => console.log('connections')}
        onLogoutClick={() => console.log('logout')}
      />

      <main className={styles.main}>
        {page === 'tasks'     && <TasksPage />}
        {page === 'dashboard' && (
          dashboardVariant === 'cs-before-meeting'
            ? <CSBeforeMeetingPage />
            : <DashboardPage />
        )}
        {page !== 'tasks' && page !== 'dashboard' && <GenericPage {...PAGE_META[page]} />}
      </main>
    </div>
  )
}
