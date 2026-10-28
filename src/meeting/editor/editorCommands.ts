/* editorCommands — formatting commands for the Minutes document editor
   (EditorToolbar). The document is a contentEditable element; commands run
   through document.execCommand (styleWithCSS, so formatting lands as inline
   styles) and plain DOM edits for tables, line height and list styles.

   The toolbar keeps focus out of the document (mousedown is prevented on its
   controls), so the caret normally survives a click. For pickers that do steal
   focus (native colour input, dialogs) the last selection inside the document
   is remembered and restored before the command runs. */

export type Align = 'left' | 'center' | 'right' | 'justify'
export type ListStyle = 'default' | 'disc' | 'circle' | 'square'
export type Block = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'pre'

export interface EditorState {
  bold: boolean
  italic: boolean
  underline: boolean
  list: boolean
  listStyle: ListStyle
  align: Align
  block: Block
  fontName: string
  fontSize: number          // pt
  lineHeight: number
  foreColor: string         // #rrggbb
  hiliteColor: string       // #rrggbb or '' (none)
  canUndo: boolean
  canRedo: boolean
  inTable: boolean
  canMerge: boolean
  canSplit: boolean
}

export const EMPTY_STATE: EditorState = {
  bold: false, italic: false, underline: false, list: false, listStyle: 'default',
  align: 'left', block: 'p', fontName: 'Arial', fontSize: 13, lineHeight: 1.15,
  foreColor: '#000000', hiliteColor: '', canUndo: false, canRedo: false,
  inTable: false, canMerge: false, canSplit: false,
}

export const FONT_NAMES = ['Arial', 'Courier New', 'Georgia', 'Inter', 'Tahoma', 'Times New Roman', 'Verdana']
export const FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 30, 36]
export const LINE_HEIGHTS = [1, 1.15, 1.5, 2, 2.5, 3]
export const BLOCKS: { value: Block; label: string }[] = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
  { value: 'pre', label: 'Preformatted' },
]

/* ── selection memory ──────────────────────────────────────────────────── */

let lastRange: Range | null = null

const within = (root: HTMLElement, node: Node | null) => !!node && root.contains(node)

/** Remember the selection while it is inside the document. */
export function trackSelection(root: HTMLElement) {
  const sel = window.getSelection()
  if (sel && sel.rangeCount && within(root, sel.anchorNode)) lastRange = sel.getRangeAt(0).cloneRange()
}

/** Focus the document and put the last selection back (or the caret at the end). */
export function restoreSelection(root: HTMLElement) {
  root.focus({ preventScroll: true })
  const sel = window.getSelection()
  if (!sel) return
  if (lastRange && within(root, lastRange.startContainer)) {
    sel.removeAllRanges()
    sel.addRange(lastRange)
  } else if (!sel.rangeCount || !within(root, sel.anchorNode)) {
    const r = document.createRange()
    r.selectNodeContents(root)
    r.collapse(false)
    sel.removeAllRanges()
    sel.addRange(r)
  }
}

function run(root: HTMLElement, command: string, value?: string) {
  restoreSelection(root)
  document.execCommand('styleWithCSS', false, 'true')
  document.execCommand(command, false, value)
  trackSelection(root)
}

/* ── inline + block formatting ─────────────────────────────────────────── */

export const toggleBold      = (root: HTMLElement) => run(root, 'bold')
export const toggleItalic    = (root: HTMLElement) => run(root, 'italic')
export const toggleUnderline = (root: HTMLElement) => run(root, 'underline')
export const undo            = (root: HTMLElement) => run(root, 'undo')
export const redo            = (root: HTMLElement) => run(root, 'redo')
export const indent          = (root: HTMLElement) => run(root, 'indent')
export const outdent         = (root: HTMLElement) => run(root, 'outdent')
export const clearFormatting = (root: HTMLElement) => run(root, 'removeFormat')
export const insertRule      = (root: HTMLElement) => run(root, 'insertHorizontalRule')

const ALIGN_CMD: Record<Align, string> = { left: 'justifyLeft', center: 'justifyCenter', right: 'justifyRight', justify: 'justifyFull' }
export const setAlign = (root: HTMLElement, a: Align) => run(root, ALIGN_CMD[a])

export const setBlock = (root: HTMLElement, b: Block) => run(root, 'formatBlock', `<${b}>`)

export const setFontName = (root: HTMLElement, name: string) => run(root, 'fontName', name)

