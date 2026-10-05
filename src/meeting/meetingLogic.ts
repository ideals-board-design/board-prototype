/* meetingLogic — pure, testable rules for the Meeting Creation page (IBP-12096).
   Keeping these out of the React components lets the behaviour be unit-tested and
   reused without duplicating logic. */

export type MeetingType = 'hybrid' | 'in-person' | 'online'

/** New meetings default to Hybrid. */
export const DEFAULT_MEETING_TYPE: MeetingType = 'hybrid'

/** Default start time for a fresh meeting (24h; locale formatting is applied by the
    time field). */
export const DEFAULT_START_TIME = '09:00'

/** Existing/legacy meetings (no stored type, or an unknown value) are treated as
    Hybrid. */
export function normalizeMeetingType(stored?: string | null): MeetingType {
  return stored === 'in-person' || stored === 'online' ? stored : 'hybrid'
}

/** Which type-dependent fields are visible. Hidden fields keep their values in
    form state; this only controls visibility. */
export function meetingFieldVisibility(type: MeetingType): { location: boolean; videoconference: boolean } {
  return {
    location: type !== 'online',        // Location hidden for Online
    videoconference: type !== 'in-person', // Videoconference hidden for In-person
  }
}

export interface FilterableUser {
  id: string
  blocked?: boolean
  role?: string
}

/** Candidates for the "add extra participants" picker: every portal user except
    the selected group's members and blocked users. Admins are included. */
export function participantCandidates<T extends FilterableUser>(users: T[], groupMemberIds: string[]): T[] {
  const members = new Set(groupMemberIds)
  return users.filter(u => !u.blocked && !members.has(u.id))
}

/** The single-group auto-selection rule: when the user can access exactly one
    group, it is selected on load; otherwise nothing is preselected. */
export function autoSelectedGroup<T extends { value: string }>(groups: T[]): string {
  return groups.length === 1 ? groups[0].value : ''
}

/** A videoconference link is never auto-created just because Zoom/Teams is
    connected: it requires an explicit user action (or group prefill, handled
    elsewhere). This encodes the "no automatic selection" rule. */
export function shouldAutoSelectVideoconference(): boolean {
  return false
}

/** Address suggestions for the location autocomplete (case-insensitive substring).
    An empty query yields no suggestions. */
export function filterAddresses(query: string, addresses: string[]): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return addresses.filter(a => a.toLowerCase().includes(q))
}

/** Sample address book backing the prototype's location search. */
export const SAMPLE_ADDRESSES = [
  '1535 Broadway, New York, NY 10036, USA',
  '350 Fifth Avenue, New York, NY 10118, USA',
  '11 Wall Street, New York, NY 10005, USA',
  '200 Park Avenue, New York, NY 10166, USA',
  '1 Rockefeller Plaza, New York, NY 10020, USA',
  '30 Rockefeller Plaza, New York, NY 10112, USA',
  '4 World Trade Center, New York, NY 10007, USA',
  '620 Eighth Avenue, New York, NY 10018, USA',
]
