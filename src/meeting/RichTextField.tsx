/* RichTextField — rich-text description editor for an agenda item (Figma
   11710-104418). When focused it shows a bordered box with a formatting toolbar
   (Bold, Italic, Underline, Bulleted list, Numbered list); otherwise it renders
   the formatted content inline (or a placeholder). Content is stored/emitted as
   HTML so the formatting is preserved and rendered in edit + view modes.
   Uses document.execCommand — the pragmatic, dependency-free approach for the
   prototype's basic formatting set. */

import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { editor } from '../icons/editor'
import { arrows } from '../icons/arrows'
import { HintRow } from '../components/shared/HintRow'
import { plainTextLength } from './sanitizeHtml'
import styles from './RichTextField.module.css'

const boldSvg      = editor.find(i => i.name === 'bold')!.svg
const italicSvg    = editor.find(i => i.name === 'italic')!.svg
const underlineSvg = editor.find(i => i.name === 'underline')!.svg
const bulletSvg    = editor.find(i => i.name === 'list-ul')!.svg
const numberedSvg  = editor.find(i => i.name === 'list-ol-alt')!.svg
const undoSvg      = arrows.find(i => i.name === 'undo')!.svg
const redoSvg      = arrows.find(i => i.name === 'redo')!.svg

/** Toolbar groups: text styles, list styles, then history (Figma spacing). */
const TOOL_GROUPS: { cmd: string; svg: string; label: string }[][] = [
  [
    { cmd: 'bold',      svg: boldSvg,      label: 'Bold' },
    { cmd: 'italic',    svg: italicSvg,    label: 'Italic' },
    { cmd: 'underline', svg: underlineSvg, label: 'Underline' },
  ],
  [
    { cmd: 'insertUnorderedList', svg: bulletSvg,   label: 'Bulleted list' },
    { cmd: 'insertOrderedList',   svg: numberedSvg, label: 'Numbered list' },
  ],
  [
    { cmd: 'undo', svg: undoSvg, label: 'Undo' },
    { cmd: 'redo', svg: redoSvg, label: 'Redo' },
  ],
]

/** True when the HTML has no visible text (ignoring tags / whitespace / <br>). */
function isHtmlEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/ |\s/g, '') === ''
}

export interface RichTextFieldProps {
  value:        string
  onChange:     (html: string) => void
  placeholder?: string
  /** Maximum number of visible characters (markup excluded). Over the limit the
      field shows the standard error state and reports invalid via onValidityChange. */
  maxLength?:   number
  /** External error message shown below the field. */
  error?:       string
  /** Called whenever the field's validity (against maxLength) changes. */
  onValidityChange?: (valid: boolean) => void
  /** When the field sits inline next to a leading field icon (meeting details),
      shift the box up on focus so the toolbar lines up with that icon instead of
      pushing the content down (no icon "jump"). */
  tightenFocus?: boolean
}

export function RichTextField({
  value,
  onChange,
  placeholder = 'Add description',
  maxLength,
  error,
  onValidityChange,
  tightenFocus = false,
}: RichTextFieldProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const [active,  setActive]  = useState<Record<string, boolean>>({})

  /* Character-limit validation. Visible text is counted; HTML markup is not (the
     ticket leaves markup-counting unspecified, so this uses the natural rule). */
  const overLimit = maxLength != null && plainTextLength(value) > maxLength
  const errorMsg = overLimit ? `Text exceeds ${maxLength} character limit` : error

  useEffect(() => {
    onValidityChange?.(!overLimit)
  }, [overLimit, onValidityChange])

  /* Render the saved value into the (uncontrolled) editable div whenever it isn't
     focused — on mount and on every external change — so the default state always
     shows the saved value, never a stale/empty box. useLayoutEffect writes it
     before paint (no empty flash on mount / re-activation). While focused we skip
     the write so typing never jumps the caret. */
  useLayoutEffect(() => {
    const el = ref.current
    if (el && !focused && el.innerHTML !== (value || '')) el.innerHTML = value || ''
  }, [value, focused])

  const refreshActive = useCallback(() => {
    setActive({
      bold:                 document.queryCommandState('bold'),
      italic:               document.queryCommandState('italic'),
      underline:            document.queryCommandState('underline'),
      insertUnorderedList:  document.queryCommandState('insertUnorderedList'),
      insertOrderedList:    document.queryCommandState('insertOrderedList'),
    })
  }, [])

  /* Keep the toolbar's active states in sync with the caret while editing. */
  useEffect(() => {
    if (!focused) return
    document.addEventListener('selectionchange', refreshActive)
    return () => document.removeEventListener('selectionchange', refreshActive)
  }, [focused, refreshActive])

  const emit = () => { if (ref.current) onChange(ref.current.innerHTML) }

  const exec = (cmd: string) => {
    ref.current?.focus()
    document.execCommand(cmd)
    emit()
    refreshActive()
  }

  const empty = isHtmlEmpty(value)

  return (
    <div className={[styles.field, tightenFocus && focused ? styles.tightenActive : ''].filter(Boolean).join(' ')}>
    <div className={[styles.wrap, focused ? styles.focused : '', errorMsg ? styles.hasError : ''].filter(Boolean).join(' ')}>
      {focused && (
        <div className={styles.toolbar}>
          {TOOL_GROUPS.map((group, gi) => (
            <div key={gi} className={styles.group}>
              {group.map(tool => (
                <button
                  key={tool.cmd}
                  type="button"
                  className={[styles.toolBtn, active[tool.cmd] ? styles.toolBtnActive : ''].filter(Boolean).join(' ')}
                  /* Keep the selection while clicking a toolbar button. */
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => exec(tool.cmd)}
                  aria-label={tool.label}
                  aria-pressed={Boolean(active[tool.cmd])}
                  dangerouslySetInnerHTML={{ __html: tool.svg }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <div
        ref={ref}
        className={[styles.editable, empty ? styles.isEmpty : ''].filter(Boolean).join(' ')}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        data-placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); emit() }}
        onInput={emit}
      />
    </div>
      {errorMsg && <HintRow text={errorMsg} error />}
    </div>
  )
}

export default RichTextField
