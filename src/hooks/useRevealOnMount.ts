import { useLayoutEffect, useRef, useState } from "react"

/**
 * Detects content sitting in the viewport that no scroll will ever reveal.
 *
 * `whileInView` only fires when IntersectionObserver crosses its threshold,
 * which never happens for an element that is *already* on screen when it
 * mounts — and filling a container after mount produces no crossing either.
 * Such content stays at `opacity: 0` permanently: present, occupying layout,
 * invisible. Home's retry path is the case that surfaced it.
 *
 * `contentKey` should change when the children do (a count is enough), so the
 * check re-runs for containers that are populated after they mount.
 *
 * Content below the fold fails the viewport test and keeps the normal
 * scroll-triggered reveal, so nothing about the usual experience changes.
 */
export function useRevealOnMount<T extends HTMLElement>(contentKey?: unknown) {
  const ref = useRef<T>(null)
  const [revealNow, setRevealNow] = useState(false)

  useLayoutEffect(() => {
    let frame = 0

    const check = () => {
      const node = ref.current
      if (!node) return false
      const rect = node.getBoundingClientRect()
      if (rect.height <= 0) return false
      if (rect.top >= window.innerHeight || rect.bottom <= 0) return false
      setRevealNow(true)
      return true
    }

    // Runs before paint, so switching to the visible form never flashes.
    // The second pass catches geometry still settling on the mount frame.
    if (!check()) frame = requestAnimationFrame(() => void check())

    return () => cancelAnimationFrame(frame)
  }, [contentKey])

  return { ref, revealNow }
}
