/* BoardBookReadingViewer — Test versions › Version 3 "Reading mode".

   The document takes the whole content area; everything else gets out of the
   way:
     • top bar — table of content toggle · document dropdown (as in V2) |
       search · download · Ask AI · focus mode
     • reading progress — a thin bar along the top of the canvas
     • floating control bar (bottom) — prev · page / total · next | zoom out ·
       % · zoom in | fit width · fit page | highlight · comment. Always visible
     • agenda (table of contents) panel on the left — the same resizable
       panel as V1 / V2, closed by default so the document has the room
     • keyboard — ← / → turn pages, Esc leaves focus mode (document only,
       full screen; turned on from the top bar)
   Pages are laid out continuously (PageStack), as in V1 and V2. */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { ActionMenu } from '../../meeting/ActionMenu'
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
import styles from './BoardBookReadingViewer.module.css'

const icon = (set: { name: string; svg: string }[], name: string) =>
  set.find(i => i.name === name)!.svg

const tocOpenSvg    = icon(actions, 'sidebar-opened')
const tocClosedSvg  = icon(actions, 'sidebar-closed')
const prevSvg       = icon(arrows, 'angle-left-b')
const nextSvg       = icon(arrows, 'angle-right-b')
const zoomInSvg     = icon(actions, 'zoom-in')
const zoomOutSvg    = icon(actions, 'zoom-out')
const fitWidthSvg   = icon(actions, 'with-width')
const fitPageSvg    = icon(actions, 'fit-page')
const highlightSvg  = icon(actions, 'hightlight')
const commentSvg    = icon(communication, 'comment')
const searchSvg     = icon(actions, 'search')
const downloadSvg   = icon(actions, 'download-alt')
const aiSvg         = icon(actions, 'sparkles')
const focusSvg      = icon(arrows, 'expand')
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
const PAGE_RATIO = 612 / 792
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
  const isCompact = useMediaQuery('(max-width: 1023px)')
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
  const [progress, setProgress] = useState(0)
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

  /* ── Sheet width: fixed zoom, fit width or fit page (from the box size). ── */
  const sheetWidth =
    fit === 'width' ? box.w
      : fit === 'page' ? Math.min(box.w, box.h * PAGE_RATIO)
      : Math.min(box.w, PAGE_WIDTH) * (zoom / 100)
  const zoomPct = Math.round((sheetWidth / PAGE_WIDTH) * 100) || zoom

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

  /* Reading progress across the whole board book: documents before the current
     one + how far the reader has scrolled through it (only one document is on
     screen at a time). */
  const updateProgress = useCallback((el: HTMLElement, p = pageRef.current) => {
    const fd = docAtPage(book, p)
    if (!fd) return
    const max = el.scrollHeight - el.clientHeight
    const within = max > 0 ? el.scrollTop / max : 1
    setProgress((fd.startPage - 1 + within * fd.doc.pages) / book.totalPages)
  }, [book])
  /* Recompute when the content height changes (pages loading, zoom, document
     switch) — not only on scroll — so it never sticks at a stale value. */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateProgress(el)
    const ro = new ResizeObserver(() => updateProgress(el))
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [sheetWidth, focus, page, updateProgress])

  const onCanvasScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const p = pageAtScroll(el)
    if (p && p !== pageRef.current) setPage(p)
    updateProgress(el, p ?? pageRef.current)
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
                onClick={() => setTocOpen(o => !o)}
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
              <Tooltip label="Focus mode" position="bottom">
                <Button variant="tertiary" intent="neutral" size="m" iconOnly={<Ico svg={focusSvg} />}
                  onClick={() => setFocus(true)} aria-label="Focus mode" />
              </Tooltip>
            </div>
          </div>
        )}

        {/* ── Reading progress ──────────────────────────────────────────── */}
        <div
          className={styles.progress}
          role="progressbar"
          aria-label="Reading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
        </div>

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
            </div>

            <span className={styles.barDivider} aria-hidden="true" />

            <div className={styles.barGroup}>
              {barBtn('Zoom out', zoomOutSvg, () => zoomBy(-ZOOM_STEP), { disabled: zoomPct <= ZOOM_MIN })}
              <span className={styles.zoomValue} aria-live="polite">{zoomPct}%</span>
              {barBtn('Zoom in', zoomInSvg, () => zoomBy(ZOOM_STEP), { disabled: zoomPct >= ZOOM_MAX })}
            </div>

            <span className={styles.barDivider} aria-hidden="true" />

            {/* Narrow (<768): fit and annotation tools collapse into a "⋯" menu
                that opens upward, so the bar fits a 375px screen. */}
            {isNarrow ? (
              <ActionMenu
                size="m"
                placement="top"
                ariaLabel="More reading controls"
                items={[
                  { key: 'fit-width', label: 'Fit width', icon: fitWidthSvg,  onSelect: () => toggleFit('width') },
                  { key: 'fit-page',  label: 'Fit page',  icon: fitPageSvg,   onSelect: () => toggleFit('page') },
                  { key: 'highlight', label: 'Highlight', icon: highlightSvg, onSelect: () => toggleTool('highlight') },
                  { key: 'comment',   label: 'Comment',   icon: commentSvg,   onSelect: () => toggleTool('comment') },
                ]}
              />
            ) : (
              <>
                <div className={styles.barGroup}>
                  {barBtn('Fit width', fitWidthSvg, () => toggleFit('width'), { active: fit === 'width' })}
                  {barBtn('Fit page', fitPageSvg, () => toggleFit('page'), { active: fit === 'page' })}
                </div>

                <span className={styles.barDivider} aria-hidden="true" />

                <div className={styles.barGroup}>
                  {barBtn('Highlight', highlightSvg, () => toggleTool('highlight'), { active: tool === 'highlight' })}
                  {barBtn('Comment', commentSvg, () => toggleTool('comment'), { active: tool === 'comment' })}
                </div>
              </>
            )}
          </div>

          {/* Keyboard hint (web only). */}
          {!isCompact && (
            <div className={styles.keyHint} aria-hidden="true">
              <kbd className={styles.kbd}><Ico svg={icon(arrows, 'arrow-left')} /></kbd>
              <kbd className={styles.kbd}><Ico svg={icon(arrows, 'arrow-right')} /></kbd>
              <span>pages</span>
            </div>
          )}
        </div>
      </div>

      {rightPanel === 'search' && (
        <SearchPanel book={book} onClose={() => setRightPanel(null)} onGoToPage={goToPage} />
      )}
      {rightPanel === 'ai' && <AiPanel onClose={() => setRightPanel(null)} />}
    </div>
  )
}
