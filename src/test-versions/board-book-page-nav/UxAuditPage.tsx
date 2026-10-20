/* UxAuditPage — "UX audit" tab: Board UX audit of the three navigation
   variants through 5 lenses, with a UXS (0–100) per variant.

   Source: `.design/board-book-page-nav/ux-audit.json`. UXS is computed here as
   the mean lens score (1–5) scaled to 0–100. */

import { BadgeStatus } from '../../components/BadgeStatus/BadgeStatus'
import audit from '../../../.design/board-book-page-nav/ux-audit.json'
import study from '../../../.design/board-book-page-nav/usability-study.json'
import styles from './StudyPage.module.css'

type VariantId = 'v1' | 'v2' | 'v3'
const VARIANTS: VariantId[] = ['v1', 'v2', 'v3']
const variantName = (v: VariantId) => study.variants.find(x => x.id === v)!.name
type Lens = { id: string; name: string; question: string; scores: Record<VariantId, number>; evidence: Record<VariantId, string> }
const lenses = audit.lenses as Lens[]
const verdicts = audit.verdicts as Record<VariantId, { label: string; type: 'danger' | 'warning' | 'positive'; text: string }>

const uxs = Object.fromEntries(VARIANTS.map(v => [v,
  Math.round((lenses.reduce((sum, l) => sum + l.scores[v], 0) / lenses.length / 5) * 100),
])) as Record<VariantId, number>
const best = [...VARIANTS].sort((a, b) => uxs[b] - uxs[a])[0]

export default function UxAuditPage() {
  return (
    <article className={styles.article}>
      <p className={styles.eyebrow}>UX audit · Board Portal</p>
      <h1 className={styles.h1}>{audit.title}</h1>
      <p className={styles.meta}>{audit.method} · {audit.date}</p>
      <blockquote className={styles.quote}>{audit.note}</blockquote>
      <p className={styles.p}><strong>Intent.</strong> {audit.intent}</p>

      <h2 className={styles.h2}><span className={styles.num}>01</span>UX Score (UXS)</h2>
      <div className={styles.tiles}>
        {VARIANTS.map(v => (
          <div key={v} className={[styles.tile, v === best ? styles.tileBest : ''].filter(Boolean).join(' ')}>
            <span className={styles.tileLabel}>{variantName(v)}</span>
            <span className={styles.tileValue}>{uxs[v]}<span className={styles.tileUnit}> / 100 UXS</span></span>
            <div className={styles.scoreBar} aria-hidden="true"><div className={styles.scoreFill} style={{ width: `${uxs[v]}%` }} /></div>
            <BadgeStatus type={verdicts[v].type} label={verdicts[v].label} />
            <span className={styles.tileSub}>{verdicts[v].text}</span>
          </div>
        ))}
      </div>
      <p className={styles.muted}>UXS = mean of the 5 lens scores (1–5) × 20. {audit.scale}.</p>

      <h2 className={styles.h2}><span className={styles.num}>02</span>Lens scores</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Lens</th>{VARIANTS.map(v => <th key={v}>{variantName(v)}</th>)}</tr></thead>
          <tbody>
            {lenses.map(l => (
              <tr key={l.id}>
                <td><strong>{l.name}</strong><br /><span className={styles.muted}>{l.question}</span></td>
                {VARIANTS.map(v => (
                  <td key={v}><strong>{l.scores[v]} / 5</strong><br />{l.evidence[v]}</td>
                ))}
              </tr>
            ))}
            <tr className={styles.totalRow}>
              <td><strong>UXS</strong></td>
              {VARIANTS.map(v => <td key={v}><strong>{uxs[v]} / 100</strong></td>)}
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className={styles.h2}><span className={styles.num}>03</span>Ship-readiness risks</h2>
      <ul className={styles.list}>{audit.risks.map(r => <li key={r}>{r}</li>)}</ul>
    </article>
  )
}
