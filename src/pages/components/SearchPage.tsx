import { useState, useMemo, useRef, useEffect } from 'react'
import { Search } from '../../components/Search/Search'
import { SearchFilterPanel } from '../../components/Search/SearchFilterPanel'
import styles from './SearchPage.module.css'
import { SourceLink } from '../SourceLink'

/* ── Task data ──────────────────────────────────────────────────────────── */

const CURRENT_USER = 'Jaroslav G.'

type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked'
type TaskType   = 'task' | 'milestone' | 'project' | 'epic'

interface Task {
  id:        number
  name:      string
  status:    TaskStatus
  assignee:  string
  type:      TaskType
  dueDate:   string   // YYYY-MM-DD
  createdBy: string
}

const ALL_TASKS: Task[] = [
  { id:  1, name: 'Set up authentication flow',   status: 'in-progress', assignee: 'Jaroslav G.', type: 'task',      dueDate: '2026-04-18', createdBy: 'Jaroslav G.' },
  { id:  2, name: 'Design system token audit',    status: 'done',        assignee: 'Elena K.',    type: 'task',      dueDate: '2026-04-10', createdBy: 'Jaroslav G.' },
  { id:  3, name: 'Q2 roadmap planning',          status: 'todo',        assignee: 'Marcus L.',   type: 'milestone', dueDate: '2026-05-01', createdBy: 'Marcus L.'   },
  { id:  4, name: 'API rate limiting',            status: 'blocked',     assignee: 'Jaroslav G.', type: 'task',      dueDate: '2026-04-25', createdBy: 'Elena K.'    },
  { id:  5, name: 'Board Portal v2.0 release',    status: 'in-progress', assignee: 'Elena K.',    type: 'project',   dueDate: '2026-06-15', createdBy: 'Jaroslav G.' },
  { id:  6, name: 'User onboarding redesign',     status: 'todo',        assignee: 'Sara M.',     type: 'epic',      dueDate: '2026-05-20', createdBy: 'Sara M.'     },
  { id:  7, name: 'Fix dashboard loading bug',    status: 'done',        assignee: 'Marcus L.',   type: 'task',      dueDate: '2026-04-08', createdBy: 'Marcus L.'   },
  { id:  8, name: 'Search component integration', status: 'in-progress', assignee: 'Jaroslav G.', type: 'task',      dueDate: '2026-04-20', createdBy: 'Jaroslav G.' },
  { id:  9, name: 'Export to CSV feature',        status: 'todo',        assignee: 'Sara M.',     type: 'task',      dueDate: '2026-04-30', createdBy: 'Jaroslav G.' },
  { id: 10, name: 'Performance profiling sprint', status: 'todo',        assignee: 'Elena K.',    type: 'milestone', dueDate: '2026-05-10', createdBy: 'Elena K.'    },
  { id: 11, name: 'Notification system overhaul', status: 'blocked',     assignee: 'Marcus L.',   type: 'epic',      dueDate: '2026-05-25', createdBy: 'Marcus L.'   },
  { id: 12, name: 'Mobile responsive layout',     status: 'in-progress', assignee: 'Sara M.',     type: 'task',      dueDate: '2026-04-22', createdBy: 'Sara M.'     },
  { id: 13, name: 'Permission roles setup',       status: 'todo',        assignee: 'Jaroslav G.', type: 'task',      dueDate: '2026-05-05', createdBy: 'Jaroslav G.' },
  { id: 14, name: 'Billing integration',          status: 'todo',        assignee: 'Elena K.',    type: 'project',   dueDate: '2026-07-01', createdBy: 'Jaroslav G.' },
  { id: 15, name: 'Sprint review automation',     status: 'done',        assignee: 'Marcus L.',   type: 'task',      dueDate: '2026-04-05', createdBy: 'Marcus L.'   },
  { id: 16, name: 'Dark mode support',            status: 'todo',        assignee: 'Sara M.',     type: 'epic',      dueDate: '2026-06-30', createdBy: 'Jaroslav G.' },
  { id: 17, name: 'Dependency graph view',        status: 'in-progress', assignee: 'Jaroslav G.', type: 'task',      dueDate: '2026-04-28', createdBy: 'Elena K.'    },
  { id: 18, name: 'Analytics dashboard',          status: 'todo',        assignee: 'Elena K.',    type: 'milestone', dueDate: '2026-05-15', createdBy: 'Jaroslav G.' },
  { id: 19, name: 'Comment threading',            status: 'blocked',     assignee: 'Sara M.',     type: 'task',      dueDate: '2026-04-26', createdBy: 'Sara M.'     },
  { id: 20, name: 'Custom field builder',         status: 'todo',        assignee: 'Marcus L.',   type: 'epic',      dueDate: '2026-08-01', createdBy: 'Jaroslav G.' },
]

