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
   Pages are laid out continuously (PageStack), as in V1 and V2.

   Version 4 (toolsIn="top", based on Figma 32290-235596) is this viewer with
   the annotation tools (highlight · comment) moved into the top bar, before
   Search · Download · Ask AI; the bottom bar keeps page / document navigation,
   zoom, fit width and focus mode. On phones it uses the Version 3 layout
   (dots "Document tools").

   Version 5 (toolsIn="cards") follows a document-viewer layout with floating
   side cards: top bar — agenda toggle · document dropdown | ‹ document N of
   M › · Download; left bottom card — page [N] / total, zoom in,
   zoom % (opens a zoom menu: input, Fit to page, Fit to width, 50–200%),
   zoom out, fullscreen; right top card — Search, Ask AI, Highlight, Comment.
   Phones use the Version 3 layout.

   Version 6 (toolsIn="single", based on Figma 32301-237198 / 32301-237141)
   puts every tool in one top bar, with no bottom bar: agenda toggle ·
   document dropdown (hidden while the agenda is open — the agenda lists the
   documents) | prev doc · prev · page / total · next · next doc | zoom out ·
   % · zoom in | fit width · focus mode | comment · drawing · highlight |
   search · download · Ask AI. The top bar stays in focus mode, since it holds
   the way back. Phones use the Version 3 layout. */

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

/** Version 6: narrowest viewer width that fits the whole top bar. */
const SINGLE_BAR_MIN = 760

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
const drawingSvg    = icon(actions, 'drawing')
const commentSvg    = icon(communication, 'comment')
const searchSvg     = icon(actions, 'search')
const downloadSvg   = icon(actions, 'download-alt')
const aiSvg         = icon(actions, 'sparkles')
const focusSvg      = icon(arrows, 'arrow-resize-diagonal')
const fitPageSvg    = icon(actions, 'fit-page')
const actualSizeSvg = icon(arrows, 'arrow-resize-back-diagonal')
const toolsSvg      = icon(functional, 'ellipsis-h')
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
type Tool = 'none' | 'highlight' | 'comment' | 'draw'
type RightPanel = null | 'search' | 'ai'

export interface BoardBookReadingViewerProps {
  book?: BoardBook
  /** Rendered image of a global page (real PDF); falls back to the mock sheet. */
  pageImage?: (page: number) => string | undefined
  /** Where the tools live on desktop: in the bottom bar (Version 3, default),
      annotations in the top bar (Version 4), floating side cards (Version 5),
      or everything in one top bar (Version 6). */
  toolsIn?: 'bar' | 'top' | 'cards' | 'single'
}

