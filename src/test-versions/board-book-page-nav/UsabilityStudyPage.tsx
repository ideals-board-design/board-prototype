/* UsabilityStudyPage — "Usability study" tab: synthetic-persona usability study
   (board-usability-study method) comparing the three navigation variants.

   Single source of truth: `.design/board-book-page-nav/usability-study.json`
   (the PPTX report is generated from the same file). All metrics below are
   computed here from the simulated task records — nothing is hand-typed. */

import { Fragment } from 'react'
import { BadgeStatus } from '../../components/BadgeStatus/BadgeStatus'
import study from '../../../.design/board-book-page-nav/usability-study.json'
import styles from './StudyPage.module.css'

type VariantId = 'v1' | 'v2' | 'v3'
type Outcome = 'S' | 'P' | 'F'
const VARIANTS: VariantId[] = ['v1', 'v2', 'v3']
const SCORE: Record<Outcome, number> = { S: 1, P: 0.5, F: 0 }
const OUTCOME_LABEL: Record<Outcome, string> = { S: '✔ Success', P: '⚠ Partial', F: '✗ Failure' }
const OUTCOME_BADGE: Record<Outcome, 'positive' | 'warning' | 'danger'> = { S: 'positive', P: 'warning', F: 'danger' }
const TIER_BADGE: Record<string, 'danger' | 'warning' | 'neutral' | 'disable'> = { Critical: 'danger', High: 'warning', Medium: 'neutral', Low: 'disable' }
const HEUR_BADGE: Record<string, 'danger' | 'warning' | 'positive'> = { VIOLATED: 'danger', PARTIAL: 'warning', PASS: 'positive' }

type Task = {
  story: string; scenario: string; behaviour: string; friction: string
  seq: Record<VariantId, number>; outcome: Record<VariantId, Outcome>
}
const sims = study.simulations as Record<string, Task[]>
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)
const fmt = (n: number) => n.toFixed(1)
const pct = (n: number) => `${Math.round(n * 100)}%`
const variantName = (v: VariantId) => study.variants.find(x => x.id === v)!.name

/* ── Metrics ─────────────────────────────────────────────────────────────── */
const allTasks = Object.values(sims).flat()
const byVariant = Object.fromEntries(VARIANTS.map(v => [v, {
  seq: avg(allTasks.map(t => t.seq[v])),
  success: avg(allTasks.map(t => SCORE[t.outcome[v]])),
}])) as Record<VariantId, { seq: number; success: number }>
const byPersona = Object.fromEntries(study.personas.map(p => [p.id, Object.fromEntries(VARIANTS.map(v => [v, {
  seq: avg(sims[p.id].map(t => t.seq[v])),
  success: avg(sims[p.id].map(t => SCORE[t.outcome[v]])),
}]))])) as Record<string, Record<VariantId, { seq: number; success: number }>>
const storyIds = study.stories.map(s => s.id).filter(id => allTasks.some(t => t.story === id))
const byStory = Object.fromEntries(storyIds.map(id => [id, Object.fromEntries(VARIANTS.map(v => [v,
  avg(allTasks.filter(t => t.story === id).map(t => t.seq[v])),
]))])) as Record<string, Record<VariantId, number>>
const best = [...VARIANTS].sort((a, b) => byVariant[b].seq - byVariant[a].seq)[0]
const tierCount = (t: string) => study.issues.filter(i => i.tier === t).length
const violated = study.heuristics.filter(h => h.status === 'VIOLATED').length

