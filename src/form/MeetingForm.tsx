/* Meeting details — prototype. Default (new-meeting) state: meeting type, date and
   time are pre-filled; everything else starts empty with a placeholder the user
   fills in. Figma default 35595:23590 / filled 35584:22382. */

import { useState, type ReactNode } from 'react'
import styles from './MeetingForm.module.css'

import { TextField } from '../components/TextField/TextField'
import { TextEditor } from '../components/TextEditor/TextEditor'
import { Autocomplete } from '../components/Autocomplete/Autocomplete'
import { Dropdown } from '../components/Dropdown/Dropdown'
import { TimeField } from '../components/TimeField/TimeField'
import { Radio } from '../components/Radio/Radio'
import { Avatar } from '../components/Avatar/Avatar'
import { DatePicker } from '../components/DatePicker/DatePicker'
import { Button } from '../components/Button/Button'
import { Tooltip } from '../components/Tooltip/Tooltip'

import { communication } from '../icons/communication'
import { navigation } from '../icons/navigation'
import { users } from '../icons/users'
import { dateTime } from '../icons/dateTime'
import { media } from '../icons/media'
import { location as locationIcons } from '../icons/location'
import { condition } from '../icons/condition'
import { actions } from '../icons/actions'
import { services } from '../icons/services'

/* ── Icons ───────────────────────────────────────── */
const caseSvg      = communication.find(i => i.name === 'case')!.svg
const meetingsSvg  = navigation.find(i => i.name === 'meetings-default')!.svg
const usersSvg     = users.find(i => i.name === 'user')!.svg
const calendarSvg  = dateTime.find(i => i.name === 'calender')!.svg
const videoSvg     = media.find(i => i.name === 'video')!.svg
const locationSvg  = locationIcons.find(i => i.name === 'location-pin-alt')!.svg
const paragraphSvg = condition.find(i => i.name === 'paragraph')!.svg
const copySvg      = actions.find(i => i.name === 'copy')!.svg
const closeSvg     = actions.find(i => i.name === 'multiply')!.svg
const gcalSvg      = services.find(i => i.name === 'google-calendar-colored')!.svg
const zoomSvg      = services.find(i => i.name === 'zoom-monogram-colored')!.svg
const teamsSvg     = services.find(i => i.name === 'ms-team-colored')!.svg
const outlookSvg   = services.find(i => i.name === 'ms-oulook-colored')!.svg

const GROUP_OPTIONS = [
  { value: 'audit',   label: 'Audit Committee',    avatar: { initials: 'A', type: 'group' as const, color: 'var(--red-500)' } },
  { value: 'board',   label: 'Board of Directors', avatar: { initials: 'B', type: 'group' as const, color: 'var(--green-500)' } },
  { value: 'finance', label: 'Finance Committee',  avatar: { initials: 'F', type: 'group' as const, color: 'var(--blue-500)' } },
]

const LOCATION_OPTIONS = [
  { value: 'Chicago Business Center, 211 E. Ontario St, Chicago, IL 60611', label: 'Chicago Business Center, 211 E. Ontario St, Chicago, IL 60611' },
  { value: 'Headquarters — 500 W. Madison St, Chicago, IL 60661',            label: 'Headquarters — 500 W. Madison St, Chicago, IL 60661' },
  { value: 'Board Room — 12th Floor',                                        label: 'Board Room — 12th Floor' },
  { value: 'Conference Room A — 4th Floor',                                  label: 'Conference Room A — 4th Floor' },
]

const PEOPLE_OPTIONS = [
  { value: 'charles', label: 'Charles Jackson',   avatar: { initials: 'CJ', type: 'user' as const } },
  { value: 'colin',   label: 'Colin Darrans',     avatar: { initials: 'CD', type: 'user' as const } },
  { value: 'jameson', label: 'Jameson Cheryl',    avatar: { initials: 'JC', type: 'user' as const } },
  { value: 'joshua',  label: 'Joshua Taylor',     avatar: { initials: 'JT', type: 'user' as const } },
  { value: 'kevin',   label: 'Kevin Smith',       avatar: { initials: 'KS', type: 'user' as const } },
  { value: 'logan',   label: 'Logan White',       avatar: { initials: 'LW', type: 'user' as const } },
  { value: 'michael', label: 'Michael Donaldson', avatar: { initials: 'MD', type: 'user' as const } },
  { value: 'olivia',  label: 'Olivia Thompson',   avatar: { initials: 'OT', type: 'user' as const } },
  { value: 'william', label: 'William Parker',    avatar: { initials: 'WP', type: 'user' as const } },
]

