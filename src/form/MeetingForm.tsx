/* Meeting details — prototype demonstrating the hover-fill system applied to a
   real form built entirely from DS components. Figma 35584:22382 / 35585:23155. */

import { useState, type ReactNode } from 'react'
import styles from './MeetingForm.module.css'

import { TextField } from '../components/TextField/TextField'
import { TextEditor } from '../components/TextEditor/TextEditor'
import { Autocomplete } from '../components/Autocomplete/Autocomplete'
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

const PHOTO_1 = new URL('../assets/user-profile-pic-1.png', import.meta.url).href
const PHOTO_2 = new URL('../assets/user-profile-pic-2.png', import.meta.url).href

/* Time options — every 30 min, 8:00 AM → 6:00 PM */
const TIME_OPTIONS = (() => {
  const out: { value: string; label: string }[] = []
  for (let h = 8; h <= 18; h++) {
    for (const m of ['00', '30']) {
      const ampm = h < 12 ? 'AM' : 'PM'
      const hr = h % 12 === 0 ? 12 : h % 12
      const t = `${String(hr).padStart(2, '0')}:${m} ${ampm}`
      out.push({ value: t, label: t })
    }
  }
  return out
})()

const PEOPLE_OPTIONS = [
  { value: 'sarah',  label: 'Sarah Mitchell' },
  { value: 'james',  label: 'James Carter' },
  { value: 'aisha',  label: 'Aisha Khan' },
  { value: 'diego',  label: 'Diego Romero' },
]

function Icon({ svg }: { svg: string }) {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
}

/* Form row: 20px left icon + content. `center` vertically centers the icon on a
   24px avatar row. */
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

type Participant = { id: string; name: string; kind: 'group' | 'guest'; initials?: string; photo?: string }

export default function MeetingForm() {
  const [title, setTitle]             = useState('Board of Directors / March 2025')
  const [meetingType, setMeetingType] = useState<'hybrid' | 'in-person' | 'online'>('hybrid')
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'group',   name: 'Board of Directors', kind: 'group', initials: 'B' },
    { id: 'colin',   name: 'Colin Darrans',      kind: 'guest', photo: PHOTO_1 },
    { id: 'michael', name: 'Michael Donaldson',  kind: 'guest', photo: PHOTO_2 },
  ])
  const [date, setDate]           = useState<Date | null>(new Date(2025, 2, 27))
  const [startTime, setStartTime] = useState('10:00 AM')
  const [endTime, setEndTime]     = useState('03:30 PM')
  const [hasCalendar, setHasCalendar] = useState(true)
  const [hasZoom, setHasZoom]         = useState(true)
  const [hasLocation, setHasLocation] = useState(true)
  const [location, setLocation]   = useState('Chicago Business Center, 211 E. Ontario St, Chicago, IL 60611')
  const [description, setDescription] = useState(
    'The agenda, financial reports, and presentation slides will be available in the Board portal from March 1, 2026. Please review them in advance.',
  )

  const [newParticipant, setNewParticipant] = useState('')

  const removeParticipant = (id: string) => setParticipants(prev => prev.filter(p => p.id !== id))
  const addParticipant = (val: string) => {
    const opt = PEOPLE_OPTIONS.find(o => o.value === val)
    if (!opt) return
    const initials = opt.label.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    setParticipants(prev => [...prev, { id: `${val}-${prev.length}`, name: opt.label, kind: 'guest', initials }])
    setNewParticipant('')
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
          <TextField variant="no-border" value={title} onChange={e => setTitle(e.target.value)} placeholder="Meeting name" aria-label="Meeting name" />
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

        {/* Participants */}
        <Row icon={usersSvg} center>
          {participants.map(p => (
            <div key={p.id} className={styles.hoverRow}>
              <Avatar size="s" type={p.kind === 'group' ? 'group' : 'user'} variant={p.photo ? 'picture' : 'letters'} src={p.photo} initials={p.initials} alt={p.name} />
              <span className={styles.itemName}>
                {p.name}{p.kind === 'guest' && <span className={styles.muted}> (guest)</span>}
              </span>
              <span className={styles.rowActions}>
                <IconBtn svg={closeSvg} label="Remove" onClick={() => removeParticipant(p.id)} />
              </span>
            </div>
          ))}
          <Autocomplete variant="no-border" options={PEOPLE_OPTIONS} value={newParticipant} onChange={addParticipant} placeholder="Add participants" aria-label="Add participants" />
        </Row>

        {/* Date, time, calendar */}
        <Row icon={calendarSvg}>
          <DatePicker variant="no-border" format="long" value={date} onChange={setDate} aria-label="Date" />
          <div className={styles.timeRow}>
            <Autocomplete variant="no-border" className={styles.hugField} options={TIME_OPTIONS} value={startTime} onChange={setStartTime} aria-label="Start time" />
            <span className={styles.sep}>–</span>
            <Autocomplete variant="no-border" className={styles.hugField} options={TIME_OPTIONS} value={endTime} onChange={setEndTime} aria-label="End time" />
            <Button variant="tertiary" intent="neutral" className={styles.tzButton}>(GMT+6) Chicago</Button>
          </div>
          {hasCalendar && (
            <div className={styles.hoverRow}>
              <span className={styles.brandIcon} dangerouslySetInnerHTML={{ __html: gcalSvg }} aria-hidden="true" />
              <span className={styles.itemName}>Google calendar</span>
              <span className={styles.rowActions}>
                <IconBtn svg={closeSvg} label="Remove" onClick={() => setHasCalendar(false)} />
              </span>
            </div>
          )}
        </Row>

        {/* Video conference */}
        {hasZoom && (
          <Row icon={videoSvg}>
            <div className={styles.hoverRow}>
              <span className={styles.brandIcon} dangerouslySetInnerHTML={{ __html: zoomSvg }} aria-hidden="true" />
              <a className={styles.link} href="#" onClick={e => e.preventDefault()}>Join with Zoom</a>
              <span className={styles.itemFill} />
              <span className={styles.rowActions}>
                <IconBtn svg={copySvg}  label="Copy link" onClick={() => copy('Join with Zoom')} />
                <IconBtn svg={closeSvg} label="Remove" onClick={() => setHasZoom(false)} />
              </span>
            </div>
          </Row>
        )}

        {/* Location — same hover pattern as the video row (row fill + actions at end) */}
        {hasLocation && (
          <Row icon={locationSvg}>
            <div className={`${styles.hoverRow} ${styles.locationRow}`}>
              <TextField
                variant="no-border"
                className={styles.locationInput}
                value={location}
                onChange={e => setLocation(e.target.value)}
                aria-label="Location"
              />
              <span className={styles.rowActions}>
                <IconBtn svg={copySvg}  label="Copy location" onClick={() => copy(location)} />
                <IconBtn svg={closeSvg} label="Remove" onClick={() => setHasLocation(false)} />
              </span>
            </div>
          </Row>
        )}

        {/* Description */}
        <Row icon={paragraphSvg}>
          <TextEditor variant="no-border" toolbar={false} value={description} onChange={e => setDescription(e.target.value)} placeholder="Add description" aria-label="Description" />
        </Row>

      </form>
    </div>
  )
}
