/* Dropdown — Figma nodes 5761-13893, 34585-47936, 34585-47951, 34585-47959
   Tree structure — Figma nodes 26240-15772, 34585-48084 */

import {
  type ReactNode,
  type CSSProperties,
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useId,
} from 'react'
import { createPortal } from 'react-dom'
import { Checkbox } from '../Checkbox/Checkbox'
import { HintRow }  from '../shared/HintRow'
import { Search }   from '../Search/Search'
import { Tooltip }  from '../Tooltip/Tooltip'
import { arrows }   from '../../icons/arrows'
import { actions }  from '../../icons/actions'
import styles from './Dropdown.module.css'

/* ── Icons ────────────────────────────────────────────────────────────────── */

const chevronDownSvg  = arrows.find(i => i.name === 'angle-down-fill')!.svg
const chevronUpSvg    = arrows.find(i => i.name === 'angle-up-fill')!.svg
const clearSvg        = actions.find(i => i.name === 'multiply')!.svg
const expandArrowSvg  = arrows.find(i => i.name === 'angle-right-fill')!.svg

/** Inline search appears in the droplist when selectable options exceed this count */
const SEARCH_THRESHOLD = 5

/* ── Types ────────────────────────────────────────────────────────────────── */

export type DropdownSize = 's' | 'm' | 'l'
export type DropdownMode = 'single' | 'multi' | 'tree'

/** Avatar shown on the left of a user/group droplist item */
export interface DropdownItemAvatar {
  /** Photo URL — shown as a circular/square image */
  src?:      string
  /** Up to 2 initials (S-size items show 1 letter) */
  initials?: string
  /** 'user' = circular, 'group' | 'org' = rounded square. Default: 'user' */
  type?:     'user' | 'group' | 'org'
  /** Custom background color (CSS value or var()), overrides type-based color */
  color?:    string
}

/** Regular selectable option */
export interface DropdownSelectableOption {
  value:          string
  label:          string
  /** Icon rendered on the left inside the droplist item (20×20) */
  icon?:          ReactNode
  /** Avatar rendered on the left — user/group/org style (24×24, mutually exclusive with icon) */
  avatar?:        DropdownItemAvatar
  /** Secondary label rendered on the right inside the droplist item */
  secondaryText?: string
  /** Inline secondary text shown after the label — used for sublist parent items (e.g. "(English)") */
  sublistLabel?:  string
  /** Sub-options shown in a hover-triggered panel to the right */
  children?:      DropdownSelectableOption[]
  /** Rendered in red at the bottom of the list (e.g. "Delete") */
  delete?:        boolean
  /** Must be absent / undefined on selectable options */
  type?:          never
}

/** Section group header — not selectable, renders a small label */
export interface DropdownGroupOption {
  type:  'group'
  label: string
}

/** Horizontal separator line — not selectable */
export interface DropdownDividerOption {
  type: 'divider'
}

export type DropdownOption =
  | DropdownSelectableOption
  | DropdownGroupOption
  | DropdownDividerOption

/** Extended option for tree mode — carries indentation and expand metadata */
export interface DropdownTreeOption extends DropdownSelectableOption {
  /** Indentation depth: 0 = root, 1 = child, 2 = grandchild … */
  level?:      number
  /** When true — shows the expand/collapse chevron */
  expandable?: boolean
  /** Initial expanded state (only used when expandable=true) */
  isExpanded?: boolean
  disabled?:   boolean
}

export interface DropdownProps {
  options:        DropdownOption[]
  /** 'single' (default) | 'multi' — checkboxes, list stays open | 'tree' — indented tree with expand/collapse */
  mode?:          DropdownMode
  size?:          DropdownSize
  value?:         string | string[]
  onChange?:      (value: string | string[]) => void
  label?:         ReactNode
  placeholder?:   string
  /** Icon rendered on the left inside the trigger */
  iconLeft?:      ReactNode
  /** Secondary label rendered on the right (visible only when no value selected) */
  secondaryText?: string
  /** Show an × clear button when a value is selected */
  clearable?:     boolean
  /** Helper text shown below the trigger */
  hint?:          ReactNode
  /** Clickable element appended to the hint row (e.g. a Button) */
  hintAction?:    ReactNode
  disabled?:      boolean
  /** true = red border only; string = red border + error message */
  error?:         boolean | string
  /** 'outline' (default) — bordered trigger | 'no-border' — inline minimal trigger, content-width */
  variant?:       'outline' | 'no-border'
  className?:     string
}

