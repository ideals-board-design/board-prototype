/* PageHeader — Figma nodes 30455-16481 (Default), 9822-92904 (Meeting), 30455-21449 (Documents) */

import { type ReactNode } from 'react'
import { Button }  from '../Button/Button'
import { Tooltip } from '../Tooltip/Tooltip'
import { arrows }  from '../../icons/arrows'
import styles from './PageHeader.module.css'

const angleLeftSvg   = arrows.find(i => i.name === 'angle-left-b')!.svg
const chevronDownSvg = arrows.find(i => i.name === 'angle-down-fill')!.svg

export interface PageHeaderProps {
  /** Page title. Omit when using `breadcrumbs`. */
  title?:       string
  /** Shows a back button before the title (Meeting layout). */
  onBack?:      () => void
  /** Shows a dropdown chevron after the title (title switcher). */
  onTitleMenu?: () => void
  /** Status badge shown after the title. */
  badge?:       ReactNode
  /** Trailing inline action buttons (icon buttons). */
  actions?:     ReactNode
  /** Breadcrumb trail — renders the Documents layout in place of the title. */
  breadcrumbs?: ReactNode
  className?:   string
}

export function PageHeader({
  title,
  onBack,
  onTitleMenu,
  badge,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  /* Padding/gap follow the leading content (Figma types). */
  const typeCls = breadcrumbs ? styles.typeDocuments : onBack ? styles.typeMeeting : styles.typeDefault
  const cls = [styles.header, typeCls, className].filter(Boolean).join(' ')

  if (breadcrumbs) {
    return <header className={cls}>{breadcrumbs}</header>
  }

  return (
    <header className={cls}>
      {onBack && (
        <Tooltip label="Back" position="bottom">
          <Button
            variant="tertiary"
            intent="neutral"
            size="m"
            iconOnly={
              <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: angleLeftSvg }} />
            }
            onClick={onBack}
            aria-label="Go back"
          />
        </Tooltip>
      )}

      {title !== undefined && (
        onTitleMenu ? (
          <button type="button" className={styles.titleMenu} onClick={onTitleMenu} aria-haspopup="menu">
            <h1 className={styles.title}>{title}</h1>
            <span
              className={styles.chevron}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: chevronDownSvg }}
            />
          </button>
        ) : (
          <h1 className={styles.title}>{title}</h1>
        )
      )}

      {badge}

      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}

export default PageHeader
