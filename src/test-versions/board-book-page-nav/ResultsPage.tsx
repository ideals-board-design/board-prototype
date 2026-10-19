/* ResultsPage — first page of the Reports tab: executive summary of the
   comparison, styled after the agreed reference (podium · score breakdown ·
   why the winner wins).

   The ranking is computed from the existing evaluation data — nothing is
   hand-ranked:
     • Design review   — comparison total (of 30) and document-boundary score
                         (of 5), parsed from DESIGN_REVIEW.md
     • Usability study — simulated SEQ (of 7) and task success, from
                         usability-study.json
     • UX audit        — UXS (of 100), from ux-audit.json
   Each criterion is normalised to 0–100; the overall score is their mean.
   Podium cards are buttons: hover lifts them with a shadow, click opens that
   version's tab. */

import { BadgeStatus } from '../../components/BadgeStatus/BadgeStatus'
import { actions } from '../../icons/actions'
import { condition } from '../../icons/condition'
import { dateTime } from '../../icons/dateTime'
import { files } from '../../icons/files'
import { functional } from '../../icons/functional'
import { media } from '../../icons/media'
import { navigation } from '../../icons/navigation'
import reviewMd from '../../../.design/board-book-page-nav/DESIGN_REVIEW.md?raw'
import study from '../../../.design/board-book-page-nav/usability-study.json'
import audit from '../../../.design/board-book-page-nav/ux-audit.json'
import shotV1 from '../../../.design/board-book-page-nav/screenshots/review-v1-desktop-1280.png'
import shotV2 from '../../../.design/board-book-page-nav/screenshots/fixed-v2-desktop-1280.png'
import shotV3 from '../../../.design/board-book-page-nav/screenshots/review-v3-desktop-1280.png'
import styles from './ResultsPage.module.css'

type VariantId = 'v1' | 'v2' | 'v3'
const VARIANTS: VariantId[] = ['v1', 'v2', 'v3']
const NAME: Record<VariantId, string> = { v1: 'Version 1', v2: 'Version 2', v3: 'Version 3' }
const SHORT: Record<VariantId, string> = { v1: 'V1', v2: 'V2', v3: 'V3' }
const KIND: Record<VariantId, string> = { v1: 'Full width', v2: 'Floating controls', v3: 'Reading mode' }
const SHOT: Record<VariantId, string> = { v1: shotV1, v2: shotV2, v3: shotV3 }

const svg = (set: { name: string; svg: string }[], name: string) => set.find(i => i.name === name)!.svg
const ICON = {
  recommended: svg(functional, 'star-filled'),
  review:      svg(actions, 'eye-opened'),
  boundaries:  svg(files, 'file-default'),
  ease:        svg(media, 'laptop'),
  success:     svg(condition, 'check-circle'),
  uxs:         svg(functional, 'star'),
  overall:     svg(navigation, 'reports-default'),
  progress:    svg(dateTime, 'clock-five'),
}
const Ico = ({ icon, className }: { icon: string; className?: string }) => (
  <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />
)

/* ── Design review scores (parsed from the markdown tables) ─────────────── */
const rowNumbers = (re: RegExp): number[] => {
  const line = reviewMd.split('\n').find(l => re.test(l)) ?? ''
  return (line.match(/\d+/g) ?? []).map(Number)
}
const reviewTotal = rowNumbers(/^\| \*\*Total\*\* \|/) // of 30 (6 criteria × 5)
const boundary = rowNumbers(/^\| Score \|/)             // of 5

/* ── Study metrics ─────────────────────────────────────────────────────── */
type Task = { seq: Record<VariantId, number>; outcome: Record<VariantId, 'S' | 'P' | 'F'> }
const tasks = Object.values(study.simulations as Record<string, Task[]>).flat()
const SCORE = { S: 1, P: 0.5, F: 0 }
const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length
const seq = Object.fromEntries(VARIANTS.map(v => [v, avg(tasks.map(t => t.seq[v]))])) as Record<VariantId, number>
const success = Object.fromEntries(VARIANTS.map(v => [v, avg(tasks.map(t => SCORE[t.outcome[v]]))])) as Record<VariantId, number>

