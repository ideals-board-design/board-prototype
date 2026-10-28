/* MinutesAgenda — Minutes → Agenda segment (Figma Meetings 12970-219469:
   "Description" 12970-219931, "Purpose" 14202-145975, "Draft actions"
   32081-108741, spacing spec 32081-108682).

   Read-only list of the meeting's agenda items, the reference the secretary
   writes the minutes against. Each item: number + title, presenter avatars and
   a "⋯" menu; time range, duration and purpose tag; then optional
   Description (clamped to 2 lines with "…Show more"), Draft actions,
   Motions (status badge, title, "Manage motion" + "Copy results") and
   attachments. "Manage motion" and the item menu's "Add motion" open
   MotionDrawer (Figma 18636-58546 "Voting"), which runs the whole vote.

   The items live in a module-level store so motions survive leaving and
   returning to the segment. Coming back while a vote is in progress opens
   its drawer straight away. While a vote is open a few present members
   "vote from their own devices" (simulated), so the drawer's rows and
   counts update live.

   Spacing (Figma spec): 16 above the first item, 24 between items, 4 between
   title and time, 16 between blocks, 8 inside the motion block and between
   attachment rows. */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar/Avatar'
import { BadgeStatus } from '../components/BadgeStatus/BadgeStatus'
import { Button } from '../components/Button/Button'
import { Tooltip } from '../components/Tooltip/Tooltip'
import { ActionMenu } from './ActionMenu'
import { MotionDrawer } from './MotionDrawer'
import { VOTERS, allForVotes, allVotes, newMotion, resultsText, type Motion, type MotionStatus, type Vote } from './motion'
import { actions } from '../icons/actions'
import { condition } from '../icons/condition'
import { dateTime } from '../icons/dateTime'
import { fileFormat } from '../icons/fileFormat'
import { functional } from '../icons/functional'
import styles from './MinutesAgenda.module.css'

const icon = (set: { name: string; svg: string }[], name: string) => set.find(i => i.name === name)!.svg
const copySvg     = icon(actions, 'copy')
const labelSvg    = icon(actions, 'label')
const infoSvg     = icon(condition, 'info-circle')
const thumbSvg    = icon(functional, 'thumbs-up')
const tasksSvg    = icon(dateTime, 'tasks')
const downloadSvg = icon(actions, 'download-alt')
const eyeSvg      = icon(actions, 'eye-opened')

const Icon = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)

/* ------------------------------------------------------------------ content */

type Format = 'pdf' | 'xlsx' | 'word' | 'ppt' | 'link'

interface Purpose { label: string; color: string }
interface Attachment { name: string; format: Format }

interface Item {
  id: string
  title: string
  durationMin: number
  purpose?: Purpose
  presenters?: { name: string; src: string }[]
  description?: string
  draftActions?: string[]
  motions?: Motion[]
  attachments?: Attachment[]
}

const FOR_INFORMATION: Purpose = { label: 'For information', color: 'var(--tag-blue)' }
const FOR_VOTING: Purpose      = { label: 'For voting',      color: 'var(--tag-orange)' }

const CHERYL = { name: 'Cheryl Jameson',       src: 'https://i.pravatar.cc/64?img=47' }
const THOMAS = { name: 'Thomas Sonnenshein',   src: 'https://i.pravatar.cc/64?img=12' }
const COLIN  = { name: 'Colin Darrans',        src: 'https://i.pravatar.cc/64?img=59' }

const MEETING_START_MIN = 11 * 60

