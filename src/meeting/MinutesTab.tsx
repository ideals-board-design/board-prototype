/* MinutesTab — Minutes → AI minutes view with the sticky "N action items found"
   navigation banner.
   Figma: 30567-64045 (Navigation banner — Meetings)

   Interaction (the point of this screen):
   - The banner shows how many AI-extracted action items were found and lets the
     user step through them with Previous (↑) / Next (↓).
   - "Current" is a real, highlighted card — like a Ctrl+F match. Next/Previous
     move that highlight through the ordered set and scroll it into view.
   - Manual scrolling never moves the highlight; it just looks around. Pressing
     Next snaps back to the current item and advances. Previous is disabled on the
     first item, Next on the last.
   - The banner is position:sticky, so it pins to the top of the pane once the
     outline above it scrolls away. Close (✕) dismisses it. */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SegmentControl } from '../components/SegmentControl/SegmentControl'
import { Button } from '../components/Button/Button'
import { Tooltip } from '../components/Tooltip/Tooltip'
import { Avatar } from '../components/Avatar/Avatar'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { ToastContainer } from '../components/ToastContainer/ToastContainer'
import type { ToastContainerHandle } from '../components/ToastContainer/ToastContainer'
import { arrows } from '../icons/arrows'
import { actions } from '../icons/actions'
import { condition } from '../icons/condition'
import { editor } from '../icons/editor'
import { functional } from '../icons/functional'
import { MinutesAgenda } from './MinutesAgenda'
import styles from './MinutesTab.module.css'

const angleUpSvg   = arrows.find(i => i.name === 'angle-up-fill')!.svg
const angleDownSvg = arrows.find(i => i.name === 'angle-down-fill')!.svg
const closeSvg     = actions.find(i => i.name === 'multiply')!.svg
const copySvg      = actions.find(i => i.name === 'copy')!.svg
const trashSvg     = actions.find(i => i.name === 'trash-alt')!.svg
const chevronSvg   = arrows.find(i => i.name === 'angle-down-big')!.svg

/* hover action-item toolbar — outline circle icons, tinted via CSS */
const checkCircleSvg = condition.find(i => i.name === 'check-circle')!.svg
const closeCircleSvg = actions.find(i => i.name === 'close')!.svg

const undoSvg      = arrows.find(i => i.name === 'undo')!.svg
const redoSvg      = arrows.find(i => i.name === 'redo')!.svg
const boldSvg      = editor.find(i => i.name === 'bold')!.svg
const italicSvg    = editor.find(i => i.name === 'italic')!.svg
const underlineSvg = editor.find(i => i.name === 'underline')!.svg
const indentSvg    = editor.find(i => i.name === 'left-indent')!.svg
const sidebarSvg   = actions.find(i => i.name === 'sidebar-opened')!.svg
const moreSvg      = functional.find(i => i.name === 'ellipsis-h')!.svg

const Icon = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)

/** Tracks the in-flight tween per scroll container so a new navigation cancels
    the previous one instead of fighting it. */
const scrollAnims = new WeakMap<HTMLElement, { raf: number; timer: number; done: boolean }>()

/** Animate a scroll container to `top` with an ease-out tween (~360ms). A guarded
    timeout snaps to the final position, so the target is always reached even where
    requestAnimationFrame is throttled or timestamps stall. */
function smoothScrollTo(el: HTMLElement, top: number) {
  const prev = scrollAnims.get(el)
  if (prev) { cancelAnimationFrame(prev.raf); clearTimeout(prev.timer); prev.done = true }

  const start = el.scrollTop
  const delta = top - start
  if (Math.abs(delta) < 1) { el.scrollTop = top; return }

  const duration = 360
  const anim = { raf: 0, timer: 0, done: false }
  scrollAnims.set(el, anim)

  const finish = () => {
    if (anim.done) return
    anim.done = true
    cancelAnimationFrame(anim.raf)
    el.scrollTop = top
  }

  let startTime: number | null = null
  const step = (now: number) => {
    if (anim.done) return
    if (startTime === null) startTime = now
    const t = Math.min(1, (now - startTime) / duration)
    const eased = 1 - Math.pow(1 - t, 3)
    el.scrollTop = start + delta * eased
    if (t < 1) anim.raf = requestAnimationFrame(step)
    else finish()
  }
  anim.raf = requestAnimationFrame(step)
  anim.timer = window.setTimeout(finish, duration + 80)
}

