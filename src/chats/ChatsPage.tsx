/* ChatsPage — Figma frames 1860:8981 (empty) · 1405:20883 (populated)
   Two-pane messaging prototype: chat list (left, 480px) + conversation (right). */

import { useEffect, useMemo, useState } from 'react'
import { SideNavigation, DEFAULT_NAV_ITEMS } from '../components/SideNavigation/SideNavigation'
import type { NavMenuItemKey } from '../components/SideNavigationItem/SideNavigationItem'
import { PageHeader } from '../components/PageHeader/PageHeader'
import { Search } from '../components/Search/Search'
import { Button } from '../components/Button/Button'
import { BadgeStatus } from '../components/BadgeStatus/BadgeStatus'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { ChatListItem, type ChatType, type ReadStatus } from './components/ChatListItem'
import { ConversationHeader } from './components/ConversationHeader'
import { MessageBubble } from './components/MessageBubble'
import { Composer } from './components/Composer'
import { actions } from '../icons/actions'
import styles from './ChatsPage.module.css'

const plusSvg = actions.find(i => i.name === 'plus')!.svg

/* ── SideNavigation config ─────────────────────────────── */
const WORKSPACES = [{ id: 'star', name: 'STAR Enterprises', initials: 'ST', color: '#28a560' }]
const USER = {
  userSrc:   'https://i.pravatar.cc/64?img=47',
  userName:  'Olivia Thompson',
  userEmail: 'thompsonolivia@gmail.com',
}

/* ── Mock data ──────────────────────────────────────────── */

interface Chat {
  id:              string
  type:            ChatType
  name:            string
  preview:         string
  time?:           string
  avatarSrc?:      string
  avatarInitials?: string
  unread:          boolean
  readStatus?:     ReadStatus
  headerStatus:    string
}

interface Message {
  id:              string
  mine:            boolean
  text:            string
  time:            string
  senderName?:     string
  avatarSrc?:      string
  avatarInitials?: string
  readStatus?:     ReadStatus
  showHeader?:     boolean
}

const CHATS: Chat[] = [
  { id: 'oliver',     type: 'one-to-one', name: 'Oliver Garcia',        preview: "I'll get back to you ASAP",                     time: '09:05 AM', avatarInitials: 'OG', unread: false, readStatus: 'sent', headerStatus: 'Online' },
  { id: 'liam',       type: 'one-to-one', name: 'Liam Carter',          preview: 'See you at the next meeting!',                  time: '09:48 AM', avatarInitials: 'LC', unread: true,  headerStatus: 'Online' },
  { id: 'board',      type: 'group',      name: 'Board Members',        preview: 'Upcoming meeting on March 25',                  time: 'Mar 12',   avatarInitials: '12', unread: false, readStatus: 'read', headerStatus: '12 members' },
  { id: 'sophia',     type: 'one-to-one', name: 'Sophia Martinez',      preview: 'Can you review the minutes before Friday?',     time: 'Mar 10',   avatarInitials: 'SM', unread: true,  headerStatus: 'Offline' },
  { id: 'governance', type: 'group',      name: 'Governance Committee', preview: 'Draft policy attached for review',              time: 'Mar 9',    avatarInitials: '6',  unread: true,  headerStatus: '6 members' },
  { id: 'ethan',      type: 'one-to-one', name: 'Ethan Walker',         preview: 'Thanks, that works for me',                     time: 'Mar 8',    avatarInitials: 'EW', unread: false, readStatus: 'read', headerStatus: 'Online' },
  { id: 'audit',      type: 'group',      name: 'Audit Team',           preview: 'Uploaded the Q1 report to Documents',           time: 'Mar 6',    avatarInitials: '4',  unread: false, readStatus: 'sent', headerStatus: '4 members' },
  { id: 'ava',        type: 'one-to-one', name: 'Ava Thompson',         preview: 'Looking forward to it',                         time: 'Mar 2',    avatarInitials: 'AV', unread: false, headerStatus: 'Offline' },
]

