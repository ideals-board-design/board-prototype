/* MotionsField — add / edit / reorder / delete motions for an agenda item in edit
   mode (Figma 11710-104437). Motions are optional. A single motion has no drag
   handle; with 2+ each row gets a handle and can be reordered (HTML5 drag, green
   drop line). Empty motions are discarded on blur; Enter/Tab commit. Deleting is
   immediate (no confirm). State changes flow straight to onChange (the prototype's
   autosave — publish/persistence behaviour is unchanged). */

import { useState, useRef, useEffect, useCallback } from 'react'
import { TextField } from '../components/TextField/TextField'
import { Button }    from '../components/Button/Button'
import { Tooltip }   from '../components/Tooltip/Tooltip'
import { functional } from '../icons/functional'
import { actions }   from '../icons/actions'
import styles from './MotionsField.module.css'

const dragSvg   = functional.find(i => i.name === 'drag')!.svg
const removeSvg  = actions.find(i => i.name === 'multiply')!.svg

export interface MotionsFieldProps {
  motions:  string[]
  onChange: (motions: string[]) => void
}

export function MotionsField({ motions, onChange }: MotionsFieldProps) {
  /* Index of a field that should grab focus after the next render (a new/clicked
     motion). Cleared once focused. */
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const [dragIndex,  setDragIndex]  = useState<number | null>(null)  // for the dimming class
  const [dropIndex,  setDropIndex]  = useState<number | null>(null)
  /* Ref mirror of the dragged index so the drag handlers read it synchronously
     (state may not have flushed between dragstart and the first dragover). */
  const dragIndexRef = useRef<number | null>(null)
  const fieldRefs = useRef<(HTMLTextAreaElement | HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (focusIndex == null) return
    const el = fieldRefs.current[focusIndex]
    el?.focus()
    setFocusIndex(null)
  }, [focusIndex, motions.length])

  const showHandles = motions.length >= 2

  const updateMotion = (i: number, value: string) => {
    onChange(motions.map((m, idx) => (idx === i ? value : m)))
  }

  const addMotion = () => {
    onChange([...motions, ''])
    setFocusIndex(motions.length)
  }

  const deleteMotion = (i: number) => {
    /* Immediate delete, no confirmation. (If a vote were in progress for this
       motion the existing error behaviour would apply instead — out of scope in
       this prototype, which has no live votes.) */
    onChange(motions.filter((_, idx) => idx !== i))
  }

  /* On blur, an empty motion is discarded (never saved/displayed). */
  const commitMotion = (i: number) => {
    if ((motions[i] ?? '').trim() === '') {
      onChange(motions.filter((_, idx) => idx !== i))
    }
  }

  /* ── Reorder (HTML5 drag from the handle) ────────────────────────────────── */
  const startDrag = (i: number) => { dragIndexRef.current = i; setDragIndex(i) }

  const onDragOverRow = useCallback((e: React.DragEvent, i: number) => {
    if (dragIndexRef.current == null) return
    e.preventDefault()
    const rect  = e.currentTarget.getBoundingClientRect()
    const after = e.clientY > rect.top + rect.height / 2
    setDropIndex(after ? i + 1 : i)
  }, [])

  const finishDrag = () => {
    const from = dragIndexRef.current
    if (from != null && dropIndex != null && dropIndex !== from && dropIndex !== from + 1) {
      const next = [...motions]
      const [moved] = next.splice(from, 1)
      next.splice(dropIndex > from ? dropIndex - 1 : dropIndex, 0, moved)
      onChange(next)
    }
    dragIndexRef.current = null
    setDragIndex(null)
    setDropIndex(null)
  }

  return (
    <div className={styles.list} onDrop={finishDrag} onDragEnd={finishDrag}>
      {motions.map((motion, i) => (
        <div
          key={i}
          className={[styles.rowWrap, dragIndex === i ? styles.dragging : ''].filter(Boolean).join(' ')}
          onDragOver={e => onDragOverRow(e, i)}
        >
          {dropIndex === i && <div className={styles.dropLine} aria-hidden="true" />}
          <div className={styles.row}>
            {showHandles && (
              <span
                className={styles.handle}
                draggable
                onDragStart={() => startDrag(i)}
                aria-label="Drag to reorder"
                dangerouslySetInnerHTML={{ __html: dragSvg }}
              />
            )}
            <TextField
              ref={el => { fieldRefs.current[i] = el }}
              className={styles.field}
              variant="outline"
              size="m"
              multiline
              value={motion}
              placeholder="Motion"
              aria-label={`Motion ${i + 1}`}
              onChange={e => updateMotion(i, e.target.value)}
              onBlur={() => commitMotion(i)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); (e.currentTarget as HTMLElement).blur() }
              }}
            />
            <Tooltip label="Delete" position="top">
              <Button
                variant="tertiary"
                intent="neutral"
                size="m"
                className={styles.remove}
                iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: removeSvg }} />}
                onClick={() => deleteMotion(i)}
                aria-label={`Delete motion ${i + 1}`}
              />
            </Tooltip>
          </div>
        </div>
      ))}

      {dropIndex === motions.length && motions.length > 0 && <div className={styles.dropLine} aria-hidden="true" />}

      <button
        type="button"
        className={[styles.addBtn, showHandles ? styles.addBtnIndented : ''].filter(Boolean).join(' ')}
        onClick={addMotion}
      >
        Add motion
      </button>
    </div>
  )
}

export default MotionsField
