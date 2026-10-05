import { describe, it, expect } from 'vitest'
import {
  DEFAULT_MEETING_TYPE,
  DEFAULT_START_TIME,
  normalizeMeetingType,
  meetingFieldVisibility,
  participantCandidates,
  autoSelectedGroup,
  shouldAutoSelectVideoconference,
  filterAddresses,
  SAMPLE_ADDRESSES,
} from './meetingLogic'

describe('meeting type defaults', () => {
  it('defaults new meetings to Hybrid', () => {
    expect(DEFAULT_MEETING_TYPE).toBe('hybrid')
  })

  it('treats legacy/unknown stored meetings as Hybrid', () => {
    expect(normalizeMeetingType(undefined)).toBe('hybrid')
    expect(normalizeMeetingType(null)).toBe('hybrid')
    expect(normalizeMeetingType('')).toBe('hybrid')
    expect(normalizeMeetingType('legacy')).toBe('hybrid')
    expect(normalizeMeetingType('hybrid')).toBe('hybrid')
    expect(normalizeMeetingType('in-person')).toBe('in-person')
    expect(normalizeMeetingType('online')).toBe('online')
  })
})

describe('field visibility by meeting type (values preserved separately)', () => {
  it('Hybrid shows both location and videoconference', () => {
    expect(meetingFieldVisibility('hybrid')).toEqual({ location: true, videoconference: true })
  })
  it('Online hides the location field', () => {
    expect(meetingFieldVisibility('online')).toEqual({ location: false, videoconference: true })
  })
  it('In-person hides the videoconference field', () => {
    expect(meetingFieldVisibility('in-person')).toEqual({ location: true, videoconference: false })
  })
})

describe('single-group auto-selection', () => {
  it('auto-selects the only group the user can access', () => {
    expect(autoSelectedGroup([{ value: 'board' }])).toBe('board')
  })
  it('selects nothing when there are multiple groups', () => {
    expect(autoSelectedGroup([{ value: 'board' }, { value: 'audit' }])).toBe('')
  })
  it('selects nothing when there are no groups', () => {
    expect(autoSelectedGroup([])).toBe('')
  })
})

describe('additional-participant candidates', () => {
  const users = [
    { id: 'brian' },
    { id: 'michael', role: 'admin' },
    { id: 'steven', blocked: true },
    { id: 'olivia' },
  ]
  it('excludes group members and blocked users, includes admins', () => {
    const ids = participantCandidates(users, ['brian']).map(u => u.id)
    expect(ids).toContain('michael') // admin included
    expect(ids).toContain('olivia')
    expect(ids).not.toContain('brian')  // group member excluded
    expect(ids).not.toContain('steven') // blocked excluded
  })
})

describe('start time default', () => {
  it('defaults to 09:00', () => {
    expect(DEFAULT_START_TIME).toBe('09:00')
  })
})

describe('no automatic videoconference selection', () => {
  it('never auto-creates a videoconference link', () => {
    expect(shouldAutoSelectVideoconference()).toBe(false)
  })
})

describe('location address search', () => {
  it('returns no suggestions for an empty query', () => {
    expect(filterAddresses('', SAMPLE_ADDRESSES)).toEqual([])
    expect(filterAddresses('   ', SAMPLE_ADDRESSES)).toEqual([])
  })
  it('matches addresses case-insensitively by substring', () => {
    const res = filterAddresses('broadway', SAMPLE_ADDRESSES)
    expect(res.length).toBeGreaterThan(0)
    expect(res.every(a => a.toLowerCase().includes('broadway'))).toBe(true)
  })
  it('returns an empty list when nothing matches', () => {
    expect(filterAddresses('zzzz-no-such-street', SAMPLE_ADDRESSES)).toEqual([])
  })
})
