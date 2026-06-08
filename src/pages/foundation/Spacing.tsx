import styles from './Spacing.module.css'

// ─────────────────────────────────────────────────────────────────────────────

type SpaceToken = {
  name:       string
  px:         number
  rem:        string
  multiplier: string
  usage:      string
  group:      'small' | 'medium' | 'large'
}

const tokens: SpaceToken[] = [
  {
    name: '--space-0',  px: 0,  rem: '0rem',     multiplier: '0×',
    group: 'small',
    usage: 'No spacing — stacked or tightly aligned elements.',
  },
  {
    name: '--space-2',  px: 2,  rem: '0.125rem',  multiplier: '0.25×',
    group: 'small',
    usage: 'Micro-spacing; space compensation in small components where 4px is too large.',
  },
  {
    name: '--space-4',  px: 4,  rem: '0.25rem',   multiplier: '0.5×',
    group: 'small',
    usage: 'Gap between a 16px icon and small text; padding inside smaller buttons, label–input gap.',
  },
  {
    name: '--space-6',  px: 6,  rem: '0.375rem',  multiplier: '0.75×',
    group: 'small',
    usage: 'Alternative between sections when 4px feels too small but 8px too large.',
  },
  {
    name: '--space-8',  px: 8,  rem: '0.5rem',    multiplier: '1×',
    group: 'small',
    usage: 'Gap between a 20px icon and larger text; common button padding.',
  },
  {
    name: '--space-10', px: 10, rem: '0.625rem',  multiplier: '1.25×',
    group: 'medium',
    usage: 'Tighter sections; e.g. medium button top/bottom padding.',
  },
  {
    name: '--space-12', px: 12, rem: '0.75rem',   multiplier: '1.5×',
    group: 'medium',
    usage: 'Between elements in cards where 8px is too tight but 16px too large.',
  },
  {
    name: '--space-14', px: 14, rem: '0.875rem',  multiplier: '1.75×',
    group: 'medium',
    usage: 'Tighter sections; e.g. large button top/bottom padding.',
  },
  {
    name: '--space-16', px: 16, rem: '1rem',      multiplier: '2×',
    group: 'medium',
    usage: 'Separating text sections; between form elements like inputs with labels.',
  },
  {
    name: '--space-20', px: 20, rem: '1.25rem',   multiplier: '2.5×',
    group: 'medium',
    usage: 'Between a card title and description; between larger form elements.',
  },
  {
    name: '--space-24', px: 24, rem: '1.5rem',    multiplier: '3×',
    group: 'medium',
    usage: 'Spacing between sections within a modal and between sections in bigger organisms.',
  },
  {
    name: '--space-32', px: 32, rem: '2rem',      multiplier: '4×',
    group: 'large',
    usage: 'Between large sections of content on a page; grid or container outside paddings.',
  },
  {
    name: '--space-40', px: 40, rem: '2.5rem',    multiplier: '5×',
    group: 'large',
    usage: 'Used for major layout separations on the page.',
  },
  {
    name: '--space-48', px: 48, rem: '3rem',      multiplier: '6×',
    group: 'large',
    usage: 'Large gaps between sections on dashboard-style layouts or between cards in a grid.',
  },
]

// Groups metadata
const groups = [
  { id: 'small',  label: 'Small',  range: '0px → 8px',  desc: 'Use for small and compact pieces of UI: icon–text gaps, badge padding, button groups, table cells.' },
  { id: 'medium', label: 'Medium', range: '10px → 24px', desc: 'Use for larger, less dense UI: container padding, avatar–content spacing, vertical gaps between card elements.' },
  { id: 'large',  label: 'Large',  range: '32px → 48px', desc: 'Use for layout elements: spacing between page sections, grid gutters, and outer container paddings.' },
]

// ─────────────────────────────────────────────────────────────────────────────

export default function SpacingPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Spacing</h1>
      <p className={styles.subtitle}>Base unit: 8px · 14 tokens · Figma nodes 19825:53940, 19824:53035</p>

      {/* ── Visual scale ──────────────────────────────────────────────────── */}
      <section className={styles.scaleSection}>
        <div className={styles.scaleBars}>
          {tokens.filter(t => t.px > 0).map(t => (
            <div key={t.name} className={`${styles.scaleItem} ${styles[t.group]}`}>
              <div
                className={styles.scaleBar}
                style={{ width: `${t.px}px`, height: `${t.px}px` }}
              />
              <span className={styles.scaleLabel}>{t.px}</span>
            </div>
          ))}
        </div>
        <div className={styles.scaleGroups}>
          {groups.map(g => (
            <span key={g.id} className={`${styles.scaleGroupLabel} ${styles[g.id]}`}>
              {g.label} · {g.range}
            </span>
          ))}
        </div>
      </section>

      {/* ── Group descriptions ─────────────────────────────────────────────── */}
      <div className={styles.groupCards}>
        {groups.map(g => (
          <div key={g.id} className={styles.groupCard}>
            <span className={styles.groupCardLabel}>{g.label} · {g.range}</span>
            <p className={styles.groupCardDesc}>{g.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Reference table ───────────────────────────────────────────────── */}
      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span>Token</span>
          <span>Visual</span>
          <span>px</span>
          <span>rem</span>
          <span>×</span>
          <span>Usage</span>
        </div>
        {tokens.map(t => (
          <div
            key={t.name}
            className={styles.tableRow}
          >
            <span className={styles.tokenName}>{t.name}</span>
            <div className={styles.barCell}>
              {t.px > 0 && (
                <div
                  className={`${styles.bar} ${styles[t.group]}`}
                  style={{ width: `${t.px}px` }}
                />
              )}
            </div>
            <span className={styles.mono}>{t.px}px</span>
            <span className={styles.mono}>{t.rem}</span>
            <span className={styles.mono}>{t.multiplier}</span>
            <span className={styles.usageText}>{t.usage}</span>
          </div>
        ))}
      </section>
    </div>
  )
}
