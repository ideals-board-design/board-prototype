/* Supplemental icons — glyphs used by product features that are not (yet) part
   of the auto-generated DS icon export. Authored by hand to match the Figma
   design; keep this list minimal and prefer a real DS icon whenever one exists.

   - send: paper-plane used by the Ask AI input (Figma 16945-60817).
   - skip-previous / skip-next: board-book document stepping (|< and >|) —
     the DS angle-left-fill / angle-right-fill chevron (same path, 7×12,
     shifted 1.76px) plus a 1.5×12 bar, centred in the 20px box, so they sit
     next to the page chevrons as a set (Figma local icons 32364-32631). */
export const custom: { name: string; svg: string }[] = [
  {
    name: 'send',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M17.9166 2.08331L9.16663 10.8333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M17.9166 2.08331L12.2916 17.9166L9.16663 10.8333L2.08329 7.70831L17.9166 2.08331Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>`,
  },
  {
    name: 'skip-previous',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M4.68 3.94H6.18V16.06H4.68V3.94Z" fill="currentColor"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M15.3173 5.00402L10.3227 9.99835L15.32 14.9956L14.2593 16.0562L8.20141 9.99835L14.2567 3.94336L15.3173 5.00402Z" fill="currentColor"/> </svg>`,
  },
  {
    name: 'skip-next',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M13.82 3.94H15.32V16.06H13.82V3.94Z" fill="currentColor"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M4.6821 14.9956L9.6767 10.0013L4.67945 5.00402L5.74011 3.94336L11.798 10.0013L5.74276 16.0562L4.6821 14.9956Z" fill="currentColor"/> </svg>`,
  },
]
