/* SideNavUserItem — Figma nodes 34960-1126 (Active) · 34960-1128 (Hover) · 34960-1127 (Opened)
   Droplist: 3194-1280. Language sublist: 3194-1374.
   Trigger: 240×48px. Dropdown: 320px wide, above trigger. */

import { useState, useEffect, useRef } from 'react'
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
  const [open, setOpen]         = useState(defaultOpen)
  const [langOpen, setLangOpen] = useState(false)
  const [activeLang, setActiveLang] = useState('en')
  const [themeOpen, setThemeOpen] = useState(false)
  const [brandingOpen, setBrandingOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { branding, setBranding } = useBranding()
  const rootRef          = useRef<HTMLDivElement>(null)
  const langTimerRef     = useRef<ReturnType<typeof setTimeout>>(undefined)
  const themeTimerRef    = useRef<ReturnType<typeof setTimeout>>(undefined)
  const brandingTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Keeps the panel mounted through its fade-out (motion spec §3).
  const { mounted, state } = usePresence(open)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
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

  const handleLangEnter = () => {
    clearTimeout(langTimerRef.current)
    setLangOpen(true)
  }
  const handleLangLeave = () => {
    langTimerRef.current = setTimeout(() => setLangOpen(false), 120)
  }

  const handleThemeEnter = () => {
    clearTimeout(themeTimerRef.current)
    setThemeOpen(true)
  }
  const handleThemeLeave = () => {
    themeTimerRef.current = setTimeout(() => setThemeOpen(false), 120)
  }

  const handleBrandingEnter = () => {
    clearTimeout(brandingTimerRef.current)
    setBrandingOpen(true)
  }
  const handleBrandingLeave = () => {
    brandingTimerRef.current = setTimeout(() => setBrandingOpen(false), 120)
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

          {/* Language — hover reveals sublist */}
          <div
            className={[styles.item, styles.langItem].join(' ')}
            onMouseEnter={handleLangEnter}
            onMouseLeave={handleLangLeave}
          >
            <span className={styles.icon} dangerouslySetInnerHTML={{ __html: globeSvg }} />
            <span className={styles.itemLabel}>Language</span>
            <span className={styles.chevronRight} dangerouslySetInnerHTML={{ __html: angleRightSvg }} />

            {langOpen && (
              <div
                className={styles.sublist}
                onMouseEnter={handleLangEnter}
                onMouseLeave={handleLangLeave}
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    className={[
                      styles.item,
                      lang.code === activeLang ? styles.itemActive : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => { setActiveLang(lang.code); setOpen(false) }}
                  >
                    <span className={styles.itemLabel}>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme — hover reveals sublist (mirrors Language) */}
          <div
            className={[styles.item, styles.langItem].join(' ')}
            onMouseEnter={handleThemeEnter}
            onMouseLeave={handleThemeLeave}
          >
            <span className={styles.icon} dangerouslySetInnerHTML={{ __html: themeSvg }} />
            <span className={styles.itemLabel}>Theme</span>
            <span className={styles.chevronRight} dangerouslySetInnerHTML={{ __html: angleRightSvg }} />

            {themeOpen && (
              <div
                className={styles.sublist}
                onMouseEnter={handleThemeEnter}
                onMouseLeave={handleThemeLeave}
              >
                {THEMES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={[
                      styles.item,
                      t.value === theme ? styles.itemActive : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => { setTheme(t.value); setOpen(false) }}
                  >
                    <span className={styles.itemLabel}>{t.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Branding — hover reveals scheme sublist (mirrors Theme) */}
          <div
            className={[styles.item, styles.langItem].join(' ')}
            onMouseEnter={handleBrandingEnter}
            onMouseLeave={handleBrandingLeave}
          >
            <span className={styles.icon} dangerouslySetInnerHTML={{ __html: brandingSvg }} />
            <span className={styles.itemLabel}>Branding</span>
            <span className={styles.chevronRight} dangerouslySetInnerHTML={{ __html: angleRightSvg }} />

            {brandingOpen && (
              <div
                className={[styles.sublist, styles.brandingSublist].join(' ')}
                onMouseEnter={handleBrandingEnter}
                onMouseLeave={handleBrandingLeave}
              >
                {BRANDING_THEMES.map(scheme => (
                  <button
                    key={scheme.key}
                    type="button"
                    className={[
                      styles.item,
                      scheme.key === branding ? styles.itemActive : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => { setBranding(scheme.key); setOpen(false) }}
                  >
                    <span className={styles.brandingSwatch} style={{ background: scheme.swatch }} />
                    <span className={styles.itemLabel}>{scheme.label}</span>
                  </button>
                ))}
              </div>
            )}
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
