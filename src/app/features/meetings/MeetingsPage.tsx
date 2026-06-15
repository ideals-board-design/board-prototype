/* MeetingsPage — Meeting Creation Form
   Figma: 8I0d6Pc5e5yvKW2Fxhgdrx node 23157-69192 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { PageHeader }   from '../../../components/PageHeader/PageHeader'
import { TextField }    from '../../../components/TextField/TextField'
import { Radio }        from '../../../components/Radio/Radio'
import { Dropdown }     from '../../../components/Dropdown/Dropdown'
import { Button }       from '../../../components/Button/Button'
import { DatePicker }   from '../../../components/DatePicker/DatePicker'
import { Tooltip }      from '../../../components/Tooltip/Tooltip'
import { StickyFooter } from '../../../components/StickyFooter/StickyFooter'
import { dateTime }     from '../../../icons/dateTime'
import { users }        from '../../../icons/users'
import { communication } from '../../../icons/communication'
import { media }        from '../../../icons/media'
import { location }     from '../../../icons/location'
import { editor }       from '../../../icons/editor'
import { actions }      from '../../../icons/actions'
import { condition }    from '../../../icons/condition'
import { functional }   from '../../../icons/functional'
import styles from './MeetingsPage.module.css'

/* ── Icons ──────────────────────────────────────────────────────────────── */

const meetingIconSvg  = communication.find(i => i.name === 'case')!.svg
const starSvg         = functional.find(i => i.name === 'star-filled')!.svg
const calendarSvg     = dateTime.find(i => i.name === 'calender')!.svg
const usersSvg        = users.find(i => i.name === 'users-alt')!.svg
const userSvg         = users.find(i => i.name === 'user')!.svg
const laptopSvg       = media.find(i => i.name === 'laptop')!.svg
const videoSvg        = media.find(i => i.name === 'video')!.svg
const pinSvg         = location.find(i => i.name === 'location-pin-alt')!.svg
const alignLeftSvg   = editor.find(i => i.name === 'align-left')!.svg
const plusSvg        = actions.find(i => i.name === 'plus')!.svg
const maybeSvg       = condition.find(i => i.name === 'exclamation-circle')!.svg
const noSvg          = actions.find(i => i.name === 'close')!.svg
const copySvg        = actions.find(i => i.name === 'copy')!.svg
const closeSvg       = actions.find(i => i.name === 'multiply')!.svg

/* RTF toolbar icons */
const boldSvg        = editor.find(i => i.name === 'bold')!.svg
const italicSvg      = editor.find(i => i.name === 'italic')!.svg
const underlineSvg   = editor.find(i => i.name === 'underline')!.svg
const listUlSvg      = editor.find(i => i.name === 'list-ul')!.svg
const listOlSvg      = editor.find(i => i.name === 'list-ol-alt')!.svg

/* ── Types ───────────────────────────────────────────────────────────────── */

type MeetingType = 'hybrid' | 'in-person' | 'online'

/* ── Time helpers ────────────────────────────────────────────────────────── */

function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function fmtDuration(startMin: number, endMin: number): string {
  const diff = (endMin - startMin) / 60
  return Number.isInteger(diff) ? `${diff}h` : `${diff}h`
}

const ALL_TIMES = Array.from({ length: 48 }, (_, i) => i * 30) // 0..1410 min

/* ── TimePicker dropdown ─────────────────────────────────────────────────── */

