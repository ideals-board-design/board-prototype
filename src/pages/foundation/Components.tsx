/* Components — searchable directory of every component in the design system,
   each with its own shareable URL. Reached from the Overview page's
   "Components" card, or from one of its category cards (Actions, Alerts, …),
   which pre-filter the table via `initialSection`.
   Built entirely from existing DS components:
   · TableCell / TableHeaderCell  (src/components/TableCell/TableCell.tsx)
   · TableActionsCell             (src/components/TableActionsCell/TableActionsCell.tsx)
   · Search + SearchFilterPanel   (src/components/Search/Search.tsx)
   Row-hover actions: Copy link · Open in design system.
   Page list is sourced from src/navData.ts, the same registry that drives the
   sidebar — so this page can never drift out of sync with it. */

import { useState, useMemo } from 'react'
import { TableCell, TableHeaderCell } from '../../components/TableCell/TableCell'
import { TableActionsCell } from '../../components/TableActionsCell/TableActionsCell'
import { Search } from '../../components/Search/Search'
import { SearchFilterPanel } from '../../components/Search/SearchFilterPanel'
import { actions } from '../../icons/actions'
import { type Page, componentGroups, pageUrl } from '../../navData'
import styles from './Components.module.css'

/* ── Icons (existing DS set only) ───────────────────────────── */
const linkIcon  = actions.find(i => i.name === 'link')!.svg
const checkIcon = actions.find(i => i.name === 'check-circle')!.svg
const openIcon  = actions.find(i => i.name === 'external-link-alt')!.svg

/* ── Data — every component page, from the shared sidebar registry ───────── */
interface ComponentRow {
  id:      Page
  name:    string
  section: string
  url:     string
}

const COMPONENTS: ComponentRow[] = componentGroups.flatMap(group =>
  group.items.map(item => ({ id: item.id, name: item.label, section: group.section, url: pageUrl(item.id) })),
)

const SECTION_OPTIONS = componentGroups.map(g => ({ value: g.section, label: g.section }))

type SortDir   = 'asc' | 'desc'
type SortField = 'name' | 'section'

export interface ComponentsPageProps {
  /** Pre-filter the table to this category on mount (from an Overview card). */
  initialSection?: string
  /** Navigate the DS viewer to another page (provided by App). */
  onNavigate?: (page: Page) => void
}

export default function Components({ initialSection = '', onNavigate }: ComponentsPageProps) {
  const [query, setQuery]           = useState('')
  const [section, setSection]       = useState(initialSection)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortField, setSortField]   = useState<SortField>('name')
  const [sortDir, setSortDir]       = useState<SortDir>('asc')
  const [copiedId, setCopiedId]     = useState<Page | null>(null)

  const filterActive = section !== ''

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return COMPONENTS
      .filter(c => !section || c.section === section)
      .filter(c =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const cmp = sortField === 'name'
          ? a.name.localeCompare(b.name)
          : a.section.localeCompare(b.section) || a.name.localeCompare(b.name)
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [query, section, sortField, sortDir])

  const handleCopy = (row: ComponentRow) => {
    const write = navigator.clipboard?.writeText(row.url)
    Promise.resolve(write).catch(() => {
      const el = document.createElement('textarea')
      el.value = row.url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    setCopiedId(row.id)
    setTimeout(() => setCopiedId(prev => (prev === row.id ? null : prev)), 1500)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Components</h1>
      <p className={styles.subtitle}>
        Every component in the design system, each with its own shareable URL. Hover a row
        to copy its link or open it in the viewer.
      </p>

      {/* ── Search + filters ─────────────────────────────────── */}
      <div className={styles.toolbar}>
        <Search
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search components"
          filter
          filterActive={filterActive}
          filterPanelOpen={filterOpen}
          onFilterClick={() => setFilterOpen(o => !o)}
          filterPanel={
            <SearchFilterPanel
              dropdowns={[
                {
                  placeholder: 'Category',
                  options:     SECTION_OPTIONS,
                  value:       section,
                  onChange:    v => setSection(Array.isArray(v) ? (v[0] ?? '') : v),
                },
              ]}
              onClearAll={() => { setSection(''); setFilterOpen(false) }}
            />
          }
        />
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <colgroup>
            {[200, 140, undefined, 0].map((w, i) =>
              <col key={i} style={w != null ? { width: w } : undefined} />,
            )}
          </colgroup>
          <thead>
            <tr>
              <TableHeaderCell
                count={rows.length}
                sortable
                sortDirection={sortField === 'name' ? sortDir : null}
                onSort={() => toggleSort('name')}
              >
                Component
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sortField === 'section' ? sortDir : null}
                onSort={() => toggleSort('section')}
              >
                Category
              </TableHeaderCell>
              <TableHeaderCell>URL</TableHeaderCell>
              <th className={styles.actionsHeader} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const copied = copiedId === row.id
              return (
                <tr
                  key={row.id}
                  className={idx % 2 === 0 ? styles.rowOdd : styles.rowEven}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell secondary>{row.section}</TableCell>
                  <TableCell secondary truncate>{row.url}</TableCell>
                  <TableActionsCell
                    actions={[
                      {
                        icon:    copied ? checkIcon : linkIcon,
                        label:   copied ? 'Copied' : 'Copy link',
                        onClick: () => handleCopy(row),
                      },
                      {
                        icon:    openIcon,
                        label:   'Open in design system',
                        onClick: () => onNavigate?.(row.id),
                      },
                    ]}
                  />
                </tr>
              )
            })}

            {rows.length === 0 && (
              <tr className={styles.rowOdd}>
                <TableCell secondary>No components match your search.</TableCell>
                <TableCell />
                <TableCell />
                <td className={styles.actionsHeader} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
