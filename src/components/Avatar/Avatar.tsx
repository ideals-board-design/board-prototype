import styles from './Avatar.module.css'
import { users } from '../../icons/users'

const userSvg = users.find(i => i.name === 'user')!.svg

export type AvatarSize    = 's' | 'm' | 'l' | 'xl' | 'xxl'
export type AvatarType    = 'user' | 'group' | 'org'
export type AvatarVariant = 'picture' | 'letters' | 'icon'
export type AvatarColor   = 'neutral' | 'contrast'

export interface AvatarProps {
  size?:     AvatarSize
  type?:     AvatarType
  variant?:  AvatarVariant
  color?:    AvatarColor
  /** Background colour override (e.g. a per-group token) for the Letters variant */
  tint?:     string
  /** Image URL for Picture variant */
  src?:      string
  /** Initials shown in Letters variant (1–2 chars; s size shows only 1) */
  initials?: string
  alt?:      string
  className?: string
}

const sizeCls: Record<AvatarSize, string> = {
  s:   styles.s,
  m:   styles.m,
  l:   styles.l,
  xl:  styles.xl,
  xxl: styles.xxl,
}

export function Avatar({
  size     = 'm',
  type     = 'user',
  variant  = 'letters',
  color    = 'neutral',
  tint,
  src,
  initials = 'AB',
  alt      = '',
  className,
}: AvatarProps) {
  const cls = [
    styles.avatar,
    sizeCls[size],
    styles[type],
    tint ? '' : styles[color],
    className,
  ].filter(Boolean).join(' ')

  const displayInitials = size === 's' ? initials.slice(0, 1) : initials

  return (
    <div
      className={cls}
      role="img"
      aria-label={alt || undefined}
      style={tint ? { background: tint, color: 'var(--stone-0)' } : undefined}
    >
      {variant === 'picture' && src && (
        <img className={styles.img} src={src} alt={alt} />
      )}
      {(variant === 'letters' || (variant === 'picture' && !src)) && (
        <span className={styles.initials}>{displayInitials}</span>
      )}
      {variant === 'icon' && type === 'user' && (
        <span className={styles.iconWrap}>
          <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: userSvg }} />
        </span>
      )}
    </div>
  )
}
