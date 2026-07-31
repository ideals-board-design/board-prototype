/* HubPage — Ideals Board overview landing
   Figma node 35372-4538

   Three views:
   - 'list'      → the prototypes registry (default)
   - 'dashboard' → Dashboard flows (opened from the Dashboard row)
   - 'public'    → Public page flows (opened from the Public page row) */

import { useState } from 'react'
import { HubHeader } from './HubHeader'
import { Button } from '../components/Button/Button'
import { arrows } from '../icons/arrows'
import styles from './HubPage.module.css'

const angleLeftSvg = arrows.find(i => i.name === 'angle-left-b')!.svg
const angleRightSvg = arrows.find(i => i.name === 'angle-right-fill')!.svg

/* ── Features registry ─────────────────────────────────────
   Add a new entry here whenever a new feature page is built.
   `href` opens a prototype directly; `view` opens an in-hub sub-page. */
type SubView = 'dashboard' | 'public'

const FEATURES: { id: string; name: string; designer: string; href?: string; view?: SubView }[] = [
  {
    id: 'tasks',
    name: 'Tasks',
    designer: 'Jaroslav Getman',
    href: '/tasks.html',
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    designer: 'Jaroslav Getman',
    view: 'dashboard',
  },
  {
    id: 'form',
    name: 'Form with hover color fill',
    designer: 'Jaroslav Getman',
    href: '/form.html',
  },
  {
    id: 'documents',
    name: 'Documents',
    designer: 'Jaroslav Getman',
    href: '/documents.html',
  },
  {
    id: 'public-page',
    name: 'Public page',
    designer: 'Elena Skurtova',
    view: 'public',
  },
]

/* ── Dashboard flows ───────────────────────────────────────
   Grouped by persona. Each flow links to its prototype. */
const DASHBOARD_FLOWS: { title: string; flows: { id: string; name: string; href: string }[] }[] = [
  {
    title: 'Corporate secretary flows',
    flows: [
      { id: 'cs-empty',  name: 'Empty state',    href: '/dashboard.html' },
      { id: 'cs-before', name: 'Before meeting', href: '/cs-before-meeting.html' },
      { id: 'cs-during', name: 'During meeting', href: '/blank.html?title=During+meeting+%E2%80%94+Corporate+secretary' },
      { id: 'cs-after',  name: 'After meeting',  href: '/blank.html?title=After+meeting+%E2%80%94+Corporate+secretary' },
    ],
  },
  {
    title: 'Board member flows',
    flows: [
      { id: 'bm-empty',  name: 'Empty state',    href: '/dashboard.html' },
      { id: 'bm-before', name: 'Before meeting', href: '/blank.html?title=Before+meeting+%E2%80%94+Board+member' },
      { id: 'bm-during', name: 'During meeting', href: '/blank.html?title=During+meeting+%E2%80%94+Board+member' },
    ],
  },
]

/* ── Public page flows ─────────────────────────────────────
   Grouped under "Create". Each flow links to its prototype. */
const PUBLIC_PAGE_FLOWS: { title: string; flows: { id: string; name: string; href: string }[] }[] = [
  {
    title: 'Create',
    flows: [
      { id: 'public-web',     name: 'Web',                      href: '/blank.html?title=Web+%E2%80%94+Public+page' },
      { id: 'public-meeting', name: 'Meeting creation public',  href: '/meeting-creation-public.html' },
      { id: 'public-agenda',  name: 'Agenda public',            href: '/blank.html?title=Agenda+public' },
      { id: 'public-minutes', name: 'Minutes public',           href: '/blank.html?title=Minutes+public' },
    ],
  },
]

const SUB_PAGES: Record<SubView, { title: string; groups: typeof DASHBOARD_FLOWS }> = {
  dashboard: { title: 'Dashboard', groups: DASHBOARD_FLOWS },
  public: { title: 'Public page', groups: PUBLIC_PAGE_FLOWS },
}

/* Top-level Prototypes list is always shown alphabetically by name,
   regardless of registration order above. */
const SORTED_FEATURES = [...FEATURES].sort((a, b) => a.name.localeCompare(b.name))

export default function HubPage() {
  const [view, setView] = useState<'list' | SubView>('list')

  return (
    <div className={styles.shell}>
      <HubHeader />

      {view === 'list' ? (
        <main className={styles.main}>
          <h1 className={styles.sectionTitle}>Prototypes</h1>
          <div className={styles.list}>
            {SORTED_FEATURES.map(f => (
              f.view ? (
                <button
                  key={f.id}
                  type="button"
                  className={styles.row}
                  onClick={() => setView(f.view!)}
                >
                  <span className={styles.featureName}>{f.name}</span>
                  <span className={styles.designerName}>{f.designer}</span>
                  <span className={styles.rowChevron} dangerouslySetInnerHTML={{ __html: angleRightSvg }} />
                </button>
              ) : (
                <a key={f.id} href={f.href} className={styles.row}>
                  <span className={styles.featureName}>{f.name}</span>
                  <span className={styles.designerName}>{f.designer}</span>
                  <span className={styles.rowChevron} dangerouslySetInnerHTML={{ __html: angleRightSvg }} />
                </a>
              )
            ))}
          </div>
        </main>
      ) : (
        <main className={styles.main}>
          <div className={styles.flowsHeader}>
            <Button
              variant="tertiary"
              intent="neutral"
              size="s"
              iconOnly={
                <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: angleLeftSvg }} />
              }
              onClick={() => setView('list')}
              aria-label="Back to prototypes"
            />
            <h1 className={styles.flowsTitle}>{SUB_PAGES[view].title}</h1>
          </div>

          {SUB_PAGES[view].groups.map(group => (
            <section key={group.title} className={styles.flowGroup}>
              <h2 className={styles.groupTitle}>{group.title}</h2>
              <div className={styles.list}>
                {group.flows.map(flow => (
                  <a key={flow.id} href={flow.href} className={styles.row}>
                    <span className={styles.featureName}>{flow.name}</span>
                    <span className={styles.rowChevron} dangerouslySetInnerHTML={{ __html: angleRightSvg }} />
                  </a>
                ))}
              </div>
            </section>
          ))}
        </main>
      )}
    </div>
  )
}
