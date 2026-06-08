import { useState } from 'react'
import styles from './SegmentControl.module.css'

export type SegmentSize = 'l' | 'm' | 's'

export interface SegmentItem {
  id: string | number
  label: string
  icon?: string   // DS icon SVG string
}

export interface SegmentControlProps {
  items: SegmentItem[]
  size?: SegmentSize
  value?: string | number
  defaultValue?: string | number
  onChange?: (id: string | number) => void
  className?: string
}

function getBorderClass(
  index: number,
  total: number,
  selectedIdx: number
): string {
  if (index === selectedIdx) return styles.borderSelected
  const isFirst = index === 0
  const isLast = index === total - 1
  if (!isFirst && !isLast) return styles.borderMiddle
  if (isFirst) return index + 1 === selectedIdx ? styles.borderNoRight : styles.borderFull
  // isLast
  return index - 1 === selectedIdx ? styles.borderNoLeft : styles.borderFull
}

export function SegmentControl({
  items,
  size = 'm',
  value,
  defaultValue,
  onChange,
  className,
}: SegmentControlProps) {
  const [internal, setInternal] = useState<string | number>(
    defaultValue ?? items[0]?.id
  )
  const activeId = value !== undefined ? value : internal
  const selectedIdx = items.findIndex(item => item.id === activeId)

  const sizeClass = size === 'l' ? styles.sizeL : size === 's' ? styles.sizeS : styles.sizeM
  const iconSize = size === 's' ? styles.iconSm : styles.iconMd

  return (
    <div className={`${styles.root} ${className ?? ''}`.trim()} role="group">
      {items.map((item, index) => {
        const isFirst = index === 0
        const isLast = index === items.length - 1
        const isSelected = item.id === activeId
        const borderClass = getBorderClass(index, items.length, selectedIdx)

        return (
          <button
            key={item.id}
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              if (value === undefined) setInternal(item.id)
              onChange?.(item.id)
            }}
            className={[
              styles.item,
              sizeClass,
              borderClass,
              isSelected ? styles.selected : '',
              isFirst ? styles.roundLeft : '',
              isLast ? styles.roundRight : '',
            ].filter(Boolean).join(' ')}
          >
            {item.icon && (
              <span
                className={`${styles.icon} ${iconSize}`}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
            )}
            <span className={styles.label}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default SegmentControl
