import { AnimatePresence, m } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MobileCategoryFilter } from "@/components/catalog/CatalogFilters"
import type { CatalogCategory } from "@/lib/catalogData"

interface CatalogResultsBarProps {
  categories: CatalogCategory[]
  activeCategories: string[]
  onToggleCategory: (categoryId: string) => void
  onClearCategories: () => void
  categoryCounts: Record<string, number>
  filteredCount: number
  totalCount: number
  visibleCount: number
  page: number
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function CatalogResultsBar({
  categories,
  activeCategories,
  onToggleCategory,
  onClearCategories,
  categoryCounts,
  filteredCount,
  totalCount,
  visibleCount,
  page,
  hasActiveFilters,
  onClearFilters,
}: CatalogResultsBarProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
      <MobileCategoryFilter
        categories={categories}
        activeCategories={activeCategories}
        onToggleCategory={onToggleCategory}
        onClearCategories={onClearCategories}
        categoryCounts={categoryCounts}
        totalMatchingProducts={filteredCount}
      />
      <p
        className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={`${page}-${filteredCount}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="inline-block"
          >
            {filteredCount > 0
              ? `${visibleCount} de ${filteredCount} productos`
              : `0 de ${totalCount} productos`}
          </m.span>
        </AnimatePresence>
      </p>

      {hasActiveFilters ? (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      ) : null}
    </div>
  )
}