const ITEMS: Item[] = [
  {
    id: 'call-to-order',
    title: 'Call to order',
    durationMin: 1,
    purpose: FOR_INFORMATION,
    draftActions: [
      'Cheryl Jameson to prepare a presentation for the next meeting',
      'Michael Donaldson to circulate the updated quorum rules',
    ],
  },
  {
    id: 'previous-minutes',
    title: 'Approval of previous meeting minutes',
    durationMin: 5,
    purpose: FOR_VOTING,
    presenters: [CHERYL],
    description:
      'The Board is asked to review and approve the minutes of the previous meeting to confirm that they accurately reflect the discussions and decisions taken during that meeting, including the Quarterly Meeting of Q4 2025.',
    motions: [{
      id: 'motion-previous-minutes',
      title: "I move to approve the minutes of the Board of Directors: Quarterly meeting Q4'25 board meeting as presented",
      status: 'completed',
      proposerId: 'olivia',
      seconderId: 'alexander',
      votes: allForVotes(),
    }],
    attachments: [
      { name: 'Minutes of the Previous Meeting.pdf', format: 'pdf' },
      { name: 'Minutes Summary', format: 'link' },
    ],
  },
  {
    id: 'financial-performance',
    title: 'Discuss financial performance and projections',
    durationMin: 10,
    purpose: FOR_VOTING,
    presenters: [THOMAS],
    description:
      'The Board reviews and notes the company’s financial performance for the previous quarter and notes the projections for the next period, including revenue, operating costs and cash position against the approved budget.',
    motions: [{
      id: 'motion-projections',
      title: 'Approve the proposed projections to guide resource allocation and strategic planning for the next period',
      status: 'draft',
      proposerId: 'olivia',
      seconderId: 'alexander',
      votes: allVotes('pending'),
    }],
    attachments: [
      { name: 'Q4 2025 Financial Statements.pdf', format: 'pdf' },
      { name: 'Projections 2026–2027.xlsx', format: 'xlsx' },
    ],
  },
  {
    id: 'audit-committee',
    title: 'Audit committee report',
    durationMin: 15,
    purpose: FOR_INFORMATION,
    presenters: [COLIN],
    description:
      'The Chair of the Audit Committee presents the committee’s findings on internal controls, the external audit plan and the risk register update.',
    attachments: [{ name: 'Audit Committee Report.docx', format: 'word' }],
  },
  {
    id: 'aob',
    title: 'Any other business and close',
    durationMin: 5,
    purpose: FOR_INFORMATION,
  },
]

/* Survives remounts of the segment (see header). */
let storedItems = ITEMS

/** True when any agenda motion is being voted on — Minutes then opens on Agenda. */
export const hasVoteInProgress = () =>
  storedItems.some(it => it.motions?.some(m => m.status === 'in-progress'))

/* Simulated live votes: every few seconds one present voter who hasn't voted
   casts a vote, up to LIVE_VOTES_MAX per vote. */
const LIVE_VOTE_MS = 3000
const LIVE_VOTES_MAX = 4
const LIVE_PATTERN: Vote[] = ['for', 'for', 'against', 'for', 'abstain']