/* Resizable left pane (Figma 13202-77526): drag the divider between 460 and 640px. */
const PANE_MIN = 460
const PANE_MAX = 640
const PANE_STEP = 16
const clampPane = (w: number) => Math.min(PANE_MAX, Math.max(PANE_MIN, w))

/* ------------------------------------------------------------------ content */

const SEGMENTS = [
  { id: 'agenda',     label: 'Agenda' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'ai-minutes', label: 'AI minutes' },
]

interface ActionItem {
  /** stable id used to key refs for scroll-into-view */
  id: string
  text: string
  assignee: { name: string; src: string }
}

interface Paragraph {
  text: string
  muted?: boolean
}

interface MinuteBlock {
  num: number
  title: string
  timecode: string
  paragraphs: Paragraph[]
  /** an AI-extracted action item rendered after the first paragraph */
  action?: ActionItem
  /** trailing paragraphs rendered after the action item (motion / result) */
  trailing?: Paragraph[]
}

const OLIVIA = { name: 'Olivia Thompson', src: 'https://i.pravatar.cc/64?img=47' }
const MARCUS = { name: 'Marcus Lee',     src: 'https://i.pravatar.cc/64?img=12' }
const PRIYA  = { name: 'Priya Nair',     src: 'https://i.pravatar.cc/64?img=32' }

const BLOCKS: MinuteBlock[] = [
  {
    num: 1, title: 'Call to Order', timecode: '00:01:30',
    paragraphs: [{ text: 'Cheryl Jameson, Chairman, called the meeting to order at 11:00 a.m. Michael Donaldson, Chief Legal Officer, confirmed that notice had been given and that a quorum of seven directors was present.' }],
  },
  {
    num: 2, title: 'Approval of Agenda', timecode: '00:04:10',
    paragraphs: [{ text: 'The Chairman asked whether any director wished to amend the agenda. Emily Jones asked that the cybersecurity update be moved ahead of the committee reports so that it could be discussed while the Chief Technology Officer was available. The Chairman agreed.' }],
    action: {
      id: 'a1',
      text: 'Update the agenda. Move the cybersecurity update ahead of the committee reports and re-issue the revised agenda to all directors.',
      assignee: OLIVIA,
    },
    trailing: [
      { text: 'Motion: Approve the agenda for the March 27, 2024 Board of Directors meeting as amended.' },
      { text: 'Result: adopted unanimously' },
    ],
  },
  {
    num: 3, title: 'Conflict of Interest', timecode: '00:07:45',
    paragraphs: [{ text: 'Directors were reminded of their duty to disclose any conflict of interest. Colin Darrans disclosed his advisory role at Northwind Capital, which is a bidder on item 6, and agreed to leave the room during that discussion. No other conflicts were declared.' }],
    action: {
      id: 'a2',
      text: 'Record the disclosure. Add Colin Darrans’ Northwind Capital disclosure to the conflict-of-interest register and note his recusal from item 6.',
      assignee: PRIYA,
    },
  },
  {
    num: 4, title: 'Approval of Previous Minutes', timecode: '00:11:20',
    paragraphs: [{ text: 'The minutes of the meeting held on January 20, 2024 were distributed to members on January 27, 2024. No amendments had been submitted to the Company Secretary before the meeting, and none were raised by directors.' }],
    trailing: [
      { text: 'Motion: Approve the minutes of the January 20, 2024 Board of Directors meeting as presented.' },
      { text: 'Result: adopted' },
    ],
  },
  {
    num: 5, title: 'CEO Report', timecode: '00:19:05',
    paragraphs: [{ text: 'Brian Rubinstein, CEO, reported that Q1 revenue was $48.2 million, 9% ahead of plan, driven by enterprise renewals. Customer churn fell to 3.1%. He highlighted delays in the EMEA expansion caused by data-residency approvals and expects the launch to move from May to July.' }],
    action: {
      id: 'a3',
      text: 'Revise the EMEA launch plan. Present an updated timeline and budget impact for the July launch at the next Board meeting.',
      assignee: MARCUS,
    },
  },
  {
    num: 6, title: 'Financial Report', timecode: '00:34:50',
    paragraphs: [{ text: 'Thomas Sonnenshein, Chief Financial Officer, presented the Q1 financial statements. Operating expenses were 4% under budget, and cash and equivalents stood at $112 million. Directors asked for a sensitivity analysis on the revised EMEA timeline.' }],
    action: {
      id: 'a4',
      text: 'Prepare a sensitivity analysis. Model the impact of a two-month EMEA delay on full-year revenue and cash runway, and circulate it ahead of the April call.',
      assignee: PRIYA,
    },
  },
  {
    num: 7, title: 'Audit Committee Report', timecode: '00:52:15',
    paragraphs: [{ text: 'Emily Jones, Audit Committee Chair, reported that the external auditor had completed interim testing with no material findings. The committee recommended renewing the auditor’s engagement for the next fiscal year.' }],
    trailing: [
      { text: 'Motion: Renew the engagement of the external auditor for the next fiscal year, as recommended by the Audit Committee.' },
      { text: 'Result: adopted, Colin Darrans abstained' },
    ],
  },
  {
    num: 8, title: 'Cybersecurity Update', timecode: '01:08:30',
    paragraphs: [{ text: 'The Chief Technology Officer reported on the results of the annual penetration test. Two medium-severity findings were identified and are scheduled for remediation by the end of April. Directors requested quarterly reporting on remediation progress.' }],
    action: {
      id: 'a5',
      text: 'Add quarterly cyber reporting. Include a remediation progress update in the Board pack for each quarterly meeting starting in June.',
      assignee: OLIVIA,
    },
  },
  {
    num: 9, title: 'Closing', timecode: '01:21:00',
    paragraphs: [{ text: 'There being no further business, the Chairman thanked directors and management and adjourned the meeting at 12:25 p.m. The next regular meeting is scheduled for June 26, 2024.' }],
  },
]

