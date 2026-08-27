import { useEffect, useState } from 'react'
import { HubHeader } from './hub/HubHeader'
import styles from './App.module.css'
import { type Page, nav, pageHref, readPageFromLocation, readSectionFromLocation } from './navData'
import OverviewPage from './pages/foundation/Overview'
import ComponentsPage from './pages/foundation/Components'
import ColorsPage from './pages/foundation/Colors'
import BrandingColorsPage from './pages/foundation/BrandingColors'
import TypographyPage from './pages/foundation/Typography'
import IconsPage from './pages/foundation/Icons'
import IllustrationsPage from './pages/foundation/Illustrations'
import SpacingPage from './pages/foundation/Spacing'
import ElevationPage from './pages/foundation/Elevation'
import MotionPage from './pages/foundation/Motion'
import ButtonsPage from './pages/components/Buttons'
import BreadcrumbsPage from './pages/components/BreadcrumbsPage'
import CheckboxPage from './pages/components/CheckboxPage'
import RadioPage from './pages/components/RadioPage'
import TabsPage from './pages/components/TabsPage'
import SegmentControlPage from './pages/components/SegmentControlPage'
import TogglePage from './pages/components/TogglePage'
import TextFieldPage from './pages/components/TextFieldPage'
import TextAreaPage from './pages/components/TextAreaPage'
import TextEditorPage from './pages/components/TextEditorPage'
import TooltipPage from './pages/components/TooltipPage'
import DropdownPage from './pages/components/DropdownPage'
import AutocompletePage from './pages/components/AutocompletePage'
import { SearchPage } from './pages/components/SearchPage'
import AvatarPage from './pages/components/AvatarPage'
import AvatarsGroupPage from './pages/components/AvatarsGroupPage'
import DatePickerPage from './pages/components/DatePickerPage'
import BadgeCounterPage from './pages/components/BadgeCounterPage'
import BadgeStatusPage from './pages/components/BadgeStatusPage'
import ChipPage from './pages/components/ChipPage'
import PageHeaderPage from './pages/components/PageHeaderPage'
import DrawerHeaderPage from './pages/components/DrawerHeaderPage'
import DrawerPage from './pages/components/DrawerPage'
import ModalPage from './pages/components/ModalPage'
import StickyFooterPage from './pages/components/StickyFooterPage'
import BannerPage from './pages/components/BannerPage'
import ToastPage  from './pages/components/ToastPage'
import SideNavigationPage from './pages/components/SideNavigationPage'
import NavigationPatternsPage from './pages/components/NavigationPatternsPage'
import EmptyStatePage from './pages/components/EmptyStatePage'
import TableCellPage from './pages/components/TableCellPage'
import SkeletonPage from './pages/components/SkeletonPage'

function NavItem({ id, label, active, indent, onNavigate }: {
  id: Page; label: string; active: boolean; indent?: boolean; onNavigate: (id: Page) => void
}) {
  return (
    <a
      href={pageHref(id)}
      className={[
        styles.navItem,
        active  ? styles.navItemActive : '',
        indent  ? styles.navSubItem    : '',
      ].filter(Boolean).join(' ')}
      onClick={e => {
        // Let cmd/ctrl/shift/middle-click open in a new tab as normal.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        onNavigate(id)
      }}
    >
      {label}
    </a>
  )
}

export default function App() {
  const [page, setPage]       = useState<Page>(readPageFromLocation)
  const [section, setSection] = useState<string>(readSectionFromLocation)

  /** Navigate to a page — `section` only matters for the Components page,
   *  where it pre-filters the table (e.g. from an Overview category card). */
  const navigate = (id: Page, nextSection?: string) => {
    if (id !== page || nextSection !== section) {
      window.history.pushState({}, '', pageHref(id, nextSection))
      setPage(id)
      setSection(nextSection ?? '')
    }
  }

  useEffect(() => {
    const onPopState = () => {
      setPage(readPageFromLocation())
      setSection(readSectionFromLocation())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return (
    <div className={styles.shell}>

      <HubHeader activePage="design-system" />

      <div className={styles.body}>
        <aside className={styles.sidebar}>
        {nav.map(group => (
          <div key={group.section} className={styles.navGroup}>
            <div className={styles.navSection}>{group.section}</div>
            {group.items.map(item => (
              <NavItem
                key={item.id}
                id={item.id}
                label={item.label}
                active={page === item.id}
                indent={false}
                onNavigate={navigate}
              />
            ))}
          </div>
        ))}
      </aside>

      <main className={styles.main}>
        {page === 'foundation/overview'       && <OverviewPage onNavigate={navigate} />}
        {page === 'foundation/components'     && <ComponentsPage initialSection={section} onNavigate={navigate} />}
        {page === 'foundation/colors'         && <ColorsPage />}
        {page === 'foundation/branding-colors' && <BrandingColorsPage />}
        {page === 'foundation/typography'     && <TypographyPage />}
        {page === 'foundation/spacing'        && <SpacingPage />}
        {page === 'foundation/elevation'      && <ElevationPage />}
        {page === 'foundation/motion'         && <MotionPage />}
        {page === 'foundation/icons'          && <IconsPage />}
        {page === 'foundation/illustrations'  && <IllustrationsPage />}
        {page === 'components/buttons'        && <ButtonsPage />}
        {page === 'components/breadcrumbs'    && <BreadcrumbsPage />}
        {page === 'components/checkbox'       && <CheckboxPage />}
        {page === 'components/radio'          && <RadioPage />}
        {page === 'components/tabs'           && <TabsPage />}
        {page === 'components/segment-control' && <SegmentControlPage />}
        {page === 'components/toggle'          && <TogglePage />}
        {page === 'components/text-field'      && <TextFieldPage />}
        {page === 'components/text-area'        && <TextAreaPage />}
        {page === 'components/text-editor'     && <TextEditorPage />}
        {page === 'components/tooltip'         && <TooltipPage />}
        {page === 'components/dropdown'        && <DropdownPage />}
        {page === 'components/autocomplete'    && <AutocompletePage />}
        {page === 'components/search'          && <SearchPage />}
        {page === 'components/avatar'          && <AvatarPage />}
        {page === 'components/avatars-group'   && <AvatarsGroupPage />}
        {page === 'components/date-picker'     && <DatePickerPage />}
        {page === 'components/badge-counter'   && <BadgeCounterPage />}
        {page === 'components/badge-status'    && <BadgeStatusPage />}
        {page === 'components/chip'            && <ChipPage />}
        {page === 'components/page-header'     && <PageHeaderPage />}
        {page === 'components/drawer'          && <DrawerPage />}
        {page === 'components/drawer-header'   && <DrawerHeaderPage />}
        {page === 'components/modal'           && <ModalPage />}
        {page === 'components/sticky-footer'   && <StickyFooterPage />}
        {page === 'components/banner'          && <BannerPage />}
        {page === 'components/toast'           && <ToastPage />}
        {page === 'components/side-navigation'    && <SideNavigationPage />}
        {page === 'components/navigation-patterns' && <NavigationPatternsPage />}
        {page === 'components/empty-state'        && <EmptyStatePage />}
        {page === 'components/table-cell'         && <TableCellPage />}
        {page === 'components/skeleton'           && <SkeletonPage />}
      </main>
      </div>

    </div>
  )
}
