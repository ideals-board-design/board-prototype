import styles from './Icons.module.css'

import { arrows }        from '../../icons/arrows'
import { files }         from '../../icons/files'
import { users }         from '../../icons/users'
import { condition }     from '../../icons/condition'
import { dateTime }      from '../../icons/dateTime'
import { media }         from '../../icons/media'
import { editor }        from '../../icons/editor'
import { communication } from '../../icons/communication'
import { location }      from '../../icons/location'
import { services }      from '../../icons/services'
import { actions }       from '../../icons/actions'
import { functional }    from '../../icons/functional'
import { fileFormat }    from '../../icons/fileFormat'
import { navigation }    from '../../icons/navigation'

// ─────────────────────────────────────────────────────────────────────────────

type IconDef = { name: string; svg: string }

const uiGroups: { label: string; icons: IconDef[] }[] = [
  { label: 'Arrows',        icons: arrows },
  { label: 'Actions',       icons: actions },
  { label: 'Files',         icons: files },
  { label: 'Users',         icons: users },
  { label: 'Condition',     icons: condition },
  { label: 'Communication', icons: communication },
  { label: 'Editor',        icons: editor },
  { label: 'Date & Time',   icons: dateTime },
  { label: 'Media & Devices', icons: media },
  { label: 'Location',      icons: location },
  { label: 'Functional',    icons: functional },
  { label: 'Services',      icons: services },
]

// Navigation: pair Default + Hover-Selected per item
const navItems = [
  'dashboard', 'meetings', 'documents', 'directory',
  'help', 'search', 'tasks', 'reports', 'settings',
]
type NavPair = { item: string; defaultSvg: string; activeSvg: string }
const navPairs: NavPair[] = navItems.map(item => ({
  item,
  defaultSvg: navigation.find(i => i.name === `${item}-default`)?.svg ?? '',
  activeSvg:  navigation.find(i => i.name === `${item}-hover-selected`)?.svg ?? '',
}))

// ─────────────────────────────────────────────────────────────────────────────

function IconCell({ name, svg, size = 20 }: IconDef & { size?: number }) {
  return (
    <div className={styles.iconCell} title={name} style={{ '--icon-size': `${size}px` } as React.CSSProperties}>
      <div
        className={styles.iconWrap}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <span className={styles.iconName}>{name}</span>
    </div>
  )
}

export default function IconsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Icons</h1>
      <p className={styles.subtitle}>Figma · node 22626:99445 · 20×20px</p>

      {/* ── UI Icons ───────────────────────────────────────────────────────── */}
      {uiGroups.map(group => (
        <section key={group.label} className={styles.group}>
          <h2 className={styles.groupTitle}>{group.label}</h2>
          <div className={styles.grid}>
            {group.icons.map(icon => (
              <IconCell key={icon.name} {...icon} />
            ))}
          </div>
        </section>
      ))}

      {/* ── File Format ────────────────────────────────────────────────────── */}
      <section className={styles.group}>
        <h2 className={styles.groupTitle}>File Format</h2>
        <p className={styles.groupNote}>Document & file type icons · 32×32px · multi-color</p>
        <div className={styles.grid}>
          {fileFormat.map(icon => (
            <IconCell key={icon.name} {...icon} size={32} />
          ))}
        </div>
      </section>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <section className={styles.group}>
        <h2 className={styles.groupTitle}>Navigation</h2>
        <p className={styles.groupNote}>Used exclusively in the side navigation panel · 24×24px</p>
        <div className={styles.navGrid}>
          <div className={styles.navHeader}>
            <span>Item</span>
            <span>Default</span>
            <span>Active</span>
          </div>
          {navPairs.map(pair => (
            <div key={pair.item} className={styles.navRow}>
              <span className={styles.navLabel}>{pair.item}</span>
              <div
                className={styles.navIcon}
                dangerouslySetInnerHTML={{ __html: pair.defaultSvg }}
              />
              <div
                className={`${styles.navIcon} ${styles.navIconActive}`}
                dangerouslySetInnerHTML={{ __html: pair.activeSvg }}
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
