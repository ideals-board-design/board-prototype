/* ReportPage — "Report" tab: the design review comparing Version 1–3.

   Single source of truth is `.design/board-book-page-nav/DESIGN_REVIEW.md`; it is
   imported raw and rendered by a small Markdown subset renderer (headings,
   paragraphs, quotes, lists, tables, **bold**, _italic_, `code`). The three
   desktop screenshots from the review sit on top as a side-by-side gallery.
   Rendered inside the Reports tab (ReportsPage owns the scroll + navigation). */

import type { ReactNode } from 'react'
import { BadgeStatus } from '../../components/BadgeStatus/BadgeStatus'
import reviewMd from '../../../.design/board-book-page-nav/DESIGN_REVIEW.md?raw'
import shotV1 from '../../../.design/board-book-page-nav/screenshots/review-v1-desktop-1280.png'
import shotV2 from '../../../.design/board-book-page-nav/screenshots/review-v2-desktop-1280.png'
import shotV3 from '../../../.design/board-book-page-nav/screenshots/review-v3-desktop-1280.png'
import styles from './ReportPage.module.css'

const SHOTS = [
  { src: shotV1, label: 'Version 1 — Full width' },
  { src: shotV2, label: 'Version 2 — Floating controls' },
  { src: shotV3, label: 'Version 3 — Reading mode' },
]

/* Severity sections get a DS status badge next to their heading. */
const SEVERITY: Record<string, { type: 'danger' | 'warning' | 'neutral' | 'positive'; label: string }> = {
  'Must Fix':        { type: 'danger', label: 'Must fix' },
  'Should Fix':      { type: 'warning',  label: 'Should fix' },
  'Could Improve':   { type: 'neutral',  label: 'Could improve' },
  'What Works Well': { type: 'positive', label: 'Keep' },
}

/* ── Inline: **bold**, _italic_, `code` ─────────────────────────────────── */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const t = m[0]
    if (t.startsWith('**')) out.push(<strong key={i++}>{inline(t.slice(2, -2))}</strong>)
    else if (t.startsWith('`')) out.push(<code key={i++} className={styles.code}>{t.slice(1, -1)}</code>)
    else out.push(<em key={i++}>{inline(t.slice(1, -1))}</em>)
    last = m.index + t.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())

/* ── Block-level renderer ───────────────────────────────────────────────── */
function renderMarkdown(md: string): ReactNode[] {
  const lines = md.split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let k = 0
  let section = 0 // numbers the ## sections 01, 02… like the other reports
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }

    if (line.startsWith('# ')) { blocks.push(<h1 key={k++} className={styles.h1}>{inline(line.slice(2))}</h1>); i++; continue }
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim()
      const sev = SEVERITY[title]
      const num = String(++section).padStart(2, '0')
      blocks.push(
        <h2 key={k++} className={styles.h2} data-nav={`${num} · ${title}`}>
          <span className={styles.num}>{num}</span>
          {inline(title)}
          {sev && <BadgeStatus type={sev.type} label={sev.label} />}
        </h2>,
      )
      i++; continue
    }

    if (line.startsWith('>')) {
      const quote: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) { quote.push(lines[i].replace(/^>\s?/, '')); i++ }
      blocks.push(<blockquote key={k++} className={styles.quote}>{inline(quote.join(' '))}</blockquote>)
      continue
    }

    if (line.startsWith('|')) {
      const rows: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i]); i++ }
      const [head, , ...body] = rows
      blocks.push(
        <div key={k++} className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>{cells(head).map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
            <tbody>{body.map((r, ri) => <tr key={ri}>{cells(r).map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      )
      continue
    }

    if (/^(\d+\.|-)\s/.test(line)) {
      const ordered = /^\d+\./.test(line)
      const items: string[] = []
      while (i < lines.length && /^(\d+\.|-)\s/.test(lines[i])) { items.push(lines[i].replace(/^(\d+\.|-)\s/, '')); i++ }
      const List = ordered ? 'ol' : 'ul'
      blocks.push(<List key={k++} className={styles.list}>{items.map((it, j) => <li key={j}>{inline(it)}</li>)}</List>)
      continue
    }

    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(#|>|\||\d+\.\s|-\s)/.test(lines[i])) { para.push(lines[i]); i++ }
    blocks.push(<p key={k++} className={styles.p}>{inline(para.join(' '))}</p>)
  }
  return blocks
}

const BLOCKS = renderMarkdown(reviewMd)

export default function ReportPage() {
  return (
    <article className={styles.article}>
      <div className={styles.gallery}>
        {SHOTS.map(s => (
          <figure key={s.label} className={styles.shot}>
            <img className={styles.shotImg} src={s.src} alt={`${s.label}, desktop 1280`} />
            <figcaption className={styles.shotCaption}>{s.label}</figcaption>
          </figure>
        ))}
      </div>
      {BLOCKS}
    </article>
  )
}
