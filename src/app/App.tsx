import { useState } from 'react'
import { SideNavigation, DEFAULT_NAV_ITEMS } from '../components/SideNavigation/SideNavigation'
import type { NavMenuItemKey } from '../components/SideNavigationItem/SideNavigationItem'
import TasksPage    from './features/tasks/TasksPage'
import MeetingsPage from './features/meetings/MeetingsPage'
import GenericPage  from './features/generic/GenericPage'
import styles from './App.module.css'

type AppPage = NavMenuItemKey

const WORKSPACES = [
  { id: 'star', name: 'STAR Enterprises', initials: 'ST', color: '#28a560' },
]

const USER = {
  userSrc:   'https://i.pravatar.cc/64?img=47',
  userName:  'Olivia Thompson',
  userEmail: 'thompsonolivia@gmail.com',
}

/* Title + illustration for every nav key except tasks + meetings (which have dedicated pages) */
const PAGE_META: Record<Exclude<AppPage, 'tasks' | 'meetings'>, { title: string; illustration: string }> = {
  search:    { title: 'Search',    illustration: 'folder-no-results'   },
  dashboard: { title: 'Dashboard', illustration: 'cards-stack-pending' },
  documents: { title: 'Documents', illustration: 'document'            },
  directory: { title: 'Directory', illustration: 'cards-users'         },
  reports:   { title: 'Reports',   illustration: 'presentation-report' },
  settings:  { title: 'Settings',  illustration: 'desktop-user'        },
  help:      { title: 'Help',      illustration: 'clipboard'           },
}

export default function App() {
  const [page, setPage]        = useState<AppPage>('tasks')
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
        {page === 'tasks'    ? <TasksPage />
          : page === 'meetings' ? <MeetingsPage />
          : <GenericPage {...PAGE_META[page]} />
        }
      </main>
    </div>
  )
}
