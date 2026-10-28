/* Supplemental icons — glyphs used by product features that are not (yet) part
   of the auto-generated DS icon export. Authored by hand to match the Figma
   design; keep this list minimal and prefer a real DS icon whenever one exists.

   - send: paper-plane used by the Ask AI input (Figma 16945-60817).
   - skip-previous / skip-next: board-book document stepping (|< and >|) —
     the DS angle-left-fill / angle-right-fill chevron (same path, 7×12,
     shifted 1.76px) plus a 1.5×12 bar, centred in the 20px box, so they sit
     next to the page chevrons as a set (Figma local icons 32364-32631).

   Minutes editor toolbar (EditorToolbar) — NOT yet in the DS, add them there
   later. All 20×20, 1.5 stroke / filled shapes like the DS editor set, with
   square (butt) ends on every line, as the DS icons:
   - indent: increase indent — the DS left-indent (decrease) with the arrow
     turned to point right.
   - color-palette: custom colour (opens the system colour picker).
   - color-none: "No colour" swatch (square with a diagonal).
   - list-style-default / -disc / -circle / -square: bullet-style previews.
   - table-cell-properties, table-merge-cells, table-split-cell
   - table-row-insert-before, table-row-insert-after, table-row-delete,
     table-row-properties
   - table-column-insert-before, table-column-insert-after,
     table-column-delete
   - table-delete, cut, paste (copy uses the DS "copy" icon). */
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
  {
    name: 'indent',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M18 16.75H2V15.25H18V16.75ZM2.77246 6.83398L5.93945 10.001L2.77246 13.167L3.83301 14.2275L8.06055 10L3.83301 5.77344L2.77246 6.83398ZM18 12.75H11V11.25H18V12.75ZM18 8.75H11V7.25H18V8.75ZM18 4.75H2V3.25H18V4.75Z" fill="currentColor"/> </svg>`,
  },
  {
    name: 'color-palette',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10 2.75C5.996 2.75 2.75 5.996 2.75 10C2.75 14.004 5.996 17.25 10 17.25C10.88 17.25 11.5 16.55 11.5 15.75C11.5 15.36 11.36 15.02 11.12 14.75C10.89 14.49 10.75 14.15 10.75 13.78C10.75 12.95 11.42 12.28 12.25 12.28H13.96C15.77 12.28 17.25 10.8 17.25 8.99C17.25 5.54 14.004 2.75 10 2.75Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/> <circle cx="6.25" cy="9.5" r="1.1" fill="currentColor"/> <circle cx="8.25" cy="6.25" r="1.1" fill="currentColor"/> <circle cx="12" cy="6" r="1.1" fill="currentColor"/> <circle cx="14.5" cy="8.75" r="1.1" fill="currentColor"/> </svg>`,
  },
  {
    name: 'color-none',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <path d="M4.5 15.5L15.5 4.5" stroke="currentColor" stroke-width="1.5"/> </svg>`,
  },
  {
    name: 'list-style-default',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="3.5" cy="4.5" r="1.5" fill="currentColor"/> <circle cx="6.5" cy="10" r="1.25" stroke="currentColor" stroke-width="1"/> <rect x="8.25" y="13.75" width="2.5" height="2.5" fill="currentColor"/> <rect x="6.5" y="3.75" width="11.5" height="1.5" fill="currentColor" fill-opacity="0.35"/> <rect x="9.5" y="9.25" width="8.5" height="1.5" fill="currentColor" fill-opacity="0.35"/> <rect x="12.5" y="14.25" width="5.5" height="1.5" fill="currentColor" fill-opacity="0.35"/> </svg>`,
  },
  {
    name: 'list-style-disc',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="3.5" cy="4.5" r="1.5" fill="currentColor"/> <rect x="7" y="3.75" width="11" height="1.5" fill="currentColor" fill-opacity="0.35"/> <circle cx="3.5" cy="10" r="1.5" fill="currentColor"/> <rect x="7" y="9.25" width="11" height="1.5" fill="currentColor" fill-opacity="0.35"/> <circle cx="3.5" cy="15.5" r="1.5" fill="currentColor"/> <rect x="7" y="14.75" width="11" height="1.5" fill="currentColor" fill-opacity="0.35"/> </svg>`,
  },
  {
    name: 'list-style-circle',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="3.5" cy="4.5" r="1.25" stroke="currentColor" stroke-width="1"/> <rect x="7" y="3.75" width="11" height="1.5" fill="currentColor" fill-opacity="0.35"/> <circle cx="3.5" cy="10" r="1.25" stroke="currentColor" stroke-width="1"/> <rect x="7" y="9.25" width="11" height="1.5" fill="currentColor" fill-opacity="0.35"/> <circle cx="3.5" cy="15.5" r="1.25" stroke="currentColor" stroke-width="1"/> <rect x="7" y="14.75" width="11" height="1.5" fill="currentColor" fill-opacity="0.35"/> </svg>`,
  },
  {
    name: 'list-style-square',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.25" y="3.25" width="2.5" height="2.5" fill="currentColor"/> <rect x="7" y="3.75" width="11" height="1.5" fill="currentColor" fill-opacity="0.35"/> <rect x="2.25" y="8.75" width="2.5" height="2.5" fill="currentColor"/> <rect x="7" y="9.25" width="11" height="1.5" fill="currentColor" fill-opacity="0.35"/> <rect x="2.25" y="14.25" width="2.5" height="2.5" fill="currentColor"/> <rect x="7" y="14.75" width="11" height="1.5" fill="currentColor" fill-opacity="0.35"/> </svg>`,
  },
  {
    name: 'table-row-insert-before',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <path d="M2.75 10H17.25" stroke="currentColor" stroke-width="1.5"/> <path d="M10 4.5V8.3M8.1 6.4H11.9" stroke="currentColor" stroke-width="1.5"/> </svg>`,
  },
  {
    name: 'table-row-insert-after',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <path d="M2.75 10H17.25" stroke="currentColor" stroke-width="1.5"/> <path d="M10 11.7V15.5M8.1 13.6H11.9" stroke="currentColor" stroke-width="1.5"/> </svg>`,
  },
  {
    name: 'table-row-delete',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <path d="M2.75 7H17.25M2.75 13H17.25" stroke="currentColor" stroke-width="1.5"/> <path d="M8.5 8.5L11.2 11.2M11.2 8.5L8.5 11.2" stroke="currentColor" stroke-width="1.2"/> </svg>`,
  },
  {
    name: 'table-row-properties',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <rect x="2.75" y="7" width="14.5" height="6" fill="currentColor"/> </svg>`,
  },
  {
    name: 'table-column-insert-before',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <path d="M10 2.75V17.25" stroke="currentColor" stroke-width="1.5"/> <path d="M6.4 8.1V11.9M4.5 10H8.3" stroke="currentColor" stroke-width="1.5"/> </svg>`,
  },
  {
    name: 'table-column-insert-after',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <path d="M10 2.75V17.25" stroke="currentColor" stroke-width="1.5"/> <path d="M13.6 8.1V11.9M11.7 10H15.5" stroke="currentColor" stroke-width="1.5"/> </svg>`,
  },
  {
    name: 'table-column-delete',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <path d="M7 2.75V17.25M13 2.75V17.25" stroke="currentColor" stroke-width="1.5"/> <path d="M8.5 8.5L11.2 11.2M11.2 8.5L8.5 11.2" stroke="currentColor" stroke-width="1.2"/> </svg>`,
  },
  {
    name: 'table-cell-properties',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <path d="M10 2.75V17.25M2.75 10H17.25" stroke="currentColor" stroke-width="1.5"/> <rect x="2.75" y="2.75" width="7.25" height="7.25" fill="currentColor"/> </svg>`,
  },
  {
    name: 'table-merge-cells',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <path d="M2.75 10H17.25M10 10V17.25" stroke="currentColor" stroke-width="1.5"/> </svg>`,
  },
  {
    name: 'table-split-cell',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <path d="M2.75 10H17.25" stroke="currentColor" stroke-width="1.5"/> <path d="M10 2.75V17.25" stroke="currentColor" stroke-width="1.5" stroke-dasharray="1.6 1.6"/> </svg>`,
  },
  {
    name: 'table-delete',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <path d="M8.5 8.5L11.5 11.5M11.5 8.5L8.5 11.5" stroke="currentColor" stroke-width="1.5"/> </svg>`,
  },
  {
    name: 'cut',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="5.75" cy="14.25" r="2.5" stroke="currentColor" stroke-width="1.5"/> <circle cx="14.25" cy="14.25" r="2.5" stroke="currentColor" stroke-width="1.5"/> <path d="M7.4 12.4L14.5 2.75M12.6 12.4L5.5 2.75" stroke="currentColor" stroke-width="1.5"/> </svg>`,
  },
  {
    name: 'paste',
    svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="4" y="3.75" width="12" height="13.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/> <rect x="7.5" y="2.25" width="5" height="3" rx="0.75" fill="currentColor"/> <path d="M7.25 9.75H12.75M7.25 13H11" stroke="currentColor" stroke-width="1.5"/> </svg>`,
  },
]