/** execCommand only knows sizes 1–7, so mark with size 7 and swap the
    <font> tags for spans with the real point size. */
export function setFontSize(root: HTMLElement, pt: number) {
  run(root, 'fontSize', '7')
  root.querySelectorAll('font[size="7"]').forEach(f => {
    const span = document.createElement('span')
    span.style.fontSize = `${pt}pt`
    span.append(...Array.from(f.childNodes))
    f.replaceWith(span)
  })
  root.querySelectorAll<HTMLElement>('span[style*="xxx-large"]').forEach(s => { s.style.fontSize = `${pt}pt` })
  trackSelection(root)
}

/** Colour '' removes it (the "No colour" swatch). */
export function setForeColor(root: HTMLElement, color: string) {
  run(root, 'foreColor', color || 'inherit')
}
export function setHiliteColor(root: HTMLElement, color: string) {
  run(root, 'hiliteColor', color || 'transparent')
}

const BLOCK_SEL = 'p, h1, h2, h3, h4, h5, h6, pre, li, div, blockquote, td, th'

function blocksInSelection(root: HTMLElement): HTMLElement[] {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return []
  const range = sel.getRangeAt(0)
  const out = new Set<HTMLElement>()
  const startBlock = (range.startContainer.nodeType === 1 ? range.startContainer as Element : range.startContainer.parentElement)?.closest<HTMLElement>(BLOCK_SEL)
  if (startBlock && root.contains(startBlock) && startBlock !== root) out.add(startBlock)
  root.querySelectorAll<HTMLElement>(BLOCK_SEL).forEach(b => { if (range.intersectsNode(b) && !b.querySelector(BLOCK_SEL)) out.add(b) })
  return [...out]
}

export function setLineHeight(root: HTMLElement, value: number) {
  restoreSelection(root)
  const blocks = blocksInSelection(root)
  ;(blocks.length ? blocks : [root]).forEach(b => { b.style.lineHeight = String(value) })
  trackSelection(root)
}

const LIST_TYPE: Record<ListStyle, string> = { default: '', disc: 'disc', circle: 'circle', square: 'square' }

export function toggleList(root: HTMLElement) { run(root, 'insertUnorderedList') }

/** Picking a style turns the selection into a bulleted list if needed. */
export function setListStyle(root: HTMLElement, style: ListStyle) {
  restoreSelection(root)
  if (!currentList(root)) run(root, 'insertUnorderedList')
  const ul = currentList(root)
  if (ul) ul.style.listStyleType = LIST_TYPE[style]
  trackSelection(root)
}

function anchorElement(root: HTMLElement): HTMLElement | null {
  const sel = window.getSelection()
  const node = sel && sel.rangeCount ? sel.anchorNode : lastRange?.startContainer ?? null
  if (!node || !within(root, node)) return null
  return node.nodeType === 1 ? node as HTMLElement : node.parentElement
}

function currentList(root: HTMLElement): HTMLUListElement | null {
  const ul = anchorElement(root)?.closest('ul')
  return ul && root.contains(ul) ? ul : null
}

/* ── tables ────────────────────────────────────────────────────────────── */

function currentCell(root: HTMLElement): HTMLTableCellElement | null {
  const cell = anchorElement(root)?.closest('td, th') as HTMLTableCellElement | null
  return cell && root.contains(cell) ? cell : null
}

export function currentTableEl(root: HTMLElement, kind: 'table' | 'row' | 'cell'): HTMLElement | null {
  const cell = currentCell(root)
  if (!cell) return null
  if (kind === 'cell') return cell
  if (kind === 'row') return cell.parentElement
  return cell.closest('table')
}

const emptyCell = (tag: 'td' | 'th' = 'td') => {
  const c = document.createElement(tag)
  c.innerHTML = '<br>'
  return c
}

export function insertTable(root: HTMLElement, rows: number, cols: number) {
  const body = Array.from({ length: rows }, () =>
    `<tr>${Array.from({ length: cols }, () => '<td><br></td>').join('')}</tr>`).join('')
  run(root, 'insertHTML', `<table><tbody>${body}</tbody></table><p><br></p>`)
}

function columnIndex(cell: HTMLTableCellElement) {
  let i = 0
  for (let c = cell.previousElementSibling as HTMLTableCellElement | null; c; c = c.previousElementSibling as HTMLTableCellElement | null) i += c.colSpan || 1
  return i
}

