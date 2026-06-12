/* TextEditor — Figma node 34043:3012 */
import { type TextareaHTMLAttributes, type ReactNode } from 'react'
import styles from './TextEditor.module.css'
import { Button } from '../Button/Button'
import { Tooltip } from '../Tooltip/Tooltip'
import { HintRow } from '../shared/HintRow'
import { editor }    from '../../icons/editor'
import { files }     from '../../icons/files'
import { actions }   from '../../icons/actions'
import { communication } from '../../icons/communication'

// ── Icon SVGs ────────────────────────────────────
const boldSvg      = editor.find(i => i.name === 'bold')!.svg
const italicSvg    = editor.find(i => i.name === 'italic')!.svg
const underlineSvg = editor.find(i => i.name === 'underline')!.svg
const listUlSvg    = editor.find(i => i.name === 'list-ul')!.svg
const listOlSvg    = editor.find(i => i.name === 'list-ol-alt')!.svg
const plusSvg      = actions.find(i => i.name === 'plus')!.svg
const clipSvg      = files.find(i => i.name === 'paperclip')!.svg
const formatSvg    = editor.find(i => i.name === 'formating-on')!.svg
const sendSvg      = communication.find(i => i.name === 'message')!.svg

// ── Helper: DS icon inside Button iconOnly ────────
function icon(svg: string) {
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
}

// ── Internal toolbar button (always with tooltip above) ───
function ToolbarBtn({ svg, label }: { svg: string; label: string }) {
  return (
    <Tooltip label={label} position="top">
      <Button
        variant="tertiary"
        intent="neutral"
        size="s"
        iconOnly={icon(svg)}
        aria-label={label}
      />
    </Tooltip>
  )
}

// ── Props ────────────────────────────────────────
export type TextEditorVariant = 'outline' | 'no-border'

export interface TextEditorProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?:  ReactNode
  helper?: ReactNode
  /** Optional action link rendered on the right side of the hint row */
  action?: ReactNode
  /** true = red border only; string = red border + error message below */
  error?:  boolean | string
  /** 'no-border' = transparent, borderless; formatting bar appears on focus + hover fill */
  variant?: TextEditorVariant
  /** false = hide the bottom action bar (Add / Attach / Format / Send) */
  toolbar?: boolean
}

// ── Component ────────────────────────────────────
export function TextEditor({
  label,
  helper,
  action,
  error    = false,
  variant  = 'outline',
  toolbar  = true,
  disabled,
  className,
  id,
  ...rest
}: TextEditorProps) {
  const hasError  = Boolean(error)
  const errorMsg  = typeof error === 'string' ? error : undefined
  const hintText  = errorMsg ?? helper
  const hasHint   = hintText !== undefined
  const hasAction = action !== undefined

  const wrapperCls = [
    styles.wrapper,
    variant === 'no-border' ? styles.noBorder : '',
    hasError  ? styles.hasError   : '',
    disabled  ? styles.isDisabled : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperCls}>
      {label !== undefined && (
        <label className={styles.label} htmlFor={id}>{label}</label>
      )}

      <div className={styles.fieldWrapper}>
        {/* ── Top formatting toolbar ── */}
        <div className={styles.topBar}>
          <div className={styles.toolbarGroup}>
            <ToolbarBtn svg={boldSvg}      label="Bold" />
            <ToolbarBtn svg={italicSvg}    label="Italic" />
            <ToolbarBtn svg={underlineSvg} label="Underline" />
          </div>
          <div className={styles.toolbarGroup}>
            <ToolbarBtn svg={listUlSvg}    label="Bullet list" />
            <ToolbarBtn svg={listOlSvg}    label="Numbered list" />
          </div>
        </div>

        {/* ── Content textarea ── */}
        <textarea
          rows={1}
          {...rest}
          id={id}
          className={styles.textarea}
          disabled={disabled}
          aria-invalid={hasError || undefined}
        />

        {/* ── Bottom action toolbar ── */}
        {toolbar && (
          <div className={styles.bottomBar}>
            <div className={styles.bottomLeft}>
              <ToolbarBtn svg={plusSvg}   label="Add" />
              <ToolbarBtn svg={clipSvg}   label="Attach file" />
              <ToolbarBtn svg={formatSvg} label="Formatting" />
            </div>
            <ToolbarBtn svg={sendSvg} label="Send" />
          </div>
        )}
      </div>

      {(hasHint || hasAction) && (
        <HintRow
          text={hasHint ? hintText : null}
          error={hasError}
          action={action}
        />
      )}
    </div>
  )
}

export default TextEditor
