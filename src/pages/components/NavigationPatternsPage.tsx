/* NavigationPatternsPage — reference for the responsive Side Navigation
   system: which of the 4 SideNavigation variants renders at which viewport
   tier, and why. Source of truth for the breakpoints is src/hooks/useBreakpoint.ts
   — this page's TIERS table mirrors it exactly, so it can't silently drift.

   Desktop/Laptop are shown as static device frames (sidebar/rail don't need
   interaction to demonstrate). Tablet/Mobile get a real PageHeader (hamburger
   + title, Figma's "Header mobile") whose menu button toggles the drawer —
   the drawer itself renders as the actual drawer-tablet/drawer-mobile
   SideNavigation variant behind a backdrop rectangle built from the same
   --color-bg-overlay token Drawer itself uses, animated via the same
   usePresence + translateX recipe Drawer.tsx uses for side="left" (enter
   --dur-slow, exit --dur-base). That's a faithful mockup rather than the
   real portalled <Drawer>, which is fixed to the whole browser viewport and
   would cover this page instead of a small frame. */

import { useState } from 'react'
import { SideNavigation, DEFAULT_NAV_ITEMS } from '../../components/SideNavigation/SideNavigation'
import type { Workspace } from '../../components/WorkspaceSwitcher/WorkspaceSwitcher'
import { PageHeader } from '../../components/PageHeader/PageHeader'
import { Button } from '../../components/Button/Button'
import { Toggle } from '../../components/Toggle/Toggle'
import { usePresence } from '../../components/shared/usePresence'
import { actions } from '../../icons/actions'
import { BREAKPOINTS } from '../../hooks/useBreakpoint'
import { SourceLink } from '../SourceLink'
import styles from './NavigationPatternsPage.module.css'

const multiplySvg = actions.find(i => i.name === 'multiply')!.svg

const DEMO_WORKSPACES: Workspace[] = [
  { id: 'star',   name: 'STAR Enterprises', initials: 'ST', color: '#28a560' },
  { id: 'acme',   name: 'Acme Corp',        initials: 'AC', color: '#2b6cb0' },
]

const DEMO_USER = {
  userSrc:   'https://i.pravatar.cc/64?img=47',
  userName:  'Olivia Thompson',
  userEmail: 'thompsonolivia@gmail.com',
}

function navProps(singleWorkspace: boolean) {
  return {
    // A single workspace makes the switcher render as a static label
    // instead of a dropdown/accordion trigger — no chevron, no click.
    workspaces:        singleWorkspace ? DEMO_WORKSPACES.slice(0, 1) : DEMO_WORKSPACES,
    activeWorkspaceId: 'star',
    navItems:          DEFAULT_NAV_ITEMS,
    activeItem:        'tasks' as const,
    ...DEMO_USER,
    twoFaEnabled: true,
  }
}

interface Tier {
  name:    string
  range:   string
  variant: string
  frame:   'sidebar' | 'rail' | 'drawer-tablet' | 'drawer-mobile'
  frameWidth: number
  panelWidth?: number
  usedBy: string
  /** Passed straight through to PageHeader's own `menuTier` — deterministic
   *  per frame, since a real media query would key off the actual browser
   *  window, not this frame's simulated width. */
  menuTier?: 'tablet' | 'mobile'
}

const TIERS: Tier[] = [
  {
    name: 'Desktop', range: `≥${BREAKPOINTS.desktopMin}px`, variant: "variant='sidebar'",
    frame: 'sidebar', frameWidth: 1440,
    usedBy: 'Full 240px sidebar — today’s default, unchanged.',
  },
  {
    name: 'Laptop', range: `${BREAKPOINTS.desktopMin - 1}–${BREAKPOINTS.laptopMin}px`, variant: "variant='rail'",
    frame: 'rail', frameWidth: 1200,
    usedBy: '56px icon-only rail. Hovering an item shows its label in a tooltip.',
  },
  {
    name: 'Tablet', range: `${BREAKPOINTS.laptopMin - 1}–${BREAKPOINTS.compactMin}px`, variant: "variant='drawer-tablet'",
    frame: 'drawer-tablet', frameWidth: 820, panelWidth: 460, menuTier: 'tablet',
    usedBy: 'Same content as sidebar, opened as a 460px overlay drawer. Workspace switcher accordions in place instead of floating; user menu renders inline.',
  },
  {
    name: 'Mobile', range: `${BREAKPOINTS.compactMin - 1}–390px`, variant: "variant='drawer-mobile'",
    frame: 'drawer-mobile', frameWidth: 390, panelWidth: 390, menuTier: 'mobile',
    usedBy: 'Same as Tablet, but the drawer spans the full viewport width and the user menu opens as a bottom sheet instead of inline rows.',
  },
]

