/* CSBeforeMeetingPage — Figma nodes 2452-7259 (default) & 3891-2647 (participants droplist)
   Corporate-secretary "Before meeting" dashboard state:
   a meeting card with details, RSVP, participants popover and a preparation checklist. */

import { useRef, useState } from 'react'
import { PageHeader } from '../../../components/PageHeader/PageHeader'
import { Avatar } from '../../../components/Avatar/Avatar'
import { BadgeStatus } from '../../../components/BadgeStatus/BadgeStatus'
import { Dropdown } from '../../../components/Dropdown/Dropdown'
import { MeetingDate } from '../../../components/MeetingDate/MeetingDate'
import { users } from '../../../icons/users'
import { actions } from '../../../icons/actions'
import { location } from '../../../icons/location'
import { services } from '../../../icons/services'
import styles from './CSBeforeMeetingPage.module.css'

const userSvg     = users.find(i => i.name === 'user')!.svg
const draftSvg    = actions.find(i => i.name === 'draft-circle')!.svg
const pinSvg      = location.find(i => i.name === 'location-pin-alt')!.svg
const zoomSvg     = services.find(i => i.name === 'zoom-monogram-colored')!.svg

const RSVP_OPTIONS = [
  { value: 'yes-person', label: 'Yes, in person' },
  { value: 'yes-remote', label: 'Yes, remotely' },
  { value: 'maybe',      label: 'Maybe' },
  { value: 'no',         label: 'No' },
]

interface Participant {
  name: string
  initials: string
  src?: string
  status: 'Pending' | 'Yes, in person' | 'Maybe'
}

const PRIMARY: Participant[] = [
  { name: 'Alexander Anderson', initials: 'A', status: 'Pending' },
  { name: 'Brian Rubinstein',   initials: 'B', status: 'Yes, in person' },
  { name: 'Christopher Lee',    initials: 'C', status: 'Maybe' },
  { name: 'Joshua Taylor',      initials: 'J', src: 'https://i.pravatar.cc/64?img=12', status: 'Yes, in person' },
]

const ADDITIONAL: Participant[] = [
  { name: 'Kevin Smith', initials: 'K', status: 'Pending' },
  { name: 'Noah James',  initials: 'N', status: 'Pending' },
]

function Icon({ svg, className }: { svg: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} aria-hidden />
}

function ParticipantRow({ p }: { p: Participant }) {
  return (
    <div className={styles.participant}>
      <Avatar
        size="s"
        type="user"
        variant={p.src ? 'picture' : 'letters'}
        src={p.src}
        initials={p.initials}
        alt={p.name}
      />
      <span className={styles.participantName}>{p.name}</span>
      <span className={styles.participantStatus}>{p.status}</span>
    </div>
  )
}

export default function CSBeforeMeetingPage() {
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [rsvp, setRsvp] = useState('yes-person')
  const closeTimer = useRef<number | undefined>(undefined)

  /* hover to open; small delay on leave so moving onto the popover keeps it open */
  const openParticipants = () => {
    window.clearTimeout(closeTimer.current)
    setParticipantsOpen(true)
  }
  const closeParticipants = () => {
    closeTimer.current = window.setTimeout(() => setParticipantsOpen(false), 120)
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>

        <PageHeader title="Dashboard" />

        <div className={styles.body}>
          <div className={styles.container}>

            <h2 className={styles.greeting}>Hello, Olivia!</h2>

            <div className={styles.card}>

              {/* ── Meeting details ───────────────────────── */}
              <div className={styles.details}>
                <div className={styles.headRow}>
                  <MeetingDate month="Dec" day={29} />
                  <div className={styles.titleBlock}>
                    <h3 className={styles.meetingTitle}>Board of Directors / December 2025</h3>
                    <p className={styles.meetingTime}>
                      11:00 AM – 03:30 PM&nbsp;&nbsp;<span className={styles.muted}>(GMT+6) Chicago</span>
                    </p>
                  </div>
                </div>

                <div className={styles.rsvpRow}>
                  <span className={styles.rsvpLabel}>Going to this meeting?</span>
                  <Dropdown
                    variant="no-border"
                    size="m"
                    value={rsvp}
                    onChange={v => setRsvp(v as string)}
                    options={RSVP_OPTIONS}
                    iconLeft={<Icon svg={userSvg} />}
                  />
                </div>

                <div className={styles.infoRows}>
                  <div
                    className={styles.participantsWrap}
                    onMouseEnter={openParticipants}
                    onMouseLeave={closeParticipants}
                  >
                    <div className={styles.participantsTrigger} aria-expanded={participantsOpen}>
                      <Avatar size="s" type="org" variant="letters" initials="B" alt="Board of directors" />
                      <span className={styles.participantsLabel}>Board of directors <span className={styles.muted}>+2</span></span>
                    </div>

                    {participantsOpen && (
                      <div className={styles.popover} role="dialog" aria-label="Participants">
                        <p className={styles.popoverGroup}>Board of Directors</p>
                        {PRIMARY.map(p => <ParticipantRow key={p.name} p={p} />)}
                        <div className={styles.popoverDivider} />
                        <p className={styles.popoverGroup}>Additional participants</p>
                        {ADDITIONAL.map(p => <ParticipantRow key={p.name} p={p} />)}
                      </div>
                    )}
                  </div>

                  <div className={styles.infoRow}>
                    <Icon svg={zoomSvg} className={styles.zoomIcon} />
                    <a className={styles.linkBrand} href="#" onClick={e => e.preventDefault()}>Join via Zoom</a>
                  </div>

                  <div className={styles.infoRow}>
                    <Icon svg={pinSvg} className={styles.infoIcon} />
                    <a className={styles.linkBrand} href="#" onClick={e => e.preventDefault()}>1535 Broadway, New York, NY, 10036, USA</a>
                  </div>
                </div>
              </div>

              {/* ── Meeting preparation ───────────────────── */}
              <div className={styles.prep}>
                <h4 className={styles.prepTitle}>Meeting preparation</h4>
                <div className={styles.prepRows}>
                  <button type="button" className={styles.prepRow}>
                    <Icon svg={draftSvg} className={styles.prepIcon} />
                    <span className={styles.prepLink}>Agenda in draft</span>
                    <BadgeStatus type="danger" label="Overdue 5 days" />
                  </button>
                  <button type="button" className={styles.prepRow}>
                    <Icon svg={draftSvg} className={styles.prepIcon} />
                    <span className={styles.prepLink}>Board book in draft</span>
                    <span className={styles.muted}>due by 30 Nov</span>
                  </button>
                  <button type="button" className={styles.prepRow}>
                    <Icon svg={draftSvg} className={styles.prepIcon} />
                    <span className={styles.prepLink}>3 document requests not completed</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
