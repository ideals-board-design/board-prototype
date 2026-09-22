/* DocumentRequestDrawer — request a document against an agenda item, and drive
   its lifecycle (IBP-20675). Figma "Doc. request" (11710-105681).

   States & footer:
   - create / draft / in-progress → "Send" (create) or "Save changes" (edit),
     plus a delete affordance. Uploading a file in the Attachments area
     simulates the assignee submitting it, which moves the request to
     Pending validation (handled by the parent).
   - pending-validation → "Approve document" (→ Completed: files become regular
     attachments) + "Reopen" (→ In progress), plus delete.

   Title and Assignee are required to send. Due date and description are
   optional. */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Drawer } from '../components/Drawer/Drawer'
import { DrawerHeader } from '../components/DrawerHeader/DrawerHeader'
import { StickyFooter } from '../components/StickyFooter/StickyFooter'
import { Button } from '../components/Button/Button'
import { TextArea } from '../components/TextArea/TextArea'
import { Autocomplete, type AutocompleteOption } from '../components/Autocomplete/Autocomplete'
import { DatePicker } from '../components/DatePicker/DatePicker'
import { BadgeStatus } from '../components/BadgeStatus/BadgeStatus'
import { actions } from '../icons/actions'
import { files } from '../icons/files'
import { fileFormat } from '../icons/fileFormat'
import {
  DOC_REQUEST_STATUS_LABEL,
  formatFromFileName,
  type Attachment,
  type DocRequest,
} from './AttachmentsField'
import styles from './DocumentRequestDrawer.module.css'

const plusSvg  = actions.find(i => i.name === 'plus')!.svg
const trashSvg = actions.find(i => i.name === 'trash-alt')!.svg
const closeSvg = actions.find(i => i.name === 'multiply')!.svg
const paperclipSvg = files.find(i => i.name === 'paperclip')!.svg

const Icon = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)

function formatSvg(a: Attachment): string {
  return (fileFormat.find(i => i.name === `format-${a.format}`)
    ?? fileFormat.find(i => i.name === 'format-___')!).svg
}

export interface DocRequestData {
  title:       string
  assignee?:   string
  dueDate?:    string
  description?: string
}

export interface DocumentRequestDrawerProps {
  open:            boolean
  /** null = create mode; otherwise the request being viewed / edited. */
  request:         DocRequest | null
  /** Default title for a new request (usually the agenda item title). */
  defaultTitle:    string
  /** "Linked to" context — meeting name + agenda item label. */
  meetingName:     string
  itemLabel:       string
  assigneeOptions: AutocompleteOption[]
  onSend:          (data: DocRequestData) => void
  onUploadFile:    (fileName: string) => void
  onRemoveSubmitted: (fileId: string) => void
  onApprove:       () => void
  onReopen:        () => void
  onDelete:        () => void
  onClose:         () => void
}

