/* SideNavUserItemPage — showcase for SideNavUserItem component
   Figma nodes 34960-1126 (Active) · 34960-1128 (Hover) · 34960-1127 (Opened)
   Droplist: 3194-1280 · Language sublist: 3194-1374 */

import { SideNavUserItem } from '../../components/SideNavUserItem/SideNavUserItem'
import { condition } from '../../icons/condition'
import styles from './SideNavUserItemPage.module.css'

const shieldCheckSvg       = condition.find(i => i.name === 'shield-check')!.svg
const shieldExclamationSvg = condition.find(i => i.name === 'shield-exclamation')!.svg

const DEMO_PROPS = {
  src:   'https://i.pravatar.cc/64?img=47',
  name:  'Olivia Thompson',
  email: 'thompsonolivia@gmail.com',
}

export default function SideNavUserItemPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Side Nav — User Item</h1>
      <p className={styles.subtitle}>
        Figma nodes 34960-1126 · 34960-1128 · 34960-1127 · 3194-1280 · 3194-1374
      </p>

      {/* ── Live demo ──────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Live demo</h2>
      <p className={styles.description}>
        Click to open the menu. Hover Language to reveal the sublist.
      </p>
      <div className={styles.demoWrap}>
        <SideNavUserItem
          {...DEMO_PROPS}
          twoFaEnabled
          onProfileClick={() => console.log('My profile')}
          onConnectionsClick={() => console.log('Connections')}
          onLogoutClick={() => console.log('Log out')}
        />
      </div>

      {/* ── States ─────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>States</h2>
      <div className={styles.statesRow}>
        <div className={styles.stateGroup}>
          <div className={styles.stateLabel}>Default</div>
          <SideNavUserItem {...DEMO_PROPS} />
        </div>
        <div className={[styles.stateGroup, styles.stateGroupOpened].join(' ')}>
          <div className={styles.stateLabel}>Opened</div>
          <SideNavUserItem {...DEMO_PROPS} twoFaEnabled defaultOpen />
        </div>
      </div>

      {/* ── 2FA Banner states ───────────────────────────────── */}
      <h2 className={styles.sectionTitle}>2FA Banner</h2>
      <p className={styles.description}>
        Figma nodes 3196-1375 (not protected) · 3196-1383 (protected)
      </p>
      <div className={styles.bannerStates}>
        <div className={styles.bannerStateGroup}>
          <div className={styles.stateLabel}>Not protected</div>
          <div className={[styles.bannerWrap, styles.bannerWrapWarning].join(' ')}>
            <span
              className={[styles.bannerIcon, styles.bannerIconWarning].join(' ')}
              dangerouslySetInnerHTML={{ __html: shieldExclamationSvg }}
            />
            <span className={styles.bannerLabel}>Account not 2FA-protected</span>
            <button type="button" className={styles.bannerProtectBtn}>Protect</button>
          </div>
        </div>
        <div className={styles.bannerStateGroup}>
          <div className={styles.stateLabel}>Protected</div>
          <div className={styles.bannerWrap}>
            <span
              className={[styles.bannerIcon, styles.bannerIconGreen].join(' ')}
              dangerouslySetInnerHTML={{ __html: shieldCheckSvg }}
            />
            <span className={styles.bannerLabel}>Account 2FA-protected</span>
          </div>
        </div>
      </div>

      {/* ── Initials fallback ───────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Initials fallback</h2>
      <p className={styles.description}>Shown when no photo is provided.</p>
      <div className={styles.demoWrap}>
        <SideNavUserItem
          name="Jordan Parker"
          email="jordan.parker@example.com"
        />
      </div>

      {/* ── 2FA disabled variant ────────────────────────────── */}
      <h2 className={styles.sectionTitle}>2FA disabled</h2>
      <div className={styles.demoWrap}>
        <SideNavUserItem
          {...DEMO_PROPS}
          twoFaEnabled={false}
          defaultOpen
        />
      </div>


    </div>
  )
}