/** Outline entries mirror the minute blocks, so the two can never drift apart. */
const OUTLINE = BLOCKS.map(b => b.title)

const PRESENT = [
  ['Brian Rubinstein',   'CEO'],
  ['Colin Darrans',      'Lead Independent Director'],
  ['Emily Jones',        'Independent Director'],
  ['Cheryl Jameson',     'Chairman, Independent Director'],
  ['Michael Donaldson',  'Chief Legal Officer'],
  ['Sam Wood',           'Executive Chair'],
  ['Thomas Sonnenshein', 'Chief Financial Officer'],
]

/* ------------------------------------------------------- hover controls */

/** Plain-text copy of a block: title, every paragraph and the extracted action. */
function blockText(block: MinuteBlock) {
  return [
    `${block.num}. ${block.title}`,
    ...block.paragraphs.map(p => p.text),
    ...(block.action ? [block.action.text] : []),
    ...(block.trailing ?? []).map(p => p.text),
  ].join('\n\n')
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    /* clipboard API unavailable (insecure context / denied) — legacy fallback */
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}

/** Copy icon button. The "Copy" tooltip only shows over this button; after a
    successful copy the same tooltip reads "Copied ✓" for a moment. */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    if (!(await writeClipboard(text))) return
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <Tooltip label={copied ? 'Copied ✓' : 'Copy'} position="top">
        <Button
          variant="tertiary" intent="neutral" size="m"
          iconOnly={<Icon svg={copySvg} />}
          aria-label={label}
          onClick={copy}
        />
      </Tooltip>
      {/* keyboard / screen-reader confirmation (the tooltip is hover-only) */}
      <span className={styles.srOnly} role="status">{copied ? 'Copied' : ''}</span>
    </>
  )
}

/** Timestamp that jumps to the transcript. */
function TimeButton({ timecode, onClick }: { timecode: string; onClick: () => void }) {
  return (
    <Tooltip label="View in transcript" position="top">
      <Button
        variant="tertiary" intent="neutral" size="m"
        aria-label={`View in transcript at ${timecode}`}
        onClick={onClick}
        className={styles.timeBtn}
      >
        {timecode}
      </Button>
    </Tooltip>
  )
}

/** Controls pinned inside the highlighted element's corner. Absolutely positioned
    so showing them never changes layout; the fade lets long text slide under the
    solid action area instead of colliding with it. */
function HoverBar({ children, label, wide }: { children: ReactNode; label: string; wide?: boolean }) {
  return (
    <div className={[styles.hoverBar, wide ? styles.hoverBarWide : ''].join(' ')}>
      <span className={styles.hoverFade} aria-hidden="true" />
      <div className={styles.hoverActions} role="group" aria-label={label}>{children}</div>
    </div>
  )
}

