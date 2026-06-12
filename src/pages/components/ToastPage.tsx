/* ToastPage — showcase for Toast component
   Figma nodes 9829-100949 (component set), 34940-39518…39576 (instances) */

import { useRef } from 'react'
import { Toast, type ToastState } from '../../components/Toast/Toast'
import { ToastContainer, type ToastContainerHandle } from '../../components/ToastContainer/ToastContainer'
import { Button } from '../../components/Button/Button'
import styles from './ToastPage.module.css'
import { SourceLink } from '../SourceLink'

type Intent = 'default' | 'info' | 'warning' | 'danger'
const ACTION_INTENT: Record<ToastState, Intent> = {
  success: 'default',
  info:    'info',
  warning: 'warning',
  error:   'danger',
}

function ActionBtn({ state }: { state: ToastState }) {
  return (
    <Button variant="tertiary" intent={ACTION_INTENT[state]} size="m"
      style={{ padding: 0, margin: 0 }}>
      Button
    </Button>
  )
}

const STATES: ToastState[] = ['success', 'info', 'warning', 'error']

export default function ToastPage() {
  const containerRef = useRef<ToastContainerHandle>(null)

  return (
    <>
      <ToastContainer ref={containerRef} />

      <div className={styles.page}>
        <h1 className={styles.title}>Toast</h1>
        <p className={styles.subtitle}>
          Figma nodes 9829-100949 · 34940-39518…39521 · 34940-39576
        </p>
        <SourceLink path={['src/components/Toast/Toast.tsx', 'src/components/ToastContainer/ToastContainer.tsx']} />

        {/* ── Live demo ──────────────────────────────────── */}
        <h2 className={styles.sectionTitle}>Live demo</h2>
        <p className={styles.description}>
          Click to trigger toasts. Each new toast slides in from the top and stacks above the previous one.
        </p>
        <div className={styles.triggerRow}>
          {STATES.map(state => (
            <Button
              key={state}
              variant="secondary"
              intent={ACTION_INTENT[state]}
              size="m"
              onClick={() => containerRef.current?.add({ state, message: 'Toast message text' })}
            >
              Show {state}
            </Button>
          ))}
        </div>

        {/* ── Default — message only ─────────────────────── */}
        <h2 className={styles.sectionTitle}>Default — message only</h2>
        <div className={styles.stack}>
          {STATES.map(state => (
            <Toast
              key={state}
              state={state}
              message="Toast message text"
              onDismiss={() => {}}
            />
          ))}
        </div>

        {/* ── With optional text ─────────────────────────── */}
        <h2 className={styles.sectionTitle}>With optional text</h2>
        <div className={styles.stack}>
          {STATES.map(state => (
            <Toast
              key={state}
              state={state}
              message="Toast message text"
              optional="Optional"
              onDismiss={() => {}}
            />
          ))}
        </div>

        {/* ── With optional + action ─────────────────────── */}
        <h2 className={styles.sectionTitle}>With optional text + action</h2>
        <div className={styles.stack}>
          {STATES.map(state => (
            <Toast
              key={state}
              state={state}
              message="Toast message text"
              optional="Optional"
              action={<ActionBtn state={state} />}
              onDismiss={() => {}}
            />
          ))}
        </div>

        {/* ── Truncation ─────────────────────────────────── */}
        <h2 className={styles.sectionTitle}>Truncation</h2>
        <p className={styles.description}>
          Primary: max 2 lines. Optional: max 3 lines.
        </p>
        <div className={styles.stack}>
          <Toast
            state="success"
            message="Functionality might be limited temporarily on Ideals Board portal"
            optional="Please free up storage to ensure smooth performance. Delete unused files, clear cache, or uninstall apps."
            onDismiss={() => {}}
          />
          <Toast
            state="error"
            message="Something went wrong while saving your changes. Please check your connection and try again later."
            optional="If the problem persists, contact support and provide the error code shown in the details panel."
            action={<ActionBtn state="error" />}
            onDismiss={() => {}}
          />
        </div>

        {/* ── No dismiss ─────────────────────────────────── */}
        <h2 className={styles.sectionTitle}>No dismiss button</h2>
        <div className={styles.stack}>
          {STATES.map(state => (
            <Toast
              key={state}
              state={state}
              message="Toast message text"
            />
          ))}
        </div>

        {/* ── Guidelines ─────────────────────────────────── */}
        <h2 className={styles.sectionTitle}>Guidelines</h2>
        <ul className={styles.guidelines}>
          <li>Fixed width: 400px. Position toasts at the top-right of the viewport via <code>ToastContainer</code>.</li>
          <li><strong>Stacking:</strong> newest toast at top, 8px gap. Older toasts push downward.</li>
          <li><strong>Enter:</strong> slide in from top + fade in, 400ms <code>cubic-bezier(0.22, 1, 0.36, 1)</code>.</li>
          <li><strong>Exit:</strong> slide out top + fade out, 300ms same easing.</li>
          <li><strong>Primary message:</strong> max 2 lines, then ellipsis. Use <code>--font-weight-medium</code>.</li>
          <li><strong>Optional text:</strong> max 3 lines, then ellipsis.</li>
          <li><strong>Action:</strong> tertiary button with intent matching the state. Appears below optional text.</li>
          <li><strong>Dismiss:</strong> <code>multiply</code> icon via DS tertiary button. Tooltip label "Dismiss", position "top".</li>
          <li>No auto-dismiss timer in this component — handle externally if needed.</li>
        </ul>
      </div>
    </>
  )
}
