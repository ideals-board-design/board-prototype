/* BadgeStatusPage — Figma node 23996-1024 */

import { BadgeStatus, type BadgeStatusType } from '../../components/BadgeStatus/BadgeStatus'
import { condition } from '../../icons/condition'
import { actions } from '../../icons/actions'
import styles from './BadgeStatusPage.module.css'

const infoSvg     = condition.find(i => i.name === 'info-circle')!.svg
const checkSvg    = condition.find(i => i.name === 'check-circle')!.svg
const alertSvg    = condition.find(i => i.name === 'alert-triangle')!.svg
const draftSvg    = actions.find(i => i.name === 'draft-circle')!.svg
const exclSvg     = condition.find(i => i.name === 'exclamation-circle')!.svg

function Icon({ svg }: { svg: string }) {
  const colored = svg.replace(/fill="#[0-9A-Fa-f]{3,8}"/gi, 'fill="currentColor"')
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: colored }} />
}

const TYPES: { type: BadgeStatusType; label: string; usage: string }[] = [
  { type: 'neutral',  label: 'Neutral',  usage: 'In progress · Info' },
  { type: 'positive', label: 'Positive', usage: 'Active · Completed · Approved' },
  { type: 'danger',   label: 'Danger',   usage: 'Overdue · Error' },
  { type: 'warning',  label: 'Warning',  usage: 'Draft/New · Updated' },
  { type: 'disable',  label: 'Disable',  usage: 'Deactivated · Inactive' },
  { type: 'pending',  label: 'Pending',  usage: 'Pending review' },
]

export default function BadgeStatusPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Badge Status</h1>
      <p className={styles.subtitle}>Figma · 23996-1024</p>

      {/* ── Types ─────────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Types</h2>
      <div className={styles.typeGrid}>
        {TYPES.map(({ type, label, usage }) => (
          <div key={type} className={styles.typeItem}>
            <BadgeStatus type={type} label="Badge" />
            <span className={styles.typeLabel}>{label}</span>
            <span className={styles.typeUsage}>{usage}</span>
          </div>
        ))}
      </div>

      {/* ── With icons ────────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>With icons</h2>
      <div className={styles.iconRow}>
        <div className={styles.iconItem}>
          <BadgeStatus type="neutral" label="In progress" iconLeft={<Icon svg={infoSvg} />} />
          <span className={styles.typeLabel}>Icon left</span>
        </div>
        <div className={styles.iconItem}>
          <BadgeStatus type="neutral" label="In progress" iconRight={<Icon svg={infoSvg} />} />
          <span className={styles.typeLabel}>Icon right</span>
        </div>
        <div className={styles.iconItem}>
          <BadgeStatus type="positive" label="Approved" iconLeft={<Icon svg={checkSvg} />} />
          <span className={styles.typeLabel}>Positive</span>
        </div>
        <div className={styles.iconItem}>
          <BadgeStatus type="danger" label="Overdue" iconLeft={<Icon svg={exclSvg} />} />
          <span className={styles.typeLabel}>Danger</span>
        </div>
        <div className={styles.iconItem}>
          <BadgeStatus type="warning" label="Draft" iconLeft={<Icon svg={alertSvg} />} />
          <span className={styles.typeLabel}>Warning</span>
        </div>
        <div className={styles.iconItem}>
          <BadgeStatus type="pending" label="Pending" iconLeft={<Icon svg={draftSvg} />} />
          <span className={styles.typeLabel}>Pending</span>
        </div>
        <div className={styles.iconItem}>
          <BadgeStatus type="disable" label="Inactive" iconLeft={<Icon svg={exclSvg} />} />
          <span className={styles.typeLabel}>Disable</span>
        </div>
      </div>

      {/* ── Usage rules ───────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Usage rules</h2>
      <table className={styles.rulesTable}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Badge</th>
            <th>Use for</th>
          </tr>
        </thead>
        <tbody>
          {[
            { type: 'neutral'  as BadgeStatusType, examples: ['In progress', 'Info'] },
            { type: 'positive' as BadgeStatusType, examples: ['Active', 'Completed', 'Approved', 'Quorum met'] },
            { type: 'danger'   as BadgeStatusType, examples: ['Overdue', 'Error'] },
            { type: 'warning'  as BadgeStatusType, examples: ['Draft/New', 'Updated', 'Quorum not met'] },
            { type: 'disable'  as BadgeStatusType, examples: ['Deactivated', 'Inactive'] },
            { type: 'pending'  as BadgeStatusType, examples: ['Pending review'] },
          ].map(({ type, examples }) => (
            <tr key={type}>
              <td className={styles.typeCell}>{type.charAt(0).toUpperCase() + type.slice(1)}</td>
              <td><BadgeStatus type={type} label={type.charAt(0).toUpperCase() + type.slice(1)} /></td>
              <td className={styles.examplesCell}>{examples.join(' · ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
