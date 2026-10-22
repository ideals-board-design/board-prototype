/* Supplemental icons — glyphs used by product features that are not (yet) part
   of the auto-generated DS icon export. Authored by hand to match the Figma
   design; keep this list minimal and prefer a real DS icon whenever one exists.

   - send: paper-plane used by the Ask AI input (Figma 16945-60817).
   - arrow-resize-bigger / arrow-resize-smaller: "Show detailed / brief version"
     of an AI minutes block (Figma 31039-167463, 31039-167464). */
export const custom: { name: string; svg: string }[] = [
  {
    name: 'send',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M17.9166 2.08331L9.16663 10.8333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M17.9166 2.08331L12.2916 17.9166L9.16663 10.8333L2.08329 7.70831L17.9166 2.08331Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>`,
  },
  {
    name: 'arrow-resize-bigger',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M18 19.5H2V18H18V19.5Z" fill="currentColor"/> <path d="M14.3945 6.66602L13.335 7.72656L10.75 5.14258V14.8555L13.334 12.2715L14.3945 13.332L10 17.7266L5.60547 13.332L6.66602 12.2715L9.25 14.8555V5.14258L6.66602 7.72656L5.60547 6.66602L10 2.27246L14.3945 6.66602Z" fill="currentColor"/> <path d="M18 2H2V0.5H18V2Z" fill="currentColor"/> </svg>`,
  },
  {
    name: 'arrow-resize-smaller',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M15.0605 17L14 18.0605L10 14.0605L6 18.0605L4.93945 17L10 11.9395L15.0605 17Z" fill="currentColor"/> <path d="M15.0605 3L10 8.06055L4.93945 3L6 1.93945L10 5.93945L14 1.93945L15.0605 3Z" fill="currentColor"/> </svg>`,
  },
]
