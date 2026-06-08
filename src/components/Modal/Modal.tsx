/* Modal — Figma nodes 34919-5041, 34919-5148, 34919-5150, 34919-5160 */

import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'
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

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden' }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className={styles.overlay} role="presentation">
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={[styles.dialog, className].filter(Boolean).join(' ')}
        style={{ width }}
      >
        <header className={styles.header}>
          <h2 id="modal-title" className={styles.title}>{title}</h2>
          <Tooltip label="Close" position="top">
            <Button
              variant="tertiary"
              intent="neutral"
              size="m"
              iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: multiplySvg }} />}
              onClick={onClose}
              aria-label="Close"
              style={{ width: 20, height: 20, margin: 0 }}
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
