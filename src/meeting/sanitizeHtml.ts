/* sanitizeHtml — dependency-free HTML sanitizer for rich-text description content.

   The prototype has no sanitization library and is deliberately dependency-free,
   so this uses the browser DOM (DOMParser + an allowlist tree walk) rather than a
   library or regular expressions. It strips scripts, event handlers, styles and
   unsafe URLs while preserving the editor's supported formatting (bold, italic,
   underline, strike, ordered/unordered lists, paragraphs, line breaks, links).

   Use `sanitizeHtml` at every trust boundary: before rendering the email preview
   on the client, and — in a real backend — before persisting. `plainTextLength`
   counts visible characters (markup is not counted) for the length limit. */

/** Elements whose formatting we keep (attributes are still stripped). */
const ALLOWED_TAGS = new Set([
  'p', 'div', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike',
  'ul', 'ol', 'li', 'span', 'a',
])

/** Elements removed entirely, subtree and all (never valid in a description). */
const DROP_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'link',
  'meta', 'form', 'input', 'button', 'textarea', 'select', 'option',
  'video', 'audio', 'img', 'source', 'noscript', 'template', 'base',
])

/** Return the href only if it uses a safe scheme; otherwise null. Parsed via the
    URL API (not a regex) so obfuscated `javascript:`/`data:` URLs are rejected. */
function safeUrl(href: string): string | null {
  const base = typeof window !== 'undefined' && window.location ? window.location.href : 'http://localhost/'
  try {
    const url = new URL(href, base)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? href : null
  } catch {
    return null
  }
}

/** Recursively sanitize a parent element's children in place. */
function cleanChildren(parent: Node): void {
  // Snapshot first — the list mutates as we unwrap/remove nodes.
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === 3 /* text */) continue
    if (node.nodeType !== 1 /* element */) {
      parent.removeChild(node) // comments, processing instructions, etc.
      continue
    }

    const el = node as Element
    const tag = el.tagName.toLowerCase()

    if (DROP_TAGS.has(tag)) {
      parent.removeChild(el)
      continue
    }

    // Clean descendants before deciding what to do with this node.
    cleanChildren(el)

    if (ALLOWED_TAGS.has(tag)) {
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase()
        if (tag === 'a' && name === 'href') {
          const href = safeUrl(attr.value)
          if (href) {
            el.setAttribute('href', href)
            el.setAttribute('rel', 'noopener noreferrer')
            el.setAttribute('target', '_blank')
          } else {
            el.removeAttribute('href')
          }
        } else {
          // Strips style, class, id and every on* event handler.
          el.removeAttribute(attr.name)
        }
      }
    } else {
      // Unknown tag: drop the wrapper but keep its (already-cleaned) contents.
      while (el.firstChild) parent.insertBefore(el.firstChild, el)
      parent.removeChild(el)
    }
  }
}

/** Sanitize an HTML string, returning safe HTML with only allowed formatting. */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  cleanChildren(doc.body)
  return doc.body.innerHTML
}

/** Count of visible characters (HTML markup is not counted). */
export function plainTextLength(html: string): number {
  if (!html) return 0
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').length
}

/** True when the HTML has no visible text (only tags / whitespace). */
export function htmlHasText(html: string): boolean {
  if (!html) return false
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').trim() !== ''
}
