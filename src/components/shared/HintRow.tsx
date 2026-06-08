/**
 * HintRow — shared helper-text row used by TextField, TextArea, TextEditor, Dropdown.
 *
 * Layout: [ⓘ icon] [text, flex:1] [optional action]
 *
 * - Normal:  stone-800 text + info icon on the left
 * - Error:   red text, no icon
 * - Action:  any ReactNode appended on the right (e.g. a tertiary Button)
 */

import { type ReactNode } from 'react'
import { condition } from '../../icons/condition'
import styles from './HintRow.module.css'

const infoSvg = condition.find(i => i.name === 'info-circle')!.svg

export interface HintRowProps {
  /** The hint / error message text */
  text:    ReactNode
  /** When true: red text, icon hidden */
  error?:  boolean
  /** Optional action element aligned to the right */
  action?: ReactNode
}

export function HintRow({ text, error = false, action }: HintRowProps) {
  return (
    <div className={styles.hintRow}>
      {!error && (
        <span
          className={styles.icon}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: infoSvg }}
        />
      )}
      <span className={`${styles.text} ${error ? styles.textError : ''}`}>
        {text}
      </span>
      {action !== undefined && (
        <span className={styles.action}>{action}</span>
      )}
    </div>
  )
}

export default HintRow
