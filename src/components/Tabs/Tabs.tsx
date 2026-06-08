import { useState, type ReactNode } from 'react'
import styles from './Tabs.module.css'
import { BadgeCounter } from '../BadgeCounter/BadgeCounter'

export interface TabItem {
  id: string | number
  label: string
  badge?: string | number
  icon?: string          // DS icon SVG string
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  value?: string | number
  defaultValue?: string | number
  onChange?: (id: string | number) => void
  className?: string
  children?: ReactNode   // optional panel content below strip
}

export function Tabs({
  tabs,
  value,
  defaultValue,
  onChange,
  className,
  children,
}: TabsProps) {
  const [internal, setInternal] = useState<string | number>(
    defaultValue ?? tabs[0]?.id
  )

  const activeId = value !== undefined ? value : internal

  function handleClick(tab: TabItem) {
    if (tab.disabled) return
    if (value === undefined) setInternal(tab.id)
    onChange?.(tab.id)
  }

  return (
    <div className={`${styles.root} ${className ?? ''}`.trim()}>
      <div className={styles.strip} role="tablist">
        {tabs.map(tab => {
          const isSelected = tab.id === activeId
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              disabled={tab.disabled}
              className={`${styles.tab} ${isSelected ? styles.selected : ''} ${tab.disabled ? styles.disabled : ''}`}
              onClick={() => handleClick(tab)}
            >
              <span className={styles.layout}>
                <span className={styles.label}>{tab.label}</span>

                {tab.badge !== undefined && (
                  <BadgeCounter variant="primary" count={tab.badge} />
                )}

                {tab.icon !== undefined && (
                  <span
                    className={styles.icon}
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: tab.icon }}
                  />
                )}
              </span>
              <span className={styles.indicator} />
            </button>
          )
        })}
      </div>
      {children}
    </div>
  )
}

export default Tabs
