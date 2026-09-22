import { useState } from 'react'
import { Dropdown, type DropdownTreeOption, type DropdownOption, type DropdownSelectableOption } from '../../components/Dropdown/Dropdown'
import { Button }   from '../../components/Button/Button'
import { actions }  from '../../icons/actions'
import { users }    from '../../icons/users'
import styles from './DropdownPage.module.css'
import { SourceLink } from '../SourceLink'
import userPic1 from '../../assets/user-profile-pic-1.png'
import userPic2 from '../../assets/user-profile-pic-2.png'

/* ── Icons ────────────────────────────────────────────────────────────────── */

const plusSvg     = actions.find(i => i.name === 'plus')!.svg
const settingsSvg = actions.find(i => i.name === 'settings')!.svg
const exitSvg     = actions.find(i => i.name === 'exit')!.svg
const userSvg     = users.find(i => i.name === 'user')!.svg

const Icon = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)

/* ── Sample data ──────────────────────────────────────────────────────────── */

const FRUITS = [
  { value: 'apple',      label: 'Apple' },
  { value: 'banana',     label: 'Banana' },
  { value: 'cherry',     label: 'Cherry' },
  { value: 'date',       label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig',        label: 'Fig' },
  { value: 'grape',      label: 'Grape' },
]

const FRUITS_WITH_DELETE = [
  ...FRUITS.slice(0, 4),
  { value: 'delete', label: 'Delete item', delete: true },
]

const STATUSES = [
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending',  label: 'Pending' },
  { value: 'archived', label: 'Archived' },
]

const STATUSES_WITH_SECONDARY = [
  { value: 'active',   label: 'Active',   secondaryText: 'Text' },
  { value: 'inactive', label: 'Inactive', secondaryText: 'Text' },
  { value: 'pending',  label: 'Pending',  secondaryText: 'Text' },
  { value: 'archived', label: 'Archived', secondaryText: 'Text' },
]

const plusIcon = <Icon svg={plusSvg} />

const STATUSES_WITH_ICONS = [
  { value: 'active',   label: 'Active',   icon: plusIcon },
  { value: 'inactive', label: 'Inactive', icon: plusIcon },
  { value: 'pending',  label: 'Pending',  icon: plusIcon },
  { value: 'archived', label: 'Archived', icon: plusIcon },
]

const GROUPED_PERMISSIONS: DropdownOption[] = [
  { type: 'group',  label: 'Groups' },
  { value: 'group-view',   label: 'View groups' },
  { value: 'group-manage', label: 'Manage groups' },
  { type: 'divider' },
  { type: 'group',  label: 'Users' },
  { value: 'user-view',   label: 'View users' },
  { value: 'user-invite', label: 'Invite users' },
  { value: 'user-manage', label: 'Manage users' },
]

const LANGUAGE_OPTIONS: DropdownSelectableOption[] = [
  { value: 'lang-en', label: 'English' },
  { value: 'lang-es', label: 'Español' },
  { value: 'lang-fr', label: 'Français' },
]

/* ── Multi-level sublist demo data (Board metaphors) ──────────────────────
   Sublist nesting is unbounded — these three menus exercise 2, 3 and 4
   levels deep using real board-portal concepts (board books, meetings,
   voting, governance committees). */

const BOARD_BOOK_MENU: DropdownSelectableOption[] = [
  {
    value: 'view-book', label: 'View book', children: [
      { value: 'view-book-browser', label: 'Open in browser' },
      { value: 'view-book-app',     label: 'Open in app' },
    ],
  },
  {
    value: 'download', label: 'Download', children: [
      { value: 'download-pdf',       label: 'PDF' },
      { value: 'download-annotated', label: 'PDF with annotations' },
      { value: 'download-print',     label: 'Print-ready PDF' },
    ],
  },
  {
    value: 'share-book', label: 'Share with board', children: [
      { value: 'share-book-board',     label: 'With board' },
      { value: 'share-book-committee', label: 'With committee' },
    ],
  },
]

const MEETING_MENU: DropdownSelectableOption[] = [
  {
    value: 'agenda', label: 'Agenda', children: [
      { value: 'agenda-view', label: 'View agenda' },
      { value: 'agenda-edit', label: 'Edit agenda' },
    ],
  },
  {
    value: 'minutes', label: 'Minutes', children: [
      { value: 'minutes-view',    label: 'View minutes' },
      { value: 'minutes-approve', label: 'Approve minutes' },
    ],
  },
  {
    value: 'voting', label: 'Voting', children: [
      { value: 'cast-vote', label: 'Cast a vote' },
      {
        value: 'voting-settings', label: 'Voting settings', children: [
          { value: 'anonymous-voting', label: 'Anonymous voting' },
          { value: 'weighted-voting',  label: 'Weighted voting' },
          { value: 'quorum-rules',     label: 'Quorum rules' },
        ],
      },
    ],
  },
  {
    value: 'attendance', label: 'Attendance', children: [
      { value: 'attendance-view', label: 'View attendance' },
      { value: 'attendance-mark', label: 'Mark attendance' },
    ],
  },
]

const GOVERNANCE_MENU: DropdownSelectableOption[] = [
  {
    value: 'directory', label: 'Board directory', children: [
      { value: 'directory-view',   label: 'View directory' },
      { value: 'directory-export', label: 'Export directory' },
    ],
  },
  {
    value: 'committees', label: 'Committees', children: [
      { value: 'audit-committee', label: 'Audit committee' },
      {
        value: 'governance-committee', label: 'Governance committee', children: [
          { value: 'charter', label: 'Committee charter' },
          {
            value: 'policies', label: 'Policies', children: [
              { value: 'conflict-of-interest', label: 'Conflict of interest' },
              { value: 'code-of-conduct',      label: 'Code of conduct' },
              { value: 'data-retention',        label: 'Data retention' },
            ],
          },
        ],
      },
      { value: 'compensation-committee', label: 'Compensation committee' },
    ],
  },
  {
    value: 'settings', label: 'Settings', children: [
      { value: 'settings-general',     label: 'General' },
      { value: 'settings-permissions', label: 'Permissions' },
    ],
  },
]

/* ── User & Group item data ───────────────────────────────────────────────── */

const PEOPLE: DropdownSelectableOption[] = [
  { value: 'alice',  label: 'Alice Johnson',  avatar: { src: userPic1, initials: 'AJ', type: 'user' } },
  { value: 'bob',    label: 'Bob Smith',      avatar: { initials: 'BS',  type: 'user' } },
  { value: 'carol',  label: 'Carol Williams', avatar: { src: userPic2, initials: 'CW', type: 'user' }, sublistLabel: '(Admin)' },
  { value: 'david',  label: 'David Lee',      avatar: { initials: 'DL',  type: 'user' } },
]

const GROUPS_LIST: DropdownSelectableOption[] = [
  { value: 'board',  label: 'Board Members', avatar: { initials: 'BM', type: 'group' } },
  { value: 'execs',  label: 'Executives',    avatar: { initials: 'EX', type: 'group' } },
  { value: 'admins', label: 'Admins',        avatar: { initials: 'AD', type: 'group' } },
]

const MIXED_PEOPLE_GROUPS: DropdownOption[] = [
  { type: 'group',  label: 'Groups' },
  ...GROUPS_LIST,
  { type: 'divider' },
  { type: 'group',  label: 'People' },
  ...PEOPLE,
]

const TREE_OPTIONS: DropdownTreeOption[] = [
  // Level 0 → 1
  { value: 'board-books',            label: 'Board books',            level: 0, expandable: true, isExpanded: true },
  { value: 'board-book-downloading', label: 'Board book downloading', level: 1 },
  { value: 'board-book-viewing',     label: 'Board book viewing',     level: 1 },
  // Level 0 → 1 → 2
  { value: 'meetings',               label: 'Meetings',               level: 0, expandable: true, isExpanded: true },
  { value: 'minutes',                label: 'Minutes',                level: 1 },
  { value: 'voting',                 label: 'Voting',                 level: 1, expandable: true, isExpanded: true },
  { value: 'anonymous-voting',       label: 'Anonymous voting',       level: 2 },
  { value: 'weighted-voting',        label: 'Weighted voting',        level: 2 },
  { value: 'recordings',             label: 'Recordings',             level: 1 },
  // Level 0 → 1 (collapsed by default)
  { value: 'users',                  label: 'Users',                  level: 0, expandable: true, isExpanded: false },
  { value: 'logins',                 label: 'Logins',                 level: 1 },
  { value: 'custom-user-fields',     label: 'Custom user fields',     level: 1 },
  { value: 'groups',                 label: 'Groups',                 level: 1 },
  // Level 0 leaves
  { value: 'documents',              label: 'Documents',              level: 0 },
  { value: 'settings',               label: 'Settings',               level: 0 },
  { value: 'tasks',                  label: 'Tasks',                  level: 0 },
]

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function DropdownPage() {
  /* Showcase dropdowns — individual state per example */
  const [vals, setVals] = useState<Record<string, string>>({
    stateActive:   'active',
    stateDisabled: 'active',
    stateError:    'active',
    sizeS:         '',
    sizeM:         '',
    sizeL:         '',
    labelOnly:     '',
    iconLeft:      '',
    secondary:     '',
    iconClear:     'active',
    hint:          '',
    deleteOpt:     '',
  })
  const set = (k: string) => (v: string | string[]) =>
    setVals(p => ({ ...p, [k]: v as string }))

  /* Live demos */
  const [single1, setSingle1] = useState<string>('')
  const [single2, setSingle2] = useState<string>('apple')
  const [multi1,  setMulti1]  = useState<string[]>([])
  const [multi2,  setMulti2]  = useState<string[]>(['apple', 'cherry'])
  const [tree1,   setTree1]   = useState<string[]>([])
  const [tree2,   setTree2]   = useState<string[]>(['board-book-viewing', 'anonymous-voting', 'documents'])
  const [grp1,    setGrp1]    = useState<string>('')
  const [grp2,    setGrp2]    = useState<string[]>([])
  const [menu1,   setMenu1]   = useState<string>('lang-en')
  const [bookMenu,       setBookMenu]       = useState<string>('')
  const [meetingMenu,    setMeetingMenu]    = useState<string>('')
  const [governanceMenu, setGovernanceMenu] = useState<string>('')

  /* No-border demos */
  const [nb1, setNb1] = useState<string>('cherry')
  const [nb2, setNb2] = useState<string>('')
  const [nb3, setNb3] = useState<string>('cherry')

  /* User & Group demos */
  const [ugSingle,      setUgSingle]      = useState<string>('')
  const [ugMulti,       setUgMulti]       = useState<string[]>([])
  const [ugMixed,       setUgMixed]       = useState<string>('')
  const [ugMixedMulti,  setUgMixedMulti]  = useState<string[]>([])

  /* ── Sublist demo data (computed from state) ──────────────────────────── */

  const selectedLangLabel = LANGUAGE_OPTIONS.find(o => o.value === menu1)?.label
  const menuOptions: DropdownSelectableOption[] = [
    {
      value: 'my-profile', label: 'My profile', icon: <Icon svg={userSvg} />, children: [
        { value: 'view-profile', label: 'View profile' },
        { value: 'edit-profile', label: 'Edit profile' },
      ],
    },
    {
      value: 'connections', label: 'Connections', icon: <Icon svg={settingsSvg} />, children: [
        { value: 'all-connections',    label: 'All connections' },
        { value: 'pending-connections', label: 'Pending requests' },
      ],
    },
    {
      value: 'language', label: 'Language', icon: <Icon svg={plusSvg} />,
      sublistLabel: selectedLangLabel ? `(${selectedLangLabel})` : undefined,
      children: LANGUAGE_OPTIONS,
    },
    {
      value: 'log-out', label: 'Log out', icon: <Icon svg={exitSvg} />, children: [
        { value: 'log-out-device', label: 'This device' },
        { value: 'log-out-all',    label: 'All devices' },
      ],
    },
  ]

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dropdown</h1>
      <p className={styles.subtitle}>Figma · 5761-13893</p>
      <SourceLink path="src/components/Dropdown/Dropdown.tsx" />

      {/* ── States ──────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>States</h2>
      <div className={styles.table}>
        <span className={styles.rowLabel}>Active</span>
        <Dropdown
          label="Label"
          options={STATUSES}
          value={vals.stateActive}
          onChange={set('stateActive')}
        />

        <span className={styles.rowLabel}>Disabled</span>
        <Dropdown
          label="Label"
          options={STATUSES}
          value={vals.stateDisabled}
          disabled
        />

        <span className={styles.rowLabel}>Error</span>
        <Dropdown
          label="Label"
          options={STATUSES}
          value={vals.stateError}
          onChange={set('stateError')}
          error="Please select a valid option"
        />
      </div>

      {/* ── Sizes ───────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Sizes</h2>
      <div className={styles.sizeRow}>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>S — 32px</span>
          <Dropdown size="s" label="Label" options={STATUSES}
            value={vals.sizeS} onChange={set('sizeS')} placeholder="Select value" />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>M — 40px</span>
          <Dropdown size="m" label="Label" options={STATUSES}
            value={vals.sizeM} onChange={set('sizeM')} placeholder="Select value" />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>L — 48px</span>
          <Dropdown size="l" label="Label" options={STATUSES}
            value={vals.sizeL} onChange={set('sizeL')} placeholder="Select value" />
        </div>
      </div>

      {/* ── Additional states ───────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Additional states</h2>
      <div className={styles.additionalGrid}>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Label only</span>
          <Dropdown label="Label" options={STATUSES}
            value={vals.labelOnly} onChange={set('labelOnly')} placeholder="Select value" />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Icon left</span>
          <Dropdown
            label="Label"
            options={STATUSES_WITH_ICONS}
            value={vals.iconLeft}
            onChange={set('iconLeft')}
            placeholder="Select value"
            iconLeft={<Icon svg={plusSvg} />}
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Secondary text</span>
          <Dropdown
            options={STATUSES_WITH_SECONDARY}
            value={vals.secondary}
            onChange={set('secondary')}
            placeholder="Select value"
            secondaryText="Text"
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Icon left + clear</span>
          <Dropdown
            label="Label"
            options={STATUSES_WITH_ICONS}
            value={vals.iconClear}
            onChange={set('iconClear')}
            iconLeft={<Icon svg={plusSvg} />}
            clearable
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Hint</span>
          <Dropdown
            label="Label"
            options={STATUSES}
            value={vals.hint}
            onChange={set('hint')}
            placeholder="Select value"
            hint="Hint text"
            hintAction={
              <Button variant="tertiary" size="s">Button</Button>
            }
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Delete option</span>
          <Dropdown
            label="Label"
            options={FRUITS_WITH_DELETE}
            value={vals.deleteOpt}
            onChange={set('deleteOpt')}
            placeholder="Select value"
          />
        </div>

      </div>

      {/* ── Single select (live) ────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Single select</h2>
      <p className={styles.description}>
        Click to open. Select an option to close. Clearable.
      </p>
      <div className={styles.demoRow}>
        <Dropdown
          label="Fruit"
          options={FRUITS}
          value={single1}
          onChange={v => setSingle1(v as string)}
          placeholder="Select a fruit"
          clearable
        />
        <Dropdown
          label="Fruit (pre-selected)"
          options={FRUITS}
          value={single2}
          onChange={v => setSingle2(v as string)}
          clearable
        />
      </div>

      {/* ── Multi select (live) ─────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Multi select</h2>
      <p className={styles.description}>
        Checkboxes — list stays open while selecting. Clearable.
      </p>
      <div className={styles.demoRow}>
        <Dropdown
          mode="multi"
          label="Fruits"
          options={FRUITS}
          value={multi1}
          onChange={v => setMulti1(v as string[])}
          placeholder="Select fruits"
          clearable
        />
        <Dropdown
          mode="multi"
          label="Fruits (pre-selected)"
          options={FRUITS}
          value={multi2}
          onChange={v => setMulti2(v as string[])}
          clearable
        />
      </div>

      {/* ── Grouped options (live) ──────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Grouped options</h2>
      <p className={styles.description}>
        Group labels + divider lines organize options into named sections.
        Delete options are always moved to the bottom.
      </p>
      <div className={styles.demoRow}>
        <Dropdown
          label="Permission (single)"
          options={GROUPED_PERMISSIONS}
          value={grp1}
          onChange={v => setGrp1(v as string)}
          placeholder="Select permission"
          clearable
        />
        <Dropdown
          mode="multi"
          label="Permissions (multi)"
          options={GROUPED_PERMISSIONS}
          value={grp2}
          onChange={v => setGrp2(v as string[])}
          placeholder="Select permissions"
          clearable
        />
      </div>

      {/* ── Sublist (live) ──────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Sublist</h2>
      <p className={styles.description}>
        Hover an item with a nested panel to reveal it on the right. Nesting is unbounded —
        every level opens and switches instantly on hover, whether to a sibling item or a
        shallower one; only closing to empty space gets a short grace period so the cursor can
        travel diagonally into the panel. Select a leaf item to close the whole chain and
        update the selection.
      </p>
      <div className={styles.demoRow}>
        <Dropdown
          label="User menu — 2 levels"
          options={menuOptions}
          value={menu1}
          onChange={v => setMenu1(v as string)}
          placeholder="Open menu"
        />
        <Dropdown
          label="Board book — 2 levels"
          options={BOARD_BOOK_MENU}
          value={bookMenu}
          onChange={v => setBookMenu(v as string)}
          placeholder="Book actions"
        />
        <Dropdown
          label="Meeting — 3 levels"
          options={MEETING_MENU}
          value={meetingMenu}
          onChange={v => setMeetingMenu(v as string)}
          placeholder="Meeting actions"
        />
        <Dropdown
          label="Governance — 4 levels"
          options={GOVERNANCE_MENU}
          value={governanceMenu}
          onChange={v => setGovernanceMenu(v as string)}
          placeholder="Governance actions"
        />
      </div>

      {/* ── Tree select (live) ──────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Tree select</h2>
      <p className={styles.description}>
        Hierarchical list with expand / collapse. Indented 28px per level. Clearable.
      </p>
      <div className={styles.demoRow}>
        <Dropdown
          mode="tree"
          label="Categories"
          options={TREE_OPTIONS}
          value={tree1}
          onChange={v => setTree1(v as string[])}
          placeholder="Select categories"
          clearable
        />
        <Dropdown
          mode="tree"
          label="Categories (pre-selected)"
          options={TREE_OPTIONS}
          value={tree2}
          onChange={v => setTree2(v as string[])}
          clearable
        />
      </div>

      {/* ── No border ───────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>No border</h2>
      <p className={styles.description}>
        No background or border. Trigger shrinks to content width.
        Value text is primary; placeholder is secondary. All elements go primary on hover.
      </p>
      <div className={styles.noBorderRow}>
        <div className={styles.noBorderItem}>
          <span className={styles.rowLabel}>With value</span>
          <Dropdown
            variant="no-border"
            options={FRUITS}
            value={nb1}
            onChange={v => setNb1(v as string)}
          />
        </div>
        <div className={styles.noBorderItem}>
          <span className={styles.rowLabel}>Empty (placeholder)</span>
          <Dropdown
            variant="no-border"
            options={STATUSES}
            value={nb2}
            onChange={v => setNb2(v as string)}
          />
        </div>
        <div className={styles.noBorderItem}>
          <span className={styles.rowLabel}>Prefix icon</span>
          <Dropdown
            variant="no-border"
            options={FRUITS}
            value={nb3}
            onChange={v => setNb3(v as string)}
            iconLeft={<Icon svg={plusSvg} />}
          />
        </div>
        <div className={styles.noBorderItem}>
          <span className={styles.rowLabel}>Disabled</span>
          <Dropdown
            variant="no-border"
            options={STATUSES}
            value="active"
            disabled
          />
        </div>
      </div>

      {/* ── User & Group items ──────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>User &amp; Group items</h2>
      <p className={styles.description}>
        Options with an avatar (24 px) — user (circular) or group / org (rounded square).
        Avatar always uses S-size (1 initial, 14px) regardless of item size.
      </p>
      <div className={styles.demoRow}>
        <Dropdown
          label="Assign to person"
          options={PEOPLE}
          value={ugSingle}
          onChange={v => setUgSingle(v as string)}
          placeholder="Select person"
          clearable
        />
        <Dropdown
          mode="multi"
          label="Assign to people"
          options={PEOPLE}
          value={ugMulti}
          onChange={v => setUgMulti(v as string[])}
          placeholder="Select people"
          clearable
        />
        <Dropdown
          label="Groups &amp; People"
          options={MIXED_PEOPLE_GROUPS}
          value={ugMixed}
          onChange={v => setUgMixed(v as string)}
          placeholder="Select…"
          clearable
        />
        <Dropdown
          mode="multi"
          label="Groups &amp; People (multi)"
          options={MIXED_PEOPLE_GROUPS}
          value={ugMixedMulti}
          onChange={v => setUgMixedMulti(v as string[])}
          placeholder="Select…"
          clearable
        />
      </div>

      {/* ── User & Group — sizes ─────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>User &amp; Group — Sizes</h2>
      <div className={styles.sizeRow}>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>S — 32px trigger</span>
          <Dropdown size="s" options={PEOPLE} value="" onChange={() => {}} placeholder="Select person" />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>M — 40px trigger</span>
          <Dropdown size="m" options={PEOPLE} value="" onChange={() => {}} placeholder="Select person" />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>L — 48px trigger</span>
          <Dropdown size="l" options={PEOPLE} value="" onChange={() => {}} placeholder="Select person" />
        </div>
      </div>

      {/* ── Spec ────────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Spec</h2>
      <table className={styles.specTable}>
        <tbody>
          <tr><td>Trigger height</td><td>S=32px · M=40px · L=48px</td></tr>
          <tr><td>Trigger border</td><td>inset 0 0 0 1px stone-500 → green-500 on hover/open</td></tr>
          <tr><td>Droplist shadow</td><td>shadow-100 (0 4px 12px rgba(31,33,41,0.16))</td></tr>
          <tr><td>Droplist max height</td><td>360px (scroll beyond)</td></tr>
          <tr><td>Item height</td><td>40px · padding 0 16px</td></tr>
          <tr><td>Selected item bg</td><td>green-50 (#CBF1DA)</td></tr>
          <tr><td>Hover item bg</td><td>stone-100 (#FBFBFB)</td></tr>
          <tr><td>Delete option</td><td>Red label — always at bottom</td></tr>
          <tr><td>Offset trigger→list</td><td>4px</td></tr>
          <tr><td>Droplist width</td><td>Matches trigger width</td></tr>
        </tbody>
      </table>
    </div>
  )
}
