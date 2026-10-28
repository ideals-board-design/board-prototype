/* Transcript content for the Minutes → Transcript segment.
   Two recordings of the March 2024 Board meeting (the meeting was split by a
   break). Each AI-minutes block starts at a timecode that matches one entry
   here, so "View in transcript" can jump straight to it. */

export interface Speaker {
  name: string
  /** picture avatar; speakers without one get a letters avatar */
  src?: string
}

export interface TranscriptEntry {
  id: string
  speaker: Speaker
  /** hh:mm:ss from the start of the meeting */
  time: string
  text: string
}

export interface Transcript {
  id: string
  title: string
  entries: TranscriptEntry[]
}

const CHERYL  = { name: 'Cheryl Jameson' }
const MICHAEL = { name: 'Michael Donaldson' }
const OLIVIA  = { name: 'Olivia Thompson', src: 'https://i.pravatar.cc/64?img=47' }
const EMILY   = { name: 'Emily Jones' }
const COLIN   = { name: 'Colin Darrans' }
const BRIAN   = { name: 'Brian Rubinstein' }
const THOMAS  = { name: 'Thomas Sonnenshein' }
const DANIEL  = { name: 'Daniel Ortiz' }

export const TRANSCRIPTS: Transcript[] = [
  {
    id: 't1',
    title: 'Transcript 1',
    entries: [
      { id: 'e1',  speaker: CHERYL,  time: '00:01:30', text: 'Good morning, everyone. It’s eleven o’clock, so I’ll call the meeting to order.' },
      { id: 'e2',  speaker: MICHAEL, time: '00:02:05', text: 'Notice of the meeting was given on March 13, and I can confirm that seven directors are present, so we have a quorum.' },
      { id: 'e3',  speaker: CHERYL,  time: '00:04:10', text: 'Thank you, Michael. Does any director wish to amend the agenda before we approve it?' },
      { id: 'e4',  speaker: EMILY,   time: '00:04:32', text: 'I’d like to move the cybersecurity update ahead of the committee reports, so we can discuss it while the CTO is still with us.' },
      { id: 'e5',  speaker: CHERYL,  time: '00:05:10', text: 'Agreed. Olivia, could you update the agenda and re-issue it to the board after the meeting?' },
      { id: 'e6',  speaker: OLIVIA,  time: '00:05:24', text: 'Of course. I’ll circulate the revised agenda this afternoon.' },
      { id: 'e7',  speaker: CHERYL,  time: '00:07:45', text: 'Before we continue, I remind directors of their duty to disclose any conflict of interest on today’s items.' },
      { id: 'e8',  speaker: COLIN,   time: '00:08:20', text: 'I should disclose my advisory role at Northwind Capital, which is bidding on item six. I’ll leave the room for that discussion.' },
      { id: 'e9',  speaker: CHERYL,  time: '00:11:20', text: 'The minutes of the January 20 meeting were circulated on January 27. Are there any amendments? Hearing none, may I have a motion to approve?' },
      { id: 'e10', speaker: BRIAN,   time: '00:19:05', text: 'Q1 revenue came in at 48.2 million, nine percent ahead of plan, mostly from enterprise renewals. Churn is down to 3.1 percent.' },
      { id: 'e11', speaker: BRIAN,   time: '00:21:40', text: 'The one concern is EMEA. Data-residency approvals are taking longer than expected, so we now expect to launch in July rather than May.' },
      { id: 'e12', speaker: THOMAS,  time: '00:34:50', text: 'Operating expenses were four percent under budget, and we closed the quarter with 112 million in cash and equivalents.' },
      { id: 'e13', speaker: EMILY,   time: '00:41:15', text: 'Could we see a sensitivity analysis on the revised EMEA timeline before the April call?' },
      { id: 'e14', speaker: EMILY,   time: '00:52:15', text: 'On behalf of the Audit Committee: the external auditor completed interim testing with no material findings, and we recommend renewing their engagement.' },
    ],
  },
  {
    id: 't2',
    title: 'Transcript 2',
    entries: [
      { id: 'e15', speaker: DANIEL,  time: '01:08:30', text: 'This year’s penetration test found two medium-severity issues. Both are scheduled for remediation by the end of April.' },
      { id: 'e16', speaker: CHERYL,  time: '01:10:05', text: 'I’d like the board to receive quarterly updates on remediation progress, starting with the June meeting.' },
      { id: 'e17', speaker: CHERYL,  time: '01:21:00', text: 'There being no further business, thank you all. The meeting is adjourned. Our next regular meeting is June 26.' },
    ],
  },
]

/** Plain-text copy of every transcript, used by "Copy full transcript". */
export function transcriptText(transcripts: Transcript[]) {
  return transcripts
    .map(t => [t.title, ...t.entries.map(e => `${e.speaker.name} ${e.time}\n${e.text}`)].join('\n\n'))
    .join('\n\n')
}