const hhmm = (min: number) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`

/** Start/end derived from the meeting start + the running sum of durations. */
const withTimes = (items: Item[]) => items.reduce<{ item: Item; start: number; end: number }[]>((acc, item) => {
  const start = acc.length ? acc[acc.length - 1].end : MEETING_START_MIN
  return [...acc, { item, start, end: start + item.durationMin }]
}, [])

const STATUS_BADGE: Record<MotionStatus, { type: 'warning' | 'neutral' | 'positive'; label: string }> = {
  'draft':       { type: 'warning',  label: 'Draft' },
  'in-progress': { type: 'neutral',  label: 'In progress' },
  'completed':   { type: 'positive', label: 'Completed' },
}

const formatSvg = (f: Format) =>
  (fileFormat.find(i => i.name === `format-${f}`) ?? fileFormat.find(i => i.name === 'format-___')!).svg

/* --------------------------------------------------------------- pieces */

/** Description clamped to 2 lines; "…Show more" appears only when it overflows. */
function Description({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || expanded) return
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [expanded])

  return (
    <div className={styles.block}>
      <h4 className={styles.blockLabel}>Description</h4>
      <div className={styles.descWrap}>
        <p ref={ref} className={[styles.text, expanded ? '' : styles.clamped].filter(Boolean).join(' ')}>
          {text}
          {expanded && (
            <>
              {' '}
              <button type="button" className={styles.link} onClick={() => setExpanded(false)}>Show less</button>
            </>
          )}
        </p>
        {!expanded && overflows && (
          <button type="button" className={[styles.link, styles.moreLink].join(' ')} onClick={() => setExpanded(true)}>
            …Show more
          </button>
        )}
      </div>
    </div>
  )
}

function MotionBlock({ motion, onManage, onCopy }: { motion: Motion; onManage: () => void; onCopy: () => void }) {
  const badge = STATUS_BADGE[motion.status]
  return (
    <div className={styles.block}>
      <div className={styles.motionHead}>
        <h4 className={styles.blockLabel}>Motion</h4>
        <BadgeStatus
          type={badge.type}
          label={badge.label}
          iconRight={motion.status === 'completed' ? <Icon svg={infoSvg} /> : undefined}
        />
      </div>
      <p className={styles.text}>{motion.title}</p>
      <div className={styles.motionActions}>
        <Button variant="secondary" intent="neutral" size="s" onClick={onManage}>
          Manage motion
        </Button>
        {motion.status === 'completed' && (
          <Tooltip label="Copy results" position="top">
            <Button
              variant="secondary" intent="neutral" size="s"
              iconOnly={<Icon svg={copySvg} />}
              onClick={onCopy}
              aria-label="Copy results"
            />
          </Tooltip>
        )}
      </div>
    </div>
  )
}

function AttachmentRow({ file, onNotify }: { file: Attachment; onNotify: (m: string) => void }) {
  return (
    <li className={styles.attachment}>
      <span className={styles.fileIcon} aria-hidden="true"><Icon svg={formatSvg(file.format)} /></span>
      <span className={styles.fileName}>{file.name}</span>
      <ActionMenu
        className={styles.fileMenu}
        size="s"
        align="right"
        ariaLabel={`Actions for ${file.name}`}
        items={[
          { key: 'open', label: 'Open', icon: eyeSvg, onSelect: () => onNotify(`Opening ${file.name}`) },
          ...(file.format === 'link' ? [] : [
            { key: 'download', label: 'Download', icon: downloadSvg, onSelect: () => onNotify(`Downloading ${file.name}`) },
          ]),
        ]}
      />
    </li>
  )
}

/* --------------------------------------------------------------- component */

export function MinutesAgenda({ onNotify }: { onNotify: (message: string) => void }) {
  const [items, setItemsState] = useState(storedItems)
  const setItems = (fn: (prev: Item[]) => Item[]) =>
    setItemsState(prev => (storedItems = fn(prev)))

  /* Drawer target: the item, the id of the motion being edited (read live
     from items so incoming votes show) and, while adding, the unsaved motion
     (attached to the item on "Create"). Opens on a vote in progress. */
  const [editing, setEditing] = useState<{ itemId: string; motionId: string; draft?: Motion } | null>(() => {
    const item = storedItems.find(it => it.motions?.some(m => m.status === 'in-progress'))
    const live = item?.motions?.find(m => m.status === 'in-progress')
    return item && live ? { itemId: item.id, motionId: live.id } : null
  })
  const editingMotion = editing?.draft
    ?? items.find(it => it.id === editing?.itemId)?.motions?.find(m => m.id === editing?.motionId)
    ?? null

  const updateMotions = (itemId: string, fn: (ms: Motion[]) => Motion[]) =>
    setItems(prev => prev.map(it => (it.id === itemId ? { ...it, motions: fn(it.motions ?? []) } : it)))

  /* Live votes from members while any vote is open. */
  const liveCount = useRef<Record<string, number>>({})
  const voting = items.some(it => it.motions?.some(m => m.status === 'in-progress'))
  useEffect(() => {
    if (!voting) return
    const timer = window.setInterval(() => {
      /* Computed outside the state updater so the counter isn't bumped twice
         in StrictMode. */
      const next = storedItems.map(it => ({
        ...it,
        motions: it.motions?.map(m => {
          if (m.status !== 'in-progress') return m
          const cast = liveCount.current[m.id] ?? 0
          const voter = VOTERS.find(v => (m.votes[v.id] ?? 'pending') === 'pending' && !m.proxy?.includes(v.id))
          if (cast >= LIVE_VOTES_MAX || !voter) return m
          liveCount.current[m.id] = cast + 1
          return { ...m, votes: { ...m.votes, [voter.id]: LIVE_PATTERN[cast % LIVE_PATTERN.length] } }
        }),
      }))
      setItems(() => next)
    }, LIVE_VOTE_MS)
    return () => window.clearInterval(timer)
  }, [voting])

  const onChange = (m: Motion) => {
    if (!editing) return
    if (editing.draft) { setEditing({ ...editing, draft: m }); return }
    /* Starting or resetting a vote lets members vote live again. */
    if (m.status === 'in-progress' && Object.values(m.votes).every(v => v === 'pending')) liveCount.current[m.id] = 0
    updateMotions(editing.itemId, ms => ms.map(x => (x.id === m.id ? m : x)))
  }

  const onSave = (m: Motion) => {
    if (!editing) return
    updateMotions(editing.itemId, ms => [...ms, m])
    setEditing({ itemId: editing.itemId, motionId: m.id })
    onNotify('Motion created')
  }

  const onDelete = (m: Motion) => {
    if (!editing) return
    updateMotions(editing.itemId, ms => ms.filter(x => x.id !== m.id))
    setEditing(null)
    onNotify('Motion deleted')
  }

  const copyResults = (m: Motion) => {
    void navigator.clipboard?.writeText(resultsText(m)).catch(() => {})
    onNotify('Voting results copied — paste them into the minutes')
  }

  return (
    <>
      <ol className={styles.list} aria-label="Agenda">
        {withTimes(items).map(({ item, start, end }, i) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.head}>
              <h3 className={styles.title}>{i + 1}. {item.title}</h3>
              <div className={styles.headActions}>
                {item.presenters?.map(p => (
                  <Tooltip key={p.name} label={p.name} position="top">
                    <Avatar size="s" variant="picture" src={p.src} alt={p.name} />
                  </Tooltip>
                ))}
                <ActionMenu
                  size="s"
                  align="right"
                  ariaLabel={`Actions for ${item.title}`}
                  items={[
                    { key: 'motion', label: 'Add motion', icon: thumbSvg, onSelect: () => { const draft = newMotion(); setEditing({ itemId: item.id, motionId: draft.id, draft }) } },
                    { key: 'draft', label: 'Add draft action', icon: tasksSvg, onSelect: () => onNotify('Add draft action') },
                  ]}
                />
              </div>
            </div>

            <div className={styles.meta}>
              <span>{hhmm(start)} - {hhmm(end)}</span>
              <span>{item.durationMin}min</span>
              {item.purpose && (
                <span className={styles.purpose}>
                  <span className={styles.tagIcon} style={{ color: item.purpose.color }} aria-hidden="true">
                    <Icon svg={labelSvg} />
                  </span>
                  {item.purpose.label}
                </span>
              )}
            </div>

            {item.description && <Description text={item.description} />}

            {item.draftActions && (
              <div className={styles.block}>
                <h4 className={styles.blockLabel}>Draft actions</h4>
                <ul className={styles.drafts}>
                  {item.draftActions.map(a => <li key={a} className={styles.text}>{a}</li>)}
                </ul>
              </div>
            )}

            {item.motions?.map(m => (
              <MotionBlock
                key={m.id}
                motion={m}
                onManage={() => setEditing({ itemId: item.id, motionId: m.id })}
                onCopy={() => copyResults(m)}
              />
            ))}

            {item.attachments && (
              <ul className={styles.attachments} aria-label="Attachments">
                {item.attachments.map(f => <AttachmentRow key={f.name} file={f} onNotify={onNotify} />)}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <MotionDrawer
        motion={editingMotion}
        isNew={Boolean(editing?.draft)}
        onChange={onChange}
        onSave={onSave}
        onDelete={onDelete}
        onCopyResults={copyResults}
        onClose={() => setEditing(null)}
      />
    </>
  )
}

export default MinutesAgenda
