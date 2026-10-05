/* CopyDocumentModal — "Copy from Documents" (the Document Library). Lets the
   Secretary pick one or more existing documents to attach to an agenda item.
   Reuses the DS Modal + Checkbox; selected documents are added to the item as
   Uploading (they copy/convert), then flip to ready in the parent. */

import { useState } from 'react'
import { Modal }    from '../components/Modal/Modal'
import { Button }   from '../components/Button/Button'
import { Checkbox } from '../components/Checkbox/Checkbox'
import { fileFormat } from '../icons/fileFormat'
import type { Attachment, AttachmentFormat } from './AttachmentsField'
import styles from './CopyDocumentModal.module.css'

interface LibraryDoc {
  id:     string
  name:   string
  format: AttachmentFormat
  meta:   string
}

/* Sample Document Library contents (the real library is out of this prototype's
   scope — these stand in for it). */
const LIBRARY: LibraryDoc[] = [
  { id: 'lib-1', name: 'Board of Directors January 20, 2026.pdf', format: 'pdf',  meta: 'PDF · 2.4 MB · Jan 27, 2026' },
  { id: 'lib-2', name: 'Q4 Financial Report.xlsx',                format: 'xlsx', meta: 'Spreadsheet · 812 KB · Feb 2, 2026' },
  { id: 'lib-3', name: 'Strategic Plan 2026.docx',               format: 'word', meta: 'Document · 1.1 MB · Jan 15, 2026' },
  { id: 'lib-4', name: 'Committee Presentation.pptx',            format: 'ppt',  meta: 'Presentation · 5.6 MB · Feb 10, 2026' },
  { id: 'lib-5', name: 'Audit Summary.pdf',                      format: 'pdf',  meta: 'PDF · 640 KB · Jan 30, 2026' },
]

function formatSvg(format: AttachmentFormat): string {
  return (fileFormat.find(i => i.name === `format-${format}`)
    ?? fileFormat.find(i => i.name === 'format-___')!).svg
}

export interface CopyDocumentModalProps {
  open:    boolean
  onClose: () => void
  onAdd:   (docs: Pick<Attachment, 'name' | 'format'>[]) => void
}

export function CopyDocumentModal({ open, onClose, onAdd }: CopyDocumentModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const close = () => { setSelected(new Set()); onClose() }

  const confirm = () => {
    const docs = LIBRARY.filter(d => selected.has(d.id)).map(d => ({ name: d.name, format: d.format }))
    if (docs.length) onAdd(docs)
    setSelected(new Set())
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Copy from Documents"
      width={560}
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" intent="neutral" size="m" onClick={close}>Cancel</Button>
          <Button variant="primary" size="m" disabled={selected.size === 0} onClick={confirm}>
            {selected.size > 0 ? `Add ${selected.size} document${selected.size === 1 ? '' : 's'}` : 'Add documents'}
          </Button>
        </div>
      }
    >
      <ul className={styles.list}>
        {LIBRARY.map(doc => (
          <li key={doc.id}>
            <label className={styles.row}>
              <Checkbox
                checked={selected.has(doc.id)}
                onChange={() => toggle(doc.id)}
                aria-label={`Select ${doc.name}`}
              />
              <span className={styles.formatIcon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: formatSvg(doc.format) }} />
              <span className={styles.info}>
                <span className={styles.name}>{doc.name}</span>
                <span className={styles.meta}>{doc.meta}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export default CopyDocumentModal
