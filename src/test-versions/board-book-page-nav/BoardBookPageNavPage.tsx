/* BoardBookPageNavPage — Test versions › Board book page navigation
   (Figma 32114-124836).

   Same shell as the Meeting prototype (side navigation, meeting header, tabs),
   but each tab is a separate UI version of the Board book viewer so layouts can
   be compared side by side:
     • Version 1 — Full width: document only, agenda panel hidden
     • Version 2 — Floating controls: tool palette, zoom cards and page arrows
       over the document, with or without the agenda panel
       (BoardBookFilmstripViewer)
     • Version 3 — Reading mode: full-area document, floating control bar,
       table of content panel, reading progress, focus mode
       (BoardBookReadingViewer)
     • Only document toggle — the winner's (Version 3) reading-mode navigation
       with the agenda panel open and its "Show documents only" toggle
     • Reports — all reports on one page with side navigation (ReportsPage):
       design review (DESIGN_REVIEW.md), usability study (usability-study.json,
       the PPTX is generated from the same file) and UX audit (ux-audit.json)
   Tabs are labelled by number only (Version 1–3), plus Report and "Only
   document toggle". */

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
import BoardBookPageNavViewer from './BoardBookPageNavViewer'
import BoardBookFilmstripViewer from './BoardBookFilmstripViewer'
import BoardBookReadingViewer from './BoardBookReadingViewer'
import ReportsPage from './ReportsPage'
import { Q4_BOARD_BOOK, q4PageImage } from './q4BoardPack'
import styles from './BoardBookPageNavPage.module.css'

const bookmarkSvg = functional.find(i => i.name === 'bookmark')!.svg
const removeSvg   = actions.find(i => i.name === 'multiply')!.svg

const MEETING_TITLE = 'Board of Directors / October 2026'

const WORKSPACES = [{ id: 'star', name: 'STAR Enterprises', initials: 'ST', color: '#28a560' }]
const USER = {
  userSrc:   'https://i.pravatar.cc/64?img=47',
  userName:  'Olivia Thompson',
  userEmail: 'thompsonolivia@gmail.com',
}

const initialReportTabs = ['report', 'study', 'audit']

type VersionTab = 'v1' | 'v2' | 'v3' | 'reports' | 'doc-toggle'

const TABS: TabItem[] = [
  { id: 'v1', label: 'Version 1' },
  { id: 'v2', label: 'Version 2' },
  { id: 'v3', label: 'Version 3' },
  { id: 'reports', label: 'Reports' },
  { id: 'doc-toggle', label: 'Only document toggle' },
]


export default function BoardBookPageNavPage() {
  const [navItem,   setNavItem]   = useState<NavMenuItemKey>('meetings')
  const [workspace, setWorkspace] = useState('star')
  /* `?tab=v2` (etc.) opens a version directly — handy for sharing and screenshots.
     The old report tabs (?tab=report | study | audit) open Reports at that report. */
  const [initialReport] = useState(() => {
    const t = new URLSearchParams(window.location.search).get('tab')
    return ({ report: 'review', study: 'study', audit: 'audit' } as Record<string, string>)[t ?? '']
  })
  const [activeTab, setActiveTab] = useState<VersionTab>(() => {
    const t = new URLSearchParams(window.location.search).get('tab')
    if (initialReportTabs.includes(t ?? '')) return 'reports'
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
          {activeTab === 'v1' && <BoardBookPageNavViewer layout="full" book={Q4_BOARD_BOOK} pageImage={q4PageImage} />}
          {activeTab === 'v2' && <BoardBookFilmstripViewer book={Q4_BOARD_BOOK} pageImage={q4PageImage} />}
          {activeTab === 'v3' && <BoardBookReadingViewer book={Q4_BOARD_BOOK} pageImage={q4PageImage} />}
          {activeTab === 'reports' && <ReportsPage initial={initialReport} onOpenVersion={setActiveTab} />}
          {activeTab === 'doc-toggle' && <BoardBookReadingViewer book={Q4_BOARD_BOOK} pageImage={q4PageImage} documentsToggle defaultTocOpen />}
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
