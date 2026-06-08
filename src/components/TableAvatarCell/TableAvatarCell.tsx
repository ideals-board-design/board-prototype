/* TableAvatarCell — Figma node 31434-6347
   Three types: horizontal · info · vertical
   Always renders <td> with inner wrapper (no display:flex on td itself) */

import type { ReactNode } from 'react'
import styles from './TableAvatarCell.module.css'

/* ── Helpers ─────────────────────────────────────────────── */

function getInitials(name: string, count: 1 | 2): string {
  const parts = name.trim().split(/\s+/)
  if (count === 1) return (parts[0]?.[0] ?? '').toUpperCase()
  const first = parts[0]?.[0] ?? ''
  const last  = parts[1]?.[0] ?? ''
  return (first + last).toUpperCase() || '?'
}

/* ── Props ───────────────────────────────────────────────── */

export interface TableAvatarCellProps {
  /** Person's display name */
  name: string
  /** Optional avatar photo URL; falls back to initials */
  src?: string
  /**
   * horizontal  — small avatar (24px) + name text  [default]
   * info        — large avatar (40px) + name + secondary info row (64px tall)
   * vertical    — medium avatar (32px) + centered name below
   */
  type?: 'horizontal' | 'info' | 'vertical'
  /** Secondary info text — shown only in `info` type */
  info?: string
  /** "+N" overflow count — shown only in `horizontal` type */
  extra?: number
  /** Avatar background colour — defaults to stone-300 */
  avatarColor?: string
  /** Avatar shape — circle (default) or square (for groups/workspaces) */
  avatarShape?: 'circle' | 'square'
  className?: string
}

/* ── Component ───────────────────────────────────────────── */

export function TableAvatarCell({
  name,
  src,
  type = 'horizontal',
  info,
  extra,
  avatarColor = 'var(--stone-300)',
  avatarShape = 'circle',
  className,
}: TableAvatarCellProps) {
  const initialsCount = type === 'horizontal' ? 1 : 2
  const initials = getInitials(name, initialsCount)
  const isSquare = avatarShape === 'square'
  const isCustomColor = avatarColor !== 'var(--stone-300)'

  const avatarClass = [
    styles.avatar,
    type === 'horizontal' ? styles.avatarS
      : type === 'info'   ? styles.avatarL
                           : styles.avatarM,
    isSquare ? styles.avatarSquare : null,
  ].filter(Boolean).join(' ')

  const avatarNode = (
    <div
      className={avatarClass}
      style={{ background: avatarColor }}
      aria-hidden
    >
      {src
        ? <img src={src} alt={name} className={styles.avatarImg} />
        : <span className={[
            styles.avatarInitials,
            isCustomColor ? styles.avatarInitialsInverse : null,
          ].filter(Boolean).join(' ')}>
            {initials}
          </span>
      }
    </div>
  )

  return (
    <td
      className={[
        styles.td,
        styles[type],
        className,
      ].filter(Boolean).join(' ')}
    >

      {/* ── Horizontal ──────────────────────────────── */}
      {type === 'horizontal' && (
        <div className={[styles.inner, styles.innerHorizontal].join(' ')}>
          {avatarNode}
          <span className={styles.nameText}>{name}</span>
          {extra != null && (
            <span className={styles.extra}>+{extra}</span>
          )}
        </div>
      )}

      {/* ── Info ────────────────────────────────────── */}
      {type === 'info' && (
        <div className={[styles.inner, styles.innerInfo].join(' ')}>
          {avatarNode}
          <div className={styles.textBlock}>
            <span className={styles.nameBold}>{name}</span>
            {info && <span className={styles.infoText}>{info}</span>}
          </div>
        </div>
      )}

      {/* ── Vertical ────────────────────────────────── */}
      {type === 'vertical' && (
        <div className={[styles.inner, styles.innerVertical].join(' ')}>
          {avatarNode}
          <span className={styles.nameCenter}>{name}</span>
        </div>
      )}

    </td>
  )
}

export default TableAvatarCell