const MESSAGES: Record<string, Message[]> = {
  oliver: [
    { id: '1', mine: false, showHeader: true, senderName: 'Oliver Garcia', avatarInitials: 'OG', text: 'Do you have the updated agenda for Thursday?', time: '08:40 AM' },
    { id: '2', mine: true,  text: 'Yes, sending it over now.', time: '08:52 AM', readStatus: 'read' },
    { id: '3', mine: true,  text: "I'll get back to you ASAP with the final numbers too.", time: '09:05 AM', readStatus: 'sent' },
  ],
  liam: [
    { id: '1', mine: false, showHeader: true, senderName: 'Liam Carter', avatarInitials: 'LC', text: 'Quick reminder — board meeting moved to 3pm.', time: '09:20 AM' },
    { id: '2', mine: false, text: 'See you at the next meeting!', time: '09:48 AM' },
  ],
  board: [
    { id: '1', mine: false, showHeader: true, senderName: 'Priya Nair', avatarInitials: 'PN', text: 'Reminder: quarterly review docs are due Monday.', time: '10:02 AM' },
    { id: '2', mine: true,  text: 'Noted, I will circulate the draft today.', time: '10:15 AM', readStatus: 'read' },
    { id: '3', mine: false, showHeader: true, senderName: 'Marcus Lee', avatarInitials: 'ML', text: 'Upcoming meeting on March 25', time: '11:00 AM' },
    { id: '4', mine: false, showHeader: false, text: 'Please confirm your availability by Friday.', time: '11:01 AM' },
  ],
  sophia: [
    { id: '1', mine: false, showHeader: true, senderName: 'Sophia Martinez', avatarInitials: 'SM', text: 'Can you review the minutes before Friday?', time: 'Mar 10' },
  ],
  governance: [
    { id: '1', mine: false, showHeader: true, senderName: 'Grace Kim', avatarInitials: 'GK', text: 'Draft policy attached for review', time: 'Mar 9' },
    { id: '2', mine: true,  text: 'Will review by end of day.', time: 'Mar 9', readStatus: 'sent' },
  ],
  ethan: [
    { id: '1', mine: true,  text: 'Does 2pm Tuesday work for the follow-up call?', time: 'Mar 8', readStatus: 'read' },
    { id: '2', mine: false, showHeader: true, senderName: 'Ethan Walker', avatarInitials: 'EW', text: 'Thanks, that works for me', time: 'Mar 8' },
  ],
  audit: [
    { id: '1', mine: true,  text: 'Uploaded the Q1 report to Documents', time: 'Mar 6', readStatus: 'sent' },
  ],
  ava: [
    { id: '1', mine: false, showHeader: true, senderName: 'Ava Thompson', avatarInitials: 'AV', text: 'Looking forward to it', time: 'Mar 2' },
  ],
}

