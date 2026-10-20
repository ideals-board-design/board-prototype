/* PageStack — continuous page layout for the board book test versions.

   Continuous scrolling works WITHIN one document (a real platform constraint):
   the pages of the current document are rendered one under another, so
   whenever there is room the next page follows straight after the current
   one. Scrolling never flows into the next document, and the document itself
   can't carry a "next document" control — moving on happens only through the
   viewer's navigation panels ("next page" on the last page, the document
   dropdown, keyboard), which is why their placement matters.
   The current page is derived from the scroll position; navigation scrolls to
   the target page, switching the rendered document first when it changes.

   Owned by the viewer:  the scroll box (`scrollRef`) and the page state.
   Provided here:        the stack, per-page comment pins and the two scroll
                         helpers (`scrollToPage`, `pageAtScroll`). */

import type { CSSProperties, ReactNode } from 'react'
import { docAtPage, type BoardBook, type BoardBookDoc } from '../../meeting/BoardBook/boardBookData'
import styles from './PageStack.module.css'

export type CommentPin = { id: number; x: number; y: number; page: number }

/** How far down the scroll box (fraction of its height) a page must reach to
    count as the current one — the page occupying the upper part of the view. */
const CURRENT_LINE = 0.35

const pageEl = (box: HTMLElement, page: number) =>
  box.querySelector<HTMLElement>(`[data-page="${page}"]`)

/** Scroll the box so `page` starts at the top of the view (below its padding). */
export function scrollToPage(box: HTMLElement | null, page: number) {
  if (!box) return
  const el = pageEl(box, page)
  if (!el) return
  const padTop = parseFloat(getComputedStyle(box).paddingTop) || 0
  box.scrollTop += el.getBoundingClientRect().top - box.getBoundingClientRect().top - padTop
}

/** The page currently being read: the last one whose top has passed the
    current-line, or the last page once the box is scrolled to the end. */
export function pageAtScroll(box: HTMLElement): number | null {
  const pages = box.querySelectorAll<HTMLElement>('[data-page]')
  if (!pages.length) return null
  if (box.scrollTop + box.clientHeight >= box.scrollHeight - 1)
    return Number(pages[pages.length - 1].dataset.page)
  const line = box.getBoundingClientRect().top + box.clientHeight * CURRENT_LINE
  let current = Number(pages[0].dataset.page)
  for (const el of pages) {
    if (el.getBoundingClientRect().top <= line) current = Number(el.dataset.page)
    else break
  }
  return current
}

export function PageStack({
  book,
  page,
  style,
  className,
  cursorClassName,
  commenting,
  comments,
  onAddComment,
  renderPage,
}: {
  book: BoardBook
  /** Current global page — decides which document's pages are rendered. */
  page: number
  /** Width of the stack (drives zoom / fit). */
  style?: CSSProperties
  className?: string
  /** Extra class on every sheet (annotation cursors). */
  cursorClassName?: string
  /** Comment tool active — a click drops a pin on the clicked page. */
  commenting: boolean
  comments: CommentPin[]
  onAddComment: (pin: Omit<CommentPin, 'id'>) => void
  renderPage: (doc: BoardBookDoc, localPage: number, globalPage: number) => ReactNode
}) {
  const current = docAtPage(book, page)
  if (!current) return null
  const pages = Array.from({ length: current.doc.pages }, (_, i) => current.startPage + i)

  return (
    <div className={[styles.stack, className].filter(Boolean).join(' ')} style={style}>
      {pages.map(global => {
        const fd = docAtPage(book, global)
        if (!fd) return null
        const local = global - fd.startPage + 1
        const pins = comments.filter(c => c.page === global)
        return (
          <div
            key={global}
            data-page={global}
            className={[styles.sheet, cursorClassName].filter(Boolean).join(' ')}
            onClick={e => {
              if (!commenting) return
              const rect = e.currentTarget.getBoundingClientRect()
              onAddComment({
                page: global,
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              })
            }}
          >
            {renderPage(fd.doc, local, global)}
            {pins.map((c, i) => (
              <span key={c.id} className={styles.commentPin} style={{ left: `${c.x}%`, top: `${c.y}%` }} aria-hidden="true">
                {i + 1}
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}
