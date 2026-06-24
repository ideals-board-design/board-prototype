import styles from './Illustrations.module.css'
import { illustrations } from '../../illustrations/illustrations'

// ─────────────────────────────────────────────────────────────────────────────

function IllustrationCell({ name, svg }: { name: string; svg: string }) {
  return (
    <div className={styles.cell} title={name}>
      <div
        className={styles.preview}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <span className={styles.name}>{name}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function IllustrationsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Illustrations</h1>
      <p className={styles.subtitle}>176×120px · multi-color · 23 illustrations</p>

      <div className={styles.grid}>
        {illustrations.map(ill => (
          <IllustrationCell key={ill.name} name={ill.name} svg={ill.svg} />
        ))}
      </div>
    </div>
  )
}
