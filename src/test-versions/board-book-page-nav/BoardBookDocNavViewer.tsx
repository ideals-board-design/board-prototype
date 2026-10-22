/* BoardBookDocNavViewer — Test versions › Version 4 concept
   "Floating controls, document stepping", a variant of Version 2
   (BoardBookFilmstripViewer):
     • minimal top bar — agenda-panel toggle · document dropdown (left);
       download · search · Ask AI (right) — same as Version 2
     • floating view controls (left) — zoom in · % · zoom out, fit width ·
       focus mode
     • floating tool palette (right) — draw · highlight · comment; the active
       tool takes the primary fill
     • bottom pill — previous document · previous page · [N] / total ·
       next page · next document (no arrows beside the sheet)
   The agenda, contents menu, Search / Ask AI panels and page renderer are
   reused from BoardBookPageNavViewer. */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { actions } from '../../icons/actions'
import { arrows } from '../../icons/arrows'
import { communication } from '../../icons/communication'
import { fileFormat } from '../../icons/fileFormat'
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
import styles from './BoardBookDocNavViewer.module.css'

const icon = (set: { name: string; svg: string }[], name: string) =>
  set.find(i => i.name === name)!.svg

const tocOpenSvg    = icon(actions, 'sidebar-opened')
const tocClosedSvg  = icon(actions, 'sidebar-closed')
const zoomInSvg     = icon(actions, 'plus')
const zoomOutSvg    = icon(actions, 'minus')
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
const prevDocSvg    = icon(arrows, 'angle-double-left-fill')
const nextDocSvg    = icon(arrows, 'angle-double-right-fill')
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

const ZOOM_MIN = 50
const ZOOM_MAX = 200
const ZOOM_STEP = 10
const PAGE_WIDTH = 635
const TOC_MIN = 460
const TOC_MAX = 640

type AnnotationTool = 'none' | 'draw' | 'highlight' | 'comment'
type RightPanel = null | 'search' | 'ai'

export interface BoardBookDocNavViewerProps {
  book?: BoardBook
  /** Rendered image of a global page (real PDF); falls back to the mock sheet. */
  pageImage?: (page: number) => string | undefined
}

