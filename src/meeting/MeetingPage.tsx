/* MeetingPage — Meeting prototype shell (SideNavigation + header + tabs)
   Figma: 11778-90774 (Agenda tab, empty state) */

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SideNavigation, DEFAULT_NAV_ITEMS } from '../components/SideNavigation/SideNavigation'
import type { NavMenuItemKey } from '../components/SideNavigationItem/SideNavigationItem'
import { PageHeader }  from '../components/PageHeader/PageHeader'
import { BadgeStatus } from '../components/BadgeStatus/BadgeStatus'
import { Button }      from '../components/Button/Button'
import { Tooltip }     from '../components/Tooltip/Tooltip'
import { Tabs, type TabItem } from '../components/Tabs/Tabs'
import { Dropdown, type DropdownSelectableOption, type DropdownOption } from '../components/Dropdown/Dropdown'
import { Autocomplete, type AutocompleteOption } from '../components/Autocomplete/Autocomplete'
import { EmptyState }  from '../components/EmptyState/EmptyState'
import { TextField }   from '../components/TextField/TextField'
import { Banner }      from '../components/Banner/Banner'
import { Avatar }      from '../components/Avatar/Avatar'
import { StickyFooter } from '../components/StickyFooter/StickyFooter'
import { Radio } from '../components/Radio/Radio'
import { SegmentControl } from '../components/SegmentControl/SegmentControl'
import { DatePicker } from '../components/DatePicker/DatePicker'
import { TimeField } from '../components/TimeField/TimeField'
import { Modal } from '../components/Modal/Modal'
import { MeetingDate } from '../components/MeetingDate/MeetingDate'
import { DurationField } from './DurationField'
import { PurposeField, type PurposeOption } from './PurposeField'
import { EditPurposeModal } from './EditPurposeModal'
import { VisibilityModal, type VisibilityUser } from './VisibilityModal'
import { ItemMenu } from './ItemMenu'
import { RichTextField } from './RichTextField'
import { sanitizeHtml, htmlHasText } from './sanitizeHtml'
import { filterAddresses, SAMPLE_ADDRESSES, participantCandidates, autoSelectedGroup } from './meetingLogic'
import { MotionsField } from './MotionsField'
import { AttachmentsField, AttachmentsReadOnly, formatFromFileName, type Attachment, type DocRequest } from './AttachmentsField'
import { CopyDocumentModal } from './CopyDocumentModal'
import { AddLinkModal } from './AddLinkModal'
import { DocumentRequestDrawer, submittedAttachment, type DocRequestData } from './DocumentRequestDrawer'
import BoardBookViewer from './BoardBook/BoardBookViewer'
import { MinutesTab } from './MinutesTab'
import { ToastContainer, type ToastContainerHandle } from '../components/ToastContainer/ToastContainer'
import { functional }  from '../icons/functional'
import { actions }     from '../icons/actions'
import { arrows }      from '../icons/arrows'
import { communication } from '../icons/communication'
import { users as usersIcons } from '../icons/users'
import { media }       from '../icons/media'
import { location as locationIcons } from '../icons/location'
import { editor }      from '../icons/editor'
import { dateTime }    from '../icons/dateTime'
import { services }    from '../icons/services'
import { condition }   from '../icons/condition'
import { files as filesIcons } from '../icons/files'
import { ActionMenu } from './ActionMenu'
import styles from './MeetingPage.module.css'

const bookmarkSvg    = functional.find(i => i.name === 'bookmark')!.svg
const dragSvg        = functional.find(i => i.name === 'drag')!.svg
const checkCircleSvg = actions.find(i => i.name === 'check-circle')!.svg
const draftCircleSvg = actions.find(i => i.name === 'draft-circle')!.svg
const plusSvg        = actions.find(i => i.name === 'plus')!.svg
const editSvg        = actions.find(i => i.name === 'edit-alt')!.svg
const removeSvg      = actions.find(i => i.name === 'multiply')!.svg
const labelSvg       = actions.find(i => i.name === 'label')!.svg
const uploadSvg      = actions.find(i => i.name === 'upload-alt')!.svg
/* Convert to sub-item / item — the DS "reply" (↳) and "unnest" (↵) corner arrows,
   matching the item-actions component (Figma 9752-68192 / 11998-198448). */
const convertToSubSvg  = arrows.find(i => i.name === 'reply')!.svg
const convertToItemSvg = arrows.find(i => i.name === 'unnest')!.svg

/* Meeting-creation field icons (Figma 27312-59491). */
const mtgNameSvg     = communication.find(i => i.name === 'case')!.svg
const mtgTypeSvg     = usersIcons.find(i => i.name === 'user-laptop')!.svg
const mtgGroupSvg    = usersIcons.find(i => i.name === 'users-alt')!.svg
const mtgDateSvg     = dateTime.find(i => i.name === 'calender')!.svg
const mtgVideoSvg    = media.find(i => i.name === 'video')!.svg
const mtgLocationSvg = locationIcons.find(i => i.name === 'location-pin-alt')!.svg
const mtgDescSvg     = editor.find(i => i.name === 'align-left')!.svg
const rsvpUserSvg    = usersIcons.find(i => i.name === 'user')!.svg
const rsvpMaybeSvg   = communication.find(i => i.name === 'question-circle')!.svg
const rsvpNoSvg      = actions.find(i => i.name === 'multiply')!.svg
const brandMarkSvg   = actions.find(i => i.name === 'sparkles')!.svg
/* Videoconference field (IBP-20959) */
const vcZoomSvg      = services.find(i => i.name === 'zoom-monogram-colored')!.svg
const vcTeamsSvg     = services.find(i => i.name === 'ms-team-colored')!.svg
const googleCalSvg   = services.find(i => i.name === 'google-calendar-colored')!.svg
const outlookSvg     = services.find(i => i.name === 'ms-oulook-colored')!.svg
const linkSvg        = actions.find(i => i.name === 'external-link-alt')!.svg
const copySvg        = actions.find(i => i.name === 'copy')!.svg
const spinnerSvg     = condition.find(i => i.name === 'loader-round')!.svg
/* Meeting action overflow (≤1023px) */
const sendSvg        = communication.find(i => i.name === 'envelope')!.svg
const draftSvg       = filesIcons.find(i => i.name === 'file-default')!.svg
const trashSvg       = actions.find(i => i.name === 'trash-alt')!.svg
/* ≤1023px the sidebar collapses to a hamburger in the page header (Figma 17506-146087) */
const menuSvg        = functional.find(i => i.name === 'menu')!.svg
const backSvg        = arrows.find(i => i.name === 'angle-left-b')!.svg

/* Track a CSS media query in React so layout mode changes drive behaviour
   (drawer vs. inline sidebar, edit vs. view-only) without unmounting — state,
   and therefore any entered data, is preserved across breakpoint changes. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

const WORKSPACES = [{ id: 'star', name: 'STAR Enterprises', initials: 'ST', color: '#28a560' }]
const USER = {
  userSrc:   'https://i.pravatar.cc/64?img=47',
  userName:  'Olivia Thompson',
  userEmail: 'thompsonolivia@gmail.com',
}

export const MEETING_TITLE = 'Board of Directors / March 2026'

type MeetingTab = 'meeting' | 'agenda' | 'board-book' | 'tasks' | 'minutes'

const TABS: TabItem[] = [
  { id: 'meeting',    label: 'Meeting',    icon: checkCircleSvg },
  { id: 'agenda',     label: 'Agenda',     icon: draftCircleSvg },
  { id: 'board-book', label: 'Board book', icon: draftCircleSvg },
  { id: 'tasks',      label: 'Tasks' },
  { id: 'minutes',    label: 'Minutes' },
]

const PAST_MEETINGS: DropdownSelectableOption[] = [
  { value: 'feb-2026', label: 'Board of Directors / February 2026', secondaryText: 'Feb 2026' },
  { value: 'jan-2026', label: 'Board of Directors / January 2026',  secondaryText: 'Jan 2026' },
  { value: 'dec-2025', label: 'Audit Committee / December 2025',    secondaryText: 'Dec 2025' },
]

/* Meeting participants — presenter picker's suggestion list. Value = the
   name itself (no separate ids in this prototype's data model), so a
   selected participant and a manually-typed presenter are both just a name. */
const MEETING_PARTICIPANTS: AutocompleteOption[] = [
  { value: 'Alexander Anderson', label: 'Alexander Anderson', avatar: { src: 'https://i.pravatar.cc/40?img=12' } },
  { value: 'Olivia Thompson',    label: 'Olivia Thompson',    avatar: { src: 'https://i.pravatar.cc/40?img=47' } },
  { value: 'Sophia Anson',       label: 'Sophia Anson',       avatar: { src: 'https://i.pravatar.cc/40?img=32' } },
  { value: 'Bella Martinez',     label: 'Bella Martinez',     avatar: { src: 'https://i.pravatar.cc/40?img=45' } },
  { value: 'Christopher Lee',    label: 'Christopher Lee',    avatar: { src: 'https://i.pravatar.cc/40?img=51' } },
]

interface Presenter {
  name:   string
  avatar: string
}

/* Purpose options are scoped per group/subcommittee (IBP purpose ticket) — this
   meeting's group uses the default starter list shown to a group configuring
   purpose for the first time: Decision, Discussion, Information, Approval. A
   different group could maintain a different set (e.g. "For voting/discussion"). */
const PURPOSE_OPTIONS: PurposeOption[] = [
  { value: 'decision',    label: 'Decision',    color: 'var(--tag-orange)' },
  { value: 'discussion',  label: 'Discussion',  color: 'var(--tag-kepeel)' },
  { value: 'information', label: 'Information', color: 'var(--tag-blue)' },
  { value: 'approval',    label: 'Approval',    color: 'var(--tag-beetroot)' },
]

/* Meeting members for the visibility settings modal. Secretaries/Admins can never
   have visibility removed (see VisibilityModal). */
const MEETING_USERS: VisibilityUser[] = [
  { id: 'brian',   name: 'Brian Rubinstein' },
  { id: 'cheryl',  name: 'Cheryl Jameson' },
  { id: 'colind',  name: 'Colin Darrans' },
  { id: 'colint',  name: 'Colin Thompson' },
  { id: 'jessica', name: 'Jessica Thompson' },
  { id: 'michael', name: 'Michael Donaldson', role: 'admin' },
  { id: 'sophiaw', name: 'Sophia Williams' },
  { id: 'steven',  name: 'Steven Harris' },
  { id: 'sylvia',  name: 'Sylvia Grant' },
  { id: 'taylor',  name: 'Taylor Benson' },
]

/** Effective visibility restrictions for an item = its own explicit set plus every
    ancestor's explicit set (implicit inheritance). Derived from the live tree, so
    it stays correct across nest / unnest / reorder / add. */
function effectiveRestrictions(items: AgendaItem[], item: AgendaItem): Set<string> {
  const set = new Set<string>(item.restrictions ?? [])
  for (const other of items) {
    if (other.path.length < item.path.length && other.path.every((v, i) => v === item.path[i])) {
      (other.restrictions ?? []).forEach(u => set.add(u))
    }
  }
  return set
}

/* Hierarchical position, e.g. [1] = "1.", [2] = "2.", [1, 1] = "1.1",
   [1, 1, 1] = "1.1.1". Length = nesting level — this (not list position)
   is what the footer's Make/Unnest sub-item actions key off of. */
export interface AgendaItem {
  id:          string
  path:        number[]
  title:       string
  /** Duration in whole minutes. Start/end times are NOT stored — they are
      derived from the meeting start + the flat document-wide sequence
      (IBP-20668), so a duration change cascades automatically. */
  durationMin: number
  /** Selected purpose option value (see PURPOSE_OPTIONS) */
  purpose?:    string
  /** Explicit visibility restrictions — user ids removed from this item's view.
      Effective restrictions also include those inherited from ancestors. */
  restrictions?: string[]
  presenters?: Presenter[]
  description?: string
  motions?:    string[]
  attachments?: Attachment[]
  /** Document requests linked to this item (IBP-20675). */
  docRequests?: DocRequest[]
}

/** Display label: top-level items keep the trailing dot ("1.", "2.");
    nested items read as a dotted path with no trailing dot ("1.1", "1.1.1"). */
function formatItemNumber(path: number[]): string {
  return path.length === 1 ? `${path[0]}.` : path.join('.')
}

/** Max nesting depth (IBP-20668): "Add sub-item" is hidden at 6 levels deep. */
const MAX_DEPTH = 6

/** Depth = path length. Returns the index just past an item's whole subtree
    (the next item at the same or shallower depth) — where a new sibling or the
    item's own new child should be inserted, jumping past existing sub-items. */
function subtreeEnd(items: AgendaItem[], idx: number): number {
  const depth = items[idx].path.length
  let end = idx + 1
  while (end < items.length && items[end].path.length > depth) end++
  return end
}

/** True when the item at `idx` has a sibling directly above it at the same level
    (a valid parent for "Convert to sub-item"). False when it's the first item at
    its level — the nearest shallower/absent item is its parent, not a sibling. */
function hasPrecedingSibling(items: AgendaItem[], idx: number): boolean {
  const depth = items[idx].path.length
  for (let i = idx - 1; i >= 0; i--) {
    const d = items[i].path.length
    if (d < depth) return false // hit the parent → item is the first child
    if (d === depth) return true // a same-level sibling sits above
  }
  return false // no item above → first item overall
}

/** Re-number every item's path from its depth + document order so hierarchical
    labels stay correct after an insert or nest ("1", "1.1", "2", ...). */
function normalizePaths(items: AgendaItem[]): AgendaItem[] {
  const counters: number[] = []
  return items.map(it => {
    const depth = it.path.length - 1
    counters.length = depth + 1
    counters[depth] = (counters[depth] ?? 0) + 1
    return { ...it, path: counters.slice(0, depth + 1) }
  })
}

