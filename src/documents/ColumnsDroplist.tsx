/* ColumnsDroplist — Figma 947-17476 (default) · 4155-10677/11072 (drag states)
   Column visibility + drag-to-reorder droplist for the Documents table.

   - Locked columns (Name, Added by) sit at the front: disabled checkbox +
     disabled handle, cannot be toggled or reordered.
   - Pointer-based DnD: a floating chip follows the cursor, the original slot
     stays as a dimmed ghost, and a green target line marks the nearest valid
     gap. Releasing outside the list (or on the original gap) is a no-op and
     the chip animates back.

   The pointermove/pointerup listeners are attached synchronously on
   pointerdown (not via an effect) so that no move is missed on a fast drag. */

import { useRef, useState, type CSSProperties } from 'react'
import { Toggle }     from '../components/Toggle/Toggle'
import { Checkbox }   from '../components/Checkbox/Checkbox'
import { functional } from '../icons/functional'
import styles from './ColumnsDroplist.module.css'

const dragSvg = functional.find(i => i.name === 'drag')!.svg

export interface ColumnRow {
  key:     string
  label:   string
  locked:  boolean
  visible: boolean
}

interface DragState {
  key:         string
  index:       number
  chipWidth:   number
  offsetX:     number
  offsetY:     number
  originLeft:  number
  originTop:   number
  x:           number
  y:           number
  inside:      boolean
  targetIndex: number | null
  targetTop:   number | null   // px within the items container
  returning:   boolean
}

interface ColumnsDroplistProps {
  items:                ColumnRow[]   // full order, locked first
  foldersFirst:         boolean
  onFoldersFirstChange: (value: boolean) => void
  onToggleVisible:      (key: string) => void
  onReorder:            (newOrderKeys: string[]) => void
  style?:               CSSProperties
}

