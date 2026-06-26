/* BlankPage — placeholder prototype environment.
   Shared by every flow that doesn't have a dedicated prototype yet.
   The flow name is passed via the `?title=` query param, e.g.
   /blank.html?title=Before%20meeting%20%E2%80%94%20Corporate%20secretary
   As each flow is built out, repoint its link to its own dedicated page. */

import { HubHeader } from '../hub/HubHeader'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { Button } from '../components/Button/Button'
import styles from './BlankPage.module.css'

export default function BlankPage() {
  const params = new URLSearchParams(window.location.search)
  const title = params.get('title') ?? 'Prototype'

  return (
    <div className={styles.shell}>
      <HubHeader />

      <main className={styles.main}>
        <EmptyState
          illustration="web-page-warning"
          title={title}
          description="This prototype is coming soon."
          action={
            <Button variant="secondary" intent="neutral" size="m" href="/board.html">
              Back to prototypes
            </Button>
          }
        />
      </main>
    </div>
  )
}
