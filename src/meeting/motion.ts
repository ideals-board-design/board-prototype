/* Motion model for Minutes → Agenda (Figma Meetings 18636-58546 "Voting").

   Lifecycle: new (unsaved, no status) → (Save as draft) draft → (Start vote)
   in-progress → (End vote) completed.
   "All for" jumps straight to completed with every member voting for; "Reset"
   sends a completed motion back to in-progress with all votes pending. */

export type MotionStatus = 'draft' | 'in-progress' | 'completed'
export type Vote = 'pending' | 'for' | 'against' | 'abstain'
export type Rsvp = 'attending' | 'online' | 'maybe' | 'declined'

export interface Member {
  id: string
  name: string
  role?: string
  rsvp: Rsvp
  src?: string
}

export interface Motion {
  id: string
  title: string
  status: MotionStatus
  proposerId?: string
  seconderId?: string
  votes: Record<string, Vote>
}

export const MEMBERS: Member[] = [
  { id: 'alexander', name: 'Alexander Anderson', rsvp: 'attending', src: 'https://i.pravatar.cc/64?img=68' },
  { id: 'brian',     name: 'Brian Rubinstein',   rsvp: 'declined' },
  { id: 'cheryl',    name: 'Cheryl Jameson',     rsvp: 'attending' },
  { id: 'colind',    name: 'Colin Darrans',      rsvp: 'maybe' },
  { id: 'colint',    name: 'Colin Thompson',     rsvp: 'attending', role: 'Secretary' },
  { id: 'emily',     name: 'Emily Johnson',      rsvp: 'online' },
  { id: 'michael',   name: 'Michael Donaldson',  rsvp: 'attending' },
  { id: 'olivia',    name: 'Olivia Thompson',    rsvp: 'attending', src: 'https://i.pravatar.cc/64?img=47' },
  { id: 'sophiaa',   name: 'Sophia Anson',       rsvp: 'attending', src: 'https://i.pravatar.cc/64?img=32' },
  { id: 'sophiaw',   name: 'Sophia Williams',    rsvp: 'attending' },
]

export const memberById = (id?: string) => MEMBERS.find(m => m.id === id)

export const allVotes = (vote: Vote): Record<string, Vote> =>
  Object.fromEntries(MEMBERS.map(m => [m.id, vote]))

export const tally = (m: Motion) => {
  const v = Object.values(m.votes)
  return {
    for:     v.filter(x => x === 'for').length,
    against: v.filter(x => x === 'against').length,
    abstain: v.filter(x => x === 'abstain').length,
    pending: MEMBERS.length - v.filter(x => x !== 'pending').length,
    total:   MEMBERS.length,
  }
}

/** Text pasted into the minutes editor by "Copy results". */
export function resultsText(m: Motion): string {
  const t = tally(m)
  const proposer = memberById(m.proposerId)?.name ?? '—'
  const seconder = memberById(m.seconderId)?.name ?? '—'
  const result = t.for === t.total
    ? 'All for'
    : [`For ${t.for}`, `Against ${t.against}`, `Abstain ${t.abstain}`, t.pending ? `Not voted ${t.pending}` : '']
        .filter(Boolean).join(', ')
  return `RESOLVED: ${m.title}.\nMoved by ${proposer}, Seconded by ${seconder}.\nResult: ${result}`
}

let seq = 0
export const newMotion = (): Motion => ({ id: `motion-new-${++seq}`, title: '', status: 'draft', votes: allVotes('pending') })
