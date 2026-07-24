import { useCallback, useSyncExternalStore } from 'react'

/** User preference. 'system' follows the OS `prefers-color-scheme`. */
export type ThemePref = 'light' | 'dark' | 'system'
/** Resolved value actually applied to the DOM. */
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'board-theme'

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function resolve(pref: ThemePref): ResolvedTheme {
  return pref === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : pref
}

function readPref(): ThemePref {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    /* localStorage unavailable — fall through */
  }
  return 'light'
}

// ── Module-level store: one source of truth shared by every useTheme() ─────────
let pref: ThemePref = readPref()
const listeners = new Set<() => void>()

function apply() {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = resolve(pref)
  }
}

function notify() {
  for (const l of listeners) l()
}

// Re-resolve when the OS scheme changes while preference is 'system'.
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (pref === 'system') {
      apply()
      notify()
    }
  })
}

apply() // set data-theme as soon as the module loads (avoids a flash)

function setPref(next: ThemePref) {
  pref = next
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
 * Shared light/dark/system theme. Writes `data-theme` onto the root <html>
 * element (applies across all three entry points), persists the preference to
 * localStorage, and keeps every consumer in sync via a module-level store.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => pref, () => pref)
  const setTheme = useCallback((next: ThemePref) => setPref(next), [])
  const toggleTheme = useCallback(() => setPref(resolve(pref) === 'dark' ? 'light' : 'dark'), [])
  return { theme, resolvedTheme: resolve(theme), setTheme, toggleTheme }
}
