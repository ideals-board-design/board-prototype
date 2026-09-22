/* BoardBookViewer — the Board book tab's PDF reading experience
   (Figma 12970-219379).

   A published board book concatenates every agenda item's attachments (converted
   to PDF) into one continuous document. This prototype reproduces the
   PSPDFKit-style chrome around a mocked PDF surface:
     • a resizable Table-of-content panel (open by default on web, a bottom-pill
       popover on tablet/phone)
     • a toolbar: TOC toggle · zoom · fit-width · full-screen | draw · highlight ·
       comment · download
     • a floating bottom pill: prev / next, a document switcher, and one
       continuous page counter across all documents ("9 / 310")
     • Search and Ask-AI side panels reached from the right rail
   Navigation, continuous pagination and keyboard forward/back are real; the
   annotation tools, Search and Ask-AI are visual chrome with light interactivity
   (per the agreed prototype scope). */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { BadgeStatus } from '../../components/BadgeStatus/BadgeStatus'
import { Avatar } from '../../components/Avatar/Avatar'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { TextField } from '../../components/TextField/TextField'
import { ActionMenu, type ActionMenuItem } from '../ActionMenu'
import { actions } from '../../icons/actions'
import { arrows } from '../../icons/arrows'
import { communication } from '../../icons/communication'
import { files } from '../../icons/files'
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
} from './boardBookData'
import styles from './BoardBookViewer.module.css'

/* ── Icons (DS sets only) ──────────────────────────────────────────────────── */
const icon = (set: { name: string; svg: string }[], name: string) =>
  set.find(i => i.name === name)!.svg

const tocSvg        = icon(files, 'columns')
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
const prevSvg       = icon(arrows, 'angle-left-b')
const nextSvg       = icon(arrows, 'angle-right-b')
const chevronUpSvg  = icon(arrows, 'angle-up-fill')
const chevronDownSvg = icon(arrows, 'angle-down-fill')
const closeSvg      = icon(actions, 'close')
const infoSvg       = icon(condition, 'info-circle')
const sendSvg       = icon(custom, 'send')
const linkSvg       = icon(actions, 'link')
const editSvg       = icon(actions, 'edit-alt')
const copySvg       = icon(actions, 'copy')

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
type CommentPin = { id: number; x: number; y: number; page: number }

export interface BoardBookViewerProps {
  book?: BoardBook
  /** Whether the secretary has published the board book. */
  published?: boolean
  /** Quick-preview target — a document name opened from the agenda. */
  initialDocName?: string | null
}

