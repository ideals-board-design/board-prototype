/* TranscriptPane — Minutes → Transcript segment.
   Figma 12970-220260 (Transcript segment control).

   - Search on top: matches are highlighted in yellow, the current one stronger;
     "1/2" with previous / next steps through them and scrolls each into view.
   - Entries are grouped per recording ("Transcript 1", "Transcript 2"). Hovering
     an entry tints it and shows a floating Copy chip.
   - "View in transcript" from AI minutes jumps here: the entry at that timecode
     is scrolled to the centre and pulses once.
   - States: ready · loading (skeleton, e.g. right after an upload) · empty
     (after "Delete transcript": upload a VTT file instead). */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar } from '../../../components/Avatar/Avatar'
import { Button } from '../../../components/Button/Button'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Search } from '../../../components/Search/Search'
import { Skeleton } from '../../../components/Skeleton/Skeleton'
import { Tooltip } from '../../../components/Tooltip/Tooltip'
import { actions } from '../../../icons/actions'
import { CopyButton, HoverBar, Icon, scrollIntoCentre } from './minutesControls'
import type { Transcript, TranscriptEntry } from './transcriptData'
import shared from './MinutesTab.module.css'
import styles from './TranscriptPane.module.css'

const trashSvg = actions.find(i => i.name === 'trash-alt')!.svg

export type TranscriptStatus = 'ready' | 'loading' | 'empty'

interface Match { entryId: string; start: number }

const initials = (name: string) => name.trim().charAt(0).toUpperCase()

/** Every case-insensitive occurrence of `query`, in reading order. */
function findMatches(transcripts: Transcript[], query: string): Match[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const out: Match[] = []
  for (const t of transcripts) {
    for (const e of t.entries) {
      const text = e.text.toLowerCase()
      let i = text.indexOf(q)
      while (i !== -1) {
        out.push({ entryId: e.id, start: i })
        i = text.indexOf(q, i + q.length)
      }
    }
  }
  return out
}

/** Entry text with search hits wrapped in <mark>; the current hit is stronger. */
function Highlighted({ entry, query, matches, current }: {
  entry: TranscriptEntry
  query: string
  matches: Match[]
  current: Match | undefined
}) {
  const len = query.trim().length
  const own = matches.filter(m => m.entryId === entry.id)
  if (!len || own.length === 0) return <>{entry.text}</>

  const parts: React.ReactNode[] = []
  let pos = 0
  own.forEach(m => {
    if (m.start > pos) parts.push(entry.text.slice(pos, m.start))
    const isCurrent = current?.entryId === m.entryId && current.start === m.start
    parts.push(
      <mark
        key={m.start}
        className={[styles.hit, isCurrent ? styles.hitCurrent : ''].join(' ')}
        data-current-hit={isCurrent ? 'true' : undefined}
      >
        {entry.text.slice(m.start, m.start + len)}
      </mark>,
    )
    pos = m.start + len
  })
  if (pos < entry.text.length) parts.push(entry.text.slice(pos))
  return <>{parts}</>
}

function SkeletonEntry() {
  return (
    <div className={styles.skeletonEntry} aria-hidden="true">
      <div className={styles.skeletonHead}>
        <Skeleton variant="circle" width={24} height={24} />
        <Skeleton variant="text" width="30%" />
        <span className={styles.skeletonGrow} />
        <Skeleton variant="text" width={64} />
      </div>
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="60%" />
    </div>
  )
}

