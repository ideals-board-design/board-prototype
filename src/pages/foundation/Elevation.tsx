import styles from './Elevation.module.css'

interface ShadowToken {
  name: string
  cssValue: string
  offsetY: string
  blur: string
  color: string
  opacity: string
  usage: string
}

const tokens: ShadowToken[] = [
  {
    name: '--shadow-100',
    cssValue: '0px 4px 12px rgba(31, 33, 41, 0.16)',
    offsetY: '4px',
    blur: '12px',
    color: '#1F2129',
    opacity: '16%',
    usage: 'Dropdowns, popovers, tooltips',
  },
  {
    name: '--shadow-200',
    cssValue: '0px 8px 32px rgba(0, 0, 0, 0.16)',
    offsetY: '8px',
    blur: '32px',
    color: '#000000',
    opacity: '16%',
    usage: 'Modals, drawers, dialogs',
  },
]

export default function ElevationPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Elevation</h1>
      <p className={styles.subtitle}>Figma · Shadow-100 · Shadow-200</p>

      {/* ── Visual previews ───────────────────────────────────────────── */}
      <div className={styles.previews}>
        {tokens.map(t => (
          <div key={t.name} className={styles.previewCard}>
            <div className={styles.previewStage}>
              <div
                className={styles.previewSurface}
                style={{ boxShadow: t.cssValue }}
              />
            </div>
            <div className={styles.previewLabel}>{t.name}</div>
            <div className={styles.previewUsage}>{t.usage}</div>
          </div>
        ))}
      </div>

      {/* ── Reference table ───────────────────────────────────────────── */}
      <div className={styles.table}>
        <div className={styles.header}>
          <span>Token</span>
          <span>Y offset</span>
          <span>Blur</span>
          <span>Color</span>
          <span>Opacity</span>
          <span>Usage</span>
        </div>
        {tokens.map(t => (
          <div key={t.name} className={styles.row}>
            <span className={styles.tokenName}>{t.name}</span>
            <span className={styles.mono}>{t.offsetY}</span>
            <span className={styles.mono}>{t.blur}</span>
            <span className={styles.colorCell}>
              <span
                className={styles.colorDot}
                style={{ background: t.color }}
              />
              <span className={styles.mono}>{t.color}</span>
            </span>
            <span className={styles.mono}>{t.opacity}</span>
            <span className={styles.usageText}>{t.usage}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