/* ── Internal helpers ─────────────────────────────────────────────────────── */

/** Narrows to a regular selectable option (excludes group headers and dividers) */
function isSelectable(o: DropdownOption): o is DropdownSelectableOption {
  return o.type !== 'group' && o.type !== 'divider'
}

const sizeCls: Record<DropdownSize, string> = {
  s: styles.sizeS,
  m: styles.sizeM,
  l: styles.sizeL,
}

/** Base left padding (px) per size — matches .sizeX .item padding-left in CSS */
const BASE_PAD_LEFT: Record<DropdownSize, number> = { s: 8, m: 12, l: 12 }

/** Indent per tree level = chevron (20px) + gap (8px) */
const TREE_INDENT = 28

/** Returns all descendant values of a tree node (uses the full flat options array) */
function getDescendantValues(opts: DropdownTreeOption[], nodeValue: string): string[] {
  const idx = opts.findIndex(o => o.value === nodeValue)
  if (idx === -1) return []
  const nodeLevel = opts[idx].level ?? 0
  const result: string[] = []
  for (let i = idx + 1; i < opts.length; i++) {
    if ((opts[i].level ?? 0) <= nodeLevel) break
    result.push(opts[i].value)
  }
  return result
}

/* ── Avatar helper ────────────────────────────────────────────────────────── */

