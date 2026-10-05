/* EditPurposeModal — configure a group's purpose options (name + colour).
   Figma "Edit purpose" (14176-133853). Names are capped at 30 characters; over
   the limit the field shows an error and Save is blocked until it's resolved. */

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Modal }     from '../components/Modal/Modal'
import { Button }    from '../components/Button/Button'
import { TextField } from '../components/TextField/TextField'
import { arrows }    from '../icons/arrows'
import { actions }   from '../icons/actions'
import { condition } from '../icons/condition'
import type { PurposeOption } from './PurposeField'
import styles from './EditPurposeModal.module.css'

const chevronDownSvg = arrows.find(i => i.name === 'angle-down-fill')!.svg
const chevronUpSvg   = arrows.find(i => i.name === 'angle-up-fill')!.svg
const plusSvg        = actions.find(i => i.name === 'plus')!.svg
const removeSvg      = actions.find(i => i.name === 'multiply')!.svg
const checkSvg       = condition.find(i => i.name === 'check')!.svg

/** Max characters for a purpose name (validation). */
export const MAX_PURPOSE_LEN = 30

/** The group's tag-colour palette (DS tag tokens), in Figma swatch order. */
const PURPOSE_PALETTE = [
  'var(--tag-blue)',
  'var(--tag-green)',
  'var(--tag-red)',
  'var(--tag-navyblue)',
  'var(--tag-orange)',
  'var(--tag-kepeel)',
  'var(--tag-beetroot)',
]

/** Editable row — carries a stable key so inputs stay controlled across removes. */
interface Row {
  key:   string
  value: string
  label: string
  color: string
}

/* ── Colour picker (swatch trigger + portal palette) ─────────────────────── */
function ColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left })
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.colorTrigger}
        onClick={() => { calcPos(); setOpen(o => !o) }}
        aria-label="Select colour"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.swatch} style={{ background: color }} aria-hidden="true" />
        <span className={styles.colorChevron} aria-hidden="true" dangerouslySetInnerHTML={{ __html: open ? chevronUpSvg : chevronDownSvg }} />
      </button>
      {open && createPortal(
        <div ref={menuRef} className={styles.colorMenu} style={{ top: pos.top, left: pos.left }} role="listbox">
          {PURPOSE_PALETTE.map(c => (
            <button
              key={c}
              type="button"
              className={styles.swatchOption}
              onClick={() => { onChange(c); setOpen(false) }}
              aria-label={c}
              aria-selected={c === color}
            >
              <span className={styles.swatchLarge} style={{ background: c }} aria-hidden="true">
                {c === color && (
                  <span className={styles.swatchCheck} dangerouslySetInnerHTML={{ __html: checkSvg }} />
                )}
              </span>
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}

export interface EditPurposeModalProps {
  open:     boolean
  options:  PurposeOption[]
  onSave:   (options: PurposeOption[]) => void
  onClose:  () => void
}

export function EditPurposeModal({ open, options, onSave, onClose }: EditPurposeModalProps) {
  const [rows, setRows] = useState<Row[]>(() => options.map(o => ({ key: o.value, ...o })))
  const nextKey = useRef(1)

  /* Reset the editable copy each time the modal opens. */
  useEffect(() => {
    if (open) setRows(options.map(o => ({ key: o.value, ...o })))
  }, [open, options])

  const updateRow = (key: string, patch: Partial<Row>) =>
    setRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)))
  const removeRow = (key: string) =>
    setRows(prev => prev.filter(r => r.key !== key))
  const addRow = () => {
    const id = `new-${nextKey.current++}`
    setRows(prev => [...prev, {
      key:   id,
      value: id,
      label: '',
      color: PURPOSE_PALETTE[prev.length % PURPOSE_PALETTE.length],
    }])
  }

  const hasError = rows.some(r => r.label.length > MAX_PURPOSE_LEN)

  const handleSave = () => {
    if (hasError) return
    // Drop fully-empty rows; keep value stable so already-assigned items keep their purpose.
    const cleaned = rows
      .filter(r => r.label.trim().length > 0)
      .map(({ value, label, color }) => ({ value, label: label.trim(), color }))
    onSave(cleaned)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit purpose"
      width={560}
      footer={
        <>
          <Button variant="secondary" intent="neutral" size="m" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="m" disabled={hasError} onClick={handleSave}>Save</Button>
        </>
      }
    >
      <p className={styles.description}>Changes to these settings apply to all meetings, past and upcoming</p>

      <div className={styles.rows}>
        {rows.map(row => (
          <div key={row.key} className={styles.row}>
            <div className={styles.nameField}>
              <TextField
                value={row.label}
                placeholder="Add purpose"
                aria-label="Purpose name"
                error={row.label.length > MAX_PURPOSE_LEN ? `Maximum of ${MAX_PURPOSE_LEN} characters allowed` : false}
                onChange={e => updateRow(row.key, { label: e.target.value })}
              />
            </div>
            <ColorPicker color={row.color} onChange={color => updateRow(row.key, { color })} />
            <Button
              variant="tertiary"
              intent="neutral"
              size="m"
              iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: removeSvg }} />}
              onClick={() => removeRow(row.key)}
              aria-label={`Remove ${row.label || 'purpose'}`}
            />
          </div>
        ))}
      </div>

      <div className={styles.addRow}>
        <Button
          variant="secondary"
          intent="neutral"
          size="m"
          iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: plusSvg }} />}
          onClick={addRow}
        >
          Add purpose
        </Button>
      </div>
    </Modal>
  )
}

export default EditPurposeModal
