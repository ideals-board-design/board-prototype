/* HubPage — Ideals Board overview landing
   Figma node 35372-4538 */

import { HubHeader } from './HubHeader'
import styles from './HubPage.module.css'

/* ── Features registry ─────────────────────────────────────
   Add a new entry here whenever a new feature page is built. */
const FEATURES: { id: string; name: string; designer: string; href: string }[] = [
  {
    id: 'tasks',
    name: 'Tasks',
    designer: 'Jaroslav Getman',
    href: '/tasks.html',
  },
]

export default function HubPage() {
  return (
    <div className={styles.shell}>
      <HubHeader />

      <main className={styles.main}>
        <h1 className={styles.sectionTitle}>Prototypes</h1>
        <div className={styles.list}>
          {FEATURES.map(f => (
            <div key={f.id} className={styles.row}>
              <span className={styles.featureName}>{f.name}</span>
              <span className={styles.designerName}>{f.designer}</span>
              <a href={f.href} className={styles.protoLink}>Open prototype</a>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
