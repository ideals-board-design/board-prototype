/* AttachmentsField — the agenda item Attachments section in edit mode
   (Figma 11710-105059). Renders the list of attachments (documents, links and
   document requests) above a drop-enabled upload field. Supports:
     • add via drag & drop, "Add document" (upload / copy from Documents) and
       "Add link"
     • an Uploading state (shown during upload + background PDF conversion),
       switching to the ready state on completion (failure is handled by the
       parent: it removes the row and shows the error toast)
     • per-row "…" menu: Rename (inline), Download, Copy to Documents, Delete
     • drag reorder when there are 2+ attachments (mirrors MotionsField)
     • click a row (anywhere but the menu) to open it in the Board book
   State flows straight to the parent (the prototype's autosave); the async
   upload lifecycle lives in the parent so it survives switching items. */

import { useState, useRef, useCallback } from 'react'
import { Button }    from '../components/Button/Button'
import { BadgeStatus } from '../components/BadgeStatus/BadgeStatus'
import { ActionMenu, type ActionMenuItem } from './ActionMenu'
import { RenameDocumentModal } from './RenameDocumentModal'
import { fileFormat } from '../icons/fileFormat'
import { functional } from '../icons/functional'
import { actions }    from '../icons/actions'
import { condition }  from '../icons/condition'
import { files }      from '../icons/files'
import styles from './AttachmentsField.module.css'

const dragSvg     = functional.find(i => i.name === 'drag')!.svg
const loaderSvg   = condition.find(i => i.name === 'loader-round')!.svg
const uploadSvg   = actions.find(i => i.name === 'upload-alt')!.svg
const linkSvg     = actions.find(i => i.name === 'link')!.svg
const renameSvg   = actions.find(i => i.name === 'edit-alt')!.svg
const downloadSvg = actions.find(i => i.name === 'download-alt')!.svg
const copySvg     = actions.find(i => i.name === 'copy')!.svg
const deleteSvg   = actions.find(i => i.name === 'trash-alt')!.svg
const requestSvg  = files.find(i => i.name === 'file-plus')!.svg
const docLibrarySvg = functional.find(i => i.name === 'folder-files')?.svg
  ?? actions.find(i => i.name === 'copy')!.svg

export type AttachmentFormat =
  | 'pdf' | 'word' | 'xlsx' | 'ppt' | 'txt' | 'jpg' | 'zip' | 'link' | 'doc-request' | '___'
export type AttachmentStatus = 'uploading' | 'ready'

export interface Attachment {
  id:      string
  name:    string
  format:  AttachmentFormat
  status:  AttachmentStatus
  /** For links only — the destination URL. */
  url?:    string
}

/* ── Document requests (IBP-20675) ─────────────────────────────────────────
   A request asks an assignee to provide a document. It lives in the attachment
   list as its own row until it is Completed, at which point its approved files
   become regular attachments and the request row disappears. */
export type DocRequestStatus = 'draft' | 'in-progress' | 'pending-validation' | 'completed'

export interface DocRequest {
  id:           string
  title:        string
  assignee?:    string       // participant name
  dueDate?:     string       // ISO date (yyyy-mm-dd)
  description?: string
  status:       DocRequestStatus
  /** Files submitted by the assignee, awaiting the secretary's approval. */
  submittedFiles: Attachment[]
}

export const DOC_REQUEST_STATUS_LABEL: Record<DocRequestStatus, string> = {
  'draft':              'Draft',
  'in-progress':        'In progress',
  'pending-validation': 'Pending validation',
  'completed':          'Completed',
}

/* Status → BadgeStatus colour: draft amber, in-progress blue, pending amber,
   completed green (completed never renders a row). */
const REQUEST_BADGE_TYPE: Record<DocRequestStatus, 'warning' | 'neutral' | 'pending' | 'positive'> = {
  'draft':              'warning',
  'in-progress':        'neutral',
  'pending-validation': 'pending',
  'completed':          'positive',
}

