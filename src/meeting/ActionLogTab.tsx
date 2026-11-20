/* ActionLogTab — Meeting › Action log. Figma: Meetings 33037:404462
   Flows: status filter · assignee filter · list (expand/collapse, export) ·
   empty states · open task drawer. */

import { useMemo, useRef, useState } from 'react'
import { Button }          from '../components/Button/Button'
import { Dropdown, type DropdownOption } from '../components/Dropdown/Dropdown'
import { Drawer }          from '../components/Drawer/Drawer'
import { Modal }           from '../components/Modal/Modal'
import { BadgeCounter }    from '../components/BadgeCounter/BadgeCounter'
import { StickyFooter }    from '../components/StickyFooter/StickyFooter'
import { Tooltip }         from '../components/Tooltip/Tooltip'
import { BadgeStatus }     from '../components/BadgeStatus/BadgeStatus'
import { Avatar }          from '../components/Avatar/Avatar'
import { EmptyState }      from '../components/EmptyState/EmptyState'
import { TableCell, TableHeaderCell } from '../components/TableCell/TableCell'
import { TableAvatarCell } from '../components/TableAvatarCell/TableAvatarCell'
import { TextField }       from '../components/TextField/TextField'
import { DatePicker }      from '../components/DatePicker/DatePicker'
import { Checkbox }        from '../components/Checkbox/Checkbox'
import { Autocomplete, type AutocompleteOption } from '../components/Autocomplete/Autocomplete'
import { ActionMenu }      from './ActionMenu'
import { ColumnsMenu }     from './ColumnsMenu'
import { useBreakpoint }   from '../hooks/useBreakpoint'
import { arrows }          from '../icons/arrows'
import { actions }         from '../icons/actions'
import { condition }       from '../icons/condition'
import { fileFormat }      from '../icons/fileFormat'
import { files }           from '../icons/files'
import { dateTime }        from '../icons/dateTime'
import {
  SEED_GROUPS, STATUSES, STATUS_COLOR, USERS, NO_FILTERS,
  filterGroups, hasFilters, formatDue, toCsv, userById,
  type ActionGroup, type ActionItem, type ActionStatus, type ActionFilters,
} from './actionLogData'
import styles from './ActionLogTab.module.css'

/* ── Icons ─────────────────────────────────────────────────── */
const svgOf = (set: { name: string; svg: string }[], name: string) => set.find(i => i.name === name)!.svg
const sortingSvg     = svgOf(arrows,     'expand')
const chevronDownSvg = svgOf(arrows,     'angle-down-fill')
const chevronRightSvg = svgOf(arrows,    'angle-right-fill')
const multiplySvg    = svgOf(actions,    'multiply')
const plusSvg        = svgOf(actions,    'plus')
const actionSvg      = svgOf(dateTime,   'tasks')
const signatureSvg   = svgOf(files,      'file-signature')
const surveySvg      = svgOf(files,      'file0-survey')
const trashSvg       = svgOf(actions,    'trash-alt')
const downloadSvg    = svgOf(actions,    'download-alt')
const filterOffSvg   = svgOf(actions,    'filter-slash')
const filterSvg      = svgOf(actions,    'filter')
const checkCircleSvg = svgOf(condition,  'check-circle')
const pdfSvg         = svgOf(fileFormat, 'format-pdf')

const avatarUrl = (id: string) => `https://i.pravatar.cc/40?u=${id}`
const initialsOf = (name: string) => {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '') + (p[p.length - 1]?.[0] ?? '')).toUpperCase()
}
const Icon = ({ svg }: { svg: string }) => <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />

/* ── Filter options ────────────────────────────────────────── */
const STATUS_OPTIONS: DropdownOption[] = STATUSES.map(s => ({ value: s, label: s }))
const ASSIGNEE_OPTIONS: DropdownOption[] = USERS.map(u => ({
  value: u.id,
  label: u.name,
  avatar: { src: u.photo ? avatarUrl(u.id) : undefined, initials: initialsOf(u.name) },
}))

