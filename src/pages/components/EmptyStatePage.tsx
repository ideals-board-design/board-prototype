/* EmptyStatePage — showcase for EmptyState component
   Figma nodes 35292-596 (component) · 35292-629 (example 1) · 35292-1106 (example 2) */

import { EmptyState } from '../../components/EmptyState/EmptyState'
import { Button } from '../../components/Button/Button'
import { illustrations } from '../../illustrations/illustrations'
import styles from './EmptyStatePage.module.css'

export default function EmptyStatePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Empty State</h1>
      <p className={styles.subtitle}>
        Figma nodes 35292-596 · 35292-629 · 35292-1106
      </p>

      {/* ── Component (with title + description + two actions) ─── */}
      <h2 className={styles.sectionTitle}>Component</h2>
      <p className={styles.description}>
        Base structure: illustration · optional title · description · optional action(s).
      </p>
      <div className={styles.demoBox}>
        <EmptyState
          illustration="clipboard"
          title="Nothing here yet"
          description="Create your first item to get started."
          action={
            <>
              <Button variant="primary" size="m">Create item</Button>
              <Button variant="secondary" intent="neutral" size="m">Learn more</Button>
            </>
          }
        />
      </div>

      {/* ── Example 1 ──────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Example 1 — Access error</h2>
      <p className={styles.description}>
        No title. Single secondary action.
      </p>
      <div className={styles.demoBox}>
        <EmptyState
          illustration="web-page-warning"
          description="You may not have access, or it may no longer exist."
          action={
            <Button variant="secondary" intent="neutral" size="m">Try again</Button>
          }
        />
      </div>

      {/* ── Example 2 ──────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Example 2 — No search results</h2>
      <p className={styles.description}>
        Title + description. No action.
      </p>
      <div className={styles.demoBox}>
        <EmptyState
          illustration="folder-no-results"
          title="No matching results"
          description={<>Try adjusting the filters or using another<br />search query</>}
        />
      </div>

      {/* ── All illustrations ───────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>All illustrations</h2>
      <p className={styles.description}>
        Pass the illustration name as the <code>illustration</code> prop.
      </p>
      <div className={styles.illusGrid}>
        {illustrations.map(({ name, svg }) => (
          <div key={name} className={styles.illusCell}>
            <span
              className={styles.illusSvg}
              dangerouslySetInnerHTML={{ __html: svg }}
              aria-hidden
            />
            <span className={styles.illusName}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