export default function BoardBookViewer({
  book = MOCK_BOARD_BOOK,
  published = true,
  initialDocName = null,
}: BoardBookViewerProps) {
  const isCompact = useMediaQuery('(max-width: 1023px)')

  const [page, setPage] = useState(1)
  const [tocOpen, setTocOpen] = useState(!isCompact)
  const [tocWidth, setTocWidth] = useState(TOC_MIN)
  const [rightPanel, setRightPanel] = useState<RightPanel>(null)
  const [navPopoverOpen, setNavPopoverOpen] = useState(false)
  const [tool, setTool] = useState<AnnotationTool>('none')
  const [zoom, setZoom] = useState(100)
  const [fitWidth, setFitWidth] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [comments, setComments] = useState<CommentPin[]>([])

  const canvasRef = useRef<HTMLDivElement>(null)
  const commentSeq = useRef(0)

  const clampPage = useCallback(
    (p: number) => Math.min(book.totalPages, Math.max(1, p)),
    [book.totalPages],
  )
  const goToPage = useCallback((p: number) => setPage(clampPage(p)), [clampPage])

  const current = useMemo(() => docAtPage(book, page), [book, page])
  const localPage = current ? page - current.startPage + 1 : 0

  /* ── The TOC panel follows the viewport: open on web, closed (popover) on
     tablet/phone. Only reset when the breakpoint actually flips. ────────────── */
  useEffect(() => { setTocOpen(!isCompact) }, [isCompact])

  /* ── Quick preview: jump to the opened attachment's first page. ───────────── */
  useEffect(() => {
    if (!initialDocName) return
    const fd = flatDocByName(book, initialDocName)
    if (fd) setPage(fd.startPage)
  }, [initialDocName, book])

  /* ── Keyboard forward/back (web only, and never while typing in a field). ──── */
  useEffect(() => {
    if (isCompact) return
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el && ['INPUT', 'TEXTAREA'].includes(el.tagName)) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goToPage(page + 1) }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goToPage(page - 1) }
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

  const onCanvasClick = (e: React.MouseEvent) => {
    if (tool !== 'comment' || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setComments(prev => [...prev, { id: ++commentSeq.current, x, y, page }])
  }

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

  const pageComments = comments.filter(c => c.page === page)

  return (
    <div className={[styles.viewer, fullscreen ? styles.fullscreen : ''].filter(Boolean).join(' ')}>
      {/* ── Table of content panel (web: inline & resizable) ──────────────── */}
      {tocOpen && !isCompact && (
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
        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <Tooltip label="Table of content" position="bottom">
              <Button
                variant="tertiary" intent="neutral" size="m"
                aria-pressed={tocOpen}
                data-state={tocOpen ? 'active' : undefined}
                iconOnly={<Ico svg={tocSvg} />}
                onClick={() => (isCompact ? setNavPopoverOpen(o => !o) : setTocOpen(o => !o))}
                aria-label="Toggle table of content"
              />
            </Tooltip>
            <Tooltip label="Zoom in" position="bottom">
              <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={zoomInSvg} />}
                onClick={() => { setFitWidth(false); setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP)) }}
                aria-label="Zoom in" />
            </Tooltip>
            <Tooltip label="Zoom out" position="bottom">
              <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={zoomOutSvg} />}
                onClick={() => { setFitWidth(false); setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP)) }}
                aria-label="Zoom out" />
            </Tooltip>
            <Tooltip label="Fit width" position="bottom">
              <Button variant="tertiary" intent="neutral" size="m"
                aria-pressed={fitWidth}
                data-state={fitWidth ? 'active' : undefined}
                iconOnly={<Ico svg={fitWidthSvg} />}
                onClick={() => setFitWidth(f => !f)} aria-label="Fit page width" />
            </Tooltip>
            <Tooltip label="Full screen" position="bottom">
              <Button variant="tertiary" intent="neutral" size="m"
                aria-pressed={fullscreen}
                data-state={fullscreen ? 'active' : undefined}
                iconOnly={<Ico svg={fullscreenSvg} />}
                onClick={() => setFullscreen(f => !f)} aria-label="Toggle full screen" />
            </Tooltip>
          </div>

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
          </div>
        </div>

        {/* ── PDF canvas ──────────────────────────────────────────────────── */}
        <div className={styles.canvasArea}>
          <div className={styles.canvasScroll}>
            <div
              ref={canvasRef}
              className={[
                styles.page,
                fitWidth ? styles.pageFit : '',
                tool === 'comment' ? styles.pageCommenting : '',
                tool === 'draw' || tool === 'highlight' ? styles.pageAnnotating : '',
              ].filter(Boolean).join(' ')}
              style={fitWidth ? undefined : { width: `calc(720px * ${zoom / 100})` }}
              onClick={onCanvasClick}
            >
              {current && <MockPdfPage doc={current.doc} localPage={localPage} globalPage={page} />}
              {pageComments.map((c, i) => (
                <span key={c.id} className={styles.commentPin} style={{ left: `${c.x}%`, top: `${c.y}%` }} aria-hidden="true">
                  {i + 1}
                </span>
              ))}
            </div>
          </div>

          {/* ── Floating bottom pill: prev / doc switcher / next | counter ──── */}
          <div className={styles.pill}>
            <button type="button" className={styles.navBtn}
              disabled={page <= 1} onClick={() => goToPage(page - 1)} aria-label="Previous page">
              <span className={styles.navBtnIcon} aria-hidden="true"><Ico svg={prevSvg} /></span>
            </button>

            <div className={styles.pillDocWrap}>
              <button
                type="button"
                className={styles.pillDoc}
                onClick={() => setNavPopoverOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={navPopoverOpen}
              >
                {current && <span className={styles.pillDocIcon} aria-hidden="true"><Ico svg={FORMAT_ICON[current.doc.sourceFormat]} /></span>}
                <span className={styles.pillDocName}>{current?.doc.name}</span>
                <span className={styles.pillChevron} aria-hidden="true"><Ico svg={navPopoverOpen ? chevronUpSvg : chevronDownSvg} /></span>
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

            <button type="button" className={styles.navBtn}
              disabled={page >= book.totalPages} onClick={() => goToPage(page + 1)} aria-label="Next page">
              <span className={styles.navBtnIcon} aria-hidden="true"><Ico svg={nextSvg} /></span>
            </button>

            <span className={styles.pillDivider} aria-hidden="true" />

            <div className={styles.pillCount}>
              <input
                className={styles.pillPageInput}
                type="text"
                inputMode="numeric"
                value={page}
                aria-label="Current page"
                onChange={e => {
                  const n = Number(e.target.value.replace(/\D/g, ''))
                  if (n) goToPage(n)
                }}
              />
              <span className={styles.pillTotal}>/ {book.totalPages}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right side panel (Search / Ask AI) ────────────────────────────── */}
      {rightPanel === 'search' && (
        <SearchPanel book={book} onClose={() => setRightPanel(null)} onGoToPage={goToPage} />
      )}
      {rightPanel === 'ai' && <AiPanel onClose={() => setRightPanel(null)} />}

      {/* ── Far-right rail ────────────────────────────────────────────────── */}
      <div className={styles.rail}>
        <Tooltip label="Search" position="left">
          <Button variant="tertiary" intent="neutral" size="m"
            aria-pressed={rightPanel === 'search'}
            data-state={rightPanel === 'search' ? 'active' : undefined}
            iconOnly={<Ico svg={searchSvg} />}
            onClick={() => toggleRightPanel('search')} aria-label="Search the board book" />
        </Tooltip>
        <Tooltip label="Ask AI" position="left">
          <Button variant="tertiary" intent="neutral" size="m"
            aria-pressed={rightPanel === 'ai'}
            data-state={rightPanel === 'ai' ? 'active' : undefined}
            iconOnly={<Ico svg={aiSvg} />}
            onClick={() => toggleRightPanel('ai')} aria-label="Ask AI" />
        </Tooltip>
      </div>
    </div>
  )
}

