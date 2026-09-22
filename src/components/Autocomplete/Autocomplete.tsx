/* Autocomplete — TextField-style input that filters a portal droplist.
   "No options" Figma node: 34614-49336 */

import {
  type ReactNode,
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useId,
} from 'react'
import { createPortal } from 'react-dom'
import { HintRow }  from '../shared/HintRow'
import { Tooltip }  from '../Tooltip/Tooltip'
import { Button }   from '../Button/Button'
import { Avatar }   from '../Avatar/Avatar'
import { Checkbox } from '../Checkbox/Checkbox'
import { actions }  from '../../icons/actions'
import { usePresence } from '../shared/usePresence'
import styles from './Autocomplete.module.css'

/* ── Icons ────────────────────────────────────────────────────────────────── */

const clearSvg = actions.find(i => i.name === 'multiply')!.svg

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface AutocompleteOptionAvatar {
  src?:      string
  initials?: string
  /** 'user' = circular, 'group' | 'org' = rounded square. Default: 'user' */
  type?:     'user' | 'group' | 'org'
  /** Optional background colour override (e.g. a token var) for the square */
  color?:    string
}

export interface AutocompleteOption {
  value:         string
  label:         string
  avatar?:       AutocompleteOptionAvatar
  /** 20×20 icon shown before the label (takes precedence over avatar) */
  icon?:         ReactNode
  /** Inline secondary text shown after the label, e.g. "(Admin)" */
  sublistLabel?: string
}

export type AutocompleteSize    = 's' | 'm' | 'l'
export type AutocompleteVariant = 'outline' | 'no-border'