export default function ChatsPage() {
  const [navItem, setNavItem] = useState<NavMenuItemKey>('chats')
  const [workspace, setWorkspace] = useState('star')

  const [search, setSearch] = useState('')
  const [listLoading, setListLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [conversationLoading, setConversationLoading] = useState(false)
  const [unreadOverrides, setUnreadOverrides] = useState<Record<string, boolean>>({})
  const [messagesByChat, setMessagesByChat] = useState(MESSAGES)
  const [draft, setDraft] = useState('')

  /* Simulate the list's initial load — genuinely exercises the Skeleton variant. */
  useEffect(() => {
    const t = setTimeout(() => setListLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const filteredChats = useMemo(
    () => CHATS.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  )

  const selectedChat = CHATS.find(c => c.id === selectedId) ?? null

  function handleSelect(id: string) {
    if (id === selectedId) return
    setSelectedId(id)
    setUnreadOverrides(prev => ({ ...prev, [id]: false }))
    setConversationLoading(true)
    setTimeout(() => setConversationLoading(false), 450)
  }

  function handleSend() {
    if (!selectedChat || !draft.trim()) return
    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessagesByChat(prev => ({
      ...prev,
      [selectedChat.id]: [
        ...(prev[selectedChat.id] ?? []),
        { id: `local-${Date.now()}`, mine: true, text: draft.trim(), time, readStatus: 'sent' },
      ],
    }))
    setDraft('')
  }

  const conversation = selectedChat ? messagesByChat[selectedChat.id] ?? [] : []

  return (
    <div className={styles.shell}>
      <SideNavigation
        workspaces={WORKSPACES}
        activeWorkspaceId={workspace}
        onWorkspaceSelect={setWorkspace}
        navItems={DEFAULT_NAV_ITEMS}
        activeItem={navItem}
        onItemClick={setNavItem}
        {...USER}
        twoFaEnabled
        onProfileClick={() => console.log('profile')}
        onConnectionsClick={() => console.log('connections')}
        onLogoutClick={() => console.log('logout')}
      />

      <main className={styles.main}>
        <PageHeader title="Chats" />

        <div className={styles.body}>
          {/* ── Chat list ──────────────────────────────────── */}
          <div className={styles.list}>
            <div className={styles.listTopBar}>
              <Search
                size="m"
                placeholder="Search"
                value={search}
                onChange={setSearch}
                onClear={() => setSearch('')}
                filter
                onFilterClick={() => console.log('filter')}
              />
              <Button
                variant="secondary"
                intent="neutral"
                size="m"
                aria-label="New chat"
                iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: plusSvg }} />}
              />
            </div>

            <div className={styles.listScroll}>
              {listLoading ? (
                <>
                  <ChatListItem type="one-to-one" name="" preview="" time="" skeleton />
                  <ChatListItem type="one-to-one" name="" preview="" time="" skeleton />
                  <ChatListItem type="one-to-one" name="" preview="" time="" skeleton />
                </>
              ) : (
                filteredChats.map(c => (
                  <ChatListItem
                    key={c.id}
                    type={c.type}
                    name={c.name}
                    preview={c.preview}
                    time={c.time}
                    avatarInitials={c.avatarInitials}
                    avatarSrc={c.avatarSrc}
                    selected={c.id === selectedId}
                    unread={unreadOverrides[c.id] ?? c.unread}
                    readStatus={c.readStatus}
                    onClick={() => handleSelect(c.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Conversation ───────────────────────────────── */}
          <div className={styles.conversation}>
            {!selectedChat ? (
              <EmptyState
                illustration="cards-chats"
                title="No conversation selected"
                description="Select a chat from the list to start messaging."
                action={
                  <Button
                    variant="primary"
                    size="m"
                    iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: plusSvg }} />}
                  >
                    New chat
                  </Button>
                }
              />
            ) : conversationLoading ? (
              <>
                <ConversationHeader
                  type={selectedChat.type}
                  name=""
                  status=""
                  skeleton
                />
                <div className={styles.messages}>
                  <MessageBubble mine={false} isGroup={selectedChat.type === 'group'} text="" time="" skeleton />
                  <MessageBubble mine={true}  isGroup={selectedChat.type === 'group'} text="" time="" skeleton />
                  <MessageBubble mine={false} isGroup={selectedChat.type === 'group'} text="" time="" skeleton />
                </div>
              </>
            ) : (
              <>
                <ConversationHeader
                  type={selectedChat.type}
                  name={selectedChat.name}
                  status={selectedChat.headerStatus}
                  avatarInitials={selectedChat.avatarInitials}
                  avatarSrc={selectedChat.avatarSrc}
                  onMoreClick={() => console.log('more')}
                />

                <div className={styles.messages}>
                  <div className={styles.dateDivider}>
                    <BadgeStatus type="disable" label="Jan 12, 2025" />
                  </div>
                  {conversation.map((m, i) => {
                    const prev = conversation[i - 1]
                    /* Group received messages carry showHeader as the explicit
                       continuation signal — no need to (mis)infer it from
                       senderName, which continuation messages don't repeat. */
                    const groupStart = !prev || prev.mine !== m.mine ||
                      (!m.mine && selectedChat.type === 'group' && m.showHeader !== false)
                    return (
                      <MessageBubble
                        key={m.id}
                        mine={m.mine}
                        isGroup={selectedChat.type === 'group'}
                        text={m.text}
                        time={m.time}
                        showHeader={m.showHeader}
                        senderName={m.senderName}
                        avatarSrc={m.avatarSrc}
                        avatarInitials={m.avatarInitials}
                        readStatus={m.readStatus}
                        groupStart={groupStart}
                        onReply={() => console.log('reply', m.id)}
                        onCopy={() => console.log('copy', m.id)}
                        onMore={() => console.log('more', m.id)}
                      />
                    )
                  })}
                </div>

                <Composer value={draft} onChange={setDraft} onSend={handleSend} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
