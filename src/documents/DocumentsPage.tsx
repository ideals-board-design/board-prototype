/* DocumentsPage — Documents table prototype
   Figma: 658-21422 (Container) · 947-17476 (columns droplist) */

import { Fragment, useEffect, useRef, useState } from 'react'
import { SideNavigation, DEFAULT_NAV_ITEMS } from '../components/SideNavigation/SideNavigation'
import type { NavMenuItemKey } from '../components/SideNavigationItem/SideNavigationItem'
import { PageHeader }        from '../components/PageHeader/PageHeader'
import { Button }            from '../components/Button/Button'
import { Tooltip }           from '../components/Tooltip/Tooltip'
import { Search }            from '../components/Search/Search'
import { TableHeaderCell, TableCell } from '../components/TableCell/TableCell'
import { TableAvatarCell }   from '../components/TableAvatarCell/TableAvatarCell'
import { TableCheckboxCell } from '../components/TableCheckboxCell/TableCheckboxCell'
import { ColumnsDroplist, type ColumnRow } from './ColumnsDroplist'
import { actions }     from '../icons/actions'
import { files }       from '../icons/files'
import { fileFormat }  from '../icons/fileFormat'
import { functional }  from '../icons/functional'
import { users }       from '../icons/users'
import styles from './DocumentsPage.module.css'

/* ── Icons ─────────────────────────────────────────────── */
const plusSvg       = actions.find(i => i.name === 'plus')!.svg
const folderPlusSvg = files.find(i => i.name === 'folder-plus')!.svg
const columnsSvg    = files.find(i => i.name === 'columns')!.svg
const starSvg       = functional.find(i => i.name === 'star')!.svg
const starFilledSvg = functional.find(i => i.name === 'star-filled')!.svg
const shareSvg      = users.find(i => i.name === 'users-alt')!.svg
const copySvg       = actions.find(i => i.name === 'copy')!.svg
const downloadSvg   = actions.find(i => i.name === 'download-alt')!.svg
const ellipsisSvg   = functional.find(i => i.name === 'ellipsis-h')!.svg

const FORMAT_ICON: Record<'folder' | 'pdf' | 'word', string> = {
  folder: fileFormat.find(i => i.name === 'format-folder')!.svg,
  pdf:    fileFormat.find(i => i.name === 'format-pdf')!.svg,
  word:   fileFormat.find(i => i.name === 'format-word')!.svg,
}

/* ── Column model ──────────────────────────────────────── */
type ColKey = 'name' | 'addedBy' | 'access' | 'size' | 'addedOn' | 'viewedOn'

const COL: Record<ColKey, { label: string; locked: boolean; width: number | null }> = {
  name:     { label: 'Name',           locked: true,  width: null },
  addedBy:  { label: 'Added by',       locked: true,  width: 240 },
  access:   { label: 'Who can access', locked: false, width: 200 },
  size:     { label: 'Size',           locked: false, width: 112 },
  addedOn:  { label: 'Added on',       locked: false, width: 180 },
  viewedOn: { label: 'Viewed on',      locked: false, width: 180 },
}
const DEFAULT_ORDER: ColKey[] = ['name', 'addedBy', 'access', 'size', 'addedOn', 'viewedOn']
const LOCKED_KEYS = DEFAULT_ORDER.filter(k => COL[k].locked)

const CHECKBOX_W = 36
const STAR_W     = 52
const NAME_MIN   = 400

/* ── Persistence ───────────────────────────────────────── */
const KEY_ORDER   = 'docs.columnOrder'
const KEY_HIDDEN  = 'docs.columnHidden'
const KEY_FOLDERS = 'docs.foldersFirst'

function loadOrder(): ColKey[] {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY_ORDER) ?? 'null') as string[] | null
    if (Array.isArray(arr) &&
        arr.length === DEFAULT_ORDER.length &&
        DEFAULT_ORDER.every(k => arr.includes(k))) {
      const rest = (arr as ColKey[]).filter(k => !COL[k].locked)
      return [...LOCKED_KEYS, ...rest]   // locked always pinned to the front
    }
  } catch { /* ignore */ }
  return DEFAULT_ORDER
}

function loadHidden(): Set<ColKey> {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY_HIDDEN) ?? 'null') as string[] | null
    if (Array.isArray(arr)) {
      return new Set(arr.filter((k): k is ColKey => k in COL && !COL[k as ColKey].locked))
    }
  } catch { /* ignore */ }
  return new Set()
}

