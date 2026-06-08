/* BannerPage — showcase for Banner component
   Figma node 14376-70685 */

import { Banner, type BannerState } from '../../components/Banner/Banner'
import { Button } from '../../components/Button/Button'
import styles from './BannerPage.module.css'

const MSG  = 'Banner message text'
const MSG2 = 'This is a longer banner message that may wrap onto a second line when the container is narrow enough to trigger it.'

/* Action button intent per state */
type Intent = 'default' | 'info' | 'neutral' | 'warning' | 'danger'
const ACTION_INTENT: Record<BannerState, Intent> = {
  'info-primary':   'info',
  'info-secondary': 'neutral',
  success:          'default',
  error:            'danger',
  warning:          'warning',
}

function ActionBtn({ state }: { state: BannerState }) {
  return (
    <Button variant="tertiary" intent={ACTION_INTENT[state]} size="m">
      Button
    </Button>
  )
}

/* State rows in display order */
const STATES: BannerState[] = [
  'success',
  'info-primary',
  'info-secondary',
  'warning',
  'error',
]

/* ── Page ────────────────────────────────────────────────── */

export default function BannerPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Banner</h1>
      <p className={styles.subtitle}>Figma node 14376-70685</p>

      {/* ── Rounded · Size L ──────────────────────────── */}
      <h2 className={styles.sectionTitle}>Rounded · Size L (48px)</h2>
      <div className={styles.bannerStack}>
        {STATES.map(state => (
          <Banner
            key={state}
            state={state}
            variant="rounded"
            size="l"
            message={MSG}
            action={<ActionBtn state={state} />}
            onDismiss={() => {}}
          />
        ))}
      </div>

      {/* ── Rounded · Size M ──────────────────────────── */}
      <h2 className={styles.sectionTitle}>Rounded · Size M (40px)</h2>
      <div className={styles.bannerStack}>
        {STATES.map(state => (
          <Banner
            key={state}
            state={state}
            variant="rounded"
            size="m"
            message={MSG}
            action={<ActionBtn state={state} />}
            onDismiss={() => {}}
          />
        ))}
      </div>

      {/* ── Inline · Size L ───────────────────────────── */}
      <h2 className={styles.sectionTitle}>Inline · Size L (48px)</h2>
      <div className={styles.bannerStack}>
        {STATES.map(state => (
          <Banner
            key={state}
            state={state}
            variant="inline"
            size="l"
            message={MSG}
            action={<ActionBtn state={state} />}
            onDismiss={() => {}}
          />
        ))}
      </div>

      {/* ── Multi-line message ─────────────────────────── */}
      <h2 className={styles.sectionTitle}>Multi-line message (max 2 lines)</h2>
      <p className={styles.description}>
        Long text wraps to two lines, then truncates with an ellipsis.
      </p>
      <div className={styles.bannerStack}>
        <Banner
          state="info-primary"
          variant="rounded"
          size="l"
          message={MSG2}
          action={<ActionBtn state="info-primary" />}
          onDismiss={() => {}}
        />
        <Banner
          state="warning"
          variant="rounded"
          size="l"
          message={MSG2}
          action={<ActionBtn state="warning" />}
          onDismiss={() => {}}
        />
      </div>

      {/* ── No action / no dismiss ─────────────────────── */}
      <h2 className={styles.sectionTitle}>Dismiss only · No action</h2>
      <div className={styles.bannerStack}>
        {STATES.map(state => (
          <Banner
            key={state}
            state={state}
            variant="rounded"
            size="l"
            message={MSG}
            onDismiss={() => {}}
          />
        ))}
      </div>

      {/* ── Guidelines ────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Guidelines</h2>
      <ul className={styles.guidelines}>
        <li><strong>Dismiss:</strong> icon button (×) — closes the banner and auto-dismissed on page navigation.</li>
        <li><strong>Message:</strong> max 2 lines; truncates with ellipsis beyond that.</li>
        <li><strong>Action button:</strong> tertiary variant, intent matching state. Align content top on 2-line text.</li>
        <li><strong>Avatar present:</strong> align content center, align button center, no left icon.</li>
        <li><strong>Primary button present:</strong> align content center.</li>
        <li><code>rounded</code>: border-radius 12px — use for page-level banners. <code>inline</code>: no radius — use full-width across containers.</li>
      </ul>
    </div>
  )
}
