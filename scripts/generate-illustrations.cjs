/**
 * Generates src/illustrations/illustrations.ts from the SVG archive.
 * Run: node scripts/generate-illustrations.cjs
 */

const fs   = require('fs')
const path = require('path')

const SRC_DIR = '/Users/jaroslav.getman/Documents/DS assets/Illustrations pack for dark supported'
const OUT_DIR = path.join(__dirname, '../src/illustrations')

// ── Colour tokenisation ─────────────────────────────────────────────────────
// Map the Figma illustration palette (light-mode hex) → semantic tokens so the
// injected SVGs flip in dark mode (fills render via dangerouslySetInnerHTML, so
// fill="var(--token)" resolves against the active [data-theme]).
//   • Special palette  → --illustration-* (own per-mode retargeting)
//   • white (paper + on-fill marks) → --illustration-stone-0 (darkens in dark)
//   • out-of-palette warning orange → --orange-500 (also flips)
// Keys are lower-case; matched case-insensitively. feColorMatrix shadow values
// are decimals, not fill/stroke, so they are left untouched.
const COLOR_MAP = {
  '#cbf1da': '--illustration-green-50',
  '#8ceaa7': '--illustration-green-100',
  '#7fdea5': '--illustration-green-200',
  '#57d188': '--illustration-green-300',
  '#3fb67d': '--illustration-green-400',
  '#2c9c74': '--illustration-green-500',
  '#f7f7f7': '--illustration-stone-200',
  '#dee0eb': '--illustration-stone-400',
  '#bbbdc8': '--illustration-stone-500',
  '#9c9ea8': '--illustration-stone-600',
  '#d18a00': '--orange-500',
}

// White is context-dependent: paper/card surfaces darken in dark mode
// (--illustration-stone-0), but glyphs drawn on top of a badge/holder must stay
// light (--color-icon-inverse). BADGE_FILLS are the holder colours: green-500 =
// badge circles / check chips; #D18A00 = the warning triangle. Large green
// SURFACES (folder fronts, envelope flaps — green-200/400) are NOT badges, so
// white on them is treated as paper.
const BADGE_FILLS = {
  '#2c9c74': '--illustration-green-500',
  '#d18a00': '--orange-500',
}
const WHITE = new Set(['white', '#ffffff'])

// Glyphs that sit on a large green SURFACE (not a badge) so the heuristic can't
// detect them — forced to inverse-icon by unique path signature.
const FORCE_INVERSE_ICON = [
  'M87.53 76.85', // folder-no-results "?" on the green folder front
]

// Paper surfaces the badge heuristic wrongly caught as on-green glyphs (they
// directly follow a green fill) — forced back to paper so they darken in dark.
const FORCE_PAPER = [
  'M127.779 92.4068', // folder-no-documents ghost document behind the folder
]

const unmapped = new Set()

