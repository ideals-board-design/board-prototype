/* Motion helpers — the bridge between the CSS motion tokens and the JS that has
 * to know how long a transition lasts (unmount timing, FLIP reflow).
 *
 * Component code must never hardcode a duration. Read the token instead. */

/** Reads a duration token off the root element and returns it in milliseconds. */
export function tokenMs(token: string, fallback = 0): number {
  if (typeof window === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  if (!raw) return fallback
  const value = parseFloat(raw)
  if (Number.isNaN(value)) return fallback
  return raw.endsWith('ms') ? value : value * 1000
}

/** Reads an easing token off the root element. */
export function tokenEase(token: string, fallback = 'linear'): string {
  if (typeof window === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || fallback
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
