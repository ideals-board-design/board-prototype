/* EditorToolbar — formatting toolbar of the Minutes document (right pane of
   MinutesTab). Same tools and grouping as the editor on dev:

     contents · undo redo · B I U · font  size · outdent indent · align ▾ ·
     bullets | ▾ · highlight | ▾ · text colour | ▾ · block ▾ · line height ▾ ·
     horizontal line · table ▾ · ⋯ (clear formatting · find and replace ·
     word count)

   Built from DS Buttons (tertiary M) and icons, with the Board book Version 6
   bar as the source of truth for dimensions: 8 / 16 padding, 40px buttons,
   2px between buttons in a group, 24px between groups, no dividers; split
   buttons (tool + chevron) abut; dropdowns use the Board book menu (240px,
   4px padding, elevation-100) and its row style; selects use the DS
   Dropdown S trigger (as the Board book document select).

   Responsive: groups that don't fit move, from the end, into the ⋯ drawer —
   a floating row under the bar, like dev. Widths come from a hidden copy of
   every group, so the split is exact at any width.

   Missing DS icons are drawn in src/icons/custom.ts (see its header list). */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Button } from '../../components/Button/Button'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { actions } from '../../icons/actions'
import { arrows } from '../../icons/arrows'
import { condition } from '../../icons/condition'
import { custom } from '../../icons/custom'
import { editor } from '../../icons/editor'
import { functional } from '../../icons/functional'
import * as cmd from './editorCommands'
import { BLOCKS, EMPTY_STATE, FONT_NAMES, FONT_SIZES, LINE_HEIGHTS, type Align, type EditorState, type ListStyle } from './editorCommands'
import { FindReplaceDialog, PropertiesDialog, WordCountDialog, type PropsKind } from './EditorDialogs'
import styles from './EditorToolbar.module.css'

const find = (set: { name: string; svg: string }[], name: string) => set.find(i => i.name === name)!.svg
const I = {
  contentsOpen: find(actions, 'sidebar-opened'),
  contentsClosed: find(actions, 'sidebar-closed'),
  undo: find(arrows, 'undo'),
  redo: find(arrows, 'redo'),
  bold: find(editor, 'bold'),
  italic: find(editor, 'italic'),
  underline: find(editor, 'underline'),
  outdent: find(editor, 'left-indent'),
  indent: find(custom, 'indent'),
  left: find(editor, 'align-left'),
  center: find(editor, 'align-center'),
  right: find(editor, 'align-right'),
  justify: find(editor, 'align-justify'),
  list: find(editor, 'list-ul'),
  highlight: find(editor, 'hightlight-color'),
  textColor: find(editor, 'text-color'),
  lineHeight: find(editor, 'line-height'),
  rule: find(editor, 'divider'),
  table: find(editor, 'web-grid-alt'),
  clear: find(editor, 'clear-formating'),
  search: find(actions, 'search'),
  wordCount: find(editor, 'word-count'),
  more: find(functional, 'ellipsis-h'),
  chevronDown: find(arrows, 'angle-down-fill'),
  chevronUp: find(arrows, 'angle-up-fill'),
  selectChevron: find(arrows, 'angle-down-big'),
  submenu: find(arrows, 'angle-right-b'),
  check: find(condition, 'check'),
  palette: find(custom, 'color-palette'),
  none: find(custom, 'color-none'),
  copy: find(actions, 'copy'),
  cut: find(custom, 'cut'),
  paste: find(custom, 'paste'),
  cellProps: find(custom, 'table-cell-properties'),
  merge: find(custom, 'table-merge-cells'),
  split: find(custom, 'table-split-cell'),
  rowBefore: find(custom, 'table-row-insert-before'),
  rowAfter: find(custom, 'table-row-insert-after'),
  rowDelete: find(custom, 'table-row-delete'),
  rowProps: find(custom, 'table-row-properties'),
  colBefore: find(custom, 'table-column-insert-before'),
  colAfter: find(custom, 'table-column-insert-after'),
  colDelete: find(custom, 'table-column-delete'),
  tableDelete: find(custom, 'table-delete'),
}
const LIST_ICON: Record<ListStyle, string> = {
  default: find(custom, 'list-style-default'),
  disc: find(custom, 'list-style-disc'),
  circle: find(custom, 'list-style-circle'),
  square: find(custom, 'list-style-square'),
}

