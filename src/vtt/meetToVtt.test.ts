import { describe, expect, it } from 'vitest'
import { checkContent, checkFile, convert, fmt, safeName, splitTurn } from './meetToVtt'

const SAMPLE = `Weekly sync - Transcript
Attendees
Alice Smith, Bob Lee
Transcript
00:00:00

Alice Smith: Good morning.
Bob Lee: Morning! Shall we start
with the budget?
00:00:30

Alice Smith: Yes.
Meeting ended after 00:00:40 👋

This editable transcript was computer generated and might contain errors.`

describe('convert', () => {
  const r = convert(SAMPLE)

  it('produces validated CRLF WebVTT with "Speaker: text" cues', () => {
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.title).toBe('Weekly sync')
    expect(r.vtt.startsWith('WEBVTT\r\n\r\n1\r\n00:00:00.000 --> ')).toBe(true)
    expect(r.vtt).toContain('Alice Smith: Yes.')
    expect(r.stats).toEqual({ cues: 4, words: 10, speakers: 2, duration: '00:00:40' })
  })

  it('warns about a line without a speaker label', () => {
    expect(r.warnings).toContain('Line 9 has no speaker label; attributed to Bob Lee.')
  })

  it('times the last section up to "Meeting ended after"', () => {
    expect(r.vtt).toContain('00:00:30.000 --> 00:00:40.000')
  })

  it('fails when there are no transcript lines', () => {
    const e = convert('Transcript\n00:00:00\n')
    expect(e.ok).toBe(false)
  })
})

describe('splitTurn', () => {
  it('packs sentences into cues of at most 20 words', () => {
    const long = Array.from({ length: 45 }, (_, i) => `w${i}`).join(' ')
    expect(splitTurn(long).map(c => c.split(' ').length)).toEqual([20, 20, 5])
  })
})

describe('upload gates', () => {
  it('rejects non-.txt, empty and oversized files', () => {
    expect(checkFile({ name: 'a.docx', type: '', size: 10 })).toMatch(/not a \.txt file/)
    expect(checkFile({ name: 'a.txt', type: 'text/plain', size: 0 })).toMatch(/is empty/)
    expect(checkFile({ name: 'a.txt', type: 'text/plain', size: 6 * 1024 * 1024 })).toMatch(/larger than 5 MB/)
    expect(checkFile({ name: 'a.txt', type: 'text/plain', size: 10 })).toBeNull()
  })

  it('accepts only text that looks like a Meet transcript', () => {
    expect(checkContent(SAMPLE)).toBeNull()
    expect(checkContent('Just some notes')).toMatch(/doesn’t look like/)
  })
})

it('formats time and file names', () => {
  expect(fmt(3723.5)).toBe('01:02:03.500')
  expect(safeName('Q3: review / plan')).toBe('Q3- review - plan')
  expect(safeName(null)).toBe('transcript')
})