/* ── Table-of-content panel (rich, web) ────────────────────────────────────── */
function TocPanel({ book, currentDocId, onSelectItem, onSelectDoc, onAskAi }: {
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

/* Placeholder continuation shown when a description is expanded (real board
   documents carry the full copy; here we complete the excerpt sensibly). */
const DESC_CONTINUATION =
  ' Members are asked to raise any final corrections before the item is put to a vote, and to note the supporting documents attached below, which have been circulated in advance of the meeting.'

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
  const isLong = desc.length > 120
  const fullDesc = desc + (expanded ? DESC_CONTINUATION : '')

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
            {expanded || !isLong ? fullDesc : truncate(desc, 120)}
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
function CompactNav({ book, currentDocId, onSelectItem, onSelectDoc }: {
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
function SearchPanel({ book, onClose, onGoToPage }: {
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

function AiPanel({ onClose }: { onClose: () => void }) {
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
            <div key={i} className={styles.aiAnswerRow}>
              <span className={styles.aiMark} aria-hidden="true"><Ico svg={aiSvg} /></span>
              <div className={styles.aiAnswer}>
                {m.text.split('\n').filter(Boolean).map((line, j) => <p key={j}>{line}</p>)}
                {m.sources && (
                  <div className={styles.aiSources}>
                    <span>Sources:</span>
                    {m.sources.map(s => <button key={s} type="button" className={styles.aiSource}>{s}</button>)}
                  </div>
                )}
              </div>
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
function MockPdfPage({ doc, localPage, globalPage }: { doc: BoardBookDoc; localPage: number; globalPage: number }) {
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
