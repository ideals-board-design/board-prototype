# Design System Tokens
> Source of truth for all visual values. LLMs must use only tokens from this file.
> Figma file: `IND2QtUbTsYEOMpEefLwCz` | Colors node: `24446:44118`

## Rules
1. Components use **only Layer 2 aliases** (`aliases.css`) — never raw Layer 1 values
2. No hardcoded hex, px, or rgba in component CSS — only `var(--...)`
3. When adding a new token: add to `tokens.css` first, alias in `aliases.css`, document here

---

## Size Scale
All interactive elements follow this standard:

| Size | Height |
|------|--------|
| S    | 32px   |
| M    | 40px   |
| L    | 48px   |

CSS tokens: `--size-s`, `--size-m`, `--size-l`

---

## Layer 2 — Semantic Aliases (use these in components)

### Text
| Token | Value | Hex |
|-------|-------|-----|
| `--color-text-primary` | stone-1000 | `#1F2129` |
| `--color-text-secondary` | stone-800 | `#5F616A` |
| `--color-text-disabled` | stone-500 | `#BBBDC8` |
| `--color-text-inverse` | stone-0 | `#FFFFFF` |
| `--color-text-brand` | green-500 | `#2C9C74` |
| `--color-text-error` | red-600 | `#DB2F1B` |
| `--color-text-warning` | orange-600 | `#B87900` |
| `--color-text-success` | green-600 | `#1C8269` |
| `--color-text-info` | blue-600 | `#2977CC` |

### Background
| Token | Value | Hex |
|-------|-------|-----|
| `--color-bg-page` | stone-100 | `#FBFBFB` |
| `--color-bg-surface` | stone-0 | `#FFFFFF` |
| `--color-bg-hover` | stone-300 | `#ECEEF9` |
| `--color-bg-selected` | green-25 | `#EBF8EF` |
| `--color-bg-disabled` | stone-200 | `#F7F7F7` |
| `--color-bg-overlay` | stone-1000 @60% | `rgba(31,33,41,0.6)` |

### Brand
| Token | Value | Hex |
|-------|-------|-----|
| `--color-brand` | green-500 | `#2C9C74` |
| `--color-brand-hover` | green-600 | `#1C8269` |
| `--color-brand-active` | green-700 | `#12695C` |
| `--color-brand-subtle` | green-25 | `#EBF8EF` |
| `--color-brand-light` | green-50 | `#CBF1DA` |

### Border
| Token | Value | Hex |
|-------|-------|-----|
| `--color-border` | stone-400 | `#DEE0EB` |
| `--color-border-strong` | stone-500 | `#BBBDC8` |
| `--color-border-focus` | green-500 | `#2C9C74` |
| `--color-border-error` | red-500 | `#E95B4A` |
| `--color-border-disabled` | stone-300 | `#ECEEF9` |

### Semantic States
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success-bg` | `#EBF8EF` | Success banner/badge bg |
| `--color-success` | `#2C9C74` | Success icon/text |
| `--color-success-bold` | `#1C8269` | Success bold text |
| `--color-error-bg` | `#FAD9D6` | Error banner/badge bg |
| `--color-error` | `#E95B4A` | Error icon/border |
| `--color-error-bold` | `#DB2F1B` | Error text |
| `--color-warning-bg` | `#FFEBD5` | Warning banner/badge bg |
| `--color-warning` | `#D18A00` | Warning icon |
| `--color-warning-bold` | `#B87900` | Warning text |
| `--color-info-bg` | `#E6F2FD` | Info banner/badge bg |
| `--color-info` | `#5DA3EF` | Info icon |
| `--color-info-bold` | `#2977CC` | Info text |
| `--color-highlight-bg` | `#FFF4B4` | Highlight background |
| `--color-highlight` | `#FFE448` | Highlight color |

---

## Spacing
| Token | Value |
|-------|-------|
| `--space-2` | 2px |
| `--space-4` | 4px |
| `--space-6` | 6px |
| `--space-8` | 8px |
| `--space-10` | 10px |
| `--space-12` | 12px |
| `--space-14` | 14px |
| `--space-16` | 16px |
| `--space-20` | 20px |
| `--space-24` | 24px |
| `--space-32` | 32px |
| `--space-40` | 40px |
| `--space-48` | 48px |

