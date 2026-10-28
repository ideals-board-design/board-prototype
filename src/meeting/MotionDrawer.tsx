/* MotionDrawer — "Motion" / "Add motion" drawer (Figma Meetings
   18636-58546 "Voting": Add motion, Start voting, Vote in progress, Delete,
   Copy results).

   The drawer title is fixed ("Add motion" / "Motion"); the motion text lives
   in the body (a text area until voting starts, then plain text), so long
   motions read in full.

   One drawer for the whole lifecycle:
     • New (Figma 31749-410813) — no status yet: motion text, Moved by /
       Seconded by pickers (seconder: voters only, never the mover) and the
       voter list. Footer: only "Create".
     • Draft (Figma 18636-58889) — created; status "Draft". Footer: "All for" ·
       "Start vote" (proposer / seconder are optional) · delete.
     • In progress — counts for For / Against / Abstain / Pending, a per-member
       Vote dropdown the secretary records votes with (marked "Entered by
       secretary"; changing a member's own vote says they'll be notified).
       Footer: "End vote" (asks first while votes are still pending) · delete.
     • Completed — results are locked (Pending reads "Did not vote"). Footer
       "Copy results" · "Reset" (asks first, unlocks) · delete (asks first).

   Voter list: "Voters (n)" then "Absent voters (n)" (RSVP declined — they can
   still vote by proxy), each sorted by name. Role and RSVP are spelled out
   under the name, no hover needed. */

import { useState } from 'react'
import { Avatar } from '../components/Avatar/Avatar'
import { BadgeStatus } from '../components/BadgeStatus/BadgeStatus'
import { Button } from '../components/Button/Button'
import { Drawer } from '../components/Drawer/Drawer'
import { DrawerHeader } from '../components/DrawerHeader/DrawerHeader'
import { Modal } from '../components/Modal/Modal'
import { StickyFooter } from '../components/StickyFooter/StickyFooter'
import { TextArea } from '../components/TextArea/TextArea'
import { Tooltip } from '../components/Tooltip/Tooltip'
import { actions } from '../icons/actions'
import { arrows } from '../icons/arrows'
import { condition } from '../icons/condition'
import { dateTime } from '../icons/dateTime'
import { functional } from '../icons/functional'
import {
  ABSENT_VOTERS, MEMBERS, VOTERS, allForVotes, allVotes, memberById, pendingLabel, tally,
  type Member, type Motion, type MotionStatus, type Rsvp, type Vote,
} from './motion'
import styles from './MotionDrawer.module.css'

const icon = (set: { name: string; svg: string }[], name: string) => set.find(i => i.name === name)!.svg
const trashSvg    = icon(actions, 'trash-alt')
const chevronSvg  = icon(arrows, 'angle-down-big')

const RSVP_LABEL: Record<Rsvp, string> = {
  attending: 'Attending in person',
  online:    'Attending online',
  maybe:     'Maybe',
  declined:  'Not attending',
}

const VOTES: { value: Vote; label: string; svg: string; cls: string }[] = [
  { value: 'for',     label: 'For',     svg: icon(functional, 'thumbs-up'),   cls: 'voteIconFor' },
  { value: 'against', label: 'Against', svg: icon(functional, 'thumbs-down'), cls: 'voteIconAgainst' },
  { value: 'abstain', label: 'Abstain', svg: icon(condition, 'minus-circle'), cls: 'voteIconAbstain' },
  { value: 'pending', label: 'Pending', svg: icon(dateTime, 'clock-five'),    cls: 'voteIconPending' },
]

const STATUS_BADGE: Record<MotionStatus, { type: 'warning' | 'neutral' | 'positive'; label: string }> = {
  'draft':       { type: 'warning',  label: 'Draft' },
  'in-progress': { type: 'neutral',  label: 'In progress' },
  'completed':   { type: 'positive', label: 'Completed' },
}

const Icon = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)

const initial = (name: string) => name.charAt(0)
const firstName = (name: string) => name.split(' ')[0]

function MemberAvatar({ m }: { m: Member }) {
  return m.src
    ? <Avatar size="s" variant="picture" src={m.src} alt="" />
    : <Avatar size="s" variant="letters" initials={initial(m.name)} />
}

