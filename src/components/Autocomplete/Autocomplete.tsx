/* Autocomplete — TextField-style input that filters a portal droplist.
   "No options" Figma node: 34614-49336 */

import {
  type ReactNode,
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
} from 'react'
import { createPortal } from 'react-dom'
import { HintRow }  from '../shared/HintRow'
import { Tooltip }  from '../Tooltip/Tooltip'
import { actions }  from '../../icons/actions'
import styles from './Autocomplete.module.css'

/* ── Icons ────────────────────────────────────────────────────────────────── */

const clearSvg = actions.find(i => i.name === 'multiply')!.svg

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface AutocompleteOptionAvatar {
  src?:      string
  initials?: string
  /** 'user' = circular, 'group' | 'org' = rounded square. Default: 'user' */
  type?:     'user' | 'group' | 'org'
}

export interface AutocompleteOption {
  value:         string
  label:         string
  avatar?:       AutocompleteOptionAvatar
  /** Inline secondary text shown after the label, e.g. "(Admin)" */
  sublistLabel?: string
}

export type AutocompleteSize    = 's' | 'm' | 'l'
export type AutocompleteVariant = 'outline' | 'no-border'

export interface AutocompleteProps {
  options:      AutocompleteOption[]
  /** Currently selected value */
  value?:       string
  onChange?:    (value: string) => void
  size?:        AutocompleteSize
  variant?:     AutocompleteVariant
  label?:       ReactNode
  placeholder?: string
  /** Icon or element rendered inside the field on the left */
  prefix?:      ReactNode
  /** Helper text shown below the field */
  helper?:      ReactNode
  /** true = red border only; string = red border + error message */
  error?:       boolean | string
  disabled?:    boolean
  clearable?:   boolean
  /** Allow committing a typed value that isn't in the options (free combobox).
      The dropdown still offers suggestions; Enter / blur keeps the typed text. */
  allowCustomValue?: boolean
  className?:   string
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const sizeCls: Record<AutocompleteSize, string> = {
  s: styles.sizeS,
  m: styles.sizeM,
  l: styles.sizeL,
}

/* ── Avatar helper ────────────────────────────────────────────────────────── */

function ItemAvatar({ avatar, size }: { avatar: AutocompleteOptionAvatar; size: AutocompleteSize }) {
  const { src, initials = '?', type = 'user' } = avatar
  const letter   = size === 's' ? initials.slice(0, 1) : initials.slice(0, 2)
  const shapeCls = type === 'user' ? styles.itemAvatarUser : styles.itemAvatarSquare
  const colorCls = type === 'group' ? styles.itemAvatarGroup : type === 'org' ? styles.itemAvatarOrg : ''
  const cls = [styles.itemAvatar, shapeCls, colorCls].filter(Boolean).join(' ')
  return (
    <span className={cls} aria-hidden="true">
      {src
        ? <img className={styles.itemAvatarImg} src={src} alt="" />
        : <span className={styles.itemAvatarInitials}>{letter}</span>
      }
    </span>
  )
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function Autocomplete({
  options,
  value     = '',
  onChange,
  size      = 'm',
  variant   = 'outline',
  label,
  placeholder,
  prefix,
  helper,
  error     = false,
  disabled  = false,
  clearable = false,
  allowCustomValue = false,
  className,
}: AutocompleteProps) {
  const uid = useId()

  /* ── Derive selected label ────────────────────────────────────────────── */

  const selectedLabel = options.find(o => o.value === value)?.label ?? (allowCustomValue ? value : '')

  /* ── State ────────────────────────────────────────────────────────────── */

  /** Text currently shown in the <input> */
  const [inputText, setInputText] = useState(selectedLabel)
  /** Filter query — empty on focus = show all options */
  const [query,     setQuery]     = useState('')
  const [open,      setOpen]      = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [pos,       setPos]       = useState({ top: 0, left: 0, width: 0 })

  /* ── Refs ─────────────────────────────────────────────────────────────── */

  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLInputElement>(null)
  const droplistRef     = useRef<HTMLDivElement>(null)

  /* ── Sync inputText when value changes externally ─────────────────────── */

  useEffect(() => {
    if (!open) setInputText(selectedLabel)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Filtered options ─────────────────────────────────────────────────── */

  const filteredOpts: AutocompleteOption[] = query === ''
    ? options
    : options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))

  /* ── Position helper ──────────────────────────────────────────────────── */

  const calcPos = useCallback(() => {
    if (!inputWrapperRef.current) return
    const r = inputWrapperRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left, width: r.width })
  }, [])

  /* ── Open / close ─────────────────────────────────────────────────────── */

  const openDroplist = useCallback(() => {
    if (disabled) return
    calcPos()
    setOpen(true)
    setActiveIdx(-1)
  }, [disabled, calcPos])

  const closeDroplist = useCallback(() => {
    setOpen(false)
    setActiveIdx(-1)
    setQuery('')
    setInputText(selectedLabel)
  }, [selectedLabel])

  /* ── Interactions ─────────────────────────────────────────────────────── */

  const selectOption = useCallback((optValue: string) => {
    const opt = options.find(o => o.value === optValue)
    if (!opt) return
    onChange?.(optValue)
    setInputText(opt.label)
    setQuery('')
    setOpen(false)
    setActiveIdx(-1)
  }, [options, onChange])

  /** Commit a free-typed value (allowCustomValue mode) */
  const commitCustom = useCallback((text: string) => {
    onChange?.(text)
    setInputText(text)
    setQuery('')
    setOpen(false)
    setActiveIdx(-1)
  }, [onChange])