/* Assignee picker options (Figma Tasks 4354:64992): groups, then users. */
const GROUP_OPTIONS: AutocompleteOption[] = [
  { value: 'g-audit', label: 'Audit Committee',   avatar: { type: 'group', initials: 'A' } },
  { value: 'g-board', label: 'Board of Directors', avatar: { type: 'group', initials: 'B' } },
]
const USER_OPTIONS: AutocompleteOption[] = USERS.map(u => ({
  value: u.id,
  label: u.name,
  avatar: { src: u.photo ? avatarUrl(u.id) : undefined, initials: initialsOf(u.name) },
}))
const PEOPLE_OPTIONS: AutocompleteOption[] = [...GROUP_OPTIONS, ...USER_OPTIONS]

/* Agenda items for the "Linked to" picker (Figma Tasks 4354:66800). */
const AGENDA_OPTIONS: AutocompleteOption[] = [
  '1. Call to Order',
  '2. Results of 2023 Q1',
  '2.1. Financial Performance: Growth Indicators',
  '3. CEO Report to Shareholders',
  '4. Committee Reports',
].map(l => ({ value: l, label: l }))

const statusBadgeType = (s: ActionStatus) =>
  s === 'Completed' ? 'positive' : s === 'Overdue' ? 'danger' : s === 'Draft' ? 'warning' : 'neutral'

/* ── Table columns — customisable via the header "columns" menu ── */
type ColKey = 'status' | 'assignee' | 'due'
const COLUMN_LABEL: Record<ColKey, string> = { status: 'Status', assignee: 'Assignee', due: 'Due date' }
const DEFAULT_COLUMN_ORDER: ColKey[] = ['status', 'assignee', 'due']

/* ── New request (Request ▾ menu) — empty drafts as in the Tasks drawer ── */
type RequestKind = 'action' | 'signature' | 'survey'
const REQUEST_KINDS: Record<RequestKind, { label: string; icon: string; titlePlaceholder: string }> = {
  action:    { label: 'Action',            icon: actionSvg,    titlePlaceholder: 'Add title' },
  signature: { label: 'Signature request', icon: signatureSvg, titlePlaceholder: 'Task title' },
  survey:    { label: 'Survey',            icon: surveySvg,    titlePlaceholder: 'Add title' },
}

/* ── Component ─────────────────────────────────────────────── */
export interface ActionLogTabProps {
  /** Seed data; defaults to the Figma sample meetings. */
  groups?: ActionGroup[]
}

