import { type TextareaHTMLAttributes, type ReactNode } from 'react'
import styles from './TextArea.module.css'
import { HintRow } from '../shared/HintRow'

export type TextAreaSize = 's' | 'm' | 'l'

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?:    TextAreaSize
  label?:   ReactNode
  helper?:  ReactNode
  /** Optional action link rendered on the right side of the hint row */
  action?:  ReactNode
  /** true = red border only; string = red border + error message below */
  error?:   boolean | string
}

export function TextArea({
  size    = 'm',
  label,
  helper,
  action,
  error   = false,
  disabled,
  className,
  id,
  ...rest
}: TextAreaProps) {
  const hasError  = Boolean(error)
  const errorMsg  = typeof error === 'string' ? error : undefined
  const hintText  = errorMsg ?? helper
  const hasHint   = hintText !== undefined
  const hasAction = action !== undefined

  const sizeClass = size === 'l' ? styles.sizeL : size === 's' ? styles.sizeS : styles.sizeM

  const wrapperCls = [
    styles.wrapper,
    sizeClass,
    hasError  ? styles.hasError   : '',
    disabled  ? styles.isDisabled : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperCls}>
      {label !== undefined && (
        <label className={styles.label} htmlFor={id}>{label}</label>
      )}

      <div className={styles.fieldWrapper}>
        <textarea
          id={id}
          className={styles.textarea}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          {...rest}
        />
      </div>

      {(hasHint || hasAction) && (
        <HintRow
          text={hasHint ? hintText : null}
          error={hasError}
          action={action}
        />
      )}
    </div>
  )
}

export default TextArea
