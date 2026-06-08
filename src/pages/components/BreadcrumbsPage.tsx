import styles from './BreadcrumbsPage.module.css'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'

const items2 = [
  { label: 'Home' },
  { label: 'Current page' },
]

const items3 = [
  { label: 'Home' },
  { label: 'Section' },
  { label: 'Current page' },
]

const items4 = [
  { label: 'Home' },
  { label: 'Section' },
  { label: 'Subsection' },
  { label: 'Current page' },
]

const items5 = [
  { label: 'Home' },
  { label: 'Section' },
  { label: 'Subsection' },
  { label: 'Detail' },
  { label: 'Current page' },
]

export default function BreadcrumbsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Breadcrumbs</h1>
      <p className={styles.subtitle}>Navigation trail showing the current page's location.</p>

      <h2 className={styles.sectionTitle}>Large</h2>
      <div className={styles.group}>
        <Breadcrumbs items={items2} size="l" />
        <Breadcrumbs items={items3} size="l" />
        <Breadcrumbs items={items4} size="l" />
        <Breadcrumbs items={items5} size="l" />
      </div>

      <h2 className={styles.sectionTitle}>Medium</h2>
      <div className={styles.group}>
        <Breadcrumbs items={items2} size="m" />
        <Breadcrumbs items={items3} size="m" />
        <Breadcrumbs items={items4} size="m" />
        <Breadcrumbs items={items5} size="m" />
      </div>
    </div>
  )
}
