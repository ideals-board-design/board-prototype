/* ConversationHeader — Figma component set "Header section" (1432:22276)
   Variants: type (1-to-1 chat · group chat) · state (default · skeleton)
   More-options droplist mirrors the SideNavUserItem/WorkspaceSwitcher pattern:
   self-contained open state, outside-click + Escape to close. */

import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../../components/Avatar/Avatar'
import { Skeleton } from '../../components/Skeleton/Skeleton'
import { Button } from '../../components/Button/Button'
import { functional } from '../../icons/functional'
import { actions } from '../../icons/actions'
import { users } from '../../icons/users'
import styles from './ConversationHeader.module.css'

const ellipsisSvg = functional.find(i => i.name === 'ellipsis-h')!.svg
const searchSvg   = actions.find(i => i.name === 'search')!.svg
const userPlusSvg = users.find(i => i.name === 'user-plus')!.svg
const editAltSvg  = actions.find(i => i.name === 'edit-alt')!.svg
const trashSvg    = actions.find(i => i.name === 'trash-alt')!.svg

export interface ConversationHeaderProps {
  type:               'one-to-one' | 'group'
  name:               string
  status:             string
  avatarSrc?:         string
  avatarInitials?:    string
  skeleton?:          boolean
  onMoreClick?:       () => void
  onSearchClick?:     () => void
  onAddUsersClick?:   () => void
  onAddTopicClick?:   () => void
  onDeleteClick?:     () => void
}

export function ConversationHeader({
  type,
  name,
  status,
  avatarSrc,
  avatarInitials,
  skeleton = false,
  onMoreClick,
  onSearchClick,
  onAddUsersClick,
  onAddTopicClick,
  onDeleteClick,
}: ConversationHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [menuOpen])
  if (skeleton) {
    return (
      <header className={styles.header} aria-hidden="true">
        <Skeleton variant="circle" width={40} />
        <div className={[styles.info, styles.infoSkeleton].join(' ')}>
          <Skeleton variant="text" width={160} height={16} />
          <Skeleton variant="text" width={240} height={16} />
        </div>
        <Skeleton width={20} height={20} />
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
      <div className={styles.moreWrap} ref={menuRef}>
        <Button
          variant="tertiary"
          intent="neutral"
          size="m"
          aria-label="More options"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: ellipsisSvg }} />}
          onClick={() => { onMoreClick?.(); setMenuOpen(o => !o) }}
        />

        {menuOpen && (
          <div className={styles.dropdown} role="menu" aria-label="Conversation options">
            <button
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={() => { onSearchClick?.(); setMenuOpen(false) }}
            >
              <span className={styles.itemIcon} dangerouslySetInnerHTML={{ __html: searchSvg }} />
              <span className={styles.itemLabel}>Search</span>
            </button>
            <button
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={() => { onAddUsersClick?.(); setMenuOpen(false) }}
            >
              <span className={styles.itemIcon} dangerouslySetInnerHTML={{ __html: userPlusSvg }} />
              <span className={styles.itemLabel}>Add users</span>
            </button>
            <button
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={() => { onAddTopicClick?.(); setMenuOpen(false) }}
            >
              <span className={styles.itemIcon} dangerouslySetInnerHTML={{ __html: editAltSvg }} />
              <span className={styles.itemLabel}>Add topic</span>
            </button>

            <button
              type="button"
              role="menuitem"
              className={[styles.item, styles.itemDanger].join(' ')}
              onClick={() => { onDeleteClick?.(); setMenuOpen(false) }}
            >
              <span className={[styles.itemIcon, styles.iconDanger].join(' ')} dangerouslySetInnerHTML={{ __html: trashSvg }} />
              <span className={styles.itemLabel}>Delete</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default ConversationHeader
