import { useState } from 'react'
import { actions } from '../icons/actions'
import styles from './SourceLink.module.css'

const copySvg  = actions.find(i => i.name === 'copy')!.svg
const checkSvg = actions.find(i => i.name === 'check-circle')!.svg

type SourceLinkProps = {
  /** One or more source file paths to copy (newline-joined when multiple). */
  path: string | string[]
}

/**
 * Copy-to-clipboard chip shown under a component page subtitle.
 * Copies the component's source file path(s) so they can be pasted
 * into a prompt to keep new work consistent with the design system.
 */
export function SourceLink({ path }: SourceLinkProps) {
  const paths = Array.isArray(path) ? path : [path]
  const text = paths.join('\n')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const label = copied
    ? 'Copied'
    : paths.length > 1
      ? `Copy ${paths.length} source paths`
      : 'Copy source path'

  return (
    <button
      type="button"
      className={styles.root}
      onClick={handleCopy}
      aria-label={label}
      title={text}
    >
      <code className={styles.path}>
        {paths[0]}
        {paths.length > 1 && <span className={styles.more}> +{paths.length - 1}</span>}
      </code>
      <span
        className={styles.icon}
        dangerouslySetInnerHTML={{ __html: copied ? checkSvg : copySvg }}
      />
      <span className={styles.label}>{label}</span>
    </button>
  )
}
