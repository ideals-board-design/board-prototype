/* Drawer — right side only. Motion spec §7.
 *
 * - Backdrop fades (`--dur-slow` enter / `--dur-base` exit); the panel slides on
 *   `transform: translateX(100%) → 0` and never fades.
 * - Enter `--dur-slow`, exit `--dur-base` — it leaves faster than it arrives.
 * - Panel content is in the DOM before the slide starts (usePresence mounts in
 *   the closed state and flips a frame later), so nothing pops in mid-slide.
 * - `will-change: transform` is dropped once the enter transition finishes.
 * - Per CLAUDE.md a drawer uses `border-left`, never a box-shadow.
 * - The header/body/footer live in a fixed-width inner box (.panelContent),
 *   separate from the outer sizing box (.panel/.panelInline). If they shared
 *   one element, the inline variant's animating `width` would force the
 *   header and body to reflow every frame (text rewrapping, the header's
 *   title/close-button squeezing together) as their available width changed
 *   — the outer box is what animates; the content itself never resizes, it's
 *   just progressively revealed (clipped by the outer box's `overflow:
 *   hidden`, anchored to the right edge so it reveals right-to-left, matching
 *   the drawer's own right-side slide-in).
 *
 * Two shapes, two motions:
 *   `overlay` (default) — portalled, fixed to the viewport, backdrop, body
 *       scroll lock, focus moves in on open and back to the trigger on close.
 *       Slides on `transform` only, per the hard rule against animating
 *       `width` — its width never affects any other element's layout, so a
 *       transform slide is strictly better (compositor-only, no reflow).
 *       Takes a `side` — 'right' (default), 'left' (the mobile/tablet nav
 *       drawer), or 'bottom' (an action-sheet style menu; ignores `width`,
 *       always spans full width, height is content-driven).
 *   `inline` — an in-flow column beside the content it belongs to (the Tasks
 *       table pattern). No backdrop and no scroll lock: the page behind stays
 *       fully interactive, so trapping focus or locking scroll would be wrong.
 *       This one animates `width` (0 → its target) instead of `transform`,
 *       a deliberate, narrow exception to the no-layout-property rule: an
 *       in-flow drawer's width change is *inherently* a layout change for its
 *       flex sibling (the table column) — a transform slide would only move
 *       the drawer's own painted pixels, leaving the sibling to snap to its
 *       new width in one frame, which is exactly the "table jumps instead of
 *       resizing smoothly" bug this shape exists to avoid.
 */

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { DrawerHeader } from '../DrawerHeader/DrawerHeader'
import { usePresence } from '../shared/usePresence'
import styles from './Drawer.module.css'

export type DrawerVariant = 'overlay' | 'inline'
export type DrawerSide = 'right' | 'left' | 'bottom'

export interface DrawerProps {
  open:    boolean
  onClose: () => void
  /** `overlay` (default) — fixed + backdrop. `inline` — in-flow side column. */
  variant?:       DrawerVariant
  /** Overlay only. Which edge the panel anchors to and slides from. Default 'right'. */
  side?:          DrawerSide
  /** Panel width. Numbers are px. Defaults to 460. Ignored when `side="bottom"`. */
  width?:         number | string
  /** Renders a `DrawerHeader`. Omit and pass `header` for a custom one. */
  title?:         string
  /** Makes the header title an editable, controlled field. */
  onTitleChange?: (value: string) => void
  /** View-only header title — plain text instead of an editable field. */
  titleReadOnly?: boolean
  /** `DrawerHeader` type meta. */
  headerType?:    string
  /** `DrawerHeader` badge slot. */
  headerBadge?:   ReactNode
  /** Replaces the whole header — use for anything `DrawerHeader` can't express. */
  header?:        ReactNode
  /** Footer slot — typically a `StickyFooter variant="drawer"`. */
  footer?:        ReactNode
  children?:      ReactNode
  /** Accessible name when no `title` is given. */
  ariaLabel?:     string
  className?:     string
  /** Class for the scrolling body region. */
  bodyClassName?: string
}

