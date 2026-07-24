import { useCallback, useSyncExternalStore } from 'react'

/** Branding scheme key. 'default' = the built-in green brand (no attribute set). */
export type BrandingKey =
  | 'default'
  | 'vibrant-green'
  | 'cerulean-blue'
  | 'azure-blue'
  | 'royal-blue'
  | 'violet-indigo'
  | 'magenta-pink'
  | 'crimson-rose'
  | 'burnt-orange'

export interface BrandingTheme {
  key:    BrandingKey
  label:  string
  /** Representative swatch colour (light-mode -500), for pickers only. */
  swatch: string
}

/**
 * Selectable branding schemes, in display order. `default` keeps the existing
 * DS green; the rest come from the Figma "Color themes" export and are applied
 * via a `[data-branding="<key>"]` root attribute (see branding.css). Branding
 * recolours the accent (--accent-*) ramp only — status colours stay green.
 */
export const BRANDING_THEMES: BrandingTheme[] = [
  { key: 'default',       label: 'Green (default)', swatch: '#2C9C74' },
  { key: 'vibrant-green', label: 'Vibrant Green',   swatch: '#03A300' },
  { key: 'cerulean-blue', label: 'Cerulean Blue',   swatch: '#139BBA' },
  { key: 'azure-blue',    label: 'Azure Blue',      swatch: '#3099E2' },
  { key: 'royal-blue',    label: 'Royal Blue',      swatch: '#4268DF' },
  { key: 'violet-indigo', label: 'Violet Indigo',   swatch: '#6247E1' },
  { key: 'magenta-pink',  label: 'Magenta Pink',    swatch: '#CD23A0' },
  { key: 'crimson-rose',  label: 'Crimson Rose',    swatch: '#E73361' },
  { key: 'burnt-orange',  label: 'Burnt Orange',    swatch: '#E16D13' },
]

const VALID = new Set(BRANDING_THEMES.map(t => t.key))
const STORAGE_KEY = 'board-branding'

function readBranding(): BrandingKey {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && VALID.has(stored as BrandingKey)) return stored as BrandingKey
  } catch {
    /* localStorage unavailable — fall through */
  }
  return 'default'
}

// ── Module-level store: one source of truth shared by every useBranding() ──────
let branding: BrandingKey = readBranding()
const listeners = new Set<() => void>()

function apply() {
  if (typeof document !== 'undefined') {
    // 'default' = no attribute, so --accent-* falls through to the green tokens.
    if (branding === 'default') delete document.documentElement.dataset.branding
    else document.documentElement.dataset.branding = branding
  }
}

function notify() {
  for (const l of listeners) l()
}

apply() // set data-branding as soon as the module loads (avoids a flash)

function setBrandingPref(next: BrandingKey) {
  branding = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* ignore persistence failures */
  }
  apply()
  notify()
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/**
 * Shared branding scheme. Writes `data-branding` onto the root <html> element
 * (applies across all entry points), persists to localStorage, and keeps every
 * consumer in sync via a module-level store. Mirrors {@link useTheme}.
 */
export function useBranding() {
  const value = useSyncExternalStore(subscribe, () => branding, () => branding)
  const setBranding = useCallback((next: BrandingKey) => setBrandingPref(next), [])
  return { branding: value, setBranding }
}
