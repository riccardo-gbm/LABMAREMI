import * as React from "react"
import {
  animate,
  m,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion"

/**
 * Shared scroll-reveal primitives. Subtle fade + directional lift as content
 * enters the viewport, played once. When the user prefers reduced motion,
 * every variant collapses to the final state so content renders immediately.
 */

const VIEWPORT = { once: true, amount: 0.2 } as const
// Card grids can be much taller than the viewport, so a lower visibility
// threshold keeps the stagger from triggering too late.
const GROUP_VIEWPORT = { once: true, amount: 0.1 } as const

type RevealDirection = "up" | "down" | "left" | "right" | "none"

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Extra delay (s) before the reveal starts. */
  delay?: number
  /** Direction the element travels from before settling. */
  direction?: RevealDirection
  /** Travel distance in px before settling. */
  distance?: number
  /** Duration in seconds. */
  duration?: number
  /** Viewport amount required before the reveal starts. */
  amount?: number
}

function getOffset(direction: RevealDirection, distance: number) {
  if (direction === "down") return { x: 0, y: -distance }
  if (direction === "left") return { x: distance, y: 0 }
  if (direction === "right") return { x: -distance, y: 0 }
  if (direction === "none") return { x: 0, y: 0 }
  return { x: 0, y: distance }
}

/** Fades a block in as a whole when it scrolls into view. */
function Reveal({
  delay = 0,
  direction = "up",
  distance = 20,
  duration = 0.5,
  amount = VIEWPORT.amount,
  className,
  children,
}: RevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const offset = getOffset(direction, distance)

  return (
    <m.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </m.div>
  )
}

interface RevealChildProps {
  children: React.ReactNode
  className?: string
}

interface RevealGroupProps extends RevealChildProps {
  stagger?: number
  delayChildren?: number
  amount?: number
}

/** Container for a staggered card grid. Keep layout classes on this wrapper. */
function RevealGroup({
  className,
  children,
  stagger = 0.08,
  delayChildren = 0,
  amount = GROUP_VIEWPORT.amount,
}: RevealGroupProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const groupVariants: Variants = {
    hidden: {},
    visible: { transition: { delayChildren, staggerChildren: stagger } },
  }

  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={groupVariants}
      className={className}
    >
      {children}
    </m.div>
  )
}

interface RevealItemProps extends RevealChildProps {
  direction?: RevealDirection
  distance?: number
  duration?: number
}

/** One staggered child inside a RevealGroup. Adds no layout classes. */
function RevealItem({
  className,
  children,
  direction = "up",
  distance = 18,
  duration = 0.45,
}: RevealItemProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const offset = getOffset(direction, distance)
  const itemVariants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, ease: "easeOut" },
    },
  }

  return (
    <m.div variants={itemVariants} className={className}>
      {children}
    </m.div>
  )
}

interface AnimatedMetricProps {
  value: number
  className?: string
  duration?: number
  formatter?: (value: number) => string
}

function AnimatedMetric({
  value,
  className,
  duration = 0.9,
  formatter = (next) => String(next),
}: AnimatedMetricProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.65 })
  const reduceMotion = useReducedMotion()
  // Only the count-up animation owns this state. The reduced-motion value is
  // derived at render time (below), so no effect syncs state to the prop.
  const [animatedValue, setAnimatedValue] = React.useState(0)

  React.useEffect(() => {
    if (reduceMotion || !isInView) return

    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setAnimatedValue(Math.round(latest)),
    })

    return () => controls.stop()
  }, [duration, isInView, reduceMotion, value])

  const displayValue = reduceMotion ? value : animatedValue

  return (
    <span ref={ref} className={className}>
      {formatter(displayValue)}
    </span>
  )
}

interface AnimatedProgressProps {
  value: number
  className?: string
  barClassName?: string
  ariaLabel?: string
}

function AnimatedProgress({
  value,
  className,
  barClassName,
  ariaLabel,
}: AnimatedProgressProps) {
  const reduceMotion = useReducedMotion()
  // Fill fraction (0–1). The bar spans the full track and scales horizontally
  // from its left edge, so we animate a GPU-composited transform instead of the
  // layout-triggering `width`.
  const scaleX = Math.max(0, Math.min(value, 100)) / 100

  return (
    <div className={className} role={ariaLabel ? "img" : undefined} aria-label={ariaLabel}>
      <m.div
        className={barClassName}
        style={{ width: "100%", transformOrigin: "left" }}
        initial={reduceMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      />
    </div>
  )
}

export { AnimatedMetric, AnimatedProgress, Reveal, RevealGroup, RevealItem }
