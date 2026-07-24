import { useEffect, useRef, useState } from 'react'
import { useBranding, BRANDING_THEMES } from '../../hooks/useBranding'
import { Button } from '../../components/Button/Button'
import { Toggle } from '../../components/Toggle/Toggle'
import { Checkbox } from '../../components/Checkbox/Checkbox'
import { SegmentControl } from '../../components/SegmentControl/SegmentControl'
import { condition } from '../../icons/condition'
import { illustrations } from '../../illustrations/illustrations'
import styles from './BrandingColors.module.css'

const checkSvg = condition.find(i => i.name === 'check')!.svg
const illoSvg = illustrations.find(i => i.name === 'cards-stack-pending')?.svg ?? ''

/* Accent ramp shown for the active scheme. -selected == -25, so the ramp is 25→900. */
const ACCENT_STEPS = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const

/* Semantic aliases the branding drives (accent) vs. status (never changes). */
const ACCENT_ALIASES: { label: string; token: string }[] = [
  { label: 'Brand · Active (-500)',  token: '--color-brand' },
  { label: 'Brand · Hover (-600)',   token: '--color-brand-hover' },
  { label: 'Brand · Pressed (-700)', token: '--color-brand-active' },
  { label: 'Brand subtle (-25)',     token: '--color-brand-subtle' },
  { label: 'Selection bg',           token: '--color-bg-selected' },
  { label: 'Focus ring',             token: '--color-border-focus' },
]
const STATUS_ALIASES: { label: string; token: string }[] = [
  { label: 'Success',  token: '--color-success' },
  { label: 'Error',    token: '--color-error' },
  { label: 'Warning',  token: '--color-warning' },
  { label: 'Info',     token: '--color-info' },
]

/* Read the swatch's rendered colour as #RRGGBB. `dep` forces a re-read when the
   active branding scheme changes (the token value behind it changes). */
function readHex(el: HTMLElement): string {
  const m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(el).backgroundColor)
  if (!m) return ''
  const [r, g, b] = m[1].split(',').slice(0, 3).map(s => Number(s.trim()))
  return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function Swatch({ token, dep }: { token: string; dep: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hex, setHex] = useState('')
  useEffect(() => {
    if (ref.current) setHex(readHex(ref.current))
  }, [dep, token])
  return (
    <div className={styles.modeCell}>
      <div ref={ref} className={styles.swatch} style={{ background: `var(${token})` }} />
      <span className={styles.hex}>{hex}</span>
    </div>
  )
}

/* A token row rendered inside both a light and a dark surface. */
function TokenRow({ label, token, dep }: { label: string; token: string; dep: string }) {
  return (
    <div className={styles.item}>
      <span className={styles.itemName}>{label}</span>
      <div className={styles.modeWrap} data-theme="light"><Swatch token={token} dep={dep} /></div>
      <div className={styles.modeWrap} data-theme="dark"><Swatch token={token} dep={dep} /></div>
    </div>
  )
}

export default function BrandingColorsPage() {
  const { branding, setBranding } = useBranding()
  const activeLabel = BRANDING_THEMES.find(t => t.key === branding)?.label ?? 'Green (default)'

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Branding colors</h1>
      <p className={styles.subtitle}>
        Switch the interface accent. Branding retargets the accent ramp only — status colours
        (success, error, warning, info) and toast / banner buttons never change.
      </p>

      {/* ── Scheme switcher ──────────────────────────────────── */}
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <h2 className={styles.blockTitle}>Color theme</h2>
          <p className={styles.blockSub}>Applied to the interface · currently <strong>{activeLabel}</strong></p>
        </div>
        <div className={styles.swatchRow} role="radiogroup" aria-label="Branding color theme">
          {BRANDING_THEMES.map(scheme => (
            <button
              key={scheme.key}
              type="button"
              role="radio"
              aria-checked={scheme.key === branding}
              aria-label={scheme.label}
              title={scheme.label}
              className={[styles.schemeSwatch, scheme.key === branding ? styles.schemeSwatchActive : ''].filter(Boolean).join(' ')}
              style={{ background: scheme.swatch }}
              onClick={() => setBranding(scheme.key)}
            >
              {scheme.key === branding && (
                <span className={styles.schemeCheck} dangerouslySetInnerHTML={{ __html: checkSvg }} />
              )}
            </button>
          ))}
        </div>
        <div className={styles.spec}>
          <span><span className={styles.specDot} style={{ background: 'var(--color-brand)' }} /> Active&nbsp;<code>-500</code></span>
          <span><span className={styles.specDot} style={{ background: 'var(--color-brand-hover)' }} /> Hover&nbsp;<code>-600</code></span>
          <span><span className={styles.specDot} style={{ background: 'var(--color-brand-active)' }} /> Pressed&nbsp;<code>-700</code></span>
        </div>
      </section>

      {/* ── Live preview ─────────────────────────────────────── */}
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <h2 className={styles.blockTitle}>Live preview</h2>
          <p className={styles.blockSub}>Real DS components — recolour instantly with the active scheme.</p>
        </div>
        <div className={styles.preview}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="link">Link</Button>
          <Toggle defaultChecked label="Toggle" />
          <Checkbox defaultChecked label="Checkbox" />
          <SegmentControl
            items={[{ id: 'a', label: 'One' }, { id: 'b', label: 'Two' }, { id: 'c', label: 'Three' }]}
            defaultValue="a"
          />
          <span className={styles.illo} dangerouslySetInnerHTML={{ __html: illoSvg }} />
        </div>
      </section>

      {/* ── Token tables ─────────────────────────────────────── */}
      <section className={styles.block}>
        <div className={styles.blockHead}>
          <h2 className={styles.blockTitle}>Accent ramp — {activeLabel}</h2>
          <p className={styles.blockSub}>Light &amp; dark · reflects the active scheme.</p>
        </div>
        <div className={styles.table}>
          <div className={styles.headerRow}>
            <span />
            <span className={styles.modeHead}>Light</span>
            <span className={styles.modeHead}>Dark</span>
          </div>
          <div className={styles.group}>
            <div className={styles.groupLabel}>Semantic aliases (themeable)</div>
            {ACCENT_ALIASES.map(a => <TokenRow key={a.token} label={a.label} token={a.token} dep={branding} />)}
          </div>
          <div className={styles.group}>
            <div className={styles.groupLabel}>Accent ramp</div>
            {ACCENT_STEPS.map(s => <TokenRow key={s} label={`accent-${s}`} token={`--accent-${s}`} dep={branding} />)}
          </div>
          <div className={styles.group}>
            <div className={styles.groupLabel}>Status — unaffected by branding</div>
            {STATUS_ALIASES.map(a => <TokenRow key={a.token} label={a.label} token={a.token} dep={branding} />)}
          </div>
        </div>
      </section>
    </div>
  )
}
