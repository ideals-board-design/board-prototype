/**
 * Generates src/icons/{category}.ts files from the SVG archive.
 * Run: node scripts/generate-icons.js
 */

const fs   = require('fs')
const path = require('path')

const SRC_DIR  = '/tmp/board-icons/Board DS icons pack'
const OUT_DIR  = path.join(__dirname, '../src/icons')

// Categories that keep their original colors (multi-color / branded)
const KEEP_COLORS = new Set(['Services', 'File format'])

// Categories that keep brand colours but must adapt their NEUTRAL stone parts
// (document paper/border/lines) to dark mode. Applied after KEEP_COLORS.
const FLIP_NEUTRALS = new Set(['File format'])
const NEUTRAL_TOKENS = {
  '#fbfbfb': 'var(--stone-100)',
  '#f7f7f7': 'var(--stone-200)',
  '#eceef9': 'var(--stone-300)',
  '#dee0eb': 'var(--stone-400)',
  '#bbbdc8': 'var(--stone-500)',
  '#9c9ea8': 'var(--stone-600)',
  '#e6f2fd': 'var(--blue-50)',
  // folder file-type icon (amber) — adapt to a dark amber in dark mode
  '#fff9d5': 'var(--yellow-50)',
  '#d18a00': 'var(--orange-500)',
}

// Category folder → output file name + display label
const CATEGORIES = [
  { folder: 'Arrows',            file: 'arrows',      label: 'Arrows' },
  { folder: 'Files',             file: 'files',       label: 'Files' },
  { folder: 'Users',             file: 'users',       label: 'Users' },
  { folder: 'Condition',         file: 'condition',   label: 'Condition' },
  { folder: 'Date & time',       file: 'dateTime',    label: 'Date & Time' },
  { folder: 'Media and devices', file: 'media',       label: 'Media & Devices' },
  { folder: 'Editor',            file: 'editor',      label: 'Editor' },
  { folder: 'Communication',     file: 'communication', label: 'Communication' },
  { folder: 'Location',          file: 'location',    label: 'Location' },
  { folder: 'Services',          file: 'services',    label: 'Services' },
  { folder: 'Actions',           file: 'actions',     label: 'Actions' },
  { folder: 'Funcional',         file: 'functional',  label: 'Functional' },
  // Separate: File format (document/file type icons)
  { folder: 'File format',       file: 'fileFormat',  label: 'File Format' },
  // Separate: Navigation (sidebar only, 24px)
  { folder: 'Navigation',        file: 'navigation',  label: 'Navigation' },
]

// ── SVG processing ────────────────────────────────────────────────────────────

