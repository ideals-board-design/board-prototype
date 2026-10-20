/* ReportsPage — "Reports" tab: every report on one page with side navigation.

   Opens on the one-screen Results summary (podium), then stacks the three
   reports (UX audit, usability study, design review) in one
   scroll box. The left navigation is built from each report's section headings
   after mount, links scroll to a section, and the current section is
   highlighted as the reader scrolls (scroll-spy). Below 1024px the navigation
   collapses to a row of report chips above the content. */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react'
import ReportPage from './ReportPage'
import ResultsPage from './ResultsPage'
import UsabilityStudyPage from './UsabilityStudyPage'
import UxAuditPage from './UxAuditPage'
import styles from './ReportsPage.module.css'

const REPORTS: { id: string; title: string; subtitle: string; Comp: ComponentType }[] = [
  { id: 'results', title: 'Results', subtitle: 'Winner · summary', Comp: ResultsPage },
  { id: 'audit',  title: 'UX audit', subtitle: '5 lenses · UXS · EN', Comp: UxAuditPage },
  { id: 'study',  title: 'Usability study', subtitle: '4 personas · SEQ · EN', Comp: UsabilityStudyPage },
  { id: 'review', title: 'Design review', subtitle: 'DS & heuristics · EN', Comp: ReportPage },
]

type NavItem = { id: string; report: string; label: string }

/* "01Executive summary" → "01 · Executive summary"; Report headings carry a
   clean `data-nav` label (their badges would otherwise leak into the text). */
const labelOf = (h: HTMLElement) => {
  if (h.dataset.nav) return h.dataset.nav
  const t = (h.textContent ?? '').trim()
  const m = t.match(/^(\d{2})(.*)$/)
  return m ? `${m[1]} · ${m[2].trim()}` : t
}

/** Offset (px) under the scroll box's top edge at which a section counts as current. */
const SPY_OFFSET = 96

export default function ReportsPage({ initial, onOpenVersion }: {
  initial?: string
  /** Passed to the Results page: its podium cards open a version's tab. */
  onOpenVersion?: (version: 'v1' | 'v2' | 'v3') => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<NavItem[]>([])
  const [active, setActive] = useState<string>(initial ?? REPORTS[0].id)

  /* Collect section headings and give them ids once the reports have rendered. */
  useLayoutEffect(() => {
    const box = scrollRef.current
    if (!box) return
    const next: NavItem[] = []
    for (const r of REPORTS) {
      const root = box.querySelector<HTMLElement>(`[data-report="${r.id}"]`)
      root?.querySelectorAll<HTMLElement>('h2').forEach((h, i) => {
        h.id = `${r.id}-s${i + 1}`
        next.push({ id: h.id, report: r.id, label: labelOf(h) })
      })
    }
    setItems(next)
  }, [])

  const scrollTo = useCallback((id: string) => {
    const box = scrollRef.current
    const el = box?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
    if (!box || !el) return
    box.scrollTo({ top: box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top - 16, behavior: 'smooth' })
  }, [])

  /* Open on a specific report (e.g. ?tab=study from an old link). */
  useEffect(() => {
    if (initial && initial !== REPORTS[0].id) scrollTo(initial)
  }, [initial, scrollTo])

  /* Scroll-spy: the last report / section whose top has passed the offset line. */
  const onScroll = () => {
    const box = scrollRef.current
    if (!box) return
    const line = box.getBoundingClientRect().top + SPY_OFFSET
    let current = REPORTS[0].id
    box.querySelectorAll<HTMLElement>('[data-report], h2[id]').forEach(el => {
      if (el.getBoundingClientRect().top <= line) current = el.dataset.report ?? el.id
    })
    setActive(current)
  }

  const activeReport = REPORTS.find(r => active === r.id || active.startsWith(`${r.id}-`))?.id ?? REPORTS[0].id

  return (
    <div className={styles.page}>
      <nav className={styles.nav} aria-label="Reports">
        <span className={styles.navTitle}>Reports</span>
        {REPORTS.map(r => (
          <div key={r.id} className={styles.group}>
            <button
              type="button"
              className={[styles.reportLink, activeReport === r.id ? styles.reportLinkActive : ''].filter(Boolean).join(' ')}
              onClick={() => scrollTo(r.id)}
              aria-current={activeReport === r.id ? 'true' : undefined}
            >
              <span className={styles.reportTitle}>{r.title}</span>
              <span className={styles.reportSub}>{r.subtitle}</span>
            </button>
            <ul className={styles.sections}>
              {items.filter(it => it.report === r.id).map(it => (
                <li key={it.id}>
                  <button
                    type="button"
                    className={[styles.sectionLink, active === it.id ? styles.sectionLinkActive : ''].filter(Boolean).join(' ')}
                    onClick={() => scrollTo(it.id)}
                    aria-current={active === it.id ? 'location' : undefined}
                  >
                    {it.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div ref={scrollRef} className={styles.content} onScroll={onScroll}>
        {REPORTS.map(({ id, Comp }) => (
          <section key={id} id={id} data-report={id} className={styles.report}>
            {id === 'results' ? <ResultsPage onOpenVersion={onOpenVersion} /> : <Comp />}
          </section>
        ))}
      </div>
    </div>
  )
}
