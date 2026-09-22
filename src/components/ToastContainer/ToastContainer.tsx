/* ToastContainer — fixed viewport stacking for Toast notifications
   Top-right, newest toast at top (column-reverse), 8px gap.

   Motion spec §9:
   - Slide only, no opacity.
   - Exit: the dismissed toast's own inner wrapper slides up and out
     (--dur-snap / --ease-in) — behind whichever toast sits above it, or
     straight out the top if it's alone in the stack.
   - Enter AND the "make room" reflow of existing toasts are the SAME motion,
     driven by the SAME synchronous FLIP effect (--dur-base / --ease-out): a
     brand-new toast is seeded with a synthetic "one slot above" starting
     position, so it animates into place via the identical mechanism, kicked
     off in the identical effect pass, as the toasts sliding down to make room
     for it. This is deliberate — an earlier version drove entrance from a
     `data-state` class flip that started ~2 animation frames after the
     reflow (needed a frame for React to commit the "closed" mount before
     flipping to "open"). That gap was enough for the two independently-timed
     transitions to visibly desync: the entering toast would overlap the one
     below it before the gap re-settled to 8px. Routing both through one
     effect guarantees they start on the same frame and stay in lockstep, so
     the 8px gap holds throughout the animation, not just at rest.
   - When a toast leaves the stack the remaining toasts reflow the same way,
     using transform: translateY — never top or margin.
   - Auto-dismiss (4s) pauses on hover and on focus within the toast.

   Element split still matters for exit: the OUTER wrapper owns the FLIP
   transform, the INNER wrapper owns the exit transform. Putting both on one
   element would have them fight over the same property. */

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Toast } from '../Toast/Toast'
import type { ToastState } from '../Toast/Toast'
import { tokenEase, tokenMs } from '../shared/motion'
import type { PresenceState } from '../shared/usePresence'
import styles from './ToastContainer.module.css'

const AUTO_DISMISS_MS = 4000

export interface ToastItem {
  id:        string
  state?:    ToastState
  message:   ReactNode
  optional?: ReactNode
  action?:   ReactNode
}

interface InternalItem extends ToastItem {
  presence: PresenceState
}

interface TimerEntry {
  timerId:   ReturnType<typeof setTimeout> | null
  remaining: number
  startedAt: number
}

export interface ToastContainerHandle {
  add:   (toast: Omit<ToastItem, 'id'>) => void
  /** Dismiss all toasts instantly — call this on page navigation. */
  clear: () => void
}