/* ── UX audit ──────────────────────────────────────────────────────────── */
const lenses = audit.lenses as { scores: Record<VariantId, number> }[]
const uxs = Object.fromEntries(VARIANTS.map(v => [v,
  Math.round((avg(lenses.map(l => l.scores[v])) / 5) * 100),
])) as Record<VariantId, number>

/* ── Criteria + overall ranking ────────────────────────────────────────── */
type Criterion = { name: string; scale: string; icon: string; raw: (v: VariantId, i: number) => string; norm: (v: VariantId, i: number) => number }
const CRITERIA: Criterion[] = [
  { name: 'Design review',       scale: 'of 30',  icon: ICON.review,     raw: (_, i) => `${reviewTotal[i]}`,           norm: (_, i) => (reviewTotal[i] / 30) * 100 },
  { name: 'Document boundaries', scale: 'of 5',   icon: ICON.boundaries, raw: (_, i) => `${boundary[i]}`,              norm: (_, i) => (boundary[i] / 5) * 100 },
  { name: 'Ease of use (SEQ)',   scale: 'of 7',   icon: ICON.ease,       raw: v => seq[v].toFixed(1),                  norm: v => (seq[v] / 7) * 100 },
  { name: 'Task success',        scale: '%',      icon: ICON.success,    raw: v => `${Math.round(success[v] * 100)}%`, norm: v => success[v] * 100 },
  { name: 'UX score (UXS)',      scale: 'of 100', icon: ICON.uxs,        raw: v => `${uxs[v]}`,                        norm: v => uxs[v] },
]
const overall = Object.fromEntries(VARIANTS.map((v, i) => [v,
  Math.round(avg(CRITERIA.map(c => c.norm(v, i)))),
])) as Record<VariantId, number>
const ranked = [...VARIANTS].sort((a, b) => overall[b] - overall[a])
const rank = Object.fromEntries(ranked.map((v, i) => [v, i + 1])) as Record<VariantId, number>
const winner = ranked[0]
const PODIUM: VariantId[] = [ranked[1], ranked[0], ranked[2]]
const ROWS: Criterion[] = [
  ...CRITERIA,
  { name: 'Overall', scale: 'mean, 0–100', icon: ICON.overall, raw: v => `${overall[v]}`, norm: v => overall[v] },
]

const WHY = [
  { icon: ICON.boundaries, title: 'Next / previous sits exactly where a document ends', text: 'Readers continue to the next document without moving their eyes.' },
  { icon: ICON.progress,   title: 'Reading progress shows how much is left',           text: 'Keeps readers oriented across the whole board book.' },
  { icon: ICON.success,    title: `Best on all ${CRITERIA.length} criteria`,            text: `Highest overall score (${overall[winner]}) with ${Math.round(success[winner] * 100)}% task success.` },
]

export interface ResultsPageProps {
  /** Opens a version's tab when its podium card is clicked. */
  onOpenVersion?: (v: VariantId) => void
}