/** The cell that covers visual column `col` in `row` (accounts for colspan). */
function cellAt(row: HTMLTableRowElement, col: number): HTMLTableCellElement | null {
  let i = 0
  for (const c of Array.from(row.cells)) {
    i += c.colSpan || 1
    if (col < i) return c
  }
  return null
}

const rowsOf = (table: HTMLTableElement) => Array.from(table.rows)

function placeCaret(root: HTMLElement, el: Element | null) {
  if (!el) return
  const r = document.createRange()
  r.selectNodeContents(el)
  r.collapse(true)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(r)
  trackSelection(root)
}

export function insertRow(root: HTMLElement, before: boolean) {
  const cell = currentCell(root); if (!cell) return
  const row = cell.parentElement as HTMLTableRowElement
  const cols = Array.from(row.cells).reduce((n, c) => n + (c.colSpan || 1), 0)
  const tr = document.createElement('tr')
  for (let i = 0; i < cols; i++) tr.append(emptyCell())
  row.parentElement!.insertBefore(tr, before ? row : row.nextSibling)
  placeCaret(root, tr.cells[columnIndex(cell)] ?? tr.cells[0])
}

export function deleteRow(root: HTMLElement) {
  const cell = currentCell(root); if (!cell) return
  const row = cell.parentElement as HTMLTableRowElement
  const table = row.closest('table')!
  const next = (row.nextElementSibling ?? row.previousElementSibling) as HTMLTableRowElement | null
  row.remove()
  if (!table.rows.length) { deleteTableEl(root, table); return }
  placeCaret(root, next?.cells[0] ?? null)
}

export function insertColumn(root: HTMLElement, before: boolean) {
  const cell = currentCell(root); if (!cell) return
  const table = cell.closest('table') as HTMLTableElement
  const col = columnIndex(cell) + (before ? 0 : (cell.colSpan || 1) - 1)
  for (const row of rowsOf(table)) {
    const ref = cellAt(row, col)
    const c = emptyCell(ref?.tagName === 'TH' ? 'th' : 'td')
    if (!ref) row.append(c)
    else row.insertBefore(c, before ? ref : ref.nextSibling)
  }
  placeCaret(root, cell)
}

export function deleteColumn(root: HTMLElement) {
  const cell = currentCell(root); if (!cell) return
  const table = cell.closest('table') as HTMLTableElement
  const col = columnIndex(cell)
  for (const row of rowsOf(table)) {
    const c = cellAt(row, col)
    if (!c) continue
    if ((c.colSpan || 1) > 1) c.colSpan -= 1
    else c.remove()
  }
  if (!table.querySelector('td, th')) deleteTableEl(root, table)
  else placeCaret(root, table.rows[0]?.cells[0] ?? null)
}

function deleteTableEl(root: HTMLElement, table: HTMLTableElement) {
  const after = table.nextElementSibling
  table.remove()
  placeCaret(root, after ?? root)
}

export function deleteTable(root: HTMLElement) {
  const cell = currentCell(root); if (!cell) return
  deleteTableEl(root, cell.closest('table') as HTMLTableElement)
}

/* Row / column clipboard (in memory, like the editor on dev). */
let rowClip: HTMLTableRowElement | null = null
let colClip: HTMLTableCellElement[] | null = null

export const hasRowClip = () => !!rowClip
export const hasColClip = () => !!colClip

export function copyRow(root: HTMLElement, cut = false) {
  const cell = currentCell(root); if (!cell) return
  const row = cell.parentElement as HTMLTableRowElement
  rowClip = row.cloneNode(true) as HTMLTableRowElement
  if (cut) deleteRow(root)
}

export function pasteRow(root: HTMLElement, before: boolean) {
  const cell = currentCell(root); if (!cell || !rowClip) return
  const row = cell.parentElement as HTMLTableRowElement
  const tr = rowClip.cloneNode(true) as HTMLTableRowElement
  row.parentElement!.insertBefore(tr, before ? row : row.nextSibling)
  placeCaret(root, tr.cells[0])
}

export function copyColumn(root: HTMLElement, cut = false) {
  const cell = currentCell(root); if (!cell) return
  const table = cell.closest('table') as HTMLTableElement
  const col = columnIndex(cell)
  colClip = rowsOf(table).map(r => (cellAt(r, col) ?? emptyCell()).cloneNode(true) as HTMLTableCellElement)
  if (cut) deleteColumn(root)
}

