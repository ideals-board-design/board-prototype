/* SideNavigationItem — Figma nodes 34954-1796 (Default), 34954-1797 (Selected), 34954-1798 (Hover)
   Width: 240px, inner pad 12px, gap 16px, icon 24×24, text Inter Medium 15px/20px */

import { navigation } from '../../icons/navigation'
import { Tooltip } from '../Tooltip/Tooltip'
import styles from './SideNavigationItem.module.css'

export type NavMenuItemKey =
  | 'chats'
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
  /** Icon-only rail mode (laptop tier, 1024–1439px) — hides the label, wraps
   *  the row in a tooltip showing it instead. */
  rail?:     boolean
  /** Mobile/tablet drawer tiers (390–1023px) — Figma's tighter drawer
   *  padding. Full sidebar and the rail keep the original padding. */
  drawer?:   boolean
}

function getIcon(name: string) {
  return navigation.find(i => i.name === name)?.svg ?? ''
}

export function SideNavigationItem({ menuItem, label, selected, onClick, rail, drawer }: SideNavigationItemProps) {
  const item = (
    <div
      className={[styles.item, rail ? styles.rail : '', drawer ? styles.drawer : '', selected ? styles.selected : ''].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }}
      aria-current={selected ? 'page' : undefined}
      aria-label={rail ? label : undefined}
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
        {!rail && <span className={styles.label}>{label}</span>}
      </div>
    </div>
  )

  return rail
    ? <Tooltip label={label} position="right" wrapperClassName={styles.railTooltipWrapper}>{item}</Tooltip>
    : item
}

export default SideNavigationItem
