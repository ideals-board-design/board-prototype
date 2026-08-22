/* usePresence — keeps an element mounted for the length of its exit transition.
 *
 * Overlays in this system are conditionally rendered (`{open && <Panel/>}`), which
 * removes the node the instant `open` flips to false — there is nothing left in the
 * DOM for an exit transition to run on. This hook splits "should it exist" from
 * "which visual state is it in":
 *
 *   const { mounted, state } = usePresence(open)
 *   {mounted && <div data-state={state}>…</div>}
 *
 * `state` is 'open' | 'closed'. On close it flips to 'closed' first, the CSS exit
 * transition runs, and only then does `mounted` go false.
 *
 * Motion spec: "Exit transitions complete before the element unmounts — no instant
 * disappearance on close."
 */

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion, tokenMs } from './motion'

export type PresenceState = 'open' | 'closed'

export interface Presence {
  /** Whether the element should be in the DOM at all. */
  mounted: boolean
  /** Drives `data-state` on the animated element. */
  state: PresenceState
}

/**
 * @param open        the caller's own open state
 * @param exitToken   duration token the element's exit transition uses.
 *                    Defaults to `--dur-fast`, the standard overlay exit.
 */
export function usePresence(open: boolean, exitToken = '--dur-fast'): Presence {
  const [mounted, setMounted] = useState(open)
  const [state, setState] = useState<PresenceState>(open ? 'open' : 'closed')
  const frame = useRef(0)
  const timer = useRef(0)

  useEffect(() => {
    window.clearTimeout(timer.current)
    cancelAnimationFrame(frame.current)

    if (open) {
      setMounted(true)
      // Mount in the 'closed' state, then flip on the next frame so the browser
      // has a "from" value to animate out of.
      setState('closed')
      frame.current = requestAnimationFrame(() => {
        frame.current = requestAnimationFrame(() => setState('open'))
      })
      return
    }

    setState('closed')
    // Reduced motion collapses transitions to ~1ms, so don't hold the node open.
    const exit = prefersReducedMotion() ? 0 : tokenMs(exitToken, 200)
    timer.current = window.setTimeout(() => setMounted(false), exit)
  }, [open, exitToken])

  useEffect(() => () => {
    window.clearTimeout(timer.current)
    cancelAnimationFrame(frame.current)
  }, [])

  return { mounted, state }
}

export default usePresence
