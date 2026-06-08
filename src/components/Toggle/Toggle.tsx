import { type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Toggle.module.css'

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
}

export function Toggle({ label, disabled, className, ...rest }: ToggleProps) {
  return (
    <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className ?? ''}`.trim()}>
      <input
        type="checkbox"
        role="switch"
        className={styles.input}
        disabled={disabled}
        {...rest}
      />
      <span className={styles.track} />
      {label !== undefined && (
        <span className={styles.label}>{label}</span>
      )}
    </label>
  )
}

export default Toggle