export function Drawer({
  open,
  onClose,
  variant = 'overlay',
  side = 'right',
  width = 460,
  title,
  onTitleChange,
  titleReadOnly,
  headerType,
  headerBadge,
  header,
  footer,
  children,
  ariaLabel,
  className,
  bodyClassName,
}: DrawerProps) {
  const panelRef   = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Exit runs at --dur-base for right/left (spec §7); the bottom sheet exits
  // one step faster at --dur-snap (floating-menu cadence, see Drawer.module.css)
  // — hold the node mounted for exactly as long as its own exit transition.
  const exitToken = variant === 'overlay' && side === 'bottom' ? '--dur-snap' : '--dur-base'
  const { mounted, state } = usePresence(open, exitToken)

  // will-change is a standing promise to the compositor; drop it once the panel
  // has arrived and the drawer is just sitting there.
  const [settled, setSettled] = useState(false)
  useEffect(() => { if (state === 'closed') setSettled(false) }, [state])

  // inline animates `width`, overlay animates `transform` — settle on whichever
  // this variant actually drives.
  const settleProperty = variant === 'inline' ? 'width' : 'transform'

  function handleTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== settleProperty) return
    if (state === 'open') setSettled(true)
  }

  /* Escape closes. */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  /* Body scroll lock — overlay only. Keyed on `mounted`, not `open`, so it
     releases only once the exit transition has finished. */
  useEffect(() => {
    if (variant !== 'overlay' || !mounted) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [variant, mounted])

  /* Focus moves into the drawer on open and returns to the trigger on close.
     Overlay only — an inline drawer leaves the page interactive, so stealing
     focus from whatever the user just clicked would fight them.

     Split in two because they're on different clocks: the trigger must be
     captured (and focus returned) the instant `open` flips, but focus can
     only move INTO the panel once it's actually in the DOM — one render
     later than `open`, when `mounted` catches up via usePresence. */
  useEffect(() => {
    if (variant !== 'overlay') return
    if (open) triggerRef.current = document.activeElement as HTMLElement | null
    else triggerRef.current?.focus?.()
  }, [variant, open])

  useEffect(() => {
    if (variant === 'overlay' && mounted && open) panelRef.current?.focus()
  }, [variant, mounted, open])

  if (!mounted) return null

  const sideClass = side === 'left' ? styles.sideLeft : side === 'bottom' ? styles.sideBottom : styles.sideRight
  const isBottom  = variant === 'overlay' && side === 'bottom'

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal={variant === 'overlay' ? true : undefined}
      aria-label={title ?? ariaLabel}
      tabIndex={-1}
      data-state={state}
      onTransitionEnd={handleTransitionEnd}
      className={[
        styles.panel,
        variant === 'inline' ? styles.panelInline : styles.panelOverlay,
        variant === 'overlay' ? sideClass : '',
        settled ? styles.settled : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        width: variant === 'inline' ? (state === 'open' ? width : 0) : isBottom ? undefined : width,
      }}
    >
      <div className={styles.panelContent} style={isBottom ? undefined : { width }}>
        {header ?? (title !== undefined && (
          <DrawerHeader
            title={title}
            onClose={onClose}
            onTitleChange={onTitleChange}
            readOnly={titleReadOnly}
            type={headerType}
            badge={headerBadge}
          />
        ))}

        {children !== undefined && (
          <div className={[styles.body, bodyClassName].filter(Boolean).join(' ')}>
            {children}
          </div>
        )}

        {footer}
      </div>
    </div>
  )

  if (variant === 'inline') return panel

  return createPortal(
    <div className={[styles.overlay, sideClass].join(' ')} role="presentation">
      <div
        className={styles.backdrop}
        data-state={state}
        onClick={onClose}
        aria-hidden="true"
      />
      {panel}
    </div>,
    document.body,
  )
}

export default Drawer
