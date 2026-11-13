/* Action log — seed data and pure helpers (filtering, export).
   Figma: Meetings › Action log (33037:404462). */

export type ActionStatus = 'Draft' | 'In progress' | 'Overdue' | 'Pending review' | 'Completed'

export const STATUSES: ActionStatus[] = ['Draft', 'In progress', 'Overdue', 'Pending review', 'Completed']

export const STATUS_COLOR: Record<ActionStatus, string> = {
  Draft:            'var(--yellow-50)',
  'In progress':    'var(--blue-50)',
  Overdue:          'var(--red-50)',
  'Pending review': 'var(--orange-50)',
  Completed:        'var(--green-50)',
}

export interface ActionUser { id: string; name: string; photo?: boolean }

/** Everyone who can be assigned an action (drives the assignee filter and drawer). */
export const USERS: ActionUser[] = [
  { id: 'alexander', name: 'Alexander Anderson' },
  { id: 'anna',      name: 'Anna Sims',          photo: true },
  { id: 'bella-m',   name: 'Bella Martinez',     photo: true },
  { id: 'bella-s',   name: 'Bella Simon' },
  { id: 'christopher', name: 'Christopher Lee' },
  { id: 'joshua',    name: 'Joshua Taylor' },
  { id: 'liam',      name: 'Liam Carter',        photo: true },
  { id: 'logan',     name: 'Logan White',        photo: true },
  { id: 'michael',   name: 'Michael Donaldson' },
  { id: 'olivia',    name: 'Olivia Thompson',    photo: true },
  { id: 'sophia',    name: 'Sophia Anson',       photo: true },
]

export const userById = (id: string): ActionUser =>
  USERS.find(u => u.id === id) ?? { id, name: id }

export interface ActionAttachment { id: string; name: string }

export interface ActionItem {
  id:          string
  title:       string
  status:      ActionStatus
  /** First entry is the lead assignee shown in the table; the rest collapse into "+N". */
  assignees:   string[]
  /** Assignee ids who have marked their part done. */
  doneBy:      string[]
  due:         string          // ISO date
  linkedTo:    string[]
  description: string
  attachments: ActionAttachment[]
}

export interface ActionGroup { id: string; name: string; actions: ActionItem[] }

const LINKED = ['Board of directors / February 2024', '2. Results of 2023 Q1']

function item(
  id: string, title: string, status: ActionStatus, assignees: string[],
  extra: Partial<ActionItem> = {},
): ActionItem {
  return {
    id, title, status, assignees,
    doneBy: status === 'Completed' ? [...assignees] : [],
    due: '2025-04-24',
    linkedTo: LINKED,
    description: '',
    attachments: [],
    ...extra,
  }
}

export const SEED_GROUPS: ActionGroup[] = [
  {
    id: 'dec-2026',
    name: 'Board of Directors / December 2026',
    actions: [
      item('a1', 'Board - Reinstatement of AFRACMA membership 11/11/25', 'Overdue', ['michael']),
      item('a2', 'Board - Admission to membership 11/11/25', 'Draft', ['logan']),
    ],
  },
  {
    id: 'jun-2026',
    name: 'Board of Directors / June 2026',
    actions: [
      item('a3', 'Board - Endorsement of Joint Statement Supporting the National Anti-Racism Framework', 'Overdue', ['michael']),
      item('a4', 'Board - Admission to membership 23/04/26', 'Draft', ['logan']),
      item('a5', 'Board - Appointments 14/05/26', 'Completed', ['olivia']),
      item('a6', 'Distribute new policy across departments and based on this prepare a report.', 'In progress',
        ['liam', 'alexander', 'sophia', 'olivia'],
        {
          due: '2025-04-29',
          attachments: [
            { id: 'f1', name: 'STAR Enterprises report - December 28 2024.doc' },
            { id: 'f2', name: 'Financial results 2024.xls' },
          ],
        }),
      item('a7', 'Board - Admission to membership 08/05/26', 'Completed', ['bella-s']),
    ],
  },
  {
    id: 'feb-2026-a',
    name: 'Board of Directors / February 2026',
    actions: [
      item('b1', 'Board - Approval to sign Deed of Variation from the Commonwealth', 'In progress', ['liam', 'christopher', 'joshua', 'anna']),
      item('b2', 'Review the draft annual report before circulation', 'Pending review', ['olivia']),
      item('b3', 'Confirm venue for the April offsite', 'Completed', ['alexander']),
    ],
  },
  {
    id: 'feb-2026-b',
    name: 'Board of Directors / February 2026',
    actions: [
      item('c1', 'Board - Approval to sign Deed of Variation from the Commonwealth', 'In progress', ['liam']),
      item('c2', 'Update the conflicts of interest register', 'Draft', ['christopher']),
      item('c3', 'Circulate revised terms of reference', 'Completed', ['joshua']),
      item('c4', 'Prepare the risk appetite statement', 'Pending review', ['bella-m']),
      item('c5', 'Collect director skills matrix responses', 'Overdue', ['anna']),
      item('c6', 'Schedule the committee chair handover', 'Draft', ['sophia']),
    ],
  },
  {
    id: 'feb-2026-c',
    name: 'Board of Directors / February 2026',
    actions: [
      item('d1', 'Distribute new policy across departments and based on this prepare a report.', 'In progress', ['liam', 'olivia', 'bella-m', 'logan']),
      item('d2', 'Sign off the internal audit plan', 'Completed', ['michael']),
      item('d3', 'Share the sustainability disclosure draft', 'Draft', ['alexander']),
      item('d4', 'Renew director and officer insurance', 'Overdue', ['bella-s']),
      item('d5', 'Collect apologies for the March meeting', 'Completed', ['logan']),
      item('d6', 'Publish the updated delegations register', 'Pending review', ['christopher']),
    ],
  },
]

/* ── Filtering ─────────────────────────────────────────────── */

export interface ActionFilters { statuses: string[]; assignees: string[] }

export const NO_FILTERS: ActionFilters = { statuses: [], assignees: [] }

export const hasFilters = (f: ActionFilters) => f.statuses.length > 0 || f.assignees.length > 0

export function matchesFilters(a: ActionItem, f: ActionFilters): boolean {
  if (f.statuses.length && !f.statuses.includes(a.status)) return false
  if (f.assignees.length && !a.assignees.some(id => f.assignees.includes(id))) return false
  return true
}

/** Groups with only their matching actions; groups left empty are dropped. */
export function filterGroups(groups: ActionGroup[], f: ActionFilters): ActionGroup[] {
  return groups
    .map(g => ({ ...g, actions: g.actions.filter(a => matchesFilters(a, f)) }))
    .filter(g => g.actions.length > 0)
}

/* ── Display helpers ───────────────────────────────────────── */

export function formatDue(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ── Export ────────────────────────────────────────────────── */

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`

export function toCsv(groups: ActionGroup[]): string {
  const rows = [['Meeting', 'Action', 'Status', 'Assignees', 'Due date']]
  for (const g of groups) {
    for (const a of g.actions) {
      rows.push([g.name, a.title, a.status, a.assignees.map(id => userById(id).name).join('; '), formatDue(a.due)])
    }
  }
  return rows.map(r => r.map(csvCell).join(',')).join('\n')
}
