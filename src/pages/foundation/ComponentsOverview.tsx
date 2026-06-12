/* ComponentsOverview — searchable directory of every DS component.
   Built entirely from existing DS components:
   · TableCell / TableHeaderCell  (src/components/TableCell/TableCell.tsx)
   · TableActionsCell             (src/components/TableActionsCell/TableActionsCell.tsx)
   · Search + SearchFilterPanel   (src/components/Search/Search.tsx)
   Row-hover actions: Copy source path · Open in design system. */

import { useState, useMemo } from 'react'
import { TableCell, TableHeaderCell } from '../../components/TableCell/TableCell'
import { TableActionsCell } from '../../components/TableActionsCell/TableActionsCell'
import { Search } from '../../components/Search/Search'
import { SearchFilterPanel } from '../../components/Search/SearchFilterPanel'
import { actions } from '../../icons/actions'
import styles from './ComponentsOverview.module.css'

/* ── Icons (existing DS set only) ───────────────────────────── */
const linkIcon       = actions.find(i => i.name === 'link')!.svg
const checkIcon      = actions.find(i => i.name === 'check-circle')!.svg
const openIcon       = actions.find(i => i.name === 'external-link-alt')!.svg

/* ── Data ───────────────────────────────────────────────────── */
interface ComponentRow {
  name:        string
  description: string
  category:    string
  /** Source file path — copied by the "Copy source path" action */
  source:      string
  /** DS viewer page id — opened by the "Open in design system" action */
  page:        string
}

const COMPONENTS: ComponentRow[] = [
  { name: 'Button',          category: 'Actions',      page: 'components/buttons',         source: 'src/components/Button/Button.tsx',                 description: 'Primary action trigger in three sizes and multiple intents.' },
  { name: 'Banner',          category: 'Alerts',       page: 'components/banner',          source: 'src/components/Banner/Banner.tsx',                 description: 'Inline contextual message with status colour and an action.' },
  { name: 'Toast',           category: 'Alerts',       page: 'components/toast',           source: 'src/components/Toast/Toast.tsx',                   description: 'Transient notification that stacks and auto-dismisses.' },
  { name: 'Checkbox',        category: 'Controls',     page: 'components/checkbox',        source: 'src/components/Checkbox/Checkbox.tsx',             description: 'Boolean and indeterminate selection control.' },
  { name: 'Radio',           category: 'Controls',     page: 'components/radio',           source: 'src/components/Radio/Radio.tsx',                   description: 'Single selection within a group of options.' },
  { name: 'Segment Control', category: 'Controls',     page: 'components/segment-control', source: 'src/components/SegmentControl/SegmentControl.tsx', description: 'Single-select button group for switching between views.' },
  { name: 'Toggle',          category: 'Controls',     page: 'components/toggle',          source: 'src/components/Toggle/Toggle.tsx',                 description: 'Switch control for binary on/off states.' },
  { name: 'Avatar',          category: 'Data Display', page: 'components/avatar',          source: 'src/components/Avatar/Avatar.tsx',                 description: 'User or org image / initials across five sizes.' },
  { name: 'Avatars Group',   category: 'Data Display', page: 'components/avatars-group',   source: 'src/components/AvatarsGroup/AvatarsGroup.tsx',     description: 'Overlapping avatars with an overflow count.' },
  { name: 'Badge Counter',   category: 'Data Display', page: 'components/badge-counter',   source: 'src/components/BadgeCounter/BadgeCounter.tsx',     description: 'Small numeric count indicator.' },
  { name: 'Badge Status',    category: 'Data Display', page: 'components/badge-status',    source: 'src/components/BadgeStatus/BadgeStatus.tsx',       description: 'Colour-coded status pill with a label.' },
  { name: 'Chip',            category: 'Data Display', page: 'components/chip',            source: 'src/components/Chip/Chip.tsx',                     description: 'Compact tag with optional avatar and remove / menu.' },
  { name: 'Table Cell',      category: 'Data Display', page: 'components/table-cell',      source: 'src/components/TableCell/TableCell.tsx',           description: 'Header and body table cells at a fixed 48px height.' },
  { name: 'Tooltip',         category: 'Data Display', page: 'components/tooltip',         source: 'src/components/Tooltip/Tooltip.tsx',               description: 'Contextual hint shown on hover or focus.' },
  { name: 'Autocomplete',    category: 'Fields',       page: 'components/autocomplete',    source: 'src/components/Autocomplete/Autocomplete.tsx',     description: 'Text input with a filtered options dropdown.' },
  { name: 'Date Picker',     category: 'Fields',       page: 'components/date-picker',     source: 'src/components/DatePicker/DatePicker.tsx',         description: 'Calendar-based date selection field.' },
  { name: 'Dropdown',        category: 'Fields',       page: 'components/dropdown',        source: 'src/components/Dropdown/Dropdown.tsx',             description: 'Single, multi, or tree select menu field.' },
  { name: 'Search',          category: 'Fields',       page: 'components/search',          source: 'src/components/Search/Search.tsx',                 description: 'Search input with an optional filter panel.' },
  { name: 'Text Area',       category: 'Fields',       page: 'components/text-area',       source: 'src/components/TextArea/TextArea.tsx',             description: 'Multi-line text input for longer content.' },
  { name: 'Text Editor',     category: 'Fields',       page: 'components/text-editor',     source: 'src/components/TextEditor/TextEditor.tsx',         description: 'Rich text area with a formatting toolbar.' },
  { name: 'Text Field',      category: 'Fields',       page: 'components/text-field',      source: 'src/components/TextField/TextField.tsx',           description: 'Single-line text input; base for other fields.' },
  { name: 'Drawer Header',   category: 'Layout',       page: 'components/drawer-header',   source: 'src/components/DrawerHeader/DrawerHeader.tsx',     description: 'Header bar for side drawers.' },
  { name: 'Empty State',     category: 'Layout',       page: 'components/empty-state',     source: 'src/components/EmptyState/EmptyState.tsx',         description: 'Placeholder with illustration, text, and action.' },
  { name: 'Modal',           category: 'Layout',       page: 'components/modal',           source: 'src/components/Modal/Modal.tsx',                   description: 'Centered overlay dialog with shadow-200.' },
  { name: 'Page Header',     category: 'Layout',       page: 'components/page-header',      source: 'src/components/PageHeader/PageHeader.tsx',         description: 'Top-of-page title bar with actions.' },
  { name: 'Sticky Footer',   category: 'Layout',       page: 'components/sticky-footer',    source: 'src/components/StickyFooter/StickyFooter.tsx',     description: 'Pinned action bar at the bottom of a flow.' },
  { name: 'Breadcrumbs',     category: 'Navigation',   page: 'components/breadcrumbs',      source: 'src/components/Breadcrumbs/Breadcrumbs.tsx',       description: 'Trail showing the current page location.' },
  { name: 'Side Navigation', category: 'Navigation',   page: 'components/side-navigation',  source: 'src/components/SideNavigation/SideNavigation.tsx', description: 'App sidebar with workspace switcher and items.' },
  { name: 'Tabs',            category: 'Navigation',   page: 'components/tabs',             source: 'src/components/Tabs/Tabs.tsx',                     description: 'Switch between related content sections.' },
]

