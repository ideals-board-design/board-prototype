/* TasksPage — Table-based feature page
   Figma: 35354-11450 (default) · 35354-11460 (drawer open) */

import { useState } from 'react'
import { PageHeader }     from '../../../components/PageHeader/PageHeader'
import { DrawerHeader }   from '../../../components/DrawerHeader/DrawerHeader'
import { StickyFooter }   from '../../../components/StickyFooter/StickyFooter'
import { Button }   from '../../../components/Button/Button'
import { Tooltip }  from '../../../components/Tooltip/Tooltip'
import { Search }         from '../../../components/Search/Search'
import { TableHeaderCell } from '../../../components/TableCell/TableCell'
import { TableCell }       from '../../../components/TableCell/TableCell'
import { TableActionsCell } from '../../../components/TableActionsCell/TableActionsCell'
import { actions }    from '../../../icons/actions'
import { files }      from '../../../icons/files'
import { condition }  from '../../../icons/condition'
import { functional } from '../../../icons/functional'
import styles from './TasksPage.module.css'

/* ── Icons ─────────────────────────────────────────────── */
const plusSvg        = actions.find(i => i.name === 'plus')!.svg
const editSvg        = actions.find(i => i.name === 'edit-alt')!.svg
const ellipsisSvg    = functional.find(i => i.name === 'ellipsis-h')!.svg
const trashSvg       = actions.find(i => i.name === 'trash-alt')!.svg
const checkCircleSvg = condition.find(i => i.name === 'check-circle')!.svg
const filePlusSvg    = files.find(i => i.name === 'file-plus')!.svg
const fileSignSvg    = files.find(i => i.name === 'file-signature')!.svg

/* ── Types ─────────────────────────────────────────────── */
type SortDir = 'asc' | 'desc' | null
type SortCol = 'name' | 'status' | 'createdOn'

interface Row {
  id:         string
  name:       string
  status:     string
  createdOn:  string
  type:       string
  typeIcon:   string
}

/* ── Data ──────────────────────────────────────────────── */
const STATUS_COLOR: Record<string, string> = {
  Draft:       'var(--yellow-50)',
  Overdue:     'var(--red-50)',
  'In progress': 'var(--blue-50)',
  Completed:   'var(--green-50)',
}

const ROWS: Row[] = [
  { id: '1', name: 'Distribute new policy across departments and based on this prepare a report.', status: 'Draft', createdOn: '2025-04-17', type: 'Action', typeIcon: checkCircleSvg },
  { id: '2', name: 'Sharing of financial information', status: 'Draft', createdOn: '2025-05-21', type: 'Signature', typeIcon: fileSignSvg },
  { id: '3', name: 'Consideration of a structured approach to assessment of Nursing Homes, including where the Trust is a staffing provider.', status: 'Draft', createdOn: '2025-05-11', type: 'Document', typeIcon: filePlusSvg },
  { id: '4', name: 'Distribute new policy — overdue item', status: 'Overdue', createdOn: '2025-04-14', type: 'Action', typeIcon: checkCircleSvg },
  { id: '5', name: 'Sharing of financial information Q2–Q3', status: 'In progress', createdOn: '2025-04-12', type: 'Action', typeIcon: checkCircleSvg },
]

function sortRows(rows: Row[], col: SortCol | null, dir: SortDir): Row[] {
  if (!col || !dir) return rows
  return [...rows].sort((a, b) => {
    const cmp = a[col].localeCompare(b[col])
    return dir === 'asc' ? cmp : -cmp
  })
}

