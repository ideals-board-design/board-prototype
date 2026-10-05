/* Board book data model + mock published board book (Figma 12970-219379).

   A published board book is the meeting's agenda flattened into a continuous
   PDF: every agenda item's attached documents (originals converted to PDF —
   see the note below) are concatenated so the reader pages through the whole
   book with one continuous page count (e.g. "9 / 310").

   PDF conversion note (requirement 1): the board book always references a PDF
   *version* of each attachment. In this prototype the conversion is simulated
   (the agenda's `simulateUpload` already fakes a background conversion) — the
   original attachment is never mutated; here we only carry the resulting PDF's
   name, source format and page count. */

export type BoardBookDocFormat = 'pdf' | 'word' | 'xlsx' | 'ppt' | 'txt'

export interface BoardBookDoc {
  id: string
  /** The board book always shows the .pdf name (the converted version). */
  name: string
  /** The original attachment's format — drives the file-format badge so the
      reader can tell a converted .xls/.docx from a native .pdf. */
  sourceFormat: BoardBookDocFormat
  /** Page count of the converted PDF. */
  pages: number
}

export interface BoardBookLink {
  id: string
  name: string
  url?: string
}

export type MotionStatus = 'completed' | 'in-progress' | 'not-started'

export interface BoardBookMotion {
  text: string
  status: MotionStatus
  /** 0–100, only meaningful for in-progress motions (voting progress). */
  progress?: number
}

export interface BoardBookItem {
  id: string
  /** Display number, e.g. "1", "2" (mirrors the agenda outline). */
  number: string
  title: string
  /** Scheduled slot, e.g. "11:00 - 11:01". */
  timeRange: string
  /** Whole duration label, e.g. "5min". */
  duration: string
  presenter?: { name: string; avatar?: string }
  description?: string
  motions?: BoardBookMotion[]
  documents: BoardBookDoc[]
  /** Link attachments — listed in the nav but not part of the paged PDF. */
  links?: BoardBookLink[]
}

/* ── A document placed on the continuous page ruler ──────────────────────────
   startPage/endPage are 1-based and inclusive; the reader's global page maps to
   exactly one flat doc. */
export interface FlatDoc {
  doc: BoardBookDoc
  item: BoardBookItem
  index: number
  startPage: number
  endPage: number
}

export interface BoardBook {
  items: BoardBookItem[]
  flatDocs: FlatDoc[]
  totalPages: number
}

/** Flatten the agenda items into the continuous page ruler. */
export function buildBoardBook(items: BoardBookItem[]): BoardBook {
  const flatDocs: FlatDoc[] = []
  let cursor = 1
  let index = 0
  for (const item of items) {
    for (const doc of item.documents) {
      const startPage = cursor
      const endPage = cursor + doc.pages - 1
      flatDocs.push({ doc, item, index, startPage, endPage })
      cursor = endPage + 1
      index += 1
    }
  }
  return { items, flatDocs, totalPages: Math.max(0, cursor - 1) }
}

/** The flat doc that contains a given global (1-based) page. */
export function docAtPage(book: BoardBook, page: number): FlatDoc | undefined {
  return book.flatDocs.find(fd => page >= fd.startPage && page <= fd.endPage)
}

/** Find a flat doc by its document id. */
export function flatDocById(book: BoardBook, docId: string): FlatDoc | undefined {
  return book.flatDocs.find(fd => fd.doc.id === docId)
}

/** Find a flat doc by (converted) document name — used by the agenda's
    quick-preview, which opens an attachment by name. Falls back to a loose
    match ignoring the .pdf conversion suffix so "Report.xls" opens the
    converted "Report.xls" doc. */
export function flatDocByName(book: BoardBook, name: string): FlatDoc | undefined {
  const norm = (s: string) => s.trim().toLowerCase()
  const target = norm(name)
  return (
    book.flatDocs.find(fd => norm(fd.doc.name) === target) ??
    book.flatDocs.find(fd => norm(fd.doc.name).startsWith(target.replace(/\.[^.]+$/, '')))
  )
}