const Ico = ({ svg }: { svg: string }) => <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />

/* Content colours of the document — the same palette as the editor on dev
   (they colour the user's text, so they are data, not UI tokens). */
const SWATCHES: { name: string; value: string }[] = [
  { name: 'Light green', value: '#bfedd2' }, { name: 'Light yellow', value: '#fbeeb8' }, { name: 'Light red', value: '#f8cac6' },
  { name: 'Light purple', value: '#eccafa' }, { name: 'Light blue', value: '#c2e0f4' },
  { name: 'Green', value: '#2dc26b' }, { name: 'Yellow', value: '#f1c40f' }, { name: 'Red', value: '#e03e2d' },
  { name: 'Purple', value: '#b96ad9' }, { name: 'Blue', value: '#3598db' },
  { name: 'Dark turquoise', value: '#169179' }, { name: 'Orange', value: '#e67e23' }, { name: 'Dark red', value: '#ba372a' },
  { name: 'Dark purple', value: '#843fa1' }, { name: 'Dark blue', value: '#236fa1' },
  { name: 'Light gray', value: '#ecf0f1' }, { name: 'Medium gray', value: '#ced4d9' }, { name: 'Gray', value: '#95a5a6' },
  { name: 'Dark gray', value: '#7e8c8d' }, { name: 'Navy blue', value: '#34495e' },
]
const BLACK = '#000000'
const WHITE = '#ffffff'
const DEFAULT_HIGHLIGHT = '#f1c40f'

const ALIGNS: { value: Align; label: string }[] = [
  { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' }, { value: 'justify', label: 'Justify' },
]
const LIST_STYLES: { value: ListStyle; label: string }[] = [
  { value: 'default', label: 'Default' }, { value: 'disc', label: 'Disc' },
  { value: 'circle', label: 'Circle' }, { value: 'square', label: 'Square' },
]

type GroupKey = 'contents' | 'history' | 'format' | 'font' | 'indent' | 'align' | 'list' | 'highlight' | 'color' | 'block' | 'lineHeight' | 'rule' | 'table'
const GROUPS: GroupKey[] = ['contents', 'history', 'format', 'font', 'indent', 'align', 'list', 'highlight', 'color', 'block', 'lineHeight', 'rule', 'table']
type MenuKey = 'font' | 'size' | 'align' | 'listStyle' | 'highlight' | 'color' | 'block' | 'lineHeight' | 'table'
type Place = 'bar' | 'drawer' | 'measure'
type Dialog = null | { kind: 'find' | 'words'; root: HTMLElement } | { kind: 'props'; root: HTMLElement; of: PropsKind; el: HTMLElement }

const GROUP_GAP = 24   /* --space-24, Board book V6 */
const BAR_PAD_X = 16   /* --space-16 */
const MORE_W = 40      /* DS Button M icon-only */

const pt = (n: number) => `${n}pt`

/** Light swatches get a dark check mark, dark ones a white one. */
const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 160
}
const lh = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n))

/** Highlight / text-colour icons with their colour bar painted in `color`. */
const tinted = (svg: string, color: string, which: 'highlight' | 'text') =>
  which === 'highlight'
    ? svg.replace('#F1C400', color || DEFAULT_HIGHLIGHT)
    : svg.replace('<path d="M19.002 17.0034V20.0034H0.996094V17.0034H19.002Z" fill="currentColor"/>',
      `<path d="M19.002 17.0034V20.0034H0.996094V17.0034H19.002Z" fill="${color}"/>`)

