import { useState } from 'react'
import { Autocomplete, type AutocompleteOption } from '../../components/Autocomplete/Autocomplete'
import { actions } from '../../icons/actions'
import styles from './AutocompletePage.module.css'
import { SourceLink } from '../SourceLink'

/* ── Icons ────────────────────────────────────────────────────────────────── */

const plusSvg = actions.find(i => i.name === 'plus')!.svg

const Icon = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)

/* ── Sample photo ─────────────────────────────────────────────────────────── */

const USER_PHOTO = 'https://www.figma.com/api/mcp/asset/5a06f04f-25e6-46f2-94b2-cc9a0071069d'

/* ── Sample data ──────────────────────────────────────────────────────────── */

const PEOPLE: AutocompleteOption[] = [
  { value: 'alice',  label: 'Alice Johnson',  avatar: { src: USER_PHOTO, type: 'user' } },
  { value: 'bob',    label: 'Bob Smith',      avatar: { initials: 'BS', type: 'user' } },
  { value: 'carol',  label: 'Carol Williams', avatar: { src: USER_PHOTO, type: 'user' }, sublistLabel: '(Admin)' },
  { value: 'david',  label: 'David Lee',      avatar: { initials: 'DL', type: 'user' } },
  { value: 'emma',   label: 'Emma Davis',     avatar: { initials: 'ED', type: 'user' } },
]

const GROUPS_AC: AutocompleteOption[] = [
  { value: 'board',  label: 'Board Members', avatar: { initials: 'BM', type: 'group' } },
  { value: 'execs',  label: 'Executives',    avatar: { initials: 'EX', type: 'group' } },
  { value: 'admins', label: 'Admins',        avatar: { initials: 'AD', type: 'group' } },
]

const PEOPLE_AND_GROUPS: AutocompleteOption[] = [...PEOPLE, ...GROUPS_AC]

