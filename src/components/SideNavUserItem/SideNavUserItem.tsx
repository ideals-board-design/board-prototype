/* SideNavUserItem — Figma nodes 34960-1126 (Active) · 34960-1128 (Hover) · 34960-1127 (Opened)
   Droplist: 3194-1280. Language sublist: 3194-1374.
   Trigger: 240×48px. Dropdown: 320px wide, above trigger. */

import { useState, useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Avatar } from '../Avatar/Avatar'
import { Drawer } from '../Drawer/Drawer'
import { Tooltip } from '../Tooltip/Tooltip'
import { condition } from '../../icons/condition'
import { users }     from '../../icons/users'
import { actions }   from '../../icons/actions'
import { location }  from '../../icons/location'
import { arrows }    from '../../icons/arrows'
import { useTheme, type ThemePref } from '../../hooks/useTheme'
import { useBranding, BRANDING_THEMES } from '../../hooks/useBranding'
import { usePresence } from '../shared/usePresence'
import styles from './SideNavUserItem.module.css'

const shieldCheckSvg       = condition.find(i => i.name === 'shield-check')!.svg
const shieldExclamationSvg = condition.find(i => i.name === 'shield-exclamation')!.svg
const userSvg        = users.find(i => i.name === 'user')!.svg
const linkSvg        = actions.find(i => i.name === 'link')!.svg
const globeSvg       = location.find(i => i.name === 'globe')!.svg
const themeSvg       = condition.find(i => i.name === 'chart-50%')!.svg
const angleRightSvg  = arrows.find(i => i.name === 'angle-right-fill')!.svg
const brandingSvg    = actions.find(i => i.name === 'sparkles')!.svg
const exitSvg        = actions.find(i => i.name === 'exit')!.svg

const THEMES: { value: ThemePref; label: string }[] = [
  { value: 'dark',   label: 'Dark' },
  { value: 'light',  label: 'Light' },
  { value: 'system', label: 'Match system' },
]

export interface SideNavUserItemProps {
  src?:                string
  name:                string
  email:               string
  twoFaEnabled?:       boolean
  defaultOpen?:        boolean
  onProfileClick?:     () => void
  onConnectionsClick?: () => void
  onLogoutClick?:      () => void
  /** Icon-only trigger (laptop rail, 1024–1439px). `variant="dropdown"` only. */
  rail?:               boolean
  /** 'dropdown' (default, desktop/laptop) — full menu incl. 2FA banner, Theme
   *  and Branding submenus. 'inline' (tablet drawer) — just My profile /
   *  Connections / Language / Log out as plain rows, no dropdown. 'sheet'
   *  (mobile drawer) — same 4 items, opened from the profile row as a
   *  bottom sheet. Theme/Branding are desktop+laptop-only features, so
   *  'inline'/'sheet' don't carry them (matches the Figma mobile/tablet spec). */
  variant?:            'dropdown' | 'inline' | 'sheet'
}

const LANGUAGES = [
  { code: 'en', label: 'English'  },
  { code: 'es', label: 'Español'  },
  { code: 'fr', label: 'Français' },
]

/** Flyout submenus off the main dropdown — positioned the same way as the DS
 *  `Dropdown` component's sublist panels (getBoundingClientRect + portal to
 *  document.body + position: fixed), instead of a static CSS offset, so they
 *  can't drift out of sync with the panel they're anchored to. */
type SublistKey = 'lang' | 'theme' | 'branding'

const SUBLIST_GAP = 4
const SUBLIST_WIDTH: Record<SublistKey, number> = { lang: 168, theme: 168, branding: 200 }

