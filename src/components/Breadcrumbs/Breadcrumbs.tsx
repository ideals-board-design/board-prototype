import { Fragment } from 'react'
import styles from './Breadcrumbs.module.css'
import { arrows } from '../../icons/arrows'

const separatorSvg = arrows.find(i => i.name === 'angle-right-fill')!.svg

export type BreadcrumbItem = {
  label: string
  href?: string
  onClick?: () => void
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  size?: 'l' | 'm'
  className?: string
}

export function Breadcrumbs({ items, size = 'm', className }: BreadcrumbsProps) {
  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className={`${styles.breadcrumbs} ${size === 'l' ? styles.sizeL : styles.sizeM}`}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <Fragment key={idx}>
              {idx > 0 && (
                <li className={styles.separator} aria-hidden="true">
                  <span className={styles.separatorIcon} dangerouslySetInnerHTML={{ __html: separatorSvg }} />
                </li>
              )}
              <li>
                {isLast ? (
                  <span className={`${styles.crumb} ${styles.active}`} aria-current="page">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a href={item.href} className={styles.crumb}>
                    {item.label}
                  </a>
                ) : (
                  <button type="button" className={styles.crumb} onClick={item.onClick}>
                    {item.label}
                  </button>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