export default function BoardBookDocNavViewer({ book = MOCK_BOARD_BOOK, pageImage }: BoardBookDocNavViewerProps) {
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
  /* Small desktop: a side panel collapses the agenda so the page stays readable. */
  const markTocManual = useTocAutoCollapse(rightPanel !== null, setTocOpen)

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

  useEffect(() => { setTocOpen(!isCompact) }, [isCompact])

  /* Keyboard (web only, and never while typing in a field): ← / → turn pages,
     Esc leaves focus mode. Focus mode (`fullscreen`, the view card's button) is the
     document alone over the whole window — the top bar and the agenda panel
     step aside, the floating controls stay (same as Version 3). */
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

  const selectDoc = (fd: FlatDoc) => { goToPage(fd.startPage); setNavPopoverOpen(false) }
  const selectItem = (item: BoardBookItem) => {
    const fd = firstDocOfItem(book, item.id)
    if (fd) { goToPage(fd.startPage); setNavPopoverOpen(false) }
  }

  const toggleTool = (t: AnnotationTool) => setTool(prev => (prev === t ? 'none' : t))
  const toggleRightPanel = (p: Exclude<RightPanel, null>) =>
    setRightPanel(prev => (prev === p ? null : p))

  /* Sheet geometry. At 100% the sheet fits the canvas (never clipped in the
     split view); zooming scales from there. */
  const baseWidth = fitWidth ? 960 : PAGE_WIDTH
  const scale = fitWidth ? 1 : zoom / 100

  /* Document stepping — jump to the first page of the neighbouring document. */
  const docIndex = current ? current.index : 0
  const prevDoc = book.flatDocs[docIndex - 1]
  const nextDoc = book.flatDocs[docIndex + 1]

  /* A palette button: tertiary at rest, primary while its tool/panel is on. */
  const paletteBtn = (label: string, svg: string, active: boolean, onClick: () => void) => (
    <Tooltip label={label} position="left">
      <Button
        variant={active ? 'primary' : 'tertiary'}
        intent={active ? undefined : 'neutral'}
        size="m"
        aria-pressed={active}
        iconOnly={<Ico svg={svg} />}
        onClick={onClick}
        aria-label={label}
      />
    </Tooltip>
  )

  return (
    <div className={[styles.viewer, fullscreen ? styles.fullscreen : ''].filter(Boolean).join(' ')}>
      {tocOpen && !fullscreen && (
        <>
          <nav className={styles.toc} style={{ width: tocWidth }} aria-label="Board book contents">
            <TocPanel book={book} currentDocId={current?.doc.id} onSelectItem={selectItem} onSelectDoc={selectDoc} onAskAi={() => setRightPanel('ai')} />
          </nav>
          <div className={styles.resizer} role="separator" aria-orientation="vertical"
            aria-label="Resize contents panel" onPointerDown={startResize} />
        </>
      )}

      <div className={styles.main}>
        {/* ── Minimal top bar ─────────────────────────────────────────────── */}
        {!fullscreen && (
        <div className={styles.topBar}>
          <Tooltip label={tocOpen ? 'Hide agenda' : 'Show agenda'} position="bottom">
            <Button
              variant="tertiary" intent="neutral" size="m"
              aria-pressed={tocOpen}
              iconOnly={<Ico svg={tocOpen ? tocOpenSvg : tocClosedSvg} />}
              onClick={() => { markTocManual(); setTocOpen(o => !o) }}
              aria-label="Toggle agenda panel"
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

          {/* Document actions — right side: download · search · Ask AI */}
          <div className={styles.topBarActions}>
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
        </div>
        )}

        {/* ── Canvas + floating controls ──────────────────────────────────── */}
        <div className={styles.canvasArea}>
          <div ref={scrollRef} className={styles.canvasScroll} onScroll={onCanvasScroll}>
            <PageStack
              book={book}
              page={page}
              style={{ width: `calc(min(${baseWidth}px, 100%) * ${scale})` }}
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

          {/* Tool palette (right) */}
          <div className={[styles.floating, styles.palette].join(' ')} role="toolbar" aria-orientation="vertical" aria-label="Annotation tools">
            {paletteBtn('Draw', drawSvg, tool === 'draw', () => toggleTool('draw'))}
            {paletteBtn('Highlight', highlightSvg, tool === 'highlight', () => toggleTool('highlight'))}
            {paletteBtn('Comment', commentSvg, tool === 'comment', () => toggleTool('comment'))}
          </div>


          {/* View controls (left) */}
          <div className={styles.viewControls}>
            <div className={[styles.floating, styles.zoomCard].join(' ')} role="group" aria-label="Zoom">
              <Tooltip label="Zoom in" position="right">
                <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={zoomInSvg} />}
                  disabled={zoom >= ZOOM_MAX}
                  onClick={() => { setFitWidth(false); setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP)) }}
                  aria-label="Zoom in" />
              </Tooltip>
              <span className={styles.zoomValue} aria-live="polite">{fitWidth ? 'Fit' : `${zoom}%`}</span>
              <Tooltip label="Zoom out" position="right">
                <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={zoomOutSvg} />}
                  disabled={zoom <= ZOOM_MIN}
                  onClick={() => { setFitWidth(false); setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP)) }}
                  aria-label="Zoom out" />
              </Tooltip>
            </div>
            <div className={[styles.floating, styles.zoomCard].join(' ')} role="group" aria-label="View">
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

          {/* Page pill — document stepping around page stepping and the counter. */}
          <div className={[styles.floating, styles.pageCounter].join(' ')} role="group" aria-label="Page navigation">
            <Tooltip label={prevDoc ? `Previous document: ${prevDoc.doc.name}` : 'Previous document'} position="top">
              <Button variant="tertiary" intent="neutral" size="s" iconOnly={<Ico svg={prevDocSvg} />}
                disabled={!prevDoc} onClick={() => prevDoc && goToPage(prevDoc.startPage)}
                aria-label="Previous document" />
            </Tooltip>
            <span className={styles.pillDivider} aria-hidden="true" />
            <div className={styles.pageStep}>
              <Tooltip label="Previous page" position="top">
                <Button variant="tertiary" intent="neutral" size="s" iconOnly={<Ico svg={prevSvg} />}
                  disabled={page <= 1} onClick={() => goToPage(page - 1)} aria-label="Previous page" />
              </Tooltip>
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
              <Tooltip label="Next page" position="top">
                <Button variant="tertiary" intent="neutral" size="s" iconOnly={<Ico svg={nextSvg} />}
                  disabled={page >= book.totalPages} onClick={() => goToPage(page + 1)} aria-label="Next page" />
              </Tooltip>
            </div>
            <span className={styles.pillDivider} aria-hidden="true" />
            <Tooltip label={nextDoc ? `Next document: ${nextDoc.doc.name}` : 'Next document'} position="top">
              <Button variant="tertiary" intent="neutral" size="s" iconOnly={<Ico svg={nextDocSvg} />}
                disabled={!nextDoc} onClick={() => nextDoc && goToPage(nextDoc.startPage)}
                aria-label="Next document" />
            </Tooltip>
          </div>
        </div>
      </div>

      {rightPanel === 'search' && (
        <SearchPanel book={book} onClose={() => setRightPanel(null)} onGoToPage={goToPage} />
      )}
      {rightPanel === 'ai' && <AiPanel onClose={() => setRightPanel(null)} />}
    </div>
  )
}
