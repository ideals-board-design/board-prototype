/* DashboardPage — Figma node 2465-7045
   PageHeader + centered 720px column:
   onboarding (greeting + 3 step cards + "do not show" checkbox) and a meetings empty state. */

import { useState } from 'react'
import { PageHeader } from '../../../components/PageHeader/PageHeader'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Button } from '../../../components/Button/Button'
import { Checkbox } from '../../../components/Checkbox/Checkbox'
import { actions } from '../../../icons/actions'
import { onboarding } from '../../../icons/onboarding'
import styles from './DashboardPage.module.css'

const configureSvg = onboarding.find(i => i.name === 'configure-workspace')!.svg
const groupsSvg     = onboarding.find(i => i.name === 'create-groups')!.svg
const inviteSvg      = onboarding.find(i => i.name === 'invite-users')!.svg
const plusSvg        = actions.find(i => i.name === 'plus')!.svg

const STEPS = [
  { key: 'configure', label: 'Configure workspace', svg: configureSvg },
  { key: 'groups',    label: 'Create groups',       svg: groupsSvg },
  { key: 'invite',    label: 'Invite users',        svg: inviteSvg },
]

export default function DashboardPage() {
  const [hideOnboarding, setHideOnboarding] = useState(false)

  return (
    <div className={styles.page}>
      <div className={styles.content}>

        <PageHeader title="Dashboard" />

        <div className={styles.body}>
          <div className={styles.container}>

            <section className={styles.onboarding}>
              <h2 className={styles.greeting}>Hello, Olivia!</h2>

              <div className={styles.steps}>
                <p className={styles.stepsTitle}>Complete a few steps to get started</p>

                <div className={styles.cards}>
                  {STEPS.map(step => (
                    <button
                      key={step.key}
                      type="button"
                      className={styles.card}
                      onClick={() => console.log(step.key)}
                    >
                      <span
                        className={styles.cardIcon}
                        dangerouslySetInnerHTML={{ __html: step.svg }}
                        aria-hidden
                      />
                      <span className={styles.cardLabel}>{step.label}</span>
                    </button>
                  ))}
                </div>

                <Checkbox
                  checked={hideOnboarding}
                  onChange={e => setHideOnboarding(e.target.checked)}
                  label="Do not show this section on the next visit to this page"
                />
              </div>
            </section>

            <div className={styles.emptyCard}>
              <EmptyState
                illustration="calendar"
                title="You have no meetings yet"
                description={<>To start creating meetings, click <strong className={styles.emphasis}>Create</strong></>}
                action={
                  <Button
                    iconLeft={
                      <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: plusSvg }} />
                    }
                    onClick={() => console.log('create meeting')}
                  >
                    Create
                  </Button>
                }
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
