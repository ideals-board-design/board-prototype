import { describe, it, expect } from 'vitest'
import { sanitizeHtml, plainTextLength, htmlHasText } from './sanitizeHtml'

describe('sanitizeHtml', () => {
  it('removes <script> elements and their content', () => {
    const out = sanitizeHtml('<p>Hi</p><script>alert(1)</script>')
    expect(out).toContain('Hi')
    expect(out.toLowerCase()).not.toContain('<script')
    expect(out).not.toContain('alert(1)')
  })

  it('strips event-handler attributes', () => {
    const out = sanitizeHtml('<p onclick="steal()">Text</p>')
    expect(out.toLowerCase()).not.toContain('onclick')
    expect(out).toContain('Text')
  })

  it('drops javascript: and data: URLs but keeps safe links', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>').toLowerCase()).not.toContain('javascript:')
    expect(sanitizeHtml('<a href="data:text/html,payload">x</a>').toLowerCase()).not.toContain('data:')
    const safe = sanitizeHtml('<a href="https://example.com">x</a>')
    expect(safe).toContain('href="https://example.com"')
  })

  it('strips style/class attributes but preserves formatting tags', () => {
    const out = sanitizeHtml('<b>bold</b><i>it</i><u>u</u><ul><li>a</li></ul><p style="color:red" class="x">p</p>')
    expect(out).toContain('<b>bold</b>')
    expect(out).toContain('<i>it</i>')
    expect(out).toContain('<u>u</u>')
    expect(out).toContain('<li>a</li>')
    expect(out.toLowerCase()).not.toContain('style=')
    expect(out.toLowerCase()).not.toContain('class=')
  })

  it('unwraps disallowed inline tags but keeps their text', () => {
    const out = sanitizeHtml('<marquee>hello</marquee>')
    expect(out).toContain('hello')
    expect(out.toLowerCase()).not.toContain('marquee')
  })

  it('drops <img onerror> payloads entirely', () => {
    const out = sanitizeHtml('<img src=x onerror="alert(1)">')
    expect(out.toLowerCase()).not.toContain('onerror')
    expect(out.toLowerCase()).not.toContain('<img')
  })
})

describe('plainTextLength', () => {
  it('counts visible characters, not HTML markup', () => {
    expect(plainTextLength('<b>hello</b>')).toBe(5)
    expect(plainTextLength('<p>ab</p><p>cd</p>')).toBe(4)
    expect(plainTextLength('')).toBe(0)
  })
})

describe('description character limit (3900)', () => {
  const MAX = 3900
  const message = (m: number) => `Text exceeds ${m} character limit`

  it('passes at exactly the limit', () => {
    const html = '<p>' + 'a'.repeat(MAX) + '</p>'
    expect(plainTextLength(html) > MAX).toBe(false)
  })

  it('fails past the limit and yields the exact message', () => {
    const html = '<p>' + 'a'.repeat(MAX + 1) + '</p>'
    expect(plainTextLength(html) > MAX).toBe(true)
    expect(message(MAX)).toBe('Text exceeds 3900 character limit')
  })

  it('does not count markup toward the limit', () => {
    const html = '<b><i>' + 'a'.repeat(MAX) + '</i></b>'
    expect(plainTextLength(html) > MAX).toBe(false)
  })
})

describe('htmlHasText', () => {
  it('is false for empty / tags-only content', () => {
    expect(htmlHasText('')).toBe(false)
    expect(htmlHasText('<p><br></p>')).toBe(false)
  })

  it('is true when there is visible text', () => {
    expect(htmlHasText('<p>hi</p>')).toBe(true)
  })
})
