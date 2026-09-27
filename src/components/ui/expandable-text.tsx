import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface ExpandToggleProps {
  expanded: boolean
  controls: string
  onToggle: () => void
  className?: string
}

/** The "Ver más / Ver menos" control shared by every collapsible text block. */
function ExpandToggle({ expanded, controls, onToggle, className }: ExpandToggleProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        "mt-1.5 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {expanded ? "Ver menos" : "Ver más"}
    </button>
  )
}

interface ExpandableTextProps {
  children: ReactNode
  /** Tailwind line-clamp class applied while collapsed. */
  clampClassName?: string
  className?: string
}

/**
 * Text clamped to a few lines with a "Ver más" toggle. The full text stays in
 * the DOM (only visually clamped), so crawlers and screen readers still get
 * all of it. The toggle only renders when the text actually overflows.
 */
function ExpandableText({
  children,
  clampClassName = "line-clamp-3",
  className,
}: ExpandableTextProps) {
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || expanded) return
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [expanded, children])

  return (
    <div>
      <div id={id} ref={ref} className={cn(className, !expanded && clampClassName)}>
        {children}
      </div>
      {overflows || expanded ? (
        <ExpandToggle
          expanded={expanded}
          controls={id}
          onToggle={() => setExpanded((v) => !v)}
        />
      ) : null}
    </div>
  )
}

export { ExpandableText, ExpandToggle }
