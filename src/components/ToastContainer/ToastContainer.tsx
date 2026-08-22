/* ToastContainer — fixed viewport stacking for Toast notifications
   Top-right, newest toast at top (column-reverse), 8px gap.

   Motion spec §9:
   - Enter slides down from -8px while fading in (--dur-base / --ease-out);
     exit reverses it faster (--dur-snap / --ease-in).
   - When a toast leaves the stack the remaining toasts reflow with
     transform: translateY at --dur-base / --ease-in-out — never top or margin.
   - Auto-dismiss (4s) pauses on hover and on focus within the toast.

   Element split matters: the OUTER wrapper owns the FLIP reflow transform, the
   INNER wrapper owns the enter/exit transform. Putting both on one element would
   have them fight over the same property. */

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
    const frames            = useRef(new Set<number>())

    // ── FLIP: smoothly push existing toasts down / pull them up ────
    useLayoutEffect(() => {
      const container = containerRef.current
      if (!container) return

      const reflowMs   = tokenMs('--dur-base', 400)
      const reflowEase = tokenEase('--ease-in-out')

      // 1. Read new logical positions (after React layout, before any transforms)
      const newPositions = new Map<string, number>()
      container.querySelectorAll<HTMLElement>('[data-toast-id]').forEach(el => {
        newPositions.set(el.dataset.toastId!, el.getBoundingClientRect().top)
      })

      // 2. Apply FLIP for items that moved (new items have no previous snapshot)
      container.querySelectorAll<HTMLElement>('[data-toast-id]').forEach(el => {
        const id     = el.dataset.toastId!
        const oldTop = snapshotRef.current.get(id)
        const newTop = newPositions.get(id)!
        if (oldTop === undefined || Math.round(oldTop) === Math.round(newTop)) return

        const delta = oldTop - newTop
        el.style.transform  = `translateY(${delta}px)`
        el.style.transition = 'none'
        el.getBoundingClientRect()                                         // force reflow
        el.style.transform  = ''
        el.style.transition = `transform ${reflowMs}ms ${reflowEase}`
      })

      // 3. Save positions for next render
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
      frames.current.forEach(cancelAnimationFrame)
    }, [])

    // ── Dismiss ────────────────────────────────────────────────────
    //
    // Flip to the closed state first so the exit transition can run, then unmount
    // once it has finished — no instant disappearance.

    const dismiss = (id: string) => {
      clearItemTimer(id)
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
        // Mount closed, then flip open on the next frame so the browser has a
        // "from" value to animate out of.
        setItems(prev => [...prev, { ...toast, id, presence: 'closed' }])
        const outer = requestAnimationFrame(() => {
          const inner = requestAnimationFrame(() => {
            setItems(prev => prev.map(item =>
              item.id === id ? { ...item, presence: 'open' } : item))
          })
          frames.current.add(inner)
        })
        frames.current.add(outer)
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
                onDismiss={() => dismiss(item.id)}
              />
            </div>
          </div>
        ))}
      </div>
    )
  },
)