/* ── Meeting-level timing (IBP-20668) ───────────────────────────────────────
   The first agenda item inherits the meeting's start time (IBP-1533) and it is
   not directly editable. MEETING_DURATION_MIN is the meeting's own scheduled
   length, used only to detect overtime. */
const MEETING_START = '11:00'
const MEETING_DURATION_MIN = 270 // 4h 30min

/** "11:00" → minutes since midnight */
function parseClock(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** Minutes since midnight → "11:05" (24h clock, wraps past midnight) */
function formatClock(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = ((mins % 60) + 60) % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Flat document-wide schedule: item 0 starts at the meeting start; each later
    item starts at the previous item's end — nesting is NOT a factor (IBP-20668).
    A zero-duration item advances the cursor by 0, so the next item starts at the
    same time. Returns { start, end } minutes aligned to the input order. */
function computeSchedule(items: AgendaItem[], startMin: number): { start: number; end: number }[] {
  let cursor = startMin
  return items.map(it => {
    const start = cursor
    const end = start + it.durationMin
    cursor = end
    return { start, end }
  })
}

/** Whole minutes → "{x}h {y}min", hiding a zero hours part or zero minutes part
    (IBP-20668). Returns '' when the total is zero (both parts hidden). */
function formatHoursMinutes(totalMin: number): string {
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return [h > 0 ? `${h}h` : '', m > 0 ? `${m}min` : ''].filter(Boolean).join(' ')
}

/** First letters of the first and last name — Avatar's "letters" fallback for a
    manually-typed presenter who isn't a meeting participant (no photo on file). */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase() || '?'
}

const PREVIEW_ITEMS: AgendaItem[] = [
  {
    id:          '1',
    path:        [1],
    title:       'Call to Order',
    durationMin: 5,
  },
  {
    id:          '2',
    path:        [2],
    title:       'Approval of previous meeting minutes',
    durationMin: 5,
    purpose:     'approval',
    presenters:  [{ name: 'Alexander Anderson', avatar: 'https://i.pravatar.cc/40?img=12' }],
    description: 'The minutes from the Board meeting held on January 20, 2026 were distributed to members on January 27, 2026. No amendments have been submitted to the Company Secretary prior to this meeting. Members will be invited to raise any final corrections before approval.',
    motions: [
      'That the minutes of the meeting held on 20 January 2026 be approved.',
      'That the minutes of the Board of Directors meeting held on 20 January 2026, having been previously circulated to all members and with no further amendments submitted, be approved and adopted as a true and accurate record of the proceedings.',
    ],
    attachments: [
      { id: 'p-att-1', name: 'Board of Directors January 20, 2026.pdf', format: 'pdf',  status: 'ready' },
      { id: 'p-att-2', name: 'Results 2026', format: 'link', status: 'ready', url: 'https://example.com/results-2026' },
    ],
  },
]

/* Duplicating an agenda only carries over the structure (titles + timing) —
   presenter/description/motions/attachments are meeting-specific and start blank. */
const DUPLICATED_BUILDER_ITEMS: AgendaItem[] = [
  { id: '1', path: [1], title: 'Call to Order',                       durationMin: 5 },
  { id: '2', path: [2], title: 'Approval of previous meeting minutes', durationMin: 5 },
]

/* Starting from scratch seeds two top-level items — both at nesting level 1,
   so their footer should show only Add sub-item / Add item (no Make/Unnest
   sub-item — see nestingLevel()). */
const BLANK_BUILDER_ITEMS: AgendaItem[] = [
  { id: '1', path: [1], title: 'Call to Order',                       durationMin: 1 },
  {
    id: '2', path: [2], title: 'Approval of previous meeting minutes', durationMin: 5,
    /* Seeded so the attachments ready / reorder / menu states are visible
       without a manual upload first. */
    attachments: [
      { id: 'att-1', name: 'Board of Directors January 20, 2026.pdf', format: 'pdf',  status: 'ready' },
      { id: 'att-2', name: 'Results 2026', format: 'link', status: 'ready', url: 'https://example.com/results-2026' },
    ],
  },
]

function AgendaBuilder({ initialItems, onOpenInBoardBook, onViewBoardBook }: {
  initialItems: AgendaItem[]
  onOpenInBoardBook: (name: string) => void
  onViewBoardBook: () => void
}) {
  const [items, setItems] = useState(initialItems)
  const [activeId, setActiveId] = useState(initialItems[0]?.id)
  /* ≤1023px the outline and detail no longer sit side-by-side — a segmented
     control switches between the item detail ("Agenda") and the outline list
     ("Table of content"). Ignored ≥1024px, where both panels are always shown. */
  const [mobileView, setMobileView] = useState<'agenda' | 'toc'>('agenda')
  /* Below 640px the builder is view-only (Figma 17506 phone spec): view switching,
     navigation and scrolling stay, but editing and any data-mutating action are
     off. The detail panel is made `inert`; add / reorder / footer actions hide. */
  const readOnly = useMediaQuery('(max-width: 639px)')
  const detailRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (detailRef.current) detailRef.current.inert = readOnly
  }, [readOnly, mobileView])
  /* Id of an item that should grab focus + scroll to top once rendered — set on
     mount (first item) and whenever a new item is created. */
  const [pendingFocusId, setPendingFocusId] = useState<string | undefined>(initialItems[0]?.id)
  const activeTitleRef = useRef<HTMLInputElement>(null)
  const activeCardRef  = useRef<HTMLDivElement>(null)
  /* Monotonic counter for new-item ids (avoids duplicate keys under StrictMode) */
  const nextIdRef = useRef(1)

  /* The group's purpose options (editable via the "Edit purpose" modal). In a real
     app these would be persisted per group; here they live in builder state. */
  const [purposeOptions, setPurposeOptions] = useState<PurposeOption[]>(PURPOSE_OPTIONS)
  const [editPurposeOpen, setEditPurposeOpen] = useState(false)

  /* Visibility settings modal — opened from an item's "Visible to all" chip. */
  const [visibilityItemId, setVisibilityItemId] = useState<string | null>(null)

  /* Agenda preview (IBP-20681): a read-only, generic-board-member view of the
     current (unpublished) agenda. Toggling it never mutates `items`, so the draft
     is preserved on enter and exit. */
  const [previewOpen, setPreviewOpen] = useState(false)

  /* A newly created (or the first) item auto-focuses its title and scrolls to the
     top of the viewport — only when it's the active item, so plain selection of
     an existing card never steals focus or scrolls (IBP-20668). */
  useEffect(() => {
    if (!pendingFocusId || pendingFocusId !== activeId) return
    activeCardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    activeTitleRef.current?.focus()
    setPendingFocusId(undefined)
  }, [pendingFocusId, activeId])

  /* ── Derived timing (IBP-20668) ─────────────────────────────────────────── */
  /* Flat document-wide schedule, total duration, and overtime — all derived
     from item durations, so they recompute on every duration/add/remove. */
  const schedule    = computeSchedule(items, parseClock(MEETING_START))
  const totalMin    = items.reduce((sum, it) => sum + it.durationMin, 0)
  const overtimeMin = Math.max(0, totalMin - MEETING_DURATION_MIN)

  function updateItem(id: string, patch: Partial<AgendaItem>) {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } : it)))
  }

  /* ── Attachments (Figma 11710-105059) ───────────────────────────────────────
     Toast + modals live here (not per-field) so the error toast and the async
     upload lifecycle survive switching between items. */
  const toastRef = useRef<ToastContainerHandle>(null)
  const [copyForItemId, setCopyForItemId] = useState<string | null>(null)
  const [linkForItemId, setLinkForItemId] = useState<string | null>(null)
  /* Link being edited via the link modal (null = add mode / modal closed). */
  const [editLinkTarget, setEditLinkTarget] = useState<{ itemId: string; linkId: string } | null>(null)
  const nextAttIdRef = useRef(1)
  const newAttId = () => `att-new-${nextAttIdRef.current++}`

  /* Merge attachments into a specific item by id (safe under async timers —
     always reads the latest item, never a stale array). */
  function patchAttachments(itemId: string, fn: (prev: Attachment[]) => Attachment[]) {
    setItems(prev => prev.map(it => (it.id === itemId ? { ...it, attachments: fn(it.attachments ?? []) } : it)))
  }

  /* Simulate upload + background PDF conversion for one attachment: it starts in
     the Uploading state and, after a delay, either flips to ready or (on failure)
     is removed with an error toast so the user can retry. Failure is triggered
     deterministically by a file name containing "fail" (a demo affordance). */
  const UPLOAD_MS = 1600
  function simulateUpload(itemId: string, att: Attachment) {
    const willFail = /fail/i.test(att.name)
    window.setTimeout(() => {
      if (willFail) {
        patchAttachments(itemId, prev => prev.filter(a => a.id !== att.id))
        toastRef.current?.add({ state: 'error', message: 'Something went wrong' })
      } else {
        patchAttachments(itemId, prev => prev.map(a => (a.id === att.id ? { ...a, status: 'ready' } : a)))
      }
    }, UPLOAD_MS)
  }

  /* Add uploaded files — appended immediately as the last items in Uploading. */
  function addFiles(itemId: string, files: File[]) {
    const newAtts: Attachment[] = files.map(f => ({
      id: newAttId(), name: f.name, format: formatFromFileName(f.name), status: 'uploading',
    }))
    patchAttachments(itemId, prev => [...prev, ...newAtts])
    newAtts.forEach(a => simulateUpload(itemId, a))
  }

  /* Drag & drop files onto the whole active agenda-item card (Figma 11998-186047):
     dragging files over the card washes it green and shows a centered drop
     prompt; dropping anywhere on the card attaches the files. */
  const [cardDropActive, setCardDropActive] = useState(false)
  const cardDropDepth = useRef(0)
  const dragHasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes('Files')

  const onCardDragEnter = (e: React.DragEvent) => {
    if (!dragHasFiles(e)) return
    e.preventDefault()
    cardDropDepth.current += 1
    setCardDropActive(true)
  }
  const onCardDragOver = (e: React.DragEvent) => {
    if (!dragHasFiles(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }
  const onCardDragLeave = (e: React.DragEvent) => {
    if (!dragHasFiles(e)) return
    cardDropDepth.current -= 1
    if (cardDropDepth.current <= 0) { cardDropDepth.current = 0; setCardDropActive(false) }
  }
  const onCardDrop = (itemId: string) => (e: React.DragEvent) => {
    if (!dragHasFiles(e)) return
    e.preventDefault()
    cardDropDepth.current = 0
    setCardDropActive(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) addFiles(itemId, files)
  }

  /* Copy from the Document Library — same lifecycle (shown Uploading while it
     copies/converts). */
  function addLibraryDocs(itemId: string, docs: Pick<Attachment, 'name' | 'format'>[]) {
    const newAtts: Attachment[] = docs.map(d => ({
      id: newAttId(), name: d.name, format: d.format, status: 'uploading',
    }))
    patchAttachments(itemId, prev => [...prev, ...newAtts])
    newAtts.forEach(a => simulateUpload(itemId, a))
    setCopyForItemId(null)
  }

  /* Add a link — no upload/conversion, straight to ready. */
  function addLink(itemId: string, link: { name: string; url: string }) {
    patchAttachments(itemId, prev => [...prev, {
      id: newAttId(), name: link.name, format: 'link', status: 'ready', url: link.url,
    }])
    setLinkForItemId(null)
  }

  /* Edit a link in place — its position in the shared list is preserved. */
  function updateLink(itemId: string, linkId: string, link: { name: string; url: string }) {
    patchAttachments(itemId, prev => prev.map(a =>
      a.id === linkId ? { ...a, name: link.name, url: link.url } : a))
    setEditLinkTarget(null)
  }

  function copyAttachmentToDocuments(att: Attachment) {
    /* Reuses the existing "Copy to Documents" behaviour — the copy is added to
       Documents; the agenda attachment is unaffected. */
    toastRef.current?.add({ state: 'success', message: `“${att.name}” copied to Documents` })
  }

  function downloadAttachment(att: Attachment) {
    /* Reuses the existing download behaviour (no real file in the prototype). */
    toastRef.current?.add({ state: 'info', message: `Downloading “${att.name}”` })
  }

  /* ── Document requests (IBP-20675) ───────────────────────────────────────
     A request lives as its own row until Completed. Files uploaded against it
     always go to Pending validation (regardless of publish state); on approval
     they become regular attachments and the request row is removed. Reopening
     keeps previously approved files (they are already regular attachments). */
  const [requestForItemId, setRequestForItemId] = useState<string | null>(null)
  const [activeRequestId, setActiveRequestId]   = useState<string | null>(null)
  const nextReqIdRef = useRef(1)
  const newReqId = () => `req-${nextReqIdRef.current++}`

  function patchDocRequests(itemId: string, fn: (prev: DocRequest[]) => DocRequest[]) {
    setItems(prev => prev.map(it => (it.id === itemId ? { ...it, docRequests: fn(it.docRequests ?? []) } : it)))
  }

  const openCreateRequest = (itemId: string) => { setActiveRequestId(null); setRequestForItemId(itemId) }
  const openRequest       = (itemId: string, reqId: string) => { setActiveRequestId(reqId); setRequestForItemId(itemId) }
  const closeRequestDrawer = () => { setRequestForItemId(null); setActiveRequestId(null) }

  function sendRequest(itemId: string, data: DocRequestData) {
    if (activeRequestId) {
      let wasInProgress = false
      patchDocRequests(itemId, prev => prev.map(r => {
        if (r.id !== activeRequestId) return r
        wasInProgress = r.status === 'in-progress'
        return { ...r, ...data }
      }))
      // Editing an In Progress request notifies the assignee (IBP standard).
      if (wasInProgress) toastRef.current?.add({ state: 'info', message: 'Request updated — assignee notified' })
    } else {
      const req: DocRequest = { id: newReqId(), ...data, status: 'in-progress', submittedFiles: [] }
      patchDocRequests(itemId, prev => [...prev, req])
      toastRef.current?.add({ state: 'success', message: 'Document request sent' })
    }
    closeRequestDrawer()
  }

  /* Assignee (or secretary) uploads a file → always Pending validation. */
  function uploadToRequest(itemId: string, reqId: string, fileName: string) {
    patchDocRequests(itemId, prev => prev.map(r => (r.id === reqId
      ? { ...r, status: 'pending-validation', submittedFiles: [...r.submittedFiles, submittedAttachment(newAttId(), fileName)] }
      : r)))
  }

  function removeSubmitted(itemId: string, reqId: string, fileId: string) {
    patchDocRequests(itemId, prev => prev.map(r => (r.id === reqId
      ? { ...r, submittedFiles: r.submittedFiles.filter(f => f.id !== fileId) }
      : r)))
  }

  /* Approve → files become regular attachments; the request row is removed. */
  function approveRequest(itemId: string, reqId: string) {
    setItems(prev => prev.map(it => {
      if (it.id !== itemId) return it
      const reqs = it.docRequests ?? []
      const req  = reqs.find(r => r.id === reqId)
      if (!req) return it
      const approved = req.submittedFiles.map(f => ({ ...f, status: 'ready' as const }))
      return {
        ...it,
        attachments: [...(it.attachments ?? []), ...approved],
        docRequests: reqs.filter(r => r.id !== reqId),
      }
    }))
    toastRef.current?.add({ state: 'success', message: 'Document request completed' })
    closeRequestDrawer()
  }

  /* Reopen → back to In Progress. Previously approved files stay as regular
     attachments (they are not touched here). */
  function reopenRequest(itemId: string, reqId: string) {
    patchDocRequests(itemId, prev => prev.map(r => (r.id === reqId ? { ...r, status: 'in-progress' } : r)))
  }

  /* Delete → removes the request and any not-yet-approved submitted files. */
  function deleteRequest(itemId: string, reqId: string) {
    patchDocRequests(itemId, prev => prev.filter(r => r.id !== reqId))
    closeRequestDrawer()
  }

  /* Insert a new item relative to an anchor, then focus + scroll to it.
     `deeper` = false → new top-level sibling after the anchor's whole subtree;
     `deeper` = true  → new last child, one level down. Duration is inherited
     from the anchor (IBP-19546). `anchorId` omitted = append at the very end
     (sidebar "Add agenda item"). */
  function insertItem(anchorId: string | undefined, deeper: boolean) {
    const id = `new-${nextIdRef.current++}`
    setItems(prev => {
      // Sidebar "Add agenda item" (no anchor): always a top-level item at the end,
      // inheriting duration from the last item.
      if (!anchorId) {
        const last = prev[prev.length - 1]
        const newItem: AgendaItem = { id, path: [1], title: '', durationMin: last?.durationMin ?? 0 }
        return normalizePaths([...prev, newItem])
      }
      const idx    = prev.findIndex(it => it.id === anchorId)
      if (idx === -1) return prev
      const anchor = prev[idx]
      const depth  = anchor.path.length + (deeper ? 1 : 0)
      const at     = subtreeEnd(prev, idx)
      const newItem: AgendaItem = {
        id,
        path:        new Array(depth).fill(1), // placeholder — normalizePaths fixes numbering
        title:       '',
        durationMin: anchor.durationMin,
      }
      return normalizePaths([...prev.slice(0, at), newItem, ...prev.slice(at)])
    })
    setActiveId(id)
    setPendingFocusId(id)
  }

  const addItem    = (anchorId?: string) => insertItem(anchorId, false)
  const addSubItem = (parentId: string)  => insertItem(parentId, true)

  /* "Convert to sub-item" — nest the item AND its whole subtree one level deeper,
     making it the last child of the item directly above it at the same level. Any
     descendant that would exceed the max depth is flattened at level 6. Order +
     times recalculate via normalizePaths / derived schedule (IBP conversion ticket). */
  function convertToSub(id: string) {
    setItems(prev => {
      const idx = prev.findIndex(it => it.id === id)
      if (idx === -1) return prev
      if (prev[idx].path.length >= MAX_DEPTH || !hasPrecedingSibling(prev, idx)) return prev
      const end = subtreeEnd(prev, idx)
      const next = prev.map((it, i) =>
        i >= idx && i < end
          ? { ...it, path: new Array(Math.min(it.path.length + 1, MAX_DEPTH)).fill(1) }
          : it,
      )
      return normalizePaths(next)
    })
  }

  /* "Convert to item" — pull the item AND its whole subtree one level shallower,
     making it a sibling of its former parent. */
  function convertToItem(id: string) {
    setItems(prev => {
      const idx = prev.findIndex(it => it.id === id)
      if (idx === -1 || prev[idx].path.length <= 1) return prev
      const end = subtreeEnd(prev, idx)
      const next = prev.map((it, i) =>
        i >= idx && i < end
          ? { ...it, path: new Array(it.path.length - 1).fill(1) }
          : it,
      )
      return normalizePaths(next)
    })
  }

  /* ── Sidebar drag & drop (IBP tree reorder) ──────────────────────────────
     Drag an item's handle to move it — and its whole subtree — to a new
     position/level. Reuses the hierarchy model (path[]), subtreeEnd, the
     depth-6 flatten from Convert-to-sub-item, and normalizePaths + derived
     schedule for renumbering/timing. Native HTML5 DnD, same pattern as the
     attachments list. */
  const [sbDrag, setSbDrag] = useState<{ from: number; end: number } | null>(null)
  const [sbDropAt, setSbDropAt] = useState<number | null>(null)
  const sbDragRef = useRef<{ from: number; end: number } | null>(null)
  /* Mirror the drop index in a ref so the drop handler never reads a stale
     state value between the last dragover and the drop. */
  const sbDropRef = useRef<number | null>(null)
  const outlineScrollRef = useRef<HTMLDivElement>(null)
  const autoScrollRaf = useRef<number | null>(null)
  const autoScrollDir = useRef(0)

  const stopAutoScroll = () => {
    if (autoScrollRaf.current != null) { cancelAnimationFrame(autoScrollRaf.current); autoScrollRaf.current = null }
    autoScrollDir.current = 0
  }
  const runAutoScroll = () => {
    const el = outlineScrollRef.current
    if (el && autoScrollDir.current !== 0) {
      const max = el.scrollHeight - el.clientHeight
      el.scrollTop = Math.max(0, Math.min(max, el.scrollTop + autoScrollDir.current * 10))
    }
    autoScrollRaf.current = requestAnimationFrame(runAutoScroll)
  }

  const startSbDrag = (i: number) => (e: React.DragEvent) => {
    const d = { from: i, end: subtreeEnd(items, i) }
    sbDragRef.current = d
    setSbDrag(d)
    e.dataTransfer.effectAllowed = 'move'
    /* Drag image = the grabbed row, not just the handle icon. */
    const row = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-outline-row]')
    if (row) e.dataTransfer.setDragImage(row, 12, 12)
  }

  const onSbRowDragOver = (i: number) => (e: React.DragEvent) => {
    if (!sbDragRef.current) return
    e.preventDefault()
    const rect  = e.currentTarget.getBoundingClientRect()
    const after = e.clientY > rect.top + rect.height / 2
    const at = after ? i + 1 : i
    sbDropRef.current = at
    setSbDropAt(at)
  }

  const onOutlineDragOver = (e: React.DragEvent) => {
    if (!sbDragRef.current) return
    e.preventDefault()
    const el = outlineScrollRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const zone = 48
    autoScrollDir.current = e.clientY < rect.top + zone ? -1 : e.clientY > rect.bottom - zone ? 1 : 0
    if (autoScrollDir.current !== 0 && autoScrollRaf.current == null) runAutoScroll()
    else if (autoScrollDir.current === 0) stopAutoScroll()
  }

  const clearSbDrag = () => { sbDragRef.current = null; sbDropRef.current = null; setSbDrag(null); setSbDropAt(null); stopAutoScroll() }

  /* Drop: move the [from,end) subtree to the insertion point, re-levelling its
     root to the drop neighbour's depth (subtree shifts with it, flattened at
     depth 6). Invalid drop (outside the list → no onDrop) leaves state intact. */
  const finishSbDrag = () => {
    const drag = sbDragRef.current
    const to   = sbDropRef.current
    if (drag && to != null && !(to >= drag.from && to <= drag.end)) {
      setItems(prev => {
        const { from, end } = drag
        const subtree  = prev.slice(from, end)
        const rest     = [...prev.slice(0, from), ...prev.slice(end)]
        const insertAt = to > from ? to - (end - from) : to
        const below    = rest[insertAt]
        const targetDepth = below ? below.path.length : 1
        const delta = targetDepth - subtree[0].path.length
        const moved = subtree.map(it => {
          const nd = Math.min(MAX_DEPTH, Math.max(1, it.path.length + delta))
          return { ...it, path: new Array(nd).fill(1) }
        })
        return normalizePaths([...rest.slice(0, insertAt), ...moved, ...rest.slice(insertAt)])
      })
    }
    clearSbDrag()
  }

  /* Delete an item and its whole subtree (works at any nesting level); numbering
     recalculates and the active selection moves to a nearby remaining item. */
  function deleteItem(id: string) {
    const idx = items.findIndex(it => it.id === id)
    if (idx === -1) return
    const remaining = normalizePaths([...items.slice(0, idx), ...items.slice(subtreeEnd(items, idx))])
    setItems(remaining)
    if (!remaining.some(it => it.id === activeId)) {
      setActiveId(remaining[Math.min(idx, remaining.length - 1)]?.id)
    }
  }

  /* Duplicate a single item (its own content + config), inserted as the next
     sibling after the original's subtree at the same depth. Original is untouched. */
  function duplicateItem(id: string) {
    const idx = items.findIndex(it => it.id === id)
    if (idx === -1) return
    const orig  = items[idx]
    const newId = `new-${nextIdRef.current++}`
    const copy: AgendaItem = {
      ...orig,
      id:           newId,
      path:         [...orig.path], // same depth; normalizePaths renumbers
      presenters:   orig.presenters?.map(p => ({ ...p })),
      motions:      orig.motions ? [...orig.motions] : undefined,
      restrictions: orig.restrictions ? [...orig.restrictions] : undefined,
      attachments:  orig.attachments?.map(a => ({ ...a })),
    }
    const at = subtreeEnd(items, idx)
    setItems(normalizePaths([...items.slice(0, at), copy, ...items.slice(at)]))
    setActiveId(newId)
  }

  /* Preview mode reuses the read-only board-member renderer (AgendaPreview) on the
     live `items`, so the secretary sees exactly what a generic board member would:
     no per-user visibility exceptions, only Board-Book-accepted docs (ready
     attachments), and no draft/in-progress/pending document requests. */
  if (previewOpen) {
    return (
      <AgendaPreview
        items={items}
        purposeOptions={purposeOptions}
        maskRestricted
        attachmentHandlers={{
          onChange:          (itemId, next) => updateItem(itemId, { attachments: next }),
          onOpen:            att => onOpenInBoardBook(att.name),
          onDownload:        downloadAttachment,
          onCopyToDocuments: copyAttachmentToDocuments,
        }}
        header={
          <Banner
            state="info-primary"
            variant="inline"
            size="m"
            message="You’re viewing the agenda as [User name] would see it."
          />
        }
        footer={
          <StickyFooter
            left={
              <>
                <Button variant="primary" size="m" onClick={() => setPreviewOpen(false)}>Back to edit mode</Button>
                <Button variant="secondary" intent="neutral" size="m" onClick={() => console.log('download')}>Download</Button>
              </>
            }
          />
        }
      />
    )
  }

  return (
    <div className={styles.preview}>
      {/* ≤1023px only — switch between the item detail and the outline list. */}
      <div className={styles.agendaSeg}>
        <SegmentControl
          items={[{ id: 'agenda', label: 'Agenda' }, { id: 'toc', label: 'Table of content' }]}
          value={mobileView}
          onChange={id => setMobileView(id as 'agenda' | 'toc')}
        />
      </div>
      <div className={[styles.previewBody, mobileView === 'toc' ? styles.showToc : styles.showAgenda].filter(Boolean).join(' ')}>
        <div
          className={styles.previewOutline}
          ref={outlineScrollRef}
          onDragOver={onOutlineDragOver}
          onDrop={finishSbDrag}
          onDragLeave={stopAutoScroll}
        >
          <div className={styles.previewDurationRow}>
            <span className={styles.previewDuration}>Duration {formatHoursMinutes(totalMin) || '0min'}</span>
            {overtimeMin > 0 && (
              <BadgeStatus type="warning" label={`${formatHoursMinutes(overtimeMin)} over`} />
            )}
          </div>
          <div className={[styles.outlineItems, sbDrag ? styles.outlineItemsDragging : ''].filter(Boolean).join(' ')}>
            {items.map((item, i) => {
              /* The dragged item and its whole subtree read as one disabled group. */
              const inDrag     = sbDrag != null && i >= sbDrag.from && i < sbDrag.end
              const groupStart = sbDrag != null && i === sbDrag.from
              const groupEnd   = sbDrag != null && i === sbDrag.end - 1
              const dropDepth  = items[sbDropAt ?? -1]?.path.length ?? 1
              return (
                <Fragment key={item.id}>
                  {sbDropAt === i && (
                    <div
                      className={styles.outlineDropLine}
                      style={{ marginLeft: `calc(var(--space-8) + ${dropDepth - 1} * var(--space-12))` }}
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    data-outline-row
                    className={[
                      styles.outlineRow,
                      activeId === item.id ? styles.outlineRowActive : '',
                      inDrag ? styles.outlineRowDragging : '',
                      inDrag ? styles.outlineRowGrouped : '',
                      groupStart ? styles.outlineRowGroupStart : '',
                      groupEnd ? styles.outlineRowGroupEnd : '',
                    ].filter(Boolean).join(' ')}
                    /* Each nesting level indents the row by 12px (Figma note). */
                    style={{ paddingLeft: `calc(var(--space-8) + ${item.path.length - 1} * var(--space-12))` }}
                    onClick={() => { setActiveId(item.id); setMobileView('agenda') }}
                    onDragOver={onSbRowDragOver(i)}
                  >
                    {!readOnly && (
                      <span
                        className={styles.dragHandle}
                        draggable
                        onDragStart={startSbDrag(i)}
                        onDragEnd={clearSbDrag}
                        aria-label={`Reorder ${item.title || 'agenda item'}`}
                        dangerouslySetInnerHTML={{ __html: dragSvg }}
                      />
                    )}
                    <span className={styles.outlineLabel}>{formatItemNumber(item.path)} {item.title || 'Untitled agenda item'}</span>
                  </button>
                </Fragment>
              )
            })}
            {sbDropAt === items.length && (
              <div className={styles.outlineDropLine} style={{ marginLeft: 'var(--space-8)' }} aria-hidden="true" />
            )}
            {!readOnly && (
              <Button
                variant="link"
                size="m"
                iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: plusSvg }} />}
                onClick={() => addItem()}
                className={styles.addItemLink}
              >
                Add agenda item
              </Button>
            )}
          </div>
        </div>

        <div className={styles.previewDetail} ref={detailRef}>
          {items.map((item, index) => {
            const isActive = activeId === item.id
            const sched    = schedule[index]
            const timeText = item.durationMin === 0
              ? 'No duration'
              : `${formatClock(sched.start)} - ${formatClock(sched.end)}`
            const depth         = item.path.length
            const canAddSub     = depth < MAX_DEPTH
            /* Convert to sub-item: needs a same-level sibling above and room to go
               deeper (hidden for the first item at its level, and at max depth). */
            const canConvertSub = hasPrecedingSibling(items, index) && depth < MAX_DEPTH
            /* Convert to item: only for nested items (hidden at top level). */
            const canConvertItem = depth > 1
            /* Effective visibility restrictions (own + inherited) — drives the chip label. */
            const restricted = effectiveRestrictions(items, item)

            /* Inactive items render as a read-only, click-to-expand card that still
               shows every saved value (Figma 12034-141449). An item with no data
               naturally collapses to just its title + meta. */
            if (!isActive) {
              const purposeOpt   = purposeOptions.find(o => o.value === item.purpose)
              const presenters   = item.presenters ?? []
              const motions      = (item.motions ?? []).filter(m => m.trim() !== '')
              const hasDesc      = Boolean(item.description && item.description.replace(/<[^>]*>/g, '').trim() !== '')
              return (
                <div key={item.id} className={styles.detailItemGroup}>
                  <div
                    className={[styles.detailItem, styles.detailItemView].join(' ')}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveId(item.id)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveId(item.id) } }}
                  >
                    <div className={styles.detailTitleGroup}>
                      <div className={styles.viewHeaderRow}>
                        <span className={styles.detailNumber}>{formatItemNumber(item.path)}</span>
                        <span className={styles.collapsedTitle}>{item.title || 'Untitled agenda item'}</span>
                      </div>
                      <div className={styles.detailMeta}>
                        <span className={styles.detailTime}>{timeText}</span>
                        {item.durationMin > 0 && <span className={styles.detailDuration}>{item.durationMin} min</span>}
                        {purposeOpt && (
                          <span className={styles.purposeTag}>
                            <span className={styles.purposeTagIcon} style={{ color: purposeOpt.color }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: labelSvg }} />
                            {purposeOpt.label}
                          </span>
                        )}
                        <span className={styles.detailDuration}>
                          {restricted.size > 0
                            ? `Hidden from ${restricted.size} participant${restricted.size === 1 ? '' : 's'}`
                            : 'Visible to all'}
                        </span>
                      </div>
                    </div>

                    {presenters.length > 0 && (
                      <div className={styles.detailSection}>
                        <span className={styles.detailLabel}>Presenter</span>
                        {presenters.map(p => (
                          <div key={p.name} className={styles.presenterRow}>
                            <Avatar size="s" variant={p.avatar ? 'picture' : 'letters'} src={p.avatar || undefined} initials={initialsOf(p.name)} alt={p.name} />
                            <span className={styles.presenterName}>{p.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {hasDesc && (
                      <div className={styles.detailSection}>
                        <span className={styles.detailLabel}>Description</span>
                        <div className={styles.richText} dangerouslySetInnerHTML={{ __html: item.description! }} />
                      </div>
                    )}

                    {motions.length > 0 && (
                      <div className={styles.detailSection}>
                        <span className={styles.detailLabel}>Motions</span>
                        {motions.map((m, i) => <p key={i} className={styles.detailText}>{m}</p>)}
                      </div>
                    )}

                    {(item.attachments ?? []).some(a => a.status === 'ready') && (
                      <div className={[styles.detailSection, styles.detailSectionAttachments].join(' ')}>
                        <span className={styles.detailLabel}>Attachments</span>
                        <AttachmentsField
                          mode="view"
                          attachments={item.attachments ?? []}
                          onChange={attachments => updateItem(item.id, { attachments })}
                          onOpen={att => onOpenInBoardBook(att.name)}
                          onDownload={downloadAttachment}
                          onCopyToDocuments={copyAttachmentToDocuments}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <div key={item.id} className={styles.detailItemGroup}>
                <div
                  ref={activeCardRef}
                  className={[styles.detailItem, styles.detailItemActive, cardDropActive ? styles.detailItemDropActive : ''].filter(Boolean).join(' ')}
                  onDragEnter={onCardDragEnter}
                  onDragOver={onCardDragOver}
                  onDragLeave={onCardDragLeave}
                  onDrop={onCardDrop(item.id)}
                >
                  {cardDropActive && (
                    <div className={styles.dropOverlay} aria-hidden="true">
                      <div className={styles.dropOverlayCard}>
                        <span className={styles.dropOverlayIcon} dangerouslySetInnerHTML={{ __html: uploadSvg }} />
                        <span className={styles.dropOverlayText}>Drop your files to attach them to agenda item</span>
                      </div>
                    </div>
                  )}
                  <div className={styles.detailTitleGroup}>
                    <div className={styles.detailHeaderRow}>
                      <div className={styles.detailTitleRow}>
                        <span className={styles.detailNumber}>{formatItemNumber(item.path)}</span>
                        <TextField
                          ref={activeTitleRef}
                          variant="no-border"
                          size="l"
                          className={styles.titleField}
                          value={item.title}
                          placeholder="Untitled agenda item"
                          aria-label={`Agenda item ${formatItemNumber(item.path)} title`}
                          onChange={e => updateItem(item.id, { title: e.target.value })}
                        />
                      </div>
                      <span className={styles.detailMenuSlot}>
                        <ItemMenu
                          onDuplicate={() => duplicateItem(item.id)}
                          onDelete={() => deleteItem(item.id)}
                        />
                      </span>
                    </div>

                    <div className={styles.detailMeta}>
                      <span className={styles.detailTime}>{timeText}</span>
                      <DurationField
                        minutes={item.durationMin}
                        onChange={min => updateItem(item.id, { durationMin: min })}
                      />
                      <PurposeField
                        options={purposeOptions}
                        value={item.purpose}
                        onChange={purpose => updateItem(item.id, { purpose })}
                        onEditOptions={() => setEditPurposeOpen(true)}
                      />
                      <button type="button" className={styles.metaChip} onClick={() => setVisibilityItemId(item.id)}>
                        {restricted.size > 0
                          ? `Hidden from ${restricted.size} participant${restricted.size === 1 ? '' : 's'}`
                          : 'Visible to all'}
                        <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: editSvg }} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <span className={styles.detailLabel}>Presenter</span>
                    {(item.presenters ?? []).map(p => (
                      <div key={p.name} className={[styles.presenterRow, styles.presenterChipRow].join(' ')}>
                        <Avatar
                          size="s"
                          variant={p.avatar ? 'picture' : 'letters'}
                          src={p.avatar || undefined}
                          initials={initialsOf(p.name)}
                          alt={p.name}
                        />
                        <span className={styles.presenterName}>{p.name}</span>
                        <Tooltip label="Remove" position="top">
                          <Button
                            variant="tertiary"
                            intent="neutral"
                            size="m"
                            iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: removeSvg }} />}
                            className={styles.presenterRemoveBtn}
                            onClick={() => updateItem(item.id, {
                              presenters: (item.presenters ?? []).filter(x => x.name !== p.name),
                            })}
                            aria-label={`Remove ${p.name} as presenter`}
                          />
                        </Tooltip>
                      </div>
                    ))}
                    <Autocomplete
                      variant="no-border"
                      size="m"
                      multiple
                      options={MEETING_PARTICIPANTS}
                      value={(item.presenters ?? []).map(p => p.name)}
                      allowCustomValue
                      customValueLabel={v => <>Add “{v}” as presenter</>}
                      placeholder="Add presenter"
                      aria-label={`Agenda item ${formatItemNumber(item.path)} presenter`}
                      onChange={value => {
                        const names = value as string[]
                        const presenters = names.map(name => {
                          const participant = MEETING_PARTICIPANTS.find(p => p.value === name)
                          return { name, avatar: participant?.avatar?.src ?? '' }
                        })
                        updateItem(item.id, { presenters })
                      }}
                    />
                  </div>

                  <div className={styles.detailSection}>
                    <span className={styles.detailLabel}>Description</span>
                    <RichTextField
                      value={item.description ?? ''}
                      placeholder="Add description"
                      onChange={html => updateItem(item.id, { description: html })}
                    />
                  </div>

                  <div className={styles.detailSection}>
                    <span className={styles.detailLabel}>Motions</span>
                    <MotionsField
                      motions={item.motions ?? []}
                      onChange={motions => updateItem(item.id, { motions })}
                    />
                  </div>

                  <div className={[styles.detailSection, styles.detailSectionAttachments].join(' ')}>
                    <span className={styles.detailLabel}>Attachments</span>
                    <AttachmentsField
                      attachments={item.attachments ?? []}
                      onChange={attachments => updateItem(item.id, { attachments })}
                      onAddFiles={files => addFiles(item.id, files)}
                      onAddLink={() => setLinkForItemId(item.id)}
                      onEditLink={a => setEditLinkTarget({ itemId: item.id, linkId: a.id })}
                      onCopyFromDocuments={() => setCopyForItemId(item.id)}
                      onOpen={att => onOpenInBoardBook(att.name)}
                      onDownload={downloadAttachment}
                      onCopyToDocuments={copyAttachmentToDocuments}
                      docRequests={item.docRequests ?? []}
                      onRequestDocument={() => openCreateRequest(item.id)}
                      onOpenRequest={r => openRequest(item.id, r.id)}
                      onDeleteRequest={r => deleteRequest(item.id, r.id)}
                    />
                  </div>
                </div>

                <div className={styles.itemFooter}>
                  <div className={styles.itemFooterLeft}>
                    {canConvertSub && (
                      <Button
                        variant="tertiary"
                        intent="neutral"
                        size="s"
                        iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: convertToSubSvg }} />}
                        onClick={() => convertToSub(item.id)}
                      >
                        Convert to sub-item
                      </Button>
                    )}
                    {canConvertItem && (
                      <Button
                        variant="tertiary"
                        intent="neutral"
                        size="s"
                        iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: convertToItemSvg }} />}
                        onClick={() => convertToItem(item.id)}
                      >
                        Convert to item
                      </Button>
                    )}
                  </div>
                  <div className={styles.itemFooterRight}>
                    {canAddSub && (
                      <Button
                        variant="tertiary"
                        intent="neutral"
                        size="s"
                        iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: plusSvg }} />}
                        onClick={() => addSubItem(item.id)}
                      >
                        Add sub-item
                      </Button>
                    )}
                    <Button
                      variant="tertiary"
                      intent="neutral"
                      size="s"
                      iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: plusSvg }} />}
                      onClick={() => addItem(item.id)}
                    >
                      Add item
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* View-only (<640px): the footer holds publish / delete etc. — all
          data-mutating — so it is hidden entirely. */}
      {!readOnly && (
        <StickyFooter
          left={
            <>
              <Button variant="primary" size="m" onClick={() => console.log('publish')}>Publish agenda</Button>
              <Button variant="secondary" intent="neutral" size="m" onClick={onViewBoardBook}>View Boardbook</Button>
              <Button variant="secondary" intent="neutral" size="m" onClick={() => console.log('download')}>Download</Button>
              <Button variant="secondary" intent="neutral" size="m" onClick={() => setPreviewOpen(true)}>Preview</Button>
            </>
          }
          right={
            <Button variant="secondary" intent="danger" size="m" onClick={() => console.log('delete agenda')}>Delete</Button>
          }
        />
      )}

      <EditPurposeModal
        open={editPurposeOpen}
        options={purposeOptions}
        onSave={opts => { setPurposeOptions(opts); setEditPurposeOpen(false) }}
        onClose={() => setEditPurposeOpen(false)}
      />

      <VisibilityModal
        open={visibilityItemId !== null}
        items={items}
        users={MEETING_USERS}
        initialItemId={visibilityItemId ?? undefined}
        onApply={restrictionsByItem => setItems(prev => prev.map(it => ({
          ...it,
          restrictions: restrictionsByItem[it.id] ?? it.restrictions,
        })))}
        onClose={() => setVisibilityItemId(null)}
      />

      <CopyDocumentModal
        open={copyForItemId !== null}
        onClose={() => setCopyForItemId(null)}
        onAdd={docs => copyForItemId && addLibraryDocs(copyForItemId, docs)}
      />

      {(() => {
        const editing = editLinkTarget
          ? (items.find(i => i.id === editLinkTarget.itemId)?.attachments ?? [])
              .find(a => a.id === editLinkTarget.linkId)
          : null
        return (
          <AddLinkModal
            open={linkForItemId !== null || editLinkTarget !== null}
            link={editing ? { name: editing.name, url: editing.url ?? '' } : null}
            onClose={() => { setLinkForItemId(null); setEditLinkTarget(null) }}
            onSubmit={link => {
              if (editLinkTarget) updateLink(editLinkTarget.itemId, editLinkTarget.linkId, link)
              else if (linkForItemId) addLink(linkForItemId, link)
            }}
          />
        )
      })()}

      {requestForItemId && (() => {
        const it = items.find(i => i.id === requestForItemId)
        if (!it) return null
        const req = activeRequestId ? (it.docRequests ?? []).find(r => r.id === activeRequestId) ?? null : null
        const label = `${formatItemNumber(it.path)} ${it.title || 'Untitled agenda item'}`
        return (
          <DocumentRequestDrawer
            open
            request={req}
            defaultTitle={it.title || 'Untitled agenda item'}
            meetingName={MEETING_TITLE}
            itemLabel={label}
            assigneeOptions={MEETING_PARTICIPANTS}
            onSend={data => sendRequest(it.id, data)}
            onUploadFile={name => { if (activeRequestId) uploadToRequest(it.id, activeRequestId, name) }}
            onRemoveSubmitted={fileId => { if (activeRequestId) removeSubmitted(it.id, activeRequestId, fileId) }}
            onApprove={() => { if (activeRequestId) approveRequest(it.id, activeRequestId) }}
            onReopen={() => { if (activeRequestId) reopenRequest(it.id, activeRequestId) }}
            onDelete={() => { if (activeRequestId) deleteRequest(it.id, activeRequestId) }}
            onClose={closeRequestDrawer}
          />
        )
      })()}

      <ToastContainer ref={toastRef} />
    </div>
  )
}

