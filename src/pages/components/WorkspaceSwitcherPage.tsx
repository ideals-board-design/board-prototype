/* WorkspaceSwitcherPage — showcase for WorkspaceSwitcher component
   Figma nodes 34956-1814 (Active) · 34956-1816 (Hover) · 34956-1932 (Opened) */

import { useState } from 'react'
import { WorkspaceSwitcher } from '../../components/WorkspaceSwitcher/WorkspaceSwitcher'
import type { Workspace } from '../../components/WorkspaceSwitcher/WorkspaceSwitcher'
import styles from './WorkspaceSwitcherPage.module.css'

const WORKSPACES: Workspace[] = [
  { id: 'lu', name: 'Luminara Systems',          initials: 'LU', color: 'var(--tag-kepeel)'   },
  { id: 'ne', name: 'NexaWave Solutions',         initials: 'NE', color: 'var(--tag-red)'      },
  { id: 'qu', name: 'QuantumPulse Innovations',   initials: 'QU', color: 'var(--tag-navyblue)' },
  { id: 'st', name: 'STAR Enterprises',           initials: 'ST', color: 'var(--green-500)'    },
  { id: 've', name: 'VerdeoTech Enterprises',     initials: 'VE', color: 'var(--tag-beetroot)' },
]

export default function WorkspaceSwitcherPage() {
  const [activeId, setActiveId] = useState('st')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Workspace Switcher</h1>
      <p className={styles.subtitle}>
        Figma nodes 34956-1814 · 34956-1816 · 34956-1932
      </p>

      {/* ── Live demo ──────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Live demo</h2>
      <p className={styles.description}>Click to open. Select a workspace to switch.</p>
      <div className={styles.demoWrap}>
        <WorkspaceSwitcher
          workspaces={WORKSPACES}
          activeId={activeId}
          onSelect={setActiveId}
        />
      </div>

      {/* ── States ─────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>States</h2>
      <div className={styles.statesRow}>
        <div className={styles.stateGroup}>
          <div className={styles.stateLabel}>Default</div>
          <WorkspaceSwitcher workspaces={WORKSPACES} activeId="st" />
        </div>
        <div className={[styles.stateGroup, styles.stateGroupOpened].join(' ')}>
          <div className={styles.stateLabel}>Opened</div>
          <WorkspaceSwitcher workspaces={WORKSPACES} activeId="st" defaultOpen />
        </div>
      </div>

      {/* ── Guidelines ─────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Guidelines</h2>
      <ul className={styles.guidelines}>
        <li>Trigger width: 240px. Outer padding: 4px. Inner padding: 8px 12px. Gap: 8px.</li>
        <li>Workspace avatar: 32px in trigger and list. Border-radius 4px (<code>--radius-sm</code>).</li>
        <li>Dropdown panel: 232px wide, 4px left offset, 4px gap below trigger. Background: <code>--stone-0</code>. Shadow: <code>--shadow-100</code>.</li>
        <li>List item padding: 4px 12px 4px 4px. Gap: 12px. Border-radius: <code>--radius-sm</code>.</li>
        <li>Active item: <code>--color-bg-selected</code> background.</li>
        <li>Hover item: <code>--color-bg-hover</code> background.</li>
        <li>Each workspace needs: <code>id</code>, <code>name</code>, <code>initials</code> (2 chars), <code>color</code> (CSS value).</li>
        <li>Chevron: <code>angle-down-fill</code> closed, <code>angle-up-fill</code> opened. Both 16×16px.</li>
        <li>Closes on outside click, Escape key, or workspace selection.</li>
      </ul>
    </div>
  )
}

