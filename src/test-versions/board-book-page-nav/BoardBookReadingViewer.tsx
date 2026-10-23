/* BoardBookReadingViewer — Test versions › Version 3 "Reading mode".

   The document takes the whole content area; everything else gets out of the
   way:
     • top bar — table of content toggle · document dropdown (as in V2) |
       search · download · Ask AI
     • floating control bar (bottom) — prev doc · prev · page / total · next ·
       next doc | zoom out ·
       % · zoom in | fit width · focus mode | highlight · comment. Always visible.
       Phone (<768px): zoom, fit, focus and annotations fold into a dots
       "Document tools" button at the end of the bar, which opens the same
       bottom sheet as Version 2 (DocumentToolsSheet) — Zoom − % +, Fit to
       width, Fit to page, Actual size, Fullscreen | Highlight, Add comment.
       Previous / next document (‹‹ ››) flank the page arrows
     • agenda (table of contents) panel on the left — the same resizable
       panel as V1 / V2, closed by default so the document has the room
     • keyboard — ← / → turn pages, Esc leaves focus mode (document only,
       full screen; turned on from the bottom bar)
   Pages are laid out continuously (PageStack), as in V1 and V2. */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { actions } from '../../icons/actions'
import { arrows } from '../../icons/arrows'
import { communication } from '../../icons/communication'
import { fileFormat } from '../../icons/fileFormat'
import { custom } from '../../icons/custom'
import { functional } from '../../icons/functional'
import {
  MOCK_BOARD_BOOK,
  docAtPage,
  firstDocOfItem,
  type BoardBook,
  type BoardBookDoc,
  type BoardBookItem,
  type FlatDoc,
} from '../../meeting/BoardBook/boardBookData'
import { AiPanel, CompactNav, PdfPage, SearchPanel, TocPanel } from './BoardBookPageNavViewer'
import { PageStack, pageAtScroll, scrollToPage, type CommentPin } from './PageStack'
import { useTocAutoCollapse } from './useTocAutoCollapse'
import { DocumentToolsSheet } from './DocumentToolsSheet'
import { Q4_PAGE_RATIO } from './q4BoardPack'
import styles from './BoardBookReadingViewer.module.css'

const icon = (set: { name: string; svg: string }[], name: string) =>
  set.find(i => i.name === name)!.svg

const tocOpenSvg    = icon(actions, 'sidebar-opened')
const tocClosedSvg  = icon(actions, 'sidebar-closed')
const prevSvg       = icon(arrows, 'angle-left-b')
const nextSvg       = icon(arrows, 'angle-right-b')
/* Document stepping = skip icons (|< and >|), distinct from the page chevrons. */
const prevDocSvg    = icon(custom, 'skip-previous')
const nextDocSvg    = icon(custom, 'skip-next')
const zoomInSvg     = icon(actions, 'zoom-in')
const zoomOutSvg    = icon(actions, 'zoom-out')
const fitWidthSvg   = icon(actions, 'with-width')
const highlightSvg  = icon(actions, 'hightlight')
const commentSvg    = icon(communication, 'comment')
const searchSvg     = icon(actions, 'search')
const downloadSvg   = icon(actions, 'download-alt')
const aiSvg         = icon(actions, 'sparkles')
const focusSvg      = icon(arrows, 'arrow-resize-diagonal')
const fitPageSvg    = icon(actions, 'fit-page')
const actualSizeSvg = icon(arrows, 'arrow-resize-back-diagonal')
const toolsSvg      = icon(functional, 'drag')
const chevronUpSvg  = icon(arrows, 'angle-up-fill')
const chevronDownSvg = icon(arrows, 'angle-down-fill')

const FORMAT_ICON: Record<BoardBookDoc['sourceFormat'], string> = {
  pdf:  icon(fileFormat, 'format-pdf'),
  word: icon(fileFormat, 'format-word'),
  xlsx: icon(fileFormat, 'format-xlsx'),
  ppt:  icon(fileFormat, 'format-ppt'),
  txt:  icon(fileFormat, 'format-txt'),
}

const Ico = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)

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

