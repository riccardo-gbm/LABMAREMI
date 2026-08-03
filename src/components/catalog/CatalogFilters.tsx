import { LayoutGroup, m } from "framer-motion"
import { Search } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getCategoryCode } from "@/lib/catalog"
import type { CatalogCategory } from "@/lib/catalogData"
import { cn } from "@/lib/utils"

interface CatalogSearchProps {
  value: string
  onChange: (value: string) => void
}

/** The search box, alone on its own row. */
function CatalogSearch({ value, onChange }: CatalogSearchProps) {
  return (
    <Card className="p-4 md:p-5">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar por nombre o descripción…"
          aria-label="Buscar productos"
          className="h-11 pl-9"
        />
      </div>
    </Card>
  )
}

interface CategorySidebarProps {
  categories: CatalogCategory[]
  activeCategory: string | null
  onSelect: (categoryId: string | null) => void
  className?: string
}

// One markup, two shapes: wrapping pills on small screens, a stacked list in
// the left column from lg up.
const ITEM_BASE =
  "relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full lg:justify-between lg:rounded-lg lg:px-3 lg:py-2"
const ITEM_ACTIVE = "border-primary text-primary-foreground"
const ITEM_IDLE =
  "border-input bg-background text-muted-foreground hover:border-ring/60 hover:text-foreground"

/** The sliding pill that marks the selected entry. One per LayoutGroup. */
function ItemHighlight() {
  return (
    <m.span
      layoutId="catalog-filter-active"
      className="absolute inset-0 rounded-full bg-primary lg:rounded-lg"
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
    />
  )
}

/** Category filter — a chip row on mobile, a sticky left column on desktop. */
function CategorySidebar({
  categories,
  activeCategory,
  onSelect,
  className,
}: CategorySidebarProps) {
  return (
    <div className={cn("lg:sticky lg:top-24", className)}>
      <h2 className="mb-3 hidden font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground lg:block">
        Categorías
      </h2>

      <LayoutGroup>
        <div
          className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5"
          role="group"
          aria-label="Filtrar por categoría"
        >
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-pressed={!activeCategory}
            className={cn(ITEM_BASE, !activeCategory ? ITEM_ACTIVE : ITEM_IDLE)}
          >
            {!activeCategory ? <ItemHighlight /> : null}
            <span className="relative z-10">Todas</span>
          </button>

          {categories.map((category) => {
            const isActive = category.id === activeCategory
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelect(isActive ? null : category.id)}
                aria-pressed={isActive}
                className={cn(ITEM_BASE, isActive ? ITEM_ACTIVE : ITEM_IDLE)}
              >
                {isActive ? <ItemHighlight /> : null}
                <span className="relative z-10 text-left">{category.name}</span>
                <span
                  className={cn(
                    "relative z-10 font-mono text-[10px] tracking-widest",
                    isActive
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground/70"
                  )}
                >
                  {getCategoryCode(category.id)}
                </span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>
    </div>
  )
}

export { CatalogSearch, CategorySidebar }
