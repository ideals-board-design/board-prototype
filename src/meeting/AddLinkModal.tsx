/* AddLinkModal — add or edit an external link on an agenda item. A link is a
   regular attachment (format 'link') so it lives in the shared attachments list.
   Add mode: empty fields, primary "Add". Edit mode (`link` provided): prefilled,
   primary "Save". Figma 12020-54370. */

import { useEffect, useState } from 'react'
import { Modal }     from '../components/Modal/Modal'
import { Button }    from '../components/Button/Button'
import { TextField } from '../components/TextField/TextField'
import styles from './AddLinkModal.module.css'

/** Accept URLs with or without a protocol (e.g. "example.com/x"); reject plain
    text. Requires a dotted hostname so "not a url" fails. */
function isValidUrl(value: string): boolean {
  const s = value.trim()
  if (!s || /\s/.test(s)) return false
  try {
    const u = new URL(/^[a-z][\w+.-]*:\/\//i.test(s) ? s : `https://${s}`)
    return Boolean(u.hostname) && u.hostname.includes('.')
  } catch {
    return false
  }
}

export interface AddLinkModalProps {
  open:    boolean
  onClose: () => void
  /** null/undefined = add mode; a link = edit mode (fields prefilled). */
  link?:   { name: string; url: string } | null
  onSubmit: (link: { name: string; url: string }) => void
}

export function AddLinkModal({ open, onClose, link, onSubmit }: AddLinkModalProps) {
  const isEdit = link != null
  const [url,  setUrl]  = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(false)

  /* Seed the fields each time the modal opens (blank for add, current values
     for edit). */
  useEffect(() => {
    if (!open) return
    setUrl(link?.url ?? '')
    setName(link?.name && link.name !== link.url ? link.name : '')
    setError(false)
  }, [open, link])

  const trimmedUrl = url.trim()
  /* Button follows the product's standard: disabled only while URL is empty. */
  const canSubmit = trimmedUrl !== ''

  const close = () => onClose()

  const confirm = () => {
    if (!canSubmit) return
    if (!isValidUrl(trimmedUrl)) { setError(true); return }
    onSubmit({ name: name.trim() || trimmedUrl, url: trimmedUrl })
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={isEdit ? 'Edit link' : 'Add link'}
      width={560}
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" intent="neutral" size="m" onClick={close}>Cancel</Button>
          <Button variant="primary" size="m" disabled={!canSubmit} onClick={confirm}>
            {isEdit ? 'Save' : 'Add'}
          </Button>
        </div>
      }
    >
      <div className={styles.body}>
        <label className={styles.group}>
          <span className={styles.label}>URL</span>
          <TextField
            variant="outline"
            size="m"
            value={url}
            placeholder="Paste URL here"
            aria-label="Link URL"
            error={error ? 'Text is not a valid URL' : false}
            onChange={e => { setUrl(e.target.value); if (error) setError(false) }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirm() } }}
          />
        </label>
        <label className={styles.group}>
          <span className={styles.label}>Display text <span className={styles.optional}>(optional)</span></span>
          <TextField
            variant="outline"
            size="m"
            value={name}
            placeholder="Link title"
            aria-label="Link display text"
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirm() } }}
          />
        </label>
      </div>
    </Modal>
  )
}

export default AddLinkModal
