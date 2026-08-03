import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { buttonVariants } from "./button-variants"

interface PaginationProps {
  /** 1-based, already clamped by the caller. */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/** How many pages sit on either side of the current one before an ellipsis. */
const SIBLINGS = 1

/**
 * Page numbers to render, with `"gap"` where the run is elided —
 * e.g. `1 … 4 [5] 6 … 12`. First and last are always present, so the
 * control never hides where the ends of the list are.
 */
function getPageItems(page: number, totalPages: number): Array<number | "gap"> {
  // Short enough that every page fits without eliding anything.
  if (totalPages <= 5 + SIBLINGS * 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const start = Math.max(2, page - SIBLINGS)
  const end = Math.min(totalPages - 1, page + SIBLINGS)
  const items: Array<number | "gap"> = [1]

  if (start > 2) items.push("gap")
  for (let n = start; n <= end; n += 1) items.push(n)
  if (end < totalPages - 1) items.push("gap")

  items.push(totalPages)
  return items
}

/**
 * Numbered page control. Presentational only — it owns no state and knows
 * nothing about the URL; the caller decides what a page change means.
 */
function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  // One page is not a choice — render nothing rather than a dead control.
  if (totalPages <= 1) return null

  const items = getPageItems(page, totalPages)

  return (
    <nav
      aria-label="Paginación"
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Anterior</span>
      </Button>

      <ol className="flex items-center gap-1">
        {items.map((item, index) =>
          item === "gap" ? (
            <li
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1 text-sm text-muted-foreground"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Página ${item}`}
                className={cn(
                  buttonVariants({
                    variant: item === page ? "default" : "ghost",
                    size: "icon",
                  }),
                  "font-mono text-xs"
                )}
              >
                {item}
              </button>
            </li>
          )
        )}
      </ol>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <span className="sr-only sm:not-sr-only">Siguiente</span>
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  )
}

export { Pagination }
