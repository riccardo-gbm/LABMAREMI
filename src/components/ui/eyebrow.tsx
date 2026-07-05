import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Datasheet-style section label: a small cyan indicator tick followed by a
 * monospace taxonomic tag (e.g. "COBERTURA / QUITO-EC"). This is the site's
 * signature device — it frames each section like a field on a product spec
 * sheet, reinforcing LABMAREMI's clinical, laboratory-grade identity.
 */
function Eyebrow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-ring ring-4 ring-ring/15"
      />
      {children}
    </p>
  )
}

export { Eyebrow }