const ZOOM_MIN = 25
const ZOOM_MAX = 200
const ZOOM_STEP = 10
/** Sheet width at 100% and the page aspect ratio (US Letter, as the pack). */
const PAGE_WIDTH = 635
const TOC_MIN = 460
const TOC_MAX = 640

type Fit = 'none' | 'width' | 'page'
type Tool = 'none' | 'highlight' | 'comment'
type RightPanel = null | 'search' | 'ai'

export interface BoardBookReadingViewerProps {
  book?: BoardBook
  /** Rendered image of a global page (real PDF); falls back to the mock sheet. */
  pageImage?: (page: number) => string | undefined
}

export default function BoardBookReadingViewer({ book = MOCK_BOARD_BOOK, pageImage }: BoardBookReadingViewerProps) {
  const isNarrow = useMediaQuery('(max-width: 767px)')

  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [fit, setFit] = useState<Fit>('none')
  const [tool, setTool] = useState<Tool>('none')
  const [comments, setComments] = useState<CommentPin[]>([])
  const [rightPanel, setRightPanel] = useState<RightPanel>(null)
  const [tocOpen, setTocOpen] = useState(false)
  const [tocWidth, setTocWidth] = useState(TOC_MIN)
  const [navPopoverOpen, setNavPopoverOpen] = useState(false)
  const [focus, setFocus] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  /* Small desktop: a side panel collapses the agenda so the page stays readable. */
  const markTocManual = useTocAutoCollapse(rightPanel !== null, setTocOpen)
  /* Scroll box content size — drives fit width / fit page. */
  const [box, setBox] = useState({ w: 0, h: 0 })

  const scrollRef = useRef<HTMLDivElement>(null)
  const commentSeq = useRef(0)
  const pageRef = useRef(page); pageRef.current = page

  const clampPage = useCallback(
    (p: number) => Math.min(book.totalPages, Math.max(1, p)),
    [book.totalPages],
  )
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

  const current = useMemo(() => docAtPage(book, page), [book, page])
  /* Document-level navigation — the only way across a document boundary
     besides "next page" on the last page (the document itself can't carry it). */
  const prevDoc = current ? book.flatDocs[current.index - 1] : undefined
  const nextDoc = current ? book.flatDocs[current.index + 1] : undefined

  /* ── Sheet width: fixed zoom, fit width or fit page (from the box size). ── */
  const [ratioW, ratioH] = Q4_PAGE_RATIO.split('/').map(Number)
  const sheetWidth =
    fit === 'width' ? box.w
      : fit === 'page' ? Math.min(box.w, box.h * (ratioW / ratioH))
      : Math.min(box.w, PAGE_WIDTH) * (zoom / 100)
  /* % is relative to the page's 100% width — 635px, or the screen width when
     that is narrower (phones) — so 100% never reads as "54%" on a phone and
     zoom steps always move in the expected direction. */
  const baseWidth = Math.min(box.w, PAGE_WIDTH) || PAGE_WIDTH
  const zoomPct = Math.round((sheetWidth / baseWidth) * 100) || zoom

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const measure = () => {
      const cs = getComputedStyle(el)
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      setBox(prev => (prev.w === w && prev.h === h ? prev : { w, h }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* Keep the current page anchored whenever the sheets resize. */
  useLayoutEffect(() => {
    scrollToPage(scrollRef.current, pageRef.current)
  }, [sheetWidth, focus, tocOpen, tocWidth])

  const startResize = (e: React.PointerEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = tocWidth
    const onMove = (ev: PointerEvent) =>
      setTocWidth(Math.min(TOC_MAX, Math.max(TOC_MIN, startW + (ev.clientX - startX))))
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const onCanvasScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const p = pageAtScroll(el)
    if (p && p !== pageRef.current) setPage(p)
  }

  /* ── Keyboard: ← / → pages, Esc leaves focus mode. ─────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el && (['INPUT', 'TEXTAREA'].includes(el.tagName) || (el as HTMLElement).isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goToPage(pageRef.current + 1) }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goToPage(pageRef.current - 1) }
      else if (e.key === 'Escape') setFocus(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goToPage])

  const zoomBy = (delta: number) => {
    setFit('none')
    setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(zoomPct / ZOOM_STEP) * ZOOM_STEP + delta)))
  }
  const toggleFit = (f: Exclude<Fit, 'none'>) => setFit(prev => (prev === f ? 'none' : f))
  const toggleTool = (t: Exclude<Tool, 'none'>) => setTool(prev => (prev === t ? 'none' : t))
  const toggleRightPanel = (p: Exclude<RightPanel, null>) =>
    setRightPanel(prev => (prev === p ? null : p))

  const selectDoc = (fd: FlatDoc) => { goToPage(fd.startPage); setNavPopoverOpen(false) }
  const selectItem = (item: BoardBookItem) => {
    const fd = firstDocOfItem(book, item.id)
    if (fd) selectDoc(fd)
  }

  const barBtn = (label: string, svg: string, onClick: () => void, opts: { active?: boolean; disabled?: boolean } = {}) => (
    <Tooltip label={label} position="top">
      <Button
        variant="tertiary" intent="neutral" size="m"
        aria-pressed={opts.active}
        data-state={opts.active ? 'active' : undefined}
        disabled={opts.disabled}
        iconOnly={<Ico svg={svg} />}
        onClick={onClick}
        aria-label={label}
      />
    </Tooltip>
  )

  return (
    <div className={[styles.viewer, focus ? styles.focus : ''].filter(Boolean).join(' ')}>
      {/* ── Agenda (table of contents) panel — hidden in focus mode ─────── */}
      {tocOpen && !focus && (
        <>
          <nav className={styles.toc} style={{ width: tocWidth }} aria-label="Board book contents">
            <TocPanel book={book} currentDocId={current?.doc.id} onSelectItem={selectItem} onSelectDoc={selectDoc} onAskAi={() => setRightPanel('ai')} />
          </nav>
          <div className={styles.resizer} role="separator" aria-orientation="vertical"
            aria-label="Resize contents panel" onPointerDown={startResize} />
        </>
      )}

      <div className={styles.main}>
        {/* ── Top bar (hidden in focus mode) ────────────────────────────── */}
        {!focus && (
          <div className={styles.topBar}>
            <Tooltip label="Table of content" position="bottom">
              <Button
                variant="tertiary" intent="neutral" size="m"
                aria-pressed={tocOpen}
                data-state={tocOpen ? 'active' : undefined}
                iconOnly={<Ico svg={tocOpen ? tocOpenSvg : tocClosedSvg} />}
                onClick={() => { markTocManual(); setTocOpen(o => !o) }}
                aria-label="Toggle table of content"
              />
            </Tooltip>

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

            <div className={styles.topBarActions}>
              <Tooltip label="Search" position="bottom">
                <Button variant="tertiary" intent="neutral" size="m"
                  aria-pressed={rightPanel === 'search'}
                  data-state={rightPanel === 'search' ? 'active' : undefined}
                  iconOnly={<Ico svg={searchSvg} />}
                  onClick={() => toggleRightPanel('search')} aria-label="Search the board book" />
              </Tooltip>
              <Tooltip label="Download" position="bottom">
                <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={downloadSvg} />}
                  onClick={() => console.log('download board book')} aria-label="Download" />
              </Tooltip>
              <Tooltip label="Ask AI" position="bottom">
                <Button variant="tertiary" intent="neutral" size="m"
                  aria-pressed={rightPanel === 'ai'}
                  data-state={rightPanel === 'ai' ? 'active' : undefined}
                  iconOnly={<Ico svg={aiSvg} />}
                  onClick={() => toggleRightPanel('ai')} aria-label="Ask AI" />
              </Tooltip>
            </div>
          </div>
        )}

        {/* ── Canvas ────────────────────────────────────────────────────── */}
        <div className={styles.canvasArea}>
          <div ref={scrollRef} className={styles.canvasScroll} onScroll={onCanvasScroll}>
            <PageStack
              book={book}
              page={page}
              style={{ width: sheetWidth || undefined }}
              cursorClassName={
                tool === 'comment' ? styles.pageCommenting
                  : tool === 'highlight' ? styles.pageAnnotating
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

          {/* Floating control bar — always visible. */}
          <div
            className={styles.controlBar}
            role="toolbar"
            aria-label="Reading controls"
          >
            <div className={styles.barGroup}>
              {barBtn(prevDoc ? `Previous document: ${prevDoc.doc.name}` : 'Previous document', prevDocSvg,
                () => prevDoc && goToPage(prevDoc.startPage), { disabled: !prevDoc })}
              {barBtn('Previous page', prevSvg, () => goToPage(page - 1), { disabled: page <= 1 })}
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
              {barBtn('Next page', nextSvg, () => goToPage(page + 1), { disabled: page >= book.totalPages })}
              {barBtn(nextDoc ? `Next document: ${nextDoc.doc.name}` : 'Next document', nextDocSvg,
                () => nextDoc && goToPage(nextDoc.startPage), { disabled: !nextDoc })}
            </div>

            {!isNarrow && (
              <>
                <span className={styles.barDivider} aria-hidden="true" />
                <div className={styles.barGroup}>
                  {barBtn('Zoom out', zoomOutSvg, () => zoomBy(-ZOOM_STEP), { disabled: zoomPct <= ZOOM_MIN })}
                  <span className={styles.zoomValue} aria-live="polite">{zoomPct}%</span>
                  {barBtn('Zoom in', zoomInSvg, () => zoomBy(ZOOM_STEP), { disabled: zoomPct >= ZOOM_MAX })}
                </div>
              </>
            )}

            <span className={styles.barDivider} aria-hidden="true" />

            {/* Narrow (<768): zoom, fit and annotation tools collapse into a "⋯"
                menu that opens upward, so the bar (with page and document
                navigation) fits a 375px screen. */}
            {isNarrow ? (
              barBtn('Document tools', toolsSvg, () => setToolsOpen(true), { active: tool !== 'none' })
            ) : (
              <>
                <div className={styles.barGroup}>
                  {barBtn('Fit width', fitWidthSvg, () => toggleFit('width'), { active: fit === 'width' })}
                  {barBtn('Focus mode', focusSvg, () => setFocus(f => !f), { active: focus })}
                </div>

                <span className={styles.barDivider} aria-hidden="true" />

                <div className={styles.barGroup}>
                  {barBtn('Highlight', highlightSvg, () => toggleTool('highlight'), { active: tool === 'highlight' })}
                  {barBtn('Comment', commentSvg, () => toggleTool('comment'), { active: tool === 'comment' })}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Phone "Document tools" sheet (shared with Version 2). */}
      {isNarrow && (
        <DocumentToolsSheet
          open={toolsOpen}
          onClose={() => setToolsOpen(false)}
          zoomLabel={`${zoomPct}%`}
          canZoomOut={zoomPct > ZOOM_MIN}
          canZoomIn={zoomPct < ZOOM_MAX}
          onZoomOut={() => zoomBy(-ZOOM_STEP)}
          onZoomIn={() => zoomBy(ZOOM_STEP)}
          viewRows={[
            { key: 'fit-width', label: 'Fit to width', icon: fitWidthSvg, selected: fit === 'width', onPick: () => setFit('width') },
            { key: 'fit-page', label: 'Fit to page', icon: fitPageSvg, selected: fit === 'page', onPick: () => setFit('page') },
            { key: 'actual', label: 'Actual size (100%)', icon: actualSizeSvg, selected: fit === 'none' && zoom === 100,
              onPick: () => { setFit('none'); setZoom(100) } },
            { key: 'fullscreen', label: 'Fullscreen', icon: focusSvg, selected: focus, onPick: () => setFocus(f => !f) },
          ]}
          toolRows={[
            { key: 'highlight', label: 'Highlight', icon: highlightSvg, selected: tool === 'highlight', onPick: () => toggleTool('highlight') },
            { key: 'comment', label: 'Add comment', icon: commentSvg, selected: tool === 'comment', onPick: () => toggleTool('comment') },
          ]}
        />
      )}

      {rightPanel === 'search' && (
        <SearchPanel book={book} onClose={() => setRightPanel(null)} onGoToPage={goToPage} />
      )}
      {rightPanel === 'ai' && <AiPanel onClose={() => setRightPanel(null)} />}
    </div>
  )
}
