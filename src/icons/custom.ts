/* Supplemental icons — glyphs used by product features that are not (yet) part
   of the auto-generated DS icon export. Authored by hand to match the Figma
   design; keep this list minimal and prefer a real DS icon whenever one exists.

   - send: paper-plane used by the Ask AI input (Figma 16945-60817).
   - skip-previous / skip-next: board-book document stepping (|< and >|) —
     the DS angle-left-b / angle-right-b chevron (same path and weight, shifted
     2px) plus a 1.5px bar, so they sit next to the page chevrons as a set. */
export const custom: { name: string; svg: string }[] = [
  {
    name: 'send',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M17.9166 2.08331L9.16663 10.8333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M17.9166 2.08331L12.2916 17.9166L9.16663 10.8333L2.08329 7.70831L17.9166 2.08331Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>`,
  },
  {
    name: 'skip-previous',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M3.5 2.25H5V17.75H3.5V2.25Z" fill="currentColor"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.3935 3.33312L9.72679 9.99979L16.3935 16.6665L15.3328 17.7271L7.60547 9.99979L15.3328 2.27246L16.3935 3.33312Z" fill="currentColor"/> </svg>`,
  },
  {
    name: 'skip-next',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M15 2.25H16.5V17.75H15V2.25Z" fill="currentColor"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M4.66613 2.27246L12.3935 9.99979L4.66613 17.7271L3.60547 16.6665L10.2721 9.99979L3.60547 3.33312L4.66613 2.27246Z" fill="currentColor"/> </svg>`,
  },
]
