/* Modal — Figma nodes 34919-5041, 34919-5148, 34919-5150, 34919-5160 */

import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'
import { usePresence } from '../shared/usePresence'
import { Tooltip } from '../Tooltip/Tooltip'
import { Button } from '../Button/Button'
import { actions } from '../../icons/actions'

const multiplySvg = actions.find(i => i.name === 'multiply')!.svg

export interface ModalProps {
  open:       boolean
  onClose:    () => void
  title:      string
  width?:     560 | 720 | 1080   // default: 560
  children?:  ReactNode
  footer?:    ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  width = 560,
  children,
  footer,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Exit runs at --dur-snap (motion spec §6), so hold the node that long.
  const { mounted, state } = usePresence(open, '--dur-snap')

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Keyed on `mounted`, not `open`, so the lock releases only after the exit
  // transition has finished and the dialog is actually gone.
  useEffect(() => {
    if (!mounted) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [mounted])

  // Focus moves into the dialog on open and returns to the trigger on close.
  //
  // Split in two because they're on different clocks: the trigger must be
  // captured (and focus returned) the instant `open` flips, but focus can only
  // move INTO the dialog once it's actually in the DOM — one render later than
  // `open`, when `mounted` catches up via usePresence.
  useEffect(() => {
    if (open) triggerRef.current = document.activeElement as HTMLElement | null
    else triggerRef.current?.focus?.()
  }, [open])

  useEffect(() => {
    if (mounted && open) dialogRef.current?.focus()
  }, [mounted, open])

  if (!mounted) return null

  return createPortal(
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.backdrop}
        data-state={state}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        data-state={state}
        className={[styles.dialog, className].filter(Boolean).join(' ')}
        style={{ width }}
      >
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <h2 id="modal-title" className={styles.title}>{title}</h2>
          </div>
          <Tooltip label="Close" position="top">
            <Button
              variant="tertiary"
              intent="neutral"
              size="m"
              iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: multiplySvg }} />}
              onClick={onClose}
              aria-label="Close"
            />
          </Tooltip>
        </header>

        {children && (
          <div className={styles.body}>
            {children}
          </div>
        )}

        {footer && (
          <footer className={styles.footer}>
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
