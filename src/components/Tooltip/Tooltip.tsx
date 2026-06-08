/* Tooltip — Figma node 9801:63482
   Portal-based: renders into <body> via createPortal so it is never
   clipped by overflow:hidden on parent containers (e.g. TextEditor fieldWrapper).

   Positioning: position:fixed + getBoundingClientRect() anchor.
   Delay: 300ms on show, instant hide.
*/

import { type ReactNode, useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './Tooltip.module.css'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  /** Text shown inside the tooltip bubble */
  label: string
  /** Where the tooltip appears relative to the trigger. Default: "top" */
  position?: TooltipPosition
  /** The element that triggers the tooltip on hover */
  children: ReactNode
  /**
   * Max width for multi-line tooltips (e.g. document names).
   * When set, text wraps instead of staying on one line.
   * Figma spec: max 400px for document name tooltips.
   */
  maxWidth?: number | string
  /** Override the wrapper element's className (e.g. to set display:block for truncation) */
  wrapperClassName?: string
}

/** Calculates the fixed anchor point (left/top) for a given position + gap */
function getAnchor(rect: DOMRect, position: TooltipPosition, gap = 4) {
  switch (position) {
    case 'top':    return { left: rect.left + rect.width  / 2, top: rect.top    - gap }
    case 'bottom': return { left: rect.left + rect.width  / 2, top: rect.bottom + gap }
    case 'left':   return { left: rect.left               - gap, top: rect.top  + rect.height / 2 }
    case 'right':  return { left: rect.right              + gap, top: rect.top  + rect.height / 2 }
  }
}

const DELAY = 300 // ms

export function Tooltip({ label, position = 'top', children, maxWidth, wrapperClassName }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [anchor, setAnchor] = useState({ left: 0, top: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (!wrapperRef.current) return
      setAnchor(getAnchor(wrapperRef.current.getBoundingClientRect(), position))
      setVisible(true)
    }, DELAY)
  }, [position])

  const hide = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    setVisible(false)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const tooltipCls = [
    styles.tooltip,
    styles[position],
    maxWidth ? styles.multiline : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={wrapperRef}
      className={[styles.wrapper, wrapperClassName].filter(Boolean).join(' ')}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}

      {visible && createPortal(
        <div
          className={tooltipCls}
          role="tooltip"
          style={{
            left: anchor.left,
            top:  anchor.top,
            ...(maxWidth ? { maxWidth } : {}),
          }}
        >
          {label}
        </div>,
        document.body
      )}
    </div>
  )
}

export default Tooltip
