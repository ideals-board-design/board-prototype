import { Fragment, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Breadcrumbs.module.css'
import { arrows } from '../../icons/arrows'
import { functional } from '../../icons/functional'

const separatorSvg = arrows.find(i => i.name === 'angle-right-fill')!.svg
const ellipsisSvg  = functional.find(i => i.name === 'ellipsis-h')!.svg

export type BreadcrumbItem = {
  label: string
  href?: string
  onClick?: () => void
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  size?: 'l' | 'm'
  /** Collapse the middle crumbs into a “…” when the count exceeds this (default 4).
   *  The … opens a contextual menu listing the hidden pages. */
  maxItems?: number
  className?: string
}

type RenderNode =
  | { kind: 'crumb'; item: BreadcrumbItem; index: number }
  | { kind: 'ellipsis' }

export function Breadcrumbs({ items, size = 'm', maxItems = 4, className }: BreadcrumbsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos]   = useState({ top: 0, left: 0 })
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)

  const collapsed = items.length > maxItems
  /* Hidden = everything between the first crumb and the last two. */
  const hidden = collapsed ? items.slice(1, items.length - 2) : []

  /* Position the menu below the … button. */
  useEffect(() => {
    if (!menuOpen || !menuBtnRef.current) return
    const r = menuBtnRef.current.getBoundingClientRect()
    setMenuPos({ top: r.bottom + 4, left: r.left })
  }, [menuOpen])

  /* Close on outside click. */
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (menuBtnRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  /* Collapsed trail = first crumb · … · last two crumbs (Figma node 32226-20130). */
  const nodes: RenderNode[] = collapsed
    ? [
        { kind: 'crumb', item: items[0], index: 0 },
        { kind: 'ellipsis' },
        { kind: 'crumb', item: items[items.length - 2], index: items.length - 2 },
        { kind: 'crumb', item: items[items.length - 1], index: items.length - 1 },
      ]
    : items.map((item, index) => ({ kind: 'crumb', item, index }))

  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className={`${styles.breadcrumbs} ${size === 'l' ? styles.sizeL : styles.sizeM}`}>
        {nodes.map((node, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <li className={styles.separator} aria-hidden="true">
                <span className={styles.separatorIcon} dangerouslySetInnerHTML={{ __html: separatorSvg }} />
              </li>
            )}
            <li>
              {node.kind === 'ellipsis' ? (
                <button
                  ref={menuBtnRef}
                  type="button"
                  className={`${styles.crumb} ${styles.ellipsis}`}
                  onClick={() => setMenuOpen(o => !o)}
                  aria-label="Show hidden breadcrumbs"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className={styles.ellipsisIcon} dangerouslySetInnerHTML={{ __html: ellipsisSvg }} />
                </button>
              ) : node.index === items.length - 1 ? (
                <span className={`${styles.crumb} ${styles.active}`} aria-current="page">
                  {node.item.label}
                </span>
              ) : node.item.href ? (
                <a href={node.item.href} className={styles.crumb}>
                  {node.item.label}
                </a>
              ) : (
                <button type="button" className={styles.crumb} onClick={node.item.onClick}>
                  {node.item.label}
                </button>
              )}
            </li>
          </Fragment>
        ))}
      </ol>

      {/* Contextual menu — hidden pages, portalled below the … */}
      {menuOpen && createPortal(
        <div
          ref={menuRef}
          className={styles.menu}
          role="menu"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          {hidden.map((item, i) =>
            item.href ? (
              <a
                key={i}
                href={item.href}
                role="menuitem"
                className={styles.menuItem}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <button
                key={i}
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => { item.onClick?.(); setMenuOpen(false) }}
              >
                {item.label}
              </button>
            )
          )}
        </div>,
        document.body,
      )}
    </nav>
  )
}

export default Breadcrumbs
