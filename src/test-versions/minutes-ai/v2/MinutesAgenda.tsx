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

   Spacing (Figma spec): 16 above the first item, 24 between items, 4 between
   title and time, 16 between blocks, 8 inside the motion block and between
   attachment rows. */

import { useLayoutEffect, useRef, useState } from 'react'
import { Avatar } from '../../../components/Avatar/Avatar'
import { BadgeStatus } from '../../../components/BadgeStatus/BadgeStatus'
import { Button } from '../../../components/Button/Button'
import { Tooltip } from '../../../components/Tooltip/Tooltip'
import { ActionMenu } from '../../../meeting/ActionMenu'
import { MotionDrawer } from './MotionDrawer'
import { allVotes, newMotion, resultsText, type Motion, type MotionStatus } from './motion'
import { actions } from '../../../icons/actions'
import { condition } from '../../../icons/condition'
import { dateTime } from '../../../icons/dateTime'
import { fileFormat } from '../../../icons/fileFormat'
import { functional } from '../../../icons/functional'
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
      'The Board is asked to review and approve the minutes of the previous meeting to confirm that they accurately reflect the discussions and decisions taken during that meeting, including the Quarterly Meeting of Q1 2024.',
    motions: [{
      id: 'motion-previous-minutes',
      title: "I move to approve the minutes of the Board of Directors: Quarterly meeting Q1'24 board meeting as presented",
      status: 'completed',
      proposerId: 'olivia',
      seconderId: 'alexander',
      votes: allVotes('for'),
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
      { name: 'Q1 2024 Financial Statements.pdf', format: 'pdf' },
      { name: 'Projections 2024–2025.xlsx', format: 'xlsx' },
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
  const [items, setItems] = useState(ITEMS)
  /* Drawer target: the item, the motion being edited and whether it is new
     (not attached to the item until its first save). */
  const [editing, setEditing] = useState<{ itemId: string; motion: Motion; isNew: boolean } | null>(null)

  const updateMotions = (itemId: string, fn: (ms: Motion[]) => Motion[]) =>
    setItems(prev => prev.map(it => (it.id === itemId ? { ...it, motions: fn(it.motions ?? []) } : it)))

  const onChange = (m: Motion) => {
    if (!editing) return
    setEditing({ ...editing, motion: m })
    if (!editing.isNew) updateMotions(editing.itemId, ms => ms.map(x => (x.id === m.id ? m : x)))
  }

  const onSave = (m: Motion) => {
    if (!editing) return
    updateMotions(editing.itemId, ms => [...ms, m])
    setEditing({ ...editing, motion: m, isNew: false })
    onNotify('Motion saved as draft')
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
                    { key: 'motion', label: 'Add motion', icon: thumbSvg, onSelect: () => setEditing({ itemId: item.id, motion: newMotion(), isNew: true }) },
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
                onManage={() => setEditing({ itemId: item.id, motion: m, isNew: false })}
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
        motion={editing?.motion ?? null}
        isNew={editing?.isNew ?? false}
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