function DeviceFrame({ tier, singleWorkspace }: { tier: Tier; singleWorkspace: boolean }) {
  // Starts closed — header first, click the hamburger to open — same
  // convention as every other interactive demo in this DS (e.g. DrawerPage).
  const [open, setOpen] = useState(false)
  const { mounted, state } = usePresence(open, '--dur-base')

  return (
    <div className={styles.viewportOuter}>
      <div className={styles.viewport} style={{ width: tier.frameWidth }}>
        <div className={styles.mockContent}>
          <PageHeader title="Tasks" onMenuClick={() => setOpen(true)} menuTier={tier.menuTier} />
          {mounted && (
            <>
              <div className={styles.mockBackdrop} data-state={state} onClick={() => setOpen(false)} />
              <div className={styles.mockPanel} data-state={state} style={{ width: tier.panelWidth }}>
                {/* Matches the real product shell's drawer chrome (src/app/App.tsx,
                    .navDrawerHeader) — same padding as the closed header's own
                    trigger, so the button lands exactly where the hamburger was;
                    SideNavigation supplies everything else edge to edge. */}
                <div className={[styles.mockPanelHeader, tier.menuTier === 'mobile' ? styles.mockPanelHeaderMobile : styles.mockPanelHeaderTablet].join(' ')}>
                  <Button
                    variant="tertiary"
                    intent="neutral"
                    size="m"
                    iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: multiplySvg }} />}
                    onClick={() => setOpen(false)}
                    aria-label="Close navigation menu"
                  />
                </div>
                <div className={styles.mockPanelBody}>
                  <SideNavigation variant={tier.frame} {...navProps(singleWorkspace)} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NavigationPatternsPage() {
  const [singleWorkspace, setSingleWorkspace] = useState(false)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Navigation Patterns</h1>
      <p className={styles.subtitle}>
        Which <code>SideNavigation</code> variant renders at which viewport width — driven
        entirely by <code>useBreakpoint()</code>, never a manual expand/collapse toggle.
      </p>
      <SourceLink
        path={[
          'src/hooks/useBreakpoint.ts',
          'src/components/SideNavigation/SideNavigation.tsx',
          'src/app/App.tsx',
        ]}
      />

      {/* ── Quick reference table ─────────────────────────────── */}
      <div className={styles.table}>
        <div className={styles.headerRow}>
          <span>Tier</span>
          <span>Width</span>
          <span>Prop</span>
          <span>What renders</span>
        </div>
        {TIERS.map(t => (
          <div key={t.name} className={styles.row}>
            <span className={styles.tierName}>{t.name}</span>
            <span className={styles.mono}>{t.range}</span>
            <span className={styles.mono}>{t.variant}</span>
            <span className={styles.usageText}>{t.usedBy}</span>
          </div>
        ))}
      </div>

      {/* ── Live device frames — Tablet/Mobile only (the drawer variants
             actually need interaction to demonstrate; Desktop/Laptop are
             just the sidebar with an unchanging layout, covered above). ── */}
      <div className={styles.workspaceControl}>
        <span className={styles.workspaceControlLabel}>Workspaces in these frames</span>
        <Toggle
          label={singleWorkspace ? 'Single — WorkspaceSwitcher renders as a static label, no chevron' : 'Multiple — WorkspaceSwitcher opens a dropdown/accordion'}
          checked={singleWorkspace}
          onChange={e => setSingleWorkspace(e.target.checked)}
        />
      </div>

      {TIERS.filter(t => t.frame === 'drawer-tablet' || t.frame === 'drawer-mobile').map(t => (
        <section key={t.name} className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{t.name}</h2>
            <span className={styles.badge}>{t.range}</span>
          </div>
          <p className={styles.description}>{t.usedBy}</p>
          <DeviceFrame tier={t} singleWorkspace={singleWorkspace} />
        </section>
      ))}

      {/* ── Where this runs live ──────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Check it live</h2>
        <p className={styles.description}>
          The frames above click open/closed for reference, but to see the real breakpoint
          switch happen — including the drawer's slide-in motion and Desktop/Laptop's own
          sidebar/rail layouts — open the product app and resize the browser window across
          all four ranges:
        </p>
        <a className={styles.link} href="/tasks.html" target="_blank" rel="noreferrer">
          /tasks.html ↗
        </a>
      </section>
    </div>
  )
}