function TimePickerDropdown({
  value,
  startRef,
  referenceMinutes,
  showDuration,
  onChange,
  onClose,
}: {
  value: number
  startRef: React.RefObject<HTMLElement>
  referenceMinutes?: number
  showDuration?: boolean
  onChange: (minutes: number) => void
  onClose: () => void
}) {
  const popRef    = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!startRef.current) return
    const r = startRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left })
  }, [startRef])

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popRef.current?.contains(e.target as Node)) return
      if (startRef.current?.contains(e.target as Node)) return
      onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, startRef])

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  /* Scroll selected item into view */
  useEffect(() => {
    const el = popRef.current?.querySelector('[data-selected="true"]') as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [pos])

  const options = showDuration && referenceMinutes !== undefined
    ? ALL_TIMES.filter(t => t > referenceMinutes)
    : ALL_TIMES

  return createPortal(
    <div
      ref={popRef}
      className={styles.timePop}
      style={{ top: pos.top, left: pos.left }}
    >
      {options.map(t => (
        <div
          key={t}
          data-selected={t === value}
          className={`${styles.timeOpt} ${t === value ? styles.timeOptSelected : ''}`}
          onMouseDown={e => { e.preventDefault(); onChange(t); onClose() }}
        >
          <span className={styles.timeOptLabel}>{fmtTime(t)}</span>
          {showDuration && referenceMinutes !== undefined && (
            <span className={styles.timeOptDur}>{fmtDuration(referenceMinutes, t)}</span>
          )}
        </div>
      ))}
    </div>,
    document.body,
  )
}

/* ── Data ────────────────────────────────────────────────────────────────── */

const GROUP_OPTIONS = [
  { value: 'board',   label: 'Board of Directors', avatar: { initials: 'BD', type: 'group' as const, color: 'var(--tag-navyblue)' } },
  { value: 'finance', label: 'Finance Committee',  avatar: { initials: 'FC', type: 'group' as const, color: 'var(--tag-green)'    } },
  { value: 'audit',   label: 'Audit Committee',    avatar: { initials: 'AC', type: 'group' as const, color: 'var(--tag-kepeel)'   } },
  { value: 'exec',    label: 'Executive Team',     avatar: { initials: 'ET', type: 'group' as const, color: 'var(--tag-orange)'   } },
]

/* ── Field row helper ────────────────────────────────────────────────────── */

function FieldRow({ icon, center, top, children }: { icon: string; center?: boolean; top?: boolean; children: React.ReactNode }) {
  const rowCls = [styles.fieldRow, center ? styles.fieldRowCenter : '', top ? styles.fieldRowTop : ''].filter(Boolean).join(' ')
  return (
    <div className={rowCls}>
      <span className={styles.fieldIcon} dangerouslySetInnerHTML={{ __html: icon }} aria-hidden="true" />
      <div className={styles.fieldContent}>{children}</div>
    </div>
  )
}

/* ── Video tool icons (inline SVG as data URIs) ──────────────────────────── */

const TOOL_ICONS_SVG = {
  teams: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14.5 9.5h7.2c.43 0 .8.36.8.8v6.06a3.64 3.64 0 0 1-3.64 3.64 3.64 3.64 0 0 1-3.64-3.64V9.96c0-.25.2-.46.45-.46z" fill="#5059C9"/><circle cx="19.2" cy="5.6" r="2.4" fill="#5059C9"/><circle cx="11.7" cy="4.8" r="3.3" fill="#7B83EB"/><path d="M13.6 9.5H2.4c-.4 0-.73.36-.64.79l1.93 9.2c.14.66.72 1.13 1.39 1.13h5.85c.67 0 1.25-.47 1.39-1.13l1.93-9.2c.09-.43-.24-.79-.64-.79z" fill="#4B53BC"/><path d="M10.6 12.05H4.55v1.3h2.25v6.1h1.55v-6.1h2.25v-1.3z" fill="#fff"/></svg>`)}`,
  zoom:  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="5.4" fill="#0B5CFF"/><path d="M5 9.3c0-.72.58-1.3 1.3-1.3h6.1c.72 0 1.3.58 1.3 1.3v5.4c0 .72-.58 1.3-1.3 1.3H6.3c-.72 0-1.3-.58-1.3-1.3V9.3zm9.7 1.05 3.2-2.33c.28-.2.67 0 .67.34v7.28c0 .34-.39.54-.67.34l-3.2-2.33v-3.3z" fill="#fff"/></svg>`)}`,
}

