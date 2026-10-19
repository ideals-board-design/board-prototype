/* BoardBookPageNavViewer — TEST VERSION of BoardBookViewer for exploring page
   navigation. Forked from src/meeting/BoardBook/BoardBookViewer.tsx; changes
   here do not affect the Meeting → Board book tab.

   Test layout (Figma 32114-124836): one 48px toolbar — TOC toggle · document
   dropdown · page counter (input / total, next ⌄ / prev ⌃) · annotation tools —
   and a floating vertical zoom card over the canvas. `layout` picks the version:
   'full' hides the agenda (TOC) panel, 'split' shows it beside the document.

   Original: the Board book tab's PDF reading experience
   (Figma 12970-219379).

   A published board book concatenates every agenda item's attachments (converted
   to PDF) into one continuous document. This prototype reproduces the
   PSPDFKit-style chrome around a mocked PDF surface:
     • a resizable Table-of-content panel (open by default on web, a bottom-pill
       popover on tablet/phone)
     • a toolbar: TOC toggle · zoom · fit-width · full-screen | draw · highlight ·
       comment · download · search · Ask AI (Figma 12378-180849)
     • a floating bottom pill: prev / next, a document switcher, and one
       continuous page counter across all documents ("9 / 310")
     • Search and Ask-AI side panels opened from the toolbar
   Navigation, continuous pagination and keyboard forward/back are real; the
   annotation tools, Search and Ask-AI are visual chrome with light interactivity
   (per the agreed prototype scope). */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { BadgeStatus } from '../../components/BadgeStatus/BadgeStatus'
import { Avatar } from '../../components/Avatar/Avatar'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { TextField } from '../../components/TextField/TextField'
import { ActionMenu, type ActionMenuItem } from '../../meeting/ActionMenu'
import { actions } from '../../icons/actions'
import { arrows } from '../../icons/arrows'
import { communication } from '../../icons/communication'
import { condition } from '../../icons/condition'
import { fileFormat } from '../../icons/fileFormat'
import { custom } from '../../icons/custom'
import {
  MOCK_BOARD_BOOK,
  MOTION_STATUS_LABEL,
  docAtPage,
  firstDocOfItem,
  flatDocByName,
  type BoardBook,
  type BoardBookDoc,
  type BoardBookItem,
  type FlatDoc,
  type MotionStatus,
} from '../../meeting/BoardBook/boardBookData'
import { PageStack, pageAtScroll, scrollToPage, type CommentPin } from './PageStack'
import styles from './BoardBookPageNavViewer.module.css'

/* ── Icons (DS sets only) ──────────────────────────────────────────────────── */
const icon = (set: { name: string; svg: string }[], name: string) =>
  set.find(i => i.name === name)!.svg

const tocOpenSvg    = icon(actions, 'sidebar-opened')
const tocClosedSvg  = icon(actions, 'sidebar-closed')
const zoomInSvg     = icon(actions, 'zoom-in')
const zoomOutSvg    = icon(actions, 'zoom-out')
const fitWidthSvg   = icon(actions, 'with-width')
const fullscreenSvg = icon(arrows, 'arrow-resize-diagonal')
const drawSvg       = icon(actions, 'drawing')
const highlightSvg  = icon(actions, 'hightlight')
const commentSvg    = icon(communication, 'comment')
const downloadSvg   = icon(actions, 'download-alt')
const searchSvg     = icon(actions, 'search')
const aiSvg         = icon(actions, 'sparkles')
const chevronUpSvg  = icon(arrows, 'angle-up-fill')
const arrowLeftSvg  = icon(arrows, 'arrow-left')
const arrowRightSvg = icon(arrows, 'arrow-right')
const chevronDownSvg = icon(arrows, 'angle-down-fill')
const closeSvg      = icon(actions, 'close')
const infoSvg       = icon(condition, 'info-circle')
const sendSvg       = icon(custom, 'send')
const linkSvg       = icon(actions, 'link')
const editSvg       = icon(actions, 'edit-alt')
const copySvg       = icon(actions, 'copy')
const rotateSvg     = icon(arrows, 'rotate')

const FORMAT_ICON: Record<BoardBookDoc['sourceFormat'], string> = {
  pdf:  icon(fileFormat, 'format-pdf'),
  word: icon(fileFormat, 'format-word'),
  xlsx: icon(fileFormat, 'format-xlsx'),
  ppt:  icon(fileFormat, 'format-ppt'),
  txt:  icon(fileFormat, 'format-txt'),
}

const MOTION_BADGE: Record<MotionStatus, 'positive' | 'neutral' | 'warning'> = {
  'completed':   'positive',
  'in-progress': 'neutral',
  'not-started': 'warning',
}

/* ── Small local media-query hook (matches MeetingPage's compact breakpoint) ─── */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

