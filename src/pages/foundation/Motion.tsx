import type { ReactNode } from 'react'
import styles from './Motion.module.css'

// ─────────────────────────────────────────────────────────────────────────────

interface DurationToken {
  name:  string
  value: string
  usage: string
}

const durationTokens: DurationToken[] = [
  {
    name: '--dur-instant', value: '0ms',
    usage: "Modal's exit hold · every floating panel's exit (dropdown, autocomplete, date picker, tooltip, workspace switcher, user menu, filter panel)",
  },
  {
    name: '--dur-fast', value: '200ms',
    usage: 'Button and droplist-item press-in',
  },
  {
    name: '--dur-snap', value: '300ms',
    usage: "Hover fills (buttons, fields, cards, nav items) · floating-panel enter · checkbox/radio fills · toast's exit slide",
  },
  {
    name: '--dur-base', value: '400ms',
    usage: 'Toggle track/knob · Modal enter · toast enter and stack reflow · Skeleton to content fade-in',
  },
  {
    name: '--dur-slow', value: '600ms',
    usage: "Drawer enter (backdrop, slide, and the inline variant's width grow) · loading-spinner rotation speed (Button, TextField)",
  },
  { name: '--dur-skeleton-pulse', value: '1600ms', usage: "Skeleton's opacity pulse loop" },
]

interface EasingToken {
  name:   string
  value:  string
  usage:  string
}

const easingTokens: EasingToken[] = [
  { name: '--ease-out', value: 'cubic-bezier(0, 0, .2, 1)', usage: 'Every enter / appear' },
  { name: '--ease-in', value: 'cubic-bezier(.6, 0, 1, 1)', usage: 'Every exit / disappear' },
  {
    name: '--ease-in-out', value: 'cubic-bezier(.6, 0, .2, 1)',
    usage: "State-to-state movement that isn't an enter or exit — Toggle's track/knob, Skeleton's pulse, a dragged item's return-to-place snap",
  },
]

interface Pattern {
  title:   string
  badges:  string[]
  body:    ReactNode
  note?:   string
  usedBy?: string[]
}

