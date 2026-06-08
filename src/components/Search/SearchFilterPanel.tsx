/* SearchFilterPanel — filter panel that appears below the Search field.
   Figma node: 34643-6976 (Filters droplist)
   Width: 360px · Padding: 16px · Shadow-100
   Sections: quick-filter buttons → dropdowns → clear all */

import type { ReactNode } from 'react'
import { Button }   from '../Button/Button'
import { Dropdown } from '../Dropdown/Dropdown'
import type { DropdownOption } from '../Dropdown/Dropdown'
import styles from './SearchFilterPanel.module.css'

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface QuickFilter {
  label:    string
  active:   boolean
  onToggle: () => void
}

export interface DropdownFilter {
  placeholder: string
  options:     DropdownOption[]
  value:       string
  onChange:    (value: string | string[]) => void
}

export interface SearchFilterPanelProps {
  quickFilters?: QuickFilter[]
  dropdowns?:    DropdownFilter[]
  onClearAll?:   () => void
  /** Injected footer content (optional) */
  footer?:       ReactNode
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function SearchFilterPanel({
  quickFilters = [],
  dropdowns    = [],
  onClearAll,
}: SearchFilterPanelProps) {
  return (
    <div className={styles.panel}>

      {/* Quick filter buttons */}
      {quickFilters.length > 0 && (
        <div className={styles.quickFilters}>
          {quickFilters.map(f => (
            <Button
              key={f.label}
              variant={f.active ? 'primary' : 'secondary'}
              size="s"
              onClick={f.onToggle}
            >
              {f.label}
            </Button>
          ))}
        </div>
      )}

      {/* Dropdown filters */}
      {dropdowns.length > 0 && (
        <div className={styles.dropdowns}>
          {dropdowns.map((d, i) => (
            <Dropdown
              key={i}
              options={d.options}
              value={d.value}
              onChange={d.onChange}
              placeholder={d.placeholder}
              size="m"
              clearable
            />
          ))}
        </div>
      )}

      {/* Clear all */}
      <div className={styles.footer}>
        <Button
          variant="secondary"
          size="m"
          style={{ width: '100%' }}
          onClick={onClearAll}
        >
          Clear all
        </Button>
      </div>

    </div>
  )
}

export default SearchFilterPanel
