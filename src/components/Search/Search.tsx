/* Search — plain text search with optional filter button.
   Figma node: 5761-10568 (Input: Search)
   Sizes: S=32px  M=40px  L=48px  (padding-driven, no explicit height)
   States: default · hover · focused · disabled · loading */

import {
  type ReactNode,
  useRef,
  useState,
  useEffect,
  useCallback,
  useId,
} from 'react'
import { createPortal } from 'react-dom'
import { actions } from '../../icons/actions'
import { arrows } from '../../icons/arrows'
import { Tooltip } from '../Tooltip/Tooltip'
import styles from './Search.module.css'

/* ── Icons ──────────────────────────────────────────────────────────────── */

const searchSvg    = actions.find(i => i.name === 'search')!.svg
const clearSvg     = actions.find(i => i.name === 'multiply')!.svg
const filterSvg    = actions.find(i => i.name === 'filter-search')!.svg
const angleUpSvg   = arrows.find(i => i.name === 'angle-up-fill')!.svg
const angleDownSvg = arrows.find(i => i.name === 'angle-down-fill')!.svg

/* ── Types ──────────────────────────────────────────────────────────────── */

export type SearchSize = 's' | 'm' | 'l'

export interface SearchProps {
  value?:            string
  onChange?:         (value: string) => void
  onClear?:          () => void
  placeholder?:      string
  size?:             SearchSize
  disabled?:         boolean
  /** Shows "Loading..." indicator below the field */
  loading?:          boolean
  /** Shows filter-search icon button on the right */
  filter?:           boolean
  /** Shows green indicator dot on the filter button */
  filterActive?:     boolean
  onFilterClick?:    () => void
  /** Panel content shown as a portal below the field */
  filterPanel?:      ReactNode
  /** Controls visibility of the filter panel */
  filterPanelOpen?:  boolean
  /** Counter navigation — shows "current/total" + Prev/Next buttons.
   *  Mutually exclusive with the filter button. */
  counter?:          { current: number; total: number }
  onPrev?:           () => void
  onNext?:           () => void
  label?:            ReactNode
  helper?:           ReactNode
  className?:        string
}

/* ── Size map ────────────────────────────────────────────────────────────── */