/** A paragraph that highlights on hover / keyboard focus and shows its own
    timestamp + copy controls. */
function ParaBox({ para, timecode, onTime }: { para: Paragraph; timecode: string; onTime: () => void }) {
  return (
    <div className={styles.paraBox}>
      <p className={[styles.paraText, para.muted ? styles.paraMuted : ''].join(' ')}>{para.text}</p>
      <HoverBar label="Paragraph actions">
        <TimeButton timecode={timecode} onClick={onTime} />
        <CopyButton text={para.text} label="Copy paragraph" />
      </HoverBar>
    </div>
  )
}

/* --------------------------------------------------------------- component */

export function MinutesTab() {
  const [segment, setSegment] = useState<string | number>('ai-minutes')
  const [bannerOpen, setBannerOpen] = useState(true)
  const [outlineExpanded, setOutlineExpanded] = useState(false)

  /* Ordered list of action items across all blocks — the set the banner steps
     through. */
  const actionItems = useMemo(
    () => BLOCKS.filter(b => b.action).map(b => b.action!),
    [],
  )

  /* "current" highlighted item. -1 = nothing highlighted yet (initial state). */
  const [current, setCurrent] = useState(-1)

  const scrollRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const toastRef = useRef<ToastContainerHandle>(null)

  /* Hover-toolbar actions on an identified action item. Both confirm with a
     toast — the item is then considered reviewed by the secretary. */
  const createDraft = () =>
    toastRef.current?.add({ state: 'success', message: 'Draft action item created' })
  const dismissAction = () =>
    toastRef.current?.add({ state: 'info', message: 'Identified action item dismissed' })

  const showTranscript = () => setSegment('transcript')

  /* Left-pane width. Pointer capture keeps the drag alive outside the 8px grab
     area; width is clamped on every move so it can never leave 460–640. */
  const [paneWidth, setPaneWidth] = useState(PANE_MIN)
  const [resizing, setResizing] = useState(false)
  const drag = useRef<{ x: number; w: number } | null>(null)

  const onResizeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, w: paneWidth }
    setResizing(true)
  }
  const onResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    setPaneWidth(clampPane(drag.current.w + e.clientX - drag.current.x))
  }
  const onResizeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    drag.current = null
    setResizing(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  const onResizeKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const delta = e.key === 'ArrowLeft' ? -PANE_STEP : e.key === 'ArrowRight' ? PANE_STEP : 0
    if (e.key === 'Home') setPaneWidth(PANE_MIN)
    else if (e.key === 'End') setPaneWidth(PANE_MAX)
    else if (delta) setPaneWidth(w => clampPane(w + delta))
    else return
    e.preventDefault()
  }

  const scrollToItem = (idx: number) => {
    const id = actionItems[idx]?.id
    const el = id ? itemRefs.current[id] : null
    const scroller = scrollRef.current
    if (!el || !scroller) return
    /* Centre the card in the scroll pane, clamped to the scrollable range. rAF
       tween instead of native `behavior:'smooth'` so it animates consistently
       across browsers (some embedded engines silently drop programmatic smooth
       scrolls). */
    const target = el.offsetTop - scroller.clientHeight / 2 + el.offsetHeight / 2
    const max = scroller.scrollHeight - scroller.clientHeight
    smoothScrollTo(scroller, Math.max(0, Math.min(target, max)))
  }

  const goPrev = () => {
    if (current <= 0) return
    const next = current - 1
    setCurrent(next)
    scrollToItem(next)
  }

  const goNext = () => {
    if (current >= actionItems.length - 1) return
    const next = current < 0 ? 0 : current + 1
    setCurrent(next)
    scrollToItem(next)
  }

  const prevDisabled = current <= 0
  const nextDisabled = current >= actionItems.length - 1

  const outlineItems = outlineExpanded ? OUTLINE : OUTLINE.slice(0, 7)

  return (
    <div className={[styles.minutesTab, resizing ? styles.minutesTabResizing : ''].join(' ')}>
      {/* -------------------------------------------------- left: AI minutes */}
      <section className={styles.leftPane} style={{ '--pane-width': `${paneWidth}px` } as React.CSSProperties}>
        <div className={styles.segmentHeader}>
          <SegmentControl items={SEGMENTS} value={segment} onChange={setSegment} size="m" className={styles.segment} />
        </div>

        {segment === 'ai-minutes' ? (
          <>
            <div className={styles.leftScroll} ref={scrollRef}>
              <div className={styles.outline}>
                <h2 className={styles.outlineHeading}>Outline</h2>
                <ol className={styles.outlineList}>
                  {outlineItems.map((label, i) => (
                    <li key={i} className={styles.outlineRow}>
                      <span className={styles.outlineNum}>{i + 1}.</span> {label}
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  className={styles.showMore}
                  onClick={() => setOutlineExpanded(v => !v)}
                >
                  {outlineExpanded ? 'Show less' : 'Show more'}
                  <span className={[styles.showMoreIcon, outlineExpanded ? styles.showMoreIconUp : ''].join(' ')}>
                    <Icon svg={chevronSvg} />
                  </span>
                </button>
              </div>

              {bannerOpen && actionItems.length > 0 && (
                <div className={styles.banner} role="region" aria-label="Action items navigation">
                  <span className={styles.bannerLabel}>
                    {actionItems.length} action {actionItems.length === 1 ? 'item' : 'items'} found
                  </span>
                  <div className={styles.bannerActions}>
                    <Tooltip label="Previous" position="top">
                      <Button
                        variant="tertiary" intent="success" size="s"
                        iconOnly={<Icon svg={angleUpSvg} />}
                        disabled={prevDisabled}
                        onClick={goPrev}
                        aria-label="Previous action item"
                      />
                    </Tooltip>
                    <Tooltip label="Next" position="top">
                      <Button
                        variant="tertiary" intent="success" size="s"
                        iconOnly={<Icon svg={angleDownSvg} />}
                        disabled={nextDisabled}
                        onClick={goNext}
                        aria-label="Next action item"
                      />
                    </Tooltip>
                    <Tooltip label="Dismiss" position="top">
                      <Button
                        variant="tertiary" intent="success" size="s"
                        iconOnly={<Icon svg={closeSvg} />}
                        onClick={() => setBannerOpen(false)}
                        aria-label="Dismiss action items banner"
                      />
                    </Tooltip>
                  </div>
                </div>
              )}

              <div className={styles.summary}>
                {BLOCKS.map(block => {
                  const idx = block.action
                    ? actionItems.findIndex(a => a.id === block.action!.id)
                    : -1
                  return (
                    <article key={block.num} className={styles.block}>
                      <header className={styles.blockHead}>
                        <h3 className={styles.blockTitle}>{block.num}. {block.title}</h3>
                        <span className={styles.blockTime}>{block.timecode}</span>
                      </header>

                      <HoverBar label={`Section ${block.num} actions`} wide>
                        <CopyButton text={blockText(block)} label={`Copy section ${block.num}. ${block.title}`} />
                      </HoverBar>

                      {block.paragraphs.map((p, i) => (
                        <ParaBox key={i} para={p} timecode={block.timecode} onTime={showTranscript} />
                      ))}

                      {block.action && (
                        <div
                          ref={el => { itemRefs.current[block.action!.id] = el }}
                          className={[styles.actionCard, current === idx ? styles.actionCardActive : ''].join(' ')}
                          aria-current={current === idx ? 'true' : undefined}
                        >
                          <span className={styles.actionCardHead}>Action item found</span>
                          <div className={styles.actionCardBody}>
                            <p className={styles.actionCardText}>{block.action.text}</p>
                            <Avatar
                              size="m" variant="picture"
                              src={block.action.assignee.src}
                              alt={block.action.assignee.name}
                            />
                          </div>

                          {/* confirm / dismiss the AI-identified action, plus the
                              transcript timecode it came from */}
                          <HoverBar label="Action item actions">
                            <Button
                              variant="tertiary" intent="neutral" size="m"
                              iconLeft={<span className={styles.iconSuccess}><Icon svg={checkCircleSvg} /></span>}
                              onClick={createDraft}
                              aria-label="Create draft action"
                              title="Create draft action"
                            >
                              <span className={styles.btnLabel}>Create draft action</span>
                            </Button>
                            <Button
                              variant="tertiary" intent="neutral" size="m"
                              iconLeft={<span className={styles.iconDanger}><Icon svg={closeCircleSvg} /></span>}
                              onClick={dismissAction}
                              aria-label="Dismiss"
                              title="Dismiss"
                            >
                              <span className={styles.btnLabel}>Dismiss</span>
                            </Button>
                            <TimeButton timecode={block.timecode} onClick={showTranscript} />
                          </HoverBar>
                        </div>
                      )}

                      {block.trailing?.map((p, i) => (
                        <ParaBox key={i} para={p} timecode={block.timecode} onTime={showTranscript} />
                      ))}
                    </article>
                  )
                })}
              </div>
            </div>

            <footer className={styles.leftFooter}>
              <Button variant="secondary" intent="neutral" size="m" iconLeft={<Icon svg={copySvg} />}>
                Copy full AI minutes
              </Button>
              <Tooltip label="Delete AI minutes" position="top">
                <Button
                  variant="tertiary" intent="danger" size="m"
                  iconOnly={<Icon svg={trashSvg} />}
                  aria-label="Delete AI minutes"
                />
              </Tooltip>
            </footer>
          </>
        ) : segment === 'agenda' ? (
          <div className={styles.leftScroll}>
            <MinutesAgenda onNotify={message => toastRef.current?.add({ state: 'info', message })} />
          </div>
        ) : (
          <div className={styles.leftScroll}>
            <EmptyState
              illustration="clipboard"
              title="Transcript"
              description="Out of scope for this prototype — the AI minutes tab holds the action-item navigation."
            />
          </div>
        )}

        <div
          className={styles.resizer}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize minutes panel"
          aria-valuemin={PANE_MIN}
          aria-valuemax={PANE_MAX}
          aria-valuenow={paneWidth}
          tabIndex={0}
          onPointerDown={onResizeDown}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
          onPointerCancel={onResizeEnd}
          onKeyDown={onResizeKey}
        />
      </section>

      {/* ------------------------------------------------- right: document */}
      <section className={styles.rightPane}>
        <div className={styles.toolbar}>
          <button type="button" className={styles.toolBtn} aria-label="Toggle sidebar"><Icon svg={sidebarSvg} /></button>
          <span className={styles.toolDivider} />
          <button type="button" className={styles.toolBtn} aria-label="Undo"><Icon svg={undoSvg} /></button>
          <button type="button" className={styles.toolBtn} aria-label="Redo"><Icon svg={redoSvg} /></button>
          <span className={styles.toolDivider} />
          <button type="button" className={styles.toolBtn} aria-label="Bold"><Icon svg={boldSvg} /></button>
          <button type="button" className={styles.toolBtn} aria-label="Italic"><Icon svg={italicSvg} /></button>
          <button type="button" className={styles.toolBtn} aria-label="Underline"><Icon svg={underlineSvg} /></button>
          <span className={styles.toolDivider} />
          <div className={styles.toolSelect}>Arial <span className={styles.toolSelectChevron}><Icon svg={chevronSvg} /></span></div>
          <div className={styles.toolSelect}>13pt <span className={styles.toolSelectChevron}><Icon svg={chevronSvg} /></span></div>
          <span className={styles.toolDivider} />
          <button type="button" className={styles.toolBtn} aria-label="Outdent"><Icon svg={indentSvg} /></button>
          <button type="button" className={[styles.toolBtn, styles.toolBtnFlip].join(' ')} aria-label="Indent"><Icon svg={indentSvg} /></button>
          <button type="button" className={styles.toolBtn} aria-label="More"><Icon svg={moreSvg} /></button>
        </div>

        <div className={styles.docScroll}>
          <div className={styles.doc}>
            <h1 className={styles.docTitle}>Board of Directors / March 2024</h1>
            <p className={styles.docCenter}>27 March 2024, 11:00 - 15:00, 4hr, (UTC-5) New York, NY</p>
            <p className={styles.docCenter}>1535 Broadway, New York, NY, 10036, USA</p>
            <p className={styles.docCenter}>Meeting held via Zoom</p>

            <h2 className={styles.docSection}>Present:</h2>
            <ul className={styles.docList}>
              {PRESENT.map(([name, role]) => (
                <li key={name} className={styles.docListRow}>
                  <span className={styles.docName}>{name}</span>
                  <span className={styles.docDash}>–</span>
                  <span className={styles.docRole}>{role}</span>
                </li>
              ))}
            </ul>

            <h2 className={styles.docSection}>Apologies:</h2>
            <p className={styles.para}>N/A</p>

            <h2 className={styles.docSection}>In attendance:</h2>
            <p className={styles.para}>&nbsp;</p>
          </div>
        </div>
      </section>

      <ToastContainer ref={toastRef} />
    </div>
  )
}

export default MinutesTab
