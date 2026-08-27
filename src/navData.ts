/* Shared sidebar/page registry for the DS viewer (src/App.tsx) — also consumed
   by the Overview page (src/pages/foundation/Overview.tsx) so its link list can
   never drift from the actual sidebar. */

export type Page =
  | 'foundation/overview'
  | 'foundation/components'
  | 'foundation/colors'
  | 'foundation/branding-colors'
  | 'foundation/typography'
  | 'foundation/icons'
  | 'foundation/illustrations'
  | 'foundation/spacing'
  | 'foundation/elevation'
  | 'foundation/motion'
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
  | 'components/drawer'
  | 'components/drawer-header'
  | 'components/modal'
  | 'components/sticky-footer'
  | 'components/banner'
  | 'components/toast'
  | 'components/side-navigation'
  | 'components/empty-state'
  | 'components/table-cell'
  | 'components/skeleton'

export interface NavItem {
  id:    Page
  label: string
}

export interface NavGroup {
  section: string
  items:   NavItem[]
}

export const nav: NavGroup[] = [
  // Foundation stays on top as the base layer
  {
    section: 'Foundation',
    items: [
      { id: 'foundation/overview',       label: 'Overview' },
      { id: 'foundation/components',     label: 'Components' },
      { id: 'foundation/colors',         label: 'Colors' },
      { id: 'foundation/branding-colors', label: 'Branding colors' },
      { id: 'foundation/elevation',      label: 'Elevation' },
      { id: 'foundation/icons',          label: 'Icons' },
      { id: 'foundation/illustrations',  label: 'Illustrations' },
      { id: 'foundation/motion',         label: 'Motion' },
      { id: 'foundation/spacing',        label: 'Spacing' },
      { id: 'foundation/typography',     label: 'Typography' },
    ],
  },
  // Component sections — sorted A–Z
  {
    section: 'Actions',
    items: [
      { id: 'components/buttons', label: 'Button' },
    ],
  },
  {
    section: 'Alerts',
    items: [
      { id: 'components/banner', label: 'Banner' },
      { id: 'components/toast',  label: 'Toast' },
    ],
  },
  {
    section: 'Controls',
    items: [
      { id: 'components/checkbox',        label: 'Checkbox' },
      { id: 'components/radio',           label: 'Radio' },
      { id: 'components/segment-control', label: 'Segment Control' },
      { id: 'components/toggle',          label: 'Toggle' },
    ],
  },
  {
    section: 'Data Display',
    items: [
      { id: 'components/avatar',        label: 'Avatar' },
      { id: 'components/avatars-group', label: 'Avatars Group' },
      { id: 'components/badge-counter', label: 'Badge Counter' },
      { id: 'components/badge-status',  label: 'Badge Status' },
      { id: 'components/chip',          label: 'Chip' },
      { id: 'components/skeleton',      label: 'Skeleton' },
      { id: 'components/table-cell',    label: 'Table Cell' },
      { id: 'components/tooltip',       label: 'Tooltip' },
    ],
  },
  {
    section: 'Fields',
    items: [
      { id: 'components/autocomplete', label: 'Autocomplete' },
      { id: 'components/date-picker',  label: 'Date Picker' },
      { id: 'components/dropdown',     label: 'Dropdown' },
      { id: 'components/search',       label: 'Search' },
      { id: 'components/text-area',    label: 'Text Area' },
      { id: 'components/text-editor',  label: 'Text Editor' },
      { id: 'components/text-field',   label: 'Text Field' },
    ],
  },
  {
    section: 'Layout',
    items: [
      { id: 'components/drawer',        label: 'Drawer' },
      { id: 'components/drawer-header', label: 'Drawer Header' },
      { id: 'components/empty-state',   label: 'Empty State' },
      { id: 'components/modal',         label: 'Modal' },
      { id: 'components/page-header',   label: 'Page Header' },
      { id: 'components/sticky-footer', label: 'Sticky Footer' },
    ],
  },
  {
    section: 'Navigation',
    items: [
      { id: 'components/breadcrumbs',     label: 'Breadcrumbs' },
      { id: 'components/side-navigation', label: 'Side Navigation' },
      { id: 'components/tabs',            label: 'Tabs' },
    ],
  },
]

export const allPageIds = nav.flatMap(group => group.items.map(item => item.id))

export const DEFAULT_PAGE: Page = 'foundation/overview'

/** Component category groups only — everything in `nav` except Foundation. */
export const componentGroups = nav.filter(group => group.section !== 'Foundation')

/** Relative `?page=` link for a page id, optionally scoped to a category
 *  (`foundation/components&section=Actions`) — used for both sidebar links
 *  and the Overview page's category cards. */
export function pageHref(id: Page, section?: string) {
  return section ? `?page=${id}&section=${encodeURIComponent(section)}` : `?page=${id}`
}

/** Absolute, shareable URL for a page id (origin + current path + ?page=). */
export function pageUrl(id: Page, section?: string) {
  return `${window.location.origin}${window.location.pathname}${pageHref(id, section)}`
}

export function readPageFromLocation(): Page {
  const param = new URLSearchParams(window.location.search).get('page')
  return allPageIds.includes(param as Page) ? (param as Page) : DEFAULT_PAGE
}

/** The optional `section` query param — only meaningful on the Components page. */
export function readSectionFromLocation(): string {
  return new URLSearchParams(window.location.search).get('section') ?? ''
}