export function pasteColumn(root: HTMLElement, before: boolean) {
  const cell = currentCell(root); if (!cell || !colClip) return
  const table = cell.closest('table') as HTMLTableElement
  const col = columnIndex(cell) + (before ? 0 : (cell.colSpan || 1) - 1)
  rowsOf(table).forEach((row, i) => {
    const src = colClip![i] ?? colClip![colClip!.length - 1]
    const c = src.cloneNode(true) as HTMLTableCellElement
    c.colSpan = 1
    const ref = cellAt(row, col)
    if (!ref) row.append(c)
    else row.insertBefore(c, before ? ref : ref.nextSibling)
  })
  placeCaret(root, cell)
}

/** Cells the selection touches, when it spans more than one. */
function selectedCells(root: HTMLElement): HTMLTableCellElement[] {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return []
  const range = sel.getRangeAt(0)
  const table = currentCell(root)?.closest('table')
  if (!table) return []
  return Array.from(table.querySelectorAll<HTMLTableCellElement>('td, th')).filter(c => range.intersectsNode(c))
}

/** Merge works for neighbouring cells in one row (colspan) or one column (rowspan). */
function mergeable(cells: HTMLTableCellElement[]) {
  if (cells.length < 2) return null
  const rows = new Set(cells.map(c => c.parentElement))
  if (rows.size === 1) return 'row' as const
  const cols = new Set(cells.map(columnIndex))
  if (cols.size === 1) return 'column' as const
  return null
}

export function mergeCells(root: HTMLElement) {
  const cells = selectedCells(root)
  const kind = mergeable(cells)
  if (!kind) return
  const [first, ...rest] = cells
  for (const c of rest) {
    if (c.textContent?.trim()) first.append(' ', ...Array.from(c.childNodes))
    if (kind === 'row') first.colSpan = (first.colSpan || 1) + (c.colSpan || 1)
    else first.rowSpan = (first.rowSpan || 1) + (c.rowSpan || 1)
    c.remove()
  }
  placeCaret(root, first)
}

export function splitCell(root: HTMLElement) {
  const cell = currentCell(root); if (!cell) return
  const span = cell.colSpan || 1
  const rspan = cell.rowSpan || 1
  for (let i = 1; i < span; i++) cell.after(emptyCell(cell.tagName === 'TH' ? 'th' : 'td'))
  cell.colSpan = 1
  if (rspan > 1) {
    const col = columnIndex(cell)
    let row = cell.parentElement as HTMLTableRowElement
    for (let i = 1; i < rspan; i++) {
      row = row.nextElementSibling as HTMLTableRowElement
      if (!row) break
      for (let k = 0; k < span; k++) {
        const ref = cellAt(row, col)
        const c = emptyCell()
        if (ref) row.insertBefore(c, ref); else row.append(c)
      }
    }
    cell.rowSpan = 1
  }
  placeCaret(root, cell)
}

export interface TableElProps { width: string; height: string; align: 'left' | 'center' | 'right' }

export function readTableElProps(el: HTMLElement): TableElProps {
  return {
    width: el.style.width,
    height: el.style.height,
    align: (el.style.textAlign as TableElProps['align']) || 'left',
  }
}

export function applyTableElProps(root: HTMLElement, el: HTMLElement, p: TableElProps) {
  el.style.width = p.width.trim()
  el.style.height = p.height.trim()
  el.style.textAlign = p.align === 'left' ? '' : p.align
  trackSelection(root)
}

/* ── find & replace, word count ────────────────────────────────────────── */

const textNodes = (root: HTMLElement) => {
  const out: Text[] = []
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let n = w.nextNode(); n; n = w.nextNode()) out.push(n as Text)
  return out
}

/** Matches of `query` inside single text nodes. */
function matches(root: HTMLElement, query: string, matchCase: boolean) {
  const out: { node: Text; at: number }[] = []
  if (!query) return out
  const q = matchCase ? query : query.toLowerCase()
  for (const node of textNodes(root)) {
    const t = matchCase ? node.data : node.data.toLowerCase()
    for (let i = t.indexOf(q); i !== -1; i = t.indexOf(q, i + q.length)) out.push({ node, at: i })
  }
  return out
}

export const countMatches = (root: HTMLElement, q: string, mc: boolean) => matches(root, q, mc).length

let findCursor = -1

