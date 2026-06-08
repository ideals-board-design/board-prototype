import styles from './AvatarsGroup.module.css'

export interface AvatarGroupItem {
  /** Photo URL */
  src?:      string
  /** Initials (1–2 chars; size 's' shows only 1) */
  initials?: string
}

export interface AvatarsGroupProps {
  items:      AvatarGroupItem[]
  /** Max avatars to show before +N counter (default: 3) */
  max?:       number
  size?:      's' | 'm' | 'l'
  className?: string
}

const sizeCls = { s: styles.sizeS, m: styles.sizeM, l: styles.sizeL }

export function AvatarsGroup({
  items,
  max       = 3,
  size      = 'l',
  className,
}: AvatarsGroupProps) {
  const isS = size === 's'

  let slots: Array<{ kind: 'avatar'; item: AvatarGroupItem } | { kind: 'counter'; count: number }>

  if (items.length <= max) {
    slots = items.map(item => ({ kind: 'avatar', item }))
  } else {
    slots = [
      ...items.slice(0, max - 1).map(item => ({ kind: 'avatar' as const, item })),
      { kind: 'counter', count: items.length - (max - 1) },
    ]
  }

  const total = slots.length

  return (
    <div className={[styles.group, sizeCls[size], className].filter(Boolean).join(' ')}>
      {slots.map((slot, i) => {
        const zIndex = total - i

        if (slot.kind === 'counter') {
          return (
            <div key="counter" className={`${styles.item} ${styles.counter}`} style={{ zIndex }}>
              <span className={styles.initials}>{`+${slot.count}`}</span>
            </div>
          )
        }

        const { src, initials = '?' } = slot.item
        const label = isS ? initials.slice(0, 1) : initials.slice(0, 2)

        if (src) {
          return (
            <div key={i} className={styles.item} style={{ zIndex }}>
              <img className={styles.img} src={src} alt="" />
            </div>
          )
        }

        return (
          <div key={i} className={`${styles.item} ${styles.letters}`} style={{ zIndex }}>
            <span className={styles.initials}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
