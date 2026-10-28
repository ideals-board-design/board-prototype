/* MotionDrawer — "Manage motion" / "Add motion" drawer (Figma Meetings
   18636-58546 "Voting": Add motion, Start voting, Vote in progress, Delete,
   Copy results).

   One drawer for the whole lifecycle:
     • New (Figma 31749-410813) — no status yet: editable title, Proposed by /
       Seconded by pickers and the members' RSVP. Footer: only "Save as draft".
     • Draft (Figma 18636-58889) — saved; status "Draft". Footer: "All for" ·
       "Start vote" (available right away; proposer / seconder are optional) ·
       delete.
     • In progress — vote progress bar (for / against / abstain + "N/10"), a
       per-member Vote dropdown the secretary records votes with. Footer:
       "End vote" (asks first while votes are still pending) · delete.
     • Completed — same table, footer "Copy results" · "Reset" (asks first) ·
       delete (asks first). */

import { useState } from 'react'
import { Avatar } from '../components/Avatar/Avatar'
import { BadgeStatus } from '../components/BadgeStatus/BadgeStatus'
import { Button } from '../components/Button/Button'
import { Drawer } from '../components/Drawer/Drawer'
import { DrawerHeader } from '../components/DrawerHeader/DrawerHeader'
import { Modal } from '../components/Modal/Modal'
import { StickyFooter } from '../components/StickyFooter/StickyFooter'
import { Tooltip } from '../components/Tooltip/Tooltip'
import { actions } from '../icons/actions'
import { arrows } from '../icons/arrows'
import { communication } from '../icons/communication'
import { condition } from '../icons/condition'
import { dateTime } from '../icons/dateTime'
import { functional } from '../icons/functional'
import { media } from '../icons/media'
import { users } from '../icons/users'
import {
  MEMBERS, allVotes, memberById, tally,
  type Member, type Motion, type MotionStatus, type Rsvp, type Vote,
} from './motion'
import styles from './MotionDrawer.module.css'

const icon = (set: { name: string; svg: string }[], name: string) => set.find(i => i.name === name)!.svg
const trashSvg    = icon(actions, 'trash-alt')
const chevronSvg  = icon(arrows, 'angle-down-big')

const RSVP: Record<Rsvp, { label: string; svg: string; cls: string }> = {
  attending: { label: 'Attending in person', svg: icon(users, 'user'),                 cls: 'rsvpYes' },
  online:    { label: 'Attending online',    svg: icon(media, 'video'),                cls: 'rsvpYes' },
  maybe:     { label: 'Maybe',               svg: icon(communication, 'question-circle'), cls: 'rsvpMaybe' },
  declined:  { label: 'Declined',            svg: icon(actions, 'close'),              cls: 'rsvpNo' },
}

