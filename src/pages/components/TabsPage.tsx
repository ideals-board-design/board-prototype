import styles from './TabsPage.module.css'
import { Tabs } from '../../components/Tabs/Tabs'

const plusIcon = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 4.25V9.25H15.75V10.75H10.75V15.75H9.25V10.75H4.25V9.25H9.25V4.25H10.75Z" fill="currentColor"/> </svg>`

export default function TabsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Tabs</h1>
      <p className={styles.subtitle}>Navigation between related content sections.</p>

      {/* ── Text only ── */}
      <h2 className={styles.sectionTitle}>Text only</h2>

      <div className={styles.group}>
        <span className={styles.rowLabel}>2 tabs</span>
        <Tabs
          defaultValue="tab1"
          tabs={[
            { id: 'tab1', label: 'Tab' },
            { id: 'tab2', label: 'Tab' },
          ]}
        />
      </div>

      <div className={styles.group}>
        <span className={styles.rowLabel}>3 tabs</span>
        <Tabs
          defaultValue="tab1"
          tabs={[
            { id: 'tab1', label: 'Tab' },
            { id: 'tab2', label: 'Tab' },
            { id: 'tab3', label: 'Tab' },
          ]}
        />
      </div>

      <div className={styles.group}>
        <span className={styles.rowLabel}>5 tabs</span>
        <Tabs
          defaultValue="tab1"
          tabs={[
            { id: 'tab1', label: 'Tab' },
            { id: 'tab2', label: 'Tab' },
            { id: 'tab3', label: 'Tab' },
            { id: 'tab4', label: 'Tab' },
            { id: 'tab5', label: 'Tab' },
          ]}
        />
      </div>

      {/* ── With badge ── */}
      <h2 className={styles.sectionTitle}>With badge</h2>

      <div className={styles.group}>
        <span className={styles.rowLabel}>Active</span>
        <Tabs
          defaultValue="tab1"
          tabs={[
            { id: 'tab1', label: 'Tab', badge: '99+' },
            { id: 'tab2', label: 'Tab', badge: 4 },
            { id: 'tab3', label: 'Tab' },
          ]}
        />
      </div>

      {/* ── With icon ── */}
      <h2 className={styles.sectionTitle}>With icon</h2>

      <div className={styles.group}>
        <span className={styles.rowLabel}>Active</span>
        <Tabs
          defaultValue="tab1"
          tabs={[
            { id: 'tab1', label: 'Tab', icon: plusIcon },
            { id: 'tab2', label: 'Tab', icon: plusIcon },
            { id: 'tab3', label: 'Tab', icon: plusIcon },
          ]}
        />
      </div>

      {/* ── Disabled ── */}
      <h2 className={styles.sectionTitle}>Disabled</h2>

      <div className={styles.group}>
        <span className={styles.rowLabel}>Mixed</span>
        <Tabs
          defaultValue="tab1"
          tabs={[
            { id: 'tab1', label: 'Tab' },
            { id: 'tab2', label: 'Tab' },
            { id: 'tab3', label: 'Tab', disabled: true },
          ]}
        />
      </div>

      <div className={styles.group}>
        <span className={styles.rowLabel}>Selected disabled</span>
        <Tabs
          value="tab1"
          tabs={[
            { id: 'tab1', label: 'Tab', disabled: true },
            { id: 'tab2', label: 'Tab' },
            { id: 'tab3', label: 'Tab' },
          ]}
        />
      </div>
    </div>
  )
}