/** Map a file name's extension to one of the design's file-format badges. */
export function formatFromFileName(name: string): AttachmentFormat {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'xlsx'
  if (['ppt', 'pptx'].includes(ext)) return 'ppt'
  if (['txt', 'md'].includes(ext)) return 'txt'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'jpg'
  if (['zip', 'rar', '7z'].includes(ext)) return 'zip'
  return '___'
}

function formatSvg(format: AttachmentFormat): string {
  return (fileFormat.find(i => i.name === `format-${format}`)
    ?? fileFormat.find(i => i.name === 'format-___')!).svg
}

export interface AttachmentsFieldProps {
  attachments: Attachment[]
  /** 'edit' (default) shows the upload field + drag reorder; 'view' renders the
      attachment rows only (no upload field, no reordering) for an item in its
      default/collapsed state — the rows keep their format icon, name and "…"
      menu (Figma 12333-115102). */
  mode?: 'edit' | 'view'
  /** Fully read-only (board-member view): like 'view' but with NO rename /
      reorder / copy / delete. A document's "…" menu offers only Download, and
      only for real attachments — links get no menu. Rows still open on click. */
  readOnly?: boolean
  /** Reorder / rename / delete — a full replacement array. */
  onChange: (next: Attachment[]) => void
  onOpen: (a: Attachment) => void
  onDownload: (a: Attachment) => void
  onCopyToDocuments: (a: Attachment) => void
  /** Edit-mode only. */
  onAddFiles?: (files: File[]) => void
  onAddLink?: () => void
  /** Edit an existing link row (opens the link modal in edit mode). */
  onEditLink?: (a: Attachment) => void
  onCopyFromDocuments?: () => void
  /** Document requests (IBP-20675) — pending requests shown as their own rows
      above the upload field. Completed requests are not passed here (their files
      arrive as regular `attachments`). Edit-mode only. */
  docRequests?: DocRequest[]
  onRequestDocument?: () => void
  onOpenRequest?: (r: DocRequest) => void
  onDeleteRequest?: (r: DocRequest) => void
}

