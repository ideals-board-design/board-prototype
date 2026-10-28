/* Shared bits for the Minutes left pane (AI minutes + Transcript segments):
   icon wrapper, clipboard copy, the floating hover chip and the scroll tween. */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '../../../components/Button/Button'
import { Tooltip } from '../../../components/Tooltip/Tooltip'
import { actions } from '../../../icons/actions'
import styles from './MinutesTab.module.css'

const copySvg = actions.find(i => i.name === 'copy')!.svg

export const Icon = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)

export async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    /* clipboard API unavailable (insecure context / denied) — legacy fallback */
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}

/** Copy icon button. The "Copy" tooltip only shows over this button; after a
    successful copy the same tooltip reads "Copied ✓" for a moment. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    if (!(await writeClipboard(text))) return
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <Tooltip label={copied ? 'Copied ✓' : 'Copy'} position="top">
        <Button
          variant="tertiary" intent="neutral" size="m"
          iconOnly={<Icon svg={copySvg} />}
          aria-label={label}
          onClick={copy}
        />
      </Tooltip>
      {/* keyboard / screen-reader confirmation (the tooltip is hover-only) */}
      <span className={styles.srOnly} role="status">{copied ? 'Copied' : ''}</span>
    </>
  )
}

/** Hover controls for a highlighted element (Figma 12970-220370 / 12970-220260).
    `chip` — a small floating card (surface + elevation) that straddles the
    element's bottom edge at the right, so it never hides the text it acts on.
    `corner` — plain controls in the element's top-right corner (block copy). */
export function HoverBar({ children, label, placement = 'chip' }: {
  children: ReactNode
  label: string
  placement?: 'chip' | 'corner'
}) {
  return (
    <div
      className={[styles.hoverBar, placement === 'corner' ? styles.hoverBarCorner : styles.hoverBarChip].join(' ')}
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  )
}

/** Tracks the in-flight tween per scroll container so a new navigation cancels
    the previous one instead of fighting it. */
const scrollAnims = new WeakMap<HTMLElement, { raf: number; timer: number; done: boolean }>()

/** Animate a scroll container to `top` with an ease-out tween (~360ms). A guarded
    timeout snaps to the final position, so the target is always reached even where
    requestAnimationFrame is throttled or timestamps stall. */
export function smoothScrollTo(el: HTMLElement, top: number) {
  const prev = scrollAnims.get(el)
  if (prev) { cancelAnimationFrame(prev.raf); clearTimeout(prev.timer); prev.done = true }

  const start = el.scrollTop
  const delta = top - start
  if (Math.abs(delta) < 1) { el.scrollTop = top; return }

  const duration = 360
  const anim = { raf: 0, timer: 0, done: false }
  scrollAnims.set(el, anim)

  const finish = () => {
    if (anim.done) return
    anim.done = true
    cancelAnimationFrame(anim.raf)
    el.scrollTop = top
  }

  let startTime: number | null = null
  const step = (now: number) => {
    if (anim.done) return
    if (startTime === null) startTime = now
    const t = Math.min(1, (now - startTime) / duration)
    const eased = 1 - Math.pow(1 - t, 3)
    el.scrollTop = start + delta * eased
    if (t < 1) anim.raf = requestAnimationFrame(step)
    else finish()
  }
  anim.raf = requestAnimationFrame(step)
  anim.timer = window.setTimeout(finish, duration + 80)
}

/** Centre `el` inside the scroll container `scroller`, clamped to its range. */
export function scrollIntoCentre(scroller: HTMLElement, el: HTMLElement) {
  const sRect = scroller.getBoundingClientRect()
  const eRect = el.getBoundingClientRect()
  const target = scroller.scrollTop + (eRect.top - sRect.top) - scroller.clientHeight / 2 + eRect.height / 2
  const max = scroller.scrollHeight - scroller.clientHeight
  smoothScrollTo(scroller, Math.max(0, Math.min(target, max)))
}
