/* Composer — thin wrapper around the DS TextEditor (matches Figma
   "Input: Text area with editor" 1:1 — toolbar, textarea and bottom actions
   all come from that component). Only page-specific glue lives here:
   outer spacing and Enter-to-send. */

import { TextEditor } from '../../components/TextEditor/TextEditor'
import styles from './Composer.module.css'

export interface ComposerProps {
  value:        string
  onChange:     (value: string) => void
  onSend:       () => void
  placeholder?: string
}

export function Composer({ value, onChange, onSend, placeholder = 'Write message...' }: ComposerProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) onSend()
    }
  }

  return (
    <div className={styles.wrapper}>
      <TextEditor
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Message"
      />
    </div>
  )
}

export default Composer