/* ── Tool selector popup ─────────────────────────────────────────────────── */

function ToolSelectorPopup({
  triggerRef,
  onSelect,
  onClose,
}: {
  triggerRef: React.RefObject<HTMLElement>
  onSelect: (value: string) => void
  onClose: () => void
}) {
  const popRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left })
  }, [triggerRef])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popRef.current?.contains(e.target as Node)) return
      if (triggerRef.current?.contains(e.target as Node)) return
      onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, triggerRef])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const tools = [
    { value: 'teams', label: 'MS Teams', icon: TOOL_ICONS_SVG.teams },
    { value: 'zoom',  label: 'Zoom',     icon: TOOL_ICONS_SVG.zoom  },
  ]

  return createPortal(
    <div ref={popRef} className={styles.toolPop} style={{ top: pos.top, left: pos.left }}>
      {tools.map(t => (
        <div
          key={t.value}
          className={styles.toolOpt}
          onMouseDown={e => { e.preventDefault(); onSelect(t.value); onClose() }}
        >
          <img src={t.icon} alt={t.label} className={styles.toolOptIcon} />
          <span className={styles.toolOptLabel}>{t.label}</span>
        </div>
      ))}
    </div>,
    document.body,
  )
}

/* ── Location suggestions ────────────────────────────────────────────────── */

const LOCATION_SUGGESTIONS = [
  'Chicago Business Center, 211 E. Ontario St, Chicago, IL 60611',
  'The CMP Chicago Business Center, 2600 W 35th St, Chicago, IL 60632',
  'Uptown Business Center, 4619 N Broadway, Chicago, IL 60640',
  'Chicago Loop Office Center, 77 W Wacker Dr, Chicago, IL 60601',
  'River North Business Suites, 350 N Orleans St, Chicago, IL 60654',
  'West Loop Conference Center, 222 W Adams St, Chicago, IL 60606',
]

function LocationPopup({
  suggestions,
  wrapRef,
  onSelect,
  onClose,
}: {
  suggestions: string[]
  wrapRef: React.RefObject<HTMLElement>
  onSelect: (v: string) => void
  onClose: () => void
}) {
  const popRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!wrapRef.current) return
    const r = wrapRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left })
  }, [wrapRef])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popRef.current?.contains(e.target as Node)) return
      if (wrapRef.current?.contains(e.target as Node)) return
      onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, wrapRef])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!suggestions.length) return null

  return createPortal(
    <div ref={popRef} className={styles.locationPop} style={{ top: pos.top, left: pos.left }}>
      {suggestions.map((s, i) => (
        <div
          key={i}
          className={styles.locationOpt}
          onMouseDown={e => { e.preventDefault(); onSelect(s); onClose() }}
        >
          {s}
        </div>
      ))}
    </div>,
    document.body,
  )
}

/* ── Rich Text Editor ────────────────────────────────────────────────────── */