/* Read-only board-member view of an agenda (IBP-20681). Reused both for the
   "duplicate from a past meeting" preview and for the live View mode in the builder
   (Figma 12025-114417). It renders only what a board member would see: only ready
   (Board-Book-accepted) attachments, and no document requests. Documents render via
   the design-system Document component (size M) — the same view-mode AttachmentsField
   used by the collapsed edit card: format icon, name and "…" menu (DS 26772-38948).

   When `maskRestricted` is set, it simulates viewing "as [User name]": every item
   the viewer isn't allowed to see (a non-empty effective visibility restriction)
   collapses to a dimmed "*Restricted*" placeholder that keeps its number and time
   slot — so the sequence is preserved but the content is hidden. `documentsAsRequests`
   switches the attachments to the duplicate-preview treatment: documents shown as
   request placeholders (doc-request icon, no menu), links omitted. `header` is the
   indicator banner above the body; `footer` is the sticky action bar below it. */
const RESTRICTED_LABEL = '*Restricted*'
const NOOP_ATTACHMENT_HANDLERS = {
  onChange:          () => {},
  onOpen:            () => {},
  onDownload:        () => {},
  onCopyToDocuments: () => {},
}
export function AgendaPreview({ items, header, footer, purposeOptions = PURPOSE_OPTIONS, maskRestricted = false, documentsAsRequests = false, documentsReadOnly = false, restrictedLabel = RESTRICTED_LABEL, attachmentHandlers }: {
  items: AgendaItem[]
  header: ReactNode
  footer?: ReactNode
  purposeOptions?: PurposeOption[]
  maskRestricted?: boolean
  documentsAsRequests?: boolean
  /** Board-member documents: no rename / reorder / copy / delete — only Download
      (attachments only, never links). Rows still open in the Board book. */
  documentsReadOnly?: boolean
  /** Label shown for a restricted item in the outline and card. Defaults to the
      builder's "*Restricted*"; the board-member view passes a plain "Restricted". */
  restrictedLabel?: string
  /** Wires the document rows' open / rename / download / copy / delete actions to
      the owning surface (the builder mutates its items). Unused in the
      `documentsAsRequests` preview, whose rows are static. Defaults to no-ops. */
  attachmentHandlers?: {
    onChange:          (itemId: string, next: Attachment[]) => void
    onOpen:            (a: Attachment) => void
    onDownload:        (a: Attachment) => void
    onCopyToDocuments: (a: Attachment) => void
  }
}) {
  const [activeItem, setActiveItem] = useState(items[0]?.id)
  const attHandlers = attachmentHandlers ?? NOOP_ATTACHMENT_HANDLERS
  /* Detail cards keyed by item id — clicking an outline row scrolls to its card. */
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const goToItem = (id: string) => {
    setActiveItem(id)
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* Same derived timing as the builder (IBP-20668), read-only here */
  const previewSchedule = computeSchedule(items, parseClock(MEETING_START))
  const previewTotalMin = items.reduce((sum, it) => sum + it.durationMin, 0)

  const isRestricted = (item: AgendaItem) =>
    maskRestricted && effectiveRestrictions(items, item).size > 0

  return (
    <div className={styles.preview}>
      {header}

      <div className={styles.previewBody}>
        <div className={styles.previewOutline}>
          <span className={styles.previewDuration}>Duration {formatHoursMinutes(previewTotalMin) || '0min'}</span>
          <div className={styles.outlineItems}>
            {items.map(item => {
              const restricted = isRestricted(item)
              return (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    styles.outlineRow,
                    activeItem === item.id ? styles.outlineRowActive : '',
                    restricted ? styles.outlineRowRestricted : '',
                  ].filter(Boolean).join(' ')}
                  /* Indent by nesting depth, matching the builder outline. */
                  style={{ paddingLeft: `calc(var(--space-8) + ${item.path.length - 1} * var(--space-12))` }}
                  onClick={() => goToItem(item.id)}
                >
                  <span className={styles.outlineLabel}>{formatItemNumber(item.path)} {restricted ? restrictedLabel : (item.title || 'Untitled agenda item')}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.previewDetail}>
          {items.map((item, index) => {
            const timeMeta = item.durationMin === 0 ? (
              <span className={styles.detailTime}>No duration</span>
            ) : (
              <>
                <span className={styles.detailTime}>
                  {`${formatClock(previewSchedule[index].start)} - ${formatClock(previewSchedule[index].end)}`}
                </span>
                <span className={styles.detailDuration}>{item.durationMin} min</span>
              </>
            )

            /* Restricted item → dimmed placeholder: number + "*Restricted*" + the
               time slot only, no content (Figma 12025-114417). */
            if (isRestricted(item)) {
              return (
                <div key={item.id} className={styles.detailItemGroup} ref={el => { cardRefs.current[item.id] = el }}>
                  <div className={[styles.detailItem, styles.detailItemRestricted].join(' ')}>
                    <h3 className={styles.detailTitle}>{formatItemNumber(item.path)} {restrictedLabel}</h3>
                    <div className={styles.detailMeta}>{timeMeta}</div>
                  </div>
                </div>
              )
            }

            return (
            <div key={item.id} className={styles.detailItemGroup} ref={el => { cardRefs.current[item.id] = el }}>
            <div className={styles.detailItem}>
              <h3 className={styles.detailTitle}>{formatItemNumber(item.path)} {item.title}</h3>

              <div className={styles.detailMeta}>
                {timeMeta}
                {(() => {
                  const p = purposeOptions.find(o => o.value === item.purpose)
                  return p ? (
                    <span className={styles.purposeTag}>
                      <span className={styles.purposeTagIcon} style={{ color: p.color }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: labelSvg }} />
                      {p.label}
                    </span>
                  ) : null
                })()}
              </div>

              {item.presenters && item.presenters.length > 0 && (
                <div className={styles.detailSection}>
                  <span className={styles.detailLabel}>Presenter</span>
                  {item.presenters.map(p => (
                    <div key={p.name} className={styles.presenterRow}>
                      <Avatar
                        size="s"
                        variant={p.avatar ? 'picture' : 'letters'}
                        src={p.avatar || undefined}
                        initials={initialsOf(p.name)}
                        alt={p.name}
                      />
                      <span className={styles.presenterName}>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {item.description && (
                <div className={styles.detailSection}>
                  <span className={styles.detailLabel}>Description</span>
                  {/* Description is stored as rich-text HTML — render it formatted. */}
                  <div className={styles.richText} dangerouslySetInnerHTML={{ __html: item.description }} />
                </div>
              )}

              {item.motions && (
                <div className={styles.detailSection}>
                  <span className={styles.detailLabel}>Motions</span>
                  {item.motions.map((motion, i) => (
                    <p key={i} className={styles.detailText}>{motion}</p>
                  ))}
                </div>
              )}

              {/* Duplicate preview → documents as request placeholders (DS Document
                  frame, doc-request icon, no menu, links omitted). Live View mode →
                  the full DS Document component (format icon + "…" menu). Section hides
                  when there is nothing to show. */}
              {documentsAsRequests ? (
                (item.attachments ?? []).some(a => a.status === 'ready' && a.format !== 'link') && (
                  <div className={[styles.detailSection, styles.detailSectionAttachments].join(' ')}>
                    <span className={styles.detailLabel}>Attachments</span>
                    <AttachmentsReadOnly attachments={item.attachments ?? []} />
                  </div>
                )
              ) : (
                (item.attachments ?? []).some(a => a.status === 'ready') && (
                  <div className={[styles.detailSection, styles.detailSectionAttachments].join(' ')}>
                    <span className={styles.detailLabel}>Attachments</span>
                    <AttachmentsField
                      mode="view"
                      readOnly={documentsReadOnly}
                      attachments={item.attachments ?? []}
                      onChange={next => attHandlers.onChange(item.id, next)}
                      onOpen={attHandlers.onOpen}
                      onDownload={attHandlers.onDownload}
                      onCopyToDocuments={attHandlers.onCopyToDocuments}
                    />
                  </div>
                )
              )}
            </div>
            </div>
            )
          })}
        </div>
      </div>

      {footer}
    </div>
  )
}

type BuilderSource = 'duplicate' | 'scratch'

function AgendaTab({ onOpenInBoardBook, onViewBoardBook }: { onOpenInBoardBook: (name: string) => void; onViewBoardBook: () => void }) {
  const [pastMeeting, setPastMeeting] = useState('')
  const [builderSource, setBuilderSource] = useState<BuilderSource | null>(null)
  const selectedLabel = PAST_MEETINGS.find(o => o.value === pastMeeting)?.label

  if (builderSource) {
    return (
      <AgendaBuilder
        key={builderSource}
        initialItems={builderSource === 'duplicate' ? DUPLICATED_BUILDER_ITEMS : BLANK_BUILDER_ITEMS}
        onOpenInBoardBook={onOpenInBoardBook}
        onViewBoardBook={onViewBoardBook}
      />
    )
  }

  return (
    <div className={styles.agendaTab}>
      <div className={styles.starterToolbar}>
        <span className={styles.starterLabel}>Choose a starting point</span>
        <Dropdown
          options={PAST_MEETINGS}
          value={pastMeeting}
          onChange={v => setPastMeeting(v as string)}
          placeholder="Select past meeting"
          size="m"
          className={styles.starterDropdown}
        />
        <Button
          variant="primary"
          size="m"
          disabled={!pastMeeting}
          onClick={() => setBuilderSource('duplicate')}
        >
          Duplicate agenda
        </Button>
        <span className={styles.orText}>or</span>
        <Button
          variant="secondary"
          intent="neutral"
          size="m"
          onClick={() => setBuilderSource('scratch')}
        >
          Start from scratch
        </Button>
      </div>

      {selectedLabel ? (
        <AgendaPreview
          items={PREVIEW_ITEMS}
          documentsAsRequests
          header={
            <Banner
              state="info-primary"
              variant="inline"
              size="m"
              message={`Previewing agenda from ${selectedLabel}`}
            />
          }
        />
      ) : (
        <EmptyState
          illustration="clipboard"
          title="No agenda created yet"
          description="To begin drafting your agenda, duplicate it from a past meeting or start from scratch."
          className={styles.emptyState}
        />
      )}
    </div>
  )
}

/* ── Meeting tab (creation / pre-publication) — Figma 27312-59491 ────────────
   Default state of a meeting that has not been published yet: a two-column layout
   with the editable meeting details on the left and a live invitation-email
   preview on the right, plus a Publish / Save-as-draft sticky footer. */
type MeetingType = 'hybrid' | 'in-person' | 'online'
const MEETING_TYPE_LABEL: Record<MeetingType, string> = {
  'hybrid':    'hybrid',
  'in-person': 'in-person',
  'online':    'online',
}

/* Meeting group selector + additional participants (IBP-12096). Clicking the field
   opens an alphabetical group menu; a selected group shows as a chip that reveals a
   member popover and a clear (×) on hover. Once a group is chosen, extra participants
   can be added from the portal (excluding group members and blocked users; admins
   included) and are listed with a hover remove control. */
function GroupParticipantsField() {
  /* Auto-select when the CoSec can access only one group; otherwise leave empty
     (prefill for the multi-group case is handled elsewhere and not touched here). */
  const [group, setGroup] = useState<string>(autoSelectedGroup(MEETING_GROUPS))
  const [menuOpen, setMenuOpen] = useState(false)
  const [participants, setParticipants] = useState<string[]>([])
  const [adding, setAdding] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const addRef  = useRef<HTMLDivElement>(null)

  const selectedGroup = group ? groupByValue(group) : undefined
  const groupMembers  = selectedGroup?.members ?? []

  /* Portal users offered as extra participants: everyone except this group's members
     and blocked users. Admins are included. */
  const options: AutocompleteOption[] = participantCandidates(PORTAL_USERS, groupMembers)
    .map(u => ({
      value: u.id,
      label: u.name,
      avatar: { src: avatarUrl(u.id), initials: initialsOf(u.name), type: 'user' },
      sublistLabel: u.role === 'admin' ? 'Admin' : undefined,
    }))

  /* Close the group menu on an outside click. */
  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  /* Focus the participants input as soon as it replaces the button. */
  useEffect(() => {
    if (adding) addRef.current?.querySelector('input')?.focus()
  }, [adding])

  const clearGroup = () => { setGroup(''); setParticipants([]); setAdding(false); setMenuOpen(false) }
  const selectGroup = (v: string) => { setGroup(v); setParticipants([]); setMenuOpen(false) }
  const removeParticipant = (id: string) => setParticipants(prev => prev.filter(p => p !== id))

  return (
    <div className={styles.mtgGroupField} ref={rootRef}>
      {selectedGroup ? (
        <div className={styles.mtgGroupChip}>
          <button type="button" className={styles.mtgGroupChipMain} onClick={() => setMenuOpen(o => !o)}>
            <span className={styles.mtgGroupBadge} style={{ background: selectedGroup.color }}>{selectedGroup.label.slice(0, 1)}</span>
            <span className={styles.mtgGroupName}>{selectedGroup.label}</span>
          </button>
          <Tooltip label="Remove group" position="top" wrapperClassName={styles.mtgGroupClear}>
            <Button
              variant="tertiary"
              intent="neutral"
              size="m"
              iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: removeSvg }} />}
              aria-label="Remove group"
              onClick={clearGroup}
            />
          </Tooltip>
          {/* Members revealed on hover (Figma 12096-149425). */}
          <div className={styles.mtgMemberPop} role="tooltip">
            {groupMembers.map(id => {
              const u = userById(id)
              return u ? (
                <div key={id} className={styles.mtgMemberRow}>
                  <Avatar size="s" variant="picture" src={avatarUrl(u.id)} initials={initialsOf(u.name)} alt={u.name} />
                  <span className={styles.mtgMemberName}>{u.name}</span>
                </div>
              ) : null
            })}
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={[styles.mtgGroupTrigger, menuOpen ? styles.mtgGroupTriggerOpen : ''].filter(Boolean).join(' ')}
          onClick={() => setMenuOpen(o => !o)}
        >
          <span className={styles.mtgGroupPlaceholder}>Choose group</span>
        </button>
      )}

      {menuOpen && (
        <div className={styles.mtgMenu} role="listbox">
          {MEETING_GROUPS.map(g => (
            <button
              key={g.value}
              type="button"
              role="option"
              aria-selected={g.value === group}
              className={styles.mtgMenuItem}
              onClick={() => selectGroup(g.value)}
            >
              <span className={styles.mtgGroupBadge} style={{ background: g.color }}>{g.label.slice(0, 1)}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      )}

      {selectedGroup && (
        <>
          {participants.length > 0 && (
            <div className={styles.mtgParticipants}>
              {participants.map(id => {
                const u = userById(id)
                return u ? (
                  <div key={id} className={styles.mtgParticipantRow}>
                    <Avatar size="s" variant="picture" src={avatarUrl(u.id)} initials={initialsOf(u.name)} alt={u.name} />
                    <span className={styles.mtgParticipantName}>{u.name}</span>
                    {u.role === 'admin' && <span className={styles.mtgRoleTag}>Admin</span>}
                    <Tooltip label="Remove" position="top" wrapperClassName={styles.mtgParticipantRemove}>
                      <Button
                        variant="tertiary"
                        intent="neutral"
                        size="m"
                        iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: removeSvg }} />}
                        aria-label={`Remove ${u.name}`}
                        onClick={() => removeParticipant(id)}
                      />
                    </Tooltip>
                  </div>
                ) : null
              })}
            </div>
          )}

          {adding ? (
            <div className={styles.mtgAddInput} ref={addRef}>
              <Autocomplete
                variant="no-border"
                size="m"
                multiple
                options={options}
                value={participants}
                placeholder="Search people to add"
                aria-label="Add participants"
                onChange={v => setParticipants(v as string[])}
              />
            </div>
          ) : (
            <Button
              variant="tertiary"
              size="m"
              className={styles.mtgAddLink}
              iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: plusSvg }} />}
              onClick={() => setAdding(true)}
            >
              Add extra participants
            </Button>
          )}
        </>
      )}
    </div>
  )
}