const FRUITS: AutocompleteOption[] = [
  { value: 'apple',      label: 'Apple' },
  { value: 'banana',     label: 'Banana' },
  { value: 'cherry',     label: 'Cherry' },
  { value: 'date',       label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig',        label: 'Fig' },
  { value: 'grape',      label: 'Grape' },
]

const COUNTRIES: AutocompleteOption[] = [
  { value: 'ua',  label: 'Ukraine' },
  { value: 'us',  label: 'United States' },
  { value: 'gb',  label: 'United Kingdom' },
  { value: 'de',  label: 'Germany' },
  { value: 'fr',  label: 'France' },
  { value: 'pl',  label: 'Poland' },
  { value: 'jp',  label: 'Japan' },
  { value: 'ca',  label: 'Canada' },
  { value: 'au',  label: 'Australia' },
  { value: 'nl',  label: 'Netherlands' },
]

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function AutocompletePage() {
  /* Showcase dropdowns — individual state per example */
  const [vals, setVals] = useState<Record<string, string>>({
    stateActive:   '',
    stateDisabled: '',
    stateError:    '',
    sizeS:         '',
    sizeM:         '',
    sizeL:         '',
    prefix:        '',
    clearable:     'apple',
    hint:          '',
    noOpts:        '',
    nbEmpty:       '',
    nbValue:       'cherry',
    nbPrefix:      'apple',
    nbDisabled:    'banana',
  })
  const set = (k: string) => (v: string | string[]) =>
    setVals(p => ({ ...p, [k]: v as string }))

  /* User & Group demos */
  const [ugPerson,  setUgPerson]  = useState('')
  const [ugGroup,   setUgGroup]   = useState('')
  const [ugMixed,   setUgMixed]   = useState('')

  /* Live demos */
  const [live1, setLive1] = useState<string>('')
  const [live2, setLive2] = useState<string>('ua')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Autocomplete</h1>
      <p className={styles.subtitle}>Based on TextField · "No options" Figma node 34614-49336</p>
      <SourceLink path="src/components/Autocomplete/Autocomplete.tsx" />

      {/* ── States ──────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>States</h2>
      <div className={styles.table}>
        <span className={styles.rowLabel}>Active</span>
        <Autocomplete
          label="Label"
          options={FRUITS}
          value={vals.stateActive}
          onChange={set('stateActive')}
          placeholder="Select…"
        />

        <span className={styles.rowLabel}>Disabled</span>
        <Autocomplete
          label="Label"
          options={FRUITS}
          value={vals.stateDisabled}
          placeholder="Select…"
          disabled
        />

        <span className={styles.rowLabel}>Error</span>
        <Autocomplete
          label="Label"
          options={FRUITS}
          value={vals.stateError}
          onChange={set('stateError')}
          placeholder="Select…"
          error="Please select a valid option"
        />
      </div>

      {/* ── Sizes ───────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Sizes</h2>
      <div className={styles.sizeRow}>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>S — 32px</span>
          <Autocomplete
            size="s"
            label="Label"
            options={FRUITS}
            value={vals.sizeS}
            onChange={set('sizeS')}
            placeholder="Select…"
          />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>M — 40px</span>
          <Autocomplete
            size="m"
            label="Label"
            options={FRUITS}
            value={vals.sizeM}
            onChange={set('sizeM')}
            placeholder="Select…"
          />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>L — 48px</span>
          <Autocomplete
            size="l"
            label="Label"
            options={FRUITS}
            value={vals.sizeL}
            onChange={set('sizeL')}
            placeholder="Select…"
          />
        </div>
      </div>

      {/* ── Additional states ───────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Additional states</h2>
      <div className={styles.additionalGrid}>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Prefix icon</span>
          <Autocomplete
            label="Label"
            options={FRUITS}
            value={vals.prefix}
            onChange={set('prefix')}
            placeholder="Select…"
            prefix={<Icon svg={plusSvg} />}
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Clearable</span>
          <Autocomplete
            label="Label"
            options={FRUITS}
            value={vals.clearable}
            onChange={set('clearable')}
            placeholder="Select…"
            clearable
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Hint</span>
          <Autocomplete
            label="Label"
            options={FRUITS}
            value={vals.hint}
            onChange={set('hint')}
            placeholder="Select…"
            helper="Start typing to filter"
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>No options</span>
          <Autocomplete
            label="Label"
            options={FRUITS}
            value={vals.noOpts}
            onChange={set('noOpts')}
            placeholder="Try typing 'xyz'"
          />
        </div>

      </div>

      {/* ── No border variant ───────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>No border</h2>
      <p className={styles.description}>
        No border or background. In resting state the clear button appears inline
        right after the value text (8px gap). On focus the input expands for typing.
      </p>
      <div className={styles.additionalGrid}>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>With value + clear</span>
          <Autocomplete
            variant="no-border"
            label="Label"
            options={FRUITS}
            value={vals.nbValue}
            onChange={set('nbValue')}
            placeholder="Select…"
            clearable
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Empty (placeholder)</span>
          <Autocomplete
            variant="no-border"
            label="Label"
            options={FRUITS}
            value={vals.nbEmpty}
            onChange={set('nbEmpty')}
            placeholder="Select…"
            clearable
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Prefix + clear</span>
          <Autocomplete
            variant="no-border"
            label="Label"
            options={FRUITS}
            value={vals.nbPrefix}
            onChange={set('nbPrefix')}
            placeholder="Select…"
            prefix={<Icon svg={plusSvg} />}
            clearable
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Disabled</span>
          <Autocomplete
            variant="no-border"
            label="Label"
            options={FRUITS}
            value={vals.nbDisabled}
            placeholder="Select…"
            disabled
          />
        </div>

      </div>

      {/* ── User & Group items ──────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>User & Group items</h2>
      <div className={styles.additionalGrid}>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>People</span>
          <Autocomplete
            label="Assign to"
            options={PEOPLE}
            value={ugPerson}
            onChange={v => setUgPerson(v as string)}
            placeholder="Select person…"
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Groups</span>
          <Autocomplete
            label="Assign to group"
            options={GROUPS_AC}
            value={ugGroup}
            onChange={v => setUgGroup(v as string)}
            placeholder="Select group…"
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Mixed</span>
          <Autocomplete
            label="Assign to"
            options={PEOPLE_AND_GROUPS}
            value={ugMixed}
            onChange={v => setUgMixed(v as string)}
            placeholder="Person or group…"
            clearable
          />
        </div>

      </div>

      {/* ── Live demo ───────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Live demo</h2>
      <p className={styles.description}>
        Click to open all options. Type to filter. ↑↓ to navigate. Enter or click to select.
        Escape to dismiss. Clearable on the second field.
      </p>
      <div className={styles.demoRow}>
        <Autocomplete
          label="Fruit"
          options={FRUITS}
          value={live1}
          onChange={v => setLive1(v as string)}
          placeholder="Select fruit…"
          prefix={<Icon svg={plusSvg} />}
        />
        <Autocomplete
          label="Country (pre-selected)"
          options={COUNTRIES}
          value={live2}
          onChange={v => setLive2(v as string)}
          placeholder="Select country…"
          clearable
        />
      </div>

      {/* ── Spec ────────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Spec</h2>
      <table className={styles.specTable}>
        <tbody>
          <tr><td>Field height</td><td>S=32px · M=40px · L=48px</td></tr>
          <tr><td>Field border</td><td>inset 0 0 0 1px stone-500 → green-500 on focus/open</td></tr>
          <tr><td>Droplist shadow</td><td>shadow-100 (0 4px 12px rgba(31,33,41,0.16))</td></tr>
          <tr><td>Droplist max height</td><td>360px (scroll beyond)</td></tr>
          <tr><td>Item height</td><td>40px · padding 0 12px</td></tr>
          <tr><td>Selected item bg</td><td>color-bg-selected (#EBF8EF)</td></tr>
          <tr><td>Hover / active item bg</td><td>color-bg-hover (#ECEEF9)</td></tr>
          <tr><td>No options</td><td>Same item box — opacity 0.4, pointer-events: none</td></tr>
          <tr><td>Filter behavior</td><td>Empty on focus = all options; typing = substring match</td></tr>
          <tr><td>Keyboard</td><td>↑↓ navigate · Enter select · Escape close</td></tr>
          <tr><td>Offset trigger→list</td><td>4px</td></tr>
          <tr><td>Droplist width</td><td>Matches field width</td></tr>
        </tbody>
      </table>
    </div>
  )
}
