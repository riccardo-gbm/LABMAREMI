import * as React from "react"

import { cn } from "@/lib/utils"

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Extra classes for the inner centered container. */
  containerClassName?: string
}

/**
 * Page section with consistent vertical rhythm and a centered
 * max-width container. Every page composes its content from these.
 */
function Section({
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-12 md:py-16", className)} {...props}>
      <div
        className={cn(
          "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
          containerClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}

export { Section }
