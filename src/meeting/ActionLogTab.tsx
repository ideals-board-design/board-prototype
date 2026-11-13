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
import { TextArea }        from '../components/TextArea/TextArea'
import { useBreakpoint }   from '../hooks/useBreakpoint'
import { arrows }          from '../icons/arrows'
import { actions }         from '../icons/actions'
import { condition }       from '../icons/condition'
import { fileFormat }      from '../icons/fileFormat'
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

const statusBadgeType = (s: ActionStatus) =>
  s === 'Completed' ? 'positive' : s === 'Overdue' ? 'danger' : s === 'Draft' ? 'warning' : s === 'Pending review' ? 'pending' : 'neutral'

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

  return (
    <div className={styles.root}>
      <div className={styles.main}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.filters}>
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
          <table className={styles.table}>
            <colgroup>
              <col />
              <col className={styles.colStatus} />
              <col className={[styles.colAssignee, styles.assigneeCol].join(' ')} />
              <col className={[styles.colDue, styles.dueCol].join(' ')} />
            </colgroup>
            <thead>
              <tr>
                <th className={styles.expandTh}>
                  <div className={styles.expandInner}>
                    <Tooltip label={allOpen ? 'Collapse all' : 'Expand all'} position="bottom">
                      <button
                        type="button"
                        className={styles.expandAll}
                        onClick={toggleAll}
                        disabled={visible.length === 0}
                        aria-label={allOpen ? 'Collapse all meetings' : 'Expand all meetings'}
                      >
                        <Icon svg={sortingSvg} />
                      </button>
                    </Tooltip>
                    <span className={styles.thLabel}>Meeting and actions</span>
                  </div>
                </th>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className={styles.assigneeCol}>Assignee</TableHeaderCell>
                <TableHeaderCell className={styles.dueCol}>Due date</TableHeaderCell>
              </tr>
            </thead>
            {visible.length > 0 && (
              <tbody>
                {visible.map(g => {
                  const isOpen = open.has(g.id)
                  return [
                    <tr key={g.id} className={styles.groupRow}>
                      <td colSpan={4} className={styles.groupTd}>
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
                          onClick={() => setSelected(id => (id === a.id ? null : a.id))}
                        >
                          <TableCell error={a.status === 'Overdue'} truncate className={styles.titleTd}>{a.title}</TableCell>
                          <TableCell badge={a.status} badgeColor={STATUS_COLOR[a.status]} className={styles.statusCell} />
                          <TableAvatarCell
                            name={lead.name}
                            src={lead.photo ? avatarUrl(lead.id) : undefined}
                            className={styles.assigneeCol}
                            extra={a.assignees.length > 1 ? a.assignees.length - 1 : undefined}
                          />
                          <TableCell error={a.status === 'Overdue'} className={styles.dueCol}>{formatDue(a.due)}</TableCell>
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

      {/* Task drawer */}
      <Drawer
        variant={drawerOverlay ? 'overlay' : 'inline'}
        width={drawerWidth}
        open={selectedItem !== null}
        onClose={() => setSelected(null)}
        title={drawerItem?.title ?? ''}
        titleReadOnly
        headerType="Action request"
        headerBadge={drawerItem ? <BadgeStatus type={statusBadgeType(drawerItem.status)} label={drawerItem.status} /> : undefined}
        footer={drawerItem && (
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
        {drawerItem && <TaskDetails item={drawerItem} onChange={patch => updateItem(drawerItem.id, patch)} />}
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
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>Assignee</h3>
          <span className={styles.sectionTitle}>Completed {doneCount}/{item.assignees.length}</span>
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
                    size="s"
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
        <TextArea
          size="m"
          placeholder="Add details about task"
          value={item.description}
          onChange={e => onChange(a => ({ ...a, description: e.target.value }))}
          aria-label="Description"
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Attachments</h3>
        {item.attachments.map(f => (
          <div key={f.id} className={styles.file}>
            <span className={styles.fileIcon}><Icon svg={pdfSvg} /></span>
            <span className={styles.fileName}>{f.name}</span>
            <Button
              variant="tertiary"
              intent="neutral"
              size="s"
              iconOnly={<Icon svg={multiplySvg} />}
              aria-label={`Remove ${f.name}`}
              onClick={() => onChange(a => ({ ...a, attachments: a.attachments.filter(x => x.id !== f.id) }))}
            />
          </div>
        ))}
        <div className={styles.upload}>Upload document or drag and drop</div>
      </section>
    </div>
  )
}

export default ActionLogTab