const ZOOM_MIN = 50
const ZOOM_MAX = 200
const ZOOM_STEP = 10
/* The TOC panel holds the agenda outline whose description block is 460–640px
   wide (Figma 16944-29384 / 12594-300202), so the panel itself is clamped to
   that range and opens at its minimum. */
const TOC_MIN = 460
const TOC_MAX = 640

const Ico = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)

type AnnotationTool = 'none' | 'draw' | 'highlight' | 'comment'
type RightPanel = null | 'search' | 'ai'

export type BoardBookLayout = 'full' | 'split'

export interface BoardBookPageNavViewerProps {
  /** 'full' — document only (agenda panel hidden) | 'split' — agenda panel + document */
  layout?: BoardBookLayout
  book?: BoardBook
  /** Whether the secretary has published the board book. */
  published?: boolean
  /** Quick-preview target — a document name opened from the agenda. */
  initialDocName?: string | null
  /** Rendered image of a global page (real PDF); falls back to the mock sheet. */
  pageImage?: (page: number) => string | undefined
}

export default function BoardBookPageNavViewer({
  layout = 'split',
  book = MOCK_BOARD_BOOK,
  published = true,
  initialDocName = null,
  pageImage,
}: BoardBookPageNavViewerProps) {
  const isCompact = useMediaQuery('(max-width: 1023px)')
  const isNarrow = useMediaQuery('(max-width: 767px)')

  const [page, setPage] = useState(1)
  const [tocOpen, setTocOpen] = useState(layout === 'split' && !isCompact)
  const [tocWidth, setTocWidth] = useState(TOC_MIN)
  const [rightPanel, setRightPanel] = useState<RightPanel>(null)
  const [navPopoverOpen, setNavPopoverOpen] = useState(false)
  const [tool, setTool] = useState<AnnotationTool>('none')
  const [zoom, setZoom] = useState(100)
  const [fitWidth, setFitWidth] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [comments, setComments] = useState<CommentPin[]>([])

  const scrollRef = useRef<HTMLDivElement>(null)
  const commentSeq = useRef(0)
  const pageRef = useRef(page); pageRef.current = page

  const clampPage = useCallback(
    (p: number) => Math.min(book.totalPages, Math.max(1, p)),
    [book.totalPages],
  )
  /* Pages are laid out continuously (PageStack): navigating scrolls to the
     target page, and scrolling updates the current page. */
  const goToPage = useCallback((p: number) => {
    const next = clampPage(p)
    if (next === pageRef.current) { scrollToPage(scrollRef.current, next); return }
    setPage(next)
    pendingScroll.current = next // scrolled to once its document has rendered
  }, [clampPage])
  /* Navigation may switch the rendered document (PageStack shows one document
     at a time), so the scroll happens after the commit, not in the click. */
  const pendingScroll = useRef<number | null>(null)
  useLayoutEffect(() => {
    if (pendingScroll.current === null) return
    scrollToPage(scrollRef.current, pendingScroll.current)
    pendingScroll.current = null
  }, [page])
  const onCanvasScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const p = pageAtScroll(e.currentTarget)
    if (p && p !== pageRef.current) setPage(p)
  }

  /* Keep the current page anchored when the sheets resize (zoom, fit width,
     agenda panel opening / resizing). */
  useLayoutEffect(() => {
    scrollToPage(scrollRef.current, pageRef.current)
  }, [zoom, fitWidth, tocOpen, tocWidth, fullscreen])

  const current = useMemo(() => docAtPage(book, page), [book, page])

  /* ── The TOC panel follows the layout version and the viewport: open only in
     the split version on web, closed (popover) on tablet/phone. Only reset when
     the version or breakpoint actually flips, so the toggle still works. ────── */
  useEffect(() => { setTocOpen(layout === 'split' && !isCompact) }, [layout, isCompact])

  /* ── Quick preview: jump to the opened attachment's first page. ───────────── */
  useEffect(() => {
    if (!initialDocName) return
    const fd = flatDocByName(book, initialDocName)
    if (fd) goToPage(fd.startPage)
  }, [initialDocName, book, goToPage])

  /* ── Keyboard (web only, and never while typing in a field): ← / → turn
     pages, Esc leaves focus mode. Focus mode (`fullscreen`, the zoom card's
     button) is the
     document alone over the whole window — the toolbar and the agenda panel
     step aside, the floating view controls stay (same as Version 3). ──────── */
  useEffect(() => {
    if (isCompact) return
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el && (['INPUT', 'TEXTAREA'].includes(el.tagName) || (el as HTMLElement).isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goToPage(page + 1) }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goToPage(page - 1) }
      else if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isCompact, page, goToPage])

  /* ── Resizable TOC panel ──────────────────────────────────────────────────── */
  const startResize = (e: React.PointerEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = tocWidth
    const onMove = (ev: PointerEvent) => {
      const next = Math.min(TOC_MAX, Math.max(TOC_MIN, startW + (ev.clientX - startX)))
      setTocWidth(next)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const selectDoc = (fd: FlatDoc) => { goToPage(fd.startPage); setNavPopoverOpen(false) }
  const selectItem = (item: BoardBookItem) => {
    const fd = firstDocOfItem(book, item.id)
    if (fd) { goToPage(fd.startPage); setNavPopoverOpen(false) }
  }

  const toggleTool = (t: AnnotationTool) =>
    setTool(prev => (prev === t ? 'none' : t))

  const toggleRightPanel = (p: Exclude<RightPanel, null>) =>
    setRightPanel(prev => (prev === p ? null : p))

  if (!published || book.totalPages === 0) {
    return (
      <div className={styles.notPublished}>
        <EmptyState
          illustration="clipboard"
          title="Board book not published"
          description="The secretary is preparing the board book. We will let you know via email when it is ready."
        />
      </div>
    )
  }

  return (
    <div className={[styles.viewer, fullscreen ? styles.fullscreen : ''].filter(Boolean).join(' ')}>
      {/* ── Agenda (TOC) panel — inline & resizable; the toolbar toggle opens and
          closes it at every width (it starts closed below 1024). ──────────── */}
      {tocOpen && !fullscreen && (
        <>
          <nav className={styles.toc} style={{ width: tocWidth }} aria-label="Board book contents">
            <TocPanel book={book} currentDocId={current?.doc.id} onSelectItem={selectItem} onSelectDoc={selectDoc} onAskAi={() => setRightPanel('ai')} />
          </nav>
          <div
            className={styles.resizer}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize contents panel"
            onPointerDown={startResize}
          />
        </>
      )}

      {/* ── Main column: toolbar + canvas ─────────────────────────────────── */}
      <div className={styles.main}>
        {/* Toolbar — hidden in focus mode (as in Version 3). */}
        {!fullscreen && (
        <div className={styles.toolbar}>
          <Tooltip label="Table of content" position="bottom">
            <Button
              variant="tertiary" intent="neutral" size="m"
              aria-pressed={tocOpen}
              data-state={tocOpen ? 'active' : undefined}
              iconOnly={<Ico svg={tocOpen ? tocOpenSvg : tocClosedSvg} />}
              onClick={() => setTocOpen(o => !o)}
              aria-label="Toggle table of content"
            />
          </Tooltip>

          <div className={styles.toolbarRow}>
            {/* Document switcher — opens the same contents menu the pill used. */}
            <div className={styles.docSelectWrap}>
              <button
                type="button"
                className={styles.docSelect}
                onClick={() => setNavPopoverOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={navPopoverOpen}
              >
                {current && <span className={styles.docSelectIcon} aria-hidden="true"><Ico svg={FORMAT_ICON[current.doc.sourceFormat]} /></span>}
                <span className={styles.docSelectName}>{current?.doc.name}</span>
                <span className={styles.docSelectChevron} aria-hidden="true"><Ico svg={navPopoverOpen ? chevronUpSvg : chevronDownSvg} /></span>
              </button>

              {navPopoverOpen && (
                <>
                  <div className={styles.popoverScrim} onClick={() => setNavPopoverOpen(false)} aria-hidden="true" />
                  <div className={styles.navPopover} role="menu" aria-label="Board book contents">
                    <CompactNav book={book} currentDocId={current?.doc.id} onSelectItem={selectItem} onSelectDoc={selectDoc} />
                  </div>
                </>
              )}
            </div>

            {/* Page navigation — one continuous counter across all documents. */}
            <div className={styles.pageNav} role="group" aria-label="Page navigation">
              <div className={styles.pageCount}>
                <input
                  className={styles.pageInput}
                  type="text"
                  inputMode="numeric"
                  value={page}
                  aria-label="Current page"
                  onChange={e => {
                    const n = Number(e.target.value.replace(/\D/g, ''))
                    if (n) goToPage(n)
                  }}
                />
                <span className={styles.pageTotal}>/ {book.totalPages}</span>
              </div>
              <div className={styles.toolbarGroup}>
                <Tooltip label="Next page" position="bottom">
                  <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={chevronDownSvg} />}
                    disabled={page >= book.totalPages} onClick={() => goToPage(page + 1)} aria-label="Next page" />
                </Tooltip>
                <Tooltip label="Previous page" position="bottom">
                  <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={chevronUpSvg} />}
                    disabled={page <= 1} onClick={() => goToPage(page - 1)} aria-label="Previous page" />
                </Tooltip>
              </div>
            </div>

            {/* Narrow (<768): the tools collapse into a "⋯" menu so the document
                dropdown and page counter keep their room. */}
            {isNarrow ? (
              <ActionMenu
                size="m"
                ariaLabel="Document tools"
                items={[
                  { key: 'draw',      label: 'Draw',      icon: drawSvg,      onSelect: () => toggleTool('draw') },
                  { key: 'highlight', label: 'Highlight', icon: highlightSvg, onSelect: () => toggleTool('highlight') },
                  { key: 'comment',   label: 'Comment',   icon: commentSvg,   onSelect: () => toggleTool('comment') },
                  { key: 'download',  label: 'Download',  icon: downloadSvg,  onSelect: () => console.log('download board book') },
                  { key: 'search',    label: 'Search',    icon: searchSvg,    onSelect: () => toggleRightPanel('search') },
                  { key: 'ai',        label: 'Ask AI',    icon: aiSvg,        onSelect: () => toggleRightPanel('ai') },
                ]}
              />
            ) : (
            <div className={styles.toolbarGroup}>
              <Tooltip label="Draw" position="bottom">
                <Button variant="tertiary" intent="neutral" size="m"
                  aria-pressed={tool === 'draw'}
                  data-state={tool === 'draw' ? 'active' : undefined}
                  iconOnly={<Ico svg={drawSvg} />}
                  onClick={() => toggleTool('draw')} aria-label="Draw" />
              </Tooltip>
              <Tooltip label="Highlight" position="bottom">
                <Button variant="tertiary" intent="neutral" size="m"
                  aria-pressed={tool === 'highlight'}
                  data-state={tool === 'highlight' ? 'active' : undefined}
                  iconOnly={<Ico svg={highlightSvg} />}
                  onClick={() => toggleTool('highlight')} aria-label="Highlight" />
              </Tooltip>
              <Tooltip label="Comment" position="bottom">
                <Button variant="tertiary" intent="neutral" size="m"
                  aria-pressed={tool === 'comment'}
                  data-state={tool === 'comment' ? 'active' : undefined}
                  iconOnly={<Ico svg={commentSvg} />}
                  onClick={() => toggleTool('comment')} aria-label="Comment" />
              </Tooltip>
              <Tooltip label="Download" position="bottom">
                <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={downloadSvg} />}
                  onClick={() => console.log('download board book')} aria-label="Download" />
              </Tooltip>
              <Tooltip label="Search" position="bottom">
                <Button variant="tertiary" intent="neutral" size="m"
                  aria-pressed={rightPanel === 'search'}
                  data-state={rightPanel === 'search' ? 'active' : undefined}
                  iconOnly={<Ico svg={searchSvg} />}
                  onClick={() => toggleRightPanel('search')} aria-label="Search the board book" />
              </Tooltip>
              <Tooltip label="Ask AI" position="bottom">
                <Button variant="tertiary" intent="neutral" size="m"
                  aria-pressed={rightPanel === 'ai'}
                  data-state={rightPanel === 'ai' ? 'active' : undefined}
                  iconOnly={<Ico svg={aiSvg} />}
                  onClick={() => toggleRightPanel('ai')} aria-label="Ask AI" />
              </Tooltip>
            </div>
            )}
          </div>
        </div>
        )}

        {/* ── PDF canvas ──────────────────────────────────────────────────── */}
        <div className={styles.canvasArea}>
          <div ref={scrollRef} className={styles.canvasScroll} onScroll={onCanvasScroll}>
            <PageStack
              book={book}
              page={page}
              className={fitWidth ? styles.pageFit : undefined}
              style={fitWidth ? undefined : { width: `calc(635px * ${zoom / 100})` }}
              cursorClassName={
                tool === 'comment' ? styles.pageCommenting
                  : tool === 'draw' || tool === 'highlight' ? styles.pageAnnotating
                  : undefined
              }
              commenting={tool === 'comment'}
              comments={comments}
              onAddComment={pin => setComments(prev => [...prev, { ...pin, id: ++commentSeq.current }])}
              renderPage={(doc, local, global) => (
                <PdfPage doc={doc} localPage={local} globalPage={global} image={pageImage?.(global)} />
              )}
            />
          </div>

          {/* ── Keyboard hint (web only) ──────────────────────────────────── */}
          {!isCompact && (
            <div className={styles.keyHint} aria-hidden="true">
              <kbd className={styles.kbd}><Ico svg={arrowLeftSvg} /></kbd>
              <kbd className={styles.kbd}><Ico svg={arrowRightSvg} /></kbd>
              <span>pages</span>
            </div>
          )}

          {/* ── View controls — floating vertical card over the canvas ──────── */}
          <div className={styles.zoomCard} role="group" aria-label="View controls">
            <Tooltip label="Zoom in" position="right">
              <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={zoomInSvg} />}
                onClick={() => { setFitWidth(false); setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP)) }}
                aria-label="Zoom in" />
            </Tooltip>
            <Tooltip label="Zoom out" position="right">
              <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={zoomOutSvg} />}
                onClick={() => { setFitWidth(false); setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP)) }}
                aria-label="Zoom out" />
            </Tooltip>
            <Tooltip label="Fit width" position="right">
              <Button variant="tertiary" intent="neutral" size="m"
                aria-pressed={fitWidth}
                data-state={fitWidth ? 'active' : undefined}
                iconOnly={<Ico svg={fitWidthSvg} />}
                onClick={() => setFitWidth(f => !f)} aria-label="Fit page width" />
            </Tooltip>
            <Tooltip label="Focus mode" position="right">
              <Button variant="tertiary" intent="neutral" size="m"
                aria-pressed={fullscreen}
                data-state={fullscreen ? 'active' : undefined}
                iconOnly={<Ico svg={fullscreenSvg} />}
                onClick={() => setFullscreen(f => !f)} aria-label="Focus mode" />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* ── Right side panel (Search / Ask AI) ────────────────────────────── */}
      {rightPanel === 'search' && (
        <SearchPanel book={book} onClose={() => setRightPanel(null)} onGoToPage={goToPage} />
      )}
      {rightPanel === 'ai' && <AiPanel onClose={() => setRightPanel(null)} />}
    </div>
  )
}

