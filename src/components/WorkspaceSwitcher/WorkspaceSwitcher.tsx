/* WorkspaceSwitcher — Figma nodes 34956-1814 (Active) · 34956-1816 (Hover) · 34956-1932 (Opened)
   Trigger: 240×48px. Dropdown: 232×auto, dark panel, 4px gap below trigger. */

import { useState, useEffect, useRef } from 'react'
import { arrows } from '../../icons/arrows'
import styles from './WorkspaceSwitcher.module.css'

const chevronDownSvg = arrows.find(i => i.name === 'angle-down-fill')!.svg
const chevronUpSvg   = arrows.find(i => i.name === 'angle-up-fill')!.svg

export interface Workspace {
  id:       string
  name:     string
  /** 1–2 uppercase letters */
  initials: string
  /** CSS color value for avatar background */
  color:    string
}

export interface WorkspaceSwitcherProps {
  workspaces:   Workspace[]
  activeId:     string
  onSelect?:    (id: string) => void
  defaultOpen?: boolean
}

function WorkspaceAvatar({ initials, color, size }: { initials: string; color: string; size: number }) {
  return (
    <span
      className={styles.wsAvatar}
      style={{ width: size, height: size, background: color }}
      aria-hidden="true"
    >
      {initials.slice(0, 2)}
    </span>
  )
}

export function WorkspaceSwitcher({ workspaces, activeId, onSelect, defaultOpen = false }: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(defaultOpen)
  const rootRef = useRef<HTMLDivElement>(null)

  const active = workspaces.find(w => w.id === activeId)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={[styles.trigger, open ? styles.triggerOpen : ''].filter(Boolean).join(' ')}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.triggerInner}>
          <WorkspaceAvatar
            initials={active?.initials ?? '?'}
            color={active?.color ?? 'var(--stone-500)'}
            size={32}
          />
          <span className={styles.triggerName}>{active?.name ?? ''}</span>
          <span
            className={styles.chevron}
            dangerouslySetInnerHTML={{ __html: open ? chevronUpSvg : chevronDownSvg }}
          />
        </span>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox" aria-label="Select workspace">
          {workspaces.map(w => (
            <button
              key={w.id}
              type="button"
              role="option"
              aria-selected={w.id === activeId}
              className={[styles.listItem, w.id === activeId ? styles.listItemActive : ''].filter(Boolean).join(' ')}
              onClick={() => { onSelect?.(w.id); setOpen(false) }}
            >
              <WorkspaceAvatar initials={w.initials} color={w.color} size={32} />
              <span className={styles.listItemName}>{w.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default WorkspaceSwitcher
