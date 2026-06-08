import styles from './Colors.module.css'

const stone = [
  { name: 'stone-0',    value: '#FFFFFF' },
  { name: 'stone-100',  value: '#FBFBFB' },
  { name: 'stone-200',  value: '#F7F7F7' },
  { name: 'stone-300',  value: '#ECEEF9' },
  { name: 'stone-400',  value: '#DEE0EB' },
  { name: 'stone-500',  value: '#BBBDC8' },
  { name: 'stone-600',  value: '#9C9EA8' },
  { name: 'stone-700',  value: '#73757F' },
  { name: 'stone-800',  value: '#5F616A' },
  { name: 'stone-900',  value: '#40424B' },
  { name: 'stone-1000', value: '#1F2129' },
]
const green = [
  { name: 'green-25',  value: '#EBF8EF' },
  { name: 'green-50',  value: '#CBF1DA' },
  { name: 'green-100', value: '#8CEAA7' },
  { name: 'green-200', value: '#7FDEA5' },
  { name: 'green-300', value: '#57D188' },
  { name: 'green-400', value: '#3FB67D' },
  { name: 'green-500', value: '#2C9C74' },
  { name: 'green-600', value: '#1C8269' },
  { name: 'green-700', value: '#12695C' },
  { name: 'green-800', value: '#084D4B' },
  { name: 'green-900', value: '#022E34' },
]
const red = [
  { name: 'red-50',  value: '#FAD9D6' },
  { name: 'red-100', value: '#FACCC8' },
  { name: 'red-200', value: '#F6BCB5' },
  { name: 'red-500', value: '#E95B4A' },
  { name: 'red-600', value: '#DB2F1B' },
  { name: 'red-700', value: '#AF2615' },
]
const orange = [
  { name: 'orange-50',  value: '#FFEBD5' },
  { name: 'orange-500', value: '#D18A00' },
  { name: 'orange-600', value: '#B87900' },
  { name: 'orange-700', value: '#9E6800' },
]
const yellow = [
  { name: 'yellow-50',  value: '#FFF4B4' },
  { name: 'yellow-500', value: '#FFE448' },
  { name: 'yellow-600', value: '#FFDA07' },
  { name: 'yellow-700', value: '#F1C400' },
]
const blue = [
  { name: 'blue-50',  value: '#E6F2FD' },
  { name: 'blue-500', value: '#5DA3EF' },
  { name: 'blue-600', value: '#2977CC' },
  { name: 'blue-700', value: '#2468B2' },
]
const tags = [
  { name: 'tag-kepeel',   value: '#33ABA0' },
  { name: 'tag-green',    value: '#62BE7C' },
  { name: 'tag-red',      value: '#F27573' },
  { name: 'tag-orange',   value: '#F6833D' },
  { name: 'tag-navyblue', value: '#6D81DC' },
  { name: 'tag-blue',     value: '#5DA3EF' },
  { name: 'tag-beetroot', value: '#A14179' },
]
const badges = [
  { name: 'badge-blue',   value: '#CFE7F4' },
  { name: 'badge-green',  value: '#C3F0EA' },
  { name: 'badge-berry',  value: '#FBDCF7' },
  { name: 'badge-yellow', value: '#FCEEC5' },
  { name: 'badge-purple', value: '#DBE0F5' },
  { name: 'badge-olive',  value: '#E1E9C8' },
]
const semantic = [
  { name: 'Divider',        token: '--color-border',         value: '#DEE0EB' },
  { name: 'Primary text',   token: '--color-text-primary',   value: '#1F2129' },
  { name: 'Secondary text', token: '--color-text-secondary', value: '#5F616A' },
  { name: 'Inverse text',   token: '--color-text-inverse',   value: '#FFFFFF' },
  { name: 'Hover bg',       token: '--color-bg-hover',       value: '#ECEEF9' },
  { name: 'Selected bg',    token: '--color-bg-selected',    value: '#EBF8EF' },
]

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className={styles.swatch}>
      <div
        className={styles.swatchColor}
        style={{ background: value, border: value === '#FFFFFF' ? '1px solid #DEE0EB' : 'none' }}
      />
      <div className={styles.swatchLabel}>{name}</div>
      <div className={styles.swatchValue}>{value}</div>
    </div>
  )
}

function Row({ label, colors }: { label: string; colors: { name: string; value: string }[] }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{label}</div>
      <div className={styles.swatches}>
        {colors.map(c => <Swatch key={c.name} {...c} />)}
      </div>
    </div>
  )
}

function SemanticRow() {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>Utility tokens</div>
      <div className={styles.semanticList}>
        {semantic.map(item => (
          <div key={item.name} className={styles.semanticItem}>
            <div
              className={styles.semanticColor}
              style={{ background: item.value, border: item.value === '#FFFFFF' ? '1px solid #DEE0EB' : 'none' }}
            />
            <span className={styles.semanticName}>{item.name}</span>
            <code className={styles.semanticToken}>{item.token}</code>
            <span className={styles.semanticValue}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ColorsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Colors</h1>
      <p className={styles.subtitle}>Figma · node 24446:44118</p>
      <SemanticRow />
      <Row label="Stone (Neutral)" colors={stone} />
      <Row label="Accent / Green" colors={green} />
      <Row label="Error / Red" colors={red} />
      <Row label="Warning / Orange" colors={orange} />
      <Row label="Highlight / Yellow" colors={yellow} />
      <Row label="Info / Blue" colors={blue} />
      <Row label="Support / Tags" colors={tags} />
      <Row label="Support / Badges" colors={badges} />
    </div>
  )
}
