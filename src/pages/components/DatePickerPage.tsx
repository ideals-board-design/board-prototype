import { useState } from 'react'
import { DatePicker } from '../../components/DatePicker/DatePicker'
import { DateCell } from '../../components/DateCell/DateCell'
import { YearCell } from '../../components/YearCell/YearCell'
import { Calendar } from '../../components/Calendar/Calendar'
import styles from './DatePickerPage.module.css'
import { SourceLink } from '../SourceLink'

const CELL_TYPES = ['default', 'date-range', 'selected', 'today'] as const
const CELL_LABELS = { 'default': 'Default', 'date-range': 'Date range', 'selected': 'Selected', 'today': 'Today' }

const YEAR_TYPES = ['default', 'selected'] as const
const YEAR_LABELS = { 'default': 'Default', 'selected': 'Selected' }

const AUG_27 = new Date(2025, 7, 27)

export default function DatePickerPage() {

  const [vals, setVals] = useState<Record<string, Date | null>>({
    stateActive:   null,
    stateDisabled: null,
    stateError:    null,
    sizeS:         null,
    sizeM:         null,
    sizeL:         null,
    clearable:     AUG_27,
    hint:          null,
    nbEmpty:       null,
    nbValue:       AUG_27,
    nbDisabled:    AUG_27,
    live1:         null,
    live2:         AUG_27,
  })
  const set = (k: string) => (d: Date | null) =>
    setVals(p => ({ ...p, [k]: d }))

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Date Picker</h1>
      <p className={styles.subtitle}>Figma node 24002-10435</p>
      <SourceLink path="src/components/DatePicker/DatePicker.tsx" />

      {/* ── States ──────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>States</h2>
      <div className={styles.table}>
        <span className={styles.rowLabel}>Active</span>
        <DatePicker
          label="Date"
          value={vals.stateActive}
          onChange={set('stateActive')}
          placeholder="MM/DD/YYYY"
        />

        <span className={styles.rowLabel}>Disabled</span>
        <DatePicker
          label="Date"
          value={vals.stateDisabled}
          placeholder="MM/DD/YYYY"
          disabled
        />

        <span className={styles.rowLabel}>Error</span>
        <DatePicker
          label="Date"
          value={vals.stateError}
          onChange={set('stateError')}
          placeholder="MM/DD/YYYY"
          error="Please select a valid date"
        />
      </div>

      {/* ── Sizes ───────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Sizes</h2>
      <div className={styles.sizeRow}>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>S — 32px</span>
          <DatePicker
            size="s"
            label="Date"
            value={vals.sizeS}
            onChange={set('sizeS')}
            placeholder="MM/DD/YYYY"
          />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>M — 40px</span>
          <DatePicker
            size="m"
            label="Date"
            value={vals.sizeM}
            onChange={set('sizeM')}
            placeholder="MM/DD/YYYY"
          />
        </div>
        <div className={styles.sizeItem}>
          <span className={styles.rowLabel}>L — 48px</span>
          <DatePicker
            size="l"
            label="Date"
            value={vals.sizeL}
            onChange={set('sizeL')}
            placeholder="MM/DD/YYYY"
          />
        </div>
      </div>

      {/* ── Additional states ───────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Additional states</h2>
      <div className={styles.additionalGrid}>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Clearable (with value)</span>
          <DatePicker
            label="Date"
            value={vals.clearable}
            onChange={set('clearable')}
            placeholder="MM/DD/YYYY"
            clearable
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Hint</span>
          <DatePicker
            label="Date"
            value={vals.hint}
            onChange={set('hint')}
            placeholder="MM/DD/YYYY"
            helper="Select a date"
          />
        </div>

      </div>

      {/* ── No border variant ────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>No border</h2>
      <div className={styles.additionalGrid}>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Empty (placeholder)</span>
          <DatePicker
            variant="no-border"
            label="Date"
            value={vals.nbEmpty}
            onChange={set('nbEmpty')}
            placeholder="MM/DD/YYYY"
            clearable
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>With value</span>
          <DatePicker
            variant="no-border"
            label="Date"
            value={vals.nbValue}
            onChange={set('nbValue')}
            placeholder="MM/DD/YYYY"
            clearable
          />
        </div>

        <div className={styles.additionalItem}>
          <span className={styles.rowLabel}>Disabled</span>
          <DatePicker
            variant="no-border"
            label="Date"
            value={vals.nbDisabled}
            placeholder="MM/DD/YYYY"
            disabled
          />
        </div>

      </div>

      {/* ── Live demo ────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Live demo</h2>
      <p className={styles.description}>
        Click to open the calendar. Escape to dismiss.
        Clear button visible on second field (pre-selected value).
      </p>
      <div className={styles.demoRow}>
        <DatePicker
          label="Start date"
          value={vals.live1}
          onChange={set('live1')}
          placeholder="MM/DD/YYYY"
        />
        <DatePicker
          label="End date (pre-selected)"
          value={vals.live2}
          onChange={set('live2')}
          placeholder="MM/DD/YYYY"
          clearable
        />
      </div>

      {/* ── Date range ───────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Date range</h2>
      <p className={styles.description}>Figma node 34703-5171 · Click once for start, again for end.</p>
      <div className={styles.demoRow}>
        <DatePicker
          mode="range"
          label="Date range"
          rangeStart={new Date(2025, 1, 3)}
          rangeEnd={new Date(2025, 2, 3)}
          placeholder="MM/DD/YYYY – MM/DD/YYYY"
          clearable
        />
      </div>

      {/* ── Date Cell ────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Date Cell</h2>
      <p className={styles.description}>Figma node 24002-7087 · 32×32px calendar day cell</p>

      <div className={styles.cellGrid}>
        <div />
        {CELL_TYPES.map(t => (
          <div key={t} className={styles.colLabel}>{CELL_LABELS[t]}</div>
        ))}

        <div className={styles.cellRowLabel}>Active</div>
        {CELL_TYPES.map(t => (
          <div key={t} className={styles.cellWrap}>
            <DateCell day={29} type={t} />
          </div>
        ))}

        <div className={styles.cellRowLabel}>Disabled</div>
        <div className={styles.cellWrap}><DateCell day={29} type="default" disabled /></div>
        <div className={styles.cellWrap} />
        <div className={styles.cellWrap} />
        <div className={styles.cellWrap} />
      </div>

      {/* ── Year Cell ────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Year Cell</h2>
      <p className={styles.description}>Figma node 32250-2427 · 56×32px year selector cell</p>

      <div className={styles.yearCellGrid}>
        <div />
        {YEAR_TYPES.map(t => (
          <div key={t} className={styles.colLabel}>{YEAR_LABELS[t]}</div>
        ))}

        <div className={styles.cellRowLabel}>Active</div>
        {YEAR_TYPES.map(t => (
          <div key={t} className={styles.cellWrap}>
            <YearCell year={2026} type={t} />
          </div>
        ))}

        <div className={styles.cellRowLabel}>Disabled</div>
        <div className={styles.cellWrap}>
          <YearCell year={2026} type="default" disabled />
        </div>
        <div className={styles.cellWrap} />
      </div>

      {/* ── Calendar ─────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Calendar</h2>
      <p className={styles.description}>Figma node 34696-4767 · 248×290px · Assembled from Button, DateCell, YearCell</p>
      <div className={styles.calendarRow}>
        <Calendar />
        <Calendar value={new Date(2025, 7, 27)} />
      </div>

      {/* ── Spec ─────────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Spec</h2>
      <table className={styles.specTable}>
        <tbody>
          <tr><td>Trigger height</td><td>S=32px · M=40px · L=48px (via padding)</td></tr>
          <tr><td>Trigger border</td><td>inset 0 0 0 1px stone-500 → green-500 on hover/open</td></tr>
          <tr><td>Calendar icon</td><td>Right-aligned, 16px (S) / 20px (M/L), secondary color</td></tr>
          <tr><td>Placeholder</td><td>MM/DD/YYYY · secondary text color</td></tr>
          <tr><td>Popover shadow</td><td>shadow-100 (same as droplist)</td></tr>
          <tr><td>Popover offset</td><td>4px below trigger</td></tr>
          <tr><td>Popover width</td><td>Matches trigger width</td></tr>
          <tr><td>Clear button</td><td>Visible only when value is set (clearable=true)</td></tr>
          <tr><td>Status</td><td>Calendar renders in popover — fully functional</td></tr>
        </tbody>
      </table>
    </div>
  )
}