/* ── Videoconference field (IBP-20959) ──────────────────────────────────────
   A small state machine for adding a video-conference link: pick Zoom / MS Teams
   from a dropdown (connecting the integration if needed), a generated "Join with …"
   link with hover copy/delete, and the banner/loading/error states from the design. */
type VcProvider = 'zoom' | 'teams'
type VcStatus = 'empty' | 'loading' | 'ready' | 'manual' | 'later' | 'error'
interface VcState { status: VcStatus; provider: VcProvider | null; link: string }
const EMPTY_VC: VcState = { status: 'empty', provider: null, link: '' }
const VC_META: Record<VcProvider, { name: string; icon: string }> = {
  zoom:  { name: 'Zoom',     icon: vcZoomSvg },
  teams: { name: 'MS Teams', icon: vcTeamsSvg },
}
function genVcLink(p: VcProvider): string {
  const n = Math.floor(1e10 + Math.random() * 8e10)
  return p === 'zoom'
    ? `https://idealscorp.zoom.us/j/${n}`
    : `https://teams.microsoft.com/l/meetup-join/${n}`
}
/** Detect the provider from a pasted URL (null = neither Zoom nor Teams). */
function detectVcProvider(url: string): VcProvider | null {
  if (/zoom\.us/i.test(url)) return 'zoom'
  if (/teams\.(microsoft|live)\.com/i.test(url)) return 'teams'
  return null
}