/* ── Table-of-content panel (rich, web) ────────────────────────────────────── */
export function TocPanel({ book, currentDocId, onSelectItem, onSelectDoc, onAskAi }: {
  book: BoardBook
  currentDocId?: string
  onSelectItem: (item: BoardBookItem) => void
  onSelectDoc: (fd: FlatDoc) => void
  onAskAi: () => void
}) {
  return (
    <div className={styles.tocScroll}>
      {book.items.map(item => (
        <TocItem key={item.id} book={book} item={item} currentDocId={currentDocId}
          onSelectItem={onSelectItem} onSelectDoc={onSelectDoc} onAskAi={onAskAi} />
      ))}
    </div>
  )
}

function TocItem({ book, item, currentDocId, onSelectItem, onSelectDoc, onAskAi }: {
  book: BoardBook
  item: BoardBookItem
  currentDocId?: string
  onSelectItem: (item: BoardBookItem) => void
  onSelectDoc: (fd: FlatDoc) => void
  onAskAi: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const desc = item.description ?? ''
  /* Descriptions carry the full copy; long ones collapse to 120 characters. */
  const isLong = desc.length > 120

  const docMenu = (name: string, isLink: boolean): ActionMenuItem[] => [
    { key: 'ask',    label: 'Ask AI',            icon: aiSvg,       onSelect: onAskAi },
    { key: 'rename', label: 'Rename',            icon: editSvg,     onSelect: () => console.log('rename', name) },
    ...(isLink ? [] : [{ key: 'download', label: 'Download', icon: downloadSvg, onSelect: () => console.log('download', name) }]),
    { key: 'copy',   label: 'Copy to Documents', icon: copySvg,     onSelect: () => console.log('copy to documents', name) },
  ]

  return (
    <section className={styles.tocItem}>
      {/* Avatar top-aligns with the first line of a wrapping title (flex-start). */}
      <div className={styles.tocItemHead}>
        <button type="button" className={styles.tocItemTitleBtn} onClick={() => onSelectItem(item)}>
          <span className={styles.tocItemTitle}>{item.number}. {item.title}</span>
        </button>
        {item.presenter && (
          <Tooltip label={`Presenter: ${item.presenter.name}`} position="left">
            <Avatar size="s"
              variant={item.presenter.avatar ? 'picture' : 'letters'}
              src={item.presenter.avatar}
              initials={initials(item.presenter.name)}
              alt={item.presenter.name} />
          </Tooltip>
        )}
      </div>
      <div className={styles.tocMeta}>
        <span>{item.timeRange}</span>
        <span>{item.duration}</span>
      </div>

      {desc && (
        <div className={styles.tocBlock}>
          <span className={styles.tocLabel}>Description</span>
          <p className={styles.tocText}>
            {expanded || !isLong ? desc : truncate(desc, 120)}
            {isLong && (
              <button type="button" className={styles.showMore} onClick={() => setExpanded(e => !e)}>
                {expanded ? ' Show less' : '…Show more'}
              </button>
            )}
          </p>
        </div>
      )}

      {item.motions?.map((m, i) => (
        <div key={i} className={styles.tocBlock}>
          <span className={styles.tocLabelRow}>
            <span className={styles.tocLabel}>Motion</span>
            <BadgeStatus
              type={MOTION_BADGE[m.status]}
              label={MOTION_STATUS_LABEL[m.status]}
              iconRight={m.status === 'completed' ? <Ico svg={infoSvg} /> : undefined}
            />
          </span>
          <p className={styles.tocText}>{m.text}</p>
          {(m.status === 'completed' || m.status === 'in-progress') && m.progress != null && (
            <div className={styles.progressTrack} aria-hidden="true">
              <div className={styles.progressFill} style={{ width: `${m.progress}%` }} />
            </div>
          )}
        </div>
      ))}

      {(item.documents.length > 0 || (item.links?.length ?? 0) > 0) && (
        <div className={styles.tocDocs}>
          {item.documents.map(doc => {
            const active = doc.id === currentDocId
            const fd = book.flatDocs.find(f => f.doc.id === doc.id)!
            return (
              <div key={doc.id} className={[styles.docRow, active ? styles.docRowActive : ''].filter(Boolean).join(' ')}>
                <button type="button" className={styles.docRowMain} onClick={() => onSelectDoc(fd)}>
                  <span className={styles.docIcon} aria-hidden="true"><Ico svg={FORMAT_ICON[doc.sourceFormat]} /></span>
                  <span className={styles.docName}>{doc.name}</span>
                </button>
                <span className={styles.docActions} onClick={e => e.stopPropagation()}>
                  <ActionMenu size="s" items={docMenu(doc.name, false)} ariaLabel={`Options for ${doc.name}`} />
                </span>
              </div>
            )
          })}
          {item.links?.map(link => (
            <div key={link.id} className={styles.docRow}>
              <button type="button" className={styles.docRowMain}
                onClick={() => link.url && window.open(link.url, '_blank', 'noopener')}>
                <span className={styles.docIcon} aria-hidden="true"><Ico svg={linkSvg} /></span>
                <span className={styles.docName}>{link.name}</span>
              </button>
              <span className={styles.docActions} onClick={e => e.stopPropagation()}>
                <ActionMenu size="s" items={docMenu(link.name, true)} ariaLabel={`Options for ${link.name}`} />
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ── Compact nav (bottom-pill popover; tablet/phone default menu) ───────────── */
export function CompactNav({ book, currentDocId, onSelectItem, onSelectDoc }: {
  book: BoardBook
  currentDocId?: string
  onSelectItem: (item: BoardBookItem) => void
  onSelectDoc: (fd: FlatDoc) => void
}) {
  return (
    <div className={styles.compactNav}>
      {book.items.map(item => (
        <div key={item.id} className={styles.compactGroup}>
          <button type="button" className={styles.compactDivider} onClick={() => onSelectItem(item)}>
            {item.number}. {item.title}
          </button>
          {item.documents.map(doc => {
            const active = doc.id === currentDocId
            const fd = book.flatDocs.find(f => f.doc.id === doc.id)!
            return (
              <button key={doc.id} type="button"
                className={[styles.compactDoc, active ? styles.compactDocActive : ''].filter(Boolean).join(' ')}
                onClick={() => onSelectDoc(fd)} role="menuitem">
                <span className={styles.docIcon} aria-hidden="true"><Ico svg={FORMAT_ICON[doc.sourceFormat]} /></span>
                <span className={styles.docName}>{doc.name}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ── Search panel ──────────────────────────────────────────────────────────── */
export function SearchPanel({ book, onClose, onGoToPage }: {
  book: BoardBook
  onClose: () => void
  onGoToPage: (p: number) => void
}) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    if (!query.trim()) return []
    // Mocked hits: one per document, on a page inside it.
    return book.flatDocs.slice(0, 6).map((fd, i) => ({
      page: Math.min(fd.endPage, fd.startPage + i),
      docName: fd.doc.name,
      snippet: `…results referencing “${query}” appear in ${fd.item.title.toLowerCase()}…`,
    }))
  }, [query, book])

  return (
    <aside className={styles.sidePanel} aria-label="Search">
      <div className={styles.sidePanelHead}>
        <span className={styles.sidePanelTitle}>Search</span>
        <Button variant="tertiary" intent="neutral" size="s" iconOnly={<Ico svg={closeSvg} />}
          onClick={onClose} aria-label="Close search" />
      </div>
      <div className={styles.sidePanelBody}>
        <TextField
          size="m"
          placeholder="Search in board book"
          prefix={<Ico svg={searchSvg} />}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query.trim() === '' ? (
          <p className={styles.searchHint}>Search across every document in the board book.</p>
        ) : (
          <div className={styles.searchResults}>
            {results.map((r, i) => (
              <button key={i} type="button" className={styles.searchResult} onClick={() => onGoToPage(r.page)}>
                <span className={styles.searchResultMeta}>{r.docName} · page {r.page}</span>
                <span className={styles.searchResultSnippet}>{r.snippet}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

/* ── Ask AI panel ──────────────────────────────────────────────────────────── */
type ChatMsg = { role: 'user' | 'ai'; text: string; sources?: number[] }
const SEEDED_CHAT: ChatMsg[] = [
  {
    role: 'user',
    text: 'What specific cost management efforts led to the 5% decrease in operating expenses? Are these savings expected to continue in the upcoming quarters?',
  },
  {
    role: 'ai',
    text:
      'STAR Enterprises achieved a 5% decrease in operating expenses through measures like:\n\nVendor Negotiations: Secured lower prices from suppliers\nResource Management: Implemented energy-saving and waste reduction practices\nTechnology Integration: Used automation to cut labor costs\nFuture Savings: Some savings, like vendor contracts, may continue, while others could be one-off reductions.',
    sources: [1, 2, 3],
  },
]

/* Suggested prompts shown in the Suggestions dropdown — realistic board-book
   placeholders until real, per-item suggestions are wired in. */
const SUGGESTED_QUESTIONS = [
  'Summarize document',
  'Extract a table of contents',
  'Keywords',
  'What are the new timelines?',
  'What are the reasons?',
  'What are the new goals for business development?',
]

export function AiPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>(SEEDED_CHAT)
  const [draft, setDraft] = useState('')
  const [suggestOpen, setSuggestOpen] = useState(false)
  const footerRef = useRef<HTMLDivElement>(null)

  /* Existing question flow — used by the input and the suggestion chips. */
  const submit = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    setMessages(prev => [
      ...prev,
      { role: 'user', text },
      { role: 'ai', text: 'Based on the board book, here is a summary of the relevant sections addressing your question.', sources: [1, 2] },
    ])
    setDraft('')
  }

  /* Close the Suggestions dropdown on outside click or Escape. */
  useEffect(() => {
    if (!suggestOpen) return
    const onDown = (e: MouseEvent) => {
      if (!footerRef.current?.contains(e.target as Node)) setSuggestOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSuggestOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [suggestOpen])

  return (
    <aside className={styles.sidePanel} aria-label="Ask AI">
      <div className={styles.sidePanelHead}>
        <span className={styles.sidePanelTitle}>Ask AI</span>
        <Button variant="tertiary" intent="neutral" size="s" iconOnly={<Ico svg={closeSvg} />}
          onClick={onClose} aria-label="Close Ask AI" />
      </div>

      <div className={styles.aiDisclaimer}>
        <span className={styles.aiDisclaimerIcon} aria-hidden="true"><Ico svg={infoSvg} /></span>
        <span>Some answers could be inaccurate</span>
        <button type="button" className={styles.aiLearnMore}>Learn more</button>
      </div>

      <div className={styles.aiThread}>
        {messages.map((m, i) => (
          m.role === 'user' ? (
            <div key={i} className={styles.aiUser}>{m.text}</div>
          ) : (
            /* Ask AI answer (Figma 12645-151850): default = stone bubble; hover
               = hover-bg bubble + floating Regenerate / Copy toolbar. */
            <div key={i} className={styles.aiAnswerItem}>
              <div className={styles.aiAnswerRow}>
                <span className={styles.aiMark} aria-hidden="true"><Ico svg={aiSvg} /></span>
                <div className={styles.aiAnswer}>
                  {m.text.split('\n').filter(Boolean).map((line, j) => <p key={j}>{line}</p>)}
                  <div className={styles.aiAnswerActions}>
                    <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={rotateSvg} />}
                      aria-label="Regenerate answer" />
                    <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={copySvg} />}
                      onClick={() => navigator.clipboard?.writeText(m.text)} aria-label="Copy answer" />
                  </div>
                </div>
              </div>
              {m.sources && (
                <div className={styles.aiSources}>
                  <span>Sources:</span>
                  {m.sources.map(s => <button key={s} type="button" className={styles.aiSource}>{s}</button>)}
                </div>
              )}
            </div>
          )
        ))}
      </div>

      <div className={styles.aiFooter} ref={footerRef}>
        {suggestOpen ? (
          <div className={styles.suggestPanel} role="dialog" aria-label="Suggested questions">
            <div className={styles.suggestHead}>
              <span className={styles.suggestTitle}>Suggestions</span>
              <Button variant="tertiary" intent="neutral" size="s" iconOnly={<Ico svg={closeSvg} />}
                onClick={() => setSuggestOpen(false)} aria-label="Close suggestions" />
            </div>
            <div className={styles.suggestChips}>
              {SUGGESTED_QUESTIONS.map(q => (
                <Button key={q} variant="secondary" intent="default" size="s"
                  className={styles.suggestChip}
                  onClick={() => { submit(q); setSuggestOpen(false) }}>
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <Button variant="secondary" intent="neutral" size="s"
            aria-haspopup="dialog" aria-expanded={suggestOpen}
            onClick={() => setSuggestOpen(true)}>
            Suggestions
          </Button>
        )}

        <TextField
          size="m"
          className={styles.aiInput}
          placeholder="Ask anything"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(draft) }}
          suffix={
            <button type="button" tabIndex={-1} className={styles.aiSend}
              onClick={() => submit(draft)} aria-label="Send">
              <Ico svg={sendSvg} />
            </button>
          }
        />
      </div>
    </aside>
  )
}

/* ── Mocked PDF page surface ────────────────────────────────────────────────── */
/* A real rendered page when one is supplied, otherwise the mocked sheet. */
export function PdfPage({ image, ...props }: { doc: BoardBookDoc; localPage: number; globalPage: number; image?: string }) {
  if (!image) return <MockPdfPage {...props} />
  return (
    <img
      className={styles.pdfImage}
      src={image}
      alt={`${props.doc.name}, page ${props.localPage} of ${props.doc.pages}`}
      draggable={false}
    />
  )
}

export function MockPdfPage({ doc, localPage, globalPage }: { doc: BoardBookDoc; localPage: number; globalPage: number }) {
  const isFinancialCover = doc.id === 'doc-financial' && localPage === 1
  return (
    <div className={styles.pdfSheet}>
      <div className={styles.pdfWatermark} aria-hidden="true">{doc.name} · page {localPage} of {doc.pages}</div>
      {isFinancialCover ? <FinancialCover /> : <GenericPage doc={doc} localPage={localPage} globalPage={globalPage} />}
    </div>
  )
}

function FinancialCover() {
  return (
    <div className={styles.pdfContent}>
      <dl className={styles.pdfDefs}>
        <div><dt>Agenda Item:</dt><dd>Financial Performance: Growth Indicators</dd></div>
        <div><dt>Prepared by:</dt><dd>Liam Wilson</dd></div>
        <div><dt>Item Duration:</dt><dd>30min</dd></div>
        <div><dt>Objective:</dt><dd>To review the company&rsquo;s financial performance for Q3 and discuss strategic initiatives for the next fiscal quarter.</dd></div>
      </dl>

      <h3 className={styles.pdfHeading}>Executive Summary</h3>
      <p className={styles.pdfPara}>
        This paper provides an overview of STAR Enterprises&rsquo;s financial performance for the third quarter,
        comparing it to the previous quarter and the same period last year. Key focus areas include revenue
        growth, operational expenses, profit margins, and strategic projects intended to drive future growth.
      </p>

      <h3 className={styles.pdfHeading}>Key Performance Metrics:</h3>
      <ul className={styles.pdfList}>
        <li>Revenue: Q3 revenue grew by 8% year-over-year but remained flat quarter-over-quarter.</li>
        <li>Expenses: Operating expenses decreased by 5% compared to Q2 due to cost management efforts.</li>
        <li>Net Profit: The net profit margin increased by 2% due to cost reductions and efficiency improvements.</li>
      </ul>

      <div className={styles.pdfFigures}>
        <figure className={styles.pdfFigure}><div className={styles.pdfChart} aria-hidden="true" /><figcaption>Revenue vs. Expenses — Q3 Comparison</figcaption></figure>
        <figure className={styles.pdfFigure}><div className={styles.pdfChart} aria-hidden="true" /><figcaption>Strategic Project Budget Allocation (Q3)</figcaption></figure>
      </div>

      <h3 className={styles.pdfHeading}>Expansion into New Markets</h3>
      <ul className={styles.pdfList}>
        <li>Objective: Expand operations in [specific region/country] by Q2 next year.</li>
        <li>Progress: On track, with market research phase completed and pilot programs underway.</li>
        <li>Budget: Under budget by 15% in Q3 due to renegotiated contracts.</li>
      </ul>
    </div>
  )
}

const PARAS = [
  'The Board is invited to consider the matters set out in this section, taking into account the strategic priorities agreed at the previous meeting and the recommendations of the relevant committee.',
  'Management has reviewed the underlying assumptions and confirms that the figures presented remain consistent with the approved budget and the latest reforecast circulated to members.',
  'Key risks have been assessed against the organisation&rsquo;s risk appetite. Mitigating actions are in place and are monitored monthly by the executive team, with material changes escalated to the Board.',
  'The following section summarises progress against each of the agreed objectives, highlighting areas that require the Board&rsquo;s attention or a formal decision at this meeting.',
]

function GenericPage({ doc, localPage, globalPage }: { doc: BoardBookDoc; localPage: number; globalPage: number }) {
  // Deterministic content so paging back and forth is stable.
  const showFigure = (globalPage % 3) === 0
  return (
    <div className={styles.pdfContent}>
      <h3 className={styles.pdfHeading}>{doc.name.replace(/\.[^.]+$/, '')}</h3>
      <p className={styles.pdfSubtle}>Section {localPage}</p>
      {PARAS.map((p, i) => (
        <p key={i} className={styles.pdfPara} dangerouslySetInnerHTML={{ __html: p }} />
      )).slice(0, showFigure ? 2 : 4)}
      {showFigure && (
        <figure className={styles.pdfFigure}><div className={styles.pdfChart} aria-hidden="true" /><figcaption>Figure {localPage}.1 — supporting data</figcaption></figure>
      )}
      {showFigure && PARAS.slice(2).map((p, i) => (
        <p key={i} className={styles.pdfPara} dangerouslySetInnerHTML={{ __html: p }} />
      ))}
    </div>
  )
}

/* ── helpers ───────────────────────────────────────────────────────────────── */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase() || '?'
}
function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n).trimEnd() + ' ' : s
}