/* ── Types & data ──────────────────────────────────────── */
type SortDir = 'asc' | 'desc' | null

interface DocRow {
  id:       string
  name:     string
  format:   'folder' | 'pdf' | 'word'
  starred:  boolean
  addedBy:  string
  access:   string
  size:     string
  addedOn:  string
  viewedOn: string
}

const AVATAR = 'https://i.pravatar.cc/48?img=47'

const INITIAL_ROWS: DocRow[] = [
  { id: '1', name: 'Financial Reports',                          format: 'folder', starred: false, addedBy: 'Olivia Martinez', access: 'Only you', size: '–',       addedOn: 'Mar 27, 2025', viewedOn: 'Mar 27, 2025' },
  { id: '2', name: 'Government Report',                          format: 'folder', starred: true,  addedBy: 'Olivia Martinez', access: '4 users',  size: '–',       addedOn: 'Mar 27, 2025', viewedOn: 'Mar 27, 2025' },
  { id: '3', name: 'Laws & Conditions',                          format: 'folder', starred: false, addedBy: 'Olivia Martinez', access: '31 users', size: '–',       addedOn: 'Mar 27, 2025', viewedOn: 'Mar 27, 2025' },
  { id: '4', name: 'Law Issues',                                 format: 'folder', starred: false, addedBy: 'Olivia Martinez', access: '4 users',  size: '–',       addedOn: 'Mar 27, 2025', viewedOn: 'Mar 27, 2025' },
  { id: '5', name: 'Corporate Governance Guidelines',            format: 'folder', starred: true,  addedBy: 'Olivia Martinez', access: 'Only you', size: '–',       addedOn: 'Mar 27, 2025', viewedOn: 'Mar 27, 2025' },
  { id: '6', name: 'Financial Report for Fiscal Year 2025.pdf',  format: 'pdf',    starred: false, addedBy: 'Olivia Martinez', access: '4 users',  size: '2.5 MB',  addedOn: 'Mar 27, 2025', viewedOn: 'Mar 27, 2025' },
  { id: '7', name: 'Agenda for October 2025 Board Meeting.doc',  format: 'word',   starred: false, addedBy: 'Olivia Martinez', access: 'Only you', size: '3.7 MB',  addedOn: 'Mar 27, 2025', viewedOn: 'Mar 27, 2025' },
  { id: '8', name: 'Report - October 2025 Board Meeting.pdf',    format: 'pdf',    starred: false, addedBy: 'Olivia Martinez', access: '4 users',  size: '7.9 MB',  addedOn: 'Mar 27, 2025', viewedOn: 'Mar 27, 2025' },
  { id: '9', name: 'Strategic Plan Review - July 2025.pdf',      format: 'pdf',    starred: false, addedBy: 'Olivia Martinez', access: '4 users',  size: '10.1 MB', addedOn: 'Mar 27, 2025', viewedOn: 'Mar 27, 2025' },
]

function sortRows(rows: DocRow[], col: ColKey | null, dir: SortDir, foldersFirst: boolean): DocRow[] {
  let out = rows
  if (col && dir) {
    out = [...rows].sort((a, b) => {
      const cmp = a[col].localeCompare(b[col])
      return dir === 'asc' ? cmp : -cmp
    })
  }
  if (foldersFirst) {
    const folders = out.filter(r => r.format === 'folder')
    const rest    = out.filter(r => r.format !== 'folder')
    out = [...folders, ...rest]
  }
  return out
}

/* ── SideNavigation config ─────────────────────────────── */
const WORKSPACES = [{ id: 'star', name: 'STAR Enterprises', initials: 'ST', color: '#28a560' }]
const USER = {
  userSrc:   'https://i.pravatar.cc/64?img=47',
  userName:  'Olivia Thompson',
  userEmail: 'thompsonolivia@gmail.com',
}