/* ── Grouped bar chart: avg SEQ per story × variant (1–7) ────────────────── */
function SeqChart() {
  const SERIES_CLASS: Record<VariantId, string> = { v1: styles.series1, v2: styles.series2, v3: styles.series3 }
  return (
    <figure className={styles.chart} aria-label="Average SEQ per user story and variant (simulated)">
      <div className={styles.legend}>
        {VARIANTS.map(v => (
          <span key={v} className={styles.legendItem}>
            <span className={[styles.legendSwatch, SERIES_CLASS[v]].join(' ')} aria-hidden="true" />
            {variantName(v)}
          </span>
        ))}
      </div>
      <div className={styles.plot}>
        <div className={styles.yAxis} aria-hidden="true">
          {[7, 5, 3, 1].map(n => <span key={n}>{n}</span>)}
        </div>
        <div className={styles.groups}>
          {[7, 5, 3, 1].map(n => (
            <span key={n} className={styles.gridLine} style={{ bottom: `${((n - 1) / 6) * 100}%` }} aria-hidden="true" />
          ))}
          {storyIds.map(id => (
            <div key={id} className={styles.group}>
              <div className={styles.bars}>
                {VARIANTS.map(v => (
                  <span
                    key={v}
                    className={[styles.bar, SERIES_CLASS[v]].join(' ')}
                    style={{ height: `${((byStory[id][v] - 1) / 6) * 100}%` }}
                    tabIndex={0}
                    aria-label={`${id} · ${variantName(v)}: SEQ ${fmt(byStory[id][v])}`}
                  >
                    <span className={styles.tip} role="tooltip">{id} · {variantName(v)}<br /><strong>SEQ {fmt(byStory[id][v])}</strong></span>
                  </span>
                ))}
              </div>
              <span className={styles.groupLabel}>{id}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className={styles.caption}>Average SEQ (1–7) per user story, simulated. Exact values in the table below.</figcaption>
    </figure>
  )
}

export default function UsabilityStudyPage() {
  return (
    <article className={styles.article}>
      <p className={styles.eyebrow}>Usability evaluation report · Board Portal</p>
      <h1 className={styles.h1}>{study.title}</h1>
      <p className={styles.meta}>{study.method} · {study.date}</p>
      <blockquote className={styles.quote}><strong>Synthetic study.</strong> {study.disclaimer}</blockquote>
      <p className={styles.p}>{study.context}</p>

      {/* 01 Executive summary */}
      <h2 className={styles.h2}><span className={styles.num}>01</span>Executive summary</h2>
      <div className={styles.tiles}>
        {VARIANTS.map(v => (
          <div key={v} className={[styles.tile, v === best ? styles.tileBest : ''].filter(Boolean).join(' ')}>
            <span className={styles.tileLabel}>{variantName(v)}{v === best ? ' · best' : ''}</span>
            <span className={styles.tileValue}>{fmt(byVariant[v].seq)}<span className={styles.tileUnit}> / 7 SEQ</span></span>
            <span className={styles.tileSub}>Task success {pct(byVariant[v].success)}</span>
          </div>
        ))}
        <div className={styles.tile}>
          <span className={styles.tileLabel}>Issues</span>
          <span className={styles.tileValue}>{tierCount('Critical')}<span className={styles.tileUnit}> Critical</span></span>
          <span className={styles.tileSub}>{tierCount('High')} High · {violated} heuristics violated</span>
        </div>
      </div>
      <ul className={styles.findings}>
        <li><BadgeStatus type="danger" label="CRITICAL" /> {study.issues[0].issue} — {study.issues[0].impact}.</li>
        <li><BadgeStatus type="warning" label="HIGH" /> {study.issues[1].issue}.</li>
        <li><BadgeStatus type="warning" label="HIGH" /> {study.issues[2].issue}.</li>
        <li><BadgeStatus type="positive" label="STRENGTH" /> Version 3 keeps every navigation action in one always-visible bar where reading ends — best SEQ for 3 of 4 personas.</li>
        <li><BadgeStatus type="positive" label="STRENGTH" /> Version 2's open agenda makes jumping to an agenda item's documents effortless (US04).</li>
      </ul>

      {/* 02 Personas */}
      <h2 className={styles.h2}><span className={styles.num}>02</span>Personas</h2>
      <div className={styles.cards}>
        {study.personas.map(p => (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.avatar} aria-hidden="true">{p.id === 'DIR' ? 'RH' : p.id}</span>
              <span>
                <strong>{p.name}</strong><br />
                <span className={styles.muted}>{p.role} · {p.proficiency}</span>
              </span>
            </div>
            <dl className={styles.dl}>
              <dt>SEQ V1 / V2 / V3</dt><dd>{VARIANTS.map(v => fmt(byPersona[p.id][v].seq)).join(' / ')}</dd>
              <dt>Success V1 / V2 / V3</dt><dd>{VARIANTS.map(v => pct(byPersona[p.id][v].success)).join(' / ')}</dd>
              <dt>Goal</dt><dd>{p.goal}</dd>
              <dt>Mental model</dt><dd>{p.mentalModel}</dd>
              <dt>Risk behaviour</dt><dd>{p.risk}</dd>
              <dt>Emotional profile</dt><dd>{p.emotion}</dd>
            </dl>
          </div>
        ))}
      </div>

      {/* 03 Variants, goals, stories */}
      <h2 className={styles.h2}><span className={styles.num}>03</span>Variants, research goals and user stories</h2>
      <ul className={styles.list}>
        {study.variants.map(v => <li key={v.id}><strong>{v.name}:</strong> {v.summary}</li>)}
      </ul>
      <div className={styles.twoCol}>
        <ul className={styles.list}>{study.goals.map(g => <li key={g.id}><strong>{g.id}</strong> {g.text}</li>)}</ul>
        <ul className={styles.list}>{study.stories.map(s => <li key={s.id}><strong>{s.id}</strong> {s.text} <span className={styles.muted}>({s.goals.join(', ')})</span></li>)}</ul>
      </div>

      {/* 04 Task simulation */}
      <h2 className={styles.h2}><span className={styles.num}>04</span>Task simulation</h2>
      {study.personas.map(p => (
        <Fragment key={p.id}>
          <h3 className={styles.h3}>{p.name} <span className={styles.muted}>— {p.role}, {p.proficiency}</span></h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Task</th><th>Scenario</th><th>Behaviour observed</th><th>Friction</th><th>SEQ V1 / V2 / V3</th><th>Outcome V1 / V2 / V3</th></tr></thead>
              <tbody>
                {sims[p.id].map(t => (
                  <tr key={t.story}>
                    <td><strong>{t.story}</strong></td>
                    <td>{t.scenario}</td>
                    <td>{t.behaviour}</td>
                    <td>{t.friction}</td>
                    <td className={styles.nowrap}>{VARIANTS.map(v => t.seq[v]).join(' / ')}</td>
                    <td className={styles.outcomes}>
                      {VARIANTS.map(v => <BadgeStatus key={v} type={OUTCOME_BADGE[t.outcome[v]]} label={`${v.toUpperCase()} ${OUTCOME_LABEL[t.outcome[v]]}`} />)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fragment>
      ))}

      {/* 05 Metrics */}
      <h2 className={styles.h2}><span className={styles.num}>05</span>Simulated metrics</h2>
      <SeqChart />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Story</th>{VARIANTS.map(v => <th key={v}>{variantName(v)}</th>)}</tr></thead>
          <tbody>
            {storyIds.map(id => (
              <tr key={id}><td><strong>{id}</strong></td>{VARIANTS.map(v => <td key={v}>{fmt(byStory[id][v])}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Persona</th>{VARIANTS.map(v => <th key={v}>{variantName(v)} — SEQ · success · time (fast / med / slow)</th>)}</tr></thead>
          <tbody>
            {study.personas.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                {VARIANTS.map(v => {
                  const t = (study.time as Record<string, Record<VariantId, number[]>>)[p.id][v]
                  return <td key={v}>{fmt(byPersona[p.id][v].seq)} · {pct(byPersona[p.id][v].success)} · {t.join(' / ')}</td>
                })}
              </tr>
            ))}
            <tr className={styles.totalRow}>
              <td><strong>Overall</strong></td>
              {VARIANTS.map(v => <td key={v}><strong>{fmt(byVariant[v].seq)} / 7 · {pct(byVariant[v].success)}</strong></td>)}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 06 Cross-persona */}
      <h2 className={styles.h2}><span className={styles.num}>06</span>Cross-persona pattern analysis</h2>
      <h3 className={styles.h3}>Shared breakdown points</h3>
      <ul className={styles.list}>{study.shared.map(s => <li key={s}>{s}</li>)}</ul>
      <h3 className={styles.h3}>Divergent experiences</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Interaction</th>{study.personas.map(p => <th key={p.id}>{p.name.split(' ')[0]} ({p.proficiency})</th>)}</tr></thead>
          <tbody>
            {study.divergent.map(d => (
              <tr key={d.feature}><td><strong>{d.feature}</strong></td>{study.personas.map(p => <td key={p.id}>{(d as Record<string, string>)[p.id]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 07 Heuristics */}
      <h2 className={styles.h2}><span className={styles.num}>07</span>Heuristic assessment (NN/G)</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Heuristic</th><th>Status</th><th>Evidence</th></tr></thead>
          <tbody>
            {study.heuristics.map(h => (
              <tr key={h.id}><td><strong>{h.id}</strong> {h.name}</td><td><BadgeStatus type={HEUR_BADGE[h.status]} label={h.status} /></td><td>{h.evidence}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 08 Severity */}
      <h2 className={styles.h2}><span className={styles.num}>08</span>Severity matrix</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>ID</th><th>Tier</th><th>Issue</th><th>Freq.</th><th>Impact</th><th>Persistence</th><th>Personas</th><th>Heuristics</th></tr></thead>
          <tbody>
            {study.issues.map(i => (
              <tr key={i.id}>
                <td><strong>{i.id}</strong></td><td><BadgeStatus type={TIER_BADGE[i.tier]} label={i.tier} /></td>
                <td>{i.issue}</td><td className={styles.nowrap}>{i.frequency}</td><td>{i.impact}</td><td>{i.persistence}</td><td>{i.personas}</td><td>{i.heuristics}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 09 Recommendations */}
      <h2 className={styles.h2}><span className={styles.num}>09</span>Prioritized recommendations</h2>
      <div className={styles.recs}>
        {study.recommendations.map(r => (
          <div key={r.id} className={styles.rec}>
            <div className={styles.recHead}><strong>{r.id}</strong> {r.title}</div>
            <p className={styles.p}>{r.fix}</p>
            <p className={styles.recMeta}>Effort: {r.effort} · Impact: {r.impact} · <strong>Target:</strong> {r.target}</p>
            {'status' in r && r.status && <p className={styles.recMeta}><strong>Status:</strong> {r.status}</p>}
          </div>
        ))}
      </div>

      {/* 10 Next iteration */}
      <h2 className={styles.h2}><span className={styles.num}>10</span>Next testing iteration</h2>
      <ul className={styles.list}>{study.iteration.phases.map(ph => <li key={ph.name}><strong>{ph.name}:</strong> {ph.text}</li>)}</ul>
      <h3 className={styles.h3}>Open research questions</h3>
      <ul className={styles.list}>{study.iteration.questions.map(q => <li key={q}>{q}</li>)}</ul>

      <h2 className={styles.h2}><span className={styles.num}>11</span>Takeaways</h2>
      <ul className={styles.list}>{study.takeaways.map(t => <li key={t}>{t}</li>)}</ul>
    </article>
  )
}