export function ColumnsDroplist({
  items,
  foldersFirst,
  onFoldersFirstChange,
  onToggleVisible,
  onReorder,
  style,
}: ColumnsDroplistProps) {
  const lockedCount = items.filter(i => i.locked).length

  const itemsRef = useRef<HTMLDivElement>(null)
  const rowRefs  = useRef<(HTMLDivElement | null)[]>([])
  const dragRef  = useRef<DragState | null>(null)
  const liveRef  = useRef({ items, onReorder, lockedCount })
  liveRef.current = { items, onReorder, lockedCount }

  const [drag, setDrag] = useState<DragState | null>(null)

  function update(next: DragState | null) {
    dragRef.current = next
    setDrag(next)
  }

  /* Nearest valid insertion gap for a pointer Y (never before locked slots). */
  function computeTarget(clientY: number) {
    const cont = itemsRef.current!.getBoundingClientRect()
    const { items: list, lockedCount: locked } = liveRef.current
    let index = list.length
    for (let i = locked; i < list.length; i++) {
      const r = rowRefs.current[i]?.getBoundingClientRect()
      if (!r) continue
      if (clientY < r.top + r.height / 2) { index = i; break }
    }
    index = Math.max(locked, Math.min(index, list.length))
    const top = index < list.length
      ? rowRefs.current[index]!.getBoundingClientRect().top - cont.top
      : rowRefs.current[list.length - 1]!.getBoundingClientRect().bottom - cont.top
    return { index, top }
  }

  function onHandleDown(e: React.PointerEvent, index: number) {
    if (items[index].locked || e.button !== 0) return
    e.preventDefault()
    const rowEl = rowRefs.current[index]
    if (!rowEl) return
    const rect = rowEl.getBoundingClientRect()

    update({
      key:         items[index].key,
      index,
      chipWidth:   rect.width,
      offsetX:     e.clientX - rect.left,
      offsetY:     e.clientY - rect.top,
      originLeft:  rect.left,
      originTop:   rect.top,
      x:           e.clientX,
      y:           e.clientY,
      inside:      true,
      targetIndex: index,
      targetTop:   null,
      returning:   false,
    })

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      const cont = itemsRef.current?.getBoundingClientRect()
      const inside = !!cont &&
        ev.clientX >= cont.left && ev.clientX <= cont.right &&
        ev.clientY >= cont.top  && ev.clientY <= cont.bottom
      let targetIndex: number | null = null
      let targetTop:   number | null = null
      if (inside) {
        const t = computeTarget(ev.clientY)
        targetIndex = t.index
        targetTop   = t.top
      }
      update({ ...d, x: ev.clientX, y: ev.clientY, inside, targetIndex, targetTop })
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.classList.remove(styles.grabbing)
      const d = dragRef.current
      if (!d) return
      const { items: list, onReorder: reorder } = liveRef.current
      if (d.inside && d.targetIndex != null) {
        const keys = list.map(i => i.key)
        const [moved] = keys.splice(d.index, 1)
        const insertAt = d.targetIndex > d.index ? d.targetIndex - 1 : d.targetIndex
        keys.splice(insertAt, 0, moved)
        if (keys.some((k, i) => k !== list[i].key)) reorder(keys)
        update(null)                          // committed → chip disappears
      } else {
        update({ ...d, returning: true })     // outside / no change → animate home
      }
    }

    document.body.classList.add(styles.grabbing)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function onChipTransitionEnd() {
    if (dragRef.current?.returning) update(null)
  }

  // The chip is pinned at its origin and moved with `transform` — never left/top —
  // so the return home animates a compositor-only property.
  const chipStyle: CSSProperties | undefined = drag
    ? {
        left:      drag.originLeft,
        top:       drag.originTop,
        width:     drag.chipWidth,
        transform: drag.returning
          ? 'translate(0, 0)'
          : `translate(${drag.x - drag.offsetX - drag.originLeft}px, ${drag.y - drag.offsetY - drag.originTop}px)`,
      }
    : undefined

  const dragItem = drag ? items.find(i => i.key === drag.key) : null
  const showLine = drag && !drag.returning && drag.inside && drag.targetTop != null

  return (
    <div className={styles.droplist} style={style} role="menu" aria-label="Columns">
      {/* Folders-first setting */}
      <div className={styles.settingRow}>
        <Toggle
          checked={foldersFirst}
          onChange={e => onFoldersFirstChange(e.currentTarget.checked)}
          aria-label="Folders first"
        />
        <span className={styles.rowLabel}>Folders first</span>
      </div>

      {/* Draggable / toggleable columns */}
      <div className={styles.items} ref={itemsRef}>
        {showLine && (
          <div className={styles.targetLine} style={{ top: drag!.targetTop! }} aria-hidden />
        )}

        {items.map((item, index) => (
          <div
            key={item.key}
            ref={el => { rowRefs.current[index] = el }}
            className={[
              styles.row,
              item.visible ? styles.rowSelected : '',
              item.locked  ? styles.rowLocked   : '',
              drag && drag.key === item.key && !drag.returning ? styles.rowGhost : '',
            ].filter(Boolean).join(' ')}
            onClick={() => { if (!item.locked) onToggleVisible(item.key) }}
          >
            {/* Drag handle — grabs the item; clicking it must NOT toggle selection */}
            <span
              className={[styles.handle, item.locked ? styles.handleLocked : ''].filter(Boolean).join(' ')}
              onPointerDown={e => onHandleDown(e, index)}
              onClick={e => e.stopPropagation()}
              dangerouslySetInnerHTML={{ __html: dragSvg }}
              aria-hidden
            />
            {/* Visual indicator only — the whole row is the toggle target */}
            <Checkbox
              className={styles.check}
              checked={item.visible}
              disabled={item.locked}
              readOnly
              tabIndex={-1}
              aria-label={item.label}
            />
            <span className={styles.rowLabel}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Floating chip */}
      {drag && dragItem && (
        <div
          className={[
            styles.chip,
            dragItem.visible ? styles.chipSelected : '',
            drag.returning ? styles.chipReturning : '',
          ].filter(Boolean).join(' ')}
          style={chipStyle}
          onTransitionEnd={onChipTransitionEnd}
          aria-hidden
        >
          <span className={styles.handle} dangerouslySetInnerHTML={{ __html: dragSvg }} />
          <Checkbox className={styles.check} checked={dragItem.visible} readOnly aria-hidden tabIndex={-1} />
          <span className={styles.rowLabel}>{dragItem.label}</span>
        </div>
      )}
    </div>
  )
}

export default ColumnsDroplist
