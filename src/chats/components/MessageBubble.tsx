/* MessageBubble — Figma component set "Message" (70:5055), grouping per node 1405:17990
   Variants: type (My message · User message) × state (default · skeleton)
   Properties:
   - avatar/name: 1-to-1 chats never show these (you already know who you're talking to).
     Group chats show them only for the first message in a consecutive run from the
     same sender. Continuation messages in that run hide the avatar but keep a matching
     40px (32 avatar + 8 gap) left indent so the bubble stays aligned under the run's
     first bubble — Figma applies this as literal padding-left on the message instance.
   - more: hover-revealed action buttons (reply+copy for received, more+reply for mine),
     shown inline alongside the bubble, not below it. */

import { Avatar } from '../../components/Avatar/Avatar'
import { Button } from '../../components/Button/Button'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { communication } from '../../icons/communication'
import { actions } from '../../icons/actions'
import { functional } from '../../icons/functional'
import styles from './MessageBubble.module.css'

const checkSingleSvg = communication.find(i => i.name === 'check-single')!.svg
const checkDoubleSvg = communication.find(i => i.name === 'check-double')!.svg
const replySvg        = actions.find(i => i.name === 'reply')!.svg
const copySvg          = actions.find(i => i.name === 'copy')!.svg
const ellipsisSvg      = functional.find(i => i.name === 'ellipsis-h')!.svg

function icon(svg: string) {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
}

export interface MessageBubbleProps {
  mine:            boolean
  /** Whether this message belongs to a group chat — enables avatar/name for received messages. */
  isGroup:         boolean
  text:            string
  time:            string
  /** Group + received only: shows avatar + sender name (first message in a run). */
  showHeader?:     boolean
  senderName?:     string
  avatarSrc?:      string
  avatarInitials?: string
  /** My messages only: delivery/read receipt under the bubble. */
  readStatus?:     'sent' | 'read'
  skeleton?:       boolean
  /** False when this message immediately continues the previous one (same sender,
   *  same mine/theirs side) — tightens the vertical gap to 4px via the parent's
   *  flex `gap`, matching Figma's run-grouping frame (node 1405:17990). */
  groupStart?:     boolean
  onReply?:        () => void
  onCopy?:         () => void
  /** My messages only. */
  onMore?:         () => void
}

export function MessageBubble({
  mine,
  isGroup,
  text,
  time,
  showHeader = false,
  senderName,
  avatarSrc,
  avatarInitials,
  readStatus,
  skeleton = false,
  groupStart = true,
  onReply,
  onCopy,
  onMore,
}: MessageBubbleProps) {
  const showAvatarAndName = !mine && isGroup && showHeader
  const isGroupContinuation = !mine && isGroup && !showHeader

  if (skeleton) {
    return (
      <div className={[styles.row, mine ? styles.rowMine : styles.rowTheirs, styles.groupStart].join(' ')} aria-hidden="true">
        {!mine && isGroup && <span className={[styles.skeletonBlock, styles.skeletonAvatar].join(' ')} />}
        <span className={[styles.skeletonBlock, styles.skeletonBubble].join(' ')} />
      </div>
    )
  }

  return (
    <div className={[styles.row, mine ? styles.rowMine : styles.rowTheirs, groupStart ? styles.groupStart : ''].filter(Boolean).join(' ')}>
      {showAvatarAndName && (
        <span className={styles.avatarSlot}>
          <Avatar size="m" type="user" variant={avatarSrc ? 'picture' : 'letters'} src={avatarSrc} initials={avatarInitials} />
        </span>
      )}

      <div className={[styles.content, isGroupContinuation ? styles.contentIndented : ''].filter(Boolean).join(' ')}>
        {showAvatarAndName && <span className={styles.senderName}>{senderName}</span>}

        <div className={[styles.bubbleRow, mine ? styles.bubbleRowMine : ''].join(' ')}>
          {mine && (
            <div className={styles.actions}>
              <Tooltip label="More" position="top">
                <Button variant="tertiary" intent="neutral" size="m" aria-label="More" iconOnly={icon(ellipsisSvg)} onClick={onMore} />
              </Tooltip>
              <Tooltip label="Reply" position="top">
                <Button variant="tertiary" intent="neutral" size="m" aria-label="Reply" iconOnly={icon(replySvg)} onClick={onReply} />
              </Tooltip>
            </div>
          )}

          <div className={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs].join(' ')}>
            <div className={styles.bubbleText}>{text}</div>
            <div className={styles.meta}>
              <span className={styles.time}>{time}</span>
              {mine && readStatus && (
                <span
                  className={[styles.checkIcon, readStatus === 'read' ? styles.checkRead : ''].filter(Boolean).join(' ')}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: readStatus === 'read' ? checkDoubleSvg : checkSingleSvg }}
                />
              )}
            </div>
          </div>

          {!mine && (
            <div className={styles.actions}>
              <Tooltip label="Reply" position="top">
                <Button variant="tertiary" intent="neutral" size="m" aria-label="Reply" iconOnly={icon(replySvg)} onClick={onReply} />
              </Tooltip>
              <Tooltip label="Copy" position="top">
                <Button variant="tertiary" intent="neutral" size="m" aria-label="Copy" iconOnly={icon(copySvg)} onClick={onCopy} />
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
