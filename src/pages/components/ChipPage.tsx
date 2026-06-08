/* ChipPage — Figma node 23764-133279 */

import { useState } from 'react'
import { Chip } from '../../components/Chip/Chip'
import { Avatar } from '../../components/Avatar/Avatar'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { actions } from '../../icons/actions'
import { functional } from '../../icons/functional'
import styles from './ChipPage.module.css'

const plusSvg  = actions.find(i => i.name === 'plus')!.svg
const dragSvg  = functional.find(i => i.name === 'drag')!.svg

function Icon({ svg }: { svg: string }) {
  const colored = svg.replace(/fill="#[0-9A-Fa-f]{3,8}"/gi, 'fill="currentColor"')
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: colored }} />
}

const MENU_ITEMS = [
  { label: 'Edit',   onClick: () => {} },
  { label: 'Rename', onClick: () => {} },
  { label: 'Delete', onClick: () => {}, danger: true },
]

export default function ChipPage() {
  const [chips, setChips] = useState(['Design', 'Research', 'Frontend', 'Backend', 'Testing'])

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Chip</h1>
      <p className={styles.subtitle}>Figma · 23764-133279</p>

      {/* ── Variants ──────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Variants</h2>

      <div className={styles.variantTable}>
        <span className={styles.colLabel} />
        <span className={styles.colLabel}>Active</span>
        <span className={styles.colLabel}>Disabled</span>

        <span className={styles.rowLabel}>avatar: Picture</span>
        <Chip label="Chip name" avatar={<Avatar size="s" type="user" variant="picture" src="https://www.figma.com/api/mcp/asset/d5c2d57d-c16c-4507-b31d-ccc892332a9f" alt="User" />} />
        <Chip label="Chip name" disabled avatar={<Avatar size="s" type="user" variant="picture" src="https://www.figma.com/api/mcp/asset/d5c2d57d-c16c-4507-b31d-ccc892332a9f" alt="User" />} />

        <span className={styles.rowLabel}>avatar: Letters</span>
        <Chip label="Chip name" avatar={<Avatar size="s" type="user" variant="letters" color="contrast" initials="A" />} />
        <Chip label="Chip name" disabled avatar={<Avatar size="s" type="user" variant="letters" color="contrast" initials="A" />} />

        <span className={styles.rowLabel}>icon right: Remove</span>
        <Chip label="Chip name" onRemove={() => {}} />
        <Chip label="Chip name" disabled onRemove={() => {}} />

        <span className={styles.rowLabel}>icon right: Danger Remove</span>
        <Chip label="Chip name" type="danger" onRemove={() => {}} />
        <Chip label="Chip name" type="danger" disabled onRemove={() => {}} />

        <span className={styles.rowLabel}>icon right: 3 dot</span>
        <Chip label="Chip name" menuItems={MENU_ITEMS} />
        <Chip label="Chip name" disabled menuItems={MENU_ITEMS} />

        <span className={styles.rowLabel}>icon left: Drag</span>
        <Tooltip label="Drag" position="top"><Chip label="Chip name" draggable iconLeft={<Icon svg={dragSvg} />} /></Tooltip>
        <Tooltip label="Drag" position="top"><Chip label="Chip name" disabled draggable iconLeft={<Icon svg={dragSvg} />} /></Tooltip>

        <span className={styles.rowLabel}>icon left: Plus</span>
        <Chip label="Chip name" iconLeft={<Icon svg={plusSvg} />} />
        <Chip label="Chip name" disabled iconLeft={<Icon svg={plusSvg} />} />
      </div>

      {/* ── Interactive — remove ──────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Interactive — remove</h2>
      <div className={styles.chipGroup}>
        {chips.map(chip => (
          <Chip
            key={chip}
            label={chip}
            onRemove={() => setChips(prev => prev.filter(c => c !== chip))}
          />
        ))}
        {chips.length === 0 && (
          <button
            className={styles.resetBtn}
            onClick={() => setChips(['Design', 'Research', 'Frontend', 'Backend', 'Testing'])}
          >
            Reset
          </button>
        )}
      </div>

      {/* ── Interactive — menu ────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Interactive — menu</h2>
      <div className={styles.chipGroup}>
        <Chip label="Design" menuItems={[{ label: 'Edit', onClick: () => {} }, { label: 'Rename', onClick: () => {} }, { label: 'Delete', onClick: () => {}, danger: true }]} />
        <Chip label="Research" menuItems={[{ label: 'Edit', onClick: () => {} }, { label: 'Rename', onClick: () => {} }, { label: 'Delete', onClick: () => {}, danger: true }]} />
        <Chip label="Frontend" type="danger" menuItems={[{ label: 'Edit', onClick: () => {} }, { label: 'Delete', onClick: () => {}, danger: true }]} />
      </div>
    </div>
  )
}