function ItemAvatar({ avatar, small }: { avatar: DropdownItemAvatar; small?: boolean }) {
  const { src, initials = '?', type = 'user', color } = avatar
  const letter    = initials.slice(0, 1)
  const shapeCls  = type === 'user' ? styles.itemAvatarUser : styles.itemAvatarSquare
  const colorCls  = !color ? (type === 'group' ? styles.itemAvatarGroup : type === 'org' ? styles.itemAvatarOrg : '') : ''
  const cls       = [styles.itemAvatar, shapeCls, colorCls, small ? styles.itemAvatarSmall : ''].filter(Boolean).join(' ')
  const inlineStyle = color ? { backgroundColor: color } : undefined
  return (
    <span className={cls} style={inlineStyle} aria-hidden="true">
      {src
        ? <img className={styles.itemAvatarImg} src={src} alt="" />
        : <span className={styles.itemAvatarInitials}>{letter}</span>
      }
    </span>
  )
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function Dropdown({
  options,
  mode        = 'single',
  size        = 'm',
  value,
  onChange,
  label,
  placeholder = 'Select value',
  iconLeft,
  secondaryText,
  clearable   = false,
  hint,
  hintAction,
  disabled    = false,
  error       = false,
  variant     = 'outline',
  className,
}: DropdownProps) {

  const isNoBorder = variant === 'no-border'

  const [open, setOpen]                     = useState(false)
  const [pos,  setPos]                      = useState({ top: 0, left: 0, width: 0 })
  const [openSublistFor, setOpenSublistFor] = useState<string | null>(null)
  const [sublistPos, setSublistPos]         = useState({ top: 0, left: 0 })
  const [droplistQuery, setDroplistQuery]   = useState('')
  const triggerRef        = useRef<HTMLDivElement>(null)
  const droplistRef       = useRef<HTMLDivElement>(null)
  const sublistRef        = useRef<HTMLDivElement>(null)
  const droplistSearchRef = useRef<HTMLDivElement>(null)
  const sublistCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const uid               = useId()

  /* Whether the droplist should include an inline search field */
  const showDroplistSearch = options.filter(isSelectable).length > SEARCH_THRESHOLD

  /* ── Tree expand state ─────────────────────────────────────────────────── */

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    if (mode !== 'tree') return new Set()
    const initial = new Set<string>()
    options.forEach(o => {
      if (isSelectable(o) && (o as DropdownTreeOption).isExpanded) initial.add(o.value)
    })
    return initial
  })

  const toggleExpand = useCallback((value: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  }, [])

  /** Flat tree filtered by expand state (collapsed nodes hide their children) */
  const visibleTreeOpts = useMemo((): DropdownTreeOption[] => {
    if (mode !== 'tree') return []
    const result: DropdownTreeOption[] = []
    let hideBelow: number | null = null

    for (const opt of options as DropdownTreeOption[]) {
      const level = opt.level ?? 0

      if (hideBelow !== null) {
        if (level > hideBelow) continue // hidden child
        else hideBelow = null            // back to same/parent level
      }

      result.push(opt)

      if (opt.expandable && !expandedKeys.has(opt.value)) {
        hideBelow = level // start hiding children of this collapsed node
      }
    }

    return result
  }, [mode, options, expandedKeys])

  /* ── Derive selection ─────────────────────────────────────────────────── */

  const selectedValues: string[] = Array.isArray(value)
    ? value
    : value ? [value] : []

  const selectedSet  = useMemo(() => new Set(selectedValues), [selectedValues])
  const hasValue     = selectedValues.length > 0
  const isSelected   = (v: string) => selectedSet.has(v)

  /** Recursively search flat + nested options for a matching value label */
  const findLabel = (value: string, opts: DropdownSelectableOption[]): string | undefined => {
    for (const o of opts) {
      if (o.value === value) return o.label
      if (o.children) {
        const found = findLabel(value, o.children)
        if (found) return found
      }
    }
    return undefined
  }

  const triggerText = (() => {
    if (!hasValue) return undefined
    const selOpts = options.filter(isSelectable)
    if (mode === 'single') {
      return findLabel(selectedValues[0], selOpts)
    }
    // multi & tree — show first label or count badge
    if (selectedValues.length === 1) {
      return findLabel(selectedValues[0], selOpts)
    }
    return `${selectedValues.length} selected`
  })()

  // Secondary text from the selected option (single mode only)
  const triggerSecondaryText = (hasValue && mode === 'single')
    ? options.filter(isSelectable).find(o => o.value === selectedValues[0])?.secondaryText
    : undefined

  // Avatar from the selected option (single mode only)
  const triggerAvatar = (hasValue && mode === 'single')
    ? options.filter(isSelectable).find(o => o.value === selectedValues[0])?.avatar
    : undefined

  const hasError = Boolean(error)
  const hintText = (typeof error === 'string' ? error : undefined) ?? hint

  /* ── Open / close ─────────────────────────────────────────────────────── */

  const openDroplist = useCallback(() => {
    if (!triggerRef.current || disabled) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    setOpen(true)
  }, [disabled])

  const closeDroplist = useCallback(() => {
    setOpen(false)
    setOpenSublistFor(null)
    if (sublistCloseTimer.current) clearTimeout(sublistCloseTimer.current)
  }, [])

  /* ── Sublist open/close ────────────────────────────────────────────────── */

  const openSublist = useCallback((value: string, itemEl: HTMLElement) => {
    if (sublistCloseTimer.current) clearTimeout(sublistCloseTimer.current)
    const r = itemEl.getBoundingClientRect()
    setSublistPos({ top: r.top, left: r.right + 4 })
    setOpenSublistFor(value)
  }, [])

  const scheduleCloseSublist = useCallback(() => {
    sublistCloseTimer.current = setTimeout(() => setOpenSublistFor(null), 150)
  }, [])

  const cancelCloseSublist = useCallback(() => {
    if (sublistCloseTimer.current) clearTimeout(sublistCloseTimer.current)
  }, [])

  const toggle = () => (open ? closeDroplist() : openDroplist())

  /* Cleanup sublist timer on unmount */
  useEffect(() => {
    return () => { if (sublistCloseTimer.current) clearTimeout(sublistCloseTimer.current) }
  }, [])

  /* Close on outside click */
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        triggerRef.current?.contains(t) ||
        droplistRef.current?.contains(t) ||
        sublistRef.current?.contains(t)
      ) return
      closeDroplist()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, closeDroplist])

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDroplist() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, closeDroplist])

  /* Auto-focus droplist search on open; reset query on close */
  useEffect(() => {
    if (!open) { setDroplistQuery(''); return }
    if (showDroplistSearch) {
      const id = requestAnimationFrame(() =>
        (droplistSearchRef.current?.querySelector('input') as HTMLInputElement | null)?.focus()
      )
      return () => cancelAnimationFrame(id)
    }
  }, [open, showDroplistSearch])

  /* Reposition on scroll / resize while open */
  useEffect(() => {
    if (!open) return
    const update = () => {
      if (!triggerRef.current) return
      const r = triggerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  /* ── Interactions ─────────────────────────────────────────────────────── */

  const selectOption = (optionValue: string) => {
    if (mode === 'single') {
      onChange?.(optionValue)
      closeDroplist()
    } else if (mode === 'multi') {
      const next = selectedSet.has(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue]
      onChange?.(next)
    } else {
      // tree — cascade: clicking a parent toggles its descendants;
      //                  clicking a leaf toggles itself
      const treeOpts   = options as DropdownTreeOption[]
      const descValues = getDescendantValues(treeOpts, optionValue)
      const hasDesc    = descValues.length > 0
      if (hasDesc) {
        // Parent: all-desc-selected = deselect all desc; otherwise select all desc
        // (parent value itself is never stored in selectedValues)
        const allDescSelected = descValues.every(v => selectedSet.has(v))
        const next = allDescSelected
          ? selectedValues.filter(v => !descValues.includes(v))
          : [...new Set([...selectedValues, ...descValues])]
        onChange?.(next)
      } else {
        // Leaf: simple toggle
        const next = selectedSet.has(optionValue)
          ? selectedValues.filter(v => v !== optionValue)
          : [...selectedValues, optionValue]
        onChange?.(next)
      }
    }
  }

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(mode === 'single' ? '' : [])
  }

  /* ── CSS classes ──────────────────────────────────────────────────────── */

  /** Tooltip (and its hover area) only mount when the button is truly visible */
  const showClearTooltip = hasValue

  const wrapperCls = [
    styles.wrapper,
    sizeCls[size],
    open        ? styles.isOpen      : '',
    disabled    ? styles.isDisabled  : '',
    hasError    ? styles.hasError    : '',
    isNoBorder  ? styles.noBorder    : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  const triggerCls = [
    styles.trigger,
    !hasValue ? styles.isPlaceholder : '',
  ].filter(Boolean).join(' ')

  /* ── Separate delete options (single / multi modes) ───────────────────── */

  // Group headers + dividers always stay in regular flow; exclude only delete items
  const regularOpts = options.filter(o => !isSelectable(o) || !o.delete)
  const deleteOpts  = options.filter(isSelectable).filter(o => o.delete)

  /* ── Droplist search filtering ─────────────────────────────────────────── */

  const filteredRegularOpts: DropdownOption[] = useMemo(() => {
    if (!showDroplistSearch || !droplistQuery.trim()) return regularOpts
    const q = droplistQuery.toLowerCase()
    // When a query is active: skip group headers/dividers, show only matching selectables
    return regularOpts.filter(o => isSelectable(o) && o.label.toLowerCase().includes(q))
  }, [regularOpts, droplistQuery, showDroplistSearch])

  const filteredDeleteOpts = useMemo(() => {
    if (!showDroplistSearch || !droplistQuery.trim()) return deleteOpts
    const q = droplistQuery.toLowerCase()
    return deleteOpts.filter(o => o.label.toLowerCase().includes(q))
  }, [deleteOpts, droplistQuery, showDroplistSearch])

  const filteredTreeOpts = useMemo(() => {
    if (!showDroplistSearch || !droplistQuery.trim()) return visibleTreeOpts
    const q = droplistQuery.toLowerCase()
    return visibleTreeOpts.filter(o => o.label.toLowerCase().includes(q))
  }, [visibleTreeOpts, droplistQuery, showDroplistSearch])

  const noOptionsVisible =
    showDroplistSearch &&
    droplistQuery.trim().length > 0 &&
    (mode === 'tree'
      ? filteredTreeOpts.length === 0
      : filteredRegularOpts.length === 0 && filteredDeleteOpts.length === 0)

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className={wrapperCls}>

      {/* Label */}
      {label !== undefined && (
        <label className={styles.label} htmlFor={uid}>{label}</label>
      )}

      {/* Trigger */}
      <div
        ref={triggerRef}
        id={uid}
        className={triggerCls}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={toggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
          if (e.key === 'Escape') closeDroplist()
        }}
      >
        {/* Icon left */}
        {iconLeft && (
          <span className={styles.iconLeft} aria-hidden="true">{iconLeft}</span>
        )}

        {/* Avatar for selected option (single mode) */}
        {triggerAvatar && (
          <ItemAvatar avatar={triggerAvatar} small />
        )}

        {/* Value / placeholder text */}
        <span className={styles.triggerText}>
          {hasValue ? triggerText : placeholder}
        </span>

        {/* Secondary text — selected option's (when value) or prop (when no value) */}
        {(triggerSecondaryText || (!hasValue && secondaryText)) && (
          <span className={styles.secondaryText} aria-hidden="true">
            {triggerSecondaryText ?? secondaryText}
          </span>
        )}

        {/* Clear button — outline: always in DOM to reserve space.
            no-border: only rendered when value is selected (× replaces chevron on hover). */}
        {clearable && !disabled && (
          isNoBorder ? (
            hasValue ? (
              <Tooltip label="Clear" position="top">
                <button
                  type="button"
                  className={`${styles.clearBtn} ${styles.clearBtnNoBorder}`}
                  onClick={clearValue}
                  aria-label="Clear selection"
                  tabIndex={-1}
                >
                  <span className={styles.clearIcon} dangerouslySetInnerHTML={{ __html: clearSvg }} />
                </button>
              </Tooltip>
            ) : null
          ) : (
            showClearTooltip ? (
              <Tooltip label="Clear" position="top">
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={clearValue}
                  aria-label="Clear selection"
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
          )
        )}

        {/* Chevron — in no-border hidden when value is selected (× takes its place) */}
        <span
          className={[
            styles.chevron,
            isNoBorder ? styles.chevronNoBorder : '',
            isNoBorder && hasValue && clearable ? styles.chevronHidden : '',
          ].filter(Boolean).join(' ')}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: open ? chevronUpSvg : chevronDownSvg }}
        />
      </div>

      {/* Hint / error row */}
      {hintText !== undefined && (
        <HintRow
          text={hintText}
          error={hasError}
          action={!hasError ? hintAction : undefined}
        />
      )}

      {/* Sublist portal — hover-triggered panel to the right of a parent item */}
      {open && openSublistFor && (() => {
        const parentOpt = options.filter(isSelectable).find(o => o.value === openSublistFor)
        if (!parentOpt?.children?.length) return null
        return createPortal(
          <div
            ref={sublistRef}
            className={`${styles.droplist} ${styles.sublist} ${sizeCls[size]}`}
            style={{ top: sublistPos.top, left: sublistPos.left }}
            role="listbox"
            onMouseEnter={cancelCloseSublist}
            onMouseLeave={scheduleCloseSublist}
          >
            {parentOpt.children.map(child => {
              const sel = isSelected(child.value)
              return (
                <div
                  key={child.value}
                  className={`${styles.item} ${sel ? styles.itemSelected : ''}`}
                  role="option"
                  aria-selected={sel}
                  onClick={() => selectOption(child.value)}
                >
                  {child.icon && (
                    <span className={styles.itemIcon} aria-hidden="true">{child.icon}</span>
                  )}
                  <span className={styles.itemLabel}>{child.label}</span>
                </div>
              )
            })}
          </div>,
          document.body,
        )
      })()}

      {/* Droplist — rendered in document.body via portal */}
      {open && createPortal(
        <div
          ref={droplistRef}
          className={[styles.droplist, sizeCls[size], isNoBorder ? styles.droplistNoBorder : ''].filter(Boolean).join(' ')}
          style={{ top: pos.top, left: pos.left, ...(isNoBorder ? {} : { width: pos.width }) }}
          role="listbox"
          aria-multiselectable={mode !== 'single' || undefined}
        >
          {/* ── Inline search — rendered when selectable options > SEARCH_THRESHOLD ── */}
          {showDroplistSearch && (
            <div ref={droplistSearchRef} className={styles.droplistSearch}>
              <Search
                value={droplistQuery}
                onChange={setDroplistQuery}
                onClear={() => setDroplistQuery('')}
                placeholder="Search"
                size={size}
              />
            </div>
          )}

          {/* ── No options fallback ────────────────────────────────────────── */}
          {noOptionsVisible && (
            <div className={styles.noOptions}>No options</div>
          )}

          {/* ── Tree mode ────────────────────────────────────────────────── */}
          {mode === 'tree' && filteredTreeOpts.map(opt => {
            const level      = opt.level ?? 0
            const isExpanded = expandedKeys.has(opt.value)
            const indentLeft = BASE_PAD_LEFT[size] + level * TREE_INDENT

            /* ── Checkbox state ─────────────────────────────────────────── */
            const treeOpts        = options as DropdownTreeOption[]
            const descValues      = getDescendantValues(treeOpts, opt.value)
            const hasDescendants  = descValues.length > 0
            const selectedDescCnt = descValues.filter(v => selectedSet.has(v)).length

            // Checked: all descendants selected (parent) or self selected (leaf)
            const itemChecked = hasDescendants
              ? selectedDescCnt === descValues.length
              : selectedSet.has(opt.value)

            // Indeterminate: some (not all) descendants selected
            const itemIndeterminate = hasDescendants
              && selectedDescCnt > 0
              && selectedDescCnt < descValues.length

            const itemCls = [
              styles.item,
              styles.itemTree,
              (itemChecked || itemIndeterminate) ? styles.itemSelected : '',
              opt.disabled      ? styles.itemDisabled : '',
            ].filter(Boolean).join(' ')

            return (
              <div
                key={opt.value}
                className={itemCls}
                role="option"
                aria-selected={itemChecked}
                aria-disabled={opt.disabled || undefined}
                style={{ '--tree-pad-left': `${indentLeft}px` } as CSSProperties}
                onClick={() => !opt.disabled && selectOption(opt.value)}
              >
                {/* Expand / collapse chevron — or 20px placeholder for leaves */}
                {opt.expandable ? (
                  <button
                    type="button"
                    className={`${styles.treeChevron} ${isExpanded ? styles.treeChevronOpen : ''}`}
                    onClick={e => { e.stopPropagation(); toggleExpand(opt.value) }}
                    tabIndex={-1}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <span dangerouslySetInnerHTML={{ __html: expandArrowSvg }} />
                  </button>
                ) : (
                  <span className={styles.treeChevronPlaceholder} aria-hidden="true" />
                )}

                {/* Checkbox — 16×16 inside 20×20 DS click-area wrapper */}
                <span className={styles.cbWrap}>
                  <Checkbox
                    checked={itemChecked}
                    indeterminate={itemIndeterminate}
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                    className={styles.cbDisplay}
                  />
                </span>

                {/* Label */}
                <span className={styles.itemLabel}>{opt.label}</span>
              </div>
            )
          })}

          {/* ── Single / multi mode ───────────────────────────────────────── */}
          {mode !== 'tree' && filteredRegularOpts.map((opt, i) => {
            // ── Group section header ──────────────────────────────────────
            if (opt.type === 'group') {
              return (
                <div key={`group-${i}`} className={styles.groupLabel} role="presentation">
                  {opt.label}
                </div>
              )
            }
            // ── Horizontal divider ────────────────────────────────────────
            if (opt.type === 'divider') {
              return <div key={`divider-${i}`} className={styles.divider} role="separator" />
            }
            // ── Regular selectable option (+ sublist parent) ──────────────
            const hasChildren = Boolean(opt.children?.length)
            const selected    = !hasChildren && isSelected(opt.value)
            return (
              <div
                key={opt.value}
                className={[styles.item, selected ? styles.itemSelected : '', opt.avatar ? styles.itemHasAvatar : ''].filter(Boolean).join(' ')}
                role="option"
                aria-selected={selected}
                aria-haspopup={hasChildren ? 'listbox' : undefined}
                onMouseEnter={hasChildren ? e => openSublist(opt.value, e.currentTarget) : undefined}
                onMouseLeave={hasChildren ? scheduleCloseSublist : undefined}
                onClick={hasChildren ? undefined : () => selectOption(opt.value)}
              >
                {mode === 'multi' && !hasChildren && (
                  <span className={styles.cbWrap}>
                    <Checkbox
                      checked={selected}
                      readOnly
                      tabIndex={-1}
                      aria-hidden="true"
                      className={styles.cbDisplay}
                    />
                  </span>
                )}
                {opt.icon && (
                  <span className={styles.itemIcon} aria-hidden="true">{opt.icon}</span>
                )}
                {opt.avatar && <ItemAvatar avatar={opt.avatar} />}
                <span className={styles.itemLabel}>
                  {opt.label}
                  {opt.sublistLabel && (
                    <span className={styles.itemLabelInlineSecondary}>{opt.sublistLabel}</span>
                  )}
                </span>
                {!hasChildren && opt.secondaryText && (
                  <span className={styles.itemSecondary}>{opt.secondaryText}</span>
                )}
                {hasChildren && (
                  <span
                    className={styles.sublistChevron}
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: expandArrowSvg }}
                  />
                )}
              </div>
            )
          })}

          {/* Divider before delete options */}
          {mode !== 'tree' && filteredDeleteOpts.length > 0 && filteredRegularOpts.length > 0 && (
            <div className={styles.divider} role="separator" />
          )}

          {mode !== 'tree' && filteredDeleteOpts.map(opt => (
            <div
              key={opt.value}
              className={`${styles.item} ${styles.itemDelete}`}
              role="option"
              aria-selected={false}
              onClick={() => selectOption(opt.value)}
            >
              {opt.icon && (
                <span className={styles.itemIcon} aria-hidden="true">{opt.icon}</span>
              )}
              {opt.avatar && <ItemAvatar avatar={opt.avatar} />}
              <span className={styles.itemLabel}>{opt.label}</span>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}

export default Dropdown
