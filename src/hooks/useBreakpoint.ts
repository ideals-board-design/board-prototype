/* useBreakpoint — the single source of truth for the responsive nav's
 * viewport tiers (Figma file 13o8hAdMO5Vi4KBJiHCFn8, "Navigation behaviour").
 *
 * CSS custom properties can't be used inside `@media` conditions, so any
 * `@media (min-width: …)` rule tied to these tiers duplicates the literal
 * numbers below — search for a comment referencing this file if one needs
 * to change.
 *
 * `isCompact` is a secondary signal within the mobile/tablet tier only: it
 * distinguishes the drawer's own two example widths in Figma (640px "tablet"
 * vs 390px "mobile") for the one thing that differs between them — the user
 * menu renders inline at 640px+ and as a bottom sheet below it. No breakpoint
 * number was specified beyond those two example frames, so 640 is the chosen
 * cutover.
 */

import { useSyncExternalStore } from 'react'

export const BREAKPOINTS = {
  laptopMin:  1024,
  desktopMin: 1440,
  compactMin: 640,
} as const

export type NavTier = 'mobile' | 'laptop' | 'desktop'

export interface Breakpoint {
  tier:       NavTier
  /** True once the viewport reaches Figma's "tablet" example width (640px). */
  isCompact:  boolean
}

function computeBreakpoint(): Breakpoint {
  const width = typeof window === 'undefined' ? BREAKPOINTS.desktopMin : window.innerWidth
  const tier: NavTier =
    width >= BREAKPOINTS.desktopMin ? 'desktop' :
    width >= BREAKPOINTS.laptopMin  ? 'laptop'  :
    'mobile'
  return { tier, isCompact: width >= BREAKPOINTS.compactMin }
}

function subscribe(onChange: () => void) {
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}

let cached: Breakpoint | null = null
function getSnapshot(): Breakpoint {
  const next = computeBreakpoint()
  if (!cached || cached.tier !== next.tier || cached.isCompact !== next.isCompact) cached = next
  return cached
}

export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, getSnapshot, () => ({ tier: 'desktop', isCompact: true }))
}