/* ------------------------------------------------------------- user picker */

/** "Moved by" / "Seconded by": an inline no-border field that filters the
    voters as you type (the other picker's person is excluded, so the seconder
    is never the mover); once chosen it shows avatar + name. */
function UserPicker({ label, value, exclude, readOnly, onChange }: {
  label: string
  value?: string
  exclude?: string
  readOnly: boolean
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = memberById(value)
  const options = MEMBERS.filter(m => m.id !== exclude && m.name.toLowerCase().includes(query.trim().toLowerCase()))

  const pick = (id: string) => { onChange(id); setOpen(false); setQuery('') }

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {open ? (
        <div className={styles.pickerWrap}>
          <input
            className={styles.pickerInput}
            autoFocus
            placeholder="Choose user"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') setOpen(false)
              if (e.key === 'Enter' && options[0]) pick(options[0].id)
            }}
            aria-label={label}
          />
          <div className={styles.scrim} onClick={() => setOpen(false)} />
          <ul className={styles.popover} role="listbox" aria-label={label}>
            {options.length === 0 && <li className={styles.empty}>No matches</li>}
            {options.map(m => (
              <li key={m.id}>
                <button type="button" role="option" aria-selected={m.id === value} className={styles.option} onClick={() => pick(m.id)}>
                  <MemberAvatar m={m} />{m.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : selected ? (
        <button type="button" className={styles.pickerValue} disabled={readOnly} onClick={() => setOpen(true)}>
          <MemberAvatar m={selected} />{selected.name}
        </button>
      ) : (
        <button type="button" className={styles.pickerEmpty} disabled={readOnly} onClick={() => setOpen(true)}>{readOnly ? '—' : 'Choose user'}</button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- vote select */

function VoteLabel({ vote, status }: { vote: Vote; status: MotionStatus }) {
  const v = VOTES.find(x => x.value === vote)!
  return (
    <>
      <span className={[styles.voteIcon, styles[v.cls]].join(' ')} aria-hidden="true"><Icon svg={v.svg} /></span>
      {vote === 'pending' ? pendingLabel(status) : v.label}
    </>
  )
}

/** The secretary records a member's vote. Locked (plain text) once the vote
    is completed. Changing a vote the member cast themselves says up front that
    they'll be notified. */
function VoteSelect({ member, value, status, ownVote, onChange }: {
  member: Member
  value: Vote
  status: MotionStatus
  /** The member cast this vote themselves (not entered by the secretary). */
  ownVote: boolean
  onChange: (v: Vote) => void
}) {
  const [open, setOpen] = useState(false)
  const pending = value === 'pending'
  const label = pending ? pendingLabel(status) : VOTES.find(v => v.value === value)!.label

  if (status === 'completed') {
    return (
      <span className={[styles.voteValue, pending ? styles.votePending : ''].filter(Boolean).join(' ')}>
        <VoteLabel vote={value} status={status} />
      </span>
    )
  }

  return (
    <div className={styles.voteWrap}>
      <button
        type="button"
        className={[styles.voteTrigger, pending ? styles.votePending : '', open ? styles.voteTriggerOpen : ''].filter(Boolean).join(' ')}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Vote of ${member.name}: ${label}`}
      >
        <VoteLabel vote={value} status={status} />
        <span className={[styles.chevron, open ? styles.chevronUp : ''].filter(Boolean).join(' ')}><Icon svg={chevronSvg} /></span>
      </button>
      {open && (
        <>
          <div className={styles.scrim} onClick={() => setOpen(false)} />
          <div className={[styles.popover, styles.votePopover].join(' ')}>
            <ul className={styles.optionList} role="listbox" aria-label={`Vote of ${member.name}`}>
              {VOTES.map(v => (
                <li key={v.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={v.value === value}
                    className={[styles.option, v.value === value ? styles.optionSelected : ''].filter(Boolean).join(' ')}
                    onClick={() => { if (v.value !== value) onChange(v.value); setOpen(false) }}
                  >
                    <span className={[styles.voteIcon, styles[v.cls]].join(' ')}><Icon svg={v.svg} /></span>
                    {v.label}
                  </button>
                </li>
              ))}
            </ul>
            {ownVote && (
              <p className={styles.voteHelper}>
                {firstName(member.name)} will be notified and the change logged.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/* --------------------------------------------------------------- progress */

function VoteProgress({ motion }: { motion: Motion }) {
  const t = tally(motion)
  const pct = (n: number) => `${(n / t.total) * 100}%`
  const counts = [
    { n: t.for,     label: 'For',                       cls: styles.segFor },
    { n: t.against, label: 'Against',                   cls: styles.segAgainst },
    { n: t.abstain, label: 'Abstain',                   cls: styles.segAbstain },
    { n: t.pending, label: pendingLabel(motion.status), cls: styles.segPending },
  ]
  return (
    <div className={styles.progress}>
      <div
        className={styles.bar}
        role="progressbar"
        aria-label="Votes cast"
        aria-valuemin={0}
        aria-valuemax={t.total}
        aria-valuenow={t.total - t.pending}
      >
        {counts.slice(0, 3).filter(c => c.n > 0).map(c => (
          <span key={c.label} className={[styles.seg, c.cls].join(' ')} style={{ width: pct(c.n) }} />
        ))}
      </div>
      <div className={styles.legend} aria-live="polite">
        {counts.map(c => (
          <span key={c.label} className={styles.legendItem}>
            <span className={[styles.dot, c.cls].join(' ')} aria-hidden="true" />{c.label} ({c.n})
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- drawer */

type Confirm = 'end' | 'reset' | 'delete' | null

export interface MotionDrawerProps {
  /** null = closed */
  motion: Motion | null
  /** True while adding: the motion is attached to the item on "Create". */
  isNew: boolean
  onChange: (m: Motion) => void
  /** Attaches a new motion on "Create" — it becomes a Draft. */
  onSave: (m: Motion) => void
  onDelete: (m: Motion) => void
  onCopyResults: (m: Motion) => void
  onClose: () => void
}

export function MotionDrawer({ motion, isNew, onChange, onSave, onDelete, onCopyResults, onClose }: MotionDrawerProps) {
  const [confirm, setConfirm] = useState<Confirm>(null)
  if (!motion) return <Drawer open={false} onClose={onClose} ariaLabel="Motion" />

  const m = motion
  const set = (patch: Partial<Motion>) => onChange({ ...m, ...patch })
  const voting = m.status !== 'draft'
  const ready = m.title.trim() !== ''
  const pending = tally(m).pending
  const proxy = m.proxy ?? []

  const startVote = () => set({ status: 'in-progress', votes: allVotes('pending'), proxy: [] })
  const allFor    = () => set({ status: 'completed', votes: allForVotes(), proxy: [] })
  const endVote   = () => { set({ status: 'completed' }); setConfirm(null) }
  const reset     = () => { set({ status: 'in-progress', votes: allVotes('pending'), proxy: [] }); setConfirm(null) }
  const remove    = () => { setConfirm(null); onDelete(m) }

  /* A vote set here is entered by the secretary on the member's behalf. */
  const setVote = (id: string, v: Vote) => set({
    votes: { ...m.votes, [id]: v },
    proxy: v === 'pending' ? proxy.filter(x => x !== id) : [...proxy.filter(x => x !== id), id],
  })

  const trash = !isNew && (
    <Tooltip label="Delete motion" position="top">
      <Button
        variant="secondary" intent="danger" size="m"
        iconOnly={<Icon svg={trashSvg} />}
        onClick={() => setConfirm('delete')}
        aria-label="Delete motion"
      />
    </Tooltip>
  )

  const footer = (
    <StickyFooter
      variant="drawer"
      left={
        isNew ? (
          <Button variant="primary" size="m" disabled={!ready} onClick={() => onSave({ ...m, status: 'draft' })}>
            Create
          </Button>
        ) : m.status === 'draft' ? (
          <>
            <Button variant="secondary" intent="neutral" size="m" disabled={!ready} onClick={allFor}>All for</Button>
            <Button variant="secondary" intent="neutral" size="m" disabled={!ready} onClick={startVote}>Start vote</Button>
          </>
        ) : m.status === 'in-progress' ? (
          <Button variant="secondary" intent="neutral" size="m" onClick={() => (pending ? setConfirm('end') : endVote())}>
            End vote
          </Button>
        ) : (
          <>
            <Button variant="primary" size="m" onClick={() => onCopyResults(m)}>Copy results</Button>
            <Button variant="secondary" intent="neutral" size="m" onClick={() => setConfirm('reset')}>Reset</Button>
          </>
        )
      }
      right={trash || undefined}
    />
  )

  const badge = isNew ? null : STATUS_BADGE[m.status]

  const section = (title: string, members: Member[]) => members.length > 0 && (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>{title} ({members.length})</th>
          {voting && <th className={styles.voteCol}>Vote</th>}
        </tr>
      </thead>
      <tbody>
        {members.map(member => {
          const vote = m.votes[member.id] ?? 'pending'
          const byProxy = proxy.includes(member.id)
          const meta = [member.role, RSVP_LABEL[member.rsvp], voting && byProxy && vote !== 'pending' ? 'Entered by secretary' : '']
            .filter(Boolean).join(' · ')
          return (
            <tr key={member.id}>
              <td>
                <span className={styles.nameCell}>
                  <MemberAvatar m={member} />
                  <span className={styles.nameText}>
                    <span className={styles.name}>{member.name}</span>
                    <span className={styles.meta}>{meta}</span>
                  </span>
                </span>
              </td>
              {voting && (
                <td className={styles.voteCol}>
                  <VoteSelect
                    member={member}
                    value={vote}
                    status={m.status}
                    ownVote={vote !== 'pending' && !byProxy}
                    onChange={v => setVote(member.id, v)}
                  />
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        header={
          <DrawerHeader
            title={isNew ? 'Add motion' : 'Motion'}
            readOnly
            onClose={onClose}
            badge={badge ? <BadgeStatus type={badge.type} label={badge.label} /> : undefined}
          />
        }
        footer={footer}
        bodyClassName={styles.body}
      >
        {voting ? (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Motion</span>
            <p className={styles.motionText}>{m.title}</p>
          </div>
        ) : (
          <TextArea
            id={`${m.id}-text`}
            label="Motion"
            placeholder="I move to…"
            rows={3}
            autoFocus={isNew}
            value={m.title}
            onChange={e => set({ title: e.target.value })}
          />
        )}

        <UserPicker
          label="Moved by"
          value={m.proposerId}
          exclude={m.seconderId}
          readOnly={voting}
          onChange={proposerId => set({ proposerId })}
        />
        <UserPicker
          label="Seconded by"
          value={m.seconderId}
          exclude={m.proposerId}
          readOnly={voting}
          onChange={seconderId => set({ seconderId })}
        />

        {voting && <VoteProgress motion={m} />}

        {section('Voters', VOTERS)}
        {section('Absent voters', ABSENT_VOTERS)}
      </Drawer>

      <Modal
        open={confirm === 'end'}
        onClose={() => setConfirm(null)}
        title="End vote?"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="secondary" intent="neutral" size="m" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="primary" size="m" onClick={endVote}>End vote</Button>
          </div>
        }
      >
        <p className={styles.modalText}>
          {pending} {pending === 1 ? 'member hasn’t' : 'members haven’t'} voted and will be recorded as Did not vote.
        </p>
      </Modal>

      <Modal
        open={confirm === 'reset'}
        onClose={() => setConfirm(null)}
        title="Reset vote?"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="secondary" intent="neutral" size="m" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="primary" intent="danger" size="m" onClick={reset}>Reset vote</Button>
          </div>
        }
      >
        <p className={styles.modalText}>
          Votes already cast will be cleared and members will need to vote again.
        </p>
      </Modal>

      <Modal
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        title="Delete motion?"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="secondary" intent="neutral" size="m" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="primary" intent="danger" size="m" onClick={remove}>Delete</Button>
          </div>
        }
      >
        <p className={styles.modalText}>
          This motion will be deleted permanently. This action cannot be undone.
        </p>
      </Modal>
    </>
  )
}

export default MotionDrawer