export interface AutocompleteProps {
  options:      AutocompleteOption[]
  /** Selected value(s). `string` in single mode, `string[]` when `multiple`. */
  value?:       string | string[]
  onChange?:    (value: string | string[]) => void
  /** Multi-select: options show a checkbox, list stays open, value is string[] */
  multiple?:    boolean
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
      The dropdown still offers suggestions; whenever there's typed text, a
      trailing row for that exact text is appended — always last, even if it
      matches an existing option's label, since it commits as its own custom
      value rather than selecting that option. Reachable by click, Enter, or blur. */
  allowCustomValue?: boolean
  /** Render the trailing custom-value row as an "add" action rather than a
      selectable option: no checkbox, no generated avatar, and this label instead
      of the raw typed text — e.g. `v => <>Add "{v}" as presenter</>`. Signals the
      user is creating a new entry, not picking an existing one. Requires
      `allowCustomValue`. Committing still adds the raw typed value. */
  customValueLabel?: (typedValue: string) => ReactNode
  /** Accessible name for the input when no visible `label` is rendered */
  'aria-label'?: string
  className?:   string
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const sizeCls: Record<AutocompleteSize, string> = {
  s: styles.sizeS,
  m: styles.sizeM,
  l: styles.sizeL,
}

/* ── Avatar helper ────────────────────────────────────────────────────────── */

function ItemAvatar({ avatar }: { avatar: AutocompleteOptionAvatar; size: AutocompleteSize }) {
  const { src, initials = '?', type = 'user', color } = avatar
  return (
    <Avatar
      size="s"
      type={type}
      variant={src ? 'picture' : 'letters'}
      src={src}
      initials={initials}
      tint={color}
    />
  )
}

/** First + last-word initials for the custom row's generated avatar, e.g.
    "An" → "A" (single word) — mirrors how a real person's name would render. */
function initialsFromText(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '')).toUpperCase() || '?'
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function Autocomplete({
  options,
  value     = '',
  onChange,
  multiple  = false,
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
  customValueLabel,
  'aria-label': ariaLabel,
  className,
}: AutocompleteProps) {
  const uid = useId()

  /* ── Derive selected value(s) / label ─────────────────────────────────── */

  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : []
  const singleValue    = multiple ? '' : (value as string)
  const selectedLabel  = multiple
    ? ''
    : (options.find(o => o.value === singleValue)?.label ?? (allowCustomValue ? singleValue : ''))

  /* ── State ────────────────────────────────────────────────────────────── */

  /** Text currently shown in the <input> */
  const [inputText, setInputText] = useState(selectedLabel)
  /** Filter query — empty on focus = show all options */
  const [query,     setQuery]     = useState('')
  const [open,      setOpen]      = useState(false)

  // Keeps the panel mounted through its fade-out (motion spec §3).
  const { mounted, state } = usePresence(open, '--dur-instant')
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

  /* Trailing row for the exact typed text — always last, even when it happens
     to match a real option's label, since it commits as its own custom value
     rather than selecting that option (the two are never the same choice). */
  const trimmedQuery = query.trim()
  const showCustomOption = allowCustomValue && trimmedQuery !== ''
  const customIdx = filteredOpts.length
  const optionsHaveAvatars = options.some(o => o.avatar)
  const customChecked = multiple && selectedValues.includes(trimmedQuery)
  /** Custom row shown as an "add" action (no checkbox / avatar / selected state) */
  const customAsAction = Boolean(customValueLabel)

  /* ── Position helper ──────────────────────────────────────────────────── */

  const calcPos = useCallback(() => {
    if (!inputWrapperRef.current) return
    const r = inputWrapperRef.current.getBoundingClientRect()
    // no-border field has a 6px hover-fill below it → +6 so the 4px gap is real
    const off = variant === 'no-border' ? 10 : 4
    setPos({ top: r.bottom + off, left: r.left, width: r.width })
  }, [variant])

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
    setInputText(multiple ? '' : selectedLabel)
  }, [selectedLabel, multiple])

  /* ── Interactions ─────────────────────────────────────────────────────── */

  const selectOption = useCallback((optValue: string) => {
    const opt = options.find(o => o.value === optValue)
    if (!opt) return
    if (multiple) {
      // toggle, keep the list open for more selections
      const next = selectedValues.includes(optValue)
        ? selectedValues.filter(v => v !== optValue)
        : [...selectedValues, optValue]
      onChange?.(next)
      setQuery('')
      setInputText('')
      setActiveIdx(-1)
      inputRef.current?.focus()
      return
    }
    onChange?.(optValue)
    setInputText(opt.label)
    setQuery('')
    setOpen(false)
    setActiveIdx(-1)
  }, [options, onChange, multiple, selectedValues])

  /** Commit a free-typed value (allowCustomValue mode) */
  const commitCustom = useCallback((text: string) => {
    if (multiple) {
      // Same toggle-and-keep-open contract as selectOption's multiple branch —
      // clicking an already-added custom value removes it, like unchecking it.
      if (text !== '') {
        const next = selectedValues.includes(text)
          ? selectedValues.filter(v => v !== text)
          : [...selectedValues, text]
        onChange?.(next)
      }
      setQuery('')
      setInputText('')
      setActiveIdx(-1)
      inputRef.current?.focus()
      return
    }
    onChange?.(text)
    setInputText(text)
    setQuery('')
    setOpen(false)
    setActiveIdx(-1)
  }, [onChange, multiple, selectedValues])

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
    const rowCount = filteredOpts.length + (showCustomOption ? 1 : 0)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => rowCount === 0 ? -1 : (i + 1) % rowCount)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => rowCount === 0 ? -1 : (i - 1 + rowCount) % rowCount)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && filteredOpts[activeIdx]) {
        selectOption(filteredOpts[activeIdx].value)
      } else if (showCustomOption && (activeIdx === customIdx || activeIdx === -1)) {
        commitCustom(trimmedQuery)
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

  /* Re-anchor to the field if it shifts while open (e.g. multi-select adds a row) */
  useLayoutEffect(() => {
    if (open) calcPos()
  }, [open, value, calcPos])

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
  const hasValue = multiple ? selectedValues.length > 0 : Boolean(singleValue)

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
      <div
        ref={inputWrapperRef}
        className={[
          styles.inputWrapper,
          clearable && !disabled ? styles.hasClearSlot : '',
        ].filter(Boolean).join(' ')}
      >

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
          aria-label={ariaLabel}
          autoComplete="off"
          spellCheck={false}
          onChange={handleChange}
          onFocus={handleFocus}
          onClick={openDroplist}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />

        {/* Clear button — always in DOM to reserve layout space.
            Tooltip only mounts when button is truly visible, so its hover
            area never captures events over an invisible button. */}
        {clearable && !disabled && (
          <div className={styles.trailing}>
          {showClearTooltip ? (
            <Tooltip label="Clear" position="top">
              <Button
                variant="tertiary"
                intent="neutral"
                size={size}
                className={styles.clearReveal}
                iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: clearSvg }} />}
                onMouseDown={clearValue}
                aria-label="Clear"
                tabIndex={-1}
              />
            </Tooltip>
          ) : (
            <Button
              variant="tertiary"
              intent="neutral"
              size={size}
              iconOnly={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: clearSvg }} />}
              className={styles.clearBtnHidden}
              tabIndex={-1}
              aria-hidden="true"
            />
          )}
          </div>
        )}

      </div>

      {/* Hint / error row */}
      {hintText !== undefined && (
        <HintRow text={hintText} error={hasError} />
      )}

      {/* Droplist — portal */}
      {mounted && createPortal(
        <div
          id={`${uid}-list`}
          ref={droplistRef}
          className={`${styles.droplist} ${sizeCls[size]}`}
          data-state={state}
          aria-hidden={state === 'closed'}
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          role="listbox"
        >
          {filteredOpts.length === 0 && !showCustomOption ? (
            <div className={`${styles.item} ${styles.noOptions}`}>
              <span className={styles.itemLabel}>No options</span>
            </div>
          ) : (
            <>
              {filteredOpts.map((opt, i) => {
                const sel = multiple ? selectedValues.includes(opt.value) : opt.value === singleValue
                return (
                  <div
                    id={`${uid}-opt-${i}`}
                    key={opt.value}
                    className={[
                      styles.item,
                      sel              ? styles.itemSelected : '',
                      activeIdx === i  ? styles.itemActive    : '',
                      (opt.avatar || opt.icon) ? styles.itemHasAvatar : '',
                    ].filter(Boolean).join(' ')}
                    role="option"
                    aria-selected={sel}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => selectOption(opt.value)}
                  >
                    {multiple && (
                      <span className={styles.itemCheck} aria-hidden="true">
                        <Checkbox checked={sel} readOnly tabIndex={-1} />
                      </span>
                    )}
                    {opt.icon
                      ? <span className={styles.itemIcon} aria-hidden="true">{opt.icon}</span>
                      : opt.avatar && <ItemAvatar avatar={opt.avatar} size={size} />}
                    <span className={styles.itemLabel}>
                      {opt.label}
                      {opt.sublistLabel && (
                        <span className={styles.itemLabelInlineSecondary}>{opt.sublistLabel}</span>
                      )}
                    </span>
                  </div>
                )
              })}
              {showCustomOption && (
                <div
                  id={`${uid}-opt-${customIdx}`}
                  className={[
                    styles.item,
                    customAsAction ? styles.itemAction : '',
                    !customAsAction && customChecked ? styles.itemSelected : '',
                    activeIdx === customIdx ? styles.itemActive : '',
                    !customAsAction && optionsHaveAvatars ? styles.itemHasAvatar : '',
                  ].filter(Boolean).join(' ')}
                  role="option"
                  aria-selected={customAsAction ? undefined : customChecked}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => commitCustom(trimmedQuery)}
                >
                  {multiple && !customAsAction && (
                    <span className={styles.itemCheck} aria-hidden="true">
                      <Checkbox checked={customChecked} readOnly tabIndex={-1} />
                    </span>
                  )}
                  {!customAsAction && optionsHaveAvatars && (
                    <ItemAvatar avatar={{ initials: initialsFromText(trimmedQuery) }} size={size} />
                  )}
                  <span className={styles.itemLabel}>
                    {customAsAction ? customValueLabel!(trimmedQuery) : trimmedQuery}
                  </span>
                </div>
              )}
            </>
          )}
        </div>,
        document.body,
      )}

    </div>
  )
}

export default Autocomplete
