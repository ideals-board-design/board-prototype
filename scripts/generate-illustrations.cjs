/**
 * Generates src/illustrations/illustrations.ts from the SVG archive.
 * Run: node scripts/generate-illustrations.cjs
 */

const fs   = require('fs')
const path = require('path')

const SRC_DIR = '/Users/jaroslav.getman/Documents/DS assets/Illustrations pack'
const OUT_DIR = path.join(__dirname, '../src/illustrations')

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

  // Illustrations are multi-color — keep all colors as-is

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
console.log('Done.')
