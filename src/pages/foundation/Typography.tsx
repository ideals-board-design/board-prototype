import styles from './Typography.module.css'

const PREVIEW_TEXT = 'The report is about Key Achievements and Customer Satisfaction.'

type TypeStyle = {
  name: string
  size: number
  lh: string
  weight: string
  ls: string
  link?: true
}

const largeGroup: TypeStyle[] = [
  { name: 'Xx Large Default', size: 40, lh: '48px', weight: 'var(--font-weight-medium)',  ls: 'var(--letter-spacing-heading)' },
  { name: 'X Large Title',    size: 32, lh: '40px', weight: 'var(--font-weight-medium)',  ls: 'var(--letter-spacing-heading)' },
  { name: 'X Large Default',  size: 20, lh: '24px', weight: 'var(--font-weight-medium)',  ls: 'var(--letter-spacing-heading)' },
  { name: 'Large Default',    size: 16, lh: '20px', weight: 'var(--font-weight-regular)', ls: 'var(--letter-spacing-body)' },
  { name: 'Large Bold',       size: 16, lh: '20px', weight: 'var(--font-weight-medium)',  ls: 'var(--letter-spacing-body)' },
  { name: 'Large Link',       size: 16, lh: '20px', weight: 'var(--font-weight-regular)', ls: 'var(--letter-spacing-body)', link: true },
]

const mediumGroup: TypeStyle[] = [
  { name: 'Medium Default', size: 15, lh: '20px', weight: 'var(--font-weight-regular)', ls: 'var(--letter-spacing-body)' },
  { name: 'Medium Bold',    size: 15, lh: '20px', weight: 'var(--font-weight-medium)',  ls: 'var(--letter-spacing-body)' },
  { name: 'Medium Link',    size: 15, lh: '20px', weight: 'var(--font-weight-regular)', ls: 'var(--letter-spacing-body)', link: true },
]

const smallGroup: TypeStyle[] = [
  { name: 'Small Default',   size: 14, lh: '20px', weight: 'var(--font-weight-regular)', ls: 'var(--letter-spacing-body)' },
  { name: 'Small Bold',      size: 14, lh: '20px', weight: 'var(--font-weight-medium)',  ls: 'var(--letter-spacing-body)' },
  { name: 'Small Link',      size: 14, lh: '20px', weight: 'var(--font-weight-regular)', ls: 'var(--letter-spacing-body)', link: true },
  { name: 'X Small Default', size: 12, lh: '16px', weight: 'var(--font-weight-regular)', ls: 'var(--letter-spacing-body)' },
]

function TypeRow({ name, size, lh, weight, ls, link }: TypeStyle) {
  const lsDisplay = ls === 'var(--letter-spacing-heading)' ? '0%'
    : ls === 'var(--letter-spacing-upper)' ? '4%'
    : '0%'

  return (
    <div className={styles.row}>
      <div className={styles.preview}>
        <span style={{
          fontSize: `${size}px`,
          lineHeight: lh,
          fontWeight: weight,
          letterSpacing: ls,
          textDecoration: link ? 'underline' : 'none',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family)',
        }}>
          {PREVIEW_TEXT}
        </span>
      </div>
      <div className={styles.name}>{name}</div>
      <div className={styles.family}>Inter</div>
      <div className={styles.weight}>{weight === 'var(--font-weight-medium)' ? 'Medium' : 'Regular'}</div>
      <div className={styles.size}>{size}</div>
      <div className={styles.lh}>{lh}</div>
      <div className={styles.ls}>{lsDisplay}</div>
    </div>
  )
}

function Group({ label, items }: { label: string; items: TypeStyle[] }) {
  return (
    <div className={styles.group}>
      <h2 className={styles.groupTitle}>{label}</h2>
      <div className={styles.table}>
        <div className={styles.header}>
          <div className={styles.preview}>Preview</div>
          <div className={styles.name}>Name</div>
          <div className={styles.family}>Family</div>
          <div className={styles.weight}>Weight</div>
          <div className={styles.size}>Size</div>
          <div className={styles.lh}>LH</div>
          <div className={styles.ls}>LS</div>
        </div>
        {items.map(item => <TypeRow key={item.name} {...item} />)}
      </div>
    </div>
  )
}

export default function TypographyPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Typography</h1>
      <p className={styles.subtitle}>Figma · node 17657:100460 · Inter</p>
      <Group label="Large" items={largeGroup} />
      <Group label="Medium" items={mediumGroup} />
      <Group label="Small" items={smallGroup} />
    </div>
  )
}