function RichTextEditor({ placeholder }: { placeholder: string }) {
  const [focused, setFocused] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const editorRef = useRef<HTMLDivElement>(null)

  const updateActiveFormats = () => {
    const formats = new Set<string>()
    if (document.queryCommandState('bold'))        formats.add('bold')
    if (document.queryCommandState('italic'))      formats.add('italic')
    if (document.queryCommandState('underline'))   formats.add('underline')
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul')
    if (document.queryCommandState('insertOrderedList'))   formats.add('ol')
    setActiveFormats(formats)
  }

  const execCmd = (cmd: string, e: React.MouseEvent) => {
    e.preventDefault()
    editorRef.current?.focus()
    document.execCommand(cmd, false)
    updateActiveFormats()
  }

  const isEmpty = () => {
    const text = editorRef.current?.textContent ?? ''
    return text.trim() === ''
  }

  const TOOLBAR_BTNS = [
    { cmd: 'bold',                key: 'bold',   svg: boldSvg },
    { cmd: 'italic',              key: 'italic', svg: italicSvg },
    { cmd: 'underline',           key: 'underline', svg: underlineSvg },
    { cmd: 'insertUnorderedList', key: 'ul',     svg: listUlSvg },
    { cmd: 'insertOrderedList',   key: 'ol',     svg: listOlSvg },
  ]

  return (
    <div className={`${styles.rtfWrap} ${focused ? styles.rtfFocused : ''}`}>
      {focused && (
        <div className={styles.rtfToolbar}>
          {TOOLBAR_BTNS.map(btn => (
            <button
              key={btn.key}
              type="button"
              className={`${styles.rtfToolBtn} ${activeFormats.has(btn.key) ? styles.rtfToolBtnActive : ''}`}
              onMouseDown={e => execCmd(btn.cmd, e)}
              tabIndex={-1}
            >
              <span className={styles.rtfToolIcon} dangerouslySetInnerHTML={{ __html: btn.svg }} />
            </button>
          ))}
        </div>
      )}
      <div
        ref={editorRef}
        className={styles.rtfEditor}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); updateActiveFormats() }}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        data-placeholder={placeholder}
      />
    </div>
  )
}

/* ── Invitation preview ──────────────────────────────────────────────────── */

function InvitationPreview({
  name,
  meetingType,
  meetingDate,
  startMin,
  endMin,
}: {
  name:        string
  meetingType: MeetingType
  meetingDate: Date | null
  startMin:    number
  endMin:      number
}) {
  const displayName = name.trim() || 'Board of Directors / March 2025'
  const typeLabel   = meetingType === 'hybrid' ? 'hybrid' : meetingType === 'in-person' ? 'in-person' : 'online'

  const dateStr     = meetingDate
    ? meetingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'March 27, 2025'
  const monthStr    = meetingDate
    ? meetingDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    : 'MAR'
  const dayStr      = meetingDate ? String(meetingDate.getDate()) : '27'
  const timeRange   = `${fmtTime(startMin)} – ${fmtTime(endMin)}`
  const durMin      = endMin - startMin
  const durHr       = Math.floor(durMin / 60)
  const durRem      = durMin % 60
  const durStr      = durRem > 0 ? `${durHr}hr ${durRem}min` : `${durHr}hr`

  return (
    <div className={styles.preview}>

      <p className={styles.previewSubject}>
        Invitation: {displayName} @ {dateStr}, {timeRange} (GMT+6)
      </p>
      <p className={styles.previewSender}>Ideals Board &lt;info@idealsboard.com&gt;</p>

      <div className={styles.inviteCard}>

        {/* Org branding */}
        <div className={styles.inviteCardTop}>
          <div className={styles.inviteOrgLogo}>
            <span dangerouslySetInnerHTML={{ __html: starSvg }} />
          </div>
          <div className={styles.inviteOrgName}>
            <span>STAR</span>
            <span>Enterprises</span>
          </div>
        </div>

        {/* Green accent */}
        <div className={styles.inviteAccentLine} />

        {/* Content */}
        <div className={styles.inviteCardBody}>

          <h2 className={styles.inviteTitle}>You have been invited to a meeting</h2>
          <p className={styles.inviteDesc}>
            Olivia Thompson invited you to a {typeLabel} meeting.
          </p>

          {/* Date row */}
          <div className={styles.inviteDateRow}>
            <div className={styles.inviteDateBadge}>
              <span className={styles.inviteDateMonth}>{monthStr}</span>
              <span className={styles.inviteDateDay}>{dayStr}</span>
            </div>
            <div className={styles.inviteDateInfo}>
              <p className={styles.inviteDateName}>{displayName}</p>
              <p className={styles.inviteDateMeta}>{fmtTime(startMin)} - {fmtTime(endMin)}&nbsp;&nbsp;(GMT+6)&nbsp;&nbsp;{durStr}</p>
            </div>
          </div>

          {/* RSVP */}
          <p className={styles.rsvpQuestion}>Going to this meeting?</p>
          <div className={styles.rsvpButtons}>
            <button type="button" className={styles.rsvpBtn}>
              <span className={styles.rsvpBtnIcon} dangerouslySetInnerHTML={{ __html: userSvg }} />
              Yes, in person
            </button>
            <button type="button" className={styles.rsvpBtn}>
              <span className={styles.rsvpBtnIcon} dangerouslySetInnerHTML={{ __html: videoSvg }} />
              Yes, online
            </button>
            <button type="button" className={`${styles.rsvpBtn} ${styles.rsvpBtnMaybe}`}>
              <span className={`${styles.rsvpBtnIcon}`} dangerouslySetInnerHTML={{ __html: maybeSvg }} />
              Maybe
            </button>
            <button type="button" className={`${styles.rsvpBtn} ${styles.rsvpBtnNo}`}>
              <span className={`${styles.rsvpBtnIcon}`} dangerouslySetInnerHTML={{ __html: noSvg }} />
              No
            </button>
          </div>

          {/* Details */}
          <div className={styles.inviteDetails}>
            <p className={styles.inviteDetailsTitle}>Details</p>
            <p className={styles.inviteDetailsText}>Any extra details and context for the meeting</p>
          </div>

        </div>
      </div>

    </div>
  )
}

