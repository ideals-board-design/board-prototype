/* MeetingDate — Figma node 4040-2929 ("Meeting date")
   72×72 calendar chip: green-50 month header + white day body. */

import styles from './MeetingDate.module.css'

export interface MeetingDateProps {
  /** Month abbreviation, e.g. "DEC" (rendered uppercase) */
  month:      string
  /** Day of month */
  day:        number | string
  className?: string
}

export function MeetingDate({ month, day, className }: MeetingDateProps) {
  return (
    <div className={[styles.badge, className].filter(Boolean).join(' ')}>
      <span className={styles.month}>{month}</span>
      <span className={styles.day}>{day}</span>
    </div>
  )
}

export default MeetingDate