---

## Typography
| Token | Size | Line-height |
|-------|------|-------------|
| `--text-xxl` | 40px | 48px |
| `--text-xl` | 32px | 40px |
| `--text-lg` | 20px | 24px |
| `--text-md` | 16px | 20px |
| `--text-base` | 15px | 20px |
| `--text-sm` | 14px | 20px |
| `--text-xs` | 12px | 16px |

Font: `--font-family` → Inter
Weights: `--font-weight-regular` (400), `--font-weight-medium` (500), `--font-weight-semibold` (600), `--font-weight-bold` (700)

### Letter Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `--letter-spacing-heading` | 0.01em | xxl / xl / lg (40/32/20px) |
| `--letter-spacing-body` | 0em | All body text (16px and below) |
| `--letter-spacing-upper` | 0.04em | Uppercase variants |

### Text Styles (Figma node 17657:100460)
| Figma Name | Size token | LH token | Weight | LS |
|------------|-----------|----------|--------|----|
| Xx Large Default | `--text-xxl` (40px) | 48px | Medium (500) | 0.01em |
| X Large Default | `--text-xl` (32px) | 40px | Medium (500) | 0.01em |
| Large Default | `--text-lg` (20px) | 24px | Medium (500) | 0.01em |
| Body Default | `--text-md` (16px) | 20px | Regular (400) | 0 |
| Body Bold | `--text-md` (16px) | 20px | Medium (500) | 0 |
| Medium Default | `--text-base` (15px) | 20px | Regular (400) | 0 |
| Medium Bold | `--text-base` (15px) | 20px | Medium (500) | 0 |
| Small Default | `--text-sm` (14px) | 20px | Regular (400) | 0 |
| Small Bold | `--text-sm` (14px) | 20px | Medium (500) | 0 |
| Small Upper | `--text-sm` (14px) | 20px | Regular (400) | uppercase + 0.04em |
| X Small Default | `--text-xs` (12px) | 16px | Regular (400) | 0 |
| X Small Upper | `--text-xs` (12px) | 16px | Regular (400) | uppercase + 0.04em |

> ⚠️ Figma "Bold" = CSS `font-weight: 500` (Medium), NOT 700. Link styles = Regular + `text-decoration: underline`.

---

## Border Radius
| Token | Value | Note |
|-------|-------|------|
| `--radius-sm` | 4px | Small elements |
| `--radius-md` | **6px** | Default — ⚠️ NOT 8px |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows
| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-100` | `0px 2px 8px rgba(0,0,0,0.12)` | Popovers, dropdowns |
| `--shadow-200` | `0px 4px 24px rgba(0,0,0,0.16)` | Modals |

---

## Transitions
| Token | Value |
|-------|-------|
| `--transition-fast` | 100ms ease |
| `--transition-normal` | 200ms ease |
| `--transition-slow` | 300ms ease |

---

## Layer 1 — Primitive Palette (reference only)

### Stone (Neutral)
`#FFFFFF` → `#FBFBFB` → `#F7F7F7` → `#ECEEF9` → `#DEE0EB` → `#BBBDC8` → `#9C9EA8` → `#73757F` → `#5F616A` → `#40424B` → `#1F2129`
(stone-0 through stone-1000)

### Green (Brand)
`#EBF8EF`(25) → `#CBF1DA`(50) → `#8CEAA7`(100) → `#7FDEA5`(200) → `#57D188`(300) → `#3FB67D`(400) → **`#2C9C74`(500)** → `#1C8269`(600) → `#12695C`(700) → `#084D4B`(800) → `#022E34`(900)

### Red (Error)
`#FAD9D6`(50) → `#FACCC8`(100) → `#F6BCB5`(200) → `#E95B4A`(500) → `#DB2F1B`(600) → `#AF2615`(700)

### Orange (Warning)
`#FFEBD5`(50) → `#D18A00`(500) → `#B87900`(600) → `#9E6800`(700)

### Yellow (Highlight)
`#FFF4B4`(50) → `#FFE448`(500) → `#FFDA07`(600) → `#F1C400`(700)

### Blue (Info)
`#E6F2FD`(50) → `#5DA3EF`(500) → `#2977CC`(600) → `#2468B2`(700)
