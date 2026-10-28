/* meetToVtt — Google Meet transcript (.txt export) → Zoom-style WebVTT.
   Ported from the standalone meet-to-vtt tool (incl. the Notes by Gemini
   layout); no dependencies.

   • parseMeet  — header (title, Attendees), time markers, speaker turns.
   • buildCues  — splits turns into ≤ 20-word cues and interpolates times by
                  word count between Meet's time markers (150 wpm fallback).
   • toVtt      — CRLF WebVTT, "Speaker: text" cues.
   • validate   — independent guardrail: re-parses the VTT and checks format
                  and that the words match the transcript verbatim.
   • checkFile / checkContent — upload gates (type, size, looks like Meet). */

export const MARKER_RE = /^(\d{1,2}):(\d{2}):(\d{2})$/
export const ENDED_RE = /^(?:Meeting|Transcription) ended after (\d{1,2}):(\d{2}):(\d{2})\b/
export const HEADER_RE = /^(?:Transcript|.+ - Transcript)$/
const DISCLAIMER_RE = /^This editable transcript was computer generated/
export const SPEAKER_RE = /^([^:\n]{1,80}):\s+(.*)$/
const MAX_WORDS_PER_CUE = 20
const WPM_FALLBACK = 150
export const MAX_BYTES = 5 * 1024 * 1024

type Item =
  | { type: 'marker'; t: number }
  | { type: 'turn'; speaker: string | null; text: string; line: number }
type Turn = Extract<Item, { type: 'turn' }>

export interface Parsed {
  title: string | null
  attendees: string[]
  items: Item[]
  endTime: number | null
  warnings: string[]
}

export interface Cue { speaker: string | null; text: string; w: number; start: number; end: number }

export type ConvertResult =
  | {
      ok: true
      vtt: string
      title: string | null
      warnings: string[]
      errors: string[]
      stats: { cues: number; words: number; speakers: number; duration: string }
    }
  | { ok: false; errors: string[]; warnings: string[]; vtt?: string; title?: string | null }

const hmsToSec = (h: string, m: string, s: string) => (+h) * 3600 + (+m) * 60 + (+s)
const words = (str: string) => str.split(/\s+/).filter(Boolean)

export function fmt(sec: number): string {
  const ms = Math.round(sec * 1000)
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60,
        s = Math.floor(ms / 1000) % 60, r = ms % 1000
  const p = (n: number, w: number) => String(n).padStart(w, '0')
  return `${p(h, 2)}:${p(m, 2)}:${p(s, 2)}.${p(r, 3)}`
}

function looksLikeName(n: string): boolean {
  const ws = n.trim().split(/\s+/)
  if (ws.length > 5 || /[.?!,;…]$/.test(n.trim())) return false
  return ws.every(w => /^[\p{Lu}\p{Lt}]/u.test(w) || /^(van|von|de|der|den|da|di|du|la|le|del|dos|bin|al)$/i.test(w))
}

/** Parse the Meet .txt export into speaker turns and time markers. */
export function parseMeet(raw: string): Parsed {
  const warnings: string[] = []
  const lines = raw.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n')
  let title: string | null = null, attendees: string[] = [], start = 0

  // Two Meet export layouts are supported:
  //  A) "<Title> - Transcript" / "Attendees" / "<names>" / "Transcript" / body
  //  B) Gemini notes doc, transcript tab: "<Date>" / "<Title> - Transcript" / body
  //     (a download may also include the Gemini notes above it, which are skipped)
  // The body starts after the last header line that precedes the first time marker.
  const firstMarker = lines.findIndex(l => MARKER_RE.test(l.trim()))
  let tIdx = -1
  for (let i = (firstMarker === -1 ? lines.length : firstMarker) - 1; i >= 0; i--) {
    if (HEADER_RE.test(lines[i].trim())) { tIdx = i; break }
  }
  if (tIdx !== -1) {
    const hdr = lines[tIdx].trim()
    if (hdr === 'Transcript') {
      title = (lines[0] || '').trim().replace(/\s*-\s*Transcript$/, '') || null
      const aIdx = lines.findIndex((l, i) => i < tIdx && l.trim() === 'Attendees')
      if (aIdx !== -1 && lines[aIdx + 1]) {
        attendees = lines[aIdx + 1].split(',').map(s => s.trim()).filter(Boolean)
      }
    } else {
      title = hdr.replace(/\s*-\s*Transcript$/, '') || null
    }
    start = tIdx + 1
  } else {
    warnings.push('No Google Meet transcript header found. The whole text was treated as the transcript body.')
  }
  const attendeeSet = new Set(attendees)

  const items: Item[] = []
  let endTime: number | null = null, lastSpeaker: string | null = null
  const unknownSpeakers = new Set<string>()

  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    let m: RegExpMatchArray | null
    if ((m = line.match(MARKER_RE))) { items.push({ type: 'marker', t: hmsToSec(m[1], m[2], m[3]) }); continue }
    if ((m = line.match(ENDED_RE))) { endTime = hmsToSec(m[1], m[2], m[3]); continue }
    if (DISCLAIMER_RE.test(line)) continue

    m = line.match(SPEAKER_RE)
    if (m) {
      const name = m[1].trim()
      const known = attendeeSet.has(name)
      if (known || looksLikeName(name)) {
        if (!known && attendees.length) unknownSpeakers.add(name)
        lastSpeaker = name
        items.push({ type: 'turn', speaker: name, text: m[2].trim(), line: i + 1 })
        continue
      }
    }
    // Line without a recognisable speaker: keep it, attribute to previous speaker.
    if (lastSpeaker) warnings.push(`Line ${i + 1} has no speaker label; attributed to ${lastSpeaker}.`)
    else warnings.push(`Line ${i + 1} has no speaker label and no previous speaker; written without a name.`)
    items.push({ type: 'turn', speaker: lastSpeaker, text: line, line: i + 1 })
  }
  if (unknownSpeakers.size) warnings.push(`Speakers not in the attendee list: ${[...unknownSpeakers].join(', ')}.`)
  return { title, attendees, items, endTime, warnings }
}