// Stateful, document-order colour tokenisation.
function tokeniseColors(svg) {
  let onBadge = false
  svg = svg.replace(/(fill|stroke)="([^"]+)"/gi, (match, attr, value) => {
    const key = value.trim().toLowerCase()
    if (key === 'none') return match // neutral — preserve badge context
    if (BADGE_FILLS[key]) {
      onBadge = true
      return `${attr}="var(${BADGE_FILLS[key]})"`
    }
    if (WHITE.has(key)) {
      // stays on the badge run; consecutive whites keep the context
      return `${attr}="var(${onBadge ? '--color-icon-inverse' : '--illustration-stone-0'})"`
    }
    onBadge = false
    const token = COLOR_MAP[key]
    if (token) return `${attr}="var(${token})"`
    if (/^#[0-9a-f]{3,8}$/i.test(key)) unmapped.add(value.trim().toUpperCase())
    return match
  })
  // Structural overrides for glyphs the badge heuristic can't reach.
  for (const sig of FORCE_INVERSE_ICON) {
    const escaped = sig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(d="${escaped}[^"]*"[^>]*?fill=")var\\(--illustration-stone-0\\)"`, 'g')
    svg = svg.replace(re, '$1var(--color-icon-inverse)"')
  }
  // ...and paper the heuristic wrongly caught as on-green glyphs.
  for (const sig of FORCE_PAPER) {
    const escaped = sig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(d="${escaped}[^"]*"[^>]*?fill=")var\\(--color-icon-inverse\\)"`, 'g')
    svg = svg.replace(re, '$1var(--illustration-stone-0)"')
  }

  // On-green CONTENT (semi-transparent lines / bars on a green card) should read
  // as paper and adapt in dark — unlike the opaque glyphs (checkmark, play,
  // avatar) which stay inverse. Distinguisher: opacity < 1. Handle both attr
  // orders (opacity before or after fill).
  svg = svg
    .replace(/(opacity="0\.\d+"[^>]*?fill=")var\(--color-icon-inverse\)"/g, '$1var(--illustration-stone-0)"')
    .replace(/(fill=")var\(--color-icon-inverse\)"([^>]*?opacity="0\.\d+")/g, '$1var(--illustration-stone-0)"$2')

  // Ground-shadow ellipses: uniform 10% opacity, colour kept as the token so it
  // ADAPTS — in dark it resolves to a darker stone (a subtle shadow) instead of
  // a bright light-grey halo. (Only shadow ellipses use stone-500; content = green.)
  svg = svg.replace(
    /(<ellipse )opacity="[0-9.]+"([^>]*?fill="var\(--illustration-stone-500\)")/g,
    '$1opacity="0.1"$2',
  )

  return svg
}

// ── SVG processing ────────────────────────────────────────────────────────────

function processSvg(raw) {
  let svg = raw.trim()

  // Remove XML declaration if present
  svg = svg.replace(/<\?xml[^>]*\?>\s*/g, '')

  // Remove width/height attrs from <svg> tag so CSS controls sizing
  svg = svg.replace(/(<svg[^>]*)\s+width="[^"]*"/, '$1')
  svg = svg.replace(/(<svg[^>]*)\s+height="[^"]*"/, '$1')

  // Remove id attr from root <svg> only — internal ids (filter, clipPath) must stay
  // so that url(#...) references inside the SVG keep working
  svg = svg.replace(/(<svg[^>]*)\s+id="[^"]*"/, '$1')

  // Tokenise fill/stroke colours (paper vs on-badge glyph, unmapped tracking)
  svg = tokeniseColors(svg)

  // Drop-shadow flood colours must be pure black (Figma: #000 @ N%). Some
  // exports leave a tinted RGB (e.g. 0.436 0.392 0.392) — zero the R/G/B
  // channels of every feColorMatrix, keeping each shadow's alpha unchanged.
  svg = svg.replace(
    /(feColorMatrix type="matrix" values=")0 0 0 0 [\d.]+ 0 0 0 0 [\d.]+ 0 0 0 0 [\d.]+( 0 0 0 [\d.]+ 0")/g,
    '$10 0 0 0 0 0 0 0 0 0 0 0 0 0 0$2',
  )

  // Collapse whitespace / newlines inside SVG (keep compact)
  svg = svg.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim()

  return svg
}

function illustrationNameFromFile(filename) {
  // "Type=Calendar.svg" → "calendar"
  // "Type=Cards-stack-pending.svg" → "cards-stack-pending"
  let name = filename.replace(/\.svg$/, '')
  name = name.replace(/^Type=/, '')
  name = name.replace(/\s+/g, '-').toLowerCase()
  return name
}

// ── Generate ──────────────────────────────────────────────────────────────────

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

const files = fs.readdirSync(SRC_DIR)
  .filter(f => f.endsWith('.svg'))
  .sort()

const illustrations = []

for (const file of files) {
  const raw = fs.readFileSync(path.join(SRC_DIR, file), 'utf8')
  const svg = processSvg(raw)
  const name = illustrationNameFromFile(file)
  illustrations.push({ name, svg })
}

// Write TS file
const lines = [
  `// Auto-generated from Illustrations pack – do not edit manually`,
  `export const illustrations: { name: string; svg: string }[] = [`,
  ...illustrations.map(({ name, svg }) => {
    const escaped = svg.replace(/`/g, '\\`').replace(/\$/g, '\\$')
    return `  { name: ${JSON.stringify(name)}, svg: \`${escaped}\` },`
  }),
  `]`,
  ``,
]

fs.writeFileSync(path.join(OUT_DIR, 'illustrations.ts'), lines.join('\n'))
console.log(`✓ illustrations.ts  (${illustrations.length} illustrations)`)
if (unmapped.size) {
  console.log('⚠ Unmapped colours left as literal hex (review):', [...unmapped].join(', '))
} else {
  console.log('✓ all fill/stroke colours tokenised')
}
console.log('Done.')