function positionSublist(key: SublistKey, itemEl: HTMLElement) {
  const r = itemEl.getBoundingClientRect()
  const width = SUBLIST_WIDTH[key]
  const overflowsRight = r.right + SUBLIST_GAP + width > window.innerWidth
  const left = overflowsRight
    ? Math.max(SUBLIST_GAP, r.left - SUBLIST_GAP - width)
    : r.right + SUBLIST_GAP
  // Branding grows upward from the item's bottom edge (it lists every scheme
  // and the trigger sits near the viewport bottom); the rest align to the top.
  return key === 'branding'
    ? { left, bottom: window.innerHeight - r.bottom - SUBLIST_GAP }
    : { left, top: r.top - SUBLIST_GAP }
}

type SublistPos = { left: number; top?: number; bottom?: number }

/** One flyout submenu (Language / Theme / Branding). Runs its own `usePresence`
 *  off `isOpen` so it fades in/out independently of the other two — switching
 *  the hovered row (e.g. Branding → Language) fades the old one out and the
 *  new one in at the same time, the same as opening from closed, instead of
 *  snapping straight to the new content because "some sublist" stayed open
 *  the whole time. Mirrors `Dropdown.tsx`'s per-level `SublistPanel`. */
function SublistFlyout({
  isOpen,
  panelRef,
  className,
  pos,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  isOpen:       boolean
  panelRef:     RefObject<HTMLDivElement | null>
  className:    string
  pos:          SublistPos
  onMouseEnter: () => void
  onMouseLeave: () => void
  children:     ReactNode
}) {
  const { mounted, state } = usePresence(isOpen, '--dur-instant')
  if (!mounted) return null
  return createPortal(
    <div
      ref={panelRef}
      className={className}
      data-state={state}
      aria-hidden={state === 'closed'}
      style={pos}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>,
    document.body,
  )
}

/** My profile / Connections / Language / Log out — shared by 'inline' and
 *  'sheet', which both show this exact set with no submenus. */
function UserMenuItems({
  activeLangLabel,
  onProfileClick,
  onConnectionsClick,
  onLogoutClick,
}: {
  activeLangLabel:     string
  onProfileClick?:     () => void
  onConnectionsClick?: () => void
  onLogoutClick?:      () => void
}) {
  return (
    <>
      <button type="button" className={styles.navItem} onClick={onProfileClick}>
        <span className={styles.navItemInner}>
          <span className={styles.navItemIcon} dangerouslySetInnerHTML={{ __html: userSvg }} />
          <span className={styles.navItemLabel}>My profile</span>
        </span>
      </button>
      <button type="button" className={styles.navItem} onClick={onConnectionsClick}>
        <span className={styles.navItemInner}>
          <span className={styles.navItemIcon} dangerouslySetInnerHTML={{ __html: linkSvg }} />
          <span className={styles.navItemLabel}>Connections</span>
        </span>
      </button>
      <div className={styles.navItem}>
        <span className={styles.navItemInner}>
          <span className={styles.navItemIcon} dangerouslySetInnerHTML={{ __html: globeSvg }} />
          <span className={styles.navItemLabel}>Language ({activeLangLabel})</span>
        </span>
      </div>
      <button type="button" className={[styles.navItem, styles.navItemDanger].join(' ')} onClick={onLogoutClick}>
        <span className={styles.navItemInner}>
          <span className={styles.navItemIcon} dangerouslySetInnerHTML={{ __html: exitSvg }} />
          <span className={styles.navItemLabel}>Log out</span>
        </span>
      </button>
    </>
  )
}