/* ── Component ─────────────────────────────────────────── */
export default function TasksPage() {
  const [search,      setSearch]      = useState('')
  const [sortCol,     setSortCol]     = useState<SortCol | null>(null)
  const [sortDir,     setSortDir]     = useState<SortDir>(null)
  const [selectedId,  setSelectedId]  = useState<string | null>(null)
  const [hoveredRow,  setHoveredRow]  = useState<string | null>(null)

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      const next: SortDir = sortDir === null ? 'asc' : sortDir === 'asc' ? 'desc' : null
      setSortDir(next)
      if (next === null) setSortCol(null)
    } else {
      setSortCol(col); setSortDir('asc')
    }
  }

  const filtered = ROWS.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )
  const sorted = sortRows(filtered, sortCol, sortDir)
  const selectedRow = ROWS.find(r => r.id === selectedId) ?? null

  const ROW_ACTIONS = [
    { icon: editSvg,    label: 'Edit',   onClick: () => console.log('edit') },
    { icon: ellipsisSvg, label: 'More',  onClick: () => console.log('more') },
  ]

  return (
    <div className={styles.page}>

      {/* ── Content column ────────────────────────────── */}
      <div className={styles.content}>

        {/* Header */}
        <PageHeader title="Tasks" />

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <Button
              variant="primary"
              size="m"
              iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: plusSvg }} />}
            >
              Request
            </Button>
          </div>
          <Search
            size="m"
            placeholder="Search"
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            filter
            className={styles.searchInput}
          />
        </div>

        {/* Table */}
        <div className={styles.tableScroll}>
          <div className={styles.tableCard}>
          <table className={styles.table}>
            <colgroup>
              {[undefined, 168, 144, 0].map((w, i) =>
                <col key={i} style={w != null ? { width: w } : undefined} />
              )}
            </colgroup>
            <thead>
              <tr>
                <TableHeaderCell
                  sortable
                  sortDirection={sortCol === 'name' ? sortDir : null}
                  onSort={() => handleSort('name')}
                >
                  Name
                </TableHeaderCell>
                <TableHeaderCell
                  sortable
                  sortDirection={sortCol === 'status' ? sortDir : null}
                  onSort={() => handleSort('status')}
                >
                  Status
                </TableHeaderCell>
                <TableHeaderCell
                  sortable
                  sortDirection={sortCol === 'createdOn' ? sortDir : null}
                  onSort={() => handleSort('createdOn')}
                >
                  Created on
                </TableHeaderCell>
                <th className={styles.actionsThSticky} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, idx) => (
                <tr
                  key={row.id}
                  className={[
                    idx % 2 === 0 ? styles.rowOdd : styles.rowEven,
                    selectedId === row.id ? styles.rowSelected : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setSelectedId(id => id === row.id ? null : row.id)}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell error={row.status === 'Overdue'} truncate>{row.name}</TableCell>
                  <TableCell
                    badge={row.status}
                    badgeColor={STATUS_COLOR[row.status] ?? 'var(--stone-200)'}
                  />
                  <TableCell error={row.status === 'Overdue'}>
                    {new Date(row.createdOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableActionsCell
                    actions={ROW_ACTIONS}
                    visible={hoveredRow === row.id}
                  />
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* ── Drawer column ─────────────────────────────── */}
      {selectedRow && (
        <div className={styles.drawer}>
          <DrawerHeader
            title="Drawer header"
            onClose={() => setSelectedId(null)}
          />
          <div className={styles.drawerBody}>
            <p className={styles.drawerPlaceholder}>{selectedRow.name}</p>
          </div>
          <StickyFooter
            variant="drawer"
            left={
              <>
                <Button variant="primary" size="m">
                  Save
                </Button>
                <Tooltip label="More" position="top">
                  <Button
                    variant="secondary"
                    intent="neutral"
                    size="m"
                    iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: ellipsisSvg }} />}
                    aria-label="More"
                  />
                </Tooltip>
              </>
            }
            right={
              <Tooltip label="Delete" position="top">
                <Button
                  variant="secondary"
                  intent="danger"
                  size="m"
                  iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: trashSvg }} />}
                  aria-label="Delete"
                />
              </Tooltip>
            }
          />
        </div>
      )}

    </div>
  )
}
