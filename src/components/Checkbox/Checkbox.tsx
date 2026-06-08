import { type InputHTMLAttributes, type ReactNode, useEffect, useRef } from 'react'
import styles from './Checkbox.module.css'

/* Checkmark path matches Figma checkbox asset (16×16 viewBox, currentColor fill) */
const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.14286 12.5L2.5 8.70154L3.80929 7.34837L6.14286 9.78407L12.1907 3.5L13.5 4.86276L6.14286 12.5Z" fill="currentColor" />
  </svg>
)

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean
  label?: ReactNode
}

export function Checkbox({
  indeterminate = false,
  label,
  disabled,
  className,
  ...rest
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className ?? ''}`.trim()}>
      <input
        ref={inputRef}
        type="checkbox"
        className={styles.input}
        disabled={disabled}
        {...rest}
      />
      <span className={styles.hitArea}>
        <span className={styles.box}>
          <span className={styles.checkIcon} aria-hidden="true">
            <CheckIcon />
          </span>
        </span>
      </span>
      {label !== undefined && (
        <span className={styles.label}>{label}</span>
      )}
    </label>
  )
}

export default Checkbox