export default function ResultsPage({ onOpenVersion }: ResultsPageProps) {
  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Board book navigation · comparison results</p>
          <h1 className={styles.title}>{NAME[winner]} wins the comparison</h1>
          <p className={styles.subtitle}>{KIND[winner]} is the recommended direction for board book navigation.</p>
        </div>
        <div className={styles.callout}>
          <span className={styles.calloutTag}><Ico icon={ICON.recommended} className={styles.calloutIcon} />Recommended</span>
          <span className={styles.calloutText}>{NAME[winner]} gives the best overall experience and leads on every key criterion.</span>
        </div>
      </header>

      {/* ── Podium ─────────────────────────────────────────────────── */}
      <section className={styles.podium} aria-label="Ranking">
        {PODIUM.map(v => {
          const place = rank[v]
          return (
            <div key={v} className={[styles.column, styles[`col${place}`]].join(' ')}>
              <button
                type="button"
                className={styles.panel}
                onClick={() => onOpenVersion?.(v)}
                aria-label={`Open ${NAME[v]} — ${KIND[v]}`}
              >
                {place === 1 && <Ico icon={ICON.recommended} className={styles.medal} />}
                <span className={styles.placeName}>
                  <span className={styles.rank}>{place}</span>
                  {NAME[v]}
                </span>
                <span className={styles.placeKind}>{KIND[v]}</span>
                <span className={styles.device}><img className={styles.shot} src={SHOT[v]} alt={`${NAME[v]} — ${KIND[v]}`} /></span>
                <span className={styles.score}>{overall[v]}<span className={styles.scoreUnit}> / 100</span></span>
              </button>
              <div className={styles.base}>{place}</div>
            </div>
          )
        })}
      </section>

      {/* ── Score breakdown ────────────────────────────────────────── */}
      <section className={styles.card} aria-label="Score breakdown">
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle} data-nav="01 · Score breakdown">Score breakdown</h2>
          <span className={styles.legend}>
            {ranked.map(v => (
              <span key={v} className={styles.legendItem}>
                <span className={[styles.dot, styles[`dot${rank[v]}`]].join(' ')} aria-hidden="true" />{SHORT[v]}
              </span>
            ))}
          </span>
        </div>
        <div className={styles.table} role="table">
          <div className={[styles.row, styles.rowHead].join(' ')} role="row">
            <span className={styles.critHead} role="columnheader">Criteria</span>
            {ranked.map(v => (
              <span key={v} className={[styles.cell, rank[v] === 1 ? styles.cellWin : ''].filter(Boolean).join(' ')} role="columnheader">{SHORT[v]}</span>
            ))}
          </div>
          {ROWS.map(c => (
            <div key={c.name} className={[styles.row, c.name === 'Overall' ? styles.rowTotal : ''].filter(Boolean).join(' ')} role="row">
              <span className={styles.crit} role="rowheader">
                <Ico icon={c.icon} className={styles.critIcon} />
                <span className={styles.critText}>
                  <span className={styles.critName}>{c.name}</span>
                  <span className={styles.critScale}>{c.scale}</span>
                </span>
              </span>
              {ranked.map(v => {
                const i = VARIANTS.indexOf(v)
                const win = rank[v] === 1
                return (
                  <span key={v} className={[styles.cell, win ? styles.cellWin : ''].filter(Boolean).join(' ')} role="cell">
                    <span className={[styles.value, win ? styles.valueWin : ''].filter(Boolean).join(' ')}>{c.raw(v, i)}</span>
                    <span className={styles.track} aria-hidden="true">
                      <span className={[styles.fill, styles[`fill${rank[v]}`]].join(' ')} style={{ width: `${c.norm(v, i)}%` }} />
                    </span>
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      </section>

      {/* ── Why the winner wins ────────────────────────────────────── */}
      <section className={styles.why} aria-label={`Why ${NAME[winner]} wins`}>
        <h2 className={styles.cardTitle} data-nav={`02 · Why ${NAME[winner]} wins`}>Why {NAME[winner]} wins</h2>
        <div className={styles.whyGrid}>
          {WHY.map(w => (
            <div key={w.title} className={styles.whyItem}>
              <Ico icon={w.icon} className={styles.whyIcon} />
              <span>
                <span className={styles.whyTitle}>{w.title}</span>
                <span className={styles.whyText}>{w.text}</span>
              </span>
            </div>
          ))}
        </div>
        <p className={styles.note}>
          <BadgeStatus type="neutral" label="Next" /> Label “Next document” on a document’s last page, then validate with directors. Usability numbers are simulated.
        </p>
      </section>
    </div>
  )
}
