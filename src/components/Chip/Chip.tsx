/* Chip — Figma node 23764-133279 */

import { type ReactNode, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Chip.module.css'
import { Tooltip } from '../Tooltip/Tooltip'
import { actions } from '../../icons/actions'
import { functional } from '../../icons/functional'

const multiplySvg = actions.find(i => i.name === 'multiply')!.svg
const ellipsisSvg = functional.find(i => i.name === 'ellipsis-h')!.svg

export type ChipType = 'default' | 'danger'

export interface ChipMenuItem {
  label:    string
  onClick:  () => void
  danger?:  boolean
}

export interface ChipProps {
  label:        string
  type?:        ChipType
  disabled?:    boolean
  draggable?:   boolean          // grab cursor + HTML draggable
  iconLeft?:    ReactNode        // left icon slot
  iconRight?:   ReactNode        // right icon slot (static)
  onRemove?:    () => void       // × remove button
  menuItems?:   ChipMenuItem[]   // ··· menu button + dropdown
  avatar?:      ReactNode        // avatar slot → avatar layout
  className?:   string
}

export function Chip({
  label,
  type       = 'default',
  disabled   = false,
  draggable  = false,
  iconLeft,
  iconRight,
  onRemove,
  menuItems,
  avatar,
  className,
}: ChipProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const menuRef    = useRef<HTMLSpanElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 })

  const hasAvatar = avatar !== undefined

  // Compute portal position when menu opens
  useEffect(() => {
    if (!menuOpen || !menuBtnRef.current) return
    const rect = menuBtnRef.current.getBoundingClientRect()
    setDropPos({
      top:   rect.bottom + 4,
      right: window.innerWidth - rect.right,
    })
  }, [menuOpen])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  const chipClass = [
    styles.chip,
    hasAvatar           ? styles.withAvatar : '',
    type === 'danger'   ? styles.danger     : '',
    disabled            ? styles.disabled   : '',
    draggable           ? styles.draggable  : '',
    isDragging          ? styles.dragging   : '',
    className,
  ].filter(Boolean).join(' ')

  // Right slot: remove > menu > static icon
  let rightSlot: ReactNode = null

  if (onRemove) {
    rightSlot = (
      <Tooltip label="Remove" position="top">
        <button
          type="button"
          className={styles.removeBtn}
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${label}`}
        >
          <span
            className={styles.removeBtnIcon}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: multiplySvg }}
          />
        </button>
      </Tooltip>
    )
  } else if (menuItems?.length) {
    rightSlot = (
      <span ref={menuRef} className={styles.menuWrapper}>
        <Tooltip label="More" position="top">
          <button
            ref={menuBtnRef}
            type="button"
            className={styles.menuBtn}
            onClick={() => setMenuOpen(o => !o)}
            disabled={disabled}
            aria-label="More options"
            aria-expanded={menuOpen}
          >
            <span
              className={styles.menuBtnIcon}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ellipsisSvg }}
            />
          </button>
        </Tooltip>
        {menuOpen && createPortal(
          <span
            className={styles.menuDropdown}
            role="menu"
            style={{ top: dropPos.top, right: dropPos.right }}
          >
            {menuItems.map(item => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={[styles.menuItem, item.danger ? styles.menuItemDanger : ''].filter(Boolean).join(' ')}
                onClick={() => { item.onClick(); setMenuOpen(false) }}
              >
                {item.label}
              </button>
            ))}
          </span>,
          document.body
        )}
      </span>
    )
  } else if (iconRight !== undefined) {
    rightSlot = (
      <span className={styles.icon} aria-hidden="true">{iconRight}</span>
    )
  }

  const content = hasAvatar ? (
    <>
      <span className={styles.avatarLabel}>
        {avatar}
        <span className={styles.label}>{label}</span>
      </span>
      {rightSlot}
    </>
  ) : (
    <>
      {iconLeft !== undefined && (
        <span className={styles.icon} aria-hidden="true">{iconLeft}</span>
      )}
      <span className={styles.label}>{label}</span>
      {rightSlot}
    </>
  )

  return (
    <span
      className={chipClass}
      draggable={draggable || undefined}
      onDragStart={draggable ? () => setIsDragging(true)  : undefined}
      onDragEnd={draggable   ? () => setIsDragging(false) : undefined}
    >
      {content}
    </span>
  )
}

export default Chip