export function SideNavUserItem({
  src,
  name,
  email,
  twoFaEnabled  = false,
  defaultOpen   = false,
  onProfileClick,
  onConnectionsClick,
  onLogoutClick,
  rail          = false,
  variant       = 'dropdown',
}: SideNavUserItemProps) {
  const [open, setOpen]             = useState(defaultOpen)
  const [activeLang, setActiveLang] = useState('en')
  const { theme, setTheme } = useTheme()
  const { branding, setBranding } = useBranding()
  const rootRef            = useRef<HTMLDivElement>(null)

  // Flyout submenu (Language / Theme / Branding) — see `positionSublist`.
  // Position is tracked per key (not one shared value) so a panel that's
  // mid-exit keeps its own last position instead of jumping to wherever the
  // newly-opened one is.
  const [activeSublist, setActiveSublist]   = useState<SublistKey | null>(null)
  const [sublistPosByKey, setSublistPosByKey] = useState<Record<SublistKey, SublistPos>>({
    lang: { left: 0 }, theme: { left: 0 }, branding: { left: 0 },
  })
  const sublistCloseTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const sublistTriggerElRef  = useRef<HTMLElement | null>(null)
  const langPanelRef         = useRef<HTMLDivElement>(null)
  const themePanelRef        = useRef<HTMLDivElement>(null)
  const brandingPanelRef     = useRef<HTMLDivElement>(null)
  const langItemRef          = useRef<HTMLDivElement>(null)
  const themeItemRef         = useRef<HTMLDivElement>(null)
  const brandingItemRef      = useRef<HTMLDivElement>(null)

  // Keeps the panel mounted through its (instant) fade-out (motion spec §3).
  const { mounted, state } = usePresence(open, '--dur-instant')

  const openSublist = (key: SublistKey, itemEl: HTMLElement | null) => {
    if (!itemEl) return
    clearTimeout(sublistCloseTimerRef.current)
    sublistTriggerElRef.current = itemEl
    setSublistPosByKey(prev => ({ ...prev, [key]: positionSublist(key, itemEl) }))
    setActiveSublist(key)
  }
  const scheduleCloseSublist = () => {
    sublistCloseTimerRef.current = setTimeout(() => setActiveSublist(null), 120)
  }
  const cancelCloseSublist = () => clearTimeout(sublistCloseTimerRef.current)

  // The sublist is portaled independently of the dropdown panel, so closing
  // the dropdown (outside click, Escape, item selection) must explicitly
  // close it too — it won't unmount along with `mounted` on its own.
  useEffect(() => {
    if (!open) setActiveSublist(null)
  }, [open])

  // Reposition while open, same as the DS Dropdown's sublist panels.
  useEffect(() => {
    if (!activeSublist) return
    const key = activeSublist
    const update = () => {
      if (!sublistTriggerElRef.current) return
      setSublistPosByKey(prev => ({ ...prev, [key]: positionSublist(key, sublistTriggerElRef.current!) }))
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [activeSublist])

  useEffect(() => () => clearTimeout(sublistCloseTimerRef.current), [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (rootRef.current?.contains(t)) return
      if (langPanelRef.current?.contains(t)) return
      if (themePanelRef.current?.contains(t)) return
      if (brandingPanelRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const initials = name
    .split(' ')
    .map(p => p[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const activeLangLabel = LANGUAGES.find(l => l.code === activeLang)?.label ?? 'English'

  // 'inline' (tablet drawer) — profile summary row + the 4 items in normal
  // flow, no dropdown, no 2FA/Theme/Branding (Figma tablet spec).
  if (variant === 'inline') {
    return (
      <div className={styles.root}>
        <div className={styles.inlineProfileRow}>
          <Avatar size="m" variant="picture" src={src} initials={initials} alt={name} />
          <span className={styles.textBlock}>
            <span className={styles.triggerName}>{name}</span>
            <span className={styles.triggerEmail}>{email}</span>
          </span>
        </div>
        <UserMenuItems
          activeLangLabel={activeLangLabel}
          onProfileClick={onProfileClick}
          onConnectionsClick={onConnectionsClick}
          onLogoutClick={onLogoutClick}
        />
      </div>
    )
  }

  // 'sheet' (mobile drawer) — the profile row opens the 4 items in a bottom
  // sheet instead of showing them inline (Figma mobile spec).
  if (variant === 'sheet') {
    return (
      <div className={styles.root}>
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          <span className={styles.triggerInner}>
            <Avatar size="m" variant="picture" src={src} initials={initials} alt={name} />
            <span className={styles.textBlock}>
              <span className={styles.triggerName}>{name}</span>
              <span className={styles.triggerEmail}>{email}</span>
            </span>
          </span>
        </button>
        <Drawer
          variant="overlay"
          side="bottom"
          open={open}
          onClose={() => setOpen(false)}
          ariaLabel="User menu"
          bodyClassName={styles.sheetBody}
        >
          <UserMenuItems
            activeLangLabel={activeLangLabel}
            onProfileClick={() => { onProfileClick?.(); setOpen(false) }}
            onConnectionsClick={() => { onConnectionsClick?.(); setOpen(false) }}
            onLogoutClick={() => { onLogoutClick?.(); setOpen(false) }}
          />
        </Drawer>
      </div>
    )
  }

  return (
    <div className={styles.root} ref={rootRef}>

      {/* ── Dropdown (rendered above trigger) ──────────────── */}
      {mounted && (
        <div
          className={styles.dropdown}
          data-state={state}
          aria-hidden={state === 'closed'}
          role="dialog"
          aria-label="User menu"
        >

          {/* 2FA banner — Figma 3196-1375 / 3196-1383 */}
          <div className={[styles.twoFaBanner, twoFaEnabled ? '' : styles.twoFaBannerWarning].filter(Boolean).join(' ')}>
            <span
              className={[styles.twoFaIcon, twoFaEnabled ? styles.twoFaIconGreen : styles.twoFaIconWarning].join(' ')}
              dangerouslySetInnerHTML={{ __html: twoFaEnabled ? shieldCheckSvg : shieldExclamationSvg }}
            />
            <span className={styles.twoFaLabel}>
              {twoFaEnabled ? 'Account 2FA-protected' : 'Account not 2FA-protected'}
            </span>
            {!twoFaEnabled && (
              <button type="button" className={styles.twoFaProtectBtn}>
                Protect
              </button>
            )}
          </div>

          {/* My profile */}
          <button
            type="button"
            className={styles.item}
            onClick={() => { onProfileClick?.(); setOpen(false) }}
          >
            <span className={styles.icon} dangerouslySetInnerHTML={{ __html: userSvg }} />
            <span className={styles.itemLabel}>My profile</span>
          </button>

          {/* Connections */}
          <button
            type="button"
            className={styles.item}
            onClick={() => { onConnectionsClick?.(); setOpen(false) }}
          >
            <span className={styles.icon} dangerouslySetInnerHTML={{ __html: linkSvg }} />
            <span className={styles.itemLabel}>Connections</span>
          </button>

          {/* Language — hover reveals flyout submenu */}
          <div
            ref={langItemRef}
            className={styles.item}
            onMouseEnter={() => openSublist('lang', langItemRef.current)}
            onMouseLeave={scheduleCloseSublist}
          >
            <span className={styles.icon} dangerouslySetInnerHTML={{ __html: globeSvg }} />
            <span className={styles.itemLabel}>Language</span>
            <span className={styles.chevronRight} dangerouslySetInnerHTML={{ __html: angleRightSvg }} />
          </div>

          {/* Theme — hover reveals flyout submenu (mirrors Language) */}
          <div
            ref={themeItemRef}
            className={styles.item}
            onMouseEnter={() => openSublist('theme', themeItemRef.current)}
            onMouseLeave={scheduleCloseSublist}
          >
            <span className={styles.icon} dangerouslySetInnerHTML={{ __html: themeSvg }} />
            <span className={styles.itemLabel}>Theme</span>
            <span className={styles.chevronRight} dangerouslySetInnerHTML={{ __html: angleRightSvg }} />
          </div>

          {/* Branding — hover reveals scheme flyout submenu (mirrors Theme) */}
          <div
            ref={brandingItemRef}
            className={styles.item}
            onMouseEnter={() => openSublist('branding', brandingItemRef.current)}
            onMouseLeave={scheduleCloseSublist}
          >
            <span className={styles.icon} dangerouslySetInnerHTML={{ __html: brandingSvg }} />
            <span className={styles.itemLabel}>Branding</span>
            <span className={styles.chevronRight} dangerouslySetInnerHTML={{ __html: angleRightSvg }} />
          </div>

          {/* Log out */}
          <button
            type="button"
            className={[styles.item, styles.itemDanger].join(' ')}
            onClick={() => { onLogoutClick?.(); setOpen(false) }}
          >
            <span className={[styles.icon, styles.iconDanger].join(' ')} dangerouslySetInnerHTML={{ __html: exitSvg }} />
            <span className={styles.itemLabel}>Log out</span>
          </button>

        </div>
      )}

      {/* ── Flyout submenus — each fades independently (see `SublistFlyout`),
           so switching between them always animates the same way ──────── */}
      <SublistFlyout
        isOpen={activeSublist === 'lang'}
        panelRef={langPanelRef}
        className={styles.sublist}
        pos={sublistPosByKey.lang}
        onMouseEnter={cancelCloseSublist}
        onMouseLeave={scheduleCloseSublist}
      >
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            type="button"
            className={[styles.item, lang.code === activeLang ? styles.itemActive : ''].filter(Boolean).join(' ')}
            onClick={() => { setActiveLang(lang.code); setOpen(false) }}
          >
            <span className={styles.itemLabel}>{lang.label}</span>
          </button>
        ))}
      </SublistFlyout>

      <SublistFlyout
        isOpen={activeSublist === 'theme'}
        panelRef={themePanelRef}
        className={styles.sublist}
        pos={sublistPosByKey.theme}
        onMouseEnter={cancelCloseSublist}
        onMouseLeave={scheduleCloseSublist}
      >
        {THEMES.map(t => (
          <button
            key={t.value}
            type="button"
            className={[styles.item, t.value === theme ? styles.itemActive : ''].filter(Boolean).join(' ')}
            onClick={() => { setTheme(t.value); setOpen(false) }}
          >
            <span className={styles.itemLabel}>{t.label}</span>
          </button>
        ))}
      </SublistFlyout>

      <SublistFlyout
        isOpen={activeSublist === 'branding'}
        panelRef={brandingPanelRef}
        className={[styles.sublist, styles.brandingSublist].join(' ')}
        pos={sublistPosByKey.branding}
        onMouseEnter={cancelCloseSublist}
        onMouseLeave={scheduleCloseSublist}
      >
        {BRANDING_THEMES.map(scheme => (
          <button
            key={scheme.key}
            type="button"
            className={[styles.item, scheme.key === branding ? styles.itemActive : ''].filter(Boolean).join(' ')}
            onClick={() => { setBranding(scheme.key); setOpen(false) }}
          >
            <span className={styles.brandingSwatch} style={{ background: scheme.swatch }} />
            <span className={styles.itemLabel}>{scheme.label}</span>
          </button>
        ))}
      </SublistFlyout>

      {/* ── Trigger ──────────────────────────────────────────── */}
      {(() => {
        const trigger = (
          <button
            type="button"
            className={[styles.trigger, open ? styles.triggerOpen : '', rail ? styles.rail : ''].filter(Boolean).join(' ')}
            onClick={() => setOpen(o => !o)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={rail ? name : undefined}
          >
            <span className={styles.triggerInner}>
              <Avatar size="m" variant="picture" src={src} initials={initials} alt={name} />
              {!rail && (
                <span className={styles.textBlock}>
                  <span className={styles.triggerName}>{name}</span>
                  <span className={styles.triggerEmail}>{email}</span>
                </span>
              )}
            </span>
          </button>
        )
        return rail
          ? <Tooltip label={name} position="right" wrapperClassName={styles.railTooltipWrapper}>{trigger}</Tooltip>
          : trigger
      })()}

    </div>
  )
}

export default SideNavUserItem