function Icon({ svg }: { svg: string }) {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
}

/* Conferencing tools — pick from the list or type a custom link */
const TOOL_OPTIONS = [
  { value: 'teams', label: 'MS Teams', icon: <Icon svg={teamsSvg} />, svg: teamsSvg },
  { value: 'zoom',  label: 'Zoom',     icon: <Icon svg={zoomSvg} />,  svg: zoomSvg },
]
/* Calendars — select from the list */
const CAL_OPTIONS = [
  { value: 'outlook', label: 'Outlook',         icon: <Icon svg={outlookSvg} />, svg: outlookSvg },
  { value: 'gcal',    label: 'Google calendar', icon: <Icon svg={gcalSvg} />,    svg: gcalSvg },
]

function Row({ icon, center, children }: { icon: string; center?: boolean; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <span
        className={`${styles.railIcon} ${center ? styles.railIconCenter : ''}`.trim()}
        dangerouslySetInnerHTML={{ __html: icon }}
        aria-hidden="true"
      />
      <div className={styles.rowContent}>{children}</div>
    </div>
  )
}

export default function MeetingForm() {
  /* Pre-filled defaults */
  const [meetingType, setMeetingType] = useState<'hybrid' | 'in-person' | 'online'>('hybrid')
  const [date, setDate]           = useState<Date | null>(new Date(2025, 2, 27))
  const [startTime, setStartTime] = useState('10:00 AM')
  const [endTime, setEndTime]     = useState('03:30 PM')

  /* Empty — filled by the user */
  const [title, setTitle]       = useState('')
  const [group, setGroup]       = useState<{ name: string; initials: string; color: string } | null>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const [calendar, setCalendar] = useState<{ name: string; svg: string } | null>(null)
  const [video, setVideo]       = useState<{ label: string; svg?: string } | null>(null)
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')

  const selectGroup = (val: string) => {
    const opt = GROUP_OPTIONS.find(o => o.value === val)
    if (opt) setGroup({ name: opt.label, initials: opt.avatar.initials, color: opt.avatar.color })
  }
  const selectTool = (val: string) => {
    const t = TOOL_OPTIONS.find(o => o.value === val)
    if (t) setVideo({ label: `Join with ${t.label}`, svg: t.svg })
    else if (val.trim()) setVideo({ label: val.trim() })   // custom link
  }
  const selectCalendar = (val: string) => {
    const c = CAL_OPTIONS.find(o => o.value === val)
    if (c) setCalendar({ name: c.label, svg: c.svg })
  }
  const copy = (text: string) => { navigator.clipboard?.writeText(text) }

  const IconBtn = ({ svg, label, onClick }: { svg: string; label: string; onClick?: () => void }) => (
    <Tooltip label={label} position="top">
      <Button variant="tertiary" intent="neutral" iconOnly={<Icon svg={svg} />} aria-label={label} onClick={onClick} />
    </Tooltip>
  )

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={e => e.preventDefault()}>

        {/* Title */}
        <Row icon={caseSvg}>
          <TextField variant="no-border" value={title} onChange={e => setTitle(e.target.value)} placeholder="Add meeting name" aria-label="Meeting name" />
        </Row>

        {/* Meeting type */}
        <Row icon={meetingsSvg}>
          <span className={styles.fieldLabel}>Meeting type</span>
          <div className={styles.radioGroup}>
            <Radio name="mtype" checked={meetingType === 'hybrid'}    onChange={() => setMeetingType('hybrid')}    label="Hybrid" />
            <Radio name="mtype" checked={meetingType === 'in-person'} onChange={() => setMeetingType('in-person')} label="In-person" />
            <Radio name="mtype" checked={meetingType === 'online'}    onChange={() => setMeetingType('online')}    label="Online" />
          </div>
        </Row>

        {/* Participants — "Add participants" only appears once a group is chosen */}
        <Row icon={usersSvg} center={!!group}>
          {group ? (
            <>
              <div className={styles.hoverRow}>
                <Avatar size="s" type="group" variant="letters" initials={group.initials} tint={group.color} alt={group.name} />
                <span className={styles.itemName}>{group.name}</span>
                <span className={styles.rowActions}>
                  <IconBtn svg={closeSvg} label="Remove" onClick={() => setGroup(null)} />
                </span>
              </div>
              {participants.map(val => {
                const p = PEOPLE_OPTIONS.find(o => o.value === val)
                if (!p) return null
                return (
                  <div key={val} className={styles.hoverRow}>
                    <Avatar size="s" type="user" variant="letters" initials={p.avatar.initials} alt={p.label} />
                    <span className={styles.itemName}>{p.label} <span className={styles.muted}>(guest)</span></span>
                    <span className={styles.rowActions}>
                      <IconBtn svg={closeSvg} label="Remove" onClick={() => setParticipants(ps => ps.filter(v => v !== val))} />
                    </span>
                  </div>
                )
              })}
              <Autocomplete variant="no-border" multiple className={styles.fullField} options={PEOPLE_OPTIONS} value={participants} onChange={v => setParticipants(v as string[])} placeholder="Add participants" aria-label="Add participants" />
            </>
          ) : (
            <Autocomplete variant="no-border" className={styles.fullField} options={GROUP_OPTIONS} value="" onChange={v => selectGroup(v as string)} placeholder="Choose group" aria-label="Choose group" />
          )}
        </Row>

        {/* Date, time, calendar */}
        <Row icon={calendarSvg}>
          <DatePicker variant="no-border" format="long" value={date} onChange={setDate} placeholder="M/DD/YYYY" aria-label="Date" />
          <div className={styles.timeRow}>
            <TimeField variant="no-border" value={startTime} onChange={setStartTime} aria-label="Start time" />
            <span className={styles.sep}>–</span>
            <TimeField variant="no-border" value={endTime} onChange={setEndTime} aria-label="End time" />
            <Button variant="tertiary" intent="neutral" className={styles.tzButton}>(GMT+6) Chicago</Button>
          </div>
          {calendar ? (
            <div className={styles.hoverRow}>
              <span className={styles.brandIcon} dangerouslySetInnerHTML={{ __html: calendar.svg }} aria-hidden="true" />
              <span className={styles.itemName}>{calendar.name}</span>
              <span className={styles.rowActions}>
                <IconBtn svg={closeSvg} label="Remove" onClick={() => setCalendar(null)} />
              </span>
            </div>
          ) : (
            <Dropdown variant="no-border" options={CAL_OPTIONS} value="" onChange={v => selectCalendar(v as string)} placeholder="Add to calendar" />
          )}
        </Row>

        {/* Video conference */}
        <Row icon={videoSvg}>
          {video ? (
            <div className={styles.hoverRow}>
              {video.svg && <span className={styles.brandIcon} dangerouslySetInnerHTML={{ __html: video.svg }} aria-hidden="true" />}
              <Button variant="link" external href="#" onClick={e => e.preventDefault()}>{video.label}</Button>
              <span className={styles.rowActions}>
                <IconBtn svg={copySvg}  label="Copy link" onClick={() => copy(video.label)} />
                <IconBtn svg={closeSvg} label="Remove" onClick={() => setVideo(null)} />
              </span>
            </div>
          ) : (
            <Autocomplete variant="no-border" allowCustomValue className={styles.fullField} options={TOOL_OPTIONS} value="" onChange={v => selectTool(v as string)} placeholder="Select tool or add link" aria-label="Select tool or add link" />
          )}
        </Row>

        {/* Location */}
        <Row icon={locationSvg}>
          <div className={`${styles.hoverRow} ${styles.locationRow}`}>
            <Autocomplete variant="no-border" allowCustomValue className={`${styles.locationInput} ${styles.fullField}`} options={LOCATION_OPTIONS} value={location} onChange={v => setLocation(v as string)} placeholder="Add location" aria-label="Location" />
            {location && (
              <span className={styles.rowActions}>
                <IconBtn svg={copySvg}  label="Copy location" onClick={() => copy(location)} />
                <IconBtn svg={closeSvg} label="Remove" onClick={() => setLocation('')} />
              </span>
            )}
          </div>
        </Row>

        {/* Description */}
        <Row icon={paragraphSvg}>
          <TextEditor variant="no-border" toolbar={false} value={description} onChange={e => setDescription(e.target.value)} placeholder="Add description" aria-label="Description" />
        </Row>

      </form>
    </div>
  )
}