const CATEGORY_OPTIONS = [
  ...Array.from(new Set(COMPONENTS.map(c => c.category))).map(c => ({ value: c, label: c })),
]

type SortDir = 'asc' | 'desc'

interface ComponentsOverviewProps {
  /** Navigate the DS viewer to a component page (provided by App). */
  onNavigate?: (page: string) => void
}

export default function ComponentsOverview({ onNavigate }: ComponentsOverviewProps) {
  const [query, setQuery]           = useState('')
  const [category, setCategory]     = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortDir, setSortDir]       = useState<SortDir>('asc')
  const [copiedPage, setCopiedPage] = useState<string | null>(null)

  const filterActive = category !== ''

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return COMPONENTS
      .filter(c => !category || c.category === category)
      .filter(c =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
      )
      .sort((a, b) =>
        sortDir === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      )
  }, [query, category, sortDir])

  const handleCopy = (row: ComponentRow) => {
    const write = navigator.clipboard?.writeText(row.source)
    Promise.resolve(write).catch(() => {
      const el = document.createElement('textarea')
      el.value = row.source
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    setCopiedPage(row.page)
    setTimeout(() => setCopiedPage(prev => (prev === row.page ? null : prev)), 1500)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Components overview</h1>
      <p className={styles.subtitle}>
        Every component in the design system. Hover a row to copy its source path or open it
        in the viewer — paste the path into a prompt to keep new work consistent.
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
                  options:     CATEGORY_OPTIONS,
                  value:       category,
                  onChange:    v => setCategory(Array.isArray(v) ? (v[0] ?? '') : v),
                },
              ]}
              onClearAll={() => { setCategory(''); setFilterOpen(false) }}
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
                sortDirection={sortDir}
                onSort={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
              >
                Component
              </TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
              <th className={styles.actionsHeader} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const copied = copiedPage === row.page
              return (
                <tr
                  key={row.page}
                  className={idx % 2 === 0 ? styles.rowOdd : styles.rowEven}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell secondary>{row.category}</TableCell>
                  <TableCell secondary truncate>{row.description}</TableCell>
                  <TableActionsCell
                    actions={[
                      {
                        icon:    copied ? checkIcon : linkIcon,
                        label:   copied ? 'Copied' : 'Copy source path',
                        onClick: () => handleCopy(row),
                      },
                      {
                        icon:    openIcon,
                        label:   'Open in design system',
                        onClick: () => onNavigate?.(row.page),
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
