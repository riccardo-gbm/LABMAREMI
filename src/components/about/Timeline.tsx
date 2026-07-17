import type { LucideIcon } from "lucide-react"
import { m, useReducedMotion, type Variants } from "framer-motion"

export interface TimelineEntry {
  year: string
  title: string
  description: string
  icon: LucideIcon
}

interface TimelineProps {
  entries: TimelineEntry[]
}

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, x: -18 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
}

/**
 * Company-history rail. A dated sequence is one of the few cases where an
 * ordered marker is legitimate — each entry has a real year and the order
 * carries real information, unlike a decorative 01/02/03 count.
 */
function Timeline({ entries }: TimelineProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <ol className="relative space-y-10 border-l border-border pl-8">
        {entries.map((entry) => (
          <li key={entry.year} className="relative">
            <span className="absolute -left-[2.6rem] flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm">
              <entry.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="font-mono text-sm font-medium tracking-widest text-primary">
              {entry.year}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
              {entry.title}
            </h3>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {entry.description}
            </p>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <m.ol
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={groupVariants}
      className="relative space-y-10 border-l border-border pl-8"
    >
      {entries.map((entry) => (
        <m.li key={entry.year} variants={itemVariants} className="relative">
          <m.span
            className="absolute -left-[2.6rem] flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <entry.icon className="h-4 w-4" aria-hidden="true" />
          </m.span>
          <p className="font-mono text-sm font-medium tracking-widest text-primary">
            {entry.year}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
            {entry.title}
          </h3>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {entry.description}
          </p>
        </m.li>
      ))}
    </m.ol>
  )
}

export { Timeline }
