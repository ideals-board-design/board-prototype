/* TableCellPage — showcase for TableCell / TableHeaderCell / TableAvatarCell
   Figma nodes 31434-6336 (header) · 35294-4837 (body variants) · 31434-6347 (avatar) */

import { useState } from 'react'
import { TableCell, TableHeaderCell } from '../../components/TableCell/TableCell'
import { TableAvatarCell } from '../../components/TableAvatarCell/TableAvatarCell'
import { TableActionsCell } from '../../components/TableActionsCell/TableActionsCell'
import { actions }    from '../../icons/actions'
import { condition }  from '../../icons/condition'
import { files }      from '../../icons/files'
import { users }      from '../../icons/users'
import { functional } from '../../icons/functional'
import styles from './TableCellPage.module.css'

const plusIcon        = actions.find(i => i.name === 'plus')!.svg

const checkCircleIcon = condition.find(i => i.name === 'check-circle')!.svg
const fileSignIcon    = files.find(i => i.name === 'file-signature')!.svg
const filePlusIcon    = files.find(i => i.name === 'file-plus')!.svg

const ROW_ACTIONS = [
  { icon: users.find(i => i.name === 'user-plus')!.svg,        label: 'Share',     onClick: () => console.log('share') },
  { icon: actions.find(i => i.name === 'copy')!.svg,           label: 'Copy',      onClick: () => console.log('copy') },
  { icon: actions.find(i => i.name === 'download-alt')!.svg,   label: 'Download',  onClick: () => console.log('download') },
  { icon: functional.find(i => i.name === 'ellipsis-h')!.svg,  label: 'More',      onClick: () => console.log('more') },
]

type SortDir = 'asc' | 'desc' | null
type DemoSortCol = 'name' | 'status' | 'assignee' | 'type' | 'dueDate' | 'createdOn' | 'completedOn'

/* ── Demo table data ─────────────────────────────────────── */

const STATUS_ORDER: Record<string, number> = {
  'Draft': 0, 'In progress': 1, 'Overdue': 2, 'Completed': 3,
}


interface DemoRow {
  id:          number
  name:        string
  status:      string
  assignee:    string
  assigneeSrc?: string
  assigneeExtra?: number
  assigneeColor?: string
  assigneeShape?: 'circle' | 'square'
  type:        string
  dueDate:     string        // 'YYYY-MM-DD' for sorting
  dueDateLabel: string       // 'Apr 24, 2025' for display
  createdOn:    string
  createdOnLabel: string
  completedOn:  string | null
  completedOnLabel: string
  overdue:     boolean
}

const DEMO_ROWS: DemoRow[] = [
  {
    id: 1,
    name: 'Distribute new policy across departments and based on this prepare a report.',
    status: 'Draft',
    assignee: 'Olivia Thompson', assigneeSrc: 'https://i.pravatar.cc/64?img=47',
    type: 'Action',
    dueDate: '2025-04-24', dueDateLabel: 'Apr 24, 2025',
    createdOn: '2025-04-17', createdOnLabel: 'Apr 17, 2025',
    completedOn: null, completedOnLabel: '–',
    overdue: false,
  },
  {
    id: 2,
    name: 'Sharing of financial information',
    status: 'Draft',
    assignee: 'Board of Directors', assigneeExtra: 1,
    assigneeColor: 'var(--tag-kepeel)', assigneeShape: 'square',
    type: 'Signature',
    dueDate: '2025-05-29', dueDateLabel: 'May 29, 2025',
    createdOn: '2025-05-21', createdOnLabel: 'May 21, 2025',
    completedOn: null, completedOnLabel: '–',
    overdue: false,
  },
  {
    id: 3,
    name: 'Consideration of a structured approach to assessment of Nursing Homes',
    status: 'Draft',
    assignee: 'Michael Donaldson',
    type: 'Document',
    dueDate: '2025-05-20', dueDateLabel: 'May 20, 2025',
    createdOn: '2025-05-11', createdOnLabel: 'May 11, 2025',
    completedOn: null, completedOnLabel: '–',
    overdue: false,
  },
  {
    id: 4,
    name: 'Distribute new policy across departments and based on this prepare a report.',
    status: 'Overdue',
    assignee: 'Liam Carter', assigneeExtra: 3,
    type: 'Action',
    dueDate: '2025-04-24', dueDateLabel: 'Apr 24, 2025',
    createdOn: '2025-04-14', createdOnLabel: 'Apr 14, 2025',
    completedOn: null, completedOnLabel: '–',
    overdue: true,
  },
  {
    id: 5,
    name: 'Sharing of financial information Q2–Q3',
    status: 'In progress',
    assignee: 'Logan White',
    type: 'Action',
    dueDate: '2025-04-24', dueDateLabel: 'Apr 24, 2025',
    createdOn: '2025-04-12', createdOnLabel: 'Apr 12, 2025',
    completedOn: null, completedOnLabel: '–',
    overdue: false,
  },
  {
    id: 6,
    name: 'Please work on a strategy',
    status: 'Completed',
    assignee: 'Olivia Thompson', assigneeSrc: 'https://i.pravatar.cc/64?img=47',
    type: 'Document',
    dueDate: '2025-05-29', dueDateLabel: 'May 29, 2025',
    createdOn: '2025-05-19', createdOnLabel: 'May 19, 2025',
    completedOn: '2025-04-24', completedOnLabel: 'Apr 24, 2025',
    overdue: false,
  },
]