/* ── floating panel that stays inside the viewport ─────────────────────── */

function Pop({ children, className, label, role = 'menu', side = 'below' }: {
  children: ReactNode; className?: string; label: string; role?: string; side?: 'below' | 'left'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [flip, setFlip] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setFlip(side === 'below' ? r.right > window.innerWidth - 8 : r.left < 8)
  }, [side])
  const cls = side === 'below'
    ? [styles.menu, flip ? styles.menuEnd : '', className]
    : [styles.menu, styles.submenu, flip ? styles.submenuRight : '', className]
  return <div ref={ref} className={cls.filter(Boolean).join(' ')} role={role} aria-label={label}>{children}</div>
}

function Row({ label, icon, selected, disabled, onSelect, submenu, onHover, labelClassName, labelStyle, role = 'menuitem' }: {
  label: string; icon?: string; selected?: boolean; disabled?: boolean; onSelect?: () => void
  submenu?: boolean; onHover?: () => void; labelClassName?: string; labelStyle?: React.CSSProperties
  role?: 'menuitem' | 'menuitemradio'
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={role === 'menuitemradio' ? !!selected : undefined}
      aria-haspopup={submenu ? 'menu' : undefined}
      disabled={disabled}
      className={[styles.row, selected ? styles.rowSelected : ''].filter(Boolean).join(' ')}
      onClick={onSelect}
      onMouseEnter={onHover}
      onFocus={onHover}
    >
      {icon !== undefined && <span className={styles.rowIcon} aria-hidden="true">{icon && <Ico svg={icon} />}</span>}
      <span className={[styles.rowLabel, labelClassName].filter(Boolean).join(' ')} style={labelStyle}>{label}</span>
      {selected && role === 'menuitemradio' && <span className={styles.rowCheck} aria-hidden="true"><Ico svg={I.check} /></span>}
      {submenu && <span className={styles.rowCheck} aria-hidden="true"><Ico svg={I.submenu} /></span>}
    </button>
  )
}

const Divider = () => <span className={styles.divider} aria-hidden="true" />

/* ── toolbar ───────────────────────────────────────────────────────────── */

export interface EditorToolbarProps {
  /** The contentEditable document. */
  docRef: RefObject<HTMLElement | null>
  contentsOpen: boolean
  onToggleContents: () => void
}

