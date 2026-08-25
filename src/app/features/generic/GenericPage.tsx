/* GenericPage — placeholder shell for every non-tasks page
   PageHeader + EmptyState body (no toolbar) */

import { PageHeader } from '../../../components/PageHeader/PageHeader'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import styles from './GenericPage.module.css'

interface GenericPageProps {
  title:        string
  illustration: string
  /** Mobile/tablet tier (390–1023px) — shows the nav drawer's hamburger trigger. */
  onMenuClick?: () => void
}

export default function GenericPage({ title, illustration, onMenuClick }: GenericPageProps) {
  return (
    <div className={styles.page}>
      <div className={styles.content}>

        <PageHeader title={title} onMenuClick={onMenuClick} />

        <div className={styles.body}>
          <EmptyState
            illustration={illustration}
            title="Nothing here yet"
            description="This page is under construction."
          />
        </div>

      </div>
    </div>
  )
}