const patterns: Pattern[] = [
  {
    title: 'Hover',
    badges: ['--dur-snap', '--ease-out'],
    body: (
      <>
        <p><strong>Animated</strong> — buttons, input fields, cards, sections, tabs, links, side-nav items: background-color / border-color / color / box-shadow.</p>
        <p><strong>Instant</strong> — table rows, list rows, tree nodes, and every item inside a dropdown or menu: no transition. These act as a cursor-position indicator, not an object changing state — the highlight has to track the cursor, not trail behind it. Droplist items (see Press below) do get an animated press-in; table/list rows still don&rsquo;t.</p>
      </>
    ),
    note: 'Both are gated behind @media (hover: hover) — touch never gets a stuck hover state.',
  },
  {
    title: 'Press',
    badges: ['--dur-fast', '--ease-in'],
    body: (
      <>
        <p><strong>Buttons</strong> — a shorter, deeper version of hover; pressing down is quick, releasing eases back at the normal hover speed. No scale, no translate.</p>
        <p><strong>Droplist items</strong> (Dropdown, Autocomplete, Workspace Switcher) — press-in animates to a deeper fill; release is instant, falling back to the same cursor-tracking hover swap the row already uses.</p>
      </>
    ),
  },
  {
    title: 'Floating panels',
    badges: ['--dur-snap in', '--dur-instant out'],
    body: <p>Opacity is the only animated property on enter — no translate, no scale, no origin-based growth. Position is fully resolved before the fade starts, so a panel never repositions mid-fade.</p>,
    note: 'Closing has no exit animation — the panel disappears instantly and unmounts right away, same direction as Modal.',
    usedBy: ['Dropdown', 'Autocomplete', 'Date Picker', 'Tooltip', 'Workspace Switcher', 'User menu', 'Search filter panel'],
  },
  {
    title: 'Toggle / Checkbox / Radio',
    badges: ['--dur-base', '--ease-in-out'],
    body: (
      <>
        <p><strong>Toggle</strong> — track color and knob position animate together (state-to-state, not enter/exit); the knob moves by transform: translateX only.</p>
        <p><strong>Checkbox / Radio</strong> — fill animates at --dur-snap / --ease-out; the check mark or dot fades in on opacity, no scale, no stroke-draw animation.</p>
      </>
    ),
  },
  {
    title: 'Modal',
    badges: ['--dur-base in', '--dur-instant out'],
    body: <p>The only element in the system permitted to scale — the panel goes 0.96 → 1 alongside an opacity fade, backdrop fading in step.</p>,
    note: 'Closing has no exit animation. Backdrop and panel disappear instantly, and the component unmounts right away rather than holding for a transition that no longer runs.',
  },
  {
    title: 'Drawer',
    badges: ['--dur-slow in', '--dur-base out'],
    body: (
      <>
        <p><strong>Right / left</strong> — slides on transform: translateX only, never width. Border elevation, never a shadow — it's persistent page furniture.</p>
        <p><strong>Bottom</strong> — an action-sheet style menu (the mobile user menu). Slides on translateY, rounded top corners, and uses box-shadow instead of a border — it reads as a floating menu, not page furniture.</p>
        <p>Enter is slower than exit throughout — the heaviest primitive in the system, given the most deliberate entrance.</p>
      </>
    ),
    note: "Exception: the Tasks page's inline row-detail drawer animates width — see Deliberate exceptions below.",
  },
  {
    title: 'Toast',
    badges: ['--dur-base in', '--dur-snap out'],
    body: <p>Slides, never fades — transform only, no opacity. Enter and the stack's &ldquo;make room&rdquo; reflow are driven by the same effect pass, so a new toast and the toasts sliding down to make room for it stay in lockstep.</p>,
    note: "Auto-dismiss (4s) animates its exit, sliding out behind whichever toast sits above it. Dismissing via the toast's own × button is instant — removed immediately, no exit slide.",
  },
  {
    title: 'Skeleton',
    badges: ['--dur-skeleton-pulse', '--dur-base fade-in'],
    body: <p>Pulses opacity 1 → 0.5 → 1 on loop, no shimmer gradient. Gated behind a 200ms delay so a fast load never flashes a skeleton. Content replacing it fades in — no translate, no scale — and never cross-fades with the skeleton; one is fully removed before the other appears.</p>,
  },
  {
    title: 'Responsive navigation',
    badges: ['Tooltip', 'Accordion', 'Bottom sheet'],
    body: (
      <>
        <p><strong>Laptop rail</strong> (1024–1439px) — nav items and the workspace/user avatars collapse to icon-only; hovering shows a tooltip with the label.</p>
        <p><strong>Mobile/tablet drawer</strong> (390–1023px) — the workspace switcher expands as an inline accordion in place of a floating dropdown, replacing the rest of the nav while open rather than layering on top of it.</p>
        <p><strong>Mobile user menu</strong> — opens as the Drawer's bottom-sheet variant instead of the tablet's inline rows.</p>
      </>
    ),
  },
]