export function AttachmentsField({
  attachments,
  mode = 'edit',
  readOnly = false,
  onChange,
  onAddFiles,
  onAddLink,
  onEditLink,
  onCopyFromDocuments,
  onOpen,
  onDownload,
  onCopyToDocuments,
  docRequests = [],
  onRequestDocument,
  onOpenRequest,
  onDeleteRequest,
}: AttachmentsFieldProps) {
  const isView = mode === 'view' || readOnly
  /* In view mode only settled (ready) attachments are shown. */
  const rows = isView ? attachments.filter(a => a.status === 'ready') : attachments
  /* Attachment currently being renamed via the modal (null = modal closed). */
  const [renamingId, setRenamingId] = useState<string | null>(null)

  /* Reorder (HTML5 drag from the handle) — mirrors MotionsField. */
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const dragIndexRef = useRef<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const showHandles = !isView && rows.length >= 2

  /* ── Rename (modal) ──────────────────────────────────────────────────────── */
  const renamingAttachment = renamingId != null ? attachments.find(a => a.id === renamingId) ?? null : null
  const startRename = (a: Attachment) => setRenamingId(a.id)
  const commitRename = (name: string) => {
    if (renamingId == null) return
    onChange(attachments.map(a => (a.id === renamingId ? { ...a, name } : a)))
    setRenamingId(null)
  }
  const cancelRename = () => setRenamingId(null)

  const deleteAttachment = (id: string) => onChange(attachments.filter(a => a.id !== id))

  /* ── Reorder ─────────────────────────────────────────────────────────────── */
  const startDrag = (i: number) => { dragIndexRef.current = i; setDragIndex(i) }

  const onDragOverRow = useCallback((e: React.DragEvent, i: number) => {
    if (dragIndexRef.current == null) return
    e.preventDefault()
    const rect  = e.currentTarget.getBoundingClientRect()
    const after = e.clientY > rect.top + rect.height / 2
    setDropIndex(after ? i + 1 : i)
  }, [])

  const finishDrag = () => {
    const from = dragIndexRef.current
    if (from != null && dropIndex != null && dropIndex !== from && dropIndex !== from + 1) {
      const next = [...attachments]
      const [moved] = next.splice(from, 1)
      next.splice(dropIndex > from ? dropIndex - 1 : dropIndex, 0, moved)
      onChange(next)
    }
    dragIndexRef.current = null
    setDragIndex(null)
    setDropIndex(null)
  }

  /* File drops are handled by the whole agenda-item card (see AgendaBuilder),
     so the upload field itself only offers the pick / link / library actions. */
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) onAddFiles?.(files)
    e.target.value = ''   // allow re-picking the same file
  }

  const rowMenuItems = (a: Attachment): ActionMenuItem[] =>
    /* Board-member read-only: Download only, and only for real attachments —
       links carry no menu (no download, no edit, no delete). */
    readOnly
      ? (a.format === 'link'
          ? []
          : [{ key: 'download', label: 'Download', icon: downloadSvg, onSelect: () => onDownload(a) }])
    : a.format === 'link'
      ? [
          { key: 'edit',   label: 'Edit link', icon: renameSvg,   onSelect: () => onEditLink?.(a) },
          { key: 'delete', label: 'Delete',    icon: deleteSvg,   danger: true, onSelect: () => deleteAttachment(a.id) },
        ]
      : [
          { key: 'rename',   label: 'Rename',            icon: renameSvg,   onSelect: () => startRename(a) },
          { key: 'download', label: 'Download',          icon: downloadSvg, onSelect: () => onDownload(a) },
          { key: 'copy',     label: 'Copy to Documents', icon: copySvg,     onSelect: () => onCopyToDocuments(a) },
          { key: 'delete',   label: 'Delete',            icon: deleteSvg,   danger: true, onSelect: () => deleteAttachment(a.id) },
        ]

  return (
    <div className={styles.field}>
      {rows.length > 0 && (
        <div className={styles.list} onDrop={finishDrag} onDragEnd={finishDrag}>
          {rows.map((a, i) => {
            const uploading = a.status === 'uploading'
            return (
              <div
                key={a.id}
                className={[styles.rowWrap, dragIndex === i ? styles.dragging : ''].filter(Boolean).join(' ')}
                onDragOver={e => onDragOverRow(e, i)}
              >
                {dropIndex === i && <div className={styles.dropLine} aria-hidden="true" />}
                <div className={styles.row}>
                  {showHandles && (
                    uploading ? (
                      <span className={styles.handleSpacer} aria-hidden="true" />
                    ) : (
                      <span
                        className={styles.handle}
                        draggable
                        onDragStart={() => startDrag(i)}
                        aria-label="Drag to reorder"
                        dangerouslySetInnerHTML={{ __html: dragSvg }}
                      />
                    )
                  )}

                  <div
                    className={[
                      styles.card,
                      uploading ? styles.cardUploading : '',
                    ].filter(Boolean).join(' ')}
                    {...(!uploading
                      ? {
                          role: 'button',
                          tabIndex: 0,
                          /* stopPropagation: in a collapsed item the whole card
                             is itself a click-to-edit button — opening the doc
                             must not also activate the item. */
                          onClick: (e: React.MouseEvent) => { e.stopPropagation(); onOpen(a) },
                          onKeyDown: (e: React.KeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onOpen(a) }
                          },
                        }
                      : {})}
                  >
                    <span className={styles.formatIcon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: formatSvg(a.format) }} />

                    <span className={[styles.name, uploading ? styles.nameUploading : ''].filter(Boolean).join(' ')}>
                      {a.name}
                    </span>

                    <span
                      className={styles.actions}
                      /* Keep menu/spinner interactions from bubbling to the
                         card's open-in-board-book click. */
                      onClick={e => e.stopPropagation()}
                      onKeyDown={e => e.stopPropagation()}
                    >
                      {uploading ? (
                        <span className={styles.spinner} aria-label="Uploading" role="status">
                          <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: loaderSvg }} />
                        </span>
                      ) : rowMenuItems(a).length > 0 ? (
                        <ActionMenu items={rowMenuItems(a)} ariaLabel={`Options for ${a.name}`} />
                      ) : null}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          {dropIndex === rows.length && <div className={styles.dropLine} aria-hidden="true" />}
        </div>
      )}

      {/* Pending document requests (IBP-20675) — their own rows until Completed. */}
      {!isView && docRequests.length > 0 && (
        <div className={styles.list}>
          {docRequests.map(r => (
            <div key={r.id} className={styles.rowWrap}>
              <div className={styles.row}>
                <div
                  className={styles.card}
                  role="button"
                  tabIndex={0}
                  onClick={e => { e.stopPropagation(); onOpenRequest?.(r) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onOpenRequest?.(r) }
                  }}
                >
                  <span className={styles.formatIcon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: formatSvg('doc-request') }} />
                  <span className={styles.name}>{r.title}</span>
                  <span className={styles.requestBadges}>
                    <BadgeStatus type="pending" label="Document request" />
                    <BadgeStatus type={REQUEST_BADGE_TYPE[r.status]} label={DOC_REQUEST_STATUS_LABEL[r.status]} />
                  </span>
                  <span
                    className={styles.actions}
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => e.stopPropagation()}
                  >
                    <ActionMenu
                      items={[
                        { key: 'edit',   label: 'Edit request',   icon: renameSvg, onSelect: () => onOpenRequest?.(r) },
                        { key: 'delete', label: 'Delete request', icon: deleteSvg, danger: true, onSelect: () => onDeleteRequest?.(r) },
                      ]}
                      ariaLabel={`Options for ${r.title}`}
                    />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload field — edit mode only. File drag & drop is owned by the whole
          agenda-item card (AgendaBuilder), so this field just holds the actions. */}
      {!isView && (
      <div className={styles.dropzone}>
        <span className={styles.dropzoneText}>Upload document or drag and drop</span>
        <div className={styles.dropzoneActions}>
          <ActionMenu
            trigger="button"
            triggerLabel="Add document"
            align="left"
            items={[
              { key: 'upload',  label: 'Upload from device',  icon: uploadSvg,      onSelect: () => fileInputRef.current?.click() },
              { key: 'library', label: 'Copy from Documents', icon: docLibrarySvg,  onSelect: () => onCopyFromDocuments?.() },
              { key: 'request', label: 'Request document',    icon: requestSvg,     onSelect: () => onRequestDocument?.() },
            ]}
          />
          <Button
            variant="secondary"
            intent="neutral"
            size="m"
            iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: linkSvg }} />}
            onClick={() => onAddLink?.()}
          >
            Add link
          </Button>
        </div>
      </div>
      )}

      {!isView && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className={styles.hiddenInput}
          onChange={onFileInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}

      <RenameDocumentModal
        open={renamingAttachment != null}
        currentName={renamingAttachment?.name ?? ''}
        onSave={commitRename}
        onClose={cancelRename}
      />
    </div>
  )
}

/* Document-request list for the "duplicate from a past meeting" preview. Uses the
   DS Document component frame at size M (the shared `.card`), but — since duplicating
   carries over structure, not the meeting-specific files — each document shows as a
   request placeholder: the neutral doc-request icon, no "…" menu, and no interaction.
   Links are not carried over, so they are omitted entirely (Figma 12375-105855). */
export function AttachmentsReadOnly({ attachments }: { attachments: Attachment[] }) {
  const docs = attachments.filter(a => a.status === 'ready' && a.format !== 'link')
  if (docs.length === 0) return null
  return (
    <div className={styles.readOnlyList}>
      {docs.map(a => (
        <div key={a.id} className={[styles.card, styles.cardReadOnly].join(' ')}>
          <span className={styles.formatIcon} aria-hidden="true" dangerouslySetInnerHTML={{ __html: formatSvg('doc-request') }} />
          <span className={styles.name}>{a.name}</span>
        </div>
      ))}
    </div>
  )
}

export default AttachmentsField