const PAGE_SIZE = 10

/* ── Filter config ──────────────────────────────────────────────────────── */

const QUICK_FILTER_LABELS = ['Assigned to me', 'Created by me', 'Due within 30 days']

const STATUS_OPTS = [
  { value: 'todo',        label: 'To do'       },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done',        label: 'Done'        },
  { value: 'blocked',     label: 'Blocked'     },
]

const ASSIGNEE_OPTS = [
  { value: 'Jaroslav G.', label: 'Jaroslav G.' },
  { value: 'Elena K.',    label: 'Elena K.'    },
  { value: 'Marcus L.',   label: 'Marcus L.'   },
  { value: 'Sara M.',     label: 'Sara M.'     },
]

const TYPE_OPTS = [
  { value: 'task',      label: 'Task'      },
  { value: 'milestone', label: 'Milestone' },
  { value: 'project',   label: 'Project'   },
  { value: 'epic',      label: 'Epic'      },
]

/* ── Display helpers ────────────────────────────────────────────────────── */

const STATUS_LABEL: Record<TaskStatus, string> = {
  'todo':        'To do',
  'in-progress': 'In progress',
  'done':        'Done',
  'blocked':     'Blocked',
}

const TYPE_LABEL: Record<TaskType, string> = {
  task:      'Task',
  milestone: 'Milestone',
  project:   'Project',
  epic:      'Epic',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

/** Search across all visible columns */
const taskMatchesQuery = (task: Task, q: string) => {
  const lq = q.toLowerCase()
  return (
    task.name.toLowerCase().includes(lq) ||
    STATUS_LABEL[task.status].toLowerCase().includes(lq) ||
    task.assignee.toLowerCase().includes(lq) ||
    TYPE_LABEL[task.type].toLowerCase().includes(lq) ||
    formatDate(task.dueDate).toLowerCase().includes(lq)
  )
}

/* ── Highlight helpers ──────────────────────────────────────────────────── */

/** All occurrences of `query` in `text`, case-insensitive → [start, end] pairs */
function findOccurrences(text: string, query: string): [number, number][] {
  if (!query) return []
  const result: [number, number][] = []
  const lt = text.toLowerCase()
  const lq = query.toLowerCase()
  let i = 0
  while ((i = lt.indexOf(lq, i)) !== -1) { result.push([i, i + lq.length]); i += lq.length }
  return result
}

interface MatchEntry {
  taskId: number
  field:  string
  start:  number
  end:    number
  gi:     number   // global 1-based index
}

/** Ordered list of text fields used for highlight search (mirrors table column order) */
const CELL_GETTERS: { field: string; get: (t: Task) => string }[] = [
  { field: 'name',     get: t => t.name },
  { field: 'status',   get: t => STATUS_LABEL[t.status] },
  { field: 'assignee', get: t => t.assignee },
  { field: 'type',     get: t => TYPE_LABEL[t.type] },
  { field: 'dueDate',  get: t => formatDate(t.dueDate) },
]

/** Build flat list of all match positions across all tasks in table order */
function buildMatchIdx(tasks: Task[], q: string): MatchEntry[] {
  if (!q.trim()) return []
  const entries: MatchEntry[] = []
  let gi = 1
  for (const task of tasks) {
    for (const { field, get } of CELL_GETTERS) {
      for (const [s, e] of findOccurrences(get(task), q)) {
        entries.push({ taskId: task.id, field, start: s, end: e, gi: gi++ })
      }
    }
  }
  return entries
}

/** Renders `text` with inline yellow highlights for each match entry */
function HlText({
  text,
  matches,
  current,
}: {
  text:    string
  matches: MatchEntry[]
  current: number
}) {
  if (matches.length === 0) return <>{text}</>
  const parts: React.ReactNode[] = []
  let pos = 0
  for (const m of matches) {
    if (pos < m.start) parts.push(text.slice(pos, m.start))
    parts.push(
      <mark
        key={m.gi}
        className={m.gi === current ? styles.markFocus : styles.mark}
        data-match-id={m.gi}
      >
        {text.slice(m.start, m.end)}
      </mark>
    )
    pos = m.end
  }
  if (pos < text.length) parts.push(text.slice(pos))
  return <>{parts}</>
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function SearchPage() {
  /* Counter navigation demo */
  const [counterVal,     setCounterVal]     = useState('Board Portal')
  const [counterCurrent, setCounterCurrent] = useState(2)
  const COUNTER_TOTAL = 5

  /* Highlight search demo */
  const [hlQuery,   setHlQuery]   = useState('')
  const [hlCurrent, setHlCurrent] = useState(1)
  const hlTableRef = useRef<HTMLDivElement>(null)

  const hlMatches = useMemo(() => buildMatchIdx(ALL_TASKS, hlQuery.trim()), [hlQuery])
  const hlTotal   = hlMatches.length
  const hlClamp   = hlTotal === 0 ? 0 : Math.min(Math.max(hlCurrent, 1), hlTotal)

  /* Scroll current match into view inside the table container */
  useEffect(() => {
    if (!hlClamp) return
    const el = hlTableRef.current?.querySelector(`[data-match-id="${hlClamp}"]`)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [hlClamp])

  const [val,         setVal]         = useState('')
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [visible,     setVisible]     = useState(PAGE_SIZE)

  /* Quick filters */
  const [activeQuick, setActiveQuick] = useState<Set<string>>(new Set())

  /* Dropdown filters */
  const [statusVal,   setStatusVal]   = useState('')
  const [assigneeVal, setAssigneeVal] = useState('')
  const [typeVal,     setTypeVal]     = useState('')

  /* Filter button section — demo panels */
  const [demo1Open, setDemo1Open] = useState(false)
  const [demo2Open, setDemo2Open] = useState(false)
  const [demo3Open, setDemo3Open] = useState(false)

  /* empty panel for demos without active filters */
  const demoPanelContent = (
    <SearchFilterPanel
      quickFilters={QUICK_FILTER_LABELS.map(label => ({
        label, active: false, onToggle: () => {},
      }))}
      dropdowns={[
        { placeholder: 'Status',   options: STATUS_OPTS,   value: '', onChange: () => {} },
        { placeholder: 'Assignee', options: ASSIGNEE_OPTS, value: '', onChange: () => {} },
        { placeholder: 'Type',     options: TYPE_OPTS,     value: '', onChange: () => {} },
      ]}
      onClearAll={() => {}}
    />
  )

  /* preselected panel for the "Filter active" demo — with real state */
  const [demo2Quick,  setDemo2Quick]  = useState<Set<string>>(new Set(['Assigned to me']))
  const [demo2Status, setDemo2Status] = useState('in-progress')

  const demoActivePanelContent = (
    <SearchFilterPanel
      quickFilters={QUICK_FILTER_LABELS.map(label => ({
        label,
        active: demo2Quick.has(label),
        onToggle: () => setDemo2Quick(prev => {
          const next = new Set(prev)
          next.has(label) ? next.delete(label) : next.add(label)
          return next
        }),
      }))}
      dropdowns={[
        { placeholder: 'Status',   options: STATUS_OPTS,   value: demo2Status, onChange: v => setDemo2Status(v as string) },
        { placeholder: 'Assignee', options: ASSIGNEE_OPTS, value: '',          onChange: () => {}                         },
        { placeholder: 'Type',     options: TYPE_OPTS,     value: '',          onChange: () => {}                         },
      ]}
      onClearAll={() => { setDemo2Quick(new Set()); setDemo2Status('') }}
    />
  )

  const hasActiveFilters =
    activeQuick.size > 0 || !!statusVal || !!assigneeVal || !!typeVal

  /* Filter logic */
  const filtered = ALL_TASKS.filter(task => {
    if (val.trim() && !taskMatchesQuery(task, val.trim())) return false
    if (statusVal   && task.status   !== statusVal)   return false
    if (assigneeVal && task.assignee !== assigneeVal) return false
    if (typeVal     && task.type     !== typeVal)     return false

    if (activeQuick.has('Assigned to me')    && task.assignee  !== CURRENT_USER) return false
    if (activeQuick.has('Created by me')     && task.createdBy !== CURRENT_USER) return false
    if (activeQuick.has('Due within 30 days')) {
      const due   = new Date(task.dueDate)
      const limit = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      if (due > limit) return false
    }

    return true
  })

  const handleChange = (v: string) => {
    setVal(v)
    setVisible(PAGE_SIZE)
  }

  const handleClearAll = () => {
    setActiveQuick(new Set())
    setStatusVal('')
    setAssigneeVal('')
    setTypeVal('')
  }

  const toggleQuick = (label: string) => {
    setActiveQuick(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Search</h1>
      <SourceLink path="src/components/Search/Search.tsx" />

      {/* ── Sizes ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sizes</h2>
        <div className={styles.row}>
          <div className={styles.col}>
            <p className={styles.label}>S — 32px</p>
            <Search size="s" placeholder="Search" />
          </div>
          <div className={styles.col}>
            <p className={styles.label}>M — 40px</p>
            <Search size="m" placeholder="Search" />
          </div>
          <div className={styles.col}>
            <p className={styles.label}>L — 48px</p>
            <Search size="l" placeholder="Search" />
          </div>
        </div>
      </section>

      {/* ── States ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>States</h2>
        <div className={styles.row}>
          <div className={styles.col}>
            <p className={styles.label}>Default</p>
            <Search placeholder="Search" />
          </div>
          <div className={styles.col}>
            <p className={styles.label}>With value</p>
            <Search value="General" placeholder="Search" />
          </div>
          <div className={styles.col}>
            <p className={styles.label}>Disabled</p>
            <Search placeholder="Search" disabled />
          </div>
          <div className={styles.col}>
            <p className={styles.label}>Disabled + value</p>
            <Search value="General" placeholder="Search" disabled />
          </div>
        </div>
      </section>

      {/* ── Filter variants ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Filter button</h2>
        <div className={styles.row}>
          <div className={styles.col}>
            <p className={styles.label}>With filter</p>
            <Search
              placeholder="Search"
              filter
              filterPanelOpen={demo1Open}
              onFilterClick={() => setDemo1Open(o => !o)}
              filterPanel={demoPanelContent}
            />
          </div>
          <div className={styles.col}>
            <p className={styles.label}>Filter active</p>
            <Search
              placeholder="Search"
              filter
              filterActive={demo2Quick.size > 0 || !!demo2Status}
              filterPanelOpen={demo2Open}
              onFilterClick={() => setDemo2Open(o => !o)}
              filterPanel={demoActivePanelContent}
            />
          </div>
          <div className={styles.col}>
            <p className={styles.label}>With value + filter</p>
            <Search
              value="General"
              placeholder="Search"
              filter
              filterPanelOpen={demo3Open}
              onFilterClick={() => setDemo3Open(o => !o)}
              filterPanel={demoPanelContent}
            />
          </div>
        </div>
      </section>

      {/* ── Counter navigation ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Counter navigation</h2>
        <div className={styles.row}>
          <div className={styles.col}>
            <p className={styles.label}>S — 32px</p>
            <Search
              size="s"
              value="Board Portal"
              counter={{ current: 2, total: 5 }}
            />
          </div>
          <div className={styles.col}>
            <p className={styles.label}>M — 40px</p>
            <Search
              size="m"
              value="Board Portal"
              counter={{ current: 2, total: 5 }}
            />
          </div>
          <div className={styles.col}>
            <p className={styles.label}>L — 48px</p>
            <Search
              size="l"
              value="Board Portal"
              counter={{ current: 2, total: 5 }}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.col}>
            <p className={styles.label}>No results</p>
            <Search
              value="xyz"
              counter={{ current: 0, total: 0 }}
            />
          </div>
          <div className={styles.col}>
            <p className={styles.label}>Interactive</p>
            <Search
              value={counterVal}
              onChange={setCounterVal}
              onClear={() => setCounterVal('')}
              counter={{ current: counterCurrent, total: COUNTER_TOTAL }}
              onPrev={() => setCounterCurrent(c => Math.max(1, c - 1))}
              onNext={() => setCounterCurrent(c => Math.min(COUNTER_TOTAL, c + 1))}
            />
          </div>
          <div className={styles.col}>
            <p className={styles.label}>Disabled</p>
            <Search
              value="Board Portal"
              counter={{ current: 2, total: 5 }}
              disabled
            />
          </div>
        </div>
      </section>

      {/* ── Page search with highlight ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Page search with highlight</h2>

        <div className={styles.demoSearch}>
          <Search
            value={hlQuery}
            onChange={v => { setHlQuery(v); setHlCurrent(1) }}
            onClear={() => { setHlQuery(''); setHlCurrent(1) }}
            placeholder="Search"
            counter={hlQuery.trim() ? { current: hlClamp, total: hlTotal } : undefined}
            onPrev={() => setHlCurrent(c => Math.max(1, c - 1))}
            onNext={() => setHlCurrent(c => Math.min(hlTotal || 1, c + 1))}
          />
        </div>

        <div ref={hlTableRef} className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.th} ${styles.thName}`}>Name</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Assignee</th>
                <th className={styles.th}>Type</th>
                <th className={`${styles.th} ${styles.thDate}`}>Due date</th>
              </tr>
            </thead>
            <tbody>
              {ALL_TASKS.map(task => (
                <tr key={task.id} className={styles.tr}>
                  {CELL_GETTERS.map(({ field, get }) => {
                    const text = get(task)
                    const cm   = hlMatches.filter(m => m.taskId === task.id && m.field === field)
                    return (
                      <td
                        key={field}
                        className={
                          field === 'dueDate'
                            ? `${styles.td} ${styles.tdDate}`
                            : styles.td
                        }
                      >
                        <HlText text={text} matches={cm} current={hlClamp} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Page search ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Page search</h2>

        <div className={styles.demoSearch}>
          <Search
            value={val}
            onChange={handleChange}
            onClear={() => { setVal(''); setVisible(PAGE_SIZE) }}
            placeholder="Search"
            filter
            filterActive={hasActiveFilters}
            onFilterClick={() => setFilterOpen(o => !o)}
            filterPanelOpen={filterOpen}
            filterPanel={
              <SearchFilterPanel
                quickFilters={QUICK_FILTER_LABELS.map(label => ({
                  label,
                  active: activeQuick.has(label),
                  onToggle: () => toggleQuick(label),
                }))}
                dropdowns={[
                  { placeholder: 'Status',   options: STATUS_OPTS,   value: statusVal,   onChange: v => setStatusVal(v as string)   },
                  { placeholder: 'Assignee', options: ASSIGNEE_OPTS, value: assigneeVal, onChange: v => setAssigneeVal(v as string) },
                  { placeholder: 'Type',     options: TYPE_OPTS,     value: typeVal,     onChange: v => setTypeVal(v as string)     },
                ]}
                onClearAll={handleClearAll}
              />
            }
            size="m"
          />
        </div>

        <div className={styles.tableWrap}>
          {filtered.length === 0 ? (
            <p className={styles.noResults}>No results</p>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={`${styles.th} ${styles.thName}`}>Name</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Assignee</th>
                    <th className={styles.th}>Type</th>
                    <th className={`${styles.th} ${styles.thDate}`}>Due date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, visible).map(task => (
                    <tr key={task.id} className={styles.tr}>
                      <td className={styles.td}>{task.name}</td>
                      <td className={styles.td}>{STATUS_LABEL[task.status]}</td>
                      <td className={styles.td}>{task.assignee}</td>
                      <td className={styles.td}>{TYPE_LABEL[task.type]}</td>
                      <td className={`${styles.td} ${styles.tdDate}`}>
                        {formatDate(task.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visible < filtered.length && (
                <button
                  className={styles.loadMoreBtn}
                  onClick={() => setVisible(v => v + PAGE_SIZE)}
                >
                  Load more
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
