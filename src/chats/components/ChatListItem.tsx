/* ChatListItem — Figma component set "Chat list item" (1365:14381)
   Variants: type (one-to-one · group) × state (default · hover · selected · skeleton)
   Properties: Indicator (unread dot) · Status (sent/read receipt)
   Hover is real :hover CSS, not a prop — matches every other row in this repo. */

import { Avatar } from '../../components/Avatar/Avatar'
import { Skeleton } from '../../components/Skeleton/Skeleton'
import { communication } from '../../icons/communication'
import styles from './ChatListItem.module.css'

const checkSingleSvg = communication.find(i => i.name === 'check-single')!.svg
const checkDoubleSvg = communication.find(i => i.name === 'check-double')!.svg

export type ChatType   = 'one-to-one' | 'group'
export type ReadStatus = 'sent' | 'read'

export interface ChatListItemProps {
  type:            ChatType
  name:            string
  preview:         string
  time?:           string
  avatarSrc?:      string
  avatarInitials?: string
  /** 'Selected' Figma state — driven by the parent's click-to-select logic. */
  selected?:       boolean
  /** 'Skeleton' Figma state — a real loading placeholder, not just a prop for show. */
  skeleton?:       boolean
  /** 'Indicator' Figma property — unread dot + bold preview. */
  unread?:         boolean
  /** 'Status' Figma property — delivery/read receipt shown before the preview. */
  readStatus?:     ReadStatus
  onClick?:        () => void
}

export function ChatListItem({
  type,
  name,
  preview,
  time,
  avatarSrc,
  avatarInitials,
  selected = false,
  skeleton = false,
  unread = false,
  readStatus,
  onClick,
}: ChatListItemProps) {
  if (skeleton) {
    return (
      <div className={styles.item} aria-hidden="true">
        <Skeleton variant="circle" width={40} />
        <div className={[styles.container, styles.containerSkeleton].join(' ')}>
          <Skeleton variant="text" width={160} height={16} />
          <Skeleton variant="text" width={240} height={16} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={[styles.item, selected ? styles.selected : ''].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }}
      aria-current={selected ? 'true' : undefined}
    >
      <Avatar
        size="l"
        type={type === 'group' ? 'group' : 'user'}
        variant={avatarSrc ? 'picture' : 'letters'}
        src={avatarSrc}
        initials={avatarInitials}
      />

      <div className={styles.container}>
        <div className={styles.row}>
          <span className={styles.name}>
            {name}
            {unread && <span className={styles.dot} aria-label="Unread" />}
          </span>
          {time && <span className={styles.time}>{time}</span>}
        </div>

        <div className={styles.statusRow}>
          {readStatus && (
            <span
              className={[styles.checkIcon, readStatus === 'read' ? styles.checkRead : ''].filter(Boolean).join(' ')}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: readStatus === 'read' ? checkDoubleSvg : checkSingleSvg }}
            />
          )}
          <span className={[styles.preview, unread ? styles.previewUnread : ''].filter(Boolean).join(' ')}>
            {preview}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ChatListItem