export function DocumentRequestDrawer({
  open,
  request,
  defaultTitle,
  meetingName,
  itemLabel,
  assigneeOptions,
  onSend,
  onUploadFile,
  onRemoveSubmitted,
  onApprove,
  onReopen,
  onDelete,
  onClose,
}: DocumentRequestDrawerProps) {
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [description, setDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const status = request?.status ?? 'draft'
  const isPending = status === 'pending-validation'

  /* Seed the form each time the drawer opens (from the request or defaults). */
  useEffect(() => {
    if (!open) return
    setTitle(request?.title ?? defaultTitle)
    setAssignee(request?.assignee ?? '')
    setDueDate(request?.dueDate ? new Date(request.dueDate) : null)
    setDescription(request?.description ?? '')
  }, [open, request, defaultTitle])

  const canSend = title.trim().length > 0 && assignee.trim().length > 0

  const collect = (): DocRequestData => ({
    title: title.trim(),
    assignee: assignee || undefined,
    dueDate: dueDate ? dueDate.toISOString().slice(0, 10) : undefined,
    description: description.trim() || undefined,
  })

  const submitted = request?.submittedFiles ?? []

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    files.forEach(f => onUploadFile(f.name))
    e.target.value = ''
  }

  const dueHint = useMemo(() => {
    if (!dueDate) return null
    const days = Math.round((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days <= 0) return null
    return `${days} day${days === 1 ? '' : 's'} before meeting`
  }, [dueDate])

  const header = (
    <DrawerHeader
      title={title}
      onTitleChange={setTitle}
      onClose={onClose}
      type="Document request"
      badge={<BadgeStatus type={isPending ? 'pending' : status === 'in-progress' ? 'neutral' : 'warning'} label={DOC_REQUEST_STATUS_LABEL[status]} />}
    />
  )

  const footer = (
    <StickyFooter
      variant="drawer"
      left={
        isPending ? (
          <>
            <Button variant="primary" size="m" onClick={onApprove}>Approve document</Button>
            <Button variant="secondary" intent="neutral" size="m" onClick={onReopen}>Reopen</Button>
          </>
        ) : (
          <Button variant="primary" size="m" disabled={!canSend} onClick={() => onSend(collect())}>
            {request ? 'Save changes' : 'Send'}
          </Button>
        )
      }
      right={
        request ? (
          <Button
            variant="tertiary"
            intent="danger"
            size="m"
            iconOnly={<Icon svg={trashSvg} />}
            onClick={onDelete}
            aria-label="Delete request"
          />
        ) : undefined
      }
    />
  )

  return (
    <Drawer open={open} onClose={onClose} overlay header={header} footer={footer}>
      <div className={styles.form}>
        <div className={styles.fields}>
          {isPending && submitted.length > 0 && (
            <section className={styles.field}>
              <span className={styles.label}>
                {assignee ? `${assignee} prepared document:` : 'Prepared document:'}
              </span>
              <div className={styles.submittedList}>
                {submitted.map(f => (
                  <div key={f.id} className={styles.submittedRow}>
                    <span className={styles.fileIcon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: formatSvg(f) }} />
                    <span className={styles.fileName}>{f.name}</span>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => onRemoveSubmitted(f.id)}
                      aria-label={`Remove ${f.name}`}
                    >
                      <Icon svg={closeSvg} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={styles.field}>
            <span className={styles.label}>Assignee</span>
            <Autocomplete
              variant="no-border"
              className={styles.acField}
              options={assigneeOptions}
              value={assignee}
              placeholder="Choose user"
              aria-label="Assignee"
              onChange={v => setAssignee(v as string)}
            />
          </section>

          <section className={styles.field}>
            <span className={styles.label}>Due date</span>
            <DatePicker
              variant="no-border"
              value={dueDate}
              onChange={setDueDate}
              clearable
              placeholder="Select a date"
            />
            {dueHint && <span className={styles.hint}>{dueHint}</span>}
          </section>

          <section className={styles.field}>
            <span className={styles.label}>Linked to</span>
            <div className={styles.linkedValues}>
              <span className={styles.value}>{meetingName}</span>
              <span className={styles.value}>{itemLabel}</span>
            </div>
          </section>

          <section className={styles.field}>
            <span className={styles.label}>Additional information</span>
            <TextArea
              className={styles.descTA}
              value={description}
              placeholder="Add any extra details and context"
              aria-label="Additional information"
              onChange={e => setDescription(e.target.value)}
            />
          </section>
        </div>

          {!isPending && (
            <section className={styles.attachments}>
              <span className={styles.attachmentsLabel}>Attachments</span>
              <div className={styles.uploadArea}>
                <span className={styles.uploadText}>
                  <span className={styles.uploadIcon} aria-hidden="true"><Icon svg={paperclipSvg} /></span>
                  Upload document or drag and drop
                </span>
                <Button
                  variant="secondary"
                  intent="neutral"
                  size="m"
                  iconLeft={<Icon svg={plusSvg} />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Add
                </Button>
              </div>
            </section>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className={styles.hiddenInput}
          onChange={onFileInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />
    </Drawer>
  )
}

/** Helper for the parent — build a submitted Attachment from a file name. */
export function submittedAttachment(id: string, name: string): Attachment {
  return { id, name, format: formatFromFileName(name), status: 'ready' }
}

export default DocumentRequestDrawer