/** Split one turn into Zoom-sized cue texts: sentence-packed, max N words, word boundaries only. */
export function splitTurn(text: string): string[] {
  const sentences = text.split(/(?<=[.?!…])\s+/).filter(Boolean)
  const chunks: string[][] = []
  let cur: string[] = []
  for (const s of sentences) {
    const sw = words(s)
    if (cur.length && cur.length + sw.length > MAX_WORDS_PER_CUE) { chunks.push(cur); cur = [] }
    if (sw.length > MAX_WORDS_PER_CUE) {
      for (let k = 0; k < sw.length; k += MAX_WORDS_PER_CUE) {
        const piece = sw.slice(k, k + MAX_WORDS_PER_CUE)
        if (piece.length === MAX_WORDS_PER_CUE) chunks.push(piece); else cur = piece
      }
    } else cur = cur.concat(sw)
  }
  if (cur.length) chunks.push(cur)
  return chunks.map(c => c.join(' '))
}

/** Build cues with timestamps interpolated by word count between Meet's time markers. */
export function buildCues(parsed: Parsed): { cues: Cue[]; warnings: string[] } {
  type Seg = { t0: number; cues: { speaker: string | null; text: string; w: number }[] }
  const segments: Seg[] = []
  let seg: Seg = { t0: 0, cues: [] }
  for (const it of parsed.items) {
    if (it.type === 'marker') { segments.push(seg); seg = { t0: it.t, cues: [] }; continue }
    for (const text of splitTurn(it.text)) seg.cues.push({ speaker: it.speaker, text, w: words(text).length })
  }
  segments.push(seg)

  const warnings: string[] = []
  const out: Cue[] = []
  for (let s = 0; s < segments.length; s++) {
    const { t0, cues } = segments[s]
    const W = cues.reduce((a, c) => a + c.w, 0)
    if (!W) continue
    let t1: number
    if (s + 1 < segments.length) t1 = segments[s + 1].t0
    else if (parsed.endTime && parsed.endTime > t0) t1 = parsed.endTime
    else {
      t1 = t0 + (W / WPM_FALLBACK) * 60
      if (!parsed.endTime) warnings.push('No "Meeting ended after" line found; the final section’s timing was estimated at 150 words per minute.')
    }
    if (t1 <= t0) { t1 = t0 + (W / WPM_FALLBACK) * 60; warnings.push(`Time markers out of order near ${fmt(t0)}; timing in that section was estimated.`) }
    let acc = 0
    for (const c of cues) {
      const a = t0 + (t1 - t0) * acc / W; acc += c.w
      const b = t0 + (t1 - t0) * acc / W
      out.push({ ...c, start: a, end: b })
    }
  }
  // Guarantee strictly increasing, non-zero-length cues at millisecond precision.
  let prevEnd = 0
  for (const c of out) {
    c.start = Math.max(Math.round(c.start * 1000), prevEnd) / 1000
    c.end = Math.max(Math.round(c.end * 1000), Math.round(c.start * 1000) + 1) / 1000
    prevEnd = Math.round(c.end * 1000)
  }
  return { cues: out, warnings }
}

export function toVtt(cues: Cue[]): string {
  const NL = '\r\n'
  let s = 'WEBVTT' + NL + NL
  cues.forEach((c, i) => {
    s += (i + 1) + NL + fmt(c.start) + ' --> ' + fmt(c.end) + NL +
         (c.speaker ? c.speaker + ': ' : '') + c.text + NL + NL
  })
  return s
}

