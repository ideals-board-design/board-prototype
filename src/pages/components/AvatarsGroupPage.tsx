import { AvatarsGroup } from '../../components/AvatarsGroup/AvatarsGroup'
import styles from './AvatarsGroupPage.module.css'

const p1 = new URL('../../assets/user-profile-pic-1.png', import.meta.url).href
const p2 = new URL('../../assets/user-profile-pic-2.png', import.meta.url).href
const p3 = new URL('../../assets/user-profile-pic-3.png', import.meta.url).href
const p4 = new URL('../../assets/user-profile-pic-4.png', import.meta.url).href

const SAMPLE_ITEMS = [
  { src: p1 },
  { src: p2 },
  { src: p3 },
  { src: p4 },
  { initials: 'EF' },
  { initials: 'GH' },
]

export default function AvatarsGroupPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Avatars Group</h1>
      <p className={styles.subtitle}>Figma · 27111-11237</p>

      {/* ── Sizes ──────────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Sizes</h2>
      <div className={styles.sizeRow}>
        {(['l', 'm', 's'] as const).map(size => (
          <div key={size} className={styles.sizeItem}>
            <AvatarsGroup items={SAMPLE_ITEMS} max={4} size={size} />
            <span className={styles.label}>{size.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {/* ── Max visible ────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Max visible</h2>
      <div className={styles.variantRows}>
        {([2, 3, 4, 5] as const).map(max => (
          <div key={max} className={styles.variantRow}>
            <span className={styles.rowLabel}>max={max}</span>
            <AvatarsGroup items={SAMPLE_ITEMS} max={max} size="l" />
          </div>
        ))}
      </div>

      {/* ── No overflow ────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>No overflow (items ≤ max)</h2>
      <div className={styles.variantRows}>
        <div className={styles.variantRow}>
          <span className={styles.rowLabel}>1 item</span>
          <AvatarsGroup items={[{ initials: 'AB' }]} max={3} size="l" />
        </div>
        <div className={styles.variantRow}>
          <span className={styles.rowLabel}>2 items</span>
          <AvatarsGroup items={[{ initials: 'AB' }, { src: p1 }]} max={3} size="l" />
        </div>
        <div className={styles.variantRow}>
          <span className={styles.rowLabel}>3 items (= max)</span>
          <AvatarsGroup items={SAMPLE_ITEMS.slice(0, 3)} max={3} size="l" />
        </div>
      </div>

      {/* ── Spec ───────────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Spec</h2>
      <table className={styles.specTable}>
        <tbody>
          <tr><td>L</td><td>40×40px · overlap −6px</td></tr>
          <tr><td>M</td><td>32×32px · overlap −4px</td></tr>
          <tr><td>S</td><td>24×24px · overlap −2px</td></tr>
          <tr><td>Border</td><td>2px solid white (stone-0)</td></tr>
          <tr><td>Letters bg</td><td>stone-300</td></tr>
          <tr><td>Counter bg</td><td>blue-500</td></tr>
          <tr><td>Counter text</td><td>white (inverse)</td></tr>
          <tr><td>S initials</td><td>1 letter</td></tr>
          <tr><td>M / L initials</td><td>2 letters</td></tr>
        </tbody>
      </table>
    </div>
  )
}
