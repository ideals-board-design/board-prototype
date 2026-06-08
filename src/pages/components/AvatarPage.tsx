import { Avatar } from '../../components/Avatar/Avatar'
import styles from './AvatarPage.module.css'

/* Temporary demo photos from Figma (expire after 7 days — replace with project assets) */
const PHOTO_USER = 'https://www.figma.com/api/mcp/asset/d5c2d57d-c16c-4507-b31d-ccc892332a9f'
const PHOTO_ORG  = 'https://www.figma.com/api/mcp/asset/dcac25ea-1b6d-4103-b9eb-0268ea2e052a'

export default function AvatarPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Avatar</h1>
      <p className={styles.subtitle}>Figma · 11028-290223</p>

      {/* ── Sizes ─────────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Sizes</h2>
      <div className={styles.sizeRow}>
        {(['s', 'm', 'l', 'xl', 'xxl'] as const).map(size => (
          <div key={size} className={styles.sizeItem}>
            <Avatar size={size} type="user" variant="letters" initials="AB" />
            <span className={styles.label}>{size}</span>
          </div>
        ))}
      </div>

      {/* ── User – all variants ───────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>User</h2>
      <div className={styles.variantGrid}>

        <span className={styles.colLabel}>Picture</span>
        <span className={styles.colLabel}>Letters · Neutral</span>
        <span className={styles.colLabel}>Icon · Neutral</span>
        <span className={styles.colLabel}>Letters · Contrast</span>
        <span className={styles.colLabel}>Icon · Contrast</span>

        {(['xxl', 'xl', 'l', 'm', 's'] as const).flatMap(size => [
          <Avatar key={`up-${size}`} size={size} type="user" variant="picture"  src={PHOTO_USER} alt="User" />,
          <Avatar key={`un-${size}`} size={size} type="user" variant="letters"  color="neutral"  initials="AB" />,
          <Avatar key={`ui-${size}`} size={size} type="user" variant="icon"     color="neutral" />,
          <Avatar key={`uc-${size}`} size={size} type="user" variant="letters"  color="contrast" initials="AB" />,
          <Avatar key={`ud-${size}`} size={size} type="user" variant="icon"     color="contrast" />,
        ])}
      </div>

      {/* ── Organization ─────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Organization</h2>
      <div className={styles.variantGrid2}>

        <span className={styles.colLabel}>Picture</span>
        <span className={styles.colLabel}>Letters</span>

        {(['xxl', 'xl', 'l', 'm', 's'] as const).flatMap(size => [
          <Avatar key={`op-${size}`} size={size} type="org" variant="picture" src={PHOTO_ORG} alt="Org" />,
          <Avatar key={`ol-${size}`} size={size} type="org" variant="letters" initials="ST" />,
        ])}
      </div>

      {/* ── Group ────────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Group</h2>
      <div className={styles.groupRow}>
        {(['xxl', 'xl', 'l', 'm', 's'] as const).map(size => (
          <Avatar key={`gr-${size}`} size={size} type="group" variant="letters" initials="BO" />
        ))}
      </div>

      {/* ── Spec ─────────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Spec</h2>
      <table className={styles.specTable}>
        <tbody>
          <tr><td>s</td><td>20×20px · 14px font · 1 letter</td></tr>
          <tr><td>m</td><td>32×32px · 15px font</td></tr>
          <tr><td>l</td><td>40×40px · 16px font</td></tr>
          <tr><td>xl</td><td>56×56px · 20px Medium font</td></tr>
          <tr><td>xxl</td><td>96×96px · 32px Medium font</td></tr>
          <tr><td>User shape</td><td>circle (border-radius 50%)</td></tr>
          <tr><td>Org / Group shape</td><td>rounded square (border-radius 4px)</td></tr>
          <tr><td>User · Neutral bg</td><td>stone-300 (#ECEEF9)</td></tr>
          <tr><td>User · Contrast bg</td><td>stone-400 (#DEE0EB)</td></tr>
          <tr><td>Org bg</td><td>green-500 (#2C9C74)</td></tr>
          <tr><td>Group bg</td><td>tag-kepeel (#33ABA0)</td></tr>
          <tr><td>User text</td><td>color-text-primary</td></tr>
          <tr><td>Org / Group text</td><td>white (inverse)</td></tr>
        </tbody>
      </table>
    </div>
  )
}
