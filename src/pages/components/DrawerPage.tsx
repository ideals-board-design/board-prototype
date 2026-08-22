/* DrawerPage — showcase for the Drawer component (motion spec §7) */

import { useState } from 'react'
import { Drawer } from '../../components/Drawer/Drawer'
import { Button } from '../../components/Button/Button'
import { BadgeStatus } from '../../components/BadgeStatus/BadgeStatus'
import { StickyFooter } from '../../components/StickyFooter/StickyFooter'
import styles from './DrawerPage.module.css'
import { SourceLink } from '../SourceLink'

export default function DrawerPage() {
  const [openBasic,  setOpenBasic]  = useState(false)
  const [openFooter, setOpenFooter] = useState(false)
  const [openWide,   setOpenWide]   = useState(false)
  const [openInline, setOpenInline] = useState(false)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Drawer</h1>
      <p className={styles.subtitle}>
        Right side only. Enter <code>--dur-slow</code>, exit <code>--dur-base</code> —
        it leaves faster than it arrives. The panel slides on <code>translateX</code> at
        full opacity; only the backdrop fades. Elevation is a <code>border-left</code>,
        never a shadow.
      </p>
      <SourceLink path="src/components/Drawer/Drawer.tsx" />

      {/* ── Overlay ──────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Overlay (default)</h2>
      <div className={styles.trigger}>
        <Button onClick={() => setOpenBasic(true)}>Open drawer</Button>
      </div>

      <h2 className={styles.sectionTitle}>With footer, type and badge</h2>
      <div className={styles.trigger}>
        <Button onClick={() => setOpenFooter(true)}>Open task drawer</Button>
      </div>

      <h2 className={styles.sectionTitle}>Wide (640px)</h2>
      <div className={styles.trigger}>
        <Button onClick={() => setOpenWide(true)}>Open wide drawer</Button>
      </div>

      {/* ── Inline ───────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Inline side column</h2>
      <p className={styles.note}>
        Same motion, no backdrop and no scroll lock — the page behind stays live.
        This is the Tasks table pattern.
      </p>
      <div className={styles.inlineDemo}>
        <div className={styles.inlineContent}>
          <Button
            variant="secondary"
            onClick={() => setOpenInline(o => !o)}
          >
            {openInline ? 'Close column' : 'Open column'}
          </Button>
        </div>
        <Drawer
          variant="inline"
          width={320}
          open={openInline}
          onClose={() => setOpenInline(false)}
          title="Inline drawer"
        >
          <p className={styles.body}>
            An in-flow column. It still slides in on <code>transform</code> and out
            faster than it came in.
          </p>
        </Drawer>
      </div>

      {/* ── Drawers ──────────────────────────────────────────── */}

      <Drawer
        open={openBasic}
        onClose={() => setOpenBasic(false)}
        title="Drawer header"
        titleReadOnly
      >
        <p className={styles.body}>
          Content is in the DOM before the slide starts, so nothing pops in
          mid-travel.
        </p>
      </Drawer>

      <Drawer
        open={openFooter}
        onClose={() => setOpenFooter(false)}
        title="Distribute new policy across departments"
        headerType="Action"
        headerBadge={<BadgeStatus type="warning" label="Draft" />}
        footer={
          <StickyFooter
            variant="drawer"
            left={<Button variant="primary" size="m">Save</Button>}
          />
        }
      >
        <p className={styles.body}>
          The header is the shared <code>DrawerHeader</code> component; the footer
          slot takes a <code>StickyFooter variant=&quot;drawer&quot;</code>.
        </p>
      </Drawer>

      <Drawer
        open={openWide}
        onClose={() => setOpenWide(false)}
        width={640}
        title="Wide drawer"
        titleReadOnly
      >
        <p className={styles.body}>
          Width is a prop; the travel distance is always 100% of the panel, so the
          duration does not change with width.
        </p>
      </Drawer>
    </div>
  )
}