/* ── Page component ──────────────────────────────────────────────────────── */

export default function MeetingsPage() {
  const [meetingName, setMeetingName] = useState('')
  const [meetingType, setMeetingType] = useState<MeetingType>('hybrid')
  const [group,       setGroup]       = useState('')
  const [meetingDate, setMeetingDate] = useState<Date | null>(new Date(2025, 2, 27))
  const [startMin,    setStartMin]    = useState(600)   // 10:00
  const [endMin,      setEndMin]      = useState(930)   // 15:30
  const [openPicker,  setOpenPicker]  = useState<'start' | 'end' | null>(null)
  const startTriggerRef = useRef<HTMLSpanElement>(null)
  const endTriggerRef   = useRef<HTMLSpanElement>(null)
  const closeStart = useCallback(() => setOpenPicker(null), [])
  const closeEnd   = useCallback(() => setOpenPicker(null), [])
  const [videoLink,   setVideoLink]   = useState('')
  const [videoTool,   setVideoTool]   = useState('')
  const [videoToolOpen, setVideoToolOpen] = useState(false)
  const videoTriggerRef = useRef<HTMLDivElement>(null)
  const closeVideoTool  = useCallback(() => setVideoToolOpen(false), [])

  const TOOL_LABELS: Record<string, string> = { teams: 'MS Teams', zoom: 'Zoom' }
  const TOOL_ICONS: Record<string, string> = TOOL_ICONS_SVG
  const [locationVal,      setLocationVal]      = useState('')
  const [locationSelected, setLocationSelected] = useState(false)
  const [locationOpen,     setLocationOpen]     = useState(false)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const locationWrapRef  = useRef<HTMLDivElement>(null)

  return (
    <div className={styles.page}>

      <div className={styles.body}>

        {/* ── Form column ───────────────────────────────────────────────── */}
        <div className={styles.formCol}>

          <PageHeader title="New meeting" onBack={() => console.log('back')} />

          <div className={styles.form}>

            {/* Meeting name */}
            <FieldRow icon={meetingIconSvg}>
              <TextField
                variant="no-border"
                size="m"
                placeholder="Add meeting name"
                value={meetingName}
                onChange={e => setMeetingName(e.target.value)}
              />
            </FieldRow>

            {/* Meeting type */}
            <FieldRow icon={laptopSvg}>
              <div className={styles.meetingTypeContent}>
                <span className={styles.meetingTypeLabel}>Meeting type</span>
                <div className={styles.radioGroup} role="radiogroup" aria-label="Meeting type">
                  <Radio name="meeting-type" value="hybrid"    label="Hybrid"    checked={meetingType === 'hybrid'}    onChange={() => setMeetingType('hybrid')} />
                  <Radio name="meeting-type" value="in-person" label="In-person" checked={meetingType === 'in-person'} onChange={() => setMeetingType('in-person')} />
                  <Radio name="meeting-type" value="online"    label="Online"    checked={meetingType === 'online'}    onChange={() => setMeetingType('online')} />
                </div>
              </div>
            </FieldRow>

            {/* Group */}
            <div className={styles.groupBlock}>
              <FieldRow icon={usersSvg} center>
                <Dropdown
                  variant="no-border"
                  size="m"
                  options={GROUP_OPTIONS}
                  value={group}
                  onChange={v => setGroup(v as string)}
                  placeholder="Choose group"
                  clearable
                  className={styles.fillField}
                />
              </FieldRow>
              {group && (
                <div className={styles.subRow}>
                  <button type="button" className={styles.addToCalendar}>
                    <span className={styles.calendarPlusIcon} dangerouslySetInnerHTML={{ __html: plusSvg }} aria-hidden="true" />
                    Add participants
                  </button>
                </div>
              )}
            </div>

            {/* Date & time */}
            <FieldRow icon={calendarSvg}>
              <div className={styles.dateBlock}>
                <DatePicker
                  variant="no-border"
                  size="m"
                  value={meetingDate}
                  onChange={setMeetingDate}
                  formatValue={d => d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  placeholder="Select date"
                  className={styles.datePicker}
                />
                <div className={styles.timeRow}>
                  <span
                    ref={startTriggerRef}
                    className={`${styles.timeText} ${openPicker === 'start' ? styles.timeTextOpen : ''}`}
                    onClick={() => setOpenPicker(p => p === 'start' ? null : 'start')}
                  >{fmtTime(startMin)}</span>
                  <span className={styles.timeSeparator}>–</span>
                  <span
                    ref={endTriggerRef}
                    className={`${styles.timeText} ${openPicker === 'end' ? styles.timeTextOpen : ''}`}
                    onClick={() => setOpenPicker(p => p === 'end' ? null : 'end')}
                  >{fmtTime(endMin)}</span>
                  <span className={styles.timezoneText}>(GMT+6) Chicago</span>
                </div>
                {openPicker === 'start' && (
                  <TimePickerDropdown
                    value={startMin}
                    startRef={startTriggerRef}
                    onChange={v => { setStartMin(v); if (v >= endMin) setEndMin(v + 30) }}
                    onClose={closeStart}
                  />
                )}
                {openPicker === 'end' && (
                  <TimePickerDropdown
                    value={endMin}
                    startRef={endTriggerRef}
                    referenceMinutes={startMin}
                    showDuration
                    onChange={setEndMin}
                    onClose={closeEnd}
                  />
                )}
                <button type="button" className={styles.addToCalendar}>
                  <span className={styles.calendarPlusIcon} dangerouslySetInnerHTML={{ __html: plusSvg }} aria-hidden="true" />
                  Add to calendar
                </button>
              </div>
            </FieldRow>

            {/* Video / link */}
            <FieldRow icon={videoSvg} center>
              {videoTool ? (
                <div className={styles.toolFilled}>
                  <img src={TOOL_ICONS[videoTool]} alt={TOOL_LABELS[videoTool]} className={styles.toolTriggerIcon} />
                  <span className={styles.toolLink}>{TOOL_LABELS[videoTool]}</span>
                  <div className={styles.toolActions}>
                    <Tooltip label="Copy" position="top">
                      <button type="button" className={styles.toolActionBtn} aria-label="Copy link" onClick={e => e.preventDefault()}>
                        <span className={styles.toolActionIcon} dangerouslySetInnerHTML={{ __html: copySvg }} />
                      </button>
                    </Tooltip>
                    <Tooltip label="Clear" position="top">
                      <button type="button" className={styles.toolActionBtn} aria-label="Clear link" onClick={() => setVideoTool('')}>
                        <span className={styles.toolActionIcon} dangerouslySetInnerHTML={{ __html: closeSvg }} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              ) : (
                <div ref={videoTriggerRef} className={styles.toolTrigger} onClick={() => setVideoToolOpen(o => !o)}>
                  <span className={styles.toolTriggerPlaceholder}>Select tool or add link</span>
                </div>
              )}
              {videoToolOpen && (
                <ToolSelectorPopup
                  triggerRef={videoTriggerRef}
                  onSelect={v => setVideoTool(v)}
                  onClose={closeVideoTool}
                />
              )}
            </FieldRow>

            {/* Location */}
            <FieldRow icon={pinSvg}>
              <div ref={locationWrapRef} className={styles.locationWrap}>
                {locationSelected ? (
                  <div className={styles.locationChip}>
                    <span
                      className={styles.locationChipText}
                      onClick={() => { setLocationSelected(false); setTimeout(() => locationInputRef.current?.focus(), 0) }}
                    >{locationVal}</span>
                    <div className={styles.locationChipActions}>
                      <Tooltip label="Copy" position="top">
                        <button
                          type="button"
                          className={styles.locationChipRemove}
                          onClick={e => { e.preventDefault(); navigator.clipboard?.writeText(locationVal) }}
                          aria-label="Copy location"
                        >
                          <span className={styles.locationChipRemoveIcon} dangerouslySetInnerHTML={{ __html: copySvg }} />
                        </button>
                      </Tooltip>
                      <Tooltip label="Clear" position="top">
                        <button
                          type="button"
                          className={styles.locationChipRemove}
                          onClick={() => { setLocationVal(''); setLocationSelected(false) }}
                          aria-label="Clear location"
                        >
                          <span className={styles.locationChipRemoveIcon} dangerouslySetInnerHTML={{ __html: closeSvg }} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      ref={locationInputRef}
                      className={styles.locationInput}
                      placeholder="Add location"
                      value={locationVal}
                      onChange={e => {
                        setLocationVal(e.target.value)
                        setLocationOpen(e.target.value.length > 0)
                      }}
                      onFocus={() => { if (locationVal.length > 0) setLocationOpen(true) }}
                      onBlur={() => setTimeout(() => {
                        setLocationOpen(false)
                        if (locationVal.trim()) setLocationSelected(true)
                      }, 150)}
                    />
                    {locationOpen && (
                      <LocationPopup
                        suggestions={LOCATION_SUGGESTIONS.filter(s =>
                          s.toLowerCase().includes(locationVal.toLowerCase())
                        )}
                        wrapRef={locationWrapRef}
                        onSelect={v => { setLocationVal(v); setLocationSelected(true); setLocationOpen(false) }}
                        onClose={() => setLocationOpen(false)}
                      />
                    )}
                  </>
                )}
              </div>
            </FieldRow>

            {/* Description — RTF */}
            <FieldRow icon={alignLeftSvg}>
              <RichTextEditor placeholder="Add description" />
            </FieldRow>

          </div>
        </div>

        {/* ── Vertical divider ──────────────────────────────────────────── */}
        <div className={styles.panelDivider} aria-hidden="true" />

        {/* ── Invitation preview ────────────────────────────────────────── */}
        <InvitationPreview name={meetingName} meetingType={meetingType} meetingDate={meetingDate} startMin={startMin} endMin={endMin} />

      </div>

      {/* ── Sticky footer ─────────────────────────────────────────────────── */}
      <StickyFooter
        variant="page"
        left={
          <>
            <Button variant="primary"   size="m">Publish meeting</Button>
            <Button variant="secondary" intent="neutral" size="m">Save as draft</Button>
          </>
        }
      />

    </div>
  )
}