const sizeCls: Record<SearchSize, string> = {
  s: styles.sizeS,
  m: styles.sizeM,
  l: styles.sizeL,
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function Search({
  value            = '',
  onChange,
  onClear,
  placeholder      = 'Search',
  size             = 'm',
  disabled         = false,
  loading          = false,
  filter           = false,
  filterActive     = false,
  onFilterClick,
  filterPanel,
  filterPanelOpen  = false,
  counter,
  onPrev,
  onNext,
  label,
  helper,
  className,
}: SearchProps) {
  const uid = useId()
  const [inputValue, setInputValue] = useState(value)
  const [focused,    setFocused]    = useState(false)
  const [pos,        setPos]        = useState({ top: 0, left: 0, width: 0 })

  const fieldRef      = useRef<HTMLDivElement>(null)
  const inputRef      = useRef<HTMLInputElement>(null)
  const panelRef      = useRef<HTMLDivElement>(null)

  /* Sync internal state when value prop changes externally */
  useEffect(() => { setInputValue(value) }, [value])

  const hasValue = inputValue.length > 0

  /* ── Position helper (shared by loading droplist & filter panel) ─────── */

  const calcPos = useCallback(() => {
    if (!fieldRef.current) return
    const r = fieldRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left, width: r.width })
  }, [])

  useEffect(() => {
    if (!loading) return
    calcPos()
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [loading, calcPos])

  /* Recalculate position when filter panel opens */
  useEffect(() => {
    if (filterPanelOpen) calcPos()
  }, [filterPanelOpen, calcPos])

  /* Reposition filter panel on scroll / resize */
  useEffect(() => {
    if (!filterPanelOpen) return
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [filterPanelOpen, calcPos])

  /* Close filter panel on outside click.
     Ignore clicks inside other fixed portals (e.g. Dropdown droplists) —
     those live in document.body but visually belong to the panel.
     Without this check, the panel closes before a Dropdown's onClick fires. */
  useEffect(() => {
    if (!filterPanelOpen) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (fieldRef.current?.contains(t) || panelRef.current?.contains(t)) return
      // Walk up the DOM: if the target is inside any direct-child-of-body
      // fixed element (another portal), leave the panel open.
      let el = t as Element | null
      while (el && el !== document.body) {
        if (
          el.parentElement === document.body &&
          getComputedStyle(el).position === 'fixed'
        ) return
        el = el.parentElement
      }
      onFilterClick?.()   // toggle off
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [filterPanelOpen, onFilterClick])

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setInputValue('')
    onChange?.('')
    onClear?.()
    inputRef.current?.focus()
  }

  /* ── CSS classes ──────────────────────────────────────────────────────── */

  const wrapperCls = [
    styles.wrapper,
    sizeCls[size],
    focused   ? styles.isFocused  : '',
    disabled  ? styles.isDisabled : '',
    loading   ? styles.isLoading  : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className={wrapperCls}>

      {/* Label */}
      {label !== undefined && (
        <label className={styles.label} htmlFor={uid}>{label}</label>
      )}

      {/* Field */}
      <div ref={fieldRef} className={styles.field} onClick={() => inputRef.current?.focus()}>

        {/* Search icon */}
        <span
          className={styles.searchIcon}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: searchSvg }}
        />

        {/* Input */}
        <input
          ref={inputRef}
          id={uid}
          type="text"
          className={styles.input}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          aria-label={label ? undefined : placeholder}
          onChange={e => { setInputValue(e.target.value); onChange?.(e.target.value) }}
          onFocus={() => { setFocused(true); calcPos() }}
          onBlur={() => setFocused(false)}
        />

        {/* ── Counter navigation (mutually exclusive with filter) ─── */}
        {counter ? (
          <>
            <span className={styles.counter} aria-live="polite">
              {counter.current}/{counter.total}
            </span>

            <Tooltip label="Previous" position="top">
              <button
                type="button"
                className={styles.navBtn}
                onClick={e => { e.stopPropagation(); onPrev?.() }}
                disabled={disabled}
                aria-label="Previous"
                tabIndex={-1}
              >
                <span className={styles.navIcon} dangerouslySetInnerHTML={{ __html: angleUpSvg }} />
              </button>
            </Tooltip>

            <Tooltip label="Next" position="top">
              <button
                type="button"
                className={styles.navBtn}
                onClick={e => { e.stopPropagation(); onNext?.() }}
                disabled={disabled}
                aria-label="Next"
                tabIndex={-1}
              >
                <span className={styles.navIcon} dangerouslySetInnerHTML={{ __html: angleDownSvg }} />
              </button>
            </Tooltip>

            {/* Clear — always visible in counter mode (closes the search bar) */}
            {!disabled && (
              <Tooltip label="Clear search" position="top">
                <button
                  type="button"
                  className={styles.clearBtn}
                  onMouseDown={handleClear}
                  aria-label="Clear search"
                  tabIndex={-1}
                >
                  <span className={styles.clearIcon} dangerouslySetInnerHTML={{ __html: clearSvg }} />
                </button>
              </Tooltip>
            )}
          </>
        ) : (
          <>
            {/* Clear button — visible when has value and not disabled */}
            {hasValue && !disabled && (
              <Tooltip label="Clear search" position="top">
                <button
                  type="button"
                  className={styles.clearBtn}
                  onMouseDown={handleClear}
                  aria-label="Clear search"
                  tabIndex={-1}
                >
                  <span
                    className={styles.clearIcon}
                    dangerouslySetInnerHTML={{ __html: clearSvg }}
                  />
                </button>
              </Tooltip>
            )}

            {/* Filter button */}
            {filter && (
              <Tooltip label="Filters" position="top">
                <button
                  type="button"
                  className={[
                    styles.filterBtn,
                    filterActive ? styles.filterBtnActive : '',
                  ].filter(Boolean).join(' ')}
                  onClick={e => { e.stopPropagation(); onFilterClick?.() }}
                  disabled={disabled}
                  aria-label="Filters"
                  tabIndex={-1}
                >
                  <span
                    className={styles.filterIcon}
                    dangerouslySetInnerHTML={{ __html: filterSvg }}
                  />
                  {filterActive && <span className={styles.filterDot} aria-hidden="true" />}
                </button>
              </Tooltip>
            )}
          </>
        )}

      </div>

      {/* Helper text */}
      {helper !== undefined && (
        <p className={styles.helper}>{helper}</p>
      )}

      {/* Loading indicator — portal */}
      {loading && createPortal(
        <div
          className={`${styles.loadingDroplist} ${sizeCls[size]}`}
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          aria-live="polite"
        >
          <span className={styles.loadingText}>Loading...</span>
        </div>,
        document.body,
      )}

      {/* Filter panel — portal, right-aligned to field */}
      {filterPanelOpen && filterPanel && createPortal(
        <div
          ref={panelRef}
          className={styles.filterPanelPortal}
          style={{ top: pos.top, right: `calc(100vw - ${pos.left + pos.width}px)` }}
        >
          {filterPanel}
        </div>,
        document.body,
      )}

    </div>
  )
}

export default Search
