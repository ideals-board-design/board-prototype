/* Skeleton — loading placeholder. Motion spec §8.
 *
 * - Pulses on `opacity` only (1 → 0.5 → 1) over `--dur-skeleton-pulse`. No
 *   shimmer gradient — gradients are banned in this system.
 * - Never appears for loads under 200ms: the `delay` gate renders nothing until
 *   it elapses, so a fast response never flashes a placeholder.
 * - Skeleton and content never cross-fade. `SkeletonSwap` removes the skeleton
 *   first, then fades the content in (`--dur-base` / `--ease-out`, no translate,
 *   no scale).
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import styles from './Skeleton.module.css'

/** Spec §8: "Skeleton must not appear for loads under 200ms." */
export const SKELETON_DELAY = 200

/** True when an ancestor (`SkeletonSwap`) has already served the delay gate. */
const GateContext = createContext(false)

/**
 * Returns false until `delay` ms have passed. The timer restarts every time
 * `active` flips back to true, so a second load gets its own gate rather than
 * inheriting the first one's.
 */
function useDelayGate(delay: number, active = true): boolean {
  const [passed, setPassed] = useState(active && delay <= 0)

  useEffect(() => {
    if (!active) { setPassed(false); return }
    if (delay <= 0) { setPassed(true); return }
    setPassed(false)
    const t = window.setTimeout(() => setPassed(true), delay)
    return () => window.clearTimeout(t)
  }, [delay, active])

  return passed
}

export type SkeletonVariant = 'rect' | 'text' | 'circle'
export type SkeletonRadius  = 'xs' | 'sm' | 'md' | 'lg' | 'full'

const RADIUS_CLASS: Record<SkeletonRadius, string> = {
  xs:   styles.radiusXs,
  sm:   styles.radiusSm,
  md:   styles.radiusMd,
  lg:   styles.radiusLg,
  full: styles.radiusFull,
}

export interface SkeletonProps {
  /** `rect` (default) · `text` — a line, radius-sm · `circle` — avatar, radius-full. */
  variant?:   SkeletonVariant
  /** Any CSS length. Numbers are px. Defaults to 100%. */
  width?:     number | string
  /** Any CSS length. Numbers are px. `circle` falls back to `width`. */
  height?:    number | string
  /** Overrides the variant's default corner radius. */
  radius?:    SkeletonRadius
  /** Gate before the placeholder appears, in ms. Defaults to 200. */
  delay?:     number
  className?: string
  style?:     CSSProperties
}

export function Skeleton({
  variant = 'rect',
  width,
  height,
  radius,
  delay = SKELETON_DELAY,
  className,
  style,
}: SkeletonProps) {
  // Inside a SkeletonSwap the gate has already been served — don't pay it twice.
  const gated  = useContext(GateContext)
  const passed = useDelayGate(gated ? 0 : delay)

  if (!passed) return null

  const size: CSSProperties = {
    width:  width  ?? '100%',
    height: height ?? (variant === 'circle' ? (width ?? '100%') : undefined),
  }

  return (
    <span
      aria-hidden="true"
      className={[
        styles.skeleton,
        styles[variant],
        radius ? RADIUS_CLASS[radius] : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{ ...size, ...style }}
    />
  )
}

export interface SkeletonSwapProps {
  /** While true the skeleton shows (after `delay`); when false the content fades in. */
  loading:    boolean
  /** The placeholder tree. */
  skeleton:   ReactNode
  /** Gate before the skeleton appears, in ms. Defaults to 200. */
  delay?:     number
  children:   ReactNode
  /** Layout class for the wrapper — applied to both the skeleton and the content. */
  className?: string
}

/**
 * Swaps a skeleton for its content without a cross-fade: while loading, the
 * skeleton is gated behind `delay`; once loaded, the skeleton is gone from the
 * DOM and the content fades in at `--dur-base` / `--ease-out`.
 */
export function SkeletonSwap({
  loading,
  skeleton,
  delay = SKELETON_DELAY,
  children,
  className,
}: SkeletonSwapProps) {
  const passed = useDelayGate(delay, loading)

  if (loading) {
    if (!passed) return null
    return (
      // The gate is served here, so nested Skeletons render immediately.
      <GateContext.Provider value={true}>
        <div className={className}>{skeleton}</div>
      </GateContext.Provider>
    )
  }

  return (
    <div className={[styles.content, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export default Skeleton
