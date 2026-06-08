import { type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './TextField.module.css'
import { HintRow } from '../shared/HintRow'
import { condition } from '../../icons/condition'

const loaderSvg = condition.find(i => i.name === 'loader-round')!.svg

export type TextFieldSize    = 's' | 'm' | 'l'
export type TextFieldVariant = 'outline' | 'no-border'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?:     TextFieldSize
  variant?:  TextFieldVariant
  label?:    ReactNode
  /** Icon or element rendered inside the field on the left */
  prefix?:   ReactNode
  /** Icon or element rendered inside the field on the right */
  suffix?:   ReactNode
  /** Helper text shown below the field (with info icon) */
  helper?:   ReactNode
  /** true = red border only; string = red border + error message below */
  error?:    boolean | string
  loading?:  boolean
}

export function TextField({
  size    = 'm',
  variant = 'outline',
  label,
  prefix,
  suffix,
  helper,
  error   = false,
  loading = false,
  disabled,
  className,
  id,
  ...rest
}: TextFieldProps) {
  const hasError  = Boolean(error)
  const errorMsg  = typeof error === 'string' ? error : undefined
  const hintText  = errorMsg ?? helper

  const sizeClass    = size === 'l' ? styles.sizeL : size === 's' ? styles.sizeS : styles.sizeM
  const variantClass = variant === 'no-border' ? styles.noBorder : styles.outline

  const wrapperCls = [
    styles.wrapper,
    sizeClass,
    variantClass,
    hasError  ? styles.hasError   : '',
    disabled  ? styles.isDisabled : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperCls}>
      {label !== undefined && (
        <label className={styles.label} htmlFor={id}>{label}</label>
      )}

      <div className={styles.inputWrapper}>
        {prefix !== undefined && (
          <span className={styles.icon} aria-hidden="true">{prefix}</span>
        )}

        <input
          id={id}
          className={styles.input}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          {...rest}
        />

        {loading ? (
          <span
            className={`${styles.icon} ${styles.spinner}`}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: loaderSvg }}
          />
        ) : suffix !== undefined ? (
          <span className={styles.icon} aria-hidden="true">{suffix}</span>
        ) : null}
      </div>

      {hintText !== undefined && (
        <HintRow text={hintText} error={hasError} />
      )}
    </div>
  )
}

export default TextField
