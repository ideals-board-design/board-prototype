/* EditorDialogs — the Minutes editor's dialogs, opened from EditorToolbar:
   Find and replace (More → Search), Word count (More → Word count) and
   Table / Row / Cell properties (Table menu). DS Modal + TextField +
   SegmentControl + Checkbox; the editing itself lives in editorCommands. */

import { useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Checkbox } from '../../components/Checkbox/Checkbox'
import { Modal } from '../../components/Modal/Modal'
import { SegmentControl } from '../../components/SegmentControl/SegmentControl'
import { TextField } from '../../components/TextField/TextField'
import {
  applyTableElProps, countMatches, countText, findNext, readTableElProps, replaceAll, replaceCurrent, selectionText,
  type TableElProps,
} from './editorCommands'
import styles from './EditorToolbar.module.css'

/* ── Find and replace ─────────────────────────────────────────────────── */

export function FindReplaceDialog({ root, onClose }: { root: HTMLElement; onClose: () => void }) {
  const [find, setFind] = useState(() => selectionText(root))
  const [replace, setReplace] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [status, setStatus] = useState('')

  const total = countMatches(root, find, matchCase)
  const next = () => {
    const i = findNext(root, find, matchCase)
    setStatus(i ? `${i} of ${countMatches(root, find, matchCase)}` : 'No matches')
  }
  const one = () => {
    if (!replaceCurrent(root, find, replace, matchCase)) { next(); return }
    const i = findNext(root, find, matchCase)
    setStatus(i ? `Replaced. ${i} of ${countMatches(root, find, matchCase)}` : 'Replaced. No more matches')
  }
  const all = () => {
    const n = replaceAll(root, find, replace, matchCase)
    setStatus(n ? `Replaced ${n} ${n === 1 ? 'match' : 'matches'}` : 'No matches')
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Find and replace"
      footer={
        <div className={styles.dialogFooter}>
          <span className={styles.dialogStatus} aria-live="polite">{status || (find ? `${total} ${total === 1 ? 'match' : 'matches'}` : '')}</span>
          <Button variant="secondary" intent="neutral" size="m" disabled={!find} onClick={one}>Replace</Button>
          <Button variant="secondary" intent="neutral" size="m" disabled={!find} onClick={all}>Replace all</Button>
          <Button variant="primary" size="m" disabled={!find} onClick={next}>Find next</Button>
        </div>
      }
    >
      <div className={styles.dialogBody}>
        <TextField label="Find" value={find} autoFocus onChange={e => { setFind(e.target.value); setStatus('') }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); next() } }} />
        <TextField label="Replace with" value={replace} onChange={e => setReplace(e.target.value)} />
        <Checkbox label="Match case" checked={matchCase} onChange={e => { setMatchCase(e.target.checked); setStatus('') }} />
      </div>
    </Modal>
  )
}

/* ── Word count ───────────────────────────────────────────────────────── */

export function WordCountDialog({ root, onClose }: { root: HTMLElement; onClose: () => void }) {
  const doc = countText(root.innerText)
  const sel = countText(selectionText(root))
  const rows: [string, number, number][] = [
    ['Words', doc.words, sel.words],
    ['Characters (no spaces)', doc.charsNoSpaces, sel.charsNoSpaces],
    ['Characters', doc.chars, sel.chars],
  ]
  return (
    <Modal
      open
      onClose={onClose}
      title="Word count"
      footer={
        <div className={styles.dialogFooter}>
          <Button variant="primary" size="m" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <table className={styles.countTable}>
        <thead>
          <tr><th>Count</th><th>Document</th><th>Selection</th></tr>
        </thead>
        <tbody>
          {rows.map(([label, d, s]) => (
            <tr key={label}><td>{label}</td><td>{d}</td><td>{s}</td></tr>
          ))}
        </tbody>
      </table>
    </Modal>
  )
}

/* ── Table / row / cell properties ────────────────────────────────────── */

const ALIGN_ITEMS = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
]

export type PropsKind = 'table' | 'row' | 'cell'
const KIND_TITLE: Record<PropsKind, string> = { table: 'Table properties', row: 'Row properties', cell: 'Cell properties' }

export function PropertiesDialog({ root, kind, el, onClose }: { root: HTMLElement; kind: PropsKind; el: HTMLElement; onClose: () => void }) {
  const [p, setP] = useState<TableElProps>(() => readTableElProps(el))
  const save = () => { applyTableElProps(root, el, p); onClose() }
  return (
    <Modal
      open
      onClose={onClose}
      title={KIND_TITLE[kind]}
      footer={
        <div className={styles.dialogFooter}>
          <Button variant="secondary" intent="neutral" size="m" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="m" onClick={save}>Save</Button>
        </div>
      }
    >
      <div className={styles.dialogBody}>
        {kind !== 'row' && (
          <TextField label="Width" placeholder={kind === 'table' ? 'e.g. 100% or 480px' : 'e.g. 160px'}
            value={p.width} onChange={e => setP({ ...p, width: e.target.value })} />
        )}
        {kind !== 'table' && (
          <TextField label="Height" placeholder="e.g. 40px" value={p.height} onChange={e => setP({ ...p, height: e.target.value })} />
        )}
        <div className={styles.dialogField}>
          <span className={styles.dialogLabel}>Text alignment</span>
          <SegmentControl items={ALIGN_ITEMS} size="s" value={p.align} onChange={v => setP({ ...p, align: v as TableElProps['align'] })} />
        </div>
      </div>
    </Modal>
  )
}
