/* SkeletonPage — showcase for the Skeleton component (motion spec §8) */

import { useState } from 'react'
import { Skeleton, SkeletonSwap } from '../../components/Skeleton/Skeleton'
import { Button } from '../../components/Button/Button'
import styles from './SkeletonPage.module.css'
import { SourceLink } from '../SourceLink'

export default function SkeletonPage() {
  const [slowLoading, setSlowLoading] = useState(false)
  const [fastLoading, setFastLoading] = useState(false)

  function reload(setter: (v: boolean) => void, ms: number) {
    setter(true)
    window.setTimeout(() => setter(false), ms)
  }

  const rowSkeleton = (
    <>
      {[0, 1, 2].map(i => (
        <div key={i} className={styles.row}>
          <Skeleton variant="circle" width={40} />
          <div className={styles.lines}>
            <Skeleton variant="text" width={160} height={16} />
            <Skeleton variant="text" width={240} height={16} />
          </div>
        </div>
      ))}
    </>
  )

  const rowContent = (
    <>
      {['Oliver Garcia', 'Liam Carter', 'Sophia Martinez'].map(name => (
        <div key={name} className={styles.row}>
          <div className={styles.avatar} aria-hidden="true" />
          <div className={styles.lines}>
            <span className={styles.name}>{name}</span>
            <span className={styles.preview}>Loaded content fades in place.</span>
          </div>
        </div>
      ))}
    </>
  )

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Skeleton</h1>
      <p className={styles.subtitle}>
        Pulses on <code>opacity</code> (1 → 0.5 → 1) over
        <code> --dur-skeleton-pulse</code>. No shimmer — gradients are banned. Never
        appears for loads under 200ms, and never cross-fades with its content: the
        skeleton is removed first, then the content fades in at <code>--dur-base</code>.
      </p>
      <SourceLink path="src/components/Skeleton/Skeleton.tsx" />

      {/* ── Shapes ───────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Shapes</h2>
      <div className={styles.shapes}>
        <div className={styles.shape}>
          <span className={styles.label}>circle</span>
          <Skeleton variant="circle" width={40} delay={0} />
        </div>
        <div className={styles.shape}>
          <span className={styles.label}>text</span>
          <Skeleton variant="text" width={240} height={16} delay={0} />
        </div>
        <div className={styles.shape}>
          <span className={styles.label}>rect</span>
          <Skeleton width={200} height={36} delay={0} />
        </div>
        <div className={styles.shape}>
          <span className={styles.label}>rect · radius lg</span>
          <Skeleton width={200} height={36} radius="lg" delay={0} />
        </div>
      </div>

      {/* ── Swap ─────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Skeleton → content (1200ms load)</h2>
      <div className={styles.trigger}>
        <Button variant="secondary" onClick={() => reload(setSlowLoading, 1200)}>
          Reload
        </Button>
      </div>
      <div className={styles.frame}>
        <SkeletonSwap loading={slowLoading} className={styles.list} skeleton={rowSkeleton}>
          {rowContent}
        </SkeletonSwap>
      </div>

      {/* ── Fast load ────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Fast load (120ms) — no skeleton at all</h2>
      <div className={styles.trigger}>
        <Button variant="secondary" onClick={() => reload(setFastLoading, 120)}>
          Reload
        </Button>
      </div>
      <div className={styles.frame}>
        <SkeletonSwap loading={fastLoading} className={styles.list} skeleton={rowSkeleton}>
          {rowContent}
        </SkeletonSwap>
      </div>
    </div>
  )
}
