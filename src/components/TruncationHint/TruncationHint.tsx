/* TruncationHint — DS component for overflowing text
   Shows a hint bubble ONLY when the wrapped text is actually truncated.
   Default position: below. Falls back to above when no space below.
   Max width: 400px · Text wraps · Max 250 characters displayed */

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './TruncationHint.module.css'

const MAX_CHARS = 250
const MAX_WIDTH = 400  /* px */
const GAP       = 4    /* px between trigger edge and hint */
const DELAY     = 300  /* ms — matches Tooltip */

export interface TruncationHintProps {
  /** Full text shown in the hint — truncated to 250 chars */
  text: string
  /** The visual element (should be single-line text that may overflow) */
  children: ReactNode
  /** Extra classes passed to the wrapper — use to control flex sizing in the parent */
  className?: string
}

type Placement = 'bottom' | 'top'

export function TruncationHint({ text, children, className }: TruncationHintProps) {
  const [visible, setVisible]   = useState(false)
  const [placement, setPlacement] = useState<Placement>('bottom')
  const [anchor, setAnchor]     = useState({ left: 0, top: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Returns true only when the text is visually clipped */
  function isTruncated() {
    const el = wrapperRef.current
    return el ? el.scrollWidth > el.offsetWidth : false
  }

  const show = useCallback(() => {
    if (!isTruncated()) return           // do nothing if text fits

    timerRef.current = setTimeout(() => {
      const el = wrapperRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      // Prefer below; fall back to above when less than 80px of space
      const spaceBelow = window.innerHeight - rect.bottom
      const pl: Placement = spaceBelow > 80 + GAP ? 'bottom' : 'top'

      setPlacement(pl)
      setAnchor({
        left: rect.left + rect.width / 2,                      // horizontally centered
        top:  pl === 'bottom' ? rect.bottom + GAP : rect.top - GAP,
      })
      setVisible(true)
    }, DELAY)
  }, [])

  const hide = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    setVisible(false)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const displayText = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text

  return (
    <div
      ref={wrapperRef}
      className={[styles.wrapper, className].filter(Boolean).join(' ')}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}

      {visible && createPortal(
        <div
          className={[styles.hint, styles[placement]].join(' ')}
          role="tooltip"
          style={{ left: anchor.left, top: anchor.top, maxWidth: MAX_WIDTH }}
        >
          {displayText}
        </div>,
        document.body,
      )}
    </div>
  )
}

export default TruncationHint