  const clearValue = (e: React.MouseEvent) => {
    e.preventDefault()   // keep focus on input
    e.stopPropagation()
    onChange?.('')
    setInputText('')
    setQuery('')
    setOpen(false)
    setActiveIdx(-1)
    inputRef.current?.focus()
  }

  /* ── Input event handlers ─────────────────────────────────────────────── */

  const handleFocus = () => {
    setQuery('')          // show all options on focus
    openDroplist()
    inputRef.current?.select()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setInputText(text)
    setQuery(text)
    setActiveIdx(-1)
    if (!open) openDroplist()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      openDroplist()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i =>
        filteredOpts.length === 0 ? -1 : (i + 1) % filteredOpts.length
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i =>
        filteredOpts.length === 0 ? -1 : (i - 1 + filteredOpts.length) % filteredOpts.length
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && filteredOpts[activeIdx]) {
        selectOption(filteredOpts[activeIdx].value)
      } else if (!allowCustomValue && filteredOpts.length === 1) {
        selectOption(filteredOpts[0].value)
      } else if (allowCustomValue) {
        commitCustom(inputText.trim())
      }
    } else if (e.key === 'Escape') {
      closeDroplist()
      inputRef.current?.blur()
    }
  }

  const handleBlur = () => {
    // Items use onMouseDown e.preventDefault() to prevent blur on click.
    // handleBlur only fires on Tab or genuinely clicking outside.
    if (allowCustomValue) {
      const t = inputText.trim()
      if (t !== selectedLabel) { commitCustom(t); return }
    }
    closeDroplist()
  }

  /* ── Outside click ────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        inputWrapperRef.current?.contains(t) ||
        droplistRef.current?.contains(t)
      ) return
      closeDroplist()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, closeDroplist])

  /* ── Reposition on scroll / resize ───────────────────────────────────── */

  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [open, calcPos])

  /* ── CSS classes ──────────────────────────────────────────────────────── */

  const hasError = Boolean(error)
  const hintText = (typeof error === 'string' ? error : undefined) ?? helper
  const hasValue = Boolean(value)

  const isNoBorder  = variant === 'no-border'
  const variantCls  = isNoBorder ? styles.noBorder : styles.outline

  /** Tooltip (and its hover area) only mount when the button is truly visible */
  const showClearTooltip = hasValue && !(isNoBorder && open)

  const wrapperCls = [
    styles.wrapper,
    sizeCls[size],
    variantCls,
    open      ? styles.isOpen      : '',
    disabled  ? styles.isDisabled  : '',
    hasError  ? styles.hasError    : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className={wrapperCls}>

      {/* Label */}
      {label !== undefined && (
        <label className={styles.label} htmlFor={uid}>{label}</label>
      )}

      {/* Input wrapper — the visual "field" box */}
      <div ref={inputWrapperRef} className={styles.inputWrapper}>

        {prefix !== undefined && (
          <span className={styles.icon} aria-hidden="true">{prefix}</span>
        )}

        <input
          ref={inputRef}
          id={uid}
          type="text"
          role="combobox"
          className={styles.input}
          value={inputText}
          placeholder={placeholder}
          disabled={disabled}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? `${uid}-list` : undefined}
          aria-activedescendant={
            open && activeIdx >= 0 ? `${uid}-opt-${activeIdx}` : undefined
          }
          aria-invalid={hasError || undefined}
          autoComplete="off"
          spellCheck={false}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />

        {/* Clear button — always in DOM to reserve layout space.
            Tooltip only mounts when button is truly visible, so its hover
            area never captures events over an invisible button. */}
        {clearable && !disabled && (
          showClearTooltip ? (
            <Tooltip label="Clear" position="top">
              <button
                type="button"
                className={styles.clearBtn}
                onMouseDown={clearValue}
                aria-label="Clear"
                tabIndex={-1}
              >
                <span className={styles.clearIcon} dangerouslySetInnerHTML={{ __html: clearSvg }} />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              className={`${styles.clearBtn} ${styles.clearBtnHidden}`}
              tabIndex={-1}
              aria-hidden="true"
            >
              <span className={styles.clearIcon} dangerouslySetInnerHTML={{ __html: clearSvg }} />
            </button>
          )
        )}

      </div>

      {/* Hint / error row */}
      {hintText !== undefined && (
        <HintRow text={hintText} error={hasError} />
      )}

      {/* Droplist — portal */}
      {open && createPortal(
        <div
          id={`${uid}-list`}
          ref={droplistRef}
          className={`${styles.droplist} ${sizeCls[size]}`}
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          role="listbox"
        >
          {filteredOpts.length === 0 ? (
            <div className={`${styles.item} ${styles.noOptions}`}>
              <span className={styles.itemLabel}>No options</span>
            </div>
          ) : (
            filteredOpts.map((opt, i) => {
              const sel = opt.value === value
              return (
                <div
                  id={`${uid}-opt-${i}`}
                  key={opt.value}
                  className={[
                    styles.item,
                    sel             ? styles.itemSelected  : '',
                    activeIdx === i ? styles.itemActive    : '',
                    opt.avatar      ? styles.itemHasAvatar : '',
                  ].filter(Boolean).join(' ')}
                  role="option"
                  aria-selected={sel}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => selectOption(opt.value)}
                >
                  {opt.avatar && <ItemAvatar avatar={opt.avatar} size={size} />}
                  <span className={styles.itemLabel}>
                    {opt.label}
                    {opt.sublistLabel && (
                      <span className={styles.itemLabelInlineSecondary}>{opt.sublistLabel}</span>
                    )}
                  </span>
                </div>
              )
            })
          )}
        </div>,
        document.body,
      )}

    </div>
  )
}

export default Autocomplete
