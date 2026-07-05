import * as React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"

/**
 * Scroll-reveal primitives (Home page). Subtle fade + slight rise as content
 * enters the viewport, played once. When the user prefers reduced motion,
 * every variant collapses to the final state so content renders immediately
 * with no animation — `useReducedMotion()` is reactive to the OS setting.
 */

const VIEWPORT = { once: true, amount: 0.2 } as const
// Card grids can be much taller than the viewport (9 cards on mobile), so a
// lower visibility threshold keeps the stagger from triggering too late.
const GROUP_VIEWPORT = { once: true, amount: 0.1 } as const

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Extra delay (s) before the reveal starts. */
  delay?: number
}

/** Fades a block in as a whole when it scrolls into view. */
function Reveal({ delay = 0, className, children }: RevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

interface RevealChildProps {
  children: React.ReactNode
  className?: string
}

/** Container for a staggered card grid — keep the grid classes on this. */
function RevealGroup({ className, children }: RevealChildProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={GROUP_VIEWPORT}
      variants={groupVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** One staggered child inside a RevealGroup. Adds no layout classes. */
function RevealItem({ className, children }: RevealChildProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

export { Reveal, RevealGroup, RevealItem }