export const ToastContainer = forwardRef<ToastContainerHandle>(
  function ToastContainer(_, ref) {
    const [items, setItems] = useState<InternalItem[]>([])
    const timerMap          = useRef(new Map<string, TimerEntry>())
    const containerRef      = useRef<HTMLDivElement>(null)
    const snapshotRef       = useRef(new Map<string, number>())   // id → previous top

    // ── FLIP: smoothly push existing toasts down / pull them up, and slide a
    //    brand-new toast into place using the exact same motion ────
    //
    // Positions are read as pure, side-effect-free computations — the bounding
    // rect minus whatever translateY is currently applied — rather than by
    // mutating style to "neutralize" a transform before measuring. That
    // mutate-then-measure approach is not idempotent: React StrictMode
    // double-invokes this effect with zero elapsed time between the two runs,
    // so the second invocation would wipe out the compensating transform the
    // first invocation had just applied, killing the animation before a frame
    // ever painted it. A pure read is safe to repeat — the second invocation
    // recomputes the identical natural position, sees oldTop === newTop
    // (snapshotRef was already updated by the first invocation), and no-ops.
    useLayoutEffect(() => {
      const container = containerRef.current
      if (!container) return

      const dur  = tokenMs('--dur-base', 400)
      const els  = [...container.querySelectorAll<HTMLElement>('[data-toast-id]')]
      const gapPx = parseFloat(getComputedStyle(container).rowGap) || 8

      const naturalTop = (el: HTMLElement) => {
        const transform = getComputedStyle(el).transform
        const appliedY   = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42
        return el.getBoundingClientRect().top - appliedY
      }

      // 1. Read natural (transform-independent) positions.
      const newPositions = new Map<string, number>()
      els.forEach(el => {
        newPositions.set(el.dataset.toastId!, naturalTop(el))
      })

      // 2. A brand-new id has no prior snapshot entry — seed it with a
      //    synthetic "one slot above" starting position (its own height, plus
      //    the stack gap, above where it will rest) so the generic FLIP
      //    compensation below treats its entrance exactly like a reflow.
      let hasNewEntrant = false
      els.forEach(el => {
        const id = el.dataset.toastId!
        if (snapshotRef.current.has(id)) return
        hasNewEntrant = true
        const height = el.getBoundingClientRect().height
        snapshotRef.current.set(id, newPositions.get(id)! - (height + gapPx))
      })
      // A pure addition eases like an entrance; a pure removal eases like a
      // state-to-state reflow. Both toasts moving in the same pass must share
      // one curve, or the gap between them drifts while they're mid-motion.
      const ease = tokenEase(hasNewEntrant ? '--ease-out' : '--ease-in-out')

      // 3. Apply FLIP for every id that moved (including the new entrant).
      els.forEach(el => {
        const id     = el.dataset.toastId!
        const oldTop = snapshotRef.current.get(id)!
        const newTop = newPositions.get(id)!
        if (Math.round(oldTop) === Math.round(newTop)) return

        const delta = oldTop - newTop
        el.style.transition = 'none'
        el.style.transform  = `translateY(${delta}px)`
        void el.getBoundingClientRect()                                    // force reflow
        el.style.transform  = ''
        el.style.transition = `transform ${dur}ms ${ease}`
      })

      // 4. Save positions for next render
      snapshotRef.current = newPositions
    }, [items])

    // ── Timer helpers ──────────────────────────────────────────────

    const clearItemTimer = (id: string) => {
      const t = timerMap.current.get(id)
      if (t?.timerId) clearTimeout(t.timerId)
      timerMap.current.delete(id)
    }

    const scheduleTimer = (id: string, ms: number) => {
      clearItemTimer(id)
      const timerId = setTimeout(() => dismiss(id), ms)
      timerMap.current.set(id, { timerId, remaining: ms, startedAt: Date.now() })
    }

    useEffect(() => () => {
      timerMap.current.forEach(t => { if (t.timerId) clearTimeout(t.timerId) })
    }, [])

    // ── Dismiss ────────────────────────────────────────────────────
    //
    // Auto-dismiss (timeout) flips to the closed state first so the exit
    // transition can run, then unmounts once it's finished. Dismissing via the
    // toast's own × button skips the exit transition entirely — removed
    // immediately, per design direction (same as Modal's instant close).

    const dismiss = (id: string, opts?: { instant?: boolean }) => {
      clearItemTimer(id)
      if (opts?.instant) {
        setItems(prev => prev.filter(item => item.id !== id))
        return
      }
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, presence: 'closed' } : item))
      setTimeout(
        () => setItems(prev => prev.filter(item => item.id !== id)),
        tokenMs('--dur-snap', 300),
      )
    }

    // ── Hover / focus pause ────────────────────────────────────────

    const pauseTimer = (id: string) => {
      const t = timerMap.current.get(id)
      if (!t?.timerId) return
      clearTimeout(t.timerId)
      const elapsed = Date.now() - t.startedAt
      timerMap.current.set(id, {
        timerId:   null,
        remaining: Math.max(0, t.remaining - elapsed),
        startedAt: t.startedAt,
      })
    }

    const resumeTimer = (id: string) => {
      const t = timerMap.current.get(id)
      if (!t || t.timerId !== null || t.remaining <= 0) return
      scheduleTimer(id, t.remaining)
    }

    // ── Imperative handle ──────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      add(toast) {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
        // Mounts directly as 'open' — its entrance slide comes from the FLIP
        // effect above, not from a data-state transition.
        setItems(prev => [...prev, { ...toast, id, presence: 'open' }])
        scheduleTimer(id, AUTO_DISMISS_MS)
      },
      clear() {
        timerMap.current.forEach((_, id) => clearItemTimer(id))
        setItems([])
      },
    }))

    // ── Render ─────────────────────────────────────────────────────

    if (items.length === 0) return null

    return (
      <div className={styles.container} ref={containerRef}>
        {items.map(item => (
          <div
            key={item.id}
            data-toast-id={item.id}
            onMouseEnter={() => pauseTimer(item.id)}
            onMouseLeave={() => resumeTimer(item.id)}
            onFocus={() => pauseTimer(item.id)}
            onBlur={() => resumeTimer(item.id)}
          >
            <div className={styles.toast} data-state={item.presence}>
              <Toast
                state={item.state}
                message={item.message}
                optional={item.optional}
                action={item.action}
                onDismiss={() => dismiss(item.id, { instant: true })}
              />
            </div>
          </div>
        ))}
      </div>
    )
  },
)
