/* useTocAutoCollapse — shared by the board-book test versions.

   Below 1800px the inline agenda panel (460px) plus a Search / Ask AI side
   panel (460px) and the side navigation leave too little room to read the
   page (under ~640px), so opening a side
   panel collapses the agenda; closing the panel restores it — but only if the
   hook collapsed it. Toggling the agenda by hand (call the returned
   `markManual`) hands control back to the reader. Same rule as the Meeting
   page's BoardBookViewer. It works both ways: opening the agenda by hand
   below 1800px closes the Search / Ask AI panel (`closeSidePanel`). */

import { useEffect, useRef, useState } from 'react'

const NARROW = '(max-width: 1799px)'

export function useTocAutoCollapse(
  sidePanelOpen: boolean,
  setTocOpen: (update: (open: boolean) => boolean) => void,
  closeSidePanel?: () => void,
): (opening?: boolean) => void {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(NARROW).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(NARROW)
    const onChange = () => setNarrow(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const autoClosed = useRef(false)
  useEffect(() => {
    if (sidePanelOpen && narrow) {
      setTocOpen(open => {
        if (open) autoClosed.current = true
        return false
      })
    } else if (!sidePanelOpen && autoClosed.current) {
      autoClosed.current = false
      setTocOpen(() => true)
    }
  }, [sidePanelOpen, narrow, setTocOpen])

  return opening => {
    autoClosed.current = false
    if (opening && narrow) closeSidePanel?.()
  }
}