export function TranscriptPane({ transcripts, status, focus, onCopyAll, onDelete, onUpload }: {
  transcripts: Transcript[]
  status: TranscriptStatus
  /** jump target from AI minutes; `nonce` re-triggers the same timecode */
  focus: { time: string; nonce: number } | null
  onCopyAll: () => void
  onDelete: () => void
  onUpload: () => void
}) {
  const [query, setQuery] = useState('')
  const [hitIdx, setHitIdx] = useState(0)
  const [pulseId, setPulseId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const matches = useMemo(() => findMatches(transcripts, query), [transcripts, query])
  const current = matches[hitIdx]

  /* New query → back to the first hit. */
  useEffect(() => { setHitIdx(0) }, [query])

  /* Keep the current hit in view. */
  useEffect(() => {
    const scroller = scrollRef.current
    const el = scroller?.querySelector<HTMLElement>('[data-current-hit]')
    if (scroller && el) scrollIntoCentre(scroller, el)
  }, [current, status])

  /* Jump from AI minutes: centre the entry at that timecode (or the last one
     before it) and pulse it once. */
  useEffect(() => {
    if (!focus || status !== 'ready') return
    const all = transcripts.flatMap(t => t.entries)
    const target = [...all].reverse().find(e => e.time <= focus.time) ?? all[0]
    if (!target) return
    setPulseId(null)
    const raf = requestAnimationFrame(() => {
      setPulseId(target.id)
      const scroller = scrollRef.current
      const el = scroller?.querySelector<HTMLElement>(`[data-entry="${target.id}"]`)
      if (scroller && el) scrollIntoCentre(scroller, el)
    })
    return () => cancelAnimationFrame(raf)
  }, [focus, status, transcripts])

  const step = (dir: 1 | -1) => {
    if (matches.length === 0) return
    setHitIdx(i => (i + dir + matches.length) % matches.length)
  }

  if (status === 'empty') {
    return (
      <div className={[shared.leftScroll, styles.emptyWrap].join(' ')}>
        <EmptyState
          illustration="cards-transcript"
          title="Transcript not available"
          description="To upload your own transcript, click Upload transcript below. Make sure the file is in VTT format."
          action={<Button variant="primary" size="m" onClick={onUpload}>Upload transcript</Button>}
        />
      </div>
    )
  }

  return (
    <>
      <div className={styles.searchRow}>
        <Search
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search"
          size="m"
          counter={query.trim() ? { current: matches.length ? hitIdx + 1 : 0, total: matches.length } : undefined}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          disabled={status === 'loading'}
        />
      </div>

      <div className={[shared.leftScroll, styles.scroll].join(' ')} ref={scrollRef}>
        {transcripts.map((t, ti) => (
          <section key={t.id} className={styles.group} aria-label={t.title}>
            {transcripts.length > 1 && <h3 className={styles.groupTitle}>{t.title}</h3>}

            {status === 'loading' && ti > 0 ? (
              <>
                <SkeletonEntry />
                <SkeletonEntry />
              </>
            ) : status === 'loading' ? (
              <>
                <SkeletonEntry />
                <SkeletonEntry />
                <SkeletonEntry />
              </>
            ) : t.entries.map(e => (
                <div
                  key={e.id}
                  className={[styles.entry, pulseId === e.id ? styles.entryPulse : ''].join(' ')}
                  data-entry={e.id}
                  tabIndex={-1}
                >
                  <div className={styles.entryHead}>
                    <span className={styles.speaker}>
                      {e.speaker.src
                        ? <Avatar size="s" variant="picture" src={e.speaker.src} alt="" />
                        : <Avatar size="s" variant="letters" color="neutral" initials={initials(e.speaker.name)} alt="" />}
                      <span className={styles.speakerName}>{e.speaker.name}</span>
                    </span>
                    <span className={styles.time}>{e.time}</span>
                  </div>
                  <p className={styles.text}>
                    <Highlighted entry={e} query={query} matches={matches} current={current} />
                  </p>
                  <HoverBar label={`${e.speaker.name} at ${e.time}`}>
                    <CopyButton text={`${e.speaker.name} ${e.time}\n${e.text}`} label={`Copy what ${e.speaker.name} said at ${e.time}`} />
                  </HoverBar>
                </div>
            ))}
          </section>
        ))}
      </div>

      <footer className={shared.leftFooter}>
        <div className={shared.footerGroup}>
          <Button variant="secondary" intent="neutral" size="m" onClick={onCopyAll} disabled={status !== 'ready'}>
            Copy full transcript
          </Button>
        </div>
        <Tooltip label="Delete transcript" position="top">
          <Button
            variant="secondary" intent="danger" size="m"
            iconOnly={<Icon svg={trashSvg} />}
            aria-label="Delete transcript"
            onClick={onDelete}
            disabled={status !== 'ready'}
          />
        </Tooltip>
      </footer>
    </>
  )
}

export default TranscriptPane
