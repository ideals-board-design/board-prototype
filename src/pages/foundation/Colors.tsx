import { useEffect, useRef, useState } from 'react'
import styles from './Colors.module.css'

/* Every swatch is driven by a CSS custom property — no colour is hard-coded
   here. The hex shown is read back from the rendered swatch, so it always
   reflects the actual token value (light + dark) defined in tokens.css. */

type Token = { label: string; token: string }
type Group = { label: string; tokens: Token[] }

const ramp = (name: string, steps: number[]): Token[] =>
  steps.map(s => ({ label: `${name}-${s}`, token: `--${name}-${s}` }))

const keyed = (prefix: string, keys: string[]): Token[] =>
  keys.map(k => ({ label: `${prefix}-${k}`, token: `--${prefix}-${k}` }))

const groups: Group[] = [
  {
    label: 'Utility tokens',
    tokens: [
      { label: 'Divider',                 token: '--color-border' },
      { label: 'Primary text',            token: '--color-text-primary' },
      { label: 'Secondary text',          token: '--color-text-secondary' },
      { label: 'Inverse text',            token: '--color-text-inverse' },
      { label: 'On inverse text',         token: '--color-text-on-inverse' },
      { label: 'Primary icon',            token: '--color-icon-primary' },
      { label: 'Secondary icon',          token: '--color-icon-secondary' },
      { label: 'Inverse icon',            token: '--color-icon-inverse' },
      { label: 'On inverse icon',         token: '--color-icon-on-inverse' },
      { label: 'Hover background',        token: '--color-bg-hover' },
      { label: 'Hover background (tr)',   token: '--color-bg-hover-fill' },
      { label: 'Pressed background (tr)', token: '--color-bg-hover-fill-strong' },
      { label: 'Selected background',     token: '--color-bg-selected' },
    ],
  },
  { label: 'Stone (Neutral)',    tokens: ramp('stone', [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]) },
  { label: 'Accent / Green',     tokens: ramp('green', [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) },
  { label: 'Error / Red',        tokens: ramp('red', [50, 100, 200, 500, 600, 700]) },
  { label: 'Warning / Orange',   tokens: ramp('orange', [50, 500, 600, 700]) },
  { label: 'Highlight / Yellow', tokens: ramp('yellow', [50, 500, 600, 700]) },
  { label: 'Info / Blue',        tokens: ramp('blue', [25, 50, 500, 600, 700, 800]) },
  { label: 'Support / Tags',     tokens: keyed('tag', ['kepeel', 'green', 'red', 'orange', 'navyblue', 'blue', 'beetroot']) },
  { label: 'Support / Badges',   tokens: keyed('badge', ['blue', 'green', 'berry', 'yellow', 'purple', 'olive']) },
  {
    label: 'Transparent',
    tokens: [
      { label: 'stone-60',  token: '--transparent-stone-1000-60' },
      { label: 'blue-10',   token: '--transparent-blue-800-10' },
      { label: 'blue-20',   token: '--transparent-blue-800-20' },
      { label: 'green-10',  token: '--transparent-green-700-10' },
      { label: 'green-20',  token: '--transparent-green-700-20' },
      { label: 'orange-10', token: '--transparent-orange-700-10' },
      { label: 'orange-20', token: '--transparent-orange-700-20' },
      { label: 'red-10',    token: '--transparent-red-700-10' },
      { label: 'red-20',    token: '--transparent-red-700-20' },
    ],
  },
  {
    label: 'Special',
    tokens: [
      ...ramp('illustration-green', [50, 100, 200, 300, 400, 500]).map(t => ({ ...t, label: `Illustration-${t.label}` })),
      { label: 'Illustration-stone-0',   token: '--illustration-stone-0' },
      { label: 'Illustration-stone-200', token: '--illustration-stone-200' },
      { label: 'Illustration-stone-400', token: '--illustration-stone-400' },
      { label: 'Illustration-stone-500', token: '--illustration-stone-500' },
      { label: 'Illustration-stone-600', token: '--illustration-stone-600' },
    ],
  },
]

/* Checkerboard backing so semi-transparent swatches read as transparent.
   The colour layer sits on top; the checker shows through where alpha < 1. */
const CHECKER =
  'linear-gradient(45deg,#DEE0EB 25%,transparent 25%) 0 0/12px 12px,' +
  'linear-gradient(-45deg,#DEE0EB 25%,transparent 25%) 0 6px/12px 12px,' +
  'linear-gradient(45deg,transparent 75%,#DEE0EB 75%) 6px -6px/12px 12px,' +
  'linear-gradient(-45deg,transparent 75%,#DEE0EB 75%) -6px 0/12px 12px,' +
  '#FFFFFF'

/* Read the swatch's rendered colour and format it as #RRGGBB (· NN% if alpha < 1). */
function readHex(el: HTMLElement): string {
  const m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(el).backgroundColor)
  if (!m) return ''
  const parts = m[1].split(',').map(s => s.trim())
  const [r, g, b] = parts.slice(0, 3).map(Number)
  const a = parts[3] !== undefined ? Number(parts[3]) : 1
  const hex = '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase()
  return a < 1 ? `${hex} · ${Math.round(a * 100)}%` : hex
}

function Swatch({ token }: { token: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hex, setHex] = useState('')
  useEffect(() => {
    if (ref.current) setHex(readHex(ref.current))
  }, [])
  return (
    <>
      <div className={styles.swatchWrap} style={{ background: CHECKER }}>
        <div ref={ref} className={styles.swatch} style={{ background: `var(${token})` }} />
      </div>
      <span className={styles.hex}>{hex}</span>
    </>
  )
}

export default function ColorsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Colors</h1>
      <p className={styles.subtitle}>Figma variables · light &amp; dark modes · driven by primitives</p>

      <div className={styles.table}>
        <div className={styles.headerRow}>
          <span />
          <span className={styles.modeHead}>Light</span>
          <span className={styles.modeHead}>Dark</span>
        </div>

        {groups.map(group => (
          <div key={group.label} className={styles.group}>
            <div className={styles.groupLabel}>{group.label}</div>
            {group.tokens.map(t => (
              <div key={t.token} className={styles.item}>
                <span className={styles.itemName}>{t.label}</span>
                <div className={styles.modeCell} data-theme="light"><Swatch token={t.token} /></div>
                <div className={styles.modeCell} data-theme="dark"><Swatch token={t.token} /></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