export default function BoardBookReadingViewer({ book = MOCK_BOARD_BOOK, pageImage, toolsIn = 'bar' }: BoardBookReadingViewerProps) {
  const isNarrow = useMediaQuery('(max-width: 767px)')
  /* Version 4 on tablet / desktop: annotations in the top bar. */
  const toolsTop = toolsIn === 'top' && !isNarrow
  /* Version 5 on tablet / desktop: floating side cards instead of the bar. */
  const cards = toolsIn === 'cards' && !isNarrow
  /* Version 6 on tablet / desktop: one top bar, no bottom bar. */
  const single = toolsIn === 'single' && !isNarrow
  /* Version 6 when the viewer is too narrow for the whole bar: zoom, fit /
     focus and annotations fold into the dots "Document tools" button, as on
     phones in the other versions. */
  const mainRef = useRef<HTMLDivElement>(null)
  const [mainWidth, setMainWidth] = useState(0)
  useLayoutEffect(() => {
    const el = mainRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setMainWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const singleCompact = single && mainWidth > 0 && mainWidth < SINGLE_BAR_MIN
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false)
  const zoomMenuRef = useRef<HTMLDivElement>(null)
  const [zoomDraft, setZoomDraft] = useState('')

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
  const markTocManual = useTocAutoCollapse(rightPanel !== null, setTocOpen, () => setRightPanel(null))
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

  useEffect(() => {
    if (!zoomMenuOpen) return
    const onDown = (e: MouseEvent) => { if (!zoomMenuRef.current?.contains(e.target as Node)) setZoomMenuOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoomMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [zoomMenuOpen])
  const setZoomTo = (pct: number) => { setFit('none'); setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, pct))); setZoomMenuOpen(false) }
  const applyZoomDraft = () => { const n = parseInt(zoomDraft.match(/\d+/)?.[0] ?? '', 10); if (n) setZoomTo(n) }

  const barBtn = (label: string, svg: string, onClick: () => void, opts: { active?: boolean; disabled?: boolean; tip?: 'top' | 'bottom' | 'left' | 'right' } = {}) => (
    <Tooltip label={label} position={opts.tip ?? 'top'}>
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

      <div ref={mainRef} className={styles.main}>
        {/* ── Top bar (hidden in focus mode) ────────────────────────────── */}
        {(!focus || single) && (
          <div className={[styles.topBar, single ? styles.topBarSingle : ''].filter(Boolean).join(' ')}>
            {!focus && (
            <Tooltip label="Table of content" position="bottom">
              <Button
                variant="tertiary" intent="neutral" size="m"
                aria-pressed={tocOpen}
                data-state={tocOpen ? 'active' : undefined}
                iconOnly={<Ico svg={tocOpen ? tocOpenSvg : tocClosedSvg} />}
                onClick={() => { markTocManual(!tocOpen); setTocOpen(o => !o) }}
                aria-label="Toggle table of content"
              />
            </Tooltip>
            )}

            {!(single && (tocOpen || focus)) && (
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
            )}

            {single ? (
              /* Version 6: pages | zoom | view | annotations | search · download · Ask AI */
              <div className={[styles.topBarActions, styles.singleActions].join(' ')}>
                <div className={styles.barGroup}>
                  {barBtn(prevDoc ? `Previous document: ${prevDoc.doc.name}` : 'Previous document', prevDocSvg,
                    () => prevDoc && goToPage(prevDoc.startPage), { disabled: !prevDoc, tip: 'bottom' })}
                  {barBtn('Previous page', prevSvg, () => goToPage(page - 1), { disabled: page <= 1, tip: 'bottom' })}
                  <div className={styles.pageCount}>
                    <input
                      className={styles.pageInput}
                      type="text"
                      inputMode="numeric"
                      value={page}
                      aria-label="Current page"
                      onChange={e => { const n = Number(e.target.value.replace(/\D/g, '')); if (n) goToPage(n) }}
                    />
                    <span className={styles.pageTotal}>/ {book.totalPages}</span>
                  </div>
                  {barBtn('Next page', nextSvg, () => goToPage(page + 1), { disabled: page >= book.totalPages, tip: 'bottom' })}
                  {barBtn(nextDoc ? `Next document: ${nextDoc.doc.name}` : 'Next document', nextDocSvg,
                    () => nextDoc && goToPage(nextDoc.startPage), { disabled: !nextDoc, tip: 'bottom' })}
                </div>
                {singleCompact ? (
                  <>
                    <span className={styles.barDivider} aria-hidden="true" />
                    {barBtn('Document tools', toolsSvg, () => setToolsOpen(true), { active: tool !== 'none' || fit !== 'none' || focus, tip: 'bottom' })}
                  </>
                ) : (
                  <>
                    <span className={styles.barDivider} aria-hidden="true" />
                    <div className={styles.barGroup}>
                      {barBtn('Zoom out', zoomOutSvg, () => zoomBy(-ZOOM_STEP), { disabled: zoomPct <= ZOOM_MIN, tip: 'bottom' })}
                      <span className={styles.zoomValue} aria-live="polite">{zoomPct}%</span>
                      {barBtn('Zoom in', zoomInSvg, () => zoomBy(ZOOM_STEP), { disabled: zoomPct >= ZOOM_MAX, tip: 'bottom' })}
                    </div>
                    <span className={styles.barDivider} aria-hidden="true" />
                    <div className={styles.barGroup}>
                      {barBtn('Fit width', fitWidthSvg, () => toggleFit('width'), { active: fit === 'width', tip: 'bottom' })}
                      {barBtn(focus ? 'Exit focus mode' : 'Focus mode', focusSvg, () => setFocus(f => !f), { active: focus, tip: 'bottom' })}
                    </div>
                    <span className={styles.barDivider} aria-hidden="true" />
                    <div className={styles.barGroup}>
                      {barBtn('Comment', commentSvg, () => toggleTool('comment'), { active: tool === 'comment', tip: 'bottom' })}
                      {barBtn('Draw', drawingSvg, () => toggleTool('draw'), { active: tool === 'draw', tip: 'bottom' })}
                      {barBtn('Highlight', highlightSvg, () => toggleTool('highlight'), { active: tool === 'highlight', tip: 'bottom' })}
                    </div>
                  </>
                )}
                <span className={styles.barDivider} aria-hidden="true" />
                <div className={styles.barGroup}>
                  {barBtn('Search', searchSvg, () => toggleRightPanel('search'), { active: rightPanel === 'search', tip: 'bottom' })}
                  {barBtn('Download', downloadSvg, () => console.log('download board book'), { tip: 'bottom' })}
                  {barBtn('Ask AI', aiSvg, () => toggleRightPanel('ai'), { active: rightPanel === 'ai', tip: 'bottom' })}
                </div>
              </div>
            ) : cards ? (
              /* Version 5: ‹ document N of M › | Download */
              <div className={styles.topBarActions}>
                <div className={styles.barGroup}>
                  {barBtn(prevDoc ? `Previous document: ${prevDoc.doc.name}` : 'Previous document', prevSvg,
                    () => prevDoc && goToPage(prevDoc.startPage), { disabled: !prevDoc, tip: 'bottom' })}
                  <span className={styles.docCount}>{(current?.index ?? 0) + 1} of {book.flatDocs.length}</span>
                  {barBtn(nextDoc ? `Next document: ${nextDoc.doc.name}` : 'Next document', nextSvg,
                    () => nextDoc && goToPage(nextDoc.startPage), { disabled: !nextDoc, tip: 'bottom' })}
                </div>
                <span className={styles.barDivider} aria-hidden="true" />
                <Button variant="primary" size="m" iconLeft={<Ico svg={downloadSvg} />}
                  onClick={() => console.log('download board book')}>
                  Download
                </Button>
              </div>
            ) : (
            <div className={styles.topBarActions}>
              {/* Version 4: highlight · comment | search · download · Ask AI */}
              {toolsTop && (
                <>
                  <div className={styles.barGroup}>
                    {barBtn('Highlight', highlightSvg, () => toggleTool('highlight'), { active: tool === 'highlight', tip: 'bottom' })}
                    {barBtn('Comment', commentSvg, () => toggleTool('comment'), { active: tool === 'comment', tip: 'bottom' })}
                  </div>
                  <span className={styles.barDivider} aria-hidden="true" />
                </>
              )}
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
            )}
          </div>
        )}

        {/* ── Canvas ────────────────────────────────────────────────────── */}
        <div className={styles.canvasArea}>
          <div ref={scrollRef} className={[styles.canvasScroll, cards ? styles.canvasScrollCards : ''].filter(Boolean).join(' ')} onScroll={onCanvasScroll}>
            <PageStack
              book={book}
              page={page}
              style={{ width: sheetWidth || undefined }}
              cursorClassName={
                tool === 'comment' ? styles.pageCommenting
                  : tool === 'highlight' || tool === 'draw' ? styles.pageAnnotating
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

          {/* Version 5: floating side cards. */}
          {cards && (
            <>
              <div className={[styles.sideCard, styles.cardBottomLeft].join(' ')} role="toolbar" aria-orientation="vertical" aria-label="Page and zoom">
                <input
                  className={styles.pageInput}
                  type="text"
                  inputMode="numeric"
                  value={page}
                  aria-label="Current page"
                  onChange={e => { const n = Number(e.target.value.replace(/\D/g, '')); if (n) goToPage(n) }}
                />
                <span className={styles.cardTotal} aria-label={`of ${book.totalPages} pages`}>{book.totalPages}</span>
                <span className={styles.cardDivider} aria-hidden="true" />
                {barBtn('Zoom in', zoomInSvg, () => zoomBy(ZOOM_STEP), { disabled: zoomPct >= ZOOM_MAX, tip: 'right' })}
                <div className={styles.zoomMenuWrap} ref={zoomMenuRef}>
                  <button type="button" className={[styles.zoomBtn, zoomMenuOpen ? styles.zoomBtnOpen : ''].join(' ')}
                    aria-haspopup="menu" aria-expanded={zoomMenuOpen} aria-label={`Zoom ${zoomPct}% — zoom options`}
                    onClick={() => { setZoomDraft(`${zoomPct}%`); setZoomMenuOpen(o => !o) }}>
                    {zoomPct}%
                  </button>
                  {zoomMenuOpen && (
                    <div className={styles.zoomMenu} role="menu" aria-label="Zoom options">
                      <div className={styles.zoomMenuField}>
                        <input
                          className={styles.zoomMenuInput}
                          value={zoomDraft}
                          aria-label="Zoom percentage"
                          autoFocus
                          onFocus={e => e.currentTarget.select()}
                          onChange={e => setZoomDraft(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') applyZoomDraft() }}
                        />
                      </div>
                      <button type="button" role="menuitemradio" aria-checked={fit === 'page'}
                        className={[styles.zoomMenuRow, fit === 'page' ? styles.zoomMenuRowSelected : ''].join(' ')}
                        onClick={() => { setFit('page'); setZoomMenuOpen(false) }}>
                        <span className={styles.zoomMenuIcon} aria-hidden="true"><Ico svg={fitPageSvg} /></span>Fit to page
                      </button>
                      <button type="button" role="menuitemradio" aria-checked={fit === 'width'}
                        className={[styles.zoomMenuRow, fit === 'width' ? styles.zoomMenuRowSelected : ''].join(' ')}
                        onClick={() => { setFit('width'); setZoomMenuOpen(false) }}>
                        <span className={styles.zoomMenuIcon} aria-hidden="true"><Ico svg={fitWidthSvg} /></span>Fit to width
                      </button>
                      <span className={styles.zoomMenuDivider} aria-hidden="true" />
                      {[50, 75, 100, 150, 200].map(pct => (
                        <button key={pct} type="button" role="menuitemradio" aria-checked={fit === 'none' && zoomPct === pct}
                          className={[styles.zoomMenuRow, fit === 'none' && zoomPct === pct ? styles.zoomMenuRowSelected : ''].join(' ')}
                          onClick={() => setZoomTo(pct)}>
                          {pct}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {barBtn('Zoom out', zoomOutSvg, () => zoomBy(-ZOOM_STEP), { disabled: zoomPct <= ZOOM_MIN, tip: 'right' })}
                <span className={styles.cardDivider} aria-hidden="true" />
                {barBtn('Fullscreen', focusSvg, () => setFocus(f => !f), { active: focus, tip: 'right' })}
              </div>

              <div className={[styles.sideCard, styles.cardTopRight].join(' ')} role="toolbar" aria-orientation="vertical" aria-label="Search, AI and annotations">
                {barBtn('Search', searchSvg, () => toggleRightPanel('search'), { active: rightPanel === 'search', tip: 'left' })}
                {barBtn('Ask AI', aiSvg, () => toggleRightPanel('ai'), { active: rightPanel === 'ai', tip: 'left' })}
                {barBtn('Highlight', highlightSvg, () => toggleTool('highlight'), { active: tool === 'highlight', tip: 'left' })}
                {barBtn('Comment', commentSvg, () => toggleTool('comment'), { active: tool === 'comment', tip: 'left' })}
              </div>
            </>
          )}

          {/* Floating control bar — always visible (not in Versions 5 / 6 on desktop). */}
          {!cards && !single && (
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

            {/* Narrow (<768): zoom, fit, focus and annotations fold into the
                dots "Document tools" sheet, so the bar fits a 375px screen.
                Version 4 keeps the annotations in the top bar instead. */}
            {isNarrow ? (
              barBtn('Document tools', toolsSvg, () => setToolsOpen(true), { active: tool !== 'none' })
            ) : (
              <>
                <div className={styles.barGroup}>
                  {barBtn('Fit width', fitWidthSvg, () => toggleFit('width'), { active: fit === 'width' })}
                  {barBtn('Focus mode', focusSvg, () => setFocus(f => !f), { active: focus })}
                </div>
                {!toolsTop && (
                  <>
                    <span className={styles.barDivider} aria-hidden="true" />
                    <div className={styles.barGroup}>
                      {barBtn('Highlight', highlightSvg, () => toggleTool('highlight'), { active: tool === 'highlight' })}
                      {barBtn('Comment', commentSvg, () => toggleTool('comment'), { active: tool === 'comment' })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          )}

        </div>
      </div>

      {/* Phone "Document tools" sheet (shared with Version 2). */}
      {(isNarrow || singleCompact) && (
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
          toolRows={toolsIn === 'single'
            /* Version 6: same order as its top bar — comment · draw · highlight. */
            ? [
              { key: 'comment', label: 'Add comment', icon: commentSvg, selected: tool === 'comment', onPick: () => toggleTool('comment') },
              { key: 'draw', label: 'Draw', icon: drawingSvg, selected: tool === 'draw', onPick: () => toggleTool('draw') },
              { key: 'highlight', label: 'Highlight', icon: highlightSvg, selected: tool === 'highlight', onPick: () => toggleTool('highlight') },
            ]
            : [
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