const exceptions = [
  {
    what: 'Drawer’s inline variant animates width',
    why: 'Used by the Tasks page’s row-detail drawer — it’s an in-flow column next to the table, so its width change is a layout change for that sibling. A transform slide would only move the drawer’s own pixels, leaving the table to snap to its new width in one frame.',
  },
  {
    what: 'Drawer’s bottom variant uses a shadow, not a border',
    why: 'It behaves like a transient floating menu (the mobile user menu), not persistent page furniture, so it follows the floating-surface elevation rule instead of the drawer rule.',
  },
  {
    what: 'Modal panel scales',
    why: 'The one explicitly permitted exception to "no scale on interactive elements" — every other component in the system is scale-free.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────

export default function MotionPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Motion</h1>
      <p className={styles.subtitle}>src/styles/tokens.css · src/styles/motion.css</p>

      {/* ── Principles ────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Principles</h2>
        <p className={styles.sectionDesc}>
          The rules every component follows, so motion reads as one system rather than
          per-component choices.
        </p>
        <div className={styles.principles}>
          <div className={styles.principle}>
            <span className={styles.principleTitle}>Six properties, nothing else</span>
            <span className={styles.principleDesc}>Only opacity, transform, background-color, border-color, color, box-shadow ever animate. Everything else forces layout recalculation every frame.</span>
          </div>
          <div className={styles.principle}>
            <span className={styles.principleTitle}>Name every property</span>
            <span className={styles.principleDesc}>transition: all is never used. Each transition spells out exactly what it animates.</span>
          </div>
          <div className={styles.principle}>
            <span className={styles.principleTitle}>No scale, one exception</span>
            <span className={styles.principleDesc}>Nothing scales on interaction anywhere in the system — except the Modal panel, the single permitted case.</span>
          </div>
          <div className={styles.principle}>
            <span className={styles.principleTitle}>Icons don&rsquo;t cross-fade</span>
            <span className={styles.principleDesc}>An icon swaps instantly, or — where one glyph can represent both states, like a chevron — rotates instead of swapping assets.</span>
          </div>
          <div className={styles.principle}>
            <span className={styles.principleTitle}>Disabled is instant</span>
            <span className={styles.principleDesc}>:disabled and aria-disabled carry no transition, entering or leaving.</span>
          </div>
          <div className={styles.principle}>
            <span className={styles.principleTitle}>Exit is faster than enter</span>
            <span className={styles.principleDesc}>Enter always uses --ease-out, exit --ease-in — and exit runs on a shorter token. A panel that lingers on close reads as broken.</span>
          </div>
        </div>
      </section>

      {/* ── Duration tokens ───────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Duration</h2>
        <p className={styles.sectionDesc}>
          Component code never hardcodes a duration — everything routes through these six
          tokens.
        </p>
        <div className={styles.table}>
          <div className={styles.header}>
            <span>Token</span>
            <span>Value</span>
            <span>Used by</span>
          </div>
          {durationTokens.map(t => (
            <div key={t.name} className={styles.row}>
              <span className={styles.tokenName}>{t.name}</span>
              <span className={styles.mono}>{t.value}</span>
              <span className={styles.usageText}>{t.usage}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Easing tokens ─────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Easing</h2>
        <div className={styles.table}>
          <div className={styles.header}>
            <span>Token</span>
            <span>Curve</span>
            <span>Used for</span>
          </div>
          {easingTokens.map(t => (
            <div key={t.name} className={styles.easingRow}>
              <span className={styles.tokenName}>{t.name}</span>
              <span className={styles.mono}>{t.value}</span>
              <span className={styles.usageText}>{t.usage}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Motion by pattern ─────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Motion by pattern</h2>
        <p className={styles.sectionDesc}>
          One entry per primitive — what animates, on which tokens, and where it shows up.
        </p>
        <div className={styles.patterns}>
          {patterns.map(p => (
            <div key={p.title} className={styles.pattern}>
              <div className={styles.patternHead}>
                <h3 className={styles.patternTitle}>{p.title}</h3>
                <div className={styles.badges}>
                  {p.badges.map(b => <span key={b} className={styles.badge}>{b}</span>)}
                </div>
              </div>
              {p.body}
              {p.note && <div className={styles.note}>{p.note}</div>}
              {p.usedBy && (
                <div className={styles.usedBy}>
                  <span className={styles.usedByLabel}>Used by</span>
                  {p.usedBy.map(u => <span key={u} className={styles.chip}>{u}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Global behavior ───────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Global behavior</h2>
        <div className={styles.callouts}>
          <div className={styles.callout}>
            <h3>Reduced motion</h3>
            <p>Every animation-duration and transition-duration collapses to 1ms under prefers-reduced-motion: reduce. State changes stay fully functional — only their duration disappears. Skeleton&rsquo;s pulse becomes a static block; Modal and Drawer still appear and disappear, just instantly.</p>
            <span className={styles.file}>src/styles/motion.css</span>
          </div>
          <div className={styles.callout}>
            <h3>Disabled</h3>
            <p>:disabled and [aria-disabled=&quot;true&quot;] get transition: none globally. Entering or leaving disabled is instant by design, never eased.</p>
            <span className={styles.file}>src/styles/motion.css</span>
          </div>
        </div>
      </section>

      {/* ── Deliberate exceptions ─────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Deliberate exceptions</h2>
        <p className={styles.sectionDesc}>
          A handful of documented deviations from the compositor-only rule, and why — so
          they don&rsquo;t get &ldquo;fixed&rdquo; back later.
        </p>
        <div>
          {exceptions.map(e => (
            <div key={e.what} className={styles.exceptionRow}>
              <span className={styles.exceptionWhat}>{e.what}</span>
              <span className={styles.exceptionWhy}>{e.why}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
