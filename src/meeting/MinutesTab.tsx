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

import { useMemo, useRef, useState } from 'react'
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

/* ------------------------------------------------------------------ content */

const SEGMENTS = [
  { id: 'agenda',     label: 'Agenda' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'ai-minutes', label: 'AI minutes' },
]

const OUTLINE = [
  'Call to Order',
  'Opening',
  'Approval of Agenda',
  'Conflict of Interest',
  'Consent Agenda',
  'Appointment of Timekeeper',
  'Public Comment',
  'Approval of Previous Minutes',
  'CEO Report',
  'Closing',
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
    num: 1, title: 'Call to Order', timecode: '00:05:00',
    paragraphs: [{ text: 'Mr. Greg McMorrow called the meeting to order at 1:00 p.m.' }],
  },
  {
    num: 2, title: 'Opening', timecode: '00:05:00',
    paragraphs: [{ text: 'The Chair opened the meeting at 08:30, welcomed all attendees, and acknowledged the Traditional Owners of the land on which the meeting was held.' }],
  },
  {
    num: 3, title: 'Approval of Agenda', timecode: '00:12:56',
    paragraphs: [{ text: 'Chair McMorrow requested an adjustment to the agenda to add a second closed session after the first closed session under agenda item 4. The second closed session would be to discuss privileged communication with the attorney.' }],
    action: {
      id: 'a1',
      text: 'Add second closed session. Add a second closed session after the 1:20 p.m. item to discuss privileged communication with the attorney.',
      assignee: OLIVIA,
    },
    trailing: [
      { text: 'Motion: Add a second closed session after the 1:20 p.m. item to go into closed session to discuss privileged communication with the attorney.' },
      { text: 'Result: adopted' },
    ],
  },
  {
    num: 4, title: 'Conflict of Interest', timecode: '00:22:08',
    paragraphs: [{ text: 'No conflicts of interest were declared.' }],
    action: {
      id: 'a4',
      text: 'Update conflict register. Circulate the refreshed conflict-of-interest register to all directors and collect signed confirmations before the next meeting.',
      assignee: PRIYA,
    },
  },
  {
    num: 5, title: 'Consent Agenda', timecode: '00:28:40',
    paragraphs: [{ text: 'The Chair presented the consent agenda and asked whether any director wished to remove an item for separate discussion. No items were removed.' }],
    action: {
      id: 'a2',
      text: 'Circulate consent agenda. Distribute the finalized consent agenda package to all directors at least five business days before the next quarterly meeting.',
      assignee: MARCUS,
    },
  },
  {
    num: 6, title: 'Appointment of Timekeeper', timecode: '00:33:10',
    paragraphs: [{ text: 'The board appointed a timekeeper to keep the meeting to schedule and flag when discussions ran beyond their allotted time.' }],
    action: {
      id: 'a3',
      text: 'Confirm timekeeper. Confirm the appointed timekeeper and share the responsibilities checklist with the board ahead of the next session.',
      assignee: OLIVIA,
    },
  },
  {
    num: 7, title: 'Public Comment', timecode: '00:41:22',
    paragraphs: [{ text: 'No members of the public registered to speak. The Chair moved to the next item.' }],
    action: {
      id: 'a5',
      text: 'Open public comment window. Publish the public-comment registration window for the next meeting on the board portal at least ten days in advance.',
      assignee: MARCUS,
    },
  },
]

const PRESENT = [
  ['Brian Rubinstein',   'CEO'],
  ['Colin Darrans',      'Lead Independent Director'],
  ['Emily Jones',        'Independent Director'],
  ['Cheryl Jameson',     'Chairman, Independent Director'],
  ['Michael Donaldson',  'Chief Legal Officer'],
  ['Sam Wood',           'Executive Chair'],
  ['Thomas Sonnenshein', 'Chief Financial Officer'],
]

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
    <div className={styles.minutesTab}>
      {/* -------------------------------------------------- left: AI minutes */}
      <section className={styles.leftPane}>
        <div className={styles.segmentHeader}>
          <SegmentControl items={SEGMENTS} value={segment} onChange={setSegment} size="m" />
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

                      {block.paragraphs.map((p, i) => (
                        <p key={i} className={[styles.para, p.muted ? styles.paraMuted : ''].join(' ')}>
                          {p.text}
                        </p>
                      ))}

                      {block.action && (
                        <div
                          ref={el => { itemRefs.current[block.action!.id] = el }}
                          className={[styles.actionCard, current === idx ? styles.actionCardActive : ''].join(' ')}
                          aria-current={current === idx ? 'true' : undefined}
                        >
                          <span className={styles.actionCardHead}>Action item identified</span>
                          <div className={styles.actionCardBody}>
                            <p className={styles.actionCardText}>{block.action.text}</p>
                            <Avatar
                              size="m" variant="picture"
                              src={block.action.assignee.src}
                              alt={block.action.assignee.name}
                            />
                          </div>

                          {/* revealed on hover — confirm / dismiss the AI-identified
                              action, plus the transcript timecode it came from */}
                          <div className={styles.actionToolbar}>
                            <button type="button" className={styles.actionToolbarBtn} onClick={createDraft}>
                              <span className={[styles.actionToolbarIcon, styles.iconSuccess].join(' ')}>
                                <Icon svg={checkCircleSvg} />
                              </span>
                              Create draft action
                            </button>
                            <button type="button" className={styles.actionToolbarBtn} onClick={dismissAction}>
                              <span className={[styles.actionToolbarIcon, styles.iconDanger].join(' ')}>
                                <Icon svg={closeCircleSvg} />
                              </span>
                              Dismiss
                            </button>
                            <span className={styles.actionToolbarTime}>{block.timecode}</span>
                          </div>
                        </div>
                      )}

                      {block.trailing?.map((p, i) => (
                        <p key={i} className={styles.para}>{p.text}</p>
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
        ) : (
          <div className={styles.leftScroll}>
            <EmptyState
              illustration="clipboard"
              title={segment === 'agenda' ? 'Agenda' : 'Transcript'}
              description="Out of scope for this prototype — the AI minutes tab holds the action-item navigation."
            />
          </div>
        )}
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