/* ── Component ─────────────────────────────────────────── */
export default function DocumentsPage() {
  const [navItem,   setNavItem]   = useState<NavMenuItemKey>('documents')
  const [workspace, setWorkspace] = useState('star')

  const [rows,       setRows]       = useState<DocRow[]>(INITIAL_ROWS)
  const [search,     setSearch]     = useState('')
  const [sortCol,    setSortCol]    = useState<ColKey | null>(null)
  const [sortDir,    setSortDir]    = useState<SortDir>(null)
  const [selected,   setSelected]   = useState<Set<string>>(new Set())
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  /* Column configuration (persisted) */
  const [order,        setOrder]        = useState<ColKey[]>(loadOrder)
  const [hidden,       setHidden]       = useState<Set<ColKey>>(loadHidden)
  const [foldersFirst, setFoldersFirst] = useState<boolean>(() => localStorage.getItem(KEY_FOLDERS) === '1')
  const [columnsOpen,  setColumnsOpen]  = useState(false)
  const [dropPos,      setDropPos]      = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  const anchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => { try { localStorage.setItem(KEY_ORDER, JSON.stringify(order)) } catch { /* ignore */ } }, [order])
  useEffect(() => { try { localStorage.setItem(KEY_HIDDEN, JSON.stringify([...hidden])) } catch { /* ignore */ } }, [hidden])
  useEffect(() => { try { localStorage.setItem(KEY_FOLDERS, foldersFirst ? '1' : '0') } catch { /* ignore */ } }, [foldersFirst])

  /* Close the droplist on Escape (outside clicks are handled by a backdrop) */
  useEffect(() => {
    if (!columnsOpen) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setColumnsOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [columnsOpen])

  function handleSort(col: ColKey) {
    if (sortCol === col) {
      const next: SortDir = sortDir === null ? 'asc' : sortDir === 'asc' ? 'desc' : null
      setSortDir(next)
      if (next === null) setSortCol(null)
    } else {
      setSortCol(col); setSortDir('asc')
    }
  }

  function toggleStar(id: string) {
    setRows(rs => rs.map(r => r.id === id ? { ...r, starred: !r.starred } : r))
  }

  function toggleSelect(id: string) {
    setSelected(s => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleColumn(key: string) {
    const k = key as ColKey
    if (COL[k].locked) return
    setHidden(h => {
      const next = new Set(h)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })
  }

  function openColumns() {
    const r = anchorRef.current?.getBoundingClientRect()
    if (r) setDropPos({ top: r.bottom + 4, left: Math.max(8, r.right - 232) })
    setColumnsOpen(true)   // outside click (backdrop) / Escape closes it
  }

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
  const sorted   = sortRows(filtered, sortCol, sortDir, foldersFirst)

  const allSelected  = sorted.length > 0 && sorted.every(r => selected.has(r.id))
  const someSelected = sorted.some(r => selected.has(r.id)) && !allSelected

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(sorted.map(r => r.id)))
  }

  const ROW_ACTIONS = [
    { icon: shareSvg,    label: 'Manage access', onClick: () => console.log('access') },
    { icon: copySvg,     label: 'Copy',          onClick: () => console.log('copy') },
    { icon: downloadSvg, label: 'Download',      onClick: () => console.log('download') },
    { icon: ellipsisSvg, label: 'More',          onClick: () => console.log('more') },
  ]

  /* Columns visible in the table, in order (locked stay visible) */
  const visibleKeys = order.filter(k => COL[k].locked || !hidden.has(k))
  const tableMinWidth =
    CHECKBOX_W + STAR_W + NAME_MIN +
    visibleKeys.filter(k => k !== 'name').reduce((sum, k) => sum + (COL[k].width ?? 0), 0)

  const dropItems: ColumnRow[] = order.map(k => ({
    key:     k,
    label:   COL[k].label,
    locked:  COL[k].locked,
    visible: COL[k].locked || !hidden.has(k),
  }))

  function renderHeaderCell(k: ColKey) {
    return (
      <TableHeaderCell
        sortable
        sortDirection={sortCol === k ? sortDir : null}
        onSort={() => handleSort(k)}
      >
        {COL[k].label}
      </TableHeaderCell>
    )
  }

  function renderBodyCell(k: ColKey, row: DocRow) {
    if (k === 'name') {
      return <TableCell className={styles.nameCell} icon={FORMAT_ICON[row.format]} truncate>{row.name}</TableCell>
    }
    if (k === 'addedBy') {
      return <TableAvatarCell name={row.addedBy} src={AVATAR} />
    }
    return <TableCell>{row[k]}</TableCell>
  }

  return (
    <div className={styles.shell}>
      <SideNavigation
        workspaces={WORKSPACES}
        activeWorkspaceId={workspace}
        onWorkspaceSelect={setWorkspace}
        navItems={DEFAULT_NAV_ITEMS}
        activeItem={navItem}
        onItemClick={setNavItem}
        {...USER}
        twoFaEnabled
        onProfileClick={() => console.log('profile')}
        onConnectionsClick={() => console.log('connections')}
        onLogoutClick={() => console.log('logout')}
      />

      <main className={styles.main}>
        <PageHeader title="Documents" />

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <Button
              variant="primary"
              size="m"
              iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: plusSvg }} />}
            >
              Add
            </Button>
            <Button
              variant="secondary"
              intent="neutral"
              size="m"
              iconLeft={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: folderPlusSvg }} />}
            >
              Create folder
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
            <table className={styles.table} style={{ minWidth: tableMinWidth }}>
              <colgroup>
                <col style={{ width: CHECKBOX_W }} />
                {visibleKeys.map(k => (
                  <Fragment key={k}>
                    <col style={COL[k].width != null ? { width: COL[k].width! } : undefined} />
                    {k === 'name' && <col style={{ width: STAR_W }} />}
                  </Fragment>
                ))}
                <col style={{ width: 0 }} />
              </colgroup>
              <thead>
                <tr>
                  <TableCheckboxCell
                    header
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                  {visibleKeys.map(k => (
                    <Fragment key={k}>
                      {renderHeaderCell(k)}
                      {k === 'name' && <th className={styles.starTh} aria-label="Starred" />}
                    </Fragment>
                  ))}
                  <th className={styles.actionsTh}>
                    <div className={styles.actionsHeaderInner} ref={anchorRef}>
                      <Tooltip label="Columns" position="bottom">
                        <Button
                          variant="tertiary"
                          intent="neutral"
                          size="m"
                          aria-label="Configure columns"
                          aria-haspopup="menu"
                          aria-expanded={columnsOpen}
                          onClick={openColumns}
                          iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: columnsSvg }} />}
                        />
                      </Tooltip>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, idx) => {
                  const isSelected = selected.has(row.id)
                  return (
                    <tr
                      key={row.id}
                      className={[
                        idx % 2 === 0 ? styles.rowOdd : styles.rowEven,
                        isSelected ? styles.rowSelected : '',
                      ].filter(Boolean).join(' ')}
                      onMouseEnter={() => setHoveredRow(row.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCheckboxCell
                        checked={isSelected}
                        onChange={() => toggleSelect(row.id)}
                        aria-label={`Select ${row.name}`}
                      />
                      {visibleKeys.map(k => (
                        <Fragment key={k}>
                          {renderBodyCell(k, row)}
                          {k === 'name' && (
                            <td className={styles.starTd}>
                              <button
                                type="button"
                                className={[
                                  styles.starBtn,
                                  row.starred ? styles.starActive : '',
                                  hoveredRow === row.id ? styles.starHoverable : '',
                                ].filter(Boolean).join(' ')}
                                onClick={() => toggleStar(row.id)}
                                aria-label={row.starred ? 'Unstar' : 'Star'}
                                aria-pressed={row.starred}
                                dangerouslySetInnerHTML={{ __html: row.starred ? starFilledSvg : starSvg }}
                              />
                            </td>
                          )}
                        </Fragment>
                      ))}
                      <td className={styles.actionsTd}>
                        <div className={[styles.actionsOverlay, hoveredRow === row.id ? styles.actionsVisible : ''].filter(Boolean).join(' ')}>
                          {ROW_ACTIONS.map(a => (
                            <Tooltip key={a.label} label={a.label} position="top">
                              <Button
                                variant="tertiary"
                                intent="neutral"
                                size="m"
                                aria-label={a.label}
                                iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: a.icon }} />}
                                onClick={(e) => { e.stopPropagation(); a.onClick() }}
                              />
                            </Tooltip>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {columnsOpen && (
        <>
          <div className={styles.columnsBackdrop} onPointerDown={() => setColumnsOpen(false)} />
          <ColumnsDroplist
            items={dropItems}
            foldersFirst={foldersFirst}
            onFoldersFirstChange={setFoldersFirst}
            onToggleVisible={toggleColumn}
            onReorder={keys => setOrder(keys as ColKey[])}
            style={{ top: dropPos.top, left: dropPos.left }}
          />
        </>
      )}
    </div>
  )
}