function sortRows(rows: DemoRow[], col: DemoSortCol | null, dir: SortDir): DemoRow[] {
  if (!col || !dir) return rows
  return [...rows].sort((a, b) => {
    let cmp = 0
    switch (col) {
      case 'name':        cmp = a.name.localeCompare(b.name); break
      case 'status':      cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99); break
      case 'assignee':    cmp = a.assignee.localeCompare(b.assignee); break
      case 'type':        cmp = a.type.localeCompare(b.type); break
      case 'dueDate':     cmp = a.dueDate.localeCompare(b.dueDate); break
      case 'createdOn':   cmp = a.createdOn.localeCompare(b.createdOn); break
      case 'completedOn':
        cmp = (a.completedOn ?? '9999').localeCompare(b.completedOn ?? '9999'); break
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

export default function TableCellPage() {
  const [sortName, setSortName] = useState<SortDir>(null)
  const [sortRole, setSortRole] = useState<SortDir>(null)

  // Full demo table sort
  const [demoSortCol, setDemoSortCol] = useState<DemoSortCol | null>(null)
  const [demoSortDir, setDemoSortDir] = useState<SortDir>(null)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  function cycleSort(current: SortDir, set: (d: SortDir) => void) {
    set(current === null ? 'asc' : current === 'asc' ? 'desc' : null)
  }

  function handleDemoSort(col: DemoSortCol) {
    if (demoSortCol === col) {
      const next: SortDir = demoSortDir === null ? 'asc' : demoSortDir === 'asc' ? 'desc' : null
      setDemoSortDir(next)
      if (next === null) setDemoSortCol(null)
    } else {
      setDemoSortCol(col)
      setDemoSortDir('asc')
    }
  }

  const sortedRows = sortRows(DEMO_ROWS, demoSortCol, demoSortDir)
  const typeIconMap: Record<string, string> = {
    'Action':    checkCircleIcon,
    'Signature': fileSignIcon,
    'Document':  filePlusIcon,
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Table Cell</h1>
      <p className={styles.subtitle}>
        Figma nodes 31434-6336 · 35294-4837
      </p>

      {/* ── Header cell states ─────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Header cell</h2>
      <p className={styles.description}>
        15px Medium. Sort icon appears on hover; persists when sorted.
        Click to cycle: unsorted → asc → desc → unsorted.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.row}>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell count={42}>Documents</TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sortName}
                onSort={() => cycleSort(sortName, setSortName)}
              >
                Name
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sortRole}
                onSort={() => cycleSort(sortRole, setSortRole)}
              >
                Role
              </TableHeaderCell>
            </tr>
          </thead>
        </table>
      </div>

      {/* ── Body cell variants ─────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Body cell variants</h2>
      <p className={styles.description}>
        All variants share the same padding (14px 16px) and height (48px).
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <tbody>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>Text only primary</td>
              <TableCell>Cell name</TableCell>
            </tr>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>Text only secondary</td>
              <TableCell secondary>Cell name</TableCell>
            </tr>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>Text plus badge counter</td>
              <TableCell count={6}>Cell name</TableCell>
            </tr>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>Icon and text</td>
              <TableCell icon={plusIcon}>Cell name</TableCell>
            </tr>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>Icon only</td>
              <TableCell icon={plusIcon} />
            </tr>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>Badge only</td>
              <TableCell badge="Active" badgeColor="var(--green-25)" />
            </tr>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>Dropdown</td>
              <TableCell dropdown onDropdownClick={() => console.log('dropdown')}>
                Selected value
              </TableCell>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Avatar cell variants ───────────────────────────── */}
      <h2 className={styles.sectionTitle}>Avatar cell — horizontal</h2>
      <p className={styles.description}>
        24px avatar · 1-letter initials · 15px Regular. Optional +N overflow.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <tbody>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>Default</td>
              <TableAvatarCell name="Olivia Thompson" />
            </tr>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>With photo</td>
              <TableAvatarCell name="Jordan Parker" src="https://i.pravatar.cc/64?img=47" />
            </tr>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>With overflow</td>
              <TableAvatarCell name="Alex Rivera" extra={3} />
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className={styles.sectionTitle}>Avatar cell — info</h2>
      <p className={styles.description}>
        40px avatar · 2-letter initials · name 15px Medium + info 14px Regular · height 64px.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <tbody>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>With info</td>
              <TableAvatarCell type="info" name="Olivia Thompson" info="thompsonolivia@gmail.com" />
            </tr>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>With photo</td>
              <TableAvatarCell type="info" name="Jordan Parker" src="https://i.pravatar.cc/64?img=12" info="jordan@example.com" />
            </tr>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>No info</td>
              <TableAvatarCell type="info" name="Alex Rivera" />
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className={styles.sectionTitle}>Avatar cell — vertical</h2>
      <p className={styles.description}>
        32px avatar · 2-letter initials · name 15px Medium centered below.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <tbody>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>Default</td>
              <TableAvatarCell type="vertical" name="Olivia Thompson" />
            </tr>
            <tr className={styles.row}>
              <td className={styles.variantLabel}>With photo</td>
              <TableAvatarCell type="vertical" name="Jordan Parker" src="https://i.pravatar.cc/64?img=12" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Full table example ─────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Full table example</h2>
      <p className={styles.description}>
        Figma node 35297-5032. Click any column header to sort. All columns sortable.
      </p>
      <div className={styles.demoTableWrap}>
        <table className={styles.demoTable}>
          <colgroup>{[undefined, 168, 256, 160, 144, 144, 144, 0].map((w, i) => <col key={i} style={w ? { width: w } : undefined} />)}</colgroup>
          <thead>
            <tr>
              {(['name', 'status', 'assignee', 'type', 'dueDate', 'createdOn', 'completedOn'] as DemoSortCol[]).map((col, i) => (
                <TableHeaderCell
                  key={col}
                  sortable
                  sortDirection={demoSortCol === col ? demoSortDir : null}
                  onSort={() => handleDemoSort(col)}
                >
                  {['Name', 'Status', 'Assignee', 'Type', 'Due date', 'Created on', 'Completed on'][i]}
                </TableHeaderCell>
              ))}
              <th style={{ width: 0, padding: 0, position: 'sticky', right: 0 }} />
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, idx) => (
              <tr
                key={row.id}
                className={idx % 2 === 0 ? styles.demoRowOdd : styles.demoRowEven}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <TableCell error={row.overdue}>{row.name}</TableCell>
                <TableCell
                  badge={row.status}
                  badgeColor={
                    row.status === 'Draft'       ? 'var(--yellow-50)' :
                    row.status === 'Overdue'     ? 'var(--red-50)'    :
                    row.status === 'In progress' ? 'var(--blue-50)'   :
                                                   'var(--green-50)'
                  }
                />
                <TableAvatarCell
                  name={row.assignee}
                  src={row.assigneeSrc}
                  extra={row.assigneeExtra}
                  avatarColor={row.assigneeColor}
                  avatarShape={row.assigneeShape}
                />
                <TableCell icon={typeIconMap[row.type]}>{row.type}</TableCell>
                <TableCell error={row.overdue}>{row.dueDateLabel}</TableCell>
                <TableCell>{row.createdOnLabel}</TableCell>
                <TableCell>{row.completedOnLabel}</TableCell>
                <TableActionsCell actions={ROW_ACTIONS} visible={hoveredRow === row.id} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
