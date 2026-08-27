/* Overview — landing page for the DS viewer. A grid of big cards: one per
   Foundation page, plus one for the full Components directory. */

import { type Page } from '../../navData'
import { actions } from '../../icons/actions'
import { editor } from '../../icons/editor'
import { files } from '../../icons/files'
import { functional } from '../../icons/functional'
import { media } from '../../icons/media'
import { condition } from '../../icons/condition'
import styles from './Overview.module.css'

const icon = (set: { name: string; svg: string }[], name: string) =>
  set.find(i => i.name === name)!.svg

interface OverviewCard {
  id:    Page
  title: string
  desc:  string
  icon:  string
}

const CARDS: OverviewCard[] = [
  { id: 'foundation/colors',         title: 'Colors',          desc: 'Neutral and semantic color tokens.',                    icon: icon(actions, 'circle--fill') },
  { id: 'foundation/components',     title: 'Components',      desc: 'Every component, searchable with its shareable URL.',   icon: icon(editor, 'web-grid-alt') },
  { id: 'foundation/branding-colors', title: 'Branding colors', desc: 'Accent theming across nine brand schemes.',            icon: icon(actions, 'sparkles') },
  { id: 'foundation/elevation',      title: 'Elevation',       desc: 'Shadow and border tokens for floating surfaces.',       icon: icon(files, 'thumbnails') },
  { id: 'foundation/icons',          title: 'Icons',           desc: 'The full icon set, by category.',                      icon: icon(functional, 'star') },
  { id: 'foundation/illustrations',  title: 'Illustrations',   desc: 'Empty-state and placeholder artwork.',                 icon: icon(files, 'image') },
  { id: 'foundation/motion',         title: 'Motion',          desc: 'Duration, easing, and motion patterns.',               icon: icon(media, 'play-circle') },
  { id: 'foundation/spacing',        title: 'Spacing',         desc: 'The space scale, from 4px to 72px.',                   icon: icon(editor, 'divider') },
  { id: 'foundation/typography',     title: 'Typography',      desc: 'Type scale, weights, and line heights.',               icon: icon(condition, 'paragraph') },
]

export interface OverviewProps {
  /** Navigate the DS viewer to another page (provided by App). */
  onNavigate?: (page: Page) => void
}

export default function Overview({ onNavigate }: OverviewProps) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Overview</h1>

      <div className={styles.grid}>
        {CARDS.map(card => (
          <button
            key={card.id}
            type="button"
            className={styles.card}
            onClick={() => onNavigate?.(card.id)}
          >
            <span className={styles.cardIcon} dangerouslySetInnerHTML={{ __html: card.icon }} aria-hidden="true" />
            <span className={styles.cardTitle}>{card.title}</span>
            <span className={styles.cardDesc}>{card.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
