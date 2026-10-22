/* DrawerHeader — Figma nodes 29854-14645, 33303-4248, 33299-3912 */

import { type ReactNode, type ChangeEvent } from 'react'
import { Button }    from '../Button/Button'
import { Tooltip }   from '../Tooltip/Tooltip'
import { TextField } from '../TextField/TextField'
import { actions }   from '../../icons/actions'
import styles from './DrawerHeader.module.css'

const multiplySvg = actions.find(i => i.name === 'multiply')!.svg
const plusSvg     = actions.find(i => i.name === 'plus')!.svg

export interface DrawerHeaderProps {
  title:          string
  onClose:        () => void
  /** When provided, the title becomes a controlled editable field. Omit to seed
   *  an uncontrolled, locally-editable title. Ignored when `readOnly`. */
  onTitleChange?: (value: string) => void
  /** View-only title — renders plain text (not an editable field). */
  readOnly?:      boolean
  type?:          string       // shows the "+ type" icon+text meta when provided
  badge?:         ReactNode    // status badge slot (right of type)
  className?:     string
}

export function DrawerHeader({
  title,
  onClose,
  onTitleChange,
  readOnly = false,
  type,
  badge,
  className,
}: DrawerHeaderProps) {
  const hasMeta = type !== undefined || badge !== undefined

  /* Editable title — a no-border, auto-growing text field (Figma "Input: Text
     field no border"). Controlled when onTitleChange is given, uncontrolled otherwise. */
  const titleProps = onTitleChange
    ? { value: title, onChange: (e: ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value) }
    : { defaultValue: title }

  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')}>
      {/* Top row — title (view-only plain text OR editable no-border field) + close */}
      <div className={styles.topRow}>
        {readOnly ? (
          <div className={styles.titleText}>{title}</div>
        ) : (
          <TextField
            variant="no-border"
            size="xl"
            multiline
            className={styles.titleField}
            aria-label="Drawer title"
            spellCheck={false}
            {...titleProps}
          />
        )}

        <Tooltip label="Close" position="bottom">
          <Button
            variant="tertiary"
            intent="neutral"
            size="l"
            iconOnly={
              <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: multiplySvg }} />
            }
            onClick={onClose}
            aria-label="Close"
          />
        </Tooltip>
      </div>

      {/* Meta row — optional type + badge, below the title */}
      {hasMeta && (
        <div className={styles.meta}>
          {type !== undefined && (
            <span className={styles.type}>
              <span
                className={styles.typeIcon}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: plusSvg }}
              />
              {type}
            </span>
          )}
          {badge}
        </div>
      )}
    </header>
  )
}

export default DrawerHeader
