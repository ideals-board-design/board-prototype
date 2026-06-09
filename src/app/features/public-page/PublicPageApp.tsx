import { useState } from 'react'
import { SideNavigation, DEFAULT_NAV_ITEMS } from '../../../components/SideNavigation/SideNavigation'
import type { NavMenuItemKey } from '../../../components/SideNavigationItem/SideNavigationItem'
import GenericPage from '../generic/GenericPage'
import { PageHeader } from '../../../components/PageHeader/PageHeader'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import styles from './PublicPageApp.module.css'

const WORKSPACES = [
  { id: 'star', name: 'STAR Enterprises', initials: 'ST', color: '#28a560' },
]

const USER = {
  userSrc:   'https://i.pravatar.cc/64?img=47',
  userName:  'Olivia Thompson',
  userEmail: 'thompsonolivia@gmail.com',
}

const PAGE_META: Record<Exclude<NavMenuItemKey, 'dashboard'>, { title: string; illustration: string }> = {
  search:    { title: 'Search',    illustration: 'folder-no-results'   },
  meetings:  { title: 'Meetings',  illustration: 'calendar'            },
  tasks:     { title: 'Tasks',     illustration: 'cards-stack-tasks'   },
  documents: { title: 'Documents', illustration: 'document'            },
  directory: { title: 'Directory', illustration: 'cards-users'         },
  reports:   { title: 'Reports',   illustration: 'presentation-report' },
  settings:  { title: 'Settings',  illustration: 'desktop-user'        },
  help:      { title: 'Help',      illustration: 'clipboard'           },
}

export default function PublicPageApp() {
  const [page, setPage]        = useState<NavMenuItemKey>('dashboard')
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
        onProfileClick={() => {}}
        onConnectionsClick={() => {}}
        onLogoutClick={() => {}}
      />

      <main className={styles.main}>
        {page === 'dashboard'
          ? (
            <div className={styles.page}>
              <PageHeader title="Public Page" />
              <div className={styles.body}>
                <EmptyState
                  illustration="web-page-warning"
                  title="Nothing here yet"
                  description="This page is under construction."
                />
              </div>
            </div>
          )
          : <GenericPage {...PAGE_META[page]} />
        }
      </main>
    </div>
  )
}