export function ActionLogTab({ groups: seed = SEED_GROUPS }: ActionLogTabProps = {}) {
  const [groups,   setGroups]   = useState<ActionGroup[]>(seed)
  const [filters,  setFilters]  = useState<ActionFilters>(NO_FILTERS)
  /* The first two meetings start open, as in the mockups. */
  const [open,     setOpen]     = useState<Set<string>>(() => new Set(seed.slice(0, 2).map(g => g.id)))
  const [selected, setSelected] = useState<string | null>(null)
  /* A new, empty request being drafted (Request ▾ menu). Mutually exclusive with `selected`. */
  const [creating, setCreating] = useState<{ kind: RequestKind; key: number } | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [colOrder, setColOrder] = useState<ColKey[]>(DEFAULT_COLUMN_ORDER)
  const [colHidden, setColHidden] = useState<ReadonlySet<string>>(new Set())
  const shownCols = colOrder.filter(k => !colHidden.has(k))
  const lastKind = useRef<RequestKind>('action')
  if (creating) lastKind.current = creating.kind
  function startRequest(kind: RequestKind) {
    setSelected(null)
    setDraftTitle('')
    setCreating(c => ({ kind, key: (c?.key ?? 0) + 1 }))
  }
  const [filtersOpen, setFiltersOpen] = useState(false)

  /* Tasks responsive pattern: inline drawer ≥1024 (460 desktop / 360 laptop),
     overlay drawer below (460 tablet, full-width mobile). */
  const { tier, isCompact } = useBreakpoint()
  const drawerOverlay = tier === 'mobile'
  const drawerWidth = drawerOverlay ? (isCompact ? 460 : '100%') : tier === 'laptop' ? 360 : 460

  const visible = useMemo(() => filterGroups(groups, filters), [groups, filters])
  const filtering = hasFilters(filters)
  const totalActions = groups.reduce((n, g) => n + g.actions.length, 0)

  /* Active filters show their matches, so every surviving meeting opens. */
  function applyFilters(next: ActionFilters) {
    setFilters(next)
    setOpen(hasFilters(next)
      ? new Set(filterGroups(groups, next).map(g => g.id))
      : new Set(seed.slice(0, 2).map(g => g.id)))
  }

  const toggleGroup = (id: string) =>
    setOpen(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const allOpen = visible.length > 0 && visible.every(g => open.has(g.id))
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(visible.map(g => g.id)))

  function exportCsv() {
    const blob = new Blob([toCsv(visible)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'action-log.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ── Drawer state — keeps the last task while the panel slides out ── */
  const selectedItem = useMemo(
    () => groups.flatMap(g => g.actions).find(a => a.id === selected) ?? null,
    [groups, selected],
  )
  const lastItem = useRef<ActionItem | null>(null)
  if (selectedItem) lastItem.current = selectedItem
  const drawerItem = selectedItem ?? lastItem.current

  function updateItem(id: string, patch: (a: ActionItem) => ActionItem) {
    setGroups(gs => gs.map(g => ({ ...g, actions: g.actions.map(a => (a.id === id ? patch(a) : a)) })))
  }
  function deleteItem(id: string) {
    setSelected(null)
    setGroups(gs => gs.map(g => ({ ...g, actions: g.actions.filter(a => a.id !== id) })))
  }

  const filterCount = filters.statuses.length + filters.assignees.length
  const filterControls = (
    <>
      <Dropdown
        mode="multi"
        size="m"
        placeholder="All statuses"
        options={STATUS_OPTIONS}
        value={filters.statuses}
        onChange={v => applyFilters({ ...filters, statuses: v as string[] })}
        clearable
        className={styles.filter}
      />
      <Dropdown
        mode="multi"
        size="m"
        placeholder="All assignees"
        options={ASSIGNEE_OPTIONS}
        value={filters.assignees}
        onChange={v => applyFilters({ ...filters, assignees: v as string[] })}
        clearable
        className={styles.filter}
      />
    </>
  )

  const columnsMenu = (
    <ColumnsMenu
      className={styles.columnsBtn}
      items={[
        { key: 'name', label: 'Meeting and actions', locked: true },
        ...colOrder.map(k => ({ key: k, label: COLUMN_LABEL[k] })),
      ]}
      hidden={colHidden}
      onChange={(order, hidden) => {
        setColOrder(order.filter((k): k is ColKey => k !== 'name'))
        setColHidden(hidden)
      }}
    />
  )

  return (
    <div className={styles.root}>
      <div className={styles.main}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <ActionMenu
              trigger="button"
              triggerVariant="primary"
              triggerLabel="Request"
              triggerIcon={plusSvg}
              align="left"
              items={[
                { key: 'action',    label: 'Action',    icon: actionSvg,    onSelect: () => startRequest('action') },
                { key: 'signature', label: 'Signature', icon: signatureSvg, onSelect: () => startRequest('signature') },
                { key: 'survey',    label: 'Survey',    icon: surveySvg,    onSelect: () => startRequest('survey') },
              ]}
            />
            {/* Wide pane: filters inline. Narrow pane (Reports pattern): one Filters button. */}
            <div className={styles.filtersInline}>
              {filterControls}
            </div>
            <Button
              variant="secondary"
              intent="neutral"
              size="m"
              className={styles.filtersBtn}
              iconLeft={<Icon svg={filterSvg} />}
              onClick={() => setFiltersOpen(true)}
            >
              Filters
              {filterCount > 0 && <BadgeCounter count={filterCount} variant="regular" />}
            </Button>
            <Button
              variant="tertiary"
              intent="neutral"
              size="m"
              className={styles.clearBtn}
              iconLeft={<Icon svg={filterOffSvg} />}
              disabled={!filtering}
              onClick={() => applyFilters(NO_FILTERS)}
            >
              Clear filters
            </Button>
          </div>
          <Button
            variant="secondary"
            intent="neutral"
            size="m"
            {...(isCompact
              ? { iconLeft: <Icon svg={downloadSvg} /> }
              : { iconOnly: <Icon svg={downloadSvg} />, 'aria-label': 'Export' })}
            disabled={visible.length === 0}
            onClick={exportCsv}
          >
            {isCompact ? 'Export' : undefined}
          </Button>
        </div>

        {/* Table */}
        <div className={styles.tableScroll}>
          <div className={styles.tableWrap}>
          {visible.length > 0 && <div className={styles.columnsAnchor}>{columnsMenu}</div>}
          <table className={[
            styles.table,
            shownCols.includes('status') ? styles.hasStatus : '',
            shownCols.includes('assignee') ? styles.hasAssignee : '',
            shownCols.includes('due') ? styles.hasDue : '',
          ].filter(Boolean).join(' ')}>
            <colgroup>
              <col />
              {shownCols.map(k => (
                <col
                  key={k}
                  className={[
                    k === 'status' ? styles.colStatus : k === 'assignee' ? styles.colAssignee : styles.colDue,
                    k === 'assignee' ? styles.assigneeCol : k === 'due' ? styles.dueCol : '',
                  ].filter(Boolean).join(' ')}
                />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className={styles.expandTh}>
                  <div className={styles.expandInner}>
                    <Tooltip label={allOpen ? 'Collapse all' : 'Expand all'} position="bottom">
                      <Button
                        variant="tertiary"
                        intent="neutral"
                        size="m"
                        iconOnly={<Icon svg={sortingSvg} />}
                        onClick={toggleAll}
                        disabled={visible.length === 0}
                        aria-label={allOpen ? 'Collapse all meetings' : 'Expand all meetings'}
                      />
                    </Tooltip>
                    <span className={styles.thLabel}>Meeting and actions</span>
                  </div>
                </th>
                {shownCols.map(k => (
                  <TableHeaderCell key={k} className={k === 'assignee' ? styles.assigneeCol : k === 'due' ? styles.dueCol : undefined}>
                    {COLUMN_LABEL[k]}
                  </TableHeaderCell>
                ))}
              </tr>
            </thead>
            {visible.length > 0 && (
              <tbody>
                {visible.map(g => {
                  const isOpen = open.has(g.id)
                  return [
                    <tr key={g.id} className={styles.groupRow}>
                      <td colSpan={1 + shownCols.length} className={styles.groupTd}>
                        <button
                          type="button"
                          className={styles.groupBtn}
                          onClick={() => toggleGroup(g.id)}
                          aria-expanded={isOpen}
                        >
                          <span className={styles.chevron}><Icon svg={isOpen ? chevronDownSvg : chevronRightSvg} /></span>
                          <span className={styles.groupName}>{g.name}</span>
                          <span className={styles.count}>{g.actions.length}</span>
                        </button>
                      </td>
                    </tr>,
                    ...(isOpen ? g.actions.map(a => {
                      const lead = userById(a.assignees[0])
                      return (
                        <tr
                          key={a.id}
                          className={[styles.row, selected === a.id ? styles.rowSelected : ''].filter(Boolean).join(' ')}
                          onClick={() => { setCreating(null); setSelected(id => (id === a.id ? null : a.id)) }}
                        >
                          <TableCell error={a.status === 'Overdue'} truncate className={styles.titleTd}>{a.title}</TableCell>
                          {shownCols.map(k => k === 'status' ? (
                            <TableCell key={k} badge={a.status} badgeColor={STATUS_COLOR[a.status]} className={styles.statusCell} />
                          ) : k === 'assignee' ? (
                            <TableAvatarCell
                              key={k}
                              name={lead.name}
                              src={lead.photo ? avatarUrl(lead.id) : undefined}
                              className={styles.assigneeCol}
                              extra={a.assignees.length > 1 ? a.assignees.length - 1 : undefined}
                            />
                          ) : (
                            <TableCell key={k} error={a.status === 'Overdue'} className={styles.dueCol}>{formatDue(a.due)}</TableCell>
                          ))}
                          {/* Phone: status • assignee under the title (replaces the columns). */}
                          <td className={[styles.metaCell, a.status === 'Overdue' ? styles.metaOverdue : ''].filter(Boolean).join(' ')}>
                            {a.status}<span className={styles.dot} aria-hidden="true" />{lead.name}{a.assignees.length > 1 ? ` +${a.assignees.length - 1}` : ''}
                          </td>
                        </tr>
                      )
                    }) : []),
                  ]
                })}
              </tbody>
            )}
          </table>
          </div>

          {visible.length === 0 && (
            totalActions === 0 ? (
              <EmptyState
                illustration="folder-no-documents"
                title="No actions yet"
                description="Actions assigned in this group will appear here."
                className={styles.empty}
              />
            ) : (
              <EmptyState
                illustration="folder-no-results"
                title="No matching tasks"
                description="Try adjusting your filters to find tasks from past meetings, different statuses, or specific people"
                className={styles.empty}
              />
            )
          )}
        </div>
      </div>

      {/* Filters panel (narrow pane) */}
      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <>
            <Button variant="tertiary" intent="neutral" size="m" disabled={!filtering} onClick={() => applyFilters(NO_FILTERS)}>Clear filters</Button>
            <Button variant="primary" size="m" onClick={() => setFiltersOpen(false)}>Done</Button>
          </>
        }
      >
        <div className={styles.filtersPanel}>{filterControls}</div>
      </Modal>

      {/* Task drawer — an existing task, or an empty draft from the Request menu */}
      <Drawer
        variant={drawerOverlay ? 'overlay' : 'inline'}
        width={drawerWidth}
        open={selectedItem !== null || creating !== null}
        onClose={() => { setSelected(null); setCreating(null) }}
        bodyClassName={styles.drawerBody}
        {...(creating
          ? {
              key: `new-${creating.key}`,
              title: draftTitle,
              onTitleChange: setDraftTitle,
              titlePlaceholder: REQUEST_KINDS[creating.kind].titlePlaceholder,
              titleAutoFocus: true,
              headerType: REQUEST_KINDS[creating.kind].label,
              headerTypeIcon: REQUEST_KINDS[creating.kind].icon,
              headerBadge: creating.kind === 'survey' ? <BadgeStatus type="warning" label="Draft" /> : undefined,
            }
          : {
              title: drawerItem?.title ?? '',
              titleReadOnly: true,
              headerType: 'Action',
              headerBadge: drawerItem ? <BadgeStatus type={statusBadgeType(drawerItem.status)} label={drawerItem.status} /> : undefined,
            })}
        footer={creating ? (
          creating.kind === 'survey' && (
            <StickyFooter
              variant="drawer"
              left={<Button variant="primary" size="m">View</Button>}
              right={
                <Tooltip label="Delete" position="top">
                  <Button variant="secondary" intent="danger" size="m" iconOnly={<Icon svg={trashSvg} />} aria-label="Delete draft" onClick={() => setCreating(null)} />
                </Tooltip>
              }
            />
          )
        ) : drawerItem && (
          <StickyFooter
            variant="drawer"
            left={
              <Button
                variant="primary"
                size="m"
                disabled={drawerItem.status === 'Completed'}
                onClick={() => updateItem(drawerItem.id, a => ({ ...a, status: 'Completed', doneBy: [...a.assignees] }))}
              >
                Complete
              </Button>
            }
            right={
              <Tooltip label="Delete" position="top">
                <Button
                  variant="secondary"
                  intent="danger"
                  size="m"
                  iconOnly={<Icon svg={trashSvg} />}
                  aria-label="Delete task"
                  onClick={() => deleteItem(drawerItem.id)}
                />
              </Tooltip>
            }
          />
        )}
      >
        {creating
          ? <NewRequestForm key={creating.key} kind={creating.kind} meetings={groups.map(g => g.name)} />
          : drawerItem && <TaskDetails item={drawerItem} onChange={patch => updateItem(drawerItem.id, patch)} />}
      </Drawer>
    </div>
  )
}

/* ── Drawer body ───────────────────────────────────────────── */
function TaskDetails({ item, onChange }: { item: ActionItem; onChange: (patch: (a: ActionItem) => ActionItem) => void }) {
  const doneCount = item.doneBy.length

  function toggleDone(id: string) {
    onChange(a => {
      const doneBy = a.doneBy.includes(id) ? a.doneBy.filter(x => x !== id) : [...a.doneBy, id]
      const status: ActionStatus =
        doneBy.length === a.assignees.length ? 'Completed'
          : a.status === 'Completed' ? 'In progress' : a.status
      return { ...a, doneBy, status }
    })
  }

  const addable: DropdownOption[] = USERS
    .filter(u => !item.assignees.includes(u.id))
    .map(u => ({ value: u.id, label: u.name, avatar: { src: u.photo ? avatarUrl(u.id) : undefined, initials: initialsOf(u.name) } }))

  return (
    <div className={styles.details}>
      <div className={styles.form}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>Assignee</h3>
            <span className={styles.sectionMeta}>Completed {doneCount}/{item.assignees.length}</span>
          </div>
          <ul className={styles.people}>
            {item.assignees.map(id => {
              const u = userById(id)
              const done = item.doneBy.includes(id)
              return (
                <li key={id} className={styles.person}>
                  <Avatar size="s" variant={u.photo ? 'picture' : 'letters'} src={u.photo ? avatarUrl(u.id) : undefined} initials={initialsOf(u.name)} alt={u.name} />
                  <span className={styles.personName}>{u.name}</span>
                  <Tooltip label={done ? 'Mark as not done' : 'Mark as done'} position="top">
                    <Button
                      variant="tertiary"
                      intent="neutral"
                      size="m"
                      iconOnly={<span className={done ? styles.done : undefined} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: checkCircleSvg }} />}
                      aria-label={`${done ? 'Mark as not done' : 'Mark as done'}: ${u.name}`}
                      aria-pressed={done}
                      onClick={() => toggleDone(id)}
                    />
                  </Tooltip>
                </li>
              )
            })}
          </ul>
          {addable.length > 0 && (
            <Dropdown
              variant="no-border"
              size="m"
              placeholder="Choose user"
              options={addable}
              onChange={v => onChange(a => ({ ...a, assignees: [...a.assignees, v as string] }))}
            />
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Due date</h3>
          <p className={styles.value}>{formatDue(item.due)}</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Linked to</h3>
          {item.linkedTo.map(l => <p key={l} className={styles.value}>{l}</p>)}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Description</h3>
          <TextField
            multiline
            variant="no-border"
            size="m"
            placeholder="Add details about task"
            value={item.description}
            onChange={e => onChange(a => ({ ...a, description: e.target.value }))}
            aria-label="Description"
          />
        </section>
      </div>

      <section className={styles.attachments}>
        <h3 className={styles.sectionTitle}>Attachments</h3>
        {item.attachments.map(f => (
          <div key={f.id} className={styles.file}>
            <span className={styles.fileIcon}><Icon svg={pdfSvg} /></span>
            <span className={styles.fileName}>{f.name}</span>
            <Button
              variant="tertiary"
              intent="neutral"
              size="m"
              iconOnly={<Icon svg={multiplySvg} />}
              aria-label={`Remove ${f.name}`}
              onClick={() => onChange(a => ({ ...a, attachments: a.attachments.filter(x => x.id !== f.id) }))}
            />
          </div>
        ))}
        <div className={styles.upload}>
          <span>Upload document or drag and drop</span>
          <Button variant="secondary" intent="neutral" size="m">Upload</Button>
        </div>
      </section>
    </div>
  )
}

/* ── New request form — empty draft (Figma Tasks drawer: Action 11674:20143,
      Survey 12401:29718, Signature request) ────────────────── */
function NewRequestForm({ kind, meetings }: { kind: RequestKind; meetings: string[] }) {
  const [assignees, setAssignees] = useState<string[]>([])
  const [signer, setSigner] = useState<string>('')
  const [due, setDue] = useState<Date | null>(null)
  const [meeting, setMeeting] = useState<string>('')
  const [agendaItem, setAgendaItem] = useState<string>('')
  const [description, setDescription] = useState('')

  const hasAssignee = kind === 'signature' ? signer !== '' : assignees.length > 0

  const userField = (title: string) => (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {kind === 'signature' ? (
        <Autocomplete
          variant="no-border"
          clearable
          options={USER_OPTIONS}
          value={signer}
          placeholder="Choose user"
          aria-label={title}
          onChange={v => setSigner(v as string)}
        />
      ) : (
        <Autocomplete
          variant="no-border"
          clearable
          multiple
          options={PEOPLE_OPTIONS}
          value={assignees}
          placeholder="Choose user"
          aria-label={title}
          onChange={v => setAssignees(v as string[])}
        />
      )}
      {kind !== 'signature' && assignees.length > 0 && (
        <ul className={styles.draftPeople}>
          {assignees.map(id => {
            const o = PEOPLE_OPTIONS.find(x => x.value === id)
            if (!o) return null
            return (
              <li key={id} className={styles.draftPerson}>
                <Avatar
                  size="s"
                  type={o.avatar?.type ?? 'user'}
                  variant={o.avatar?.src ? 'picture' : 'letters'}
                  src={o.avatar?.src}
                  initials={o.avatar?.initials}
                  alt={o.label}
                />
                <span className={styles.personName}>{o.label}</span>
                <Button
                  className={styles.draftRemove}
                  variant="tertiary"
                  intent="neutral"
                  size="m"
                  iconOnly={<Icon svg={multiplySvg} />}
                  aria-label={`Remove ${o.label}`}
                  onClick={() => setAssignees(a => a.filter(x => x !== id))}
                />
              </li>
            )
          })}
        </ul>
      )}
      {kind === 'survey' && (
        <div className={styles.checkRow}>
          <Checkbox label="Anonymous responses" disabled={!hasAssignee} />
        </div>
      )}
    </section>
  )

  const dueField = (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Due date</h3>
      <DatePicker variant="no-border" size="m" placeholder="Set due date" value={due} onChange={setDue} />
    </section>
  )

  const descField = (title: string, placeholder: string) => (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <TextField
        multiline
        variant="no-border"
        size="m"
        placeholder={placeholder}
        value={description}
        onChange={e => setDescription(e.target.value)}
        aria-label={title}
      />
    </section>
  )

  const upload = (
    <div className={styles.upload}>
      <span>Upload document or drag and drop</span>
      <Button variant="secondary" intent="neutral" size="m">Upload</Button>
    </div>
  )

  return (
    <div className={styles.details}>
      {kind === 'signature' && (
        <section className={styles.attachments}>
          <h3 className={styles.sectionTitle}>Document to sign</h3>
          {upload}
        </section>
      )}

      <div className={styles.form}>
        {userField(kind === 'signature' ? 'Signer' : 'Assignee')}
        {dueField}
        {kind === 'action' && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Linked to</h3>
            <div className={styles.linkedFields}>
              <Autocomplete
                variant="no-border"
                clearable
                options={meetings.map(m => ({ value: m, label: m }))}
                value={meeting}
                placeholder="Choose meeting"
                aria-label="Meeting"
                onChange={v => { setMeeting(v as string); setAgendaItem('') }}
              />
              {meeting && (
                <Autocomplete
                  variant="no-border"
                  clearable
                  options={AGENDA_OPTIONS}
                  value={agendaItem}
                  placeholder="Choose agenda item"
                  aria-label="Agenda item"
                  onChange={v => setAgendaItem(v as string)}
                />
              )}
            </div>
          </section>
        )}
        {kind === 'action' && descField('Description', 'Add details about task')}
        {kind === 'signature' && descField('Description', 'Add any details')}
        {kind === 'survey' && descField('Additional information', 'Add any extra details and context')}
      </div>

      {kind === 'action' && (
        <section className={styles.attachments}>
          <h3 className={styles.sectionTitle}>Attachments</h3>
          {upload}
        </section>
      )}
    </div>
  )
}

export default ActionLogTab
