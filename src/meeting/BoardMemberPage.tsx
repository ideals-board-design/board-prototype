/* BoardMemberPage — read-only Agenda view for Board members / Directors.

   Directors review the *published* agenda before a meeting with no editing
   controls. It reuses the meeting shell (sidebar + header + tabs) and the
   read-only AgendaPreview renderer built for the secretary's "Preview as board
   member" feature, so the two stay visually identical.

   Every required design output is reachable through URL params so the states
   can be reviewed without a backend:
     • (default)      → published agenda, populated read-only cards
     • ?state=empty   → agenda not yet published (empty state)
     • ?download=off  → toolbar without "Download agenda" (downloading disabled
                        in workspace settings)

   Access permissions: restricted items (their own restriction or one inherited
   from an ancestor) are masked as "Restricted" in both the sidebar and the card,
   never revealing their title or content — `maskRestricted` on AgendaPreview. */

import { useEffect, useState } from 'react'
import { SideNavigation, DEFAULT_NAV_ITEMS } from '../components/SideNavigation/SideNavigation'
import type { NavMenuItemKey } from '../components/SideNavigationItem/SideNavigationItem'
import { PageHeader }  from '../components/PageHeader/PageHeader'
import { BadgeStatus } from '../components/BadgeStatus/BadgeStatus'
import { Button }      from '../components/Button/Button'
import { Tooltip }     from '../components/Tooltip/Tooltip'
import { Drawer }      from '../components/Drawer/Drawer'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { Tabs, type TabItem } from '../components/Tabs/Tabs'
import { EmptyState }  from '../components/EmptyState/EmptyState'
import { StickyFooter } from '../components/StickyFooter/StickyFooter'
import { functional } from '../icons/functional'
import { actions }    from '../icons/actions'
import { AgendaPreview, MEETING_TITLE, type AgendaItem } from './MeetingPage'
import styles from './MeetingPage.module.css'

const removeSvg   = actions.find(i => i.name === 'multiply')!.svg
const bookmarkSvg = functional.find(i => i.name === 'bookmark')!.svg
const downloadSvg = actions.find(i => i.name === 'download-alt')!.svg
const checkCircleSvg = actions.find(i => i.name === 'check-circle')!.svg
const draftCircleSvg = actions.find(i => i.name === 'draft-circle')!.svg

const WORKSPACES = [{ id: 'star', name: 'STAR Enterprises', initials: 'ST', color: '#28a560' }]
/* The viewer here is a Board member (not the secretary who authors the agenda). */
const BOARD_MEMBER = {
  userSrc:   'https://i.pravatar.cc/64?img=12',
  userName:  'Alexander Anderson',
  userEmail: 'a.anderson@starenterprises.com',
}
/* Named in the empty-state copy — the secretary preparing the agenda. */
const SECRETARY_NAME = 'Olivia Thompson'

const TABS: TabItem[] = [
  { id: 'meeting',    label: 'Meeting',    icon: checkCircleSvg },
  { id: 'agenda',     label: 'Agenda',     icon: draftCircleSvg },
  { id: 'board-book', label: 'Board book', icon: draftCircleSvg },
  { id: 'tasks',      label: 'Tasks' },
  { id: 'minutes',    label: 'Minutes' },
]
type BoardTab = 'meeting' | 'agenda' | 'board-book' | 'tasks' | 'minutes'

/* ── Published agenda (board-member visible data) ───────────────────────────
   Only the latest *published* version is ever shown — unpublished secretary
   edits and document requests are not part of this data at all (they never
   reach a board member). Document requests that were Completed already had
   their files promoted to regular attachments upstream, so they appear here as
   plain attachments. This sample exercises every required card variant:
     • item 1  — minimal card (all optional sections hidden)
     • item 2  — fully populated (purpose, presenter, description, two motions,
                 attachment + link)
     • item 3  — one motion, plus a 6-level-deep nested chain
     • item 4  — Restricted (own restriction); 4.1 inherits it */
