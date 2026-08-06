import { useEffect, useState } from "react"
import { AnimatePresence, LayoutGroup, m } from "framer-motion"
import { Check, Search, SlidersHorizontal, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  activeCategories: string[]
  onToggleCategory: (categoryId: string) => void
  onClearCategories: () => void
  className?: string
}

const ITEM_BASE =
  "relative inline-flex items-center gap-2 overflow-hidden rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full justify-between"
const ITEM_ACTIVE = "border-primary bg-primary text-primary-foreground"
const ITEM_IDLE =
  "border-input bg-background text-muted-foreground hover:border-ring/60 hover:text-foreground"

function ItemHighlight() {
  return (
    <m.span
      layoutId="catalog-filter-active-desktop"
      className="absolute inset-0 rounded-lg bg-primary"
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
    />
  )
}

/** Desktop category filter — sticky left column on desktop (lg+). */
function CategorySidebar({
  categories,
  activeCategories,
  onToggleCategory,
  onClearCategories,
  className,
}: CategorySidebarProps) {
  const activeSet = new Set(activeCategories)
  const isAllActive = activeSet.size === 0

  return (
    <div className={cn("hidden lg:block lg:sticky lg:top-24", className)}>
      <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Categorías
      </h2>

      <LayoutGroup>
        <div
          className="flex flex-col gap-1.5"
          role="group"
          aria-label="Filtrar por categoría"
        >
          <button
            type="button"
            onClick={onClearCategories}
            aria-pressed={isAllActive}
            className={cn(ITEM_BASE, isAllActive ? ITEM_ACTIVE : ITEM_IDLE)}
          >
            {isAllActive ? <ItemHighlight /> : null}
            <span className="relative z-10">Todas</span>
          </button>

          {categories.map((category) => {
            const isActive = activeSet.has(category.id)
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onToggleCategory(category.id)}
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

interface MobileCategoryFilterProps {
  categories: CatalogCategory[]
  activeCategories: string[]
  onToggleCategory: (categoryId: string) => void
  onClearCategories: () => void
  categoryCounts?: Record<string, number>
  totalMatchingProducts?: number
}

/** Mobile category filter button & slide-up bottom sheet (< lg). */
function MobileCategoryFilter({
  categories,
  activeCategories,
  onToggleCategory,
  onClearCategories,
  categoryCounts,
  totalMatchingProducts,
}: MobileCategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent background scrolling when mobile filter modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const activeCount = activeCategories.length

  return (
    <div className="block lg:hidden w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between gap-3 h-11 px-4 text-sm font-medium border-ring/20 bg-background shadow-xs hover:border-ring/50"
      >
        <span className="flex items-center gap-2 font-display text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
          Filtrar por categoría
        </span>
        <div className="flex items-center gap-2">
          {activeCount > 0 ? (
            <Badge variant="default" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {activeCount} {activeCount === 1 ? "seleccionada" : "seleccionadas"}
            </Badge>
          ) : (
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-normal">
              Todas
            </Badge>
          )}
        </div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Bottom Sheet Drawer */}
            <m.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border-t bg-background shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Seleccionar categorías"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                    Categorías de productos
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Seleccione una o varias categorías para filtrar
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full"
                  aria-label="Cerrar filtros"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions / Summary Bar */}
              <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-2.5 text-xs">
                <span className="font-mono text-muted-foreground">
                  {activeCount > 0
                    ? `${activeCount} de ${categories.length} seleccionadas`
                    : "Mostrando todas las categorías"}
                </span>
                {activeCount > 0 ? (
                  <button
                    type="button"
                    onClick={onClearCategories}
                    className="font-medium text-primary hover:underline focus-visible:outline-none"
                  >
                    Limpiar selección
                  </button>
                ) : null}
              </div>

              {/* Scrollable Category Checkboxes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]">
                {(() => {
                  const activeSet = new Set(activeCategories)
                  return categories.map((category) => {
                    const isSelected = activeSet.has(category.id)
                    const count = categoryCounts?.[category.id]

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => onToggleCategory(category.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-colors min-h-[48px] active:scale-[0.99]",
                          isSelected
                            ? "border-primary bg-primary/5 text-foreground font-medium shadow-2xs"
                            : "border-input bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3 pr-2">
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-primary-foreground transition-colors",
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-input bg-background"
                            )}
                          >
                            {isSelected ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : null}
                          </span>
                          <span className="text-sm leading-tight text-foreground">
                            {category.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {count !== undefined ? (
                            <span className="font-mono text-xs font-semibold text-muted-foreground">
                              {count}
                            </span>
                          ) : null}
                          <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                            {getCategoryCode(category.id)}
                          </span>
                        </div>
                      </button>
                    )
                  })
                })()}
              </div>

              {/* Footer CTA */}
              <div className="border-t p-4 bg-background">
                <Button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full h-11 text-sm font-semibold shadow-xs"
                >
                  {totalMatchingProducts !== undefined
                    ? `Ver ${totalMatchingProducts} productos`
                    : "Aplicar filtros"}
                </Button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { CatalogSearch, CategorySidebar, MobileCategoryFilter }
