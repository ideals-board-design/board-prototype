/* ToastContainer — fixed viewport stacking for Toast notifications
   Top-right, newest toast at top (column-reverse), 8px gap
   Enter: 300ms slide-in + FLIP push-down for existing toasts
   Auto-dismiss: 4 s, paused on hover. Call clear() on navigation. */

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Toast } from '../Toast/Toast'
import type { ToastState } from '../Toast/Toast'
import styles from './ToastContainer.module.css'

const AUTO_DISMISS_MS = 4000
const ENTER_MS        = 300

export interface ToastItem {
  id:        string
  state?:    ToastState
  message:   ReactNode
  optional?: ReactNode
  action?:   ReactNode
}

interface InternalItem extends ToastItem {
  entered: boolean   // true after enter animation completes — needed for FLIP
  exiting: boolean
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

    // ── FLIP: smoothly push existing toasts down ───────────────────
    //
    // CSS `animation` fill-mode overrides inline styles, so FLIP only works
    // on `entered` items (no active animation). New items use `entering` class
    // independently and are skipped (no previous snapshot entry).
    useLayoutEffect(() => {
      const container = containerRef.current
      if (!container) return

      // 1. Read new logical positions (after React layout, before any transforms)
      const newPositions = new Map<string, number>()
      container.querySelectorAll<HTMLElement>('[data-toast-id]').forEach(el => {
        newPositions.set(el.dataset.toastId!, el.getBoundingClientRect().top)
      })

      // 2. Apply FLIP for items that moved (existing items have a previous snapshot)
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
        el.style.transition = `transform ${ENTER_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
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
    }, [])

    // ── Dismiss ────────────────────────────────────────────────────

    const dismiss = (id: string) => {
      clearItemTimer(id)
      setItems(prev => prev.map(item => item.id === id ? { ...item, exiting: true } : item))
      setTimeout(() => setItems(prev => prev.filter(item => item.id !== id)), 310)
    }

    // ── Hover pause / resume ───────────────────────────────────────

    const pauseTimer = (id: string) => {
      const t = timerMap.current.get(id)
      if (!t?.timerId) return
      clearTimeout(t.timerId)
      const elapsed = Date.now() - t.startedAt
      timerMap.current.set(id, { timerId: null, remaining: Math.max(0, t.remaining - elapsed), startedAt: t.startedAt })
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
        setItems(prev => [...prev, { ...toast, id, entered: false, exiting: false }])
        scheduleTimer(id, AUTO_DISMISS_MS)
        // After enter animation completes, remove the class so FLIP can work freely
        setTimeout(
          () => setItems(prev => prev.map(item => item.id === id ? { ...item, entered: true } : item)),
          ENTER_MS,
        )
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
          >
            <Toast
              state={item.state}
              message={item.message}
              optional={item.optional}
              action={item.action}
              onDismiss={() => dismiss(item.id)}
              className={item.exiting ? styles.exiting : item.entered ? undefined : styles.entering}
            />
          </div>
        ))}
      </div>
    )
  },
)
