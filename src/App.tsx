import { useState } from 'react'
import { HubHeader } from './hub/HubHeader'
import styles from './App.module.css'
import ColorsPage from './pages/foundation/Colors'
import TypographyPage from './pages/foundation/Typography'
import IconsPage from './pages/foundation/Icons'
import IllustrationsPage from './pages/foundation/Illustrations'
import SpacingPage from './pages/foundation/Spacing'
import ElevationPage from './pages/foundation/Elevation'
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
import ModalPage from './pages/components/ModalPage'
import StickyFooterPage from './pages/components/StickyFooterPage'
import BannerPage from './pages/components/BannerPage'
import ToastPage  from './pages/components/ToastPage'
import SideNavigationPage from './pages/components/SideNavigationPage'
import EmptyStatePage from './pages/components/EmptyStatePage'
import TableCellPage from './pages/components/TableCellPage'

type Page =
  | 'foundation/colors'
  | 'foundation/typography'
  | 'foundation/icons'
  | 'foundation/illustrations'
  | 'foundation/spacing'
  | 'foundation/elevation'
  | 'components/buttons'
  | 'components/breadcrumbs'
  | 'components/checkbox'
  | 'components/radio'
  | 'components/tabs'
  | 'components/segment-control'
  | 'components/toggle'
  | 'components/text-field'
  | 'components/text-area'
  | 'components/text-editor'
  | 'components/tooltip'
  | 'components/dropdown'
  | 'components/autocomplete'
  | 'components/search'
  | 'components/avatar'
  | 'components/avatars-group'
  | 'components/date-picker'
  | 'components/badge-counter'
  | 'components/badge-status'
  | 'components/chip'
  | 'components/page-header'
  | 'components/drawer-header'
  | 'components/modal'
  | 'components/sticky-footer'
  | 'components/banner'
  | 'components/toast'
  | 'components/side-navigation'
  | 'components/empty-state'
  | 'components/table-cell'

const nav = [
  // Foundation stays on top as the base layer
  {
    section: 'Foundation',
    items: [
      { id: 'foundation/colors' as Page,        label: 'Colors' },
      { id: 'foundation/elevation' as Page,     label: 'Elevation' },
      { id: 'foundation/icons' as Page,         label: 'Icons' },
      { id: 'foundation/illustrations' as Page, label: 'Illustrations' },
      { id: 'foundation/spacing' as Page,       label: 'Spacing' },
      { id: 'foundation/typography' as Page,    label: 'Typography' },
    ],
  },
  // Component sections — sorted A–Z
  {
    section: 'Actions',
    items: [
      { id: 'components/buttons' as Page, label: 'Button' },
    ],
  },
  {
    section: 'Alerts',
    items: [
      { id: 'components/banner' as Page, label: 'Banner' },
      { id: 'components/toast' as Page,  label: 'Toast' },
    ],
  },
  {
    section: 'Controls',
    items: [
      { id: 'components/checkbox' as Page,        label: 'Checkbox' },
      { id: 'components/radio' as Page,           label: 'Radio' },
      { id: 'components/segment-control' as Page, label: 'Segment Control' },
      { id: 'components/toggle' as Page,          label: 'Toggle' },
    ],
  },
  {
    section: 'Data Display',
    items: [
      { id: 'components/avatar' as Page,        label: 'Avatar' },
      { id: 'components/avatars-group' as Page, label: 'Avatars Group' },
      { id: 'components/badge-counter' as Page, label: 'Badge Counter' },
      { id: 'components/badge-status' as Page,  label: 'Badge Status' },
      { id: 'components/chip' as Page,          label: 'Chip' },
      { id: 'components/table-cell' as Page,    label: 'Table Cell' },
      { id: 'components/tooltip' as Page,       label: 'Tooltip' },
    ],
  },
  {
    section: 'Fields',
    items: [
      { id: 'components/autocomplete' as Page, label: 'Autocomplete' },
      { id: 'components/date-picker' as Page,  label: 'Date Picker' },
      { id: 'components/dropdown' as Page,     label: 'Dropdown' },
      { id: 'components/search' as Page,       label: 'Search' },
      { id: 'components/text-area' as Page,    label: 'Text Area' },
      { id: 'components/text-editor' as Page,  label: 'Text Editor' },
      { id: 'components/text-field' as Page,   label: 'Text Field' },
    ],
  },
  {
    section: 'Layout',
    items: [
      { id: 'components/drawer-header' as Page, label: 'Drawer Header' },
      { id: 'components/empty-state' as Page,   label: 'Empty State' },
      { id: 'components/modal' as Page,         label: 'Modal' },
      { id: 'components/page-header' as Page,   label: 'Page Header' },
      { id: 'components/sticky-footer' as Page, label: 'Sticky Footer' },
    ],
  },
  {
    section: 'Navigation',
    items: [
      { id: 'components/breadcrumbs' as Page,     label: 'Breadcrumbs' },
      { id: 'components/side-navigation' as Page, label: 'Side Navigation' },
      { id: 'components/tabs' as Page,            label: 'Tabs' },
    ],
  },
]

function NavItem({ id, label, active, indent, onClick }: {
  id: Page; label: string; active: boolean; indent?: boolean; onClick: () => void
}) {
  return (
    <button
      className={[
        styles.navItem,
        active  ? styles.navItemActive : '',
        indent  ? styles.navSubItem    : '',
      ].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('foundation/colors')

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
                indent={'indent' in item ? item.indent : false}
                onClick={() => setPage(item.id)}
              />
            ))}
          </div>
        ))}
      </aside>

      <main className={styles.main}>
        {page === 'foundation/colors'         && <ColorsPage />}
        {page === 'foundation/typography'     && <TypographyPage />}
        {page === 'foundation/spacing'        && <SpacingPage />}
        {page === 'foundation/elevation'      && <ElevationPage />}
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
        {page === 'components/drawer-header'   && <DrawerHeaderPage />}
        {page === 'components/modal'           && <ModalPage />}
        {page === 'components/sticky-footer'   && <StickyFooterPage />}
        {page === 'components/banner'          && <BannerPage />}
        {page === 'components/toast'           && <ToastPage />}
        {page === 'components/side-navigation'    && <SideNavigationPage />}
        {page === 'components/empty-state'        && <EmptyStatePage />}
        {page === 'components/table-cell'         && <TableCellPage />}
      </main>
      </div>

    </div>
  )
}