/** Independent guardrail: re-parse the VTT string and check format + verbatim content. */
export function validate(vtt: string, parsed: Parsed) {
  const errors: string[] = []
  const blocks = vtt.split('\r\n\r\n')
  if (blocks[0] !== 'WEBVTT') errors.push('Missing WEBVTT header.')
  if (blocks[blocks.length - 1] !== '') errors.push('File does not end with a blank line.')
  const body = blocks.slice(1, -1)
  const TS = /^(\d{2}):([0-5]\d):([0-5]\d)\.(\d{3}) --> (\d{2}):([0-5]\d):([0-5]\d)\.(\d{3})$/
  const toMs = (h: string, m: string, s: string, ms: string) => ((+h * 60 + +m) * 60 + +s) * 1000 + +ms
  const speakers = new Set(parsed.items.filter((i): i is Turn => i.type === 'turn' && !!i.speaker).map(i => i.speaker!))
  const outTokens: string[] = []
  let prevEnd = -1
  body.forEach((b, i) => {
    const ls = b.split('\r\n')
    if (ls.length !== 3) { errors.push(`Cue ${i + 1}: expected 3 lines, found ${ls.length}.`); return }
    if (ls[0] !== String(i + 1)) errors.push(`Cue ${i + 1}: wrong sequence number "${ls[0]}".`)
    const m = ls[1].match(TS)
    if (!m) { errors.push(`Cue ${i + 1}: malformed timestamp line.`); return }
    const a = toMs(m[1], m[2], m[3], m[4]), z = toMs(m[5], m[6], m[7], m[8])
    if (z <= a) errors.push(`Cue ${i + 1}: end time is not after start time.`)
    if (a < prevEnd) errors.push(`Cue ${i + 1}: overlaps the previous cue.`)
    prevEnd = z
    if (!ls[2].trim()) errors.push(`Cue ${i + 1}: empty text.`)
    let sp: string | null = null, txt = ls[2]
    for (const name of speakers) if (txt.startsWith(name + ': ')) { if (!sp || name.length > sp.length) sp = name }
    if (sp) txt = txt.slice(sp.length + 2)
    for (const w of words(txt)) outTokens.push(sp + '\u0000' + w)
  })
  const inTokens: string[] = []
  for (const it of parsed.items) if (it.type === 'turn') for (const w of words(it.text)) inTokens.push(it.speaker + '\u0000' + w)
  if (inTokens.length !== outTokens.length) errors.push(`Word count mismatch: ${inTokens.length} in, ${outTokens.length} out.`)
  const n = Math.min(inTokens.length, outTokens.length)
  for (let k = 0; k < n; k++) if (inTokens[k] !== outTokens[k]) {
    const [s1, w1] = inTokens[k].split('\u0000'), [s2, w2] = outTokens[k].split('\u0000')
    errors.push(`Content differs at word ${k + 1}: expected "${w1}" (${s1}), got "${w2}" (${s2}).`)
    break
  }
  return { ok: errors.length === 0, errors, cueCount: body.length, wordCount: inTokens.length }
}

export function convert(raw: string): ConvertResult {
  const parsed = parseMeet(raw)
  const turns = parsed.items.filter((i): i is Turn => i.type === 'turn')
  if (!turns.length) return { ok: false, errors: ['No transcript lines found. Paste the full Google Meet transcript text.'], warnings: parsed.warnings }
  const { cues, warnings } = buildCues(parsed)
  const vtt = toVtt(cues)
  const v = validate(vtt, parsed)
  const allWarnings = [...parsed.warnings, ...new Set(warnings)]
  if (!v.ok) return { ok: false, errors: v.errors, warnings: allWarnings, vtt, title: parsed.title }
  return {
    ok: true, errors: [], vtt, title: parsed.title,
    warnings: allWarnings,
    stats: { cues: v.cueCount, words: v.wordCount,
             speakers: new Set(turns.map(t => t.speaker).filter(Boolean)).size,
             duration: cues.length ? fmt(cues[cues.length - 1].end).slice(0, 8) : '00:00:00' },
  }
}

/* ── Upload gates ─────────────────────────────────────────── */

/** Gate 1: file type and size, checked before the file is even read. */
export function checkFile(f: { name: string; type: string; size: number }): string | null {
  if (!/\.txt$/i.test(f.name)) return `"${f.name}" is not a .txt file. Download the transcript from Google Docs as Plain text (.txt) and try again.`
  if (f.type && f.type !== 'text/plain') return `"${f.name}" is not a plain text file. Download the transcript from Google Docs as Plain text (.txt) and try again.`
  if (f.size === 0) return `"${f.name}" is empty.`
  if (f.size > MAX_BYTES) return `"${f.name}" is larger than 5 MB, which is too large for a meeting transcript.`
  return null
}

/** Gate 2: content must look like a Google Meet transcript export. */
export function checkContent(text: string): string | null {
  const lines = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n').map(l => l.trim())
  const hasHeader = lines.some(l => HEADER_RE.test(l))
  const hasTime = lines.some(l => MARKER_RE.test(l) || ENDED_RE.test(l))
  const hasSpeaker = lines.some(l => SPEAKER_RE.test(l))
  if (!hasHeader || !hasSpeaker || !hasTime)
    return 'This file doesn’t look like a Google Meet transcript. Use the transcript Google Meet saves to Google Drive after the meeting, downloaded as Plain text (.txt). For a Notes by Gemini document, download it from the Transcript tab.'
  return null
}

export const safeName = (s: string | null | undefined) =>
  (s || 'transcript').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 120)
