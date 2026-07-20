/* PageHeaderPage — Figma nodes 30455-16481 (Default), 9822-92904 (Meeting), 30455-21449 (Documents) */

import { PageHeader } from '../../components/PageHeader/PageHeader'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'
import { BadgeStatus } from '../../components/BadgeStatus/BadgeStatus'
import { Button } from '../../components/Button/Button'
import { functional } from '../../icons/functional'
import { condition } from '../../icons/condition'
import styles from './PageHeaderPage.module.css'
import { SourceLink } from '../SourceLink'

const bookmarkSvg = functional.find(i => i.name === 'bookmark')!.svg
const cloudSvg    = condition.find(i => i.name === 'cloud-check')!.svg

/* Interactive icon button (with hover) — e.g. a bookmark toggle. */
function IconButton({ svg, label }: { svg: string; label: string }) {
  return (
    <Button
      variant="tertiary"
      intent="neutral"
      size="m"
      iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />}
      aria-label={label}
    />
  )
}

/* Plain, non-interactive icon in a 6px-padded wrapper — e.g. a sync-status indicator. */
function IconAction({ svg, label }: { svg: string; label: string }) {
  return (
    <span className={styles.iconAction} role="img" aria-label={label}>
      <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
    </span>
  )
}

export default function PageHeaderPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Page Header</h1>
      <p className={styles.subtitle}>Figma · 30455-16481, 9822-92904, 30455-21449</p>
      <SourceLink path="src/components/PageHeader/PageHeader.tsx" />

      {/* ── Default (title only) ─────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Default</h2>
      <div className={styles.preview}>
        <PageHeader title="Page header" />
      </div>

      {/* ── Meeting (back + title menu + badge + actions) ────────────────── */}
      <h2 className={styles.sectionTitle}>Meeting</h2>
      <div className={styles.preview}>
        <PageHeader
          title="Meeting name"
          onBack={() => {}}
          onTitleMenu={() => {}}
          badge={<BadgeStatus type="neutral" label="Badge" />}
          actions={
            <>
              <IconButton svg={bookmarkSvg} label="Bookmark" />
              <IconAction svg={cloudSvg} label="Sync" />
            </>
          }
        />
      </div>

      {/* ── Documents (breadcrumbs) ──────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Documents</h2>
      <div className={styles.preview}>
        <PageHeader
          breadcrumbs={
            <Breadcrumbs
              size="l"
              items={[
                { label: 'Documents', href: '#' },
                { label: 'Section', href: '#' },
                { label: 'Subsection', href: '#' },
                { label: 'Folder name', href: '#' },
                { label: 'Folder name' },
              ]}
            />
          }
        />
      </div>
    </div>
  )
}
