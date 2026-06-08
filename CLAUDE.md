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

### Icons
- **Only from `src/icons/*.ts`** — never create inline SVGs
- Available sets: `actions`, `arrows`, `communication`, `condition`, `dateTime`, `editor`, `functional`, `location`, `navigation`, `users`
- DS icons are `viewBox="0 0 20 20"`, sized by their container

### Token reference
- Spacing: `--space-4` through `--space-72`
- Text: `--text-xs` (12px) `--text-sm` (14px) `--text-base` (15px) `--text-md` (16px) `--text-xl` (32px)
- Radius: `--radius-sm` (4px) `--radius-md` (4px) `--radius-lg` (12px)
- Shadows: `--shadow-100` (dropdowns/popovers), `--shadow-200` (modals only — drawers use border-left, never shadow)

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
```