const PUBLISHED_ITEMS: AgendaItem[] = [
  {
    id: '1', path: [1], title: 'Call to Order', durationMin: 5,
  },
  {
    id: '2', path: [2], title: 'Approval of previous meeting minutes', durationMin: 10,
    purpose: 'approval',
    presenters: [{ name: 'Alexander Anderson', avatar: 'https://i.pravatar.cc/40?img=12' }],
    description:
      '<p>The minutes from the Board meeting held on <strong>January 20, 2026</strong> were distributed to members on January 27, 2026.</p>' +
      '<p>No amendments have been submitted prior to this meeting. Members will be invited to raise any final corrections before approval.</p>',
    motions: [
      'That the minutes of the meeting held on 20 January 2026 be approved.',
      'That the minutes of the Board of Directors meeting held on 20 January 2026, having been previously circulated to all members and with no further amendments submitted, be approved and adopted as a true and accurate record of the proceedings.',
    ],
    attachments: [
      { id: 'a-1', name: 'Board of Directors January 20, 2026.pdf', format: 'pdf',  status: 'ready' },
      { id: 'a-2', name: 'Results 2026', format: 'link', status: 'ready', url: 'https://example.com/results-2026' },
    ],
  },
  {
    id: '3', path: [3], title: 'Discuss financial performance and projections', durationMin: 20,
    purpose: 'discussion',
    description: '<p>Review of Q4 results against forecast and the outlook for the coming year.</p>',
    motions: [
      'That the Board note the financial performance report for the fourth quarter.',
    ],
    attachments: [
      { id: 'a-3', name: 'Q4 Financial Report.pdf', format: 'pdf', status: 'ready' },
    ],
  },
  /* 6 levels of nesting under item 3 (3.1 → 3.1.1.1.1.1). */
  { id: '3-1',     path: [3, 1],             title: 'Revenue by segment',            durationMin: 5, purpose: 'information' },
  { id: '3-1-1',   path: [3, 1, 1],          title: 'Domestic markets',              durationMin: 5 },
  { id: '3-1-1-1', path: [3, 1, 1, 1],       title: 'Enterprise accounts',           durationMin: 5 },
  { id: '3-1-1-1-1',   path: [3, 1, 1, 1, 1],    title: 'Top ten by ARR',             durationMin: 5 },
  { id: '3-1-1-1-1-1', path: [3, 1, 1, 1, 1, 1], title: 'Renewal risk watchlist',     durationMin: 5 },
  {
    id: '4', path: [4], title: 'Executive session — compensation', durationMin: 15,
    /* Restricted from this board member: masked as "Restricted" everywhere. */
    restrictions: ['viewer'],
    purpose: 'decision',
    description: '<p>Confidential compensation discussion.</p>',
    motions: ['That the proposed compensation framework be adopted.'],
  },
  /* Inherits item 4's restriction (visibility inheritance) — also masked. */
  { id: '4-1', path: [4, 1], title: 'Executive pay bands', durationMin: 5 },
  {
    id: '5', path: [5], title: 'Any other business', durationMin: 5,
    purpose: 'discussion',
  },
]

export default function BoardMemberPage() {
  const params = new URLSearchParams(window.location.search)
  /* Agenda not yet published (or still a draft) → empty state. */
  const published = params.get('state') !== 'empty'
  /* Workspace setting: downloading enabled unless explicitly turned off. */
  const downloadEnabled = params.get('download') !== 'off'

  const [navItem,   setNavItem]   = useState<NavMenuItemKey>('meetings')
  const [workspace, setWorkspace] = useState('star')
  const [activeTab, setActiveTab] = useState<BoardTab>('agenda')
  /* A document opened from an attachment row — shown in the Board book tab,
     "scrolled to" the corresponding document (placeholder viewer). */
  const [boardBookDoc, setBoardBookDoc] = useState<string | null>(null)
  const openInBoardBook = (name: string) => { setBoardBookDoc(name); setActiveTab('board-book') }

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
    ...BOARD_MEMBER,
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
          onBack={() => { window.location.href = '/' }}
          title={MEETING_TITLE}
          badge={published
            ? <BadgeStatus type="positive" label="Agenda published" />
            : <BadgeStatus type="neutral" label="Agenda not published" />}
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
          onChange={id => setActiveTab(id as BoardTab)}
          className={styles.tabsRoot}
        />

        <div className={styles.content}>
          {activeTab === 'agenda' && (
            published ? (
              <AgendaPreview
                items={PUBLISHED_ITEMS}
                maskRestricted
                restrictedLabel="Restricted"
                documentsReadOnly
                attachmentHandlers={{
                  onChange:          () => {},
                  /* Clicking a document row opens the Board book scrolled to it. */
                  onOpen:            att => openInBoardBook(att.name),
                  onDownload:        att => console.log('download', att.name),
                  onCopyToDocuments: () => {},
                }}
                /* Toolbar: "Download agenda" only when downloading is enabled in
                   workspace settings (published agendas). */
                footer={downloadEnabled ? (
                  <StickyFooter
                    left={
                      <Button
                        variant="secondary"
                        intent="neutral"
                        size="m"
                        iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: downloadSvg }} />}
                        onClick={() => console.log('download agenda')}
                      >
                        Download agenda
                      </Button>
                    }
                  />
                ) : undefined}
                header={null}
              />
            ) : (
              <EmptyState
                illustration="clipboard"
                description={`${SECRETARY_NAME} is preparing the agenda. We will email you when the agenda is ready.`}
                className={styles.emptyState}
              />
            )
          )}

          {activeTab === 'board-book' && (
            <EmptyState
              illustration="clipboard"
              title={boardBookDoc ?? 'Board book'}
              description={boardBookDoc
                ? 'Opened from the agenda. The full document viewer is out of scope for this prototype.'
                : 'Published agenda documents appear here.'}
              className={styles.emptyState}
            />
          )}

          {activeTab === 'meeting' && (
            <EmptyState
              illustration="clipboard"
              title="Meeting details"
              description="Board members see the meeting overview here."
              className={styles.emptyState}
            />
          )}

          {activeTab === 'tasks' && (
            <EmptyState illustration="clipboard" title="Tasks" description="Your meeting tasks appear here." className={styles.emptyState} />
          )}
          {activeTab === 'minutes' && (
            <EmptyState illustration="clipboard" title="Minutes" description="Published minutes appear here." className={styles.emptyState} />
          )}
        </div>
      </main>

      {/* ≤1023 overlay nav drawer (Figma "Navigation behaviour"). */}
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