const VOTES: { value: Vote; label: string; short: string; svg: string; cls: string }[] = [
  { value: 'pending', label: 'Pending',      short: 'Pending',  svg: icon(dateTime, 'clock-five'),     cls: 'voteIconPending' },
  { value: 'for',     label: 'Vote for',     short: 'Vote for', svg: icon(functional, 'thumbs-up'),    cls: 'voteIconFor' },
  { value: 'against', label: 'Vote against', short: 'Against',  svg: icon(functional, 'thumbs-down'),  cls: 'voteIconAgainst' },
  { value: 'abstain', label: 'Abstain',      short: 'Abstain',  svg: icon(condition, 'minus-circle'),  cls: 'voteIconAbstain' },
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

function MemberAvatar({ m }: { m: Member }) {
  return m.src
    ? <Avatar size="s" variant="picture" src={m.src} alt="" />
    : <Avatar size="s" variant="letters" initials={initial(m.name)} />
}

/* ------------------------------------------------------------- user picker */

/** "Proposed by" / "Seconded by": an inline no-border field that filters the
    members as you type; once chosen it shows avatar + name. */
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
        <button type="button" className={styles.pickerEmpty} onClick={() => setOpen(true)}>Choose user</button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- vote select */

function VoteSelect({ name, value, onChange }: { name: string; value: Vote; onChange: (v: Vote) => void }) {
  const [open, setOpen] = useState(false)
  const current = VOTES.find(v => v.value === value)!
  return (
    <div className={styles.voteWrap}>
      <button
        type="button"
        className={[styles.voteTrigger, open ? styles.voteTriggerOpen : ''].filter(Boolean).join(' ')}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Vote of ${name}: ${current.label}`}
      >
        {current.short}
        <span className={[styles.chevron, open ? styles.chevronUp : ''].filter(Boolean).join(' ')}><Icon svg={chevronSvg} /></span>
      </button>
      {open && (
        <>
          <div className={styles.scrim} onClick={() => setOpen(false)} />
          <ul className={[styles.popover, styles.votePopover].join(' ')} role="listbox" aria-label={`Vote of ${name}`}>
            {VOTES.map(v => (
              <li key={v.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={v.value === value}
                  className={[styles.option, v.value === value ? styles.optionSelected : ''].filter(Boolean).join(' ')}
                  onClick={() => { onChange(v.value); setOpen(false) }}
                >
                  <span className={[styles.voteIcon, styles[v.cls]].join(' ')}><Icon svg={v.svg} /></span>
                  {v.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

/* --------------------------------------------------------------- progress */

function VoteProgress({ motion }: { motion: Motion }) {
  const t = tally(motion)
  const voted = t.total - t.pending
  const pct = (n: number) => `${(n / t.total) * 100}%`
  const legend = [
    { n: t.for,     label: 'Vote for', cls: styles.segFor },
    { n: t.against, label: 'Against',  cls: styles.segAgainst },
    { n: t.abstain, label: 'Abstain',  cls: styles.segAbstain },
  ].filter(l => l.n > 0)
  return (
    <div className={styles.progress}>
      <div
        className={styles.bar}
        role="progressbar"
        aria-label="Votes cast"
        aria-valuemin={0}
        aria-valuemax={t.total}
        aria-valuenow={voted}
      >
        {legend.map(l => <span key={l.label} className={[styles.seg, l.cls].join(' ')} style={{ width: pct(l.n) }} />)}
      </div>
      <div className={styles.legend}>
        {legend.map(l => (
          <span key={l.label} className={styles.legendItem}>
            <span className={[styles.dot, l.cls].join(' ')} aria-hidden="true" />{l.label} ({l.n})
          </span>
        ))}
        <span className={styles.count}>{voted}/{t.total}</span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- drawer */

type Confirm = 'end' | 'reset' | 'delete' | null

export interface MotionDrawerProps {
  /** null = closed */
  motion: Motion | null
  /** True while adding: the motion is attached to the item on the first save. */
  isNew: boolean
  onChange: (m: Motion) => void
  /** Attaches a new motion on "Save as draft" — it becomes a Draft. */
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

  const startVote = () => set({ status: 'in-progress', votes: allVotes('pending') })
  const allFor    = () => set({ status: 'completed', votes: allVotes('for') })
  const endVote   = () => { set({ status: 'completed' }); setConfirm(null) }
  const reset     = () => { set({ status: 'in-progress', votes: allVotes('pending') }); setConfirm(null) }
  const remove    = () => { setConfirm(null); onDelete(m) }

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
          <Button
            variant="secondary" intent="neutral" size="m"
            disabled={m.title.trim() === ''}
            onClick={() => onSave({ ...m, status: 'draft' })}
          >
            Save as draft
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

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        header={
          <DrawerHeader
            title={m.title}
            onTitleChange={title => set({ title })}
            readOnly={voting}
            onClose={onClose}
            badge={badge ? <BadgeStatus type={badge.type} label={badge.label} /> : undefined}
          />
        }
        footer={footer}
        bodyClassName={styles.body}
      >
        <UserPicker
          label="Proposed by"
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

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th className={styles.rsvpCol}>RSVP</th>
              {voting && <th className={styles.voteCol}>Vote</th>}
            </tr>
          </thead>
          <tbody>
            {MEMBERS.map(member => {
              const rsvp = RSVP[member.rsvp]
              return (
                <tr key={member.id}>
                  <td>
                    <span className={styles.nameCell}>
                      <Avatar size="s" variant="letters" initials={initial(member.name)} />
                      <span className={styles.name}>
                        {member.name}
                        {member.role && <span className={styles.role}> ({member.role})</span>}
                      </span>
                    </span>
                  </td>
                  <td className={styles.rsvpCol}>
                    <Tooltip label={rsvp.label} position="top">
                      <span className={[styles.rsvp, styles[rsvp.cls]].join(' ')} aria-label={rsvp.label} role="img">
                        <Icon svg={rsvp.svg} />
                      </span>
                    </Tooltip>
                  </td>
                  {voting && (
                    <td className={styles.voteCol}>
                      <VoteSelect
                        name={member.name}
                        value={m.votes[member.id] ?? 'pending'}
                        onChange={v => set({ votes: { ...m.votes, [member.id]: v } })}
                      />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </Drawer>

      <Modal
        open={confirm === 'end'}
        onClose={() => setConfirm(null)}
        title="End voting?"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="secondary" intent="neutral" size="m" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="primary" size="m" onClick={endVote}>End vote</Button>
          </div>
        }
      >
        <p className={styles.modalText}>
          {pending} {pending === 1 ? 'member hasn’t' : 'members haven’t'} voted yet. Their votes will stay pending. End voting?
        </p>
      </Modal>

      <Modal
        open={confirm === 'reset'}
        onClose={() => setConfirm(null)}
        title="Reset vote"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="secondary" intent="neutral" size="m" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="primary" intent="danger" size="m" onClick={reset}>Reset vote</Button>
          </div>
        }
      >
        <p className={styles.modalText}>
          Upon resetting, votes submitted will not be counted and voters will need to vote again. Reset vote?
        </p>
      </Modal>

      <Modal
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        title="Delete motion"
        footer={
          <div className={styles.modalFooter}>
            <Button variant="secondary" intent="neutral" size="m" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="primary" intent="danger" size="m" onClick={remove}>Delete</Button>
          </div>
        }
      >
        <p className={styles.modalText}>
          This motion will be deleted permanently. This action cannot be undone. Delete this motion?
        </p>
      </Modal>
    </>
  )
}

export default MotionDrawer