/** Selects the next match after the current one (wraps). Returns its 1-based index. */
export function findNext(root: HTMLElement, query: string, matchCase: boolean): number {
  const all = matches(root, query, matchCase)
  if (!all.length) { findCursor = -1; return 0 }
  findCursor = (findCursor + 1) % all.length
  const m = all[findCursor]
  const r = document.createRange()
  r.setStart(m.node, m.at)
  r.setEnd(m.node, m.at + query.length)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(r)
  lastRange = r.cloneRange()
  m.node.parentElement?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  return findCursor + 1
}

export function replaceCurrent(root: HTMLElement, query: string, replacement: string, matchCase: boolean): boolean {
  const sel = window.getSelection()
  const text = sel?.toString() ?? ''
  const same = matchCase ? text === query : text.toLowerCase() === query.toLowerCase()
  if (!text || !same || !sel || !within(root, sel.anchorNode)) return false
  const r = sel.getRangeAt(0)
  r.deleteContents()
  r.insertNode(document.createTextNode(replacement))
  findCursor -= 1
  return true
}

export function replaceAll(root: HTMLElement, query: string, replacement: string, matchCase: boolean): number {
  if (!query) return 0
  let n = 0
  const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi')
  for (const node of textNodes(root)) {
    const next = node.data.replace(re, () => { n++; return replacement })
    if (next !== node.data) node.data = next
  }
  findCursor = -1
  return n
}

export interface Counts { words: number; chars: number; charsNoSpaces: number }

export function countText(text: string): Counts {
  return {
    words: (text.match(/\S+/g) ?? []).length,
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, '').length,
  }
}

export function selectionText(root: HTMLElement) {
  const sel = window.getSelection()
  return sel && sel.rangeCount && within(root, sel.anchorNode) ? sel.toString() : ''
}

/* ── state ─────────────────────────────────────────────────────────────── */

const toHex = (color: string) => {
  const m = color.match(/\d+(\.\d+)?/g)
  if (!m || m.length < 3) return ''
  if (m.length === 4 && Number(m[3]) === 0) return ''
  return '#' + m.slice(0, 3).map(n => Math.round(Number(n)).toString(16).padStart(2, '0')).join('')
}

const nearest = (list: number[], v: number) => list.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a))

/** Background colour set on the element or an inline ancestor (highlight). */
function highlightOf(el: HTMLElement, root: HTMLElement) {
  for (let e: HTMLElement | null = el; e && e !== root; e = e.parentElement) {
    const bg = toHex(getComputedStyle(e).backgroundColor)
    if (bg) return getComputedStyle(e).display === 'inline' ? bg : ''
  }
  return ''
}

export function readState(root: HTMLElement): EditorState {
  const el = anchorElement(root)
  if (!el) return { ...EMPTY_STATE, canUndo: document.queryCommandEnabled('undo'), canRedo: document.queryCommandEnabled('redo') }
  const cs = getComputedStyle(el)
  const blockEl = el.closest<HTMLElement>(BLOCK_SEL)
  const blockTag = (blockEl?.closest('h1, h2, h3, h4, h5, h6, pre, p')?.tagName.toLowerCase() ?? 'p') as Block
  const fontPx = parseFloat(cs.fontSize) || 16
  const lhPx = parseFloat(getComputedStyle(blockEl ?? el).lineHeight)
  const ul = currentList(root)
  const align = (getComputedStyle(blockEl ?? el).textAlign || 'left') as string
  const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim()
  const cells = selectedCells(root)
  const cell = currentCell(root)
  return {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    list: !!ul,
    listStyle: ((ul?.style.listStyleType as ListStyle) || 'default'),
    align: (['center', 'right', 'justify'].includes(align) ? align : 'left') as Align,
    block: blockTag,
    fontName: FONT_NAMES.find(f => f.toLowerCase() === family.toLowerCase()) ?? family,
    fontSize: Math.round(fontPx * 0.75),
    lineHeight: Number.isFinite(lhPx) ? nearest(LINE_HEIGHTS, lhPx / fontPx) : 1.15,
    foreColor: toHex(cs.color) || '#000000',
    hiliteColor: highlightOf(el, root),
    canUndo: document.queryCommandEnabled('undo'),
    canRedo: document.queryCommandEnabled('redo'),
    inTable: !!cell,
    canMerge: !!mergeable(cells),
    canSplit: !!cell && ((cell.colSpan || 1) > 1 || (cell.rowSpan || 1) > 1),
  }
}
