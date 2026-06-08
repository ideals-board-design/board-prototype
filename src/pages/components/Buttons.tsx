import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Button } from '../../components/Button/Button'
import type { ButtonVariant, ButtonSize, ButtonIntent } from '../../components/Button/Button'
import { Tooltip } from '../../components/Tooltip/Tooltip'
import { actions } from '../../icons/actions'
import { arrows }  from '../../icons/arrows'
import styles from './Buttons.module.css'

/* ── DS Icons (always from src/icons/, never custom SVG) ─────────────────── */

const plusSvg         = actions.find(i => i.name === 'plus')!.svg
const arrowRightSvg   = arrows.find(i => i.name === 'arrow-right')!.svg
const externalLinkSvg = actions.find(i => i.name === 'external-link-alt')!.svg

const DsIcon = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)
const IconPlus     = () => <DsIcon svg={plusSvg} />
const IconArrow    = () => <DsIcon svg={arrowRightSvg} />
const IconExternal = () => <DsIcon svg={externalLinkSvg} />

/* ── State definitions ────────────────────────────────────────────────────── */

const SIZES: ButtonSize[] = ['l', 'm', 's']

const STATE_ROWS = [
  { label: 'Active',   extra: {}                 },
  { label: 'Disabled', extra: { disabled: true } },
  { label: 'Loading',  extra: { loading:  true } },
]

/* ── Shared helpers ───────────────────────────────────────────────────────── */

function GroupLabel({ children }: { children: ReactNode }) {
  return <span className={styles.groupLabel}>{children}</span>
}

/* ── Label-and-icon group: variant × intent → 5 states × 3 sizes ─────────── */

type LabelGroupProps = {
  label:      string
  variant:    ButtonVariant
  intent?:    ButtonIntent
  iconLeft?:  ReactNode
  iconRight?: ReactNode
  external?:  boolean
}

function LabelGroup({ label, variant, intent, iconLeft, iconRight, external }: LabelGroupProps) {
  return (
    <>
      <GroupLabel>{label}</GroupLabel>
      {STATE_ROWS.map(({ label: st, extra }) => (
        <Fragment key={st}>
          <span className={styles.rowLabel}>{st}</span>
          {SIZES.map(size => (
            <Button
              key={size}
              variant={variant}
              size={size}
              {...(intent    ? { intent }    : {})}
              {...(iconLeft  ? { iconLeft }  : {})}
              {...(iconRight ? { iconRight } : {})}
              {...(external  ? { external }  : {})}
              {...(extra as object)}
            >
              Button
            </Button>
          ))}
        </Fragment>
      ))}
    </>
  )
}

/* ── Icon-only group: variant × intent → 5 states × 3 sizes ─────────────── */

type IconOnlyGroupProps = {
  label:   string
  variant: ButtonVariant
  intent?: ButtonIntent
  icon:    ReactNode
}

function IconOnlyGroup({ label, variant, intent, icon }: IconOnlyGroupProps) {
  return (
    <>
      <GroupLabel>{label}</GroupLabel>
      {STATE_ROWS.map(({ label: st, extra }) => (
        <Fragment key={st}>
          <span className={styles.rowLabel}>{st}</span>
          {SIZES.map(size => (
            <Tooltip key={size} label="Action">
              <Button
                variant={variant}
                size={size}
                {...(intent ? { intent } : {})}
                iconOnly={icon}
                aria-label="Action"
                {...(extra as object)}
              />
            </Tooltip>
          ))}
        </Fragment>
      ))}
    </>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function ButtonsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Button</h1>
      <p className={styles.subtitle}>Figma · 5761-13093</p>

      {/* ── Label and icon ─────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Label and icon</h2>
      <div className={styles.table}>
        <span />
        <span className={styles.colHeader}>L</span>
        <span className={styles.colHeader}>M</span>
        <span className={styles.colHeader}>S</span>

        <LabelGroup label="Primary / Default" variant="primary" />
        <LabelGroup label="Primary / Danger"  variant="primary"   intent="danger" />

        <LabelGroup label="Secondary / Default" variant="secondary" />
        <LabelGroup label="Secondary / Danger"  variant="secondary" intent="danger" />

        <LabelGroup label="Tertiary / Default" variant="tertiary" />
        <LabelGroup label="Tertiary / Info"    variant="tertiary" intent="info" />
        <LabelGroup label="Tertiary / Danger"  variant="tertiary" intent="danger" />
        <LabelGroup label="Tertiary / Warning" variant="tertiary" intent="warning" />
        <LabelGroup label="Tertiary / Neutral" variant="tertiary" intent="neutral" />

        <LabelGroup label="Link / External" variant="link" external />
        <LabelGroup label="Link / Internal" variant="link" />
      </div>

      {/* ── Icon only ──────────────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Icon only</h2>
      <div className={styles.table}>
        <span />
        <span className={styles.colHeader}>L</span>
        <span className={styles.colHeader}>M</span>
        <span className={styles.colHeader}>S</span>

        <IconOnlyGroup label="Primary / Default" variant="primary"   icon={<IconPlus />} />
        <IconOnlyGroup label="Primary / Danger"  variant="primary"   intent="danger"  icon={<IconPlus />} />

        <IconOnlyGroup label="Secondary / Default" variant="secondary" icon={<IconPlus />} />
        <IconOnlyGroup label="Secondary / Danger"  variant="secondary" intent="danger"  icon={<IconPlus />} />

        <IconOnlyGroup label="Tertiary / Neutral" variant="tertiary" intent="neutral" icon={<IconPlus />} />
        <IconOnlyGroup label="Tertiary / Danger"  variant="tertiary" intent="danger"  icon={<IconPlus />} />
      </div>
    </div>
  )
}
