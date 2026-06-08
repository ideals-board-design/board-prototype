/* SideNavigationItem — Figma nodes 34954-1796 (Default), 34954-1797 (Selected), 34954-1798 (Hover)
   Width: 240px, inner pad 12px, gap 16px, icon 24×24, text Inter Medium 15px/20px */

import { navigation } from '../../icons/navigation'
import styles from './SideNavigationItem.module.css'

export type NavMenuItemKey =
  | 'dashboard'
  | 'directory'
  | 'documents'
  | 'help'
  | 'meetings'
  | 'reports'
  | 'search'
  | 'settings'
  | 'tasks'

export interface SideNavigationItemProps {
  menuItem:  NavMenuItemKey
  label:     string
  selected?: boolean
  onClick?:  () => void
}

function getIcon(name: string) {
  return navigation.find(i => i.name === name)?.svg ?? ''
}

export function SideNavigationItem({ menuItem, label, selected, onClick }: SideNavigationItemProps) {
  return (
    <div
      className={[styles.item, selected ? styles.selected : ''].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }}
      aria-current={selected ? 'page' : undefined}
    >
      <div className={styles.inner}>
        <span
          className={[styles.icon, styles.iconDefault].join(' ')}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: getIcon(`${menuItem}-default`) }}
        />
        <span
          className={[styles.icon, styles.iconActive].join(' ')}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: getIcon(`${menuItem}-hover-selected`) }}
        />
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  )
}

export default SideNavigationItem
