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
  // Nothing to switch to — no chevron, no click, no panel. A single
  // workspace is a label, not a control.
  const canSwitch = workspaces.length > 1

  useEffect(() => { onOpenChange?.(open) }, [open, onOpenChange])

  const active = workspaces.find(w => w.id === activeId)

  // Keeps the panel mounted through its fade-out (motion spec §3).
  const { mounted, state } = usePresence(open && canSwitch, '--dur-instant')

  // Close on outside click — dropdown only. An inline accordion has no
  // "outside" to close on; it just stays expanded until toggled again.
  useEffect(() => {
    if (!open || inline || !canSwitch) return
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, inline, canSwitch])

  // Close on Escape — dropdown only, for the same reason.
  useEffect(() => {
    if (!open || inline || !canSwitch) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, inline, canSwitch])

  const triggerInner = (
    <span className={styles.triggerInner}>
      <WorkspaceAvatar
        initials={active?.initials ?? '?'}
        color={active?.color ?? 'var(--stone-500)'}
        size={32}
      />
      {!rail && <span className={styles.triggerName}>{active?.name ?? ''}</span>}
      {!rail && canSwitch && (
        <span
          className={styles.chevron}
          dangerouslySetInnerHTML={{ __html: open ? chevronUpSvg : chevronDownSvg }}
        />
      )}
    </span>
  )

  const trigger = canSwitch ? (
    <button
      type="button"
      className={[
        styles.trigger,
        open ? styles.triggerOpen : '',
        rail ? styles.rail : '',
        inline ? styles.inline : '',
      ].filter(Boolean).join(' ')}
      onClick={() => setOpen(o => !o)}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label={rail ? 'Change workspace' : undefined}
    >
      {triggerInner}
    </button>
  ) : (
    <div
      className={[
        styles.trigger,
        styles.static,
        rail ? styles.rail : '',
        inline ? styles.inline : '',
      ].filter(Boolean).join(' ')}
      aria-label={rail ? active?.name : undefined}
    >
      {triggerInner}
    </div>
  )

  const dropdown = canSwitch && mounted && (
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
  )

  // Inline (drawer tiers) doesn't need this wrapper: the outside-click/
  // Escape handling above already skips itself for `inline` (there's no
  // "outside" for an in-flow accordion to close on), and .dropdownInline
  // renders `position: static`, so nothing here ever needs .root's
  // `position: relative` to anchor against. SideNavigation's own .header
  // (flex column for the drawer tiers) does the stacking instead.
  if (inline) {
    return (
      <>
        {trigger}
        {dropdown}
      </>
    )
  }

  return (
    <div className={styles.root} ref={rootRef}>
      {rail
        ? <Tooltip label={canSwitch ? 'Change workspace' : (active?.name ?? '')} position="right" wrapperClassName={styles.railTooltipWrapper}>{trigger}</Tooltip>
        : trigger}
      {dropdown}
    </div>
  )
}

export default WorkspaceSwitcher