interface Integrations { zoom: boolean; teams: boolean }

function VideoconferenceField({ value, onChange, integrations, onConnect, calendar, onViewConnections }: {
  value: VcState
  onChange: (v: VcState) => void
  integrations: Integrations
  onConnect: (p: VcProvider) => void
  calendar: 'google' | 'outlook'
  onViewConnections: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [input, setInput] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current) }, [])
  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const clear = () => { setInput(''); onChange(EMPTY_VC) }

  /* Pick a provider: MS Teams on an Outlook calendar defers the link to send-time;
     everything else spins while a link is generated (a paste of "fail" simulates a
     generation error so the error state is reachable in the prototype). */
  const select = (p: VcProvider) => {
    setMenuOpen(false)
    if (p === 'teams' && calendar === 'outlook') {
      onChange({ status: 'later', provider: 'teams', link: '' })
      return
    }
    onChange({ status: 'loading', provider: p, link: '' })
    timerRef.current = window.setTimeout(() => {
      onChange({ status: 'ready', provider: p, link: genVcLink(p) })
    }, 1400)
  }
  const connect = (p: VcProvider) => { onConnect(p); select(p) }

  /* Commit a manually typed/pasted link. */
  const commitInput = () => {
    const url = input.trim()
    if (!url) return
    const p = detectVcProvider(url)
    if (p && /fail/i.test(url)) { onChange({ status: 'error', provider: p, link: '' }); return }
    onChange({ status: 'manual', provider: p, link: url })
    setMenuOpen(false)
  }

  const copy = () => { void navigator.clipboard?.writeText(value.link) }

  /* Hover actions (copy + delete) shared by generated and manual links. */
  const linkActions = (
    <span className={styles.vcActions}>
      <Tooltip label="Copy" position="top" wrapperClassName={styles.vcAction}>
        <Button variant="tertiary" intent="neutral" size="m"
          iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: copySvg }} />}
          aria-label="Copy link" onClick={copy} />
      </Tooltip>
      <Tooltip label="Delete" position="top" wrapperClassName={styles.vcAction}>
        <Button variant="tertiary" intent="neutral" size="m"
          iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: removeSvg }} />}
          aria-label="Delete link" onClick={clear} />
      </Tooltip>
    </span>
  )

  if (value.status === 'loading') {
    return (
      <div className={styles.vcLoading}>
        <span className={styles.vcSpinner} aria-hidden="true" dangerouslySetInnerHTML={{ __html: spinnerSvg }} />
        Adding {VC_META[value.provider ?? 'zoom'].name} link
      </div>
    )
  }

  if (value.status === 'ready' || (value.status === 'manual')) {
    const meta = value.provider ? VC_META[value.provider] : null
    const isGenerated = value.status === 'ready'
    const needsConnect = value.status === 'manual' && value.provider != null && !integrations[value.provider]
    return (
      <>
        <div className={styles.vcLinkRow}>
          {/* Generated links carry the provider badge + "Join with …"; a manually
              pasted link shows the raw URL only (Figma 12096-149543). */}
          {isGenerated && meta && <span className={styles.vcBadge} aria-hidden="true" dangerouslySetInnerHTML={{ __html: meta.icon }} />}
          {isGenerated
            ? <a className={styles.vcJoinLink} href={value.link} target="_blank" rel="noreferrer">Join with {meta?.name}</a>
            : <span className={styles.vcManualLink}>{value.link}</span>}
          {linkActions}
        </div>
        {needsConnect && (
          <Banner
            state="info-secondary"
            variant="rounded"
            size="m"
            message={`To enable meeting transcriptions, connect your ${meta?.name} account`}
            action={<Button variant="tertiary" size="s" onClick={() => value.provider && connect(value.provider)}>Connect</Button>}
            onDismiss={clear}
          />
        )}
      </>
    )
  }

  if (value.status === 'later') {
    return (
      <Banner
        state="info-primary"
        variant="rounded"
        size="m"
        message="Video conference link will be added once the invitations are sent"
        onDismiss={clear}
      />
    )
  }

  if (value.status === 'error') {
    return (
      <Banner
        state="error"
        variant="rounded"
        size="m"
        message={`${VC_META[value.provider ?? 'zoom'].name} link generation failed`}
        action={<Button variant="tertiary" intent="danger" size="s" onClick={onViewConnections}>Reconnect</Button>}
        onDismiss={clear}
      />
    )
  }

  /* empty */
  return (
    <div className={styles.vcField} ref={rootRef}>
      <input
        className={styles.vcInput}
        value={input}
        placeholder="Select tool or add link"
        aria-label="Videoconference"
        onFocus={() => setMenuOpen(true)}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitInput() } }}
        onBlur={() => { if (input.trim()) commitInput() }}
      />
      {menuOpen && (
        <div className={styles.vcMenu} role="listbox">
          {(['teams', 'zoom'] as VcProvider[]).map(p => {
            const connected = integrations[p]
            return (
              <div key={p} className={[styles.vcMenuItem, connected ? '' : styles.vcMenuItemDisabled].filter(Boolean).join(' ')}>
                <button
                  type="button"
                  className={styles.vcMenuMain}
                  disabled={!connected}
                  onClick={() => connected && select(p)}
                >
                  <span className={styles.vcBadge} aria-hidden="true" dangerouslySetInnerHTML={{ __html: VC_META[p].icon }} />
                  <span className={styles.vcMenuName}>{VC_META[p].name}</span>
                </button>
                {!connected && (
                  <Button variant="link" size="m" onClick={() => connect(p)}>Connect</Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MeetingField({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className={styles.mtgField}>
      <span className={styles.mtgFieldIcon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />
      <div className={styles.mtgFieldBody}>{children}</div>
    </div>
  )
}

/* ── Calendar connections (IBP-12096 / IBP-17142) ───────────────────────────
   "Add to calendar" opens a dropdown of Outlook / Google Calendar. A connected
   integration is selectable; a disconnected one is greyed and offers Connect
   (which connects then adds). The selected calendar shows its logo + name with a
   hover View connections / Delete, and a failure shows the error banner. */
type CalProvider = 'google' | 'outlook'
type CalStatus = 'empty' | 'ready' | 'error'
interface CalState { status: CalStatus; provider: CalProvider | null }
const EMPTY_CAL: CalState = { status: 'empty', provider: null }
const CAL_META: Record<CalProvider, { name: string; icon: string }> = {
  google:  { name: 'Google Calendar', icon: googleCalSvg },
  outlook: { name: 'Outlook',         icon: outlookSvg },
}
interface CalIntegrations { google: boolean; outlook: boolean }

function CalendarField({ value, onChange, integrations, onConnect, onViewConnections }: {
  value: CalState
  onChange: (v: CalState) => void
  integrations: CalIntegrations
  onConnect: (p: CalProvider) => void
  onViewConnections: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const select  = (p: CalProvider) => { setMenuOpen(false); onChange({ status: 'ready', provider: p }) }
  const connect = (p: CalProvider) => { onConnect(p); select(p) }
  const clear   = () => onChange(EMPTY_CAL)

  if (value.status === 'ready' && value.provider) {
    const meta = CAL_META[value.provider]
    return (
      <div className={styles.vcLinkRow}>
        <span className={styles.calBadge} aria-hidden="true" dangerouslySetInnerHTML={{ __html: meta.icon }} />
        <span className={styles.vcManualLink}>{meta.name}</span>
        <span className={styles.vcActions}>
          <Tooltip label="View connections" position="top" wrapperClassName={styles.vcAction}>
            <Button variant="tertiary" intent="neutral" size="m"
              iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: linkSvg }} />}
              aria-label="View connections" onClick={onViewConnections} />
          </Tooltip>
          <Tooltip label="Delete" position="top" wrapperClassName={styles.vcAction}>
            <Button variant="tertiary" intent="neutral" size="m"
              iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: removeSvg }} />}
              aria-label="Delete calendar" onClick={clear} />
          </Tooltip>
        </span>
      </div>
    )
  }

  if (value.status === 'error') {
    return (
      <Banner
        state="error"
        variant="rounded"
        size="m"
        message="Couldn’t add the meeting to your calendar"
        action={<Button variant="tertiary" intent="danger" size="s" onClick={onViewConnections}>View connections</Button>}
        onDismiss={clear}
      />
    )
  }

  /* empty */
  return (
    <div className={styles.vcField} ref={rootRef}>
      <button
        type="button"
        className={styles.calAddBtn}
        onClick={() => setMenuOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
      >
        <span className={styles.calAddIcon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: plusSvg }} />
        Add to calendar
      </button>
      {menuOpen && (
        <div className={styles.vcMenu} role="listbox">
          {(['outlook', 'google'] as CalProvider[]).map(p => {
            const connected = integrations[p]
            return (
              <div key={p} className={[styles.vcMenuItem, connected ? '' : styles.vcMenuItemDisabled].filter(Boolean).join(' ')}>
                <button type="button" className={styles.vcMenuMain} disabled={!connected} onClick={() => connected && select(p)}>
                  <span className={styles.calBadge} aria-hidden="true" dangerouslySetInnerHTML={{ __html: CAL_META[p].icon }} />
                  <span className={styles.vcMenuName}>{CAL_META[p].name}</span>
                </button>
                {!connected && <Button variant="link" size="m" onClick={() => connect(p)}>Connect</Button>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Location autocomplete (IBP-12096) ──────────────────────────────────────
   Free-text address search: typing runs a (simulated async) lookup that shows
   "Loading" while in flight, then suggestions or "Not found". The value saves on
   Enter, on picking a suggestion, or on blur; a saved address reads as editable
   text with hover Copy / Delete and switches back to editing on click. */
function LocationField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(!value)
  const [input, setInput] = useState(value)
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current) }, [])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const runSearch = (q: string) => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    if (!q.trim()) { setSearching(false); setResults([]); setOpen(false); return }
    /* Show "Loading" while the request is in flight (never "Not found" yet). */
    setSearching(true); setOpen(true)
    timerRef.current = window.setTimeout(() => {
      setResults(filterAddresses(q, SAMPLE_ADDRESSES))
      setSearching(false)
    }, 550)
  }

  const commit = () => {
    const v = input.trim()
    onChange(v)
    setOpen(false); setSearching(false)
    if (v) setEditing(false)
  }

  /* Outside click behaves like blur — save the current input. */
  useEffect(() => {
    if (!editing) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) commit()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }) // re-bind each render so commit() closes over the latest input

  const pick = (addr: string) => { setInput(addr); onChange(addr); setOpen(false); setSearching(false); setEditing(false) }
  const copy = () => { void navigator.clipboard?.writeText(value) }
  const del  = () => { onChange(''); setInput(''); setResults([]); setEditing(true) }
  const startEdit = () => { setInput(value); setEditing(true); setOpen(false) }

  if (!editing && value) {
    return (
      <div className={styles.vcLinkRow}>
        <button type="button" className={styles.locText} onClick={startEdit}>{value}</button>
        <span className={styles.vcActions}>
          <Tooltip label="Copy" position="top" wrapperClassName={styles.vcAction}>
            <Button variant="tertiary" intent="neutral" size="m"
              iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: copySvg }} />}
              aria-label="Copy address" onClick={copy} />
          </Tooltip>
          <Tooltip label="Delete" position="top" wrapperClassName={styles.vcAction}>
            <Button variant="tertiary" intent="neutral" size="m"
              iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: removeSvg }} />}
              aria-label="Delete address" onClick={del} />
          </Tooltip>
        </span>
      </div>
    )
  }

  return (
    <div className={styles.vcField} ref={rootRef}>
      <input
        ref={inputRef}
        className={styles.vcInput}
        value={input}
        placeholder="Add location"
        aria-label="Location"
        onChange={e => { setInput(e.target.value); runSearch(e.target.value) }}
        onFocus={() => { if (input.trim()) runSearch(input) }}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit() } }}
      />
      {open && (
        <div className={styles.vcMenu} role="listbox">
          {searching ? (
            <div className={styles.locHint}>Loading</div>
          ) : results.length > 0 ? (
            results.map(a => (
              <button key={a} type="button" role="option" className={styles.locOption} onClick={() => pick(a)}>{a}</button>
            ))
          ) : (
            <div className={styles.locHint}>Not found</div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Groups & portal users (IBP meeting creation) ───────────────────────────
   In a real app these come from the API scoped to the CoSec's access. Here they
   are static: PORTAL_USERS is every user in the portal (one admin, one blocked);
   each group lists its members by id. */
interface PortalUser { id: string; name: string; role?: 'admin'; blocked?: boolean }
const PORTAL_USERS: PortalUser[] = [
  { id: 'brian',   name: 'Brian Rubinstein' },
  { id: 'cheryl',  name: 'Cheryl Jameson' },
  { id: 'colind',  name: 'Colin Darrans' },
  { id: 'colint',  name: 'Colin Thompson' },
  { id: 'jessica', name: 'Jessica Thompson' },
  { id: 'michael', name: 'Michael Donaldson', role: 'admin' },
  { id: 'noah',    name: 'Noah James' },
  { id: 'olivia',  name: 'Olivia Thompson' },
  { id: 'ryan',    name: 'Ryan Bennett' },
  { id: 'sophiaw', name: 'Sophia Williams' },
  { id: 'steven',  name: 'Steven Harris', blocked: true },
  { id: 'sylvia',  name: 'Sylvia Grant' },
  { id: 'taylor',  name: 'Taylor Benson' },
  { id: 'william', name: 'William Parker' },
]
const userById = (id: string) => PORTAL_USERS.find(u => u.id === id)
/* Deterministic demo photo per user (Figma shows real avatars in the group popover
   and participant list). */
const avatarUrl = (id: string) => `https://i.pravatar.cc/40?u=${id}`

interface MeetingGroup { value: string; label: string; members: string[]; color: string }
/* Groups the CoSec can access — sorted alphabetically by name. Each group has its
   own avatar colour (Figma 12096-149425). */
const MEETING_GROUPS: MeetingGroup[] = [
  { value: 'board',   label: 'Board of Directors', color: 'var(--tag-kepeel)',   members: ['brian', 'cheryl', 'colind', 'michael', 'noah'] },
  { value: 'audit',   label: 'Audit Committee',    color: 'var(--tag-red)',      members: ['colint', 'jessica', 'sylvia'] },
  { value: 'finance', label: 'Finance Committee',  color: 'var(--tag-navyblue)', members: ['sophiaw', 'taylor'] },
].sort((a, b) => a.label.localeCompare(b.label))
const groupByValue = (v: string) => MEETING_GROUPS.find(g => g.value === v)

/* ── Timezone (IBP-12096 date/time/timezone) ────────────────────────────────
   The meeting defaults to the viewer's own timezone; the "Change time zone" modal
   lets them pick another from an auto-detected + region-grouped, searchable list,
   each showing "GMT±N (current time)" (Figma 14367-151012). */
const USER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone

const TZ_REGIONS: { region: string; zones: { value: string; city: string }[] }[] = [
  { region: 'America', zones: [
    { value: 'America/Adak',        city: 'Adak, United States' },
    { value: 'America/Anchorage',   city: 'Anchorage, United States' },
    { value: 'America/Los_Angeles', city: 'Los Angeles, United States' },
    { value: 'America/Denver',      city: 'Denver, United States' },
    { value: 'America/Chicago',     city: 'Chicago, United States' },
    { value: 'America/New_York',    city: 'New York, United States' },
    { value: 'America/Anguilla',    city: 'Anguilla, Anguilla' },
    { value: 'America/Araguaina',   city: 'Araguaina, Brazil' },
    { value: 'America/Sao_Paulo',   city: 'São Paulo, Brazil' },
  ] },
  { region: 'Europe', zones: [
    { value: 'Europe/London', city: 'London, United Kingdom' },
    { value: 'Europe/Lisbon', city: 'Lisbon, Portugal' },
    { value: 'Europe/Paris',  city: 'Paris, France' },
    { value: 'Europe/Berlin', city: 'Berlin, Germany' },
    { value: 'Europe/Kyiv',   city: 'Kyiv, Ukraine' },
    { value: 'Europe/Athens', city: 'Athens, Greece' },
    { value: 'Europe/Moscow', city: 'Moscow, Russia' },
  ] },
  { region: 'Asia', zones: [
    { value: 'Asia/Dubai',     city: 'Dubai, United Arab Emirates' },
    { value: 'Asia/Karachi',   city: 'Karachi, Pakistan' },
    { value: 'Asia/Kolkata',   city: 'Mumbai, India' },
    { value: 'Asia/Almaty',    city: 'Almaty, Kazakhstan' },
    { value: 'Asia/Shanghai',  city: 'Shanghai, China' },
    { value: 'Asia/Tokyo',     city: 'Tokyo, Japan' },
    { value: 'Asia/Singapore', city: 'Singapore, Singapore' },
  ] },
  { region: 'Africa', zones: [
    { value: 'Africa/Cairo',        city: 'Cairo, Egypt' },
    { value: 'Africa/Lagos',        city: 'Lagos, Nigeria' },
    { value: 'Africa/Johannesburg', city: 'Johannesburg, South Africa' },
  ] },
  { region: 'Australia & Pacific', zones: [
    { value: 'Australia/Sydney', city: 'Sydney, Australia' },
    { value: 'Pacific/Auckland', city: 'Auckland, New Zealand' },
    { value: 'Pacific/Honolulu', city: 'Honolulu, United States' },
  ] },
]
const TZ_CITY: Record<string, string> = Object.fromEntries(
  TZ_REGIONS.flatMap(r => r.zones.map(z => [z.value, z.city] as const)),
)
const tzCity = (tz: string) => TZ_CITY[tz] ?? tz.split('/').pop()?.replace(/_/g, ' ') ?? tz

/** Offset (minutes) of an IANA zone at a given instant, DST-aware. */
function tzOffsetMinutes(tz: string, date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(date)
  const m: Record<string, string> = {}
  parts.forEach(p => { m[p.type] = p.value })
  const asUTC = Date.UTC(+m.year, +m.month - 1, +m.day, +m.hour === 24 ? 0 : +m.hour, +m.minute, +m.second)
  return Math.round((asUTC - date.getTime()) / 60000)
}
/** "GMT+3 (11:43)" — offset + current local time in the zone. */
function tzSecondary(tz: string, now: Date): string {
  const off = tzOffsetMinutes(tz, now)
  const sign = off >= 0 ? '+' : '-'
  const h = Math.floor(Math.abs(off) / 60)
  const m = Math.abs(off) % 60
  const gmt = `GMT${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
  return `${gmt} (${time})`
}
/** Options for the modal Dropdown: "Automatically detected" + region groups. */
function buildTzOptions(now: Date): DropdownOption[] {
  const opts: DropdownOption[] = [
    { type: 'group', label: 'Automatically detected' },
    { value: USER_TZ, label: tzCity(USER_TZ), secondaryText: tzSecondary(USER_TZ, now) },
  ]
  for (const r of TZ_REGIONS) {
    opts.push({ type: 'group', label: r.region })
    for (const z of r.zones) {
      if (z.value === USER_TZ) continue
      opts.push({ value: z.value, label: z.city, secondaryText: tzSecondary(z.value, now) })
    }
  }
  return opts
}
/** Compact label for the date-row timezone button + the invitation email. */
function tzLabelOf(value: string): string {
  const off = tzOffsetMinutes(value, new Date())
  const sign = off >= 0 ? '+' : '-'
  const h = Math.floor(Math.abs(off) / 60)
  const m = Math.abs(off) % 60
  return `(GMT${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}) ${tzCity(value).split(',')[0]}`
}

/** "9:00 AM" → minutes since midnight (null if unparseable). */
function parseTimeToMin(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim())
  if (!m) return null
  let h = Number(m[1]) % 12
  if (/pm/i.test(m[3])) h += 12
  return h * 60 + Number(m[2])
}
/** Duration between two times as "5hr 30min". */
function formatDurationLabel(start: string, end: string): string {
  const a = parseTimeToMin(start), b = parseTimeToMin(end)
  if (a == null || b == null) return ''
  let d = b - a
  if (d < 0) d += 24 * 60
  const h = Math.floor(d / 60), mm = d % 60
  return [h ? `${h}hr` : '', mm ? `${mm}min` : ''].filter(Boolean).join(' ')
}

/** Meeting description limit (IBP-12096 rich-text ticket). Counts visible text. */
const DESCRIPTION_MAX = 3900

function MeetingDetailsTab() {
  /* Seed the name with the meeting title from the page header (MEETING_TITLE) so the
     name field, the page header and the invitation email all read the same. */
  const [name, setName] = useState(MEETING_TITLE)
  /* Rich-text description (HTML). `descValid` gates submission when the content
     exceeds DESCRIPTION_MAX; the email preview and any "save" sanitize the HTML. */
  const [description, setDescription] = useState('')
  const [descValid, setDescValid] = useState(true)
  const [type, setType] = useState<MeetingType>('hybrid')
  /* Videoconference / location values live here so hiding a field by meeting type
     never clears them — switching type back restores the value. The videoconference
     is a small state machine (see VideoconferenceField); integrations start
     disconnected and no link is preselected (IBP-20959). */
  const [vc, setVc] = useState<VcState>(EMPTY_VC)
  const [integrations, setIntegrations] = useState<Integrations>({ zoom: false, teams: false })
  const [connectionsOpen, setConnectionsOpen] = useState(false)
  const [location, setLocation] = useState('')
  /* Calendar integrations (IBP-17142) start disconnected; nothing is preselected.
     The chosen calendar also drives the MS Teams videoconference flow below. */
  const [calIntegrations, setCalIntegrations] = useState<CalIntegrations>({ google: false, outlook: false })
  const [cal, setCal] = useState<CalState>(EMPTY_CAL)
  /* Date/time/timezone (IBP-12096): default to today, 9:00, and the viewer's timezone. */
  const [date, setDate] = useState<Date | null>(() => new Date())
  const [startTime, setStartTime] = useState('9:00 AM')
  const [endTime, setEndTime] = useState('10:00 AM')
  const [tz, setTz] = useState(USER_TZ)
  const [tzModalOpen, setTzModalOpen] = useState(false)
  /* Build the (offset + current-time) list only while the modal is open. */
  const tzOptions = useMemo(() => (tzModalOpen ? buildTzOptions(new Date()) : []), [tzModalOpen])
  /* The invitation email always reflects the meeting name; fall back to the header
     title while the name field is still empty. */
  const meetingTitle = name.trim() || MEETING_TITLE
  const monthAbbr = date ? date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : ''
  const dayNum    = date ? date.getDate() : ''
  const durationLabel = formatDurationLabel(startTime, endTime)

  /* RSVP options mirror the meeting type (Figma 12594-226865/228035/228330). */
  const rsvpCells: { label: string; icon: string; tone?: string }[] = [
    ...(type === 'hybrid'
      ? [{ label: 'Yes, in person', icon: rsvpUserSvg }, { label: 'Yes, online', icon: mtgVideoSvg, tone: styles.rsvpIconAccent }]
      : type === 'in-person'
        ? [{ label: 'Yes', icon: rsvpUserSvg }]
        : [{ label: 'Yes', icon: mtgVideoSvg, tone: styles.rsvpIconAccent }]),
    { label: 'Maybe', icon: rsvpMaybeSvg, tone: styles.rsvpIconWarn },
    { label: 'No',    icon: rsvpNoSvg,    tone: styles.rsvpIconDanger },
  ]

  return (
    <div className={styles.meeting}>
      <div className={styles.meetingBody}>
        {/* ── Left: meeting details form ─────────────────────────── */}
        <div className={styles.meetingForm}>
          <div className={styles.meetingFormInner}>
          <MeetingField icon={mtgNameSvg}>
            <TextField
              variant="no-border"
              size="l"
              className={styles.mtgNameField}
              value={name}
              placeholder="Add meeting name"
              aria-label="Meeting name"
              onChange={e => setName(e.target.value)}
            />
          </MeetingField>

          <MeetingField icon={mtgTypeSvg}>
            <span className={styles.mtgLabel}>Meeting type</span>
            <div className={styles.mtgRadioRow}>
              <Radio name="meeting-type" label="Hybrid"    checked={type === 'hybrid'}    onChange={() => setType('hybrid')} />
              <Radio name="meeting-type" label="In-person" checked={type === 'in-person'} onChange={() => setType('in-person')} />
              <Radio name="meeting-type" label="Online"    checked={type === 'online'}    onChange={() => setType('online')} />
            </div>
          </MeetingField>

          <MeetingField icon={mtgGroupSvg}>
            <GroupParticipantsField />
          </MeetingField>

          <MeetingField icon={mtgDateSvg}>
            <DatePicker
              variant="no-border"
              format="long"
              value={date}
              onChange={setDate}
              placeholder="Select date"
              aria-label="Meeting date"
            />
            <div className={styles.mtgTimeRow}>
              <TimeField variant="no-border" value={startTime} onChange={setStartTime} aria-label="Start time" />
              <span className={styles.mtgTimeSep}>–</span>
              <TimeField variant="no-border" value={endTime} onChange={setEndTime} aria-label="End time" />
              <Button
                variant="tertiary"
                intent="neutral"
                size="s"
                className={styles.mtgTzButton}
                onClick={() => setTzModalOpen(true)}
              >
                {tzLabelOf(tz)}
              </Button>
            </div>
            <CalendarField
              value={cal}
              onChange={setCal}
              integrations={calIntegrations}
              onConnect={p => setCalIntegrations(prev => ({ ...prev, [p]: true }))}
              onViewConnections={() => setConnectionsOpen(true)}
            />
          </MeetingField>

          {/* Videoconference — hidden for an in-person meeting, but its value is kept
              in state so switching back to Hybrid/Online restores it. The chosen
              calendar drives the MS Teams flow (Outlook → deferred link). */}
          {type !== 'in-person' && (
            <MeetingField icon={mtgVideoSvg}>
              <VideoconferenceField
                value={vc}
                onChange={setVc}
                integrations={integrations}
                onConnect={p => setIntegrations(prev => ({ ...prev, [p]: true }))}
                calendar={cal.provider === 'outlook' ? 'outlook' : 'google'}
                onViewConnections={() => setConnectionsOpen(true)}
              />
            </MeetingField>
          )}

          {/* Location — hidden for an online meeting, but its value is kept in state
              so switching back to Hybrid/In-person restores it. */}
          {type !== 'online' && (
            <MeetingField icon={mtgLocationSvg}>
              <LocationField value={location} onChange={setLocation} />
            </MeetingField>
          )}

          <MeetingField icon={mtgDescSvg}>
            <RichTextField
              value={description}
              onChange={setDescription}
              placeholder="Add description"
              maxLength={DESCRIPTION_MAX}
              onValidityChange={setDescValid}
              tightenFocus
            />
          </MeetingField>
          </div>
        </div>

        {/* ── Right: invitation email preview ────────────────────── */}
        <div className={styles.meetingInvite}>
          <div className={styles.inviteHead}>
            <span className={styles.inviteSubject}>
              Invitation: {meetingTitle} @ March 27, 2025, 10:00 – 15:30 (GMT+6)
            </span>
            <span className={styles.inviteSender}>Ideals Board &lt;info@idealsboard.com&gt;</span>
          </div>

          <div className={styles.inviteEmail}>
            <div className={styles.inviteBrand}>
              <span className={styles.inviteBrandMark} aria-hidden="true" dangerouslySetInnerHTML={{ __html: brandMarkSvg }} />
              <span className={styles.inviteBrandName}>STAR<br />Enterprises</span>
            </div>

            <div className={styles.inviteCard}>
              <div className={styles.inviteIntro}>
                <h3 className={styles.inviteTitle}>You have been invited to a meeting</h3>
                <p className={styles.inviteText}>Olivia Thompson invited you to {/^[aeiou]/i.test(MEETING_TYPE_LABEL[type]) ? 'an' : 'a'} {MEETING_TYPE_LABEL[type]} meeting.</p>
              </div>

              <div className={styles.inviteDate}>
                <MeetingDate month={monthAbbr} day={dayNum} />
                <div className={styles.inviteDateInfo}>
                  <span className={styles.inviteDateTitle}>{meetingTitle}</span>
                  <span className={styles.inviteDateTime}>{startTime} - {endTime}&nbsp;&nbsp;{tzLabelOf(tz)}&nbsp;&nbsp;{durationLabel}</span>
                </div>
              </div>

              <div className={styles.inviteRsvpGroup}>
                <span className={styles.inviteRsvpLabel}>Going to this meeting?</span>
                {/* Segmented RSVP control — one bordered container, cells share dividers,
                    options mirror the meeting type (Figma 12594-226865/228035/228330). */}
                <div className={styles.inviteRsvp}>
                  {rsvpCells.map(c => (
                    <button key={c.label} type="button" className={styles.inviteRsvpCell}>
                      <span
                        className={[styles.inviteRsvpIcon, c.tone].filter(Boolean).join(' ')}
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: c.icon }}
                      />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inviteDetails}>
                <span className={styles.inviteDetailsLabel}>Details</span>
                {htmlHasText(description) ? (
                  /* Client-side sanitization before the email preview renders the
                     user's HTML — strips scripts / handlers / unsafe URLs. */
                  <div
                    className={styles.inviteBody}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
                  />
                ) : (
                  <p className={styles.inviteMuted}>Any extra details and context for the meeting</p>
                )}
                {/* Reflect the chosen videoconference link in the invitation preview
                    (Figma 12096-149523/149543). */}
                {(vc.status === 'ready' || vc.status === 'manual') && vc.link && (
                  <a className={styles.inviteVcLink} href={vc.link} target="_blank" rel="noreferrer">
                    {vc.status === 'ready' && vc.provider ? `Join with ${VC_META[vc.provider].name}` : vc.link}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent action bar — hidden ≤1023px, where the actions move to the
         page-header overflow menu (IBP responsive). */}
      <StickyFooter
        className={styles.meetingFooter}
        left={
          <>
            {/* Blocked while the description exceeds the limit. On submit the HTML is
                sanitized before it would be sent for storage (server would re-sanitize). */}
            <Button variant="primary" size="m" disabled={!descValid}
              onClick={() => console.log('send invitations', { description: sanitizeHtml(description) })}>
              Send invitations
            </Button>
            <Button variant="secondary" intent="neutral" size="m" disabled={!descValid}
              onClick={() => console.log('save as draft', { description: sanitizeHtml(description) })}>
              Save as draft
            </Button>
          </>
        }
        right={
          <Button variant="secondary" intent="danger" size="m" onClick={() => console.log('delete meeting')}>Delete</Button>
        }
      />

      <Modal
        open={tzModalOpen}
        onClose={() => setTzModalOpen(false)}
        title="Change time zone for meeting"
        footer={
          <div className={styles.mtgTzFooter}>
            <Button variant="secondary" intent="neutral" size="m" onClick={() => setTzModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="m" onClick={() => setTzModalOpen(false)}>Save</Button>
          </div>
        }
      >
        <div className={styles.mtgTzField}>
          <span className={styles.mtgLabel}>Meeting time zone</span>
          <Dropdown
            options={tzOptions}
            value={tz}
            onChange={v => setTz(v as string)}
            placeholder="Select time zone"
            aria-label="Meeting time zone"
            clearable
          />
        </div>
      </Modal>

      <Modal
        open={connectionsOpen}
        onClose={() => setConnectionsOpen(false)}
        title="Connections"
      >
        <div className={styles.connList}>
          {(['zoom', 'teams'] as VcProvider[]).map(p => (
            <div key={p} className={styles.connRow}>
              <span className={styles.vcBadge} aria-hidden="true" dangerouslySetInnerHTML={{ __html: VC_META[p].icon }} />
              <span className={styles.connName}>{VC_META[p].name}</span>
              {integrations[p] ? (
                <span className={styles.connStatus}>Connected</span>
              ) : (
                <Button variant="secondary" intent="neutral" size="s" onClick={() => setIntegrations(prev => ({ ...prev, [p]: true }))}>Connect</Button>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default function MeetingPage() {
  const [navItem,   setNavItem]   = useState<NavMenuItemKey>('meetings')
  const [workspace, setWorkspace] = useState('star')
  const [activeTab, setActiveTab] = useState<MeetingTab>('agenda')
  /* Document opened from an attachment — shown in the Board book tab. */
  const [boardBookDoc, setBoardBookDoc] = useState<string | null>(null)

  /* ≤1023px the sidebar is hidden and reached through a hamburger, which opens
     it as an overlay drawer (Figma 17506-146087). */
  const isCompact = useMediaQuery('(max-width: 1023px)')
  const [navOpen, setNavOpen] = useState(false)
  /* Never leave the drawer stuck open when the layout grows back to the rail. */
  useEffect(() => { if (!isCompact) setNavOpen(false) }, [isCompact])

  const openInBoardBook = (name: string) => { setBoardBookDoc(name); setActiveTab('board-book') }
  /* "View Boardbook" from the agenda — open the board book at its first page. */
  const viewBoardBook = () => { setBoardBookDoc(null); setActiveTab('board-book') }

  const sideNav = (drawer: boolean) => (
    <SideNavigation
      workspaces={WORKSPACES}
      activeWorkspaceId={workspace}
      onWorkspaceSelect={setWorkspace}
      navItems={DEFAULT_NAV_ITEMS}
      activeItem={navItem}
      /* Drawer always shows the full expanded sidebar regardless of viewport. */
      collapsed={drawer ? false : undefined}
      onItemClick={key => { setNavItem(key); setNavOpen(false) }}
      {...USER}
      twoFaEnabled
      onProfileClick={() => console.log('profile')}
      onConnectionsClick={() => console.log('connections')}
      onLogoutClick={() => console.log('logout')}
    />
  )

  return (
    <div className={styles.shell}>
      {/* Inline rail — expanded ≥1440, icons-only 1024–1439, hidden ≤1023. */}
      <div className={styles.sidebarInline}>{sideNav(false)}</div>

      {/* ≤1023 overlay drawer + scrim. */}
      {isCompact && navOpen && (
        <>
          <div className={styles.navScrim} onClick={() => setNavOpen(false)} aria-hidden="true" />
          <div className={styles.navDrawer} role="dialog" aria-modal="true" aria-label="Main navigation">
            {sideNav(true)}
          </div>
        </>
      )}

      <main className={styles.main}>
        <PageHeader
          leading={
            <>
              {/* Hamburger ≤1023, back button ≥1024 (toggled via CSS). */}
              <span className={styles.navMenuBtn}>
                <Button
                  variant="tertiary"
                  intent="neutral"
                  size="m"
                  iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: menuSvg }} />}
                  onClick={() => setNavOpen(true)}
                  aria-label="Open navigation menu"
                />
              </span>
              <span className={styles.navBackBtn}>
                <Tooltip label="Back" position="bottom">
                  <Button
                    variant="tertiary"
                    intent="neutral"
                    size="m"
                    iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: backSvg }} />}
                    onClick={() => console.log('back')}
                    aria-label="Go back"
                  />
                </Tooltip>
              </span>
            </>
          }
          title={MEETING_TITLE}
          badge={<BadgeStatus type="neutral" label="Agenda not published" />}
          className={styles.pageHeader}
          actions={
            <>
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
              {/* ≤1023px: the meeting actions (bottom bar is hidden) move here. */}
              {activeTab === 'meeting' && (
                <span className={styles.headerOverflow}>
                  <ActionMenu
                    ariaLabel="Meeting actions"
                    items={[
                      { key: 'send',   label: 'Send invitations', icon: sendSvg,  onSelect: () => console.log('send invitations') },
                      { key: 'draft',  label: 'Save as draft',     icon: draftSvg, onSelect: () => console.log('save as draft') },
                      { key: 'delete', label: 'Delete',            icon: trashSvg, danger: true, onSelect: () => console.log('delete meeting') },
                    ]}
                  />
                </span>
              )}
            </>
          }
        />

        <Tabs
          tabs={TABS}
          value={activeTab}
          onChange={id => setActiveTab(id as MeetingTab)}
          className={styles.tabsRoot}
        />

        <div className={styles.content}>
          {activeTab === 'meeting' && <MeetingDetailsTab />}
          {activeTab === 'agenda' && <AgendaTab onOpenInBoardBook={openInBoardBook} onViewBoardBook={viewBoardBook} />}
          {activeTab === 'board-book' && (
            <BoardBookViewer initialDocName={boardBookDoc} />
          )}
          {activeTab === 'minutes' && <MinutesTab />}
        </div>
      </main>
    </div>
  )
}
