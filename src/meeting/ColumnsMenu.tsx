/* ColumnsMenu — table column customisation, as on the Tasks page: a "columns"
   icon button in the header opens a popover listing every column with a drag
   handle (reorder) and a checkbox (show / hide). The first column is locked:
   always shown, never moved. */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../components/Button/Button'
import { Tooltip } from '../components/Tooltip/Tooltip'
import { Checkbox } from '../components/Checkbox/Checkbox'
import { functional } from '../icons/functional'
import { files } from '../icons/files'
import styles from './ColumnsMenu.module.css'

const svgOf = (set: { name: string; svg: string }[], name: string) => set.find(i => i.name === name)?.svg ?? ''
const columnsSvg = svgOf(files, 'columns')
const dragSvg    = svgOf(functional, 'drag')

export interface ColumnsMenuItem {
  key: string
  label: string
  /** Always visible and pinned first (e.g. the Name column). */
  locked?: boolean
}

export interface ColumnsMenuProps {
  /** Every customisable column, in display order. */
  items: ColumnsMenuItem[]
  /** Keys that are currently hidden. */
  hidden: ReadonlySet<string>
  onChange: (order: string[], hidden: Set<string>) => void
  className?: string
}

export function ColumnsMenu({ items, hidden, onChange, className }: ColumnsMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [overKey, setOverKey] = useState<string | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [open, calcPos])

  const toggle = (key: string) => {
    const next = new Set(hidden)
    if (next.has(key)) next.delete(key); else next.add(key)
    onChange(items.map(i => i.key), next)
  }

  const drop = (target: string) => {
    if (dragKey && dragKey !== target) {
      const keys = items.map(i => i.key)
      keys.splice(keys.indexOf(dragKey), 1)
      keys.splice(keys.indexOf(target), 0, dragKey)
      onChange(keys, new Set(hidden))
    }
    setDragKey(null)
    setOverKey(null)
  }

  return (
    <div ref={triggerRef} className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <Tooltip label="Customize columns" position="bottom">
        <Button
          variant="tertiary"
          intent="neutral"
          size="m"
          iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: columnsSvg }} />}
          aria-label="Customize columns"
          aria-haspopup="menu"
          aria-expanded={open}
          className={open ? styles.triggerOpen : undefined}
          onClick={() => { calcPos(); setOpen(o => !o) }}
        />
      </Tooltip>

      {open && createPortal(
        <div ref={menuRef} className={styles.menu} style={{ top: pos.top, right: pos.right }} role="menu">
          {items.map(it => (
            <div
              key={it.key}
              role="menuitem"
              className={[
                styles.row,
                !hidden.has(it.key) ? styles.checked : '',
                it.locked ? styles.locked : '',
                dragKey === it.key ? styles.dragging : '',
                overKey === it.key && dragKey !== it.key ? styles.over : '',
              ].filter(Boolean).join(' ')}
              draggable={!it.locked}
              onDragStart={e => { setDragKey(it.key); e.dataTransfer.effectAllowed = 'move' }}
              onDragOver={e => { if (dragKey && !it.locked) { e.preventDefault(); setOverKey(it.key) } }}
              onDrop={e => { e.preventDefault(); if (!it.locked) drop(it.key) }}
              onDragEnd={() => { setDragKey(null); setOverKey(null) }}
            >
              <span className={styles.handle} aria-hidden="true" dangerouslySetInnerHTML={{ __html: dragSvg }} />
              <Checkbox
                label={it.label}
                checked={!hidden.has(it.key)}
                disabled={it.locked}
                onChange={() => toggle(it.key)}
              />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}

export default ColumnsMenu
