/* WorkspaceSwitcher — Figma nodes 34956-1814 (Active) · 34956-1816 (Hover) · 34956-1932 (Opened)
   Trigger: 240×48px. Dropdown: 232×auto, dark panel, 4px gap below trigger. */

import { useState, useEffect, useRef } from 'react'
import { arrows } from '../../icons/arrows'
import { usePresence } from '../shared/usePresence'
import { Tooltip } from '../Tooltip/Tooltip'
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
  /** 'dropdown' (default) — floating panel. 'inline' — expands in normal flow
   *  as an accordion below the trigger (the mobile/tablet nav drawer). */
  variant?:     'dropdown' | 'inline'
  /** Icon-only trigger (laptop rail, 1024–1439px) — hides the name/chevron,
   *  shows a "Change workspace" tooltip instead. The panel stays a floating
   *  dropdown regardless of `variant`. */
  rail?:        boolean
  /** Fires whenever the open state changes. `variant="inline"` callers (the
   *  mobile/tablet drawer) use this to hide the rest of the nav while the
   *  workspace list is expanded — Figma's "workspace selection" frame shows
   *  only the header + workspace list, not the nav items or footer beneath. */
  onOpenChange?: (open: boolean) => void
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

export function WorkspaceSwitcher({
  workspaces,
  activeId,
  onSelect,
  defaultOpen = false,
  variant = 'dropdown',
  rail = false,
  onOpenChange,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(defaultOpen)
  const rootRef = useRef<HTMLDivElement>(null)
  const inline  = variant === 'inline'

  useEffect(() => { onOpenChange?.(open) }, [open, onOpenChange])

  const active = workspaces.find(w => w.id === activeId)

  // Keeps the panel mounted through its fade-out (motion spec §3).
  const { mounted, state } = usePresence(open, '--dur-instant')

  // Close on outside click — dropdown only. An inline accordion has no
  // "outside" to close on; it just stays expanded until toggled again.
  useEffect(() => {
    if (!open || inline) return
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, inline])

  // Close on Escape — dropdown only, for the same reason.
  useEffect(() => {
    if (!open || inline) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, inline])

  const trigger = (
    <button
      type="button"
      className={[
        styles.trigger,
        open ? styles.triggerOpen : '',
        rail ? styles.rail : '',
      ].filter(Boolean).join(' ')}
      onClick={() => setOpen(o => !o)}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label={rail ? 'Change workspace' : undefined}
    >
      <span className={styles.triggerInner}>
        <WorkspaceAvatar
          initials={active?.initials ?? '?'}
          color={active?.color ?? 'var(--stone-500)'}
          size={32}
        />
        {!rail && <span className={styles.triggerName}>{active?.name ?? ''}</span>}
        {!rail && (
          <span
            className={styles.chevron}
            dangerouslySetInnerHTML={{ __html: open ? chevronUpSvg : chevronDownSvg }}
          />
        )}
      </span>
    </button>
  )

  return (
    <div className={styles.root} ref={rootRef}>
      {rail
        ? <Tooltip label="Change workspace" position="right" wrapperClassName={styles.railTooltipWrapper}>{trigger}</Tooltip>
        : trigger}

      {mounted && (
        <div
          className={[
            styles.dropdown,
            inline ? styles.dropdownInline : '',
            rail ? styles.dropdownRail : '',
          ].filter(Boolean).join(' ')}
          data-state={state}
          aria-hidden={state === 'closed'}
          role="listbox"
          aria-label="Select workspace"
        >
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