export function EditorToolbar({ docRef, contentsOpen, onToggleContents }: EditorToolbarProps) {
  const [st, setSt] = useState<EditorState>(EMPTY_STATE)
  const [menu, setMenu] = useState<MenuKey | null>(null)
  const [sub, setSub] = useState<'insert' | 'cell' | 'row' | 'column' | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [visible, setVisible] = useState(GROUPS.length)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [lastHighlight, setLastHighlight] = useState(DEFAULT_HIGHLIGHT)
  const [lastColor, setLastColor] = useState(BLACK)
  const [grid, setGrid] = useState({ r: 0, c: 0 })

  const rootRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const colorInput = useRef<HTMLInputElement>(null)
  const colorTarget = useRef<'highlight' | 'color'>('color')

  const refresh = useCallback(() => { const r = docRef.current; if (r) setSt(cmd.readState(r)) }, [docRef])

  /* Track the caret in the document. */
  useEffect(() => {
    const onSel = () => {
      const r = docRef.current
      const sel = window.getSelection()
      if (!r || !sel || !sel.anchorNode || !r.contains(sel.anchorNode)) return
      cmd.trackSelection(r)
      setSt(cmd.readState(r))
    }
    document.addEventListener('selectionchange', onSel)
    const r = docRef.current
    r?.addEventListener('input', refresh)
    return () => { document.removeEventListener('selectionchange', onSel); r?.removeEventListener('input', refresh) }
  }, [docRef, refresh])

  /* Close menus on outside click / Escape. */
  const closeAll = useCallback(() => { setMenu(null); setSub(null); setDrawer(false) }, [])
  useEffect(() => {
    if (!menu && !drawer) return
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) closeAll() }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (menu) { setMenu(null); setSub(null) } else setDrawer(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [menu, drawer, closeAll])

  /* Overflow: how many groups fit in the bar. */
  useLayoutEffect(() => {
    const bar = barRef.current
    const measure = measureRef.current
    if (!bar || !measure) return
    const compute = () => {
      const widths = Array.from(measure.children).map(c => (c as HTMLElement).offsetWidth)
      const avail = bar.clientWidth - BAR_PAD_X * 2 - MORE_W - GROUP_GAP
      let used = 0
      let n = 0
      for (const w of widths) {
        const next = used + (n ? GROUP_GAP : 0) + w
        if (next > avail) break
        used = next
        n++
      }
      setVisible(n)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [])

  /** Runs a command on the document, then re-reads the state. */
  const act = (fn: (root: HTMLElement) => void, close = true) => () => {
    const r = docRef.current
    if (!r) return
    fn(r)
    if (close) { setMenu(null); setSub(null) }
    setSt(cmd.readState(r))
  }
  const toggleMenu = (key: MenuKey) => { setSub(null); setMenu(m => (m === key ? null : key)) }

  /* ── control builders ─────────────────────────────────────────────── */

  const btn = (label: string, svg: string, onClick: () => void, o: { active?: boolean; disabled?: boolean; pressable?: boolean } = {}) => (
    <Tooltip label={label} position="bottom">
      <Button
        variant="tertiary" intent="neutral" size="m"
        aria-label={label}
        aria-pressed={o.pressable ? !!o.active : undefined}
        data-state={o.active ? 'active' : undefined}
        disabled={o.disabled}
        iconOnly={<Ico svg={svg} />}
        onClick={onClick}
      />
    </Tooltip>
  )

  /** Icon + chevron in one button that opens a menu (align, line height, table). */
  const menuBtn = (key: MenuKey, label: string, svg: string, place: Place) => (
    <Tooltip label={label} position="bottom">
      <Button
        variant="tertiary" intent="neutral" size="m"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={place !== 'measure' && menu === key}
        data-state={place !== 'measure' && menu === key ? 'active' : undefined}
        iconLeft={<Ico svg={svg} />}
        iconRight={<Ico svg={menu === key && place !== 'measure' ? I.chevronUp : I.chevronDown} />}
        onClick={() => toggleMenu(key)}
      />
    </Tooltip>
  )

  /** Split toggle: the tool button runs it, the chevron opens its options. */
  const splitBtn = (key: MenuKey, label: string, optionsLabel: string, svg: string, onMain: () => void, active: boolean, place: Place) => (
    <div className={styles.split}>
      {btn(label, svg, onMain, { active, pressable: key === 'listStyle' })}
      <Tooltip label={optionsLabel} position="bottom">
        <Button
          variant="tertiary" intent="neutral" size="m"
          aria-label={optionsLabel}
          aria-haspopup="menu"
          aria-expanded={place !== 'measure' && menu === key}
          data-state={place !== 'measure' && menu === key ? 'active' : undefined}
          iconOnly={<Ico svg={menu === key && place !== 'measure' ? I.chevronUp : I.chevronDown} />}
          onClick={() => toggleMenu(key)}
        />
      </Tooltip>
    </div>
  )

  /** DS Dropdown S trigger, as the Board book document select. */
  const select = (key: MenuKey, label: string, value: string, widthCls: string) => (
    <Tooltip label={label} position="bottom">
      <button
        type="button"
        className={[styles.select, widthCls].join(' ')}
        aria-label={`${label}: ${value}`}
        aria-haspopup="listbox"
        aria-expanded={menu === key}
        onClick={() => toggleMenu(key)}
      >
        <span className={styles.selectValue}>{value}</span>
        <span className={[styles.selectChevron, menu === key ? styles.selectChevronUp : ''].join(' ')} aria-hidden="true"><Ico svg={I.selectChevron} /></span>
      </button>
    </Tooltip>
  )

  const openColor = (target: 'highlight' | 'color') => {
    colorTarget.current = target
    const r = docRef.current
    if (r) cmd.trackSelection(r)
    colorInput.current?.click()
  }

  const colorPanel = (target: 'highlight' | 'color') => {
    const current = target === 'highlight' ? st.hiliteColor : st.foreColor
    const apply = (value: string) => act(r => {
      if (target === 'highlight') { cmd.setHiliteColor(r, value); if (value) setLastHighlight(value) }
      else { cmd.setForeColor(r, value); if (value) setLastColor(value) }
    })
    const swatch = (s: { name: string; value: string }) => (
      <button
        key={s.value}
        type="button"
        role="menuitemradio"
        aria-checked={current === s.value}
        aria-label={s.name}
        title={s.name}
        className={[styles.swatch, s.value === WHITE ? styles.swatchLight : ''].filter(Boolean).join(' ')}
        style={{ background: s.value }}
        onClick={apply(s.value)}
      >
        {current === s.value && <span className={[styles.swatchCheck, isLight(s.value) ? styles.swatchCheckDark : ''].join(' ')}><Ico svg={I.check} /></span>}
      </button>
    )
    return (
      <Pop label={target === 'highlight' ? 'Background color' : 'Text color'} className={styles.colorMenu}>
        <div className={styles.swatches}>{SWATCHES.map(swatch)}</div>
        <div className={styles.swatchExtras}>
          {swatch({ name: 'Black', value: BLACK })}
          {target === 'highlight' && swatch({ name: 'White', value: WHITE })}
          <Tooltip label="Remove color" position="bottom">
            <button type="button" role="menuitem" aria-label="Remove color" className={[styles.swatch, styles.swatchNone].join(' ')} onClick={apply('')}>
              <Ico svg={I.none} />
            </button>
          </Tooltip>
          <span className={styles.swatchSpacer} />
          <Tooltip label="Custom color" position="bottom">
            <button type="button" role="menuitem" aria-label="Custom color" className={[styles.swatch, styles.swatchTool].join(' ')}
              onClick={() => openColor(target)}>
              <Ico svg={I.palette} />
            </button>
          </Tooltip>
        </div>
      </Pop>
    )
  }

  const tableMenu = () => {
    const off = !st.inTable
    const subPanel = (key: 'insert' | 'cell' | 'row' | 'column', label: string, body: ReactNode) => sub === key && (
      <Pop label={label} side="left">{body}</Pop>
    )
    const props = (of: PropsKind) => act(r => {
      const el = cmd.currentTableEl(r, of)
      if (el) setDialog({ kind: 'props', root: r, of, el })
    })
    return (
      <Pop label="Table" className={styles.menuWide}>
        <div className={styles.rowWrap}>
          <Row label="Table" icon={I.table} submenu onHover={() => setSub('insert')} onSelect={() => setSub('insert')} />
          {subPanel('insert', 'Insert table', (
            <div className={styles.gridPicker} onMouseLeave={() => setGrid({ r: 0, c: 0 })}>
              <div className={styles.grid} role="grid" aria-label="Table size">
                {Array.from({ length: 10 }, (_, r) => Array.from({ length: 10 }, (_, c) => (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    aria-label={`${r + 1} by ${c + 1} table`}
                    className={[styles.gridCell, r < grid.r && c < grid.c ? styles.gridCellOn : ''].join(' ')}
                    onMouseEnter={() => setGrid({ r: r + 1, c: c + 1 })}
                    onFocus={() => setGrid({ r: r + 1, c: c + 1 })}
                    onClick={act(root => cmd.insertTable(root, r + 1, c + 1))}
                  />
                )))}
              </div>
              <span className={styles.gridLabel}>{grid.r ? `${grid.c} × ${grid.r}` : 'Insert table'}</span>
            </div>
          ))}
        </div>
        <Divider />
        <div className={styles.rowWrap}>
          <Row label="Cell" icon="" submenu onHover={() => setSub('cell')} onSelect={() => setSub('cell')} />
          {subPanel('cell', 'Cell', (<>
            <Row label="Cell properties" icon={I.cellProps} disabled={off} onSelect={props('cell')} />
            <Row label="Merge cells" icon={I.merge} disabled={!st.canMerge} onSelect={act(cmd.mergeCells)} />
            <Row label="Split cell" icon={I.split} disabled={!st.canSplit} onSelect={act(cmd.splitCell)} />
          </>))}
        </div>
        <div className={styles.rowWrap}>
          <Row label="Row" icon="" submenu onHover={() => setSub('row')} onSelect={() => setSub('row')} />
          {subPanel('row', 'Row', (<>
            <Row label="Insert row before" icon={I.rowBefore} disabled={off} onSelect={act(r => cmd.insertRow(r, true))} />
            <Row label="Insert row after" icon={I.rowAfter} disabled={off} onSelect={act(r => cmd.insertRow(r, false))} />
            <Row label="Delete row" icon={I.rowDelete} disabled={off} onSelect={act(cmd.deleteRow)} />
            <Row label="Row properties" icon={I.rowProps} disabled={off} onSelect={props('row')} />
            <Divider />
            <Row label="Cut row" icon={I.cut} disabled={off} onSelect={act(r => cmd.copyRow(r, true))} />
            <Row label="Copy row" icon={I.copy} disabled={off} onSelect={act(r => cmd.copyRow(r))} />
            <Row label="Paste row before" icon={I.paste} disabled={off || !cmd.hasRowClip()} onSelect={act(r => cmd.pasteRow(r, true))} />
            <Row label="Paste row after" icon={I.paste} disabled={off || !cmd.hasRowClip()} onSelect={act(r => cmd.pasteRow(r, false))} />
          </>))}
        </div>
        <div className={styles.rowWrap}>
          <Row label="Column" icon="" submenu onHover={() => setSub('column')} onSelect={() => setSub('column')} />
          {subPanel('column', 'Column', (<>
            <Row label="Insert column before" icon={I.colBefore} disabled={off} onSelect={act(r => cmd.insertColumn(r, true))} />
            <Row label="Insert column after" icon={I.colAfter} disabled={off} onSelect={act(r => cmd.insertColumn(r, false))} />
            <Row label="Delete column" icon={I.colDelete} disabled={off} onSelect={act(cmd.deleteColumn)} />
            <Divider />
            <Row label="Cut column" icon={I.cut} disabled={off} onSelect={act(r => cmd.copyColumn(r, true))} />
            <Row label="Copy column" icon={I.copy} disabled={off} onSelect={act(r => cmd.copyColumn(r))} />
            <Row label="Paste column before" icon={I.paste} disabled={off || !cmd.hasColClip()} onSelect={act(r => cmd.pasteColumn(r, true))} />
            <Row label="Paste column after" icon={I.paste} disabled={off || !cmd.hasColClip()} onSelect={act(r => cmd.pasteColumn(r, false))} />
          </>))}
        </div>
        <Divider />
        <div onMouseEnter={() => setSub(null)}>
          <Row label="Table properties" icon="" disabled={off} onSelect={props('table')} />
          <Row label="Delete table" icon={I.tableDelete} disabled={off} onSelect={act(cmd.deleteTable)} />
        </div>
      </Pop>
    )
  }

  /* ── groups ───────────────────────────────────────────────────────── */

  const live = (place: Place, key: MenuKey) => place !== 'measure' && menu === key

  const group = (key: GroupKey, place: Place): ReactNode => {
    switch (key) {
      case 'contents':
        return btn(contentsOpen ? 'Hide contents' : 'Show contents', contentsOpen ? I.contentsOpen : I.contentsClosed, onToggleContents)
      case 'history':
        return <>
          {btn('Undo', I.undo, act(cmd.undo), { disabled: !st.canUndo })}
          {btn('Redo', I.redo, act(cmd.redo), { disabled: !st.canRedo })}
        </>
      case 'format':
        return <>
          {btn('Bold', I.bold, act(cmd.toggleBold), { active: st.bold, pressable: true })}
          {btn('Italic', I.italic, act(cmd.toggleItalic), { active: st.italic, pressable: true })}
          {btn('Underline', I.underline, act(cmd.toggleUnderline), { active: st.underline, pressable: true })}
        </>
      case 'font':
        return <span className={styles.selects}>
          <span className={styles.wrap}>
            {select('font', 'Font', st.fontName, styles.selectFont)}
            {live(place, 'font') && (
              <Pop label="Fonts" role="listbox">
                {FONT_NAMES.map(f => (
                  <Row key={f} role="menuitemradio" label={f} selected={st.fontName === f} labelStyle={{ fontFamily: f }}
                    onSelect={act(r => cmd.setFontName(r, f))} />
                ))}
              </Pop>
            )}
          </span>
          <span className={styles.wrap}>
            {select('size', 'Font size', pt(st.fontSize), styles.selectSize)}
            {live(place, 'size') && (
              <Pop label="Font sizes" role="listbox" className={styles.menuNarrow}>
                {FONT_SIZES.map(s => (
                  <Row key={s} role="menuitemradio" label={pt(s)} selected={st.fontSize === s} onSelect={act(r => cmd.setFontSize(r, s))} />
                ))}
              </Pop>
            )}
          </span>
        </span>
      case 'indent':
        return <>
          {btn('Decrease indent', I.outdent, act(cmd.outdent))}
          {btn('Increase indent', I.indent, act(cmd.indent))}
        </>
      case 'align':
        return <span className={styles.wrap}>
          {menuBtn('align', 'Align', I[st.align], place)}
          {live(place, 'align') && (
            <Pop label="Align">
              {ALIGNS.map(a => (
                <Row key={a.value} role="menuitemradio" label={a.label} icon={I[a.value]} selected={st.align === a.value}
                  onSelect={act(r => cmd.setAlign(r, a.value))} />
              ))}
            </Pop>
          )}
        </span>
      case 'list':
        return <span className={styles.wrap}>
          {splitBtn('listStyle', 'Bullet list', 'Bullet list styles', I.list, act(cmd.toggleList), st.list, place)}
          {live(place, 'listStyle') && (
            <Pop label="Bullet list styles" className={styles.listMenu}>
              {LIST_STYLES.map(s => (
                <Tooltip key={s.value} label={s.label} position="bottom">
                  <button type="button" role="menuitemradio" aria-checked={st.list && st.listStyle === s.value} aria-label={s.label}
                    className={[styles.listTile, st.list && st.listStyle === s.value ? styles.listTileOn : ''].join(' ')}
                    onClick={act(r => cmd.setListStyle(r, s.value))}>
                    <Ico svg={LIST_ICON[s.value]} />
                  </button>
                </Tooltip>
              ))}
            </Pop>
          )}
        </span>
      case 'highlight':
        return <span className={styles.wrap}>
          {splitBtn('highlight', 'Background color', 'Background color options', tinted(I.highlight, lastHighlight, 'highlight'),
            act(r => cmd.setHiliteColor(r, lastHighlight)), false, place)}
          {live(place, 'highlight') && colorPanel('highlight')}
        </span>
      case 'color':
        return <span className={styles.wrap}>
          {splitBtn('color', 'Text color', 'Text color options', tinted(I.textColor, lastColor, 'text'),
            act(r => cmd.setForeColor(r, lastColor)), false, place)}
          {live(place, 'color') && colorPanel('color')}
        </span>
      case 'block':
        return <span className={styles.wrap}>
          {select('block', 'Blocks', BLOCKS.find(b => b.value === st.block)?.label ?? 'Paragraph', styles.selectBlock)}
          {live(place, 'block') && (
            <Pop label="Blocks" role="listbox">
              {BLOCKS.map(b => (
                <Row key={b.value} role="menuitemradio" label={b.label} selected={st.block === b.value}
                  labelClassName={styles[`block_${b.value}`]} onSelect={act(r => cmd.setBlock(r, b.value))} />
              ))}
            </Pop>
          )}
        </span>
      case 'lineHeight':
        return <span className={styles.wrap}>
          {menuBtn('lineHeight', 'Line height', I.lineHeight, place)}
          {live(place, 'lineHeight') && (
            <Pop label="Line height" className={styles.menuNarrow}>
              {LINE_HEIGHTS.map(v => (
                <Row key={v} role="menuitemradio" label={lh(v)} selected={st.lineHeight === v} onSelect={act(r => cmd.setLineHeight(r, v))} />
              ))}
            </Pop>
          )}
        </span>
      case 'rule':
        return btn('Horizontal line', I.rule, act(cmd.insertRule))
      case 'table':
        return <span className={styles.wrap}>
          {menuBtn('table', 'Table', I.table, place)}
          {live(place, 'table') && tableMenu()}
        </span>
    }
  }

  const render = (place: Place, keys: GroupKey[]) =>
    keys.map(k => <div key={k} className={styles.group} data-group={k}>{group(k, place)}</div>)

  const inBar = GROUPS.slice(0, visible)
  const overflow = GROUPS.slice(visible)

  return (
    <div
      ref={rootRef}
      className={styles.root}
      /* Keep the caret in the document: toolbar controls never take focus on click. */
      onMouseDown={e => { if (!(e.target as HTMLElement).closest('input, textarea')) e.preventDefault() }}
    >
      <div ref={barRef} className={styles.bar} role="toolbar" aria-label="Formatting">
        {render('bar', inBar)}
        <div className={[styles.group, styles.moreGroup].join(' ')}>
          {btn('More', I.more, () => { setMenu(null); setDrawer(d => !d) }, { active: drawer })}
        </div>
      </div>

      {drawer && (
        <div className={styles.drawer} role="toolbar" aria-label="More formatting">
          {render('drawer', overflow)}
          <div className={styles.group}>
            {btn('Clear formatting', I.clear, act(cmd.clearFormatting))}
            {btn('Find and replace', I.search, () => { const r = docRef.current; closeAll(); if (r) setDialog({ kind: 'find', root: r }) })}
            {btn('Word count', I.wordCount, () => { const r = docRef.current; closeAll(); if (r) setDialog({ kind: 'words', root: r }) })}
          </div>
        </div>
      )}

      {/* Hidden copy of every group — measures widths for the overflow split. */}
      <div ref={measureRef} className={styles.measure} aria-hidden="true" inert>
        {render('measure', GROUPS)}
      </div>

      <input ref={colorInput} type="color" className={styles.colorInput} tabIndex={-1} aria-hidden="true"
        onChange={e => {
          const v = e.target.value
          act(r => {
            if (colorTarget.current === 'highlight') { cmd.setHiliteColor(r, v); setLastHighlight(v) }
            else { cmd.setForeColor(r, v); setLastColor(v) }
          })()
        }} />

      {dialog?.kind === 'find' && <FindReplaceDialog root={dialog.root} onClose={() => { setDialog(null); refresh() }} />}
      {dialog?.kind === 'words' && <WordCountDialog root={dialog.root} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'props' && (
        <PropertiesDialog root={dialog.root} kind={dialog.of} el={dialog.el} onClose={() => { setDialog(null); refresh() }} />
      )}
    </div>
  )
}

export default EditorToolbar
