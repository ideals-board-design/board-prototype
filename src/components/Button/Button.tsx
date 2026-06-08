import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'
import { condition } from '../../icons/condition'

const loaderSvg = condition.find(i => i.name === 'loader-round')!.svg

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'link'
export type ButtonSize    = 'l' | 'm' | 's'
export type ButtonIntent  = 'default' | 'danger' | 'info' | 'warning' | 'neutral'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  intent?:    ButtonIntent
  iconLeft?:  ReactNode
  iconRight?: ReactNode
  /** Pass an icon element. Omit children when using iconOnly. */
  iconOnly?:  ReactNode
  loading?:   boolean
  /** Renders as <a> when provided */
  href?:      string
  /** Opens href in a new tab (adds rel="noopener noreferrer") */
  external?:  boolean
}

const sizeCls: Record<ButtonSize, string> = {
  s: styles.sizeS,
  m: styles.sizeM,
  l: styles.sizeL,
}

const intentCls: Record<ButtonIntent, string> = {
  default: '',
  danger:  styles.danger,
  neutral: styles.neutral,
  info:    styles.info,
  warning: styles.warning,
}

export function Button({
  variant  = 'primary',
  size     = 'm',
  intent   = 'default',
  iconLeft,
  iconRight,
  iconOnly,
  loading  = false,
  disabled,
  href,
  external,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const cls = [
    styles.button,
    styles[variant],
    sizeCls[size],
    intentCls[intent],
    iconOnly !== undefined ? styles.iconOnly : '',
    external ? styles.external : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  const spinnerEl = (
    <span className={styles.spinner} aria-hidden="true">
      <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: loaderSvg }} />
    </span>
  )

  const body: ReactNode = iconOnly !== undefined ? (
    loading ? spinnerEl : <span className={styles.icon}>{iconOnly}</span>
  ) : (
    <>
      {loading && spinnerEl}
      {!loading && iconLeft  && <span className={styles.icon}>{iconLeft}</span>}
      {children}
      {!loading && iconRight && <span className={styles.icon}>{iconRight}</span>}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={cls}
        aria-disabled={disabled || loading || undefined}
      >
        {body}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      data-loading={loading ? true : undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {body}
    </button>
  )
}

export default Button
