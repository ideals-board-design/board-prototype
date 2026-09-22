/* RenameDocumentModal — rename an attachment via a modal dialog.
   Figma "Rename document" (Documents 426-14250): title, a single text field
   pre-filled with the current name (focused + selected on open), Cancel + Save.
   Replaces the earlier inline-rename flow on an attachment row. */

import { useEffect, useRef, useState } from 'react'
import { Modal }     from '../components/Modal/Modal'
import { Button }    from '../components/Button/Button'
import { TextField } from '../components/TextField/TextField'
import styles from './RenameDocumentModal.module.css'

export interface RenameDocumentModalProps {
  open:        boolean
  /** The name shown when the modal opens. */
  currentName: string
  onSave:      (name: string) => void
  onClose:     () => void
}

export function RenameDocumentModal({ open, currentName, onSave, onClose }: RenameDocumentModalProps) {
  const [value, setValue] = useState(currentName)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  /* Reset to the current name each time the modal opens, then focus and select
     the whole value so the user can immediately overwrite it. */
  useEffect(() => {
    if (!open) return
    setValue(currentName)
    /* wait for the field to mount inside the modal */
    const id = window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
    return () => window.clearTimeout(id)
  }, [open, currentName])

  const trimmed = value.trim()
  const canSave = trimmed.length > 0

  const handleSave = () => {
    if (!canSave) return
    onSave(trimmed)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rename document"
      width={560}
      footer={
        <>
          <Button variant="secondary" intent="neutral" size="m" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="m" disabled={!canSave} onClick={handleSave}>Save</Button>
        </>
      }
    >
      <div className={styles.field}>
        <TextField
          ref={el => { inputRef.current = el }}
          value={value}
          aria-label="Document name"
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); handleSave() }
          }}
        />
      </div>
    </Modal>
  )
}

export default RenameDocumentModal
