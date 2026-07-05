import type { LucideIcon } from "lucide-react"

export interface TimelineEntry {
  year: string
  title: string
  description: string
  icon: LucideIcon
}

interface TimelineProps {
  entries: TimelineEntry[]
}

/**
 * Company-history rail. A dated sequence is one of the few cases where an
 * ordered marker is legitimate — each entry has a real year and the order
 * carries real information, unlike a decorative 01/02/03 count.
 */
function Timeline({ entries }: TimelineProps) {
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

export { Timeline }