/** The first document of an item (what selecting the item opens), if any. */
export function firstDocOfItem(book: BoardBook, itemId: string): FlatDoc | undefined {
  return book.flatDocs.find(fd => fd.item.id === itemId)
}

/* ── Mock published board book ───────────────────────────────────────────────
   Mirrors the Figma content: a Board of Directors meeting whose documents add
   up to 310 pages, so the page counter reads "N / 310" like the reference. */
const AVATAR_ALEX = 'https://i.pravatar.cc/40?img=12'
const AVATAR_LIAM = 'https://i.pravatar.cc/40?img=51'
const AVATAR_SOPHIA = 'https://i.pravatar.cc/40?img=32'

export const BOARD_BOOK_ITEMS: BoardBookItem[] = [
  {
    id: 'item-1',
    number: '1',
    title: 'Call to order',
    timeRange: '11:00 - 11:01',
    duration: '5min',
    documents: [],
  },
  {
    id: 'item-2',
    number: '2',
    title: 'Approval of previous meeting minutes',
    timeRange: '11:01 - 11:06',
    duration: '5min',
    presenter: { name: 'Alexander Anderson', avatar: AVATAR_ALEX },
    description:
      'The Board is asked to review and approve the minutes of the previous meeting to confirm that they accurately reflect the discussions and decisions made.',
    motions: [
      {
        text: 'I move to approve the minutes of the Board of Directors Quarterly meeting Q1’24 board meeting as presented.',
        status: 'completed',
        progress: 68,
      },
      {
        text: 'I move to approve the minutes of the Board of Directors Quarterly meeting Q1’24 board meeting as presented.',
        status: 'not-started',
      },
    ],
    documents: [
      { id: 'doc-minutes', name: 'Meeting Minutes Feb’25.pdf', sourceFormat: 'pdf', pages: 12 },
    ],
    links: [{ id: 'link-summary', name: 'Minutes Summary', url: 'https://example.com/minutes-summary' }],
  },
  {
    id: 'item-3',
    number: '3',
    title: 'Chairperson’s report on activities and updates',
    timeRange: '11:06 - 11:16',
    duration: '10min',
    presenter: { name: 'Sophia Anson', avatar: AVATAR_SOPHIA },
    description:
      'The Chairperson will provide an overview of recent activities, external engagements and strategic updates since the last meeting.',
    documents: [
      { id: 'doc-chair-xls', name: 'Chairperson’s Report.xls', sourceFormat: 'xlsx', pages: 8 },
      { id: 'doc-chair-pdf', name: 'Chairperson’s Report.pdf', sourceFormat: 'pdf', pages: 46 },
    ],
  },
  {
    id: 'item-4',
    number: '4',
    title: 'Discuss financial performance and projections',
    timeRange: '11:16 - 11:36',
    duration: '20min',
    presenter: { name: 'Liam Wilson', avatar: AVATAR_LIAM },
    description:
      'The Board will review the company’s financial performance for the previous quarter and consider the projections guiding resource allocation and strategic planning for the next period.',
    motions: [
      {
        text: 'I move that the Board accept the Q3 financial report and the growth indicators as presented by the CFO.',
        status: 'not-started',
      },
    ],
    documents: [
      { id: 'doc-financial', name: 'Financial Performance Report.pdf', sourceFormat: 'word', pages: 34 },
    ],
  },
  {
    id: 'item-5',
    number: '5',
    title: 'CFO Report',
    timeRange: '11:36 - 12:06',
    duration: '30min',
    presenter: { name: 'Liam Wilson', avatar: AVATAR_LIAM },
    description:
      'A detailed review of the company’s financial position, including cash flow, budget variance and capital expenditure for the current fiscal year.',
    documents: [
      { id: 'doc-cfo', name: 'CFO Report.pdf', sourceFormat: 'pdf', pages: 210 },
    ],
  },
]

export const MOCK_BOARD_BOOK = buildBoardBook(BOARD_BOOK_ITEMS)

export const MOTION_STATUS_LABEL: Record<MotionStatus, string> = {
  'completed': 'Completed',
  'in-progress': 'In progress',
  'not-started': 'Not started',
}
