/* ConversationHeader — Figma component set "Header section" (1432:22276)
   Variants: type (1-to-1 chat · group chat) · state (default · skeleton) */

import { Avatar } from '../../components/Avatar/Avatar'
import { Button } from '../../components/Button/Button'
import { functional } from '../../icons/functional'
import styles from './ConversationHeader.module.css'

const ellipsisSvg = functional.find(i => i.name === 'ellipsis-h')!.svg

export interface ConversationHeaderProps {
  type:            'one-to-one' | 'group'
  name:            string
  status:          string
  avatarSrc?:      string
  avatarInitials?: string
  skeleton?:       boolean
  onMoreClick?:    () => void
}

export function ConversationHeader({
  type,
  name,
  status,
  avatarSrc,
  avatarInitials,
  skeleton = false,
  onMoreClick,
}: ConversationHeaderProps) {
  if (skeleton) {
    return (
      <header className={styles.header} aria-hidden="true">
        <span className={[styles.skeletonBlock, styles.skeletonAvatar].join(' ')} />
        <div className={styles.info}>
          <span className={[styles.skeletonBlock, styles.skeletonLineShort].join(' ')} />
          <span className={[styles.skeletonBlock, styles.skeletonLineLong].join(' ')} />
        </div>
        <span className={[styles.skeletonBlock, styles.skeletonButton].join(' ')} />
      </header>
    )
  }

  return (
    <header className={styles.header}>
      <Avatar
        size="l"
        type={type === 'group' ? 'group' : 'user'}
        variant={avatarSrc ? 'picture' : 'letters'}
        src={avatarSrc}
        initials={avatarInitials}
      />
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.status}>{status}</span>
      </div>
      <Button
        variant="tertiary"
        intent="neutral"
        size="m"
        aria-label="More options"
        iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: ellipsisSvg }} />}
        onClick={onMoreClick}
      />
    </header>
  )
}

export default ConversationHeader
