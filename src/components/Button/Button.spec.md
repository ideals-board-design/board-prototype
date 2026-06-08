# Button

## Purpose
Primary interactive element for triggering actions.

## Figma
- File: `IND2QtUbTsYEOMpEefLwCz`
- Component Set: `5761:13093`

## Props
```tsx
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'link'
type ButtonSize    = 'l' | 'm' | 's'
type ButtonIntent  = 'default' | 'danger' | 'info' | 'warning' | 'neutral'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant   // default: 'primary'
  size?:      ButtonSize      // default: 'm'
  intent?:    ButtonIntent    // default: 'default'
  iconLeft?:  ReactNode
  iconRight?: ReactNode
  iconOnly?:  ReactNode       // square button — pass icon, no children
  loading?:   boolean
  href?:      string          // renders as <a>
  external?:  boolean         // link → target="_blank" + noopener
}
```

## Sizes (from Figma variable defs)
| Size | Height      | Padding-H   | Font token  | px  | Weight | Gap         |
|------|-------------|-------------|-------------|-----|--------|-------------|
| S    | --size-s 32px | --space-12  | --text-sm   | 14  | 500    | --space-4   |
| M    | --size-m 40px | --space-16  | --text-base | 15  | 500    | --space-8   |
| L    | --size-l 48px | --space-24  | --text-md   | 16  | 500    | --space-8   |

Icon-only: `width = height` (square), `padding: 0`.

## Border Radius
All variants: `--radius-md` (6px).

## Colors (from Figma variable defs — verified)

### Primary / Default
| State    | Background   | Text        |
|----------|-------------|-------------|
| Active   | --green-500 | --stone-0   |
| Hover    | --green-600 | —           |
| Pressed  | --green-700 | —           |
| Disabled | opacity 0.4 | —           |

### Primary / Danger
| State    | Background  |
|----------|-------------|
| Active   | --red-500   |
| Hover    | --red-600   |
| Pressed  | --red-700   |

### Secondary / Default
| State    | Background          | Border       | Text                 |
|----------|---------------------|--------------|----------------------|
| Active   | --color-bg-surface  | --stone-500  | --color-text-primary |
| Hover    | --color-bg-hover    | --stone-500  | —                    |
| Pressed  | --stone-400         | --stone-500  | —                    |
| Disabled | opacity 0.4         | —            | —                    |

### Secondary / Danger
| State    | Background          | Border      | Text      |
|----------|---------------------|-------------|-----------|
| Active   | --color-bg-surface  | --red-500   | --red-600 |
| Hover    | --red-50            | --red-500   | —         |
| Pressed  | --red-100           | --red-500   | —         |

### Tertiary
Background: transparent. Hover: `--color-bg-hover`. Pressed: `--stone-400`.

| Intent  | Text (active)                                     |
|---------|---------------------------------------------------|
| Default | --green-500                                       |
| Neutral | --color-text-secondary → hover: --color-text-primary |
| Danger  | --red-500                                         |
| Info    | --blue-500                                        |
| Warning | --orange-500                                      |

### Link
| State    | Color       |
|----------|-------------|
| Active   | --green-500 |
| Hover    | --green-600 |
| Pressed  | --green-700 |

Font weight: **400** (Regular — not 500).
Text decoration: `underline`, `text-underline-offset: 2px`.

## Focus State
`outline: 2px solid --color-border-focus; outline-offset: 2px` (focus-visible only).

## Disabled State
`opacity: 0.4; cursor: not-allowed;` on the native disabled attribute.

## Loading State
Shows a 16×16px spinner (`border: 2px solid currentColor; border-top-color: transparent; animation: spin 600ms linear infinite`).
Button is set to `disabled` to block clicks, but CSS overrides opacity back to 1 (`cursor: wait`).

## Icon
Icons wrapped in a 16×16px inline-flex `.icon` span. For S size the icon stays 16px.
