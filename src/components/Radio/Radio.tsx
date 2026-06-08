import { type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Radio.module.css'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
}

export function Radio({ label, disabled, className, ...rest }: RadioProps) {
  return (
    <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className ?? ''}`.trim()}>
      <input
        type="radio"
        className={styles.input}
        disabled={disabled}
        {...rest}
      />
      <span className={styles.hitArea}>
        <span className={styles.circle} />
      </span>
      {label !== undefined && (
        <span className={styles.label}>{label}</span>
      )}
    </label>
  )
}

export default Radio
