/* StickyFooterPage — showcase for StickyFooter component
   Figma nodes 34928-9456 (page), 34928-9470 (drawer) */

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { StickyFooter } from '../../components/StickyFooter/StickyFooter'
import { Button } from '../../components/Button/Button'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { functional } from '../../icons/functional'
import { actions } from '../../icons/actions'
import styles from './StickyFooterPage.module.css'

const ellipsisH = functional.find(i => i.name === 'ellipsis-h')!.svg
const trashSvg  = actions.find(i => i.name === 'trash-alt')!.svg

function Icon({ svg }: { svg: string }) {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
}

/* ── Upward-opening overflow menu ─────────────────────── */

const DEMO_ITEMS = ['Duplicate', 'Move to…', 'Export', 'Archive']

function OverflowMenu({ items = DEMO_ITEMS }: { items?: string[] }) {
  const [open, setOpen] = useState(false)
  const [pos,  setPos]  = useState({ bottom: 0, left: 0 })
  const btnRef   = useRef<HTMLDivElement>(null)
  const menuRef  = useRef<HTMLDivElement>(null)

  const openMenu = useCallback(() => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({ bottom: window.innerHeight - r.top + 4, left: r.left })
    setOpen(true)
  }, [])

  const closeMenu = useCallback(() => setOpen(false), [])

  /* close on outside click */
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return
      closeMenu()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, closeMenu])

  /* close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, closeMenu])

  return (
    <>
      <Tooltip label="More" position="top">
        <div ref={btnRef} style={{ display: 'inline-flex' }}>
          <Button
            variant="secondary"
            intent="neutral"
            size="m"
            iconOnly={<Icon svg={ellipsisH} />}
            aria-label="More"
            aria-expanded={open}
            onClick={() => open ? closeMenu() : openMenu()}
          />
        </div>
      </Tooltip>

      {open && createPortal(
        <div
          ref={menuRef}
          className={styles.overflowMenu}
          style={{ bottom: pos.bottom, left: pos.left }}
          role="menu"
        >
          {items.map(item => (
            <button
              key={item}
              className={styles.overflowItem}
              role="menuitem"
              onClick={closeMenu}
            >
              {item}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}

/* ── Example row ─────────────────────────────────────── */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <div className={styles.rowContent}>{children}</div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────── */

export default function StickyFooterPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Sticky Footer</h1>
      <p className={styles.subtitle}>Figma nodes 34928-9456 (full page) · 34928-9470 (drawer)</p>

      {/* ── Full page variant ─────────────────────────── */}
      <h2 className={styles.sectionTitle}>Full page</h2>
      <p className={styles.description}>
        Left: primary → secondary actions (max 2 visible, rest in ···).
        Right: destructive action with label.
      </p>

      <Row label="Primary only">
        <StickyFooter
          variant="page"
          left={
            <Button variant="primary" size="m">Save</Button>
          }
        />
      </Row>

      <Row label="Primary + overflow (click ··· to open menu ↑)">
        <StickyFooter
          variant="page"
          left={
            <>
              <Button variant="primary" size="m">Save</Button>
              <OverflowMenu />
            </>
          }
        />
      </Row>

      <Row label="Primary + overflow + destructive">
        <StickyFooter
          variant="page"
          left={
            <>
              <Button variant="primary" size="m">Save</Button>
              <OverflowMenu />
            </>
          }
          right={
            <Button variant="secondary" intent="danger" size="m">Delete</Button>
          }
        />
      </Row>

      <Row label="Two constructive + destructive">
        <StickyFooter
          variant="page"
          left={
            <>
              <Button variant="primary" size="m">Publish</Button>
              <Button variant="secondary" intent="neutral" size="m">Save draft</Button>
            </>
          }
          right={
            <Button variant="secondary" intent="danger" size="m">Delete</Button>
          }
        />
      </Row>

      {/* ── Drawer variant ────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Drawer</h2>
      <p className={styles.description}>
        Same rules as full page. Destructive action on the right is icon-only.
      </p>

      <div className={styles.drawerGrid}>

        <div className={styles.drawerCard}>
          <span className={styles.drawerLabel}>Primary only</span>
          <div className={styles.drawerFrame}>
            <StickyFooter
              variant="drawer"
              left={<Button variant="primary" size="m">Save</Button>}
            />
          </div>
        </div>

        <div className={styles.drawerCard}>
          <span className={styles.drawerLabel}>Primary + overflow (click ···)</span>
          <div className={styles.drawerFrame}>
            <StickyFooter
              variant="drawer"
              left={
                <>
                  <Button variant="primary" size="m">Save</Button>
                  <OverflowMenu />
                </>
              }
            />
          </div>
        </div>

        <div className={styles.drawerCard}>
          <span className={styles.drawerLabel}>Primary + overflow + destructive (icon)</span>
          <div className={styles.drawerFrame}>
            <StickyFooter
              variant="drawer"
              left={
                <>
                  <Button variant="primary" size="m">Save</Button>
                  <OverflowMenu />
                </>
              }
              right={
                <Tooltip label="Delete" position="top">
                  <Button variant="secondary" intent="danger" size="m" iconOnly={<Icon svg={trashSvg} />} aria-label="Delete" />
                </Tooltip>
              }
            />
          </div>
        </div>

        <div className={styles.drawerCard}>
          <span className={styles.drawerLabel}>Two constructive + destructive (icon)</span>
          <div className={styles.drawerFrame}>
            <StickyFooter
              variant="drawer"
              left={
                <>
                  <Button variant="primary" size="m">Publish</Button>
                  <Button variant="secondary" intent="neutral" size="m">Save draft</Button>
                </>
              }
              right={
                <Tooltip label="Delete" position="top">
                  <Button variant="secondary" intent="danger" size="m" iconOnly={<Icon svg={trashSvg} />} aria-label="Delete" />
                </Tooltip>
              }
            />
          </div>
        </div>

      </div>

      {/* ── Guidelines ────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Guidelines</h2>
      <ul className={styles.guidelines}>
        <li>Left side: primary → secondary order. Max 2 visible; extras go into <code>···</code> menu.</li>
        <li>Right side: max 1 destructive action. Full page = labeled button. Drawer = icon-only.</li>
        <li>Default: label-only buttons. Icons only for destructive (drawer) and <code>···</code> overflow.</li>
        <li>Overflow menu always opens <strong>upward</strong> — footer is anchored to the bottom.</li>
        <li>Exception: confirmation modals / multistep forms may reverse to secondary → primary.</li>
      </ul>
    </div>
  )
}
