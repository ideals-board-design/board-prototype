# Board — Project Guide for Claude

## Overview

Two apps share one codebase:

| App | Entry | URL | Purpose |
|-----|-------|-----|---------|
| Hub / landing | `board.html` → `src/hub/main.tsx` | `localhost:5173/board.html` | Feature registry + links |
| DS viewer | `index.html` → `src/main.tsx` | `localhost:5173/` | Component showcase |
| Tasks | `tasks.html` → `src/app/main.tsx` | `localhost:5173/tasks.html` | Tasks feature page |

Both share: `src/components/`, `src/styles/`, `src/icons/`, `src/illustrations/`.

---

## Project Structure

```
src/
├── components/          ← DS components (35 components, do NOT modify unless DS work)
├── styles/              ← Design tokens (tokens.css, aliases.css, global.css)
├── icons/               ← DS icon set (actions, arrows, functional, etc.)
├── illustrations/       ← DS illustrations
│
├── pages/               ← DS viewer pages (component showcases)
├── App.tsx              ← DS viewer shell
├── main.tsx             ← DS viewer entry
│
└── app/                 ← Product app (feature code lives here)
    ├── App.tsx          ← Product shell (SideNavigation + router)
    ├── App.module.css
    ├── main.tsx
    └── features/        ← One folder per product feature
        └── dashboard/
            ├── DashboardPage.tsx
            └── DashboardPage.module.css
```

---

## How to Add a New Feature Page

### 1. Create the page

```
src/app/features/<feature-name>/
├── <FeatureName>Page.tsx
└── <FeatureName>Page.module.css
```

### 2. Register the route in `src/app/App.tsx`

```tsx
// Add to AppPage type:
type AppPage = NavMenuItemKey  // uses existing nav keys: 'dashboard' | 'directory' | ...

// Add import:
import <FeatureName>Page from './features/<feature-name>/<FeatureName>Page'

// Add render:
{page === '<feature-name>' && <<FeatureName>Page />}
```

### 3. Available nav keys (from SideNavigation DEFAULT_NAV_ITEMS)

`search` | `dashboard` | `meetings` | `tasks` | `documents` | `directory` | `reports` | `settings` | `help`

---

## Import Paths (from inside `src/app/`)

```tsx
// DS components
import { Button } from '../components/Button/Button'
import { TextField } from '../components/TextField/TextField'
import { SideNavigation } from '../components/SideNavigation/SideNavigation'
// ... same pattern for all 35 components

// Icons (MANDATORY — never create custom SVGs)
import { functional } from '../icons/functional'
import { actions } from '../icons/actions'
// Render: <span dangerouslySetInnerHTML={{ __html: icon.svg }} />

// CSS tokens are global — no import needed, just use var(--...)
```

---

## Mandatory Rules

### Styling
- **Only use CSS custom properties**: `var(--space-8)`, `var(--color-text-primary)`, etc.
- **Never hardcode values**: no `#1F2129`, no `14px`, no `8px` directly
- **All styles via CSS Modules** (`.module.css` files)
- **Component heights**: S=32px, M=40px, L=48px (via padding, not height property)
- **Tertiary icon-button spacing**: adjacent tertiary icon buttons (in field trailing slots, table action cells, toolbars, headers, row-hover actions, calendar nav — anywhere two or more sit together) are separated by exactly **2px** — set `gap: var(--space-2)` on the container. This is the single source of truth; never use 0px "abut" spacing or ad-hoc gaps (12/16px) between them. Does not apply to a text button sitting next to an icon button (e.g. Banner action + dismiss).
- **Elevation → shadow always, +border ring in dark**: every floating/elevated surface (dropdown, menu, popover, modal, autocomplete/search panel, calendar, toast, workspace switcher, etc.) MUST set its shadow via `box-shadow: var(--elevation-100)` (or `--elevation-200` for modals) — never the raw `--shadow-*` tokens. Light mode = the drop shadow. Dark mode = the **same drop shadow** (colour not inverted) **plus** a 1px divider ring (`0 0 0 1px var(--color-border)`) so the surface edge reads on dark. Defined once in `aliases.css`; do not re-implement per component.

### Icons
- **Only from `src/icons/*.ts`** — never create inline SVGs
- Available sets: `actions`, `arrows`, `communication`, `condition`, `dateTime`, `editor`, `functional`, `location`, `navigation`, `users`
- DS icons are `viewBox="0 0 20 20"`, sized by their container

### Token reference
- Spacing: `--space-4` through `--space-72`
- Text: `--text-xs` (12px) `--text-sm` (14px) `--text-base` (15px) `--text-md` (16px) `--text-xl` (32px)
- Radius: `--radius-sm` (4px) `--radius-md` (4px) `--radius-lg` (12px)
- Elevation: `--elevation-100` (dropdowns/popovers/menus), `--elevation-200` (modals). Light = drop shadow, dark = 1px `--color-border` ring. Raw `--shadow-100/200` are the light-mode source values only — reference `--elevation-*`, not these. Drawers use border-left, never shadow.

---

## DS Components Available

Button, TextField, TextArea, Dropdown, Search (Autocomplete), Checkbox, RadioButton,
Toggle, SegmentControl, Tabs, DatePicker, Avatar, AvatarsGroup, Chip, BadgeCounter,
BadgeStatus, Tooltip, Breadcrumbs, PageHeader, DrawerHeader, Modal, StickyFooter,
Banner, Toast, ToastContainer, SideNavigation, SideNavigationItem, WorkspaceSwitcher,
SideNavUserItem, Pagination (if exists), ProgressBar, Stepper, Autosave

Each at: `src/components/<ComponentName>/<ComponentName>.tsx`

---

## Dev Commands

```bash
npm run dev      # starts both apps (localhost:5173)
npm run build    # builds both entry points
npm run verify   # typecheck + eslint + stylelint — MUST pass before finishing
```

`npm run verify` is the guardrail that enforces the Mandatory Rules above as machine errors:
- **Stylelint** rejects `var(--token)` references to tokens that don't exist (catches silent fallbacks) and hardcoded colours (use a semantic colour token).
- **ESLint** rejects inline `<svg>` JSX (icons/illustrations must come from `src/icons` / `src/illustrations`).
Run it before finishing any change; it must come back clean.