function processSvg(raw, keepColors, flipNeutrals) {
  let svg = raw.trim()

  // Remove XML declaration if present
  svg = svg.replace(/<\?xml[^>]*\?>\s*/g, '')

  // Remove width/height attrs from <svg> tag so CSS controls sizing
  svg = svg.replace(/(<svg[^>]*)\s+width="[^"]*"/, '$1')
  svg = svg.replace(/(<svg[^>]*)\s+height="[^"]*"/, '$1')

  // Remove id attributes to avoid conflicts when multiple SVGs are on the page.
  // EXCEPTION: brand logos (keepColors) rely on gradient/mask/clip ids via
  // url(#...) refs — stripping them blanks the icon. Those ids carry unique
  // suffixes (no cross-icon collisions), so keep them; strip only a root <svg id>.
  if (keepColors) {
    svg = svg.replace(/(<svg[^>]*?)\s+id="[^"]*"/, '$1')
  } else {
    svg = svg.replace(/\s+id="[^"]*"/g, '')
  }

  // Remove full-canvas white background rect (Figma export artifact): invisible
  // on a light page but a solid white square in dark. Only the one directly
  // after <svg>; clipPath rects live in <defs> and must be kept.
  svg = svg.replace(/(<svg[^>]*>)\s*<rect width="20" height="20" fill="white"\s*\/>/i, '$1')

  // Same artifact expressed as a full-canvas white PATH (e.g. Microsoft logo:
  // "M0 0H20V20H0V0Z"). Unambiguously a background — remove wherever it appears.
  svg = svg.replace(/<path d="M0 0H\d+(?:\.\d+)?V\d+(?:\.\d+)?H0V0Z" fill="white"\s*\/>\s*/gi, '')

  if (flipNeutrals) {
    // Keep brand colours, but adapt neutral document paper/border to dark mode.
    for (const [hex, token] of Object.entries(NEUTRAL_TOKENS)) {
      svg = svg.replace(new RegExp(`fill="${hex}"`, 'gi'), `fill="${token}"`)
    }
  }

  if (keepColors) {
    // Single-colour brand icons (only #1F2129, no other brand hue) adapt to the
    // theme. The tile/shape → currentColor; any white knockout glyph → surface,
    // so it inverts against the tile (dark tile+white glyph in light → white
    // tile+dark glyph in dark). Multi-colour brand logos are left untouched.
    const hexes = (svg.match(/#[0-9a-fA-F]{6}/g) || []).map(h => h.toUpperCase())
    if (hexes.length && hexes.every(h => h === '#1F2129')) {
      svg = svg.replace(/(fill|stroke)="#1F2129"/gi, '$1="currentColor"')
      svg = svg.replace(/(fill|stroke)="white"/gi, '$1="var(--color-bg-surface)"')
    }
  }

  if (!keepColors) {
    // Primary dark → currentColor
    svg = svg.replace(/fill="#1F2129"/gi, 'fill="currentColor"')
    svg = svg.replace(/stroke="#1F2129"/gi, 'stroke="currentColor"')
    // Navigation secondary gray → currentColor
    svg = svg.replace(/fill="#5F616A"/gi, 'fill="currentColor"')
    svg = svg.replace(/stroke="#5F616A"/gi, 'stroke="currentColor"')
    // Near-black fallbacks
    svg = svg.replace(/fill="#000000"/gi, 'fill="currentColor"')
    svg = svg.replace(/fill="#000"/gi, 'fill="currentColor"')
    // #BBBDC8 (intentional muted parts), #2C9C74 (brand green nav active),
    // #D18A00 / #F1C400 (warning amber) — kept as design-intentional colors
  }

  // Collapse whitespace / newlines inside SVG (keep compact)
  svg = svg.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim()

  return svg
}

function iconNameFromFile(filename) {
  // Remove .svg extension
  let name = filename.replace(/\.svg$/, '')
  // Clean up "menu item=X, state=Y" → "nav-X-Y"
  if (name.startsWith('menu item=')) {
    name = name
      .replace('menu item=', '')
      .replace(', state=', '-')
      .replace(/\s+/g, '-')
      .toLowerCase()
  }
  // Clean up "format=.xxx" → "format-xxx"
  name = name.replace('format=', 'format-')
  // Remove leading dots from format names
  name = name.replace('format-.', 'format-')
  // Replace spaces with dashes, lowercase
  name = name.replace(/\s+/g, '-').toLowerCase()
  return name
}

// ── Generate ──────────────────────────────────────────────────────────────────

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

const index = []

for (const cat of CATEGORIES) {
  const folderPath = path.join(SRC_DIR, cat.folder)
  if (!fs.existsSync(folderPath)) {
    console.warn('⚠ Missing folder:', cat.folder)
    continue
  }

  const files = fs.readdirSync(folderPath)
    .filter(f => f.endsWith('.svg'))
    .sort()

  const keepColors = KEEP_COLORS.has(cat.folder)
  const icons = []

  for (const file of files) {
    const raw = fs.readFileSync(path.join(folderPath, file), 'utf8')
    const svg = processSvg(raw, keepColors, FLIP_NEUTRALS.has(cat.folder))
    const name = iconNameFromFile(file)
    icons.push({ name, svg })
  }

  // Write TS file
  const lines = [
    `// Auto-generated from "${cat.folder}" – do not edit manually`,
    `export const ${cat.file}: { name: string; svg: string }[] = [`,
    ...icons.map(({ name, svg }) => {
      const escaped = svg.replace(/`/g, '\\`').replace(/\$/g, '\\$')
      return `  { name: ${JSON.stringify(name)}, svg: \`${escaped}\` },`
    }),
    `]`,
    ``,
    `export const ${cat.file}Label = ${JSON.stringify(cat.label)}`,
  ]

  fs.writeFileSync(path.join(OUT_DIR, `${cat.file}.ts`), lines.join('\n'))
  console.log(`✓ ${cat.file}.ts  (${icons.length} icons)`)
  index.push({ file: cat.file, label: cat.label, isSpecial: KEEP_COLORS.has(cat.folder) })
}

// Write index
const indexLines = [
  `// Auto-generated index`,
  ...index.map(c => `export { ${c.file}, ${c.file}Label } from './${c.file}'`),
]
fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), indexLines.join('\n'))
console.log('\n✓ index.ts written')
console.log('Done.')
